import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { buildSystemPrompt, buildUserPrompt } from '../src/prompts/promptTemplates.js';
import { DESIGN_MOODS, WEBSITE_TYPE_TO_MOOD_MAP } from '../src/data/designMoods.js';

export const maxDuration = 60; // Set Vercel serverless function timeout to 60 seconds

dotenv.config();

const app = express();

// Set payload size limits for raw text and attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ================== Rate Limiter Sederhana untuk Password Gate ==================
// Catatan: state ini per-proses (in-memory). Di lingkungan serverless dengan banyak
// instance paralel (mis. Vercel), proteksi ini tidak sempurna karena tiap instance
// punya memori sendiri — tapi tetap menaikkan effort brute-force secara signifikan
// dibanding tanpa proteksi sama sekali, dan bekerja penuh saat dijalankan sebagai
// server Node biasa (mis. `npm run start`). Untuk proteksi level produksi yang lebih
// kuat, pertimbangkan rate-limiting di edge/firewall — di luar cakupan perubahan ini.
const passwordAttempts = new Map<string, { count: number; firstAttemptAt: number }>();
const MAX_PASSWORD_ATTEMPTS = 5;
const PASSWORD_ATTEMPT_WINDOW_MS = 5 * 60 * 1000; // 5 menit

// TODO: Tinjau setiap ada rilis model baru dari Google.
// Sumber resmi: https://ai.google.dev/gemini-api/docs/models
// Sumber changelog: https://ai.google.dev/gemini-api/docs/changelog
const DEFAULT_MODEL_CHAIN: string[] = (process.env.GEMINI_MODEL_CHAIN
  ? process.env.GEMINI_MODEL_CHAIN.split(',').map(m => m.trim()).filter(Boolean)
  : ['gemini-3.6-flash', 'gemini-3.5-flash']); // primary -> fallback

// Translate creativity slider (0-100) to explicit prompt instructions
const getCreativityInstruction = (sliderValue: number): string => {
  if (sliderValue <= 30) {
    return 'Patuhi referensi input secara ketat, minim penambahan asumsi baru.';
  } else if (sliderValue <= 70) {
    return 'Seimbangkan antara mengikuti referensi dan menambahkan rekomendasi best-practice yang wajar.';
  } else {
    return 'Bebas berinovasi dan menambahkan ide/asumsi profesional secara luas, selama tetap relevan dengan bisnis.';
  }
};

// Map reasoning level to Google GenAI thinkingLevel enum
const getThinkingConfig = (reasoningLevel?: string) => {
  let level = ThinkingLevel.LOW;
  if (reasoningLevel === 'Basic') {
    level = ThinkingLevel.MINIMAL;
  } else if (reasoningLevel === 'Standard') {
    level = ThinkingLevel.LOW;
  } else if (reasoningLevel === 'Advanced') {
    level = ThinkingLevel.MEDIUM;
  } else if (reasoningLevel === 'Maximum') {
    level = ThinkingLevel.HIGH;
  }
  return { thinkingConfig: { thinkingLevel: level } };
};

// ================== Prompt Injection Guard & Input Length Limit ==================
const SUSPICIOUS_PATTERNS = [
  'ignore previous instructions',
  'ignore all previous',
  'disregard previous instructions',
  'abaikan instruksi sebelumnya',
  'abaikan semua instruksi',
  'reveal system prompt',
  'show system prompt',
  'reveal your instructions',
  'system prompt:',
  'override system instructions',
];

function isSuspiciousPromptInjection(text?: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SUSPICIOUS_PATTERNS.some((pattern) => lower.includes(pattern));
}

const MAX_BRIEF_LENGTH = 10000; // karakter, untuk form.referenceInformation
const MAX_EXTRA_INSTRUCTION_LENGTH = 3000; // karakter, untuk form.extraInstruction

// Helper to collect and sort all keys from environment variables (GEMINI_API_KEY, GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
const getSystemApiKeys = (): string[] => {
  const keyMap: { envKey: string; score: number; value: string }[] = [];
  
  for (const envKey of Object.keys(process.env)) {
    const upperEnvKey = envKey.toUpperCase();
    if (upperEnvKey.startsWith('GEMINI_API_KEY')) {
      const val = process.env[envKey]?.trim();
      if (val) {
        // Determine priority/score for sorting
        let score = 9999;
        if (upperEnvKey === 'GEMINI_API_KEY') {
          score = 0;
        } else {
          // Extract trailing number if exists, e.g. GEMINI_API_KEY_1 -> 1
          const match = upperEnvKey.match(/GEMINI_API_KEY_(\d+)/);
          if (match) {
            score = parseInt(match[1], 10);
          }
        }
        
        const splitVals = val.split(/[\s,;]+/).map(k => k.trim()).filter(Boolean);
        for (const splitVal of splitVals) {
          keyMap.push({ envKey, score, value: splitVal });
        }
      }
    }
  }
  
  // Sort by score ascending, then alphabetically by envKey
  keyMap.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return a.envKey.localeCompare(b.envKey);
  });
  
  const uniqueKeys: string[] = [];
  for (const item of keyMap) {
    if (!uniqueKeys.includes(item.value)) {
      uniqueKeys.push(item.value);
    }
  }
  return uniqueKeys;
};

// API health and status check
app.get('/api/status', (req, res) => {
  const systemKeys = getSystemApiKeys();
  res.json({
    status: 'ok',
    hasSystemApiKey: systemKeys.length > 0,
    systemApiKeyCount: systemKeys.length,
    defaultModels: DEFAULT_MODEL_CHAIN
  });
});

// API endpoint to verify user access password
app.post('/api/verify-password', (req, res) => {
  const correctPassword = process.env.PASSWORD || 'admin@prajuritdigital.com';

  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket.remoteAddress
    || 'unknown';
  const now = Date.now();
  const record = passwordAttempts.get(clientIp);

  if (record) {
    const withinWindow = now - record.firstAttemptAt < PASSWORD_ATTEMPT_WINDOW_MS;
    if (withinWindow && record.count >= MAX_PASSWORD_ATTEMPTS) {
      const retryAfterSec = Math.ceil((record.firstAttemptAt + PASSWORD_ATTEMPT_WINDOW_MS - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${retryAfterSec} detik.`,
      });
    }
    if (!withinWindow) {
      passwordAttempts.set(clientIp, { count: 0, firstAttemptAt: now });
    }
  }

  const { password } = req.body;
  if (password === correctPassword) {
    passwordAttempts.delete(clientIp);
    return res.json({ success: true });
  }

  const current = passwordAttempts.get(clientIp) || { count: 0, firstAttemptAt: now };
  passwordAttempts.set(clientIp, { count: current.count + 1, firstAttemptAt: current.firstAttemptAt });
  return res.json({ success: false, error: 'Password salah, silakan coba lagi.' });
});

// API endpoint for PRD generation
app.post('/api/generate-prd', async (req, res) => {
  console.log('\n=========================================');
  console.log('[CANVAS-PRD-AI] [REQUEST] Menerima permintaan pembuatan PRD baru...');
  try {
    const { form, userApiKeys: bodyUserApiKeys, selectedModel } = req.body;
    if (!form) {
      console.error('[CANVAS-PRD-AI] [ERROR] Payload form kosong atau tidak valid.');
      return res.status(400).json({ error: 'Data form tidak ditemukan dalam body request.' });
    }

    if (form.referenceInformation && form.referenceInformation.length > MAX_BRIEF_LENGTH) {
      console.warn('[CANVAS-PRD-AI] [VALIDATION] Brief mentah melebihi batas panjang.');
      return res.status(400).json({
        error: `Brief mentah terlalu panjang (maksimal ${MAX_BRIEF_LENGTH} karakter). Mohon persingkat brief Anda.`,
      });
    }

    if (form.extraInstruction && form.extraInstruction.length > MAX_EXTRA_INSTRUCTION_LENGTH) {
      console.warn('[CANVAS-PRD-AI] [VALIDATION] Extra instruction melebihi batas panjang.');
      return res.status(400).json({
        error: `Instruksi tambahan terlalu panjang (maksimal ${MAX_EXTRA_INSTRUCTION_LENGTH} karakter).`,
      });
    }

    if (isSuspiciousPromptInjection(form.referenceInformation) || isSuspiciousPromptInjection(form.extraInstruction)) {
      console.warn('[CANVAS-PRD-AI] [VALIDATION] Terdeteksi indikasi prompt-injection pada input user.');
      return res.status(400).json({
        error: 'Input Anda terdeteksi mengandung instruksi ilegal atau upaya manipulasi prompt. Mohon masukkan deskripsi bisnis yang valid.',
      });
    }

    // Build model chain for this request
    let requestModelChain = [...DEFAULT_MODEL_CHAIN];
    if (selectedModel && typeof selectedModel === 'string' && selectedModel.trim()) {
      const chosen = selectedModel.trim();
      requestModelChain = [chosen, ...DEFAULT_MODEL_CHAIN.filter(m => m !== chosen)];
    }

    console.log(`[CANVAS-PRD-AI] [METADATA] Nama Proyek: "${form.projectName || 'Tanpa Nama'}" | Mode AI: ${form.aiMode} | Kreativitas: ${form.creativitySlider}% | Model Chain: [${requestModelChain.join(', ')}]`);

    // Collect user/visitor keys from body or headers
    let visitorKeys: string[] = [];
    
    // Try body first
    if (Array.isArray(bodyUserApiKeys)) {
      visitorKeys.push(...bodyUserApiKeys.map(k => k.trim()).filter(Boolean));
    }
    
    // Try header fallback
    const headerUserKeysRaw = req.headers['x-user-api-keys'] as string | undefined;
    if (headerUserKeysRaw) {
      try {
        const parsed = JSON.parse(headerUserKeysRaw);
        if (Array.isArray(parsed)) {
          visitorKeys.push(...parsed.map((k: any) => String(k).trim()).filter(Boolean));
        }
      } catch (e) {
        // If not valid JSON, treat as comma-separated or space-separated list
        const splitVals = headerUserKeysRaw.split(/[\s,;]+/).map(k => k.trim()).filter(Boolean);
        visitorKeys.push(...splitVals);
      }
    }

    // Handle legacy single-key header if sent
    const legacyHeaderKey = req.headers['x-user-api-key'] as string | undefined;
    if (legacyHeaderKey && legacyHeaderKey.trim()) {
      visitorKeys.push(legacyHeaderKey.trim());
    }

    // Remove duplicate visitor keys
    visitorKeys = Array.from(new Set(visitorKeys));

    // Get system/server keys
    const systemKeys = getSystemApiKeys();
    console.log(`[CANVAS-PRD-AI] [KEYS] Kunci bawaan Server (Vercel Env) ditemukan: ${systemKeys.length} kunci.`);
    console.log(`[CANVAS-PRD-AI] [KEYS] Kunci dari Pengunjung (Browser) dikirim: ${visitorKeys.length} kunci.`);

    // Combined queues for trying
    const attemptsQueue: { key: string; type: 'env' | 'visitor'; index: number }[] = [];
    systemKeys.forEach((key, idx) => {
      attemptsQueue.push({ key, type: 'env', index: idx + 1 });
    });
    visitorKeys.forEach((key, idx) => {
      attemptsQueue.push({ key, type: 'visitor', index: idx + 1 });
    });

    console.log(`[CANVAS-PRD-AI] [QUEUE] Total antrean rotasi kunci yang siap dicoba: ${attemptsQueue.length} kunci.`);

    if (attemptsQueue.length === 0) {
      console.error('[CANVAS-PRD-AI] [ERROR] Tidak ada API Key yang dapat digunakan.');
      return res.status(400).json({
        error: 'Tidak ada API Key yang terdeteksi. Silakan konfigurasi API Key bawaan di server (Vercel Env) atau masukkan API Key Anda sendiri di tab Pengaturan.'
      });
    }

    // Generation helper
    const runGeneration = async (apiKey: string, modelName: string) => {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Resolve Design Mode / Mood / Density sebelum membangun prompt
      const resolvedDesignMode: 'freeform' | 'guided-tokens' | 'guided-full' = form.designMode || 'guided-tokens';
      let resolvedMoodId = form.designMoodId || 'auto';
      let resolvedDensityId = form.designDensity || 'auto';

      if (resolvedDesignMode !== 'freeform' && resolvedMoodId === 'auto') {
        const mapped = WEBSITE_TYPE_TO_MOOD_MAP[form.websiteType];
        resolvedMoodId = mapped?.moodId || DESIGN_MOODS[0].id;
        if (resolvedDensityId === 'auto') {
          resolvedDensityId = mapped?.density || 'standard';
        }
      }
      if (resolvedDesignMode === 'guided-full' && resolvedDensityId === 'auto') {
        resolvedDensityId = 'standard';
      }

      const creativityDirective = getCreativityInstruction(form.creativitySlider);
      const systemInstruction = buildSystemPrompt() + `\n\nDirectives for Creativity Level (${form.creativitySlider}%): ${creativityDirective}`;
      const userPrompt = buildUserPrompt(form, {
        mode: resolvedDesignMode,
        moodId: resolvedMoodId,
        densityId: resolvedDensityId,
      });
      const thinkingConfig = getThinkingConfig(form.reasoningLevel);

      console.log(`[CANVAS-PRD-AI] [MODEL-START] Mengirim ke Gemini model: "${modelName}", reasoning: ${form.reasoningLevel || 'Standard'}, kreativitas: ${form.creativitySlider}%...`);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction,
          ...thinkingConfig,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              markdown: {
                type: Type.STRING,
                description: 'Dokumen PRD lengkap dalam format Markdown.'
              },
              readyScore: {
                type: Type.INTEGER,
                description: 'Skor kesiapan Canvas (0-100) berdasarkan kelengkapan parameter input.'
              },
              scoreReasons: {
                type: Type.OBJECT,
                properties: {
                  passed: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Daftar parameter atau kelengkapan yang sudah terpenuhi.'
                  },
                  warnings: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Daftar hal-hal yang kurang atau disarankan untuk dilengkapi.'
                  }
                },
                required: ['passed', 'warnings']
              }
            },
            required: ['markdown', 'readyScore', 'scoreReasons']
          }
        }
      });

      return response;
    };

    let responseText = '';
    let successfulKeyType: 'env' | 'visitor' = 'env';
    let successfulKeyIndex = 1;
    let successfulModel = requestModelChain[0];
    const errorsList: string[] = [];

    // Rotate through API keys and Model chain
    for (const attempt of attemptsQueue) {
      let keySuccess = false;
      for (const modelName of requestModelChain) {
        try {
          console.log(`[CANVAS-PRD-AI] [ROTASI-PERCOBAAN] Mencoba Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index} dengan model "${modelName}"...`);
          const result = await runGeneration(attempt.key, modelName);
          responseText = result.text || '';
          successfulKeyType = attempt.type;
          successfulKeyIndex = attempt.index;
          successfulModel = modelName;
          keySuccess = true;
          console.log(`✅ [CANVAS-PRD-AI] [SUKSES] Berhasil memproses PRD menggunakan model "${modelName}" dan Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index}!`);
          break; // Stop iterating models
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.error(`❌ [CANVAS-PRD-AI] [ERROR-ROTASI] Gagal dengan model "${modelName}" pada Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index}: ${errMsg}`);
          errorsList.push(`Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index} (${modelName}): ${errMsg}`);
        }
      }
      if (keySuccess) {
        break; // Stop iterating keys upon first success
      }
    }

    // If all keys and models in queue failed
    if (!responseText) {
      console.error('[CANVAS-PRD-AI] [FATAL-ROTASI] Seluruh kombinasi API Key dan Model gagal memproses permintaan.');
      return res.status(500).json({
        error: `Seluruh API Key dan Model yang terkonfigurasi gagal memproses permintaan. Silakan periksa limit kuota Anda.\nDetail kesalahan:\n- ${errorsList.join('\n- ')}`
      });
    }

    // Parse JSON response
    try {
      console.log('[CANVAS-PRD-AI] [PARSE] Mencoba mengurai teks respons JSON dari Gemini...');
      const parsed = JSON.parse(responseText.trim());
      
      // Calculate words and reading time on server
      const markdownText = parsed.markdown || '';
      const wordCount = markdownText.split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.round(wordCount / 200)); // ~200 words per minute

      console.log(`[CANVAS-PRD-AI] [PARSE-SUKSES] Berhasil parsing JSON (${successfulModel}). Karakter Markdown: ${markdownText.length} | Jumlah kata: ${wordCount}`);

      return res.json({
        markdown: markdownText,
        readyScore: parsed.readyScore || 70,
        scoreReasons: parsed.scoreReasons || { passed: [], warnings: [] },
        wordCount,
        readingTime,
        usedKeyType: successfulKeyType,
        usedKeyIndex: successfulKeyIndex,
        usedModel: successfulModel
      });
    } catch (parseErr: any) {
      console.error('❌ [CANVAS-PRD-AI] [PARSE-FAIL] Gagal mem-parse JSON hasil AI:', parseErr);
      console.log('[CANVAS-PRD-AI] [RAW-RESPONSE] Teks mentah respons Gemini yang gagal di-parse:\n', responseText);
      
      // Fallback: if not valid JSON, output it raw as markdown
      const wordCount = responseText.split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.round(wordCount / 200));
      return res.json({
        markdown: responseText,
        readyScore: 75,
        scoreReasons: {
          passed: ['Dokumen berhasil digenerasi'],
          warnings: ['AI tidak mengembalikan struktur JSON terformat, hasil mentah ditampilkan.']
        },
        wordCount,
        readingTime,
        usedKeyType: successfulKeyType,
        usedKeyIndex: successfulKeyIndex,
        usedModel: successfulModel
      });
    }

  } catch (globalErr: any) {
    console.error('[CANVAS-PRD-AI] [FATAL-ERROR] Global error pada api route:', globalErr);
    if (globalErr?.stack) {
      console.error('[CANVAS-PRD-AI] [STACK-TRACE]:', globalErr.stack);
    }
    return res.status(500).json({
      error: `Terjadi kesalahan sistem internal: ${globalErr?.message || 'Unknown error'}`
    });
  }
});

// API endpoint for brief automatic analysis
app.post('/api/analyze-brief', async (req, res) => {
  console.log('\n=========================================');
  console.log('[CANVAS-PRD-AI] [REQUEST] Menerima permintaan analisis brief otomatis...');
  try {
    const { form, userApiKeys: bodyUserApiKeys, selectedModel } = req.body;
    if (!form) {
      console.error('[CANVAS-PRD-AI] [ERROR] Payload form kosong atau tidak valid.');
      return res.status(400).json({ error: 'Data form tidak ditemukan dalam body request.' });
    }

    if (form.referenceInformation && form.referenceInformation.length > MAX_BRIEF_LENGTH) {
      return res.status(400).json({
        error: `Brief mentah terlalu panjang (maksimal ${MAX_BRIEF_LENGTH} karakter). Mohon persingkat brief Anda.`,
      });
    }

    if (isSuspiciousPromptInjection(form.referenceInformation)) {
      return res.status(400).json({
        error: 'Brief mentah terdeteksi mengandung instruksi ilegal atau manipulasi prompt. Mohon masukkan deskripsi bisnis yang valid.',
      });
    }

    let requestModelChain = [...DEFAULT_MODEL_CHAIN];
    if (selectedModel && typeof selectedModel === 'string' && selectedModel.trim()) {
      const chosen = selectedModel.trim();
      requestModelChain = [chosen, ...DEFAULT_MODEL_CHAIN.filter(m => m !== chosen)];
    }

    console.log(`[CANVAS-PRD-AI] [METADATA] Nama Proyek: "${form.projectName || 'Tanpa Nama'}" | Tipe Website: ${form.websiteType} | Model Chain: [${requestModelChain.join(', ')}]`);

    // Collect user/visitor keys
    let visitorKeys: string[] = [];
    if (Array.isArray(bodyUserApiKeys)) {
      visitorKeys.push(...bodyUserApiKeys.map(k => k.trim()).filter(Boolean));
    }
    const headerUserKeysRaw = req.headers['x-user-api-keys'] as string | undefined;
    if (headerUserKeysRaw) {
      try {
        const parsed = JSON.parse(headerUserKeysRaw);
        if (Array.isArray(parsed)) {
          visitorKeys.push(...parsed.map((k: any) => String(k).trim()).filter(Boolean));
        }
      } catch (e) {
        const splitVals = headerUserKeysRaw.split(/[\s,;]+/).map(k => k.trim()).filter(Boolean);
        visitorKeys.push(...splitVals);
      }
    }
    const legacyHeaderKey = req.headers['x-user-api-key'] as string | undefined;
    if (legacyHeaderKey && legacyHeaderKey.trim()) {
      visitorKeys.push(legacyHeaderKey.trim());
    }
    visitorKeys = Array.from(new Set(visitorKeys));

    // Get system/server keys
    const systemKeys = getSystemApiKeys();

    // Combined queues
    const attemptsQueue: { key: string; type: 'env' | 'visitor'; index: number }[] = [];
    systemKeys.forEach((key, idx) => {
      attemptsQueue.push({ key, type: 'env', index: idx + 1 });
    });
    visitorKeys.forEach((key, idx) => {
      attemptsQueue.push({ key, type: 'visitor', index: idx + 1 });
    });

    if (attemptsQueue.length === 0) {
      return res.status(400).json({
        error: 'Tidak ada API Key yang terdeteksi. Silakan konfigurasi API Key di tab Pengaturan.'
      });
    }

    // Analysis run helper
    const runAnalysis = async (apiKey: string, modelName: string) => {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const thinkingConfig = getThinkingConfig(form.reasoningLevel || 'Standard');

      console.log(`[CANVAS-PRD-AI] [MODEL-START-ANALYSIS] Menganalisis brief dengan model: "${modelName}"...`);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Analyze this raw website brief and extract appropriate metadata, parameters, and design/content strategies.
Project Name: "${form.projectName}"
Website Type: "${form.websiteType}"
Language: "${form.projectLanguage}"
Logo Link: "${form.logoLink || 'None'}"

Raw Reference Information:
"""
${form.referenceInformation}
"""

Competitor/Reference Links:
${(form.referenceLinks || []).map((l: string) => `- ${l}`).join('\n') || 'None'}`,
        config: {
          systemInstruction: `You are an elite Business Analyst and UX/UI design lead. Your job is to analyze the raw website brief and determine optimal parameters for a highly customized website design/development project.
Based on the brief, determine:
1. Target Audience: Choose 2-5 relevant categories from: "Business Owner", "Corporate", "Investor", "Parents", "Students", "Doctors", "Distributor", "Retail", "Government", "Public", "Custom".
2. Goal Website: Choose 1-3 relevant options from: "Lead Generation", "WhatsApp", "Sales", "Brand Awareness", "Appointment", "Booking", "Download Catalog", "Registration", "Recruitment", "Portfolio", "Education", "Information", "Customer Support", "Newsletter", "Custom".
3. Brand Styles: Choose 2-4 relevant styles from: "Modern", "Minimalist", "Corporate", "Elegant", "Luxury", "Technology", "Creative", "Friendly", "Professional", "Startup", "Apple Style", "Stripe Style", "Glassmorphism", "Neumorphism", "Material Design", "Custom".
4. Visual Style & Color Palette: Suggest Primary, Secondary, and Accent Hex colors matching the business vibe.
5. Typography: Suggest a "headingFont" and a "bodyFont" (can be the same or different) from: "Inter", "Poppins", "DM Sans", "Sora", "Playfair Display", "Cormorant Garamond", "Unbounded", "Manrope", "Space Grotesk", "JetBrains Mono", "Work Sans", "Quicksand", "Nunito", "Fraunces", "Lora", "Auto". Prefer serif fonts (Playfair Display, Cormorant Garamond, Fraunces, Lora) for Elegant/Luxury/Editorial brand styles, display/mono fonts (Unbounded, Space Grotesk, JetBrains Mono) for Technology/Creative, and rounded fonts (Quicksand, Nunito) for Friendly/Casual.
6. Animation Level: Suggest one from "None", "Minimal", "Medium", "Premium", "Luxury", "WOW".
7. Illustration Style: Suggest one from "Flat", "3D", "Photography", "AI Generated", "Icons Only", "Corporate", "Minimal".
8. Preferred Copywriting Tone: Suggest one from "Professional", "Friendly", "Premium", "Luxury", "Corporate", "Casual", "Creative", "Persuasive".
9. SEO strategy: Suggest an SEO-optimized "metaTitle" (max 60 characters) and "metaDescription" (max 160 characters) tailored to this specific business, written in the requested project language.
10. AI Confidence level (0-100) for business analysis, target audience, brand style, and SEO strategy.
11. AI Assumptions: Suggest 3-5 assumptions made from the raw input (e.g. B2B, focus, CTAs, structure etc.).
12. Quick Review: Summary statistics (businessType, targetAudience, websiteGoal, brandStyle, cta, seoFocus, estimatedPages, estimatedSections).
13. Design Mood ID: Suggest one id from "${DESIGN_MOODS.map(m => m.id).join('", "')}" — pick the id whose visual identity best fits the tone of THIS specific brief (e.g. brief mentions "kesan mewah/eksklusif" → prefer dark-luxury even if the default for that Website Type is different), not just a generic default.

Output strictly in JSON matching the specified schema. All text in 'assumptions' and 'quickReview' must be in Indonesian or the requested project language.`,
          ...thinkingConfig,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              confidence: {
                type: Type.OBJECT,
                properties: {
                  businessAnalysis: { type: Type.INTEGER, description: 'Confidence level (0-100)' },
                  targetAudience: { type: Type.INTEGER, description: 'Confidence level (0-100)' },
                  brandStyle: { type: Type.INTEGER, description: 'Confidence level (0-100)' },
                  seoStrategy: { type: Type.INTEGER, description: 'Confidence level (0-100)' }
                },
                required: ['businessAnalysis', 'targetAudience', 'brandStyle', 'seoStrategy']
              },
              assumptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-5 clear bullet points of assumptions made by AI (in Indonesian/Indonesian-aligned language).'
              },
              quickReview: {
                type: Type.OBJECT,
                properties: {
                  businessType: { type: Type.STRING },
                  targetAudience: { type: Type.STRING },
                  websiteGoal: { type: Type.STRING },
                  brandStyle: { type: Type.STRING },
                  cta: { type: Type.STRING },
                  seoFocus: { type: Type.STRING },
                  estimatedPages: { type: Type.INTEGER },
                  estimatedSections: { type: Type.INTEGER }
                },
                required: ['businessType', 'targetAudience', 'websiteGoal', 'brandStyle', 'cta', 'seoFocus', 'estimatedPages', 'estimatedSections']
              },
              mappedFields: {
                type: Type.OBJECT,
                properties: {
                  targetAudience: { type: Type.ARRAY, items: { type: Type.STRING } },
                  goalWebsite: { type: Type.ARRAY, items: { type: Type.STRING } },
                  brandStyles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  designMoodId: { type: Type.STRING, description: `Salah satu dari: ${DESIGN_MOODS.map(m => m.id).join(', ')}. Pilih berdasarkan konteks brief spesifik (mis. brief menyebut "butuh kesan mewah" → boleh override default berbasis WebsiteType).` },
                  animationLevel: { type: Type.STRING, description: '"None", "Minimal", "Medium", "Premium", "Luxury", "WOW"' },
                  illustrationStyle: { type: Type.STRING, description: '"Flat", "3D", "Photography", "AI Generated", "Icons Only", "Corporate", "Minimal"' },
                  preferredTone: { type: Type.STRING, description: '"Professional", "Friendly", "Premium", "Luxury", "Corporate", "Casual", "Creative", "Persuasive"' },
                  primaryColor: { type: Type.STRING, description: 'Hex code e.g. #fe4c6f' },
                  secondaryColor: { type: Type.STRING, description: 'Hex code' },
                  accentColor: { type: Type.STRING, description: 'Hex code' },
                  autoGenerateColors: { type: Type.BOOLEAN },
                  headingFont: { type: Type.STRING, description: 'Font for headings (H1-H6). One of the Typography options listed in the instructions, or "Auto".' },
                  bodyFont: { type: Type.STRING, description: 'Font for body/paragraph/UI text. One of the Typography options listed in the instructions, or "Auto".' },
                  metaTitle: { type: Type.STRING, description: 'SEO-optimized meta title, max 60 characters' },
                  metaDescription: { type: Type.STRING, description: 'SEO-optimized meta description, max 160 characters' },
                  aiMode: { type: Type.STRING, description: '"Quick", "Balanced", "Professional", "Enterprise"' },
                  creativitySlider: { type: Type.INTEGER },
                  reasoningLevel: { type: Type.STRING, description: '"Basic", "Standard", "Advanced", "Maximum"' }
                },
                required: [
                  'targetAudience', 'goalWebsite', 'brandStyles', 'designMoodId', 'animationLevel',
                  'illustrationStyle', 'preferredTone', 'primaryColor', 'secondaryColor',
                  'accentColor', 'autoGenerateColors', 'headingFont', 'bodyFont', 'metaTitle', 'metaDescription',
                  'aiMode', 'creativitySlider', 'reasoningLevel'
                ]
              }
            },
            required: ['confidence', 'assumptions', 'quickReview', 'mappedFields']
          }
        }
      });

      return response;
    };

    let responseText = '';
    let successfulKeyType: 'env' | 'visitor' = 'env';
    let successfulKeyIndex = 1;
    let successfulModel = requestModelChain[0];
    const errorsList: string[] = [];

    // Rotate keys & models
    for (const attempt of attemptsQueue) {
      let keySuccess = false;
      for (const modelName of requestModelChain) {
        try {
          console.log(`[CANVAS-PRD-AI] [ROTASI-ANALISIS] Mencoba dengan Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index} & model "${modelName}"...`);
          const result = await runAnalysis(attempt.key, modelName);
          responseText = result.text || '';
          successfulKeyType = attempt.type;
          successfulKeyIndex = attempt.index;
          successfulModel = modelName;
          keySuccess = true;
          console.log(`✅ [CANVAS-PRD-AI] [SUKSES-ANALISIS] Berhasil analisis brief menggunakan model "${modelName}" dan Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index}!`);
          break;
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.error(`❌ [CANVAS-PRD-AI] [ERROR-ANALISIS] Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index} (${modelName}): ${errMsg}`);
          errorsList.push(`Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index} (${modelName}): ${errMsg}`);
        }
      }
      if (keySuccess) {
        break;
      }
    }

    if (!responseText) {
      return res.status(500).json({
        error: `Seluruh API Key dan Model gagal memproses analisis brief. Detail kesalahan:\n- ${errorsList.join('\n- ')}`
      });
    }

    const parsed = JSON.parse(responseText.trim());
    return res.json({ ...parsed, usedModel: successfulModel });

  } catch (globalErr: any) {
    console.error('[CANVAS-PRD-AI] [FATAL-ERROR-ANALISIS] Global error pada api route:', globalErr);
    return res.status(500).json({
      error: `Terjadi kesalahan sistem internal saat menganalisis: ${globalErr?.message || 'Unknown error'}`
    });
  }
});

// Serve static assets or mount Vite dev server (ONLY if not running on Vercel as a serverless function)
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  
  const startLocalServer = async () => {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server Canvas PRD AI berjalan di port ${PORT}`);
    });
  };

  startLocalServer().catch((err) => {
    console.error('Gagal menjalankan server lokal:', err);
  });
}

export { app };
export default app;

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { buildSystemPrompt, buildUserPrompt } from '../src/prompts/promptTemplates.js';
import { DESIGN_MOODS, WEBSITE_TYPE_TO_MOOD_MAP } from '../src/data/designMoods.js';
import { apiKeyManager, maskKey, classifyGeminiError, ManagedKey } from './apiKeyManager.js';

export const maxDuration = 300; // Set Vercel serverless function timeout to 300 seconds

dotenv.config();

const app = express();

// Set payload size limits for raw text and attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiter for Password Gate
const passwordAttempts = new Map<string, { count: number; firstAttemptAt: number }>();
const MAX_PASSWORD_ATTEMPTS = 5;
const PASSWORD_ATTEMPT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// Primary -> Fallback Model Chain
const DEFAULT_MODEL_CHAIN: string[] = (process.env.GEMINI_MODEL_CHAIN
  ? process.env.GEMINI_MODEL_CHAIN.split(',').map(m => m.trim()).filter(Boolean)
  : ['gemini-3.6-flash', 'gemini-3.5-flash']);

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

// Programmatic PRD validator to verify AI self-review assertions and calculate objective readiness
interface PRDValidationResult {
  passed: string[];
  warnings: string[];
  adjustedScore: number;
}

const FORBIDDEN_BRAND_NAMES = [
  'linear', 'stripe', 'apple', 'aesop', 'gumroad', 'figma', 'dribbble', 
  'headspace', 'duolingo', 'pitch.com', 'bentley motors', 'rolex'
];

function validatePRDContent(
  markdownText: string,
  aiReportedScore: number,
  aiReportedReasons: { passed: string[]; warnings: string[] },
  userBriefText: string = ''
): PRDValidationResult {
  const passed = [...(aiReportedReasons?.passed || [])];
  const warnings = [...(aiReportedReasons?.warnings || [])];

  // 1. Check for duplicate adjacent words
  const duplicateWordsMatch = markdownText.match(/\b(\w{3,})\s+\1\b/gi);
  if (duplicateWordsMatch && duplicateWordsMatch.length > 0) {
    const uniqueDups = Array.from(new Set(duplicateWordsMatch.map(w => w.toLowerCase())));
    warnings.push(`Terdeteksi pengulangan kata berurutan: "${uniqueDups.slice(0, 3).join('", "')}".`);
  } else {
    passed.push('Bebas dari pengulangan kata berurutan.');
  }

  // 2. Check for internal reference brand name leaks
  const foundBrands: string[] = [];
  const lowerText = markdownText.toLowerCase();
  const lowerUserBrief = userBriefText.toLowerCase();
  for (const brand of FORBIDDEN_BRAND_NAMES) {
    if (lowerText.includes(brand) && !lowerUserBrief.includes(brand)) {
      foundBrands.push(brand);
    }
  }
  if (foundBrands.length > 0) {
    warnings.push(`Terdeteksi rujukan nama brand internal (${foundBrands.map(b => `"${b}"`).join(', ')}).`);
  } else {
    passed.push('Kerahasiaan referensi merek internal terjaga.');
  }

  // 3. Check for essential PRD section headers
  const requiredHeaders = [
    'Executive Summary',
    'Business Overview',
    'Color Palette',
    'Typography',
    'Page-by-Page & Section-by-Section Breakdown',
    'Technical Notes for Gemini Canvas',
    'Final Instruction For Gemini Canvas'
  ];
  let missingHeaders = 0;
  for (const header of requiredHeaders) {
    if (!markdownText.toLowerCase().includes(header.toLowerCase())) {
      missingHeaders++;
      warnings.push(`Bagian "${header}" tidak terdeteksi di dokumen.`);
    }
  }
  if (missingHeaders === 0) {
    passed.push('Seluruh struktur section wajib PRD terisi lengkap.');
  }

  // 4. Calculate objective score
  let validatorScore = 100;
  validatorScore -= warnings.length * 5;
  validatorScore = Math.max(50, Math.min(100, validatorScore));

  const adjustedScore = Math.round((aiReportedScore * 0.6) + (validatorScore * 0.4));

  return {
    passed: Array.from(new Set(passed)),
    warnings: Array.from(new Set(warnings)),
    adjustedScore
  };
}

// Map reasoning level to Google GenAI thinkingLevel enum
const getThinkingConfig = (reasoningLevel?: string) => {
  let level = ThinkingLevel.LOW;
  if (reasoningLevel === 'Standard') {
    level = ThinkingLevel.LOW;
  } else if (reasoningLevel === 'Advanced') {
    level = ThinkingLevel.MEDIUM;
  } else if (reasoningLevel === 'Maximum') {
    level = ThinkingLevel.HIGH;
  }
  return { thinkingConfig: { thinkingLevel: level } };
};

// Prompt Injection Guard & Input Length Limit
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

const MAX_BRIEF_LENGTH = 10000; // characters
const MAX_EXTRA_INSTRUCTION_LENGTH = 3000; // characters

// Collect and sort all keys from environment variables
const getSystemApiKeys = (): string[] => {
  const keyMap: { envKey: string; score: number; value: string }[] = [];
  
  for (const envKey of Object.keys(process.env)) {
    const upperEnvKey = envKey.toUpperCase();
    if (upperEnvKey.startsWith('GEMINI_API_KEY')) {
      const val = process.env[envKey]?.trim();
      if (val) {
        let score = 9999;
        if (upperEnvKey === 'GEMINI_API_KEY') {
          score = 0;
        } else {
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

// Helper to extract visitor keys from request body or headers
function extractVisitorKeys(req: express.Request, bodyUserApiKeys?: any): string[] {
  let visitorKeys: string[] = [];

  if (Array.isArray(bodyUserApiKeys)) {
    visitorKeys.push(...bodyUserApiKeys.map(k => String(k).trim()).filter(Boolean));
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

  return Array.from(new Set(visitorKeys));
}

// API status check
app.get('/api/status', (req, res) => {
  const systemKeys = getSystemApiKeys();
  apiKeyManager.registerKeys(systemKeys, []);
  res.json({
    status: 'ok',
    hasSystemApiKey: systemKeys.length > 0,
    systemApiKeyCount: systemKeys.length,
    defaultModels: DEFAULT_MODEL_CHAIN,
    keyHealth: apiKeyManager.getStatusSummary()
  });
});

// Verify access password
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

// PRD Generation Endpoint
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
      console.warn('[CANVAS-PRD-AI] [SECURITY-LOG] Terdeteksi frasa berpotensi prompt-injection pada input.');
    }

    // Build model chain for this request
    let requestModelChain = [...DEFAULT_MODEL_CHAIN];
    if (selectedModel && typeof selectedModel === 'string' && selectedModel.trim()) {
      const chosen = selectedModel.trim();
      requestModelChain = [chosen, ...DEFAULT_MODEL_CHAIN.filter(m => m !== chosen)];
    }

    console.log(`[CANVAS-PRD-AI] [METADATA] Nama Proyek: "${form.projectName || 'Tanpa Nama'}" | Mode AI: ${form.aiMode} | Kreativitas: ${form.creativitySlider}% | Model Chain: [${requestModelChain.join(', ')}]`);

    // Register server keys & visitor keys in ApiKeyManager
    const systemKeys = getSystemApiKeys();
    const visitorKeys = extractVisitorKeys(req, bodyUserApiKeys);

    console.log(`[CANVAS-PRD-AI] [KEYS] Kunci Server (Vercel Env): ${systemKeys.length} | Kunci Pengunjung (Browser): ${visitorKeys.length}`);

    const registeredKeys = apiKeyManager.registerKeys(systemKeys, visitorKeys);
    if (registeredKeys.length === 0) {
      console.error('[CANVAS-PRD-AI] [ERROR] Tidak ada API Key yang dapat digunakan.');
      return res.status(400).json({
        error: 'Tidak ada API Key yang terdeteksi. Silakan konfigurasi API Key bawaan di server (Vercel Env) atau masukkan API Key Anda sendiri di tab Pengaturan.'
      });
    }

    // Get candidates sorted by Round Robin cursor order (skipping cooldown/disabled)
    const candidateKeys = apiKeyManager.getCandidateKeys(registeredKeys);
    if (candidateKeys.length === 0) {
      console.warn('[CANVAS-PRD-AI] [COOLDOWN-ALL] Seluruh API Key sedang dalam masa cooldown.');
      return res.status(429).json({
        error: 'ALL_API_KEYS_IN_COOLDOWN',
        message: 'Seluruh API Key yang tersedia sedang dalam masa cooldown karena limit kuota/rate-limit. Silakan coba beberapa saat lagi.',
        retryable: true,
        keyHealth: apiKeyManager.getStatusSummary()
      });
    }

    let responseText = '';
    let successfulKey: ManagedKey | null = null;
    let successfulModel = requestModelChain[0];
    const errorsList: string[] = [];

    // Round Robin & Failover Loop
    for (const keyCandidate of candidateKeys) {
      let keySuccess = false;

      for (const modelName of requestModelChain) {
        try {
          console.log(`[CANVAS-PRD-AI] [ROUND-ROBIN] Mencoba ${keyCandidate.masked} dengan model "${modelName}"...`);

          const ai = new GoogleGenAI({
            apiKey: keyCandidate.key,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          // Resolve Mood & Density
          let resolvedMoodId = form.designMoodId || 'auto';
          let resolvedDensityId = form.designDensity || 'auto';

          if (resolvedMoodId === 'auto') {
            const mapped = WEBSITE_TYPE_TO_MOOD_MAP[form.websiteType];
            resolvedMoodId = mapped?.moodId || DESIGN_MOODS[0].id;
            if (resolvedDensityId === 'auto') {
              resolvedDensityId = mapped?.density || 'standard';
            }
          }
          if (resolvedDensityId === 'auto') {
            const moodForDensity = DESIGN_MOODS.find(m => m.id === resolvedMoodId);
            resolvedDensityId = moodForDensity?.recommendedDensity || 'standard';
          }

          const creativityDirective = getCreativityInstruction(form.creativitySlider);
          const systemInstruction = buildSystemPrompt() + `\n\nDirectives for Creativity Level (${form.creativitySlider}%): ${creativityDirective}`;
          const userPrompt = buildUserPrompt(form, {
            moodId: resolvedMoodId,
            densityId: resolvedDensityId,
          });

          const thinkingConfig = getThinkingConfig(form.reasoningLevel);

          console.log(`[CANVAS-PRD-AI] [MODEL-START] Mengirim ke Gemini model: "${modelName}", reasoning: ${form.reasoningLevel || 'Standard'}, kreativitas: ${form.creativitySlider}%...`);

          const result = await ai.models.generateContent({
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

          responseText = result.text || '';
          successfulKey = keyCandidate;
          successfulModel = modelName;
          keySuccess = true;

          apiKeyManager.markSuccess(keyCandidate.id);
          console.log(`✅ [CANVAS-PRD-AI] [SUKSES] Berhasil memproses PRD menggunakan model "${modelName}" dan ${keyCandidate.masked}!`);
          break; // Stop model loop
        } catch (err: any) {
          const errorType = apiKeyManager.markFailure(keyCandidate.id, err);
          const errMsg = err?.message || String(err);
          console.error(`❌ [CANVAS-PRD-AI] [ERROR-KEY] Gagal pada ${keyCandidate.masked} (${modelName}): [${errorType}] ${errMsg}`);
          errorsList.push(`${keyCandidate.masked} (${modelName}): [${errorType}] ${errMsg}`);

          if (errorType === 'APP_ERROR') {
            return res.status(400).json({ error: `Gagal memproses request: ${errMsg}` });
          }

          // Key-level error — failover to next keyCandidate
          break;
        }
      }

      if (keySuccess) {
        break; // Stop key candidate loop upon first success
      }
    }

    if (!responseText || !successfulKey) {
      console.error('[CANVAS-PRD-AI] [FATAL-ROTASI] Seluruh API Key yang tersedia gagal memproses permintaan.');
      return res.status(500).json({
        error: 'ALL_API_KEYS_FAILED',
        message: 'Seluruh API Key yang tersedia gagal memproses permintaan. Silakan periksa limit kuota Anda.',
        retryable: true,
        details: errorsList
      });
    }

    // Parse JSON response
    try {
      console.log('[CANVAS-PRD-AI] [PARSE] Mencoba mengurai teks respons JSON dari Gemini...');
      const parsed = JSON.parse(responseText.trim());
      
      const markdownText = parsed.markdown || '';
      const wordCount = markdownText.split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.round(wordCount / 200));

      const validation = validatePRDContent(
        markdownText,
        parsed.readyScore || 80,
        parsed.scoreReasons || { passed: [], warnings: [] },
        form.referenceInformation || ''
      );

      console.log(`[CANVAS-PRD-AI] [PARSE-SUKSES] Berhasil parsing JSON (${successfulModel}). Karakter Markdown: ${markdownText.length} | Jumlah kata: ${wordCount} | Skor Terverifikasi: ${validation.adjustedScore}`);

      return res.json({
        markdown: markdownText,
        readyScore: validation.adjustedScore,
        scoreReasons: {
          passed: validation.passed,
          warnings: validation.warnings
        },
        wordCount,
        readingTime,
        usedKeyType: successfulKey.type,
        usedKeyIndex: successfulKey.index,
        usedModel: successfulModel
      });
    } catch (parseErr: any) {
      console.error('❌ [CANVAS-PRD-AI] [PARSE-FAIL] Gagal mem-parse JSON hasil AI:', parseErr);
      
      const trimmedText = responseText.trim();
      const looksLikeTruncatedJson = (trimmedText.startsWith('{') || trimmedText.includes('"markdown":'));

      if (looksLikeTruncatedJson) {
        console.error('❌ [CANVAS-PRD-AI] [PARSE-FAIL-TRUNCATED] Respons AI terindikasi sebagai JSON terpotong.');
        return res.status(502).json({
          error: 'Dokumen PRD gagal digenerasi secara utuh karena keterbatasan panjang respons dari model. Silakan coba lagi, atau gunakan mode yang lebih ringkas.'
        });
      }

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
        usedKeyType: successfulKey.type,
        usedKeyIndex: successfulKey.index,
        usedModel: successfulModel
      });
    }

  } catch (globalErr: any) {
    console.error('[CANVAS-PRD-AI] [FATAL-ERROR] Global error pada api route:', globalErr);
    return res.status(500).json({
      error: `Terjadi kesalahan sistem internal: ${globalErr?.message || 'Unknown error'}`
    });
  }
});

// Automatic Brief Analysis Endpoint
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

    // Register server keys & visitor keys
    const systemKeys = getSystemApiKeys();
    const visitorKeys = extractVisitorKeys(req, bodyUserApiKeys);

    const registeredKeys = apiKeyManager.registerKeys(systemKeys, visitorKeys);
    if (registeredKeys.length === 0) {
      return res.status(400).json({
        error: 'Tidak ada API Key yang terdeteksi. Silakan konfigurasi API Key di tab Pengaturan.'
      });
    }

    const candidateKeys = apiKeyManager.getCandidateKeys(registeredKeys);
    if (candidateKeys.length === 0) {
      return res.status(429).json({
        error: 'ALL_API_KEYS_IN_COOLDOWN',
        message: 'Seluruh API Key sedang dalam masa cooldown. Silakan coba beberapa saat lagi.',
        retryable: true,
        keyHealth: apiKeyManager.getStatusSummary()
      });
    }

    let responseText = '';
    let successfulKey: ManagedKey | null = null;
    let successfulModel = requestModelChain[0];
    const errorsList: string[] = [];

    // Round Robin Candidate Execution
    for (const keyCandidate of candidateKeys) {
      let keySuccess = false;

      for (const modelName of requestModelChain) {
        try {
          console.log(`[CANVAS-PRD-AI] [ROUND-ROBIN-ANALYSIS] Mencoba ${keyCandidate.masked} & model "${modelName}"...`);

          const ai = new GoogleGenAI({
            apiKey: keyCandidate.key,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          const thinkingConfig = getThinkingConfig(form.reasoningLevel || 'Standard');

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
4. Visual Style & Color Palette: Suggest Primary, Secondary, and Accent Hex colors matching the business vibe.
5. Typography: Suggest a "headingFont" and a "bodyFont" (can be the same or different) from: "Inter", "Poppins", "DM Sans", "Sora", "Playfair Display", "Cormorant Garamond", "Unbounded", "Manrope", "Space Grotesk", "JetBrains Mono", "Work Sans", "Quicksand", "Nunito", "Fraunces", "Lora", "Auto".
6. Animation Level: Suggest one from "None", "Minimal", "Medium", "Premium", "Luxury", "WOW".
7. Illustration Style: Suggest one from "Flat", "3D", "Photography", "AI Generated", "Icons Only", "Corporate", "Minimal".
8. Preferred Copywriting Tone: Suggest one from "Professional", "Friendly", "Premium", "Luxury", "Corporate", "Casual", "Creative", "Persuasive".
9. SEO strategy: Suggest an SEO-optimized "metaTitle" (max 60 characters) and "metaDescription" (max 160 characters) tailored to this specific business, written in the requested project language.
10. AI Confidence level (0-100) for business analysis, target audience, brand style, and SEO strategy.
11. AI Assumptions: Suggest 3-5 assumptions made from the raw input.
12. Quick Review: Summary statistics (businessType, targetAudience, websiteGoal, brandStyle, cta, seoFocus, estimatedPages, estimatedSections).
13. Design Mood ID: Suggest one id from "${DESIGN_MOODS.map(m => m.id).join('", "')}".

Output strictly in JSON matching the specified schema. All text in 'assumptions' and 'quickReview' must be in Indonesian or the requested project language.`,
              ...thinkingConfig,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  confidence: {
                    type: Type.OBJECT,
                    properties: {
                      businessAnalysis: { type: Type.INTEGER },
                      targetAudience: { type: Type.INTEGER },
                      brandStyle: { type: Type.INTEGER },
                      seoStrategy: { type: Type.INTEGER }
                    },
                    required: ['businessAnalysis', 'targetAudience', 'brandStyle', 'seoStrategy']
                  },
                  assumptions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
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
                      designMoodId: { type: Type.STRING },
                      animationLevel: { type: Type.STRING },
                      illustrationStyle: { type: Type.STRING },
                      preferredTone: { type: Type.STRING },
                      primaryColor: { type: Type.STRING },
                      secondaryColor: { type: Type.STRING },
                      accentColor: { type: Type.STRING },
                      autoGenerateColors: { type: Type.BOOLEAN },
                      headingFont: { type: Type.STRING },
                      bodyFont: { type: Type.STRING },
                      metaTitle: { type: Type.STRING },
                      metaDescription: { type: Type.STRING },
                      aiMode: { type: Type.STRING, description: '"Quick", "Professional", "Enterprise"' },
                      creativitySlider: { type: Type.INTEGER },
                      reasoningLevel: { type: Type.STRING, description: '"Standard", "Advanced", "Maximum"' }
                    },
                    required: [
                      'targetAudience', 'goalWebsite', 'designMoodId', 'animationLevel',
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

          responseText = response.text || '';
          successfulKey = keyCandidate;
          successfulModel = modelName;
          keySuccess = true;

          apiKeyManager.markSuccess(keyCandidate.id);
          console.log(`✅ [CANVAS-PRD-AI] [SUKSES-ANALISIS] Berhasil analisis brief dengan model "${modelName}" & ${keyCandidate.masked}!`);
          break;
        } catch (err: any) {
          const errorType = apiKeyManager.markFailure(keyCandidate.id, err);
          const errMsg = err?.message || String(err);
          console.error(`❌ [CANVAS-PRD-AI] [ERROR-ANALISIS] ${keyCandidate.masked} (${modelName}): [${errorType}] ${errMsg}`);
          errorsList.push(`${keyCandidate.masked} (${modelName}): [${errorType}] ${errMsg}`);

          if (errorType === 'APP_ERROR') {
            return res.status(400).json({ error: `Gagal memproses analisis: ${errMsg}` });
          }

          break; // Failover to next key
        }
      }

      if (keySuccess) {
        break;
      }
    }

    if (!responseText || !successfulKey) {
      return res.status(500).json({
        error: 'ALL_API_KEYS_FAILED',
        message: 'Seluruh API Key yang tersedia gagal memproses analisis brief.',
        details: errorsList
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

// Serve static assets or mount Vite dev server in non-Vercel environment
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

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { buildSystemPrompt, buildUserPrompt } from './src/prompts/promptTemplates.js';

dotenv.config();

const app = express();

// Set payload size limits for raw text and attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
      systemApiKeyCount: systemKeys.length
    });
  });

  // API endpoint for PRD generation
  app.post('/api/generate-prd', async (req, res) => {
    try {
      const { form, userApiKeys: bodyUserApiKeys } = req.body;
      if (!form) {
        return res.status(400).json({ error: 'Data form tidak ditemukan dalam body request.' });
      }

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

      // Combined queues for trying
      const attemptsQueue: { key: string; type: 'env' | 'visitor'; index: number }[] = [];
      systemKeys.forEach((key, idx) => {
        attemptsQueue.push({ key, type: 'env', index: idx + 1 });
      });
      visitorKeys.forEach((key, idx) => {
        attemptsQueue.push({ key, type: 'visitor', index: idx + 1 });
      });

      if (attemptsQueue.length === 0) {
        return res.status(400).json({
          error: 'Tidak ada API Key yang terdeteksi. Silakan konfigurasi API Key bawaan di server (Vercel Env) atau masukkan API Key Anda sendiri di tab Pengaturan.'
        });
      }

      // Generation helper
      const runGeneration = async (apiKey: string) => {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const systemInstruction = buildSystemPrompt();
        const userPrompt = buildUserPrompt(form);

        // Adjust temperature based on creativity slider (0 to 100 -> 0.0 to 1.0)
        const temperature = Math.max(0, Math.min(1, form.creativitySlider / 100));

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature,
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
      const errorsList: string[] = [];

      // Rotate through all available keys
      for (const attempt of attemptsQueue) {
        try {
          console.log(`[CANVAS-PRD-AI] [ROTASI-KUNCI] Mencoba generasi menggunakan Kunci ${attempt.type === 'env' ? 'Server (Vercel)' : 'Pengunjung (Browser)'} #${attempt.index}...`);
          const result = await runGeneration(attempt.key);
          responseText = result.text || '';
          successfulKeyType = attempt.type;
          successfulKeyIndex = attempt.index;
          console.log(`✅ [CANVAS-PRD-AI] [SUKSES] Berhasil memproses PRD menggunakan Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index}!`);
          break; // Stop iterating upon first success
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.error(`❌ [CANVAS-PRD-AI] [ERROR-ROTASI] Gagal menggunakan Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index}: ${errMsg}`);
          errorsList.push(`Kunci ${attempt.type === 'env' ? 'Server' : 'Pengunjung'} #${attempt.index}: ${errMsg}`);
        }
      }

      // If all keys in queue failed
      if (!responseText) {
        return res.status(500).json({
          error: `Seluruh API Key yang terkonfigurasi (${attemptsQueue.length} kunci) gagal memproses permintaan. Silakan periksa limit kuota Anda.\nDetail kesalahan:\n- ${errorsList.join('\n- ')}`
        });
      }

      // Parse JSON response
      try {
        const parsed = JSON.parse(responseText.trim());
        
        // Calculate words and reading time on server
        const markdownText = parsed.markdown || '';
        const wordCount = markdownText.split(/\s+/).filter(Boolean).length;
        const readingTime = Math.max(1, Math.round(wordCount / 200)); // ~200 words per minute

        return res.json({
          markdown: markdownText,
          readyScore: parsed.readyScore || 70,
          scoreReasons: parsed.scoreReasons || { passed: [], warnings: [] },
          wordCount,
          readingTime,
          usedKeyType: successfulKeyType,
          usedKeyIndex: successfulKeyIndex
        });
      } catch (parseErr) {
        console.error('Gagal mem-parse JSON hasil AI:', parseErr, responseText);
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
          usedKeyIndex: successfulKeyIndex
        });
      }

    } catch (globalErr: any) {
      console.error('[CANVAS-PRD-AI] [FATAL-ERROR] Global error pada api route:', globalErr);
      return res.status(500).json({
        error: `Terjadi kesalahan sistem internal: ${globalErr?.message || 'Unknown error'}`
      });
    }
  });

  // Serve static assets or mount Vite dev server (ONLY if not running on Vercel as a serverless function)
  if (!process.env.VERCEL) {
    const PORT = Number(process.env.PORT) || 3000;
    
    const startLocalServer = async () => {
      if (process.env.NODE_ENV !== 'production') {
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

/**
 * Adaptive Semantic Chunked PRD Generator Engine
 */

import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { ProjectFormState, PRDGenerateResponse } from '../../src/types.js';
import { apiKeyManager, ManagedKey, classifyGeminiError } from '../apiKeyManager.js';
import { PRD_CHUNKS, PRDChunkDefinition, CANONICAL_PRD_HEADERS } from './chunkDefinitions.js';
import { buildChunkSystemPrompt, buildChunkUserPrompt } from './chunkPrompts.js';
import { validateChunk, validateFinalDocument } from './validators.js';
import { buildCompactContextSummaryText } from './contextSummary.js';
import { DESIGN_MOODS, WEBSITE_TYPE_TO_MOOD_MAP } from '../../src/data/designMoods.js';

const DEFAULT_MODEL_CHAIN: string[] = process.env.GEMINI_MODEL_CHAIN
  ? process.env.GEMINI_MODEL_CHAIN.split(',').map(m => m.trim()).filter(Boolean)
  : ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'];

const MAX_CHUNK_ATTEMPTS = 2;
const MAX_TOTAL_GENERATION_CALLS = 12;

const getThinkingConfig = (reasoningLevel?: string) => {
  let level = ThinkingLevel.LOW;
  if (reasoningLevel === 'Standard') level = ThinkingLevel.LOW;
  else if (reasoningLevel === 'Advanced') level = ThinkingLevel.MEDIUM;
  else if (reasoningLevel === 'Maximum') level = ThinkingLevel.HIGH;
  return { thinkingConfig: { thinkingLevel: level } };
};

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

export async function generatePRDInChunks(
  form: ProjectFormState,
  rawUserKeys: string[],
  selectedModel?: string
): Promise<{ statusCode: number; data: any }> {
  console.log('\n=========================================');
  console.log('[PRD-CHUNK-ENGINE] Menerima permintaan pembuatan PRD via Adaptive Semantic Chunking...');

  const registeredKeys = apiKeyManager.registerKeys(rawUserKeys);
  if (registeredKeys.length === 0) {
    return {
      statusCode: 400,
      data: { error: 'Tidak ada API Key yang terdeteksi. Silakan masukkan API Key Gemini Anda di tab Pengaturan.' }
    };
  }

  const candidateKeys = apiKeyManager.getCandidateKeys(registeredKeys);
  if (candidateKeys.length === 0) {
    return {
      statusCode: 429,
      data: {
        error: 'ALL_API_KEYS_IN_COOLDOWN',
        message: 'Seluruh API Key sedang dalam masa cooldown. Silakan coba beberapa saat lagi.',
        retryable: true,
        keyHealth: apiKeyManager.getStatusSummary()
      }
    };
  }

  let requestModelChain = [...DEFAULT_MODEL_CHAIN];
  if (selectedModel && typeof selectedModel === 'string' && selectedModel.trim()) {
    const chosen = selectedModel.trim();
    requestModelChain = [chosen, ...DEFAULT_MODEL_CHAIN.filter(m => m !== chosen)];
  }

  // Resolve Design Mood & Density
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

  const resolvedDesign = { moodId: resolvedMoodId, densityId: resolvedDensityId };
  const completedChunksMarkdown = new Map<string, string>();

  let totalCallsMade = 0;
  let lastUsedKey: ManagedKey | null = null;
  let lastUsedModel = requestModelChain[0];

  // Sequentially process each semantic chunk
  for (let cIdx = 0; cIdx < PRD_CHUNKS.length; cIdx++) {
    const chunkDef = PRD_CHUNKS[cIdx];
    console.log(`\n[PRD-CHUNK] Starting chunk ${cIdx + 1}/${PRD_CHUNKS.length}: "${chunkDef.id}" (${chunkDef.title})...`);

    let chunkSuccess = false;
    let extraFeedbackNote: string | undefined = undefined;

    for (let attempt = 1; attempt <= MAX_CHUNK_ATTEMPTS; attempt++) {
      if (totalCallsMade >= MAX_TOTAL_GENERATION_CALLS) {
        console.error('[PRD-CHUNK] [LIMIT] Reached maximum total generation calls allowance.');
        return {
          statusCode: 500,
          data: {
            error: 'PRD_GENERATION_TIMEOUT',
            message: 'Generasi PRD melebihi batas percobaan maksimum. Silakan coba lagi.'
          }
        };
      }

      const currentCandidateKeys = apiKeyManager.getCandidateKeys(registeredKeys);
      if (currentCandidateKeys.length === 0) {
        return {
          statusCode: 429,
          data: {
            error: 'ALL_API_KEYS_IN_COOLDOWN',
            message: 'Seluruh API Key sedang dalam masa cooldown. Silakan coba beberapa saat lagi.',
            retryable: true
          }
        };
      }

      const contextSummaryText = buildCompactContextSummaryText(completedChunksMarkdown, form.projectName, form.websiteType);
      const systemInstruction = buildChunkSystemPrompt(chunkDef, form) + `\n\nDirectives for Creativity Level (${form.creativitySlider}%): ${getCreativityInstruction(form.creativitySlider)}`;
      const userPrompt = buildChunkUserPrompt(chunkDef, form, resolvedDesign, contextSummaryText, extraFeedbackNote);
      const thinkingConfig = getThinkingConfig(form.reasoningLevel);

      let keyHandled = false;

      // Round Robin Key Candidate Execution
      for (const keyCandidate of currentCandidateKeys) {
        // Model Fallback Loop
        for (let mIdx = 0; mIdx < requestModelChain.length; mIdx++) {
          const modelName = requestModelChain[mIdx];
          totalCallsMade++;

          try {
            console.log(`[PRD-CHUNK] [EXEC] Chunk "${chunkDef.id}" (Attempt #${attempt}) | ${keyCandidate.masked} | Model: "${modelName}"...`);

            const ai = new GoogleGenAI({
              apiKey: keyCandidate.key,
              httpOptions: {
                headers: { 'User-Agent': 'aistudio-build' }
              }
            });

            if (chunkDef.id === 'pageBreakdown' && chunkDef.subChunks) {
              console.log(`[PRD-CHUNK] Generating Chunk "pageBreakdown" via dual sub-chunks architecture...`);
              const subChunkMarkdowns: string[] = [];
              let subChunksValid = true;
              const subWarnings: string[] = [];

              for (const subDef of chunkDef.subChunks) {
                console.log(`[PRD-CHUNK] Generating sub-chunk "${subDef.id}" (${subDef.title})...`);
                const subPrompt = buildChunkUserPrompt(
                  { id: subDef.id, title: subDef.title, requiredHeaders: subDef.requiredHeaders, description: subDef.focusScope },
                  form,
                  resolvedDesign,
                  contextSummaryText,
                  `SCOPE FOCUS: ${subDef.focusScope}${extraFeedbackNote ? `\nNote: ${extraFeedbackNote}` : ''}`
                );

                const subResult = await ai.models.generateContent({
                  model: modelName,
                  contents: subPrompt,
                  config: {
                    systemInstruction,
                    ...thinkingConfig,
                    responseMimeType: 'application/json',
                    responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                        chunkId: { type: Type.STRING },
                        markdown: { type: Type.STRING },
                        completedSections: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ['chunkId', 'markdown', 'completedSections']
                    }
                  }
                });

                const subParsed = JSON.parse((subResult.text || '').trim());
                const subMd = (subParsed.markdown || '').trim();

                const subVal = validateChunk({ ...subDef, description: subDef.focusScope }, subMd);
                if (!subVal.valid) {
                  console.warn(`⚠️ [PRD-CHUNK] Sub-chunk "${subDef.id}" validation failed:`, subVal.warnings);
                  subChunksValid = false;
                  subWarnings.push(...subVal.warnings);
                }
                subChunkMarkdowns.push(subMd);
              }

              if (subChunksValid && subChunkMarkdowns.length === 2) {
                const sub1 = subChunkMarkdowns[0];
                const sub2Clean = subChunkMarkdowns[1].replace(/^#\s+Page-by-Page[^\n]*\n+/i, '');
                const combinedSubMarkdown = `${sub1}\n\n${sub2Clean}`;
                const combinedVal = validateChunk(chunkDef, combinedSubMarkdown);

                if (combinedVal.valid) {
                  console.log(`✅ [PRD-CHUNK] [SUB-SPLIT-SUCCESS] Page breakdown sub-chunks combined & validated! Chars: ${combinedSubMarkdown.length}`);
                  completedChunksMarkdown.set(chunkDef.id, combinedSubMarkdown);
                  apiKeyManager.markSuccess(keyCandidate.id);
                  lastUsedKey = keyCandidate;
                  lastUsedModel = modelName;
                  chunkSuccess = true;
                  keyHandled = true;
                  break; // Success! Break model loop
                } else {
                  console.warn(`⚠️ [PRD-CHUNK] Combined pageBreakdown failed validation:`, combinedVal.warnings);
                  extraFeedbackNote = `Sub-chunks combination failed: ${combinedVal.warnings.join('; ')}`;
                  break;
                }
              } else {
                console.warn(`⚠️ [PRD-CHUNK] One or more pageBreakdown sub-chunks failed:`, subWarnings);
                extraFeedbackNote = `Sub-chunk failed: ${subWarnings.join('; ')}`;
                break;
              }
            }

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
                    chunkId: { type: Type.STRING },
                    markdown: { type: Type.STRING },
                    completedSections: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['chunkId', 'markdown', 'completedSections']
                }
              }
            });

            const rawText = result.text || '';
            const parsed = JSON.parse(rawText.trim());
            const returnedMarkdown = parsed.markdown || '';

            // Validate Chunk Output
            const valRes = validateChunk(chunkDef, returnedMarkdown);

            if (valRes.valid) {
              console.log(`✅ [PRD-CHUNK] [VALIDATED] Chunk "${chunkDef.id}" PASS! Chars: ${returnedMarkdown.length}`);
              completedChunksMarkdown.set(chunkDef.id, returnedMarkdown);
              apiKeyManager.markSuccess(keyCandidate.id);
              lastUsedKey = keyCandidate;
              lastUsedModel = modelName;
              chunkSuccess = true;
              keyHandled = true;
              break; // Success! Break model loop
            } else {
              console.warn(`⚠️ [PRD-CHUNK] [INVALID] Chunk "${chunkDef.id}" failed validation. Warnings:`, valRes.warnings);
              // Set feedback for retry attempt
              extraFeedbackNote = `Previous attempt failed validation: ${valRes.warnings.join('; ')}. Ensure ALL assigned section headers (${chunkDef.requiredHeaders.join(', ')}) are fully written without cutting off!`;
              break; // Try next attempt for this chunk
            }

          } catch (err: any) {
            const errorType = classifyGeminiError(err);
            const errMsg = err?.message || String(err);

            if (errorType === 'APP_ERROR') {
              console.error(`❌ [PRD-CHUNK] [APP_ERROR] 400 Bad Request: ${errMsg}`);
              return {
                statusCode: 400,
                data: { error: `Gagal memproses request: ${errMsg}` }
              };
            }

            if ((errorType === 'UNAVAILABLE' || errorType === 'SERVER_ERROR') && mIdx < requestModelChain.length - 1) {
              console.warn(`[PRD-CHUNK] [MODEL-FALLBACK] Model "${modelName}" [${errorType}]. Trying fallback model with ${keyCandidate.masked}...`);
              continue; // Try fallback model with same key
            }

            // Key error or all models failed for key
            apiKeyManager.markFailure(keyCandidate.id, err);
            console.error(`❌ [PRD-CHUNK] [KEY-ERROR] ${keyCandidate.masked} (${modelName}): [${errorType}]`);
            break; // Failover to next key
          }
        }

        if (keyHandled) break;
      }

      if (chunkSuccess) break;
    }

    if (!chunkSuccess) {
      console.error(`❌ [PRD-CHUNK] [FATAL] Chunk "${chunkDef.id}" failed after ${MAX_CHUNK_ATTEMPTS} attempts.`);
      return {
        statusCode: 500,
        data: {
          error: 'PRD_GENERATION_INCOMPLETE',
          message: `Gagal menyelesaikan bagian PRD "${chunkDef.title}" secara utuh. Silakan coba lagi.`
        }
      };
    }
  }

  // Assembly & Final Document Validation
  console.log('\n[PRD-ASSEMBLY] Combining all validated semantic chunks...');
  const combinedParts: string[] = [];
  for (const cDef of PRD_CHUNKS) {
    const chunkMd = completedChunksMarkdown.get(cDef.id);
    if (chunkMd) {
      combinedParts.push(chunkMd.trim());
    }
  }

  const finalMarkdown = combinedParts.join('\n\n');
  console.log(`[PRD-ASSEMBLY] Combined document length: ${finalMarkdown.length} characters.`);

  const finalValidation = validateFinalDocument(finalMarkdown);
  console.log(`[PRD-FINAL-VALIDATION] Score: ${finalValidation.score} | Complete: ${finalValidation.complete} | Missing: ${finalValidation.missingHeaders.length}`);

  if (!finalValidation.complete) {
    console.warn('[PRD-FINAL-VALIDATION] Final document validation warnings:', finalValidation.warnings);
  }

  const wordCount = finalMarkdown.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const responsePayload: PRDGenerateResponse = {
    markdown: finalMarkdown,
    readyScore: finalValidation.score,
    scoreReasons: {
      passed: finalValidation.passed,
      warnings: finalValidation.warnings
    },
    wordCount,
    readingTime,
    usedKeyIndex: lastUsedKey ? lastUsedKey.index : 1,
    usedModel: lastUsedModel
  };

  return {
    statusCode: 200,
    data: responsePayload
  };
}

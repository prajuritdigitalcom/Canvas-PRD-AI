/**
 * PRD Chunk and Final Document Validation Logic
 */

import { PRDChunkDefinition, CANONICAL_PRD_HEADERS } from './chunkDefinitions.js';

export interface ChunkValidationResult {
  valid: boolean;
  missingHeaders: string[];
  unexpectedHeaders: string[];
  orderValid: boolean;
  markdownIntegrityValid: boolean;
  likelyTruncated: boolean;
  warnings: string[];
}

export interface FinalValidationResult {
  complete: boolean;
  missingHeaders: string[];
  duplicateHeaders: string[];
  orderValid: boolean;
  markdownIntegrityValid: boolean;
  likelyTruncated: boolean;
  score: number;
  warnings: string[];
  passed: string[];
}

/**
 * Heuristically detects if a Markdown text string was truncated mid-generation.
 */
export function isLikelyTruncatedMarkdown(markdownText: string): { truncated: boolean; reason?: string } {
  if (!markdownText || markdownText.trim().length === 0) {
    return { truncated: true, reason: 'Teks markdown kosong.' };
  }

  const trimmed = markdownText.trim();
  const lines = trimmed.split('\n');
  const lastLine = lines[lines.length - 1].trim();

  // 1. Unclosed code fences check (odd count of ```)
  const codeFenceMatches = trimmed.match(/```/g);
  if (codeFenceMatches && codeFenceMatches.length % 2 !== 0) {
    return { truncated: true, reason: 'Terdeteksi code fence (```) yang tidak ditutup.' };
  }

  // 2. Trailing incomplete connectors, diagram arrows, or open brackets at the very end
  const trailingIncompleteRegex = /\b(dan|atau|untuk|dengan|seperti|sebagai|klik|misal|misalnya|yaitu|adalah|│|──>|-->|\(\s*|\[\s*|\{\s*)$/i;
  if (trailingIncompleteRegex.test(trimmed)) {
    return { truncated: true, reason: 'Teks berakhir di tengah kalimat/konektor diagram atau kurung terbuka.' };
  }

  // 3. Trailing dangling punctuation on last line (e.g. ends with comma or unfinished quote)
  if (/(?:,|\b[a-zA-Z0-9_]+\s*\(\s*["'][^"']*)$/.test(lastLine)) {
    return { truncated: true, reason: 'Teks terputus di tengah kalimat atau parameter tanda kutip.' };
  }

  // 4. Trailing hanging list item with colon but no content (e.g., "7. **Storytelling Highlight:" or "- Feature:")
  if (/^(?:\d+\.|\-|\*)\s+[^:\n]+:\s*$/.test(lastLine)) {
    return { truncated: true, reason: 'List item terputus setelah tanda titik dua (:) tanpa isi.' };
  }

  // 5. Unclosed table check (ends midway through a table row)
  if (lastLine.startsWith('|') && !lastLine.endsWith('|')) {
    return { truncated: true, reason: 'Baris tabel Markdown terputus di tengah kolom.' };
  }

  // 6. Trailing incomplete heading line (e.g., ends with "# " or "## Some Header")
  if (/^#+\s*[^#\n]*$/.test(lastLine) && lines.length > 1) {
    return { truncated: true, reason: 'Dokumen terputus di baris judul (heading) tanpa isi.' };
  }

  return { truncated: false };
}

/**
 * Mendeteksi kebocoran struktur multi-page (URL path selain "/" atau anchor "#...")
 * di dalam PRD yang seharusnya single-page only.
 */
export function detectMultiPageLeakage(markdownText: string): { leaked: boolean; matches: string[] } {
  // Strip code blocks to avoid false positives in code snippets
  const textWithoutCode = markdownText.replace(/```[\s\S]*?```/g, '');
  // Cocokkan pola path ala routing: /kata-kata atau /kata/kata, TAPI abaikan
  // yang muncul di dalam URL http(s), dan abaikan single "/" saja.
  const pathRegex = /(?<!https?:\/\/[^\s]+)(?<!["'`\w])\/[a-z0-9]+(?:[-/][a-z0-9]+)+\/?/gi;
  const matches = Array.from(new Set((textWithoutCode.match(pathRegex) || [])));
  return { leaked: matches.length > 0, matches };
}

/**
 * Normalizes heading text for robust comparison (lowercases, removes Markdown symbols/punctuation).
 */
export function normalizeHeaderTitle(rawHeader: string): string {
  return rawHeader
    .replace(/^#+\s*/, '')  // strip leading #
    .replace(/[*_`]/g, '')   // strip formatting
    .trim()
    .toLowerCase();
}

/**
 * Extracts all top-level level-1 (# Heading) or level-2 (## Heading) headers from markdown.
 */
export function extractHeadersFromMarkdown(markdownText: string): Array<{ title: string; normalized: string; index: number }> {
  const headerRegex = /^(?:#|##)\s+([^\n]+)/gm;
  const headers: Array<{ title: string; normalized: string; index: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(markdownText)) !== null) {
    headers.push({
      title: match[1].trim(),
      normalized: normalizeHeaderTitle(match[1]),
      index: match.index
    });
  }

  return headers;
}

/**
 * Validates an individual chunk's Markdown output against its defined scope and required headers.
 */
export function validateChunk(
  chunkDef: PRDChunkDefinition,
  markdownText: string
): ChunkValidationResult {
  const warnings: string[] = [];
  const missingHeaders: string[] = [];
  const unexpectedHeaders: string[] = [];

  const truncationCheck = isLikelyTruncatedMarkdown(markdownText);
  const extractedHeaders = extractHeadersFromMarkdown(markdownText);

  // Check required headers for this chunk
  const normalizedExtracted = extractedHeaders.map(h => h.normalized);

  let lastFoundIndex = -1;
  let orderValid = true;

  for (const reqHeader of chunkDef.requiredHeaders) {
    const normReq = normalizeHeaderTitle(reqHeader);
    const foundIdx = normalizedExtracted.indexOf(normReq);

    if (foundIdx === -1) {
      missingHeaders.push(reqHeader);
      warnings.push(`Section wajib "${reqHeader}" tidak ditemukan pada chunk ${chunkDef.id}.`);
    } else {
      if (foundIdx < lastFoundIndex) {
        orderValid = false;
        warnings.push(`Urutan section "${reqHeader}" tidak sesuai pada chunk ${chunkDef.id}.`);
      }
      lastFoundIndex = foundIdx;
    }
  }

  // Check that each required header section has non-empty body content
  for (let i = 0; i < extractedHeaders.length; i++) {
    const currentHeader = extractedHeaders[i];
    const nextHeaderIdx = (i + 1 < extractedHeaders.length) ? extractedHeaders[i + 1].index : markdownText.length;
    const sectionBody = markdownText.substring(currentHeader.index + currentHeader.title.length + 3, nextHeaderIdx).trim();

    if (sectionBody.length < 20) {
      warnings.push(`Section "${currentHeader.title}" memiliki isi teks yang terlalu pendek atau kosong.`);
    }
  }

  // Check for multi-page leakage (especially in ux and pageBreakdown chunks)
  const multiPageCheck = detectMultiPageLeakage(markdownText);
  if (multiPageCheck.leaked) {
    warnings.push(`Terdeteksi rute URL multi-page (${multiPageCheck.matches.slice(0, 3).join(', ')}). Seluruh navigasi harus berupa anchor in-page (#id).`);
  }

  const valid = missingHeaders.length === 0 && !truncationCheck.truncated && orderValid;

  return {
    valid,
    missingHeaders,
    unexpectedHeaders,
    orderValid,
    markdownIntegrityValid: !truncationCheck.truncated,
    likelyTruncated: truncationCheck.truncated,
    warnings: truncationCheck.reason ? [...warnings, truncationCheck.reason] : warnings
  };
}

/**
 * Validates the full combined PRD Markdown document against all 29 canonical section headers.
 */
export function validateFinalDocument(
  fullMarkdown: string
): FinalValidationResult {
  const warnings: string[] = [];
  const passed: string[] = [];
  const missingHeaders: string[] = [];
  const duplicateHeaders: string[] = [];

  const truncationCheck = isLikelyTruncatedMarkdown(fullMarkdown);
  const extractedHeaders = extractHeadersFromMarkdown(fullMarkdown);
  const normalizedExtracted = extractedHeaders.map(h => h.normalized);

  // 1. Check for missing headers across canonical list
  let lastFoundIndex = -1;
  let orderValid = true;

  for (const canonical of CANONICAL_PRD_HEADERS) {
    const normCanonical = normalizeHeaderTitle(canonical);
    const foundIdx = normalizedExtracted.indexOf(normCanonical);

    if (foundIdx === -1) {
      missingHeaders.push(canonical);
      warnings.push(`Dokumen PRD kehilangan section wajib "${canonical}".`);
    } else {
      if (foundIdx < lastFoundIndex) {
        orderValid = false;
        warnings.push(`Section "${canonical}" berada pada urutan yang tidak sesuai.`);
      }
      lastFoundIndex = foundIdx;
    }
  }

  if (missingHeaders.length === 0) {
    passed.push('Seluruh 29 section wajib PRD terisi lengkap.');
  }

  // 2. Check for duplicate major headers
  const seenHeaders = new Set<string>();
  for (const h of extractedHeaders) {
    if (seenHeaders.has(h.normalized)) {
      duplicateHeaders.push(h.title);
      warnings.push(`Terdeteksi duplikasi judul section: "${h.title}".`);
    }
    seenHeaders.add(h.normalized);
  }

  if (duplicateHeaders.length === 0) {
    passed.push('Bebas dari duplikasi judul section.');
  }

  // 3. Check final section requirement
  const lastCanonical = CANONICAL_PRD_HEADERS[CANONICAL_PRD_HEADERS.length - 1];
  const lastCanonicalNorm = normalizeHeaderTitle(lastCanonical);
  const hasFinalInstruction = normalizedExtracted.includes(lastCanonicalNorm);

  if (!hasFinalInstruction) {
    warnings.push(`Dokumen tidak memuat section akhir wajib "${lastCanonical}".`);
  } else {
    passed.push(`Dokumen diakhiri dengan section wajib "${lastCanonical}".`);
  }

  // 4. Check for syntax integrity & truncation
  if (!truncationCheck.truncated) {
    passed.push('Integritas sintaks Markdown valid (bebas dari terpotongnya code fence, tabel, atau diagram).');
  } else {
    warnings.push(`Status integritas Markdown: ${truncationCheck.reason}`);
  }

  // 5. Check for multi-page leakage (single-page contract)
  const multiPageCheck = detectMultiPageLeakage(fullMarkdown);
  if (multiPageCheck.leaked) {
    warnings.push(`Terdeteksi rute URL multi-page (${multiPageCheck.matches.slice(0, 4).join(', ')}). Seluruh navigasi wajib menggunakan anchor link (#id) dalam satu halaman.`);
  } else {
    passed.push('Memenuhi standar Single-Page Only (semua navigasi menggunakan anchor link in-page).');
  }

  // Calculate objective score
  let score = 100;
  score -= missingHeaders.length * 8;
  score -= duplicateHeaders.length * 5;
  if (truncationCheck.truncated) score -= 15;
  if (!orderValid) score -= 5;
  if (multiPageCheck.leaked) score -= Math.min(15, multiPageCheck.matches.length * 4);
  score = Math.max(40, Math.min(100, score));

  const complete = missingHeaders.length === 0 && !truncationCheck.truncated && hasFinalInstruction;

  return {
    complete,
    missingHeaders,
    duplicateHeaders,
    orderValid,
    markdownIntegrityValid: !truncationCheck.truncated,
    likelyTruncated: truncationCheck.truncated,
    score,
    warnings: Array.from(new Set(warnings)),
    passed: Array.from(new Set(passed))
  };
}

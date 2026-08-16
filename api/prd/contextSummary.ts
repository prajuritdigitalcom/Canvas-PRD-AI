/**
 * Helper to build compact context summaries from completed chunks
 * to ensure 100% consistency across sequential chunk generations.
 */

export interface CompactContextSummary {
  projectName: string;
  websiteType: string;
  targetAudienceSummary?: string;
  primaryGoalsSummary?: string;
  sitemapOutline?: string;
  designMoodAndTokens?: string;
  colorPaletteSummary?: string;
}

/**
 * Robustly extracts the full content body of a level-1 (# Heading) section,
 * preserving text even when followed by subheadings (##, ###) or bullet lists.
 */
function extractSectionContent(markdownText: string, headerKeyword: string): string | null {
  if (!markdownText) return null;

  // Split into top-level sections by lines starting with '# ' (single hash only)
  const sections = markdownText.split(/(?:^|\n)(?=#\s+[^#\n])/);

  for (const sec of sections) {
    const trimmed = sec.trim();
    if (!trimmed.startsWith('#')) continue;

    const firstLineEnd = trimmed.indexOf('\n');
    const firstLine = firstLineEnd !== -1 ? trimmed.slice(0, firstLineEnd) : trimmed;
    const body = firstLineEnd !== -1 ? trimmed.slice(firstLineEnd).trim() : '';

    if (firstLine.toLowerCase().includes(headerKeyword.toLowerCase())) {
      if (body) {
        // Clean markdown symbols for a clean single-line/compact summary
        const cleaned = body
          .replace(/```[\s\S]*?```/g, ' ')
          .replace(/[#*`_>|]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return cleaned;
      }
    }
  }

  return null;
}

export function buildCompactContextSummaryText(
  previousChunksMarkdown: Map<string, string>,
  projectName: string,
  websiteType: string
): string {
  const summaryParts: string[] = [];

  summaryParts.push(`**Project Name:** ${projectName} | **Website Type:** ${websiteType}`);

  // 1. Extract Business/Goals context if available (from Chunk 1: business)
  const businessMd = previousChunksMarkdown.get('business');
  if (businessMd) {
    const audienceContent = extractSectionContent(businessMd, 'Target Audience');
    const goalsContent = extractSectionContent(businessMd, 'Website Goals') || extractSectionContent(businessMd, 'Goals');

    if (audienceContent) {
      const trimmedPersona = audienceContent.slice(0, 350);
      summaryParts.push(`**Audience Context:** ${trimmedPersona}...`);
    }
    if (goalsContent) {
      const trimmedGoals = goalsContent.slice(0, 350);
      summaryParts.push(`**Goals & KPIs:** ${trimmedGoals.replace(/\n+/g, ' ')}...`);
    }
  }

  // 2. Extract Sitemap context if available (from Chunk 2: ux)
  const uxMd = previousChunksMarkdown.get('ux');
  if (uxMd) {
    const sitemapContent = extractSectionContent(uxMd, 'Sitemap');
    if (sitemapContent) {
      const trimmedSitemap = sitemapContent.slice(0, 400);
      summaryParts.push(`**Locked Sitemap Outline:** ${trimmedSitemap}...`);
    }
  }

  // 3. Extract Design Tokens & Color Palette if available (from Chunk 3: design)
  const designMd = previousChunksMarkdown.get('design');
  if (designMd) {
    const colorContent = extractSectionContent(designMd, 'Color Palette');
    const typoContent = extractSectionContent(designMd, 'Typography');

    if (colorContent) {
      const trimmedColors = colorContent.slice(0, 350);
      summaryParts.push(`**Locked Color Palette Tokens:** ${trimmedColors}...`);
    }
    if (typoContent) {
      const trimmedTypo = typoContent.slice(0, 350);
      summaryParts.push(`**Locked Typography Scale Tokens:** ${trimmedTypo}...`);
    }
  }

  if (summaryParts.length <= 1) {
    return 'None yet (first chunk).';
  }

  return summaryParts.join('\n\n');
}

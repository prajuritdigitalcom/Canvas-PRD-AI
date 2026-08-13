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
    const personaMatch = businessMd.match(/# Target Audience[^\n]*\n([\s\S]*?)(?=#|$)/i);
    const goalsMatch = businessMd.match(/# Website Goals[^\n]*\n([\s\S]*?)(?=#|$)/i);

    if (personaMatch) {
      const trimmedPersona = personaMatch[1].trim().slice(0, 250);
      summaryParts.push(`**Audience Context:** ${trimmedPersona.replace(/\n+/g, ' ')}...`);
    }
    if (goalsMatch) {
      const trimmedGoals = goalsMatch[1].trim().slice(0, 250);
      summaryParts.push(`**Goals & KPIs:** ${trimmedGoals.replace(/\n+/g, ' ')}...`);
    }
  }

  // 2. Extract Sitemap context if available (from Chunk 2: ux)
  const uxMd = previousChunksMarkdown.get('ux');
  if (uxMd) {
    const sitemapMatch = uxMd.match(/# Sitemap[^\n]*\n([\s\S]*?)(?=#|$)/i);
    if (sitemapMatch) {
      const trimmedSitemap = sitemapMatch[1].trim().slice(0, 300);
      summaryParts.push(`**Locked Sitemap Outline:** ${trimmedSitemap.replace(/\n+/g, ' ')}...`);
    }
  }

  // 3. Extract Design Tokens & Color Palette if available (from Chunk 3: design)
  const designMd = previousChunksMarkdown.get('design');
  if (designMd) {
    const colorMatch = designMd.match(/# Color Palette[^\n]*\n([\s\S]*?)(?=#|$)/i);
    const typoMatch = designMd.match(/# Typography[^\n]*\n([\s\S]*?)(?=#|$)/i);

    if (colorMatch) {
      const trimmedColors = colorMatch[1].trim().slice(0, 300);
      summaryParts.push(`**Locked Color Palette Tokens:** ${trimmedColors.replace(/\n+/g, ' ')}...`);
    }
    if (typoMatch) {
      const trimmedTypo = typoMatch[1].trim().slice(0, 350);
      summaryParts.push(`**Locked Typography Scale Tokens:** ${trimmedTypo.replace(/\n+/g, ' ')}...`);
    }
  }

  if (summaryParts.length <= 1) {
    return 'None yet (first chunk).';
  }

  return summaryParts.join('\n\n');
}

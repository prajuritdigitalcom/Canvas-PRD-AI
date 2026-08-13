/**
 * PRD Chunk Definitions and Canonical Section Headers
 */

export interface PRDChunkDefinition {
  id: string;
  title: string;
  requiredHeaders: string[];
  description: string;
  subChunks?: Array<{
    id: string;
    title: string;
    focusScope: string;
    requiredHeaders: string[];
  }>;
}

export const CANONICAL_PRD_HEADERS: string[] = [
  'Executive Summary',
  'Business Overview',
  'Problem Statement',
  'Project Objectives',
  'Target Audience & User Personas',
  'Brand Positioning & Value Proposition',
  'Competitor Assumptions',
  'Website Goals & Success Metrics',
  'Sitemap & Navigation Structure',
  'Information Architecture',
  'User Flow',
  'Responsive Strategy',
  'Design Direction & Visual System',
  'Color Palette',
  'Typography',
  'Iconography',
  'Imagery Style',
  'UI Components Specifications',
  'Page-by-Page & Section-by-Section Breakdown',
  'Copywriting Guidelines',
  'Call To Action (CTA) Strategy',
  'Forms Specification',
  'Animations Specification',
  'Accessibility (WCAG Compliance)',
  'SEO Strategy',
  'Performance & Speed Strategy',
  'Technical Notes for Gemini Canvas',
  'AI Recommendations (Must Have / Nice To Have / Do / Don\'t)',
  'Final Instruction For Gemini Canvas'
];

export const PRD_CHUNKS: PRDChunkDefinition[] = [
  {
    id: 'business',
    title: 'Business & Strategy',
    description: 'Executive summary, business analysis, audience personas, and project goals.',
    requiredHeaders: [
      'Executive Summary',
      'Business Overview',
      'Problem Statement',
      'Project Objectives',
      'Target Audience & User Personas',
      'Brand Positioning & Value Proposition',
      'Competitor Assumptions',
      'Website Goals & Success Metrics'
    ]
  },
  {
    id: 'ux',
    title: 'Information Architecture & UX',
    description: 'Sitemap structure, information hierarchy, user journey flow, and responsive layout strategy.',
    requiredHeaders: [
      'Sitemap & Navigation Structure',
      'Information Architecture',
      'User Flow',
      'Responsive Strategy'
    ]
  },
  {
    id: 'design',
    title: 'Visual Design System',
    description: 'Visual direction, color palette with contrast rules, typography scale tokens, iconography, imagery, and UI components.',
    requiredHeaders: [
      'Design Direction & Visual System',
      'Color Palette',
      'Typography',
      'Iconography',
      'Imagery Style',
      'UI Components Specifications'
    ]
  },
  {
    id: 'pageBreakdown',
    title: 'Detailed Page Specification',
    description: 'Exhaustive section-by-section breakdown for every page, referencing design tokens and color contrast direction.',
    requiredHeaders: [
      'Page-by-Page & Section-by-Section Breakdown'
    ],
    subChunks: [
      {
        id: 'pageBreakdown-primary',
        title: 'Primary Page (Home Page Breakdown)',
        focusScope: 'Focus strictly on Home Page sections: Hero, Partners/Clients, About/Story, Core Services/Products, Benefits, Main CTA.',
        requiredHeaders: [
          'Page-by-Page & Section-by-Section Breakdown'
        ]
      },
      {
        id: 'pageBreakdown-secondary',
        title: 'Secondary Pages & Footer Modals Breakdown',
        focusScope: 'Focus on Secondary Pages (About, Services, Portfolio, Contact, FAQ) AND Footer Modals (Terms & Conditions, Privacy Policy text).',
        requiredHeaders: [
          'Page-by-Page & Section-by-Section Breakdown'
        ]
      }
    ]
  },
  {
    id: 'technical',
    title: 'Conversion, Technical & Final Canvas Instructions',
    description: 'Copywriting, CTAs, forms, animation pacing, accessibility, SEO, performance, technical notes, AI recommendations, and copyable Gemini Canvas instruction.',
    requiredHeaders: [
      'Copywriting Guidelines',
      'Call To Action (CTA) Strategy',
      'Forms Specification',
      'Animations Specification',
      'Accessibility (WCAG Compliance)',
      'SEO Strategy',
      'Performance & Speed Strategy',
      'Technical Notes for Gemini Canvas',
      'AI Recommendations (Must Have / Nice To Have / Do / Don\'t)',
      'Final Instruction For Gemini Canvas'
    ]
  }
];

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
    description: 'Peta anchor navigation dalam satu halaman, hierarki section, alur scroll/interaksi pengguna, dan strategi responsive — SEMUA dalam konteks satu halaman HTML tunggal, bukan multi-halaman.',
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
    title: 'Detailed Section-by-Section Specification',
    description: 'Exhaustive section-by-section breakdown untuk SATU halaman landing page, referencing design tokens dan color contrast direction.',
    requiredHeaders: [
      'Page-by-Page & Section-by-Section Breakdown'
    ],
    subChunks: [
      {
        id: 'pageBreakdown-upper',
        title: 'Upper-Page Sections (Hero to Core Offering)',
        focusScope: 'Focus strictly on the UPPER portion of the single landing page: Hero, Trust/Social Proof Bar, About/Story, Core Services or Products, Value Proposition/Benefits. These are sections WITHIN the same page as everything in the other sub-chunk — do not treat this as a separate page.',
        requiredHeaders: [
          'Page-by-Page & Section-by-Section Breakdown'
        ]
      },
      {
        id: 'pageBreakdown-lower',
        title: 'Lower-Page Sections (Process to Footer)',
        focusScope: 'Focus on the LOWER portion of the SAME single landing page: Process/How it Works, Portfolio/Gallery, Testimonials, Pricing/Packages (if relevant), FAQ, Final CTA/Form, Footer — including in-page legal modals (Terms & Conditions, Privacy Policy) as MODAL content, not separate pages.',
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

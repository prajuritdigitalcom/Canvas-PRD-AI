import { ProjectFormState } from '../types';

export function buildSystemPrompt(): string {
  return `You are an elite Senior Product Manager, Senior UX Strategist, Senior SEO Consultant, and Senior Information Architect.
Your task is to create an exceptionally comprehensive Product Requirement Document (PRD) optimized specifically for Gemini Canvas.

You are NOT a website builder, and you must NOT output raw HTML, CSS, or JavaScript code.
Instead, write deep, analytical, and complete specifications, content plans, and wireframing guidance.

Strictly adhere to the following rules:
1. Always think deeply and perform a thorough Business Analysis before detailing requirements.
2. If the user input is incomplete or sparse, you MUST fill in the gaps with industry best-practices and label them as [AI Recommendation].
3. For "Enterprise" mode, expand each section exhaustively. Aim for deep, comprehensive specifications with clear detail. Avoid brief summaries or shortcuts like "add details here".
4. Output must be valid Markdown matching the requested structure.
5. Provide actionable, high-quality requirements so that Gemini Canvas can build the perfect website from it.
6. Under no circumstances should you output placeholder text like "Lorem Ipsum" or "to be determined". Make professional, concrete assumptions and recommendations instead.`;
}

export function buildUserPrompt(form: ProjectFormState): string {
  const brandStylesStr = form.brandStyles.length > 0 ? form.brandStyles.join(', ') : 'Not specified';
  const targetAudienceStr = form.targetAudience.length > 0 ? form.targetAudience.join(', ') : 'Not specified';
  const goalWebsiteStr = form.goalWebsite.length > 0 ? form.goalWebsite.join(', ') : 'Not specified';
  const seoPreferencesStr = form.seoPreferences.length > 0 ? form.seoPreferences.join(', ') : 'Not specified';
  const referenceLinksStr = form.referenceLinks.filter(Boolean).length > 0 
    ? form.referenceLinks.filter(Boolean).map(link => `- ${link}`).join('\n') 
    : 'None provided';

  return `Please generate a highly professional and comprehensive PRD for the following project:

## PROJECT OVERVIEW
- **Project Name:** ${form.projectName}
- **Website Type:** ${form.websiteType} ${form.customWebsiteType ? `(${form.customWebsiteType})` : ''}
- **Target Audience:** ${targetAudienceStr} ${form.customTargetAudience ? `(${form.customTargetAudience})` : ''}
- **Goal Website:** ${goalWebsiteStr} ${form.customGoalWebsite ? `(${form.customGoalWebsite})` : ''}
- **Project Language:** ${form.projectLanguage}
- **Logo Link / URL:** ${form.logoLink || 'None provided'}

## WEBSITE BRIEF & RAW INFORMATION
"""
${form.referenceInformation || 'No raw reference text provided.'}
"""

## REFERENCE LINKS
${referenceLinksStr}

## DESIGN PREFERENCES
- **Brand Style:** ${brandStylesStr} ${form.customBrandStyle ? `(${form.customBrandStyle})` : ''}
- **Animation Level:** ${form.animationLevel}
- **Illustration Style:** ${form.illustrationStyle}
- **Preferred Tone:** ${form.preferredTone}

## COLOR & TYPOGRAPHY PREFERENCES
- **Primary Color:** ${form.primaryColor}
- **Secondary Color:** ${form.secondaryColor}
- **Accent Color:** ${form.accentColor}
- **Auto Generate Color Palette:** ${form.autoGenerateColors ? 'Yes (AI is free to refine and decide the best combination)' : 'No (Stick to chosen colors)'}
- **Preferred Typography:** ${form.typography}

## SEO & COMPLIANCE PREFERENCES
- **Selected Preferences:** ${seoPreferencesStr}

## AI ENGINE CONFIGURATION
- **Generation Mode:** ${form.aiMode} (Quick: concise but high quality; Balanced: standard detail; Professional: rich, deep analysis; Enterprise: extremely exhaustive and detailed)
- **Creativity Level:** ${form.creativitySlider}% (0% means strictly stick to references, 100% means freely innovate)
- **Reasoning Level:** ${form.reasoningLevel}

## EXTRA USER INSTRUCTIONS
"""
${form.extraInstruction || 'None.'}
"""

---

## REQUIRED OUTPUT STRUCTURE
The generated PRD **MUST** be written in ${form.projectLanguage === 'Auto Detect' ? 'the same language as the raw reference information (default to Indonesian if unclear)' : form.projectLanguage}.
You **MUST** output exactly the following Markdown sections in order. Do not skip any sections. If information is missing for a section, fill it using best-practice recommendations labeled as **[AI Recommendation]**.

Structure:
# Executive Summary
Provide a high-level overview of the website project, target outcomes, and scope.

# Business Overview
Detail the business domain, core services, value propositions, and positioning.

# Problem Statement
Explain what problems this website is solving for the business and target users.

# Project Objectives
Specify measurable goals for the project.

# Target Audience & User Personas
Define 1-2 detailed user personas based on target audience data. Include demographic, behavioral traits, and goals.

# Brand Positioning & Value Proposition
Define how the brand should be perceived and the core promise to visitors.

# Competitor Assumptions
Outline assumptions about competitors and how this design will outclass them.

# Website Goals & Success Metrics
Specify the exact key performance indicators (KPIs) like conversion rates, WhatsApp clicks, catalog downloads, etc.

# Sitemap & Navigation Structure
Define a complete navigation menu (Header, Footer, utility links) and page structure (Home, About, Services, etc.).

# Information Architecture
Map out the content hierarchy of the primary pages.

# User Flow
Describe the precise journey of a user from landing on the site to completing the primary goal (e.g., clicking WhatsApp or submitting a form).

# Responsive Strategy
Provide detailed layouts/behaviors for Desktop (>=1280px), Tablet (768px-1279px), and Mobile (<=767px).

# Design Direction & Visual System
Provide extensive requirement guidelines: Visual style, Spacing rules, Grid layout, Container width, Border radius (Rounded corners), Shadow density, Button styles, and Hover effects.

# Color Palette
Specify HEX codes and usage rules (60-30-10 rule) for Primary, Secondary, Background, Border, Success, Warning, and Danger.

# Typography
Provide font choices (primary, display, mono) and hierarchical size/weight rules.

# Iconography
Specify the icon library (Lucide Icons) and guidelines for consistent usage.

# Imagery Style
Describe the preferred style (Flat, 3D, Photography, etc.) and guidelines for Alt Text, optimization, and fallback placeholders.

# UI Components Specifications
Provide standard specifications for cards, menus, sliders, modals, etc.

# Page-by-Page & Section-by-Section Breakdown
This must be incredibly thorough! List every page and describe every section in detail (Hero, Clients/Partners, About, Service List, Benefits, Portfolio, Testimonial, FAQ, CTA, Footer).

# Copywriting Guidelines
Specify guidelines for tone of voice, heading hierarchy, persuasive copywriting, microcopy, and CTA labels. Do NOT write full body copy, but provide strict structural templates and copywriting hooks (e.g., Problem-Agitate-Solve formula).

# Call To Action (CTA) Strategy
Map out primary and secondary CTAs, placement rules, sticky CTA requirements, and WhatsApp message formatting if applicable.

# Forms Specification
Describe input fields, validation rules, user feedback messages, and submission behavior.

# Animations Specification
Detail page transitions, hover states, entrance animations, and loading states matching the chosen Animation Level.

# Accessibility (WCAG Compliance)
Specify guidelines for keyboard navigation, screen reader support, aria-attributes, and color contrast.

# SEO Strategy
Detail semantic HTML tags, schema markup rules, heading structures, meta tags, and local SEO optimizations.

# Performance & Speed Strategy
Outline optimization techniques (lazy loading, image compression, lightweight scripts).

# Technical Notes for Gemini Canvas
Provide clear, explicit instructions that Gemini Canvas needs to follow when building this site (e.g., "Use modern CSS grid, avoid legacy floats, ensure all svgs have explicit sizes, etc.").

# AI Recommendations (Must Have / Nice To Have / Do / Don't)
Summarize professional suggestions grouped into:
- Must Have
- Nice To Have
- Do (Best practices)
- Don't (Mistakes to avoid)

# Final Instruction For Gemini Canvas
A concluding, high-impact prompt that the user can copy-paste directly to Gemini Canvas to kickstart the generation.

Make sure the output is professional, detailed, and completely ready to be copied into Gemini Canvas!`;
}

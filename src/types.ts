export type WebsiteType =
  | 'Company Profile'
  | 'Landing Page'
  | 'Agency'
  | 'Portfolio'
  | 'Startup'
  | 'SaaS'
  | 'Restaurant'
  | 'Law Firm'
  | 'Medical'
  | 'Education'
  | 'Travel'
  | 'Construction'
  | 'Manufacturing'
  | 'UMKM'
  | 'Government'
  | 'NGO'
  | 'Blog'
  | 'Marketplace'
  | 'Personal Branding'
  | 'Event'
  | 'Wedding'
  | 'Real Estate'
  | 'Finance'
  | 'Insurance'
  | 'Technology'
  | 'Custom';

export type AnimationLevel = 'None' | 'Minimal' | 'Medium' | 'Premium' | 'Luxury' | 'WOW';

export type IllustrationStyle =
  | 'Flat'
  | '3D'
  | 'Photography'
  | 'AI Generated'
  | 'Icons Only'
  | 'Corporate'
  | 'Minimal';

export type PreferredTone =
  | 'Professional'
  | 'Friendly'
  | 'Premium'
  | 'Luxury'
  | 'Corporate'
  | 'Casual'
  | 'Creative'
  | 'Persuasive';

export type TypographyOption =
  | 'Inter'
  | 'Poppins'
  | 'DM Sans'
  | 'Plus Jakarta Sans'
  | 'Roboto'
  | 'Manrope'
  | 'Auto';

export type AIMode = 'Quick' | 'Balanced' | 'Professional' | 'Enterprise';

export type ReasoningLevel = 'Basic' | 'Standard' | 'Advanced' | 'Maximum';

export type GenerationMode = 'auto' | 'manual';

export interface AIAnalysisResult {
  confidence: {
    businessAnalysis: number;
    targetAudience: number;
    brandStyle: number;
    seoStrategy: number;
  };
  assumptions: string[];
  quickReview: {
    businessType: string;
    targetAudience: string;
    websiteGoal: string;
    brandStyle: string;
    cta: string;
    seoFocus: string;
    estimatedPages: number;
    estimatedSections: number;
  };
  mappedFields: {
    targetAudience: string[];
    goalWebsite: string[];
    brandStyles: string[];
    animationLevel: AnimationLevel;
    illustrationStyle: IllustrationStyle;
    preferredTone: PreferredTone;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    autoGenerateColors: boolean;
    typography: TypographyOption;
    seoPreferences: string[];
    aiMode: AIMode;
    creativitySlider: number;
    reasoningLevel: ReasoningLevel;
  };
}

export interface ProjectFormState {
  generationMode?: GenerationMode;
  // Project Information
  projectName: string;
  websiteType: WebsiteType;
  customWebsiteType?: string;
  targetAudience: string[];
  customTargetAudience?: string;
  goalWebsite: string[];
  customGoalWebsite?: string;
  projectLanguage: string;
  logoLink?: string;

  // Website Information
  referenceInformation: string;
  referenceLinks: string[];

  // Design Preferences
  brandStyles: string[];
  customBrandStyle?: string;
  animationLevel: AnimationLevel;
  illustrationStyle: IllustrationStyle;
  preferredTone: PreferredTone;

  // Color Preferences
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  autoGenerateColors: boolean;

  // Typography
  typography: TypographyOption;

  // SEO Preferences
  seoPreferences: string[];

  // AI Preferences
  aiMode: AIMode;
  creativitySlider: number; // 0 to 100
  reasoningLevel: ReasoningLevel;

  // Extra Instruction
  extraInstruction: string;
}

export interface PRDGenerateResponse {
  markdown: string;
  readyScore: number;
  scoreReasons: {
    passed: string[];
    warnings: string[];
  };
  wordCount: number;
  readingTime: number;
}

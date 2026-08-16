import { AIMode, GenerationProfile, ReasoningLevel } from '../types';

export interface GenerationProfileItem {
  id: GenerationProfile;
  label: string;
  description: string;
  aiMode: AIMode;
  reasoningLevel: ReasoningLevel;
  creativitySlider: number;
}

export const GENERATION_PROFILES: GenerationProfileItem[] = [
  {
    id: 'cepat',
    label: '⚡ Cepat',
    description: 'Draf awal & iterasi cepat, brief simpel',
    aiMode: 'Quick',
    reasoningLevel: 'Standard',
    creativitySlider: 50
  },
  {
    id: 'seimbang',
    label: '⚖️ Seimbang (default)',
    description: 'PRD harian, kualitas tinggi & stabil',
    aiMode: 'Professional',
    reasoningLevel: 'Standard',
    creativitySlider: 60
  },
  {
    id: 'analisis-mendalam',
    label: '🔍 Analisis Mendalam',
    description: 'Project kompleks, butuh penalaran lebih matang per section',
    aiMode: 'Professional',
    reasoningLevel: 'Advanced',
    creativitySlider: 65
  }
];

export function resolveAIPreferencesFromProfile(profileId?: GenerationProfile) {
  const found = GENERATION_PROFILES.find(p => p.id === profileId);
  const fallback = GENERATION_PROFILES.find(p => p.id === 'seimbang')!;
  const p = found || fallback;
  return {
    aiMode: p.aiMode,
    reasoningLevel: p.reasoningLevel,
    creativitySlider: p.creativitySlider
  };
}

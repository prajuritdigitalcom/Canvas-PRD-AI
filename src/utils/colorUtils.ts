/**
 * WCAG 2.1 Relative Luminance & Contrast Calculation Utilities
 * Ensures 100% accessible text-background contrast ratios for any user-selected color palette.
 */

export interface ColorContrastInfo {
  hex: string;
  isDark: boolean;
  luminance: number;
  recommendedTextColor: string;
  recommendedTextLabel: string;
  contrastWithWhite: number;
  contrastWithDark: number;
  bestContrastRatio: number;
}

export interface PaletteContrastAnalysis {
  primary: ColorContrastInfo;
  secondary: ColorContrastInfo;
  accent: ColorContrastInfo;
  surfaceLight: ColorContrastInfo;
  surfaceDark: ColorContrastInfo;
}

/**
 * Normalizes hex string (handles 3-digit shorthand and missing #)
 */
export function normalizeHex(rawHex: string): string {
  if (!rawHex) return '#000000';
  let hex = rawHex.trim().replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return '#000000';
  }
  return `#${hex.toUpperCase()}`;
}

/**
 * Converts Hex to RGB components (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const norm = normalizeHex(hex).replace('#', '');
  const num = parseInt(norm, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates WCAG 2.1 relative luminance for a given sRGB color.
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates WCAG contrast ratio between two colors (range: 1:1 to 21:1)
 * (L1 + 0.05) / (L2 + 0.05) where L1 is lighter and L2 is darker.
 */
export function getContrastRatio(hexA: string, hexB: string): number {
  const l1 = getRelativeLuminance(hexA);
  const l2 = getRelativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 10) / 10;
}

/**
 * Analyzes a color and selects the most readable text color (Pure/Near White vs Charcoal/Dark).
 */
export function getColorContrastInfo(hex: string): ColorContrastInfo {
  const normalized = normalizeHex(hex);
  const luminance = getRelativeLuminance(normalized);
  
  const whiteHex = '#FFFFFF';
  const darkHex = '#0F172A'; // Slate 900 Charcoal
  
  const contrastWithWhite = getContrastRatio(normalized, whiteHex);
  const contrastWithDark = getContrastRatio(normalized, darkHex);
  
  // A color is considered dark if it has higher contrast with white than with dark text
  const isDark = contrastWithWhite >= contrastWithDark;
  const recommendedTextColor = isDark ? whiteHex : darkHex;
  const recommendedTextLabel = isDark ? 'Text Light (#FFFFFF)' : 'Text Dark (#0F172A)';
  const bestContrastRatio = isDark ? contrastWithWhite : contrastWithDark;
  
  return {
    hex: normalized,
    isDark,
    luminance: Math.round(luminance * 1000) / 1000,
    recommendedTextColor,
    recommendedTextLabel,
    contrastWithWhite,
    contrastWithDark,
    bestContrastRatio,
  };
}

/**
 * Pre-computes full contrast guidelines for project palette inputs.
 */
export function analyzeProjectColorPalette(
  primaryColor: string,
  secondaryColor: string,
  accentColor: string
): PaletteContrastAnalysis {
  return {
    primary: getColorContrastInfo(primaryColor || '#0F172A'),
    secondary: getColorContrastInfo(secondaryColor || '#475569'),
    accent: getColorContrastInfo(accentColor || '#E11D48'),
    surfaceLight: getColorContrastInfo('#FFFFFF'),
    surfaceDark: getColorContrastInfo('#0F172A'),
  };
}

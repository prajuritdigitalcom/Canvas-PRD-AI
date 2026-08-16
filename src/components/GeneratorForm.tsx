import React, { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import { ProjectFormState, WebsiteType, AnimationLevel, IllustrationStyle, PreferredTone, TypographyOption, AIMode, ReasoningLevel, AIAnalysisResult, GenerationProfile } from '../types';
import { DESIGN_MOODS, DESIGN_DENSITIES } from '../data/designMoods';
import { DEMO_BRIEFS } from '../data/demoBriefs';
import { GENERATION_PROFILES } from '../data/generationProfiles';
import { 
  Sparkles, FileText, Globe, Eye, Palette, Search, Cpu, MessageSquare, 
  Plus, Trash2, Upload, HelpCircle, Check, Info, Lightbulb, AlertTriangle, ChevronRight,
  AlignLeft, ShieldCheck, ChevronDown, ExternalLink, X
} from 'lucide-react';

interface GeneratorFormProps {
  formState: ProjectFormState;
  setFormState: React.Dispatch<React.SetStateAction<ProjectFormState>>;
  onGenerate: () => void;
  onReset: () => void;
  isGenerating: boolean;
  activeStepIndex: number;
  analysisResult: AIAnalysisResult | null;
  setAnalysisResult: (result: AIAnalysisResult | null) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  analysisStepIndex: number;
}

const WEBSITE_TYPES: WebsiteType[] = [
  'Company Profile', 'E-Commerce', 'Landing Page', 'Agency', 'Portfolio', 'Startup', 'SaaS', 
  'Restaurant', 'Law Firm', 'Medical', 'Education', 'Travel', 'Construction', 
  'Manufacturing', 'UMKM', 'Government', 'NGO', 'Blog', 'Marketplace', 
  'Personal Branding', 'Event', 'Wedding', 'Real Estate', 'Finance', 'Insurance', 
  'Technology', 'Custom'
];

const TARGET_AUDIENCES = [
  'Business Owner', 'Corporate', 'Investor', 'Parents', 'Students', 'Doctors', 
  'Distributor', 'Retail', 'Government', 'Public', 'Custom'
];

const GOAL_WEBSITES = [
  'Lead Generation', 'WhatsApp', 'Sales', 'Brand Awareness', 'Appointment', 
  'Booking', 'Download Catalog', 'Registration', 'Recruitment', 'Portfolio', 
  'Education', 'Information', 'Customer Support', 'Newsletter', 'Custom'
];

const ANIMATION_LEVELS: AnimationLevel[] = ['None', 'Minimal', 'Medium', 'Premium', 'Luxury', 'WOW'];
const ILLUSTRATION_STYLES: IllustrationStyle[] = ['Flat', '3D', 'Photography', 'AI Generated', 'Icons Only', 'Corporate', 'Minimal'];
const PREFERRED_TONES: PreferredTone[] = ['Professional', 'Friendly', 'Premium', 'Luxury', 'Corporate', 'Casual', 'Creative', 'Persuasive'];

interface TypographyPairing {
  id: string;
  label: string;
  heading: TypographyOption;
  body: TypographyOption;
  bestFor: string;
}

const TYPOGRAPHY_PAIRINGS: TypographyPairing[] = [
  { id: 'modern-clean', label: 'Modern & Clean', heading: 'Inter', body: 'Inter', bestFor: 'Modern, Minimalist, Corporate, SaaS' },
  { id: 'startup-bold', label: 'Startup Bold', heading: 'Sora', body: 'Inter', bestFor: 'Startup, Technology' },
  { id: 'elegant-serif', label: 'Elegant Serif', heading: 'Playfair Display', body: 'DM Sans', bestFor: 'Elegant, Luxury' },
  { id: 'luxury-refined', label: 'Luxury Refined', heading: 'Cormorant Garamond', body: 'Poppins', bestFor: 'Luxury, Editorial' },
  { id: 'creative-display', label: 'Creative Display', heading: 'Unbounded', body: 'Manrope', bestFor: 'Creative, Bold Branding' },
  { id: 'tech-saas', label: 'Tech / SaaS', heading: 'Space Grotesk', body: 'Inter', bestFor: 'Technology, Apple Style, Stripe Style' },
  { id: 'developer', label: 'Developer / Technical', heading: 'JetBrains Mono', body: 'Work Sans', bestFor: 'Technology (dev tools / API product)' },
  { id: 'warm-friendly', label: 'Warm & Friendly', heading: 'Poppins', body: 'DM Sans', bestFor: 'Friendly, Professional, UMKM' },
  { id: 'playful-round', label: 'Playful & Round', heading: 'Quicksand', body: 'Nunito', bestFor: 'Casual, Community, Kids' },
  { id: 'editorial-serif', label: 'Editorial Serif', heading: 'Fraunces', body: 'Lora', bestFor: 'Blog, Portfolio, Personal Branding' },
  { id: 'auto', label: 'Auto (AI yang tentukan)', heading: 'Auto', body: 'Auto', bestFor: 'Biarkan AI memilih sesuai brand style & mood' }
];

const ANALYSIS_STEPS = [
  'Membaca seluruh referensi',
  'Mengidentifikasi jenis bisnis',
  'Menentukan target pasar',
  'Menentukan tujuan utama website',
  'Mengidentifikasi produk dan layanan',
  'Menentukan Unique Selling Proposition (USP)',
  'Menentukan gaya visual yang paling sesuai',
  'Menentukan struktur halaman',
  'Menentukan urutan setiap section',
  'Menentukan strategi CTA',
  'Menentukan strategi SEO',
  'Menentukan strategi copywriting',
  'Menentukan strategi UX',
  'Menentukan kebutuhan teknis',
  'Menyusun PRD final'
];

function extractHex(token: string): string | null {
  const match = token.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/);
  return match ? match[0] : null;
}

export default function GeneratorForm({
  formState,
  setFormState,
  onGenerate,
  onReset,
  isGenerating,
  activeStepIndex,
  analysisResult,
  setAnalysisResult,
  isAnalyzing,
  onAnalyze,
  analysisStepIndex,
}: GeneratorFormProps) {
  const [newLink, setNewLink] = useState('');
  const [fileError, setFileError] = useState('');
  const [previewMoodId, setPreviewMoodId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const demoDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setIsFontDropdownOpen(false);
      }
      if (demoDropdownRef.current && !demoDropdownRef.current.contains(event.target as Node)) {
        setIsDemoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditAnalysis = () => {
    if (analysisResult) {
      setFormState(prev => ({
        ...prev,
        generationMode: 'manual',
        targetAudience: prev.targetAudience.length > 0 ? prev.targetAudience : analysisResult.mappedFields.targetAudience,
        goalWebsite: prev.goalWebsite.length > 0 ? prev.goalWebsite : analysisResult.mappedFields.goalWebsite,
        designMoodId: prev.designMoodId !== 'auto' ? prev.designMoodId : analysisResult.mappedFields.designMoodId,
        animationLevel: prev.animationLevel !== 'Medium' ? prev.animationLevel : analysisResult.mappedFields.animationLevel,
        illustrationStyle: prev.illustrationStyle !== 'Icons Only' ? prev.illustrationStyle : analysisResult.mappedFields.illustrationStyle,
        preferredTone: prev.preferredTone !== 'Professional' ? prev.preferredTone : analysisResult.mappedFields.preferredTone,
        primaryColor: prev.primaryColor !== '#fe4c6f' ? prev.primaryColor : analysisResult.mappedFields.primaryColor,
        secondaryColor: prev.secondaryColor !== '#0f172a' ? prev.secondaryColor : analysisResult.mappedFields.secondaryColor,
        accentColor: prev.accentColor !== '#f59e0b' ? prev.accentColor : analysisResult.mappedFields.accentColor,
        autoGenerateColors: prev.autoGenerateColors !== true ? prev.autoGenerateColors : analysisResult.mappedFields.autoGenerateColors,
        headingFont: prev.headingFont !== 'Inter' ? prev.headingFont : analysisResult.mappedFields.headingFont,
        bodyFont: prev.bodyFont !== 'Inter' ? prev.bodyFont : analysisResult.mappedFields.bodyFont,
        metaTitle: prev.metaTitle.trim() !== '' ? prev.metaTitle : analysisResult.mappedFields.metaTitle,
        metaDescription: prev.metaDescription.trim() !== '' ? prev.metaDescription : analysisResult.mappedFields.metaDescription,
        generationProfile: prev.generationProfile !== 'seimbang' ? prev.generationProfile : analysisResult.mappedFields.generationProfile
      }));
    }
  };

  // Load a demo project brief by ID
  const handleLoadDemo = (demoId?: string) => {
    const target = DEMO_BRIEFS.find(d => d.id === (demoId || 'company-profile')) || DEMO_BRIEFS[0];
    if (target) {
      setFormState(target.data);
    }
  };

  // Handle multi-select inputs (Target Audience, Goal Website)
  const toggleArrayItem = (field: 'targetAudience' | 'goalWebsite', item: string) => {
    setFormState(prev => {
      const arr = prev[field];
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...arr, item] };
      }
    });
  };

  // Add reference links
  const handleAddLink = () => {
    if (newLink.trim()) {
      setFormState(prev => ({
        ...prev,
        referenceLinks: [...prev.referenceLinks, newLink.trim()]
      }));
      setNewLink('');
    }
  };

  // Remove reference link
  const handleRemoveLink = (index: number) => {
    setFormState(prev => ({
      ...prev,
      referenceLinks: prev.referenceLinks.filter((_, idx) => idx !== index)
    }));
  };

  // Drag and drop or file upload processing with Word document parsing support
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isDocx = file.name.endsWith('.docx');
    const isTxtOrMd = file.name.endsWith('.txt') || file.name.endsWith('.md');

    if (!isDocx && !isTxtOrMd) {
      setFileError('Format file harus berupa .txt, .md, atau .docx (Word)');
      return;
    }

    setFileError('');

    if (isDocx) {
      // Parse .docx using mammoth
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (arrayBuffer) {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer });
            const extractedText = result.value;
            if (extractedText && extractedText.trim()) {
              setFormState(prev => ({
                ...prev,
                referenceInformation: prev.referenceInformation
                  ? `${prev.referenceInformation}\n\n=== Lampiran Dokumen Word: ${file.name} ===\n${extractedText}`
                  : extractedText
              }));
            } else {
              setFileError('Dokumen Word kosong atau tidak dapat diekstrak.');
            }
          } catch (err: any) {
            console.error('Gagal memproses file docx:', err);
            setFileError(`Gagal mengekstrak dokumen Word: ${err?.message || 'Pastikan file tidak terenkripsi.'}`);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Parse standard text/markdown files
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setFormState(prev => ({
            ...prev,
            referenceInformation: prev.referenceInformation 
              ? `${prev.referenceInformation}\n\n=== Lampiran File: ${file.name} ===\n${text}`
              : text
          }));
        }
      };
      reader.readAsText(file);
    }
  };

  // Progress steps indicators
  const stepsList = [
    'Reading Reference...',
    'Analyzing Business...',
    'Creating Architecture...',
    'Planning UX Layout...',
    'SEO Engineering...',
    'Generating Complete PRD...',
    'Formatting Markdown...',
    'Done'
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 2-Column Section: Demo Brief & Mode Perancangan PRD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Load Demo Brief */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-primary rounded-xl shrink-0">
              <Lightbulb className="w-5 h-5 animate-bounce text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-display font-bold text-zinc-900 dark:text-white">
                Coba Dengan Contoh Brief Proyek
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                Klik untuk mengisi form dengan draf contoh sesuai kategori bisnis Anda: Company Profile, E-Commerce, atau SaaS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 sm:border-0 sm:pt-0 sm:justify-end relative" ref={demoDropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:text-primary dark:hover:text-primary font-bold text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm cursor-pointer hover:border-rose-200 dark:hover:border-rose-900/40 transition-all flex items-center gap-2 shrink-0"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Brief</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDemoDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDemoDropdownOpen && (
                <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Pilih Kategori Contoh Brief:
                    </p>
                  </div>
                  {DEMO_BRIEFS.map((brief) => {
                    const isSelected = formState.projectName === brief.data.projectName;
                    return (
                      <button
                        key={brief.id}
                        type="button"
                        onClick={() => {
                          handleLoadDemo(brief.id);
                          setIsDemoDropdownOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border ${
                          isSelected 
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60' 
                            : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-200 dark:hover:border-zinc-700/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${brief.badgeColor}`}>
                            {brief.category}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Terpasang
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-0.5">
                          {brief.title}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {brief.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {(formState.projectName.trim() !== '' || formState.referenceInformation.trim() !== '' || (formState.logoLink && formState.logoLink.trim() !== '')) && (
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-100 dark:border-rose-900/40 shadow-sm cursor-pointer transition-all shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Mode Perancangan PRD */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-primary rounded-xl shrink-0">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-display font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                Mode Perancangan PRD
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                Buat PRD secara manual atau gunakan AI untuk menyusunnya secara otomatis.
              </p>
            </div>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl shrink-0 self-start sm:self-end pt-1">
            <button
              type="button"
              onClick={() => setFormState(prev => ({ ...prev, generationMode: 'auto' }))}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                formState.generationMode === 'auto' || !formState.generationMode
                  ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm border border-zinc-200/40 dark:border-zinc-800'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              AI Auto Mode
            </button>
            <button
              type="button"
              onClick={() => {
                if (analysisResult) {
                  setFormState(prev => ({
                    ...prev,
                    generationMode: 'manual',
                    targetAudience: prev.targetAudience.length > 0 ? prev.targetAudience : analysisResult.mappedFields.targetAudience,
                    goalWebsite: prev.goalWebsite.length > 0 ? prev.goalWebsite : analysisResult.mappedFields.goalWebsite,
                    designMoodId: prev.designMoodId !== 'auto' ? prev.designMoodId : analysisResult.mappedFields.designMoodId,
                    animationLevel: prev.animationLevel !== 'Medium' ? prev.animationLevel : analysisResult.mappedFields.animationLevel,
                    illustrationStyle: prev.illustrationStyle !== 'Icons Only' ? prev.illustrationStyle : analysisResult.mappedFields.illustrationStyle,
                    preferredTone: prev.preferredTone !== 'Professional' ? prev.preferredTone : analysisResult.mappedFields.preferredTone,
                    primaryColor: prev.primaryColor !== '#fe4c6f' ? prev.primaryColor : analysisResult.mappedFields.primaryColor,
                    secondaryColor: prev.secondaryColor !== '#0f172a' ? prev.secondaryColor : analysisResult.mappedFields.secondaryColor,
                    accentColor: prev.accentColor !== '#f59e0b' ? prev.accentColor : analysisResult.mappedFields.accentColor,
                    autoGenerateColors: prev.autoGenerateColors !== true ? prev.autoGenerateColors : analysisResult.mappedFields.autoGenerateColors,
                    headingFont: prev.headingFont !== 'Inter' ? prev.headingFont : analysisResult.mappedFields.headingFont,
                    bodyFont: prev.bodyFont !== 'Inter' ? prev.bodyFont : analysisResult.mappedFields.bodyFont,
                    metaTitle: prev.metaTitle.trim() !== '' ? prev.metaTitle : analysisResult.mappedFields.metaTitle,
                    metaDescription: prev.metaDescription.trim() !== '' ? prev.metaDescription : analysisResult.mappedFields.metaDescription,
                    generationProfile: prev.generationProfile !== 'seimbang' ? prev.generationProfile : analysisResult.mappedFields.generationProfile
                  }));
                } else {
                  setFormState(prev => ({ ...prev, generationMode: 'manual' }));
                }
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                formState.generationMode === 'manual'
                  ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm border border-zinc-200/40 dark:border-zinc-800'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Manual Mode
            </button>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="space-y-6">
        {/* Card 1: Informasi Proyek */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              1. Informasi Proyek
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Nama Proyek <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={formState.projectName}
                onChange={e => setFormState(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Misal: PT ABC Jaya Indonesia"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* Website Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Tipe Website <span className="text-primary">*</span>
              </label>
              <select
                value={formState.websiteType}
                onChange={e => setFormState(prev => ({ ...prev, websiteType: e.target.value as WebsiteType }))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
              >
                {WEBSITE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Custom Website Type (conditional) */}
            {formState.websiteType === 'Custom' && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                  Sebutkan Tipe Website Kustom Anda
                </label>
                <input
                  type="text"
                  value={formState.customWebsiteType || ''}
                  onChange={e => setFormState(prev => ({ ...prev, customWebsiteType: e.target.value }))}
                  placeholder="Misal: Portal Komunitas Pertanian Organik"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
                />
              </div>
            )}

            {/* Project Language */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Pilihan Bahasa
              </label>
              <select
                value={formState.projectLanguage}
                onChange={e => setFormState(prev => ({ ...prev, projectLanguage: e.target.value }))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
              >
                <option value="Indonesia">Bahasa Indonesia</option>
                <option value="English">English (AS/UK)</option>
                <option value="Auto Detect">Auto Detect (Ikuti Brief)</option>
              </select>
            </div>

            {/* Link Logo */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Link Logo (URL)</span>
                {formState.logoLink && (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 font-sans normal-case">
                    <Check className="w-3 h-3" /> Terisi
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formState.logoLink || ''}
                  onChange={e => setFormState(prev => ({ ...prev, logoLink: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full pl-4 pr-12 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100 animate-fade-in"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  {formState.logoLink ? (
                    <img
                      src={formState.logoLink}
                      alt="Logo Preview"
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 object-contain rounded-md border border-zinc-200 bg-white"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {formState.generationMode === 'manual' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {/* Target Audiens (Checklist) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                  Target Audiens
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  {TARGET_AUDIENCES.map((audience) => {
                    const isSelected = formState.targetAudience.includes(audience);
                    return (
                      <button
                        key={audience}
                        type="button"
                        onClick={() => toggleArrayItem('targetAudience', audience)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs text-left font-medium cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-primary font-bold shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900/40'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{audience}</span>
                      </button>
                    );
                  })}
                </div>
                {formState.targetAudience.includes('Custom') && (
                  <input
                    type="text"
                    value={formState.customTargetAudience || ''}
                    onChange={e => setFormState(prev => ({ ...prev, customTargetAudience: e.target.value }))}
                    placeholder="Tuliskan target audiens kustom lainnya..."
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100 mt-2"
                  />
                )}
              </div>

              {/* Goal Website (Checklist) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                  Goal Website
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  {GOAL_WEBSITES.map((goal) => {
                    const isSelected = formState.goalWebsite.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleArrayItem('goalWebsite', goal)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs text-left font-medium cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-primary font-bold shadow-2xs'
                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900/40'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{goal}</span>
                      </button>
                    );
                  })}
                </div>
                {formState.goalWebsite.includes('Custom') && (
                  <input
                    type="text"
                    value={formState.customGoalWebsite || ''}
                    onChange={e => setFormState(prev => ({ ...prev, customGoalWebsite: e.target.value }))}
                    placeholder="Tuliskan tujuan website kustom lainnya..."
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100 mt-2"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Website Information */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              2. Referensi dan Informasi Website
            </h3>
          </div>

          {/* Reference Information Textarea */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Data Acuan <span className="text-primary">*</span> (Min 100 Karakter)
              </label>
              <span className={`text-[10px] font-mono font-bold ${
                formState.referenceInformation.length > 10000 
                  ? 'text-rose-600' 
                  : formState.referenceInformation.length > 9000 
                    ? 'text-amber-500' 
                    : formState.referenceInformation.length >= 100 
                      ? 'text-emerald-500' 
                      : 'text-rose-500'
              }`}>
                {formState.referenceInformation.length} / 10.000 Karakter {
                  formState.referenceInformation.length > 10000 
                    ? '(Melebihi Batas!)' 
                    : formState.referenceInformation.length > 9000 
                      ? '(Mendekati Batas)' 
                      : formState.referenceInformation.length < 100 
                        ? '(Min 100)' 
                        : ''
                }
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={formState.referenceInformation}
              onChange={e => setFormState(prev => ({ ...prev, referenceInformation: e.target.value }))}
              placeholder="Masukkan semua materi referensi Anda di sini, seperti profil perusahaan, website, brosur, proposal, atau FAQ."
              className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100 leading-relaxed font-sans ${
                formState.referenceInformation.length > 10000
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            />
            {formState.referenceInformation.length > 10000 && (
              <p className="text-[11px] text-rose-500 font-medium">
                ⚠️ Jumlah karakter melebihi batas maksimal 10.000 karakter. Mohon persingkat isi data acuan Anda sebelum melakukan generate.
              </p>
            )}
          </div>

          {/* Local File Parser helper */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-zinc-700">
              <Upload className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold font-display">Ekstrak Teks Dari File (.txt, .md, .docx / Word)</h4>
            </div>
            <p className="text-[11px] text-zinc-500">
              Unggah file .txt, .md, atau .docx untuk menambahkan isi dokumen ke Data Acuan.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-zinc-700 hover:text-primary border border-zinc-200 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Pilih File (.txt, .md, .docx)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              {fileError && <span className="text-xs text-rose-500 font-medium font-mono">{fileError}</span>}
            </div>
          </div>

          {/* Reference Links (Dynamic inputs) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              Website Kompetitor / Acuan
            </label>
            
            {formState.referenceLinks.length > 0 && (
              <div className="space-y-2">
                {formState.referenceLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 px-3 py-2 rounded-xl">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono flex-1 truncate">{link}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-1 text-zinc-400 hover:text-rose-500 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="url"
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
                placeholder="Masukkan URL (misal: https://competitor.com atau link social media)"
                className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-zinc-700 dark:text-zinc-300 hover:text-primary rounded-xl cursor-pointer transition-colors flex items-center justify-center border border-zinc-200 dark:border-zinc-850"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {formState.generationMode === 'manual' ? (
          <>
            {/* Card 3: Design Preferences */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
                  3. Desain Website
                </h3>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Pilih 1 tema yang paling sesuai, atau biarkan AI merekomendasikan otomatis.
                </p>

                {/* Grid Kartu Tema — 1 kolom mobile, 2 tablet, 3 desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Kartu Auto — Rekomendasi AI */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFormState(prev => ({ ...prev, designMoodId: 'auto' }))}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFormState(prev => ({ ...prev, designMoodId: 'auto' })); } }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      formState.designMoodId === 'auto'
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-primary ring-1 ring-primary/20'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold text-primary">✨ Auto — Rekomendasi AI</span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        AI otomatis pilih tema paling cocok berdasarkan Tipe Website & Brief Anda
                      </p>
                    </div>
                    <div className="text-[11px] font-medium text-rose-500 dark:text-rose-400 pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
                      • Terpilih Otomatis
                    </div>
                  </div>

                  {/* 8 Kartu Tema */}
                  {DESIGN_MOODS.map((mood) => {
                    const isSelected = formState.designMoodId === mood.id;
                    const swatches = mood.rules.colorContrastPairs
                      .map(p => extractHex(p.backgroundToken))
                      .filter((hex): hex is string => hex !== null);

                    return (
                      <div
                        key={mood.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setFormState(prev => ({ ...prev, designMoodId: mood.id }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFormState(prev => ({ ...prev, designMoodId: mood.id })); } }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/20 border-primary ring-1 ring-primary/20'
                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-zinc-800 dark:text-zinc-100'}`}>
                              {mood.name}
                            </span>
                            {/* Swatch dots */}
                            <div className="flex items-center gap-1 shrink-0">
                              {swatches.map((hex, idx) => (
                                <span
                                  key={idx}
                                  className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-2xs"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {mood.tagline}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/80 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewMoodId(mood.id);
                            }}
                            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg bg-rose-100/50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition-colors"
                          >
                            <span>🔍 Lihat contoh website</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Card 4: Colors & Typography */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
                  4. Warna & Tipografi
                </h3>
              </div>

              {/* 2 Main Columns: Equal Width & Equal Height */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-1">
                {/* Column 1: Color Pickers */}
                <div className="p-5 bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                        Skema Warna Website
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">3 Warna Utama</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Primary Color */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                          Primary Color
                        </label>
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="color"
                            disabled={formState.autoGenerateColors}
                            value={formState.primaryColor}
                            onChange={e => setFormState(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-9 h-9 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer shrink-0 disabled:opacity-50"
                          />
                          <input
                            type="text"
                            disabled={formState.autoGenerateColors}
                            value={formState.primaryColor}
                            onChange={e => setFormState(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-mono uppercase focus:outline-none disabled:opacity-50 text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                          Secondary Color
                        </label>
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="color"
                            disabled={formState.autoGenerateColors}
                            value={formState.secondaryColor}
                            onChange={e => setFormState(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-9 h-9 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer shrink-0 disabled:opacity-50"
                          />
                          <input
                            type="text"
                            disabled={formState.autoGenerateColors}
                            value={formState.secondaryColor}
                            onChange={e => setFormState(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-mono uppercase focus:outline-none disabled:opacity-50 text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                      </div>

                      {/* Accent Color */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                          Accent Color
                        </label>
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="color"
                            disabled={formState.autoGenerateColors}
                            value={formState.accentColor}
                            onChange={e => setFormState(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="w-9 h-9 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer shrink-0 disabled:opacity-50"
                          />
                          <input
                            type="text"
                            disabled={formState.autoGenerateColors}
                            value={formState.accentColor}
                            onChange={e => setFormState(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-mono uppercase focus:outline-none disabled:opacity-50 text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auto Generate Checkbox */}
                  <label className="flex items-center gap-2 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formState.autoGenerateColors}
                      onChange={e => setFormState(prev => ({ ...prev, autoGenerateColors: e.target.checked }))}
                      className="rounded text-primary focus:ring-rose-500 w-3.5 h-3.5 border-zinc-300 dark:border-zinc-800"
                    />
                    <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                      Auto Generate Palette (AI bebas tentukan kombinasi warna)
                    </span>
                  </label>
                </div>

                {/* Column 2: Typography Font (Dropdown Checklist) */}
                <div className="p-5 bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between h-full relative">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                      Typography Font
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">1 Checklist Pilihan</span>
                  </div>

                  {/* Single-Select Dropdown Checklist Selector Centered Vertically */}
                  <div className="flex-1 flex items-center justify-center my-auto py-4">
                    <div className="relative w-full" ref={fontDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-left flex items-center justify-between shadow-xs hover:border-primary focus:outline-none focus:ring-2 focus:ring-rose-500/15 transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-5 h-5 rounded-md bg-rose-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <div className="truncate min-w-0">
                            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">
                              {TYPOGRAPHY_PAIRINGS.find(p => p.heading === formState.headingFont && p.body === formState.bodyFont)?.label || 'Custom Pairing'}
                              <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400 text-[11px]">
                                ({formState.headingFont} / {formState.bodyFont})
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${isFontDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Checklist Popup */}
                      {isFontDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-72 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 space-y-1 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                          {TYPOGRAPHY_PAIRINGS.map((pairing) => {
                            const isSelected = pairing.heading === formState.headingFont && pairing.body === formState.bodyFont;
                            return (
                              <div
                                key={pairing.id}
                                onClick={() => {
                                  setFormState(prev => ({ ...prev, headingFont: pairing.heading, bodyFont: pairing.body }));
                                  setIsFontDropdownOpen(false);
                                }}
                                className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300 font-medium'
                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                                }`}
                              >
                                {/* Checklist Square Box */}
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-rose-500 border-rose-500 text-white'
                                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>

                                {/* Content */}
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                                      {pairing.label}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                                      {pairing.heading} / {pairing.body}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                    Cocok: {pairing.bestFor}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendation footer */}
                  <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Cocok Untuk:</span>{' '}
                      {TYPOGRAPHY_PAIRINGS.find(p => p.heading === formState.headingFont && p.body === formState.bodyFont)?.bestFor || 'Bebas disesuaikan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: SEO Preferences */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <Search className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
                  5. Pengaturan SEO
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Meta Title */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Meta Title
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={formState.metaTitle}
                    onChange={e => setFormState(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Misal: Kopi Nusantara Café - Kedai Kopi Premium Jakarta"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
                  />
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {formState.metaTitle.length}/60 karakter. Kosongkan agar dibuatkan otomatis oleh AI.
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                    <AlignLeft className="w-3.5 h-3.5 text-primary" />
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    maxLength={160}
                    value={formState.metaDescription}
                    onChange={e => setFormState(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Misal: Nikmati kopi single-origin asli Indonesia dengan suasana nyaman untuk kerja dan meeting."
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100 resize-none"
                  />
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {formState.metaDescription.length}/160 karakter. Kosongkan agar dibuatkan otomatis oleh AI.
                  </p>
                </div>

                {/* Google Search Console Verification Tag */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Tag Verifikasi GSC
                  </label>
                  <input
                    type="text"
                    value={formState.gscVerificationTag}
                    onChange={e => setFormState(prev => ({ ...prev, gscVerificationTag: e.target.value }))}
                    placeholder='<meta name="google-site-verification" content="..." />'
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
                  />
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Tempel tag lengkap atau kode verifikasi dari Google Search Console. Opsional.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 6: AI Preferences */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
                  6. Pengaturan AI
                </h3>
              </div>

              {/* Selector Profil Generasi */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                    Profil Generasi
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Optimasi Waktu &amp; Kedalaman Dokumen
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GENERATION_PROFILES.map((profile) => {
                    const isSelected = (formState.generationProfile || 'seimbang') === profile.id;
                    return (
                      <div
                        key={profile.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setFormState(prev => ({ ...prev, generationProfile: profile.id }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setFormState(prev => ({ ...prev, generationProfile: profile.id }));
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/20 border-primary ring-1 ring-primary/20'
                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-zinc-800 dark:text-zinc-100'}`}>
                            {profile.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-primary flex items-center gap-1 font-mono shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" /> Terpilih
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {profile.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {/* Tingkat Animasi */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                    Tingkat Animasi
                  </label>
                  <select
                    value={formState.animationLevel}
                    onChange={e => setFormState(prev => ({ ...prev, animationLevel: e.target.value as AnimationLevel }))}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
                  >
                    {ANIMATION_LEVELS.map(anim => (
                      <option key={anim} value={anim}>{anim}</option>
                    ))}
                  </select>
                </div>

                {/* Gaya Ilustrasi */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                    Gaya Ilustrasi
                  </label>
                  <select
                    value={formState.illustrationStyle}
                    onChange={e => setFormState(prev => ({ ...prev, illustrationStyle: e.target.value as IllustrationStyle }))}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
                  >
                    {ILLUSTRATION_STYLES.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                {/* Gaya Copywriting */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                    Gaya Copywriting
                  </label>
                  <select
                    value={formState.preferredTone}
                    onChange={e => setFormState(prev => ({ ...prev, preferredTone: e.target.value as PreferredTone }))}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
                  >
                    {PREFERRED_TONES.map(tone => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Card 7: Extra Instruction */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
                  7. Perintah / Batasan Tambahan
                </h3>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                  Instruksi Khusus untuk AI
                </label>
                <textarea
                  rows={4}
                  value={formState.extraInstruction}
                  onChange={e => setFormState(prev => ({ ...prev, extraInstruction: e.target.value }))}
                  placeholder="Contoh: Jangan gunakan carousel gambar. Formulir kontak harus terhubung ke WhatsApp. Hindari penggunaan warna merah. Fokus pada pelanggan korporat (B2B)."
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100 leading-normal"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* AI Auto Mode Sections */}
            {!analysisResult && !isAnalyzing && (
              <div className="bg-rose-50/20 dark:bg-rose-950/5 border border-dashed border-rose-200/80 dark:border-rose-900/30 rounded-3xl p-8 text-center space-y-4 animate-fade-in">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h4 className="text-sm font-display font-extrabold text-zinc-900 dark:text-white">
                    Jalankan Analisis Brief Otomatis
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    AI akan menganalisis referensi dan menyusun PRD secara otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onAnalyze}
                  className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 font-display"
                >
                  <Cpu className="w-4 h-4" /> Mulai Analisis Otomatis
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-md space-y-4 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border-4 border-rose-100 border-t-primary animate-spin shrink-0" />
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 font-display">
                      Mesin AI Sedang Menganalisis Brief...
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Tahap: <span className="text-primary font-bold">{ANALYSIS_STEPS[analysisStepIndex] || 'Memulai...'}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-5 md:grid-cols-15 gap-1 pt-2">
                  {ANALYSIS_STEPS.map((step, idx) => {
                    const isActive = idx === analysisStepIndex;
                    const isCompleted = idx < analysisStepIndex;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className={`h-1.5 rounded-full transition-colors duration-300 ${
                          isActive ? 'bg-primary animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800'
                        }`} title={step} />
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-[10px] text-zinc-400 font-mono text-center">
                  Menjalankan 15 tahapan inferensi Business Analyst otomatis secara real-time.
                </div>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="space-y-6 animate-fade-in">
                {/* 63. AI CONFIDENCE ANALYSIS */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-5 h-5 text-primary" />
                      <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                        Tingkat Keyakinan Analisis AI (Confidence Score)
                      </h3>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 dark:bg-rose-950/20 text-primary">
                      Rata-rata:{' '}
                      {Math.round(
                        (analysisResult.confidence.businessAnalysis +
                          analysisResult.confidence.targetAudience +
                          analysisResult.confidence.brandStyle +
                          analysisResult.confidence.seoStrategy) /
                          4
                      )}%
                    </div>
                  </div>

                  {Object.values(analysisResult.confidence).some(v => v < 70) && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex items-start gap-3 text-amber-800 dark:text-amber-400 animate-pulse">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold font-display">Tingkat Keyakinan AI Rendah (&lt;70%)</p>
                        <p className="text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-400/80">
                          Beberapa hasil analisis memiliki tingkat keyakinan rendah karena data referensi minim. Silakan tambahkan lebih banyak detail atau gunakan Manual Mode untuk penyempurnaan yang presisi.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    {[
                      { label: 'Analisis Bisnis', score: analysisResult.confidence.businessAnalysis },
                      { label: 'Target Audiens', score: analysisResult.confidence.targetAudience },
                      { label: 'Gaya Desain', score: analysisResult.confidence.brandStyle },
                      { label: 'Strategi SEO', score: analysisResult.confidence.seoStrategy },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-850/80 space-y-2">
                        <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase font-mono tracking-wide">{item.label}</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black font-display text-zinc-950 dark:text-white">{item.score}</span>
                          <span className="text-[10px] text-zinc-400">%</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.score >= 80 ? 'bg-emerald-500' : item.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 64. AI ASSUMPTIONS */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                      Asumsi Utama yang Diambil AI (AI Assumptions)
                    </h3>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {analysisResult.assumptions.map((item, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 animate-fade-in">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/20 text-primary flex items-center justify-center font-mono text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 65. QUICK REVIEW BEFORE GENERATE */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                      Tinjauan Ringkas Perancangan (Quick Review)
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Tipe Bisnis', value: analysisResult.quickReview.businessType },
                      { label: 'Target Pasar', value: analysisResult.quickReview.targetAudience },
                      { label: 'Tujuan Website', value: analysisResult.quickReview.websiteGoal },
                      { label: 'Gaya Desain', value: analysisResult.quickReview.brandStyle },
                      { label: 'Call to Action (CTA)', value: analysisResult.quickReview.cta },
                      { label: 'Fokus SEO Utama', value: analysisResult.quickReview.seoFocus },
                      { label: 'Estimasi Halaman', value: `${analysisResult.quickReview.estimatedPages} Halaman` },
                      { label: 'Estimasi Section', value: `${analysisResult.quickReview.estimatedSections} Section` },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-850/80 flex flex-col justify-between min-h-[80px]">
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase font-mono tracking-wider">{item.label}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-normal mt-2">{item.value || '-'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={handleEditAnalysis}
                      className="sm:w-1/3 py-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 font-display border border-zinc-200 dark:border-zinc-750"
                    >
                      <Eye className="w-4 h-4 text-zinc-500" /> Sempurnakan di Manual Mode
                    </button>

                    <button
                      type="button"
                      onClick={onGenerate}
                      className="w-fit px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-emerald-500/15 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 font-display"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse" /> Rancang PRD Sekarang (Generate PRD)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Generating Loading States or CTA Trigger Button */}
        <div className="pt-4">
          {isGenerating ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full border-4 border-rose-100 border-t-primary animate-spin shrink-0" />
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 font-display">
                    Sedang Merancang Dokumen PRD...
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Tahapan Aktif: <span className="text-primary font-bold">{stepsList[activeStepIndex]}</span>
                  </p>
                </div>
              </div>

              {/* Progress Bar steps */}
              <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
                {stepsList.map((step, idx) => {
                  const isActive = idx === activeStepIndex;
                  const isCompleted = idx < activeStepIndex;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className={`h-1.5 rounded-full transition-colors duration-300 ${
                        isActive ? 'bg-primary animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800'
                      }`} />
                      <span className={`hidden md:block text-[9px] font-mono text-center truncate ${
                        isActive ? 'text-primary font-bold' : isCompleted ? 'text-emerald-500' : 'text-zinc-400'
                      }`}>
                        {step.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : formState.generationMode === 'manual' ? (
            <div className="flex flex-col sm:flex-row gap-3">
              {(formState.projectName.trim() !== '' || formState.referenceInformation.trim() !== '' || (formState.logoLink && formState.logoLink.trim() !== '')) && (
                <button
                  type="button"
                  onClick={onReset}
                  className="sm:w-1/4 py-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-sm rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 font-display border border-zinc-200 dark:border-zinc-750"
                >
                  Reset Form
                </button>
              )}
              <button
                onClick={onGenerate}
                className="w-fit px-8 py-4 bg-primary hover:bg-primary-hover text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-500/15 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 font-display"
              >
                <Sparkles className="w-5 h-5 animate-pulse" /> Generate Product Requirement Document (PRD)
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal Preview Tema */}
      {(() => {
        const previewMood = DESIGN_MOODS.find(m => m.id === previewMoodId);
        if (!previewMood) return null;

        return (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewMoodId(null)}
          >
            <div
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-950/50">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white">
                      {previewMood.name}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold">
                      {previewMood.tagline}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                    <strong>Gaya Visual:</strong> {previewMood.rules.layoutPattern}. {previewMood.rules.colorApproach}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewMoodId(null)}
                  className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content - Examples */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                    Contoh Website Referensi Gaya ({previewMood.referenceExamples.length})
                  </h4>
                  <span className="text-[11px] text-zinc-400">Klik kartu untuk membuka situs asli</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {previewMood.referenceExamples.map((ex, idx) => {
                    let hostname = '';
                    try {
                      hostname = new URL(ex.url).hostname;
                    } catch {
                      hostname = ex.url;
                    }
                    const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;

                    return (
                      <a
                        key={idx}
                        href={ex.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 hover:border-primary/40 transition-all flex flex-col justify-between gap-2.5 group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={faviconUrl}
                              alt={ex.name}
                              className="w-5 h-5 rounded-sm shrink-0 object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                              {ex.name}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors shrink-0" />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {ex.note}
                        </p>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewMoodId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormState(prev => ({ ...prev, designMoodId: previewMood.id }));
                    setPreviewMoodId(null);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-rose-600 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Pilih Tema Ini
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

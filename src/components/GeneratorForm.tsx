import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';
import { ProjectFormState, WebsiteType, AnimationLevel, IllustrationStyle, PreferredTone, TypographyOption, AIMode, ReasoningLevel } from '../types';
import { 
  Sparkles, FileText, Globe, Eye, Palette, Search, Cpu, MessageSquare, 
  Plus, Trash2, Upload, HelpCircle, Check, Info, Lightbulb 
} from 'lucide-react';

interface GeneratorFormProps {
  formState: ProjectFormState;
  setFormState: React.Dispatch<React.SetStateAction<ProjectFormState>>;
  onGenerate: () => void;
  isGenerating: boolean;
  activeStepIndex: number;
}

const WEBSITE_TYPES: WebsiteType[] = [
  'Company Profile', 'Landing Page', 'Agency', 'Portfolio', 'Startup', 'SaaS', 
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

const BRAND_STYLES = [
  'Modern', 'Minimalist', 'Corporate', 'Elegant', 'Luxury', 'Technology', 
  'Creative', 'Friendly', 'Professional', 'Startup', 'Apple Style', 'Stripe Style', 
  'Glassmorphism', 'Neumorphism', 'Material Design', 'Custom'
];

const SEO_PREFERENCES = [
  'Semantic HTML', 'Schema Ready', 'Fast Loading', 'Local SEO', 'SEO Friendly URL', 
  'Heading Structure', 'Internal CTA', 'External CTA', 'Meta Title', 'Meta Description', 
  'OG Tags', 'Accessibility', 'Structured Content', 'Image Alt Text', 'Breadcrumb Ready'
];

const ANIMATION_LEVELS: AnimationLevel[] = ['None', 'Minimal', 'Medium', 'Premium', 'Luxury', 'WOW'];
const ILLUSTRATION_STYLES: IllustrationStyle[] = ['Flat', '3D', 'Photography', 'AI Generated', 'Icons Only', 'Corporate', 'Minimal'];
const PREFERRED_TONES: PreferredTone[] = ['Professional', 'Friendly', 'Premium', 'Luxury', 'Corporate', 'Casual', 'Creative', 'Persuasive'];
const TYPOGRAPHY_OPTIONS: TypographyOption[] = ['Inter', 'Poppins', 'DM Sans', 'Plus Jakarta Sans', 'Roboto', 'Manrope', 'Auto'];

export default function GeneratorForm({
  formState,
  setFormState,
  onGenerate,
  isGenerating,
  activeStepIndex,
}: GeneratorFormProps) {
  const [newLink, setNewLink] = useState('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a demo project brief
  const handleLoadDemo = () => {
    setFormState({
      projectName: 'Kopi Nusantara Café',
      websiteType: 'Restaurant',
      targetAudience: ['Business Owner', 'Public', 'Students'],
      goalWebsite: ['Lead Generation', 'WhatsApp', 'Booking'],
      projectLanguage: 'Indonesia',
      referenceInformation: `Kami adalah Kopi Nusantara, sebuah kedai kopi yang berfokus pada biji kopi asli Indonesia berkualitas tinggi (Gayo, Toraja, Kintamani).
Kami ingin membuat website baru karena website lama kami sudah sangat ketinggalan zaman dan tidak memiliki sistem reservasi.

Kelebihan kami:
1. Hanya menyajikan kopi single-origin 100% asli Indonesia yang di-roast sendiri.
2. Memiliki area coworking space yang tenang dengan Wi-Fi super cepat 100 Mbps.
3. Menyediakan paket meeting room sewa murah untuk startup dan mahasiswa.

Layanan Utama kami:
- Dine-in & Takeaway kopi premium
- Sewa Ruang Meeting & Coworking space (harian/bulanan)
- Catering kopi untuk event pernikahan & corporate gathering

Alamat kami di Jl. Senopati No. 45, Jakarta Selatan. Kontak WA: 0812-3456-7890. Buka setiap hari jam 08.00 - 22.00.
Tolong buatkan susunan halaman landing page yang menarik, modern, bernuansa hangat (warm coffee vibes), ada galeri foto produk, daftar harga menu, form pemesanan coworking, FAQ lengkap, dan tombol kontak langsung ke WhatsApp admin.`,
      referenceLinks: ['https://instagram.com/kopinusantara_demo', 'https://kopinusantara-old.com'],
      brandStyles: ['Creative', 'Friendly', 'Professional', 'Minimalist'],
      animationLevel: 'Premium',
      illustrationStyle: 'Photography',
      preferredTone: 'Friendly',
      primaryColor: '#c27d38', // Coffee Brown
      secondaryColor: '#1d2a1c', // Forest Dark Green
      accentColor: '#f7f4eb', // Cream Warm White
      autoGenerateColors: false,
      typography: 'Poppins',
      seoPreferences: ['Semantic HTML', 'Local SEO', 'Heading Structure', 'Internal CTA', 'Meta Title', 'Meta Description', 'Accessibility'],
      aiMode: 'Professional',
      creativitySlider: 70,
      reasoningLevel: 'Standard',
      extraInstruction: 'Gunakan struktur copywriting model AIDA (Attention, Interest, Desire, Action) pada halaman utama. Tombol CTA utama harus menonjol dengan efek glow hangat.'
    });
  };

  // Handle multi-select inputs (Target Audience, Goal Website, Brand Style)
  const toggleArrayItem = (field: 'targetAudience' | 'goalWebsite' | 'brandStyles' | 'seoPreferences', item: string) => {
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
      {/* Load Demo Banner */}
      <div className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-primary rounded-xl shrink-0">
            <Lightbulb className="w-5 h-5 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-display font-bold text-zinc-900 dark:text-white">
              Coba Dengan Contoh Brief Proyek
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-xl">
              Malas mengisi form satu-persatu? Klik tombol muat contoh untuk mengisi isian dengan draf brief kedai kopi Nusantara yang kaya detail secara otomatis.
            </p>
          </div>
        </div>
        <button
          onClick={handleLoadDemo}
          className="px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:text-primary dark:hover:text-primary font-bold text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-rose-100 dark:hover:border-rose-900/40 transition-all shrink-0"
        >
          Load Sample Brief
        </button>
      </div>

      {/* Form Container */}
      <div className="space-y-6">
        {/* Card 1: Project Information */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              1. Project Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Project Name <span className="text-primary">*</span>
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
                Website Type <span className="text-primary">*</span>
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
                Project Language
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
          </div>

          {/* Target Audience (Badges Selection) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              Target Audience
            </label>
            <div className="flex flex-wrap gap-2">
              {TARGET_AUDIENCES.map((audience) => {
                const isSelected = formState.targetAudience.includes(audience);
                return (
                  <button
                    key={audience}
                    type="button"
                    onClick={() => toggleArrayItem('targetAudience', audience)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-primary border-primary'
                        : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100'
                    }`}
                  >
                    {audience}
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

          {/* Goal Website (Badges Selection) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              Goal Website
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_WEBSITES.map((goal) => {
                const isSelected = formState.goalWebsite.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleArrayItem('goalWebsite', goal)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-primary border-primary'
                        : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100'
                    }`}
                  >
                    {goal}
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

        {/* Card 2: Website Information */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              2. Website Information & References
            </h3>
          </div>

          {/* Reference Information Textarea */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Reference Information <span className="text-primary">*</span> (Min 100 Karakter)
              </label>
              <span className={`text-[10px] font-mono font-bold ${formState.referenceInformation.length >= 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formState.referenceInformation.length} Karakter
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={formState.referenceInformation}
              onChange={e => setFormState(prev => ({ ...prev, referenceInformation: e.target.value }))}
              placeholder="Tempel seluruh materi referensi Anda di sini. Bisa berupa salinan tulisan website lama, brosur, profile perusahaan, dokumen proposal, chat WhatsApp, FAQ mentah, dsb."
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100 leading-relaxed font-sans"
            />
          </div>

          {/* Local File Parser helper */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-zinc-700">
              <Upload className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold font-display">Ekstrak Teks Dari File (.txt, .md, .docx / Word)</h4>
            </div>
            <p className="text-[11px] text-zinc-500">
              Unggah file dokumen teks (.txt, .md) atau dokumen Word (.docx) Anda. Konten teks akan diekstrak langsung di browser secara instan dan digabungkan ke kolom Reference Information di atas.
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
              Reference Links / Website Pesaing
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

        {/* Card 3: Design Preferences */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              3. Design Preferences
            </h3>
          </div>

          {/* Brand Style Badges Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              Brand Style Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {BRAND_STYLES.map((style) => {
                const isSelected = formState.brandStyles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleArrayItem('brandStyles', style)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-primary border-primary'
                        : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
            {formState.brandStyles.includes('Custom') && (
              <input
                type="text"
                value={formState.customBrandStyle || ''}
                onChange={e => setFormState(prev => ({ ...prev, customBrandStyle: e.target.value }))}
                placeholder="Tuliskan preferensi gaya desain kustom lainnya..."
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100 mt-2"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Animation Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Animation Level
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

            {/* Illustration Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Illustration Style
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

            {/* Preferred Tone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Preferred Copywriting Tone
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

        {/* Card 4: Colors & Typography */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              4. Colors & Typography
            </h3>
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Primary Color
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  disabled={formState.autoGenerateColors}
                  value={formState.primaryColor}
                  onChange={e => setFormState(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-10 h-10 border border-zinc-200 rounded-xl cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  disabled={formState.autoGenerateColors}
                  value={formState.primaryColor}
                  onChange={e => setFormState(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono uppercase focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Secondary Color
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  disabled={formState.autoGenerateColors}
                  value={formState.secondaryColor}
                  onChange={e => setFormState(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-10 h-10 border border-zinc-200 rounded-xl cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  disabled={formState.autoGenerateColors}
                  value={formState.secondaryColor}
                  onChange={e => setFormState(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono uppercase focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Accent Color
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  disabled={formState.autoGenerateColors}
                  value={formState.accentColor}
                  onChange={e => setFormState(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-10 h-10 border border-zinc-200 rounded-xl cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  disabled={formState.autoGenerateColors}
                  value={formState.accentColor}
                  onChange={e => setFormState(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono uppercase focus:outline-none"
                />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Typography Font
              </label>
              <select
                value={formState.typography}
                onChange={e => setFormState(prev => ({ ...prev, typography: e.target.value as TypographyOption }))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/15 focus:border-primary transition-all text-zinc-800 dark:text-zinc-100"
              >
                {TYPOGRAPHY_OPTIONS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto Generate Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formState.autoGenerateColors}
              onChange={e => setFormState(prev => ({ ...prev, autoGenerateColors: e.target.checked }))}
              className="rounded text-primary focus:ring-rose-500 w-4 h-4 border-zinc-300 dark:border-zinc-800"
            />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Beri kebebasan AI menentukan kombinasi warna terbaik berdasarkan identitas brand (Auto Generate Palette)
            </span>
          </label>
        </div>

        {/* Card 5: SEO Preferences */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              5. SEO & Compliance Preferences
            </h3>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tandai preferensi kepatuhan SEO dan aksesibilitas yang harus dirancang secara eksplisit dalam PRD untuk Gemini Canvas:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">
            {SEO_PREFERENCES.map((pref) => {
              const isChecked = formState.seoPreferences.includes(pref);
              return (
                <label key={pref} className={`flex items-start gap-2 p-3 border rounded-xl cursor-pointer select-none transition-all ${
                  isChecked
                    ? 'bg-rose-50/20 dark:bg-rose-950/5 border-rose-200/50 dark:border-rose-900/30 text-rose-800 dark:text-rose-400'
                    : 'bg-zinc-50/40 dark:bg-zinc-900/10 border-zinc-100 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArrayItem('seoPreferences', pref)}
                    className="rounded text-primary focus:ring-rose-500 w-3.5 h-3.5 border-zinc-300 dark:border-zinc-800 mt-0.5"
                  />
                  <span className="text-[11px] font-semibold leading-normal">{pref}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Card 6: AI Preferences */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Cpu className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              6. AI Engine Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI Generation Mode */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Generation Mode (Output Scope)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Quick', label: 'Quick', desc: 'Output ringkas.' },
                  { value: 'Balanced', label: 'Balanced', desc: 'Output sedang.' },
                  { value: 'Professional', label: 'Professional', desc: 'Output detail.' },
                  { value: 'Enterprise', label: 'Enterprise', desc: 'Output sangat panjang.' }
                ].map((mode) => (
                  <label
                    key={mode.value}
                    className={`flex flex-col gap-1 p-3 border rounded-xl cursor-pointer select-none transition-all ${
                      formState.aiMode === mode.value
                        ? 'bg-rose-50/30 dark:bg-rose-950/10 border-primary text-zinc-900 dark:text-white ring-2 ring-rose-500/15'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="aiMode"
                        value={mode.value}
                        checked={formState.aiMode === mode.value}
                        onChange={() => setFormState(prev => ({ ...prev, aiMode: mode.value as AIMode }))}
                        className="text-primary focus:ring-rose-500 w-3.5 h-3.5 border-zinc-300 dark:border-zinc-850"
                      />
                      <span className="text-xs font-bold">{mode.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 pl-5 leading-normal">{mode.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reasoning Level */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                Reasoning Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Basic', desc: 'Ekspres & efisien' },
                  { value: 'Standard', desc: 'Analisis standar' },
                  { value: 'Advanced', desc: 'Analisis mendalam' },
                  { value: 'Maximum', desc: 'Analisis ekstrem' }
                ].map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex flex-col gap-1 p-3 border rounded-xl cursor-pointer select-none transition-all ${
                      formState.reasoningLevel === reason.value
                        ? 'bg-rose-50/30 dark:bg-rose-950/10 border-primary text-zinc-900 dark:text-white ring-2 ring-rose-500/15'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="reasoningLevel"
                        value={reason.value}
                        checked={formState.reasoningLevel === reason.value}
                        onChange={() => setFormState(prev => ({ ...prev, reasoningLevel: reason.value as ReasoningLevel }))}
                        className="text-primary focus:ring-rose-500 w-3.5 h-3.5 border-zinc-300 dark:border-zinc-850"
                      />
                      <span className="text-xs font-bold">{reason.value}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 pl-5 leading-normal">{reason.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Creativity Level Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">
              <span>CREATIVITY SLIDER</span>
              <span className="text-primary">{formState.creativitySlider}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formState.creativitySlider}
              onChange={e => setFormState(prev => ({ ...prev, creativitySlider: parseInt(e.target.value) }))}
              className="w-full accent-primary bg-zinc-100 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>0% (Patuhi Referensi)</span>
              <span>50% (Saran Seimbang)</span>
              <span>100% (Inovasi Maksimal)</span>
            </div>
          </div>
        </div>

        {/* Card 7: Extra Instruction */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white">
              7. Extra Instructions / Batasan Tambahan
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
          ) : (
            <button
              onClick={onGenerate}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-500/15 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 font-display"
            >
              <Sparkles className="w-5 h-5 animate-pulse" /> Generate Product Requirement Document (PRD)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

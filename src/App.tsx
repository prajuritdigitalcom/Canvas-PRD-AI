import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GeneratorForm from './components/GeneratorForm';
import OutputView from './components/OutputView';
import SettingsView from './components/SettingsView';
import { ProjectFormState, PRDGenerateResponse, AIAnalysisResult } from './types';
import { Sparkles, AlertCircle, Info, X, Check, Save, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_FORM_STATE: ProjectFormState = {
  generationMode: 'auto',
  projectName: '',
  websiteType: 'Company Profile',
  targetAudience: [],
  goalWebsite: [],
  projectLanguage: 'Indonesia',
  logoLink: '',
  referenceInformation: '',
  referenceLinks: [],
  brandStyles: [],
  animationLevel: 'Medium',
  illustrationStyle: 'Flat',
  preferredTone: 'Professional',
  primaryColor: '#fe4c6f',
  secondaryColor: '#111827',
  accentColor: '#3b82f6',
  autoGenerateColors: true,
  typography: 'Inter',
  seoPreferences: ['Semantic HTML', 'Fast Loading', 'Heading Structure', 'Accessibility'],
  aiMode: 'Balanced',
  creativitySlider: 50,
  reasoningLevel: 'Standard',
  extraInstruction: ''
};

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('canvas_prd_unlocked') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState('generator');
  const [hasSystemApiKey, setHasSystemApiKey] = useState(false);
  const [systemApiKeyCount, setSystemApiKeyCount] = useState(0);
  const [userApiKeys, setUserApiKeys] = useState<string[]>([]);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const [formState, setFormState] = useState<ProjectFormState>(DEFAULT_FORM_STATE);
  const [responseData, setResponseData] = useState<PRDGenerateResponse | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Password tidak boleh kosong');
      return;
    }

    setIsVerifyingPassword(true);
    setPasswordError('');

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        sessionStorage.setItem('canvas_prd_unlocked', 'true');
        setIsUnlocked(true);
        setPasswordError('');
      } else {
        setPasswordError('Password salah, silakan coba lagi.');
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      setPasswordError('Terjadi kesalahan koneksi server.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // 1. Initial configuration and state restoration on mount
  useEffect(() => {
    // Force Light Mode
    document.documentElement.classList.remove('dark');

    // Restore Form Draft from Local Storage
    const savedForm = localStorage.getItem('canvas_prd_form_draft');
    if (savedForm) {
      try {
        setFormState(JSON.parse(savedForm));
      } catch (e) {
        console.error('Gagal memulihkan draf form:', e);
      }
    }

    // Restore response data if exists
    const savedResponse = localStorage.getItem('canvas_prd_response_data');
    if (savedResponse) {
      try {
        setResponseData(JSON.parse(savedResponse));
      } catch (e) {
        console.error('Gagal memulihkan data PRD sebelumnya:', e);
      }
    }

    // Restore analysis result if exists
    const savedAnalysis = localStorage.getItem('canvas_prd_analysis_result');
    if (savedAnalysis) {
      try {
        setAnalysisResult(JSON.parse(savedAnalysis));
      } catch (e) {
        console.error('Gagal memulihkan hasil analisis:', e);
      }
    }

    // Restore Backup User Keys from Session Storage
    const savedUserKeys = sessionStorage.getItem('canvas_prd_user_api_keys');
    if (savedUserKeys) {
      try {
        setUserApiKeys(JSON.parse(savedUserKeys));
      } catch (e) {
        console.error('Gagal memulihkan API Keys cadangan:', e);
      }
    } else {
      // Legacy single key migration
      const legacyKey = sessionStorage.getItem('canvas_prd_user_api_key') || '';
      if (legacyKey) {
        setUserApiKeys([legacyKey]);
      }
    }

    // Query system API status on backend
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setHasSystemApiKey(data.hasSystemApiKey);
          if (typeof data.systemApiKeyCount === 'number') {
            setSystemApiKeyCount(data.systemApiKeyCount);
          }
        }
      })
      .catch(err => {
        console.error('Gagal mengecek status kesehatan server:', err);
      });
  }, []);

  // 2. Draft Auto Save functionality
  useEffect(() => {
    // Save form state to local storage whenever it changes
    const timeout = setTimeout(() => {
      localStorage.setItem('canvas_prd_form_draft', JSON.stringify(formState));
      setIsDraftSaved(true);
      
      // Clear status flag after a few seconds
      const saveIndicatorTimeout = setTimeout(() => {
        setIsDraftSaved(false);
      }, 3000);

      return () => clearTimeout(saveIndicatorTimeout);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [formState]);

  // Save User API Keys to Session Storage
  useEffect(() => {
    sessionStorage.setItem('canvas_prd_user_api_keys', JSON.stringify(userApiKeys));
  }, [userApiKeys]);

  // 3. Reset Project Draft Action
  const handleResetProject = () => {
    setFormState(DEFAULT_FORM_STATE);
    setResponseData(null);
    setAnalysisResult(null);
    localStorage.removeItem('canvas_prd_form_draft');
    localStorage.removeItem('canvas_prd_response_data');
    localStorage.removeItem('canvas_prd_analysis_result');
    setActiveTab('generator');
    setErrorMessage('');
  };

  // 3.5. Analyze Brief Action (for Auto Mode)
  const handleAnalyzeBrief = async () => {
    if (!formState.projectName.trim()) {
      setErrorMessage('Nama proyek wajib diisi untuk memulai analisis.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formState.referenceInformation.trim() || formState.referenceInformation.length < 100) {
      setErrorMessage('Informasi referensi wajib diisi minimal 100 karakter.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrorMessage('');
    setIsAnalyzing(true);
    setAnalysisStepIndex(0);

    const stepsCount = 14;
    let currentStep = 0;

    const analysisInterval = setInterval(() => {
      if (currentStep < 12) {
        currentStep++;
        setAnalysisStepIndex(currentStep);
      }
    }, 400);

    try {
      const res = await fetch('/api/analyze-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-keys': JSON.stringify(userApiKeys)
        },
        body: JSON.stringify({ form: formState, userApiKeys })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat menganalisis brief.');
      }

      clearInterval(analysisInterval);

      const runRemaining = async () => {
        for (let s = currentStep + 1; s < stepsCount; s++) {
          setAnalysisStepIndex(s);
          await new Promise(resolve => setTimeout(resolve, 150));
        }
        setAnalysisResult(data);
        localStorage.setItem('canvas_prd_analysis_result', JSON.stringify(data));
        setIsAnalyzing(false);
      };

      await runRemaining();

    } catch (err: any) {
      clearInterval(analysisInterval);
      setIsAnalyzing(false);
      setErrorMessage(err?.message || 'Gagal menghubungi server untuk menganalisis brief. Silakan coba lagi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 4. Generate PRD Action with simulated step-by-step progress
  const handleGeneratePRD = async () => {
    // Validate required fields
    if (!formState.projectName.trim()) {
      setErrorMessage('Nama proyek wajib diisi untuk melakukan generasi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formState.referenceInformation.trim() || formState.referenceInformation.length < 100) {
      setErrorMessage('Informasi referensi wajib diisi minimal 100 karakter.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Check if auto mode and analysis results are available
    if (formState.generationMode === 'auto' && !analysisResult) {
      setErrorMessage('Silakan jalankan "Analisis Brief Otomatis" terlebih dahulu sebelum membuat PRD.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrorMessage('');
    setIsGenerating(true);
    setActiveStepIndex(0);

    // Advanced progress bar animation intervals (to create an immersive analysis feel)
    const stepsCount = 7; // total steps: 0 to 6 are visual steps, 7 is 'done'
    const stepDuration = 800; // ms per step transition
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      if (currentStep < 5) {
        currentStep++;
        setActiveStepIndex(currentStep);
      }
    }, stepDuration);

    try {
      // Merge AI Analysis results into the form payload if in Auto Mode
      const finalForm = { ...formState };
      if (formState.generationMode === 'auto' && analysisResult) {
        Object.assign(finalForm, analysisResult.mappedFields);
      }

      // Trigger API fetch
      const res = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-api-keys': JSON.stringify(userApiKeys)
        },
        body: JSON.stringify({ form: finalForm, userApiKeys })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses PRD.');
      }

      // Finish steps simulation before showing results
      clearInterval(progressInterval);
      
      // Animate through remaining steps quickly
      const runRemainingSteps = async () => {
        for (let s = currentStep + 1; s <= stepsCount; s++) {
          setActiveStepIndex(s);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Save response to state and local storage
        setResponseData(data);
        localStorage.setItem('canvas_prd_response_data', JSON.stringify(data));
        
        // Transition to Output Tab
        setActiveTab('output');
        setIsGenerating(false);
      };

      await runRemainingSteps();

    } catch (err: any) {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setErrorMessage(err?.message || 'Gagal menghubungi server untuk merancang PRD. Silakan coba lagi.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isUnlocked ? (
        <div className="flex items-center justify-center min-h-screen bg-zinc-50 px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white border border-zinc-200/80 rounded-3xl max-w-md w-full p-8 shadow-xl text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-rose-50 rounded-2xl text-primary">
                <Lock className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-extrabold text-zinc-950 tracking-tight">
              Akses Terproteksi
            </h1>
            <p className="text-xs text-zinc-500 leading-relaxed mt-2 mb-6">
              Silakan masukkan password rahasia untuk membuka aplikasi Canvas PRD AI Karya Prajurit Digital.
            </p>

            <form onSubmit={handleVerifyPassword} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-zinc-700 font-mono uppercase tracking-wider mb-2">
                  PASSWORD AKSES
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password..."
                    className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary/25 rounded-xl text-sm transition-all outline-none font-mono"
                    disabled={isVerifyingPassword}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-semibold text-rose-600 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isVerifyingPassword}
                className="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-primary/10 flex items-center justify-center gap-2"
              >
                {isVerifyingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Buka Akses</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row min-h-screen bg-zinc-50 transition-colors duration-200 w-full">
          {/* Sidebar navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hasUserApiKey={userApiKeys.length > 0}
            hasSystemApiKey={hasSystemApiKey}
            systemApiKeyCount={systemApiKeyCount}
            isDraftSaved={isDraftSaved}
          />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 h-auto xl:h-screen xl:overflow-y-auto custom-scrollbar">
            {/* Sticky Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex items-center justify-between transition-colors duration-200">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-display font-bold text-zinc-900 capitalize">
                  {activeTab === 'generator' ? '🏠 Generator Blueprint PRD' : 
                   activeTab === 'output' ? '📄 Hasil Blueprint PRD' : 
                   activeTab === 'settings' ? '⚙ Pengaturan API & Draf' : '❓ Panduan Penggunaan'}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Quick API badge indicator */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-[10px] font-mono font-bold">
                  <span className="text-zinc-400">Status API:</span>
                  <span className={hasSystemApiKey || userApiKeys.length > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                    {hasSystemApiKey || userApiKeys.length > 0 ? 'Siap' : 'Belum Dikonfigurasi'}
                  </span>
                </div>

                {/* Sticky Header Action button */}
                {activeTab === 'generator' && (
                  <button
                    onClick={handleGeneratePRD}
                    disabled={isGenerating}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isGenerating ? 'Memproses...' : 'Generate PRD'}
                  </button>
                )}
              </div>
            </header>

            {/* Core content wrapper */}
            <div className="p-6 md:p-8 flex-1 max-w-5xl w-full mx-auto space-y-6">
              {/* Error Message banner */}
              {errorMessage && (
                <div className="flex items-start justify-between gap-3 bg-rose-50/70 border border-rose-100 p-4 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-rose-800 font-display">
                        Terjadi Kesalahan
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setErrorMessage('')}
                    className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

          {/* Active Tab rendering */}
          {activeTab === 'generator' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="space-y-2 py-2 text-center">
                <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-zinc-900 mx-auto">
                  Ubah Brief Mentah Menjadi PRD Gemini Canvas
                </h1>
                <p className="text-xs text-zinc-500 leading-relaxed mx-auto max-w-xl">
                  Isi parameter dan dokumen referensi Anda. AI PM Senior kami akan menganalisis dan merancang blueprint PRD berkualitas tinggi secara instan.
                </p>
              </div>

              <GeneratorForm
                formState={formState}
                setFormState={setFormState}
                onGenerate={handleGeneratePRD}
                onReset={handleResetProject}
                isGenerating={isGenerating}
                activeStepIndex={activeStepIndex}
                analysisResult={analysisResult}
                setAnalysisResult={setAnalysisResult}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyzeBrief}
                analysisStepIndex={analysisStepIndex}
              />
            </div>
          )}

          {activeTab === 'output' && (
            <OutputView
              responseData={responseData}
              projectName={formState.projectName || 'My_Project'}
              onRegenerate={handleGeneratePRD}
              onEdit={() => setActiveTab('generator')}
              onClear={() => {
                setResponseData(null);
                localStorage.removeItem('canvas_prd_response_data');
              }}
              isGenerating={isGenerating}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              userApiKeys={userApiKeys}
              setUserApiKeys={setUserApiKeys}
              hasSystemApiKey={hasSystemApiKey}
              systemApiKeyCount={systemApiKeyCount}
              onResetProject={handleResetProject}
            />
          )}
        </div>
      </main>
    </div>
      )}
    </AnimatePresence>
  );
}

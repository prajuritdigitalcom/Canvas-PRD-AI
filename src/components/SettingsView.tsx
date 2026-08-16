import React, { useState } from 'react';
import { Settings, Eye, EyeOff, ShieldCheck, Key, AlertTriangle, Trash2, Plus, Cpu, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  userApiKeys: string[];
  setUserApiKeys: (keys: string[]) => void;
  selectedModel?: string;
  setSelectedModel?: (model: string) => void;
  onResetProject: () => void;
}

export default function SettingsView({
  userApiKeys,
  setUserApiKeys,
  selectedModel = 'gemini-3.6-flash',
  setSelectedModel,
  onResetProject,
}: SettingsViewProps) {
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const availableModels = [
    {
      id: 'gemini-3.7-flash',
      name: 'Gemini 3.7 Flash',
      badge: 'Flagship Utama (2026)',
      desc: 'Model Hybrid Reasoning & Coding tercanggih dengan kecepatan tinggi dan penalaran adaptif mendalam.'
    },
    {
      id: 'gemini-3.6-flash',
      name: 'Gemini 3.6 Flash',
      badge: 'Rekomendasi Cepat (GA)',
      desc: 'Model Generasi 2026 dengan performa agentic & coding terbaik dan efisiensi tinggi.'
    },
    {
      id: 'gemini-3.5-flash',
      name: 'Gemini 3.5 Flash',
      badge: 'Fallback Stable',
      desc: 'Model versi sebelumnya yang stabil sebagai cadangan otomatis jika model utama berhalangan.'
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro Preview',
      badge: 'Advanced Architecture',
      desc: 'Model kelas Pro untuk penalaran dan arsitektur produk yang sangat kompleks.'
    }
  ];

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = newKey.trim();
    if (!trimmedKey) return;

    if (userApiKeys.includes(trimmedKey)) {
      setErrorMsg('API Key ini sudah ditambahkan sebelumnya.');
      return;
    }

    const updatedKeys = [...userApiKeys, trimmedKey];
    setUserApiKeys(updatedKeys);
    setNewKey('');
    setErrorMsg('');
    setShowKey(false);
  };

  const handleRemoveKey = (indexToRemove: number) => {
    const updatedKeys = userApiKeys.filter((_, idx) => idx !== indexToRemove);
    setUserApiKeys(updatedKeys);
  };

  const handleResetConfirm = () => {
    onResetProject();
    setShowConfirmReset(false);
  };

  // Helper to mask key for display: e.g. AIzaSy...A7bc
  const maskKey = (key: string) => {
    if (key.length <= 12) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 pb-4">
        <div className="p-2.5 bg-rose-50 text-primary rounded-xl">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-zinc-900">
            Konfigurasi & Pengaturan
          </h2>
          <p className="text-xs text-zinc-500">
            Kelola daftar API Key Gemini Anda dan status penyimpanan draf proyek.
          </p>
        </div>
      </div>

      {/* API Key Configuration Card */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-base text-zinc-900">
              Daftar API Key Gemini (Multi-Key Pool)
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${userApiKeys.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {userApiKeys.length > 0 ? `${userApiKeys.length} Kunci Aktif` : 'Belum Dimasukkan'}
          </span>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Sistem mendukung banyak API Key dengan fitur <strong>Round Robin</strong> otomatis, failover cerdas, dan <strong>Adaptive Cooldown</strong> jika kuota terlampaui.
        </p>

        {/* Add Key Input Form */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider font-mono">
            Tambah API Key Gemini Baru
          </label>
          
          <form onSubmit={handleAddKey} className="flex gap-2">
            <div className="relative flex-1 rounded-2xl shadow-sm">
              <input
                type={showKey ? 'text' : 'password'}
                value={newKey}
                onChange={(e) => {
                  setNewKey(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan API Key Gemini (AIzaSy...)..."
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-primary transition-all pr-12 font-mono text-zinc-800"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {errorMsg}
            </p>
          )}
        </div>

        {/* User Keys List */}
        {userApiKeys.length > 0 ? (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-zinc-600 uppercase tracking-wider font-mono">
              Kunci Terdaftar Dalam Pool ({userApiKeys.length})
            </h4>
            <div className="border border-zinc-100 rounded-2xl divide-y divide-zinc-50 overflow-hidden bg-zinc-50/50">
              {userApiKeys.map((key, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-primary text-xs font-bold font-mono">
                      {idx + 1}
                    </div>
                    <code className="text-sm text-zinc-700 font-mono font-medium">
                      API Key #{idx + 1} ({maskKey(key)})
                    </code>
                  </div>
                  <button
                    onClick={() => handleRemoveKey(idx)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Kunci"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Perhatian:</strong> Belum ada API Key yang dimasukkan. Silakan tambahkan minimal 1 API Key Gemini untuk dapat menjalankan generasi PRD.
            </div>
          </div>
        )}

        {/* Security Warning */}
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-800 font-display">
              Keamanan Terjamin (Privacy & Security)
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              API Key Anda disimpan di browser dan hanya dikirimkan via proxy terenkripsi ke server aplikasi untuk diteruskan langsung ke Google Gemini API. API Key tidak pernah disimpan permanen atau dibagikan ke pihak ketiga.
            </p>
          </div>
        </div>
      </div>

      {/* AI Model Selection Card */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-base text-zinc-900">
            Pilihan Model AI Gemini
          </h3>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Pilih model utama untuk generasi PRD dan analisis. Jika model utama mengalami gangguan atau rate limit, sistem otomatis mengaktifkan fallback chain ke model stabil berikutnya.
        </p>

        <div className="grid grid-cols-1 gap-3 pt-1">
          {availableModels.map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModel && setSelectedModel(m.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-rose-50/50 border-rose-200 ring-1 ring-rose-200'
                    : 'bg-zinc-50/60 border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <div className={`p-1 rounded-full mt-0.5 shrink-0 ${isSelected ? 'text-primary' : 'text-zinc-300'}`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold font-display text-zinc-900">
                      {m.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-rose-100 text-rose-800' : 'bg-zinc-200 text-zinc-700'
                    }`}>
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Draft Management Card */}
      <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-rose-500">
          <Trash2 className="w-5 h-5" />
          <h3 className="font-display font-bold text-base text-zinc-900">
            Reset & Bersihkan Proyek
          </h3>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Perubahan pada form otomatis disimpan sebagai draf di browser. Gunakan tombol di bawah untuk mengosongkan semua field dan memulai proyek baru.
        </p>

        {showConfirmReset ? (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-xs font-bold font-display">
                Apakah Anda yakin ingin menghapus seluruh draf?
              </h4>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Seluruh isian form pada tab Generator akan dihapus secara permanen dan dikembalikan ke isian default.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleResetConfirm}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs rounded-xl cursor-pointer transition-all"
              >
                Ya, Hapus Permanen
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-medium text-xs rounded-xl cursor-pointer transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold cursor-pointer transition-all border border-rose-100"
          >
            <Trash2 className="w-4 h-4" /> Reset Project Draft
          </button>
        )}
      </div>
    </div>
  );
}

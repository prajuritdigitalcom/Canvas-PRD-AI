import React, { useState } from 'react';
import { Sparkles, FileText, Settings, HelpCircle, Database, CheckCircle, X, Shield, FileSignature } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasUserApiKey: boolean;
  hasSystemApiKey: boolean;
  systemApiKeyCount?: number;
  isDraftSaved: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  hasUserApiKey,
  hasSystemApiKey,
  systemApiKeyCount = 0,
  isDraftSaved,
}: SidebarProps) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const menuItems = [
    { id: 'generator', label: 'Generator PRD', icon: Sparkles },
    { id: 'output', label: 'Hasil PRD', icon: FileText },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="w-full xl:w-64 border-b xl:border-b-0 xl:border-r border-zinc-200 bg-white p-6 flex flex-row xl:flex-col justify-between items-center xl:items-stretch h-auto xl:h-screen sticky top-0 z-30 transition-colors duration-200">
      {/* Top Section: Logo & Menu */}
      <div className="flex xl:flex-col items-center xl:items-stretch w-full gap-4 xl:gap-8 justify-between xl:justify-start">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-center transition-all duration-200">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base xl:text-lg tracking-tight text-zinc-900 leading-none">
              Canvas PRD <span className="text-primary font-extrabold">AI</span>
            </h1>
            <p className="hidden xl:block text-[10px] text-zinc-400 font-mono mt-1">
              v1.0.0 • Senior Analyst
            </p>
          </div>
        </div>

        {/* Menu Items (for desktop layout) */}
        <nav className="hidden xl:flex flex-col gap-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-rose-50 text-primary border-l-4 border-primary font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Menu for Mobile (horizontal scroll or clean flex row) */}
      <div className="flex xl:hidden items-center gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-50 text-primary font-bold'
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Bottom Section: API Status & Info (Desktop only) */}
      <div className="hidden xl:flex flex-col gap-4 border-t border-zinc-100 pt-5 mt-auto w-full">
        {/* Draft Auto Saved Status */}
        {isDraftSaved && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/50 rounded-lg px-3 py-1.5 animate-pulse">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-600 font-mono">
              Draf Tersimpan Otomatis
            </span>
          </div>
        )}

        {/* API Connection Indicator */}
        <div className="flex flex-col gap-2 bg-zinc-50 border border-zinc-100 rounded-xl p-3">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
            Status API Key Gemini
          </span>
          
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Server</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${hasSystemApiKey ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className={hasSystemApiKey ? 'text-zinc-700 font-bold' : 'text-zinc-400'}>
                {hasSystemApiKey ? (systemApiKeyCount > 0 ? `Aktif (${systemApiKeyCount})` : 'Aktif') : 'Kosong'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Backup</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${hasUserApiKey ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
              <span className={hasUserApiKey ? 'text-zinc-700 font-bold' : 'text-zinc-400'}>
                {hasUserApiKey ? 'Tersedia' : 'Kosong'}
              </span>
            </div>
          </div>
        </div>

        {/* App Meta Info */}
        <div className="flex flex-col gap-1.5 text-[10px] text-zinc-400 font-mono text-center">
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => setShowTermsModal(true)}
              className="hover:text-primary transition-colors cursor-pointer underline text-[10px]"
            >
              Syarat & Ketentuan
            </button>
            <span>•</span>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-primary transition-colors cursor-pointer underline text-[10px]"
            >
              Kebijakan Privasi
            </button>
          </div>
          <div>Karya Prajurit Digital</div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-zinc-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[80vh] text-left">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
              <div className="flex items-center gap-2 text-primary">
                <FileSignature className="w-5 h-5" />
                <h3 className="font-display font-bold text-base text-zinc-900">
                  Syarat & Ketentuan Layanan
                </h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer rounded-lg hover:bg-zinc-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-zinc-600 leading-relaxed custom-scrollbar text-left font-sans">
              <p className="font-semibold text-zinc-800">
                Selamat datang di Canvas PRD AI. Dengan menggunakan alat (tool) ini, Anda menyetujui seluruh ketentuan di bawah ini:
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 text-sm">1. Deskripsi Layanan</h4>
                <p>
                  Canvas PRD AI adalah platform pembantu (Planning Layer) untuk menyusun dokumen spesifikasi kebutuhan produk (PRD) dari informasi mentah yang Anda sediakan. Seluruh kode program final dan antarmuka visual website akan digenerasi secara terpisah oleh pihak ketiga (Gemini Canvas Anda sendiri).
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 text-sm">2. Tanggung Jawab Pengguna</h4>
                <p>
                  Anda sepenuhnya bertanggung jawab atas keakuratan data, dokumen draf, tautan referensi, serta kunci API (API Key) Gemini yang Anda masukkan ke platform kami. Kami tidak bertanggung jawab atas kegagalan generasi atau biaya kuota API Key yang Anda alami.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 text-sm">3. Kepemilikan Hasil PRD</h4>
                <p>
                  Dokumen PRD (Markdown) yang berhasil digenerasi oleh sistem adalah sepenuhnya milik Anda. Anda bebas menggunakan, menyalin, mendownload, dan mendistribusikan dokumen tersebut untuk keperluan komersial maupun pribadi tanpa royalti atau kewajiban lisensi apa pun kepada kami.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 text-sm">4. Ketersediaan Layanan</h4>
                <p>
                  Kami menyediakan layanan ini "apa adanya" (as is) tanpa jaminan stabilitas uptime permanen. Layanan dapat sewaktu-waktu mengalami downtime atau rotasi kunci tanpa pemberitahuan terlebih dahulu.
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4 mt-4 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-zinc-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[80vh] text-left">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Shield className="w-5 h-5" />
                <h3 className="font-display font-bold text-base text-zinc-900">
                  Kebijakan Privasi & Keamanan Data
                </h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer rounded-lg hover:bg-zinc-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-zinc-600 leading-relaxed custom-scrollbar text-left font-sans">
              <p className="font-semibold text-zinc-800">
                Privasi dan keamanan informasi Anda adalah prioritas nomor satu bagi kami. Berikut adalah rincian cara kerja sistem kami:
              </p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 text-sm">1. Penyimpanan Kunci API (API Key)</h4>
                <p>
                  Seluruh API Key cadangan yang Anda masukkan disimpan <strong>secara eksklusif di dalam Session Storage browser lokal Anda sendiri</strong>. Kunci tersebut tidak pernah dikirim ke database permanen kami dan akan terhapus secara otomatis dan permanen ketika Anda menutup tab atau browser ini.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 text-sm">2. Penyimpanan Isian Draf</h4>
                <p>
                  Isian form, brief referensi, tautan kompetitor, dan preferensi desain Anda disimpan dalam <strong>Local Storage browser Anda</strong> secara lokal agar Anda tidak kehilangan progres saat me-refresh halaman. Data ini sepenuhnya berada di kendali fisik perangkat Anda sendiri.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 text-sm">3. Pemrosesan Data & API Proxy</h4>
                <p>
                  Saat Anda mengklik 'Generate PRD' atau 'Analyze Brief', data draf form and API Key cadangan dikirimkan ke server kami untuk bertindak sebagai proxy aman yang meneruskan permintaan langsung ke API Google Gemini menggunakan SDK resmi. Server kami bertindak sebagai jembatan transit sementara dan <strong>TIDAK PERNAH menyimpan logs draf, hasil analisis, atau API Key Anda pada penyimpanan disk/database internal kami</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 text-sm">4. Hak Pengguna</h4>
                <p>
                  Anda memiliki hak penuh untuk mengosongkan dan membersihkan seluruh riwayat draf form lokal dan draf PRD yang tersimpan di browser Anda kapan saja dengan mengklik opsi "Reset Project Draft" di menu Pengaturan.
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4 mt-4 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Setuju & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

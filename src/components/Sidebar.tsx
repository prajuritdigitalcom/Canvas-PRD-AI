import React from 'react';
import { Sparkles, FileText, Settings, HelpCircle, Database, CheckCircle } from 'lucide-react';

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
        <div className="text-[10px] text-zinc-400 font-mono text-center">
          Karya Prajurit Digital
        </div>
      </div>
    </div>
  );
}

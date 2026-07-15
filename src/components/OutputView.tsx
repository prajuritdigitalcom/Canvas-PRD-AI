import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, RefreshCw, Edit2, CheckCircle2, AlertTriangle, FileText, Code, CheckCircle, Clock, BarChart2, Sparkles, BookOpen } from 'lucide-react';
import { PRDGenerateResponse } from '../types';

interface OutputViewProps {
  responseData: PRDGenerateResponse | null;
  projectName: string;
  onRegenerate: () => void;
  onEdit: () => void;
  onClear: () => void;
  isGenerating: boolean;
}

export default function OutputView({
  responseData,
  projectName,
  onRegenerate,
  onEdit,
  onClear,
  isGenerating,
}: OutputViewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'raw' | 'split'>('split');
  const [copied, setCopied] = useState(false);

  if (!responseData) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex justify-center w-fit mx-auto shadow-sm">
          <FileText className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-display font-bold text-zinc-900 dark:text-white">
            Belum Ada PRD yang Digenerasi
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Silakan lengkapi data proyek Anda di tab <strong>Generator</strong> lalu klik tombol <strong>Generate PRD</strong> untuk memulai analisis AI.
          </p>
        </div>
        <button
          onClick={onEdit}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 cursor-pointer transition-all hover:-translate-y-0.5"
        >
          Pergi ke Generator
        </button>
      </div>
    );
  }

  const { markdown, readyScore, scoreReasons, wordCount, readingTime } = responseData;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin teks:', err);
    }
  };

  const handleDownload = () => {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_gemini_prd.md`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 py-2 transition-all">
      {/* Ready Score Card & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/25 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-rose-400 font-mono tracking-wider uppercase">
              Gemini Canvas Ready Score
            </span>
            <h4 className="text-sm text-zinc-400 font-medium">Tingkat Kesiapan Blueprint</h4>
          </div>

          <div className="my-6 flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight">
              {readyScore}
            </span>
            <span className="text-zinc-500 text-lg font-bold">/ 100</span>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-1000"
                style={{ width: `${readyScore}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              {readyScore >= 90 
                ? 'Sangat Siap! PRD ini sudah sangat lengkap dan terstruktur tinggi. Siap dimasukkan ke Gemini Canvas.' 
                : readyScore >= 75 
                ? 'Siap! Struktur utama sudah kokoh. Periksa peringatan di samping untuk hasil optimal.' 
                : 'Cukup Siap. Disarankan melengkapi input reference link dan brand color di tab Generator.'}
            </p>
          </div>
        </div>

        {/* Score Reasons Checklist */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-display font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Checklist Analisis Kelayakan Dokumen
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Passed Criteria */}
              {scoreReasons?.passed?.map((item, idx) => (
                <div key={`pass-${idx}`} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-zinc-600 dark:text-zinc-400">{item}</span>
                </div>
              ))}

              {/* Warnings / Suggestions */}
              {scoreReasons?.warnings?.map((item, idx) => (
                <div key={`warn-${idx}`} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-zinc-600 dark:text-zinc-400">{item}</span>
                </div>
              ))}

              {(!scoreReasons?.passed?.length && !scoreReasons?.warnings?.length) && (
                <div className="text-xs text-zinc-400 col-span-2">
                  Dokumen berhasil digenerasi. Tingkat validitas struktur optimal.
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Jumlah Kata: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{wordCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Estimasi Baca: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{readingTime} Menit</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Document Panel Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Panel Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setViewMode('split')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'split'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Split Screen</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'preview'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Markdown Preview</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'raw'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw Code</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onEdit}
            title="Edit Prompt / Form"
            className="p-2.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl cursor-pointer transition-colors border border-zinc-100 dark:border-zinc-800"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            title="Regenerate PRD"
            className={`p-2.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl cursor-pointer transition-colors border border-zinc-100 dark:border-zinc-800 ${isGenerating ? 'animate-spin opacity-50' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-800 text-white font-semibold text-xs rounded-xl cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download .md
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl cursor-pointer shadow-md shadow-rose-500/10 transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> {copied ? 'Tersalin!' : 'Copy Markdown'}
          </button>
        </div>
      </div>

      {/* Output Panel Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Side: Markdown Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm overflow-y-auto max-h-[640px] custom-scrollbar transition-all ${viewMode === 'preview' ? 'xl:col-span-2' : ''}`}>
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-5">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" /> Visual Document Preview
              </span>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded font-mono border border-emerald-100/50 dark:border-emerald-900/10">
                Gemini Optimized
              </span>
            </div>
            
            <div className="markdown-body prose dark:prose-invert max-w-none">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Right Side: Raw plain markdown text panel */}
        {(viewMode === 'raw' || viewMode === 'split') && (
          <div className={`bg-zinc-950 border border-zinc-850 rounded-3xl p-6 shadow-lg flex flex-col max-h-[640px] transition-all ${viewMode === 'raw' ? 'xl:col-span-2' : ''}`}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span className="text-xs font-bold text-zinc-500 font-mono flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-primary" /> Plain Markdown Text Code
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              value={markdown}
              className="w-full flex-1 min-h-[300px] xl:min-h-[480px] bg-transparent text-zinc-300 font-mono text-xs focus:outline-none resize-none overflow-y-auto custom-scrollbar leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
}

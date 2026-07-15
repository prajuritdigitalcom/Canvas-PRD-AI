import React from 'react';
import { BookOpen, HelpCircle, CheckCircle, Flame, Heart, Cpu, FileSpreadsheet, Compass } from 'lucide-react';

export default function AboutView() {
  const steps = [
    {
      title: '1. Masukkan Brief Bisnis',
      desc: 'Tempel informasi mentah apa saja, seperti company profile, chat WhatsApp, catatan rapat, brosur, atau teks website lama.',
      icon: BookOpen,
    },
    {
      title: '2. Atur Preferensi Desain & SEO',
      desc: 'Tentukan gaya brand, kombinasi warna, struktur navigasi, tingkat animasi, hingga target audiens yang spesifik.',
      icon: Compass,
    },
    {
      title: '3. Generate PRD AI',
      desc: 'Mesin AI menganalisis informasi bisnis secara mendalam untuk merencanakan Information Architecture, UX, dan strategi SEO.',
      icon: Cpu,
    },
    {
      title: '4. Copy & Pasang ke Gemini Canvas',
      desc: 'Dapatkan output dokumen Markdown (.md) profesional. Cukup copy, lalu pasang ke Gemini Canvas untuk membuat website berkualitas tinggi.',
      icon: FileSpreadsheet,
    },
  ];

  const features = [
    {
      title: 'AI Business Analyst Senior',
      desc: 'Menyusun strategi website layaknya Senior Product Manager, lengkap dengan analisis audiens, penentuan pilar konten, dan user flow.',
    },
    {
      title: 'Rekomendasi Pintar (Smart Label)',
      desc: 'Mengisi celah informasi yang kosong dengan standar terbaik industri, diberi penanda khusus [AI Recommendation] agar tetap transparan.',
    },
    {
      title: 'Canvas Ready Score',
      desc: 'Menilai kualitas dokumen dan memberikan daftar checklist perbaikan sebelum Anda menggunakannya di Gemini Canvas.',
    },
    {
      title: 'Fokus pada Konversi & UX',
      desc: 'Menghasilkan rancangan letak Call-To-Action (CTA) strategis, struktur heading yang SEO-friendly, dan kesesuaian aksesibilitas WCAG.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-primary rounded-full text-xs font-semibold font-mono border border-rose-100/50">
          <Flame className="w-3.5 h-3.5" /> Ubah Info Mentah Menjadi PRD Siap Gemini Canvas
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Tentang Canvas PRD AI
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-base max-w-2xl mx-auto">
          Canvas PRD AI adalah web-app cerdas berbasis AI yang dirancang khusus untuk mengubah brief mentah yang berantakan menjadi blueprint Product Requirement Document (PRD) website profesional yang siap dipahami oleh Gemini Canvas.
        </p>
      </div>

      {/* Why PRD is Crucial Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-8 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -z-10" />
        <div className="space-y-4 max-w-xl">
          <span className="text-rose-400 font-bold font-mono text-xs uppercase tracking-widest">
            Mengapa ini Penting?
          </span>
          <h3 className="text-xl md:text-2xl font-display font-bold">
            Kualitas Website Gemini Canvas Bergantung pada Kualitas Prompt Anda
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Seringkali website yang dibangun oleh Gemini Canvas kurang memuaskan, kehilangan section penting, atau memiliki copywriting yang buruk. Masalah utamanya bukan karena kecerdasan buatan tersebut lemah, melainkan karena informasi awal (brief) yang dimasukkan berantakan, terlalu panjang, atau tidak terstruktur.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Canvas PRD AI bertindak sebagai <strong>perencana blueprint (Planning Layer)</strong> sebelum website Anda dibuat. AI kami menstrukturkan semua detail teknis, psikologi branding, copywriting hook, letak CTA, skema SEO, dan panduan layout visual agar Gemini Canvas dapat membangun website yang sempurna sejak percobaan pertama!
          </p>
        </div>
      </div>

      {/* How It Works Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-display font-bold text-zinc-950 dark:text-white text-center">
          Alur Kerja Sederhana
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl flex flex-col gap-3 shadow-sm hover:border-rose-100 dark:hover:border-rose-950/40 transition-colors"
              >
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-primary rounded-xl w-fit">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                  {step.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Detail */}
      <div className="space-y-6">
        <h3 className="text-xl font-display font-bold text-zinc-950 dark:text-white text-center">
          Fitur Unggulan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100/80 dark:border-zinc-800 p-6 rounded-2xl space-y-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-white">
                  {feat.title}
                </h4>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pl-6">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Non-Goals Box */}
      <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-950/30 p-6 rounded-2xl space-y-3">
        <h4 className="font-display font-bold text-sm text-primary flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> Batasan Layanan (Non-Goals)
        </h4>
        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc pl-5">
          <li>Aplikasi ini <strong>TIDAK</strong> merancang visual website secara langsung.</li>
          <li>Aplikasi ini <strong>TIDAK</strong> membuat kode HTML, React, atau CSS website.</li>
          <li>Aplikasi ini <strong>TIDAK</strong> melakukan hosting ataupun publikasi website online.</li>
          <li>Seluruh proses pembuatan kode dan visual website dilakukan oleh platform Gemini Canvas Anda sendiri.</li>
        </ul>
      </div>

      {/* Footer Branding */}
      <div className="text-center pt-8 border-t border-zinc-100 dark:border-zinc-900">
        <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
          Made with <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> for the AI Builder & Web Creator Community.
        </p>
      </div>
    </div>
  );
}

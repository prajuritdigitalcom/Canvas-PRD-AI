import { ProjectFormState } from '../types';

export interface DemoBrief {
  id: string;
  label: string;
  category: 'Company Profile' | 'E-Commerce' | 'SaaS';
  badgeColor: string;
  title: string;
  description: string;
  data: ProjectFormState;
}

export const DEMO_BRIEFS: DemoBrief[] = [
  {
    id: 'company-profile',
    label: 'Company Profile',
    category: 'Company Profile',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    title: 'PT Arunika Konstruksi Utama',
    description: 'Kontraktor bangunan & konstruksi komersial/industri di Surabaya dengan legalitas LPJK & K3.',
    data: {
      projectName: 'PT Arunika Konstruksi Utama',
      websiteType: 'Company Profile',
      targetAudience: ['Business Owner', 'Corporate', 'Government'],
      goalWebsite: ['Lead Generation', 'WhatsApp', 'Download Catalog', 'Information'],
      projectLanguage: 'Indonesia',
      referenceInformation: `PT Arunika Konstruksi Utama adalah perusahaan kontraktor bangunan dan konstruksi umum yang telah berdiri sejak tahun 2011, berbasis di Surabaya, Jawa Timur. Kami memiliki Sertifikat Badan Usaha (SBU) Kualifikasi Menengah (M1) dari LPJK dan telah menyelesaikan lebih dari 85 proyek di seluruh Jawa Timur dan Bali.

Kami membangun website baru karena website lama kami dibuat tahun 2016, tidak mobile-friendly, dan tidak memiliki portofolio proyek yang bisa diakses calon klien korporat maupun instansi pemerintah saat proses tender.

Kelebihan/Keunggulan kami:
1. Berpengalaman lebih dari 13 tahun menangani proyek gedung komersial, pabrik, dan renovasi ruko.
2. Memiliki tim insinyur sipil bersertifikat dan tenaga kerja tersertifikasi K3 (Keselamatan dan Kesehatan Kerja).
3. Menggunakan sistem manajemen proyek digital sehingga klien bisa memantau progres pembangunan secara real-time.
4. Track record tepat waktu pada 92% proyek yang dikerjakan dalam 5 tahun terakhir.

Layanan Utama kami:
- Jasa Kontraktor Bangunan Komersial & Industri (pabrik, gudang, ruko)
- Renovasi & Fit-Out Gedung Perkantoran
- Konsultasi Perencanaan & Desain Struktur (RAB, gambar kerja)
- Pengadaan Material Bangunan untuk Proyek Skala Besar

Struktur halaman yang kami inginkan:
- Beranda dengan headline kuat dan statistik pencapaian perusahaan (jumlah proyek, tahun pengalaman, klien puas)
- Halaman "Tentang Kami" berisi visi misi, struktur tim manajemen, dan legalitas perusahaan (SBU, NIB, sertifikat ISO jika ada)
- Halaman "Layanan" dengan penjelasan detail tiap jenis jasa konstruksi
- Halaman "Portofolio Proyek" berupa galeri foto before-after dengan filter kategori (Gedung, Pabrik, Renovasi)
- Halaman "Karir" untuk rekrutmen tenaga kerja proyek
- Formulir "Ajukan Penawaran/RAB" yang terhubung ke WhatsApp tim sales
- Halaman Kontak dengan peta lokasi kantor dan cabang

Kami ingin kesan yang ditampilkan adalah kokoh, profesional, terpercaya, dan berkelas korporat — bukan kesan santai. Warna dominan biru tua dan abu-abu industrial. Sertakan juga bagian testimoni klien korporat dan logo-logo perusahaan/instansi yang pernah bekerja sama sebagai social proof.

Alamat kantor kami: Jl. Raya Darmo Permai III No. 88, Surabaya, Jawa Timur. Telepon kantor: (031) 567-8899. WhatsApp Marketing: 0813-3344-5566. Email: marketing@arunikakonstruksi.co.id. Jam operasional: Senin-Jumat 08.00-17.00, Sabtu 08.00-13.00.`,
      referenceLinks: ['https://instagram.com/arunikakonstruksi_demo', 'https://arunikakonstruksi-old.com'],
      designMoodId: 'classic-heritage',
      designDensity: 'auto',
      animationLevel: 'Minimal',
      illustrationStyle: 'Corporate',
      preferredTone: 'Corporate',
      primaryColor: '#1e3a5f',
      secondaryColor: '#2d3436',
      accentColor: '#f39c12',
      autoGenerateColors: false,
      headingFont: 'Sora',
      bodyFont: 'Inter',
      metaTitle: 'PT Arunika Konstruksi Utama — Jasa Kontraktor Bangunan & Konstruksi Terpercaya Surabaya',
      metaDescription: 'Kontraktor bangunan komersial & industri berpengalaman 13+ tahun di Surabaya. Bersertifikat SBU, tepat waktu, dan bergaransi. Konsultasi & RAB gratis.',
      gscVerificationTag: '',
      generationProfile: 'seimbang',
      extraInstruction: 'Tampilkan angka statistik pencapaian (jumlah proyek, tahun berdiri, klien) dengan animasi counter di beranda. Sertakan section "Proses Kerja Kami" (5 tahap: Konsultasi, Survey, Desain & RAB, Pengerjaan, Serah Terima) dalam bentuk timeline horizontal. Semua CTA harus mengarah ke WhatsApp atau form pengajuan penawaran, bukan form generik.',
      generationMode: 'auto'
    }
  },
  {
    id: 'e-commerce',
    label: 'E-Commerce',
    category: 'E-Commerce',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    title: 'Rumah Batik Larasati',
    description: 'Toko online batik tulis & cap asli pengrajin Pekalongan & Solo dengan layanan custom seragam.',
    data: {
      projectName: 'Rumah Batik Larasati',
      websiteType: 'E-Commerce',
      targetAudience: ['Retail', 'Public', 'Distributor'],
      goalWebsite: ['Sales', 'WhatsApp', 'Brand Awareness', 'Newsletter'],
      projectLanguage: 'Indonesia',
      referenceInformation: `Rumah Batik Larasati adalah toko online yang menjual batik tulis dan batik cap asli buatan pengrajin lokal dari Pekalongan dan Solo. Kami sudah berjualan sejak 2018 melalui marketplace (Shopee & Tokopedia) dan Instagram, namun sekarang ingin memiliki website toko sendiri agar tidak bergantung sepenuhnya pada platform pihak ketiga dan bisa membangun branding jangka panjang.

Kelebihan/Keunggulan kami:
1. Bekerja sama langsung dengan lebih dari 20 pengrajin batik di Pekalongan dan Solo, menjamin keaslian dan kualitas kain.
2. Menyediakan sertifikat keaslian batik tulis untuk setiap pembelian di atas kategori premium.
3. Memiliki koleksi eksklusif motif kontemporer hasil kolaborasi dengan desainer lokal, tidak dijual di tempat lain.
4. Rating toko 4.9/5 dengan lebih dari 12.000 transaksi sukses di marketplace.

Kategori Produk yang dijual:
- Batik Tulis Premium (kain per meter & siap jahit)
- Batik Cap Harian (kemeja, dress, outer)
- Aksesoris pelengkap (selendang, tas batik, sepatu motif batik)
- Batik Custom / Pesanan seragam kantor dan seragam sekolah (bulk order)

Fitur yang kami butuhkan di website:
- Katalog produk dengan filter (jenis batik, warna, motif, ukuran, rentang harga)
- Halaman detail produk lengkap dengan galeri foto zoom, ukuran, bahan, dan cara perawatan kain
- Keranjang belanja & checkout dengan pilihan metode pembayaran (transfer bank, e-wallet, dan cicilan)
- Sistem ongkos kirim otomatis berdasarkan kota tujuan (integrasi kurir JNE/J&T/SiCepat)
- Halaman "Cerita Pengrajin" untuk storytelling asal-usul motif dan pengrajin (nilai edukasi & branding)
- Program membership/loyalty point untuk pelanggan yang sering repeat order
- Live chat / tombol WhatsApp cepat untuk konsultasi ukuran dan request custom
- Halaman "Cara Pesan Custom/Seragam" khusus untuk B2B (sekolah, kantor, event)
- Blog sederhana untuk konten SEO seperti "Cara Merawat Kain Batik Tulis", "Sejarah Motif Parang", dll

Kami ingin website terlihat elegan, hangat, dan autentik Indonesia — bukan kesan modern-minimalis ala brand fashion barat. Gunakan foto produk dengan nuansa earthy tone. Tampilkan juga badge "UMKM Binaan" dan testimoni pelanggan asli dengan foto produk yang dipakai.

Alamat toko/gudang kami di Jl. Kusumabangsa No. 12, Pekalongan, Jawa Tengah. WhatsApp CS: 0857-2233-4455. Email: hello@rumahbatiklarasati.com. Instagram: @rumahbatiklarasati. Jam operasional CS: Senin-Sabtu 09.00-20.00.`,
      referenceLinks: ['https://shopee.co.id/rumahbatiklarasati_demo', 'https://instagram.com/rumahbatiklarasati'],
      designMoodId: 'warm-craftsmanship',
      designDensity: 'auto',
      animationLevel: 'Medium',
      illustrationStyle: 'Photography',
      preferredTone: 'Friendly',
      primaryColor: '#8b4513',
      secondaryColor: '#2c1810',
      accentColor: '#d4af37',
      autoGenerateColors: false,
      headingFont: 'Playfair Display',
      bodyFont: 'DM Sans',
      metaTitle: 'Rumah Batik Larasati — Batik Tulis & Batik Cap Asli Pengrajin Pekalongan & Solo',
      metaDescription: 'Belanja batik tulis dan batik cap asli langsung dari pengrajin Pekalongan & Solo. Kualitas terjamin, motif eksklusif, tersedia layanan custom seragam.',
      gscVerificationTag: '',
      generationProfile: 'seimbang',
      extraInstruction: 'Desain kartu produk harus menonjolkan foto tekstur kain batik secara detail. Sertakan section "Kenapa Belanja di Rumah Batik Larasati" berisi 4 poin keunggulan dalam bentuk ikon. Checkout harus terasa singkat (maksimal 3 langkah) dan pastikan ada trust badge (garansi 100% original, gratis retur 3 hari).',
      generationMode: 'auto'
    }
  },
  {
    id: 'saas',
    label: 'SaaS App',
    category: 'SaaS',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    title: 'Invoify',
    description: 'Aplikasi invoicing & faktur online berbasis cloud untuk UMKM dan freelancer dengan pengingat otomatis & QRIS.',
    data: {
      projectName: 'Invoify',
      websiteType: 'SaaS',
      targetAudience: ['Business Owner', 'Corporate', 'Public'],
      goalWebsite: ['Registration', 'Sales', 'Customer Support', 'Newsletter'],
      projectLanguage: 'Indonesia',
      referenceInformation: `Invoify adalah aplikasi SaaS (Software as a Service) berbasis web yang membantu UMKM dan freelancer di Indonesia membuat, mengirim, dan mengelola invoice/faktur secara digital, lengkap dengan pengingat pembayaran otomatis dan laporan keuangan sederhana. Produk ini sudah dalam tahap beta tertutup dengan 300+ pengguna aktif dan sekarang kami butuh landing page/website resmi untuk mendukung peluncuran publik (public launch) dan proses fundraising ke calon investor.

Masalah yang kami selesaikan:
Banyak UMKM dan freelancer di Indonesia masih membuat invoice manual lewat Word/Excel atau bahkan tulis tangan, menyebabkan kesalahan hitung, telat tagih, dan sulit melacak siapa yang belum bayar. Invoify mengotomatisasi seluruh proses ini dalam satu dashboard.

Fitur Utama produk kami:
1. Buat invoice profesional dalam hitungan detik dari template siap pakai, bisa custom logo dan warna brand.
2. Pengingat pembayaran otomatis via WhatsApp dan Email ke klien yang belum bayar.
3. Dashboard laporan keuangan real-time (total pemasukan, invoice belum dibayar, proyeksi cashflow bulanan).
4. Integrasi pembayaran online (klien bisa bayar langsung dari link invoice via QRIS, transfer VA, kartu kredit).
5. Multi-user untuk tim (Owner, Admin, Finance) dengan role & permission berbeda.
6. Ekspor laporan ke Excel/PDF untuk kebutuhan pajak dan pembukuan.

Paket Harga (Pricing Tiers) kami:
- Free: hingga 5 invoice/bulan, 1 user, fitur dasar
- Starter (Rp 99.000/bulan): invoice tanpa batas, 3 user, reminder otomatis
- Business (Rp 299.000/bulan): semua fitur Starter + integrasi pembayaran online + multi-currency + laporan lanjutan
- Enterprise (custom pricing): API access, dedicated support, SLA khusus

Struktur halaman yang kami butuhkan:
- Landing page dengan hero section jelas menjelaskan value proposition ("Buat & Kirim Invoice dalam 30 Detik, Dibayar Lebih Cepat")
- Section "Cara Kerja" (3-4 langkah sederhana: Buat Invoice → Kirim → Klien Bayar Online → Uang Masuk Otomatis)
- Section Fitur Unggulan dengan screenshot/mockup produk asli
- Halaman Pricing dengan tabel perbandingan paket dan toggle bulanan/tahunan (diskon 20% tahunan)
- Halaman "Tentang Kami" berisi cerita founder dan visi produk
- Halaman Blog untuk konten edukasi seputar keuangan UMKM dan invoicing (strategi SEO/content marketing)
- Halaman FAQ seputar keamanan data, metode pembayaran, dan proses migrasi dari sistem lama
- Tombol CTA utama "Daftar Gratis" / "Mulai Uji Coba 14 Hari" yang mengarah ke halaman signup aplikasi (bukan WhatsApp)
- Section Testimoni dari pengguna beta (UMKM F&B, jasa desain, konsultan freelance)
- Section khusus untuk investor/media berisi traction singkat (jumlah pengguna, total nilai invoice yang diproses)

Kami ingin kesan produk terlihat modern, dipercaya (trustworthy), dan mudah dipahami non-teknis — target pengguna kami banyak yang belum terbiasa pakai software kompleks, jadi bahasa dan visual harus sederhana, tidak jargon-heavy. Skema warna utama ungu-biru (identik dengan brand fintech/SaaS modern) dengan aksen hijau untuk elemen "berhasil dibayar".

Kontak kami: Email support@invoify.id, WhatsApp Business 0821-9900-1122 (untuk pertanyaan sales Enterprise), berbasis di Jakarta (remote-first team). Media sosial: LinkedIn Invoify Indonesia, Twitter/X @invoify_id.`,
      referenceLinks: ['https://linkedin.com/company/invoify-demo', 'https://app.invoify-demo.id'],
      designMoodId: 'bento-modular',
      designDensity: 'auto',
      animationLevel: 'Premium',
      illustrationStyle: '3D',
      preferredTone: 'Professional',
      primaryColor: '#6366f1',
      secondaryColor: '#0f172a',
      accentColor: '#22c55e',
      autoGenerateColors: false,
      headingFont: 'Sora',
      bodyFont: 'Inter',
      metaTitle: 'Invoify — Aplikasi Invoice & Faktur Online Otomatis untuk UMKM dan Freelancer',
      metaDescription: 'Buat, kirim, dan lacak invoice dalam hitungan detik. Pengingat pembayaran otomatis, integrasi QRIS, dan laporan keuangan real-time. Coba gratis 14 hari.',
      gscVerificationTag: '',
      generationProfile: 'seimbang',
      extraInstruction: 'Gunakan mockup dashboard produk (bisa placeholder browser frame) di hero section, bukan hanya teks. Section Pricing wajib ada badge "Paling Populer" pada paket Business. Sertakan micro-animation pada angka statistik traction (counter animation) di bagian khusus investor. Hindari istilah teknis SaaS yang rumit — gunakan bahasa yang mudah dipahami pemilik UMKM awam.',
      generationMode: 'auto'
    }
  }
];

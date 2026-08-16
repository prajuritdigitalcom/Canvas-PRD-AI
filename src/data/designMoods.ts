export interface ResponsiveFontToken {
  desktop: string;
  tablet: string;
  mobile: string;
}

export interface ColorContrastPair {
  role: string;
  backgroundUsage: string;
  contrastRule: string;
}

export interface DesignMoodRule {
  id: string;
  name: string;
  tagline: string;
  bestFor: string[];
  recommendedDensity: 'minimal' | 'standard' | 'rich';
  rules: {
    layoutPattern: string;
    borderRadius: string;
    shadow: string;
    colorApproach: string;
    typography: string;
    imagery: string;
    forbidden: string[];
    typographyScale: {
      h1: ResponsiveFontToken;
      h2: ResponsiveFontToken;
      h3: ResponsiveFontToken;
      h4: ResponsiveFontToken;
      bodyLarge: ResponsiveFontToken;
      body: ResponsiveFontToken;
      bodySmall: ResponsiveFontToken;
      caption: ResponsiveFontToken;
    };
    colorContrastPairs: ColorContrastPair[];
  };
  referenceExamples: { name: string; note: string; url: string }[];
}

export interface DesignDensityRule {
  id: 'minimal' | 'standard' | 'rich';
  name: string;
  tagline: string;
  sectionPaddingDesktop: string;
  sectionPaddingTablet: string;
  sectionPaddingMobile: string;
  itemsPerGridRow: string;
  animationLevel: 'None' | 'Minimal' | 'Medium' | 'Premium' | 'WOW';
  imageryDensity: string;
  copyDensity: string;
}

export const DESIGN_MOODS: DesignMoodRule[] = [
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    tagline: 'Bersih, tenang, dan dipercaya',
    bestFor: ['Company Profile', 'Finance', 'Insurance', 'SaaS', 'Corporate Startup', 'Manufacturing'],
    recommendedDensity: 'standard',
    rules: {
      layoutPattern: 'Whitespace dominan, satu CTA jelas per section, grid 12-kolom presisi',
      borderRadius: 'Konsisten kecil (4–8px)',
      shadow: 'Sangat tipis, hanya untuk elevasi kartu penting',
      colorApproach: 'Palet netral bersih, 1 warna aksen dominan dari brand + warna netral pendukung, tanpa gradient ramai',
      typography: 'Sans-serif presisi, hierarki jelas, line-height lega',
      imagery: 'Foto asli berkualitas tinggi, bukan ilustrasi kartun/stok generik',
      forbidden: ['rounded-full berlebihan', 'lebih dari 1 warna aksen mencolok', 'animasi berlebihan'],
      typographyScale: {
        h1: { desktop: '48px bold', tablet: '38px bold', mobile: '30px bold' },
        h2: { desktop: '36px bold', tablet: '30px bold', mobile: '24px bold' },
        h3: { desktop: '28px semibold', tablet: '24px semibold', mobile: '20px semibold' },
        h4: { desktop: '22px semibold', tablet: '20px semibold', mobile: '18px semibold' },
        bodyLarge: { desktop: '18px regular', tablet: '17px regular', mobile: '16px regular' },
        body: { desktop: '16px regular', tablet: '16px regular', mobile: '15px regular' },
        bodySmall: { desktop: '14px regular', tablet: '14px regular', mobile: '13px regular' },
        caption: { desktop: '12px medium', tablet: '12px medium', mobile: '12px medium' },
      },
      colorContrastPairs: [
        { role: 'Latar Utama', backgroundUsage: 'Latar utama halaman & kartu standar (Surface Light)', contrastRule: 'Latar Terang → Teks Gelap Kontras (#0F172A)' },
        { role: 'Section Alternatif', backgroundUsage: 'Section pemisah / container pendukung (Surface Muted)', contrastRule: 'Latar Terang Muted → Teks Gelap Kontras (#0F172A)' },
        { role: 'Footer & CTA Utama', backgroundUsage: 'Footer & Banner CTA kontras tinggi (Surface Dark / Brand)', contrastRule: 'Latar Gelap → Teks Terang Kontras (#FFFFFF / #F8FAFC)' },
      ],
    },
    referenceExamples: [
      { name: 'Stripe', note: 'Grid rapi, whitespace luas, shadow nyaris tak terlihat', url: 'https://stripe.com' },
      { name: 'Apple (Business)', note: 'Tipografi presisi, fokus tinggi ke satu pesan per section', url: 'https://www.apple.com' },
      { name: 'Ramp', note: 'Fintech B2B super bersih, aksen warna tunggal', url: 'https://ramp.com' },
      { name: 'Robinhood', note: 'Palet netral, ilustrasi minim, fokus kepercayaan', url: 'https://robinhood.com' },
    ],
  },
  {
    id: 'bold-modern',
    name: 'Bold Modern',
    tagline: 'Berani, tegas, dan langsung diingat',
    bestFor: ['Startup', 'Agency', 'Portfolio', 'Personal Branding', 'Event'],
    recommendedDensity: 'standard',
    rules: {
      layoutPattern: 'Grid eksplisit, elemen boleh sedikit asimetris, struktur terlihat',
      borderRadius: 'Nyaris 0 (sharp corner), maksimal 2–4px',
      shadow: 'Hard shadow offset solid (bukan soft-blur)',
      colorApproach: '2–3 warna solid kontras tinggi dari brand, tanpa gradient/pastel lembut',
      typography: 'Font tebal/besar, sesekali monospace untuk aksen',
      imagery: 'Ilustrasi flat/geometris atau foto filter kontras tinggi',
      forbidden: ['rounded-xl/2xl di komponen manapun', 'soft drop-shadow', 'palet pastel lembut'],
      typographyScale: {
        h1: { desktop: '56px black', tablet: '42px black', mobile: '32px black' },
        h2: { desktop: '40px extrabold', tablet: '32px extrabold', mobile: '26px extrabold' },
        h3: { desktop: '30px bold', tablet: '25px bold', mobile: '22px bold' },
        h4: { desktop: '24px bold', tablet: '21px bold', mobile: '18px bold' },
        bodyLarge: { desktop: '18px medium', tablet: '17px medium', mobile: '16px medium' },
        body: { desktop: '16px medium', tablet: '16px medium', mobile: '15px medium' },
        bodySmall: { desktop: '14px bold', tablet: '14px bold', mobile: '13px bold' },
        caption: { desktop: '12px bold', tablet: '12px bold', mobile: '12px bold' },
      },
      colorContrastPairs: [
        { role: 'Latar Utama', backgroundUsage: 'Latar dasar halaman kontras tinggi', contrastRule: 'Latar Terang/Putih → Teks Hitam Solid (#000000)' },
        { role: 'Kartu Sorotan & CTA', backgroundUsage: 'Elemen penarik perhatian menggunakan warna aksen brand', contrastRule: 'Teks wajib kontras terhadap warna aksen brand' },
        { role: 'Section Kontras', backgroundUsage: 'Section penutup / hero gelap dengan kontras pekat', contrastRule: 'Latar Gelap → Teks Putih Terang (#FFFFFF)' },
      ],
    },
    referenceExamples: [
      { name: 'Gumroad', note: 'Border tebal hitam solid, warna cerah kontras tinggi', url: 'https://gumroad.com' },
      { name: 'Mailchimp', note: 'Tipografi besar playful namun tegas, ilustrasi custom berani', url: 'https://mailchimp.com' },
      { name: 'Cash App', note: 'Warna solid mencolok, tipografi besar penuh percaya diri', url: 'https://cash.app' },
      { name: 'Basecamp', note: 'Headline besar to-the-point, elemen grafis tegas', url: 'https://basecamp.com' },
    ],
  },
  {
    id: 'bento-modular',
    name: 'Bento Modular',
    tagline: 'Padat informasi, rapi, dan scannable',
    bestFor: ['SaaS', 'Technology', 'Startup', 'Marketplace'],
    recommendedDensity: 'rich',
    rules: {
      layoutPattern: 'Kotak-kotak modular ukuran bervariasi menyusun fitur dalam satu grid per section',
      borderRadius: 'Sedang-besar (12–24px) khusus tiap "kotak"',
      shadow: 'Lembut hanya di border kotak, elevasi ringan',
      colorApproach: 'Latar netral dengan 1–2 kotak bento beraksen warna brand kuat sebagai focal point visual',
      typography: 'Sans-serif modern, ukuran bervariasi sesuai ukuran kotak',
      imagery: 'Ikon custom, mini-chart/preview UI, screenshot produk di dalam kotak',
      forbidden: ['grid kotak berukuran seragam semua', 'mengabaikan reflow ke single-column di mobile'],
      typographyScale: {
        h1: { desktop: '48px bold', tablet: '38px bold', mobile: '30px bold' },
        h2: { desktop: '36px bold', tablet: '30px bold', mobile: '24px bold' },
        h3: { desktop: '26px semibold', tablet: '22px semibold', mobile: '20px semibold' },
        h4: { desktop: '20px semibold', tablet: '19px semibold', mobile: '18px semibold' },
        bodyLarge: { desktop: '18px regular', tablet: '17px regular', mobile: '16px regular' },
        body: { desktop: '16px regular', tablet: '15px regular', mobile: '15px regular' },
        bodySmall: { desktop: '14px regular', tablet: '14px regular', mobile: '13px regular' },
        caption: { desktop: '12px medium', tablet: '12px medium', mobile: '12px medium' },
      },
      colorContrastPairs: [
        { role: 'Latar Grid', backgroundUsage: 'Latar kanvas pembungkus kotak bento', contrastRule: 'Latar Terang → Teks Gelap (#09090B)' },
        { role: 'Kotak Bento Standar', backgroundUsage: 'Kotak modul fitur standar dengan latar netral halus', contrastRule: 'Latar Muted → Teks Gelap (#09090B)' },
        { role: 'Kotak Bento Highlight', backgroundUsage: 'Kotak modul unggulan / CTA menggunakan warna brand/aksen', contrastRule: 'Teks otomatis menyesuaikan kontras warna brand' },
      ],
    },
    referenceExamples: [
      { name: 'Linear', note: 'Bento grid panggung fitur utama dengan kustomisasi visual rapi', url: 'https://linear.app' },
      { name: 'Notion', note: 'Kotak fitur bervariasi ukuran, preview produk di dalam kartu', url: 'https://www.notion.so' },
      { name: 'Raycast', note: 'Grid modular gelap dengan mini-preview UI', url: 'https://www.raycast.com' },
      { name: 'Arc Browser', note: 'Kotak-kotak berwarna dengan highlight fitur individual', url: 'https://arc.net' },
    ],
  },
  {
    id: 'editorial-elegant',
    name: 'Editorial Elegant',
    tagline: 'Naratif, seperti membaca majalah premium',
    bestFor: ['Personal Branding', 'Education', 'Blog', 'Medical', 'NGO'],
    recommendedDensity: 'minimal',
    rules: {
      layoutPattern: 'Tipografi besar sebagai elemen visual utama, narasi terungkap bertahap saat scroll',
      borderRadius: 'Minimal, fokus ke garis pembatas tipis',
      shadow: 'Nyaris tidak ada — mengandalkan garis/divider dan whitespace',
      colorApproach: 'Nuansa monokromatik / duotone terkurasi, aksen warna brand digunakan sangat selektif dan elegan',
      typography: 'Serif tebal heading + sans-serif body, ukuran heading sangat besar',
      imagery: 'Foto editorial berkualitas tinggi, full-width di antara blok teks',
      forbidden: ['layout kotak-kotak/card grid ala bento', 'warna cerah/saturasi tinggi lebih dari 1 aksen'],
      typographyScale: {
        h1: { desktop: '56px bold', tablet: '42px bold', mobile: '32px bold' },
        h2: { desktop: '40px bold', tablet: '32px bold', mobile: '26px bold' },
        h3: { desktop: '30px semibold', tablet: '25px semibold', mobile: '22px semibold' },
        h4: { desktop: '22px semibold', tablet: '20px semibold', mobile: '18px semibold' },
        bodyLarge: { desktop: '20px regular', tablet: '18px regular', mobile: '16px regular' },
        body: { desktop: '17px regular', tablet: '16px regular', mobile: '15px regular' },
        bodySmall: { desktop: '14px regular', tablet: '14px regular', mobile: '13px regular' },
        caption: { desktop: '12px medium', tablet: '12px medium', mobile: '12px medium' },
      },
      colorContrastPairs: [
        { role: 'Latar Bacaan', backgroundUsage: 'Latar utama halaman berfokus kenyamanan membaca', contrastRule: 'Latar Terang/Cream → Teks Charcoal Gelap (#1C1917)' },
        { role: 'Blok Kutipan & Narasi', backgroundUsage: 'Container kutipan dan cerita brand', contrastRule: 'Latar Lembut → Teks Charcoal (#1C1917)' },
        { role: 'Header / Footer Elegan', backgroundUsage: 'Header & Footer kontras berwibawa', contrastRule: 'Latar Gelap → Teks Terang (#FAFAFA)' },
      ],
    },
    referenceExamples: [
      { name: 'Aesop', note: 'Warna hangat tenang, tipografi elegan dan terkurasi', url: 'https://www.aesop.com' },
      { name: 'Kinfolk', note: 'Tipografi serif besar, fokus membaca narasi', url: 'https://kinfolk.com' },
      { name: 'Monocle', note: 'Gaya majalah premium, grid editorial rapi', url: 'https://monocle.com' },
      { name: 'Medium', note: 'Tipografi bacaan besar, whitespace dominan', url: 'https://medium.com' },
    ],
  },
  {
    id: 'playful-organic',
    name: 'Playful Organic',
    tagline: 'Hangat, ramah, dan terasa buatan tangan',
    bestFor: ['UMKM', 'Restaurant', 'NGO', 'Travel', 'Event'],
    recommendedDensity: 'rich',
    rules: {
      layoutPattern: 'Bentuk melengkung asimetris (blob) sebagai dekorasi, bukan grid kaku',
      borderRadius: 'Besar dan tidak seragam (rounded-3xl atau custom blob)',
      shadow: 'Lembut dan hangat (sedikit tinted, bukan abu netral)',
      colorApproach: 'Warna brand diaplikasikan hangat dan ceria (bukan neon), kombinasi harmonis yang ramah',
      typography: 'Sans-serif membulat/friendly, sesekali handwritten untuk aksen',
      imagery: 'Ilustrasi custom playful, foto candid/lifestyle asli',
      forbidden: ['grid kotak tegas/simetris sempurna ala korporat', 'palet monokrom/dingin'],
      typographyScale: {
        h1: { desktop: '46px bold', tablet: '36px bold', mobile: '30px bold' },
        h2: { desktop: '34px bold', tablet: '28px bold', mobile: '24px bold' },
        h3: { desktop: '26px semibold', tablet: '22px semibold', mobile: '20px semibold' },
        h4: { desktop: '20px semibold', tablet: '18px semibold', mobile: '17px semibold' },
        bodyLarge: { desktop: '18px regular', tablet: '17px regular', mobile: '16px regular' },
        body: { desktop: '16px regular', tablet: '16px regular', mobile: '15px regular' },
        bodySmall: { desktop: '14px medium', tablet: '14px medium', mobile: '13px medium' },
        caption: { desktop: '12px bold', tablet: '12px bold', mobile: '12px bold' },
      },
      colorContrastPairs: [
        { role: 'Latar Organik', backgroundUsage: 'Latar dasar halaman hangat dan bersahabat', contrastRule: 'Latar Terang Hangat → Teks Warm Dark (#292524)' },
        { role: 'Kartu Produk & Fitur', backgroundUsage: 'Container interaktif dengan sudut membulat', contrastRule: 'Latar Lembut → Teks Warm Dark (#292524)' },
        { role: 'Footer & CTA Ceria', backgroundUsage: 'Footer dan tombol aksi brand', contrastRule: 'Teks otomatis kontras terhadap latar warna brand' },
      ],
    },
    referenceExamples: [
      { name: 'Duolingo', note: 'Sudut membulat playful dan ramah', url: 'https://www.duolingo.com' },
      { name: 'Oatly', note: 'Ilustrasi unik, terasa buatan tangan', url: 'https://www.oatly.com' },
      { name: 'Innocent Drinks', note: 'Warna cerah hangat, copy santai dan bersahabat', url: 'https://www.innocentdrinks.co.uk' },
      { name: "Ben & Jerry's", note: 'Bentuk organik, warna ceria harmonis', url: 'https://www.benjerry.com' },
    ],
  },
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    tagline: 'Eksklusif, premium, dan berkelas',
    bestFor: ['Real Estate', 'Wedding', 'Finance', 'Custom'],
    recommendedDensity: 'standard',
    rules: {
      layoutPattern: 'Layar gelap dominan, elemen penting disorot dengan spacing besar & glow tipis',
      borderRadius: 'Kecil-sedang, presisi, konsisten',
      shadow: 'Glow effect tipis (bukan shadow gelap standar) di elemen highlight',
      colorApproach: 'Nuansa kanvas gelap/obsidian elegan dengan aksen warna brand berkesan premium/eksklusif',
      typography: 'Serif elegan atau sans-serif tipis (light weight), tracking lebar di heading',
      imagery: 'Foto grading gelap/moody, detail material premium',
      forbidden: ['latar putih/terang di section utama', 'warna aksen cerah/pastel'],
      typographyScale: {
        h1: { desktop: '52px light', tablet: '40px light', mobile: '32px light' },
        h2: { desktop: '38px light', tablet: '30px light', mobile: '24px light' },
        h3: { desktop: '28px regular', tablet: '24px regular', mobile: '20px regular' },
        h4: { desktop: '22px regular', tablet: '20px regular', mobile: '18px regular' },
        bodyLarge: { desktop: '18px light', tablet: '17px light', mobile: '16px light' },
        body: { desktop: '16px light', tablet: '15px light', mobile: '15px light' },
        bodySmall: { desktop: '14px regular', tablet: '14px regular', mobile: '13px regular' },
        caption: { desktop: '12px medium', tablet: '12px medium', mobile: '12px medium' },
      },
      colorContrastPairs: [
        { role: 'Kanvas Gelap Mewah', backgroundUsage: 'Latar dasar obsidian/charcoal gelap', contrastRule: 'Latar Gelap → Teks Metallic Light (#F1F5F9)' },
        { role: 'Kartu Elevasi Gelap', backgroundUsage: 'Kartu dan kontainer fitur melayang gelap', contrastRule: 'Latar Gelap → Teks Light (#F8FAFC)' },
        { role: 'CTA & Tombol Brand', backgroundUsage: 'Tombol aksi utama menggunakan warna aksen brand klien', contrastRule: 'Teks wajib kontras terhadap warna aksen brand' },
      ],
    },
    referenceExamples: [
      { name: 'Bentley Motors', note: 'Penggunaan layar gelap elegan dan tipografi tracking lebar', url: 'https://www.bentleymotors.com' },
      { name: 'Rolex', note: 'Foto produk tajam pada latar obsidian gelap', url: 'https://www.rolex.com' },
      { name: 'Aman', note: 'Layout gelap mewah, spacing besar, foto premium', url: 'https://www.aman.com' },
      { name: 'The Macallan', note: 'Aksen emas di atas latar gelap, kesan eksklusif', url: 'https://www.themacallan.com' },
    ],
  },
  {
    id: 'warm-craftsmanship',
    name: 'Warm Craftsmanship',
    tagline: 'Kokoh, terpercaya, dan menunjukkan keahlian tangan',
    bestFor: ['Construction', 'Manufacturing', 'Real Estate', 'Agency'],
    recommendedDensity: 'standard',
    rules: {
      layoutPattern: 'Grid tegas dengan foto proses/hasil kerja besar sebagai bukti kredibilitas (before-after, progres proyek) — bukan ilustrasi abstrak',
      borderRadius: 'Kecil-sedang (6–12px), terasa presisi seperti hasil konstruksi rapi',
      shadow: 'Medium solid untuk kesan material pada card, bukan shadow tipis minimalis maupun hard-shadow brutalist',
      colorApproach: 'Warna brand diaplikasikan solid dan tegas, aksen warna khusus difokuskan pada tombol CTA utama',
      typography: 'Sans-serif tegas/berat untuk heading (kesan kokoh), sans-serif reguler untuk body',
      imagery: 'Foto dokumentasi proyek asli, before-after, detail material/tekstur (kayu, semen, kabinet) — bukan foto stok generik',
      forbidden: ['ilustrasi flat kartun untuk hero utama', 'palet pastel lembut', 'foto stok generik orang berjabat tangan dengan gradient overlay'],
      typographyScale: {
        h1: { desktop: '46px extrabold', tablet: '36px extrabold', mobile: '30px extrabold' },
        h2: { desktop: '34px bold', tablet: '28px bold', mobile: '24px bold' },
        h3: { desktop: '26px bold', tablet: '22px bold', mobile: '20px bold' },
        h4: { desktop: '20px semibold', tablet: '19px semibold', mobile: '18px semibold' },
        bodyLarge: { desktop: '18px regular', tablet: '17px regular', mobile: '16px regular' },
        body: { desktop: '16px regular', tablet: '16px regular', mobile: '15px regular' },
        bodySmall: { desktop: '14px medium', tablet: '14px medium', mobile: '13px medium' },
        caption: { desktop: '12px medium', tablet: '12px medium', mobile: '12px medium' },
      },
      colorContrastPairs: [
        { role: 'Latar Material', backgroundUsage: 'Latar utama halaman bertekstur kokoh dan bersih', contrastRule: 'Latar Terang → Teks Charcoal Gelap (#292524)' },
        { role: 'Badge & CTA Pekerjaan', backgroundUsage: 'Tombol aksi dan label sorotan proyek', contrastRule: 'Teks wajib kontras terhadap warna aksen brand' },
        { role: 'Footer & Banner Proyek', backgroundUsage: 'Banner penutup dan footer kokoh', contrastRule: 'Latar Gelap Steel → Teks Light (#FAF7F2)' },
      ],
    },
    referenceExamples: [
      { name: 'Caterpillar', note: 'Kontras tinggi, aksen safety, grid kokoh', url: 'https://www.cat.com' },
      { name: 'DeWalt', note: 'Warna kuning-hitam tegas, foto produk/proyek besar', url: 'https://www.dewalt.com' },
      { name: 'Milwaukee Tool', note: 'Foto dokumentasi proyek nyata, palet earth-tone', url: 'https://www.milwaukeetool.com' },
      { name: 'Bosch Professional', note: 'Tipografi tegas, foto detail material', url: 'https://www.bosch-professional.com' },
    ],
  },
  {
    id: 'classic-heritage',
    name: 'Classic Heritage',
    tagline: 'Formal, kredibel, dan berwibawa',
    bestFor: ['Government', 'Law Firm', 'NGO', 'Education', 'Medical'],
    recommendedDensity: 'standard',
    rules: {
      layoutPattern: 'Struktur simetris konservatif, hierarki jelas dan konvensional, lambang/sertifikasi ditonjolkan',
      borderRadius: 'Minimal (0–4px), kesan institusional',
      shadow: 'Sangat halus, hanya pemisah kartu dokumen/berita',
      colorApproach: 'Warna brand formal dan solid dipadu warna netral institusional yang kredibel dan berwibawa',
      typography: 'Serif untuk heading (kesan otoritas) atau sans-serif tegas formal, body sans-serif standar',
      imagery: 'Foto resmi/formal (fasilitas, dokumen, kegiatan), ikon lambang/badge — hindari foto kasual',
      forbidden: ['warna cerah playful', 'ilustrasi kartun', 'layout asimetris eksperimental'],
      typographyScale: {
        h1: { desktop: '44px bold', tablet: '34px bold', mobile: '28px bold' },
        h2: { desktop: '32px bold', tablet: '27px bold', mobile: '22px bold' },
        h3: { desktop: '24px semibold', tablet: '21px semibold', mobile: '19px semibold' },
        h4: { desktop: '20px semibold', tablet: '18px semibold', mobile: '17px semibold' },
        bodyLarge: { desktop: '18px regular', tablet: '17px regular', mobile: '16px regular' },
        body: { desktop: '16px regular', tablet: '16px regular', mobile: '15px regular' },
        bodySmall: { desktop: '14px regular', tablet: '14px regular', mobile: '13px regular' },
        caption: { desktop: '12px medium', tablet: '12px medium', mobile: '12px medium' },
      },
      colorContrastPairs: [
        { role: 'Latar Institusional', backgroundUsage: 'Latar utama halaman formal dan bersih', contrastRule: 'Latar Putih/Terang → Teks Gelap Institusional (#1E293B)' },
        { role: 'Kartu Dokumen & Berita', backgroundUsage: 'Container pengumuman dan modul informasi', contrastRule: 'Latar Muted Formal → Teks Gelap (#1E293B)' },
        { role: 'Header & Footer Resmi', backgroundUsage: 'Header navigasi dan footer otoritas', contrastRule: 'Latar Gelap Formal → Teks Terang (#F8FAFC)' },
      ],
    },
    referenceExamples: [
      { name: 'GOV.UK', note: 'Aksesibilitas maksimal, struktur formal simetris', url: 'https://www.gov.uk' },
      { name: 'Harvard University', note: 'Tipografi serif wibawa dengan warna institusional', url: 'https://www.harvard.edu' },
      { name: 'University of Oxford', note: 'Struktur konservatif, warna navy formal', url: 'https://www.ox.ac.uk' },
      { name: 'World Health Organization', note: 'Layout resmi, ikon lembaga ditonjolkan', url: 'https://www.who.int' },
    ],
  },
  {
    id: 'neo-brutalism',
    name: 'Neo-Brutalism',
    tagline: 'Mentah, berani, ekspresif, dan kontras ekstrem',
    bestFor: ['Agency', 'Portfolio', 'Event', 'Startup', 'Creative', 'Personal Branding'],
    recommendedDensity: 'rich',
    rules: {
      layoutPattern: 'Grid blok kaku dengan border hitam tebal (2px–4px), elemen saling tumpang tindih berani, label sticker/badge mencolok',
      borderRadius: '0px (sharp corner) atau rounded-none di semua container dan tombol',
      shadow: 'Hard offset shadow hitam solid (mis. shadow-[4px_4px_0px_#000000] atau [6px_6px_0px_#000000])',
      colorApproach: 'Warna brand pop kontras tinggi dikunci oleh border hitam pekat dan hard offset shadow',
      typography: 'Sans-serif tebal berciri khas (Space Grotesk / Unbounded) dipadu monospace untuk tag/label',
      imagery: 'Ilustrasi vektor mentah, dithered photo, cutout bergaya kolase dengan stroke hitam tebal',
      forbidden: ['soft blur drop-shadow', 'rounded-xl / rounded-full pada kartu', 'gradient halus pastel', 'layout minimalis sepi ornamen'],
      typographyScale: {
        h1: { desktop: '56px black', tablet: '42px black', mobile: '32px black' },
        h2: { desktop: '40px extrabold', tablet: '32px extrabold', mobile: '26px extrabold' },
        h3: { desktop: '28px bold', tablet: '24px bold', mobile: '20px bold' },
        h4: { desktop: '22px bold', tablet: '20px bold', mobile: '18px bold' },
        bodyLarge: { desktop: '18px bold', tablet: '17px bold', mobile: '16px bold' },
        body: { desktop: '16px medium', tablet: '16px medium', mobile: '15px medium' },
        bodySmall: { desktop: '14px bold font-mono', tablet: '14px bold font-mono', mobile: '13px bold font-mono' },
        caption: { desktop: '12px bold font-mono', tablet: '12px bold font-mono', mobile: '12px bold font-mono' },
      },
      colorContrastPairs: [
        { role: 'Latar Blok Raw', backgroundUsage: 'Latar utama kanvas neobrutalist', contrastRule: 'Latar Terang → Teks Hitam Solid (#000000) dengan border tegas' },
        { role: 'Kartu Sorotan & CTA', backgroundUsage: 'Kartu blok aksi menggunakan warna aksen brand', contrastRule: 'Teks wajib kontras terhadap warna aksen brand' },
        { role: 'Badge & Aksen Sekunder', backgroundUsage: 'Sticker label dan elemen interaktif', contrastRule: 'Teks Solid Black (#000000) atau Putih sesuai kontras' },
      ],
    },
    referenceExamples: [
      { name: 'Figma Blog', note: 'Border tebal solid, warna pop kontras, offset shadow kaku', url: 'https://www.figma.com/blog' },
      { name: 'Gumroad', note: 'Gaya neobrutalist klasik dengan hard shadow dan tipografi tegas', url: 'https://gumroad.com' },
      { name: 'Dribbble Shots (Neubrutalism)', note: 'Layout berbasis blok kaku dan aksen warna terang berani', url: 'https://dribbble.com/tags/neubrutalism' },
    ],
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    tagline: 'Futuristis, transparan, dan modern',
    bestFor: ['SaaS', 'Technology', 'Finance', 'Startup', 'Crypto/Web3'],
    recommendedDensity: 'standard',
    rules: {
      layoutPattern: 'Kartu semi-transparan melayang di atas latar bertekstur/gradient bokeh lembut, border frosted tipis',
      borderRadius: 'Sedang-besar (16px–24px) dengan tepian berkilau halus',
      shadow: 'Soft glow ambient shadow dan inset highlight di tepi kartu',
      colorApproach: 'Latar belakang dengan kartu semi-transparan (backdrop-blur), aksen warna brand berpendar pada tombol interaktif',
      typography: 'Sans-serif ultra-modern (Inter / Space Grotesk / Sora) dengan kontras tinggi',
      imagery: '3D glass render, elemen kristal transparan, ikon neon berpendar',
      forbidden: ['border hitam tebal', 'hard offset shadow solid', 'latar polos flat tanpa kedalaman/gradient/mesh'],
      typographyScale: {
        h1: { desktop: '50px bold', tablet: '38px bold', mobile: '30px bold' },
        h2: { desktop: '36px bold', tablet: '30px bold', mobile: '24px bold' },
        h3: { desktop: '26px semibold', tablet: '22px semibold', mobile: '20px semibold' },
        h4: { desktop: '20px semibold', tablet: '19px semibold', mobile: '18px semibold' },
        bodyLarge: { desktop: '18px regular', tablet: '17px regular', mobile: '16px regular' },
        body: { desktop: '16px regular', tablet: '15px regular', mobile: '15px regular' },
        bodySmall: { desktop: '14px regular', tablet: '14px regular', mobile: '13px regular' },
        caption: { desktop: '12px medium', tablet: '12px medium', mobile: '12px medium' },
      },
      colorContrastPairs: [
        { role: 'Latar Belakang Depth', backgroundUsage: 'Latar dasar kanvas berkedalaman dengan gradient/mesh halus', contrastRule: 'Latar Gelap/Deep → Teks Crisp Light (#FFFFFF)' },
        { role: 'Kartu Glass Frosted', backgroundUsage: 'Kartu semi-transparan (backdrop-blur) mengambang', contrastRule: 'Teks Crisp Light (#F8FAFC) dengan kontras terbaca jelas' },
        { role: 'CTA & Tombol Interaktif', backgroundUsage: 'Tombol aksi utama berbasis warna brand berpendar', contrastRule: 'Teks wajib kontras terhadap warna brand' },
      ],
    },
    referenceExamples: [
      { name: 'Apple iOS / macOS', note: 'Pelopor efek kaca frosted dan blur transparan bermutu tinggi', url: 'https://www.apple.com/os' },
      { name: 'Linear', note: 'Kartu gelap semi-transparan dengan border frosted presisi', url: 'https://linear.app' },
      { name: 'Vercel Analytics', note: 'Panel transparan di atas latar mesh gradient', url: 'https://vercel.com' },
    ],
  },
  {
    id: 'aurora-gradient',
    name: 'Aurora Gradient',
    tagline: 'Sinematik, dinamis, dan memukau secara visual',
    bestFor: ['AI App', 'SaaS', 'Startup', 'Technology', 'Creative'],
    recommendedDensity: 'standard',
    rules: {
      layoutPattern: 'Pendaran cahaya aurora berwarna-warni mengalir lembut di latar belakang, memandu pandangan mata ke elemen utama',
      borderRadius: 'Besar dan halus (16px–28px atau rounded-3xl)',
      shadow: 'Colored ambient glow (shadow warna selaras dengan gradient aurora di sekitarnya)',
      colorApproach: 'Pendaran cahaya gradient halus dari warna brand di latar belakang, memandu fokus ke CTA',
      typography: 'Sans-serif display futuristis dengan tracking sedikit renggang di heading',
      imagery: 'Cahaya berpendar, blob mesh gradient teranimasi halus, grafik abstrak berkilau',
      forbidden: ['border tebal kaku', 'hard shadow hitam', 'latar serba putih polos tanpa efek pendaran'],
      typographyScale: {
        h1: { desktop: '52px extrabold', tablet: '40px extrabold', mobile: '32px extrabold' },
        h2: { desktop: '38px bold', tablet: '30px bold', mobile: '24px bold' },
        h3: { desktop: '28px semibold', tablet: '24px semibold', mobile: '20px semibold' },
        h4: { desktop: '22px semibold', tablet: '20px semibold', mobile: '18px semibold' },
        bodyLarge: { desktop: '18px regular', tablet: '17px regular', mobile: '16px regular' },
        body: { desktop: '16px regular', tablet: '15px regular', mobile: '15px regular' },
        bodySmall: { desktop: '14px regular', tablet: '14px regular', mobile: '13px regular' },
        caption: { desktop: '12px medium font-mono', tablet: '12px medium font-mono', mobile: '12px medium font-mono' },
      },
      colorContrastPairs: [
        { role: 'Latar Kosmik Gelap', backgroundUsage: 'Latar utama gelap dengan pendaran gradient aurora', contrastRule: 'Latar Gelap Obsidian → Teks Pure Light (#F9FAFB)' },
        { role: 'Panggung Fitur Aurora', backgroundUsage: 'Kartu sorotan dan container hero bernuansa pendaran', contrastRule: 'Latar Gelap Berpendar → Teks Light (#F3F4F6)' },
        { role: 'Tombol Aksi Gradient', backgroundUsage: 'Tombol aksi utama menggunakan gradasi warna brand', contrastRule: 'Teks wajib kontras terhadap gradasi warna brand' },
      ],
    },
    referenceExamples: [
      { name: 'OpenAI / ChatGPT', note: 'Latar pendaran cahaya abstrak yang elegan dan futuristis', url: 'https://openai.com' },
      { name: 'Stripe Press', note: 'Gradasi warna cair mengalir lembut di latar belakang', url: 'https://press.stripe.com' },
      { name: 'Reflect App', note: 'Efek aurora berpendar dengan estetika aplikasi catatan AI', url: 'https://reflect.app' },
    ],
  },
  {
    id: 'claymorphism',
    name: 'Claymorphism',
    tagline: '3D lembut, kenyal, dan taktil seperti tanah liat',
    bestFor: ['Education', 'UMKM', 'Playful Startup', 'Children', 'Gaming'],
    recommendedDensity: 'rich',
    rules: {
      layoutPattern: 'Elemen kartu dan tombol 3D kenyal dengan gabungan inner-shadow dan outer-shadow lembut, terasa bisa ditekan',
      borderRadius: 'Sangat besar dan membulat (24px–36px atau rounded-3xl/full)',
      shadow: 'Ganda: inner shadow terang di atas + inner shadow gelap di bawah + soft outer drop shadow melayang',
      colorApproach: 'Warna brand diaplikasikan pada elemen 3D kenyal dengan inner shadow lembut yang taktil',
      typography: 'Sans-serif membulat dan ramah (Quicksand / Nunito / Poppins)',
      imagery: 'Maskot 3D clay render, ikon 3D membulat kenyal, ilustrasi bergaya karakter tanah liat',
      forbidden: ['sudut tajam (rounded-none)', 'hard border hitam tebal', 'layout korporat kaku/dingin'],
      typographyScale: {
        h1: { desktop: '48px extrabold', tablet: '38px extrabold', mobile: '30px extrabold' },
        h2: { desktop: '36px bold', tablet: '30px bold', mobile: '24px bold' },
        h3: { desktop: '26px bold', tablet: '22px bold', mobile: '20px bold' },
        h4: { desktop: '20px bold', tablet: '18px bold', mobile: '17px bold' },
        bodyLarge: { desktop: '18px medium', tablet: '17px medium', mobile: '16px medium' },
        body: { desktop: '16px medium', tablet: '16px medium', mobile: '15px medium' },
        bodySmall: { desktop: '14px bold', tablet: '14px bold', mobile: '13px bold' },
        caption: { desktop: '12px bold', tablet: '12px bold', mobile: '12px bold' },
      },
      colorContrastPairs: [
        { role: 'Latar Lembut Taktil', backgroundUsage: 'Latar utama kanvas 3D clay halus', contrastRule: 'Latar Terang Pastel → Teks Soft Charcoal (#2D3748)' },
        { role: 'Kartu Konten 3D', backgroundUsage: 'Kartu 3D membulat dengan double inner shadow', contrastRule: 'Latar Lembut 3D → Teks Soft Charcoal (#2D3748)' },
        { role: 'Tombol CTA Kenyal', backgroundUsage: 'Tombol interaktif 3D kenyal berbasis warna aksen brand', contrastRule: 'Teks wajib kontras terhadap warna aksen brand' },
      ],
    },
    referenceExamples: [
      { name: 'Pitch.com', note: 'Elemen 3D lembut dengan estetika claymorphism bermutu tinggi', url: 'https://pitch.com' },
      { name: 'Duolingo Math', note: 'Komponen 3D membulat ramah anak dan mudah ditekan', url: 'https://www.duolingo.com' },
      { name: 'Headspace', note: 'Karakter 3D lembut dan bentuk kenyal menenangkan', url: 'https://www.headspace.com' },
    ],
  },
];


export const DESIGN_DENSITIES: DesignDensityRule[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Lega, tenang, fokus',
    sectionPaddingDesktop: '120px - 160px',
    sectionPaddingTablet: '90px - 120px',
    sectionPaddingMobile: '64px - 90px',
    itemsPerGridRow: '1-2 kolom, fokus satu hal per section',
    animationLevel: 'Minimal',
    imageryDensity: '1 foto/ilustrasi hero besar per section, minim ornamen',
    copyDensity: 'Singkat, whitespace dominan',
  },
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'Seimbang, umum dipakai',
    sectionPaddingDesktop: '80px - 120px',
    sectionPaddingTablet: '60px - 90px',
    sectionPaddingMobile: '48px - 64px',
    itemsPerGridRow: '3-4 kolom (default umum)',
    animationLevel: 'Medium',
    imageryDensity: '1-2 foto + ikon pendukung',
    copyDensity: 'Standar, deskripsi secukupnya',
  },
  {
    id: 'rich',
    name: 'Rich',
    tagline: 'Padat, banyak bukti/detail',
    sectionPaddingDesktop: '60px - 90px',
    sectionPaddingTablet: '48px - 64px',
    sectionPaddingMobile: '40px - 56px',
    itemsPerGridRow: '4-6 kolom atau nested multi-row',
    animationLevel: 'Premium',
    imageryDensity: 'Multi-foto/galeri/mosaic, badge dekoratif, stats counter',
    copyDensity: 'Detail, ada sub-bullet/spec table tambahan',
  },
];

export const WEBSITE_TYPE_TO_MOOD_MAP: Record<string, { moodId: string; density: 'minimal' | 'standard' | 'rich' }> = {
  'Company Profile': { moodId: 'modern-minimalist', density: 'standard' },
  'Landing Page': { moodId: 'bold-modern', density: 'standard' },
  'Agency': { moodId: 'bold-modern', density: 'rich' },
  'Portfolio': { moodId: 'editorial-elegant', density: 'minimal' },
  'Startup': { moodId: 'bento-modular', density: 'standard' },
  'SaaS': { moodId: 'bento-modular', density: 'rich' },
  'Restaurant': { moodId: 'playful-organic', density: 'rich' },
  'Law Firm': { moodId: 'classic-heritage', density: 'minimal' },
  'Medical': { moodId: 'classic-heritage', density: 'standard' },
  'Education': { moodId: 'editorial-elegant', density: 'standard' },
  'Travel': { moodId: 'playful-organic', density: 'rich' },
  'Construction': { moodId: 'warm-craftsmanship', density: 'standard' },
  'Manufacturing': { moodId: 'warm-craftsmanship', density: 'standard' },
  'UMKM': { moodId: 'playful-organic', density: 'standard' },
  'Government': { moodId: 'classic-heritage', density: 'minimal' },
  'NGO': { moodId: 'editorial-elegant', density: 'standard' },
  'Blog': { moodId: 'editorial-elegant', density: 'minimal' },
  'Marketplace': { moodId: 'bento-modular', density: 'rich' },
  'Personal Branding': { moodId: 'editorial-elegant', density: 'minimal' },
  'Event': { moodId: 'bold-modern', density: 'rich' },
  'Wedding': { moodId: 'dark-luxury', density: 'standard' },
  'Real Estate': { moodId: 'dark-luxury', density: 'standard' },
  'Finance': { moodId: 'modern-minimalist', density: 'minimal' },
  'Insurance': { moodId: 'modern-minimalist', density: 'standard' },
  'Technology': { moodId: 'bento-modular', density: 'standard' },
  'Custom': { moodId: 'modern-minimalist', density: 'standard' },
};

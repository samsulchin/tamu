/* Tamu — pencarian kutipan kitab 4 mazhab secara offline.
 * Data: data/kitab.js (bab haid/nifas/istihadhah dari korpus OpenITI), dimuat hanya saat dibutuhkan.
 * Pertanyaan berbahasa Indonesia dipetakan ke istilah fikih Arab, lalu kutipan dinilai per mazhab.
 */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';

  const MZ = {
    hanafi: { name: 'Hanafi', short: 'HNF' },
    maliki: { name: 'Maliki', short: 'MLK' },
    syafii: { name: "Syafi'i", short: 'SYF' },
    hanbali: { name: 'Hanbali', short: 'HNB' },
    muqaran: { name: 'Perbandingan mazhab', short: 'MQR' },
  };
  const ORDER = ['hanafi', 'maliki', 'syafii', 'hanbali', 'muqaran'];

  /** Normalisasi teks Arab: buang harakat/tatwil, seragamkan alif, ya, ta marbuthah, hamzah. */
  function normAr(s) {
    return String(s)
      .replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
  }
  const HAS_AR = /[؀-ۿ]/;

  // Konsep: kata Indonesia (setelah normalisasi QA) → potongan kata Arab (sudah dinormalisasi) + bobot
  const CONCEPTS = [
    { k: ['haid', 'darah'], ar: ['حيض', 'حايض'], w: 0.3 },
    { k: ['nifas', 'melahirkan', 'lahir', 'bersalin', 'persalinan'], ar: ['نفاس', 'نفسا', 'ولاده', 'الولد'], w: 2 },
    { k: ['istihadhah'], ar: ['استحاض', 'مستحاض'], w: 2 },
    { k: ['minimal', 'minimum', 'sedikit', 'singkat', 'tersingkat'], ar: ['اقل'], w: 2 },
    { k: ['maksimal', 'maksimum', 'lama', 'terlama', 'batas'], ar: ['اكثر'], w: 2 },
    { k: ['suci', 'bersih', 'selesai', 'berhenti'], ar: ['طهر', 'نقاء', 'انقطع', 'انقطاع'], w: 1.5 },
    { k: ['flek', 'kuning', 'shufrah', 'coklat', 'keruh', 'kudrah'], ar: ['صفره', 'كدره'], w: 3 },
    { k: ['warna', 'hitam', 'merah', 'tamyiz', 'membedakan', 'sifat', 'kental'], ar: ['اسود', 'احمر', 'تمييز', 'مميزه', 'لون'], w: 2 },
    { k: ['kebiasaan', 'adah', 'biasa', 'rutin', 'teratur'], ar: ['عاده', 'معتاده'], w: 2 },
    { k: ['pertama', 'mubtadaah', 'baru'], ar: ['مبتداه'], w: 2 },
    { k: ['hamil', 'kehamilan', 'mengandung'], ar: ['حامل', 'الحمل', 'حبلي'], w: 3 },
    { k: ['keguguran', 'gumpalan', 'janin'], ar: ['سقط', 'علقه', 'مضغه'], w: 3 },
    { k: ['shalat'], ar: ['صلاه', 'الصلوات'], w: 1.5 },
    { k: ['qadha'], ar: ['قضاء', 'تقضي', 'يقضي', 'قضاو'], w: 2 },
    { k: ['puasa', 'ramadhan'], ar: ['صوم', 'صيام', 'رمضان'], w: 2 },
    { k: ['alquran', 'ngaji', 'tilawah', 'membaca', 'baca', 'hafalan', 'ayat'], ar: ['قران', 'قراءه', 'يقرا', 'تقرا'], w: 3 },
    { k: ['mushaf', 'menyentuh', 'pegang', 'sentuh', 'memegang'], ar: ['مصحف'], w: 3 },
    { k: ['masjid', 'musholla', 'itikaf'], ar: ['مسجد', 'لبث', 'اعتكاف'], w: 3 },
    { k: ['thawaf', 'tawaf', 'haji', 'umrah'], ar: ['طواف'], w: 3 },
    { k: ['hubungan', 'jima', 'suami', 'intim', 'bercampur', 'bercumbu'], ar: ['وطء', 'وطي', 'جماع', 'يطا', 'الزوج', 'استمتاع'], w: 3 },
    { k: ['kafarat', 'denda', 'dinar', 'sedekah'], ar: ['كفاره', 'دينار', 'يتصدق'], w: 3 },
    { k: ['mandi', 'keramas'], ar: ['غسل', 'اغتسال', 'تغتسل'], w: 2 },
    { k: ['wudhu', 'batal'], ar: ['وضوء', 'تتوضا', 'توضا'], w: 2 },
    { k: ['usia', 'umur', 'tahun', 'baligh', 'anak'], ar: ['سنين', 'تسع'], w: 2 },
    { k: ['menopause', 'monopause', 'manopause', 'tua', 'lansia'], ar: ['اياس', 'ايسه'], w: 3 },
    { k: ['24', 'jam', 'semalam'], ar: ['يوم وليله'], w: 2 },
    { k: ['15'], ar: ['خمسه عشر', 'خمس عشره'], w: 2 },
    { k: ['13'], ar: ['ثلاثه عشر', 'ثلاث عشره'], w: 3 },
    { k: ['10', 'sepuluh'], ar: ['عشره ايام', 'عشره'], w: 1.5 },
    { k: ['3', 'tiga'], ar: ['ثلاثه ايام'], w: 2 },
    { k: ['40', 'empat'], ar: ['اربعين', 'اربعون'], w: 2 },
    { k: ['60', 'enam'], ar: ['ستين', 'ستون'], w: 2 },
    { k: ['talak', 'cerai'], ar: ['طلاق'], w: 3 },
    { k: ['lagi', 'kembali', 'terputus', 'putus', 'naqa'], ar: ['تلفيق', 'النقاء', 'ثم عاد'], w: 2 },
    { k: ['pakaian', 'baju', 'najis', 'noda', 'celana'], ar: ['ثوب', 'نجس'], w: 2 },
  ];

  let data = null, norm = null, loading = null;

  /** Muat data kitab (sekali). Mengembalikan Promise<boolean>. */
  function load() {
    if (data) return Promise.resolve(true);
    if (loading) return loading;
    loading = new Promise((resolve) => {
      const done = () => {
        data = T.KITAB || null;
        if (data) norm = data.passages.map((p) => normAr(p.t));
        resolve(!!data);
      };
      if (T.KITAB) return done();
      const s = document.createElement('script');
      s.src = 'data/kitab.js';
      s.onload = done;
      s.onerror = () => { loading = null; resolve(false); };
      document.head.appendChild(s);
    });
    return loading;
  }

  function conceptsFor(text) {
    if (HAS_AR.test(text)) {
      return normAr(text).split(/[^؀-ۿ]+/).filter((w) => w.length >= 3).map((w) => ({ ar: [w], w: 2 }));
    }
    const toks = new Set();
    T.QA.norm(text).forEach((t) => { toks.add(t); toks.add(T.QA.stem(t)); });
    const out = [];
    for (const c of CONCEPTS) {
      const hit = c.k.some((k) => toks.has(k) || Array.from(toks).some((t) => t.length >= 4 && (t.startsWith(k) || k.startsWith(t)) && k.length >= 4));
      if (hit) out.push(c);
    }
    return out;
  }

  /**
   * Cari kutipan relevan. opts: {perMadhhab=2, max=9}.
   * Mengembalikan [{id, score, p, book}] diurutkan per mazhab (Hanafi, Maliki, Syafi'i, Hanbali, perbandingan).
   */
  function search(text, opts) {
    if (!data) return [];
    opts = opts || {};
    const per = opts.perMadhhab || 2, max = opts.max || 9;
    const cs = conceptsFor(text);
    const specific = cs.filter((c) => c.w >= 1.5);
    if (!specific.length) return [];
    const scored = [];
    for (let i = 0; i < norm.length; i++) {
      const t = norm[i];
      let s = 0, n = 0;
      for (const c of cs) if (c.ar.some((a) => t.includes(a))) { s += c.w; if (c.w >= 1.5) n++; }
      if (!n) continue;
      if (n >= 2) s *= 1 + 0.35 * (n - 1);
      s -= Math.max(0, t.length - 900) / 3000; // kutipan sangat panjang sedikit diturunkan
      scored.push({ id: i, score: s });
    }
    scored.sort((a, b) => b.score - a.score);
    const best = scored.length ? scored[0].score : 0;
    const picked = [], count = {};
    for (const r of scored) {
      if (r.score < Math.max(1.4, best * 0.35)) break;
      const p = data.passages[r.id], book = data.books[p.b];
      if ((count[book.mz] || 0) >= (book.mz === 'muqaran' ? 1 : per)) continue;
      count[book.mz] = (count[book.mz] || 0) + 1;
      picked.push({ id: r.id, score: r.score, p, book });
      if (picked.length >= max) break;
    }
    picked.sort((a, b) => ORDER.indexOf(a.book.mz) - ORDER.indexOf(b.book.mz) || b.score - a.score);
    return picked;
  }

  function get(id) {
    if (!data || !data.passages[id]) return null;
    const p = data.passages[id];
    return { id, p, book: data.books[p.b] };
  }

  /** "V01P018" → "jilid 1, hlm. 18" (halaman edisi digital sumber). */
  function pageLabel(pg) {
    const m = /^V(\d+)P(\d+)$/.exec(pg || '');
    if (!m) return '';
    const v = parseInt(m[1], 10), p = parseInt(m[2], 10);
    return (v > 1 ? 'jilid ' + v + ', ' : '') + 'hlm. ' + p;
  }

  T.Kitab = { load, search, get, pageLabel, MZ, ORDER, normAr, info: () => data && { books: data.books, count: data.passages.length, license: data.license, source: data.source, generated: data.generated } };
})(window.Tamu);

/* Tamu — pencarian jawaban fikih haid secara offline (tanpa AI online, tanpa mengirim pertanyaan ke mana pun). */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';

  const SYN = {
    mens: 'haid', menstruasi: 'haid', haidh: 'haid', datang: 'haid', bulan: '', mentruasi: 'haid', period: 'haid',
    solat: 'shalat', salat: 'shalat', sholat: 'shalat', sembahyang: 'shalat',
    shaum: 'puasa', saum: 'puasa', shiyam: 'puasa', ramadan: 'ramadhan', romadhon: 'ramadhan',
    quran: 'alquran', qur: 'alquran', alqur: 'alquran', mengaji: 'ngaji', tadarus: 'tilawah',
    istihadoh: 'istihadhah', istihadah: 'istihadhah', istihadlah: 'istihadhah',
    lahiran: 'melahirkan', persalinan: 'melahirkan', bersalin: 'melahirkan',
    keguguran: 'keguguran', abortus: 'keguguran', besar: 'mandi', junub: 'mandi', ghusl: 'mandi', keramas: 'keramas',
    bercak: 'flek', spotting: 'flek', coklat: 'coklat', cokelat: 'coklat', kecoklatan: 'coklat', kekuningan: 'kuning',
    intim: 'hubungan', jimak: 'jima', berhubungan: 'hubungan', suami: 'suami',
    telat: 'telat', terlambat: 'telat', mundur: 'telat', subur: 'subur', ovulasi: 'ovulasi',
    sakit: 'nyeri', kram: 'nyeri', mules: 'nyeri',
    hutang: 'qadha', utang: 'qadha', bayar: 'qadha', mengganti: 'qadha', ganti: 'qadha', qodho: 'qadha', qada: 'qadha',
    hp: 'hp', handphone: 'hp', ponsel: 'hp', gadget: 'hp',
  };
  const STOP = new Set('apa apakah bagaimana gimana kalau kalo jika bila yang dan atau di ke dari untuk saya aku sudah belum sedang lagi itu ini ada tidak gak nggak ga boleh hukum tentang saat ketika dengan dalam bisa harus perlu mau ya kah sih dong nya pada oleh juga masih hari berapa kapan'.split(' '));

  /** Angka bermakna fikih: "20 hari" → lebih 15, "12 jam" → kurang 24 jam. */
  function numbers(text) {
    return text
      .replace(/(\d+)\s*(hari|hr)\b/g, (m, n) => (+n > 15 ? ' lebih 15 hari ' : +n < 1 ? ' kurang 24 jam ' : ' ' + m + ' '))
      .replace(/(\d+)\s*jam\b/g, (m, n) => (+n < 24 ? ' kurang 24 jam ' : ' ' + m + ' '));
  }
  function norm(text) {
    return numbers(String(text).toLowerCase())
      .replace(/['’`]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (SYN[w] !== undefined ? SYN[w] : w))
      .filter((w) => w && !STOP.has(w));
  }
  const stem = (w) => w.replace(/(nya|lah|kah)$/, '').replace(/^(meng|men|mem|me|ber|di|ter|pe)(?=[a-z]{4,})/, '');

  let index = null;
  function build() {
    index = T.Content.QA.map((item, i) => {
      const keys = new Set(norm(item.k).map(stem));
      const words = new Set(norm(item.q).map(stem));
      return { i, item, keys, words };
    });
  }

  function search(text, limit) {
    if (!index) build();
    const toks = Array.from(new Set(norm(text).map(stem)));
    if (!toks.length) return [];
    const scored = index.map((e) => {
      let s = 0;
      for (const t of toks) {
        if (e.keys.has(t)) s += 3;
        else if (e.words.has(t)) s += 2;
        else if (t.length >= 4) {
          for (const k of e.keys) { if (k.startsWith(t) || t.startsWith(k)) { s += 1.5; break; } }
        }
      }
      return { s: s / Math.sqrt(toks.length + 1), item: e.item };
    }).filter((x) => x.s > 0.9);
    scored.sort((a, b) => b.s - a.s);
    return scored.slice(0, limit || 4);
  }

  const SUGGEST = [
    'Berapa lama minimal dan maksimal haid?',
    'Flek coklat termasuk haid?',
    'Suci di waktu Ashar, wajib Dzuhur juga?',
    'Bolehkah membaca Al-Qur\'an saat haid?',
    'Niat mandi wajib haid',
    'Darah keluar lebih dari 15 hari',
    'Sampai kapan batas qadha puasa?',
    'Berapa lama masa nifas?',
  ];

  T.QA = { search, SUGGEST, norm, stem };
})(window.Tamu);

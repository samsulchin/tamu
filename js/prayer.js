/* Tamu — perhitungan waktu shalat offline (astronomis).
 * Parameter mendekati kriteria Kemenag RI: Subuh 20°, Isya 18°, Ashar bayangan 1x (Syafi'i), ihtiyath +2 menit.
 * Hanya dipakai untuk analisis kewajiban shalat di awal/akhir haid; bukan pengganti jadwal resmi.
 */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;
  const sin = (d) => Math.sin(rad(d));
  const cos = (d) => Math.cos(rad(d));
  const tan = (d) => Math.tan(rad(d));
  const asin = (x) => deg(Math.asin(x));
  const acos = (x) => deg(Math.acos(Math.max(-1, Math.min(1, x))));
  const atan2 = (y, x) => deg(Math.atan2(y, x));
  const acot = (x) => deg(Math.atan(1 / x));
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

  const CITIES = [
    ['banda-aceh', 'Banda Aceh', 5.55, 95.32], ['medan', 'Medan', 3.59, 98.67], ['padang', 'Padang', -0.95, 100.35],
    ['pekanbaru', 'Pekanbaru', 0.51, 101.45], ['batam', 'Batam', 1.13, 104.05], ['jambi', 'Jambi', -1.61, 103.61],
    ['bengkulu', 'Bengkulu', -3.8, 102.27], ['palembang', 'Palembang', -2.98, 104.76], ['pangkal-pinang', 'Pangkal Pinang', -2.13, 106.11],
    ['bandar-lampung', 'Bandar Lampung', -5.43, 105.26], ['serang', 'Serang', -6.12, 106.15], ['jakarta', 'Jakarta', -6.2, 106.85],
    ['bogor', 'Bogor', -6.6, 106.8], ['bekasi', 'Bekasi', -6.24, 106.99], ['tangerang', 'Tangerang', -6.18, 106.63],
    ['depok', 'Depok', -6.4, 106.82], ['bandung', 'Bandung', -6.91, 107.61], ['tasikmalaya', 'Tasikmalaya', -7.33, 108.22],
    ['cirebon', 'Cirebon', -6.71, 108.56], ['purwokerto', 'Purwokerto', -7.42, 109.23], ['semarang', 'Semarang', -6.99, 110.42],
    ['yogyakarta', 'Yogyakarta', -7.8, 110.36], ['surakarta', 'Surakarta (Solo)', -7.57, 110.82], ['kediri', 'Kediri', -7.82, 112.01],
    ['surabaya', 'Surabaya', -7.25, 112.75], ['malang', 'Malang', -7.98, 112.63], ['jember', 'Jember', -8.17, 113.7],
    ['denpasar', 'Denpasar', -8.65, 115.22], ['mataram', 'Mataram', -8.58, 116.12], ['bima', 'Bima', -8.46, 118.73],
    ['kupang', 'Kupang', -10.17, 123.6], ['pontianak', 'Pontianak', -0.03, 109.33], ['palangka-raya', 'Palangka Raya', -2.21, 113.92],
    ['banjarmasin', 'Banjarmasin', -3.32, 114.59], ['balikpapan', 'Balikpapan', -1.27, 116.83], ['samarinda', 'Samarinda', -0.5, 117.15],
    ['tarakan', 'Tarakan', 3.3, 117.63], ['makassar', 'Makassar', -5.15, 119.43], ['pare-pare', 'Parepare', -4.01, 119.62],
    ['palu', 'Palu', -0.9, 119.87], ['kendari', 'Kendari', -3.99, 122.51], ['gorontalo', 'Gorontalo', 0.54, 123.06],
    ['manado', 'Manado', 1.47, 124.84], ['ternate', 'Ternate', 0.79, 127.38], ['ambon', 'Ambon', -3.7, 128.18],
    ['sorong', 'Sorong', -0.88, 131.25], ['manokwari', 'Manokwari', -0.86, 134.06], ['jayapura', 'Jayapura', -2.53, 140.72],
    ['merauke', 'Merauke', -8.49, 140.4], ['kuala-lumpur', 'Kuala Lumpur', 3.14, 101.69], ['singapura', 'Singapura', 1.35, 103.82],
  ].map(([id, name, lat, lng]) => ({ id, name, lat, lng }));

  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sunPos(jd) {
    const D = jd - 2451545.0;
    const g = fix(357.529 + 0.98560028 * D, 360);
    const q = fix(280.459 + 0.98564736 * D, 360);
    const L = fix(q + 1.915 * sin(g) + 0.02 * sin(2 * g), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24);
    return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - RA };
  }

  /** Sumber jadwal eksternal (jadwal resmi Kemenag yang tersimpan di perangkat). Mengembalikan objek waktu atau null. */
  let source = null;
  function setSource(fn) { source = fn; }

  /** Waktu shalat: pakai jadwal Kemenag bila tersedia untuk tanggal itu, selain itu hitung offline. */
  function times(date, lat, lng) {
    const s = source && source(date);
    return s || calc(date, lat, lng);
  }

  /** Perhitungan astronomis offline untuk tanggal lokal (y,m,d dari objek Date) di koordinat lat/lng → objek Date. */
  function calc(date, lat, lng) {
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const jd0 = julian(y, m, d) - lng / (15 * 24);
    const at = (h) => sunPos(jd0 + h / 24);
    const noon = (h) => fix(12 - at(h).eqt, 24);
    const angleTime = (angle, h, ccw) => {
      const { decl } = at(h);
      const t = acos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / 15;
      return noon(h) + (ccw ? -t : t);
    };
    const asrTime = (h) => {
      const { decl } = at(h);
      const angle = -acot(1 + tan(Math.abs(lat - decl)));
      return angleTime(angle, h, false);
    };
    // jam surya lokal
    const solar = {
      fajr: angleTime(20, 5, true),
      sunrise: angleTime(0.833, 6, true),
      dhuhr: noon(12),
      asr: asrTime(13),
      maghrib: angleTime(0.833, 18, false),
      isha: angleTime(18, 18, false),
    };
    const base = Date.UTC(y, m - 1, d);
    const ihtiyath = { fajr: 2, sunrise: -2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 };
    const out = { src: 'hitung' };
    for (const k in solar) {
      const utcH = solar[k] - lng / 15;
      out[k] = new Date(base + utcH * 36e5 + ihtiyath[k] * 6e4);
    }
    return out;
  }

  const NAMES = { fajr: 'Subuh', dhuhr: 'Dzuhur', asr: 'Ashar', maghrib: 'Maghrib', isha: 'Isya' };

  /** Jendela waktu shalat fardhu yang sedang berlaku pada waktu t. null = waktu dhuha (tidak ada shalat fardhu). */
  function windowAt(t, lat, lng) {
    t = new Date(t);
    const day = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const now = times(day, lat, lng);
    if (t < now.fajr) {
      const prev = times(new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1), lat, lng);
      return { key: 'isha', name: NAMES.isha, start: prev.isha, end: now.fajr, times: now };
    }
    if (t < now.sunrise) return { key: 'fajr', name: NAMES.fajr, start: now.fajr, end: now.sunrise, times: now };
    if (t < now.dhuhr) return { key: null, name: 'Dhuha', start: now.sunrise, end: now.dhuhr, times: now };
    if (t < now.asr) return { key: 'dhuhr', name: NAMES.dhuhr, start: now.dhuhr, end: now.asr, times: now };
    if (t < now.maghrib) return { key: 'asr', name: NAMES.asr, start: now.asr, end: now.maghrib, times: now };
    if (t < now.isha) return { key: 'maghrib', name: NAMES.maghrib, start: now.maghrib, end: now.isha, times: now };
    const next = times(new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1), lat, lng);
    return { key: 'isha', name: NAMES.isha, start: now.isha, end: next.fajr, times: now };
  }

  function city(id) { return CITIES.find((c) => c.id === id) || CITIES.find((c) => c.id === 'jakarta'); }

  T.Prayer = { CITIES, NAMES, times, calc, windowAt, city, setSource };
})(window.Tamu);

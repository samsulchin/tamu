/* Tamu — jadwal shalat resmi Bimas Islam Kemenag RI.
 * Situs bimasislam.kemenag.go.id tidak bisa dipanggil langsung dari aplikasi (tanpa CORS, dilindungi captcha),
 * jadi data Kemenag diambil lewat api.myquran.com yang menyajikan jadwal Bimas Islam per kab/kota.
 *
 * Privasi: yang dikirim HANYA ID kab/kota dan bulan. Tidak ada data haid, nama, atau PIN yang dikirim.
 * Jadwal disimpan di perangkat (ikut terenkripsi bila PIN aktif) sehingga tetap bisa dipakai offline.
 * Bila data belum tersedia, Tamu kembali ke perhitungan astronomis offline (js/prayer.js).
 */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';
  const U = T.U;
  const API = 'https://api.myquran.com/v2/sholat';
  const NAMES = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const WIT = ['PAPUA', 'MALUKU'];
  const WITA = ['BALI', 'NUSA TENGGARA', 'NTB', 'NTT', 'KALIMANTAN SELATAN', 'KALIMANTAN TIMUR', 'KALIMANTAN UTARA', 'SULAWESI', 'GORONTALO'];

  /** Zona waktu (jam dari UTC) berdasarkan provinsi. Jadwal Kemenag memakai waktu setempat. */
  function offsetOf(daerah) {
    const d = String(daerah || '').toUpperCase();
    if (WIT.some((k) => d.includes(k))) return 9;
    if (WITA.some((k) => d.includes(k))) return 8;
    return 7;
  }
  const monthKey = (d) => d.getFullYear() + '-' + U.pad(d.getMonth() + 1);

  async function getJSON(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(url, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctrl.signal });
      if (!r.ok) throw new Error('Server jadwal merespons ' + r.status);
      const j = await r.json();
      if (!j || j.status === false) throw new Error((j && j.message) || 'Data tidak ditemukan');
      return j.data;
    } finally { clearTimeout(timer); }
  }

  async function search(q) {
    q = String(q || '').replace(/[^a-zA-Z\s.]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (q.length < 3) return [];
    const data = await getJSON(API + '/kota/cari/' + encodeURIComponent(q));
    return Array.isArray(data) ? data.map((x) => ({ id: String(x.id), lokasi: x.lokasi })) : [];
  }

  function settings() { return T.Store.data && T.Store.data.settings; }
  function active() {
    const s = settings();
    return !!(s && s.jadwalSource === 'kemenag' && s.kemenag && s.kemenag.id);
  }
  function cache() {
    const d = T.Store.data;
    if (!d.jadwal || typeof d.jadwal !== 'object') d.jadwal = { cityId: null, months: {} };
    return d.jadwal;
  }

  /** Waktu shalat Kemenag untuk satu tanggal dari cache lokal, atau null. Dipasang sebagai sumber di T.Prayer. */
  function lookup(date) {
    if (!active()) return null;
    const c = T.Store.data.jadwal;
    if (!c || c.cityId !== settings().kemenag.id) return null;
    const ymd = U.ymd(date);
    const mon = c.months[ymd.slice(0, 7)];
    const row = mon && mon[ymd];
    if (!row) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    const off = c.offset || 7;
    const out = { src: 'kemenag' };
    NAMES.forEach((n, i) => {
      const [h, mi] = row[i].split(':').map(Number);
      out[n] = new Date(Date.UTC(y, m - 1, d, h, mi) - off * 36e5);
    });
    return out;
  }

  /** Bulan yang dibutuhkan: bulan ini, bulan depan, dan bulan-bulan catatan darah setahun terakhir (untuk qadha & analisis shalat). */
  function neededMonths() {
    const now = new Date();
    const want = new Set([monthKey(now), monthKey(new Date(now.getFullYear(), now.getMonth() + 1, 1))]);
    for (const p of T.Store.data.periods) {
      const s = new Date(p.start);
      if (now - s > 400 * U.DAY) continue;
      const e = p.end ? new Date(p.end) : now;
      for (let d = new Date(s.getFullYear(), s.getMonth(), 1); d <= e; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) want.add(monthKey(d));
    }
    return Array.from(want).sort();
  }

  let syncing = null;
  /** Unduh bulan yang belum ada di cache. Mengembalikan true bila ada data baru. */
  async function ensure() {
    if (!active()) return false;
    const s = settings(), c = cache();
    let fresh = false;
    if (c.cityId !== s.kemenag.id) { c.cityId = s.kemenag.id; c.months = {}; c.offset = offsetOf(s.kemenag.daerah); c.lastError = null; c.lokasi = s.kemenag.lokasi; fresh = true; }
    const want = neededMonths();
    let changed = false;
    for (const k of want) {
      if (c.months[k]) continue;
      const [y, m] = k.split('-');
      try {
        const r = await getJSON(API + '/jadwal/' + encodeURIComponent(s.kemenag.id) + '/' + y + '/' + m);
        const mon = {};
        for (const row of r.jadwal || []) mon[row.date] = [row.subuh, row.terbit, row.dzuhur, row.ashar, row.maghrib, row.isya];
        if (!Object.keys(mon).length) throw new Error('Jadwal kosong');
        c.months[k] = mon;
        if (r.daerah) {
          c.daerah = r.daerah; c.offset = offsetOf(r.daerah); s.kemenag.daerah = r.daerah;
          if (fresh) { s.city = matchFallback(r.lokasi || s.kemenag.lokasi) || provinceCity(r.daerah) || s.city; fresh = false; }
        }
        if (r.lokasi) c.lokasi = r.lokasi;
        changed = true;
        c.lastError = null;
      } catch (e) {
        c.lastError = e.name === 'AbortError' ? 'Koneksi ke server jadwal terlalu lama' : String(e.message || e);
        break;
      }
    }
    const keep = new Set(want);
    Object.keys(c.months).sort().reverse().forEach((k, i) => { if (!keep.has(k) && i >= 18) delete c.months[k]; });
    if (changed) c.updatedAt = new Date().toISOString();
    T.Store.save();
    return changed;
  }

  /** Cocokkan kota cadangan (daftar offline) dengan nama lokasi Kemenag, untuk hitungan saat offline. */
  function matchFallback(lokasi) {
    const L = String(lokasi || '').toUpperCase();
    const hit = T.Prayer.CITIES.find((c) => L.includes(c.name.replace(/\s*\(.*\)/, '').toUpperCase()));
    return hit ? hit.id : null;
  }
  /** Bila nama kab/kota tidak ada di daftar offline, pakai ibu kota provinsinya. */
  const PROV = [
    ['PAPUA BARAT DAYA', 'sorong'], ['PAPUA BARAT', 'manokwari'], ['PAPUA SELATAN', 'merauke'], ['PAPUA', 'jayapura'], ['MALUKU UTARA', 'ternate'], ['MALUKU', 'ambon'],
    ['SULAWESI UTARA', 'manado'], ['SULAWESI TENGAH', 'palu'], ['SULAWESI TENGGARA', 'kendari'], ['SULAWESI', 'makassar'], ['GORONTALO', 'gorontalo'],
    ['KALIMANTAN BARAT', 'pontianak'], ['KALIMANTAN TENGAH', 'palangka-raya'], ['KALIMANTAN SELATAN', 'banjarmasin'], ['KALIMANTAN UTARA', 'tarakan'], ['KALIMANTAN', 'samarinda'],
    ['NUSA TENGGARA BARAT', 'mataram'], ['NUSA TENGGARA', 'kupang'], ['BALI', 'denpasar'], ['JAWA TIMUR', 'surabaya'], ['YOGYAKARTA', 'yogyakarta'], ['JAWA TENGAH', 'semarang'],
    ['JAWA BARAT', 'bandung'], ['JAKARTA', 'jakarta'], ['BANTEN', 'serang'], ['LAMPUNG', 'bandar-lampung'], ['BANGKA', 'pangkal-pinang'], ['SUMATERA SELATAN', 'palembang'],
    ['BENGKULU', 'bengkulu'], ['JAMBI', 'jambi'], ['KEPULAUAN RIAU', 'batam'], ['RIAU', 'pekanbaru'], ['SUMATERA BARAT', 'padang'], ['SUMATERA UTARA', 'medan'], ['ACEH', 'banda-aceh'],
  ];
  function provinceCity(daerah) {
    const D = String(daerah || '').toUpperCase();
    const hit = PROV.find(([k]) => D.includes(k));
    return hit ? hit[1] : null;
  }

  /** Pilih kab/kota Kemenag otomatis dari kota cadangan (dipakai setelah onboarding / pengguna lama). */
  async function autoResolve() {
    const s = settings();
    if (!s || s.jadwalSource !== 'kemenag' || (s.kemenag && s.kemenag.id)) return false;
    const name = T.Prayer.city(s.city).name.replace(/\s*\(.*\)/, '');
    const list = await search(name);
    if (!list.length) return false;
    const up = name.toUpperCase();
    const pick = list.find((x) => x.lokasi === 'KOTA ' + up) || list.find((x) => x.lokasi.indexOf('KOTA ' + up) === 0) || list.find((x) => x.lokasi.indexOf('KOTA') === 0) || list[0];
    s.kemenag = { id: pick.id, lokasi: pick.lokasi, daerah: '' };
    return true;
  }

  /** Sinkron di latar: aman dipanggil berkali-kali. */
  function sync() {
    if (syncing) return syncing;
    if (!T.Store.data || T.Store.locked || !settings().onboarded || settings().jadwalSource !== 'kemenag') return Promise.resolve(false);
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(false);
    syncing = (async () => {
      try {
        const resolved = await autoResolve();
        const changed = await ensure();
        return resolved || changed;
      } catch (e) {
        cache().lastError = String(e.message || e);
        return false;
      } finally { syncing = null; }
    })();
    return syncing;
  }

  /** Keterangan sumber jadwal untuk tanggal tertentu. */
  function label(date) {
    const t = lookup(date || new Date());
    const s = settings();
    if (t) return 'Jadwal resmi Kemenag RI · ' + (T.Store.data.jadwal.lokasi || s.kemenag.lokasi);
    return 'Dihitung offline untuk ' + (s.coords ? (s.coords.name || 'lokasi GPS kamu') : T.Prayer.city(s.city).name) + ' (metode Kemenag)';
  }

  /* ---------- Wilayah Kemendagri (data/wilayah.js): provinsi → kab/kota, dengan ID jadwal Kemenag ----------
   * Baris kab/kota: [kode, nama, ibukota, lat, lng, ketinggian, zonaWaktu, idKemenag] */
  const W = () => T.WILAYAH || { prov: [], kab: [] };
  function provName(kode) { const p = W().prov.find((x) => x[0] === String(kode).slice(0, 2)); return p ? p[1] : ''; }
  function kabByKode(kode) { return W().kab.find((x) => x[0] === kode) || null; }
  function kabOf(provKode) { return W().kab.filter((x) => x[0].slice(0, 2) === provKode); }

  /** Terapkan pilihan kab/kota: koordinat ibu kotanya untuk hitung offline + ID jadwal Kemenag. */
  function applyWilayah(kode) {
    const k = kabByKode(kode);
    if (!k) return null;
    const s = settings();
    s.wilayah = { kode: k[0], nama: k[1], prov: k[0].slice(0, 2) };
    s.coords = { lat: k[3], lng: k[4], elv: k[5], name: k[1], src: 'wilayah' };
    s.city = nearestCity(k[3], k[4]) || s.city;
    if (k[7]) { s.kemenag = { id: String(k[7]), lokasi: k[1], daerah: provName(k[0]) }; s.jadwalSource = 'kemenag'; }
    T.Store.save();
    return k;
  }

  /* ---------- GPS → kab/kota terdekat (dicocokkan di perangkat; koordinat tidak dikirim) ---------- */
  function distKm(lat1, lng1, lat2, lng2) {
    const r = Math.PI / 180, dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(a));
  }
  function nearestKab(lat, lng) {
    let best = null;
    for (const k of W().kab) {
      const km = distKm(lat, lng, k[3], k[4]);
      if (!best || km < best.km) best = { kode: k[0], nama: k[1], id: k[7] ? String(k[7]) : null, km };
    }
    return best;
  }
  function nearestCity(lat, lng) {
    let best = null;
    for (const c of T.Prayer.CITIES) { const km = distKm(lat, lng, c.lat, c.lng); if (!best || km < best.km) best = { id: c.id, km }; }
    return best && best.id;
  }
  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Perangkat ini tidak mendukung lokasi (GPS).'));
      navigator.geolocation.getCurrentPosition((p) => resolve(p.coords), (e) => reject(new Error(
        e.code === 1 ? 'Izin lokasi ditolak. Izinkan akses lokasi untuk Tamu di pengaturan browser/HP, lalu coba lagi.'
          : e.code === 3 ? 'Lokasi belum ditemukan (waktu habis). Coba lagi, sebaiknya dengan GPS aktif.'
            : 'Lokasi tidak tersedia saat ini.')), { enableHighAccuracy: true, timeout: 20000, maximumAge: 10 * 60 * 1000 });
    });
  }
  /** Pakai GPS: simpan koordinat (dibulatkan ±100 m) di perangkat, pilih kab/kota Kemenag terdekat. */
  async function useGPS() {
    if (!window.isSecureContext) throw new Error('Lokasi hanya bisa dipakai saat Tamu dibuka lewat HTTPS.');
    const c = await getPosition();
    const lat = +c.latitude.toFixed(3), lng = +c.longitude.toFixed(3);
    const s = settings();
    s.coords = { lat, lng, name: 'lokasi GPS kamu', src: 'gps', at: new Date().toISOString() };
    s.city = nearestCity(lat, lng) || s.city;
    const near = nearestKab(lat, lng);
    const inIndonesia = near && near.km <= 150;
    if (inIndonesia) {
      s.wilayah = { kode: near.kode, nama: near.nama, prov: near.kode.slice(0, 2) };
      if (near.id) {
        if (!s.kemenag || s.kemenag.id !== near.id) s.kemenag = { id: near.id, lokasi: near.nama, daerah: provName(near.kode) };
        s.kemenag.km = Math.round(near.km);
        s.jadwalSource = 'kemenag';
      }
    }
    T.Store.save();
    return { lat, lng, near: inIndonesia ? { lokasi: near.nama, km: near.km } : null, accuracy: Math.round(c.accuracy || 0) };
  }
  /** Hapus lokasi GPS: kembali ke koordinat ibu kota kab/kota yang dipilih (bila ada). */
  function forgetGPS() {
    const s = settings();
    if (s.kemenag) delete s.kemenag.km;
    const k = s.wilayah && kabByKode(s.wilayah.kode);
    s.coords = k ? { lat: k[3], lng: k[4], elv: k[5], name: k[1], src: 'wilayah' } : null;
    T.Store.save();
  }

  T.Kemenag = { search, ensure, sync, lookup, label, offsetOf, matchFallback, active, useGPS, forgetGPS, applyWilayah, provName, kabOf, kabByKode, nearestKab };
  T.Prayer.setSource(lookup);
})(window.Tamu);

#!/usr/bin/env node
/* Tamu — membangun data/wilayah.js: 38 provinsi & 514 kab/kota sesuai kode wilayah Kemendagri,
 * lengkap dengan koordinat ibu kota, ketinggian, zona waktu, dan ID jadwal shalat Kemenag (api.myquran.com).
 *
 * Sumber wilayah: cahyadsn/wilayah (MIT), berdasarkan Kepmendagri No 300.2.2-2430 Tahun 2025.
 *   Salinan ringkas (tanpa batas wilayah) disimpan di tools/data/kemendagri/wilayah-provinsi-kabkota.csv.
 * Sumber ID Kemenag: data/kota.js (dibangun tools/build-kota.js).
 *
 * Pemakaian: node tools/build-wilayah.js            (pakai CSV yang tersimpan)
 *            node tools/build-wilayah.js --refresh  (unduh ulang dari cahyadsn/wilayah)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const SRC_URL = 'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/wilayah_level_1_2.sql';
const CSV = path.join(__dirname, 'data', 'kemendagri', 'wilayah-provinsi-kabkota.csv');
const KOTA = path.join(__dirname, '..', 'data', 'kota.js');
const OUT = path.join(__dirname, '..', 'data', 'wilayah.js');
const SUMBER = 'Kepmendagri No 300.2.2-2430 Tahun 2025 (via github.com/cahyadsn/wilayah, MIT)';

async function download() {
  const cache = path.join(os.tmpdir(), 'tamu-kemendagri-level12.sql');
  if (fs.existsSync(cache) && fs.statSync(cache).size > 1e6 && !process.argv.includes('--refresh')) return fs.readFileSync(cache, 'utf8');
  for (let i = 1; i <= 4; i++) {
    try {
      const r = await fetch(SRC_URL, { signal: AbortSignal.timeout(300000) });
      if (!r.ok) throw new Error('status ' + r.status);
      const t = await r.text();
      fs.writeFileSync(cache, t);
      return t;
    } catch (e) { console.log('unduh gagal (' + i + '): ' + e.message); await new Promise((s) => setTimeout(s, 3000)); }
  }
  throw new Error('Tidak bisa mengunduh data wilayah.');
}

/** Ambil kode, nama, ibu kota, lat, lng, ketinggian, zona waktu dari SQL (abaikan kolom batas wilayah). */
function parseSql(sql) {
  const re = /\('(\d{2}(?:\.\d{2})?)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)',\s*(-?[\d.]+),\s*(-?[\d.]+),\s*(-?[\d.]+),\s*(-?\d+)/g;
  const rows = new Map();
  let m;
  while ((m = re.exec(sql))) {
    if (rows.has(m[1])) continue;
    const un = (s) => s.replace(/\\'/g, "'");
    rows.set(m[1], { kode: m[1], nama: un(m[2]), ibukota: un(m[3]), lat: +(+m[4]).toFixed(5), lng: +(+m[5]).toFixed(5), elv: Math.round(+m[6]), tz: +m[7] });
  }
  return [...rows.values()].sort((a, b) => a.kode.localeCompare(b.kode));
}

function toCsv(rows) {
  const q = (s) => (/[",]/.test(String(s)) ? '"' + String(s).replace(/"/g, '""') + '"' : String(s));
  return 'kode,nama,ibukota,lat,lng,elv,tz\n' + rows.map((r) => [r.kode, r.nama, r.ibukota, r.lat, r.lng, r.elv, r.tz].map(q).join(',')).join('\n') + '\n';
}
function fromCsv(text) {
  const lines = text.trim().split(/\r?\n/).slice(1);
  return lines.map((line) => {
    const cells = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') inQ = false; else cur += ch; }
      else if (ch === '"') inQ = true;
      else if (ch === ',') { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    const [kode, nama, ibukota, lat, lng, elv, tz] = cells;
    return { kode, nama, ibukota, lat: +lat, lng: +lng, elv: +elv, tz: +tz };
  });
}

const norm = (s) => String(s).toUpperCase()
  .replace(/^(KABUPATEN|KAB\.?|KOTA)\s+/, '').replace(/^(ADMINISTRASI|ADM\.?)\s+/, '')
  .replace(/[^A-Z]/g, '');
/* Padanan nama Kemendagri → nama di daftar jadwal Kemenag (nama berubah / ditulis berbeda).
 * Titik terdekat TIDAK dipakai untuk kasus ini karena bisa salah ke kota tetangga (mis. Jakarta Barat → Tangerang). */
const ALIAS = {
  JAKARTAPUSAT: 'JAKARTA', JAKARTAUTARA: 'JAKARTA', JAKARTABARAT: 'JAKARTA', JAKARTASELATAN: 'JAKARTA', JAKARTATIMUR: 'JAKARTA',
  OGANKOMERING: 'OGANKOMERINGILIR', // 16.02, tertulis terpotong di sumber
  KEPULAUANTANIMBAR: 'MALUKUTENGGARABARAT', // berganti nama 2019
  TOBA: 'TOBASAMOSIR', // berganti nama 2020
  PASANGKAYU: 'MAMUJUUTARA', // berganti nama 2017
  PADANGSIDIMPUAN: 'PADANGSIDEMPUAN',
  KEPSIAUTAGULANDANGBIARO: 'KEPULAUANSIAUTAGULANDANGBIARO',
};
function distKm(lat1, lng1, lat2, lng2) {
  const r = Math.PI / 180, dLat = (lat2 - lat1) * r, dLng = (lng2 - lng1) * r;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

(async () => {
  let rows;
  if (fs.existsSync(CSV) && !process.argv.includes('--refresh')) rows = fromCsv(fs.readFileSync(CSV, 'utf8'));
  else {
    rows = parseSql(await download());
    fs.mkdirSync(path.dirname(CSV), { recursive: true });
    fs.writeFileSync(CSV, toCsv(rows));
  }
  const prov = rows.filter((r) => r.kode.length === 2);
  const kab = rows.filter((r) => r.kode.length === 5);

  // ID jadwal Kemenag: cocokkan nama (jenis kab/kota sama), lalu titik terdekat sebagai cadangan
  const sandbox = { window: {} };
  new Function('window', fs.readFileSync(KOTA, 'utf8'))(sandbox.window);
  const kemenag = sandbox.window.Tamu.KOTA.map(([id, lokasi, lat, lng]) => ({ id, lokasi, lat, lng, kota: /^KOTA/.test(lokasi), key: norm(lokasi) }));
  let byName = 0, byNear = 0;
  const missing = [];
  const out = kab.map((k) => {
    const isKota = /^Kota/i.test(k.nama);
    const key = ALIAS[norm(k.nama)] || norm(k.nama);
    let hit = kemenag.find((x) => x.kota === isKota && x.key === key) || kemenag.find((x) => x.key === key);
    if (hit) byName++;
    else {
      let best = null;
      for (const x of kemenag) { const d = distKm(k.lat, k.lng, x.lat, x.lng); if (!best || d < best.d) best = { x, d }; }
      if (best && best.d <= 40) { hit = best.x; byNear++; } else missing.push(k.kode + ' ' + k.nama);
    }
    return [k.kode, k.nama, k.ibukota, k.lat, k.lng, k.elv, k.tz, hit ? hit.id : null];
  });

  const data = { sumber: SUMBER, prov: prov.map((p) => [p.kode, p.nama]), kab: out };
  fs.writeFileSync(OUT, '/* Dibuat otomatis oleh tools/build-wilayah.js — jangan diedit. Sumber: ' + SUMBER + ' */\n' +
    'window.Tamu=window.Tamu||{};window.Tamu.WILAYAH=' + JSON.stringify(data) + ';\n');
  console.log('Provinsi: ' + prov.length + ' | Kab/kota: ' + kab.length + ' (kab ' + kab.filter((k) => /^Kab/i.test(k.nama)).length + ', kota ' + kab.filter((k) => /^Kota/i.test(k.nama)).length + ')');
  console.log('ID Kemenag: ' + byName + ' cocok nama, ' + byNear + ' lewat titik terdekat, ' + missing.length + ' tanpa ID' + (missing.length ? ': ' + missing.join('; ') : ''));
  console.log('→ ' + path.relative(process.cwd(), OUT) + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB)');
})();

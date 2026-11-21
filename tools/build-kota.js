#!/usr/bin/env node
/* Tamu — membangun data/kota.js: daftar kab/kota Kemenag (ID api.myquran.com) + koordinat pusatnya.
 * Dipakai untuk mencocokkan lokasi GPS ke kab/kota terdekat SECARA OFFLINE (lokasi tidak dikirim ke mana pun).
 *
 * Sumber koordinat: ArrayAccess/Indonesia-Postal-And-Area (MIT), disalin ke tools/data/arrayaccess/.
 * Sumber daftar kab/kota: https://api.myquran.com/v2/sholat/kota/semua (data jadwal Bimas Islam Kemenag RI).
 * Pemakaian: node tools/build-kota.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'data', 'arrayaccess');
const OUT = path.join(__dirname, '..', 'data', 'kota.js');

function parseCSV(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = [];
    let cur = '', q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === ',' && !q) { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    rows.push(cells);
  }
  const head = rows.shift();
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

const norm = (s) => String(s).toUpperCase().replace(/^(KAB\.?|KABUPATEN|KOTA|KOTA ADM\.?|ADM\.?)\s+/, '').replace(/^ADM\.?\s+/, '').replace(/[^A-Z ]/g, ' ').replace(/\s+/g, ' ').trim();
// Ejaan yang berbeda antara dua sumber
const ALIAS = {
  'KEPULAUAN SERIBU': ['KEP SERIBU'], 'TOLI TOLI': ['TOLITOLI'], 'FAK FAK': ['FAKFAK'], 'PANGKAJENE KEPULAUAN': ['PANGKAJENE DAN KEPULAUAN', 'PANGKEP'],
  'TANAH LAUT': ['TANAHLAUT'], 'LABUHANBATU': ['LABUHAN BATU'], 'LABUHANBATU SELATAN': ['LABUHAN BATU SELATAN'], 'LABUHANBATU UTARA': ['LABUHAN BATU UTARA'],
  'PAKPAK BHARAT': ['PAKPAK BARAT'], 'BATU BARA': ['BATUBARA'], 'MAHAKAM ULU': ['MAHAKAM HULU'], 'TULANG BAWANG': ['TULANGBAWANG'], 'TULANG BAWANG BARAT': ['TULANGBAWANG BARAT'],
  'SIAU TAGULANDANG BIARO': ['KEPULAUAN SIAU TAGULANDANG BIARO', 'SITARO'], 'KEPULAUAN SANGIHE': ['SANGIHE'], 'MUKO MUKO': ['MUKOMUKO'], 'TOJO UNA UNA': ['TOJO UNAUNA'],
  'KEPULAUAN YAPEN': ['YAPEN WAROPEN'], 'BARU': ['KOTABARU'] /* "KAB. KOTA BARU" (Kalsel) */, 'PADANGSIDIMPUAN': ['PADANGSIDEMPUAN'], 'TIDORE KEPULAUAN': ['SOFIFI'], // Sofifi (ibu kota Maluku Utara) berada di wilayah Kota Tidore Kepulauan
};
// Lokasi pulau terpencil yang punya jadwal Kemenag tersendiri tetapi tidak ada di data koordinat: tetap bisa dipilih lewat pencarian.
const SKIP = /^PULAU |^PEKAJANG /;

(async () => {
  const cities = parseCSV(fs.readFileSync(path.join(DIR, 'cities.csv'), 'utf8'));
  const r = await fetch('https://api.myquran.com/v2/sholat/kota/semua', { signal: AbortSignal.timeout(60000) });
  const kemenag = (await r.json()).data;

  const index = new Map();
  for (const c of cities) {
    const isKota = parseInt(c.Code.slice(2), 10) >= 71;
    const key = (isKota ? 'KOTA|' : 'KAB|') + norm(c.Name);
    index.set(key, c);
    index.set(key.replace(/ /g, ''), c); // tidak peka spasi: GUNUNG KIDUL = GUNUNGKIDUL
  }
  const out = [], miss = [], seen = new Set();
  for (const k of kemenag) {
    if (seen.has(k.id) || SKIP.test(k.lokasi)) continue;
    seen.add(k.id);
    const isKota = /^KOTA/.test(k.lokasi);
    const n = norm(k.lokasi);
    const cands = [n].concat(ALIAS[n] || [], Object.keys(ALIAS).filter((a) => ALIAS[a].includes(n)));
    let hit = null;
    for (const c of cands) {
      for (const pre of isKota ? ['KOTA|', 'KAB|'] : ['KAB|', 'KOTA|']) { hit = index.get(pre + c) || index.get((pre + c).replace(/ /g, '')); if (hit) break; }
      if (hit) break;
    }
    // Kemenag memakai satu entri "KOTA JAKARTA": pakai Jakarta Pusat
    if (!hit && n === 'JAKARTA') hit = index.get('KOTA|JAKARTA PUSAT');
    if (!hit) { miss.push(k.lokasi); continue; }
    out.push([k.id, k.lokasi, +parseFloat(hit.Latitude).toFixed(4), +parseFloat(hit.Longitude).toFixed(4)]);
  }
  fs.writeFileSync(OUT, '/* Dibuat otomatis oleh tools/build-kota.js — jangan diedit.\n * Kab/kota jadwal Kemenag (ID api.myquran.com) + koordinat pusat (ArrayAccess/Indonesia-Postal-And-Area, MIT). */\n' +
    'window.Tamu=window.Tamu||{};window.Tamu.KOTA=' + JSON.stringify(out) + ';\n');
  console.log('Cocok: ' + out.length + ' dari ' + kemenag.length + ' kab/kota Kemenag → ' + path.relative(process.cwd(), OUT) + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB)');
  if (miss.length) console.log('Belum cocok (' + miss.length + '): ' + miss.join('; '));
})();

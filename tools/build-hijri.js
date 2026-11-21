#!/usr/bin/env node
/* Tamu — membangun data/hijri.js: tanggal awal bulan Hijriah 1440–1470 H menurut
 *   - Kemenag RI : kriteria MABIMS (≥1443 H: tinggi toposentrik ≥3°, elongasi geosentrik ≥6,4°;
 *                  sebelumnya: tinggi ≥2°, elongasi ≥3°, umur ≥8 jam), acuan wilayah Indonesia.
 *                  Ini PREDIKSI HISAB; awal Ramadhan/Syawal/Dzulhijjah resmi ditetapkan sidang isbat.
 *   - Muhammadiyah: ≥1447 H Kalender Hijriah Global Tunggal (KHGT): tinggi ≥5°, elongasi ≥8° di daratan mana pun
 *                  sebelum 24.00 UTC; pengecualian: terpenuhi di daratan Amerika setelah 24.00 UTC dan ijtimak
 *                  terjadi sebelum fajar di Selandia Baru. Sebelum 1447 H: wujudul hilal (Yogyakarta).
 * Perhitungan astronomi: astronomy-engine (MIT), hanya saat build — aplikasi cukup membaca tabel.
 * Pemakaian: node tools/build-hijri.js
 */
'use strict';
const A = require('astronomy-engine');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'data', 'hijri.js');
const DAY = 864e5;
const KHGT_ALT_MODE = process.env.KHGT_ALT || 'geo'; // 'geo' | 'topo' (lihat validasi di bawah)

const hijriFmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { timeZone: 'UTC', day: 'numeric', month: 'numeric', year: 'numeric' });
function ummAlQura(d) {
  const p = hijriFmt.formatToParts(d);
  const g = (t) => parseInt(p.find((x) => x.type === t).value, 10);
  return { y: g('year'), m: g('month'), d: g('day') };
}
const ymd = (d) => d.toISOString().slice(0, 10);
const utcDate = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const addDays = (d, n) => new Date(+d + n * DAY);

/** Tinggi (toposentrik, tanpa refraksi) dan elongasi geosentrik Bulan pada waktu t. */
function moonAt(t, obs) {
  const eq = A.Equator(A.Body.Moon, t, obs, true, true);
  const hor = A.Horizon(t, obs, eq.ra, eq.dec, null);
  const elong = A.AngleFromSun(A.Body.Moon, t);
  const distKm = A.GeoMoon(t).Length() * 149597870.7;
  const hp = Math.asin(6378.14 / distKm) * 180 / Math.PI;
  const topo = hor.altitude;
  const geo = topo + hp * Math.cos(topo * Math.PI / 180);
  return { topo, geo, elong };
}
function sunsetAfter(obs, t) { const r = A.SearchRiseSet(A.Body.Sun, obs, -1, t, 2); return r && r.date; }

/* ---------- Kemenag (MABIMS), acuan wilayah Indonesia ---------- */
const INDONESIA = [[5.55, 95.32], [3.59, 98.67], [-0.95, 100.35], [-6.2, 106.85], [-6.99, 106.55], [-7.8, 110.36], [-8.65, 115.22], [-5.15, 119.43], [-10.17, 123.6], [-3.7, 128.18], [-2.53, 140.72]];
function kemenagStart(conj, hy) {
  const wib = new Date(+conj + 7 * 3600e3);
  const D = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate())); // tanggal lokal ijtimak
  const fromLocalMidnight = new Date(+D - 7 * 3600e3);
  for (const [lat, lon] of INDONESIA) {
    const obs = new A.Observer(lat, lon, 0);
    const ss = sunsetAfter(obs, fromLocalMidnight);
    if (!ss || ss <= conj || ss - fromLocalMidnight > DAY + 3 * 3600e3) continue;
    const m = moonAt(ss, obs);
    const ageH = (ss - conj) / 3600e3;
    const ok = hy >= 1443 ? m.topo >= 3 && m.elong >= 6.4 : m.topo >= 2 && m.elong >= 3 && ageH >= 8;
    if (ok) return addDays(D, 1);
  }
  return addDays(D, 2);
}

/* ---------- Muhammadiyah ---------- */
const YOGYA = new A.Observer(-7.8, 110.37, 0);
function wujudulHilalStart(conj) {
  const wib = new Date(+conj + 7 * 3600e3);
  const D = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()));
  const ss = sunsetAfter(YOGYA, new Date(+D - 7 * 3600e3));
  // Wujudul hilal: ijtimak sebelum matahari terbenam DAN piringan atas Bulan masih di atas ufuk saat matahari terbenam
  const eq = A.Equator(A.Body.Moon, ss, YOGYA, true, true);
  const upperLimb = A.Horizon(ss, YOGYA, eq.ra, eq.dec, 'normal').altitude + 0.26;
  return addDays(D, conj < ss && upperLimb > 0 ? 1 : 2);
}

// Kotak kasar daratan [latMin, latMax, lonMin, lonMax] + penanda daratan Amerika
const LAND = [
  [-56, 12, -81, -35, true], [7, 32, -118, -77, true], [25, 50, -125, -60, true], [50, 70, -168, -55, true],
  [-35, 37, -18, 52], [36, 71, -10, 40], [5, 55, 40, 75], [5, 55, 75, 135], [50, 72, 60, 180], [-11, 7, 95, 141], [-45, -10, 113, 154], [-47, -34, 166, 179],
];
function landPoints() {
  const pts = [];
  for (let lat = -55; lat <= 65; lat += 2.5) for (let lon = -170; lon <= 179; lon += 2.5) {
    const box = LAND.find(([a, b, c, d]) => lat >= a && lat <= b && lon >= c && lon <= d);
    if (box) pts.push({ lat, lon, america: !!box[4], obs: new A.Observer(lat, lon, 0) });
  }
  return pts;
}
const POINTS = landPoints();
const NZ = new A.Observer(-41.29, 174.78, 0);

function khgtCriteria(t, obs) { const m = moonAt(t, obs); return (KHGT_ALT_MODE === 'topo' ? m.topo : m.geo) >= 5 && m.elong >= 8; }
function khgtStart(conj) {
  const D = utcDate(conj);
  const midnight = addDays(D, 1);
  for (const p of POINTS) { // aturan utama: sebelum 24.00 UTC, di daratan mana pun
    if (p.lon < -125) continue; // matahari terbenam setelah 24.00 UTC di sana (dicek di pengecualian)
    const ss = sunsetAfter(p.obs, conj);
    if (ss && ss < midnight && khgtCriteria(ss, p.obs)) return { start: midnight, rule: 'utama' };
  }
  const fajrNZ = A.SearchAltitude(A.Body.Sun, NZ, +1, new Date(+D + 6 * 3600e3), 1, -18);
  if (fajrNZ && conj < fajrNZ.date) { // pengecualian: daratan Amerika setelah 24.00 UTC
    for (const p of POINTS) {
      if (!p.america) continue;
      const ss = sunsetAfter(p.obs, conj);
      if (ss && ss >= midnight && ss < new Date(+midnight + 14 * 3600e3) && khgtCriteria(ss, p.obs)) return { start: midnight, rule: 'pengecualian Amerika' };
    }
  }
  return { start: addDays(D, 2), rule: 'istikmal' };
}

/* ---------- Bangun tabel ---------- */
function build() {
  const kemenag = [], muh = [];
  let t = A.MakeTime(new Date(Date.UTC(2018, 7, 1))); // ± 1440 H
  for (let i = 0; i < 31 * 12 + 2; i++) {
    const nm = A.SearchMoonPhase(0, t, 40);
    const conj = nm.date;
    const label = ummAlQura(addDays(conj, 15));
    const hy = label.y, hm = label.m;
    if (hy >= 1440 && hy <= 1470) {
      kemenag.push([hy, hm, ymd(kemenagStart(conj, hy))]);
      if (hy >= 1447) { const k = khgtStart(conj); muh.push([hy, hm, ymd(k.start), k.rule]); }
      else muh.push([hy, hm, ymd(wujudulHilalStart(conj)), 'wujudul hilal']);
    }
    t = A.MakeTime(addDays(conj, 20));
  }
  return { kemenag, muh };
}

const { kemenag, muh } = build();

// Validasi terhadap tanggal resmi yang diketahui (Kemenag = hasil sidang isbat; Muhammadiyah = maklumat PP)
const KNOWN = [
  ['kemenag', 1444, 9, '2023-03-23'], ['kemenag', 1444, 10, '2023-04-22'], ['kemenag', 1445, 9, '2024-03-12'], ['kemenag', 1445, 10, '2024-04-10'],
  ['kemenag', 1446, 9, '2025-03-01'], ['kemenag', 1446, 10, '2025-03-31'], ['kemenag', 1447, 9, '2026-02-19'], ['kemenag', 1447, 10, '2026-03-21'],
  ['muh', 1444, 9, '2023-03-23'], ['muh', 1444, 10, '2023-04-21'], ['muh', 1445, 9, '2024-03-11'], ['muh', 1446, 9, '2025-03-01'], ['muh', 1446, 10, '2025-03-31'],
  ['muh', 1447, 1, '2025-06-26'], ['muh', 1447, 9, '2026-02-18'], ['muh', 1447, 10, '2026-03-20'],
];
let fail = 0;
for (const [cal, y, m, want] of KNOWN) {
  const row = (cal === 'kemenag' ? kemenag : muh).find((r) => r[0] === y && r[1] === m);
  const got = row && row[2];
  const ok = got === want;
  if (!ok) fail++;
  console.log((ok ? '✓' : '✗') + ' ' + (cal === 'kemenag' ? 'Kemenag     ' : 'Muhammadiyah') + ' 1 ' + ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah'][m - 1] + ' ' + y + ': ' + got + (ok ? '' : ' (resmi: ' + want + ')') + (row && row[3] ? '  [' + row[3] + ']' : ''));
}

const strip = (rows) => rows.map((r) => r.slice(0, 3));
fs.writeFileSync(OUT, '/* Dibuat otomatis oleh tools/build-hijri.js — jangan diedit. Awal bulan Hijriah [tahun, bulan, tanggal masehi]. */\n' +
  'window.Tamu=window.Tamu||{};window.Tamu.HIJRI_TABLES=' + JSON.stringify({ generated: ymd(new Date()), kemenag: strip(kemenag), muhammadiyah: strip(muh) }) + ';\n');
console.log('\n' + kemenag.length + ' bulan Kemenag, ' + muh.length + ' bulan Muhammadiyah → ' + path.relative(process.cwd(), OUT) + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB). Validasi gagal: ' + fail + ' (mode tinggi KHGT: ' + KHGT_ALT_MODE + ')');
process.exitCode = fail ? 1 : 0;

#!/usr/bin/env node
/* Tamu — membangun pustaka kitab offline (data/kitab.json) dari korpus OpenITI.
 * Mengambil HANYA bab haid / nifas / istihadhah dari kitab-kitab 4 mazhab + perbandingan mazhab.
 *
 * Pemakaian:  node tools/build-kitab.js
 * Sumber:     https://github.com/OpenITI (teks digital kitab klasik, sebagian besar berasal dari al-Maktabah asy-Syamilah)
 * Lisensi korpus OpenITI: lihat README tiap repo (CC BY-NC-SA 4.0). Tamu gratis & non-komersial; atribusi ditampilkan di aplikasi.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const BOOKS = [
  // id, mazhab, repo, folder penulis, kode kitab, judul latin, judul arab, penulis, wafat (H)
  ['quduri', 'hanafi', '0450AH', '0428AbuHusaynQuduri', 'Mukhtasar', 'Mukhtashar al-Quduri', 'مختصر القدوري', 'Abu al-Husain al-Quduri', 428],
  ['hidayah', 'hanafi', '0600AH', '0593BurhanDinFarghaniMarghinani', 'HidayaFiSharhBidaya', 'Al-Hidayah Syarh Bidayatil Mubtadi', 'الهداية في شرح بداية المبتدي', 'Burhanuddin al-Marghinani', 593],
  ['badai', 'hanafi', '0600AH', '0587IbnMascudCalaDinKasani', 'BadaicSanaic', "Bada'i' ash-Shana'i'", 'بدائع الصنائع', "'Ala'uddin al-Kasani", 587],
  ['risalah', 'maliki', '0400AH', '0386IbnAbiZaydQayrawani', 'Risala', 'Ar-Risalah', 'الرسالة', 'Ibnu Abi Zaid al-Qairawani', 386],
  ['dardir', 'maliki', '1225AH', '1201AhmadDardirAbuBarakat', 'SharhKabir', "Asy-Syarh al-Kabir 'ala Mukhtashar Khalil", 'الشرح الكبير على مختصر خليل', 'Ahmad ad-Dardir', 1201],
  ['kafi', 'maliki', '0475AH', '0463IbnCabdBarr', 'KafiFiFiqh', 'Al-Kafi fi Fiqh Ahl al-Madinah', 'الكافي في فقه أهل المدينة', "Ibnu 'Abdil Barr", 463],
  ['mudawwanah', 'maliki', '0250AH', '0240SahnunIbnSacid', 'MudawwanaKubra', 'Al-Mudawwanah al-Kubra', 'المدونة الكبرى', 'Sahnun (riwayat dari Imam Malik)', 240],
  ['minhaj', 'syafii', '0700AH', '0676Nawawi', 'MinhajTalibin', 'Minhajut Thalibin', 'منهاج الطالبين', 'Imam an-Nawawi', 676],
  ['fathulqarib', 'syafii', '0925AH', '0918IbnQasimShamsDinGhazzi', 'FathQarib', 'Fathul Qarib al-Mujib', 'فتح القريب المجيب', 'Ibnu Qasim al-Ghazzi', 918],
  ['raudhah', 'syafii', '0700AH', '0676Nawawi', 'RawdatTalibin', 'Raudhatut Thalibin', 'روضة الطالبين', 'Imam an-Nawawi', 676],
  ['umdah', 'hanbali', '0625AH', '0620IbnQudamaMaqdisi', 'CumdatFiqh', "'Umdatul Fiqh", 'عمدة الفقه', 'Ibnu Qudamah al-Maqdisi', 620],
  ['mughni', 'hanbali', '0625AH', '0620IbnQudamaMaqdisi', 'Mughni', 'Al-Mughni', 'المغني', 'Ibnu Qudamah al-Maqdisi', 620],
  ['raudh', 'hanbali', '1075AH', '1051IbnYunusBuhutiHanbali', 'RawdMurbic', "Ar-Raudh al-Murbi'", 'الروض المربع', 'Manshur al-Buhuti', 1051],
  ['bidayah', 'muqaran', '0600AH', '0595IbnRushdHafid', 'BidayatMujtahid', 'Bidayatul Mujtahid', 'بداية المجتهد ونهاية المقتصد', 'Ibnu Rusyd al-Hafid', 595],
];

const HEAD_OK = /(حيض|حائض|مستحاض|استحاض|نفاس|نفساء|المتحيرة|المبتدأة|المعتادة)/;
const HEAD_NO = /(العدة|العدد|عدة|الطلاق|طلاق|الرجعة|الاستبراء|الرضاع|الإيلاء|الظهار|النكاح|البيع|الصوم|الصيام|الحج)/;
const MAX_CHARS_PER_BOOK = 160000;
const PASSAGE = 700;

const OUT = path.join(__dirname, '..', 'data', 'kitab.json');
const CACHE = path.join(require('os').tmpdir(), 'tamu-openiti-cache');
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(path.dirname(OUT), { recursive: true });

async function get(url, asJson) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'tamu-build-kitab' }, signal: AbortSignal.timeout(120000) });
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return asJson ? r.json() : r.text();
    } catch (e) { if (i === 2) throw e; await new Promise((s) => setTimeout(s, 2000)); }
  }
}

/** Pilih versi teks: utamakan .mARkdown/.completed, lalu Shamela (punya penanda halaman), lalu yang lain. */
function pickVersion(files) {
  const txt = files.filter((f) => f.type === 'file' && !/\.(yml|md)$/.test(f.name));
  const score = (n) => (/\.mARkdown$/.test(n) ? 4 : /\.completed$/.test(n) ? 3 : /Shamela/.test(n) ? 2 : 1);
  txt.sort((a, b) => score(b.name) - score(a.name) || b.size - a.size);
  return txt[0];
}

async function fetchBook(b) {
  const [id, , repo, author, code] = b;
  const cacheFile = path.join(CACHE, id + '.txt');
  if (fs.existsSync(cacheFile)) return { text: fs.readFileSync(cacheFile, 'utf8'), version: fs.readFileSync(cacheFile + '.v', 'utf8') };
  const dir = 'data/' + author + '/' + author + '.' + code;
  const files = await get('https://api.github.com/repos/OpenITI/' + repo + '/contents/' + dir, true);
  if (!Array.isArray(files)) throw new Error('Tidak bisa membaca daftar file ' + dir + ': ' + JSON.stringify(files).slice(0, 120));
  const v = pickVersion(files);
  const text = await get('https://raw.githubusercontent.com/OpenITI/' + repo + '/master/' + dir + '/' + v.name);
  fs.writeFileSync(cacheFile, text);
  fs.writeFileSync(cacheFile + '.v', v.name);
  return { text, version: v.name };
}

const clean = (s) => s.replace(/PageV\d+P\d+/g, '').replace(/\bms\d+\b/g, '').replace(/[~#|]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Kenali penanda bab dalam berbagai gaya OpenITI. major = kitab/bab (menutup bagian), minor = fasal/masalah. */
function marker(raw) {
  let m = raw.match(/^### (\|+)\s*(?:AUTO\s+)?(.*)$/);
  if (m) return { lvl: m[1].length, title: clean(m[2]), major: true };
  m = raw.match(/^#\s*\|+\s*(.*)$/);
  if (m) return { lvl: 9, title: clean(m[1]), major: /^(كتاب|باب)/.test(clean(m[1])), minor: !/^(كتاب|باب)/.test(clean(m[1])) };
  // catatan: \b di regex JS tidak mengenali huruf Arab, jadi batas kata ditulis eksplisit
  m = raw.match(/^#\s+((?:كتاب|باب)(?=\s|$).*)$/);
  if (m && m[1].length < 70) return { lvl: 9, title: clean(m[1]), major: true };
  m = raw.match(/^#\s+(فصل(?=[\s:.]|$).*)$/);
  if (m && m[1].length < 60) return { lvl: 10, title: clean(m[1]), minor: true };
  return null;
}

/** Ambil bagian bab haid/nifas/istihadhah → daftar paragraf {h, p, t}. */
function extract(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let inSec = false, secLevel = 0, secTitle = '', sub = '', page = '', para = null, chars = 0;
  const flush = () => {
    if (para && para.t.trim()) { const t = clean(para.t); if (t.length > 25) { out.push({ h: para.h, p: para.p, t }); chars += t.length; } }
    para = null;
  };
  for (const raw of lines) {
    const pm = raw.match(/PageV(\d+)P(\d+)/);
    if (pm) page = 'V' + pm[1] + 'P' + pm[2];
    const mk = marker(raw);
    if (mk) {
      const relevant = HEAD_OK.test(mk.title) && !HEAD_NO.test(mk.title);
      if (inSec && !relevant && mk.major && mk.lvl <= Math.max(secLevel, 9)) { flush(); inSec = false; }
      if (!inSec && relevant && (mk.major || /في\s/.test(mk.title) || mk.lvl < 10)) { flush(); inSec = true; secLevel = mk.lvl; secTitle = mk.title; sub = ''; continue; }
      if (inSec && mk.minor) { flush(); sub = mk.title.slice(0, 60); }
      if (inSec && mk.title.length < 40) continue; // judul pendek: bukan isi
    }
    if (!inSec || chars > MAX_CHARS_PER_BOOK) continue;
    if (/^#\s*PageV\d+P\d+\s*$/.test(raw)) continue;
    if (/^# /.test(raw)) { flush(); para = { h: [secTitle, sub].filter(Boolean).join(' › '), p: page, t: raw.replace(/^#\s*\|*/, '') }; }
    else if (/^~~/.test(raw) && para) para.t += ' ' + raw.slice(2);
  }
  flush();
  return out;
}

/** Cadangan untuk kitab tanpa bab khusus haid: paragraf yang membahas haid/nifas/istihadhah (bukan iddah/talak). */
function extractByKeyword(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let page = '', para = null;
  const KW = /حيض|حائض|مستحاض|استحاض|نفاس|نفساء/g;
  const flush = () => {
    if (para) {
      const t = clean(para.t);
      // ambil jendela ±300 huruf di sekitar setiap penyebutan haid, lalu gabungkan yang bertumpuk
      const spans = [];
      let m;
      KW.lastIndex = 0;
      while ((m = KW.exec(t))) {
        const a = Math.max(0, m.index - 300), b = Math.min(t.length, m.index + 300);
        if (spans.length && a <= spans[spans.length - 1][1]) spans[spans.length - 1][1] = b; else spans.push([a, b]);
      }
      for (const [a, b] of spans) {
        let s = t.slice(a, b);
        if (a > 0) s = '… ' + s.replace(/^\S*\s/, '');
        if (b < t.length) s = s.replace(/\s\S*$/, '') + ' …';
        if (s.length > 60 && !HEAD_NO.test(s)) out.push({ h: 'Pembahasan haid dalam kitab', p: para.p, t: s });
      }
    }
    para = null;
  };
  for (const raw of lines) {
    const pm = raw.match(/PageV(\d+)P(\d+)/);
    if (pm) page = 'V' + pm[1] + 'P' + pm[2];
    if (/^# /.test(raw)) { flush(); para = { p: page, t: raw.slice(2) }; }
    else if (/^~~/.test(raw) && para) para.t += ' ' + raw.slice(2);
  }
  flush();
  return out.slice(0, 40);
}

/** Pecah paragraf panjang menjadi kutipan ±700 huruf pada batas kalimat. */
function split(paras) {
  const out = [];
  for (const p of paras) {
    if (p.t.length <= PASSAGE * 1.4) { out.push(p); continue; }
    const sentences = p.t.split(/(?<=[.؟!:])\s+/);
    let buf = '';
    for (const s of sentences) {
      if (buf && buf.length + s.length > PASSAGE) { out.push({ h: p.h, p: p.p, t: buf.trim() }); buf = ''; }
      buf += s + ' ';
    }
    if (buf.trim()) out.push({ h: p.h, p: p.p, t: buf.trim() });
  }
  return out;
}

(async () => {
  let license = 'CC BY-NC-SA 4.0';
  try {
    const readme = await get('https://raw.githubusercontent.com/OpenITI/0700AH/master/README.md');
    const m = readme.match(/(CC[ -]BY[^\s)\]]*|Creative Commons[^\n.]*)/i);
    if (m) license = m[1].trim();
  } catch (e) { /* pakai default */ }

  const books = [], passages = [];
  for (let i = 0; i < BOOKS.length; i++) {
    const b = BOOKS[i];
    process.stdout.write('• ' + b[5] + ' … ');
    try {
      const { text, version } = await fetchBook(b);
      let paras = extract(text);
      if (paras.reduce((a, p) => a + p.t.length, 0) < 1500) paras = paras.concat(extractByKeyword(text));
      const seen = new Set();
      const ps = split(paras).filter((p) => { const key = p.t.replace(/\s+/g, ''); if (seen.has(key)) return false; seen.add(key); return true; });
      books.push({ id: b[0], mz: b[1], title: b[5], titleAr: b[6], author: b[7], died: b[8], src: 'OpenITI/' + b[2] + '/' + version });
      const bi = books.length - 1;
      ps.forEach((p) => passages.push({ b: bi, h: p.h, p: p.p, t: p.t }));
      console.log(ps.length + ' kutipan, ' + ps.reduce((a, p) => a + p.t.length, 0) + ' huruf');
    } catch (e) { console.log('GAGAL: ' + e.message); }
  }
  const out = { generated: new Date().toISOString().slice(0, 10), source: 'OpenITI (github.com/OpenITI)', license, books, passages };
  fs.writeFileSync(OUT, JSON.stringify(out));
  // Versi skrip untuk aplikasi (dimuat sesuai kebutuhan; juga jalan saat dibuka via file://)
  fs.writeFileSync(OUT.replace(/\.json$/, '.js'), '/* Dibuat otomatis oleh tools/build-kitab.js — jangan diedit. Sumber: OpenITI, lisensi ' + license + ' */\nwindow.Tamu=window.Tamu||{};window.Tamu.KITAB=' + JSON.stringify(out) + ';\n');
  console.log('\nSelesai: ' + passages.length + ' kutipan dari ' + books.length + ' kitab → ' + path.relative(process.cwd(), OUT) + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB). Lisensi: ' + license);
})();

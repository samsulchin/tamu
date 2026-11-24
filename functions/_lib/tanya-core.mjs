/* Tamu — inti "Tanya AI": menyusun jawaban fikih HANYA dari kutipan kitab 4 mazhab yang tersimpan di aplikasi.
 * Dipakai oleh Cloudflare Pages Function (functions/api/tanya.js) dan server lokal (tools/serve.js).
 * Layanan AI: Groq (API kompatibel OpenAI), dipanggil dengan fetch biasa — tanpa dependensi npm.
 *
 * Keamanan & privasi:
 * - Klien hanya mengirim pertanyaan + ID kutipan. Teks kitab diambil di server dari data/kitab.json,
 *   sehingga endpoint tidak bisa dipakai sebagai chatbot umum dengan teks sembarang.
 * - Pertanyaan tidak disimpan/dicatat oleh kode ini. Kunci API hanya ada di server (rahasia GROQ_API_KEY).
 */
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Dipilih dari uji coba: paling tepat membaca kutipan Arab di antara model Groq yang tersedia, dan cepat (±1,5 detik).
export const DEFAULT_MODEL = 'qwen/qwen3.8-27b';
const MAX_Q = 400;
const MAX_IDS = 12;

const MZ_NAME = { hanafi: 'Hanafi', maliki: 'Maliki', syafii: "Syafi'i", hanbali: 'Hanbali', muqaran: 'Perbandingan mazhab' };

const SYSTEM = `Anda adalah "Tanya Tamu", pendamping belajar fikih haid untuk muslimah Indonesia di aplikasi Tamu.
Pengguna bertanya tentang haid, nifas, istihadhah, dan hukum ibadah yang terkait (shalat, puasa, mandi wajib, Al-Qur'an, masjid, hubungan suami-istri).

Sumber Anda hanya kutipan kitab di dalam <kutipan_kitab>. Kutipan itu dipilih dari bab haid kitab-kitab mazhab Hanafi, Maliki, Syafi'i, Hanbali, dan kitab perbandingan mazhab. Pengguna akan memeriksa jawaban Anda terhadap kutipan, jadi:
- Setiap pernyataan hukum harus bersandar pada kutipan dan diberi penanda sumber [n] sesuai id kutipan, tepat setelah kalimatnya. Jangan membuat id yang tidak ada.
- Jika kutipan tidak cukup untuk menjawab, atau suatu mazhab tidak terwakili, katakan terus terang (misalnya "Kutipan dari mazhab Maliki tentang ini tidak tersedia di pustaka Tamu"). Jangan mengisi dari ingatan, dan jangan mengarang nama kitab, halaman, atau hadits.
- Jangan menarik kesimpulan perhitungan yang tidak tertulis di kutipan. Contoh: kutipan yang hanya menyebut "paling lama 15 hari, lebihnya istihadhah" TIDAK berarti "15 hari pertama haid, sisanya istihadhah". Dalam mazhab Syafi'i, bila darah melewati 15 hari, haid ditentukan lebih dulu dengan tamyiz (membedakan darah kuat dan lemah), lalu dengan kebiasaan haid sebelumnya ('adah). Sampaikan bahwa penentuannya perlu melihat sifat darah dan kebiasaan, dan sarankan bertanya kepada ustadzah.
- Perhatikan pemilik setiap pendapat di dalam kutipan: kitab satu mazhab sering juga menyebut pendapat mazhab lain (misalnya kitab Hanafi menukil "Asy-Syafi'i berkata ..."). Jangan menisbatkan pendapat yang dinukil itu kepada mazhab penulis kitab.
- Kutipan berbahasa Arab klasik. Pahami dengan cermat, termasuk pengecualian dan perbedaan riwayat di dalam mazhab, lalu jelaskan dengan bahasa Indonesia yang sederhana. Istilah fikih boleh disebut dengan penjelasan singkat, misalnya istizhar (menunggu tambahan beberapa hari).

Bentuk jawaban (teks biasa; boleh **tebal** dan daftar berawalan "- "; tanpa judul #, tanpa tabel):
1. Jawaban langsung 1–3 kalimat.
2. "Menurut 4 mazhab:" berisi daftar singkat Hanafi, Maliki, Syafi'i, Hanbali (hanya yang didukung kutipan; tandai yang tidak tersedia).
3. Bila relevan, satu kalimat: di Indonesia umumnya dipegang mazhab Syafi'i.
Panjang keseluruhan sekitar 120–300 kata.

Batasan:
- Ini bukan fatwa. Untuk kasus pribadi yang rumit (darah tidak teratur, istihadhah, nifas, keguguran), sarankan bertanya kepada ustadzah yang menguasai fikih haid.
- Bila pertanyaan menyiratkan bahaya kesehatan (perdarahan sangat banyak, nyeri hebat, perdarahan saat hamil, demam), sarankan segera ke dokter atau bidan.
- Bila pertanyaan di luar fikih haid dan thaharah, tolak dengan sopan dalam satu kalimat dan arahkan kembali ke topik.
- Jangan meminta atau mengulang data pribadi pengguna.`;

/** Kesalahan yang aman ditampilkan ke pengguna, dengan status HTTP. */
export class TanyaError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function pageLabel(pg) {
  const m = /^V(\d+)P(\d+)$/.exec(pg || '');
  if (!m) return '';
  const v = parseInt(m[1], 10), p = parseInt(m[2], 10);
  return (v > 1 ? 'jilid ' + v + ', ' : '') + 'hlm. ' + p;
}

/** Validasi masukan klien → { question, ids }. */
export function validate(body, kitab) {
  if (!body || typeof body !== 'object') throw new TanyaError(400, 'Permintaan tidak valid.');
  const question = typeof body.q === 'string' ? body.q.replace(/\s+/g, ' ').trim() : '';
  if (question.length < 3) throw new TanyaError(400, 'Pertanyaan terlalu pendek.');
  if (question.length > MAX_Q) throw new TanyaError(400, 'Pertanyaan terlalu panjang (maksimal ' + MAX_Q + ' huruf).');
  const ids = Array.isArray(body.ids) ? Array.from(new Set(body.ids.filter((n) => Number.isInteger(n) && n >= 0 && n < kitab.passages.length))).slice(0, MAX_IDS) : [];
  if (!ids.length) throw new TanyaError(400, 'Tidak ada kutipan kitab yang relevan untuk pertanyaan ini.');
  return { question, ids };
}

function buildPrompt(question, ids, kitab) {
  const docs = ids.map((id) => {
    const p = kitab.passages[id], b = kitab.books[p.b];
    const attrs = ['id="' + id + '"', 'mazhab="' + MZ_NAME[b.mz] + '"', 'kitab="' + b.title + ' (' + b.titleAr + ')"', 'penulis="' + b.author + ' (w. ' + b.died + ' H)"'];
    if (p.h) attrs.push('bab="' + p.h.replace(/"/g, "'") + '"');
    if (p.p) attrs.push('halaman="' + pageLabel(p.p) + '"');
    return '<kutipan ' + attrs.join(' ') + '>\n' + p.t + '\n</kutipan>';
  }).join('\n');
  return '<kutipan_kitab>\n' + docs + '\n</kutipan_kitab>\n\n<pertanyaan>\n' + question + '\n</pertanyaan>';
}

async function callGroq(apiKey, payload) {
  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000),
    });
  } catch (e) {
    throw new TanyaError(504, 'Tidak bisa terhubung ke layanan AI.');
  }
  const j = await res.json().catch(() => ({}));
  if (res.ok) return j;
  if (res.status === 401 || res.status === 403) throw new TanyaError(503, 'Kunci API Tanya AI di server tidak valid.');
  if (res.status === 429) throw new TanyaError(429, 'Tanya AI sedang ramai (batas kuota gratis). Coba lagi sebentar lagi.');
  if (res.status === 413) throw new TanyaError(502, 'Kutipan terlalu panjang untuk layanan AI.');
  if (res.status >= 400 && res.status < 500) throw new TanyaError(502, 'Permintaan ke layanan AI ditolak.');
  throw new TanyaError(502, 'Layanan AI sedang bermasalah (' + res.status + ').');
}

/**
 * Susun jawaban. opts: { apiKey, model, body, kitab }.
 * Mengembalikan { text, model, ids, truncated }.
 */
export async function answer({ apiKey, model, body, kitab }) {
  if (!apiKey) throw new TanyaError(503, 'Tanya AI belum diaktifkan di server ini.');
  const { question, ids } = validate(body, kitab);
  const m = model || DEFAULT_MODEL;
  const payload = {
    model: m,
    max_completion_tokens: 4096,
    temperature: 0.2,
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: buildPrompt(question, ids, kitab) }],
  };
  // Proses berpikir model tidak dikirim ke pengguna, hanya jawabannya.
  // gpt-oss diberi waktu berpikir 'high': pada 'medium' ia salah membaca batas haid Hanafi (10 hari) dalam uji coba.
  if (/gpt-oss/.test(m)) Object.assign(payload, { reasoning_effort: 'high', include_reasoning: false });
  else if (/qwen3/.test(m)) payload.reasoning_format = 'hidden';
  const j = await callGroq(apiKey, payload);
  const c = j.choices && j.choices[0];
  const text = String((c && c.message && c.message.content) || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  if (!text) throw new TanyaError(502, 'Layanan AI tidak memberikan jawaban.');
  return { text, model: j.model || m, ids, truncated: c.finish_reason === 'length' };
}

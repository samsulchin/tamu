/* Tamu — inti "Tanya AI": menyusun jawaban fikih HANYA dari kutipan kitab 4 mazhab yang tersimpan di aplikasi.
 * Dipakai oleh Cloudflare Pages Function (functions/api/tanya.js) dan server lokal (tools/serve.js).
 *
 * Keamanan & privasi:
 * - Klien hanya mengirim pertanyaan + ID kutipan. Teks kitab diambil di server dari data/kitab.json,
 *   sehingga endpoint tidak bisa dipakai sebagai chatbot umum dengan teks sembarang.
 * - Pertanyaan tidak disimpan/dicatat oleh kode ini.
 */
import Anthropic from '@anthropic-ai/sdk';

export const DEFAULT_MODEL = 'claude-opus-5-5';
const MAX_Q = 400;
const MAX_IDS = 12;

const MZ_NAME = { hanafi: 'Hanafi', maliki: 'Maliki', syafii: "Syafi'i", hanbali: 'Hanbali', muqaran: 'Perbandingan mazhab' };

const SYSTEM = `Anda adalah "Tanya Tamu", pendamping belajar fikih haid untuk muslimah Indonesia di aplikasi Tamu.
Pengguna bertanya tentang haid, nifas, istihadhah, dan hukum ibadah yang terkait (shalat, puasa, mandi wajib, Al-Qur'an, masjid, hubungan suami-istri).

Sumber Anda hanya kutipan kitab di dalam <kutipan_kitab>. Kutipan itu dipilih dari bab haid kitab-kitab mazhab Hanafi, Maliki, Syafi'i, Hanbali, dan kitab perbandingan mazhab. Pengguna akan memeriksa jawaban Anda terhadap kutipan, jadi:
- Setiap pernyataan hukum harus bersandar pada kutipan dan diberi penanda sumber [n] sesuai id kutipan, tepat setelah kalimatnya. Jangan membuat id yang tidak ada.
- Jika kutipan tidak cukup untuk menjawab, atau suatu mazhab tidak terwakili, katakan terus terang (misalnya "Kutipan dari mazhab Maliki tentang ini tidak tersedia di pustaka Tamu"). Jangan mengisi dari ingatan, dan jangan mengarang nama kitab, halaman, atau hadits.
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

/**
 * Susun jawaban. opts: { apiKey, model, body, kitab }.
 * Mengembalikan { text, model, ids, truncated }.
 */
export async function answer({ apiKey, model, body, kitab }) {
  if (!apiKey) throw new TanyaError(503, 'Tanya AI belum diaktifkan di server ini.');
  const { question, ids } = validate(body, kitab);
  const client = new Anthropic({ apiKey, maxRetries: 2, timeout: 120000 });
  let response;
  try {
    response = await client.beta.messages.create({
      model: model || DEFAULT_MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'high' },
      system: SYSTEM,
      messages: [{ role: 'user', content: buildPrompt(question, ids, kitab) }],
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new TanyaError(503, 'Kunci API Tanya AI di server tidak valid.');
    if (e instanceof Anthropic.RateLimitError) throw new TanyaError(429, 'Tanya AI sedang ramai. Coba lagi sebentar lagi.');
    if (e instanceof Anthropic.BadRequestError) throw new TanyaError(502, 'Permintaan ke layanan AI ditolak.');
    if (e instanceof Anthropic.APIConnectionError) throw new TanyaError(504, 'Tidak bisa terhubung ke layanan AI.');
    if (e instanceof Anthropic.APIError) throw new TanyaError(502, 'Layanan AI sedang bermasalah (' + e.status + ').');
    throw e;
  }
  if (response.stop_reason === 'refusal') {
    throw new TanyaError(422, 'Maaf, pertanyaan ini tidak bisa dijawab oleh Tanya AI. Silakan tanyakan langsung kepada ustadzah.');
  }
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  if (!text) throw new TanyaError(502, 'Layanan AI tidak memberikan jawaban.');
  return { text, model: response.model, ids, truncated: response.stop_reason === 'max_tokens' };
}

/* Cloudflare Pages Function: POST /api/tanya
 * Dijalankan di origin yang sama dengan aplikasi, sehingga CSP 'self' cukup.
 * Atur rahasia GROQ_API_KEY di Pages → Settings → Variables and Secrets (opsional: TAMU_AI_MODEL).
 */
import { answer, TanyaError } from '../_lib/tanya-core.mjs';
import kitab from '../../data/kitab.json';

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 15; // per IP per 10 menit (per isolate; untuk perlindungan kuat, tambahkan Rate Limiting Rule di Cloudflare)
const hits = new Map();

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > LIMIT;
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'Asal permintaan tidak diizinkan.' }, 403);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (limited(ip)) return json({ error: 'Terlalu banyak pertanyaan. Coba lagi beberapa menit lagi.' }, 429);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'Permintaan tidak valid.' }, 400); }
  try {
    const r = await answer({ apiKey: env.GROQ_API_KEY, model: env.TAMU_AI_MODEL, body, kitab });
    return json(r);
  } catch (e) {
    if (e instanceof TanyaError) return json({ error: e.message }, e.status);
    return json({ error: 'Terjadi kesalahan di server.' }, 500);
  }
}

export function onRequest() {
  return json({ error: 'Gunakan POST.' }, 405);
}

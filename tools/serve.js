// Server statis lokal untuk pengembangan: node tools/serve.js  →  http://localhost:8787
// Tanya AI lokal: GROQ_API_KEY=gsk_... node tools/serve.js  (memakai inti yang sama dengan Cloudflare: functions/_lib/tanya-core.mjs)
const http = require('http'), fs = require('fs'), path = require('path'), { pathToFileURL } = require('url');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const PORT = parseInt(process.env.PORT || '8787', 10);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.md': 'text/markdown; charset=utf-8' };

let core, kitab;
function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
function tanya(req, res) {
  let raw = '';
  req.on('data', (c) => { raw += c; if (raw.length > 1e5) req.destroy(); });
  req.on('end', async () => {
    try {
      core = core || await import(pathToFileURL(path.join(__dirname, '..', 'functions', '_lib', 'tanya-core.mjs')).href);
      kitab = kitab || JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'kitab.json'), 'utf8'));
      let body;
      try { body = JSON.parse(raw); } catch (e) { return sendJSON(res, 400, { error: 'Permintaan tidak valid.' }); }
      sendJSON(res, 200, await core.answer({ apiKey: process.env.GROQ_API_KEY, model: process.env.TAMU_AI_MODEL, body, kitab }));
    } catch (e) {
      if (core && e instanceof core.TanyaError) return sendJSON(res, e.status, { error: e.message });
      console.error(e);
      sendJSON(res, 500, { error: 'Terjadi kesalahan di server.' });
    }
  });
}

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/api/tanya') return req.method === 'POST' ? tanya(req, res) : sendJSON(res, 405, { error: 'Gunakan POST.' });
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, path.normalize(p).replace(/^([/\\])+/, ''));
  if (!f.startsWith(ROOT) || /[\\/](node_modules|\.git|functions)[\\/]/.test(f)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
}).listen(PORT, () => console.log('Tamu: http://localhost:' + PORT + (process.env.GROQ_API_KEY ? ' (Tanya AI aktif)' : '')));

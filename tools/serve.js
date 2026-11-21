// Server statis lokal untuk pengembangan: node tools/serve.js  →  http://localhost:8787
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const PORT = parseInt(process.env.PORT || '8787', 10);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.md': 'text/markdown; charset=utf-8' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, path.normalize(p).replace(/^([/\\])+/, ''));
  if (!f.startsWith(ROOT) || /[\\/](node_modules|\.git|_nonaktif)[\\/]/.test(f)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
}).listen(PORT, () => console.log('Tamu: http://localhost:' + PORT));

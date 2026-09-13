// Dependency-free local preview. Only public app assets are served.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = { '/': 'index.html', '/index.html': 'index.html', '/styles.css': 'styles.css', '/data.js': 'data.js', '/core.js': 'core.js', '/app.js': 'app.js' };
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const port = Number(process.env.PORT || 4173);
http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(path.join(root, file), (error, body) => {
    if (error) { res.writeHead(500); res.end('Unable to read asset'); return; }
    const headers = { 'Content-Type': mime[path.extname(file)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    // Test-only switch to exercise the missing-Leaflet fallback in a real browser.
    if (process.env.TROIKA_TEST_OFFLINE === '1') headers['Content-Security-Policy'] = "script-src 'self'";
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  });
}).listen(port, '127.0.0.1', () => console.log(`TROIKA preview: http://127.0.0.1:${port}`));

#!/usr/bin/env node
'use strict';
// Minimal local server: static public/ + vercel.json rewrites + api/ functions. No Vercel CLI needed.
//   STORE=mock MOCK_EVENTS=2 node scripts/dev-server.js   →  http://localhost:3000/apmeklejums
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

function wrap(req, res) {
  const url = new URL(req.url, 'http://localhost');
  req.query = Object.fromEntries(url.searchParams);
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
  res.redirect = (c, loc) => { res.statusCode = c; res.setHeader('Location', loc); res.end(); };
}

const server = http.createServer((req, res) => {
  wrap(req, res);
  const url = new URL(req.url, 'http://localhost');
  let p = url.pathname;
  if (p.startsWith('/api/')) {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      const ct = (req.headers['content-type'] || '').split(';')[0];
      req.body = ct === 'application/json' ? (() => { try { return JSON.parse(raw || '{}'); } catch { return null; } })() : raw;
      const fn = require(path.join(root, 'api', p.slice(5) + '.js'));
      Promise.resolve(fn(req, res)).catch((e) => { console.error(e); res.status(500).json({ error: 'crash' }); });
    });
    return;
  }
  const rw = (vercel.rewrites || []).find((r) => r.source === p);
  if (rw) p = rw.destination;
  const rd = (vercel.redirects || []).find((r) => r.source === p);
  if (rd) return res.redirect(307, rd.destination);
  if (!path.extname(p)) p += '.html'; // cleanUrls
  const file = path.join(root, 'public', p);
  if (!file.startsWith(path.join(root, 'public')) || !fs.existsSync(file)) { res.status(404); return res.end('not found'); }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
server.listen(process.env.PORT || 3000, () => console.log('dev server on http://localhost:' + (process.env.PORT || 3000) + '/apmeklejums'));

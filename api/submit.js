'use strict';
const store = require('../lib/store');
const { validateSubmission } = require('../lib/validate');

// Soft flood guard per function instance: ≤ 30 submissions / minute / IP.
const buckets = new Map();
function flooded(ip) {
  const now = Date.now();
  const b = buckets.get(ip) || [];
  const recent = b.filter((t) => now - t < 60000);
  recent.push(now);
  buckets.set(ip, recent);
  if (buckets.size > 5000) buckets.clear();
  return recent.length > 30;
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body; // JSON (Vercel parses it)
  const raw = typeof req.body === 'string' ? req.body : '';
  if (raw.length > 2048) return null;
  const ct = (req.headers['content-type'] || '').split(';')[0];
  if (ct === 'application/x-www-form-urlencoded') {
    const out = {};
    for (const [k, v] of new URLSearchParams(raw)) {
      if (k in out) out[k] = [].concat(out[k], v); else out[k] = v;
    }
    return out;
  }
  try { return JSON.parse(raw || '{}'); } catch { return null; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (flooded(ip)) return res.status(429).json({ error: 'slow_down' });

  const body = parseBody(req);
  const v = validateSubmission(body);
  const wantsHtml = (req.headers.accept || '').includes('text/html') && !(req.headers['content-type'] || '').includes('json');

  if (!v.ok) {
    if (wantsHtml) return res.redirect(303, `/apmeklejums?err=${encodeURIComponent(v.error)}&e=${encodeURIComponent((body && body.code) || '')}`);
    return res.status(400).json({ error: v.error });
  }
  try {
    const saved = await store.save(v.data);
    if (wantsHtml) return res.redirect(303, `/apmeklejums?done=1&e=EP-${v.data.code}&lang=${v.data.lang}`);
    return res.status(201).json({ ok: true, id: saved.id });
  } catch (e) {
    const status = e.status === 404 ? 404 : 502;
    console.error('submit', status, e.message);
    if (wantsHtml) return res.redirect(303, `/apmeklejums?err=${status === 404 ? 'bad_code' : 'upstream'}`);
    return res.status(status).json({ error: status === 404 ? 'event_not_found' : 'upstream' });
  }
};

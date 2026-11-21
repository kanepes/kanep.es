'use strict';
// kanep.es/ziemassvetki backend. GET ?k= (my invitation) · GET ?t= (team list) · POST (claim / answer / admin).
const zsv = require('../lib/zsv');

const buckets = new Map();
function flooded(ip) {
  const now = Date.now();
  const recent = (buckets.get(ip) || []).filter((t) => now - t < 60000);
  recent.push(now);
  buckets.set(ip, recent);
  if (buckets.size > 5000) buckets.clear();
  return recent.length > 40;
}

function send(res, out) {
  const status = out && out.error ? out.status || 400 : 200;
  if (out && out.status) delete out.status;
  return res.status(status).json(out);
}

module.exports = async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (flooded(ip)) return res.status(429).json({ error: 'slow_down' });
  try {
    if (req.method === 'GET') {
      const q = req.query || {};
      if (q.k) return send(res, await zsv.state(String(q.k)));
      if (q.t) return send(res, await zsv.teamList(String(q.t)));
      return res.status(400).json({ error: 'missing' });
    }
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch { body = null; } }
      if (!body || typeof body !== 'object' || JSON.stringify(body).length > 4000) return res.status(400).json({ error: 'body' });
      if (body.admin) return send(res, await zsv.admin(body));
      if (body.t && body.pick) return send(res, await zsv.claim(String(body.t), String(body.pick)));
      if (body.k) return send(res, await zsv.answer(body));
      return res.status(400).json({ error: 'missing' });
    }
    return res.status(405).json({ error: 'method' });
  } catch (e) {
    console.error('zsv', e.message);
    return res.status(e.status === 500 ? 500 : 502).json({ error: 'upstream' });
  }
};

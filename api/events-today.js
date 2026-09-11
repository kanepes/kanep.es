'use strict';
const store = require('../lib/store');

// Tiny in-memory cache per function instance (60 s) — keeps Notion calls low at the door.
const cache = new Map();
const TTL = 60 * 1000;

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method' });
  const wide = req.query && (req.query.wide === '1' || req.query.wide === 'true');
  const code = req.query && req.query.e;
  try {
    if (code) {
      const ev = await store.getEvent(String(code).replace(/^EP-/i, ''));
      return res.status(200).json({ today: store.rigaDate(), events: ev ? [ev] : [], pinned: !!ev });
    }
    const today = store.rigaDate();
    const key = wide ? 'wide:' + today : 'today:' + today;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.t < TTL) return res.status(200).json(hit.v);
    const range = wide ? { from: store.addDays(today, -1), to: store.addDays(today, 1) } : { from: today, to: today };
    const events = await store.listEvents(range);
    const v = { today, events, wide: !!wide };
    cache.set(key, { t: Date.now(), v });
    return res.status(200).json(v);
  } catch (e) {
    console.error('events-today', e.message);
    return res.status(502).json({ error: 'upstream' });
  }
};

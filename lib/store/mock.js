'use strict';
// In-memory adapter for local testing: STORE=mock node scripts/dev-server.js
// MOCK_EVENTS=0|1|2 controls how many events "today" has.
const { rigaDate, addDays } = require('./notion');
const n = Number(process.env.MOCK_EVENTS || 2);
const today = rigaDate();
const all = [
  { id: 'ev-1', code: 1, name: 'Upes tūres', start: today + 'T19:00:00+03:00', venue: 'KKC Lielā zāle, 2. stāvs', partner: 'LJTI' },
  { id: 'ev-2', code: 2, name: '2ANNAS: Tīri kvīrs', start: today + 'T20:30:00+03:00', venue: 'KKC Kinozāle, 3. stāvs', partner: 'URGA' },
  { id: 'ev-3', code: 3, name: 'Garšu darbnīca', start: addDays(today, 1) + 'T18:00:00+03:00', venue: 'KKC Virtuve', partner: 'GPB' },
];
const todayEvents = all.slice(0, 2).slice(0, n);
const visible = todayEvents.concat([all[2]]);
const saved = [];
module.exports = {
  rigaDate, addDays,
  async listEvents({ from, to }) { return visible.filter((e) => e.start.slice(0, 10) >= from && e.start.slice(0, 10) <= to); },
  async getEvent(code) { return visible.find((e) => e.code === Number(code)) || null; },
  async save(answer) { const ev = await this.getEvent(answer.code); if (!ev) { const err = new Error('event_not_found'); err.status = 404; throw err; } saved.push(answer); return { id: 'mock-' + saved.length }; },
  _saved: saved,
};

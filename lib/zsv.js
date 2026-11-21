'use strict';
/**
 * KKC Ziemassvētki 2026 (kanep.es/ziemassvetki) — invitation, RSVP, bar shifts, secret santa.
 * One Notion database = guest list + answers. No personal data lives in this repo.
 *
 * Env (Vercel only):
 *   ZSV_NOTION_TOKEN  integration with read + update on the guests DB (falls back to NOTION_TOKEN)
 *   ZSV_GUESTS_DB     guests database id
 *   ZSV_SECRET        random string: personal links and the santa draw are derived from it (HMAC)
 *   ZSV_TEAM_CODE     code in the shared team link (?t=…)
 *   ZSV_ADMIN_KEY     key for admin actions (links, draw, status)
 *   ZSV_PLUS_ONE      none | guests | all   (who may bring a +1; default all)
 *   ZSV_STORE=mock    in-memory demo data, no Notion (local preview)
 */
const crypto = require('crypto');

const API = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';
const SLOTS = ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];
const SLOT_CAP = 2;
const PARTS = { cook: 'Vakariņas ar Austru', bar: 'Bāra maiņa', act: 'Priekšnesums' };
const RSVP = { yes: 'Jā', maybe: 'Varbūt', no: 'Nē' };
const OPEN = ['Apstiprināts', 'Nosūtīts'];

function env(name, fallback) {
  const v = process.env[name] || fallback;
  if (!v) throw Object.assign(new Error(`Missing env ${name}`), { status: 500 });
  return v;
}
const isMock = () => (process.env.ZSV_STORE || '').toLowerCase() === 'mock';
const secret = () => (isMock() ? 'mock-secret' : env('ZSV_SECRET'));

function mac(kind, id, len) {
  return crypto.createHmac('sha256', secret()).update(`${kind}:${id}`).digest('hex').slice(0, len);
}
const tokenFor = (id) => mac('k', id, 14);
const pickFor = (id) => mac('p', id, 10);
const same = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// ---- Notion ------------------------------------------------------------------

async function notion(method, path, body, attempt = 0) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${env('ZSV_NOTION_TOKEN', process.env.NOTION_TOKEN)}`,
      'Notion-Version': VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 2) {
    const wait = Number(res.headers.get('retry-after') || 1) * 1000 * (attempt + 1);
    await new Promise((r) => setTimeout(r, Math.min(wait, 4000)));
    return notion(method, path, body, attempt + 1);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`Notion ${res.status}: ${json.message || res.statusText}`), { status: 502 });
  return json;
}

const plain = (p) => ((p && (p.rich_text || p.title)) || []).map((r) => r.plain_text).join('').trim();
const sel = (p) => (p && p.select ? p.select.name : null);
const chk = (p) => !!(p && p.checkbox);
const rt = (s) => ({ rich_text: s ? [{ text: { content: s } }] : [] });

function toRow(page) {
  const p = page.properties || {};
  const name = plain(p['Vārds']);
  return {
    id: page.id,
    name,
    call: plain(p['Uzruna']) || name.split(/\s+/)[0] || '',
    group: sel(p['Grupa']) === 'Komanda' ? 'team' : 'guest',
    invite: sel(p['Ielūgums']),
    rsvp: Object.keys(RSVP).find((k) => RSVP[k] === sel(p['RSVP'])) || null,
    plus: plain(p['Pavadonis']),
    parts: ((p['Dalība'] && p['Dalība'].multi_select) || [])
      .map((o) => Object.keys(PARTS).find((k) => PARTS[k] === o.name)).filter(Boolean),
    shift: sel(p['Bāra maiņa']),
    act: plain(p['Priekšnesums']),
    santa: chk(p['Slepenais vecītis']),
    inDraw: chk(p['Vecīša izlozē']),
    wish: plain(p['Vēlmes vecītim']),
    note: plain(p['Komentārs']),
    show: chk(p['Rādīt sarakstā']),
    claimed: chk(p['Aizņemts']),
    answered: !!(p['Atbildēts'] && p['Atbildēts'].date),
    link: (p['Saite'] && p['Saite'].url) || '',
  };
}

let cache = { at: 0, rows: null };
let mockRows = null;

function mockData() {
  const mk = (i, name, group, extra) => Object.assign({
    id: `mock-${i}`, name, call: name.split(' ')[0], group, invite: 'Apstiprināts', rsvp: null, plus: '', parts: [],
    shift: null, act: '', santa: false, inDraw: false, wish: '', note: '', show: false, claimed: false, answered: false,
  }, extra || {});
  return [
    mk(1, 'Anna Paraugs', 'team', { rsvp: 'yes', show: true, santa: true, wish: 'kaut kas ēdams', answered: true, claimed: true }),
    mk(2, 'Jānis Piemērs', 'team', { rsvp: 'yes', show: true, santa: true, parts: ['bar'], shift: '20:00', answered: true, claimed: true }),
    mk(3, 'Līga Testa', 'team', { rsvp: 'yes', show: true, santa: true, answered: true, claimed: true }),
    mk(4, 'Pēteris Jaunais', 'team'),
    mk(5, 'Marta Viešņa', 'guest', { rsvp: 'yes', show: true, parts: ['bar', 'act'], shift: '20:00', act: 'DJ sets, 45 min', answered: true }),
    mk(6, 'DJ Kaimiņš', 'guest', { call: 'DJ Kaimiņš', rsvp: 'maybe', show: true, parts: ['cook'], answered: true }),
    mk(7, 'Oto Gaidāmais', 'guest'),
  ];
}

async function loadRows(force) {
  if (isMock()) { if (!mockRows) mockRows = mockData(); return mockRows; }
  if (!force && cache.rows && Date.now() - cache.at < 15000) return cache.rows;
  const rows = [];
  let cursor;
  do {
    const json = await notion('POST', `/databases/${env('ZSV_GUESTS_DB')}/query`, Object.assign({ page_size: 100 }, cursor ? { start_cursor: cursor } : {}));
    for (const page of json.results || []) rows.push(toRow(page));
    cursor = json.has_more ? json.next_cursor : null;
  } while (cursor);
  cache = { at: Date.now(), rows };
  return rows;
}

async function patch(row, changes) {
  if (isMock()) { Object.assign(row, changes.local); return; }
  await notion('PATCH', `/pages/${row.id}`, { properties: changes.props });
  cache.at = 0;
}

// ---- views -------------------------------------------------------------------

const invited = (r) => OPEN.includes(r.invite);
const plusAllowed = (r) => {
  const m = (process.env.ZSV_PLUS_ONE || 'all').toLowerCase();
  return m === 'all' || (m === 'guests' && r.group === 'guest');
};

function santaCycle(rows) {
  return rows.filter((r) => r.inDraw && r.group === 'team')
    .map((r) => ({ r, key: mac('s', r.id, 32) }))
    .sort((a, b) => (a.key < b.key ? -1 : 1))
    .map((x) => x.r);
}

function santaView(rows, me) {
  if (me.group !== 'team') return null;
  const cycle = santaCycle(rows);
  if (!cycle.length) return { state: 'open', joined: me.santa, count: rows.filter((r) => r.group === 'team' && r.santa && r.rsvp === 'yes').length };
  const i = cycle.findIndex((r) => r.id === me.id);
  if (i < 0) return { state: 'missed', count: cycle.length };
  const to = cycle[(i + 1) % cycle.length];
  return { state: 'drawn', count: cycle.length, to: { name: to.name, wish: to.wish } };
}

function partyView(rows) {
  const open = rows.filter(invited);
  const going = open.filter((r) => r.rsvp === 'yes');
  const bar = {};
  for (const s of SLOTS) bar[s] = 0;
  for (const r of open) if (r.rsvp !== 'no' && r.rsvp && r.parts.includes('bar') && r.shift && r.shift in bar) bar[r.shift] += 1;
  const count = (k) => open.filter((r) => r.rsvp && r.rsvp !== 'no' && r.parts.includes(k)).length;
  return {
    yes: going.length + going.filter((r) => r.plus).length,
    maybe: open.filter((r) => r.rsvp === 'maybe').length,
    who: going.filter((r) => r.show).map((r) => ({ n: r.call, g: r.group })).sort((a, b) => a.n.localeCompare(b.n, 'lv')),
    bar,
    cap: SLOT_CAP,
    acts: count('act'),
    cooks: count('cook'),
  };
}

function meView(r) {
  return {
    call: r.call, group: r.group, rsvp: r.rsvp, plus: r.plus, parts: r.parts, shift: r.shift, act: r.act,
    santa: r.santa, wish: r.wish, note: r.note, show: r.answered ? r.show : true, answered: r.answered, plusAllowed: plusAllowed(r),
  };
}

async function byToken(k, force) {
  if (!k || typeof k !== 'string' || k.length > 40) return null;
  const rows = await loadRows(force);
  const me = rows.find((r) => same(tokenFor(r.id), k));
  return me ? { rows, me } : null;
}

async function state(k) {
  const hit = await byToken(k);
  if (!hit) return { error: 'unknown', status: 404 };
  if (!invited(hit.me)) return { error: 'not_open', status: 403 };
  return { me: meView(hit.me), party: partyView(hit.rows), santa: santaView(hit.rows, hit.me), slots: SLOTS };
}

// ---- team link: pick your name once -------------------------------------------

async function teamList(code) {
  if (!same(code, isMock() ? 'komanda' : env('ZSV_TEAM_CODE'))) return { error: 'unknown', status: 404 };
  const rows = await loadRows();
  const team = rows.filter((r) => r.group === 'team' && invited(r));
  return {
    team: team.filter((r) => !r.claimed).map((r) => ({ p: pickFor(r.id), n: r.name })).sort((a, b) => a.n.localeCompare(b.n, 'lv')),
    taken: team.filter((r) => r.claimed).length,
  };
}

async function claim(code, pick) {
  if (!same(code, isMock() ? 'komanda' : env('ZSV_TEAM_CODE'))) return { error: 'unknown', status: 404 };
  const rows = await loadRows(true);
  const row = rows.find((r) => r.group === 'team' && invited(r) && same(pickFor(r.id), pick));
  if (!row) return { error: 'unknown', status: 404 };
  if (row.claimed) return { error: 'taken', status: 409 };
  await patch(row, { props: { 'Aizņemts': { checkbox: true } }, local: { claimed: true } });
  return { k: tokenFor(row.id) };
}

// ---- RSVP ---------------------------------------------------------------------

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

async function answer(body) {
  const hit = await byToken(body.k, true);
  if (!hit) return { error: 'unknown', status: 404 };
  const { rows, me } = hit;
  if (!invited(me)) return { error: 'not_open', status: 403 };
  if (!(body.rsvp in RSVP)) return { error: 'rsvp', status: 400 };

  const coming = body.rsvp !== 'no';
  const parts = coming && Array.isArray(body.parts) ? [...new Set(body.parts.filter((p) => p in PARTS))] : [];
  let shift = parts.includes('bar') && SLOTS.includes(body.shift) ? body.shift : null;
  if (parts.includes('bar') && !shift) return { error: 'shift', status: 400 };
  if (shift) {
    const taken = rows.filter((r) => r.id !== me.id && invited(r) && r.rsvp && r.rsvp !== 'no' && r.parts.includes('bar') && r.shift === shift).length;
    if (taken >= SLOT_CAP) return { error: 'slot_full', status: 409 };
  }
  const act = parts.includes('act') ? clean(body.act, 300) : '';
  const plus = coming && plusAllowed(me) ? clean(body.plus, 60) : '';
  const santa = me.group === 'team' && body.rsvp === 'yes' && !!body.santa;
  const wish = santa ? clean(body.wish, 200) : '';
  const note = clean(body.note, 300);
  const show = !!body.show;

  await patch(me, {
    props: {
      RSVP: { select: { name: RSVP[body.rsvp] } },
      Pavadonis: rt(plus),
      'Dalība': { multi_select: parts.map((p) => ({ name: PARTS[p] })) },
      'Bāra maiņa': { select: shift ? { name: shift } : null },
      'Priekšnesums': rt(act),
      'Slepenais vecītis': { checkbox: santa },
      'Vēlmes vecītim': rt(wish),
      'Komentārs': rt(note),
      'Rādīt sarakstā': { checkbox: show },
      'Atbildēts': { date: { start: new Date().toISOString() } },
    },
    local: { rsvp: body.rsvp, plus, parts, shift, act, santa, wish, note, show, answered: true },
  });
  return state(body.k);
}

// ---- admin --------------------------------------------------------------------

async function admin(body) {
  if (!same(body.admin, isMock() ? 'admin' : env('ZSV_ADMIN_KEY'))) return { error: 'unknown', status: 404 };
  const rows = await loadRows(true);
  const base = body.base || 'https://kanep.es/ziemassvetki';
  if (body.action === 'links') {
    const group = body.group === 'team' ? 'team' : body.group === 'guest' ? 'guest' : null;
    return { links: rows.filter((r) => !group || r.group === group).map((r) => ({ id: r.id, name: r.name, group: r.group, invite: r.invite, link: `${base}?k=${tokenFor(r.id)}` })) };
  }
  if (body.action === 'savelinks') {
    // Writes the personal link into the Saite column of guest rows that lack it, 15 rows per call (function time limit).
    const todo = rows.filter((r) => r.group === 'guest' && r.invite !== 'Neaicinām' && r.link !== `${base}?k=${tokenFor(r.id)}`);
    const batch = todo.slice(0, 15);
    for (const r of batch) await patch(r, { props: { Saite: { url: `${base}?k=${tokenFor(r.id)}` } }, local: { link: `${base}?k=${tokenFor(r.id)}` } });
    return { saved: batch.length, remaining: todo.length - batch.length };
  }
  if (body.action === 'status') {
    const open = rows.filter(invited);
    const by = (g) => { const x = open.filter((r) => r.group === g); return { invited: x.length, yes: x.filter((r) => r.rsvp === 'yes').length, maybe: x.filter((r) => r.rsvp === 'maybe').length, no: x.filter((r) => r.rsvp === 'no').length, silent: x.filter((r) => !r.rsvp).length }; };
    return { team: by('team'), guest: by('guest'), santa: { joined: rows.filter((r) => r.group === 'team' && r.santa && r.rsvp === 'yes').length, drawn: santaCycle(rows).length }, party: partyView(rows) };
  }
  if (body.action === 'draw') {
    if (santaCycle(rows).length) return { error: 'already_drawn', status: 409 };
    const inn = rows.filter((r) => r.group === 'team' && invited(r) && r.santa && r.rsvp === 'yes');
    if (inn.length < 3) return { error: 'too_few', status: 400, count: inn.length };
    if (body.confirm !== true) return { dryRun: true, count: inn.length, names: inn.map((r) => r.name) };
    for (const r of inn) await patch(r, { props: { 'Vecīša izlozē': { checkbox: true } }, local: { inDraw: true } });
    return { drawn: inn.length };
  }
  return { error: 'action', status: 400 };
}

module.exports = { state, teamList, claim, answer, admin, _tokenFor: tokenFor, _santaCycle: santaCycle };

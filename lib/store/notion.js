'use strict';
/**
 * Notion adapter.
 *   listEvents({from,to})  → [{ id, code, name, start, venue, partner }]
 *   getEvent(code)         → event | null
 *   save(answer)           → { id }
 * Env: NOTION_TOKEN, NOTION_EVENTS_DB (data source id), NOTION_RESPONSES_DB (data source id)
 */
const { load, notionName } = require('../config');

const API = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';
const TZ = 'Europe/Riga';

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function notion(method, path, body, attempt = 0) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${env('NOTION_TOKEN')}`,
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
  if (!res.ok) {
    const err = new Error(`Notion ${res.status}: ${json.message || res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

// ---- helpers -------------------------------------------------------------

function plain(rich) {
  return (rich || []).map((r) => r.plain_text).join('').trim();
}

function rowToEvent(page) {
  const p = page.properties || {};
  const idProp = p['Kods'] && p['Kods'].unique_id;
  const date = p['Datums'] && p['Datums'].date;
  return {
    id: page.id,
    code: idProp ? Number(idProp.number) : null,
    name: plain(p['Pasākums'] && p['Pasākums'].title),
    start: date ? date.start : null,
    end: date ? date.end : null,
    venue: plain(p['Vieta'] && p['Vieta'].rich_text),
    partner: p['Partneris'] && p['Partneris'].select ? p['Partneris'].select.name : null,
  };
}

/** YYYY-MM-DD of a date in Europe/Riga. */
function rigaDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function addDays(ymd, n) {
  const d = new Date(ymd + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ---- events --------------------------------------------------------------

/**
 * Active events whose Datums date falls within [from, to] (YYYY-MM-DD, Riga dates, inclusive).
 */
async function listEvents({ from, to } = {}) {
  const today = rigaDate();
  from = from || today;
  to = to || today;
  const body = {
    filter: {
      and: [
        { property: 'Aktīvs', checkbox: { equals: true } },
        { property: 'Datums', date: { on_or_after: from } },
        { property: 'Datums', date: { on_or_before: to + 'T23:59:59' } },
      ],
    },
    sorts: [{ property: 'Datums', direction: 'ascending' }],
    page_size: 50,
  };
  const json = await notion('POST', `/databases/${env('NOTION_EVENTS_DB')}/query`, body);
  return (json.results || []).map(rowToEvent).filter((e) => e.code !== null);
}

async function getEvent(code) {
  const body = {
    filter: { and: [
      { property: 'Kods', unique_id: { equals: Number(code) } },
      { property: 'Aktīvs', checkbox: { equals: true } },
    ] },
    page_size: 1,
  };
  const json = await notion('POST', `/databases/${env('NOTION_EVENTS_DB')}/query`, body);
  const page = (json.results || [])[0];
  return page ? rowToEvent(page) : null;
}

// ---- answers -------------------------------------------------------------

/**
 * answer: { code, vecums, grupas[], none, lv, channel, lang }
 * Looks the event up (so a wrong code cannot create an orphan row), then creates one page.
 */
async function save(answer) {
  const event = await getEvent(answer.code);
  if (!event) {
    const err = new Error('event_not_found');
    err.status = 404;
    throw err;
  }
  const now = new Date();
  now.setSeconds(0, 0); // minute precision, no finer
  const stamp = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' }).format(now);
  const lvName = answer.lv ? notionName('lv', answer.lv) : 'nav atbildēts';
  const properties = {
    Atbilde: { title: [{ text: { content: `EP-${event.code} ${stamp}` } }] },
    Pasākums: { relation: [{ id: event.id }] },
    Grupas: { multi_select: answer.grupas.map((id) => ({ name: notionName('grupas', id) })).filter((o) => o.name) },
    Neviena: { checkbox: !!answer.none },
    'Dzīvo Latvijā': { select: { name: lvName || 'nav atbildēts' } },
    Kanāls: { select: { name: answer.channel } },
    Valoda: { select: { name: answer.lang } },
    Laiks: { date: { start: now.toISOString() } },
  };
  if (answer.vecums) properties.Vecums = { select: { name: notionName('vecums', answer.vecums) } };
  const page = await notion('POST', '/pages', {
    parent: { database_id: env('NOTION_RESPONSES_DB') },
    properties,
  });
  return { id: page.id };
}

module.exports = { listEvents, getEvent, save, rigaDate, addDays, _load: load };

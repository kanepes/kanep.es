#!/usr/bin/env node
'use strict';
// Validates content/config.json so a broken edit fails the deploy instead of the live page.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'content', 'config.json');
let cfg;
try {
  cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  fail(`content/config.json nav derīgs JSON: ${e.message}`);
}
const errors = [];
const LANGS = ['lv', 'en'];
const ID_RE = /^[a-z0-9+-]+$/;

function fail(msg) { console.error('✖ ' + msg); process.exit(1); }
function text(obj, where) {
  if (!obj || typeof obj !== 'object') return errors.push(`${where}: trūkst teksta objekta {lv,en}`);
  for (const l of LANGS) if (typeof obj[l] !== 'string' || !obj[l].trim()) errors.push(`${where}.${l}: tukšs`);
}

for (const k of ['projectNumber', 'links', 'questions', 'texts']) if (!(k in cfg)) errors.push(`trūkst "${k}"`);
text(cfg.projectName, 'projectName');
for (const k of ['why', 'accessibility', 'privacy']) if (typeof (cfg.links || {})[k] !== 'string') errors.push(`links.${k}`);
if (!cfg.kiosk || typeof cfg.kiosk.resetSeconds !== 'number') errors.push('kiosk.resetSeconds jābūt skaitlim');

for (const q of ['vecums', 'grupas', 'lv']) {
  const Q = (cfg.questions || {})[q];
  if (!Q) { errors.push(`questions.${q} trūkst`); continue; }
  text(Q.label, `questions.${q}.label`);
  if (!Array.isArray(Q.options) || !Q.options.length) { errors.push(`questions.${q}.options`); continue; }
  const ids = new Set();
  Q.options.forEach((o, i) => {
    const w = `questions.${q}.options[${i}]`;
    if (!o.id || !ID_RE.test(o.id)) errors.push(`${w}.id nederīgs (tikai a-z, 0-9, -, +)`);
    if (ids.has(o.id)) errors.push(`${w}.id dublējas`);
    ids.add(o.id);
    if (typeof o.notion !== 'string' || !o.notion) errors.push(`${w}.notion trūkst (Notion opcijas nosaukums)`);
    text({ lv: o.lv, en: o.en }, w);
  });
  const enabled = Q.options.filter((o) => o.enabled !== false);
  if (!enabled.length) errors.push(`questions.${q}: nav nevienas ieslēgtas opcijas`);
}
// fixed age ids: the Bērni/Jaunieši derivation in Notion depends on them
const ageIds = (cfg.questions.vecums.options || []).map((o) => o.id).join(',');
if (ageIds !== '0-14,15-17,18-29,30-64,65+') errors.push('questions.vecums.options id-i jāpaliek: 0-14,15-17,18-29,30-64,65+');
const g = cfg.questions.grupas;
if (g && g.none) text({ lv: g.none.lv, en: g.none.en }, 'questions.grupas.none');
if (g) {
  const both = ['imigranti', 'iecelojis'].filter((id) => (g.options.find((o) => o.id === id) || {}).enabled !== false);
  if (both.length > 1) errors.push('questions.grupas: "imigranti" un "iecelojis" nedrīkst būt ieslēgti vienlaikus');
}
for (const [k, v] of Object.entries(cfg.texts || {})) text(v, `texts.${k}`);
const required = ['pageTitle','pickTitle','pickToday','pickOther','pickNone','changeEvent','title','lead','whyLink','submit','errorAge','errorLv','errorNet','thanksTitle','thanksLead','another','anotherHint','already','privacy','funded','footAccess','footPrivacy','skip','kioskReset'];
for (const k of required) if (!(cfg.texts || {})[k]) errors.push(`texts.${k} trūkst`);

if (errors.length) { errors.forEach((e) => console.error('✖ ' + e)); process.exit(1); }
console.log('✓ content/config.json derīgs');

#!/usr/bin/env node
'use strict';
// Builds public/*.html from src/*.html + content/config.json. Runs on every deploy (npm run build).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'content', 'config.json'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const t = (key, lang = 'lv') => {
  const v = cfg.texts[key];
  if (!v) throw new Error(`texts.${key} missing`);
  return esc(v[lang]);
};
const enabled = (q) => cfg.questions[q].options.filter((o) => o.enabled !== false);

// Option markup for the no-JS form (LV labels; JS re-renders bilingual buttons on top of it)
function ageOptions() {
  return enabled('vecums').map((o) =>
    `<label class="opt"><input type="radio" name="vecums" value="${esc(o.id)}" required><span class="box" aria-hidden="true"></span><span data-t="opt:vecums:${esc(o.id)}">${esc(o.lv)}</span></label>`).join('\n');
}
function groupOptions() {
  const g = cfg.questions.grupas;
  const items = enabled('grupas').map((o) =>
    `<label class="opt"><input type="checkbox" name="grupas" value="${esc(o.id)}"><span class="box" aria-hidden="true">✓</span><span data-t="opt:grupas:${esc(o.id)}">${esc(o.lv)}</span></label>`);
  items.push(`<label class="opt none"><input type="checkbox" name="none" value="1"><span class="box" aria-hidden="true">✓</span><span data-t="none">${esc(g.none.lv)}</span></label>`);
  return items.join('\n');
}
function lvOptions() {
  return cfg.questions.lv.options.map((o) =>
    `<label class="opt seg-opt"><input type="radio" name="lv" value="${esc(o.id)}" required><span data-t="opt:lv:${esc(o.id)}">${esc(o.lv)}</span></label>`).join('\n');
}

const vars = {
  CONFIG_JSON: JSON.stringify(cfg).replace(/</g, '\\u003c'),
  PROJECT_NUMBER: esc(cfg.projectNumber),
  PROJECT_NAME: esc(cfg.projectName.lv),
  PROJECT_NAME_EN: esc(cfg.projectName.en),
  LINK_WHY: esc(cfg.links.why),
  LINK_ACCESS: esc(cfg.links.accessibility),
  LINK_PRIVACY: esc(cfg.links.privacy),
  OPTIONS_VECUMS: ageOptions(),
  OPTIONS_GRUPAS: groupOptions(),
  OPTIONS_LV: lvOptions(),
  LABEL_VECUMS: esc(cfg.questions.vecums.label.lv),
  LABEL_GRUPAS: esc(cfg.questions.grupas.label.lv),
  LABEL_LV: esc(cfg.questions.lv.label.lv),
  KIOSK_RESET: String(cfg.kiosk.resetSeconds),
  BUILD_DATE: new Date().toISOString().slice(0, 10),
};

function render(src) {
  return src
    .replace(/\{\{T:([a-zA-Z]+)\}\}/g, (_, k) => t(k))
    .replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in vars ? vars[k] : (() => { throw new Error(`Unknown placeholder ${m}`); })()));
}

const srcDir = path.join(root, 'src');
const outDir = path.join(root, 'public');
for (const f of fs.readdirSync(srcDir)) {
  const src = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const out = f.endsWith('.html') ? render(src) : src;
  fs.writeFileSync(path.join(outDir, f), out);
  console.log('built public/' + f);
}

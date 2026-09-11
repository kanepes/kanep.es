'use strict';
// Single source of truth for texts, questions and options: content/config.json
const path = require('path');
const fs = require('fs');

let cached = null;
function load() {
  if (cached) return cached;
  const file = path.join(__dirname, '..', 'content', 'config.json');
  cached = JSON.parse(fs.readFileSync(file, 'utf8'));
  return cached;
}

function enabledOptions(question) {
  const q = load().questions[question];
  return (q.options || []).filter((o) => o.enabled !== false);
}

/** Map a question option id → Notion option name (only enabled options). */
function notionName(question, id) {
  const opt = enabledOptions(question).find((o) => o.id === id);
  return opt ? opt.notion : null;
}

module.exports = { load, enabledOptions, notionName };

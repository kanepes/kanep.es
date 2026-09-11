'use strict';
const { load, enabledOptions } = require('./config');

const CODE_RE = /^(?:EP-)?(\d{1,6})$/i;

/** Normalise "EP-12" / "12" / "ep-12" → 12 (number). Returns null if invalid. */
function parseCode(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const m = String(value).trim().match(CODE_RE);
  return m ? Number(m[1]) : null;
}

/**
 * Validate a submission body. Returns { ok: true, data } or { ok: false, error }.
 * data: { code:number, vecums:string|null, grupas:string[], none:boolean, lv:'yes'|'no'|null, channel, lang }
 */
function validateSubmission(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'bad_body' };
  const cfg = load();

  const code = parseCode(body.code);
  if (code === null) return { ok: false, error: 'bad_code' };

  const ageIds = new Set(enabledOptions('vecums').map((o) => o.id));
  const vecums = typeof body.vecums === 'string' && ageIds.has(body.vecums) ? body.vecums : null;
  if (cfg.questions.vecums.required && !vecums) return { ok: false, error: 'age_required' };

  const groupIds = new Set(enabledOptions('grupas').map((o) => o.id));
  let grupas = Array.isArray(body.grupas) ? body.grupas : (typeof body.grupas === 'string' ? [body.grupas] : []);
  grupas = [...new Set(grupas.filter((g) => typeof g === 'string' && groupIds.has(g)))];
  if (grupas.length > groupIds.size) return { ok: false, error: 'too_many_groups' };

  const none = body.none === true || body.none === 'true' || body.none === '1' || body.none === 'on';
  if (none) grupas = [];

  const lvIds = new Set(cfg.questions.lv.options.map((o) => o.id));
  const lv = typeof body.lv === 'string' && lvIds.has(body.lv) ? body.lv : null;
  if (cfg.questions.lv.required && !lv) return { ok: false, error: 'lv_required' };

  const channel = ['telefons', 'kiosks', 'papīrs'].includes(body.channel) ? body.channel : 'telefons';
  const lang = body.lang === 'en' ? 'en' : 'lv';

  return { ok: true, data: { code, vecums, grupas, none, lv, channel, lang } };
}

module.exports = { parseCode, validateSubmission };

/* kanep.es/apmeklejums — progressive enhancement over the plain form. No cookies, no third-party code. */
(function () {
  'use strict';
  var C = window.CONFIG;
  var T = C.texts;
  var qs = new URLSearchParams(location.search);
  var $ = function (id) { return document.getElementById(id); };
  var kiosk = qs.get('kiosk') === '1';
  var pinned = (qs.get('e') || '').replace(/^EP-/i, '');
  var lang = qs.get('lang') === 'en' ? 'en' : (safeGet('apm_lang') || 'lv');
  var event = null;
  var wide = false;

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function safeDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  // ---- language ---------------------------------------------------------
  function optLabel(q, id) {
    var o = (C.questions[q].options || []).filter(function (x) { return x.id === id; })[0];
    return o ? o[lang] : id;
  }
  function applyLang() {
    document.documentElement.lang = lang;
    document.title = T.pageTitle[lang] + ' — KKC';
    $('f-lang').value = lang;
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var k = el.getAttribute('data-t');
      var m;
      if ((m = k.match(/^opt:(\w+):(.+)$/))) el.textContent = optLabel(m[1], m[2]);
      else if ((m = k.match(/^label:(\w+)$/))) el.textContent = C.questions[m[1]].label[lang];
      else if (k === 'none') el.textContent = C.questions.grupas.none[lang];
      else if (T[k]) el.textContent = T[k][lang];
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    safeSet('apm_lang', lang);
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { lang = b.getAttribute('data-lang'); applyLang(); });
  });

  // ---- screens ----------------------------------------------------------
  function show(id) {
    ['screen-pick', 'screen-form', 'screen-thanks'].forEach(function (s) { $(s).hidden = s !== id; });
    var h = $(id).querySelector('h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); }
  }

  function fmtTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'lv-LV', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Riga' }).format(d);
  }
  function fmtDate(ymd) {
    var d = new Date(ymd + 'T12:00:00Z');
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'lv-LV', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Riga' }).format(d);
  }

  function selectEvent(ev) {
    event = ev;
    $('f-code').value = 'EP-' + ev.code;
    $('event-when').textContent = fmtTime(ev.start);
    $('event-name').textContent = ev.name + (ev.venue ? ' · ' + ev.venue : '');
    $('event-box').hidden = false;
    $('already').hidden = !safeGet('apm_done_' + ev.code);
    show('screen-form');
  }

  function renderPicker(data) {
    var list = $('pick-list');
    list.innerHTML = '';
    $('pick-date').textContent = T.pickToday[lang] + ', ' + fmtDate(data.today);
    var evs = (data.events || []).slice();
    var now = Date.now();
    evs.sort(function (a, b) { return Math.abs(new Date(a.start) - now) - Math.abs(new Date(b.start) - now); });
    $('pick-none').hidden = evs.length > 0;
    evs.forEach(function (ev) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'card'; b.setAttribute('role', 'listitem');
      var day = data.wide && ev.start ? new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'lv-LV', { day: 'numeric', month: 'short', timeZone: 'Europe/Riga' }).format(new Date(ev.start)) + ' ' : '';
      b.innerHTML = '<span class="when"></span><span class="where"></span>';
      b.querySelector('.when').textContent = day + fmtTime(ev.start) + ' · ' + ev.name;
      b.querySelector('.where').textContent = [ev.venue, ev.partner].filter(Boolean).join(' · ');
      b.addEventListener('click', function () { selectEvent(ev); });
      list.appendChild(b);
    });
    show('screen-pick');
  }

  function loadEvents(useWide) {
    var url = '/api/events-today' + (pinned ? '?e=' + encodeURIComponent(pinned) : (useWide ? '?wide=1' : ''));
    return fetch(url, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (data) {
      wide = !!useWide;
      if (pinned && data.events && data.events.length === 1) return selectEvent(data.events[0]);
      if (!useWide && data.events && data.events.length === 1) return selectEvent(data.events[0]);
      if (!useWide && (!data.events || data.events.length === 0)) return loadEvents(true);
      renderPicker(data);
    }).catch(function () {
      // Network or API down: let the visitor use the form with a hand-written code from the sheet.
      $('event-box').hidden = true;
      $('f-code').value = '';
      show('screen-form');
      showErr(T.errorNet[lang]);
    });
  }
  $('pick-wide').addEventListener('click', function () { loadEvents(true); });
  $('event-change').addEventListener('click', function () { pinned = ''; loadEvents(wide); });

  // ---- form -------------------------------------------------------------
  var form = $('form');
  function showErr(msg) { var e = $('err'); e.textContent = msg; e.classList.add('show'); }
  function clearErr() { var e = $('err'); e.textContent = ''; e.classList.remove('show'); }

  // "None of these" is exclusive
  form.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t.name === 'none' && t.checked) form.querySelectorAll('input[name="grupas"]').forEach(function (i) { i.checked = false; });
    if (t.name === 'grupas' && t.checked) form.querySelector('input[name="none"]').checked = false;
    clearErr();
  });

  function collect() {
    var data = { code: $('f-code').value, lang: lang, channel: kiosk ? 'kiosks' : 'telefons', grupas: [] };
    var v = form.querySelector('input[name="vecums"]:checked'); data.vecums = v ? v.value : null;
    form.querySelectorAll('input[name="grupas"]:checked').forEach(function (i) { data.grupas.push(i.value); });
    data.none = !!form.querySelector('input[name="none"]:checked');
    var l = form.querySelector('input[name="lv"]:checked'); data.lv = l ? l.value : null;
    return data;
  }

  function send(data) {
    return fetch('/api/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    }).then(function (r) {
      if (r.status === 201) return true;
      if (r.status >= 400 && r.status < 500 && r.status !== 429) return r.json().then(function (j) { throw new Error(j.error || 'bad'); });
      throw new Error('retry');
    }, function () { throw new Error('retry'); }); // network down → keep it and retry later
  }

  function queue(data) {
    var q = []; try { q = JSON.parse(safeGet('apm_queue') || '[]'); } catch (e) {}
    q.push(data); safeSet('apm_queue', JSON.stringify(q.slice(-20)));
  }
  function flushQueue() {
    var q = []; try { q = JSON.parse(safeGet('apm_queue') || '[]'); } catch (e) {}
    if (!q.length) return;
    safeDel('apm_queue');
    q.reduce(function (p, item) {
      return p.then(function () { return send(item).catch(function (e) { if (e.message === 'retry') queue(item); }); });
    }, Promise.resolve());
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    clearErr();
    var data = collect();
    if (C.questions.vecums.required && !data.vecums) { showErr(T.errorAge[lang]); form.querySelector('input[name="vecums"]').focus(); return; }
    if (C.questions.lv.required && !data.lv) { showErr(T.errorLv[lang]); form.querySelector('input[name="lv"]').focus(); return; }
    if (!data.code) { showErr(T.pickNone[lang]); return; }
    var btn = $('submit'); btn.disabled = true;
    send(data).then(function () { thanks(data); }).catch(function (e) {
      if (e.message === 'retry') { queue(data); thanks(data, true); }
      else showErr(T.errorNet[lang]);
    }).finally(function () { btn.disabled = false; });
  });

  function thanks(data, queued) {
    if (event) safeSet('apm_done_' + event.code, '1');
    var parts = [];
    if (data.vecums) parts.push(optLabel('vecums', data.vecums));
    data.grupas.forEach(function (g) { parts.push(optLabel('grupas', g)); });
    if (data.lv) parts.push(C.questions.lv.label[lang].replace(/…$/, '') + ' ' + optLabel('lv', data.lv));
    var sum = $('sum');
    sum.innerHTML = '';
    if (event) { var b = document.createElement('b'); b.textContent = event.name; sum.appendChild(b); sum.appendChild(document.createElement('br')); }
    sum.appendChild(document.createTextNode(parts.join(' · ') + (queued ? ' — ' + T.errorNet[lang] : '')));
    sum.hidden = false;
    show('screen-thanks');
    if (kiosk) setTimeout(reset, (C.kiosk.resetSeconds || 8) * 1000);
  }

  function reset() {
    form.reset(); clearErr();
    $('already').hidden = true;
    if (event) show('screen-form'); else loadEvents(false);
  }
  $('another').addEventListener('click', reset);

  // ---- boot -------------------------------------------------------------
  if (kiosk) document.body.classList.add('kiosk');
  $('f-channel').value = kiosk ? 'kiosks' : 'telefons';
  applyLang();
  flushQueue();
  if (qs.get('done') === '1') { show('screen-thanks'); $('sum').hidden = true; }
  else if (qs.get('err')) { show('screen-form'); showErr(qs.get('err') === 'upstream' ? T.errorNet[lang] : T.pickNone[lang]); }
  else loadEvents(false);
})();

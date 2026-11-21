#!/usr/bin/env python3
"""Builds a self-contained design preview of src/ziemassvetki.html for review as a claude.ai Artifact.

The preview is the real page with an in-page stand-in for /api/zsv (made-up people, nothing is saved) and a small
bar on top for switching between views. Usage: python3 scripts/zsv-preview.py <output.html>
"""
import base64, re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'src' / 'ziemassvetki.html').read_text(encoding='utf-8')
font = base64.b64encode((root / 'public' / 'assets' / 'fonts' / 'BravoRG.woff2').read_bytes()).decode()

def once(text, old, new):
    assert text.count(old) == 1, old[:70]
    return text.replace(old, new)

style = re.search(r'<style>(.*?)</style>', src, re.S).group(1)
body = re.search(r'<body>(.*?)<script>', src, re.S).group(1)
js = re.search(r'<script>(.*?)</script>', src, re.S).group(1)
fonts_link = re.search(r'<link href="https://fonts.googleapis.com[^>]*>', src).group(0)

# --- styles: inline the KKC typeface, follow the Artifact page contract (explicit background, side gutters) ---
style = re.sub(r'@font-face \{[^}]*\}', '@font-face { font-family:"BravoRG"; src:url("data:font/woff2;base64,%s") format("woff2"); font-display:swap; }' % font, style, count=1)
style = once(style, 'html { background:var(--board); }', ':root { color-scheme:dark; }\n  html { background:var(--board); }')
style = once(style, 'line-height:1.5; min-height:100vh; overflow-x:hidden;', 'line-height:1.5; overflow-x:hidden; background-color:var(--board);')
style = once(style, 'body::before { content:""; position:fixed; inset:-10%; z-index:-1;', 'body::before { content:""; position:fixed; inset:-10%; z-index:0;')
style = once(style, '.wrap { max-width:600px; margin:0 auto; padding:14px 12px 64px; }',
             '.wrap { position:relative; z-index:1; max-width:600px; margin:0 auto; padding-block:14px 64px; padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); }')
style = once(style, '.wrap { max-width:1120px; padding:22px 24px 72px; }',
             '.wrap { max-width:1120px; padding-block:22px 72px; padding-left:max(24px, env(safe-area-inset-left, 0px)); padding-right:max(24px, env(safe-area-inset-right, 0px)); }')
style += """
  /* review bar: not part of the design */
  .review { border:1.5px dashed rgba(237,232,223,.4); border-radius:14px; padding:12px 14px 14px; margin:0 0 18px; color:var(--chalk); }
  .review p { margin:0 0 10px; font-size:14px; line-height:1.45; color:var(--dim); max-width:70ch; }
  .review p b { color:var(--chalk); }
  .scenes { display:flex; flex-wrap:wrap; gap:6px; }
  .scenes button { background:none; border:1px solid var(--line); color:var(--chalk); border-radius:999px; padding:8px 12px 7px; cursor:pointer; }
  .scenes button[aria-pressed="true"] { background:var(--cream); color:var(--ink); border-color:var(--cream); }
  .scenes button:focus-visible, .lang button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
"""

# --- body: add the review bar ---
review = """
  <div class="review" role="region" aria-label="Maketa skati">
    <p><b>Makets komentēšanai.</b> Cilvēki ir izdomāti, un nekas netiek saglabāts. Pārslēdz skatus, izmēģini talonu un atstāj komentāru pie vietas, kas jāmaina.</p>
    <div class="scenes">
      <button type="button" class="mono" id="sc-team" data-scene="team">Komanda</button>
      <button type="button" class="mono" id="sc-guest" data-scene="guest">Viesis</button>
      <button type="button" class="mono" id="sc-done" data-scene="done">Pēc atbildes</button>
      <button type="button" class="mono" id="sc-pick" data-scene="pick">Vārda izvēle</button>
      <button type="button" class="mono" id="sc-santa" data-scene="santa">Vecītis izlozēts</button>
    </div>
  </div>
"""
body = once(body, '<div class="wrap">', '<div class="wrap">' + review)
body = once(body, '<button type="button" class="mono" data-lang="lv"', '<button type="button" class="mono" id="lang-lv" data-lang="lv"')
body = once(body, '<button type="button" class="mono" data-lang="en"', '<button type="button" class="mono" id="lang-en" data-lang="en"')

# --- script: replace the network with made-up data ---
mock = r"""
  var SLOTS = ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00'], CAP = 2, DB = [];
  function seed() {
    var mk = function (i, name, group, x) {
      var r = { id: 'mock-' + i, name: name, call: name.split(' ')[0], group: group, rsvp: null, plus: '', parts: [], shift: null, act: '', santa: false, inDraw: false, wish: '', note: '', show: false, claimed: false, answered: false };
      for (var k in x || {}) r[k] = x[k];
      return r;
    };
    return [
      mk(1, 'Anna Paraugs', 'team', { rsvp: 'yes', show: true, santa: true, wish: 'kaut kas ēdams', answered: true, claimed: true }),
      mk(2, 'Jānis Piemērs', 'team', { rsvp: 'yes', show: true, santa: true, wish: 'grāmata vai plate', parts: ['bar'], shift: '20:00', plus: 'Elza', answered: true, claimed: true }),
      mk(3, 'Līga Testa', 'team', { rsvp: 'yes', show: true, santa: true, answered: true, claimed: true }),
      mk(4, 'Pēteris Jaunais', 'team'), mk(8, 'Rasa Rīta', 'team'), mk(9, 'Toms Tehniķis', 'team'), mk(10, 'Zane Bāra', 'team'), mk(11, 'Ilga Tīrā', 'team'),
      mk(5, 'Marta Viešņa', 'guest', { rsvp: 'yes', show: true, parts: ['bar', 'act'], shift: '20:00', act: 'DJ sets, 45 min', answered: true }),
      mk(6, 'DJ Kaimiņš', 'guest', { call: 'DJ Kaimiņš', rsvp: 'maybe', show: true, parts: ['cook'], answered: true }),
      mk(7, 'Oto Gaidāmais', 'guest')
    ];
  }
  function viewOf(me) {
    var going = DB.filter(function (r) { return r.rsvp === 'yes'; });
    var bar = {}; SLOTS.forEach(function (s) { bar[s] = 0; });
    DB.forEach(function (r) { if (r.rsvp && r.rsvp !== 'no' && r.parts.indexOf('bar') >= 0 && r.shift) bar[r.shift] += 1; });
    var count = function (k) { return DB.filter(function (r) { return r.rsvp && r.rsvp !== 'no' && r.parts.indexOf(k) >= 0; }).length; };
    var santa = null;
    if (me.group === 'team') {
      var cycle = DB.filter(function (r) { return r.inDraw; });
      if (!cycle.length) santa = { state: 'open', count: DB.filter(function (r) { return r.group === 'team' && r.santa && r.rsvp === 'yes'; }).length };
      else if (cycle.indexOf(me) < 0) santa = { state: 'missed', count: cycle.length };
      else { var to = cycle[(cycle.indexOf(me) + 1) % cycle.length]; santa = { state: 'drawn', count: cycle.length, to: { name: to.name, wish: to.wish } }; }
    }
    return {
      me: { call: me.call, group: me.group, rsvp: me.rsvp, plus: me.plus, parts: me.parts, shift: me.shift, act: me.act, santa: me.santa, wish: me.wish, note: me.note, show: me.answered ? me.show : true, answered: me.answered, plusAllowed: true },
      party: { yes: going.length + going.filter(function (r) { return r.plus; }).length, maybe: DB.filter(function (r) { return r.rsvp === 'maybe'; }).length,
        who: going.filter(function (r) { return r.show; }).map(function (r) { return { n: r.call, g: r.group }; }), bar: bar, cap: CAP, acts: count('act'), cooks: count('cook') },
      santa: santa, slots: SLOTS
    };
  }
  function route(method, b) {
    var find = function (id) { return DB.filter(function (r) { return r.id === id; })[0]; };
    if (method === 'GET' && b.t) return { team: DB.filter(function (r) { return r.group === 'team' && !r.claimed; }).map(function (r) { return { p: r.id, n: r.name }; }) };
    if (method === 'GET') { var who = find(b.k); return who ? viewOf(who) : { error: 'unknown' }; }
    if (b.pick) { var p = find(b.pick); if (!p || p.claimed) return { error: 'taken' }; p.claimed = true; return { k: p.id }; }
    var me = find(b.k); if (!me) return { error: 'unknown' };
    var coming = b.rsvp !== 'no', parts = coming ? b.parts : [];
    var shift = parts.indexOf('bar') >= 0 ? b.shift : null;
    if (shift && shift !== me.shift && DB.filter(function (r) { return r !== me && r.rsvp && r.rsvp !== 'no' && r.parts.indexOf('bar') >= 0 && r.shift === shift; }).length >= CAP) return { error: 'slot_full' };
    me.rsvp = b.rsvp; me.parts = parts; me.shift = shift; me.act = parts.indexOf('act') >= 0 ? b.act : ''; me.plus = coming ? b.plus : '';
    me.santa = b.rsvp === 'yes' && me.group === 'team' && !!b.santa; me.wish = me.santa ? b.wish : ''; me.note = b.note; me.show = !!b.show; me.answered = true;
    return viewOf(me);
  }
  function api(method, body) {
    return new Promise(function (done) { setTimeout(function () { done(route(method, body)); }, 160); });
  }
"""
js = re.sub(r"  function api\(method, body\) \{.*?\n  \}\n", lambda m: mock, js, count=1, flags=re.S)
assert 'function route(' in js
js = once(js, "var qs = new URLSearchParams(location.search);", "var qs = new URLSearchParams('');")
js = once(js, "store.get('zsv_k') || ''", "''")
js, n = re.subn(r"history\.replaceState\(.*?\)\); ", "", js, count=1)
assert n == 1
js = once(js, "var link = location.origin + location.pathname + '?k=' + S.k;", "var link = 'https://kanep.es/zsv?k=a1b2c3d4e5f6a7';")
scenes = r"""
  var SCENES = { team: 'mock-4', guest: 'mock-7', done: 'mock-2', pick: '', santa: 'mock-1' };
  function scene(name) {
    DB = seed();
    if (name === 'santa') DB.forEach(function (r) { if (r.group === 'team' && r.santa) r.inDraw = true; });
    S.k = SCENES[name]; S.team = name === 'pick' ? 'komanda' : ''; S.fresh = false; S.editing = false; S.err = ''; S.dealt = false; S.view = 'loading';
    document.querySelectorAll('.scenes button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-scene') === name)); });
    start();
  }
  document.querySelectorAll('.scenes button').forEach(function (b) { b.addEventListener('click', function () { scene(b.getAttribute('data-scene')); }); });
  chrome();
  scene('team');
})();
"""
js = once(js, "  chrome();\n  start();\n})();\n", scenes)

out = """<title>Ziemassvētku ielūguma makets</title>
<meta name="claude:viewport-fit-sides" content="cover">
%s
<style>%s</style>
%s<script>%s</script>
""" % (fonts_link.replace('<link href', '<link rel="stylesheet" href').replace(' rel="stylesheet">', '>'), style, body, js)
pathlib.Path(sys.argv[1]).write_text(out, encoding='utf-8')
print('wrote', sys.argv[1], len(out), 'bytes')

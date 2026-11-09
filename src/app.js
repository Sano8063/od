// ===== Od — redaktor, konsol, lövhə, dərslər, ayarlar =====
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var code = $('code'), hl = $('hl'), gutter = $('gutter'), cons = $('console');
  var errLine = null, current = null;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function store(k, v) { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {} }
  function fetchStore(k, json) { try { var v = localStorage.getItem(k); return json ? (v ? JSON.parse(v) : null) : v; } catch (e) { return null; } }

  // ---- İkonlar (sadə xətt ikonları) ----
  var ICONS = {
    files: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13l-2 2 2 2M15 13l2 2-2 2"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>',
    type: '<path d="M4 19 9.5 5h1L16 19"/><path d="M6.3 14h7.4"/><path d="M17 11h4M19 9v4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    play: '<path d="M7 5v14l11-7z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6z"/><path d="m9 12 2 2 4-4"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    game: '<rect x="2.5" y="7" width="19" height="10" rx="4"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="11" r=".6"/><circle cx="18" cy="13" r=".6"/>',
    brush: '<path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L11 15.8 8.2 13z"/><path d="M8 14c-2.5 0-4 1.6-4 4 0 1.2-.6 2-2 2 1.2 1.3 3 2 5 2 2.8 0 5-2.2 5-5z"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    cloud: '<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 1 0 6 16.5"/><path d="M6 19h11.5"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    flag: '<path d="M4 22V4"/><path d="M4 4h12l-2 4 2 4H4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>'
  };
  function icon(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || '') + '</svg>'; }
  function applyIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      if (el.dataset.iconDone) return; el.dataset.iconDone = '1';
      el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon));
    });
  }
  applyIcons();

  // ---- Ayarlar ----
  var THEMES = [
    { id: 'qaranliq', ad: 'Qaranlıq', pv: ['#1b1d22', '#272a31', '#d38cf0', '#6cb6ff'] },
    { id: 'isiqli', ad: 'İşıqlı', pv: ['#f6f7f9', '#ffffff', '#8250df', '#0b62d6'] },
    { id: 'gece', ad: 'Gecə mavisi', pv: ['#0e1522', '#172236', '#c4a7ff', '#7cc4ff'] },
    { id: 'kontrast', ad: 'Yüksək kontrast', pv: ['#000000', '#0d0d0d', '#ff9cff', '#7fdbff'] }
  ];
  var ACCENTS = [
    { id: 'od', ad: 'Od narıncısı', c: '#e8692c' }, { id: 'mavi', ad: 'Mavi', c: '#2f81f7' },
    { id: 'yasil', ad: 'Yaşıl', c: '#1f9d55' }, { id: 'benovseyi', ad: 'Bənövşəyi', c: '#8b5cf6' },
    { id: 'qirmizi', ad: 'Qırmızı', c: '#e11d48' }, { id: 'firuze', ad: 'Firuzə', c: '#0d9488' }
  ];
  var SET = Object.assign({ theme: 'qaranliq', accent: 'od', fs: 14, lines: true, pairs: true, sideW: 300 }, fetchStore('od-ayarlar', true) || {});
  function applySettings() {
    document.documentElement.setAttribute('data-theme', SET.theme);
    var a = ACCENTS.filter(function (x) { return x.id === SET.accent; })[0] || ACCENTS[0];
    document.documentElement.style.setProperty('--accent', a.c);
    document.documentElement.style.setProperty('--fs', SET.fs + 'px');
    $('editorBox').classList.toggle('nolines', !SET.lines);
    store('od-ayarlar', SET);
    if (typeof highlight === 'function') highlight();
  }
  function renderSettings() {
    var h = '<div class="sec"><h4>Mövzu</h4><div class="themes">' + THEMES.map(function (t) {
      return '<button class="th' + (SET.theme === t.id ? ' on' : '') + '" data-theme="' + t.id + '"><div class="pv">' +
        t.pv.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</div>' + t.ad + '</button>';
    }).join('') + '</div></div>';
    h += '<div class="sec"><h4>Vurğu rəngi</h4><div class="swatches">' + ACCENTS.map(function (a) {
      return '<button class="sw' + (SET.accent === a.id ? ' on' : '') + '" data-acc="' + a.id + '" title="' + a.ad + '" style="background:' + a.c + '"></button>';
    }).join('') + '</div></div>';
    h += '<div class="sec"><h4>Redaktor</h4><div class="field"><label>Şrift ölçüsü: <b id="fsVal">' + SET.fs + 'px</b></label>' +
      '<input type="range" min="12" max="22" step="1" value="' + SET.fs + '" id="fsRange"></div>' +
      '<label class="switch">Sətir nömrələri<input type="checkbox" id="optLines"' + (SET.lines ? ' checked' : '') + '></label>' +
      '<label class="switch">Dırnaq və mötərizəni avtomatik bağla<input type="checkbox" id="optPairs"' + (SET.pairs ? ' checked' : '') + '></label></div>';
    h += '<div class="sec"><h4>Məlumat</h4><p class="phil">Ayarlar bu brauzerdə saxlanılır. Kod sənin cihazında işləyir və heç bir serverə göndərilmir (yalnız sinif tapşırığını göndərəndə).</p>' +
      '<div class="row" style="margin-top:10px"><button class="btn sm" id="resetSet">Ayarları sıfırla</button></div></div>';
    $('pane-ayarlar').innerHTML = h;
    $('pane-ayarlar').querySelectorAll('.th').forEach(function (b) { b.onclick = function () { SET.theme = b.dataset.theme; applySettings(); renderSettings(); }; });
    $('pane-ayarlar').querySelectorAll('.sw').forEach(function (b) { b.onclick = function () { SET.accent = b.dataset.acc; applySettings(); renderSettings(); }; });
    $('fsRange').oninput = function () { SET.fs = +this.value; $('fsVal').textContent = SET.fs + 'px'; applySettings(); };
    $('optLines').onchange = function () { SET.lines = this.checked; applySettings(); };
    $('optPairs').onchange = function () { SET.pairs = this.checked; applySettings(); };
    $('resetSet').onclick = function () { SET = { theme: 'qaranliq', accent: 'od', fs: 14, lines: true, pairs: true }; applySettings(); renderSettings(); toast('Ayarlar sıfırlandı'); };
  }

  // ---- Sintaksis rəngləmə ----
  var KWF = ['sina', 'eger', 'yoxsa', 'ne', 'qeder', 'ki', 'tekrarla', 'defe', 'her', 'icinde', 'ucun', 'funksiya', 'qaytar', 'dayan', 'davam', 've', 'ya', 'deyil'];
  var BOOLF = ['dogru', 'yalan', 'hec'];
  var BIF = ['goster', 'daxil_et', 'gozle', 'uzunluq', 'tesadufi', 'araliq', 'yuvarlaq', 'asagi', 'yuxari', 'tam_bol', 'kok', 'mutleq', 'quvvet', 'en_boyuk', 'en_kicik', 'cem', 'metn', 'eded', 'siyahi', 'tip', 'temizle', 'ireli', 'geri', 'saga', 'sola', 'daire', 'merkeze', 'reng', 'qelem_qaldir', 'qelem_endir', 'qalinliq', 'suret', 'arxa_fon', 'resme_yaz', 'kadr', 'basilib', 'basildi', 'lovheni_temizle', 'duzbucaqli', 'daire_cek', 'ucbucaq', 'xett', 'metn_yaz', 'merkezde_yaz', 'toqqusur', 'mesafe', 'vaxt', 'sican_x', 'sican_y', 'kliklendi', 'xeta_at'];
  function highlightLine(line) {
    var out = '', re = /(#.*$)|("(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_\u00C0-\u024F\u0259\u018F][A-Za-z0-9_\u00C0-\u024F\u0259\u018F\u0307]*)/g, m, last = 0;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (m[1]) out += '<span class="cm">' + esc(m[1]) + '</span>';
      else if (m[2]) {
        var closed = m[2].length > 1 && m[2][m[2].length - 1] === m[2][0] && m[2][m[2].length - 2] !== '\\';
        out += '<span class="' + (closed ? 'str' : 'strbad') + '"' + (closed ? '' : ' title="Dırnaq bağlanmayıb"') + '>' + esc(m[2]) + '</span>';
      }
      else if (m[3]) out += '<span class="num">' + m[3] + '</span>';
      else {
        var f = Od.canon(m[4]), prevDot = line[m.index - 1] === '.';
        if (!prevDot && KWF.indexOf(f) >= 0) out += '<span class="kw">' + esc(m[4]) + '</span>';
        else if (!prevDot && BOOLF.indexOf(f) >= 0) out += '<span class="bool">' + esc(m[4]) + '</span>';
        else if (BIF.indexOf(f) >= 0 || prevDot || line[re.lastIndex] === '(') out += '<span class="fn">' + esc(m[4]) + '</span>';
        else out += esc(m[4]);
      }
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  }
  function highlightCode(src) { return src.split('\n').map(highlightLine).join('\n'); }
  function highlight() {
    var lines = code.value.split('\n');
    hl.innerHTML = lines.map(function (l, i) {
      var o = highlightLine(l);
      return errLine === i + 1 ? '<span class="errline">' + (o || ' ') + '</span>' : o;
    }).join('\n') + '\n';
    var g = '';
    for (var i = 1; i <= lines.length; i++) g += '<div' + (errLine === i ? ' class="err"' : '') + '>' + i + '</div>';
    gutter.innerHTML = g;
    syncScroll();
  }
  function syncScroll() { hl.scrollTop = code.scrollTop; hl.scrollLeft = code.scrollLeft; gutter.scrollTop = code.scrollTop; }
  function updatePos() {
    var v = code.value.slice(0, code.selectionStart), ln = v.split('\n');
    $('sbPos').textContent = 'Sətir ' + ln.length + ', Sütun ' + (ln[ln.length - 1].length + 1);
  }
  code.addEventListener('input', function () { errLine = null; highlight(); saveCtx(); updatePos(); });
  code.addEventListener('scroll', syncScroll);
  code.addEventListener('keyup', updatePos);
  code.addEventListener('click', updatePos);

  var PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
  function inOpenString(v, pos) {
    var ls = v.lastIndexOf('\n', pos - 1) + 1, q = null;
    for (var i = ls; i < pos; i++) {
      var c = v[i];
      if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; }
      else if (c === '#') return false;
      else if (c === '"' || c === "'") q = c;
    }
    return !!q;
  }
  function insertText(t) {
    var ok = false;
    try { ok = document.execCommand('insertText', false, t); } catch (err) {}
    if (!ok) {
      var s = code.selectionStart, e = code.selectionEnd;
      code.value = code.value.slice(0, s) + t + code.value.slice(e);
      code.selectionStart = code.selectionEnd = s + t.length;
      code.dispatchEvent(new Event('input'));
    }
  }
  code.addEventListener('keydown', function (e) {
    if (code.readOnly) return;
    var s = code.selectionStart, en = code.selectionEnd, v = code.value;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runProgram(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        var ls = v.lastIndexOf('\n', s - 1) + 1, rm = v.slice(ls).match(/^ {1,4}/);
        if (rm) { code.selectionStart = ls; code.selectionEnd = ls + rm[0].length; insertText(''); code.selectionStart = code.selectionEnd = Math.max(ls, s - rm[0].length); }
      } else insertText('    ');
      return;
    }
    if (SET.pairs && PAIRS[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var nextCh = v[s], prevCh = v[s - 1] || '', isQuote = e.key === '"' || e.key === "'";
      if (isQuote && s === en && nextCh === e.key && inOpenString(v, s)) { e.preventDefault(); code.selectionStart = code.selectionEnd = s + 1; return; }
      if (s !== en) {
        e.preventDefault();
        var sel = v.slice(s, en);
        insertText(e.key + sel + PAIRS[e.key]);
        code.selectionStart = s + 1; code.selectionEnd = s + 1 + sel.length; return;
      }
      if (isQuote && (/[A-Za-z0-9_\u00C0-\u024F\u0259]/.test(prevCh) || inOpenString(v, s))) return;
      if (nextCh === undefined || nextCh === '\n' || /[\s)\]},:]/.test(nextCh)) {
        e.preventDefault(); insertText(e.key + PAIRS[e.key]); code.selectionStart = code.selectionEnd = s + 1; return;
      }
      return;
    }
    if (SET.pairs && (e.key === ')' || e.key === ']' || e.key === '}') && s === en && v[s] === e.key) { e.preventDefault(); code.selectionStart = code.selectionEnd = s + 1; return; }
    if (SET.pairs && e.key === 'Backspace' && s === en && s > 0 && PAIRS[v[s - 1]] && v[s] === PAIRS[v[s - 1]]) {
      e.preventDefault(); code.selectionStart = s - 1; code.selectionEnd = s + 1; insertText(''); return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      var cur = v.slice(v.lastIndexOf('\n', s - 1) + 1, s), ind = cur.match(/^ */)[0];
      if (/:\s*(#.*)?$/.test(cur)) ind += '    ';
      insertText('\n' + ind);
    }
  });

  // ---- Kontekst: sərbəst kod / dərs / tapşırıq ----
  var ctx = null;
  function setContext(c, text) {
    ctx = c;
    code.readOnly = !!c.readOnly;
    code.value = text == null ? '' : text;
    errLine = null; highlight(); updatePos();
    code.scrollTop = 0; syncScroll();
    $('ftab').innerHTML = icon(c.icon || 'file') + '<span>' + esc(c.title) + '</span>';
    $('crumb').innerHTML = esc(c.crumb || '') ;
    $('sbMode').textContent = c.mode || '';
    $('strictBanner').classList.toggle('on', !!c.strict);
    renderEdTools();
  }
  function saveCtx() { if (ctx && ctx.save && !code.readOnly) ctx.save(code.value); }
  function renderEdTools() {
    var t = $('edTools'); t.innerHTML = '';
    (ctx && ctx.tools || []).forEach(function (tool) {
      var b = document.createElement('button');
      b.className = 'btn sm ' + (tool.cls || '');
      b.innerHTML = (tool.icon ? icon(tool.icon) : '') + esc(tool.label);
      b.onclick = tool.onClick; t.appendChild(b);
    });
  }
  function freeContext(text) {
    setContext({ type: 'free', title: 'proqram.od', crumb: 'Mənim kodum', mode: 'Sərbəst rejim', icon: 'file',
      save: function (v) { store('od-kod', v); } }, text != null ? text : (fetchStore('od-kod') || OD_EXAMPLES[0].kod));
    if (text != null) store('od-kod', text);
  }

  // ---- Panellər ----
  var PANES = { kod: 'Kod', dersler: 'Dərslər', sinif: 'Sinif', elifba: 'Od əlifbası', ayarlar: 'Ayarlar' };
  var curPane = 'kod';
  function showPane(name, opts) {
    opts = opts || {};
    var side = $('side');
    if (name === curPane && !side.classList.contains('closed') && opts.toggle) { side.classList.add('closed'); markActs(null); return; }
    curPane = name; side.classList.remove('closed');
    document.querySelectorAll('.pane').forEach(function (p) { p.classList.toggle('on', p.id === 'pane-' + name); });
    $('sideTitle').textContent = PANES[name];
    side.style.setProperty('--side-w', name === 'dersler' || name === 'sinif' ? '380px' : '300px');
    markActs(name);
    if (name === 'dersler') enterLessons();
    if (name === 'ayarlar') renderSettings();
    if (window.OdClassroom && name === 'sinif') window.OdClassroom.render();
  }
  function markActs(name) { document.querySelectorAll('.act').forEach(function (a) { a.classList.toggle('on', a.dataset.pane === name); }); }
  document.querySelectorAll('.act').forEach(function (a) { a.onclick = function () { showPane(a.dataset.pane, { toggle: true }); }; });

  // Kod paneli: nümunələr
  var GROUPS = [
    { ad: 'Əsaslar', ids: ['salam', 'cedvel', 'funksiya', 'siyahi', 'herfsiz'] },
    { ad: 'Oyunlar', ids: ['oyun', 'ilan', 'kerpic', 'kosmos'], icon: 'game' },
    { ad: 'Rəsm və yazı', ids: ['resm', 'ulduz', 'yazi'], icon: 'brush' }
  ];
  function renderKodPane() {
    var h = '<div class="sec" style="padding:8px 0"><h4 style="padding:4px 14px">Fayl</h4><div class="list">' +
      '<button class="item" id="myCode">' + icon('file') + 'proqram.od<span class="meta">mənim kodum</span></button>' +
      '<button class="item" id="newCode">' + icon('plus') + 'Yeni boş fayl</button></div></div>';
    GROUPS.forEach(function (g) {
      h += '<div class="sec" style="padding:8px 0"><h4 style="padding:4px 14px">' + g.ad + '</h4><div class="list">';
      g.ids.forEach(function (id) {
        var ex = OD_EXAMPLES.filter(function (x) { return x.id === id; })[0]; if (!ex) return;
        var name = ex.ad.replace(/^[^\wƏəÖöÜüŞşÇçĞğİıA-Za-z]+/, '').replace(/^Oyun:\s*/, '');
        h += '<button class="item" data-ex="' + id + '">' + icon(g.icon || 'file') + esc(name) + '</button>';
      });
      h += '</div></div>';
    });
    $('pane-kod').innerHTML = h;
    $('myCode').onclick = function () { freeContext(); };
    $('newCode').onclick = function () { freeContext('# Yeni proqram\n'); code.focus(); };
    $('pane-kod').querySelectorAll('[data-ex]').forEach(function (b) {
      b.onclick = function () {
        var ex = OD_EXAMPLES.filter(function (x) { return x.id === b.dataset.ex; })[0];
        freeContext(ex.kod); toast('Nümunə açıldı: ' + ex.ad.replace(/^\S+\s/, ''));
        if (matchMedia('(max-width:760px)').matches) $('side').classList.add('closed');
      };
    });
  }

  // Əlifba paneli
  var ABC = [
    { ad: 'Açar sözlər', cls: 'kw', items: ['əgər', 'yoxsa', 'yoxsa əgər', 'nə qədər ki', 'təkrarla … dəfə', 'hər … içində', 'funksiya', 'qaytar', 'dayan', 'davam', 'sına', 'xəta olsa', 'doğru', 'yalan', 'heç', 'və', 'və ya', 'deyil'] },
    { ad: 'İşarələr', cls: 'op', items: ['+', '-', '*', '/', '%', '**', '==', '!=', '<', '>', '<=', '>=', '=', '+=', '-=', '( )', '[ ]', '{ }', ':', '.', '"…"', '#'] },
    { ad: 'Əsas funksiyalar', cls: 'fn', items: ['göstər()', 'daxil_et()', 'gözlə()', 'təmizlə()', 'uzunluq()', 'aralıq()', 'təsadüfi()', 'siyahı()', 'mətn()', 'ədəd()', 'tip()', 'xəta_at()', 'vaxt()'] },
    { ad: 'Riyaziyyat', cls: 'fn', items: ['kök()', 'qüvvət()', 'mütləq()', 'yuvarlaq()', 'aşağı()', 'yuxarı()', 'tam_böl()', 'cəm()', 'ən_böyük()', 'ən_kiçik()', 'məsafə()'] },
    { ad: 'Siyahı metodları', cls: 'fn', items: ['.əlavə_et()', '.əvvələ_əlavə_et()', '.sil()', '.çıxar()', '.indeks()', '.var()', '.son()', '.sırala()', '.tərsinə()', '.kopya()', '.birləşdir()', '.uzunluq'] },
    { ad: 'Mətn metodları', cls: 'fn', items: ['.böyük()', '.kiçik()', '.böl()', '.əvəz_et()', '.təkrar()', '.təmizlə()', '.var()', '.indeks()', '.uzunluq'] },
    { ad: 'Rəsm qələmi', cls: 'fn', items: ['irəli()', 'geri()', 'sağa()', 'sola()', 'dairə()', 'mərkəzə()', 'rəng()', 'qalınlıq()', 'sürət()', 'qələm_qaldır()', 'qələm_endir()', 'arxa_fon()', 'rəsmə_yaz()'] },
    { ad: 'Oyun (lövhə 600×600)', cls: 'fn', items: ['kadr()', 'basılıb()', 'basıldı()', 'lövhəni_təmizlə()', 'düzbucaqlı()', 'dairə_çək()', 'üçbucaq()', 'xətt()', 'mətn_yaz()', 'mərkəzdə_yaz()', 'toqquşur()', 'siçan_x()', 'siçan_y()', 'klikləndi()'] },
    { ad: 'Düymə adları', cls: 'st', items: ['"sol"', '"sağ"', '"yuxarı"', '"aşağı"', '"boşluq"', '"enter"'] },
    { ad: 'Yazı stilləri', cls: 'st', items: ['"qalın"', '"yarıqalın"', '"adi"', '"incə"', '"maili"', '"xətli"', '"üstüxətli"', '"kod"', '"klassik"'] },
    { ad: 'Rənglər', cls: 'st', items: ['"qırmızı"', '"narıncı"', '"sarı"', '"yaşıl"', '"göy"', '"mavi"', '"lacivərt"', '"bənövşəyi"', '"çəhrayı"', '"firuzə"', '"qızılı"', '"qəhvəyi"', '"boz"', '"qara"', '"ağ"'] }
  ];
  function renderAbcPane() {
    var total = ABC.reduce(function (s, g) { return s + g.items.length; }, 0);
    var h = '<div class="sec"><p class="phil"><b style="color:var(--text)">Biz hərfləri qururuq — sözləri və cümlələri siz yazırsınız.</b> Od əlifbasında ' + total + ' hərf var. Hərfə kliklə — redaktora əlavə olunur. ə, ş, ç, ğ, ı, ö, ü olmadan yazmaq da olar.</p></div>';
    ABC.forEach(function (g) {
      h += '<div class="sec"><h4>' + g.ad + ' · ' + g.items.length + '</h4><div class="chips">' +
        g.items.map(function (it) { return '<span class="chip ' + g.cls + '" data-ins="' + esc(it) + '">' + esc(it) + '</span>'; }).join('') + '</div></div>';
    });
    $('pane-elifba').innerHTML = h;
    $('pane-elifba').querySelectorAll('.chip').forEach(function (c) {
      c.onclick = function () {
        if (code.readOnly) return;
        var s = c.getAttribute('data-ins').replace(' … dəfə', ' 3 dəfə:').replace('hər … içində', 'hər x siyahı içində:').replace('"…"', '""');
        if (/^(əgər|yoxsa|nə qədər ki|funksiya|sına|xəta olsa|yoxsa əgər)$/.test(s)) s += s === 'funksiya' ? ' ad():' : (s === 'yoxsa' || s === 'sına' || s === 'xəta olsa' ? ':' : ' ');
        code.focus(); insertText(s); toast('Əlavə olundu: ' + s);
      };
    });
  }

  // ---- Çıxış tabları ----
  function showTab(name) {
    document.querySelectorAll('.otab').forEach(function (t) { t.classList.toggle('on', t.dataset.tab === name); });
    cons.style.display = name === 'console' ? 'block' : 'none';
    $('canvasBox').style.display = name === 'canvas' ? 'grid' : 'none';
    $('jsView').style.display = name === 'js' ? 'block' : 'none';
    fitCanvas();
  }
  document.querySelectorAll('.otab').forEach(function (t) { t.onclick = function () { showTab(t.dataset.tab); }; });

  // ---- Konsol ----
  function line(text, cls) { var d = document.createElement('div'); if (cls) d.className = cls; d.textContent = text; cons.appendChild(d); cons.scrollTop = cons.scrollHeight; return d; }
  var pendingInput = null;
  function askInput(msg) {
    showTab('console');
    return new Promise(function (resolve, reject) {
      var row = document.createElement('div'); row.className = 'inrow';
      var lab = document.createElement('span'); lab.textContent = msg || '›';
      var inp = document.createElement('input'); inp.placeholder = 'Yaz və Enter bas…';
      row.appendChild(lab); row.appendChild(inp); cons.appendChild(row); cons.scrollTop = cons.scrollHeight;
      setTimeout(function () { inp.focus(); }, 0);
      pendingInput = function () { row.remove(); pendingInput = null; reject(new Od.StopSignal()); };
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { var val = inp.value; row.remove(); pendingInput = null; line((msg ? msg + ' ' : '› ') + val, 'echo'); resolve(val); }
      });
    });
  }

  // ---- Lövhə: qələm ----
  var cv = $('cv'), cx = cv.getContext('2d'), W = cv.width, H = cv.height, T, stepBudget = 0;
  function boardBg() { return getComputedStyle(document.documentElement).getPropertyValue('--board').trim() || '#101114'; }
  function resetTurtle() {
    T = { x: W / 2, y: H / 2, a: -90, pen: true, color: '#e8692c', w: 3, speed: 6, used: false };
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = boardBg(); cx.fillRect(0, 0, W, H);
    cx.lineCap = 'round'; cx.lineJoin = 'round';
  }
  function frame() { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); }
  async function maybeWait() { if (T.speed >= 10) { if (++stepBudget % 2000 === 0) await frame(); return; } await frame(); }
  function fitCanvas() {
    var box = $('canvasBox'); if (box.style.display === 'none') return;
    var sz = Math.max(50, Math.min(box.clientWidth, box.clientHeight) - 8);
    cv.style.width = sz + 'px'; cv.style.height = sz + 'px';
  }
  window.addEventListener('resize', fitCanvas);
  function useCanvas() { if (!T.used) { T.used = true; showTab('canvas'); } }
  var turtleAPI = {
    forward: async function (d) {
      useCanvas();
      var rad = T.a * Math.PI / 180, dx = Math.cos(rad), dy = Math.sin(rad);
      var stepLen = T.speed >= 10 ? Math.abs(d) || 1 : Math.max(2, T.speed * 3);
      var steps = Math.max(1, Math.ceil(Math.abs(d) / stepLen)), piece = Math.abs(d) / steps * (d < 0 ? -1 : 1) * 2;
      for (var i = 0; i < steps; i++) {
        var nx = T.x + dx * piece, ny = T.y + dy * piece;
        if (T.pen) { cx.strokeStyle = T.color; cx.lineWidth = T.w * 2; cx.beginPath(); cx.moveTo(T.x, T.y); cx.lineTo(nx, ny); cx.stroke(); }
        T.x = nx; T.y = ny;
        if (T.speed < 10) await maybeWait();
      }
      if (T.speed >= 10) await maybeWait();
    },
    turn: async function (a) { useCanvas(); T.a += a; },
    circle: async function (r) { useCanvas(); var n = 72, side = 2 * Math.PI * r / n; for (var i = 0; i < n; i++) { await turtleAPI.forward(side); T.a += 360 / n; } },
    home: async function () { useCanvas(); T.x = W / 2; T.y = H / 2; T.a = -90; },
    color: function (c) { T.color = c; }, pen: function (p) { T.pen = p; },
    width: function (w) { T.w = Math.max(0.5, w); }, speed: function (s) { T.speed = Math.max(1, Math.min(10, s)); },
    bg: function (c) { useCanvas(); cx.fillStyle = c; cx.fillRect(0, 0, W, H); },
    text: function (s) { useCanvas(); cx.fillStyle = T.color; cx.font = '600 ' + (14 + T.w * 6) + 'px Inter, sans-serif'; cx.fillText(s, T.x, T.y); }
  };

  // ---- Lövhə: oyun (600 × 600) ----
  var S = 2, KEYS = {}, PRESSED = {}, CUR_PRESSED = {}, MOUSE = { x: 0, y: 0, clicked: false }, CLICKQ = false, gameActive = false;
  var KEYMAP = { ArrowLeft: 'sol', ArrowRight: 'sag', ArrowUp: 'yuxari', ArrowDown: 'asagi', ' ': 'bosluq', Enter: 'enter', Escape: 'esc', Shift: 'shift' };
  function keyName(e) { return KEYMAP[e.key] || Od.fold(e.key); }
  window.addEventListener('keydown', function (e) {
    if (!gameActive) return;
    var tg = e.target && e.target.tagName;
    if (tg === 'TEXTAREA' || tg === 'INPUT' || tg === 'SELECT') return;
    var k = keyName(e); if (!KEYS[k]) PRESSED[k] = true; KEYS[k] = true;
    if (KEYMAP[e.key]) e.preventDefault();
  });
  window.addEventListener('keyup', function (e) { KEYS[keyName(e)] = false; });
  window.addEventListener('blur', function () { KEYS = {}; });
  function toBoard(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 600, y: (e.clientY - r.top) / r.height * 600 }; }
  cv.addEventListener('pointermove', function (e) { var p = toBoard(e); MOUSE.x = p.x; MOUSE.y = p.y; });
  cv.addEventListener('pointerdown', function (e) { var p = toBoard(e); MOUSE.x = p.x; MOUSE.y = p.y; CLICKQ = true; $('canvasBox').focus(); });
  document.querySelectorAll('#pad button').forEach(function (b) {
    var k = b.dataset.k;
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); if (!KEYS[k]) PRESSED[k] = true; KEYS[k] = true; });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { KEYS[k] = false; }); });
  });
  function startGame() {
    if (gameActive) return;
    gameActive = true; useCanvas(); showTab('canvas'); code.blur(); $('canvasBox').focus();
    if (window.matchMedia && matchMedia('(pointer: coarse)').matches) $('pad').style.display = 'flex';
    status('Oyun gedir — ox düymələri, boşluq');
  }
  function stopGame() { gameActive = false; KEYS = {}; PRESSED = {}; CUR_PRESSED = {}; $('pad').style.display = 'none'; }
  var gameAPI = {
    frame: function (t) {
      startGame();
      return new Promise(function (res, rej) {
        requestAnimationFrame(function () {
          CUR_PRESSED = PRESSED; PRESSED = {}; MOUSE.clicked = CLICKQ; CLICKQ = false;
          t.stopped ? rej(new Od.StopSignal()) : res();
        });
      });
    },
    down: function (k) { return !!KEYS[k]; }, pressed: function (k) { return !!CUR_PRESSED[k]; }, mouse: function () { return MOUSE; },
    clear: function (c) { useCanvas(); cx.fillStyle = c; cx.fillRect(0, 0, W, H); },
    rect: function (x, y, w, h, c) { useCanvas(); cx.fillStyle = c; cx.fillRect(x * S, y * S, w * S, h * S); },
    circle: function (x, y, r, c) { useCanvas(); cx.fillStyle = c; cx.beginPath(); cx.arc(x * S, y * S, Math.max(0, r) * S, 0, Math.PI * 2); cx.fill(); },
    tri: function (x1, y1, x2, y2, x3, y3, c) { useCanvas(); cx.fillStyle = c; cx.beginPath(); cx.moveTo(x1 * S, y1 * S); cx.lineTo(x2 * S, y2 * S); cx.lineTo(x3 * S, y3 * S); cx.closePath(); cx.fill(); },
    line: function (x1, y1, x2, y2, c, w) { useCanvas(); cx.strokeStyle = c; cx.lineWidth = w * S; cx.beginPath(); cx.moveTo(x1 * S, y1 * S); cx.lineTo(x2 * S, y2 * S); cx.stroke(); },
    text: function (m, x, y, size, c, center, st) {
      useCanvas(); st = st || { weight: 800, family: 'sans' };
      var fam = st.family === 'mono' ? "'JetBrains Mono', monospace" : st.family === 'serif' ? 'Lora, Georgia, serif' : 'Inter, system-ui, sans-serif';
      var px = size * S;
      cx.fillStyle = c; cx.strokeStyle = c;
      cx.font = (st.italic ? 'italic ' : '') + st.weight + ' ' + px + 'px ' + fam;
      cx.textBaseline = 'top'; cx.textAlign = center ? 'center' : 'left';
      cx.fillText(m, x * S, y * S);
      if (st.underline || st.strike) {
        var w = cx.measureText(m).width, x0 = center ? x * S - w / 2 : x * S;
        cx.lineWidth = Math.max(2, px / 14);
        [st.underline ? y * S + px * 1.08 : null, st.strike ? y * S + px * 0.58 : null].forEach(function (ly) {
          if (ly == null) return; cx.beginPath(); cx.moveTo(x0, ly); cx.lineTo(x0 + w, ly); cx.stroke();
        });
      }
      cx.textAlign = 'left';
    }
  };

  // ---- İşə salma ----
  var RUNS = 0;
  function status(t) { $('sbStatus').textContent = t; }
  async function runProgram(srcOverride) {
    var src = typeof srcOverride === 'string' ? srcOverride : code.value;
    if (current) { current.stop(); if (pendingInput) pendingInput(); }
    cons.innerHTML = ''; errLine = null; highlight();
    stopGame(); resetTurtle(); stepBudget = 0; showTab('console');
    $('stopBtn').disabled = false; status('İşləyir…');
    var t0 = performance.now(), myRun = ++RUNS;
    function alive() { if (myRun !== RUNS) throw new Od.StopSignal(); }
    var io = { print: function (s) { alive(); line(s); }, clear: function () { alive(); cons.innerHTML = ''; }, input: function (m) { alive(); return askInput(m); }, turtle: turtleAPI, game: gameAPI };
    var r = Od.run(src, io);
    current = r;
    $('jsView').textContent = r.js ? '// Od kodundan yaradılmış JavaScript\n\n' + r.js : '// Kodda xəta olduğu üçün JavaScript yaradılmadı.';
    var res = await r.promise;
    if (current !== r) return;
    current = null; stopGame(); $('stopBtn').disabled = true;
    var ms = Math.round(performance.now() - t0);
    if (res.ok) {
      status('Hazırdır · ' + ms + ' ms');
      if (!cons.children.length && !T.used) line('(Proqram işlədi, amma heç nə göstərmədi. göstər(...) istifadə et.)', 'sys');
    } else if (res.stopped) { line('Proqram dayandırıldı.', 'sys'); status('Dayandırıldı'); }
    else {
      showTab('console');
      var d = document.createElement('div'); d.className = 'err';
      d.innerHTML = '<b>' + (res.kind === 'syntax' ? 'Yazı xətası' : 'Xəta') + (res.line ? ' — sətir ' + res.line : '') + ':</b> ' + esc(res.error);
      cons.appendChild(d); status('Xəta' + (res.line ? ' · sətir ' + res.line : ''));
      if (res.line && typeof srcOverride !== 'string') { errLine = res.line; highlight(); scrollToLine(res.line); }
    }
  }
  function scrollToLine(n) {
    var lh = parseFloat(getComputedStyle(code).lineHeight) || 23, top = (n - 1) * lh;
    if (top < code.scrollTop || top > code.scrollTop + code.clientHeight - lh * 2) code.scrollTop = Math.max(0, top - code.clientHeight / 3);
    syncScroll();
  }
  $('runBtn').addEventListener('click', function () { runProgram(); });
  $('stopBtn').addEventListener('click', function () { if (current) { current.stop(); if (pendingInput) pendingInput(); } });
  $('copyBtn').addEventListener('click', function () {
    try { navigator.clipboard.writeText(code.value).then(function () { toast('Kod kopyalandı'); }, fallbackCopy); } catch (e) { fallbackCopy(); }
  });
  function fallbackCopy() { code.focus(); code.select(); toast('Kod seçildi — Ctrl+C bas'); }
  var toastT;
  function toast(t) { var el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 1800); }

  // ---- Modal ----
  function openModal(html, wide) {
    var box = $('modalBox'); box.className = 'box' + (wide ? ' wide' : ''); box.innerHTML = html;
    applyIcons(box); $('modal').classList.add('on');
    var f = box.querySelector('input,textarea,select'); if (f) setTimeout(function () { f.focus(); }, 30);
    return box;
  }
  function closeModal() { $('modal').classList.remove('on'); }
  $('modal').addEventListener('mousedown', function (e) { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); $('cert').classList.remove('on'); $('bellPop').classList.remove('on'); } });

  // ---- Od Dərslik ----
  var LKEY = 'od-ders-v1';
  var LS = Object.assign({ passed: {}, code: {}, cur: 0, fails: {} }, fetchStore(LKEY, true) || {});
  function lsave() { store(LKEY, LS); }
  var checking = false;
  function passedCount() { return OD_LESSONS.filter(function (l) { return LS.passed[l.id]; }).length; }
  function enterLessons(i) { openLesson(i == null ? LS.cur : i); }
  function openLesson(i) {
    i = Math.max(0, Math.min(OD_LESSONS.length - 1, i));
    LS.cur = i; lsave();
    var L = OD_LESSONS[i];
    setContext({ type: 'lesson', title: 'Dərs ' + (i + 1) + ' — ' + L.ad, crumb: 'Dərslik › ' + L.ad, mode: 'Dərs ' + (i + 1) + '/' + OD_LESSONS.length, icon: 'book',
      save: function (v) { LS.code[L.id] = v; lsave(); },
      tools: [{ label: 'Yoxla', icon: 'check', cls: 'ok', onClick: checkCurrent }] },
      LS.code[L.id] != null ? LS.code[L.id] : L.başlanğıc);
    renderLesson(null);
    try { history.replaceState(null, '', '#ders-' + (i + 1)); } catch (e) {}
  }
  function renderLesson(result) {
    var L = OD_LESSONS[LS.cur], i = LS.cur, done = !!LS.passed[L.id], pc = passedCount();
    var h = '<div class="lhead"><span class="lnum">Dərs ' + (i + 1) + ' / ' + OD_LESSONS.length + ' · ' + esc(L.mövzu) + '</span><h2>' + esc(L.ad) + (done ? ' <span class="pill ok">' + icon('check') + 'Keçildi</span>' : '') + '</h2></div>';
    h += '<div class="prog"><i style="width:' + Math.round(pc / OD_LESSONS.length * 100) + '%"></i></div><div class="muted" style="font-size:12px">' + pc + ' / ' + OD_LESSONS.length + ' dərs tamamlandı</div>';
    h += '<div class="dots">' + OD_LESSONS.map(function (x, k) { return '<button data-l="' + k + '" class="' + (LS.passed[x.id] ? 'done ' : '') + (k === i ? 'cur' : '') + '" title="' + esc(x.ad) + '">' + (k + 1) + '</button>'; }).join('') + '</div>';
    h += L.izah;
    h += '<div class="lex"><pre>' + highlightCode(L.nümunə) + '</pre><button class="btn sm" id="lexRun">' + icon('play') + 'Sına</button></div>';
    h += '<div class="task"><b class="t">Tapşırıq</b><p>' + L.tapşırıq + '</p></div>';
    h += '<div class="lbtns"><button class="btn ok" id="lCheck">' + icon('check') + 'Yoxla</button><button class="btn" id="lHint">İpucu</button>';
    if ((LS.fails[L.id] || 0) >= 3 && !done) h += '<button class="btn" id="lAns">Cavabı göstər</button>';
    h += '<button class="btn ghost" id="lReset">Sıfırla</button><div class="spacer"></div>';
    if (i < OD_LESSONS.length - 1) h += '<button class="btn primary" id="lNext"' + (done ? '' : ' disabled title="Əvvəlcə tapşırığı həll et"') + '>Növbəti →</button>';
    else if (pc === OD_LESSONS.length) h += '<button class="btn primary" id="lCert">Sertifikat</button>';
    h += '</div><div id="lhintBox"></div><div class="lres" id="lres"></div>';
    $('lbody').innerHTML = h;
    $('lbody').querySelectorAll('.dots button').forEach(function (b) { b.onclick = function () { openLesson(+b.dataset.l); }; });
    $('lexRun').onclick = function () { runProgram(L.nümunə); toast('Nümunə işə salındı — nəticə konsolda'); };
    $('lCheck').onclick = checkCurrent;
    $('lHint').onclick = function () { $('lhintBox').innerHTML = '<div class="hint">' + esc(L.ipucu) + '</div>'; };
    $('lReset').onclick = function () { code.value = L.başlanğıc; code.dispatchEvent(new Event('input')); toast('Başlanğıc koduna qayıtdı'); };
    if ($('lAns')) $('lAns').onclick = function () { code.value = L.cavab; code.dispatchEvent(new Event('input')); toast('Cavab redaktorda — oxu, başa düş, sonra Yoxla'); };
    if ($('lNext')) $('lNext').onclick = function () { openLesson(i + 1); };
    if ($('lCert')) $('lCert').onclick = openCert;
    if (result) showResults($('lres'), result);
  }
  function showResults(el, r) {
    var h = '<div class="big ' + (r.ok ? 'ok' : 'bad') + '">' + (r.ok ? 'Əla! Bütün testlər keçdi.' : 'Hələ düz deyil — yenidən cəhd et.') + '</div>';
    if (r.mesaj) h += '<div class="tr warn">' + esc(r.mesaj) + '</div>';
    r.results.forEach(function (t) {
      h += '<div class="tr ' + (t.ok ? 'ok' : 'bad') + '"><div><b>Test ' + t.nömrə + '</b>' +
        (t.girdi && t.girdi.length ? ' <small>· girdi: ' + esc(t.girdi.join(', ')) + '</small>' : '') +
        (t.xəta ? '<pre>' + esc(t.xəta) + '</pre>' : (t.ok ? ' <small>· keçdi</small>' : '<pre>Gözlənilən: ' + esc(t.gözlənilən) + '\nSənin nəticən: ' + esc(t.alınan || '(heç nə)') + '</pre>')) + '</div></div>';
    });
    el.innerHTML = h;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function checkCurrent() {
    if (checking || !ctx || ctx.type !== 'lesson') return;
    checking = true;
    var L = OD_LESSONS[LS.cur];
    if (curPane !== 'dersler') showPane('dersler');
    $('lres').innerHTML = '<div class="big">Yoxlanılır…</div>';
    odCheckLesson(L, code.value).then(function (r) {
      checking = false;
      if (r.ok) {
        var first = !LS.passed[L.id]; LS.passed[L.id] = true; lsave(); renderLesson(r);
        if (first) toast('Dərs keçildi (' + passedCount() + '/' + OD_LESSONS.length + ')');
        if (first && passedCount() === OD_LESSONS.length) setTimeout(openCert, 700);
      } else {
        LS.fails[L.id] = (LS.fails[L.id] || 0) + 1; lsave(); renderLesson(r);
        var bad = r.results.filter(function (t) { return t.xəta && /Sətir (\d+)/.test(t.xəta); })[0];
        if (bad) { errLine = +/Sətir (\d+)/.exec(bad.xəta)[1]; highlight(); }
      }
    }, function (e) { checking = false; $('lres').innerHTML = '<div class="tr bad">' + esc(String(e)) + '</div>'; });
  }

  // ---- Sertifikat ----
  function drawCert() {
    var c = $('certCv'), g = c.getContext('2d'), W2 = c.width, H2 = c.height;
    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e8692c';
    var name = ($('certName').value || '').trim() || 'Adını yaz';
    g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, W2, H2);
    g.strokeStyle = accent; g.lineWidth = 10; g.strokeRect(50, 50, W2 - 100, H2 - 100);
    g.strokeStyle = '#d9d4c7'; g.lineWidth = 2; g.strokeRect(78, 78, W2 - 156, H2 - 156);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = accent; g.beginPath(); g.roundRect ? g.roundRect(W2 / 2 - 48, 140, 96, 96, 18) : g.rect(W2 / 2 - 48, 140, 96, 96); g.fill();
    g.fillStyle = '#fff'; g.font = '700 44px "JetBrains Mono", monospace'; g.fillText('od', W2 / 2, 190);
    g.fillStyle = '#2b2b2b'; g.font = '700 30px Inter, sans-serif'; g.fillText('S E R T İ F İ K A T', W2 / 2, 300);
    g.fillStyle = '#5c5c5c'; g.font = '500 28px Inter, sans-serif'; g.fillText('Bu sertifikat təsdiq edir ki,', W2 / 2, 400);
    g.fillStyle = '#151515'; g.font = 'italic 700 84px Lora, Georgia, serif'; g.fillText(name, W2 / 2, 515);
    g.fillStyle = accent; g.fillRect(W2 / 2 - 260, 580, 520, 3);
    g.fillStyle = '#3d3d3d'; g.font = '500 28px Inter, sans-serif';
    g.fillText('Od dilində «Proqramlaşdırmanın əsasları» kursunun', W2 / 2, 660);
    g.fillText('bütün 10 dərsini uğurla bitirdi.', W2 / 2, 704);
    var d = new Date(), aylar = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
    g.fillStyle = '#6b6b6b'; g.font = '500 24px Inter, sans-serif';
    g.fillText(d.getDate() + ' ' + aylar[d.getMonth()] + ' ' + d.getFullYear(), W2 / 2 - 380, 900);
    g.fillText('Od — Azərbaycan dilində proqramlaşdırma', W2 / 2 + 250, 900);
    g.fillStyle = '#9a9a9a'; g.font = '500 20px Inter, sans-serif'; g.fillText('sano8063.github.io/od', W2 / 2, 990);
  }
  function openCert() { $('cert').classList.add('on'); drawCert(); setTimeout(function () { $('certName').focus(); }, 50); }
  $('certName').addEventListener('input', drawCert);
  $('certClose').onclick = function () { $('cert').classList.remove('on'); };
  $('certSave').onclick = function () {
    try { var a = document.createElement('a'); a.download = 'od-sertifikat.png'; a.href = $('certCv').toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); toast('Sertifikat yükləndi'); }
    catch (e) { toast('Yükləmə alınmadı — şəklin üzərində sağ klik → "Şəkli yadda saxla"'); }
  };

  // ---- Mərkəz: müəllim paneli görünüşü ----
  function showDash(html) { $('center').classList.add('dash'); var d = $('dashv'); d.innerHTML = html; applyIcons(d); d.scrollTop = 0; return d; }
  function hideDash() { $('center').classList.remove('dash'); }

  // ---- Marşrut ----
  function routeHash() {
    var h = location.hash.replace('#', ''), m = /^ders-(\d+)$/.exec(h);
    if (m) { showPane('dersler'); openLesson(+m[1] - 1); }
    else if (h === 'dersler') showPane('dersler');
    else if (h === 'sinif') showPane('sinif');
  }
  window.addEventListener('hashchange', routeHash);

  // ---- Başlanğıc ----
  applySettings();
  renderKodPane(); renderAbcPane();
  resetTurtle();
  freeContext();
  line('Od-a xoş gəldin. Kodu yaz və "İşə sal" düyməsini bas (Ctrl+Enter).', 'sys');
  line('Soldakı bölmələr: Kod · Dərslər · Sinif · Əlifba · Ayarlar.', 'sys');
  if (matchMedia('(max-width:760px)').matches) { $('side').classList.add('closed'); markActs(null); }
  if (location.hash) routeHash();

  // Sinif modulu üçün açıq API
  window.OdApp = {
    $: $, esc: esc, icon: icon, applyIcons: applyIcons, toast: toast, store: store, fetchStore: fetchStore,
    code: code, setContext: setContext, freeContext: freeContext, getContext: function () { return ctx; },
    runProgram: runProgram, showPane: showPane, showDash: showDash, hideDash: hideDash,
    openModal: openModal, closeModal: closeModal, highlightCode: highlightCode, showResults: showResults,
    status: status, curPane: function () { return curPane; }
  };
})();

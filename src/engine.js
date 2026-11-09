// ===== OD — Azərbaycan dilində proqramlaşdırma dili: mühərrik =====
// Mənbə kodu JavaScript-ə çevirir (transpile) və işə salır.
(function (root) {
  'use strict';

  // Hərfləri sadələşdir: ə→e, ı→i, ö→o, ü→u, ş→s, ç→c, ğ→g (böyük/kiçik fərqi yoxdur)
  function fold(s) {
    return s
      .replace(/İ/g, 'i').replace(/I/g, 'i')
      .toLowerCase()
      .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
      .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/i̇/g, 'i');
  }

  // Alternativ yazılışlar → əsas Od forması
  var ALIAS = { yaz: 'goster' };
  function canon(w) { var f = fold(w); return ALIAS[f] || f; }

  // Açar sözlər (sadələşdirilmiş forma → rol)
  var KW = {
    eger: 'if', yoxsa: 'else', ne: 'ne', qeder: 'qeder', ki: 'ki',
    tekrarla: 'repeat', defe: 'times', her: 'each', icinde: 'in', ucun: 'for',
    funksiya: 'func', qaytar: 'return', dayan: 'break', davam: 'continue',
    dogru: 'true', yalan: 'false', hec: 'null', ve: 'and', ya: 'ya', deyil: 'not', sina: 'try'
  };

  // JS-də ayrıca adla işləyən daxili funksiyalar (asinxron olanlar await ilə çağırılır)
  var ASYNC_BUILTINS = ['kadr', 'daxil_et', 'gozle', 'ireli', 'geri', 'saga', 'sola', 'daire', 'merkeze'];

  function OdError(msg, line) {
    this.name = 'OdError'; this.message = msg; this.line = line;
  }
  OdError.prototype = Object.create(Error.prototype);

  // ---------- Tokenlər ----------
  var ID_START = /[A-Za-z_À-ɏəƏЀ-ӿ]/;
  var ID_PART = /[A-Za-z0-9_À-ɏəƏЀ-ӿ̇]/;

  function tokenize(src, line) {
    var t = [], i = 0, n = src.length;
    while (i < n) {
      var c = src[i];
      if (c === ' ' || c === '\t') { i++; continue; }
      if (c === '"' || c === "'") {
        var j = i + 1, s = '';
        while (j < n && src[j] !== c) {
          if (src[j] === '\\' && j + 1 < n) { s += src[j] + src[j + 1]; j += 2; continue; }
          s += src[j]; j++;
        }
        if (j >= n) throw new OdError('Dırnaq bağlanmayıb. Mətni ' + c + ' işarəsi ilə bitir.', line);
        t.push({ k: 'str', v: c + s + c }); i = j + 1; continue;
      }
      if (/[0-9]/.test(c)) {
        var m = /^[0-9]+(\.[0-9]+)?/.exec(src.slice(i));
        t.push({ k: 'num', v: m[0] }); i += m[0].length; continue;
      }
      if (ID_START.test(c)) {
        var j2 = i;
        while (j2 < n && ID_PART.test(src[j2])) j2++;
        var w = src.slice(i, j2);
        t.push({ k: 'id', v: w, f: canon(w) }); i = j2; continue;
      }
      var three = src.substr(i, 3), two = src.substr(i, 2);
      if (two === '//') throw new OdError('"//" işarəsi yoxdur. Tam bölmə üçün tam_böl(a, b) yaz.', line);
      if (['**=', '...'].indexOf(three) >= 0) { t.push({ k: 'op', v: three }); i += 3; continue; }
      if (['==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '**'].indexOf(two) >= 0) {
        t.push({ k: 'op', v: two }); i += 2; continue;
      }
      if ('+-*/%<>=()[]{},.:!'.indexOf(c) >= 0) { t.push({ k: 'op', v: c }); i++; continue; }
      throw new OdError('Tanınmayan işarə: "' + c + '"', line);
    }
    return t;
  }

  // Açıq qalan mötərizələrin sayı (dırnaq içindəkilər nəzərə alınmır)
  function bracketDepth(s) {
    var d = 0, q = null;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; }
      else if (c === '"' || c === "'") q = c;
      else if ('([{'.indexOf(c) >= 0) d++;
      else if (')]}'.indexOf(c) >= 0) d--;
    }
    return q ? 0 : d;
  }

  // Şərhi (#) sil, amma dırnaq içindəkinə toxunma
  function stripComment(s) {
    var q = null;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; }
      else if (c === '"' || c === "'") q = c;
      else if (c === '#') return s.slice(0, i);
    }
    return s;
  }

  // ---------- Çevirici ----------
  function compile(source) {
    var rawLines = source.replace(/\r\n?/g, '\n').split('\n');
    var lines = [];
    var cur = null;
    rawLines.forEach(function (raw, idx) {
      var noC = stripComment(raw);
      if (cur) {
        cur.text += ' ' + noC.trim();
        if (bracketDepth(cur.text) <= 0) { lines.push(cur); cur = null; }
        return;
      }
      if (!noC.trim()) return;
      var expanded = noC.replace(/\t/g, '    ');
      var indent = expanded.length - expanded.replace(/^ +/, '').length;
      var L = { n: idx + 1, indent: indent, text: expanded.trim() };
      if (bracketDepth(L.text) > 0) cur = L; else lines.push(L);
    });
    if (cur) lines.push(cur);

    var names = {};        // sadə ad → ilk yazılış (xəta mesajları üçün)
    var userFuncs = {};    // istifadəçi funksiyaları
    var topVars = {};      // qlobal dəyişənlər

    function remember(tok) { if (!names[tok.f]) names[tok.f] = tok.v; }

    // 1-ci keçid: tokenləşdir, funksiyaları və qlobal dəyişənləri topla
    var funcIndentStack = [];
    lines.forEach(function (L) {
      L.toks = tokenize(L.text, L.n);
      while (funcIndentStack.length && L.indent <= funcIndentStack[funcIndentStack.length - 1]) funcIndentStack.pop();
      var t = L.toks;
      if (t[0] && t[0].k === 'id' && KW[t[0].f] === 'func') {
        if (!t[1] || t[1].k !== 'id') throw new OdError('Funksiyanın adı yazılmayıb. Məsələn: funksiya topla(a, b):', L.n);
        userFuncs[t[1].f] = true; remember(t[1]);
        funcIndentStack.push(L.indent);
      } else if (!funcIndentStack.length && t.length >= 2 && t[0].k === 'id' && !KW[t[0].f] &&
                 t[1].k === 'op' && /^(=|\+=|-=|\*=|\/=|%=|\*\*=)$/.test(t[1].v)) {
        topVars[t[0].f] = true;
      } else if (!funcIndentStack.length && t[0] && t[0].f === 'xeta' && t[1] && t[1].f === 'olsa' && t[2] && t[2].k === 'id') {
        topVars[t[2].f] = true;
      } else if (!funcIndentStack.length && t[0] && t[0].k === 'id' && KW[t[0].f] === 'each' && t[1] && t[1].k === 'id') {
        topVars[t[1].f] = true;
      }
    });

    var asyncSet = {};
    ASYNC_BUILTINS.forEach(function (b) { asyncSet[b] = true; });
    Object.keys(userFuncs).forEach(function (f) { asyncSet[f] = true; });

    function jsName(f) { return '$' + f; }

    // closeAwait-i düzgün işləmək üçün expr-i yenidən yazırıq (token sırası ilə)
    function exprFull(toks, line) {
      toks = toks.map(function (x) { return Object.assign({}, x); });
      var base = [];
      // əvvəlcə await çağırışlarının bağlanan mötərizələrini işarələ
      for (var i = 0; i < toks.length; i++) {
        var tk = toks[i], next = toks[i + 1], prev = toks[i - 1];
        if (tk.k === 'id' && !(prev && prev.k === 'op' && prev.v === '.') && !KW[tk.f] &&
            next && next.k === 'op' && next.v === '(' && asyncSet[tk.f]) {
          tk.awaitCall = true;
          var d = 0, j = i + 1;
          for (; j < toks.length; j++) {
            if (toks[j].k === 'op' && '([{'.indexOf(toks[j].v) >= 0) d++;
            if (toks[j].k === 'op' && ')]}'.indexOf(toks[j].v) >= 0) { d--; if (d === 0) break; }
          }
          if (j >= toks.length) throw new OdError('Mötərizə bağlanmayıb: "' + tk.v + '(" ...', line);
          toks[j].closeAwait = (toks[j].closeAwait || 0) + 1;
        }
      }
      var out = [], depth = [];
      if (!toks.length) throw new OdError('Burada ifadə (dəyər) gözlənilirdi.', line);
      for (var i2 = 0; i2 < toks.length; i2++) {
        var t = toks[i2], pv = toks[i2 - 1], nx = toks[i2 + 1];
        if (t.k === 'str' || t.k === 'num') { out.push(t.v); continue; }
        if (t.k === 'op') {
          var v = t.v;
          if ('([{'.indexOf(v) >= 0) depth.push(v);
          if (')]}'.indexOf(v) >= 0) {
            var open = depth.pop();
            if (!open || '([{'.indexOf(open) !== ')]}'.indexOf(v)) throw new OdError('Mötərizələr uyğun gəlmir: "' + v + '"', line);
          }
          if (v === '=') throw new OdError('Müqayisə üçün "==" yaz (tək "=" dəyər vermək üçündür).', line);
          if (/^(\+=|-=|\*=|\/=|%=|\*\*=)$/.test(v)) throw new OdError('"' + v + '" yalnız sətrin əvvəlində, dəyişənə dəyər verəndə olur.', line);
          if (v === ':' && depth[depth.length - 1] !== '{') throw new OdError('Artıq ":" işarəsi. ":" yalnız əgər, təkrarla, funksiya kimi sətirlərin sonunda olur.', line);
          if (v === '{') out.push('__obj(');
          out.push(v);
          if (v === '}') out.push(')');
          if (t.closeAwait) for (var c = 0; c < t.closeAwait; c++) out.push(')');
          continue;
        }
        if (depth[depth.length - 1] === '{' && nx && nx.k === 'op' && nx.v === ':' && pv && pv.k === 'op' && (pv.v === '{' || pv.v === ',')) {
          remember(t); out.push(JSON.stringify(t.f)); continue;
        }
        if (pv && pv.k === 'op' && pv.v === '.') { remember(t); out.push(t.f); continue; }
        var kw = KW[t.f];
        if (kw === 'and') {
          if (nx && nx.k === 'id' && KW[nx.f] === 'ya') { out.push('||'); i2++; } else out.push('&&');
          continue;
        }
        if (kw === 'not') { out.push('!'); continue; }
        if (kw === 'true' || kw === 'false' || kw === 'null') { out.push(kw); continue; }
        if (kw && ['ne', 'qeder', 'ki', 'times', 'ya'].indexOf(kw) < 0) {
          throw new OdError('"' + t.v + '" açar sözdür, burada istifadə oluna bilməz.', line);
        }
        remember(t);
        out.push(t.awaitCall ? '(await ' + jsName(t.f) : jsName(t.f));
      }
      if (depth.length) throw new OdError('Mötərizə bağlanmayıb: "' + depth[depth.length - 1] + '"', line);
      var res = '';
      for (var o = 0; o < out.length; o++) {
        var piece = out[o], pr = out[o - 1];
        var noSpace = o === 0 || piece === '.' || piece === ')' || piece === ']' || piece === ',' ||
          pr === '.' || pr === '(' || pr === '[' || pr === '!' ||
          (piece === '(' && pr && /[\w$)\]]$/.test(pr)) || (piece === '[' && pr && /[\w$)\]"']$/.test(pr));
        res += (noSpace ? '' : ' ') + piece;
      }
      return res;
    }

    // 2-ci keçid: blok strukturu və kod
    var js = [];
    var stack = [{ indent: 0, type: 'root', fn: null }];
    var loopId = 0;
    var prevOpened = null; // əvvəlki sətir blok açdısa, onun məlumatı
    var lastClosed = {};   // indent → son bağlanan blokun növü

    function curFn() {
      for (var i = stack.length - 1; i >= 0; i--) if (stack[i].fn) return stack[i].fn;
      return null;
    }
    function inLoop() {
      for (var i = stack.length - 1; i >= 0; i--) {
        if (stack[i].type === 'loop') return true;
        if (stack[i].type === 'func') return false;
      }
      return false;
    }

    function endsWithColon(t) { var l = t[t.length - 1]; return l && l.k === 'op' && l.v === ':'; }
    function needColon(L, what) {
      if (!endsWithColon(L.toks)) throw new OdError('"' + what + '" sətrinin sonunda ":" unudulub.', L.n);
      return L.toks.slice(0, -1);
    }

    lines.forEach(function (L, li) {
      var top = stack[stack.length - 1];
      if (prevOpened) {
        if (L.indent <= top.indent) throw new OdError('":" ilə bitən sətirdən sonra içəridəki kod boşluqla (4 boşluq) sağa çəkilməlidir.', L.n);
        top.childIndent = L.indent;
        prevOpened = null;
      } else if (L.indent > (top.childIndent != null ? top.childIndent : top.indent)) {
        throw new OdError('Gözlənilməz boşluq (girinti). Bu sətri sola çək.', L.n);
      }
      // bloklardan çıx
      while (stack.length > 1 && L.indent < stack[stack.length - 1].childIndent) {
        var closed = stack.pop();
        js.push('}');
        lastClosed[closed.indent] = closed.type === 'loop' ? 'loop' : closed.kind;
        if (closed.kind === 'try' && stack.length > 1 && L.indent < stack[stack.length - 1].childIndent)
          throw new OdError('"sına:" blokundan sonra "xəta olsa:" bloku yazılmalıdır.', L.n);
      }
      top = stack[stack.length - 1];
      var expectedIndent = top.childIndent != null ? top.childIndent : 0;
      if (L.indent !== expectedIndent) throw new OdError('Girinti (boşluqlar) uyğun gəlmir. Yuxarıdakı sətirlərlə eyni səviyyədə yaz.', L.n);

      var t = L.toks, first = t[0], kw = first.k === 'id' ? KW[first.f] : null;
      var line = L.n;
      var lineMark = '__t.l=' + line + ';';
      var prevClosedHere = lastClosed[L.indent];
      var isCatch = first.k === 'id' && first.f === 'xeta' && t[1] && t[1].k === 'id' && t[1].f === 'olsa';
      if (prevClosedHere === 'try' && !isCatch) throw new OdError('"sına:" blokundan sonra "xəta olsa:" bloku yazılmalıdır.', L.n);
      // bu sətir "yoxsa" deyilsə, əvvəlki if zəncirini sıfırla
      if (kw !== 'else') lastClosed[L.indent] = null;

      if (kw === 'try') {
        var bt = needColon(L, first.v);
        if (bt.length > 1) throw new OdError('"sına" sözündən sonra yalnız ":" yazılır.', line);
        js.push(lineMark + 'try {');
        stack.push({ indent: L.indent, type: 'block', kind: 'try' }); prevOpened = true; return;
      }
      if (isCatch) {
        if (prevClosedHere !== 'try') throw new OdError('"xəta olsa" yalnız "sına:" blokundan dərhal sonra gələ bilər.', line);
        var bc = needColon(L, 'xəta olsa');
        var cv = bc[2];
        if (bc.length > 3 || (cv && (cv.k !== 'id' || KW[cv.f]))) throw new OdError('Belə yaz: xəta olsa:  və ya  xəta olsa səbəb:', line);
        var setv = '';
        if (cv) {
          remember(cv);
          var fnc = curFn();
          setv = (fnc && !topVars[cv.f] ? 'var ' : '') + jsName(cv.f) + '=__msg(__e);';
        }
        js.push('catch (__e) {');
        js.push('if(__e instanceof __Stop)throw __e;' + setv);
        stack.push({ indent: L.indent, type: 'block', kind: 'catch' }); prevOpened = true; return;
      }
      if (kw === 'if') {
        var body = needColon(L, first.v);
        js.push(lineMark + 'if (' + exprFull(body.slice(1), line) + ') {');
        stack.push({ indent: L.indent, type: 'block', kind: 'if' }); prevOpened = true; return;
      }
      if (kw === 'else') {
        if (prevClosedHere !== 'if' && prevClosedHere !== 'elif') throw new OdError('"' + first.v + '" yalnız "əgər" blokundan dərhal sonra gələ bilər.', line);
        var b2 = needColon(L, 'yoxsa');
        if (b2[1] && b2[1].k === 'id' && KW[b2[1].f] === 'if') {
          js.push('else if (' + exprFull(b2.slice(2), line) + ') {');
          stack.push({ indent: L.indent, type: 'block', kind: 'elif' });
        } else {
          if (b2.length > 1) throw new OdError('"yoxsa" sözündən sonra yalnız ":" yazılır. Şərt lazımdırsa "yoxsa əgər ...:" yaz.', line);
          js.push('else {');
          stack.push({ indent: L.indent, type: 'block', kind: 'else' });
        }
        lastClosed[L.indent] = null;
        prevOpened = true; return;
      }
      // nə qədər ki ...:
      if (kw === 'ne' && t[1] && KW[t[1].f] === 'qeder' && t[2] && KW[t[2].f] === 'ki') {
        var b3 = needColon(L, 'nə qədər ki');
        js.push(lineMark + 'while (' + exprFull(b3.slice(3), line) + ') {' + guard());
        stack.push({ indent: L.indent, type: 'loop' }); prevOpened = true; return;
      }
      if (kw === 'repeat') {
        var b4 = needColon(L, 'təkrarla');
        var last = b4[b4.length - 1];
        if (!last || KW[last.f] !== 'times') throw new OdError('Belə yaz: təkrarla 5 dəfə:', line);
        var id = '__i' + (++loopId);
        js.push(lineMark + 'for (let ' + id + '=0, ' + id + 'n=__num(' + exprFull(b4.slice(1, -1), line) + '); ' + id + '<' + id + 'n; ' + id + '++) {' + guard());
        stack.push({ indent: L.indent, type: 'loop' }); prevOpened = true; return;
      }
      if (kw === 'each') {
        var b5 = needColon(L, 'hər');
        var v = b5[1];
        if (!v || v.k !== 'id' || KW[v.f]) throw new OdError('Belə yaz: hər x siyahı içində:', line);
        remember(v);
        var iterToks;
        if (b5[2] && KW[b5[2].f] === 'for') iterToks = b5.slice(3);
        else {
          var lt = b5[b5.length - 1];
          if (!lt || KW[lt.f] !== 'in') throw new OdError('Belə yaz: hər x siyahı içində:', line);
          iterToks = b5.slice(2, -1);
        }
        var fn = curFn();
        if (fn && !topVars[v.f]) fn.locals[v.f] = true;
        js.push(lineMark + 'for (' + jsName(v.f) + ' of __iter(' + exprFull(iterToks, line) + ')) {' + guard());
        stack.push({ indent: L.indent, type: 'loop' }); prevOpened = true; return;
      }
      if (kw === 'func') {
        if (curFn()) throw new OdError('Funksiya başqa funksiyanın içində yaradıla bilməz (hələlik).', line);
        if (stack.length > 1) throw new OdError('Funksiyanı sətrin əvvəlində (girintisiz) yarat.', line);
        var b6 = needColon(L, 'funksiya');
        var nm = b6[1];
        if (!b6[2] || b6[2].v !== '(' || b6[b6.length - 1].v !== ')') throw new OdError('Belə yaz: funksiya ad(a, b):', line);
        var params = [];
        b6.slice(3, -1).forEach(function (p, pi) {
          if (pi % 2 === 0) { if (p.k !== 'id' || KW[p.f]) throw new OdError('Parametr adı səhvdir.', line); remember(p); params.push(p.f); }
          else if (p.v !== ',') throw new OdError('Parametrləri vergüllə ayır.', line);
        });
        var fnInfo = { name: nm.f, params: params, locals: {} };
        js.push(lineMark + 'async function ' + jsName(nm.f) + '(' + params.map(jsName).join(', ') + ') {' + 'var __pl=__t.l;if(++__t.depth>3000){throw new RangeError("dərinlik");}try{');
        stack.push({ indent: L.indent, type: 'func', fn: fnInfo, kind: 'func' });
        prevOpened = true; return;
      }
      if (kw === 'return') {
        if (!curFn()) throw new OdError('"qaytar" yalnız funksiyanın içində işlənir.', line);
        js.push(lineMark + 'return ' + (t.length > 1 ? exprFull(t.slice(1), line) : 'null') + ';');
        return;
      }
      if (kw === 'break' || kw === 'continue') {
        if (t.length > 1) throw new OdError('"' + first.v + '" sözündən sonra heç nə yazılmır.', line);
        if (!inLoop()) throw new OdError('"' + first.v + '" yalnız dövrün (təkrarla, hər, nə qədər ki) içində işlənir.', line);
        js.push(lineMark + (kw === 'break' ? 'break;' : 'continue;'));
        return;
      }
      if (endsWithColon(t)) throw new OdError('Bu sətir ":" ilə bitməməlidir. Əmr tanınmadı: "' + first.v + '"', line);
      if (kw && ['true', 'false', 'null', 'not'].indexOf(kw) < 0) throw new OdError('"' + first.v + '" burada işlənə bilməz.', line);

      // dəyər vermə
      if (t.length >= 2 && first.k === 'id' && t[1].k === 'op' && /^(=|\+=|-=|\*=|\/=|%=|\*\*=)$/.test(t[1].v)) {
        remember(first);
        var fn2 = curFn(), decl = '';
        if (fn2 && !topVars[first.f] && fn2.params.indexOf(first.f) < 0) decl = 'var ';
        if (t[1].v !== '=' && decl) decl = '';
        js.push(lineMark + decl + jsName(first.f) + ' ' + t[1].v + ' ' + exprFull(t.slice(2), line) + ';');
        return;
      }
      // indeks/xassə ilə dəyər vermə: a[0] = 5
      var eqPos = -1, dd = 0;
      for (var q = 0; q < t.length; q++) {
        if (t[q].k === 'op' && '([{'.indexOf(t[q].v) >= 0) dd++;
        if (t[q].k === 'op' && ')]}'.indexOf(t[q].v) >= 0) dd--;
        if (dd === 0 && t[q].k === 'op' && /^(=|\+=|-=|\*=|\/=|%=)$/.test(t[q].v)) { eqPos = q; break; }
      }
      if (eqPos > 0) {
        js.push(lineMark + exprFull(t.slice(0, eqPos), line) + ' ' + t[eqPos].v + ' ' + exprFull(t.slice(eqPos + 1), line) + ';');
        return;
      }
      // "göstər 5" — mötərizəsiz yazılış
      if (first.k === 'id' && first.f === 'goster' && !(t[1] && t[1].v === '(' && closesAtEnd(t, 1))) {
        js.push(lineMark + '$goster(' + (t.length > 1 ? exprFull(t.slice(1), line) : '') + ');');
        return;
      }
      js.push(lineMark + exprFull(t, line) + ';');
    });
    if (prevOpened) throw new OdError('Proqram ":" ilə bitir, amma içində kod yoxdur.', lines[lines.length - 1].n);
    while (stack.length > 1) {
      var cl = stack.pop();
      if (cl.kind === 'try') throw new OdError('"sına:" blokundan sonra "xəta olsa:" bloku yazılmalıdır.', lines[lines.length - 1].n);
      js.push('}');
    }
    for (var lk in lastClosed) if (lastClosed[lk] === 'try') throw new OdError('"sına:" blokundan sonra "xəta olsa:" bloku yazılmalıdır.', lines[lines.length - 1].n);

    function guard() { return 'if(++__t.n%400===0){await __t.tick();}'; }
    function closesAtEnd(t, from) {
      var d = 0;
      for (var i = from; i < t.length; i++) {
        if (t[i].k === 'op' && '([{'.indexOf(t[i].v) >= 0) d++;
        if (t[i].k === 'op' && ')]}'.indexOf(t[i].v) >= 0) { d--; if (d === 0) return i === t.length - 1; }
      }
      return false;
    }

    // funksiyaların "try" bloklarını bağla — funksiya başlığında "try{" açdıq
    var finalJs = fixFunctionTry(js);
    var header = Object.keys(topVars).length ? 'var ' + Object.keys(topVars).map(jsName).join(', ') + ';\n' : '';
    return { js: header + finalJs.join('\n'), names: names };
  }

  // Funksiya başlığındakı try{ ... }finally{__t.depth--} üçün bağlanış əlavə et
  function fixFunctionTry(js) {
    var out = [], st = [];
    js.forEach(function (l) {
      var opens = 0;
      if (/async function \$[^(]*\([^)]*\) \{/.test(l)) { out.push(l); st.push('fn'); return; }
      if (l === '}') {
        var k = st.pop();
        out.push(k === 'fn' ? '}catch(__e){if(__e&&typeof __e==="object"&&__e.__odLine==null){try{__e.__odLine=__t.l;}catch(_){}}throw __e;}finally{__t.depth--;__t.l=__pl;}}' : '}');
        return;
      }
      if (/\{(if\(\+\+__t\.n%400===0\)\{await __t\.tick\(\);\})?$/.test(l)) st.push('b');
      out.push(l);
    });
    return out;
  }

  // ---------- İcra mühiti ----------
  function fmt(v, inner) {
    if (v === true) return 'doğru';
    if (v === false) return 'yalan';
    if (v === null || v === undefined) return 'heç';
    if (typeof v === 'number') {
      if (!isFinite(v)) return isNaN(v) ? 'rəqəm deyil' : (v > 0 ? 'sonsuz' : '-sonsuz');
      return String(Math.round(v * 1e10) / 1e10);
    }
    if (Array.isArray(v)) return '[' + v.map(function (x) { return fmt(x, true); }).join(', ') + ']';
    if (typeof v === 'string') return inner ? '"' + v + '"' : v;
    if (typeof v === 'function') return '<funksiya>';
    if (typeof v === 'object') return '{' + Object.keys(v).map(function (k) { return dispName(v, k) + ': ' + fmt(v[k], true); }).join(', ') + '}';
    return String(v);
  }

  var COLORS = {
    qirmizi: '#e53935', yasil: '#43a047', mavi: '#1e88e5', sari: '#fdd835', qara: '#111111',
    ag: '#ffffff', narinci: '#fb8c00', benovseyi: '#8e24aa', cehrayi: '#ec407a', boz: '#9e9e9e',
    goy: '#29b6f6', qehveyi: '#6d4c41', firuze: '#26a69a', qizili: '#ffb300', lacivert: '#283593'
  };

  // Siyahı və mətn metodları (Azərbaycanca, hərfsiz yazılışla)
  function installProto() {
    if (installProto.done) return; installProto.done = true;
    function def(obj, name, fn) { try { Object.defineProperty(obj, name, { value: fn, configurable: true, writable: true }); } catch (e) {} }
    function getter(obj, name, fn) { try { Object.defineProperty(obj, name, { get: fn, configurable: true }); } catch (e) {} }
    def(Array.prototype, 'elave_et', function (x) { this.push(x); return this; });
    def(Array.prototype, 'sil', function (i) { i = Number(i); if (!(i >= 0 && i < this.length)) return null; return this.splice(i, 1)[0]; });
    def(Array.prototype, 'cixar', function (x) { var i = this.indexOf(x); if (i >= 0) this.splice(i, 1); return i >= 0; });
    def(Array.prototype, 'evvele_elave_et', function (x) { this.unshift(x); return this; });
    def(Array.prototype, 'indeks', function (x) { return this.indexOf(x); });
    def(Array.prototype, 'kopya', function () { return this.slice(); });
    def(Array.prototype, 'son', function () { return this.length ? this[this.length - 1] : null; });
    def(Array.prototype, 'sirala', function () { return this.sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; }); });
    def(Array.prototype, 'tersine', function () { return this.reverse(); });
    def(Array.prototype, 'var', function (x) { return this.indexOf(x) >= 0; });
    def(Array.prototype, 'birlesdir', function (s) { return this.map(function (x) { return fmt(x); }).join(s == null ? ', ' : s); });
    getter(Array.prototype, 'uzunluq', function () { return this.length; });
    getter(String.prototype, 'uzunluq', function () { return this.length; });
    def(String.prototype, 'boyuk', function () { return this.toLocaleUpperCase('az'); });
    def(String.prototype, 'kicik', function () { return this.toLocaleLowerCase('az'); });
    def(String.prototype, 'bol', function (s) { return this.split(s == null ? ' ' : s); });
    def(String.prototype, 'evez_et', function (a, b) { return this.split(a).join(b); });
    def(String.prototype, 'var', function (x) { return this.indexOf(x) >= 0; });
    def(String.prototype, 'tekrar', function (n) { return this.repeat(Math.max(0, Math.floor(Number(n) || 0))); });
    def(String.prototype, 'indeks', function (x) { return this.indexOf(x); });
    def(String.prototype, 'temizle', function () { return this.trim(); });
  }

  function makeRuntime(io) {
    var t = { l: 0, n: 0, depth: 0, stopped: false };
    t.tick = function () {
      return new Promise(function (res, rej) {
        setTimeout(function () { t.stopped ? rej(new StopSignal()) : res(); }, 0);
      });
    };
    var turtle = io.turtle, game = io.game || {};
    function col(c) { if (c == null) return '#ffffff'; var k = fold(String(c)); return COLORS[k] || String(c); }
    var B = {
      goster: function () {
        var a = Array.prototype.slice.call(arguments).map(function (x) { return fmt(x); });
        io.print(a.join(' '));
      },
      daxil_et: function (msg) {
        return io.input(msg == null ? '' : fmt(msg)).then(function (s) {
          var tr = String(s).trim().replace(',', '.');
          return tr !== '' && !isNaN(Number(tr)) ? Number(tr) : s;
        });
      },
      gozle: function (sec) { return new Promise(function (r, j) { setTimeout(function () { t.stopped ? j(new StopSignal()) : r(); }, __num(sec) * 1000); }); },
      uzunluq: function (x) { return x == null ? 0 : x.length; },
      tesadufi: function (a, b) {
        if (Array.isArray(a)) return a[Math.floor(Math.random() * a.length)];
        if (b === undefined) { b = a; a = 1; }
        a = Math.ceil(__num(a)); b = Math.floor(__num(b));
        return a + Math.floor(Math.random() * (b - a + 1));
      },
      araliq: function (a, b, step) {
        if (b === undefined) { b = a; a = 1; }
        a = __num(a); b = __num(b); step = step === undefined ? (a <= b ? 1 : -1) : __num(step);
        if (step === 0) throw new Error('aralıq: addım 0 ola bilməz');
        var r = [];
        if (step > 0) for (var i = a; i <= b; i += step) r.push(i);
        else for (var j = a; j >= b; j += step) r.push(j);
        if (r.length > 1e6) throw new Error('aralıq çox böyükdür');
        return r;
      },
      yuvarlaq: function (x, n) { var p = Math.pow(10, n || 0); return Math.round(__num(x) * p) / p; },
      asagi: function (x) { return Math.floor(__num(x)); },
      yuxari: function (x) { return Math.ceil(__num(x)); },
      tam_bol: function (a, b) { return Math.floor(__num(a) / __num(b)); },
      kok: function (x) { return Math.sqrt(__num(x)); },
      mutleq: function (x) { return Math.abs(__num(x)); },
      quvvet: function (a, b) { return Math.pow(__num(a), __num(b)); },
      en_boyuk: function () { var a = flat(arguments); return Math.max.apply(null, a); },
      en_kicik: function () { var a = flat(arguments); return Math.min.apply(null, a); },
      cem: function (arr) { return flat([arr]).reduce(function (s, x) { return s + __num(x); }, 0); },
      metn: function (x) { return fmt(x); },
      eded: function (x) { var n = Number(String(x).replace(',', '.')); if (isNaN(n)) throw new Error('"' + fmt(x) + '" ədədə çevrilə bilmir'); return n; },
      siyahi: function () { return Array.prototype.slice.call(arguments); },
      tip: function (x) {
        if (x === null || x === undefined) return 'heç';
        if (Array.isArray(x)) return 'siyahı';
        return { number: 'ədəd', string: 'mətn', boolean: 'məntiq', function: 'funksiya' }[typeof x] || 'obyekt';
      },
      temizle: function () { io.clear(); },
      // Rəsm (tısbağa qrafikası)
      ireli: function (d) { return turtle.forward(__num(d)); },
      geri: function (d) { return turtle.forward(-__num(d)); },
      saga: function (a) { return turtle.turn(__num(a)); },
      sola: function (a) { return turtle.turn(-__num(a)); },
      daire: function (r) { return turtle.circle(__num(r)); },
      merkeze: function () { return turtle.home(); },
      reng: function (c) { turtle.color(COLORS[fold(String(c))] || String(c)); },
      qelem_qaldir: function () { turtle.pen(false); },
      qelem_endir: function () { turtle.pen(true); },
      qalinliq: function (w) { turtle.width(__num(w)); },
      suret: function (s) { turtle.speed(__num(s)); },
      arxa_fon: function (c) { turtle.bg(COLORS[fold(String(c))] || String(c)); },
      resme_yaz: function (s) { turtle.text(fmt(s)); },
      xeta_at: function (m) { var e = new Error(fmt(m)); e.odUser = true; throw e; },
      // Oyun funksiyaları (lövhə 600 × 600)
      kadr: function () { return game.frame(t); },
      basilib: function (k) { return game.down(fold(String(k))); },
      basildi: function (k) { return game.pressed(fold(String(k))); },
      lovheni_temizle: function (c) { game.clear(col(c || 'qara')); },
      duzbucaqli: function (x, y, w, h, c) { game.rect(__num(x), __num(y), __num(w), __num(h), col(c)); },
      daire_cek: function (x, y, r, c) { game.circle(__num(x), __num(y), __num(r), col(c)); },
      ucbucaq: function (x1, y1, x2, y2, x3, y3, c) { game.tri(__num(x1), __num(y1), __num(x2), __num(y2), __num(x3), __num(y3), col(c)); },
      xett: function (x1, y1, x2, y2, c, w) { game.line(__num(x1), __num(y1), __num(x2), __num(y2), col(c), w == null ? 2 : __num(w)); },
      metn_yaz: function (m, x, y, size, c, stil) { game.text(fmt(m), __num(x), __num(y), size == null ? 20 : __num(size), col(c || 'ag'), false, parseStyle(stil)); },
      merkezde_yaz: function (m, y, size, c, stil) { game.text(fmt(m), 300, __num(y), size == null ? 32 : __num(size), col(c || 'ag'), true, parseStyle(stil)); },
      toqqusur: function (x1, y1, w1, h1, x2, y2, w2, h2) {
        return __num(x1) < __num(x2) + __num(w2) && __num(x1) + __num(w1) > __num(x2) &&
               __num(y1) < __num(y2) + __num(h2) && __num(y1) + __num(h1) > __num(y2);
      },
      mesafe: function (x1, y1, x2, y2) { return Math.hypot(__num(x2) - __num(x1), __num(y2) - __num(y1)); },
      vaxt: function () { return Date.now(); },
      sican_x: function () { return game.mouse().x; },
      sican_y: function () { return game.mouse().y; },
      kliklendi: function () { return game.mouse().clicked; }
    };
    function flat(args) { var r = []; Array.prototype.forEach.call(args, function (a) { Array.isArray(a) ? r.push.apply(r, a) : r.push(a); }); return r; }
    return { t: t, B: B };
  }

  // Yazı stili: "qalın", "incə", "adi", "maili", "xətli", "üstüxətli", "kod", "klassik" — birləşdirmək olar: "qalın maili"
  var STYLE_WORDS = {
    qalin: ['weight', 800], cox_qalin: ['weight', 900], yariqalin: ['weight', 600], adi: ['weight', 400], ince: ['weight', 300],
    maili: ['italic', true], italik: ['italic', true], xetli: ['underline', true], altixetli: ['underline', true], ustuxetli: ['strike', true],
    kod: ['family', 'mono'], klassik: ['family', 'serif'], sade: ['family', 'sans']
  };
  function parseStyle(stil) {
    var st = { weight: 800, italic: false, underline: false, strike: false, family: 'sans' };
    if (stil == null) return st;
    var used = false;
    String(stil).split(/[\s,+]+/).forEach(function (w) {
      if (!w) return;
      var e = STYLE_WORDS[fold(w)];
      if (!e) throw new Error('Tanınmayan yazı stili: "' + w + '". Mümkün olanlar: qalın, incə, adi, maili, xətli, üstüxətli, kod, klassik');
      if (e[0] === 'weight' && !used) { st.weight = 400; }
      st[e[0]] = e[1]; if (e[0] === 'weight') used = true;
    });
    if (!used) st.weight = 400;
    return st;
  }

  function __num(x) {
    if (typeof x === 'number') return x;
    var n = Number(x);
    if (x === null || x === undefined || x === '' || isNaN(n)) throw new Error('Ədəd gözlənilirdi, amma "' + fmt(x) + '" gəldi');
    return n;
  }
  function __iter(x) {
    if (typeof x === 'number') { var r = []; for (var i = 1; i <= x; i++) r.push(i); return r; }
    if (typeof x === 'string') return Array.from(x);
    if (Array.isArray(x)) return x.slice();
    if (x && typeof x === 'object') return Object.keys(x).map(function (k) { return dispName(x, k); });
    throw new Error('"' + fmt(x) + '" üzərində dövr etmək olmur');
  }

  // Obyektlər: açarlar hərfsiz formada saxlanılır, ekranda isə orijinal yazılışla görünür
  var DISP = typeof Symbol !== 'undefined' ? Symbol('od-ad') : '__odad';
  var CURRENT_NAMES = {};
  function dispName(o, k) { var d = o[DISP]; return (d && d[k]) || CURRENT_NAMES[k] || k; }
  function __obj(o) {
    Object.defineProperty(o, DISP, { value: {}, enumerable: false, writable: true });
    return new Proxy(o, {
      get: function (t, k) { if (typeof k === 'string' && !(k in t)) { var f = fold(k); if (f in t) return t[f]; } return t[k]; },
      set: function (t, k, v) {
        if (typeof k === 'string' && !(k in t)) { var f = fold(k); if (!(f in t) && f !== k) t[DISP][f] = k; k = f; }
        t[k] = v; return true;
      },
      has: function (t, k) { return k in t || (typeof k === 'string' && fold(k) in t); },
      deleteProperty: function (t, k) { if (typeof k === 'string' && !(k in t)) k = fold(k); delete t[k]; return true; }
    });
  }

  function StopSignal() { this.name = 'StopSignal'; }

  // JS xətalarını Azərbaycan dilinə çevir
  function translateError(e, names, line) {
    var msg = String(e && e.message || e);
    var orig = function (f) { return names[f] || f; };
    var m;
    if ((m = /\$([\wəöüşçğı]+) is not defined/.exec(msg)) || (m = /\$([\wəöüşçğı]+)' is not defined/.exec(msg)) || (m = /Can't find variable: \$(\S+)/.exec(msg)))
      return '"' + orig(m[1]) + '" tapılmadı. Bu adda dəyişən və ya funksiya yaradılmayıb.';
    if ((m = /\$([\wəöüşçğı]+)\S* is not a function/.exec(msg)))
      return '"' + orig(m[1]) + '" funksiya deyil, onu mötərizə ilə çağırmaq olmaz.';
    if ((m = /\.([\wəöüşçğı]+) is not a function/.exec(msg)))
      return 'Belə metod yoxdur: ".' + m[1] + '()"';
    if (/is not a function/.test(msg)) return 'Bu, çağırıla bilən funksiya deyil.';
    if (/Cannot read propert|undefined is not an object|null is not an object|Cannot set propert/.test(msg))
      return 'Boş ("heç") dəyərin içindən nəsə götürməyə çalışdın. Siyahının indeksi düzdür?';
    if (/Maximum call stack|too much recursion|dərinlik/.test(msg))
      return 'Funksiya özünü dayanmadan çağırır (sonsuz təkrar).';
    if (/before initialization/.test(msg)) return 'Dəyişən hələ yaradılmayıb.';
    if (/is not iterable/.test(msg)) return 'Bu dəyər üzərində dövr etmək olmur.';
    if (/Invalid array length/.test(msg)) return 'Siyahı ölçüsü səhvdir.';
    return msg;
  }

  var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  function run(source, io) {
    installProto();
    var compiled;
    try { compiled = compile(source); }
    catch (e) {
      if (e instanceof OdError) return { promise: Promise.resolve({ ok: false, error: e.message, line: e.line, kind: 'syntax' }), stop: function () {} };
      throw e;
    }
    var rt = makeRuntime(io);
    var __msg = function (e) { return e && e.odUser ? e.message : translateError(e, compiled.names); };
    var bnames = Object.keys(rt.B);
    var fnc;
    try {
      fnc = new (Function.prototype.bind.apply(AsyncFunction, [null, '__t', '__num', '__iter', '__Stop', '__msg', '__obj'].concat(bnames.map(function (b) { return '$' + b; }), ['"use strict";\n' + compiled.js])))();
    } catch (e) {
      return { promise: Promise.resolve({ ok: false, error: 'Kodda yazı xətası var (mötərizələri, dırnaqları və ":" işarələrini yoxla).', line: null, kind: 'syntax', detail: String(e.message) }), js: compiled.js, stop: function () {} };
    }
    CURRENT_NAMES = compiled.names;
    var args = [rt.t, __num, __iter, StopSignal, __msg, __obj].concat(bnames.map(function (b) { return rt.B[b]; }));
    var p = fnc.apply(null, args).then(function () { return { ok: true }; }, function (e) {
      if (e instanceof StopSignal) return { ok: false, stopped: true };
      var ln = (e && e.__odLine != null) ? e.__odLine : rt.t.l;
      return { ok: false, error: e && e.odUser ? e.message : translateError(e, compiled.names, ln), line: ln, kind: 'runtime', detail: String(e && e.message) };
    });
    return { promise: p, js: compiled.js, stop: function () { rt.t.stopped = true; } };
  }

  root.Od = { StopSignal: StopSignal, compile: compile, run: run, fold: fold, canon: canon, fmt: fmt, OdError: OdError, KW: KW, COLORS: COLORS };
})(typeof window !== 'undefined' ? window : globalThis);

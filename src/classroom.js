// ===== Od Sinif — müəllim və şagird rolları, ev tapşırıqları, ciddi rejim =====
(function () {
  'use strict';
  var A = window.OdApp, $ = A.$, esc = A.esc, icon = A.icon, toast = A.toast;
  var cloud = OdCloud.create();
  var user = null, booted = false, inbox = [], inboxSeen = null, unsubInbox = null;
  var myClassesCache = [], mySubsCache = {};

  function fmtDate(t) {
    if (!t) return '—';
    var d = new Date(t), aylar = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'];
    return d.getDate() + ' ' + aylar[d.getMonth()] + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function fmtDur(ms) { var s = Math.round((ms || 0) / 1000), m = Math.floor(s / 60); return m ? m + ' dəq ' + (s % 60) + ' san' : s + ' san'; }
  function initials(n) { return String(n || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
  function fail(e) { toast(OdCloud.authMsg(e)); }
  function roleName(r) { return r === 'muellim' ? 'Müəllim' : 'Şagird'; }

  // ---------- Başlanğıc ----------
  function boot() {
    if (booted) return; booted = true;
    $('sbCloud').innerHTML = icon('cloud') + (cloud.mode === 'firebase' ? 'Bulud: qoşulur…' : 'Demo rejim');
    cloud.init().then(function () {
      $('sbCloud').innerHTML = icon('cloud') + (cloud.mode === 'firebase' ? 'Bulud: onlayn' : 'Demo rejim');
    }, function (e) {
      // Firebase yüklənmədisə (məs. bağlı mühit) demo rejimə keç
      cloud = OdCloud.create({ demo: true });
      $('sbCloud').innerHTML = icon('cloud') + 'Demo rejim';
      console.warn(e); cloud.onAuth(onAuth);
    });
    cloud.onAuth(onAuth);
  }
  function onAuth(u) {
    user = u;
    $('userAv').textContent = u ? initials(u.ad) : '?';
    $('userName').textContent = u ? u.ad : 'Daxil ol';
    if (unsubInbox) { unsubInbox(); unsubInbox = null; }
    inbox = []; inboxSeen = null; updateBadges();
    if (u && u.rol === 'muellim') unsubInbox = cloud.watchInbox(onInbox);
    if (u && u.rol === 'sagird') refreshMySubs();
    if (A.curPane() === 'sinif') render();
    if (!u) A.hideDash();
  }
  function refreshMySubs() { return cloud.mySubmissions().then(function (l) { mySubsCache = {}; l.forEach(function (s) { mySubsCache[s.aid] = s; }); }, function () {}); }

  // ---------- Bildirişlər (müəllim) ----------
  function onInbox(list) {
    var fresh = [];
    if (inboxSeen) list.forEach(function (s) { var old = inboxSeen[s.id]; if (!old || old < s.göndərilib) fresh.push(s); });
    inboxSeen = {}; list.forEach(function (s) { inboxSeen[s.id] = s.göndərilib; });
    inbox = list; updateBadges();
    fresh.forEach(function (s) { toast((s.şübhəli ? '⚠ Şübhəli göndəriş: ' : 'Yeni göndəriş: ') + s.studentName + ' — ' + s.başlıq); });
    if ($('bellPop').classList.contains('on')) renderBell();
    if (dashState && dashState.view === 'assignment') refreshDash();
  }
  function updateBadges() {
    var n = inbox.filter(function (s) { return !s.oxundu; }).length;
    [$('bellBadge'), $('actBadge')].forEach(function (b) { b.textContent = n > 9 ? '9+' : n; b.classList.toggle('on', n > 0); });
  }
  function renderBell() {
    var pop = $('bellPop'), h = '<div class="ph">Bildirişlər<div class="spacer"></div>';
    if (inbox.some(function (s) { return !s.oxundu; })) h += '<button class="btn sm ghost" id="readAll">Hamısını oxunmuş et</button>';
    h += '</div>';
    if (!user) h += '<div class="nitem muted">Bildirişləri görmək üçün daxil ol.</div>';
    else if (user.rol !== 'muellim') h += '<div class="nitem muted">Şagird bildirişləri: tapşırıqların "Sinif" bölməsindədir.</div>';
    else if (!inbox.length) h += '<div class="nitem muted">Hələ göndəriş yoxdur.</div>';
    else inbox.slice(0, 30).forEach(function (s) {
      h += '<div class="nitem' + (s.oxundu ? '' : ' unread') + '" data-sid="' + esc(s.id) + '">' +
        (s.şübhəli ? '<span class="pill warn">' + icon('flag') + 'Şübhəli</span> ' : '') + '<b>' + esc(s.studentName) + '</b> göndərdi: ' + esc(s.başlıq) +
        '<div class="muted" style="font-size:11.5px;margin-top:2px">' + fmtDate(s.göndərilib) + ' · ' + resultText(s) + '</div></div>';
    });
    pop.innerHTML = h; A.applyIcons(pop);
    pop.querySelectorAll('[data-sid]').forEach(function (el) {
      el.onclick = function () { pop.classList.remove('on'); var s = inbox.filter(function (x) { return x.id === el.dataset.sid; })[0]; if (s) openSubmission(s); };
    });
    if ($('readAll')) $('readAll').onclick = function () { inbox.filter(function (s) { return !s.oxundu; }).forEach(function (s) { cloud.updateSubmission(s.id, { oxundu: true }); s.oxundu = true; }); updateBadges(); renderBell(); };
  }
  $('bellBtn').onclick = function (e) { e.stopPropagation(); var p = $('bellPop'); p.classList.toggle('on'); if (p.classList.contains('on')) renderBell(); };
  document.addEventListener('click', function (e) { if (!$('bellPop').contains(e.target)) $('bellPop').classList.remove('on'); });
  function resultText(s) { var n = s.nəticə || {}; return n.cəmi ? n.keçən + '/' + n.cəmi + ' test' : 'testsiz'; }

  // ---------- Hesab ----------
  $('userBtn').onclick = function () { if (!user) openAuth('in'); else openAccount(); };
  function openAuth(tab, role) {
    var box = A.openModal(
      '<div class="row"><h2>' + (tab === 'up' ? 'Qeydiyyat' : 'Daxil ol') + '</h2><div class="spacer"></div><button class="btn ghost" data-x>Bağla</button></div>' +
      '<p class="muted" style="margin:4px 0 14px">' + (cloud.mode === 'demo' ? 'Demo rejim: hesablar yalnız bu brauzerdə saxlanılır.' : 'Od Sinif hesabı') + '</p>' +
      '<div class="seg"><button data-tab="in"' + (tab !== 'up' ? ' class="on"' : '') + '>Daxil ol</button><button data-tab="up"' + (tab === 'up' ? ' class="on"' : '') + '>Qeydiyyat</button></div>' +
      (tab === 'up' ? '<div class="field"><label>Rol</label><div class="seg" style="margin:0"><button data-role="sagird"' + (role !== 'muellim' ? ' class="on"' : '') + '>Şagird</button><button data-role="muellim"' + (role === 'muellim' ? ' class="on"' : '') + '>Müəllim</button></div></div>' +
        '<div class="field"><label>Ad və soyad</label><input class="inp" id="aName" maxlength="40" autocomplete="name"></div>' : '') +
      '<div class="field"><label>E-poçt</label><input class="inp" id="aMail" type="email" autocomplete="email"></div>' +
      '<div class="field"><label>Şifrə' + (tab === 'up' ? ' (ən azı 6 simvol)' : '') + '</label><input class="inp" id="aPass" type="password" autocomplete="' + (tab === 'up' ? 'new-password' : 'current-password') + '"></div>' +
      '<div class="notice" id="aErr" style="display:none"></div>' +
      '<div class="row"><div class="spacer"></div><button class="btn primary" id="aGo">' + (tab === 'up' ? 'Hesab yarat' : 'Daxil ol') + '</button></div>');
    var rol = role === 'muellim' ? 'muellim' : 'sagird';
    box.querySelector('[data-x]').onclick = A.closeModal;
    box.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { openAuth(b.dataset.tab, rol); }; });
    box.querySelectorAll('[data-role]').forEach(function (b) { b.onclick = function () { rol = b.dataset.role; box.querySelectorAll('[data-role]').forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
    function go() {
      var e = $('aMail').value, p = $('aPass').value, btn = $('aGo');
      btn.disabled = true;
      var pr = tab === 'up' ? cloud.signUp(e, p, $('aName').value, rol) : cloud.signIn(e, p);
      pr.then(function (u) { A.closeModal(); toast('Xoş gəldin, ' + u.ad + '!'); A.showPane('sinif'); },
        function (er) { btn.disabled = false; var el = $('aErr'); el.style.display = 'block'; el.className = 'notice warn'; el.textContent = OdCloud.authMsg(er); });
    }
    $('aGo').onclick = go;
    box.querySelectorAll('input').forEach(function (i) { i.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') go(); }); });
  }
  function openAccount() {
    var box = A.openModal('<div class="row"><h2>' + esc(user.ad) + '</h2><div class="spacer"></div><button class="btn ghost" data-x>Bağla</button></div>' +
      '<p class="muted" style="margin:4px 0 14px">' + roleName(user.rol) + ' · ' + esc(user.email || '') + '</p>' +
      '<div class="notice">' + (cloud.mode === 'demo' ? 'Demo rejim: bütün məlumat bu brauzerdə saxlanılır. Server qoşulanda hesablar real olacaq.' : 'Bulud rejimi: məlumat Firebase serverində saxlanılır.') + '</div>' +
      '<div class="row"><div class="spacer"></div><button class="btn danger" id="aOut" data-icon="logout">Çıxış</button></div>');
    box.querySelector('[data-x]').onclick = A.closeModal;
    $('aOut').onclick = function () { cloud.signOut().then(function () { A.closeModal(); A.freeContext(); toast('Hesabdan çıxdın'); }); };
  }

  // ---------- Sinif paneli (sol) ----------
  function render() {
    boot();
    var p = $('pane-sinif');
    if (!user) {
      p.innerHTML = '<div class="sec"><h4>Od Sinif</h4><p class="phil">Müəllimlər sinif yaradır və ev tapşırığı verir. Şagirdlər sinif koduna qoşulur, tapşırığı Od-da yazıb göndərir. Kod avtomatik yoxlanılır və nəticə müəllimin panelinə düşür.</p>' +
        '<div class="row" style="margin-top:12px"><button class="btn primary" id="sIn">Daxil ol</button><button class="btn" id="sUpT">Müəllim qeydiyyatı</button><button class="btn" id="sUpS">Şagird qeydiyyatı</button></div></div>' +
        '<div class="sec"><h4>Ciddi rejim</h4><p class="phil">Müəllim tapşırıqda "ciddi rejim"i açanda kod yapışdırmaq, səhifədən çıxmaq və yazılış vaxtı qeydə alınır. Şübhəli göndərişlər müəllimə bildiriş kimi gəlir və o, yazılışı təkrar oynada bilir. Şagird bunu redaktorun üstündə açıq görür.</p></div>' +
        (cloud.mode === 'demo' ? '<div class="sec"><div class="notice">Demo rejim: server qoşulmayıb, hesablar yalnız bu brauzerdə saxlanılır. Təqdimat üçün: müəllim kimi qeydiyyatdan keç, sinif yarat, sonra çıxıb şagird kimi daxil ol.</div></div>' : '');
      $('sIn').onclick = function () { openAuth('in'); };
      $('sUpT').onclick = function () { openAuth('up', 'muellim'); };
      $('sUpS').onclick = function () { openAuth('up', 'sagird'); };
      return;
    }
    if (user.rol === 'muellim') renderTeacherPane(p); else renderStudentPane(p);
  }

  function renderTeacherPane(p) {
    p.innerHTML = '<div class="sec"><div class="row"><span class="avatar">' + esc(initials(user.ad)) + '</span><div><b>' + esc(user.ad) + '</b><div class="muted" style="font-size:12px">Müəllim</div></div></div>' +
      '<div class="row" style="margin-top:12px"><button class="btn primary" id="tDash" data-icon="eye">Müəllim paneli</button><button class="btn" id="tNew" data-icon="plus">Yeni sinif</button></div></div>' +
      '<div class="sec" style="padding:8px 0"><h4 style="padding:4px 14px">Siniflərim</h4><div class="list" id="tList"><div class="item muted">Yüklənir…</div></div></div>';
    A.applyIcons(p);
    $('tDash').onclick = function () { openDash({ view: 'home' }); };
    $('tNew').onclick = newClassModal;
    cloud.myClasses().then(function (l) {
      myClassesCache = l;
      $('tList').innerHTML = l.length ? l.map(function (c) { return '<button class="item" data-cid="' + esc(c.id) + '">' + icon('users') + esc(c.ad) + '<span class="meta mono">' + esc(c.kod) + '</span></button>'; }).join('')
        : '<div class="item muted">Hələ sinif yoxdur.</div>';
      $('tList').querySelectorAll('[data-cid]').forEach(function (b) { b.onclick = function () { openDash({ view: 'class', cid: b.dataset.cid }); }; });
    }, fail);
  }
  function newClassModal() {
    var box = A.openModal('<h2>Yeni sinif</h2><p class="muted" style="margin:4px 0 14px">Sinif yaradıldıqdan sonra şagirdlərə 6 simvollu qoşulma kodu verəcəksən.</p>' +
      '<div class="field"><label>Sinfin adı</label><input class="inp" id="cName" placeholder="məs. 7A — İnformatika" maxlength="60"></div>' +
      '<div class="row"><div class="spacer"></div><button class="btn ghost" data-x>Ləğv et</button><button class="btn primary" id="cGo">Yarat</button></div>');
    box.querySelector('[data-x]').onclick = A.closeModal;
    $('cGo').onclick = function () {
      cloud.createClass($('cName').value).then(function (c) { A.closeModal(); toast('Sinif yaradıldı. Kod: ' + c.kod); render(); openDash({ view: 'class', cid: c.id }); }, fail);
    };
  }

  function renderStudentPane(p) {
    p.innerHTML = '<div class="sec"><div class="row"><span class="avatar">' + esc(initials(user.ad)) + '</span><div><b>' + esc(user.ad) + '</b><div class="muted" style="font-size:12px">Şagird</div></div></div>' +
      '<div class="field" style="margin:12px 0 0"><label>Sinfə qoşul</label><div class="row"><input class="inp mono" id="jCode" placeholder="KOD" maxlength="6" style="text-transform:uppercase;letter-spacing:2px"><button class="btn primary" id="jGo">Qoşul</button></div></div></div>' +
      '<div id="sClasses"><div class="sec muted">Yüklənir…</div></div>';
    $('jGo').onclick = function () { cloud.joinClass($('jCode').value).then(function (c) { toast(c.ad + ' sinfinə qoşuldun'); render(); }, fail); };
    $('jCode').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('jGo').click(); });
    Promise.all([cloud.myClasses(), refreshMySubs()]).then(function (r) {
      var classes = r[0];
      if (!classes.length) { $('sClasses').innerHTML = '<div class="sec"><div class="empty">Hələ heç bir sinfə qoşulmamısan. Müəllimindən sinif kodunu soruş.</div></div>'; return; }
      return Promise.all(classes.map(function (c) { return cloud.assignmentsForClass(c.id).then(function (as) { return { c: c, as: as }; }); })).then(function (rows) {
        $('sClasses').innerHTML = rows.map(function (row) {
          return '<div class="sec" style="padding:8px 0"><h4 style="padding:4px 14px">' + esc(row.c.ad) + ' · ' + esc(row.c.teacherName || '') + '</h4><div class="list">' +
            (row.as.length ? row.as.map(function (a) {
              var s = mySubsCache[a.id], st = !s ? '<span class="dotk"></span>' : '<span class="dotk ' + (s.nəticə && s.nəticə.ok ? 'ok' : (s.nəticə && s.nəticə.cəmi ? 'bad' : 'warn')) + '"></span>';
              var late = a.son && !s && Date.now() > a.son;
              return '<button class="item" data-aid="' + esc(a.id) + '">' + st + esc(a.başlıq) + (a.ciddi ? ' ' + icon('shield') : '') +
                '<span class="meta">' + (s ? 'göndərilib' : late ? 'vaxtı keçib' : a.son ? 'son: ' + fmtDate(a.son) : '') + '</span></button>';
            }).join('') : '<div class="item muted">Tapşırıq yoxdur</div>') + '</div></div>';
        }).join('');
        $('sClasses').querySelectorAll('[data-aid]').forEach(function (b) { b.onclick = function () { openAssignment(b.dataset.aid); }; });
      });
    }).catch(fail);
  }

  // ---------- Şagird: tapşırıq ----------
  var curAssign = null;
  function openAssignment(aid) {
    cloud.getAssignment(aid).then(function (a) {
      curAssign = a;
      var draftKey = 'od-tap-' + aid, draft = A.fetchStore(draftKey);
      A.setContext({
        type: 'assignment', aid: aid, strict: !!a.ciddi, icon: 'send',
        title: 'Tapşırıq — ' + a.başlıq, crumb: 'Sinif › ' + a.başlıq, mode: a.ciddi ? 'Tapşırıq · Ciddi rejim' : 'Tapşırıq',
        save: function (v) { A.store(draftKey, v); },
        tools: (a.testlər && a.testlər.length ? [{ label: 'Yoxla', icon: 'check', onClick: function () { checkAssign(false); } }] : [])
          .concat([{ label: 'Göndər', icon: 'send', cls: 'primary', onClick: function () { checkAssign(true); } }])
      }, draft != null ? draft : (a.başlanğıc || ''));
      startTracker(a);
      renderAssignPane();
    }, fail);
  }
  function renderAssignPane(res) {
    var a = curAssign, s = mySubsCache[a.id], p = $('pane-sinif');
    var h = '<div class="sec"><button class="btn sm ghost" id="aBack" data-icon="back">Tapşırıqlar</button>' +
      '<h2 style="margin:10px 0 4px;font-size:17px">' + esc(a.başlıq) + '</h2>' +
      '<div class="row" style="flex-wrap:wrap">' + (a.ciddi ? '<span class="pill warn">' + icon('shield') + 'Ciddi rejim</span>' : '') +
      (a.son ? '<span class="pill">' + icon('clock') + 'Son: ' + fmtDate(a.son) + '</span>' : '') +
      (a.testlər && a.testlər.length ? '<span class="pill">' + a.testlər.length + ' test</span>' : '') + '</div>' +
      '<div class="doc"><p style="white-space:pre-wrap">' + esc(a.təsvir || '') + '</p></div>' +
      (a.ciddi ? '<div class="notice warn">Bu tapşırıq ciddi rejimdədir: kod yapışdırmaq, səhifədən çıxmaq və yazılış vaxtı müəllimə göstərilir. Kodu özün yaz.</div>' : '') +
      '<div class="lbtns">' + (a.testlər && a.testlər.length ? '<button class="btn" id="aCheck" data-icon="check">Yoxla</button>' : '') +
      '<button class="btn primary" id="aSend" data-icon="send">Göndər</button></div>' +
      (s ? '<div class="notice">Son göndəriş: ' + fmtDate(s.göndərilib) + ' · ' + resultText(s) + (s.cəhd > 1 ? ' · ' + s.cəhd + '-ci cəhd' : '') +
        (s.qiymət != null && s.qiymət !== '' ? '<br><b>Qiymət: ' + esc(s.qiymət) + '</b>' : '') + (s.şərh ? '<br>Müəllimin şərhi: ' + esc(s.şərh) : '') + '</div>' : '') +
      '<div class="lres" id="aRes"></div></div>';
    p.innerHTML = h; A.applyIcons(p);
    $('aBack').onclick = function () { A.freeContext(); render(); };
    if ($('aCheck')) $('aCheck').onclick = function () { checkAssign(false); };
    $('aSend').onclick = function () { checkAssign(true); };
    if (res) A.showResults($('aRes'), res);
    if (A.curPane() !== 'sinif') A.showPane('sinif');
  }
  function checkAssign(send) {
    var a = curAssign, ctx = A.getContext();
    if (!a || !ctx || ctx.type !== 'assignment' || ctx.aid !== a.id) return;
    var codeText = A.code.value;
    var tests = (a.testlər || []).map(function (t) { return { girdi: t.girdi || [], gözlənilən: t.gözlənilən || '' }; });
    var pr = tests.length ? odCheckLesson({ testlər: tests }, codeText) : Promise.resolve({ ok: true, results: [], mesaj: null });
    if (A.curPane() !== 'sinif') A.showPane('sinif');
    $('aRes').innerHTML = '<div class="big">' + (send ? 'Göndərilir…' : 'Yoxlanılır…') + '</div>';
    pr.then(function (r) {
      if (!send) { A.showResults($('aRes'), r); return; }
      var sig = trackerSnapshot(a), integ = a.ciddi ? OdCloud.evaluateIntegrity(sig, (a.başlanğıc || '').length, codeText.length) : { şübhəli: false, səbəblər: [] };
      var payload = {
        kod: codeText, başlanğıc: a.başlanğıc || '', ciddi: !!a.ciddi,
        nəticə: { ok: r.ok, keçən: r.results.filter(function (x) { return x.ok; }).length, cəmi: r.results.length,
          testlər: r.results.map(function (x) { return { ok: x.ok, alınan: (x.alınan || '').slice(0, 400), xəta: x.xəta || '' }; }) },
        siqnallar: { aktivMs: sig.aktivMs, çıxış: sig.çıxış, çıxışMs: sig.çıxışMs, yapışdırılan: sig.yapışdırılan, yapışdırmaSayı: sig.yapışdırma.length, düymə: sig.düymə, açılış: sig.açılış },
        şübhəli: integ.şübhəli, səbəblər: integ.səbəblər,
        opsJson: a.ciddi ? JSON.stringify(sig.ops.slice(0, 6000)) : ''
      };
      if (a.son && Date.now() > a.son) payload.gecikib = true;
      return cloud.submit(a.id, payload).then(function (s) {
        mySubsCache[a.id] = s; renderAssignPane(r);
        toast(r.results.length ? 'Göndərildi: ' + payload.nəticə.keçən + '/' + payload.nəticə.cəmi + ' test keçdi' : 'Göndərildi');
      });
    }).catch(function (e) { $('aRes').innerHTML = '<div class="tr bad">' + esc(OdCloud.authMsg(e)) + '</div>'; });
  }

  // ---------- Ciddi rejim: izləyici ----------
  var TR = null, lastText = '', leaveAt = null, trTimer = null;
  function trKey(aid) { return 'od-iz-' + aid; }
  function trActive() { var c = A.getContext(); return TR && c && c.type === 'assignment' && c.aid === TR.aid; }
  function startTracker(a) {
    var saved = A.fetchStore(trKey(a.id), true);
    TR = saved && saved.aid === a.id ? saved : { aid: a.id, strict: !!a.ciddi, aktivMs: 0, çıxış: 0, çıxışMs: 0, yapışdırma: [], yapışdırılan: 0, düymə: 0, ops: [], açılış: 0, t0: Date.now(), base: a.başlanğıc || '', elapsed: 0 };
    TR.strict = !!a.ciddi; TR.açılış++;
    lastText = A.code.value;
    if (TR.strict) {
      var replayed = OdCloud.replayAt(TR.base, TR.ops, TR.ops.length);
      if (replayed !== lastText) { var op = OdCloud.diffOp(replayed, lastText, TR.elapsed); if (op) { op.push('y'); TR.ops.push(op); } }
    }
    persistTracker();
    if (!trTimer) trTimer = setInterval(function () {
      if (!trActive()) return;
      if (document.visibilityState === 'visible' && document.hasFocus()) { TR.aktivMs += 1000; TR.elapsed += 1000; }
      persistTracker();
    }, 1000);
  }
  function persistTracker() { if (TR) A.store(trKey(TR.aid), TR); }
  function trackerSnapshot(a) {
    if (!TR || TR.aid !== a.id) return { aktivMs: 0, çıxış: 0, çıxışMs: 0, yapışdırma: [], yapışdırılan: 0, düymə: 0, ops: [], açılış: 1 };
    return TR;
  }
  var pasteFlag = false;
  A.code.addEventListener('paste', function (e) {
    if (!trActive() || !TR.strict) return;
    var t = (e.clipboardData || window.clipboardData).getData('text') || '';
    TR.yapışdırma.push([TR.elapsed, t.length]); TR.yapışdırılan += t.length; pasteFlag = true;
  });
  A.code.addEventListener('keydown', function (e) {
    if (!trActive() || !TR.strict || e.ctrlKey || e.metaKey) return;
    if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Tab' || e.key === 'Delete') TR.düymə++;
  });
  A.code.addEventListener('input', function () {
    if (!trActive() || !TR.strict) { lastText = A.code.value; return; }
    var op = OdCloud.diffOp(lastText, A.code.value, TR.elapsed);
    if (op && TR.ops.length < 6000) { if (pasteFlag) op.push('p'); TR.ops.push(op); }
    pasteFlag = false; lastText = A.code.value;
  });
  function leave() { if (trActive() && TR.strict && leaveAt == null) leaveAt = Date.now(); }
  function back() {
    if (leaveAt != null && trActive()) { var dt = Date.now() - leaveAt; if (dt > 800) { TR.çıxış++; TR.çıxışMs += dt; persistTracker(); } }
    leaveAt = null;
  }
  document.addEventListener('visibilitychange', function () { document.visibilityState === 'hidden' ? leave() : back(); });
  window.addEventListener('blur', leave);
  window.addEventListener('focus', back);

  // ---------- Müəllim paneli (mərkəz) ----------
  var dashState = null;
  function openDash(st) { dashState = st; if (A.curPane() !== 'sinif') A.showPane('sinif'); refreshDash(); }
  function refreshDash() {
    if (!dashState || !user || user.rol !== 'muellim') return;
    var v = dashState.view;
    if (v === 'home') dashHome(); else if (v === 'class') dashClass(dashState.cid); else if (v === 'assignment') dashAssignment(dashState.aid);
  }
  function dashHeader(title, back, extra) {
    return '<div class="dash-h">' + (back ? '<button class="btn sm ghost" id="dBack" data-icon="back">' + esc(back) + '</button>' : '') +
      '<h2>' + title + '</h2><div class="spacer"></div>' + (extra || '') + '<button class="btn sm" id="dClose">Redaktora qayıt</button></div>';
  }
  function bindHeader(backFn) {
    $('dClose').onclick = function () { dashState = null; A.hideDash(); };
    if ($('dBack')) $('dBack').onclick = backFn;
  }
  function dashHome() {
    var flagged = inbox.filter(function (s) { return s.şübhəli; }), unread = inbox.filter(function (s) { return !s.oxundu; });
    A.showDash(dashHeader('Müəllim paneli', null, '<button class="btn sm primary" id="dNewC" data-icon="plus">Yeni sinif</button>') +
      '<div class="dash-b"><div class="cards" id="dStats"></div><h3 style="margin:22px 0 10px;font-size:14px">Siniflər</h3><div class="cards" id="dClasses"><div class="empty">Yüklənir…</div></div>' +
      '<h3 style="margin:22px 0 10px;font-size:14px">Son göndərişlər</h3><div id="dRecent"></div></div>');
    bindHeader(); $('dNewC').onclick = newClassModal;
    $('dStats').innerHTML = statCard('Göndərişlər', inbox.length) + statCard('Oxunmamış', unread.length) + statCard('Şübhəli', flagged.length, flagged.length ? 'var(--warn)' : '');
    cloud.myClasses().then(function (l) {
      $('dClasses').innerHTML = l.length ? l.map(function (c) {
        return '<div class="card" style="cursor:pointer" data-cid="' + esc(c.id) + '"><h3>' + esc(c.ad) + '</h3><div class="muted" style="font-size:12px">Qoşulma kodu</div><div class="kod">' + esc(c.kod) + '</div></div>';
      }).join('') : '<div class="empty">Hələ sinif yoxdur. "Yeni sinif" düyməsi ilə başla.</div>';
      $('dClasses').querySelectorAll('[data-cid]').forEach(function (el) { el.onclick = function () { openDash({ view: 'class', cid: el.dataset.cid }); }; });
    }, fail);
    $('dRecent').innerHTML = subsTable(inbox.slice(0, 15), true);
    bindSubRows($('dRecent'), inbox);
  }
  function statCard(t, n, color) { return '<div class="card"><div class="muted" style="font-size:12px">' + t + '</div><div class="stat"' + (color ? ' style="color:' + color + '"' : '') + '>' + n + '</div></div>'; }
  function dashClass(cid) {
    var c = myClassesCache.filter(function (x) { return x.id === cid; })[0];
    var go = c ? Promise.resolve(c) : cloud.myClasses().then(function (l) { myClassesCache = l; return l.filter(function (x) { return x.id === cid; })[0]; });
    go.then(function (c) {
      if (!c) { toast('Sinif tapılmadı'); return; }
      A.showDash(dashHeader(esc(c.ad), 'Panel', '<button class="btn sm primary" id="dNewA" data-icon="plus">Yeni tapşırıq</button>') +
        '<div class="dash-b"><div class="grid2"><div><h3 style="margin:0 0 10px;font-size:14px">Tapşırıqlar</h3><div id="dAs"><div class="empty">Yüklənir…</div></div></div>' +
        '<div><div class="card"><div class="muted" style="font-size:12px">Şagirdlər bu kodla qoşulur</div><div class="kod" style="font-size:26px">' + esc(c.kod) + '</div>' +
        '<button class="btn sm" id="dCopyK" data-icon="copy" style="margin-top:8px">Kodu kopyala</button></div>' +
        '<h3 style="margin:18px 0 10px;font-size:14px">Şagirdlər</h3><div id="dMem"><div class="empty">Yüklənir…</div></div></div></div></div>');
      bindHeader(function () { openDash({ view: 'home' }); });
      $('dNewA').onclick = function () { assignmentModal(c); };
      $('dCopyK').onclick = function () { try { navigator.clipboard.writeText(c.kod).then(function () { toast('Kod kopyalandı: ' + c.kod); }); } catch (e) { toast(c.kod); } };
      cloud.classMembers(cid).then(function (m) {
        $('dMem').innerHTML = m.length ? '<table class="t"><tr><th>Ad</th><th>Qoşulub</th></tr>' + m.map(function (x) { return '<tr><td>' + esc(x.ad) + '</td><td class="muted">' + fmtDate(x.qoşulub) + '</td></tr>'; }).join('') + '</table>'
          : '<div class="empty">Hələ şagird yoxdur. Kodu şagirdlərə ver.</div>';
      }, fail);
      cloud.assignmentsForClass(cid).then(function (as) {
        $('dAs').innerHTML = as.length ? '<table class="t"><tr><th>Tapşırıq</th><th>Göndəriş</th><th>Son tarix</th></tr>' + as.map(function (a) {
          var subs = inbox.filter(function (s) { return s.aid === a.id; }), fl = subs.filter(function (s) { return s.şübhəli; }).length;
          return '<tr class="click" data-aid="' + esc(a.id) + '"><td><b>' + esc(a.başlıq) + '</b>' + (a.ciddi ? ' <span class="pill warn">' + icon('shield') + 'Ciddi</span>' : '') +
            '</td><td>' + subs.length + (fl ? ' <span class="pill warn">' + fl + ' şübhəli</span>' : '') + '</td><td class="muted">' + (a.son ? fmtDate(a.son) : '—') + '</td></tr>';
        }).join('') + '</table>' : '<div class="empty">Hələ tapşırıq yoxdur.</div>';
        A.applyIcons($('dAs'));
        $('dAs').querySelectorAll('[data-aid]').forEach(function (r) { r.onclick = function () { openDash({ view: 'assignment', aid: r.dataset.aid, cid: cid }); }; });
      }, fail);
    }, fail);
  }
  function dashAssignment(aid) {
    Promise.all([cloud.getAssignment(aid), cloud.submissionsForAssignment(aid), cloud.classMembers(dashState.cid || '')]).then(function (r) {
      var a = r[0], subs = r[1].sort(function (x, y) { return y.göndərilib - x.göndərilib; }), mem = r[2] || [];
      var pending = mem.filter(function (m) { return !subs.some(function (s) { return s.studentId === m.uid; }); });
      A.showDash(dashHeader(esc(a.başlıq), 'Sinif', '<button class="btn sm danger" id="dDelA">Tapşırığı sil</button>') +
        '<div class="dash-b"><div class="row" style="flex-wrap:wrap;margin-bottom:12px">' + (a.ciddi ? '<span class="pill warn">' + icon('shield') + 'Ciddi rejim</span>' : '') +
        (a.son ? '<span class="pill">' + icon('clock') + 'Son: ' + fmtDate(a.son) + '</span>' : '') + '<span class="pill">' + (a.testlər || []).length + ' test</span>' +
        '<span class="pill">' + subs.length + ' göndəriş</span>' + (pending.length ? '<span class="pill">' + pending.length + ' gözlənilir</span>' : '') + '</div>' +
        '<div class="card" style="margin-bottom:16px"><div style="white-space:pre-wrap">' + esc(a.təsvir || '') + '</div></div>' +
        subsTable(subs, false) +
        (pending.length ? '<p class="muted" style="margin-top:12px">Göndərməyənlər: ' + pending.map(function (m) { return esc(m.ad); }).join(', ') + '</p>' : '') + '</div>');
      bindHeader(function () { openDash({ view: 'class', cid: a.classId }); });
      bindSubRows($('dashv'), subs);
      $('dDelA').onclick = function () {
        if ($('dDelA').dataset.sure !== '1') { $('dDelA').dataset.sure = '1'; $('dDelA').textContent = 'Əminsən? Yenidən bas'; return; }
        cloud.deleteAssignment(aid).then(function () { toast('Tapşırıq silindi'); openDash({ view: 'class', cid: a.classId }); }, fail);
      };
    }, fail);
  }
  function subsTable(subs, showTask) {
    if (!subs.length) return '<div class="empty">Hələ göndəriş yoxdur.</div>';
    return '<table class="t"><tr><th>Şagird</th>' + (showTask ? '<th>Tapşırıq</th>' : '') + '<th>Testlər</th><th>Ciddi rejim</th><th>Vaxt</th><th>Göndərilib</th></tr>' + subs.map(function (s) {
      var n = s.nəticə || {}, sig = s.siqnallar || {};
      var res = n.cəmi ? '<span class="pill ' + (n.ok ? 'ok' : 'bad') + '">' + n.keçən + '/' + n.cəmi + '</span>' : '<span class="pill">testsiz</span>';
      var integ = !s.ciddi ? '<span class="muted">—</span>' : s.şübhəli ? '<span class="pill warn">' + icon('flag') + 'Şübhəli</span>' : '<span class="pill ok">Təmiz</span>';
      return '<tr class="click" data-sid="' + esc(s.id) + '"><td>' + (s.oxundu ? '' : '<span class="dotk" style="display:inline-block;background:var(--accent);margin-right:6px"></span>') + '<b>' + esc(s.studentName) + '</b></td>' +
        (showTask ? '<td>' + esc(s.başlıq) + '</td>' : '') + '<td>' + res + '</td><td>' + integ + '</td><td class="muted">' + fmtDur(sig.aktivMs) + '</td><td class="muted">' + fmtDate(s.göndərilib) + (s.gecikib ? ' <span class="pill bad">gecikib</span>' : '') + '</td></tr>';
    }).join('') + '</table>';
  }
  function bindSubRows(root, list) {
    A.applyIcons(root);
    root.querySelectorAll('tr[data-sid]').forEach(function (r) { r.onclick = function () { var s = list.filter(function (x) { return x.id === r.dataset.sid; })[0]; if (s) openSubmission(s); }; });
  }

  // Göndərişə baxış + təkrar oynatma
  function openSubmission(s) {
    if (!user || user.rol !== 'muellim') return;
    if (!s.oxundu) { cloud.updateSubmission(s.id, { oxundu: true }).catch(function () {}); s.oxundu = true; updateBadges(); }
    dashState = { view: 'submission', sid: s.id, cid: s.classId, aid: s.aid };
    if (A.curPane() !== 'sinif') A.showPane('sinif');
    var n = s.nəticə || {}, sig = s.siqnallar || {}, ops = [];
    try { ops = s.opsJson ? JSON.parse(s.opsJson) : []; } catch (e) {}
    var h = dashHeader(esc(s.studentName) + ' — ' + esc(s.başlıq), 'Tapşırıq');
    h += '<div class="dash-b"><div class="grid2"><div>';
    h += '<div class="row" style="margin-bottom:8px"><b>Göndərilən kod</b><div class="spacer"></div><button class="btn sm" id="sRun" data-icon="play">Redaktorda aç</button></div>';
    h += '<pre class="codebig" id="sCode">' + A.highlightCode(s.kod || '') + '</pre>';
    if (s.ciddi && ops.length) {
      h += '<h3 style="margin:18px 0 6px;font-size:14px">Yazılışın təkrarı</h3><div class="muted" style="font-size:12px">Şagirdin kodu necə yazdığını addım-addım izlə. Narıncı nişan — yapışdırılan hissə.</div>' +
        '<div class="replay"><button class="btn sm" id="rPlay" data-icon="play">Oynat</button><input type="range" id="rSlider" min="0" max="' + ops.length + '" value="' + ops.length + '"><span class="mono muted" id="rTime" style="font-size:12px;min-width:90px"></span></div>' +
        '<pre class="codebig" id="rView"></pre>';
    }
    h += '</div><div>';
    h += '<div class="card" style="margin-bottom:12px"><h3>Nəticə</h3>' + (n.cəmi ? '<div class="stat" style="color:' + (n.ok ? 'var(--ok)' : 'var(--bad)') + '">' + n.keçən + ' / ' + n.cəmi + ' test</div>' : '<div class="muted">Bu tapşırıqda avtomatik test yoxdur.</div>') +
      (n.testlər || []).map(function (t, i) { return '<div class="tr ' + (t.ok ? 'ok' : 'bad') + '"><div><b>Test ' + (i + 1) + '</b>' + (t.ok ? ' <small>· keçdi</small>' : '<pre>' + esc(t.xəta || ('Nəticə: ' + (t.alınan || '(heç nə)'))) + '</pre>') + '</div></div>'; }).join('') +
      '<div class="muted" style="font-size:12px;margin-top:8px">' + fmtDate(s.göndərilib) + ' · ' + (s.cəhd || 1) + '-ci cəhd' + (s.gecikib ? ' · gecikib' : '') + '</div></div>';
    if (s.ciddi) {
      h += '<div class="card" style="margin-bottom:12px"><h3>Ciddi rejim siqnalları</h3>' +
        (s.şübhəli ? '<div class="notice warn" style="margin-top:6px"><b>Diqqət tələb edir:</b><br>' + (s.səbəblər || []).map(esc).join('<br>') + '</div>' : '<div class="notice" style="margin-top:6px">Şübhəli siqnal yoxdur.</div>') +
        '<table class="t" style="margin-top:8px"><tr><td>Aktiv işləmə vaxtı</td><td>' + fmtDur(sig.aktivMs) + '</td></tr><tr><td>Səhifədən çıxma</td><td>' + (sig.çıxış || 0) + ' dəfə, ' + fmtDur(sig.çıxışMs) + '</td></tr>' +
        '<tr><td>Yapışdırma</td><td>' + (sig.yapışdırmaSayı || 0) + ' dəfə, ' + (sig.yapışdırılan || 0) + ' simvol</td></tr><tr><td>Düymə basma</td><td>' + (sig.düymə || 0) + '</td></tr>' +
        '<tr><td>Tapşırığı açma sayı</td><td>' + (sig.açılış || 1) + '</td></tr></table>' +
        '<p class="muted" style="font-size:12px;margin:8px 0 0">Siqnallar sübut deyil, yalnız diqqət üçündür. Qərarı şagirdlə danışdıqdan sonra ver.</p></div>';
    }
    h += '<div class="card"><h3>Qiymət və şərh</h3><div class="field"><label>Qiymət</label><input class="inp" id="gVal" maxlength="10" value="' + esc(s.qiymət == null ? '' : s.qiymət) + '" placeholder="məs. 5 və ya 95"></div>' +
      '<div class="field"><label>Şərh (şagird görəcək)</label><textarea class="inp" id="gCom" rows="3" maxlength="500">' + esc(s.şərh || '') + '</textarea></div>' +
      '<div class="row"><div class="spacer"></div><button class="btn primary" id="gSave">Yadda saxla</button></div></div>';
    h += '</div></div></div>';
    A.showDash(h);
    bindHeader(function () { openDash({ view: 'assignment', aid: s.aid, cid: s.classId }); });
    $('sRun').onclick = function () {
      A.hideDash(); dashState = null;
      A.setContext({ type: 'review', title: s.studentName + ' — ' + s.başlıq + ' (yalnız oxumaq)', crumb: 'Baxış', mode: 'Göndərişə baxış', icon: 'eye', readOnly: true,
        tools: [{ label: 'Panelə qayıt', icon: 'back', onClick: function () { openSubmission(s); } }] }, s.kod || '');
      A.runProgram();
    };
    $('gSave').onclick = function () {
      var f = { qiymət: $('gVal').value.trim(), şərh: $('gCom').value.trim() };
      cloud.updateSubmission(s.id, f).then(function () { s.qiymət = f.qiymət; s.şərh = f.şərh; toast('Qiymət yadda saxlandı'); }, fail);
    };
    if ($('rSlider')) {
      var sl = $('rSlider'), view = $('rView'), timer = null;
      var draw = function () {
        var i = +sl.value, txt = OdCloud.replayAt(s.başlanğıc || '', ops, i), op = ops[Math.max(0, i - 1)];
        view.innerHTML = A.highlightCode(txt) + (op && op[4] === 'p' ? '\n\n<span class="pill warn">yapışdırma: ' + (op[3] || '').length + ' simvol</span>' : '');
        var t = op ? op[0] : 0; $('rTime').textContent = i + '/' + ops.length + ' · ' + fmtDur(t);
      };
      sl.oninput = draw; draw();
      $('rPlay').onclick = function () {
        if (timer) { clearInterval(timer); timer = null; $('rPlay').lastChild.textContent = 'Oynat'; return; }
        if (+sl.value >= ops.length) sl.value = 0;
        $('rPlay').lastChild.textContent = 'Dayandır';
        timer = setInterval(function () { if (+sl.value >= ops.length || !document.body.contains(sl)) { clearInterval(timer); timer = null; if ($('rPlay')) $('rPlay').lastChild.textContent = 'Oynat'; return; } sl.value = +sl.value + 1; draw(); }, 60);
      };
    }
  }

  // Yeni tapşırıq
  function assignmentModal(c) {
    var box = A.openModal('<div class="row"><h2>Yeni tapşırıq · ' + esc(c.ad) + '</h2><div class="spacer"></div><button class="btn ghost" data-x>Bağla</button></div>' +
      '<div class="grid2" style="margin-top:14px"><div>' +
      '<div class="field"><label>Başlıq</label><input class="inp" id="nT" maxlength="80" placeholder="məs. Cüt ədədlər"></div>' +
      '<div class="field"><label>Təsvir (şagird görəcək)</label><textarea class="inp" id="nD" rows="5" maxlength="2000" placeholder="Tapşırığı izah et..."></textarea></div>' +
      '<div class="field"><label>Başlanğıc kod (istəyə görə)</label><textarea class="inp mono" id="nS" rows="5" spellcheck="false" placeholder="n = daxil_et(&quot;N:&quot;)"></textarea></div>' +
      '</div><div>' +
      '<div class="field"><label>Avtomatik testlər</label><div class="muted" style="font-size:12px;margin-bottom:6px">Hər test: girdilər (hər sətirdə bir) və gözlənilən nəticə. Boş saxlasan, tapşırığı özün yoxlayacaqsan.</div><div id="nTests"></div>' +
      '<button class="btn sm" id="nAdd" data-icon="plus">Test əlavə et</button></div>' +
      '<div class="field"><label>Son tarix (istəyə görə)</label><input class="inp" id="nDue" type="datetime-local"></div>' +
      '<label class="switch"><span><b>Ciddi rejim</b><br><span class="muted" style="font-size:12px">Yapışdırma, səhifədən çıxma, yazılış vaxtı qeydə alınır; şübhəli göndərişlər sənə bildiriş kimi gəlir.</span></span><input type="checkbox" id="nStrict"></label>' +
      '</div></div><div class="notice warn" id="nErr" style="display:none"></div>' +
      '<div class="row" style="margin-top:12px"><div class="spacer"></div><button class="btn ghost" data-x>Ləğv et</button><button class="btn primary" id="nGo">Tapşırığı ver</button></div>', true);
    box.querySelectorAll('[data-x]').forEach(function (b) { b.onclick = A.closeModal; });
    function addRow(inp, exp) {
      var d = document.createElement('div'); d.className = 'testrow';
      d.innerHTML = '<textarea class="inp mono" rows="2" placeholder="Girdilər">' + esc(inp || '') + '</textarea><textarea class="inp mono" rows="2" placeholder="Gözlənilən nəticə">' + esc(exp || '') + '</textarea><button class="btn sm ghost" title="Sil">✕</button>';
      d.querySelector('button').onclick = function () { d.remove(); };
      $('nTests').appendChild(d);
    }
    addRow();
    $('nAdd').onclick = function () { addRow(); };
    $('nGo').onclick = function () {
      var tests = [];
      $('nTests').querySelectorAll('.testrow').forEach(function (r) {
        var t = r.querySelectorAll('textarea'), inp = t[0].value.replace(/\r/g, ''), exp = t[1].value.replace(/\r/g, '').replace(/\s+$/, '');
        if (!inp.trim() && !exp.trim()) return;
        tests.push({ girdi: inp.trim() ? inp.split('\n') : [], gözlənilən: exp });
      });
      var due = $('nDue').value ? new Date($('nDue').value).getTime() : null;
      var data = { classId: c.id, başlıq: $('nT').value.trim(), təsvir: $('nD').value, başlanğıc: $('nS').value, testlər: tests, son: due, ciddi: $('nStrict').checked };
      cloud.createAssignment(data).then(function () { A.closeModal(); toast('Tapşırıq verildi'); openDash({ view: 'class', cid: c.id }); },
        function (e) { var el = $('nErr'); el.style.display = 'block'; el.textContent = OdCloud.authMsg(e); });
    };
  }

  window.OdClassroom = { render: render, cloud: function () { return cloud; } };
  boot();
})();

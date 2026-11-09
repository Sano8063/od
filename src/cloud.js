// ===== Od Bulud — sinif, tapşırıq və göndərişlər üçün server qatı =====
// İki sürücü eyni interfeysə malikdir:
//   • firebase — əsl server (Firebase Auth + Firestore)
//   • demo     — bütün məlumat bu brauzerdə saxlanılır (təqdimat və test üçün)
(function (root) {
  'use strict';

  function now() { return Date.now(); }
  function randCode() {
    var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
    return s;
  }
  function err(msg) { var e = new Error(msg); e.od = true; return e; }
  function clean(o) { return JSON.parse(JSON.stringify(o)); }

  // Firebase xətalarını Azərbaycan dilinə çevir
  function authMsg(e) {
    var c = (e && e.code) || '';
    var map = {
      'auth/email-already-in-use': 'Bu e-poçt artıq qeydiyyatdan keçib. "Daxil ol" bölməsindən gir.',
      'auth/invalid-email': 'E-poçt ünvanı düzgün deyil.',
      'auth/weak-password': 'Şifrə ən azı 6 simvol olmalıdır.',
      'auth/user-not-found': 'Bu e-poçtla hesab tapılmadı.',
      'auth/wrong-password': 'Şifrə səhvdir.',
      'auth/invalid-credential': 'E-poçt və ya şifrə səhvdir.',
      'auth/too-many-requests': 'Çox cəhd edildi. Bir az sonra yenidən yoxla.',
      'auth/network-request-failed': 'İnternet bağlantısı yoxdur.',
      'permission-denied': 'Bu əməliyyata icazən yoxdur.'
    };
    return map[c] || (e && e.od ? e.message : 'Xəta: ' + ((e && e.message) || e));
  }

  // ===================== DEMO sürücüsü =====================
  function DemoDriver(storage) {
    var KEY = 'od-demo-db';
    var st = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    var mem = null;
    function load() {
      if (mem) return mem;
      var d = null; try { d = JSON.parse(st.getItem(KEY) || 'null'); } catch (e) {}
      mem = d || { users: {}, creds: {}, classes: {}, members: {}, assignments: {}, submissions: {}, session: null, seq: 1 };
      return mem;
    }
    function save() { try { st.setItem(KEY, JSON.stringify(mem)); } catch (e) {} fire(); }
    function id(p) { var d = load(); return p + (d.seq++) + '_' + Math.random().toString(36).slice(2, 6); }
    var authCbs = [], watchers = [];
    function fire() { watchers.forEach(function (w) { try { w(); } catch (e) {} }); }
    if (typeof window !== 'undefined') window.addEventListener('storage', function (e) { if (e.key === KEY) { mem = null; fire(); emitAuth(); } });
    function me() { var d = load(); return d.session ? d.users[d.session] || null : null; }
    function emitAuth() { var u = me(); authCbs.forEach(function (cb) { cb(u); }); }
    function need(role) {
      var u = me(); if (!u) throw err('Əvvəlcə daxil ol.');
      if (role && u.rol !== role) throw err(role === 'muellim' ? 'Bu əməliyyat yalnız müəllim üçündür.' : 'Bu əməliyyat yalnız şagird üçündür.');
      return u;
    }
    var P = function (fn) { return new Promise(function (res) { res(fn()); }); };

    return {
      mode: 'demo',
      init: function () { return Promise.resolve(); },
      onAuth: function (cb) { authCbs.push(cb); setTimeout(function () { cb(me()); }, 0); },
      user: me,
      signUp: function (email, pass, ad, rol) {
        return P(function () {
          var d = load(); email = String(email).trim().toLowerCase();
          if (!/^\S+@\S+\.\S+$/.test(email)) throw err('E-poçt ünvanı düzgün deyil.');
          if (String(pass).length < 6) throw err('Şifrə ən azı 6 simvol olmalıdır.');
          if (!String(ad).trim()) throw err('Adını yaz.');
          if (rol !== 'muellim' && rol !== 'sagird') throw err('Rolu seç.');
          if (d.creds[email]) throw err('Bu e-poçt artıq qeydiyyatdan keçib. "Daxil ol" bölməsindən gir.');
          var uid = id('u');
          d.creds[email] = { uid: uid, pass: pass };
          d.users[uid] = { uid: uid, email: email, ad: String(ad).trim(), rol: rol, siniflər: [], yaradılıb: now() };
          d.session = uid; save(); emitAuth(); return d.users[uid];
        });
      },
      signIn: function (email, pass) {
        return P(function () {
          var d = load(), c = d.creds[String(email).trim().toLowerCase()];
          if (!c || c.pass !== pass) throw err('E-poçt və ya şifrə səhvdir.');
          d.session = c.uid; save(); emitAuth(); return d.users[c.uid];
        });
      },
      signOut: function () { return P(function () { load().session = null; save(); emitAuth(); }); },

      createClass: function (ad) {
        return P(function () {
          var u = need('muellim'), d = load();
          if (!String(ad).trim()) throw err('Sinfin adını yaz.');
          var cid = id('c'), c = { id: cid, ad: String(ad).trim(), teacherId: u.uid, teacherName: u.ad, kod: randCode(), yaradılıb: now() };
          d.classes[cid] = c; save(); return c;
        });
      },
      joinClass: function (kod) {
        return P(function () {
          var u = need('sagird'), d = load(); kod = String(kod).trim().toUpperCase();
          var c = Object.keys(d.classes).map(function (k) { return d.classes[k]; }).filter(function (x) { return x.kod === kod; })[0];
          if (!c) throw err('Bu kodla sinif tapılmadı. Kodu müəllimindən yenidən soruş.');
          d.members[c.id] = d.members[c.id] || {};
          d.members[c.id][u.uid] = { uid: u.uid, ad: u.ad, qoşulub: now() };
          if (u.siniflər.indexOf(c.id) < 0) u.siniflər.push(c.id);
          save(); return c;
        });
      },
      myClasses: function () {
        return P(function () {
          var u = need(), d = load();
          var list = Object.keys(d.classes).map(function (k) { return d.classes[k]; });
          return clean(list.filter(function (c) { return u.rol === 'muellim' ? c.teacherId === u.uid : u.siniflər.indexOf(c.id) >= 0; })
            .sort(function (a, b) { return b.yaradılıb - a.yaradılıb; }));
        });
      },
      classMembers: function (cid) {
        return P(function () { need(); var m = load().members[cid] || {}; return clean(Object.keys(m).map(function (k) { return m[k]; })); });
      },
      createAssignment: function (data) {
        return P(function () {
          var u = need('muellim'), d = load(), c = d.classes[data.classId];
          if (!c || c.teacherId !== u.uid) throw err('Sinif tapılmadı.');
          if (!String(data.başlıq || '').trim()) throw err('Tapşırığın adını yaz.');
          var aid = id('a');
          d.assignments[aid] = Object.assign(clean(data), { id: aid, teacherId: u.uid, yaradılıb: now() });
          save(); return d.assignments[aid];
        });
      },
      deleteAssignment: function (aid) {
        return P(function () { var u = need('muellim'), d = load(); if (d.assignments[aid] && d.assignments[aid].teacherId === u.uid) delete d.assignments[aid]; save(); });
      },
      assignmentsForClass: function (cid) {
        return P(function () {
          need(); var d = load();
          return clean(Object.keys(d.assignments).map(function (k) { return d.assignments[k]; })
            .filter(function (a) { return a.classId === cid; }).sort(function (a, b) { return b.yaradılıb - a.yaradılıb; }));
        });
      },
      getAssignment: function (aid) { return P(function () { need(); var a = load().assignments[aid]; if (!a) throw err('Tapşırıq tapılmadı.'); return clean(a); }); },
      submit: function (aid, payload) {
        return P(function () {
          var u = need('sagird'), d = load(), a = d.assignments[aid];
          if (!a) throw err('Tapşırıq tapılmadı.');
          if (u.siniflər.indexOf(a.classId) < 0) throw err('Bu sinfin üzvü deyilsən.');
          var sid = aid + '_' + u.uid, prev = d.submissions[sid];
          d.submissions[sid] = Object.assign(clean(payload), {
            id: sid, aid: aid, classId: a.classId, teacherId: a.teacherId, başlıq: a.başlıq,
            studentId: u.uid, studentName: u.ad, göndərilib: now(), oxundu: false, cəhd: (prev ? prev.cəhd || 1 : 0) + 1,
            qiymət: prev ? prev.qiymət || null : null, şərh: prev ? prev.şərh || '' : ''
          });
          save(); return d.submissions[sid];
        });
      },
      mySubmission: function (aid) { return P(function () { var u = need(); var s = load().submissions[aid + '_' + u.uid]; return s ? clean(s) : null; }); },
      mySubmissions: function () {
        return P(function () { var u = need(), d = load(); return clean(Object.keys(d.submissions).map(function (k) { return d.submissions[k]; }).filter(function (s) { return s.studentId === u.uid; })); });
      },
      submissionsForAssignment: function (aid) {
        return P(function () {
          var u = need('muellim'), d = load();
          return clean(Object.keys(d.submissions).map(function (k) { return d.submissions[k]; }).filter(function (s) { return s.aid === aid && s.teacherId === u.uid; }));
        });
      },
      watchInbox: function (cb) {
        function run() {
          var u = me(); if (!u || u.rol !== 'muellim') { cb([]); return; }
          var d = load();
          cb(clean(Object.keys(d.submissions).map(function (k) { return d.submissions[k]; }).filter(function (s) { return s.teacherId === u.uid; })
            .sort(function (a, b) { return b.göndərilib - a.göndərilib; })));
        }
        watchers.push(run); run();
        return function () { watchers = watchers.filter(function (w) { return w !== run; }); };
      },
      updateSubmission: function (sid, fields) {
        return P(function () {
          var u = need('muellim'), d = load(), s = d.submissions[sid];
          if (!s || s.teacherId !== u.uid) throw err('Göndəriş tapılmadı.');
          ['oxundu', 'qiymət', 'şərh'].forEach(function (k) { if (k in fields) s[k] = fields[k]; });
          save();
        });
      },
      _reset: function () { mem = null; try { st.removeItem(KEY); } catch (e) {} }
    };
  }

  // ===================== FIREBASE sürücüsü =====================
  function FirebaseDriver(config) {
    var fb, auth, db, profile = null, authCbs = [], ready = null;
    var V = '10.14.1', BASE = 'https://cdn.jsdelivr.net/npm/firebase@' + V + '/';
    function loadScript(src) {
      return new Promise(function (res, rej) {
        var s = document.createElement('script'); s.src = src; s.onload = res;
        s.onerror = function () { rej(err('Firebase yüklənmədi (' + src.split('/').pop() + ').')); };
        document.head.appendChild(s);
      });
    }
    function need(role) {
      if (!profile) throw err('Əvvəlcə daxil ol.');
      if (role && profile.rol !== role) throw err(role === 'muellim' ? 'Bu əməliyyat yalnız müəllim üçündür.' : 'Bu əməliyyat yalnız şagird üçündür.');
      return profile;
    }
    function docs(q) { return q.get().then(function (s) { return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }); }); }
    function wrap(p) { return p.catch(function (e) { throw err(authMsg(e)); }); }
    function emit() { authCbs.forEach(function (cb) { cb(profile); }); }
    function aCol(cid) { return db.collection('classes').doc(cid).collection('assignments'); }
    function splitA(aid) { var i = String(aid).indexOf('~'); if (i < 0) throw err('Tapşırıq tapılmadı.'); return [aid.slice(0, i), aid.slice(i + 1)]; }

    return {
      mode: 'firebase',
      init: function () {
        if (ready) return ready;
        ready = loadScript(BASE + 'firebase-app-compat.js')
          .then(function () { return Promise.all([loadScript(BASE + 'firebase-auth-compat.js'), loadScript(BASE + 'firebase-firestore-compat.js')]); })
          .then(function () {
            fb = root.firebase; fb.initializeApp(config);
            auth = fb.auth(); db = fb.firestore();
            return new Promise(function (res) {
              auth.onAuthStateChanged(function (u) {
                if (!u) { profile = null; emit(); res(); return; }
                db.collection('users').doc(u.uid).get().then(function (d) {
                  profile = d.exists ? Object.assign({ uid: u.uid }, d.data()) : null; emit(); res();
                }, function () { profile = null; emit(); res(); });
              });
            });
          });
        return ready;
      },
      onAuth: function (cb) { authCbs.push(cb); if (ready) cb(profile); },
      user: function () { return profile; },
      signUp: function (email, pass, ad, rol) {
        if (!String(ad).trim()) return Promise.reject(err('Adını yaz.'));
        if (rol !== 'muellim' && rol !== 'sagird') return Promise.reject(err('Rolu seç.'));
        return wrap(auth.createUserWithEmailAndPassword(String(email).trim(), pass).then(function (cred) {
          var p = { email: String(email).trim().toLowerCase(), ad: String(ad).trim(), rol: rol, siniflər: [], yaradılıb: now() };
          return db.collection('users').doc(cred.user.uid).set(p).then(function () { profile = Object.assign({ uid: cred.user.uid }, p); emit(); return profile; });
        }));
      },
      signIn: function (email, pass) {
        return wrap(auth.signInWithEmailAndPassword(String(email).trim(), pass).then(function (cred) {
          return db.collection('users').doc(cred.user.uid).get().then(function (d) {
            if (!d.exists) throw err('Profil tapılmadı.');
            profile = Object.assign({ uid: cred.user.uid }, d.data()); emit(); return profile;
          });
        }));
      },
      signOut: function () { return auth.signOut().then(function () { profile = null; emit(); }); },

      createClass: function (ad) {
        var u; try { u = need('muellim'); } catch (e) { return Promise.reject(e); }
        if (!String(ad).trim()) return Promise.reject(err('Sinfin adını yaz.'));
        var c = { ad: String(ad).trim(), teacherId: u.uid, teacherName: u.ad, kod: randCode(), yaradılıb: now() };
        var ref = db.collection('classes').doc();
        var batch = db.batch();
        batch.set(ref, c);
        batch.set(db.collection('codes').doc(c.kod), { classId: ref.id, teacherId: u.uid });
        return wrap(batch.commit().then(function () { return Object.assign({ id: ref.id }, c); }));
      },
      joinClass: function (kod) {
        var u; try { u = need('sagird'); } catch (e) { return Promise.reject(e); }
        kod = String(kod).trim().toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(kod)) return Promise.reject(err('Kod 6 simvoldan ibarət olmalıdır.'));
        return wrap(db.collection('codes').doc(kod).get().then(function (cd) {
          if (!cd.exists) throw err('Bu kodla sinif tapılmadı. Kodu müəllimindən yenidən soruş.');
          var cid = cd.data().classId;
          return db.collection('classes').doc(cid).collection('members').doc(u.uid).set({ uid: u.uid, ad: u.ad, qoşulub: now(), kod: kod })
            .then(function () { return db.collection('users').doc(u.uid).update({ siniflər: fb.firestore.FieldValue.arrayUnion(cid) }); })
            .then(function () { if (profile.siniflər.indexOf(cid) < 0) profile.siniflər.push(cid); return db.collection('classes').doc(cid).get(); })
            .then(function (d) { return Object.assign({ id: d.id }, d.data()); });
        }));
      },
      myClasses: function () {
        var u; try { u = need(); } catch (e) { return Promise.reject(e); }
        if (u.rol === 'muellim') return wrap(docs(db.collection('classes').where('teacherId', '==', u.uid)).then(function (l) { return l.sort(function (a, b) { return b.yaradılıb - a.yaradılıb; }); }));
        return wrap(Promise.all((u.siniflər || []).map(function (cid) {
          return db.collection('classes').doc(cid).get().then(function (d) { return d.exists ? Object.assign({ id: d.id }, d.data()) : null; });
        })).then(function (l) { return l.filter(Boolean); }));
      },
      classMembers: function (cid) { return wrap(docs(db.collection('classes').doc(cid).collection('members'))); },
      createAssignment: function (data) {
        var u; try { u = need('muellim'); } catch (e) { return Promise.reject(e); }
        if (!String(data.başlıq || '').trim()) return Promise.reject(err('Tapşırığın adını yaz.'));
        var a = Object.assign(clean(data), { teacherId: u.uid, yaradılıb: now() });
        return wrap(aCol(data.classId).add(a).then(function (r) { return Object.assign({ id: data.classId + '~' + r.id }, a); }));
      },
      deleteAssignment: function (aid) { var p = splitA(aid); return wrap(aCol(p[0]).doc(p[1]).delete()); },
      assignmentsForClass: function (cid) {
        return wrap(aCol(cid).get().then(function (s) {
          return s.docs.map(function (d) { return Object.assign({}, d.data(), { id: cid + '~' + d.id }); }).sort(function (a, b) { return b.yaradılıb - a.yaradılıb; });
        }));
      },
      getAssignment: function (aid) {
        var p = splitA(aid);
        return wrap(aCol(p[0]).doc(p[1]).get().then(function (d) { if (!d.exists) throw err('Tapşırıq tapılmadı.'); return Object.assign({}, d.data(), { id: aid }); }));
      },
      submit: function (aid, payload) {
        var u; try { u = need('sagird'); } catch (e) { return Promise.reject(e); }
        var sid = aid + '_' + u.uid, ref = db.collection('submissions').doc(sid), parts = splitA(aid);
        return wrap(Promise.all([aCol(parts[0]).doc(parts[1]).get(), ref.get().catch(function () { return null; })]).then(function (r) {
          var a = r[0]; if (!a.exists) throw err('Tapşırıq tapılmadı.');
          var ad = a.data(), prev = r[1] && r[1].exists ? r[1].data() : null;
          var s = Object.assign(clean(payload), {
            aid: aid, aDoc: parts[1], classId: parts[0], teacherId: ad.teacherId, başlıq: ad.başlıq,
            studentId: u.uid, studentName: u.ad, göndərilib: now(), oxundu: false, cəhd: (prev ? prev.cəhd || 1 : 0) + 1,
            qiymət: prev ? (prev.qiymət === undefined ? null : prev.qiymət) : null, şərh: prev ? (prev.şərh === undefined ? '' : prev.şərh) : ''
          });
          return ref.set(s).then(function () { return Object.assign({ id: sid }, s); });
        }));
      },
      mySubmission: function (aid) {
        var u; try { u = need(); } catch (e) { return Promise.reject(e); }
        return db.collection('submissions').doc(aid + '_' + u.uid).get().then(function (d) { return d.exists ? Object.assign({ id: d.id }, d.data()) : null; }, function () { return null; });
      },
      mySubmissions: function () {
        var u; try { u = need(); } catch (e) { return Promise.reject(e); }
        return wrap(docs(db.collection('submissions').where('studentId', '==', u.uid)));
      },
      submissionsForAssignment: function (aid) {
        var u; try { u = need('muellim'); } catch (e) { return Promise.reject(e); }
        return wrap(docs(db.collection('submissions').where('teacherId', '==', u.uid).where('aid', '==', aid)));
      },
      watchInbox: function (cb) {
        if (!profile || profile.rol !== 'muellim') { cb([]); return function () {}; }
        return db.collection('submissions').where('teacherId', '==', profile.uid).onSnapshot(function (s) {
          cb(s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }).sort(function (a, b) { return b.göndərilib - a.göndərilib; }));
        }, function () { cb([]); });
      },
      updateSubmission: function (sid, fields) {
        var f = {}; ['oxundu', 'qiymət', 'şərh'].forEach(function (k) { if (k in fields) f[k] = fields[k]; });
        return wrap(db.collection('submissions').doc(sid).update(f));
      }
    };
  }

  // ===================== Seçim =====================
  function create(opts) {
    opts = opts || {};
    var cfg = opts.config || (typeof root.OD_FIREBASE_CONFIG !== 'undefined' ? root.OD_FIREBASE_CONFIG : null);
    var forceDemo = opts.demo || (typeof localStorage !== 'undefined' && localStorage.getItem('od-bulud-demo') === '1');
    var hosts = typeof root.OD_FIREBASE_HOSTS !== 'undefined' ? root.OD_FIREBASE_HOSTS : null;
    if (!opts.config && hosts && typeof location !== 'undefined' && hosts.indexOf(location.hostname) < 0) forceDemo = true;
    if (cfg && cfg.apiKey && !forceDemo) return FirebaseDriver(cfg);
    return DemoDriver(opts.storage);
  }

  // ===================== Ciddi rejim: siqnalların qiymətləndirilməsi =====================
  function evaluateIntegrity(sig, starterLen, finalLen) {
    var reasons = [];
    var added = Math.max(0, finalLen - (starterLen || 0));
    if (sig.yapışdırılan >= 40 || (added > 20 && sig.yapışdırılan > added * 0.3))
      reasons.push('Kod yapışdırılıb: ' + sig.yapışdırılan + ' simvol (' + sig.yapışdırma.length + ' dəfə)');
    if (sig.çıxış >= 3 || sig.çıxışMs >= 60000)
      reasons.push('Səhifədən ' + sig.çıxış + ' dəfə çıxıb (cəmi ' + Math.round(sig.çıxışMs / 1000) + ' san)');
    if (added > 60 && sig.düymə < added * 0.5)
      reasons.push('Kodun çox hissəsi klaviaturada yazılmadan əlavə olunub (' + sig.düymə + ' düymə, ' + added + ' yeni simvol)');
    if (added > 150 && sig.aktivMs < 20000)
      reasons.push('Çox qısa vaxtda çox kod: ' + Math.round(sig.aktivMs / 1000) + ' saniyədə ' + added + ' simvol');
    return { şübhəli: reasons.length > 0, səbəblər: reasons };
  }

  // Yazılışın təkrar oynadılması: əməliyyatları ardıcıl tətbiq et
  function replayAt(starter, ops, uptoIndex) {
    var s = starter || '';
    for (var i = 0; i < Math.min(ops.length, uptoIndex); i++) {
      var o = ops[i]; // [vaxt, mövqe, silinən, əlavə]
      s = s.slice(0, o[1]) + (o[3] || '') + s.slice(o[1] + o[2]);
    }
    return s;
  }
  function diffOp(prev, next, t) {
    if (prev === next) return null;
    var a = 0, pl = prev.length, nl = next.length;
    while (a < pl && a < nl && prev[a] === next[a]) a++;
    var b = 0;
    while (b < pl - a && b < nl - a && prev[pl - 1 - b] === next[nl - 1 - b]) b++;
    return [t, a, pl - a - b, next.slice(a, nl - b)];
  }

  root.OdCloud = { create: create, DemoDriver: DemoDriver, FirebaseDriver: FirebaseDriver, evaluateIntegrity: evaluateIntegrity, replayAt: replayAt, diffOp: diffOp, authMsg: authMsg };
  if (typeof module !== 'undefined') module.exports = root.OdCloud;
})(typeof window !== 'undefined' ? window : globalThis);

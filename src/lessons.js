// ===== OD DƏRSLİK — 10 dərslik interaktiv kurs və avtomatik yoxlayıcı =====
var OD_LESSONS = [
  {
    id: 'd1', ad: 'Salam, dünya!', mövzu: 'göstər',
    izah: '<p>Proqramlaşdırmada ilk addım ekrana nəsə yazmaqdır. Bunun üçün <code>göstər()</code> əmrindən istifadə edirik.</p>' +
          '<p>Mətni həmişə <b>dırnaq</b> içində yazırıq: <code>"belə"</code>. Dırnaq kompüterə deyir: <i>"bu, əmr deyil, sadəcə mətndir"</i>.</p>',
    nümunə: 'göstər("Salam, dünya!")\ngöstər("Mən proqramçıyam 😎")',
    tapşırıq: 'Ekrana dəqiq bu mətni yaz: <code>Salam, Od!</code>',
    başlanğıc: '# Kodunu bura yaz\n',
    testlər: [{ gözlənilən: 'Salam, Od!' }],
    ipucu: 'göstər("...") yaz və dırnaqların içinə Salam, Od! qoy. Vergül və nida işarəsini unutma.',
    cavab: 'göstər("Salam, Od!")'
  },
  {
    id: 'd2', ad: 'Dəyişənlər', mövzu: 'ad = dəyər',
    izah: '<p><b>Dəyişən</b> — dəyəri yadda saxlayan "qutu"dur. Qutuya ad veririk və içinə nəsə qoyuruq:</p>' +
          '<p><code>yaş = 12</code> — "yaş" adlı qutuya 12 qoyduq.</p>' +
          '<p><code>göstər()</code> bir neçə şeyi vergüllə ayırıb göstərə bilər: aralarına özü boşluq qoyur.</p>',
    nümunə: 'ad = "Aysel"\nyaş = 12\ngöstər(ad, yaş, "yaşındadır")\nyaş = yaş + 1\ngöstər("Gələn il:", yaş)',
    tapşırıq: 'Səbətdə 7 alma və 5 armud var. Dəyişənlərdən istifadə edərək ekrana <code>Cəmi: 12</code> yaz. Rəqəmi əllə yazma, <code>alma + armud</code> ilə hesabla!',
    başlanğıc: 'alma = 7\narmud = 5\n# Cəmi göstər\n',
    testlər: [{ gözlənilən: 'Cəmi: 12', tələb: 'alma\\s*\\+\\s*armud|armud\\s*\\+\\s*alma' }],
    ipucu: 'göstər("Cəmi:", alma + armud)',
    cavab: 'alma = 7\narmud = 5\ngöstər("Cəmi:", alma + armud)'
  },
  {
    id: 'd3', ad: 'Riyaziyyat', mövzu: '+ − * / % **',
    izah: '<p>Kompüter ən sürətli kalkulyatordur:</p>' +
          '<p><code>+</code> topla · <code>-</code> çıx · <code>*</code> vur · <code>/</code> böl · <code>%</code> bölmədən qalıq · <code>**</code> qüvvət</p>' +
          '<p>Mötərizələr riyaziyyatdakı kimi işləyir: <code>(2 + 3) * 4</code> = 20.</p>',
    nümunə: 'göstər(12 + 8)\ngöstər(7 * 6)\ngöstər(17 % 5)\ngöstər(2 ** 10)\ngöstər((2 + 3) * 4)',
    tapşırıq: 'Bir dəqiqədə 60 saniyə, bir saatda 60 dəqiqə, bir gündə 24 saat var. <b>Bir gündə neçə saniyə var?</b> Kompüterə hesablat və cavabı göstər.',
    başlanğıc: '# Bir gündə neçə saniyə var?\n',
    testlər: [{ gözlənilən: '86400', tələb: '\\*' }],
    ipucu: '24 * 60 * 60',
    cavab: 'göstər(24 * 60 * 60)'
  },
  {
    id: 'd4', ad: 'Sual ver, cavab al', mövzu: 'daxil_et()',
    izah: '<p><code>daxil_et("Sual")</code> istifadəçidən cavab alır. Cavabı dəyişənə yazırıq:</p>' +
          '<p><code>ad = daxil_et("Adın nədir?")</code></p>' +
          '<p>Mətnləri <code>+</code> ilə birləşdirmək olar: <code>"Salam, " + ad</code>. Cavab rəqəmdirsə, Od onu avtomatik ədədə çevirir.</p>',
    nümunə: 'şəhər = daxil_et("Hansı şəhərdə yaşayırsan?")\ngöstər(şəhər + " gözəl şəhərdir!")',
    tapşırıq: 'İstifadəçinin adını soruş və ona salam ver. Məsələn, ad <code>Aysel</code>-dirsə, ekrana <code>Salam, Aysel!</code> yaz.',
    başlanğıc: '# Adı soruş\n',
    testlər: [{ girdi: ['Aysel'], gözlənilən: 'Salam, Aysel!' }, { girdi: ['Murad'], gözlənilən: 'Salam, Murad!' }],
    ipucu: 'ad = daxil_et("Adın?") — sonra göstər("Salam, " + ad + "!")',
    cavab: 'ad = daxil_et("Adın nədir?")\ngöstər("Salam, " + ad + "!")'
  },
  {
    id: 'd5', ad: 'Şərtlər', mövzu: 'əgər · yoxsa',
    izah: '<p>Proqram qərar verə bilir! <code>əgər</code> şərt doğrudursa, içindəki kodu edir.</p>' +
          '<p>Müqayisə: <code>==</code> bərabərdir · <code>!=</code> fərqlidir · <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code></p>' +
          '<p>⚠️ Şərtdən sonra <b>:</b> qoyulur və içəridəki kod <b>4 boşluq</b> sağa çəkilir.</p>',
    nümunə: 'bal = 85\nəgər bal >= 90:\n    göstər("Əla!")\nyoxsa əgər bal >= 70:\n    göstər("Yaxşı")\nyoxsa:\n    göstər("Çalışmaq lazımdır")',
    tapşırıq: 'Bir ədəd daxil et. Ədəd 0-dan böyükdürsə <code>müsbət</code>, kiçikdirsə <code>mənfi</code>, 0-dırsa <code>sıfır</code> yaz.',
    başlanğıc: 'ədəd_ = daxil_et("Ədəd:")\n',
    testlər: [{ girdi: ['5'], gözlənilən: 'müsbət' }, { girdi: ['-3'], gözlənilən: 'mənfi' }, { girdi: ['0'], gözlənilən: 'sıfır' }],
    ipucu: 'əgər ədəd_ > 0: ... yoxsa əgər ədəd_ < 0: ... yoxsa: ...',
    cavab: 'ədəd_ = daxil_et("Ədəd:")\nəgər ədəd_ > 0:\n    göstər("müsbət")\nyoxsa əgər ədəd_ < 0:\n    göstər("mənfi")\nyoxsa:\n    göstər("sıfır")'
  },
  {
    id: 'd6', ad: 'Dövrlər', mövzu: 'təkrarla · hər',
    izah: '<p>Eyni işi təkrar-təkrar yazmaq əvəzinə <b>dövr</b> istifadə edirik:</p>' +
          '<p><code>təkrarla 3 dəfə:</code> — içindəkini 3 dəfə edir.</p>' +
          '<p><code>hər i aralıq(1, 5) içində:</code> — <code>i</code> növbə ilə 1, 2, 3, 4, 5 olur.</p>',
    nümunə: 'təkrarla 3 dəfə:\n    göstər("Od 🔥")\n\nhər i aralıq(1, 5) içində:\n    göstər(i, "x 2 =", i * 2)',
    tapşırıq: 'Bir ədəd <code>N</code> daxil et və 1-dən N-ə qədər bütün ədədləri <b>hər birini ayrı sətirdə</b> göstər.',
    başlanğıc: 'n = daxil_et("N:")\n',
    testlər: [{ girdi: ['3'], gözlənilən: '1\n2\n3' }, { girdi: ['5'], gözlənilən: '1\n2\n3\n4\n5' }],
    ipucu: 'hər i aralıq(1, n) içində:\n    göstər(i)',
    cavab: 'n = daxil_et("N:")\nhər i aralıq(1, n) içində:\n    göstər(i)'
  },
  {
    id: 'd7', ad: 'Toplayıcı', mövzu: 'nə qədər ki · +=',
    izah: '<p>Proqramçıların ən çox istifadə etdiyi fənd: <b>toplayıcı dəyişən</b>. Əvvəl <code>cəm = 0</code> edirik, sonra dövrdə hər dəfə üstünə gəlirik: <code>cəm += i</code>.</p>' +
          '<p><code>nə qədər ki şərt:</code> — şərt doğru olduqca təkrarlayır.</p>',
    nümunə: 'i = 1\nnə qədər ki i <= 3:\n    göstər("Addım", i)\n    i += 1\ngöstər("Bitdi!")',
    tapşırıq: '<code>N</code> daxil et və 1-dən N-ə qədər bütün ədədlərin <b>cəmini</b> göstər. Məsələn, N = 10 olsa, cavab 55-dir.',
    başlanğıc: 'n = daxil_et("N:")\ncəm_ = 0\n',
    testlər: [{ girdi: ['10'], gözlənilən: '55' }, { girdi: ['100'], gözlənilən: '5050' }, { girdi: ['1'], gözlənilən: '1' }],
    ipucu: 'hər i aralıq(1, n) içində:\n    cəm_ += i\nsonra dövrdən kənarda göstər(cəm_)',
    cavab: 'n = daxil_et("N:")\ncəm_ = 0\nhər i aralıq(1, n) içində:\n    cəm_ += i\ngöstər(cəm_)'
  },
  {
    id: 'd8', ad: 'Siyahılar', mövzu: '[ ] · .böl()',
    izah: '<p><b>Siyahı</b> çoxlu dəyəri bir yerdə saxlayır: <code>meyvələr = ["alma", "nar"]</code>.</p>' +
          '<p>Elementə nömrə ilə çatırıq, sayma <b>0-dan</b> başlayır: <code>meyvələr[0]</code> → "alma".</p>' +
          '<p><code>"3 8 2".böl(" ")</code> mətni hissələrə bölür, <code>ədəd("8")</code> mətni ədədə çevirir.</p>',
    nümunə: 'qiymətlər = [5, 3, 9]\nqiymətlər.əlavə_et(7)\ngöstər(qiymətlər, "uzunluq:", qiymətlər.uzunluq)\nhər q qiymətlər içində:\n    göstər("•", q)',
    tapşırıq: 'Boşluqla ayrılmış ədədlər daxil edilir (məsələn <code>3 8 2 9</code>). Onların <b>ən böyüyünü</b> tap və göstər. Bu dəfə <code>ən_böyük()</code> istifadə etmədən, dövrlə tap!',
    başlanğıc: 'sətir = daxil_et("Ədədlər:")\nhissələr = sətir.böl(" ")\n',
    testlər: [{ girdi: ['3 8 2 9'], gözlənilən: '9' }, { girdi: ['-5 -2 -9'], gözlənilən: '-2' }, { girdi: ['7 7 1'], gözlənilən: '7' }],
    qadağa: 'ən_böyük|en_boyuk',
    ipucu: 'ən = ədəd(hissələr[0]) — sonra hər h hissələr içində: əgər ədəd(h) > ən: ən = ədəd(h)',
    cavab: 'sətir = daxil_et("Ədədlər:")\nhissələr = sətir.böl(" ")\nən = ədəd(hissələr[0])\nhər h hissələr içində:\n    əgər ədəd(h) > ən:\n        ən = ədəd(h)\ngöstər(ən)'
  },
  {
    id: 'd9', ad: 'Funksiyalar', mövzu: 'funksiya · qaytar',
    izah: '<p><b>Funksiya</b> — öz yaratdığın yeni sözdür. Bir dəfə yazırsan, istədiyin qədər istifadə edirsən.</p>' +
          '<p><code>qaytar</code> nəticəni funksiyanı çağırana geri verir.</p>' +
          '<p>Od-un "hərfləri" ilə öz "sözlərini" belə yaradırsan!</p>',
    nümunə: 'funksiya ikiqat(x):\n    qaytar x * 2\n\ngöstər(ikiqat(5))\ngöstər(ikiqat(21))',
    tapşırıq: '<code>sahə(en, hündürlük)</code> adlı funksiya yaz: düzbucaqlının sahəsini <b>qaytarsın</b>. Yoxlayıcı onu özü çağıracaq, məsələn <code>sahə(3, 4)</code> → 12.',
    başlanğıc: 'funksiya sahə(en, hündürlük):\n    # bura yaz\n',
    testlər: [{ əlavə: 'göstər(sahə(3, 4))\ngöstər(sahə(10, 2))\ngöstər(sahə(7, 7))', gözlənilən: '12\n20\n49' }],
    ipucu: 'Funksiyanın içində: qaytar en * hündürlük',
    cavab: 'funksiya sahə(en, hündürlük):\n    qaytar en * hündürlük'
  },
  {
    id: 'd10', ad: 'Rəsm qələmi', mövzu: 'irəli · sağa',
    izah: '<p>Od-un sehrli qələmi var! <code>irəli(100)</code> qələmi 100 addım irəli aparır, <code>sağa(90)</code> isə 90 dərəcə döndərir.</p>' +
          '<p>Dövrlərlə birləşəndə möcüzələr yaranır: üçbucaq, ulduz, spiral...</p>',
    nümunə: '# Üçbucaq\nrəng("göy")\ntəkrarla 3 dəfə:\n    irəli(120)\n    sağa(120)',
    tapşırıq: 'Qələmlə tərəfi <b>100</b> olan <b>kvadrat</b> çək. Qələm çəkib qurtaranda başladığı yerə qayıtmalıdır. İpucu: dövr istifadə et!',
    başlanğıc: 'rəng("narıncı")\n',
    testlər: [{ növ: 'kvadrat', ölçü: 100 }],
    ipucu: 'təkrarla 4 dəfə:\n    irəli(100)\n    sağa(90)',
    cavab: 'rəng("narıncı")\ntəkrarla 4 dəfə:\n    irəli(100)\n    sağa(90)'
  }
];

// Çıxışı müqayisə üçün təmizlə
function odNormalize(s) {
  return String(s).split('\n').map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').replace(/^\n+|\n+$/g, '');
}

// Bir test üçün kodu səssiz işə sal (ekran, qələm, oyun saxta)
function odRunSilently(code, inputs, timeoutMs) {
  var out = [], path = { x: 0, y: 0, a: -90, pen: true, segs: [] };
  var queue = (inputs || []).slice();
  var turtle = {
    forward: function (d) {
      var r = path.a * Math.PI / 180, nx = path.x + Math.cos(r) * d, ny = path.y + Math.sin(r) * d;
      if (path.pen) path.segs.push({ x1: path.x, y1: path.y, x2: nx, y2: ny, len: Math.abs(d) });
      path.x = nx; path.y = ny; return Promise.resolve();
    },
    turn: function (a) { path.a += a; return Promise.resolve(); },
    circle: function () { return Promise.resolve(); },
    home: function () { path.x = 0; path.y = 0; path.a = -90; return Promise.resolve(); },
    color: function () {}, pen: function (p) { path.pen = p; }, width: function () {}, speed: function () {}, bg: function () {}, text: function () {}
  };
  var frames = 0;
  var game = {
    frame: function () { frames++; return frames > 600 ? Promise.reject(new Od.StopSignal()) : Promise.resolve(); },
    down: function () { return false; }, pressed: function () { return false; }, mouse: function () { return { x: 0, y: 0, clicked: false }; },
    clear: function () {}, rect: function () {}, circle: function () {}, tri: function () {}, line: function () {}, text: function () {}
  };
  var io = {
    print: function (s) { out.push(s); }, clear: function () { out.length = 0; },
    input: function () { return Promise.resolve(queue.length ? queue.shift() : ''); },
    turtle: turtle, game: game
  };
  var r = Od.run(code, io);
  var timer = setTimeout(function () { r.stop(); }, timeoutMs || 2000);
  return r.promise.then(function (res) { clearTimeout(timer); return { res: res, out: out, path: path }; });
}

// Dərsi yoxla: { ok, results: [...], mesaj }
function odCheckLesson(lesson, code) {
  var reqFail = null;
  if (lesson.qadağa && new RegExp(lesson.qadağa, 'i').test(code)) {
    return Promise.resolve({ ok: false, results: [], mesaj: 'Bu tapşırıqda hazır funksiyadan istifadə etmək olmaz — özün dövrlə tap! 💪' });
  }
  var tests = lesson.testlər;
  return tests.reduce(function (p, t, i) {
    return p.then(function (acc) {
      var full = t.əlavə ? code + '\n' + t.əlavə : code;
      return odRunSilently(full, t.girdi).then(function (x) {
        var item = { nömrə: i + 1, girdi: t.girdi, gözlənilən: t.gözlənilən, alınan: odNormalize(x.out.join('\n')), ok: false };
        if (!x.res.ok) {
          item.xəta = x.res.stopped ? 'Proqram çox uzun çəkdi (sonsuz dövr ola bilər).' : (x.res.line ? 'Sətir ' + x.res.line + ': ' : '') + x.res.error;
        } else if (t.növ === 'kvadrat') {
          var segs = x.path.segs, good = segs.filter(function (s) { return Math.abs(s.len - t.ölçü) < 0.5; });
          var back = Math.hypot(x.path.x, x.path.y) < 1;
          item.ok = good.length >= 4 && back;
          item.alınan = segs.length + ' xətt çəkildi' + (back ? ', başlanğıca qayıtdı' : ', başlanğıca qayıtmadı');
          item.gözlənilən = '100 uzunluqlu 4 xətt, başlanğıca qayıtmaq';
        } else {
          var exp = odNormalize(t.gözlənilən), got = item.alınan;
          if (t.əlavə) { var n = exp.split('\n').length; got = got.split('\n').slice(-n).join('\n'); }
          item.ok = got === exp;
          if (item.ok && t.tələb && !new RegExp(t.tələb).test(code)) { item.ok = false; reqFail = 'Cavab düzdür, amma onu əllə yazmısan 🙂 Kompüterə hesablat!'; }
        }
        acc.push(item); return acc;
      });
    });
  }, Promise.resolve([])).then(function (results) {
    var ok = results.every(function (r) { return r.ok; });
    return { ok: ok, results: results, mesaj: ok ? null : reqFail };
  });
}

if (typeof module !== 'undefined') module.exports = { OD_LESSONS: OD_LESSONS, odCheckLesson: odCheckLesson };

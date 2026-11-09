// Od dilinin testləri — işə salmaq üçün: npm test
const test = require('node:test');
const assert = require('node:assert');
require('../src/engine.js');
const EXAMPLES = require('../src/examples.js');

// Ekran, klaviatura və lövhə üçün saxta (test) mühit
function mockIO(opts = {}) {
  const out = [];
  let frames = 0;
  const inputs = opts.inputs || [];
  const game = {
    frame: async () => { if (++frames > (opts.maxFrames || 3000)) throw new Od.StopSignal(); },
    down: () => Math.random() < 0.3, pressed: () => Math.random() < 0.1,
    mouse: () => ({ x: 0, y: 0, clicked: false }),
    clear() {}, rect() {}, circle() {}, tri() {}, line() {}, text() {}
  };
  const turtle = {
    forward: async () => {}, turn: async () => {}, circle: async () => {}, home: async () => {},
    color() {}, pen() {}, width() {}, speed() {}, bg() {}, text() {}
  };
  return { out, io: { print: s => out.push(s), clear: () => { out.length = 0; }, input: async () => inputs.shift() ?? '', turtle, game } };
}

async function run(code, opts) {
  const m = mockIO(opts);
  const res = await Od.run(code, m.io).promise;
  return { res, out: m.out };
}

test('bütün nümunələr xətasız işləyir', async () => {
  for (const ex of EXAMPLES) {
    const inputs = ex.id === 'oyun' ? Array.from({ length: 100 }, (_, i) => String(i + 1)) : [];
    const { res } = await run(ex.kod, { inputs });
    assert.ok(res.ok || res.stopped, ex.ad + ': ' + JSON.stringify(res));
  }
});

test('əsas sintaksis', async () => {
  const { res, out } = await run('ad = "Sano"\nəgər ad == "Sano":\n    göstər("Salam", ad)\nyoxsa:\n    göstər("?")');
  assert.ok(res.ok); assert.deepStrictEqual(out, ['Salam Sano']);
});

test('hərfsiz yazılış eyni işləyir', async () => {
  const { res, out } = await run('sayı = 3\ntekrarla sayi defe:\n    goster("x")');
  assert.ok(res.ok); assert.strictEqual(out.length, 3);
});

test('funksiyalar və rekursiya', async () => {
  const { out } = await run('funksiya f(n):\n    əgər n <= 1:\n        qaytar 1\n    qaytar n * f(n - 1)\ngöstər(f(5))');
  assert.deepStrictEqual(out, ['120']);
});

test('obyektlər orijinal adla görünür', async () => {
  const { out } = await run('ş = {ad: "Sano", yaş: 20}\nş.yaş += 1\ngöstər(ş)');
  assert.deepStrictEqual(out, ['{ad: "Sano", yaş: 21}']);
});

test('sına / xəta olsa', async () => {
  const { out } = await run('sına:\n    xəta_at("pis")\nxəta olsa s:\n    göstər("tutuldu:", s)');
  assert.deepStrictEqual(out, ['tutuldu: pis']);
});

test('çoxsətirli siyahı', async () => {
  const { out } = await run('a = [\n    1,\n    2\n]\ngöstər(a)');
  assert.deepStrictEqual(out, ['[1, 2]']);
});

const XETALAR = [
  ['əgər 5 > 3\n    göstər(1)', 1, '":" unudulub'],
  ['göstər(x)', 1, 'tapılmadı'],
  ['göstər("salam)', 1, 'Dırnaq'],
  ['yoxsa:\n    göstər(1)', 1, 'yoxsa'],
  ['əgər 1 = 1:\n    göstər(1)', 1, '=='],
  ['a = 5\n   göstər(a)', 2, 'Gözlənilməz'],
  ['sına:\n    göstər(1)\ngöstər(2)', 3, 'xəta olsa'],
  ['funksiya f(n):\n    qaytar f(n+1)\nf(1)', 2, 'sonsuz'],
];
for (const [kod, sətir, söz] of XETALAR) {
  test('xəta mesajı: ' + JSON.stringify(kod).slice(0, 40), async () => {
    const { res } = await run(kod);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.line, sətir);
    assert.ok(res.error.includes(söz), res.error);
  });
}

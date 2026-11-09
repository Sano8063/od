// Dərslərin testləri: hər dərsin cavabı keçməli, başlanğıc kodu isə keçməməlidir
const test = require('node:test');
const assert = require('node:assert');
require('../src/engine.js');
const { OD_LESSONS, odCheckLesson } = require('../src/lessons.js');

for (const L of OD_LESSONS) {
  test(L.id + ' ' + L.ad + ': cavab keçir', async () => {
    const r = await odCheckLesson(L, L.cavab);
    assert.ok(r.ok, JSON.stringify(r.results));
  });
  test(L.id + ' ' + L.ad + ': başlanğıc kodu keçmir', async () => {
    const r = await odCheckLesson(L, L.başlanğıc);
    assert.strictEqual(r.ok, false);
  });
  test(L.id + ' ' + L.ad + ': nümunə xətasız işləyir', async () => {
    const r = await odCheckLesson({ testlər: [{ gözlənilən: '__heç_vaxt__' }] }, L.nümunə);
    assert.ok(!r.results[0].xəta, r.results[0].xəta);
  });
}

test('əllə yazılmış cavab qəbul olunmur (d2, d3)', async () => {
  const d2 = OD_LESSONS.find(l => l.id === 'd2');
  const r2 = await odCheckLesson(d2, 'göstər("Cəmi: 12")');
  assert.strictEqual(r2.ok, false); assert.ok(r2.mesaj);
  const d3 = OD_LESSONS.find(l => l.id === 'd3');
  assert.strictEqual((await odCheckLesson(d3, 'göstər(86400)')).ok, false);
});

test('qadağan funksiya (d8)', async () => {
  const d8 = OD_LESSONS.find(l => l.id === 'd8');
  const r = await odCheckLesson(d8, 'göstər(ən_böyük([1]))');
  assert.strictEqual(r.ok, false); assert.ok(r.mesaj);
});

test('sonsuz dövr dayandırılır', async () => {
  const d1 = OD_LESSONS[0];
  const r = await odCheckLesson(d1, 'nə qədər ki doğru:\n    x = 1');
  assert.strictEqual(r.ok, false); assert.ok(/uzun/.test(r.results[0].xəta));
});

// Sinif sisteminin testləri (Demo sürücüsü ilə — server lazım deyil)
const test = require('node:test');
const assert = require('node:assert');
const OdCloud = require('../src/cloud.js');

function memStorage() { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; }

test('tam ssenari: müəllim → sinif → tapşırıq → şagird → göndəriş → bildiriş', async () => {
  const c = OdCloud.DemoDriver(memStorage());
  const t = await c.signUp('leyla@mekteb.az', 'sinif123', 'Leyla', 'muellim');
  assert.strictEqual(t.rol, 'muellim');
  const cls = await c.createClass('7A');
  assert.match(cls.kod, /^[A-Z2-9]{6}$/);
  const a = await c.createAssignment({ classId: cls.id, başlıq: 'Cəm', testlər: [{ girdi: ['2', '3'], gözlənilən: '5' }], ciddi: true });
  let inbox = null; c.watchInbox(l => { inbox = l; });
  await c.signOut();

  // şagird
  await assert.rejects(c.joinClass(cls.kod), /daxil ol/);
  await c.signUp('murad@mekteb.az', 'sagird1', 'Murad', 'sagird');
  await assert.rejects(c.createClass('X'), /yalnız müəllim/);
  await assert.rejects(c.joinClass('YANLIS'), /tapılmadı/);
  await c.joinClass(cls.kod.toLowerCase());
  const mine = await c.myClasses();
  assert.strictEqual(mine.length, 1);
  const list = await c.assignmentsForClass(cls.id);
  assert.strictEqual(list[0].başlıq, 'Cəm');
  const s = await c.submit(a.id, { kod: 'göstər(5)', nəticə: { ok: true, keçən: 1, cəmi: 1 }, şübhəli: true, səbəblər: ['test'] });
  assert.strictEqual(s.cəhd, 1);
  const s2 = await c.submit(a.id, { kod: 'göstər(2+3)', nəticə: { ok: true, keçən: 1, cəmi: 1 } });
  assert.strictEqual(s2.cəhd, 2);
  await assert.rejects(c.updateSubmission(s2.id, { qiymət: '5' }), /yalnız müəllim/);
  await c.signOut();

  // müəllim bildirişi görür və qiymət verir
  await c.signIn('leyla@mekteb.az', 'sinif123');
  assert.strictEqual(inbox.length, 1);
  assert.strictEqual(inbox[0].oxundu, false);
  await c.updateSubmission(inbox[0].id, { oxundu: true, qiymət: '5', şərh: 'Əla', kod: 'hack' });
  const subs = await c.submissionsForAssignment(a.id);
  assert.strictEqual(subs[0].qiymət, '5');
  assert.strictEqual(subs[0].kod, 'göstər(2+3)', 'müəllim şagirdin kodunu dəyişə bilməz');
  const members = await c.classMembers(cls.id);
  assert.strictEqual(members[0].ad, 'Murad');
});

test('qeydiyyat yoxlamaları', async () => {
  const c = OdCloud.DemoDriver(memStorage());
  await assert.rejects(c.signUp('pis', '123456', 'A', 'sagird'), /E-poçt/);
  await assert.rejects(c.signUp('a@b.az', '123', 'A', 'sagird'), /6 simvol/);
  await assert.rejects(c.signUp('a@b.az', '123456', 'A', 'admin'), /Rolu/);
  await c.signUp('a@b.az', '123456', 'A', 'sagird');
  await c.signOut();
  await assert.rejects(c.signUp('A@B.az', '123456', 'A', 'sagird'), /artıq/);
  await assert.rejects(c.signIn('a@b.az', 'yanlış'), /səhvdir/);
});

test('ciddi rejim siqnallarının qiymətləndirilməsi', () => {
  const clean = { yapışdırılan: 0, yapışdırma: [], çıxış: 1, çıxışMs: 3000, düymə: 120, aktivMs: 240000 };
  assert.strictEqual(OdCloud.evaluateIntegrity(clean, 10, 110).şübhəli, false);
  const paste = Object.assign({}, clean, { yapışdırılan: 300, yapışdırma: [[1000, 300]] });
  assert.match(OdCloud.evaluateIntegrity(paste, 10, 330).səbəblər[0], /yapışdırılıb/);
  const away = Object.assign({}, clean, { çıxış: 5, çıxışMs: 90000 });
  assert.match(OdCloud.evaluateIntegrity(away, 10, 110).səbəblər.join(), /Səhifədən 5 dəfə/);
  const typedLittle = Object.assign({}, clean, { düymə: 10 });
  assert.match(OdCloud.evaluateIntegrity(typedLittle, 0, 200).səbəblər.join(), /yazılmadan/);
  const fast = Object.assign({}, clean, { aktivMs: 8000, düymə: 400 });
  assert.match(OdCloud.evaluateIntegrity(fast, 0, 300).səbəblər.join(), /qısa vaxtda/);
});

test('yazılışın təkrarı (diff + replay)', () => {
  const steps = ['', 'g', 'gös', 'göstər()', 'göstər("salam")', 'göstər("Salam")', 'a = 1\ngöstər("Salam")'];
  const ops = [];
  for (let i = 1; i < steps.length; i++) ops.push(OdCloud.diffOp(steps[i - 1], steps[i], i * 100));
  for (let i = 0; i <= ops.length; i++) assert.strictEqual(OdCloud.replayAt('', ops, i), steps[i]);
  assert.strictEqual(OdCloud.diffOp('abc', 'abc', 0), null);
});

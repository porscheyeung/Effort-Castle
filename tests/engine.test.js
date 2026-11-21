const test = require('node:test'), assert = require('node:assert');
const E = require('../engine.js');
const T0 = new Date(2026, 10, 10, 18).getTime(), DAY = 864e5;

test('加磚、收回、不改動原 state', () => {
  const s = E.fresh(), a = E.add(s, 't1', T0);
  assert.equal(s.log.length, 0); assert.equal(a.log.length, 1);
  assert.equal(E.add(a, 'nope', T0), a, '未知項目不加');
  assert.equal(E.undo(a).log.length, 0); assert.equal(E.undo(s), s);
});
test('隱藏項目不能再加磚，舊磚保留', () => {
  let s = E.add(E.fresh(), 't2', T0);
  s = { ...s, types: s.types.map((t) => (t.id === 't2' ? { ...t, hidden: true } : t)) };
  assert.equal(E.add(s, 't2', T0), s); assert.equal(s.log.length, 1);
});
test('樓層、目標、outcome', () => {
  let s = { ...E.fresh(), goal: 5 };
  for (let i = 0; i < 49; i++) s = E.add(s, 't1', T0 + i);
  const st = E.stats(s, T0);
  assert.equal(st.floors, 4); assert.equal(st.inFloor, 9); assert.equal(st.goalDone, false);
  assert.deepEqual(E.outcome(49, 50, 5), { floorDone: 4, goalDone: true });
  assert.deepEqual(E.outcome(48, 49, 5), { floorDone: -1, goalDone: false });
  assert.deepEqual(E.outcome(59, 60, 5), { floorDone: 5, goalDone: false });
  assert.equal(E.floorDates(s).length, 4);
});
test('連續日數與最長紀錄', () => {
  let s = E.fresh();
  for (const d of [0, 1, 2, 5, 6, 7, 8]) s = E.add(s, 't1', T0 + d * DAY);
  assert.equal(E.stats(s, T0 + 8 * DAY).streak, 4);
  assert.equal(E.stats(s, T0 + 9 * DAY).streak, 4, '今日未做仍計到昨日');
  assert.equal(E.stats(s, T0 + 10 * DAY).streak, 0);
  assert.equal(E.stats(s, T0 + 8 * DAY).best, 4);
  assert.equal(E.stats(s, T0 + 8 * DAY).today, 1);
});
test('讀取壞資料', () => {
  assert.equal(E.read(null), null); assert.equal(E.read({ version: 2 }), null);
  const r = E.read({ version: 1, name: '<b>朗朗朗朗朗朗朗朗朗朗朗朗朗朗</b>', goal: 7, types: [{ id: 'x' }, { id: 't9', name: '閱讀', color: 'red', icon: '??' }], log: [{ type: 't9', ts: 5 }, { type: 't9', ts: 'a' }, null] });
  assert.equal(r.name.includes('<'), false); assert.equal(r.name.length, 12);
  assert.equal(r.goal, 10); assert.equal(r.types.length, 1); assert.equal(r.types[0].icon, 'heart');
  assert.match(r.types[0].color, /^#/); assert.equal(r.log.length, 1);
  assert.equal(E.read({ version: 1, types: [] }).types.length, 6, '空項目用預設');
});
test('房間循環及示範資料', () => {
  assert.equal(E.roomAt(0).id, 'library'); assert.equal(E.roomAt(12).id, 'library'); assert.equal(E.roomAt(12).round, 2);
  const d = E.demo(T0); assert.equal(d.log.length, 47);
  for (let i = 1; i < d.log.length; i++) assert.ok(d.log[i].ts >= d.log[i - 1].ts);
  assert.ok(d.log.every((e) => e.ts <= T0));
});

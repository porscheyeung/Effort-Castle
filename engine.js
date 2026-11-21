// 努力城堡規則：純函數，不碰畫面，可在 Node 測試。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EffortEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const KEY = 'effort-castle-v1';
  const FLOOR = 10, MAX_LOG = 20000, MAX_TYPES = 8, NAME_MAX = 12;
  const COLORS = ['#D9734E', '#E2A93B', '#7FAE85', '#5E9CC2', '#9A7BB8', '#DB8C99', '#C9865A', '#5FA7A0'];
  const ICONS = ['book', 'pencil', 'eraser', 'music', 'ball', 'home', 'brush', 'run', 'bulb', 'heart'];
  const DEFAULT_TYPES = [
    { id: 't1', name: '做功課', color: '#D9734E', icon: 'book' },
    { id: 't2', name: '溫習', color: '#E2A93B', icon: 'pencil' },
    { id: 't3', name: '勇敢改正', color: '#7FAE85', icon: 'eraser' },
    { id: 't4', name: '練習樂器', color: '#5E9CC2', icon: 'music' },
    { id: 't5', name: '運動', color: '#9A7BB8', icon: 'ball' },
    { id: 't6', name: '幫手做家務', color: '#DB8C99', icon: 'home' },
  ];
  const ROOMS = [
    { id: 'library', name: '圖書室', who: '貓頭鷹圓圓', animal: 'owl', line: '一頁一頁讀，書就會變成你的朋友。' },
    { id: 'bakery', name: '麵包房', who: '小熊蜜糖', animal: 'bear', line: '麵團要慢慢等，好東西都需要時間。' },
    { id: 'music', name: '音樂室', who: '小兔琴琴', animal: 'rabbit', line: '彈錯一個音也不要緊，再彈一次就更好聽。' },
    { id: 'studio', name: '畫室', who: '狐狸橙橙', animal: 'fox', line: '每一筆都是練習，畫紙不怕你畫錯。' },
    { id: 'greenhouse', name: '溫室', who: '刺蝟毛毛', animal: 'hedgehog', line: '天天淋一點水，小芽就會長高。' },
    { id: 'workshop', name: '木工房', who: '河狸阿木', animal: 'beaver', line: '量兩次、鋸一次，細心就是本領。' },
    { id: 'lab', name: '實驗室', who: '小老鼠豆豆', animal: 'mouse', line: '實驗失敗了？那是發現了新答案。' },
    { id: 'sewing', name: '縫紉室', who: '綿羊雲朵', animal: 'sheep', line: '一針一線，慢慢就縫成一件大衣。' },
    { id: 'maps', name: '地圖室', who: '企鵝小冰', animal: 'penguin', line: '走錯路也會畫進地圖，下次就知道怎樣走。' },
    { id: 'clock', name: '鐘樓', who: '松鼠栗子', animal: 'squirrel', line: '每天準時做一點點，時間會幫你累積。' },
    { id: 'observatory', name: '望遠鏡台', who: '小鹿點點', animal: 'deer', line: '看得遠的人，都是一步一步爬上來的。' },
    { id: 'terrace', name: '茶點露台', who: '小貓阿橘', animal: 'cat', line: '努力過後，記得好好休息一下。' },
  ];
  const PRAISE = [
    '你肯坐下來開始，已經很了不起。',
    '一塊一塊砌，城堡就是這樣長高的。',
    '這塊磚是你自己的努力換來的。',
    '難的事你也沒有放棄，真勇敢。',
    '慢慢來也可以，重要的是你有做。',
    '今天的你，比昨天多走了一步。',
    '專心做完一件事，值得為自己拍拍手。',
    '錯了再改，就是在變強。',
    '你的堅持，城堡都記住了。',
    '多一塊磚，城堡就更穩一點。',
    '做得好！記得你是怎樣做到的。',
    '努力不一定馬上看得見，但城堡看得見。',
  ];
  const GOALS = [5, 10, 15, 20];

  const clean = (t, n) => String(t ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);
  const isColor = (c) => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c);
  const fresh = () => ({ version: 1, name: '', castle: '', goal: 10, sound: true, setup: false, types: DEFAULT_TYPES.map((t) => ({ ...t })), log: [], nextId: 1 });

  function read(d) {
    if (!d || typeof d !== 'object' || d.version !== 1) return null;
    const s = fresh();
    s.name = clean(d.name, NAME_MAX); s.castle = clean(d.castle, 16);
    s.goal = GOALS.includes(d.goal) ? d.goal : 10;
    s.sound = d.sound !== false; s.setup = d.setup === true;
    if (Array.isArray(d.types)) {
      const seen = new Set(), types = [];
      for (const t of d.types) {
        if (!t || typeof t.id !== 'string' || !/^t\d{1,6}$/.test(t.id) || seen.has(t.id)) continue;
        const name = clean(t.name, 8); if (!name) continue;
        seen.add(t.id);
        types.push({ id: t.id, name, color: isColor(t.color) ? t.color : COLORS[types.length % COLORS.length], icon: ICONS.includes(t.icon) ? t.icon : 'heart', hidden: t.hidden === true });
        if (types.length >= MAX_TYPES + 24) break;
      }
      if (types.some((t) => !t.hidden)) s.types = types;
    }
    if (Array.isArray(d.log)) {
      s.log = d.log.filter((e) => e && typeof e.type === 'string' && Number.isFinite(e.ts) && e.ts > 0 && e.ts < 8.64e15)
        .slice(-MAX_LOG).map((e) => ({ type: e.type, ts: e.ts }));
    }
    return s;
  }

  const typeOf = (s, id) => s.types.find((t) => t.id === id) || { id, name: '努力', color: '#B9A58F', icon: 'heart', hidden: true };
  const activeTypes = (s) => s.types.filter((t) => !t.hidden);

  function add(s, typeId, ts = Date.now()) {
    if (!s.types.some((t) => t.id === typeId && !t.hidden) || s.log.length >= MAX_LOG) return s;
    return { ...s, log: [...s.log, { type: typeId, ts }] };
  }
  const undo = (s) => (s.log.length ? { ...s, log: s.log.slice(0, -1) } : s);

  function dayKey(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function shiftDay(key, n) {
    const [y, m, d] = key.split('-').map(Number);
    return dayKey(new Date(y, m - 1, d + n, 12).getTime());
  }

  function stats(s, now = Date.now()) {
    const total = s.log.length, floors = Math.floor(total / FLOOR), inFloor = total % FLOOR;
    const days = new Map(), byType = new Map();
    for (const e of s.log) {
      const k = dayKey(e.ts);
      days.set(k, (days.get(k) || 0) + 1);
      byType.set(e.type, (byType.get(e.type) || 0) + 1);
    }
    const today = dayKey(now);
    let streak = 0, k = days.has(today) ? today : shiftDay(today, -1);
    while (days.has(k)) { streak++; k = shiftDay(k, -1); }
    let best = 0, run = 0, prev = null;
    for (const key of [...days.keys()].sort()) {
      run = prev && shiftDay(prev, 1) === key ? run + 1 : 1;
      best = Math.max(best, run); prev = key;
    }
    const goalBricks = s.goal * FLOOR;
    return { total, floors, inFloor, today: days.get(today) || 0, todayKey: today, streak, best, days, byType, goalBricks, goalDone: total >= goalBricks, activeDays: days.size };
  }

  const roomAt = (i) => ({ ...ROOMS[i % ROOMS.length], round: Math.floor(i / ROOMS.length) + 1, floor: i + 1 });

  // 加一塊磚後發生了甚麼：完成樓層、完成目標。
  function outcome(before, after, goal) {
    const g = goal * FLOOR;
    return {
      floorDone: after % FLOOR === 0 && after > before ? after / FLOOR - 1 : -1,
      goalDone: before < g && after >= g,
    };
  }

  // 磚塊在一層裏的位置：首兩行每行四塊圍著窗，最後兩條長石做窗楣。
  function slot(j) {
    if (j < 8) { const row = Math.floor(j / 4), c = j % 4; return { row, col: c, kind: 'brick' }; }
    return { row: 2, col: j - 8, kind: 'lintel' };
  }

  function floorDates(s) {
    const out = [];
    for (let i = FLOOR - 1; i < s.log.length; i += FLOOR) out.push(s.log[i].ts);
    return out;
  }

  function demo(now = Date.now()) {
    const s = fresh();
    s.name = '朗朗'; s.castle = '晨光城堡'; s.setup = true;
    let seed = 7;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let d = 20; d >= 0; d--) {
      if (d === 9 || d === 15) continue;
      const n = 1 + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) {
        const t = new Date(now - d * 864e5); t.setHours(16 + i, Math.floor(r() * 60), 0, 0);
        s.log.push({ type: DEFAULT_TYPES[Math.floor(r() * DEFAULT_TYPES.length)].id, ts: Math.min(t.getTime(), now - (n - i) * 6e4) });
      }
    }
    s.log = s.log.slice(0, 47);
    return s;
  }

  return { KEY, FLOOR, MAX_TYPES, COLORS, ICONS, ROOMS, PRAISE, GOALS, fresh, read, add, undo, stats, typeOf, activeTypes, roomAt, outcome, slot, dayKey, shiftDay, floorDates, demo, clean };
});

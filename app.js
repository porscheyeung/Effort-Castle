(function () {
  'use strict';
  const E = window.EffortEngine, A = window.EffortArt, { icon, esc } = A;
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const DEMO = params.has('demo');

  let S = load();
  let view = 'castle', calMonth = null, selDay = null, toastTimer = 0, lastFresh = -1, lastFreshFloor = -1;

  function load() {
    if (DEMO) return E.demo();
    try { return E.read(JSON.parse(localStorage.getItem(E.KEY))) || E.fresh(); } catch { return E.fresh(); }
  }
  function save(ev) {
    if (DEMO) return;
    try { localStorage.setItem(E.KEY, JSON.stringify(S)); } catch { toast({ title: '未能儲存', text: '瀏覽器儲存空間已滿或被封鎖。' }); }
    linkPush(ev || { kind: 'sync' });
  }

  // ---------- 大屏幕連線（手機是資料來源，大屏幕只看） ----------
  const LINK_KEY = 'effort-castle-link-v1';
  const LINK_API = params.get('link') || 'https://edgelab-web-porscheyeung.zocomputer.io/effort-link';
  const SCREEN_URL = 'porscheyeung.github.io/Effort-Castle/screen';
  let link = DEMO ? null : loadLink(), screens = -1, linkQ = Promise.resolve();
  function loadLink() { try { const l = JSON.parse(localStorage.getItem(LINK_KEY)); return l && typeof l.token === 'string' ? l : null; } catch { return null; } }
  async function linkApi(path, data) {
    const r = await fetch(LINK_API + path, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify(data), cache: 'no-store' });
    return { ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) };
  }
  const linkState = () => ({ name: S.name, castle: S.castle, goal: S.goal, types: S.types, log: S.log });
  function linkPush(event) {
    if (!link) return;
    const token = link.token, body = { token, state: linkState(), event };
    linkQ = linkQ.then(() => linkApi('/api/push', body)).then((r) => {
      if (r.status === 410) linkLost(); else if (r.ok) setScreens(r.data.screens);
    }).catch(() => setScreens(-2));
  }
  function setScreens(n) { if (n === screens) return; screens = n; renderLink(); }
  function linkLost() {
    if (!link) return;
    link = null; screens = -1;
    try { localStorage.removeItem(LINK_KEY); } catch {}
    renderLink(); toast({ title: '大屏幕已斷開', text: '大屏幕換了手機或已重設。要再連接，到「設定」輸入新號碼。' });
  }
  async function linkCheck() {
    if (!link || document.hidden) return;
    try { const r = await linkApi('/api/status', { token: link.token }); if (r.status === 410) linkLost(); else if (r.ok) setScreens(r.data.screens); } catch { setScreens(-2); }
  }
  setInterval(linkCheck, 5000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) linkCheck(); });
  const linkWord = () => (screens > 0 ? '大屏幕在線' : screens === -2 ? '未能連線' : '大屏幕未開');
  function renderLink() {
    const on = !!link, ok = screens > 0;
    $('chipLink').hidden = !on;
    $('chipLink').className = 'chip chip-link' + (ok ? ' ok' : '');
    $('chipLink').innerHTML = `${icon('screen')}<i class="ldot"></i>`;
    $('chipLink').setAttribute('aria-label', `大屏幕：${linkWord()}`);
    $('floorCard').hidden = on; $('remote').hidden = !on;
    document.body.classList.toggle('linked', on);
    if (on) renderRemote();
    fitScene();
    if (view === 'settings') renderSettings();
    if (!$('sheet').hidden && $('linkSheet')) linkSheet(true);
  }
  let fitH = -1;
  function fitScene() {
    if (view !== 'castle') return;
    const hgt = link ? Math.max(0, $('remote').offsetHeight + 46 - 26) : 0;
    if (hgt === fitH) return;
    fitH = hgt; wrap.style.bottom = hgt ? hgt + 'px' : '';
    if (view === 'castle') renderScene({ scroll: 'top' });
  }
  function renderRemote() {
    const st = E.stats(S), types = E.activeTypes(S), today = new Map();
    for (const e of S.log) if (E.dayKey(e.ts) === st.todayKey) today.set(e.type, (today.get(e.type) || 0) + 1);
    const dots = Array.from({ length: 10 }, (_, j) => { const idx = st.floors * 10 + j, on = idx < S.log.length; return `<i style="${on ? `background:${E.typeOf(S, S.log[idx].type).color}` : ''}" class="${on ? 'on' : ''}"></i>`; }).join('');
    $('remote').innerHTML = `<div class="rm-head"><span class="rm-st${screens > 0 ? ' ok' : ''}"><i class="ldot"></i>${linkWord()}</span><span class="rm-fl">第 ${st.floors + 1} 層 <span class="dots">${dots}</span></span></div>
      <div class="rm-grid${types.length > 6 ? ' many' : ''}">${types.map((t) => `<button class="rm-btn" data-type="${t.id}" style="--c:${t.color}" type="button"><span class="e-ic">${icon(t.icon)}</span><b>${esc(t.name)}</b><small>今日 ${today.get(t.id) || 0}</small></button>`).join('')}</div>`;
    $('remote').querySelectorAll('.rm-btn').forEach((b) => b.onclick = () => {
      if (!S.setup) return welcome();
      b.classList.remove('picked'); void b.offsetWidth; b.classList.add('picked'); buzz(15);
      addBrick(b.dataset.type);
    });
  }
  function linkSheet(refresh) {
    const html = link
      ? `<div id="linkSheet"></div><div class="link-hero ${screens > 0 ? 'ok' : ''}">${icon('phone')}<span class="lh-line"></span>${icon('screen')}</div>
         <h3>${screens > 0 ? '已連接大屏幕' : '已配對，等待大屏幕'}</h3>
         <p class="sub">${screens > 0 ? '在城堡頁按下面的彩色按鈕，一按就砌一塊磚，大屏幕會即時顯示。' : `大屏幕未打開。用 iPad 或電腦打開 <b>${SCREEN_URL}</b>，城堡就會自動出現。`}</p>
         <div class="btn-col"><button class="btn" id="lDone">${icon('check')}好</button><button class="btn ghost" id="lOff">${icon('unlink')}斷開大屏幕</button></div>`
      : `<div id="linkSheet"></div><div class="link-hero">${icon('phone')}<span class="lh-line"></span>${icon('screen')}</div>
         <h3>連接大屏幕</h3>
         <p class="sub">手機當遙控器，iPad 或電腦當大屏幕看城堡長高。兩部機不用連同一個 Wi‑Fi。</p>
         <ol class="link-steps"><li>在 iPad 或電腦打開<br><b class="url">${SCREEN_URL}</b></li><li>輸入大屏幕上的 4 位數字</li></ol>
         <div class="pin" id="pin">${[0, 1, 2, 3].map((i) => `<span data-i="${i}"></span>`).join('')}<input id="pinIn" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="one-time-code" aria-label="大屏幕上的 4 位數字"></div>
         <p class="pin-err" id="pinErr"></p>
         <button class="btn" id="lGo" disabled>${icon('screen')}連接</button>`;
    openSheet(html, refresh);
    if (link) {
      $('lDone').onclick = closeSheet;
      $('lOff').onclick = () => {
        const token = link.token;
        link = null; screens = -1;
        try { localStorage.removeItem(LINK_KEY); } catch {}
        linkApi('/api/unpair', { token }).catch(() => {});
        closeSheet(); renderLink(); toast({ title: '已斷開大屏幕', text: '城堡資料仍然留在這部手機。' });
      };
      return;
    }
    const inp = $('pinIn'), boxes = [...$('pin').querySelectorAll('span')];
    const draw = () => { const v = inp.value.replace(/\D/g, '').slice(0, 4); inp.value = v; boxes.forEach((b, i) => { b.textContent = v[i] || ''; b.classList.toggle('on', !!v[i]); b.classList.toggle('cur', i === v.length && document.activeElement === inp); }); $('lGo').disabled = v.length !== 4; $('pinErr').textContent = ''; };
    inp.oninput = () => { draw(); if (inp.value.length === 4) go(); };
    inp.onfocus = inp.onblur = draw;
    $('pin').onclick = () => inp.focus();
    const go = async () => {
      if ($('lGo').disabled) return;
      $('lGo').disabled = true; $('lGo').classList.add('busy');
      try {
        const r = await linkApi('/api/pair', { code: inp.value });
        if (!r.ok) throw new Error(r.data.error || '未能連接，請再試一次。');
        link = { token: r.data.token, at: Date.now() }; screens = r.data.screens;
        try { localStorage.setItem(LINK_KEY, JSON.stringify(link)); } catch {}
        linkPush({ kind: 'sync' });
        closeSheet(); setView('castle'); renderLink(); renderScene({ scroll: 'top' }); sfx('floor');
        toast({ title: '已連接大屏幕', text: '按下面的彩色按鈕，一按就砌一塊磚。' });
      } catch (e) {
        inp.value = ''; draw(); inp.focus();
        $('pinErr').textContent = e.name === 'TypeError' ? '未能連線，請檢查網絡後再試。' : e.message;
        $('pin').classList.remove('shake'); void $('pin').offsetWidth; $('pin').classList.add('shake');
      }
      $('lGo') && $('lGo').classList.remove('busy');
    };
    $('lGo').onclick = go;
    draw(); setTimeout(() => inp.focus(), 280);
  }

  // ---------- 音效 ----------
  let ac = null;
  function tone(freq, t0, dur, type = 'sine', vol = 0.18) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, ac.currentTime + t0);
    g.gain.setValueAtTime(0, ac.currentTime + t0);
    g.gain.linearRampToValueAtTime(vol, ac.currentTime + t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t0 + dur);
    o.connect(g).connect(ac.destination); o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + dur + 0.05);
  }
  function sfx(kind) {
    if (!S.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      if (kind === 'brick') { tone(180, 0.32, 0.12, 'triangle', 0.3); tone(90, 0.32, 0.16, 'sine', 0.3); tone(660, 0.36, 0.18, 'sine', 0.06); }
      else if (kind === 'tap') tone(520, 0, 0.06, 'sine', 0.06);
      else if (kind === 'floor') [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5 + i * 0.11, 0.5, 'triangle', 0.13));
      else if (kind === 'goal') [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.4 + i * 0.13, 0.6, 'triangle', 0.13));
    } catch { /* 無音效也可以玩 */ }
  }
  const buzz = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

  // ---------- 城堡 ----------
  const wrap = $('sceneWrap'), sceneEl = $('scene');
  let sceneInfo = null;
  function colors() { return S.log.map((e) => E.typeOf(S, e.type).color); }
  function renderScene(opts = {}) {
    const w = wrap.clientWidth || 360, h = wrap.clientHeight || 640;
    const st = E.stats(S);
    sceneInfo = A.scene({
      colors: colors(), goal: S.goal, castle: S.castle, minH: h * 360 / w,
      fresh: opts.fresh ?? -1, freshFloor: opts.freshFloor ?? -1, crown: st.goalDone,
      room: (i) => E.roomAt(i), seed: 11,
    });
    const keep = wrap.scrollHeight - wrap.scrollTop;
    sceneEl.innerHTML = sceneInfo.svg;
    const k = w / 360, anchor = link ? 0.56 : 0.48;
    if (opts.scroll === 'top' && link) wrap.scrollTop = Math.max(0, sceneInfo.brickY(S.log.length) * k - h * anchor);
    else if (opts.scroll === 'top') wrap.scrollTop = Math.max(0, sceneInfo.topY * k - 40);
    else if (opts.scroll === 'brick') {
      const y = sceneInfo.brickY(opts.fresh) * k, target = Math.max(0, y - h * anchor);
      wrap.scrollTop = wrap.scrollHeight - keep;
      wrap.scrollTo({ top: target, behavior: 'smooth' });
    } else wrap.scrollTop = wrap.scrollHeight - keep;
  }
  function renderHud(popDot = -1) {
    const st = E.stats(S);
    $('whoBadge').innerHTML = icon('castle');
    $('titleText').textContent = S.name ? `${S.name}的努力城堡` : '努力城堡';
    $('subText').textContent = S.castle || '一次努力，一塊磚';
    const ch = $('chipStreak');
    ch.classList.toggle('cold', st.today === 0);
    ch.innerHTML = `${icon('flame')}<b>${st.streak}</b>日`;
    ch.setAttribute('aria-label', `連續努力 ${st.streak} 日，今日 ${st.today} 塊`);
    ch.title = `今日 ${st.today} 塊磚`;
    const fi = st.floors, room = E.roomAt(fi);
    const dots = Array.from({ length: 10 }, (_, j) => {
      const idx = fi * 10 + j, on = idx < S.log.length;
      return `<i class="${on ? 'on' : ''}${j === popDot ? ' pop' : ''}" style="${on ? `background:${E.typeOf(S, S.log[idx].type).color}` : ''}"></i>`;
    }).join('');
    $('floorCard').innerHTML = `<div class="fc-room">${A.roomArt(room.id, room.animal, { locked: true })}<div class="lock">${icon('lock')}</div></div>
      <div class="fc-main"><div class="k">第 ${fi + 1} 層 · 還差 ${10 - st.inFloor} 塊</div><div class="t">${esc(room.name)}</div><div class="dots">${dots}</div></div>
      <div class="fc-total"><b>${st.total}</b><small>/ ${st.goalBricks} 塊</small></div>`;
    $('floorCard').setAttribute('aria-label', `第 ${fi + 1} 層${room.name}，已砌 ${st.inFloor} 塊，總共 ${st.total} 塊`);
  }

  // ---------- 加磚 ----------
  function openEffortSheet() {
    if (!S.setup) return welcome();
    sfx('tap');
    const st = E.stats(S), today = new Map();
    for (const e of S.log) if (E.dayKey(e.ts) === st.todayKey) today.set(e.type, (today.get(e.type) || 0) + 1);
    const types = E.activeTypes(S);
    openSheet(`<h3>剛才努力了甚麼？</h3><p class="sub">選一項，城堡就多一塊磚。</p>
      <div class="effort-grid">${types.map((t) => `<button class="effort" data-type="${t.id}" style="--c:${t.color}" type="button"><span class="e-ic">${icon(t.icon)}</span><span><b>${esc(t.name)}</b><small>今日 ${today.get(t.id) || 0} 次</small></span></button>`).join('')}</div>`);
    $('sheetBody').querySelectorAll('.effort').forEach((b) => b.addEventListener('click', () => {
      b.classList.add('picked'); buzz(15);
      setTimeout(() => { closeSheet(); addBrick(b.dataset.type); }, 230);
    }, { once: true }));
  }
  function addBrick(typeId) {
    const before = S.log.length;
    const next = E.add(S, typeId);
    if (next === S) return;
    S = next;
    const after = S.log.length, out = E.outcome(before, after, S.goal);
    const praise = Math.floor(Math.random() * E.PRAISE.length);
    save({ kind: 'brick', i: after - 1, floorDone: out.floorDone, goalDone: out.goalDone, praise });
    lastFresh = after - 1; lastFreshFloor = out.floorDone;
    if (view !== 'castle') setView('castle');
    renderScene({ fresh: lastFresh, freshFloor: out.floorDone, scroll: 'brick' });
    renderHud(lastFresh % 10);
    if (link) renderRemote();
    sfx('brick'); setTimeout(() => buzz(25), 320);
    $('mainBtn').classList.remove('bump'); void $('mainBtn').offsetWidth; $('mainBtn').classList.add('bump');
    const t = E.typeOf(S, typeId);
    if (out.floorDone >= 0 && link && screens > 0) {
      setTimeout(() => { sfx(out.goalDone ? 'goal' : 'floor'); confetti(out.goalDone ? 160 : 90); toast({ color: t.color, title: out.goalDone ? '努力城堡建成了！' : `第 ${out.floorDone + 1} 層完成！`, text: `看看大屏幕，${E.roomAt(out.floorDone).who}搬進來了。` }); }, 900);
    } else if (out.floorDone >= 0) {
      setTimeout(() => { sfx(out.goalDone ? 'goal' : 'floor'); confetti(out.goalDone ? 260 : 140); floorModal(out.floorDone, out.goalDone); }, 900);
    } else {
      toast({ color: t.color, title: `${t.name} +1`, text: E.PRAISE[praise], undo: true });
    }
  }
  function undoLast(fromToast) {
    if (!S.log.length) return;
    const last = S.log[S.log.length - 1];
    const go = () => {
      S = E.undo(S); save({ kind: 'undo' }); renderAll();
      toast({ color: E.typeOf(S, last.type).color, title: '已收回一塊磚', text: '按錯不要緊，再選一次就好。' });
    };
    if (fromToast) return go();
    confirmBox({ title: '收回最後一塊磚？', text: `「${E.typeOf(S, last.type).name}」· ${fmtTime(last.ts, true)}`, ok: '收回', danger: true, onOk: go });
  }

  function floorModal(fi, goalDone) {
    const room = E.roomAt(fi), st = E.stats(S);
    const html = goalDone
      ? `<div style="margin:6px auto 0;width:80%">${crownArt()}</div><p class="eyebrow">GOAL COMPLETE</p><h3>努力城堡建成了！</h3><div class="big-num">${st.total}</div><p>塊磚，每一塊都是${S.name ? esc(S.name) : '你'}自己努力換來的。<br>第 ${fi + 1} 層的${esc(room.name)}也亮燈了，${esc(room.who)}搬了進來。</p>
         <div class="btn-col"><button class="btn" id="mOk">繼續向上砌</button><button class="btn ghost" id="mRoom">看看${esc(room.name)}</button></div>`
      : `${A.roomArt(room.id, room.animal)}<p class="eyebrow">FLOOR ${fi + 1} COMPLETE</p><h3>第 ${fi + 1} 層完成！</h3><p><b>${esc(room.name)}</b>亮燈了，${esc(room.who)}搬了進來。</p>
         <div class="quote">「${esc(room.line)}」<small>—— ${esc(room.who)}</small></div>
         <button class="btn" id="mOk">歡迎入住</button>`;
    openModal(html);
    $('mOk').onclick = () => { closeModal(); };
    if ($('mRoom')) $('mRoom').onclick = () => { closeModal(); roomDetail(fi); };
  }
  function crownArt() {
    return `<svg viewBox="0 0 200 120"><circle cx="100" cy="64" r="56" fill="#FFE7A3" opacity=".5"/><path d="M40 96 32 34l34 26 34-40 34 40 34-26-8 62z" fill="#F2C14E" stroke="#C9922A" stroke-width="4" stroke-linejoin="round"/><rect x="40" y="94" width="120" height="14" rx="5" fill="#E2A93B" stroke="#C9922A" stroke-width="4"/><circle cx="100" cy="20" r="7" fill="#DB8C99"/><circle cx="32" cy="34" r="6" fill="#5E9CC2"/><circle cx="168" cy="34" r="6" fill="#7FAE85"/><circle cx="100" cy="76" r="8" fill="#D9734E"/></svg>`;
  }

  // ---------- 足跡 ----------
  const MONTHS = (y, m) => `${y} 年 ${m + 1} 月`;
  function fmtTime(ts, withDate) {
    const d = new Date(ts), hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return withDate ? `${d.getMonth() + 1}月${d.getDate()}日 ${hm}` : hm;
  }
  function dayLabel(key, todayKey) {
    if (key === todayKey) return '今日';
    if (key === E.shiftDay(todayKey, -1)) return '昨日';
    const [, m, d] = key.split('-').map(Number);
    return `${m}月${d}日`;
  }
  function renderLog() {
    const st = E.stats(S);
    const tile = (ic, c, n, unit, label) => `<div class="tile" style="--tc:${c}">${icon(ic)}<b>${n}<small>${unit}</small></b><span>${label}</span></div>`;
    $('tiles').innerHTML = tile('layers', '#D9734E', st.total, '塊', '總共砌了') + tile('castle', '#5E9CC2', st.floors, '層', '已建好樓層')
      + tile('flame', '#E2A93B', st.streak, '日', '連續努力') + tile('target', '#7FAE85', st.best, '日', '最長連續紀錄');
    // 月曆
    const now = new Date();
    if (!calMonth) calMonth = { y: now.getFullYear(), m: now.getMonth() };
    const { y, m } = calMonth, first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate();
    $('calTitle').textContent = MONTHS(y, m);
    $('calPrev').innerHTML = icon('chevron'); $('calNext').innerHTML = icon('chevron');
    $('calNext').disabled = y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth());
    const dayColors = new Map();
    for (const e of S.log) { const k = E.dayKey(e.ts); if (!dayColors.has(k)) dayColors.set(k, []); dayColors.get(k).push(E.typeOf(S, e.type).color); }
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span class="day empty"></span>';
    for (let d = 1; d <= dim; d++) {
      const key = E.dayKey(new Date(y, m, d, 12).getTime()), cs = dayColors.get(key) || [];
      const fut = key > st.todayKey;
      const stack = cs.length > 4 ? cs.slice(0, 3).map((c) => `<i style="background:${c}"></i>`).join('') + `<em>+${cs.length - 3}</em>` : cs.map((c) => `<i style="background:${c}"></i>`).join('');
      cells += `<button class="day${cs.length ? ' has' : ''}${key === st.todayKey ? ' today' : ''}${key === selDay ? ' sel' : ''}${fut ? ' future' : ''}" data-day="${key}" type="button" ${fut ? 'disabled' : ''} aria-label="${m + 1}月${d}日 ${cs.length} 塊">${d}<span class="stack">${stack}</span></button>`;
    }
    $('calGrid').innerHTML = cells;
    $('calGrid').querySelectorAll('.day[data-day]').forEach((b) => b.onclick = () => { selDay = selDay === b.dataset.day ? null : b.dataset.day; sfx('tap'); renderLog(); });
    // 類別
    const types = S.types.filter((t) => !t.hidden || st.byType.get(t.id));
    const max = Math.max(1, ...types.map((t) => st.byType.get(t.id) || 0));
    $('typeBars').innerHTML = types.map((t) => { const n = st.byType.get(t.id) || 0; return `<div class="bar-row"><div class="bar-ic" style="background:${t.color}">${icon(t.icon)}</div><div><div class="bar-name">${esc(t.name)}</div><div class="bar-track"><i style="width:${n / max * 100}%;background:${t.color}"></i></div></div><div class="bar-n">${n}</div></div>`; }).join('');
    // 清單
    let list, title;
    if (selDay) { list = S.log.map((e, i) => ({ ...e, i })).filter((e) => E.dayKey(e.ts) === selDay).reverse(); title = `${dayLabel(selDay, st.todayKey)}的努力`; }
    else { list = S.log.map((e, i) => ({ ...e, i })).slice(-12).reverse(); title = '最近的努力'; }
    $('dayTitle').textContent = title;
    $('undoBtn').innerHTML = `${icon('undo')}收回最後一塊`;
    $('undoBtn').disabled = !S.log.length;
    let html = '', lastKey = '';
    for (const e of list) {
      const t = E.typeOf(S, e.type), k = E.dayKey(e.ts);
      const sub = !selDay && k !== lastKey ? dayLabel(k, st.todayKey) + ' · ' : '';
      lastKey = k;
      html += `<div class="entry"><div class="bar-ic" style="background:${t.color}">${icon(t.icon)}</div><div><b>${esc(t.name)}</b><small>${sub}第 ${e.i + 1} 塊磚 · 第 ${Math.floor(e.i / 10) + 1} 層</small></div><time>${fmtTime(e.ts)}</time></div>`;
    }
    $('dayList').innerHTML = html || `<p class="empty-note">${selDay ? '這一天未有磚塊。<br>休息也是重要的。' : '還未有磚塊。<br>按下面的「我努力了」砌第一塊吧！'}</p>`;
  }

  // ---------- 房間 ----------
  function renderRooms() {
    const st = E.stats(S), dates = E.floorDates(S);
    const show = Math.max(E.ROOMS.length, st.floors + 2);
    $('roomsLede').textContent = st.floors ? `已有 ${st.floors} 位朋友搬進城堡。砌滿一層，就會有新朋友來。` : '每砌滿 10 塊磚，就建好一層，亮燈的房間會有新朋友搬進來。';
    let html = '';
    for (let i = 0; i < show; i++) {
      const r = E.roomAt(i), open = i < st.floors, nextUp = i === st.floors;
      const sub = open ? `${r.who} · ${new Date(dates[i]).getMonth() + 1}月${new Date(dates[i]).getDate()}日` : nextUp ? `再砌 ${10 - st.inFloor} 塊就解鎖` : `第 ${i + 1} 層解鎖`;
      html += `<button class="room${open ? '' : ' locked'}${nextUp ? ' next-up' : ''}" data-room="${i}" type="button">${A.roomArt(r.id, r.animal, { locked: !open })}<span class="fl">${i + 1}F</span>${open ? '' : `<span class="lockmark">${icon('lock')}</span>`}<h4>${open || nextUp ? esc(r.name) : '神秘房間'}${r.round > 1 && open ? ` <small style="font-size:12px;color:var(--muted)">${r.round}</small>` : ''}</h4><p>${sub}</p></button>`;
    }
    $('roomGrid').innerHTML = html;
    $('roomGrid').querySelectorAll('.room').forEach((b) => b.onclick = () => { sfx('tap'); roomDetail(+b.dataset.room); });
  }
  function roomDetail(i) {
    const st = E.stats(S), r = E.roomAt(i), open = i < st.floors;
    if (!open) {
      const left = (i + 1) * 10 - st.total;
      openModal(`<div style="position:relative">${A.roomArt(r.id, r.animal, { locked: true })}</div><p class="eyebrow">FLOOR ${i + 1}</p><h3>${i === st.floors ? esc(r.name) : '神秘房間'}</h3><p>還差 <b>${left}</b> 塊磚就到這一層。<br>${i === st.floors ? '窗後面已經有人在等你了。' : '一塊一塊砌，總會到的。'}</p><div class="btn-col"><button class="btn" id="mGo">${icon('plus')}現在去砌</button><button class="btn ghost" id="mOk">遲些再來</button></div>`);
      $('mGo').onclick = () => { closeModal(); setTimeout(openEffortSheet, 200); };
      $('mOk').onclick = closeModal;
      return;
    }
    const d = new Date(E.floorDates(S)[i]);
    const bricks = S.log.slice(i * 10, i * 10 + 10).map((e) => E.typeOf(S, e.type).color);
    openModal(`${A.roomArt(r.id, r.animal)}<p class="eyebrow">FLOOR ${i + 1} · ${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}</p><h3>${esc(r.name)}</h3><p>${esc(r.who)}住在這裏。</p>
      <div class="quote">「${esc(r.line)}」<small>—— ${esc(r.who)}</small></div>
      <div class="dots" style="margin:-4px 0 18px" aria-label="這層的 10 塊磚">${bricks.map((c) => `<i class="on" style="background:${c};height:12px"></i>`).join('')}</div>
      <button class="btn" id="mOk">關閉</button>`);
    $('mOk').onclick = closeModal;
  }

  // ---------- 設定 ----------
  function renderSettings() {
    $('setName').value = S.name; $('setCastle').value = S.castle;
    $('setGoal').innerHTML = E.GOALS.map((g) => `<button type="button" role="radio" aria-checked="${g === S.goal}" class="${g === S.goal ? 'on' : ''}" data-g="${g}"><b>${g}</b><small>層 · ${g * 10}塊</small></button>`).join('');
    $('setGoal').querySelectorAll('button').forEach((b) => b.onclick = () => { S = { ...S, goal: +b.dataset.g }; save(); sfx('tap'); renderSettings(); renderAll(); });
    const active = E.activeTypes(S).length;
    $('addType').innerHTML = `${icon('plus')}新增`;
    $('addType').disabled = active >= E.MAX_TYPES;
    const st = E.stats(S);
    $('typeList').innerHTML = S.types.map((t) => `<button class="type-row${t.hidden ? ' off' : ''}" data-id="${t.id}" type="button"><div class="bar-ic" style="background:${t.color}">${icon(t.icon)}</div><div><b>${esc(t.name)}</b><small>${t.hidden ? '已隱藏 · ' : ''}${st.byType.get(t.id) || 0} 塊磚</small></div>${icon('edit')}</button>`).join('');
    $('typeList').querySelectorAll('.type-row').forEach((b) => b.onclick = () => editType(b.dataset.id));
    $('soundBtn').innerHTML = `${icon(S.sound ? 'sound' : 'mute')}音效<span class="sub">${S.sound ? '開' : '關'}</span>`;
    $('exportBtn').innerHTML = `${icon('down')}下載備份<span class="sub">${S.log.length} 塊磚</span>`;
    $('importLbl').innerHTML = `${icon('up')}還原備份<input type="file" id="importFile" accept="application/json,.json" hidden>`;
    $('importFile').onchange = importFile;
    $('demoLink').innerHTML = `${icon('eye')}看看示範城堡<span class="sub">不影響你的資料</span>`;
    $('linkBtn').innerHTML = `${icon('screen')}連接大屏幕<span class="sub">${link ? (screens > 0 ? '已連接' : '已配對 · 大屏幕未開') : 'iPad／電腦'}</span>`;
    $('linkBtn').hidden = DEMO;
    $('resetBtn').innerHTML = `${icon('trash')}重新開始`;
  }
  function editType(id) {
    const isNew = !id;
    const used = new Set(S.types.map((t) => t.color));
    let t = isNew ? { id: 't' + (Math.max(0, ...S.types.map((x) => +x.id.slice(1))) + 1), name: '', color: E.COLORS.find((c) => !used.has(c)) || E.COLORS[0], icon: 'heart' } : { ...S.types.find((x) => x.id === id) };
    const n = isNew ? 0 : E.stats(S).byType.get(id) || 0;
    const draw = () => {
      openSheet(`<h3>${isNew ? '新增努力項目' : '修改努力項目'}</h3><p class="sub">${isNew ? '例如：閱讀、執房、早起。' : `已有 ${n} 塊這種磚。改顏色後，舊磚也會一起換色。`}</p>
        <div class="edit-preview" style="--c:${t.color}"><div class="bar-ic" style="background:${t.color}">${icon(t.icon)}</div><b id="pvName">${esc(t.name || '項目名稱')}</b><div class="brick-demo"></div></div>
        <label class="field"><span>名稱</span><input id="tName" maxlength="8" value="${esc(t.name)}" placeholder="最多 8 個字" autocomplete="off"></label>
        <div class="field"><span>磚塊顏色</span><div class="swatches">${E.COLORS.map((c) => `<button type="button" style="--c:${c}" class="${c === t.color ? 'on' : ''}" data-c="${c}" aria-label="顏色"></button>`).join('')}</div></div>
        <div class="field"><span>圖示</span><div class="icon-pick" style="--c:${t.color}">${E.ICONS.map((i) => `<button type="button" class="${i === t.icon ? 'on' : ''}" data-i="${i}" aria-label="${i}">${icon(i)}</button>`).join('')}</div></div>
        <div class="btn-col"><button class="btn" id="tSave">${icon('check')}儲存</button>${isNew ? '' : `<button class="btn ghost" id="tHide">${t.hidden ? '重新顯示' : '隱藏這個項目'}</button>`}</div>`, true);
      const nameIn = $('tName');
      nameIn.oninput = () => { t.name = nameIn.value; $('pvName').textContent = t.name || '項目名稱'; };
      $('sheetBody').querySelectorAll('.swatches button').forEach((b) => b.onclick = () => { t.color = b.dataset.c; t.name = nameIn.value; draw(); });
      $('sheetBody').querySelectorAll('.icon-pick button').forEach((b) => b.onclick = () => { t.icon = b.dataset.i; t.name = nameIn.value; draw(); });
      $('tSave').onclick = () => {
        const name = E.clean(nameIn.value, 8);
        if (!name) { nameIn.focus(); nameIn.style.borderColor = '#C0473A'; return; }
        t.name = name;
        S = { ...S, types: isNew ? [...S.types, t] : S.types.map((x) => (x.id === t.id ? t : x)) };
        save(); closeSheet(); renderAll();
      };
      if ($('tHide')) $('tHide').onclick = () => {
        if (!t.hidden && E.activeTypes(S).length <= 1) return toast({ title: '最少要保留一個項目', text: '先新增另一個項目，再隱藏這個。' });
        if (t.hidden && E.activeTypes(S).length >= E.MAX_TYPES) return toast({ title: `最多 ${E.MAX_TYPES} 個項目`, text: '先隱藏另一個項目。' });
        S = { ...S, types: S.types.map((x) => (x.id === t.id ? { ...x, hidden: !x.hidden } : x)) };
        save(); closeSheet(); renderAll();
      };
    };
    draw();
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `努力城堡備份-${E.dayKey(Date.now())}.json`;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function importFile(ev) {
    const f = ev.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let d = null; try { d = E.read(JSON.parse(r.result)); } catch {}
      if (!d) return toast({ title: '還原失敗', text: '這個檔案不是努力城堡的備份。' });
      confirmBox({ title: '用備份取代現在的城堡？', text: `備份有 ${d.log.length} 塊磚。現在的 ${S.log.length} 塊磚會被取代。`, ok: '還原', danger: true, onOk: () => { S = { ...d, setup: true }; save(); renderAll({ scroll: 'top' }); toast({ title: '已還原', text: `${d.log.length} 塊磚回來了。` }); } });
    };
    r.readAsText(f);
  }
  function resetAll() {
    confirmBox({
      title: '重新開始？', text: `現在的 ${S.log.length} 塊磚會全部清除。建議先下載備份。`, ok: '清除並重新開始', danger: true, input: '輸入「重新開始」確認',
      onOk: () => { S = E.fresh(); save(); renderAll({ scroll: 'top' }); setView('castle'); welcome(); },
    });
  }

  // ---------- 歡迎 ----------
  function welcome() {
    const mini = A.scene({ colors: ['#D9734E', '#E2A93B', '#7FAE85', '#5E9CC2', '#9A7BB8', '#DB8C99', '#D9734E', '#7FAE85', '#E2A93B', '#5E9CC2', '#9A7BB8', '#D9734E', '#DB8C99', '#7FAE85'], goal: 99, castle: '', minH: 0, room: (i) => E.roomAt(i), seed: 3, crown: false });
    let goal = S.goal;
    openModal(`<div class="welcome-art">${mini.svg.replace('class="scene-svg"', 'class="scene-svg" preserveAspectRatio="xMidYMax slice"').replace(/ width="360" height="\d+"/, '')}</div>
      <p class="eyebrow">WELCOME</p><h3>歡迎來到努力城堡</h3><p>每做完一件努力的事，就砌一塊磚。<br>砌滿 10 塊建好一層，會有新朋友搬進來。</p>
      <div style="text-align:left;margin-top:16px">
        <label class="field" style="margin-bottom:12px"><span>小朋友名字</span><input id="wName" maxlength="12" placeholder="例如：朗朗" autocomplete="off" value="${esc(S.name)}"></label>
        <label class="field" style="margin-bottom:12px"><span>城堡名字（可留空）</span><input id="wCastle" maxlength="16" placeholder="例如：晨光城堡" autocomplete="off" value="${esc(S.castle)}"></label>
        <div class="field"><span>想砌多高？</span><div class="seg" id="wGoal">${E.GOALS.map((g) => `<button type="button" data-g="${g}" class="${g === goal ? 'on' : ''}"><b>${g}</b><small>層</small></button>`).join('')}</div></div>
      </div>
      <div class="btn-col"><button class="btn" id="wGo">開始砌城堡</button><a class="btn ghost" href="?demo" style="text-decoration:none">先看看示範</a></div>`);
    $('wGoal').querySelectorAll('button').forEach((b) => b.onclick = () => { goal = +b.dataset.g; $('wGoal').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); sfx('tap'); });
    $('wGo').onclick = () => {
      S = { ...S, name: E.clean($('wName').value, 12), castle: E.clean($('wCastle').value, 16), goal, setup: true };
      save(); closeModal(); renderAll({ scroll: 'top' });
      setTimeout(() => toast({ title: S.name ? `${S.name}，準備好了！` : '準備好了！', text: '做完一件努力的事，就按下面的「我努力了」。' }), 350);
    };
  }

  // ---------- 共用 UI ----------
  function openSheet(html, keep) {
    const sh = $('sheet');
    $('sheetBody').innerHTML = html;
    if (keep && !sh.hidden) return;
    $('scrim').hidden = false; $('scrim').classList.remove('out');
    sh.hidden = false; sh.classList.remove('out');
    $('scrim').onclick = closeSheet;
  }
  function closeSheet() {
    const sh = $('sheet'); if (sh.hidden) return;
    sh.classList.add('out'); $('scrim').classList.add('out');
    setTimeout(() => { sh.hidden = true; $('scrim').hidden = true; }, 210);
  }
  function openModal(html) { $('modalCard').innerHTML = html; $('modal').hidden = false; }
  function closeModal() { $('modal').hidden = true; $('modalCard').innerHTML = ''; }
  function confirmBox({ title, text, ok, danger, onOk, input }) {
    openModal(`<h3 style="margin-top:6px">${esc(title)}</h3><p>${esc(text)}</p>${input ? `<label class="field" style="text-align:left;margin-top:14px"><span>${esc(input)}</span><input id="cIn" autocomplete="off"></label>` : ''}<div class="btn-row"><button class="btn ghost" id="cNo">取消</button><button class="btn ${danger ? 'danger' : ''}" id="cYes" ${input ? 'disabled' : ''}>${esc(ok)}</button></div>`);
    if (input) $('cIn').oninput = () => { $('cYes').disabled = $('cIn').value.trim() !== '重新開始'; };
    $('cNo').onclick = closeModal;
    $('cYes').onclick = () => { closeModal(); onOk(); };
  }
  function toast({ color, title, text, undo }) {
    const el = $('toast');
    clearTimeout(toastTimer);
    el.classList.remove('out'); el.hidden = false;
    el.style.setProperty('--c', color || '#E2A93B');
    el.innerHTML = `<div class="t-brick"></div><div><b>${esc(title)}</b><span>${esc(text)}</span></div>${undo ? '<button id="tUndo" type="button">按錯了</button>' : '<span></span>'}`;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    if (undo) $('tUndo').onclick = () => { hideToast(); undoLast(true); };
    toastTimer = setTimeout(hideToast, undo ? 4200 : 3200);
  }
  function hideToast() { const el = $('toast'); el.classList.add('out'); setTimeout(() => { el.hidden = true; }, 240); }

  // 彩紙
  function confetti(count) {
    const cv = $('confetti'), ctx = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = [...new Set(colors().concat(['#E2A93B', '#F2C14E', '#FBEFD9']))];
    const ps = Array.from({ length: count }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 80, y: innerHeight * 0.45, vx: (Math.random() - 0.5) * 13, vy: -Math.random() * 15 - 5, w: 6 + Math.random() * 8, h: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[Math.floor(Math.random() * cols.length)] }));
    let frame = 0;
    (function step() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of ps) { p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
      if (++frame < 170) requestAnimationFrame(step); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })();
  }

  // ---------- 導航 ----------
  function setView(v) {
    view = v;
    document.querySelectorAll('.view').forEach((el) => el.classList.toggle('active', el.id === 'view-' + v));
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === v));
    if (v === 'log') renderLog();
    if (v === 'rooms') renderRooms();
    if (v === 'settings') renderSettings();
    if (v === 'castle') { fitScene(); renderScene(); }
  }
  function renderAll(opts = {}) {
    renderHud();
    if (link) renderRemote();
    if (view === 'castle' || opts.scroll) renderScene(opts);
    if (view === 'log') renderLog();
    if (view === 'rooms') renderRooms();
    if (view === 'settings') renderSettings();
  }

  // ---------- 事件 ----------
  const tabIcons = { castle: 'castle', log: 'calendar', rooms: 'rooms', settings: 'gear' };
  document.querySelectorAll('.tab').forEach((t) => { t.querySelector('i').innerHTML = icon(tabIcons[t.dataset.view]); t.onclick = () => { if (view !== t.dataset.view) { sfx('tap'); setView(t.dataset.view); } }; });
  $('mainBtn').querySelector('i').outerHTML = icon('plus');
  $('mainBtn').onclick = openEffortSheet;
  $('floorCard').onclick = () => { sfx('tap'); roomDetail(E.stats(S).floors); };
  $('calPrev').onclick = () => { calMonth.m--; if (calMonth.m < 0) { calMonth.m = 11; calMonth.y--; } selDay = null; renderLog(); };
  $('calNext').onclick = () => { calMonth.m++; if (calMonth.m > 11) { calMonth.m = 0; calMonth.y++; } selDay = null; renderLog(); };
  $('undoBtn').onclick = () => undoLast(false);
  $('addType').onclick = () => editType(null);
  $('soundBtn').onclick = () => { S = { ...S, sound: !S.sound }; save(); renderSettings(); sfx('tap'); };
  $('exportBtn').onclick = exportData;
  $('linkBtn').onclick = () => { sfx('tap'); linkSheet(); };
  $('chipLink').onclick = () => { sfx('tap'); linkSheet(); };
  $('resetBtn').onclick = resetAll;
  $('setName').onchange = () => { S = { ...S, name: E.clean($('setName').value, 12) }; save(); renderHud(); };
  $('setCastle').onchange = () => { S = { ...S, castle: E.clean($('setCastle').value, 16) }; save(); renderHud(); renderScene(); };
  sceneEl.addEventListener('click', (ev) => {
    const win = ev.target.closest('.win.lit');
    if (win) { sfx('tap'); return roomDetail(+win.dataset.room); }
    const b = ev.target.closest('.brick');
    if (b) {
      const i = +b.dataset.i, e = S.log[i], t = E.typeOf(S, e.type);
      b.classList.remove('drop', 'flash'); void b.getBoundingClientRect(); b.classList.add('flash');
      sfx('tap');
      toast({ color: t.color, title: `第 ${i + 1} 塊 · ${t.name}`, text: fmtTime(e.ts, true) });
    }
  });
  sceneEl.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.closest('.win.lit')) roomDetail(+ev.target.closest('.win.lit').dataset.room); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { if (!$('modal').hidden && !$('wGo')) closeModal(); else closeSheet(); } });
  let rz = 0;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => view === 'castle' && renderScene(), 150); });

  if (DEMO) { $('demoBar').hidden = false; document.body.classList.add('demo'); }
  renderHud();
  renderLink();
  renderScene({ scroll: 'top' });
  if (!S.setup) setTimeout(welcome, 250);
  if (link) { linkPush({ kind: 'sync' }); }
  if (params.has('pair') && !DEMO) setTimeout(() => { if (S.setup) { setView('settings'); linkSheet(); } }, 400);

  if (params.has('test')) window.__ec = { get state() { return S; }, set state(v) { S = v; save(); renderAll({ scroll: 'top' }); }, add: addBrick, E };
})();

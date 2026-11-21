// 努力城堡大屏幕：只看不改。手機是資料來源，經連線中轉每秒取最新狀態。
(function () {
  'use strict';
  const E = window.EffortEngine, A = window.EffortArt, { icon, esc } = A;
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const API = params.get('link') || 'https://edgelab-web-porscheyeung.zocomputer.io/effort-link';
  const KEY = 'effort-castle-screen-v1';
  const DEMO = params.has('demo');

  let room = null, seq = -1, paired = false, S = null, code = null;
  let failures = 0, lastOk = 0, sound = false;
  let pollTimer = 0, popTimer = 0, celTimer = 0, noteTimer = 0;

  // ---------- 音效（要先點一下畫面才可發聲） ----------
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
    if (!sound || !ac) return;
    try {
      if (ac.state === 'suspended') ac.resume();
      if (kind === 'brick') { tone(180, 0.32, 0.12, 'triangle', 0.32); tone(90, 0.32, 0.16, 'sine', 0.32); tone(660, 0.36, 0.18, 'sine', 0.07); }
      else if (kind === 'tap') tone(520, 0, 0.06, 'sine', 0.06);
      else if (kind === 'floor') [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5 + i * 0.11, 0.5, 'triangle', 0.14));
      else if (kind === 'goal') [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.4 + i * 0.13, 0.6, 'triangle', 0.14));
      else if (kind === 'hello') [659, 988].forEach((f, i) => tone(f, i * 0.12, 0.3, 'sine', 0.08));
    } catch {}
  }
  function unlockAudio() {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch {}
  }

  // 保持屏幕常亮
  let wake = null;
  async function keepAwake() {
    try { if ('wakeLock' in navigator && !wake && document.visibilityState === 'visible') { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch {}
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { keepAwake(); poll(true); } });

  // ---------- 連線 ----------
  async function api(path, opts = {}) {
    const r = await fetch(API + path, { method: opts.body ? 'POST' : 'GET', headers: opts.body ? { 'content-type': 'text/plain' } : {}, body: opts.body ? JSON.stringify(opts.body) : undefined, cache: 'no-store' });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
  }
  async function openRoom(newCode) {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY))?.room || null; } catch {}
    const r = await api('/api/screen', { body: { room: saved, newCode: !!newCode } });
    if (!r.ok) throw new Error(r.data.error || 'offline');
    room = r.data.room; seq = -1;
    try { localStorage.setItem(KEY, JSON.stringify({ room })); } catch {}
    apply(r.data, true);
  }
  async function poll(now) {
    clearTimeout(pollTimer);
    if (!room) {
      try { await openRoom(); failures = 0; } catch { failures++; renderConn(); }
      pollTimer = setTimeout(poll, failures ? Math.min(8000, 1500 * failures) : 1000);
      return;
    }
    try {
      const r = await api(`/api/screen/${encodeURIComponent(room)}?since=${seq}`);
      if (r.status === 404) { room = null; try { localStorage.removeItem(KEY); } catch {} }
      else if (r.ok) { failures = 0; lastOk = Date.now(); apply(r.data, false); }
      else failures++;
    } catch { failures++; }
    renderConn();
    pollTimer = setTimeout(poll, document.visibilityState === 'hidden' ? 5000 : failures ? Math.min(8000, 1500 * failures) : (now ? 600 : 1000));
  }

  function apply(d, first) {
    const wasPaired = paired;
    paired = !!d.paired;
    if (d.code !== undefined && d.code !== code) { code = d.code; renderCode(); }
    if (!paired) { S = null; seq = d.seq ?? seq; showPair(); if (wasPaired) note('手機已斷開連接，可用新號碼再連接。'); return; }
    const events = Array.isArray(d.events) ? d.events : [];
    if (d.state) {
      const st = E.read({ ...d.state, version: 1, setup: true });
      if (st) S = st;
    }
    if (typeof d.seq === 'number') seq = d.seq;
    if (!S) { showPair(); return; }
    showLive();
    if (!wasPaired && !first) { sfx('hello'); note('手機已連接！在手機按「我努力了」，城堡就會在這裏長高。'); }
    const bricks = events.filter((e) => e.event && e.event.kind === 'brick');
    if (bricks.length && !first) {
      const ev = bricks[bricks.length - 1].event;
      const fresh = Number.isInteger(ev.i) && ev.i < S.log.length ? ev.i : S.log.length - 1;
      const floorDone = bricks.map((b) => b.event.floorDone).filter((f) => Number.isInteger(f) && f >= 0).pop() ?? -1;
      const goalDone = bricks.some((b) => b.event.goalDone);
      renderAll({ fresh, freshFloor: floorDone, scroll: 'brick' });
      sfx('brick');
      if (floorDone >= 0) setTimeout(() => celebrate(floorDone, goalDone), 900);
      else brickPop(fresh, ev.praise);
    } else if (events.some((e) => e.event && e.event.kind === 'undo') && !first) {
      renderAll({});
      note('收回了一塊磚。按錯不要緊。');
    } else if (events.length || first || d.state) {
      renderAll({ scroll: first ? 'build' : undefined });
    }
  }

  // ---------- 畫面 ----------
  let view = '';
  function showPair() {
    if (view === 'pair') return; view = 'pair';
    $('liveView').hidden = true; $('pairView').hidden = false;
    sceneEl.innerHTML = '';
    const mini = A.scene({ colors: ['#D9734E', '#E2A93B', '#7FAE85', '#5E9CC2', '#9A7BB8', '#DB8C99', '#D9734E', '#7FAE85', '#E2A93B', '#5E9CC2', '#9A7BB8', '#D9734E', '#DB8C99', '#7FAE85', '#5E9CC2', '#E2A93B', '#D9734E', '#9A7BB8', '#7FAE85', '#DB8C99', '#E2A93B', '#5E9CC2', '#D9734E'], goal: 99, castle: '', minH: 0, room: (i) => E.roomAt(i), seed: 3, crown: false, fresh: -1, freshFloor: -1 });
    $('pairArt').innerHTML = mini.svg.replace('class="scene-svg"', 'class="scene-svg" preserveAspectRatio="xMidYMax slice"').replace(/ width="360" height="\d+"/, '');
    renderCode();
  }
  function renderCode() {
    const box = $('code');
    if (!box) return;
    const cols = ['#D9734E', '#E2A93B', '#7FAE85', '#5E9CC2'];
    box.innerHTML = code ? [...code].map((c, i) => `<span style="--c:${cols[i]};animation-delay:${i * 70}ms">${c}</span>`).join('') : '<em>正在取得號碼…</em>';
    box.setAttribute('aria-label', code ? `配對號碼 ${code.split('').join(' ')}` : '正在取得號碼');
  }
  function renderConn() {
    const off = failures >= 3 || (lastOk && Date.now() - lastOk > 12000);
    if ($('pairStatus')) $('pairStatus').innerHTML = off ? `<i class="dot off"></i>連線中斷，正在重試…` : code ? `<i class="dot wait"></i>等待手機連接` : '';
    const pill = $('livePill');
    if (pill) {
      pill.className = 'live-pill' + (off ? ' off' : '');
      pill.innerHTML = `<i class="dot${off ? ' off' : ''}"></i>${off ? '連線中斷，重試中' : '手機已連接'}`;
    }
  }
  function showLive() {
    if (view === 'live') return; view = 'live';
    $('pairView').hidden = true; $('liveView').hidden = false;
    $('pairArt').innerHTML = '';
  }

  const wrap = $('sceneWrap'), sceneEl = $('scene');
  function renderScene(opts = {}) {
    const w = wrap.clientWidth || 400, h = wrap.clientHeight || 700;
    const st = E.stats(S);
    const info = A.scene({
      colors: S.log.map((e) => E.typeOf(S, e.type).color), goal: S.goal, castle: S.castle, minH: h * 360 / w,
      fresh: opts.fresh ?? -1, freshFloor: opts.freshFloor ?? -1, crown: st.goalDone, room: (i) => E.roomAt(i), seed: 11,
    });
    const keep = wrap.scrollHeight - wrap.scrollTop;
    sceneEl.innerHTML = info.svg;
    const k = w / 360;
    if (opts.scroll === 'brick' && opts.fresh >= 0) {
      const target = Math.max(0, info.brickY(opts.fresh) * k - h * 0.5);
      wrap.scrollTop = wrap.scrollHeight - keep;
      wrap.scrollTo({ top: target, behavior: 'smooth' });
    } else if (opts.scroll === 'build') {
      const n = S.log.length, target = n ? Math.max(0, info.brickY(Math.max(0, n - 1)) * k - h * 0.5) : wrap.scrollHeight;
      wrap.scrollTop = target;
    } else wrap.scrollTop = wrap.scrollHeight - keep;
  }
  function renderPanel(popDot = -1) {
    const st = E.stats(S), fi = st.floors, r = E.roomAt(fi);
    $('title').textContent = S.name ? `${S.name}的努力城堡` : '努力城堡';
    $('stageName').innerHTML = `${icon('castle')}<span>${esc(S.castle || '一次努力，一塊磚')}</span>`;
    document.title = `${$('title').textContent} · 大屏幕`;
    $('total').textContent = st.total;
    const pct = Math.min(100, Math.round(st.total / st.goalBricks * 100));
    $('goalText').textContent = st.goalDone ? `目標 ${S.goal} 層已達成，繼續向上砌` : `目標 ${S.goal} 層 · ${st.goalBricks} 塊`;
    $('goalPct').textContent = st.goalDone ? '' : `${pct}%`;
    $('goalBar').style.width = pct + '%';
    $('goalBar').parentElement.classList.toggle('done', st.goalDone);
    const slots = Array.from({ length: 10 }, (_, j) => {
      const idx = fi * 10 + j, on = idx < S.log.length;
      return `<i class="${on ? 'on' : ''}${j === popDot ? ' pop' : ''}" style="${on ? `--c:${E.typeOf(S, S.log[idx].type).color}` : ''}"></i>`;
    }).join('');
    const left = 10 - st.inFloor;
    $('floorCard').innerHTML = `<div class="fl-art">${A.roomArt(r.id, r.animal, { locked: true })}<span class="fl-lock">${icon('lock')}</span></div>
      <div class="fl-main"><p class="k">第 ${fi + 1} 層 · ${esc(r.name)}</p><h2>再砌 <b>${left}</b> 塊，${esc(r.who)}就會搬進來</h2><div class="slots">${slots}</div></div>`;
    $('tiles').innerHTML = [
      ['flame', '#E2A93B', st.streak, '日', '連續努力'],
      ['layers', '#D9734E', st.today, '塊', '今日砌了'],
      ['rooms', '#5E9CC2', st.floors, '位', '朋友已入住'],
    ].map(([ic, c, n, u, l]) => `<div class="tile card" style="--tc:${c}"><span class="t-ic">${icon(ic)}</span><div><b>${n}<small>${u}</small></b><span>${l}</span></div></div>`).join('');
    const today = S.log.filter((e) => E.dayKey(e.ts) === st.todayKey);
    const groups = new Map();
    for (const e of today) groups.set(e.type, (groups.get(e.type) || 0) + 1);
    $('todayN').textContent = today.length ? `${today.length} 塊` : '';
    $('todayList').innerHTML = groups.size
      ? [...groups].map(([id, n]) => { const t = E.typeOf(S, id); return `<div class="tg" style="--c:${t.color}"><span class="tg-ic">${icon(t.icon)}</span><b>${esc(t.name)}</b><em>× ${n}</em></div>`; }).join('')
      : `<p class="empty">今日還未有磚塊。<br>做完一件努力的事，在手機按一下就會出現。</p>`;
    const hm = (ts) => { const d = new Date(ts); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
    const base = S.log.length - today.length;
    $('todayList').innerHTML += today.length ? `<div class="recent">${today.map((e, k) => ({ e, i: base + k })).slice(-6).reverse().map(({ e, i }) => { const t = E.typeOf(S, e.type); return `<div class="rc" style="--c:${t.color}"><time>${hm(e.ts)}</time><i></i><b>${esc(t.name)}</b><span>第 ${i + 1} 塊</span></div>`; }).join('')}</div>` : '';
  }
  function renderAll(opts) {
    if (!S) return;
    renderPanel(opts.fresh >= 0 ? opts.fresh % 10 : -1);
    renderScene(opts);
  }

  // ---------- 慶祝 ----------
  function brickPop(i, praiseIdx) {
    const e = S.log[i]; if (!e) return;
    const t = E.typeOf(S, e.type);
    const praise = E.PRAISE[Number.isInteger(praiseIdx) && E.PRAISE[praiseIdx] ? praiseIdx : Math.floor(Math.random() * E.PRAISE.length)];
    const el = $('brickPop');
    clearTimeout(popTimer);
    el.style.setProperty('--c', t.color);
    el.innerHTML = `<div class="bp-brick">${icon(t.icon)}</div><div class="bp-text"><b>${esc(t.name)} <em>+1</em></b><span>${esc(praise)}</span><small>第 ${i + 1} 塊磚 · 第 ${Math.floor(i / 10) + 1} 層</small></div>`;
    el.hidden = false; el.classList.remove('out'); el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    popTimer = setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.hidden = true; }, 350); }, 4200);
  }
  function celebrate(fi, goalDone) {
    clearTimeout(celTimer);
    $('brickPop').hidden = true;
    const r = E.roomAt(fi), st = E.stats(S);
    sfx(goalDone ? 'goal' : 'floor');
    confetti(goalDone ? 320 : 180);
    $('celCard').innerHTML = goalDone
      ? `<div class="cel-crown">${crownArt()}</div><p class="eyebrow">GOAL COMPLETE</p><h2>努力城堡建成了！</h2><div class="cel-num">${st.total}</div><p>塊磚，每一塊都是${S.name ? esc(S.name) : '你'}自己努力換來的。<br>第 ${fi + 1} 層的${esc(r.name)}也亮燈了，${esc(r.who)}搬了進來。</p>`
      : `<div class="cel-art">${A.roomArt(r.id, r.animal)}</div><div class="cel-text"><p class="eyebrow">FLOOR ${fi + 1} COMPLETE</p><h2>第 ${fi + 1} 層完成！</h2><p><b>${esc(r.name)}</b>亮燈了，${esc(r.who)}搬了進來。</p><blockquote>「${esc(r.line)}」<small>—— ${esc(r.who)}</small></blockquote></div>`;
    $('celCard').className = 'cel-card' + (goalDone ? ' goal' : '');
    $('celebrate').hidden = false;
    celTimer = setTimeout(closeCelebrate, goalDone ? 14000 : 10000);
  }
  function closeCelebrate() { clearTimeout(celTimer); $('celebrate').hidden = true; }
  function crownArt() {
    return `<svg viewBox="0 0 200 120"><circle cx="100" cy="64" r="56" fill="#FFE7A3" opacity=".5"/><path d="M40 96 32 34l34 26 34-40 34 40 34-26-8 62z" fill="#F2C14E" stroke="#C9922A" stroke-width="4" stroke-linejoin="round"/><rect x="40" y="94" width="120" height="14" rx="5" fill="#E2A93B" stroke="#C9922A" stroke-width="4"/><circle cx="100" cy="20" r="7" fill="#DB8C99"/><circle cx="32" cy="34" r="6" fill="#5E9CC2"/><circle cx="168" cy="34" r="6" fill="#7FAE85"/><circle cx="100" cy="76" r="8" fill="#D9734E"/></svg>`;
  }
  function note(text) {
    const el = $('note'); clearTimeout(noteTimer);
    el.textContent = text; el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    noteTimer = setTimeout(() => { el.hidden = true; }, 4500);
  }
  function confetti(count) {
    const cv = $('confetti'), ctx = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = [...new Set(S.types.map((t) => t.color).concat(['#E2A93B', '#F2C14E', '#FBEFD9']))];
    const sc = Math.max(1, innerWidth / 700);
    const ps = Array.from({ length: count }, (_, k) => ({ x: innerWidth * (k % 2 ? 0.3 : 0.7) + (Math.random() - 0.5) * 120, y: innerHeight * 0.55, vx: (Math.random() - 0.5) * 16 * sc, vy: (-Math.random() * 17 - 6) * Math.sqrt(sc), w: (7 + Math.random() * 9) * sc, h: (4 + Math.random() * 6) * sc, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[Math.floor(Math.random() * cols.length)] }));
    let frame = 0;
    (function step() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of ps) { p.vy += 0.4 * Math.sqrt(sc); p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
      if (++frame < 200) requestAnimationFrame(step); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })();
  }

  // ---------- 工具列 ----------
  function renderTools() {
    $('soundBtn').innerHTML = `${icon(sound ? 'sound' : 'mute')}<span>${sound ? '聲音開' : '點一下開聲音'}</span>`;
    $('soundBtn').classList.toggle('hot', !sound);
    const fs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    $('fullBtn').innerHTML = `${icon(fs ? 'shrink' : 'expand')}<span>${fs ? '離開全螢幕' : '全螢幕'}</span>`;
    $('fullBtn').hidden = !(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
    $('swapBtn').innerHTML = `${icon('swap')}<span>換一部手機</span>`;
  }
  $('soundBtn').onclick = (ev) => { ev.stopPropagation(); unlockAudio(); sound = !sound; renderTools(); sfx('tap'); };
  $('fullBtn').onclick = (ev) => {
    ev.stopPropagation();
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
  };
  document.addEventListener('fullscreenchange', renderTools);
  document.addEventListener('webkitfullscreenchange', renderTools);
  $('swapBtn').onclick = async (ev) => {
    ev.stopPropagation();
    if (!confirm('換一部手機？大屏幕會顯示新號碼，現在這部手機會斷開。')) return;
    try { const r = await api('/api/screen', { body: { room, newCode: true } }); if (r.ok) { code = r.data.code; paired = false; S = null; view = ''; showPair(); renderConn(); } } catch { note('未能連線，請稍後再試。'); }
  };
  // 第一次點畫面：開聲音、保持常亮
  document.addEventListener('pointerdown', () => { if (!ac) { unlockAudio(); sound = true; renderTools(); } keepAwake(); }, { once: false, capture: true });
  $('celebrate').onclick = closeCelebrate;
  let rz = 0;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => S && renderScene({}), 150); });

  renderTools();
  if (DEMO) {
    S = E.demo(); paired = true; showLive(); renderAll({ scroll: 'build' });
    $('livePill').innerHTML = '<i class="dot"></i>示範模式';
    window.__screenDemo = { brick: (t) => { const before = S.log.length; S = E.add(S, t || 't1'); const out = E.outcome(before, S.log.length, S.goal); renderAll({ fresh: S.log.length - 1, freshFloor: out.floorDone, scroll: 'brick' }); if (out.floorDone >= 0) setTimeout(() => celebrate(out.floorDone, out.goalDone), 900); else brickPop(S.log.length - 1); } };
    return;
  }
  code = null; showPair(); renderConn();
  poll(true);
  setInterval(renderConn, 3000);
  if (params.has('test')) window.__screen = { get state() { return S; }, get room() { return room; }, get code() { return code; } };
})();

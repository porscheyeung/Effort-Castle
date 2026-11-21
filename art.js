// 努力城堡圖像：全部用 SVG 字串畫，不需外部圖片。
(function (root) {
  'use strict';
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICON = {
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M9 7h7"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    eraser: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    ball: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M12 2a14.5 14.5 0 0 1 0 20"/><path d="M2 12h20"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    brush: '<path d="M18.4 2.6 9 12l3 3 9.4-9.4a2.1 2.1 0 0 0-3-3Z"/><path d="M9 12c-2.5 0-4 1.5-4 4 0 1.5-1 3-3 3 1.5 2 4 3 6 3 3 0 4-2.5 4-4.5"/>',
    run: '<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6-1.9 0-2.5 1.8-2.5 3.5 0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0Z"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    castle: '<path d="M3 21V9h3v2h2V9h3v3h2V9h3v2h2V9h3v12z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/><path d="M12 9V3l4 1.5-4 1.5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    rooms: '<path d="M4 21V10a8 8 0 0 1 16 0v11z"/><path d="M4 15h16M12 2v19"/>',
    gear: '<path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    down: '<path d="M12 15V3M7 10l5 5 5-5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    up: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    sound: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    mute: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.2.3 1.6 1.4 2.7 2.5 2.7z"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    lock: '<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    screen: '<rect x="2" y="3" width="20" height="14" rx="2.5"/><path d="M8 21h8M12 17v4"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
    shrink: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
    swap: '<path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/>',
    unlink: '<path d="M18.8 13.2 21 11a5 5 0 0 0-7-7l-2.2 2.2M5.2 10.8 3 13a5 5 0 0 0 7 7l2.2-2.2"/><path d="M2 2l20 20"/>',
  };
  const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ICON.heart}</svg>`;

  // ---------- 小住客頭像（以 0,0 為中心，半徑約 20） ----------
  const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2A40"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
  const blush = (dx = 11, y = 6) => `<ellipse cx="${-dx}" cy="${y}" rx="4" ry="2.4" fill="#F0A3A0" opacity=".7"/><ellipse cx="${dx}" cy="${y}" rx="4" ry="2.4" fill="#F0A3A0" opacity=".7"/>`;
  const ANIMAL = {
    owl: () => `<path d="M-18 -12 -14 -26 -6 -16Z M18 -12 14 -26 6 -16Z" fill="#8A6648"/><circle r="19" fill="#9C7A5B"/><ellipse cy="6" rx="12" ry="11" fill="#E8D6B9"/><circle cx="-7" cy="-3" r="7" fill="#FFF6E5"/><circle cx="7" cy="-3" r="7" fill="#FFF6E5"/>${eye(-7, -3, 3.4)}${eye(7, -3, 3.4)}<path d="M-3 3 0 8 3 3Z" fill="#E2A93B"/>`,
    bear: () => `<circle cx="-14" cy="-14" r="7" fill="#A97954"/><circle cx="14" cy="-14" r="7" fill="#A97954"/><circle cx="-14" cy="-14" r="3.5" fill="#D9A981"/><circle cx="14" cy="-14" r="3.5" fill="#D9A981"/><circle r="19" fill="#A97954"/><ellipse cy="7" rx="9" ry="7" fill="#E7C9A6"/><ellipse cy="4" rx="3.4" ry="2.4" fill="#3B2A24"/>${eye(-7, -3)}${eye(7, -3)}${blush(13, 5)}`,
    rabbit: () => `<ellipse cx="-7" cy="-25" rx="5.5" ry="15" fill="#F1E8DC"/><ellipse cx="7" cy="-25" rx="5.5" ry="15" fill="#F1E8DC"/><ellipse cx="-7" cy="-24" rx="2.5" ry="10" fill="#F2B6B8"/><ellipse cx="7" cy="-24" rx="2.5" ry="10" fill="#F2B6B8"/><circle r="18" fill="#F1E8DC"/>${eye(-7, -2)}${eye(7, -2)}<path d="M-2.5 4h5L0 7Z" fill="#E58C95"/>${blush(12, 6)}`,
    fox: () => `<path d="M-18 -6-14-26-3-15Z M18-6 14-26 3-15Z" fill="#D9733F"/><path d="M-14-10-13-20-7-14Z M14-10 13-20 7-14Z" fill="#3B2A24"/><circle r="18" fill="#D9733F"/><path d="M-18 2Q-9 4 0 14 9 4 18 2 14 16 0 18-14 16-18 2Z" fill="#FFF3E2"/>${eye(-7, -3)}${eye(7, -3)}<ellipse cy="10" rx="3" ry="2.2" fill="#3B2A24"/>`,
    hedgehog: () => `<path d="M-22 6-26-6-20-10-23-20-13-19-11-28-3-22 4-29 9-21 18-25 18-16 26-14 21-5 26 4Z" fill="#7B5A43"/><circle cy="2" r="17" fill="#E2C49D"/>${eye(-6, 0)}${eye(6, 0)}<circle cy="7" r="2.6" fill="#3B2A24"/>${blush(11, 8)}`,
    beaver: () => `<circle cx="-14" cy="-13" r="5" fill="#7A5236"/><circle cx="14" cy="-13" r="5" fill="#7A5236"/><circle r="19" fill="#8E5F3E"/><ellipse cy="7" rx="10" ry="8" fill="#C8A07A"/><ellipse cy="3" rx="3.5" ry="2.4" fill="#3B2A24"/><rect x="-3" y="8" width="6" height="6" rx="1" fill="#FFF8EC"/><path d="M0 8v6" stroke="#C8A07A" stroke-width=".8"/>${eye(-7, -4)}${eye(7, -4)}`,
    mouse: () => `<circle cx="-15" cy="-14" r="10" fill="#B9B0AA"/><circle cx="15" cy="-14" r="10" fill="#B9B0AA"/><circle cx="-15" cy="-14" r="6" fill="#EFB7B7"/><circle cx="15" cy="-14" r="6" fill="#EFB7B7"/><circle r="17" fill="#C8C0B9"/>${eye(-6, -1)}${eye(6, -1)}<circle cy="6" r="2.6" fill="#E58C95"/><path d="M-4 7-16 5M-4 8-15 10M4 7l12-2M4 8l11 2" stroke="#8B817A" stroke-width=".8"/>`,
    sheep: () => `<g fill="#FBF6EE"><circle cx="-12" cy="-14" r="8"/><circle cy="-18" r="9"/><circle cx="12" cy="-14" r="8"/><circle cx="-18" cy="-2" r="7"/><circle cx="18" cy="-2" r="7"/></g><ellipse cx="-19" cy="2" rx="7" ry="3.5" fill="#6B5B55"/><ellipse cx="19" cy="2" rx="7" ry="3.5" fill="#6B5B55"/><ellipse cy="3" rx="13" ry="15" fill="#8A7770"/><g fill="#FBF6EE"><circle cx="-6" cy="-11" r="5"/><circle cx="2" cy="-13" r="5.5"/><circle cx="8" cy="-10" r="4.5"/></g>${eye(-5, 1, 2.6)}${eye(5, 1, 2.6)}<path d="M-3 10q3 2.5 6 0" stroke="#3B2A24" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,
    penguin: () => `<circle r="19" fill="#2F3550"/><path d="M-14 6C-14-8-7-12 0-6 7-12 14-8 14 6 14 14 7 18 0 18S-14 14-14 6Z" fill="#FBF6EE"/>${eye(-6, -1)}${eye(6, -1)}<path d="M-4 5h8L0 10Z" fill="#E2A93B"/>${blush(11, 7)}`,
    squirrel: () => `<path d="M-16-8-13-27-4-16Z M16-8 13-27 4-16Z" fill="#C2733F"/><path d="M-13-27-16-31M13-27l3-4" stroke="#C2733F" stroke-width="3" stroke-linecap="round"/><circle r="18" fill="#C97A45"/><ellipse cy="7" rx="10" ry="8" fill="#F4DDBF"/>${eye(-7, -3)}${eye(7, -3)}<ellipse cy="3" rx="2.8" ry="2" fill="#3B2A24"/>${blush(13, 4)}`,
    deer: () => `<path d="M-10-16-14-30M-14-30-20-33M-14-30-12-36M10-16 14-30M14-30l6-3M14-30l-2-6" stroke="#8C6440" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="-19" cy="-9" rx="8" ry="4.5" fill="#C08B5C" transform="rotate(-25 -19 -9)"/><ellipse cx="19" cy="-9" rx="8" ry="4.5" fill="#C08B5C" transform="rotate(25 19 -9)"/><circle r="17" fill="#C08B5C"/><ellipse cy="8" rx="9" ry="7" fill="#EBD3B4"/><circle cx="-8" cy="-11" r="1.6" fill="#F3E3CC"/><circle cx="9" cy="-12" r="1.4" fill="#F3E3CC"/>${eye(-7, -2)}${eye(7, -2)}<ellipse cy="6" rx="3" ry="2.2" fill="#3B2A24"/>`,
    cat: () => `<path d="M-17-5-15-26-3-17Z M17-5 15-26 3-17Z" fill="#E39A4E"/><path d="M-14-10-13-20-7-15Z M14-10 13-20 7-15Z" fill="#F4C6A6"/><circle r="18" fill="#E39A4E"/><path d="M-5-17q5 3 10 0M-3-12q3 2 6 0" stroke="#C27532" stroke-width="2" fill="none" stroke-linecap="round"/>${eye(-7, -1)}${eye(7, -1)}<path d="M-2.5 5h5L0 8Z" fill="#E58C95"/><path d="M-5 8-17 6M-5 9-16 12M5 8l12-2M5 9l11 3" stroke="#9A6430" stroke-width=".8"/>`,
  };
  const animal = (kind, x = 0, y = 0, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${(ANIMAL[kind] || ANIMAL.cat)()}</g>`;

  // ---------- 房間插畫（200×200） ----------
  const ROOMART = {
    library: { wall: '#E9D2B4', prop: () => `<rect x="22" y="58" width="72" height="104" rx="4" fill="#8C5E3C"/>${[70, 100, 130].map((y, r) => [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${27 + i * 11}" y="${y - 22 + (i % 3) * 2}" width="9" height="${22 - (i % 3) * 2}" rx="1.5" fill="${['#D9734E', '#5E9CC2', '#E2A93B', '#7FAE85', '#9A7BB8', '#DB8C99'][(i + r * 2) % 6]}"/>`).join('') + `<rect x="24" y="${y}" width="68" height="4" fill="#6E4529"/>`).join('')}<rect x="132" y="92" width="6" height="60" fill="#6E4529"/><path d="M118 92h34l-6-18h-22z" fill="#E2A93B"/><ellipse cx="135" cy="98" rx="30" ry="10" fill="#FFE7A8" opacity=".35"/>`, who: [150, 140] },
    bakery: { wall: '#F0D7C0', prop: () => `<path d="M24 162V100a36 36 0 0 1 72 0v62z" fill="#B9644A"/><path d="M38 162v-56a22 22 0 0 1 44 0v56z" fill="#3B2A30"/><path d="M48 160q12-30 24 0" fill="#F2A33A"/><path d="M53 160q7-18 14 0" fill="#FFD36B"/><rect x="104" y="120" width="76" height="8" rx="3" fill="#8C5E3C"/>${[0, 1, 2].map((i) => `<ellipse cx="${118 + i * 24}" cy="114" rx="11" ry="7" fill="#D99A55"/><path d="M${112 + i * 24} 112l4-3M${118 + i * 24} 112l4-3" stroke="#B57636" stroke-width="1.5"/>`).join('')}`, who: [146, 150] },
    music: { wall: '#D8E3E8', prop: () => `<rect x="20" y="76" width="92" height="80" rx="6" fill="#3E3550"/><rect x="26" y="112" width="80" height="16" fill="#FBF6EE"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${37 + i * 11} 112v16" stroke="#8B8199" stroke-width="1"/>`).join('')}${[0, 1, 3, 4, 5].map((i) => `<rect x="${33 + i * 11}" y="112" width="6" height="9" fill="#2B2A40"/>`).join('')}<rect x="28" y="84" width="76" height="20" rx="3" fill="#574B70"/><path d="M40 96q4-10 8 0t8 0" stroke="#E2A93B" stroke-width="2" fill="none"/><circle cx="130" cy="62" r="4" fill="#5E9CC2"/><path d="M134 62V44l10-3" stroke="#5E9CC2" stroke-width="2.5" fill="none"/><circle cx="160" cy="50" r="3.5" fill="#D9734E"/><path d="M163.5 50V36" stroke="#D9734E" stroke-width="2.5"/>`, who: [150, 140] },
    studio: { wall: '#EEE3CF', prop: () => `<path d="M44 168 66 60M110 168 88 60M77 60v108" stroke="#8C5E3C" stroke-width="5" stroke-linecap="round"/><rect x="40" y="62" width="74" height="62" rx="3" fill="#FFFDF7" stroke="#C9B79A" stroke-width="2"/><circle cx="62" cy="88" r="12" fill="#E2A93B"/><path d="M44 120q22-30 40-10t28-6v16H44z" fill="#7FAE85"/><path d="M82 82q8-8 18 0" stroke="#5E9CC2" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="150" cy="172" rx="22" ry="7" fill="#C9B79A"/><circle cx="142" cy="170" r="3" fill="#D9734E"/><circle cx="152" cy="168" r="3" fill="#5E9CC2"/><circle cx="160" cy="172" r="3" fill="#E2A93B"/>`, who: [150, 132] },
    greenhouse: { wall: '#DCEBDD', prop: () => `<path d="M20 40h160M60 20v130M100 20v130M140 20v130" stroke="#FFFFFF" stroke-width="3" opacity=".6"/>${[[40, '#7FAE85', 40], [80, '#5FA7A0', 56], [118, '#7FAE85', 34]].map(([x, c, h]) => `<path d="M${x} 150v-${h}" stroke="#4F7F57" stroke-width="3"/><ellipse cx="${x - 8}" cy="${150 - h * 0.6}" rx="10" ry="5" fill="${c}" transform="rotate(-30 ${x - 8} ${150 - h * 0.6})"/><ellipse cx="${x + 8}" cy="${150 - h * 0.85}" rx="10" ry="5" fill="${c}" transform="rotate(30 ${x + 8} ${150 - h * 0.85})"/><circle cx="${x}" cy="${148 - h}" r="6" fill="${['#DB8C99', '#E2A93B', '#D9734E'][x % 3]}"/><path d="M${x - 14} 148h28l-4 22h-20z" fill="#C9865A"/>`).join('')}<path d="M150 150h24v18h-24z" fill="#5E9CC2"/><path d="M174 154l12-8" stroke="#5E9CC2" stroke-width="4" stroke-linecap="round"/>`, who: [156, 128] },
    workshop: { wall: '#E7D6C3', prop: () => `<rect x="16" y="120" width="120" height="10" rx="2" fill="#8C5E3C"/><path d="M24 130v40M128 130v40" stroke="#6E4529" stroke-width="6"/><rect x="30" y="104" width="70" height="14" rx="2" fill="#D9A46A"/><path d="M40 104v14M60 104v14M80 104v14" stroke="#B57636" stroke-width="1"/><rect x="108" y="88" width="6" height="30" rx="2" fill="#8C5E3C" transform="rotate(25 111 103)"/><rect x="100" y="84" width="22" height="9" rx="2" fill="#7C8A99" transform="rotate(25 111 88)"/><path d="M24 50h100" stroke="#6E4529" stroke-width="4"/>${[36, 58, 80, 102].map((x, i) => `<path d="M${x} 50v${12 + i * 3}" stroke="#7C8A99" stroke-width="3" stroke-linecap="round"/>`).join('')}`, who: [158, 146] },
    lab: { wall: '#DDE6EE', prop: () => `<rect x="16" y="128" width="120" height="8" rx="2" fill="#7C8A99"/><path d="M36 84h12v20l14 24H22l14-24z" fill="#FFFFFF" opacity=".8" stroke="#9FB3C4" stroke-width="2"/><path d="M27 120h30l6 8H22z" fill="#7FAE85"/><rect x="76" y="90" width="14" height="38" rx="7" fill="#FFFFFF" opacity=".8" stroke="#9FB3C4" stroke-width="2"/><rect x="78" y="108" width="10" height="18" rx="5" fill="#D9734E"/><circle cx="110" cy="112" r="16" fill="#FFFFFF" opacity=".8" stroke="#9FB3C4" stroke-width="2"/><path d="M104 88h12v10" stroke="#9FB3C4" stroke-width="2" fill="none"/><path d="M95 116a15 15 0 0 0 30 0z" fill="#9A7BB8"/><g class="bub"><circle cx="42" cy="74" r="4" fill="#BFE1C3"/><circle cx="50" cy="62" r="3" fill="#BFE1C3"/><circle cx="112" cy="84" r="3" fill="#D8C7EA"/></g>`, who: [160, 148] },
    sewing: { wall: '#F1DADB', prop: () => `<path d="M30 40q40 22 80 0" stroke="#C9865A" stroke-width="2" fill="none"/>${[44, 64, 84, 100].map((x, i) => `<path d="M${x} ${46 + (i % 2) * 4}l-6 14h12z" fill="${['#D9734E', '#5E9CC2', '#E2A93B', '#7FAE85'][i]}"/>`).join('')}<rect x="24" y="140" width="100" height="8" rx="2" fill="#8C5E3C"/><circle cx="48" cy="126" r="14" fill="#DB8C99"/><path d="M36 120q12 6 24-4M38 132q12-4 22 2" stroke="#C26F7D" stroke-width="2" fill="none"/><circle cx="82" cy="128" r="12" fill="#5E9CC2"/><path d="M72 124q10 6 20-2" stroke="#3F7EA3" stroke-width="2" fill="none"/><rect x="104" y="116" width="12" height="24" rx="2" fill="#E2A93B"/><rect x="101" y="114" width="18" height="4" rx="1" fill="#8C5E3C"/><rect x="101" y="138" width="18" height="4" rx="1" fill="#8C5E3C"/>`, who: [156, 140] },
    maps: { wall: '#E6DCC6', prop: () => `<rect x="20" y="40" width="80" height="56" rx="3" fill="#F6ECD4" stroke="#C9B79A" stroke-width="2"/><path d="M30 80q14-20 28-8t30-14" stroke="#D9734E" stroke-width="2.5" stroke-dasharray="4 4" fill="none"/><path d="M82 52l6 6m0-6-6 6" stroke="#D9734E" stroke-width="2.5"/><path d="M28 54q8 4 14-2" stroke="#7FAE85" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="62" cy="128" r="24" fill="#5E9CC2"/><path d="M46 116q10 4 12 14t14 6M64 106q8 6 4 12" stroke="#7FAE85" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M62 104a24 24 0 0 1 0 48" stroke="#8C5E3C" stroke-width="3" fill="none" transform="rotate(-20 62 128)"/><path d="M62 152v12M48 168h28" stroke="#8C5E3C" stroke-width="5" stroke-linecap="round"/>`, who: [150, 140] },
    clock: { wall: '#E2D9E8', prop: () => `<circle cx="70" cy="92" r="48" fill="#FBF6EE" stroke="#8C5E3C" stroke-width="7"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<circle cx="${70 + Math.sin(a) * 38}" cy="${92 - Math.cos(a) * 38}" r="${i % 3 ? 2 : 3.5}" fill="#3E3550"/>`; }).join('')}<path d="M70 92V64M70 92l18 10" stroke="#3E3550" stroke-width="4" stroke-linecap="round"/><circle cx="70" cy="92" r="4" fill="#D9734E"/><g class="spin" style="transform-origin:150px 60px"><circle cx="150" cy="60" r="16" fill="none" stroke="#C9A24A" stroke-width="7" stroke-dasharray="5 4"/><circle cx="150" cy="60" r="6" fill="#C9A24A"/></g>`, who: [150, 146] },
    observatory: { wall: '#3A3F66', prop: () => `${[[30, 30], [70, 18], [120, 34], [170, 22], [150, 60], [40, 66], [100, 56]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 1.8 : 2.6}" fill="#FFE7A8" class="tw" style="animation-delay:${i * 0.4}s"/>`).join('')}<circle cx="168" cy="44" r="12" fill="#FFF1C8"/><circle cx="173" cy="40" r="10" fill="#3A3F66"/><rect x="40" y="96" width="78" height="20" rx="8" fill="#C9865A" transform="rotate(-28 79 106)"/><rect x="104" y="72" width="16" height="26" rx="4" fill="#8C5E3C" transform="rotate(-28 112 85)"/><path d="M74 118 56 168M80 118l4 50M86 118l22 50" stroke="#6E4529" stroke-width="4" stroke-linecap="round"/>`, who: [150, 150] },
    terrace: { wall: '#F3E1C2', prop: () => `<path d="M10 70q30-20 60 0t60 0 60 0" stroke="#DB8C99" stroke-width="3" fill="none"/>${[30, 60, 90, 120, 150].map((x, i) => `<circle cx="${x}" cy="${68 + (i % 2) * 6}" r="5" fill="#FFE7A8"/>`).join('')}<ellipse cx="78" cy="132" rx="54" ry="10" fill="#8C5E3C"/><path d="M78 140v30M60 170h36" stroke="#6E4529" stroke-width="5" stroke-linecap="round"/><path d="M58 128q0-22 20-22t20 22z" fill="#7FAE85"/><path d="M98 116q12-2 10 10" stroke="#7FAE85" stroke-width="4" fill="none"/><circle cx="78" cy="104" r="3.5" fill="#5C8C63"/><rect x="104" y="118" width="14" height="12" rx="3" fill="#FBF6EE"/><rect x="38" y="118" width="14" height="12" rx="3" fill="#FBF6EE"/><path d="M84 96q4-8 0-14M90 98q4-8 0-14" stroke="#FFFFFF" stroke-width="2" fill="none" opacity=".8"/>`, who: [156, 150] },
  };
  function roomArt(id, kind, opts = {}) {
    const r = ROOMART[id] || ROOMART.terrace, uid = 'r' + Math.random().toString(36).slice(2, 8);
    const [wx, wy] = r.who;
    const body = `<ellipse cx="${wx}" cy="${wy + 30}" rx="20" ry="17" fill="rgba(0,0,0,.08)"/>`;
    const locked = opts.locked;
    return `<svg class="room-art" viewBox="0 0 200 200" role="img" aria-label="房間插畫">
      <defs><clipPath id="${uid}"><path d="M8 196V92a92 84 0 0 1 184 0v104z"/></clipPath><radialGradient id="${uid}g" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <g clip-path="url(#${uid})"${locked ? ' class="locked-g"' : ''}>
        <rect width="200" height="200" fill="${r.wall}"/><rect width="200" height="200" fill="url(#${uid}g)"/>
        <rect y="168" width="200" height="32" fill="rgba(80,50,30,.16)"/><path d="M0 168h200" stroke="rgba(80,50,30,.2)" stroke-width="2"/>
        ${r.prop()}${body}${animal(kind, wx, wy, 1.35)}
      </g>
      <path d="M8 196V92a92 84 0 0 1 184 0v104" fill="none" stroke="rgba(43,42,64,.14)" stroke-width="3"/>
    </svg>`;
  }

  // ---------- 城堡場景 ----------
  const G = { W: 360, CW: 232, WIN: 44, BH: 22, LH: 16, LEDGE: 8, GH: 92, BOTTOM: 74, ROOF: 150, TOP: 120 };
  G.X0 = (G.W - G.CW) / 2; G.FH = G.BH * 2 + G.LH + G.LEDGE; G.SIDE = (G.CW - G.WIN) / 2;
  function rnd(seed) { let x = seed >>> 0 || 1; return () => ((x = Math.imul(x ^ (x >>> 15), 2246822507) + 0x9e3779b9 >>> 0) / 4294967296); }
  const shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
    return '#' + [f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, '0')).join('');
  };
  function brickRect(j, yb) {
    const { X0, SIDE, WIN, BH, LH, LEDGE, CW } = G;
    if (j < 8) {
      const row = Math.floor(j / 4), c = j % 4, bw = SIDE / 2;
      const x = c < 2 ? X0 + c * bw : X0 + SIDE + WIN + (c - 2) * bw;
      return { x: x + 1, y: yb - LEDGE - (row + 1) * BH + 1, w: bw - 2, h: BH - 2 };
    }
    const c = j - 8, lw = CW / 2;
    return { x: X0 + c * lw + 1, y: yb - LEDGE - 2 * BH - LH + 1, w: lw - 2, h: LH - 2 };
  }
  function brickSvg(r, color, cls, idx) {
    return `<g class="brick ${cls}" data-i="${idx}"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="3" fill="${color}"/><rect x="${r.x + 2}" y="${r.y + 1.5}" width="${r.w - 4}" height="3" rx="1.5" fill="#fff" opacity=".28"/><rect x="${r.x}" y="${r.y + r.h - 3}" width="${r.w}" height="3" rx="1.5" fill="${shade(color, -0.22)}" opacity=".7"/></g>`;
  }
  function windowSvg(fi, yb, lit, room, opts) {
    const cx = G.W / 2, w = G.WIN - 8, h = G.BH * 2 - 4, x = cx - w / 2, y = yb - G.LEDGE - G.BH * 2 + 2;
    const path = `M${x} ${y + h}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + h}z`;
    if (!lit) return `<g class="win"><path d="${path}" fill="#2E2F4D"/><path d="M${cx} ${y + 4}V${y + h}M${x} ${y + h * 0.62}h${w}" stroke="#4A4B6E" stroke-width="2"/></g>`;
    const deco = fi % 4 === 0 ? `<rect x="${x - 6}" y="${y + h - 2}" width="${w + 12}" height="7" rx="2" fill="#8C5E3C"/>${[0, 1, 2, 3].map((k) => `<circle cx="${x - 2 + k * (w + 4) / 3}" cy="${y + h - 4}" r="3.6" fill="${['#DB8C99', '#E2A93B', '#D9734E', '#9A7BB8'][(k + fi) % 4]}"/>`).join('')}` : `<rect x="${x - 5}" y="${y + h - 1}" width="${w + 10}" height="4" rx="2" fill="#F4E7D3"/>`;
    return `<g class="win lit${opts.fresh ? ' lightup' : ''}" data-room="${fi}" tabindex="0" role="button" aria-label="第${fi + 1}層 ${esc(room.name)}">
      <path d="${path}" fill="url(#winGlow)"/>
      <clipPath id="wc${fi}"><path d="${path}"/></clipPath>
      <g clip-path="url(#wc${fi})">${animal(room.animal, cx, y + h - 6, 0.62)}</g>
      <path d="${path}" fill="none" stroke="#F4E7D3" stroke-width="3"/>
      ${deco}
    </g>`;
  }
  function decorSide(fi, yb) {
    const { X0, CW } = G, top = yb - G.FH;
    const kind = fi % 3;
    if (kind === 0) return `<g><path d="M${X0 - 2} ${top + 14}h-10" stroke="#5B4636" stroke-width="2.5"/><path d="M${X0 - 12} ${top + 14}v6" stroke="#5B4636" stroke-width="1.5"/><rect x="${X0 - 17}" y="${top + 20}" width="10" height="13" rx="3" fill="#F2C14E"/><circle cx="${X0 - 12}" cy="${top + 26}" r="10" fill="#FFD66B" opacity=".25" class="glow"/></g>`;
    if (kind === 1) return `<g><path d="M${X0 + CW} ${top + 6}h14v${G.FH - 18}h-14" fill="#E7D9C3" stroke="#BFAE95" stroke-width="1.5"/><path d="M${X0 + CW + 2} ${top + 12}h10l-5 16z" fill="#D9734E"/></g>`;
    return `<g fill="#6E9F6E">${[0, 1, 2, 3, 4].map((k) => `<ellipse cx="${X0 + 2 + (k % 2) * 5}" cy="${top + 10 + k * 11}" rx="5" ry="3.4" transform="rotate(${k % 2 ? 30 : -30} ${X0 + 2 + (k % 2) * 5} ${top + 10 + k * 11})"/>`).join('')}<path d="M${X0 + 3} ${top + 6}q4 24-1 50" stroke="#4F7F57" stroke-width="1.6" fill="none"/></g>`;
  }

  // data: { colors: [每塊磚顏色], goal, castle, minH, fresh: 新磚 index, freshFloor, crown }
  function scene(data) {
    const { W, X0, CW, FH, GH, BOTTOM, ROOF, TOP, LEDGE } = G;
    const n = data.colors.length, done = Math.floor(n / 10), floorsDrawn = done + 1;
    const goalAlt = data.goal * FH + GH;
    const need = BOTTOM + GH + floorsDrawn * FH + ROOF + TOP;
    const H = Math.max(need, data.minH || 0, BOTTOM + goalAlt + 120);
    const ground = H - BOTTOM, gateTop = ground - GH;
    const alt = (a) => ground - a;
    const R = rnd(data.seed || 7);
    const out = [];
    out.push(`<svg class="scene-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`);
    out.push(`<defs>
      <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="${ground}" x2="0" y2="${ground - 2400}">
        <stop offset="0" stop-color="#FCE9CF"/><stop offset=".12" stop-color="#D7E8EC"/><stop offset=".36" stop-color="#9DBBDD"/><stop offset=".62" stop-color="#5C67A3"/><stop offset=".85" stop-color="#2D2E55"/><stop offset="1" stop-color="#1D1D3A"/>
      </linearGradient>
      <radialGradient id="winGlow" cx=".5" cy=".7" r=".8"><stop offset="0" stop-color="#FFE7A3"/><stop offset="1" stop-color="#F2B95A"/></radialGradient>
      <linearGradient id="roofG" x1="0" x2="1"><stop offset="0" stop-color="#C85F43"/><stop offset=".5" stop-color="#DD7A55"/><stop offset="1" stop-color="#B6533A"/></linearGradient>
      <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDE2D0"/><stop offset="1" stop-color="#D9CBB5"/></linearGradient>
      <pattern id="mortar" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#E9DCC7"/><circle cx="2" cy="3" r=".7" fill="#D6C6AD"/><circle cx="6" cy="6" r=".6" fill="#D6C6AD"/></pattern>
    </defs>`);
    out.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);
    // 星星
    const starFrom = 1150;
    for (let a = starFrom; a < H; a += 26) {
      const x = R() * W, y = alt(a + R() * 26);
      if (y < 0) continue;
      const big = R() > 0.85;
      out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${big ? 1.8 : 1}" fill="#FFF4D6" opacity="${Math.min(1, (a - starFrom) / 500 + 0.2).toFixed(2)}"${big ? ` class="tw" style="animation-delay:${(R() * 3).toFixed(1)}s"` : ''}/>`);
    }
    // 月亮
    if (H - BOTTOM > 1500) out.push(`<g transform="translate(296 ${alt(1500)})"><circle r="20" fill="#FFF1C8"/><circle r="30" fill="#FFF1C8" opacity=".12"/><circle cx="-6" cy="-4" r="3" fill="#F2DFA8"/><circle cx="5" cy="7" r="2" fill="#F2DFA8"/></g>`);
    // 太陽
    out.push(`<g transform="translate(64 ${alt(420)})"><circle r="44" fill="#FFE3A6" opacity=".35"/><circle r="26" fill="#FFD88A"/></g>`);
    // 雲
    const cloud = (x, y, s, d) => `<g class="cloud" style="animation-duration:${d}s"><g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".9"><ellipse cx="0" cy="0" rx="26" ry="11"/><circle cx="-10" cy="-6" r="11"/><circle cx="8" cy="-10" r="14"/><circle cx="22" cy="-2" r="9"/></g></g>`;
    [[250, 300, 1, 70], [90, 620, 0.8, 90], [280, 900, 0.9, 80], [60, 1180, 0.7, 110]].forEach(([x, a, s, d]) => { if (alt(a) > 30) out.push(cloud(x, alt(a), s, d)); });
    // 雀鳥
    out.push(`<g class="birds" stroke="#5C5470" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M282 ${alt(520)}q5-5 10 0q5-5 10 0"/><path d="M304 ${alt(540)}q4-4 8 0q4-4 8 0"/></g>`);
    // 遠山
    out.push(`<path d="M0 ${ground - 70}q50-40 110-12t120-22 130 18V${ground}H0z" fill="#B7CDB3"/>`);
    out.push(`<path d="M0 ${ground - 34}q70-34 150-8t210-18V${ground}H0z" fill="#93B58F"/>`);
    [[22, 44, 1], [44, 30, 0.8], [316, 40, 1.1], [338, 26, 0.75]].forEach(([x, up, s]) => out.push(`<g transform="translate(${x} ${ground - up}) scale(${s})"><rect x="-2" y="0" width="4" height="22" fill="#7A5A44"/><circle r="15" fill="#6F9F70"/><circle cx="-5" cy="-5" r="6" fill="#86B486"/></g>`));
    // 目標線
    const gy = alt(goalAlt);
    if (!data.crown) out.push(`<g class="goal-line"><path d="M8 ${gy}H${W - 8}" stroke="#E2A93B" stroke-width="2" stroke-dasharray="6 6" opacity=".85"/><g transform="translate(${W - 10} ${gy})"><rect x="-62" y="-26" width="58" height="20" rx="10" fill="#FFF8EA" stroke="#E2A93B" stroke-width="1.5"/><text x="-33" y="-12" text-anchor="middle" font-size="11" font-weight="700" fill="#9A6A12">目標 ${data.goal} 層</text></g></g>`);

    // 大門層
    out.push(`<g class="gate">
      <rect x="${X0 - 10}" y="${gateTop}" width="${CW + 20}" height="${GH}" rx="4" fill="url(#stone)"/>
      ${[0, 1, 2, 3].map((r) => Array.from({ length: 7 }, (_, c) => { const bw = (CW + 20) / 6, x = X0 - 10 + c * bw - (r % 2 ? bw / 2 : 0); const x1 = Math.max(x, X0 - 10), x2 = Math.min(x + bw, X0 + CW + 10); return x2 - x1 > 4 ? `<rect x="${x1 + 1}" y="${gateTop + 4 + r * 22}" width="${x2 - x1 - 2}" height="20" rx="3" fill="#E4D7C2" stroke="#D2C1A7" stroke-width="1"/>` : ''; }).join('')).join('')}
      <path d="M${W / 2 - 30} ${ground}V${ground - 50}a30 30 0 0 1 60 0V${ground}z" fill="#7A5038"/>
      <path d="M${W / 2 - 24} ${ground}V${ground - 48}a24 24 0 0 1 48 0V${ground}z" fill="#9A6644"/>
      <path d="M${W / 2} ${ground - 72}V${ground}M${W / 2 - 24} ${ground - 36}h48" stroke="#7A5038" stroke-width="2"/>
      <circle cx="${W / 2 + 8}" cy="${ground - 26}" r="2.6" fill="#E2A93B"/><circle cx="${W / 2 - 8}" cy="${ground - 26}" r="2.6" fill="#E2A93B"/>
      <path d="M${W / 2 - 34} ${ground - 50}a34 34 0 0 1 68 0" fill="none" stroke="#CDBA9C" stroke-width="5"/>
      ${data.castle ? `<g transform="translate(${W / 2} ${gateTop + 14})"><rect x="-58" y="-10" width="116" height="20" rx="6" fill="#3E3550"/><text y="4.5" text-anchor="middle" font-size="11.5" font-weight="700" fill="#FBEFD9" letter-spacing="1">${esc(data.castle)}</text></g>` : ''}
      ${[X0 + 18, X0 + CW - 18].map((x) => `<g><rect x="${x - 4}" y="${ground - 62}" width="8" height="14" rx="2" fill="#F2C14E"/><circle cx="${x}" cy="${ground - 55}" r="13" fill="#FFD66B" opacity=".22" class="glow"/><path d="M${x - 6} ${ground - 47}h12" stroke="#5B4636" stroke-width="3"/></g>`).join('')}
    </g>`);
    // 地面
    out.push(`<path d="M0 ${ground}q90-8 180 0t180 0V${H}H0z" fill="#7FAE6F"/><path d="M0 ${ground + 10}q90-6 180 0t180 0V${H}H0z" fill="#6C9C5E"/>`);
    out.push(`<path d="M${W / 2 - 30} ${ground}h60l26 ${BOTTOM}h-112z" fill="#E6D3B3"/><path d="M${W / 2 - 34} ${ground + 3}h68M${W / 2 - 40} ${ground + 9}h80" stroke="#CDB894" stroke-width="2"/>`);
    [[46, 18, '#DB8C99'], [80, 34, '#E2A93B'], [282, 22, '#F4E7D3'], [318, 40, '#DB8C99'], [30, 50, '#F4E7D3'], [250, 52, '#E2A93B']].forEach(([x, d, c]) => out.push(`<g transform="translate(${x} ${ground + d})"><path d="M0 0v-8" stroke="#4F7F57" stroke-width="1.5"/><circle cy="-10" r="3.6" fill="${c}"/><circle cy="-10" r="1.3" fill="#FFF3D0"/></g>`));
    [[X0 - 4, 1], [X0 + CW + 4, -1]].forEach(([x, f]) => out.push(`<g transform="translate(${x} ${ground}) scale(${f} 1)"><ellipse cx="0" cy="-8" rx="18" ry="12" fill="#5E8F57"/><ellipse cx="-8" cy="-12" rx="9" ry="7" fill="#79A96F"/></g>`));

    // 各層
    for (let fi = 0; fi < floorsDrawn; fi++) {
      const yb = gateTop - fi * FH, top = yb - FH, complete = fi < done;
      out.push(`<g class="floor${complete ? ' done' : ' building'}" data-floor="${fi}">`);
      out.push(`<rect x="${X0}" y="${top}" width="${CW}" height="${FH - LEDGE}" fill="${complete ? 'url(#mortar)' : 'rgba(255,250,240,.32)'}"/>`);
      out.push(`<rect x="${X0 - 6}" y="${yb - LEDGE}" width="${CW + 12}" height="${LEDGE}" rx="2" fill="#F4E7D3"/><rect x="${X0 - 6}" y="${yb - 2}" width="${CW + 12}" height="2" fill="#D6C3A4"/>`);
      for (let j = 0; j < 10; j++) {
        const idx = fi * 10 + j, r = brickRect(j, yb);
        if (idx < n) out.push(brickSvg(r, data.colors[idx], idx === data.fresh ? 'drop' : '', idx));
        else out.push(`<rect class="slot${idx === n ? ' next' : ''}" x="${r.x + 1}" y="${r.y + 1}" width="${r.w - 2}" height="${r.h - 2}" rx="3" fill="${idx === n ? 'rgba(255,255,255,.55)' : 'none'}" stroke="${idx === n ? '#E2A93B' : 'rgba(62,53,80,.28)'}" stroke-width="1.6" stroke-dasharray="${idx === n ? '0' : '4 3'}"/>`);
      }
      out.push(windowSvg(fi, yb, complete, data.room(fi), { fresh: fi === data.freshFloor }));
      if (complete) out.push(decorSide(fi, yb));
      out.push(`</g>`);
    }
    // 棚架（建造中那層）
    {
      const yb = gateTop - done * FH, top = yb - FH;
      out.push(`<g class="scaffold" stroke="#A87B52" stroke-width="3" stroke-linecap="round"><path d="M${X0 - 14} ${yb}V${top - 2}M${X0 + CW + 14} ${yb}V${top - 2}M${X0 - 14} ${top + 18}h8M${X0 + CW + 6} ${top + 18}h8"/><path d="M${X0 - 14} ${yb - 4}L${X0 - 4} ${top + 20}M${X0 + CW + 14} ${yb - 4}L${X0 + CW + 4} ${top + 20}" stroke-width="1.8" opacity=".7"/></g>`);
    }
    // 屋頂
    {
      const base = gateTop - floorsDrawn * FH;
      const merl = Array.from({ length: 9 }, (_, k) => `<rect x="${X0 - 6 + k * ((CW + 12 - 16) / 8)}" y="${base - 14}" width="16" height="16" rx="2" fill="#E9DCC7" stroke="#D2C1A7"/>`).join('');
      const tw = 92, tx = W / 2 - tw / 2, th = 56, ty = base - 12 - th;
      const turret = (x, f) => `<g><rect x="${x - 14}" y="${base - 46}" width="28" height="44" rx="2" fill="#E9DCC7" stroke="#D2C1A7"/><path d="M${x - 19} ${base - 44}L${x} ${base - 92}L${x + 19} ${base - 44}z" fill="url(#roofG)"/><path d="M${x} ${base - 92}v-12" stroke="#5B4636" stroke-width="1.6"/><path d="M${x} ${base - 104}q${8 * f} 3 ${14 * f} 0v7q${-6 * f} 3 ${-14 * f} 0z" fill="#E2A93B"/><rect x="${x - 4}" y="${base - 34}" width="8" height="12" rx="4" fill="#3E3550"/></g>`;
      out.push(`<g class="roof">${turret(X0 + 8, -1)}${turret(X0 + CW - 8, 1)}${merl}
        <rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="3" fill="#EFE4D2" stroke="#D2C1A7"/>
        <circle cx="${W / 2}" cy="${ty + 26}" r="13" fill="${data.crown ? 'url(#winGlow)' : '#3E3550'}" stroke="#F4E7D3" stroke-width="3"/>
        <path d="M${tx - 10} ${ty + 2}L${W / 2} ${ty - 70}L${tx + tw + 10} ${ty + 2}z" fill="url(#roofG)"/>
        <path d="M${W / 2} ${ty - 70}L${tx + 18} ${ty + 2}M${W / 2} ${ty - 70}L${tx + tw - 18} ${ty + 2}" stroke="#B6533A" stroke-width="1.5" opacity=".6"/>
        <path d="M${W / 2} ${ty - 70}v-30" stroke="#5B4636" stroke-width="2"/>
        <path class="flag" d="M${W / 2} ${ty - 100}q14 -5 28 0t26 0v18q-12 5-26 0t-28 0z" fill="#E2A93B"/>
        ${data.crown ? `<g transform="translate(${W / 2} ${ty - 120})"><g class="crown"><path d="M-16 8-18-10-8-2 0-14 8-2 18-10 16 8z" fill="#F2C14E" stroke="#C9922A" stroke-width="1.5"/><circle cy="-14" r="2.5" fill="#DB8C99"/></g></g>` : ''}
      </g>`);
    }
    out.push(`</svg>`);
    return { svg: out.join(''), H, brickY: (idx) => { const fi = Math.floor(idx / 10); return brickRect(idx % 10, gateTop - fi * FH).y; }, topY: gateTop - floorsDrawn * FH - 240 };
  }

  root.EffortArt = { icon, animal, roomArt, scene, esc, G };
})(typeof self !== 'undefined' ? self : this);

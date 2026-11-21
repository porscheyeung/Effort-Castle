// 努力城堡連線中轉：大屏幕顯示 4 位數字，手機輸入後配對；手機推送城堡狀態，大屏幕每秒輪詢。
// 經共用 edgelab-web 的 /effort-link 掛載（Migration/effort_link_gateway.py），內部只聽 127.0.0.1。
import { mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { randomBytes, randomInt } from "node:crypto";

const PORT = Number(process.env.PORT || 18796);
const DATA = process.env.LINK_DATA || new URL("./data/", import.meta.url).pathname;
const FILE = DATA + "rooms.json";
const CODE_TTL = 15 * 60e3, ROOM_TTL = 60 * 864e5, MAX_BODY = 2_000_000, MAX_ROOMS = 5000;
const ORIGINS = (process.env.LINK_ORIGINS || "https://porscheyeung.github.io,http://127.0.0.1:4192,http://localhost:4192").split(",");

type Ev = { seq: number; event: unknown };
type Room = { id: string; code: string | null; codeAt: number; token: string | null; state: unknown; seq: number; touched: number; paired: number; events: Ev[]; seen: number };
const rooms = new Map<string, Room>();
const byCode = new Map<string, string>();
const byToken = new Map<string, string>();

mkdirSync(DATA, { recursive: true });
try {
  for (const r of JSON.parse(readFileSync(FILE, "utf8")) as Room[]) {
    if (Date.now() - r.touched > ROOM_TTL) continue;
    r.code = null; r.events = []; r.seen = 0; rooms.set(r.id, r);
    if (r.token) byToken.set(r.token, r.id);
  }
} catch {}
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const tmp = FILE + ".tmp";
    writeFileSync(tmp, JSON.stringify([...rooms.values()].map((r) => ({ ...r, code: null, events: [], seen: 0 }))));
    renameSync(tmp, FILE);
  }, 1500);
}

const rid = (n: number) => randomBytes(n).toString("base64url");
function newCode(room: Room) {
  if (room.code) byCode.delete(room.code);
  let code = "";
  for (let i = 0; i < 50; i++) { code = String(randomInt(1000, 10000)); if (!byCode.has(code)) break; }
  room.code = code; room.codeAt = Date.now(); byCode.set(code, room.id);
}
function emit(room: Room, event: unknown) {
  room.seq++;
  room.events = [...room.events, { seq: room.seq, event }].slice(-30);
}
const online = (r: Room) => (Date.now() - r.seen < 6000 ? 1 : 0);

const hits = new Map<string, { n: number; t: number }>();
function limited(key: string, max: number) {
  const now = Date.now(), h = hits.get(key);
  if (!h || now - h.t > 60e3) { hits.set(key, { n: 1, t: now }); return false; }
  return ++h.n > max;
}
setInterval(() => {
  const now = Date.now();
  for (const [code, id] of byCode) { const r = rooms.get(id); if (!r || now - r.codeAt > CODE_TTL) { byCode.delete(code); if (r && r.code === code) r.code = null; } }
  for (const [id, r] of rooms) if (now - r.touched > ROOM_TTL && !online(r)) { rooms.delete(id); if (r.token) byToken.delete(r.token); }
  for (const [k, h] of hits) if (now - h.t > 60e3) hits.delete(k);
}, 30e3);

function cors(req: Request) {
  const o = req.headers.get("origin") || "";
  return { "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : ORIGINS[0], "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "content-type", "Vary": "Origin", "Cache-Control": "no-store" };
}
const json = (req: Request, data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors(req), "content-type": "application/json" } });
async function body(req: Request): Promise<any> {
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return null;
  const t = await req.text(); if (t.length > MAX_BODY) return null;
  try { return JSON.parse(t); } catch { return null; }
}
const roomOfToken = (b: any) => { const id = b && typeof b.token === "string" ? byToken.get(b.token) : undefined; return id ? rooms.get(id) : undefined; };

Bun.serve({
  port: PORT, hostname: process.env.HOST || "127.0.0.1",
  async fetch(req, server) {
    const url = new URL(req.url), p = url.pathname.replace(/^\/effort-link/, "");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || server.requestIP(req)?.address || "?";
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    if (p === "/" || p === "" || p === "/health") return json(req, { ok: true, service: "effort-castle-link" });

    // 大屏幕：開新房或續用舊房，取得配對碼
    if (p === "/api/screen" && req.method === "POST") {
      if (limited(ip + ":s", 30)) return json(req, { error: "太多請求，請稍後再試" }, 429);
      const b = (await body(req)) || {};
      let room = typeof b.room === "string" ? rooms.get(b.room) : undefined;
      if (!room) {
        if (rooms.size >= MAX_ROOMS) return json(req, { error: "服務繁忙" }, 503);
        room = { id: rid(18), code: null, codeAt: 0, token: null, state: null, seq: 0, touched: Date.now(), paired: 0, events: [], seen: Date.now() };
        rooms.set(room.id, room);
      }
      if (!room.token || b.newCode) newCode(room);
      room.touched = Date.now(); room.seen = Date.now(); persist();
      return json(req, { room: room.id, code: room.code, paired: !!room.token, seq: room.seq, state: room.state, expiresIn: CODE_TTL });
    }
    // 大屏幕：輪詢（since = 已收到的 seq）
    const m = p.match(/^\/api\/screen\/([\w-]{20,30})$/);
    if (m && req.method === "GET") {
      if (limited(ip + ":g", 600)) return json(req, { error: "太快了" }, 429);
      const room = rooms.get(m[1]); if (!room) return json(req, { error: "gone" }, 404);
      room.seen = Date.now();
      if (room.code && Date.now() - room.codeAt > CODE_TTL - 60e3) newCode(room);
      const since = Number(url.searchParams.get("since") ?? -1);
      const base = { seq: room.seq, paired: !!room.token, code: room.code };
      if (since === room.seq) return json(req, base);
      const evs = room.events.filter((e) => e.seq > since);
      const gap = since < 0 || !evs.length || evs[0].seq !== since + 1;
      return json(req, { ...base, state: room.state, events: gap ? [] : evs });
    }
    // 手機：輸入配對碼
    if (p === "/api/pair" && req.method === "POST") {
      if (limited(ip + ":p", 12)) return json(req, { error: "嘗試太多次，請一分鐘後再試" }, 429);
      const b = await body(req);
      const code = String(b?.code || "").replace(/\D/g, "");
      const id = byCode.get(code), room = id ? rooms.get(id) : undefined;
      if (!room || Date.now() - room.codeAt > CODE_TTL) return json(req, { error: "號碼不正確或已過期，請看大屏幕上最新的號碼。" }, 404);
      if (room.token) byToken.delete(room.token);
      room.token = rid(24); byToken.set(room.token, room.id);
      byCode.delete(code); room.code = null; room.paired = Date.now(); room.touched = Date.now();
      emit(room, { kind: "paired" }); persist();
      return json(req, { token: room.token, screens: online(room) });
    }
    // 手機：推送狀態
    if (p === "/api/push" && req.method === "POST") {
      if (limited(ip + ":u", 300)) return json(req, { error: "太快了" }, 429);
      const b = await body(req), room = roomOfToken(b);
      if (!room) return json(req, { error: "unpaired" }, 410);
      if (b.state && typeof b.state === "object") room.state = b.state;
      room.touched = Date.now();
      emit(room, b.event && typeof b.event === "object" ? b.event : { kind: "sync" }); persist();
      return json(req, { screens: online(room) });
    }
    // 手機：查詢大屏幕是否在線
    if (p === "/api/status" && req.method === "POST") {
      const room = roomOfToken(await body(req));
      if (!room) return json(req, { error: "unpaired" }, 410);
      return json(req, { screens: online(room) });
    }
    // 手機：斷開
    if (p === "/api/unpair" && req.method === "POST") {
      const room = roomOfToken(await body(req));
      if (room) { byToken.delete(room.token!); room.token = null; room.state = null; newCode(room); emit(room, { kind: "unpaired" }); persist(); }
      return json(req, { ok: true });
    }
    return json(req, { error: "not found" }, 404);
  },
});
console.log(`effort-castle-link on ${process.env.HOST || "127.0.0.1"}:${PORT}`);

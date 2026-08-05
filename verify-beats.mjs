#!/usr/bin/env node
// verify-beats.mjs — capture scroll-driven film beats as screenshots.
// Talks to the running gstack browse daemon over its HTTP API (state file
// .gstack/browse.json holds port + token). One run = one sweep.
//
// Usage:
//   node verify-beats.mjs            # all beats
//   node verify-beats.mjs 12,28      # only beats 12% and 28%
import { readFileSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, ".gstack", "browse.json");
const OUT_DIR = path.join(__dirname, "verification");
const BASE_URL = "http://localhost:3000";
const ALL_BEATS = [0, 12, 28, 38, 46, 52, 64, 72, 80, 97];
const SETTLE_MS = 1800;
const SERVER_SCRIPT = "C:\\Users\\N0860\\.config\\opencode\\skills\\gstack\\browse\\dist\\server-node.mjs";

const argBeats = process.argv.slice(2).flatMap((a) =>
  a.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n))
);
const beats = argBeats.length ? [...new Set(argBeats)].sort((a, b) => a - b) : ALL_BEATS;

async function alive() {
  if (!existsSync(STATE_FILE)) return false;
  const s = JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  if (!s.port || !s.token) return false;
  try {
    const res = await fetch(`http://127.0.0.1:${s.port}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function startDaemon() {
  const server = spawn("node", [SERVER_SCRIPT], {
    detached: true,
    stdio: "ignore",
    cwd: __dirname,
    env: { ...process.env, BROWSE_PARENT_PID: "0" },
  });
  server.unref();
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (existsSync(STATE_FILE)) {
      try {
        const s = JSON.parse(readFileSync(STATE_FILE, "utf-8"));
        const res = await fetch(`http://127.0.0.1:${s.port}/health`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) return s;
      } catch {}
    }
  }
  throw new Error("daemon did not come up within 10s");
}

let state;
if (await alive()) {
  state = JSON.parse(readFileSync(STATE_FILE, "utf-8"));
} else {
  console.log("daemon not healthy — spawning one");
  state = await startDaemon();
}
const PORT = state.port;
const TOKEN = state.token;
console.log(`daemon: ${PORT} (pid ${state.pid ?? "n/a"})`);

const base = `http://127.0.0.1:${PORT}`;

async function cmd(command, args = []) {
  const res = await fetch(`${base}/command`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ command, args }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`command ${command} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return text;
}

async function js(expr) {
  const raw = await cmd("js", [expr]);
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const health = await fetch(`${base}/health`).then((r) => r.json());
  console.log(`status: ${health.status} (uptime ${Math.round(health.uptime / 60)}m, tabs ${health.tabs})`);

  const nav = await cmd("goto", [BASE_URL]);
  console.log(`goto: ${nav}`);
  await sleep(2500);

  let film = null;
  for (let i = 0; i < 15; i++) {
    film = await js(
      `(()=>{const f=document.getElementById('cinematic');if(!f)return null;return {filmH:f.offsetHeight,vh:innerHeight}})()`
    );
    if (film && film.filmH > film.vh) break;
    await sleep(1500);
  }
  if (!film || !film.filmH) {
    console.error(`BLOCKED: #cinematic never mounted. page=${await js("location.href")}`);
    process.exit(1);
  }

  const range = film.filmH - film.vh;
  console.log(`film: ${film.filmH}px, viewport: ${film.vh}px, scroll range: ${range}px`);

  mkdirSync(OUT_DIR, { recursive: true });
  const written = [];
  for (const p of beats) {
    const y = Math.round((range * p) / 100);
    await cmd("js", [`window.scrollTo(0, ${y})`]);
    await sleep(SETTLE_MS);
    const file = path.join(OUT_DIR, `beat-${String(p).padStart(3, "0")}.png`);
    const res = await cmd("screenshot", [file, "--viewport"]);
    const ok = /saved/i.test(res) || /error/i.test(res);
    written.push({ p, y, res: res.trim() });
    console.log(`beat ${p}% y=${y}: ${res.trim()}`);
    if (!ok) {
      console.error(`WARN: screenshot for beat ${p} returned: ${res.slice(0, 200)}`);
    }
  }
  console.log(`\nWROTE ${written.length} PNG(s) to ${OUT_DIR}:`);
  for (const w of written) {
    const f = path.join(OUT_DIR, `beat-${String(w.p).padStart(3, "0")}.png`);
    if (existsSync(f)) console.log(`  ${f} (${(readFileSync(f).length / 1024).toFixed(0)} KiB)`);
  }
} catch (err) {
  console.error(`FAILED: ${err.message}`);
  process.exit(1);
}

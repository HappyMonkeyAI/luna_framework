// Parent-side differential harness for B4-A3 (NOT part of any packet; never shown to workers).
// Persistence-focused scenarios; runs against each arm's post-A2 parent and its A3 result.
// Imports the PUBLIC surface only.
import { it, expect } from "vitest";
import * as m from "../src/main.js";

const { api, keys, initGame, resetGame } = m as any;

function makeWorld() {
  const store = new Map<string, string>();
  return {
    output: [] as Array<{ kind: string; text: string }>,
    storage: {
      get: (k: string) => (store.has(k) ? store.get(k)! : undefined),
      set: (k: string, v: string) => void store.set(k, v),
    },
    _store: store,
  };
}

function boot(seed: number, world = makeWorld()) {
  resetGame(seed);
  initGame(world);
  return world;
}

const SAVE_KEY = "ventr" + "alis:save";

it("A3 differential", () => {
  const out: Record<string, unknown> = {};

  // S1: no save key present — 20 ticks must NOT create one; saves=0
  {
    const w = boot(42);
    api.run(20);
    out.s1_absent = { dump: api.dump(), stored: w._store.get(SAVE_KEY) ?? null, size: w._store.size };
  }

  // S2: key present before initGame — restore fires; gated saves at ticks 10 and 20; counter/payload
  {
    const pre = makeWorld();
    boot(42, pre);
    api.run(3);
    api.spawn("crawler");
    const payload = JSON.stringify(api.snapshot());
    const w = makeWorld();
    w._store.set(SAVE_KEY, payload);
    boot(77, w);
    api.run(20);
    const stored = JSON.parse(w._store.get(SAVE_KEY)!);
    out.s2_gated_saves = {
      dump: api.dump(),
      savedAtTick: stored.savedAtTick,
      saveCounter: stored.saveCounter,
      storedKeys: Object.keys(stored).join(","),
    };
  }

  // S3: snapshot JSON key order pinned verbatim
  {
    boot(42);
    api.spawn("stalker");
    keys("KeyW"); keys("KeyS"); keys("KeyQ");
    out.s3_key_order = JSON.stringify(api.snapshot());
  }

  // S4: log truncation to last 20 entries
  {
    boot(5);
    api.run(30); // starvation messages accumulate
    const snap = api.snapshot();
    out.s4_log_trunc = { logLen: snap.log.length, firstTick: snap.log[0]?.tick ?? null, dump: api.dump() };
  }

  // S5: pendingEvents survive restore untouched (not in snapshot), fire at restored-relative tick
  {
    boot(42);
    api.schedule(15, "rockslide", 1);
    const snap = JSON.stringify(api.snapshot());
    api.run(5);
    api.restore(snap);
    api.run(20);
    out.s5_events_after_restore = api.dump();
  }

  // S6: live monster-array identity across snapshot+restore
  {
    const ref = m.monsters;
    boot(42);
    api.spawn("crawler"); api.spawn("stalker");
    const snap = JSON.stringify(api.snapshot());
    api.restore(snap);
    api.restore(snap);
    expect(m.monsters).toBe(ref);
    out.s6_identity = { len: ref.length, kinds: m.monsters.map((x: any) => x.kind) };
  }

  // S7: restore log attribution — "save restored" appended at the RESTORED tick
  {
    boot(42);
    const s = JSON.parse(JSON.stringify(api.snapshot()));
    s.tickCount = 7; s.hp = 50;
    api.restore(JSON.stringify(s));
    const log = api.snapshot().log;
    const last = log[log.length - 1];
    out.s7_attribution = { lastTick: last.tick, lastMsg: last.message, tickNow: s.tickCount };
  }

  // S8: RNG neutrality — rngState unchanged by snapshot() calls, restore, and gated saves
  {
    const w = makeWorld();
    boot(42, w);
    const r1 = api.snapshot().rngState;
    api.snapshot(); api.snapshot();
    const r2 = api.snapshot().rngState;
    api.restore(JSON.stringify(api.snapshot()));
    const r3 = api.snapshot().rngState;
    out.s8_rng_neutral = { r1, r2, r3, equal: r1 === r2 && r2 === r3 };
  }

  // S9: empty-string key — falsy raw, restore skipped, no throw
  {
    const w = makeWorld();
    w._store.set(SAVE_KEY, "");
    let threw = null;
    try { boot(42, w); } catch (e: any) { threw = String(e && e.message || e); }
    api.run(3);
    out.s9_empty = { threw, dump: api.dump() };
  }

  // S10: malformed key — must throw at initGame (no validation/defaulting allowed)
  {
    const w = makeWorld();
    w._store.set(SAVE_KEY, "notjson");
    let threw = null;
    try { resetGame(42); initGame(w); } catch (e: any) { threw = "THREW"; }
    out.s10_malformed = { threw };
  }

  // S11: single gated save at tick 10 only — payload fields
  {
    const seedw = makeWorld();
    boot(42, seedw);
    api.spawn("crawler");
    const full = JSON.stringify(api.snapshot()); // valid full snapshot as pre-existing save
    const w = makeWorld();
    w._store.set(SAVE_KEY, full);
    boot(42, w);
    api.run(10);
    const stored = JSON.parse(w._store.get(SAVE_KEY)!);
    out.s11_single_save = {
      dump: api.dump(),
      savedAtTick: stored.savedAtTick,
      saveCounter: stored.saveCounter,
      hasLog: Array.isArray(stored.log),
    };
  }

  // S12: long mixed run with pre-existing save key — full-surface pin incl. storage contents
  {
    const w = makeWorld();
    w._store.set(SAVE_KEY, "x"); // present but malformed: initGame must throw → catch and note
    let threw = null;
    try { resetGame(99); initGame(w); } catch (e: any) { threw = "THREW"; }
    out.s12_mixed = { threw };
    if (!threw) return;
  }

  // S13: mixed behavioral sequence post-restore — actions after restore keep counters/log exact
  {
    boot(42);
    api.spawn("stalker");
    keys("KeyF"); keys("KeyF");
    const snap = JSON.stringify(api.snapshot());
    keys("KeyW"); keys("KeyC");
    api.restore(snap);
    const w2 = makeWorld();
    w2._store.set(SAVE_KEY, snap);
    boot(55, w2);
    for (let i = 0; i < 12; i++) { keys("KeyW"); api.run(1); keys("KeyF"); }
    out.s13_after_restore = {
      dump: api.dump(),
      snapshot: JSON.stringify(api.snapshot()),
      stored: w2._store.get(SAVE_KEY),
      outputs: w2.output.length,
    };
  }

  console.log("A3DIFF::" + JSON.stringify(out));
  expect(true).toBe(true);
});

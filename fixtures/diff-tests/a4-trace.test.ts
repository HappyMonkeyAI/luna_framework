// Parent-side per-tick TRACE oracle for B4-A4 (NOT part of any packet; never shown to workers).
// A4 is judged by trace equivalence, not final-dump equality: records state after EVERY tick.
// Imports the PUBLIC surface only (api/keys/initGame/resetGame/monsters) — all valid pre/post-A4.
import { it, expect } from "vitest";
import * as m from "../src/main.js";

const { api, keys, initGame, resetGame } = m as any;

const SAVE_KEY = "ventr" + "alis:save";

function makeWorld(seedSave?: string) {
  const store = new Map<string, string>();
  if (seedSave !== undefined) store.set(SAVE_KEY, seedSave);
  const state = { writes: 0 };
  return {
    output: [] as Array<{ kind: string; text: string }>,
    storage: {
      get: (k: string) => (store.has(k) ? store.get(k)! : undefined),
      set: (k: string, v: string) => { state.writes += 1; store.set(k, v); },
    },
    _store: store,
    _state: state,
  };
}

function boot(seed: number, world = makeWorld()) {
  resetGame(seed);
  initGame(world);
  return world;
}

// Per-tick record: tick, new outputs (ordered), full log tail, hp/alive, monsters (kind/hp order),
// pending events, RNG state, save counter, dump string. snapshot() is verified side-effect-free.
function traceTick(w: any, t: any) {
  const s = api.snapshot();
  const dump = api.dump();
  t.push({
    n: s.tickCount,
    out: w.output.splice(0, w.output.length),
    log: s.log,
    hp: s.hp,
    alive: s.alive,
    mon: s.monsters.map((x: any) => `${x.kind}:${x.hp}`),
    ev: Number(/events=(\d+)/.exec(dump)?.[1] ?? -1),
    rng: s.rngState,
    saves: Number(/saves=(\d+)/.exec(dump)?.[1] ?? -1),
    writes: w._state.writes,
    dump,
  });
}

function runTraced(w: any, t: any, n: number) {
  for (let i = 0; i < n; i++) { api.run(1); traceTick(w, t); }
}

function storageView(w: any) {
  return { raw: w._store.get(SAVE_KEY) ?? null, writes: w._state.writes };
}

it("A4 per-tick trace", () => {
  const out: Record<string, unknown> = {};

  // T1: starvation + torch-buff decrement on same ticks (multiples of 5)
  {
    const w = boot(42);
    api.pickup("wood"); api.pickup("wood"); api.pickup("stone"); api.craft("torch");
    api.equip("torch");
    const t: any[] = [];
    runTraced(w, t, 12);
    out.t1_starve_buff = { t, dump: api.dump() };
  }

  // T2: due event + monster damage + death ordering on the same tick
  {
    const w = boot(42);
    api.spawn("stalker");
    api.schedule(4, "rockslide", 80); // kills on tick 4 while stalker also hits
    const t: any[] = [];
    runTraced(w, t, 6);
    out.t2_event_death = { t, dump: api.dump() };
  }

  // T3: crawler cadence (%3) vs stalker per-tick damage, mixed order array
  {
    const w = boot(42);
    api.spawn("crawler"); api.spawn("stalker"); api.spawn("crawler");
    const t: any[] = [];
    runTraced(w, t, 8);
    out.t3_cadence = { t, dump: api.dump() };
  }

  // T4a: %20 spawn — log parity EVEN (spawn fires, RNG consumed)
  {
    const w = boot(42);
    api.pickup("wood"); // wake + starves(3 by t15) + pickup say => parity control
    const t: any[] = [];
    runTraced(w, t, 22);
    out.t4a_parity_even = { t, dump: api.dump() };
  }

  // T4b: %20 spawn — log parity ODD (no draw at tick 20; parity flips at 21 via starvation msg)
  {
    const w = boot(42);
    const t: any[] = [];
    runTraced(w, t, 22);
    out.t4b_parity_odd = { t, dump: api.dump() };
  }

  // T5: gated save at ticks 10/20 alongside events + monsters (valid parent-produced payload only)
  {
    const w0 = boot(42);
    api.spawn("crawler");
    const payload = JSON.stringify(api.snapshot()); // real snapshot, not synthetic
    const w = boot(77, makeWorld(payload));
    api.schedule(11, "echo", 1);
    const t: any[] = [];
    runTraced(w, t, 21);
    out.t5_saves = { t, storage: storageView(w), dump: api.dump() };
  }

  // T6: scheduled events at past / current / future ticks (equality-only match)
  {
    const w = boot(42);
    api.schedule(2, "already-past", 0);   // never fires (=== only)
    const t: any[] = [];
    api.run(1); traceTick(w, t);           // tick 1
    api.schedule(2, "now-due", 3);         // scheduled after tick 1 for tick 2 (becomes due)
    runTraced(w, t, 4);                    // ticks 2-5
    out.t6_event_timing = { t, dump: api.dump() };
  }

  // T7: death then attempted actions (attack/eat/equip/keys after alive=false)
  {
    const w = boot(42);
    api.spawn("stalker");
    const t: any[] = [];
    runTraced(w, t, 30); // death lands well before 30
    keys("KeyF"); traceTick(w, t);
    keys("KeyE"); api.consumeRation(); api.equip("torch");
    runTraced(w, t, 5);
    out.t7_death_actions = { t, dump: api.dump() };
  }

  // T8: seeded attack sequence — RNG draw sites across miss/hit/kill
  {
    const w = boot(7);
    api.spawn("stalker");
    const t: any[] = [];
    for (let i = 0; i < 10; i++) { keys("KeyF"); traceTick(w, t); api.run(1); }
    out.t8_seeded_attacks = { t, dump: api.dump() };
  }

  // T9: restore -> ticks -> gated persistence save (identity + counter + attribution)
  {
    const w0 = boot(42);
    api.spawn("stalker"); api.spawn("crawler");
    keys("KeyF"); keys("KeyW");
    const payload = JSON.stringify(api.snapshot());
    const w = boot(9, makeWorld(payload));
    const t: any[] = [];
    runTraced(w, t, 12); // restore-at-init log entry + ticks + save at 10
    const ref = api.snapshot();
    api.restore(JSON.stringify(ref));
    keys("KeyF");
    runTraced(w, t, 3);
    out.t9_restore_ticks = { t, storage: storageView(w), dump: api.dump() };
  }

  // T10: long mixed input/tick sequence through every phase consumer
  {
    const w = boot(123);
    const t: any[] = [];
    for (let r = 0; r < 3; r++) {
      keys("KeyW"); keys("KeyS"); keys("KeyQ"); keys("KeyC");
      api.spawn("crawler"); api.schedule(10 + r * 10, "drip", 1);
      keys("KeyF");
      runTraced(w, t, 8);
      keys("KeyH");
      api.run(1); traceTick(w, t);
    }
    out.t10_mixed = { t, storage: storageView(w), dump: api.dump() };
  }

  console.log("A4TRACE::" + JSON.stringify(out));
  expect(true).toBe(true);
});

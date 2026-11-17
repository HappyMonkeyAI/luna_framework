// Parent-side differential harness for B4-A2 (NOT part of any packet; never shown to workers).
// Combat-focused scenarios; runs against each arm's post-A1 parent (pre-dispatch) and its A2 result.
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
  };
}

function boot(seed: number) {
  const world = makeWorld();
  resetGame(seed);
  initGame(world);
  return world;
}

it("A2 differential", () => {
  const out: Record<string, unknown> = {};

  // 0. live-array identity: exported monsters must be the SAME array across spawn/kill/restore
  {
    const ref = m.monsters;
    boot(42);
    api.spawn("crawler");
    expect(m.monsters).toBe(ref);
    keys("KeyF"); keys("KeyF"); keys("KeyF");
    expect(m.monsters).toBe(ref);
    api.restore(JSON.stringify(api.snapshot()));
    expect(m.monsters).toBe(ref);
    out.s0_identity = { len: ref.length };
  }

  // 1. single-monster attack sequence across RNG outcomes (seed 42: rolls 6,2,12,5,8,1,9,3,18,20)
  {
    boot(42);
    const snaps: string[] = [];
    api.spawn("crawler");
    for (let i = 0; i < 6; i++) { keys("KeyF"); snaps.push(api.dump()); }
    out.s1_attack_seq = snaps;
  }

  // 2. torch bonus changes rolls (RNG order + +2 path), kill then stone double-drop
  {
    boot(7);
    const world = makeWorld();
    resetGame(7); initGame(world);
    api.pickup("wood"); api.pickup("wood"); api.pickup("stone");
    api.craft("torch");
    keys("KeyE"); // equip via eat? no — equip torch directly
    api.equip("torch");
    api.spawn("stalker");
    const snaps: string[] = [];
    for (let i = 0; i < 8; i++) { keys("KeyF"); snaps.push(api.dump()); }
    out.s2_torch_combat = { snaps, outputs: world.output.slice() };
  }

  // 3. multi-spawn order + shift-removal keeps survivors' order
  {
    boot(123);
    api.spawn("stalker"); api.spawn("crawler"); api.spawn("stalker");
    const pre = api.dump();
    keys("KeyF"); keys("KeyF"); keys("KeyF"); keys("KeyF");
    out.s3_spawn_order = { pre, post: api.dump(), monsters: JSON.parse(JSON.stringify(api.state())) };
  }

  // 4. air-swing before any monster, then death gating: eat/equip/attack after alive=false
  {
    const world = boot(42);
    keys("KeyF"); // air swing
    api.spawn("stalker");
    for (let i = 0; i < 30; i++) api.run(1); // starvation + stalker damage → death
    const deadDump = api.dump();
    keys("KeyE"); keys("KeyF"); api.consumeRation();
    out.s4_death_gate = { deadDump, after: api.dump(), outputs: world.output.length };
  }

  // 5. crawler cadence over 30 ticks with scheduled events firing (equality-only match)
  {
    boot(42);
    api.spawn("crawler");
    api.schedule(10, "rockslide", 5);
    api.schedule(11, "rockslide", 5);
    api.schedule(9, "past-event-never-fires", 99);
    const snaps: string[] = [];
    for (let i = 0; i < 30; i++) { api.run(1); snaps.push(api.dump()); }
    out.s5_cadence_events = snaps;
  }

  // 6. long mixed sequence exercising every RNG consumer in fixed order
  {
    const world = boot(99);
    const snaps: string[] = [];
    for (let t = 0; t < 4; t++) {
      keys("KeyW"); keys("KeyS"); keys("KeyQ"); keys("KeyC"); keys("KeyH");
      api.run(5); keys("KeyF"); api.run(5);
      snaps.push(api.dump());
    }
    out.s6_mixed = snaps;
    out.s6_snapshot = JSON.stringify(api.snapshot());
    out.s6_outputs = world.output.length;
  }

  // 7. restore path keeps monster array contents (spawn, damage, snapshot, restore)
  {
    boot(42);
    api.spawn("crawler"); api.spawn("stalker");
    keys("KeyF"); keys("KeyF");
    const snap = JSON.stringify(api.snapshot());
    api.restore(snap);
    out.s7_restore = { snap, after: api.dump() };
  }

  console.log("A2DIFF::" + JSON.stringify(out));
  expect(true).toBe(true);
});

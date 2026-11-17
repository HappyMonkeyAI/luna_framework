// Parent-side differential harness for B4-A1 (NOT part of any packet; never shown to workers).
// Imports the PUBLIC surface only, so it runs against baseline and against migrated worktrees.
// Prints a JSON document; parent compares baseline vs worktree outputs.
import { describe, it } from "vitest";
import { resetGame, initGame, keys, api, type World } from "../src/main.js";

function makeWorld(seed?: Record<string, string>): World {
  return {
    canvas: { width: 640, height: 480 },
    storage: new Map(Object.entries(seed ?? {})),
    clock: () => 0,
    output: [],
  };
}

const scenarios: Record<string, unknown> = {};

describe("a1 differential", () => {
  it("captures scripted behavior", () => {
    // S1: mirror drift + secret ration wood + torch combat side-effects + output order + rng draws
    {
      const w = makeWorld();
      resetGame(42);
      initGame(w);
      api.pickup("wood");
      api.pickup("wood");
      api.pickup("stone");
      api.craft("torch");
      api.pickup("wood");
      for (let i = 0; i < 3; i += 1) api.pickup("stone");
      api.craft("ration");
      api.run(7);
      keys("KeyW");
      scenarios.s1 = {
        dump: api.dump(),
        output: w.output.map((o) => [o.kind, o.text]),
        snapshot: api.snapshot(),
      };
    }
    // S2: seeded combat order (roll 5 miss, 19 hit, 13 kill + double stone drop)
    {
      const w = makeWorld();
      resetGame(7);
      initGame(w);
      api.spawn("crawler");
      keys("KeyF");
      keys("KeyF");
      keys("KeyF");
      scenarios.s2 = {
        dump: api.dump(),
        output: w.output.map((o) => [o.kind, o.text]),
        snapshot: api.snapshot(),
      };
    }
    // S3: persistence gating + snapshot/restore round-trip + session-only saveCounter
    {
      const w1 = makeWorld();
      resetGame(42);
      initGame(w1);
      api.run(10);
      const noSave = w1.storage.get("ventralis:save");
      w1.storage.set("ventralis:save", JSON.stringify(api.snapshot()));
      api.run(10);
      const after = JSON.parse(w1.storage.get("ventralis:save")!);
      const snap = api.snapshot();
      const dumpBefore = api.dump();
      const w2 = makeWorld({ "ventralis:save": JSON.stringify(snap) });
      resetGame(999);
      initGame(w2);
      scenarios.s3 = {
        noSaveKeyUndefined: noSave === undefined,
        savedAtTick: after.savedAtTick,
        saveCounter: after.saveCounter,
        dumpRestoredEqualsBefore: api.dump() === dumpBefore,
        restoreOutput: w2.output.map((o) => [o.kind, o.text]),
        snapKeys: Object.keys(snap).sort(),
      };
    }
    // S4: equality-only scheduled events (tick-2 event must not fire at tick 1 or linger past 2)
    {
      const w = makeWorld();
      resetGame(42);
      initGame(w);
      api.schedule(3, "rocks fall", 10);
      api.run(1);
      const hp1 = api.state().hp;
      api.run(1);
      const hp2 = api.state().hp;
      api.run(1);
      const hp3 = api.state().hp;
      api.run(1);
      scenarios.s4 = { hp1, hp2, hp3, hp4: api.state().hp, dump: api.dump() };
    }
    // S5: KeyH panel-before-re-equip with crafted torch
    {
      const w = makeWorld();
      resetGame(42);
      initGame(w);
      api.pickup("wood");
      api.pickup("wood");
      api.pickup("stone");
      api.craft("torch");
      keys("KeyH");
      scenarios.s5 = { output: w.output.map((o) => [o.kind, o.text]) };
    }
    // S6: death freezes actions but tick continues; overload text
    {
      const w = makeWorld();
      resetGame(42);
      initGame(w);
      api.schedule(1, "doom", 100);
      api.run(1);
      const deadDump = api.dump();
      api.pickup("wood");
      api.craft("torch");
      keys("KeyF");
      api.run(3);
      scenarios.s6 = { deadDump, afterDump: api.dump(), output: w.output.map((o) => [o.kind, o.text]) };
    }
    console.log("A1DIFF::" + JSON.stringify(scenarios));
  });
});

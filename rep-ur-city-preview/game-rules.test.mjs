import assert from "node:assert/strict";
import test from "node:test";
import { MULTIPLIERS, previewPoints, summarizeDemoActions } from "./game-rules.mjs";

test("requested one-at-a-time example CP multipliers", () => {
  assert.deepEqual(MULTIPLIERS.map((m) => previewPoints(m.id)), [100, 150, 200, 250, 300]);
});
test("does not accept unknown multipliers or invalid base values", () => {
  assert.throws(() => previewPoints("fake"));
  assert.throws(() => previewPoints("detroit", -1));
  assert.throws(() => previewPoints("detroit", Number.NaN));
});
test("sample totals count only valid demonstration entries", () => {
  assert.deepEqual(summarizeDemoActions([
    { team: "East", points: 150 },
    { team: "West", points: 100 },
    { team: "unknown", points: 10000 },
    { team: "East", points: -3 },
  ]), { East: 150, West: 100, count: 2 });
});
test("score lab starts with zero participation", () => {
  assert.deepEqual(summarizeDemoActions([]), { East: 0, West: 0, count: 0 });
});

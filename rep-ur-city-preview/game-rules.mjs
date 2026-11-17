/**
 * Rep Ur City demonstration-only points rules.
 *
 * These are isolated examples of requested CP multipliers — NOT a reward
 * ledger, final stacking logic, or a wallet transfer system.
 */
export const DEMO_BASE_POINTS = 100;
export const MULTIPLIERS = Object.freeze([
  { id: "detroit", label: "Detroit ZIP purchase", factor: 1 },
  { id: "locally-owned", label: "Black-owned Detroit business", factor: 1.5 },
  { id: "verified", label: "7Tribes-verified business", factor: 2 },
  { id: "first-visit", label: "First-time visit", factor: 2.5 },
  { id: "weekly", label: "Mission-critical business of the week", factor: 3 },
]);
export const TEAMS = Object.freeze(["East", "West"]);

export function previewPoints(multiplierId, base = DEMO_BASE_POINTS) {
  if (typeof base !== "number" || !Number.isFinite(base) || base < 0) {
    throw new RangeError("Base points must be a finite non-negative number");
  }
  const entry = MULTIPLIERS.find((m) => m.id === multiplierId);
  if (!entry) throw new RangeError("Unknown example multiplier");
  // One multiplier per example; combination policy is not defined yet.
  return Math.round(base * entry.factor * 100) / 100;
}

export function summarizeDemoActions(actions) {
  const result = { East: 0, West: 0, count: 0 };
  for (const action of actions) {
    if (!TEAMS.includes(action.team)) continue;
    if (typeof action.points !== "number" || !Number.isFinite(action.points) || action.points < 0) continue;
    result[action.team] += action.points;
    result.count++;
  }
  return result;
}

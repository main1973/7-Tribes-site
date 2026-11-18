import { MULTIPLIERS, previewPoints, summarizeDemoActions, TEAMS } from "./game-rules.mjs";

// Entirely fictional proof tokens. No user-supplied receipt numbers, uploads,
// merchant identifiers, payment details, network calls, or persistent storage.
export const SAMPLE_PROOFS = Object.freeze([
  Object.freeze({ token: "DEMO-A01", merchant: "Demo Corner Store" }),
  Object.freeze({ token: "DEMO-B02", merchant: "Demo Print Shop" }),
  Object.freeze({ token: "DEMO-C03", merchant: "Demo Food Counter" }),
  Object.freeze({ token: "DEMO-D04", merchant: "Demo Neighborhood Market" }),
  Object.freeze({ token: "DEMO-E05", merchant: "Demo Services Desk" }),
  Object.freeze({ token: "DEMO-F06", merchant: "Demo Pop-up Shop" }),
]);

const KNOWN_TOKENS = new Set(SAMPLE_PROOFS.map(({ token }) => token));
const KNOWN_MULTIPLIERS = new Set(MULTIPLIERS.map(({ id }) => id));

export function emptyDemoReview() {
  return { submissions: [] };
}

export function submitDemoProof(state, input) {
  const { token, team, multiplierId } = input ?? {};
  if (!KNOWN_TOKENS.has(token)) throw new RangeError("Only fictional demo proof tokens are allowed");
  if (!TEAMS.includes(team)) throw new RangeError("Choose a valid sample team");
  if (!KNOWN_MULTIPLIERS.has(multiplierId)) throw new RangeError("Choose a valid sample multiplier");
  if (state.submissions.some((submission) => submission.token === token)) {
    throw new Error("Sample proof already submitted in this session — duplicate blocked");
  }
  return {
    submissions: [...state.submissions, {
      token,
      team,
      multiplierId,
      points: previewPoints(multiplierId),
      status: "pending",
    }],
  };
}

export function decideDemoProof(state, token, decision) {
  if (decision !== "approved" && decision !== "rejected") {
    throw new RangeError("Review decision must be approved or rejected");
  }
  const current = state.submissions.find((entry) => entry.token === token);
  if (!current) throw new Error("Demo proof not found");
  if (current.status !== "pending") throw new Error("Only pending demo proofs can be reviewed");
  return {
    submissions: state.submissions.map((entry) =>
      entry.token === token ? { ...entry, status: decision } : entry
    ),
  };
}

export function reverseDemoProof(state, token) {
  const current = state.submissions.find((entry) => entry.token === token);
  if (!current) throw new Error("Demo proof not found");
  if (current.status !== "approved") throw new Error("Only approved demo scores can be reversed");
  return {
    submissions: state.submissions.map((entry) =>
      entry.token === token ? { ...entry, status: "reversed" } : entry
    ),
  };
}

export function summarizeDemoReviews(state) {
  const approved = state.submissions.filter((entry) => entry.status === "approved");
  const totals = summarizeDemoActions(approved);
  return {
    ...totals,
    pending: state.submissions.filter((entry) => entry.status === "pending").length,
    rejected: state.submissions.filter((entry) => entry.status === "rejected").length,
    reversed: state.submissions.filter((entry) => entry.status === "reversed").length,
    submitted: state.submissions.length,
  };
}

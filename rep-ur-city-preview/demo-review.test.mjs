import assert from "node:assert/strict";
import test from "node:test";
import {
  SAMPLE_PROOFS, emptyDemoReview, submitDemoProof,
  decideDemoProof, reverseDemoProof, summarizeDemoReviews,
} from "./demo-review.mjs";

const sample = { token: SAMPLE_PROOFS[0].token, team: "East", multiplierId: "verified" };

test("demo board starts empty and has no real merchant data", () => {
  assert.deepEqual(summarizeDemoReviews(emptyDemoReview()), {
    East: 0, West: 0, count: 0, pending: 0, rejected: 0, reversed: 0, submitted: 0,
  });
  assert.equal(SAMPLE_PROOFS.every((proof) => proof.token.startsWith("DEMO-")), true);
  assert.equal(SAMPLE_PROOFS.every((proof) => proof.merchant.startsWith("Demo ")), true);
});

test("submitting an illustrative proof puts it in review and awards zero CP", () => {
  const next = submitDemoProof(emptyDemoReview(), sample);
  assert.equal(next.submissions[0].status, "pending");
  assert.equal(next.submissions[0].points, 200);
  assert.deepEqual(summarizeDemoReviews(next), {
    East: 0, West: 0, count: 0, pending: 1, rejected: 0, reversed: 0, submitted: 1,
  });
});

test("sample review approval adds points to exactly the selected side", () => {
  let state = submitDemoProof(emptyDemoReview(), sample);
  state = decideDemoProof(state, sample.token, "approved");
  assert.deepEqual(summarizeDemoReviews(state), {
    East: 200, West: 0, count: 1, pending: 0, rejected: 0, reversed: 0, submitted: 1,
  });
});

test("duplicate submitted demo token is blocked even if rejected or reversed", () => {
  const pending = submitDemoProof(emptyDemoReview(), sample);
  for (const s of [pending, decideDemoProof(pending, sample.token, "rejected"),
    reverseDemoProof(decideDemoProof(pending, sample.token, "approved"), sample.token)]) {
    assert.throws(() => submitDemoProof(s, sample), /duplicate blocked/);
  }
});

test("review rejection does not credit points; reversal removes approved points", () => {
  const rejected = decideDemoProof(submitDemoProof(emptyDemoReview(), sample), sample.token, "rejected");
  assert.equal(summarizeDemoReviews(rejected).East, 0);
  assert.equal(summarizeDemoReviews(rejected).rejected, 1);
  const approved = decideDemoProof(submitDemoProof(emptyDemoReview(), sample), sample.token, "approved");
  const reversed = reverseDemoProof(approved, sample.token);
  assert.equal(summarizeDemoReviews(reversed).East, 0);
  assert.equal(summarizeDemoReviews(reversed).reversed, 1);
});

test("no double approval, no rejected approval and no second reversal", () => {
  const pending = submitDemoProof(emptyDemoReview(), sample);
  const approved = decideDemoProof(pending, sample.token, "approved");
  const rejected = decideDemoProof(pending, sample.token, "rejected");
  assert.throws(() => decideDemoProof(approved, sample.token, "approved"));
  assert.throws(() => decideDemoProof(rejected, sample.token, "approved"));
  assert.throws(() => reverseDemoProof(pending, sample.token));
  const reversed = reverseDemoProof(approved, sample.token);
  assert.throws(() => reverseDemoProof(reversed, sample.token));
});

test("reject unknown tokens, arbitrary receipts, teams and multipliers", () => {
  for (const invalid of [
    { ...sample, token: "REAL-RECEIPT-1234" },
    { ...sample, token: "DEMO-X99" },
    { ...sample, team: "Outside Detroit" },
    { ...sample, multiplierId: "stacked" },
  ]) {
    assert.throws(() => submitDemoProof(emptyDemoReview(), invalid));
  }
});

test("independent sample entries score independently, reset clears all", () => {
  let state = submitDemoProof(emptyDemoReview(), sample);
  state = submitDemoProof(state, { token: SAMPLE_PROOFS[1].token, team: "West", multiplierId: "first-visit" });
  state = decideDemoProof(state, sample.token, "approved");
  assert.equal(summarizeDemoReviews(state).West, 0);
  state = decideDemoProof(state, SAMPLE_PROOFS[1].token, "approved");
  assert.equal(summarizeDemoReviews(state).West, 250);
  assert.equal(summarizeDemoReviews(state).East, 200);
  assert.equal(summarizeDemoReviews(emptyDemoReview()).submitted, 0);
});

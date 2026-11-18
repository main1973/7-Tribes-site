import { MULTIPLIERS, previewPoints } from "./game-rules.mjs";
import {
  SAMPLE_PROOFS, emptyDemoReview, submitDemoProof, decideDemoProof,
  reverseDemoProof, summarizeDemoReviews,
} from "./demo-review.mjs";

// This is an intentionally in-memory prototype: no production API, real
// receipt, uploaded file, payment data, account, wallet, or permanent points.
let review = emptyDemoReview();
const form = document.getElementById("demo-form");
const proofInput = document.getElementById("proof-token");
const teamInput = document.getElementById("team");
const multiplierInput = document.getElementById("multiplier");
const output = document.getElementById("preview-points");
const east = document.getElementById("east-score");
const west = document.getElementById("west-score");
const actionCount = document.getElementById("demo-count");
const pendingCount = document.getElementById("demo-pending");
const rejectedCount = document.getElementById("demo-rejected");
const reversedCount = document.getElementById("demo-reversed");
const reviewList = document.getElementById("review-list");
const message = document.getElementById("demo-message");
const reset = document.getElementById("reset-demo");

for (const { token, merchant } of SAMPLE_PROOFS) {
  const option = document.createElement("option");
  option.value = token;
  option.textContent = `${token} — ${merchant} (fictional)`;
  proofInput.appendChild(option);
}
for (const rule of MULTIPLIERS) {
  const option = document.createElement("option");
  option.value = rule.id;
  option.textContent = `${rule.label} (×${rule.factor.toFixed(1)})`;
  multiplierInput.appendChild(option);
}

function node(type, className, content) {
  const el = document.createElement(type);
  if (className) el.className = className;
  if (content != null) el.textContent = String(content);
  return el;
}

function addAction(row, token, action, text) {
  const btn = node("button", "btn tiny", text);
  btn.type = "button";
  btn.dataset.token = token;
  btn.dataset.action = action;
  btn.setAttribute("aria-label", `${text} fictional proof ${token}`);
  row.appendChild(btn);
}

function renderQueue() {
  reviewList.replaceChildren();
  if (!review.submissions.length) {
    reviewList.appendChild(node("p", "review-empty", "No fictional proofs submitted yet."));
    return;
  }
  for (const entry of review.submissions) {
    const sample = SAMPLE_PROOFS.find((proof) => proof.token === entry.token);
    const card = node("article", "review-card");
    const heading = node("div", "review-card-heading");
    heading.appendChild(node("strong", "", `${entry.token} · ${sample?.merchant ?? "Demo merchant"}`));
    heading.appendChild(node("span", `review-status status-${entry.status}`, entry.status.toUpperCase()));
    const details = node("p", "fine-print", `${entry.team} · ${entry.points} example CP · one multiplier · ${entry.status === "approved" ? "simulated credit" : "not credited"}`);
    const actions = node("div", "review-actions");
    if (entry.status === "pending") {
      addAction(actions, entry.token, "approved", "Simulate approval");
      addAction(actions, entry.token, "rejected", "Simulate rejection");
    } else if (entry.status === "approved") {
      addAction(actions, entry.token, "reverse", "Simulate reversal");
    }
    card.appendChild(heading);
    card.appendChild(details);
    if (actions.childElementCount) card.appendChild(actions);
    reviewList.appendChild(card);
  }
}

function render() {
  output.textContent = `${previewPoints(multiplierInput.value).toLocaleString()} CP`;
  const totals = summarizeDemoReviews(review);
  east.textContent = totals.East.toLocaleString();
  west.textContent = totals.West.toLocaleString();
  actionCount.textContent = String(totals.count);
  pendingCount.textContent = String(totals.pending);
  rejectedCount.textContent = String(totals.rejected);
  reversedCount.textContent = String(totals.reversed);
  renderQueue();
}

multiplierInput.addEventListener("change", render);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    review = submitDemoProof(review, {
      token: proofInput.value,
      team: teamInput.value,
      multiplierId: multiplierInput.value,
    });
    message.textContent = "Fictional sample proof submitted as pending. Use the review controls below.";
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : "Invalid demo submission";
  }
  render();
});

reviewList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action][data-token]");
  if (!button || !reviewList.contains(button)) return;
  try {
    review = button.dataset.action === "reverse"
      ? reverseDemoProof(review, button.dataset.token)
      : decideDemoProof(review, button.dataset.token, button.dataset.action);
    message.textContent = "Demo review status updated. Only approved fictional entries contribute to the sample scoreboard.";
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : "Invalid demo review";
  }
  render();
});

reset.addEventListener("click", () => {
  review = emptyDemoReview();
  message.textContent = "Demo board and proof queue cleared. No actual records were affected.";
  render();
});
render();

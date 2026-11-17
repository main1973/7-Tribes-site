import { MULTIPLIERS, previewPoints, summarizeDemoActions } from "./game-rules.mjs";

// Purely in-memory experiment: no production API, user data, wallet connection,
// receipts or durable score ledger in this non-published preview.
const sessionActions = [];
const form = document.getElementById("demo-form");
const teamInput = document.getElementById("team");
const multiplierInput = document.getElementById("multiplier");
const output = document.getElementById("preview-points");
const east = document.getElementById("east-score");
const west = document.getElementById("west-score");
const actionCount = document.getElementById("demo-count");
const reset = document.getElementById("reset-demo");

for (const rule of MULTIPLIERS) {
  const option = document.createElement("option");
  option.value = rule.id;
  option.textContent = `${rule.label} (×${rule.factor.toFixed(1)})`;
  multiplierInput.appendChild(option);
}

function render() {
  output.textContent = `${previewPoints(multiplierInput.value).toLocaleString()} CP`;
  const totals = summarizeDemoActions(sessionActions);
  east.textContent = totals.East.toLocaleString();
  west.textContent = totals.West.toLocaleString();
  actionCount.textContent = String(totals.count);
}

multiplierInput.addEventListener("change", render);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  sessionActions.push({
    team: teamInput.value,
    points: previewPoints(multiplierInput.value),
  });
  render();
});
reset.addEventListener("click", () => {
  sessionActions.length = 0;
  render();
});
render();

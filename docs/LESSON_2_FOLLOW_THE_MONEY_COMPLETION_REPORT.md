# Life Academy Lesson 2 — Follow the Money

**Release scope:** Module 1, Lesson 2 for the existing 7Tribes Life Academy. This release retains Lesson 1, the shared Account flow, existing responsive design, and all unrelated 7Tribes services.

## Learner experience

Lesson 2 is a public-readable, approximately 22-minute learning journey titled **Follow the Money**. It teaches the distinction between gross and net pay, how spending becomes business revenue rather than automatic profit, a clearly labeled hypothetical $100 restaurant allocation, economic circulation, the limits of income-only comparisons, productive capacity, the role of trade, and supply-chain mapping through a loaf of bread.

The lesson includes three public immediate-feedback scenarios and a public, eight-question Knowledge Check with published prompts and choices. It contains no personal tax calculation, financial recommendation, investment claim, real business margin, community performance statistic, token reward, or marketplace feature.

## Private learning and completion

| Item | Privacy and completion behavior |
|---|---|
| Section progress | Recorded through the authenticated database session only when a signed-in learner views a required Lesson 2 section. |
| $100 Journey | The public explanatory path remains readable; selecting a path saves privately only after sign-in. |
| Household supply-chain exercise | Requires five private entries. “Unknown / I do not know” remains a valid response. |
| Capability-gap exercise | Requires one private response and does not create a public business listing, claim, or recommendation. |
| Knowledge Check | Prompts are publicly readable; submission, score, explanations, and attempt storage require sign-in. |
| Completion | The server validates all required sections, interactive scenarios, private exercises, and a passing score of 6 out of 8 before creating a completion record. |

## Database and security changes

| Migration | Purpose |
|---|---|
| `20260822230000_life_academy_lesson2_follow_the_money.sql` | Publishes Lesson 2, creates its structured sections, eight-question quiz, private exercise-response table, authenticated section-progress RPC, detailed quiz feedback, and server-validated completion RPC. |
| `20260822231000_restrict_academy_private_rpc_execution.sql` | Removes anonymous access from private Academy SECURITY DEFINER RPCs while retaining authenticated execution. |
| `20260822231500_restore_public_curriculum_read_helper.sql` | Restores only the existing null-safe founder-check helper needed for public published-curriculum RLS evaluation; it exposes no private data. |

No learner, private-exercise, progress, quiz-attempt, capability, completion, profile, role, or authentication record was created by the migration or QA process.

## Routes and administration

The lesson is available at `/academy/lesson-2.html`; the existing single Module 1 roadmap now presents Lesson 2 as available and leaves Lessons 3–7 as Coming Soon. The existing database-controlled Academy founder administration surface now includes a Lesson 2 editor for lesson metadata, structured sections, scenarios, private-exercise instructions, quiz prompts, answer choices, explanations, answer key, and publication state. Signed-out visitors see no learner data or editor fields.

## Validation status

Public lesson rendering, all mobile target widths from 320 px through 430 px, desktop layout, public scenarios, Journey visualization, signed-out Account gates, public quiz prompts, anonymous private-table reads, RPC privilege grants, private founder-administration protection, syntax checks, and the deployed signed-out path were verified. No fake learner account or fake private learner response was used.

The remaining optional validation is an authorized founder session opening the editor and a real learner completing all private work; this was not performed because it would create genuine private learning records. The server-side validation and RLS boundaries are deployed and independently inspected.

# Lesson 4 — How Business Actually Works QA

## Production route and public-learning check

The production route `https://7trb.com/academy/lesson-4.html` loaded after deployment of `fe08bdb`. It rendered the public lesson opening, the revenue-versus-profit example, business-money destinations, productive-asset comparison, T-shirt supply chain, self-employment comparison, dependency exercise, local-circulation explanation, private business-map form, Knowledge Check, and completion callout.

The Educational Business Simulator initialized to its documented illustrative values: **$5,000** revenue, **$2,000** variable costs, **$5,000** total expenses, **$0** operating result, and **0.0%** operating margin. The page labels the calculator as non-persistent and not accounting, tax, legal, or investment advice.

The production Knowledge Check rendered all **eight** published prompts and answer choices. The public document and rendered quiz surface contained no answer-key field or correct-answer metadata. No form was submitted, and no learner record, progress, quiz attempt, exercise response, or completion was created during this check.

## Founder authorization check

The current production browser session returned `founder_admin` through the user-scoped database role helper. The live Academy Controls page then rendered the protected **Lesson 4 content editor**, including title, summary, publication status, structured content and simulator configuration, public quiz prompts and explanations, founder-only answer key, passing score, and Save action. The editor does not render learner exercise responses. No editor field was changed or saved during this verification.

## Mobile visual review

Representative production captures at **320 px** and **430 px** show the Academy header, Lesson 4 title, metadata, progress rail, opening copy, and first flow diagram contained inside the viewport. The navigation reduces to the existing compact brand plus Save progress action, long headings wrap without clipping, and the business flow is vertically stacked on narrow screens. No horizontal overflow was visible in either representative capture.

The additional **360 px** and **390 px** captures show the same contained header, readable title and metadata wrapping, single-column lesson structure, and vertically sequenced opening flow. No clipping or horizontal overflow was visible in either viewport.

The **375 px** and **412 px** captures likewise show the title, explanatory text, and flow diagram within the viewport with the compact header and Save progress control intact. Together, the reviewed **320 px, 360 px, 375 px, 390 px, 412 px, and 430 px** captures show no observed horizontal overflow, clipped heading, or broken mobile layout at the requested widths.

## Learner-data safeguard and roadmap confirmation

Opening the lesson in the authenticated founder browser caused one unintended Lesson 4 progress row through the normal section-tracking mechanism. A minimal count check confirmed that this was the only new trace: there were no Lesson 4 completion, quiz-attempt, or exercise-response rows. That single test progress row was then removed through a scoped cleanup, and a post-cleanup count confirmed **zero** Lesson 4 progress, completion, quiz-attempt, and exercise rows for the founder session.

The cache-busted production roadmap then displayed **Lesson 4 — Available**, while its pre-existing Lesson 1 completion and Lesson 2–3 in-progress labels remained intact. Lesson 5 remained **Coming Soon**.

## Anonymous public-quiz boundary

A read-only anonymous call to the established public quiz helper returned **eight** Lesson 4 questions with only `id`, `prompt`, `choices`, and `explanations` keys. The response contained no `answer_key` field. The private answer key remains available only through the database-role-gated founder editor.

An unauthenticated completion-RPC request received **HTTP 401** with `permission denied for function complete_academy_lesson4`. This confirms the corrected function grant prevents anonymous completion writes.

An anonymous Map a Real Business insert attempt was denied with **HTTP 401** and an RLS-policy error before any private exercise row was created. This verifies that the private exercise storage path is authenticated and owner-protected.

## Real-completion reconciliation

After the user reported a real Lesson 4 save, the automation browser confirmed that it was authenticated but, through its own RLS-scoped view, found no Lesson 4 completion, passed quiz, or `map-real-business` exercise row. No private response content was selected. This is consistent with the user completing the work in a different authenticated browser/session or the completion action not having finished in the current session. The completion UI was therefore not marked as verified, and no record was changed during this diagnostic.

## Mobile bottom-reach repair

The reported inability to reach the lower Lesson 4 controls was addressed with explicit vertical touch scrolling, safe-area bottom padding, corrected target offsets, and a compact action navigator for **Map a business**, **Knowledge Check**, and **Complete Lesson 4**. The deployed page exposes all three direct action links. The initial automated anchor click required a follow-up smooth-scroll timing check because the browser environment applies a multi-second smooth-scroll transition; no form or learner data was touched during this test.

After allowing that transition to complete, the browser reported a nonzero page scroll position and placed the `#complete` target within the viewport. This confirms the direct navigator can reach the final controls without requiring the learner to manually traverse the entire lesson.

After the user subsequently clarified that only the navigation repair—not the private-map, quiz, or completion flow—had been completed, the same authenticated `founder_admin` browser correctly returned no Lesson 4 private-map row, passed quiz attempt, or completion row through its own RLS-scoped checks. No response content, answer payload, or learner profile data was retrieved. The mobile reachability repair is verified; end-to-end persistence remains intentionally pending a future real learner submission.

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

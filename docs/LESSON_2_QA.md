# Life Academy Lesson 2 — QA Record

## Local public rendering

The published Lesson 2 page was loaded from a plain static server using the real Supabase publishable client. The public narrative, gross-pay and revenue examples, $100 Journey controls, circulation and trade sections, supply-chain exercise shell, capability-gap exercise shell, and eight Knowledge Check prompts rendered without authentication. The server-published Lesson 2 quiz prompts loaded through the public prompt RPC; no answer key was selected or exposed.

## Signed-out privacy gate

The signed-out private supply-chain save action rendered the approved Account gate with a return URL to `#supply-chain`. The browser had no authenticated session. The action created no private response, learner progress, quiz attempt, completion, or browser-storage record. Public scenario feedback was verified separately through the browser’s native interaction handler.

## Initial mobile review

The public Lesson 2 page was captured at 320 px and 430 px using the local plain static server. At both widths, the header remained compact, the long lesson title wrapped without clipping, the introductory rail became a contained block, the gross-pay flow stacked vertically, and no horizontal overflow was observed in the rendered viewport. The same responsive rules will be checked across the remaining required widths, extended lesson sections, forms, $100 Journey controls, and completion area before release.

Full-length captures at 390 px and 1280 px confirm that the complete Lesson 2 flow remains structured and readable beyond the opening viewport. The $100 Journey, circulation diagram, community comparison, bread supply-chain view, five-purchase exercise, capability-gap checklist, eight-question Knowledge Check, and completion gate all remain inside their respective containers. On mobile, content reflows vertically; on desktop, the lesson maintains its established rail-and-content composition. No clipping or observed horizontal overflow occurred in these full-length views.

The 360 px and 375 px captures confirm the compact header, save-progress action, long lesson heading, descriptive metadata, section rail, narrative copy, and vertical gross-pay diagram remain visible and horizontally contained at the intermediate required phone widths.

## Public and private interaction boundaries

The public gross-pay scenario returned immediate teaching feedback without a session or write. The public $100 Journey rendered an illustrative path, then correctly presented the Account gate for private saving because the browser had no authenticated session. A direct anonymous REST check returned the published Lesson 2 metadata while returning empty results for the private exercise table and Academy progress table.

The database security-advisor review found pre-existing anonymous execution grants on private SECURITY DEFINER Academy RPCs. A targeted corrective migration was applied before release. Direct privilege verification now confirms the Lesson 2 completion, section-tracking, and quiz-submission RPCs are executable by `authenticated` only. The public quiz-prompt RPC remains the single intentional anonymous Academy RPC in this flow and does not expose answer keys.

After restoring the null-safe `is_academy_founder()` helper used by the existing published-curriculum RLS policies, the public Lesson 2 record and all eight Knowledge Check prompts load correctly again. A signed-out Knowledge Check submit displays the Account gate and creates no attempt. The local Academy roadmap shows one Module 1 with Lesson 1 and Lesson 2 available, while Lessons 3–7 remain Coming Soon. The signed-out founder-administration route exposes no learner records or editor fields and explains that the existing database-controlled founder role is required.

The deployed Lesson 2 route was loaded through a cache-busting production request. It rendered the complete public lesson, the five-entry supply-chain form, eight public prompts, and the signed-out Account gate on quiz submission. No database record was created by the production public-path checks.

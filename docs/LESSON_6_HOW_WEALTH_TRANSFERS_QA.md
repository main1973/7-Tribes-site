# Lesson 6 — How Wealth Transfers: QA Record

## Release scope

Lesson 6 is the sixth published lesson in Module 1, **How America Works**. It adds the approved wealth-transfer curriculum, a non-persistent **Follow $100** simulator, a private **Follow Your Own Money** capability exercise, an eight-question Knowledge Check, authenticated server-side completion, a founder-only curriculum editor, and a Lesson 6 roadmap entry.

## Database and security baseline

Migration `20260826130000_life_academy_lesson6_how_wealth_transfers.sql` applied successfully without inserting, resetting, or modifying learner progress, exercise responses, quiz attempts, completions, or user roles. The completion function explicitly revokes public and anonymous execution, grants execution only to `authenticated`, checks `auth.uid()`, requires the published Lesson 6 record, all required section keys, a passed private quiz attempt, and a complete private money-map response.

The post-migration security advisor lists `complete_academy_lesson6` only as an authenticated callable security-definer function, consistent with the protected Academy completion pattern. It does not report anonymous execution for the new Lesson 6 completion function. Existing intentional public quiz-reader and pre-existing Academy authenticated function advisories remain outside this Lesson 6 change.

## Verification log

Production route, Follow $100 reconciliation, mobile, private RLS, anonymous answer-key shape, founder-editor rendering, roadmap, and real-data persistence findings will be appended after deployment. No fabricated learner record may be used for these checks.

### Production route and representative mobile review

The cache-busted production route includes the Lesson 6 title, public wealth-transfer curriculum, Follow $100 control surface, private money map, and Lesson 6 controller reference. Signed-out production captures at 320 px and 430 px show the compact header, three direct-action controls, mobile single-column opening content, formula card, asset and liability cards, and transaction diagram without observed horizontal overflow or clipped text.

The 360 px and 390 px signed-out production captures show the same contained action bar, responsive title wrapping, readable opening copy, formula card, asset/liability cards, and beginning transaction diagram. No horizontal overflow or text clipping was observed.

The 375 px and 412 px signed-out production captures complete the requested six-width review. The direct-action controls remain touch-safe, headings wrap without collision, and the lesson remains in the established single-column Academy presentation with no observed horizontal overflow.

### Public and private security boundaries

A read-only anonymous quiz request returned eight published Lesson 6 prompts and explanations with no `answer_key` field. Anonymous Lesson 6 completion returned HTTP 401. An anonymous private Follow Your Own Money insertion attempt returned HTTP 401 and did not create a learner record.

### Founder administration

In the existing authenticated founder session, the production Academy administration page rendered the protected Lesson 6 title, summary, publication status, structured curriculum JSON, quiz questions, private answer key, passing score, and save control. No curriculum field was edited or saved, and no learner response was opened.

### Roadmap state

The deployed Module 1 roadmap renders Lesson 6 as **Available** with its production route. Lessons 1–5 remain accessible, and Lesson 7 remains **Coming Soon**. The read-only roadmap review did not open the Lesson 6 learning route or create Lesson 6 progress.

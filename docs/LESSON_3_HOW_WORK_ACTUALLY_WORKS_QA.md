# Life Academy Lesson 3 — QA Record

## Public scenario behavior

The initial Lesson 3 local QA found that the public scenario controller selected every node carrying `data-l3-scenario`, including nested answer buttons. That prevented the container-level feedback contract from attaching. The controller now scopes its selector to `.academy-scenario[data-l3-scenario]`, and both scenario containers carry the matching identifier.

The corrected signed-out public revenue-context scenario now provides immediate educational feedback, marks the selected answer with `aria-pressed="true"`, disables the remaining answer controls, and reports the signed-out state. It does not make a private response, progress, completion, quiz, or other database write.

## Academy roadmap containment

Roadmap captures were generated at 320 px, 360 px, 390 px, 412 px, 430 px, and 1280 px. The inspected 320 px route shows all seven lesson cards in a single contained column: Lesson 3 is available, Lesson 4 remains Coming Soon, titles and descriptions wrap within each card, button labels remain visible, and the closing Lesson 3 entry action fits the page width. The desktop review preserves the same hierarchy in a readable one-row-per-lesson presentation. No horizontal page overflow or hidden lesson content was observed in the inspected views.

The mobile fix relies on the existing Academy responsive system rather than a separate layout: cards use intrinsic width, `min-width: 0`, wrapped descriptions, and stacked action treatment beneath the mobile breakpoint. The header, public learning callout, Create Account/Log In actions, and footer remain in the established responsive presentation.

## Signed-out gates and RLS

The signed-out private work-audit and Knowledge Check actions each render the standard Account persistence message with the relevant section return anchor before evaluating private form content or storing any response. The public active-versus-leveraged income and ownership-ladder controls produce their immediate educational explanations without a session or write.

An anonymous query through the same browser Supabase client returns the published Lesson 3 record and zero rows from both `academy_lesson_exercise_responses` and `academy_lesson_progress`. The private response and progress tables are therefore not readable to the public session, while the published lesson remains readable.

## Full lesson responsive review

Full Lesson 3 captures were generated at 320 px, 390 px, 430 px, and 1280 px. The inspected 320 px view preserves a single readable column through the work-exchange sequence, public scenario, four economic-position cards, leverage comparison, ownership scenario, and ownership ladder; content wraps within the viewport without observed horizontal page overflow. The inspected 1280 px view retains the Academy rail-and-content composition, a balanced four-position grid, contained private forms, readable Knowledge Check, and a completion callout that stays within the lesson column.

The full lesson uses the existing black-and-gold Academy system, native buttons and inputs, visible focusable controls, `aria-live` feedback areas, fieldset/legend grouping for private selections, and no unapproved visual redesign. No Lesson 1 or Lesson 2 content was changed by this review.

## Founder-editor protection

The generalized Academy administration route now includes protected Lesson 2 and Lesson 3 editor holders. A signed-out local visit renders only the role-required messages and exposes no title, summary, structured-content JSON, quiz prompt, answer-key, save-control, learner-record, or role-record field. The Lesson 3 editor’s founder-session view remains an authorized production check; no editor content has been saved or modified in this QA pass.

## Public Knowledge Check verification

The initial production check used a selector that did not match the Lesson 3 quiz form and therefore reported zero inputs incorrectly. A direct public prompt-RPC check returned an array of five published Lesson 3 questions without error. The deployed form renders all five prompts with 18 radio options using its actual `data-l3-quiz-form` selector. No quiz answers were submitted and no learner data was written during this verification.

# Life Academy Lesson 2 — Follow the Money

## Scope

Lesson 2 is the second published lesson in **Module 1 — How America Works**. It is an educational journey about how money can move through pay, household spending, business revenue and expenses, supply chains, trade, ownership, and productive capacity. All numeric examples are clearly identified as hypothetical teaching examples; the lesson does not provide personalized financial, tax, legal, or investment advice.

> **Central question:** “You earned it. You spent it. But where did the money actually go?”

## Public and private boundary

The lesson narrative, diagrams, hypothetical examples, scenario feedback, and Knowledge Check prompts are public-readable once the lesson is published. A user needs a 7Tribes Account only when an action creates or retrieves private learner data. The browser session is Supabase Auth; private data is stored only in Supabase tables protected by Row Level Security.

| Interaction | Public behavior | Authenticated persistence |
|---|---|---|
| Narrative and diagrams | Readable by anyone | Optional section-view progress is stored only for the signed-in learner. |
| Gross-pay, revenue, community, and trade scenarios | Immediate teaching feedback | Selected options are private `academy_scenario_responses`. |
| $100 Journey | Illustrative paths are visible | Chosen path is a private Lesson 2 exercise response. |
| Household supply-chain exercise | Visible as a private-learning activity | Five structured entries are private to the learner and authorized founder review. |
| Capability-gap exercise | Visible as a private-learning activity | Response is private to the learner and authorized founder review. |
| Knowledge Check | Prompts are public-readable | Answers, score, pass state, and answer-specific feedback are created only after authenticated submission. |
| Completion | Requirements are explained publicly | Completion is server-validated and stored privately. |

## Data model

The migration creates `academy_lesson_exercise_responses`, a generic private exercise table keyed by learner, lesson, and exercise key. Lesson 2 uses the keys `hundred-journey`, `supply-chain`, and `capability-gap`. A single flexible JSON response schema avoids adding product, seller, location, or capability fields to the user profile and keeps Lesson 2 exercise data separate from future Community Capability Map work.

The existing `academy_lessons`, `academy_lesson_quizzes`, `academy_lesson_progress`, `academy_scenario_responses`, `academy_quiz_attempts`, and `academy_completions` tables remain authoritative. The existing founder role and founder-only RLS policy are reused; no second administration system, new role, browser flag, or public editing path is created.

## Completion policy

The server-side `complete_academy_lesson2` function requires a signed-in learner to have visited all eleven required sections, saved each required private exercise, recorded the four required scenario responses, and passed the Lesson 2 Knowledge Check. It then writes only the learner’s own completion and Lesson 2 progress rows. This follows the Lesson 1 completion model while adding the Lesson 2-specific requirements.

## Founder administration

The existing `/academy/admin.html` founder page is extended with one Lesson 2 content editor. Founder-only RLS already permits editing the Lesson 2 title, summary, publish status, structured `lesson_content`, quiz prompts, answer choices, answer explanations, answer key, and passing score. The page provides structured JSON editors so content can be managed in the existing Academy administration surface without exposing quiz answers or learner data publicly.

## Intentional limitations

The lesson introduces how to investigate supply chains and capability gaps. It does not claim to know where a particular learner’s money went, estimate personal tax, model a real local economy, create a Community Capability Map, create Lesson 3, grant rewards, or create any fabricated learner activity.

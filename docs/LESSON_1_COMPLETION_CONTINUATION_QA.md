# Lesson 1 Completion Continuation QA

## Local signed-out behavior

The refactored local Lesson 1 page continues to show **Record completion** to a signed-out visitor. Exercising its native handler produces the standard Account persistence message and preserves the `#complete` return context; no completion, progress, quiz, capability, or other private record is created.

## Completed-state contract

The same UI controller hydrates its completed presentation from the owner’s persisted `academy_completions` row. The resulting presentation hides the duplicate Record completion action, exposes the direct `lesson-2.html` continuation link, changes the heading to **Lesson 1 completed**, and provides the status **COMPLETED ✓**. The continuation link retains the existing relative Lesson 2 route.

The existing server completion RPC is already idempotent: the unique `(user_id, lesson_id)` constraint and `ON CONFLICT DO NOTHING` preserve the original completion, while the progress upsert retains the first `completed_at` value. The client correction only reflects that persisted database state; it does not modify progress, quiz attempts, capability responses, or completion rows during hydration.

The rendered completed-state contract was visually reviewed in the local Academy layout. The duplicate completion button is absent, **COMPLETED ✓** is visible, and the single gold **Continue to Lesson 2 →** control fits the established callout on the lesson page. Following that control opened the existing local `lesson-2.html` route successfully without any learner-data action.

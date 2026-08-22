# Academy V1 Hierarchy Correction

The Academy roadmap has been aligned to the approved V1 structure:

> **Academy → Module 1: How America Works → Seven Lessons**

Only Lesson 1 is published and actionable. Lessons 2–7 are intentionally empty `coming_soon` records; no placeholder curriculum, learner progress, or learner-facing routes were created for them.

| Record type | Change | Data-preservation result |
|---|---|---|
| Module records | No records removed. The database already contained only Module 1; no unapproved Module 2+ database record existed. | Existing Module 1 was retained. |
| Module 1 summary | Updated to the approved systems description. | Module identity, slug, and publication state were retained. |
| Lesson 1 | Database title renamed from **Understand the System** to **Who Actually Runs What?**. | Slug, published content, learner progress, responses, quiz attempts, completions, capability records, roles, and authentication were unchanged. |
| Lessons 2–7 | Six records inserted at positions 2–7: Follow the Money; How Work Actually Works; How Business Actually Works; How Ownership Actually Works; How Wealth Transfers; and How Communities Build. | Each is `coming_soon` with empty lesson content and no learner data. |
| Learner roadmap | Replaced the former multi-module display with one Module 1 and seven lesson rows. | Lesson 1 remains the only active link. Mobile responsiveness and Account authentication were retained. |

## Migration record

The following safe, idempotent migration files document the deployed database changes:

| Migration | Purpose |
|---|---|
| `20260822221500_academy_module1_seven_lesson_roadmap.sql` | Updates the Module 1 summary and creates the six empty Coming Soon lessons without changing Lesson 1. |
| `20260822223500_academy_lesson1_title.sql` | Renames the retained Lesson 1 record only. |

## Final verification

The authorized database verification returned seven rows under `how-america-works`. Lesson 1 is published at position 1 and retains non-empty existing content. Each of the six subsequent lessons is `coming_soon` with empty content. The frontend roadmap was reviewed at 320 px, 430 px, and 1280 px widths; it displays the approved hierarchy without horizontal overflow.

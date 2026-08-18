# Global Mobile Navigation Verification

## Homepage widths

The production homepage was tested with a live same-origin mobile frame at the requested widths. At each width, the menu opened and closed cleanly, the active Home link was present, the persistent CTA read **Enter the Ecosystem**, and no horizontal overflow was detected.

| Width | Header | Symbol | 7TRB wordmark | Hamburger touch target | Drawer width | Result |
|---:|---:|---:|---:|---:|---:|---|
| 320px | 72px | 42px | 18px | 48px | 256px | Pass |
| 360px | 72px | 42px | 18px | 48px | 288px | Pass |
| 390px | 72px | 42px | 18px | 48px | 312px | Pass |
| 412px | 72px | 42px | 18px | 48px | 330px | Pass |
| 430px | 72px | 42px | 18px | 48px | 344px | Pass |

The drawer uses `80vw` with a `360px` maximum, so it remains within the requested range. The active-page highlight, grouped Platform / Community / Resources sections, close control, gold-line hamburger, overlay, and non-Loop primary CTA all appeared in the tested live flow.

## Dashboard direct-navigation finding

The initial Dashboard mobile-frame check found that a drawer was present but no mobile toggle was available. The production page loaded `nav.js`, retained its `mainNav` and `topbar`, and remained in its correct public Nuru state. The missing-toggle condition is being treated as an incomplete shared-navigation compatibility issue and will be corrected before acceptance.

The first compatibility patch did not yet attach a toggle in the live Dashboard frame, although no overflow or Nuru-state regression was observed. The shared initializer is being strengthened with a post-parse repair for any drawer that exists without its paired toggle.

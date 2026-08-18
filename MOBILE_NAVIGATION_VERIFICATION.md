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

# Homepage Consolidation QA

## Local visual review

The locally consolidated homepage was rendered at 390 px and 1280 px widths. The retained visual identity is unchanged: black and gold treatment, city/connection hero imagery, official 7TRB symbol, card material, typography, and premium CTA treatment remain intact.

The mobile capture confirms that the hero, concise ecosystem entry, and primary five-layer Unity Platform explanation stack in the approved order without horizontal overflow. Buttons remain full-width and tappable within the existing mobile layout. The desktop capture confirms the hero and navigation remain centered and readable in the retained visual system.

Computed flex-order inspection confirms the rendered homepage sequence is: ecosystem entry, five-layer Unity Platform map, role selector, public Academy challenge, Why Communities Struggle, Community Scenario Lab, Detroit focus, and final CTA. Legacy Organize, Build, Circulate, and Blueprint sections are hidden from the rendered homepage because their conceptual explanations and destinations have been consolidated into retained unique sections, final actions, and footer links.

The local desktop browser inspection confirmed the Academy challenge remains visibly intact after reordering: the public no-save notice, Question 1 of 3, four native answer buttons, Test What You Know action, and Academy destination all render before the tightened Why Communities Struggle section. The retained five-layer map, role selector, scenario controls, Detroit CTA, closing actions, footer navigation, visitor counter, and Mainhouse Oasis LLC attribution are all present in the local rendered document.

The correct first Academy challenge response produced immediate educational feedback and exposed the Next question action while retaining the public no-save state. The Community Scenario Lab members slider updated the generated connection figure from the selected illustrative input; the output label remained **Illustrative connections** and the visible disclaimer remained “This scenario tool is educational and does not represent live 7Tribes ecosystem metrics.”

At 360 px and 430 px, the hero title, primary actions, concise ecosystem entry, five-layer cards, and role cards remain contained in a single-column mobile layout. The compact header preserves the visible 7TRB mark and a reachable hamburger control. Cards fit inside the viewport with no observed horizontal overflow, and the tightened vertical spacing presents the entry, map, and role selector without an oversized gap.

The retained drawer controller was exercised after consolidation. Opening the hamburger set the drawer and overlay active and applied the body scroll lock; closing it removed both active states and the scroll lock. No header, drawer, or navigation behavior was changed beyond the homepage content hierarchy.

The 412 px capture confirms the same contained entry, five-layer map, and role-card sequence at an intermediate phone width. Together with the 360 px, 390 px, and 430 px captures, the requested 360–430 px range has been reviewed without observed clipping, horizontal overflow, or untappable primary actions.

All internal homepage destinations in the retained navigation, final CTA, and footer resolve from the local static server. Static `.html` routes respond through expected canonical redirects, while `/join/` and `/academy/` respond directly. The retained external destinations are Loop, Connect, Nuru, JollofSwap, Gumroad, and Telegram; their URLs were preserved rather than replaced or redirected. No link submission, account creation, or external-app interaction was performed during this check.

## Production verification

GitHub Pages workflow `32879855389` completed successfully for commit `e230da1`. A cache-busting live request to `https://7trb.com/index.html?v=homepage-consolidated-e230da1` confirms the consolidated homepage is published. It shows the concise ecosystem entry, one primary five-layer Unity Platform map, role selector, public Academy challenge, tightened five-problem framing, visible illustrative Scenario Lab disclosure, Detroit-as-example framing, complete final CTA set, retained footer navigation, Mainhouse Oasis LLC attribution, and local visitor counter. The source-only legacy Organize, Build, Circulate, and Blueprint sections are not rendered in the live homepage journey.

# Accessibility statement

Cell Atlas aims to meet WCAG 2.2 level AA. It has not had a formal audit, so conformance is a goal and not a claim.

## What is in place

- Skip link to the viewer at the top of each page.
- Visible focus outline (2 px) on every focusable control.
- Language switch between English, Traditional Chinese and bilingual, with `lang` set on the page.
- Light and dark themes that follow the system setting (`prefers-color-scheme`).
- Transitions off when the system requests reduced motion (`prefers-reduced-motion`).
- ARIA labels and roles on the language, view and scale controls.
- Every number carries a visible source chip, so meaning does not depend on colour alone.

## Known limits

- The 3D views (cell, tissue, Mol* structures) are visual. There is no full text alternative for the model, and the data cards and compare view hold the same numbers as text.
- Orbit, cutting plane and organelle picking need a pointer. Keyboard control of the 3D canvas is limited.
- The embedded 3D Anatomy Model in `anatomy/` is desktop only and has no design-system accessibility work.
- Organelle colours are distinguished mainly by hue. A colour-blind check has not been done.
- Colour contrast has not been measured in both themes.

## Feedback

Report an accessibility barrier as a GitHub issue titled "Accessibility:" with the page, the browser and the assistive technology you used. The maintainer aims to reply within 14 days.

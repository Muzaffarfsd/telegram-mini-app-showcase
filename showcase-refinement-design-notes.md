# Showcase refinement — 8 November 2026

## Brief and design basis

The user approved the six-point visual refinement of the existing `/projects` showcase and requested a Git push. Preserve the two-column folder collection, pastel frosted material, store/service category labels and individual die-cut sticker silhouettes. Design-memory source: F-20261107-005. Approval covers the proposed work, not the unseen final result.

## Changes

- Refine the folder material with a fine light edge, restrained reflection, contact shadow and softened transmission of the files beneath the front face.
- Balance the apparent size of the ten stickers. Retain their original paths, colours, lettering and angles; use consistent white cut edges and a shared soft shadow.
- Give the exposed files category-specific vector graphics, coloured tabs and small variations in their tilt and height. Keep the sheet shapes.
- Use the studio's Google Sans throughout page UI, with quieter labels and controls.
- Give the collection label clearance below the fixed header and remove the duplicate page/shell bottom padding on this route.
- Replace large grey list capsules with compact rows, smaller folders, light separators and an opening chevron.

## Implementation constraints

The material is static SVG artwork rather than a new raster download or a live backdrop filter. Only the concealed portion of each file is softly blurred. Grid/list and filter updates remain immediate; no entrance or layout animation is added.

Static SVG positioning uses scoped CSS variables and transforms so the app's global reduced-motion reset cannot dismantle the artwork. Reduced motion continues to disable hover motion. Folder and paper outlines, sticker bounds, labels and header/footer clearance must be judged on actual mobile captures in both motion modes.

The shared shell change only removes its bottom padding while the active route is `projects`; the page provides its own navigation/safe-area clearance. Other routes retain their existing padding.

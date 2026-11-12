# Jewelry demo: image production notes

Updated 12 November 2026. The catalog references actual Tiffany designs; generated views are illustrative, not official product photography. The project is an independent demo, not an official Tiffany store or partner. Product details and official reference links are recorded in `tiffany-catalog-sources-2026-11-11.md`.

## Current local coverage

Twenty products each have four distinct gallery views (main, additional detail, model and box) plus two editorial story views, for 120 product image slots. The additional hero and editorial images are separate. The current mapping is in `client/src/components/demos/jewelryImageManifest.ts` and `jewelryStoryAssets.ts`.

- New catalog images: `client/public/jewelry/tiffany-main-20261112/`.
- Twelve new gallery detail views: `client/public/jewelry/tiffany-gallery-detail-v2/`; eight earlier detail views remain in `tiffany-campaign/`.
- New model views: `client/public/jewelry/tiffany-model-20261112/`; four earlier model images remain in `tiffany-authentic/`.
- Twenty corrected box views: `client/public/jewelry/tiffany-boxed-v2/`. The final close-up of the diamond earrings crops the top of the lid to make the piece legible.
- Story imagery: `client/public/jewelry/tiffany-stories/` and `tiffany-story-replacements/`; six new versioned replacements filled the previously empty slots.

## Visual brief and generation

The user's explicit direction is the MIRA store's UI/UX as the foundation. Each piece should remain recognizable as its actual reference, with natural metal and stone, varied editorial model photography and genuine transparent alpha. Models are adult Asian or European women; check anatomy, skin, hands and the fit of the specific product. The open box is viewed frontally, contains the actual product, and has no hands or people. The user rejected plastic-looking jewelry, distorted products and repetitive model images.

The built-in image generator was used with the official photograph of the relevant product as an input reference. Prompt families for the new work specified:

1. **Catalog/detail:** an exact, identifiable piece with its original construction, material, stone placement and proportions; a natural photo and a distinct close or angled view; isolated transparent background, without added objects or fabricated details.
2. **Model:** the specific referenced jewelry on a naturally posed adult model, with varied framing, realistic anatomy, skin and fit, isolated with alpha.
3. **Box:** an open presentation box photographed directly from the front, the exact piece placed visibly and naturally, material and velvet textures, no hands, people or added jewelry, with a transparent exterior.
4. **Story:** individual product close views using the real SKU as reference, with natural reflections, clean alpha and no invented construction. Illustrations may differ from the original; the interface labels them as illustrative.

## Verification and limits

New generated assets were compared with official reference photos, and representative or newly generated views were inspected on light and dark composites to expose alpha defects. The twenty updated box compositions and their alpha were checked visually. The two tests `tests/jewelry-assets.test.ts` and `tests/jewelry-story-content.test.ts` passed locally on 12 November, checking resolved and distinct files, size and alpha presence, and story coverage. These checks do not certify naturalness or fidelity, and do not replace review in the actual interface or on a real Telegram device.

The user has not yet assessed or approved the completed imagery and interface. Retain the generated-image disclaimer and verify rights to third-party material before publication. User feedback takes precedence over the assistant's visual assessment.

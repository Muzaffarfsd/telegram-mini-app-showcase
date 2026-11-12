# Jewelry demo — product narrative

Updated 12 November 2026. The user asked for the MIRA women's fashion store as the basis for the jewelry demo's interface, navigation and behavior, and for detailed product pages like the existing flower and Apple demos. Each product has two short editorial chapters: its form and its materials or sizing. Two editorial image positions are distinct from the four gallery views.

## Current local image state

The local product data contains 20 pieces. Each now resolves to four separate gallery images (main, detail, on a model and in a box) and two separate story images: 120 product image slots in all. Hero and editorial images are additional. The source of truth for mappings is `client/src/components/demos/jewelryImageManifest.ts` and `jewelryStoryAssets.ts`, not a filename or this note. Product descriptions and official source links are in `tiffany-catalog-sources-2026-11-11.md`.

The six previously empty story slots were generated or replaced in this session and are stored as versioned PNGs under `client/public/jewelry/tiffany-story-replacements/`. Their product shapes were compared with official SKU photographs and their alpha composited onto light and dark surfaces. The other story slots use earlier reviewed assets under `tiffany-stories/` and `tiffany-story-replacements/`.

The built-in image generator was given the official photograph for each new piece as a shape reference. For the detail views, prompts asked for a natural, photorealistic close view of the exact design, material and stone arrangement, isolated with true alpha and without added objects. The MIRA interface supplies the background. These are independently generated illustrative images, not official Tiffany photographs.

## Verification and limits

`tests/jewelry-story-content.test.ts` checks the 20 individual narratives, two distinct story paths per product and existence of the corresponding files. `tests/jewelry-assets.test.ts` checks the gallery and story slots for distinct existing files, minimum dimensions and alpha-channel presence. Both passed locally on 12 November. These tests do not evaluate precise product fidelity, naturalness or design quality. The newly filled story views were inspected visually on light and dark composites and compared with the references, but generated details may still differ from the originals.

The visual direction follows the user's [jewelry references and corrections](C:/Users/mmuza/.codex/design-memory/lessons/2026-11-11-web4tg-jewelry-references.md): MIRA as the interface foundation, real-looking jewelry, varied compositions and transparent generated backgrounds. The user has not yet assessed or approved the completed images or the updated interface. Browser emulation is not equivalent to a real Telegram device check. The demo is independent and must not be presented as an official Tiffany shop or partner.

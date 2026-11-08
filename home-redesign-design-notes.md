# WEB4TG home redesign — 8 November 2026

The page introduces the value of a Telegram business app through a real demo, the customer journey, the project process, common questions and a direct next step. The visual direction combines the established light LUMI editorial hierarchy (F-20261104-021), short single-line display headings (F-20261105-011), and the existing large phone/product creative (2026-11-06-web4tg-phone-hero). The existing MURAKA hero is retained.

The user's correction explicitly requires actual home and product screens to be passed into image generation for each new store. Screens were captured from the running MIRA, Apple and FLORA demos under `../work/home-real-screens/`. Each was passed directly to the built-in ImageGen, alongside the corresponding MURAKA composition as a style reference. The Apple home was edited once to remove unrelated clothing. Images are generated interpretations of the supplied screens: the content, products and demo prices were compared visually, but small typography and geometry are not pixel-exact. Clicking the artwork opens the interactive demo itself.

Final image prompts asked for a front-facing premium phone, the supplied actual screen faithfully reproduced, relevant dimensional products around it, and a transparent background. Result paths: `client/public/home-editorial/fashion-mira-real-home-v3.webp`, `fashion-mira-real-product-v3.webp`, `apple-real-home-v3.webp`, `apple-real-product-v3.webp`, `florist-home-real-v2.webp`, `florist-product-real-v2.webp`. MURAKA uses its existing images.

The page intentionally makes no invented client claims, testimonials, prices for development or guarantees. The project scope, cost and timing are discussed individually; support is agreed separately. Browser review should cover 320–430px, both languages, each screen pair, swipe versus tap, the selected demo, FAQ and ordering.

## Three further pairs — 8 November 2026

The user requested sneaker store / Air Jordan 1 Mid, Apple store / burgundy iPhone, and beauty salon / service. The team captured six current screens from the running demos in `../work/home-real-screens/`: `nike-sneakers-home-current.png`, `nike-sneakers-jordan-current.png`, `apple-current-home.png`, `apple-burgundy-product.png`, `lumi-studio-home.png`, and `lumi-studio-service.png`. Each screen was passed directly to a separate built-in ImageGen call with the matching MURAKA image as visual reference. The prompts requested the real screen content in a front-facing phone, a transparent background and creative physical objects related to each niche. No manual screen replacement was used.

Final outputs: `sneaker-real-home-v3.webp`, `sneaker-real-jordan-v3.webp`, `apple-home-real-v4.webp`, `apple-burgundy-product-real-v4.webp`, `lumi-real-home-v1.webp`, `lumi-real-service-v1.webp`. The depicted model, selected iPhone colour, service and demo prices match the current screens. These are generative interpretations; small UI details may differ from the original screenshots. The existing four examples remain available; the six tabs now use a 3×2 layout on mobile, and LUMI's second view is labelled “Услуга”.

## Remove the outer header and correct the sneakers — 8 November 2026

The user asked to remove the outer WEB4TG header from both screen illustrations and said the sneaker looked flattened on both views. MURAKA's original pair already had no outer header. The other eight images were edited with built-in ImageGen to remove the menu, W mark and assistant orb while retaining the app UI and surrounding creative. The sneaker pair was regenerated using its actual home and Air Jordan 1 Mid screenshots as direct inputs and the previous composition as reference, with instructions to preserve natural shoe proportions and omit the outer header. Reviewed the full outputs and their display in the actual mobile interface; generated details may still differ from the real UI.

Current assets: `fashion-mira-no-header-home-v4.webp`, `fashion-mira-no-header-product-v4.webp`, `sneaker-no-header-home-v4.webp`, `sneaker-no-header-jordan-v4.webp`, `apple-home-real-v5.webp`, `apple-burgundy-product-real-v5.webp`, `florist-home-no-header-v3.webp`, `florist-product-no-header-v3.webp`, `lumi-home-no-header-v2.webp`, `lumi-service-no-header-v2.webp`, all under `client/public/home-editorial/`. The live application's header was not altered.

## Typography and selectors — 8 November 2026

The user asked for the upper typography and size from the women's store, the studio voice “we”, and more considered switching controls. The actual MIRA screen and CSS were reviewed: Arial Black, weight 900, `clamp(28px,8.3vw,39px)`, line-height .91 and tracking −.07em. The home now uses these metrics with a short single-line heading in accordance with F-20261105-011. The six demos sit in a calm numbered segmented collection with a raised selected cell; home/product/service uses a matching control. The aim is clear selection at a glance with comfortable touch targets, without changing the demo imagery or gestures. The new design has not yet been evaluated by the user.

### Size correction and generic labels

The user supplied a MIRA screenshot and said the typography should be large, and the demo captions should name business categories rather than MURAKA and other project names. Matching MIRA's numeric font size had not achieved the desired visual presence in the shorter one-line heading. Increased it to `clamp(36px,11.5vw,52px)`; the short English version also fits the same scale. Visible demo captions and image button accessibility names now use the business category. Internal names present in the actual demo screen artwork remain part of those real screens. Review at 320/390/430px verifies scale and fit; the correction has not yet been evaluated by the user.

### Direct correction: black and grey lines

The user repeated the MIRA screenshot and explicitly requested the black main text above a shortened grey line of the same visual character, and rejected the previous selector design. This is a local exception to the earlier single-line instruction, not a global change. The first screen now uses two compact headline lines, the actual MIRA size, weight, line-height and grey; “we create” remains in the kicker. The grey segmented tray and white tiles have been replaced by a light typographic index with six visible directions, a black underline for the selection and text-style screen controls. Touch targets and accessible pressed states are retained. Reference and implementation were visually compared; the new variant awaits user evaluation.

### Restore the shown controls

The user supplied a screenshot of the earlier segmented controls and asked to restore those buttons. Restored the exact prior six-cell tray and home/product segment from commit `f1633eb`; the subsequent two-line headline, requested introduction and generic category labels remain. The screenshot was treated as a reference for controls only. Active states, labels, 44px touch targets and gestures are checked in the live page.

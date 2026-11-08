# Order page glass illustrations — corrected 2026-11-08

## User correction and material

After release a6c665f the user asked: “А где стеклянные элементы как на референсах?” and attached the same JPG again. The first set read as dense gradient plastic in the assistant's visual assessment; the user's explicit correction concerned missing visible glass. The prior preview is preserved in design memory and the first version remains in Git history.

Each corrected icon has a separate thin glass foreground. A specific rear orange outline or white mark visibly continues through it, softened and tinted, while remaining sharp outside the rim. This optical transition is the material criterion; transparent canvas corners alone do not prove glass. Foreground silhouettes include panes, puzzle, speech bubble, triangle, cog, lens, star, link and shield.

Relevant memory: F-20261108-002, F-20261107-001 and F-20261030-005. The shop pilot was independently reviewed at160px on white/gray/dark before generating the remaining set. The user's assessment of the correction is pending.

## Assets and generation

Built-in image_gen was used with transparent_background=true. The actual user JPG1000030606.jpg (ea5aa945 attachment) was supplied through referenced_image_paths in EVERY generation. The remaining thirteen also received the new shop pilot as a material companion, not a replacement for the source JPG. Support received one additional built-in edit to remove external background haze while preserving its glass.

All14 final WebPs:800×800, generated alpha preserved, quality90/alphaQuality100, total901,374bytes. No code-based background removal or recolouring was used. Existing order asset filenames are replaced; Vite produces new content-hashed image URLs. The existing light UI and transform-independent image centering are retained.

- `client/src/assets/order/glass-20261108-shop.webp`
- `client/src/assets/order/glass-20261108-restaurant.webp`
- `client/src/assets/order/glass-20261108-fitness.webp`
- `client/src/assets/order/glass-20261108-services.webp`
- `client/src/assets/order/glass-20261108-basic.webp`
- `client/src/assets/order/glass-20261108-payments.webp`
- `client/src/assets/order/glass-20261108-delivery.webp`
- `client/src/assets/order/glass-20261108-communications.webp`
- `client/src/assets/order/glass-20261108-marketing.webp`
- `client/src/assets/order/glass-20261108-management.webp`
- `client/src/assets/order/glass-20261108-booking.webp`
- `client/src/assets/order/glass-20261108-ai.webp`
- `client/src/assets/order/glass-20261108-integrations.webp`
- `client/src/assets/order/glass-20261108-support.webp`

Raw generator PNGs remain in local generated_images. Exact source/export mapping and complete prompts: workspace work/order-glass-correction/final-manifest.json. Contact sheets, before/after page captures and reports: work/order-glass-correction/.

## Exact prompt set

Shop:

> Use the attached image as the strict reference for GLASS MATERIAL and layering. Generate ONE shopping/ecommerce icon, not a sheet. The essential reference feature is a separate thin TRANSLUCENT FROSTED GLASS element, especially the glass rectangle in front of the white 404: the rear object is crisp outside the pane and visibly blurred/refracted through it. This sharp-to-blurred boundary MUST be obvious.
Composition: a vivid vermilion-orange outline shopping bag with rounded handles and a solid white price tag floating inside it, at the rear. In front, overlap the lower two-thirds of the bag with a separate very thin rounded asymmetric glass panel tilted slightly left. The orange bag outline and the white tag MUST remain visible THROUGH the panel as soft defocused shapes; leave some of the exact same tag/handle crisp above the glass edge. Glass upper half is nearly clear light smoky violet with real see-through transparency; only its lower rim has a restrained cobalt/indigo tint. Thin delicate warm edge reflection, optical refraction, no chunky bevels. A tiny crisp white arc at one rim is enough. Show actual spatial separation between the orange/white subject and the glass pane. Do not replace glass with an opaque orange-to-blue gradient, dense purple bag body, rubber, luminous plastic, puffy toy, or colored plaque. The glass must visually transmit background and objects, not merely be shiny. Match the reference's thin flat silhouettes, moderate tilt, simple layering and restrained reflections.
Single compact complete icon centered on a square, occupies80%, generous safe margins. Actual transparent alpha background, preserve semi-transparent glass pixels. No dark backdrop, no square tile, no floor, no external shadow, no text, numbers, logos, watermark. Intended for a WHITE/light gray UI: prove transparent glass via the objects showing through it.

Shared prompt for the remaining thirteen, followed by each subject:

> Image1 is the user's STRICT style reference. Image2 is a material consistency companion: match its separate thin translucent frosted glass pane and visible-through orange/white rear object. Generate ONE icon for a light order page. The key is optical GLASS, as in the reference's pane in front of404: orange/white subject is crisp outside the pane, and the EXACT SAME shapes visibly continue behind it, softened, tinted and refracted. Do not merely shade a solid object purple. Foreground glass is a thin mostly clear smoky-violet sheet, restrained deep cobalt only at its bottom edge, fine warm rim, minimal bevel, semi-transparent pixels. Rear orange/white geometry must remain strongly recognisable THROUGH the pane. Leave a meaningful part of the subject crisp above/outside its edge, creating an unmistakable sharp-to-blur transition. Distinct spatial layers, shallow mostly frontal perspective and a modest tilt, simple graphic construction, one small crisp white rim accent. No bulky rubber, opaque colored plaques, puffy plastic or glowing toy; do not obscure the subject with a dense gradient. Square canvas, complete compact icon fills80%, centered with safe margins. Real transparent alpha background including glass, no black backdrop/tile, no floor or external shadow/halo, no text/numbers/logo/watermark. Must read as glass on WHITE and light gray, not only on dark. Subject and glass shape:

- **restaurant:** Rear: vivid orange outline of a serving cloche and a white fork and spoon, with the cloche knob and upper tips crisp above. Front: a thin broad rounded triangular frosted glass pane overlapping the lower two-thirds. Orange cloche outline and white fork/spoon continue visibly behind its face with strong soft optical blur; they are clearly separate objects, not a glyph painted on the glass.
- **fitness:** Rear: flat vivid orange dumbbell outline and a white heartbeat zigzag. Front: a thin asymmetric horizontal frosted glass strip across the lower-center of the dumbbell, leaving the upper orange edges crisp outside; through the strip see the softened orange outlines and blurred white heartbeat. Clear strong dumbbell silhouette, no gym props.
- **services:** Rear: vivid orange calendar outline with two binding tabs and one large white checkmark. Front: a thin gently tilted frosted glass rounded rectangle across its lower two-thirds, with the checkmark crossing its upper edge: top sharp outside, lower part softened through glass. The orange calendar edges must visibly pass behind. No tool case or tiny calendar text.
- **basic:** Basic application modules. Rear: four small vivid orange app tiles with a white grid accent, slightly staggered vertically. Front glass MUST have a simple large PUZZLE-PIECE silhouette with rounded tabs, not a rectangular banner. It overlaps the lower/central tiles, which remain visible through it tinted and defocused; upper tiles are crisp outside. Simple compact modular assembly, no tiny screen content.
- **payments:** Payments: a front thin transparent glass CREDIT CARD tilted slightly, plus an orange coin and orange card outline BEHIND it. A large white rounded chip is a separate rear object crossing the glass card's top edge: upper part sharp above, lower part visibly blurred through glass. Orange coin and outline are seen through the nearly clear upper card. Keep a restrained cobalt bottom rim, no numbers or lettering.
- **delivery:** Delivery: a shallow parcel/cube whose separate front and side faces are thin frosted transparent GLASS, not a flat rectangular banner. The orange parcel edges and a large white right arrow stand BEHIND those glass faces; arrow upper tip peeks crisp outside while its lower part and orange box edges are visibly softened through the faces. Minimal mostly-frontal shallow cube perspective, no bulky opaque plastic box.
- **communications:** Customer messages. Foreground glass MUST have a SPEECH-BUBBLE silhouette with a short tail, not a rectangular banner. Behind it an orange outlined speech bubble and three white dots, with one dot/top edge crisp outside the front bubble; inside glass the exact orange outline and dots are blurred and tinted yet readable. Thin distinct translucent layer and clearly visible conversation silhouette.
- **marketing:** Marketing and promotion. Foreground glass MUST be a broad rounded TRIANGLE / flared megaphone-cone cutout, not a rectangular banner. Behind it a vivid orange megaphone outline with a short handle and white circular aperture/sound marks. Some orange outline and white marks sharp outside the glass triangle, the overlapping parts visibly blurred through it. Simple recognisable promotion motif, shallow graphic perspective.
- **management:** Management and analytics. Foreground glass MUST have a broad thin GEAR/COG silhouette like the user's bottom-right reference, not a rounded rectangular banner. Behind it an orange dashboard/chart outline with three bold white bars, upper bar tips sharp outside the cog, lower portions and orange shape visibly defocused and transmitted through glass. Thin clear cog with a cobalt bottom edge, avoid opaque plastic gear.
- **booking:** Booking and schedule. Foreground glass MUST be a thin CIRCULAR lens, not a rectangular banner. Behind it an orange clock outline and two thick white hands, with part of the clock outline and one hand crisp outside the offset circular lens; inside it the same hands and outline are visibly defocused through the glass. A small orange calendar tab peeks behind at the top, no numerals.
- **ai:** AI and automation. Foreground glass MUST have a large elegant FOUR-POINT STAR / neural spark silhouette, not a rectangle. Behind it an orange orbital loop and three white circuit nodes linked by white lines. Some orange loop and one white node extend crisp beyond the glass-star edge, the rest seen softened and optically refracted through the star. Simple abstract intelligence, no robot or mascot.
- **integrations:** Service integrations. Foreground glass MUST be a broad transparent rounded CHAIN LINK with an OPEN CENTER, diagonal, not a rectangle. An orange chain link interlocks behind it; a short white connector line passes behind the broad glass strand and is visibly blurred/transmitted in that overlap while crisp outside. Thin transparent glass link with a cool bottom edge and delicate rim; rear orange ring clearly seen across the glass strand, not an opaque blue plastic chain.
- **support:** Ongoing support after launch. Foreground glass MUST have a rounded SHIELD silhouette like the user's reference, not a rectangular banner. Behind it a vivid orange circular renewal arrow and a separate white support headset glyph. The white headset's upper arch is crisp above the shield, the earcups and orange arrow continue visibly blurred/tinted behind the translucent shield face. Warm fine rim, cobalt lower tip, calm protective-support meaning, no warning or X.

Support background-cleanup edit:

> Edit image1 only. Remove the unwanted gray/white background haze and colored outer glow OUTSIDE the actual support icon. Everything outside the orange renewal arrow, white headset, and glass shield boundaries must be fully transparent alpha zero, including every canvas edge. Preserve the icon itself: same shapes, positions, orange arrow, white headset, thin foreground frosted shield, blue lower rim, visible sharp-to-blurred headset/arrow through the glass. Preserve real semitransparency INSIDE the glass shield. Do not remove the glass, flatten it, repaint the material, add a white background, or change the design. Image2 is the original user material reference only. Deliver the same single centered support icon as a clean transparent cutout with no halo, no floor shadow and no background film.

## Verification

The previous published page was captured before integration with API requests mocked; no real orders/messages were submitted. Independent visual review of the corrected light/dark contact sheets passed the material criterion above. Final mobile/build checks and checkpoint are recorded in EDIT_LOG.md. Verification is not user approval.

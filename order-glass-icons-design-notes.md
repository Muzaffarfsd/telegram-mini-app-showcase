# Order illustrations — original design with a subtle glass adjustment

## Current user direction, 2026-11-08

“мне нравились предыдущие варианты которые ты сгененировал просто чуть нужно добавить стекла сделай как было”

The first orange/cobalt icon set (a6c665f) is the composition baseline. Restore its filled silhouettes, volume, rear orange shapes, palette and crisp white symbols. Only a restrained material adjustment is requested. The intervening separate glass-screen/outlined-object version (af4603f) was an excessive assistant interpretation and is superseded by this explicit clarification. Prior versions remain in Git and design-memory history; their technical checks are not user approval.

All fourteen original PNGs were supplied individually as edit targets to the built-in image_gen tool. The actual user JPG1000030606.jpg was also supplied in each call, as a secondary material reference. This is a material-only edit workflow, not new icon composition generation. The numeric10–15% wording in prompts is art direction for a small visual change, not a measured optical-opacity claim.

Preserved: original objects, closed filled forms, proportions, tilt, orange accents and sharp white glyphs. Adjusted: slightly cooler/light-catching glass rims and mild translucency/reflections within existing blue-violet surfaces. No additional foreground panels, covers or shapes. Existing interface and order logic are unchanged.

Relevant design memory: F-20261108-002 (latest clarification), F-20261107-001, F-20261030-005. The shop pilot passed independent comparison to the original at160px on white/gray; new edits are still subject to user evaluation.

## Delivery

Fourteen WebPs,800×800, generated alpha preserved; export quality90, alphaQuality100; total748,934bytes. Existing filenames replaced so Vite emits fresh content-hashed URLs. No code-based artistic material changes or background removal were performed.

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

Exact original/edit/export mappings and complete prompts: workspace work/order-glass-subtle/final-manifest.json. Raw PNGs remain in local generated_images. Contact sheets, original-versus-new pilot and browser captures: work/order-glass-subtle/.

## Exact edit prompts

Shop:

> PRECISE MATERIAL EDIT OF IMAGE1, not a redesign. The user LIKES image1 exactly and wants only A LITTLE more glass. Image1 is the edit target and geometry master. Image2 is a secondary glass-material reference only; do not copy its objects or layouts.
Preserve image1's EXACT shopping-bag silhouette, solid-looking volume, orange rounded handles, orange abstract rear blobs, scale, tilt, placement, blue-to-violet/orange palette, large crisp white price-tag symbol and existing white highlight strokes. Keep every object and symbol in its original position. Keep the closed blue/violet bag body.
Change ONLY the EXISTING blue/violet surface's material very subtly (about10–15% visual change): slightly more translucent frosted glass, delicate cool edge reflections, a faint softened orange rear reflection/transmission visible within the upper sides of that same body. Preserve the saturated cobalt bottom and full clear white symbol. The bag still looks almost the same as image1 at first glance. Maintain its shape, depth and clean contrast on a light page.
ABSOLUTE INVARIANTS: no additional foreground pane, screen, glass strip or cover; no new objects; no outlined or hollow bag; no new composition; no large milky transparency; no blur of the white symbol; no color washout; no replacement of the original rear shape. Do not add/remove/resize elements. Keep the exact transparent outer background and internal handle hole. Output the original icon with only a restrained glass-material polish.

Shared prompt for the other thirteen, followed by the icon identity:

> PRECISE SMALL MATERIAL EDIT, NOT A REDESIGN. Image1 is the ORIGINAL LIKED icon and is the authoritative edit target. Image2 is only a secondary glass-material reference. Preserve image1's exact subject silhouette, closed filled forms, volume, proportions, composition, tilt, scale, orange rear objects, saturated cobalt/violet/orange palette, crisp white symbols and existing white accents. Keep every element in the same place, same number, same outline. At first glance it should look like the SAME original icon.
Change ONLY the EXISTING blue/violet material very subtly, about10–15% visual change: slightly more frosted-glass translucency, a delicate cool reflective rim and faint softened orange transmission/reflections inside upper side areas. Retain the dense saturated cobalt lower region and all white glyphs perfectly sharp. Preserve original highlights, shading and recognisability. The user asked for just a little glass added to this version.
NO new foreground pane, screen, strip, cover, shield or object. NO outline-only/hollow replacement of filled objects. NO new composition, element resizing, removal or rearrangement. NO milky wash, strong transparency, heavily blurred glyphs, desaturated colors or dramatic new reflections. Do not copy image2's subjects or layout. Preserve the original transparent alpha background and internal openings. Output the same icon with only restrained glass-material polish. Icon identity:

Identities: restaurant, fitness, services, basic, payments, delivery, communications, marketing, management, booking, ai, integrations, support.

Every edit uses its corresponding ORIGINAL first-set image as image1 and the user JPG as image2. The previous separate-pane artwork is not an edit source.

## Verification

The current published V2 page was captured before replacement with all API writes mocked. Independent review compares the result to the liked FIRST set, not to the superseded V2 transmission criterion. Check original silhouettes/colors/glyphs, small scope of material change, image loading, transparent surroundings and mobile fit. Final build/browser results and checkpoint are recorded in EDIT_LOG.md.

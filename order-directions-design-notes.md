# Order page: directions and creative previews — 8 November 2026

## Clothing and top spacing correction

The user asked for the men's store home screen instead of the women's preview on the “Одежда” card, and for slightly less empty space at the top of the order page. The card now reuses `/home-editorial/fashion-muraka-home-v2.webp`, the streetwear home-screen composition from the homepage. The first step's progress row was shortened, keeping its position below the fixed header and the 44 px back button on later steps unchanged. The user has not yet assessed the adjustment.

## Follow-up correction

The user rejected the separate buyer-based “Обувь” card and asked for “Кроссовки” with the existing creative homepage screen. The current new-order list therefore hides “Обувь”; “Кроссовки” uses exactly `/home-editorial/sneaker-no-header-home-v4.webp`, the homepage demo image, and follows clothing in the list. The `shoes` identifier remains only to preserve older saved drafts without silently changing their meaning. The sections below document the preceding implementation before this correction.

The user corrected the initial interpretation: the requested visuals are not isolated icons, but creative phone-and-object compositions like those on the homepage. The first step now groups clothing, shoes, sneakers, smartphones and accessories, and flowers under the existing online-store package; restaurant and delivery and services remain separate. Fitness is hidden from the new selection but remains in the model so existing drafts are not lost. The same existing base prices and features apply; restaurant delivery remains optional. Store subcategory is saved with the draft and included in the review and prepared Telegram message.

The clothing, sneaker, Apple, flower and salon illustrations reuse the homepage's existing assets. For shoes, the real `ChinaBuyer` footwear-selection screen was passed directly to built-in image generation along with the existing homepage composition; the resulting `client/public/order-editorial/footwear-v2.webp` depicts the buyer's selection and is labelled accordingly. For restaurant, the user supplied a Starbucks reference image (`C:/Users/mmuza/.codex/design-memory/assets/2026-11-08-web4tg-order-restaurant/reference.jpg`), which was passed directly to ImageGen with the homepage composition. The resulting `client/public/order-editorial/restaurant-starbucks-v1.webp` presents the reference as an example, not as a claimed client project. Generated screens are redrawn interpretations, not pixel-perfect copies.

The existing light cards and order flow remain the foundation. Images are large enough to identify each example; their small screen details are illustrative rather than intended as readable interactive controls. The user's approval of this new result is not assumed.

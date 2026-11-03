# Real product image generation — six catalog items

Tool: built-in ImageGen, separately generated per item using the indicated exact-product reference. Transparent PNG outputs were resized as WebP while retaining alpha. Generated packaging is a visual approximation; fine text can differ from the real label. Prices and wholesale box quantities in this demo are illustrative.

Shared prompt: Faithfully match reference packaging design, proportions, material, graphics, real brand mark and prominent lettering; full upright package, neutral studio light, transparent alpha, no additional text or objects.

| SKU | Real product | Reference source | Generated PNG | Final asset |
| --- | --- | --- | --- | --- |
| tomato | Mutti Pelati peeled tomatoes, 400 g | https://shop.magistrat.si/products/mutti-pelati-400g | `exec-51680d24-2c08-43a3-9d7a-a52f5d9ee9e7.png` | `client/public/b2b/generated/real-tomato-v1.webp` |
| syrup | Monin Vanilla syrup, 1 L | https://monin.us/products/vanilla-syrup | `exec-8bbffb72-515c-4999-bfc4-c3a090e2b618.png` | `client/public/b2b/generated/real-syrup-v1.webp` |
| milk | Alpro Barista Oat, 1 L | https://www.alpro.com/en-gb/products/drinks/alpro-barista-oat | `exec-6073ebf6-0188-46db-a3c4-295c1d1d1e95.png` | `client/public/b2b/generated/real-milk-v1.webp` |
| cocoa | Dr. Oetker Kakao, 100 g | https://www.hammaddeler.com/en/product/cocoa-powder-100g-72056 | `exec-b04e14be-28ca-4ce5-9484-c7f8a0bcb5ff.png` | `client/public/b2b/generated/real-cocoa-v1.webp` |
| granola | AXA honey granola with nuts, 270 g | https://epicentrk.ua/ua/shop/hranola-axa-khrustka-medovi-z-horikhamy-k-u-270-h.html | `exec-8afb8f0d-c8c6-47af-a5d0-85321c93ca21.png` | `client/public/b2b/generated/real-granola-v1.webp` |
| sauce | Barilla Basilico tomato and basil sauce, 400 g | https://barilla.ru/product/basilico/ | `exec-a45f6c5e-11f3-4fc4-890b-4e5e925383a7.png` | `client/public/b2b/generated/real-sauce-v1.webp` |

Generated PNGs are in `C:/Users/mmuza/.codex/generated_images/01a1a132-bba1-7e12-8b3b-ec539de0d79c/`.

## Full prompt templates

For `tomato` and `syrup`, the input reference is the corresponding exact-product image in `work-real-products-references/`, and `PRODUCT` is the product named in the table above:

> Use case: product-mockup. Reference image: exact real retail product packaging. Generate a premium, photorealistic studio product image of PRODUCT. Match the supplied package faithfully: preserve exact shape, size proportions, material, labels, brand mark, key colors, visual graphics, and most prominent legible lettering from the reference; do not invent another product or generic unbranded packaging. Show one full package upright, straight front view so the label is recognizable, moderate transparent margin. Consistent natural neutral softbox lighting with realistic reflections, no colored rim light, no props or floor. Output genuine fully transparent alpha, no surrounding shadows, no additional text, no watermark. This is an AI-generated illustration for an explicit demo.

For `milk`, `cocoa`, `granola`, and `sauce`, the input reference is the corresponding exact-product image in `work-real-products-references/`, and `PRODUCT` is the product named in the table above:

> Use case: product-mockup. Input image is a reference for the exact real retail product package. Generate one premium photorealistic isolated studio catalog image of PRODUCT. Faithfully match packaging design, proportions, material, graphics, the real brand mark and prominent lettering to the reference; don't invent a different brand. Front view, full upright package visible with modest margin. Soft neutral studio light with natural reflections. TRUE TRANSPARENT ALPHA background: completely remove reference background and shadows; no glow, haze, outline or cast shadow anywhere outside the product. No additional text or objects. Generated illustration for a product demo.

Exact `PRODUCT` substitutions used in those prompts:

- tomato: `Mutti Pelati peeled tomatoes 400g`
- syrup: `MONIN Vanilla syrup 1 litre`
- milk: `Alpro Barista Oat 1 litre`
- cocoa: `Dr. Oetker Kakao cocoa powder 100g`
- granola: `AXA granola with honey and nuts 270g`
- sauce: `Barilla Basilico tomato sauce jar 400g`

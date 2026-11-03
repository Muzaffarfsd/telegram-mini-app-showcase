# ПАРТИЯ — generation prompts

## Hero

- Tool: built-in ImageGen.
- Project file: `client/public/b2b/generated/hero.webp` (1280 × 853, WebP).
- Original: `C:/Users/mmuza/.codex/generated_images/01a1a1d0-e217-7fe1-86c1-251d38846e48/exec-f608f82d-54b1-46f5-80a9-5ec45131ff5c.png`.
- Prompt:

> Use case: product-mockup. Asset: a wide editorial hero photograph for «ПАРТИЯ», a premium wholesale grocery ordering app for cafés and food businesses. Create a coherent, photorealistic still-life composition showing an unbranded coffee bag, a glass bottle of olive oil, a clear bag of dry pasta, and ripe tomatoes, arranged together on a light natural stone counter in a refined warm-white and pale sand studio. Quiet and contemporary premium food editorial photography with spacious, balanced composition; all objects are whole, central and recognizable even when cropped to a mobile card. Materials look real: matte paper, transparent glass, golden oil, textured pasta and fresh tomatoes. One large soft diffuse neutral daylight source and natural soft shadows, consistent physically plausible reflections, no harsh spotlights or colored rim lighting. Restrained warm beige and off-white palette, realistic proportions. No text, no labels, no logos, no watermarks, no people, no UI. Original generated image, not a brand photograph.

## Product imagery

Tool: built-in ImageGen, one independent call per SKU, transparent background. Final 720 px WebP files are in `client/public/b2b/generated/`.

Shared prompt (replace SUBJECT with the corresponding description below):

> Use case: product-mockup. Generate an original photorealistic premium wholesale food product catalog photograph for a sophisticated Russian mobile B2B ordering app. One object only: SUBJECT. Front-facing slight three-quarter angle, upright, full packaging visible, generous but not excessive margins. Unified art direction: restrained modern European minimalist packaging, tasteful subtle abstract color blocks, no writing or lettering, no recognizable trademarks; realistic physical materials and accurate proportions. A large diffuse neutral studio softbox and subtle fill create believable soft consistent highlights, realistic textures; no colored or dramatic light. High quality and legible as a small mobile catalog image. Isolate object on truly transparent alpha; no background, no floor, no cast shadow, no watermark.

| File | SUBJECT | Original PNG suffix |
| --- | --- | --- |
| coffee.webp | a single freestanding matte dark brown resealable 1 kg bag of whole coffee beans | e5e7b379-fd74-4540-8b2f-dbcf655080ae |
| tea.webp | a single elegant deep green rectangular cardboard box of black tea, 100 tea bags | 77b9c450-6f3a-4168-856e-07e688de52b2 |
| olive-oil.webp | a single dark green glass bottle of extra virgin olive oil, 1 litre, with simple cap | 057d7e9d-e5df-41fb-b8cf-8d5333b0a8c3 |
| pasta.webp | a single clear upright bag of dry penne pasta, 500 g, minimal cream paper band | 2f3890ba-ed74-45ef-b72a-df6ede999878 |
| tomato.webp | a single red metal tin can of whole peeled tomatoes in their own juice, 400 g | f6736677-8ada-4a2c-98d4-019c0859031a |
| syrup.webp | a single clear glass bottle of pale golden vanilla syrup, 1 litre, simple cap | b8ea1e7e-e5c9-4153-80e2-9312b6ac52a6 |
| milk.webp | a single white and oat beige rectangular one litre oat milk carton with cap | e907d5b9-ae7d-4062-ae49-95af2d5595fe |
| cocoa.webp | a single dark cocoa-brown cylindrical metal tin of cocoa powder, 500 g | 7bb626f8-2b27-4f1f-84e6-7461dde29f8a |
| granola.webp | a single natural kraft standing pouch of granola, 500 g, a small transparent window showing the grains | 530dc334-c35a-4d4c-b1b9-1b38ce6477aa |
| honey.webp | a single glass jar filled with golden honey, 500 g, neat metal lid | c16cb431-b554-49a1-a4f1-cad2145c55aa |
| sauce.webp | a single glass bottle filled with red tomato sauce, 500 g, simple cap | 0be4e98f-e73e-4bf4-9ef0-6993803ca1ab |
| cookies.webp | a single cream cardboard package of cookies, 200 g | 616fd983-b88e-4d73-ab97-cd99354625b7 |

Original PNGs: `C:/Users/mmuza/.codex/generated_images/01a1a132-bba1-7e12-8b3b-ec539de0d79c/exec-<suffix>.png`. Each source was reviewed on a white background; transparency was preserved during WebP conversion.

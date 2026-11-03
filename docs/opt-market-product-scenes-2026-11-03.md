# ПАРТИЯ — дополнительные товарные композиции

3 ноября 2026. Созданы встроенным ImageGen как иллюстрации для демо-каталога. В качестве визуального ориентира для каждого SKU использована ранее сгенерированная картинка соответствующей упаковки (`real-*-v1.webp`). Состав сцены передаёт идею продукта и его подачи; это не подтверждение полного состава, аллергенов или точности этикетки. Упаковки и мелкий текст могут отличаться от реальных. Исходные PNG сохранены в `C:/Users/mmuza/.codex/generated_images/01a1a1fe-d99b-7060-a8b9-0ba437a64c2d/`. В проект перенесены WebP 900×900, качество 84, для просмотра на мобильных экранах.

Визуальный замысел: читаемая упаковка в центре, соответствующие природные или кулинарные элементы вокруг, нейтральный светлый фон, мягкий физически понятный свет и реалистичные тени. Учитывает пользовательское замечание F-20261103-011 о непонятном и нереалистичном свете, а также требование реальных товаров и собственных генераций. Сцены просмотрены по отдельности в полном размере; пользователь ещё не оценивал новые композиции.

Общий промпт для каждой генерации:

> Use case: product-mockup. Create ONE square editorial product photograph for an upscale wholesale food catalogue. The supplied image is the exact pack design reference and central product: preserve its recognizable shape, colours, branding and variant. Center the product upright, large and readable, surrounded tastefully by [elements below]. Controlled studio tabletop with an off-white neutral seamless background, soft natural studio light, realistic texture, natural shadows, restrained elegant art direction and generous breathing room; make the elements visibly complement rather than obscure the pack. These are illustrative serving cues, not a claim of the complete ingredient list. No text outside packaging, no watermarks, no extra product packages. Photorealistic, high quality.

| SKU / итоговый файл в `client/public/b2b/generated/` | Элементы промпта |
| --- | --- |
| `real-coffee-v1-scene-v2.webp` | roasted coffee beans and a few fresh coffee branches |
| `real-tea-v1-scene-v2.webp` | loose black tea leaves and a few delicate tea sprigs |
| `real-olive-oil-v1-scene-v2.webp` | ripe green olives and olive branches with a hint of a golden oil ripple |
| `real-cocoa-v1-scene-v2.webp` | a few whole cacao pods, cacao beans and a small natural dusting of cocoa powder |
| `real-granola-v1-scene-v2.webp` | crisp golden granola clusters, oats and a few hazelnuts and almonds |
| `real-milk-v1-scene-v2.webp` | oat stalks and a few oat grains, a restrained creamy swirl |
| `real-sauce-v1-scene-v2.webp` | ripe tomatoes and fresh basil leaves |
| `real-syrup-v1-scene-v2.webp` | vanilla pods and a delicate vanilla flower, a restrained ribbon of syrup |
| `real-honey-v1-scene-v2.webp` | a small honeycomb, restrained honey droplets and tiny meadow flowers |

Первые три промпта отличались лишь формулировкой последнего ограничения: “make the ingredients visibly complement rather than obscure the pack” и не содержали предложения про illustrative serving cues. Для этих изображений действует то же ограничение на использование в демо.

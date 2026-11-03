# ПАРТИЯ — реальные товары: четыре генерации

Встроенный ImageGen, отдельный вызов на SKU. Исходные фотографии использованы только как референсы для собственных изображений, прозрачный альфа-канал сохранён. Цены и оптовые условия в демо не подтверждены этими источниками.

Общий промпт для чая, масла и пасты (SUBJECT заменялся описанием из таблицы):

> Use case: product-mockup. Input image is the product reference. Generate an original high-quality realistic catalog photograph of SUBJECT. Faithfully match the real reference package including its actual main colors, distinctive package shape, brand logo and legible primary words; do not invent product labels or redesign package. One complete product, front with a very slight three-quarter perspective, centered, physically correct materials. Soft neutral studio lighting, clean details, subtle highlights, no colored glow. True transparent alpha without floor or cast shadow. No additional objects, logos, text or props outside the package. Intended for a premium small mobile wholesale shopping catalog.

| Файл | SUBJECT | Исходник ImageGen | Проверенный источник |
| --- | --- | --- | --- |
| real-tea-v1.webp | Ahmad Tea English Breakfast black tea, 100 tea bags; box dark green, cream AHMAD TEA logo, gold ENGLISH BREAKFAST, thin bright red stripe and the same historic English landscape below | exec-58ae58db-875a-441e-85a9-6c333bfa022b.png | https://uk.ahmadtea.com/collections/bestselling-teabags/products/english-breakfast-tea-teabags |
| real-olive-oil-v1.webp | Borges Extra Virgin olive oil, one litre; exactly the reference's clear shaped bottle, dark green cap, yellow oil, olive green label with BORGES logo and EXTRA VIRGIN | exec-3d39bd25-e74c-4d6e-8942-4031afcedf96.png | https://www.ozon.ru/product/maslo-olivkovoe-borges-extra-virgin-nerafinirovannoe-1-l-136065025/ |
| real-pasta-v1.webp | Barilla Penne Rigate n.73, 500 g; rectangular dark blue box with red oval Barilla logo, PENNE RIGATE white lettering and small pasta illustration | exec-24c63a45-f0d8-4b6e-930b-a03240569830.png | https://www.barilla.com/de-de/produkte/pasta/klassische-sorten/penne-rigate |

Промпт для real-coffee-v1.webp (источник ImageGen exec-e1d920c2-bfe8-4cdd-a989-90153b2c0571.png; реальный товар https://store.lavazza.uk/en/coffee-beans/qualita-oro.1266):

> Use case: product-mockup. Input image is the product reference. Generate an original high-quality realistic catalog photograph of Lavazza Qualità Oro roasted coffee beans, 1 kg. Faithfully match the reference package: gold coffee bean bag, white LAVAZZA logo and red-and-black oval QUALITÀ ORO mark; accurate package shape, main colors and legible primary words, no invented product label or redesign. One complete product, front with a very slight three-quarter perspective, centered, physically correct materials. Soft neutral studio lighting, clean details, subtle highlights, no colored glow. True transparent alpha without floor or cast shadow. Do not include the reference retailer watermark. No additional objects, logos, text or props outside the package. Intended for a premium small mobile wholesale shopping catalog.

Файлы исходников ImageGen лежат в C:/Users/mmuza/.codex/generated_images/01a1a1e3-0b4d-7861-8b77-734ad3ce900b/. Пасте и кофе обрезаны избыточные прозрачные поля. Проверка: главные названия и масса на изображениях соответствуют, мелкая вертикальная подпись на упаковке пасты искажена.

## Hero с реальными товарами

Встроенный ImageGen; референсы: coffee.png, pasta.png, tea.jpg в локальной папке work-real-products-references. Результат: client/public/b2b/generated/hero-real-v1.webp; оригинал ImageGen: C:/Users/mmuza/.codex/generated_images/01a1a1e3-0b4d-7861-8b77-734ad3ce900b/exec-478c9a07-4e03-4a1d-b6dd-2a04513ae654.png. Изображение проверено визуально: названия трёх товаров читаются, мелкие детали могут отличаться.

> Use case: product-mockup. Create a premium horizontal editorial product photograph for the hero banner of a wholesale food ordering app. Reference images 1, 2 and 3 show the actual packaging of Lavazza Qualità Oro whole bean coffee, Barilla Penne Rigate pasta and Ahmad Tea English Breakfast. Show exactly these three products together, whole and recognizable, with their real packaging shapes, colors, primary brand names and product names matching references. Arrange them in a sophisticated, balanced premium still life on a pale warm natural stone counter against a clean warm white studio background. Authentic product photography, natural materials, one large soft diffused neutral daylight source with coherent natural soft shadows. Legibility and visual fidelity to the actual packaging are more important than creativity; no additional products, no props with branding, no people, no watermark, no text over the photo, no UI. Keep all packages fully inside the frame with enough margins so crop to a mobile app card remains safe.

# Apple Store — новая серия визуальных историй

Серия создана встроенным ImageGen по задаче 4 ноября 2026. Источники — только собственные генерации, не фотографии Apple (F-20261103-009). Изображения являются художественными иллюстрациями для главной страницы: не использовать их как точное отображение выбранного цвета или характеристик конкретной модели. Для товарных изображений сохраняется требование прозрачного фона и соответствия выбранному цвету; новые кадры — именно самостоятельные атмосферные сцены с фоном.

Все четыре результата просмотрены целиком, сгенерированы без логотипов, перевод в WebP выполнен в `sharp` (до 960×960, качество 82); оригиналы сохранены в `C:/Users/mmuza/.codex/generated_images/01a1a4b2-1915-7831-847f-e7bd7457f135/`.

| Проектный файл | Оригинальный PNG | Размер WebP |
| --- | --- | ---: |
| `client/public/apple/generated/apple-v2-story-iphone.webp` | `exec-505622ee-c897-466d-b8d0-5b406e68562f.png` | 39 592 байта |
| `client/public/apple/generated/apple-v2-story-mac.webp` | `exec-881a1aac-8c2d-4a64-abd1-bf55da1f04ab.png` | 59 518 байт |
| `client/public/apple/generated/apple-v2-story-airpods.webp` | `exec-bff670d6-1de4-4df9-b0a4-e95fcf627eff.png` | 10 698 байт |
| `client/public/apple/generated/apple-v2-story-watch.webp` | `exec-64955065-c36f-451c-a2ec-ce0aec3be683.png` | 61 686 байт |

## Промпты

**iPhone / деталь**

> Use case: product-mockup. Create a refined editorial image for a mobile premium electronics shop: a close-up of a burgundy high-end smartphone's rear corner, three precisely circular camera lenses, glass and brushed metal. Elegant oversized crop, tactile details, credible optics and consistent soft studio lighting, clean white/off-white background, subtle burgundy color reflected naturally. Square image, ample breathing space, sophisticated photorealistic original visual. No text, no logos, no watermark, no hands, no invented UI. The image illustrates a product detail, not a verified specific model.

**Mac / пространство**

> Use case: photorealistic-natural. Create one original premium editorial photograph for a mobile electronics storefront: a thin open silver laptop seen in 3/4 view on a light architectural desk, blank dark display showing a soft abstract burgundy glow, a single folded sheet beside it, sculptural morning daylight and subtle soft shadow. Scandinavian quiet studio, white and pale warm-gray palette, precise aluminum material and realistic keyboard; no people, no words, no lettering or logos, no watermark. Square framing, laptop entirely in view. This illustrates a generic product environment.

**AirPods / звук**

> Use case: product-mockup. Create an original premium product photograph for an electronics shop: a pair of minimal white wireless earbuds and their open charging case hovering gently in a balanced, dynamic composition above a clean bright white ground. Excellent photorealistic materials and credible form, controlled soft diffused studio light and restrained gentle shadows, generous whitespace. Square mobile crop. No text, logos, extra earbuds, glitch, UI, watermark; no claims about a specific model.

**Watch / движение**

> Use case: photorealistic-natural. Original high-end editorial scene for a premium electronics storefront. A smartwatch with a ROUNDED RECTANGULAR black glass face, rounded square corners and a dark sports band, recognizably the silhouette of an Apple Watch, on the wrist of a female runner in motion. Watch large and sharply in focus, no crown on screen, no circle dial, anatomically natural hand and wrist. Simple dark screen with abstract silver wave and no text or fake UI. Tasteful pale modern architectural environment and neutral sportswear, soft natural daylight, realistic motion in distant background, refined premium photography. Square composition for mobile. No logo, no numbers, no text, no watermark; conceptual illustration, not official product photography.

Первая генерация Watch имела круглый корпус и исключена; переделанная версия проверена на прямоугольный силуэт.

## Дополнительный ракурс бордового iPhone Pro Max

`client/public/apple-store/generated/detail-iphone-18-pro-max-burgundy-front-v2.webp` — собственная генерация фронтального ракурса для бордового варианта. В ImageGen были переданы два существующих сгенерированных ракурса (`iphone-18-pro-max-burgundy.webp` и `extra-iphone-18-pro-max-burgundy.webp`) как визуальные ориентиры. Исходник после уточнения: `C:/Users/mmuza/.codex/generated_images/01a1a4b2-1915-7831-847f-e7bd7457f135/exec-0540ede4-3a43-45c5-9e4e-3fc4bfce436c.png`. Сохранены WebP 940×1410, 480×720 и 160×240 с альфа-каналом; угловой пиксель полностью прозрачен, изображение визуально проверено на белом фоне без серого прямоугольника.

> Use case: product-mockup. Images 1 and 2 are reference views of the same burgundy premium smartphone for a product gallery. Create a NEW, THIRD VIEW of this same device, with its front glass screen facing the camera at a gentle three-quarter angle and a narrow portion of its deep wine-burgundy metal side visible. Keep the same burgundy tone, realistic rounded rectangular shape, soft material and premium studio lighting as references, physically plausible dimensions, black glass screen with a subtle burgundy abstract gradient and no symbols or text. One single complete phone, centered, all edges visible with generous margins. Product-only clean isolated cutout for a white UI page: actual transparent alpha background, no rectangular background, no checkerboard, no floor, no extra devices, no labels, no watermark. A plausible editorial illustration, not a verified product photograph.


После просмотра предыдущий фронтальный кадр с круглой точкой был отклонён: на референсе присутствует горизонтальная чёрная капсула. Точечное исправление выполнено встроенным ImageGen с исходным кадром и hero-иллюстрацией как референсами.

> Edit ONLY Image 1’s small isolated circular camera dot at the top of the screen: replace it with a clearly visible long horizontal rounded black pill / Dynamic Island, like the pill on the FRONT phone in Image 2. Pill is centered along the top of Image 1’s display, clean smooth oblong shape wider than four times its height, with a tiny round lens inside its right end. Preserve absolutely everything else in Image 1: single phone, deep burgundy color and lighting, exact phone silhouette and three-quarter angle, bright burgundy abstract wallpaper, entire phone uncropped, and genuinely transparent alpha background. No background or shadow, no extra objects, text or logos.

# Apple Store — сгенерированные изображения товаров

Товарные изображения этого демо созданы встроенным ImageGen; фотографии Apple и их локальные копии не используются. Для каждой предлагаемой модели и каждого цвета создаётся отдельная иллюстрация на прозрачном фоне. Готовые WebP находятся в `client/public/apple-store/generated/`, а ранее сгенерированные дополнительные ракурсы — в `client/public/apple-store/creative/`.

Основа промптов: «Оригинальная предметная иллюстрация конкретной модели и цвета для мобильного магазина электроники, реалистичные материалы и пропорции, качественный студийный свет, прозрачный альфа-канал, без сцены, надписей и водяных знаков». Модель и цвет задаются для каждого варианта отдельно. При генерации новых кадров фотографии Apple не использовались в качестве исходников.

`node scripts/build-apple-generated-assets.cjs` проверяет наличие иллюстраций и прозрачности для всех цветов каталога, создаёт облегчённые размеры 160 и 480 px и собирает локальный манифест. На странице и в просмотре изображения обозначены как созданные с помощью ИИ; геометрия и детали могут отличаться от реальных изделий. Источники характеристик в карточках оставлены отдельно от изображений.

## Баннер «Открой новое» — бордовый iPhone

Для первого экрана создан отдельный оригинальный кадр во встроенном ImageGen по референсу пользователя: бордовый iPhone 18 Pro Max, задняя сторона слева перед экраном справа, широкая камера с тремя объективами, бордовые экран и корпус, чистый прозрачный альфа-канал, без сцены, текста или водяного знака. Промпт отдельно требовал сохранить композицию и характер референса, но не использовать фотографию Apple как готовый кадр. Исходная PNG-генерация: `C:/Users/mmuza/.codex/generated_images/01a1a132-bba1-7e12-8b3b-ec539de0d79c/exec-8e10b0b2-281e-43c3-ae79-9e16aa136943.png`.

В проекте: `client/public/apple-store/generated/hero-iphone18-promax-burgundy-reference-v1.webp`, варианты 160 и 480 px — в `generated/sizes/`. Предзагрузка соответствует самому баннеру; выбор цвета в карточках каталога не изменён.

## Категория iPhone — естественный свет

Отдельный оригинальный кадр создан встроенным ImageGen для категории iPhone в разделе «Всё, что любишь». Использован существующий сгенерированный чёрный телефон как референс предмета и ракурса, без фотографий Apple. Исходный PNG: `C:/Users/mmuza/.codex/generated_images/01a1a132-bba1-7e12-8b3b-ec539de0d79c/exec-2422e522-19c9-49d4-b579-dac80dd2a715.png`. В проекте: `client/public/apple-store/generated/category-iphone18-promax-black-natural-v1.webp` и версии 160 и 480 px в `generated/sizes/`.

Промпт:

> Use case: product-mockup. Input image is the existing generated iPhone in the mobile store category card and a reference for the subject, framing and black color. Generate a new original, photorealistic black iPhone 18 Pro Max for the “Всё, что любишь” category tile. One complete rear-facing phone, upright in the same subtle three-quarter angle, with the same wide rounded camera island, three lenses and Apple mark. Render convincing real-world hardware: flat smooth matte black back, dark brushed metal frame, precisely formed glass lenses and believable camera geometry. Light it like a real premium product photograph with one large diffused neutral softbox and gentle fill, smooth consistent reflections that follow the actual surfaces; restrained highlights, black remains black. No colored rim light, no neon, no metallic glare, no random glowing streaks or fake dramatic gradients. Clean true transparent alpha, no background, no text, no props, no shadows outside the phone. Full device visible with modest transparent margins. High fidelity and legibility at small mobile card size.

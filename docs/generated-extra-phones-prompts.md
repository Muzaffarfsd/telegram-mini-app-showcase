# Дополнительные ракурсы iPhone — собственная генерация

Все 22 изображения созданы встроенным ImageGen, каждое отдельно для конкретной модели и цвета из `scripts/generated-extra-phones.json`. Фотографии Apple и другие исходные фотографии не использовались. У чёрного iPhone 18 Pro Max уже были два сгенерированных дополнительных ракурса, поэтому новый для него не создавался.

Общий промпт (поля модели, цвета и камеры подставлялись отдельно):

> Use case: product-mockup. Create an original AI illustration as an additional image in a mobile electronics store gallery: [model] in [finish]. Show one complete phone from the rear at a strong low three-quarter angle, tilted diagonally, clearly revealing the [finish] body, rounded rectangular profile and [camera]. Premium realistic studio materials, black camera glass and controlled highlights. Genuine transparent alpha, no floor or backdrop. Keep the whole device in frame with generous margins. No text, lettering, watermark, extra devices, hands or props. Generated interpretation, no input photographs.

Для моделей Pro задана группа из трёх камер, для iPhone 17 и iPhone 16 — две вертикальные камеры, для iPhone Air — одна камера в горизонтальном блоке, для iPhone 17e — одна камера. Цвета и конкретные файлы перечислены в манифесте.

Для обоих iPhone Duo итоговые версии `-v2` перегенерированы с уточнением: «book-style foldable, hinge runs vertically from top to bottom, joining left and right halves; not a horizontal clamshell or flip phone». Первые генерации ошибочно создали горизонтальный сгиб и исключены из манифеста.

Файлы сохранены как WebP шириной 940 px; наличие альфа-канала и прозрачных углов проверено программно. Все цвета и модели просмотрены на контактном листе; исправленные Duo также просмотрены отдельно на белом фоне. Это иллюстрации: точность физических деталей не гарантируется.

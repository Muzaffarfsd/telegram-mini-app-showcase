/** Data supplied here must describe verified, real products. Nothing below is a listing yet. */
export interface FurnitureProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  /** Verified product photography supplied for this product; first image is the cover. */
  images: readonly string[];
  /** Path or URL of a verified, appropriately licensed 3D asset, when available. */
  modelUrl?: string;
  /** Same product geometry with smaller textures for a multi-object room. */
  plannerModelUrl?: string;
  /** Product dimensions in metres, width × depth × height, rounded from source data. */
  dimensionsM?: readonly [number, number, number];
  /** Only source-backed display facts, e.g. dimensions or upholstery. */
  facts?: readonly { label: string; value: string }[];
  description?: { ru: string; en: string };
  details?: readonly { label: { ru: string; en: string }; value: { ru: string; en: string } }[];
  care?: { ru: string; en: string };
  sourceNote?: { ru: string; en: string };
  /** Overrides the default catalogue source explanation when an item uses another source. */
  sourceDescription?: { ru: string; en: string };
  /** Optional confirmed price as a display string, otherwise omitted. */
  priceLabel?: string;
  /** Supplier/source page, if available. */
  sourceUrl?: string;
  /** Attribution for a licensed 3D asset, including its source and licence. */
  attribution?: { credit: string; creditEn?: string; sourceUrl: string; licenseUrl: string };
}

// The source photographs are resized and converted to WebP; the 3D files use
// web-compressed versions of the ABO models. No current price or stock is claimed.
const attribution = {
  credit:
    'Фото и 3D: Amazon.com; Amazon Berkeley Objects — M. Guillaumin, T. Dideriksen, K. Deng, H. Arora, A. Dhua, X. Zhang, T. Yago-Vicente, J. Collins, S. Goel, J. Malik. Изображения и модели сжаты.',
  creditEn:
    'Photos and 3D: Amazon.com; Amazon Berkeley Objects — M. Guillaumin, T. Dideriksen, K. Deng, H. Arora, A. Dhua, X. Zhang, T. Yago-Vicente, J. Collins, S. Goel, J. Malik. Images and models are compressed.',
  sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
};
const root = '/furniture/real-products/';
export const furnitureCatalog: readonly FurnitureProduct[] = [
  {
    id: 'rivet-revolve-sofa',
    name: 'Rivet Revolve',
    brand: 'Rivet',
    category: 'Диваны',
    images: [root + 'sofa-main.webp', root + 'sofa-room.webp', root + 'sofa-detail.webp', root + 'sofa-angle.webp', root + 'sofa-side.webp', root + 'sofa-back.webp'],
    modelUrl: root + 'B072FVHRZ3.glb',
    plannerModelUrl: root + 'B072FVHRZ3-mobile.glb',
    dimensionsM: [2.03, 1.58, 0.9],
    facts: [
      { label: 'Размер', value: '≈ 203 × 158 × 90 см' },
      { label: 'Цвет', value: 'Grey Weave' },
    ],
    description: {
      ru: 'Диван Rivet Revolve с прямыми подлокотниками, сужающимися ножками и шезлонгом. Длинную секцию можно разместить с любой стороны дивана.',
      en: 'The Rivet Revolve sofa has square arms, tapered legs and a reversible chaise that can be placed at either end.',
    },
    details: [
      {
        label: { ru: 'Размер с шезлонгом', en: 'With chaise' },
        value: { ru: '≈ 203 × 158 × 90 см', en: '≈ 203 × 158 × 90 cm' },
      },
      {
        label: { ru: 'Размер дивана', en: 'Sofa without chaise' },
        value: { ru: '≈ 203 × 88 × 90 см', en: '≈ 203 × 88 × 90 cm' },
      },
      {
        label: { ru: 'Обивка', en: 'Upholstery' },
        value: { ru: 'Полиэстер, Grey Weave', en: 'Polyester, Grey Weave' },
      },
      {
        label: { ru: 'Каркас и ножки', en: 'Frame and legs' },
        value: { ru: 'Твёрдая древесина и массив бука', en: 'Hardwood frame, solid beech legs' },
      },
      {
        label: { ru: 'Модель', en: 'Model' },
        value: { ru: 'AS-5075-SC-Raisin', en: 'AS-5075-SC-Raisin' },
      },
    ],
    care: { ru: 'Протирать мягкой сухой тканью.', en: 'Wipe with a soft, dry cloth.' },
    sourceNote: { ru: 'В 3D показан один вариант расположения шезлонга. При ширине 203 см модель имеет глубину около 165 см и высоту около 95 см — в архиве указаны 158 и 90 см. Планировка ориентировочная.', en: 'The 3D view shows one chaise arrangement. At 203 cm width, the model is approximately 165 cm deep and 95 cm high; the archive lists 158 and 90 cm. Placement is approximate.' },
    sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html',
    attribution,
  },
  {
    id: 'rivet-revolve-chair',
    name: 'Rivet Revolve',
    brand: 'Rivet',
    category: 'Кресла',
    images: [root + 'chair-main.webp', root + 'chair-detail.webp', root + 'chair-room.webp', root + 'chair-fabric.webp', root + 'chair-dimensions.webp'],
    modelUrl: root + 'B071J7Q6KD.glb',
    plannerModelUrl: root + 'B071J7Q6KD-mobile.glb',
    dimensionsM: [0.83, 0.88, 0.9],
    facts: [
      { label: 'Размер', value: '≈ 83 × 88 × 90 см' },
      { label: 'Цвет', value: 'Grey Weave' },
    ],
    description: {
      ru: 'Кресло Rivet Revolve с квадратными подлокотниками и высокими сужающимися ножками. Модель выполнена в серой тканевой обивке Grey Weave.',
      en: 'The Rivet Revolve armchair combines square arms and tapered legs with Grey Weave fabric upholstery.',
    },
    details: [
      {
        label: { ru: 'Размер', en: 'Dimensions' },
        value: { ru: '≈ 83 × 88 × 90 см', en: '≈ 83 × 88 × 90 cm' },
      },
      {
        label: { ru: 'Обивка', en: 'Upholstery' },
        value: { ru: 'Полиэстер, Grey Weave', en: 'Polyester, Grey Weave' },
      },
      {
        label: { ru: 'Каркас и ножки', en: 'Frame and legs' },
        value: { ru: 'Твёрдая древесина и массив бука', en: 'Hardwood frame, solid beech legs' },
      },
      {
        label: { ru: 'Модель', en: 'Model' },
        value: { ru: 'AS-5075-LC-Raisin', en: 'AS-5075-LC-Raisin' },
      },
    ],
    care: { ru: 'Протирать мягкой сухой тканью.', en: 'Wipe with a soft, dry cloth.' },
    sourceNote: { ru: 'При ширине 83 см глубина 3D-модели около 78 см, а в архиве указано 88 см. Планировка ориентировочная; точные габариты уточняйте у продавца.', en: 'At 83 cm width the 3D model is approximately 78 cm deep, while the archive lists 88 cm. Placement is approximate; confirm dimensions with the seller.' },
    sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html',
    attribution,
  },
  {
    id: 'stone-beam-westview',
    name: 'Westview',
    brand: 'Stone & Beam',
    category: 'Диваны',
    images: [root + 'B082VLYF5W-catalog-optimized.webp', root + 'B082VLYF5W-detail1.webp', root + 'B082VLYF5W-detail3.webp', root + 'B082VLYF5W-detail4.webp'],
    modelUrl: root + 'B082VLYF5W.glb',
    plannerModelUrl: root + 'B082VLYF5W-mobile.glb',
    dimensionsM: [2.26, 1.07, 0.8],
    facts: [
      { label: 'Размер', value: '≈ 226 × 107 × 80 см' },
      { label: 'Цвет', value: 'Cream' },
    ],
    description: {
      ru: 'Диван Stone & Beam Westview с глубокими подушками и кремовой обивкой. В описании модели указаны пуховые наполнители сиденья и спинки.',
      en: 'The Stone & Beam Westview sofa has deep cushions and cream upholstery. The source describes down-filled seat and back cushions.',
    },
    details: [
      {
        label: { ru: 'Размер', en: 'Dimensions' },
        value: { ru: '≈ 226 × 107 × 80 см', en: '≈ 226 × 107 × 80 cm' },
      },
      {
        label: { ru: 'Обивка', en: 'Upholstery' },
        value: { ru: '100% полиэстер, Cream', en: '100% polyester, Cream' },
      },
      {
        label: { ru: 'Каркас и ножки', en: 'Frame and legs' },
        value: { ru: 'Массив дерева', en: 'Solid wood' },
      },
      {
        label: { ru: 'Подушки', en: 'Cushions' },
        value: { ru: 'Сиденье и спинка с пуховым наполнителем', en: 'Down-filled seat and back' },
      },
      {
        label: { ru: 'Модель', en: 'Model' },
        value: { ru: 'KF.1031-3S-B-1223', en: 'KF.1031-3S-B-1223' },
      },
    ],
    care: {
      ru: 'Избегать влаги; протирать чистой мягкой тканью.',
      en: 'Avoid moisture; wipe with a clean, soft cloth.',
    },
    sourceNote: {
      ru: 'В архиве есть противоречие: одно изображение показывает другую ширину. Размеры ориентировочные, уточняйте их у продавца перед покупкой.',
      en: 'The archive is inconsistent: one image shows a different width. Dimensions are approximate; confirm them with the seller before buying.',
    },
    sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html',
    attribution,
  },
  {
    id: 'hallowood-waverly-table',
    name: 'Waverly Oak',
    brand: 'Alkove / Hallowood',
    category: 'Столы',
    images: [root + 'table-main.webp', root + 'table-detail.webp', root + 'table-front.webp'],
    modelUrl: root + 'B01LWVEZ1C.glb',
    plannerModelUrl: root + 'B01LWVEZ1C-mobile.glb',
    dimensionsM: [0.9, 0.45, 0.45],
    facts: [
      { label: 'Размер', value: '90 × 45 × 45 см' },
      { label: 'Модель', value: 'WAV-COF900' },
    ],
    description: {
      ru: 'Прямоугольный журнальный стол Waverly с нижней полкой. Столешница, ножки и каркас выполнены из массива дуба; полка облицована дубовым шпоном.',
      en: 'The rectangular Waverly coffee table has a lower shelf. Its top, legs and frame are solid oak; the shelf is oak veneer.',
    },
    details: [
      {
        label: { ru: 'Размер', en: 'Dimensions' },
        value: { ru: '90 × 45 × 45 см', en: '90 × 45 × 45 cm' },
      },
      {
        label: { ru: 'Материал', en: 'Material' },
        value: { ru: 'Массив дуба; полка — дубовый шпон', en: 'Solid oak; oak-veneer shelf' },
      },
      {
        label: { ru: 'Покрытие', en: 'Finish' },
        value: { ru: 'Лак, светлый дуб', en: 'Lacquered, light oak' },
      },
      { label: { ru: 'Модель', en: 'Model' }, value: { ru: 'WAV-COF900', en: 'WAV-COF900' } },
    ],
    care: { ru: 'Очищать протиранием.', en: 'Wipe clean.' },
    sourceNote: {
      ru: 'В архиве ABO модель указана как Alkove; название Hallowood встречается у WAV-COF900 в других каталогах.',
      en: 'The ABO archive identifies this model as Alkove; WAV-COF900 also appears under Hallowood in other catalogues.',
    },
    sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html',
    attribution,
  },
  {
    id: 'rivet-adrienne-chair', name: 'Adrienne', brand: 'Rivet', category: 'Кресла',
    images: [1, 2, 3, 4].map(n => root + `B07QGSZ38G-photo${n}.webp`),
    modelUrl: root + 'B07QGSZ38G.glb', plannerModelUrl: root + 'B07QGSZ38G-mobile.glb',
    dimensionsM: [0.76, 0.73, 0.81],
    facts: [{ label: 'Размер', value: '≈ 76 × 73 × 81 см' }, { label: 'Цвет', value: 'Stucco' }],
    description: { ru: 'Кресло Rivet Adrienne с округлой спинкой и поворотным металлическим основанием. Ткань обивки — светлого оттенка Stucco.', en: 'The Rivet Adrienne chair combines a curved back and a metal swivel base with Stucco upholstery.' },
    details: [
      { label: { ru: 'Размер', en: 'Dimensions' }, value: { ru: '≈ 76 × 73 × 81 см', en: '≈ 76 × 73 × 81 cm' } },
      { label: { ru: 'Обивка', en: 'Upholstery' }, value: { ru: '80% полиэстер, 20% акрил', en: '80% polyester, 20% acrylic' } },
      { label: { ru: 'Каркас и основание', en: 'Frame and base' }, value: { ru: 'Твёрдая древесина и металл', en: 'Hardwood and metal' } },
    ],
    care: { ru: 'Избегать влаги; протирать мягкой сухой тканью.', en: 'Avoid moisture; wipe with a soft, dry cloth.' },
    sourceNote: { ru: 'Поворотное основание показано без отдельной анимации.', en: 'The swivel base is shown without separate animation.' },
    sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html', attribution,
  },
  {
    id: 'movian-scutari-chair', name: 'Scutari', brand: 'Movian', category: 'Кресла',
    images: [1, 2, 3, 4].map(n => root + `B07QZ21DDV-photo${n}.webp`),
    modelUrl: root + 'B07QZ21DDV.glb', plannerModelUrl: root + 'B07QZ21DDV-mobile.glb',
    dimensionsM: [0.78, 0.75, 0.78],
    facts: [{ label: 'Размер', value: '78 × 75 × 78 см' }, { label: 'Цвет', value: 'Светло-серый' }],
    description: { ru: 'Кресло Movian Scutari с тканевой обивкой и натуральными деревянными ножками.', en: 'The Movian Scutari chair has fabric upholstery and natural wood legs.' },
    details: [
      { label: { ru: 'Размер', en: 'Dimensions' }, value: { ru: '78 × 75 × 78 см', en: '78 × 75 × 78 cm' } },
      { label: { ru: 'Материалы', en: 'Materials' }, value: { ru: 'Ткань, пена, дерево, металл и резина', en: 'Fabric, foam, wood, metal and rubber' } },
    ], sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html', attribution,
  },
  {
    id: 'movian-ribe-sofa', name: 'Ribe', brand: 'Movian', category: 'Диваны',
    images: [1, 2, 3, 4].map(n => root + `B07VNL95FP-photo${n}.webp`),
    modelUrl: root + 'B07VNL95FP.glb', plannerModelUrl: root + 'B07VNL95FP-mobile.glb',
    dimensionsM: [2, 0.92, 0.85],
    facts: [{ label: 'Размер', value: '200 × 92 × 85 см' }, { label: 'Цвет', value: 'Песочный' }],
    description: { ru: 'Трёхместный диван Movian Ribe с округлыми подлокотниками, тканевой обивкой и ножками из лакированного бука.', en: 'The three-seat Movian Ribe sofa has rounded arms, fabric upholstery and lacquered beech legs.' },
    details: [
      { label: { ru: 'Размер', en: 'Dimensions' }, value: { ru: '200 × 92 × 85 см', en: '200 × 92 × 85 cm' } },
      { label: { ru: 'Материал', en: 'Material' }, value: { ru: 'Ткань; ножки из лакированного бука', en: 'Fabric; lacquered beech legs' } },
      { label: { ru: 'Подушки', en: 'Cushions' }, value: { ru: 'Съёмные сиденье и спинка', en: 'Removable seat and back' } },
    ], sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html', attribution,
  },
  {
    id: 'movian-morat-sofa', name: 'Morat', brand: 'Movian', category: 'Диваны',
    images: [1, 2, 3, 4].map(n => root + `B07VNL9S77-photo${n}.webp`),
    modelUrl: root + 'B07VNL9S77.glb', plannerModelUrl: root + 'B07VNL9S77-mobile.glb',
    dimensionsM: [2.12, 0.9, 0.8],
    facts: [{ label: 'Размер', value: '212 × 90 × 80 см' }, { label: 'Цвет', value: 'Светло-серый' }],
    description: { ru: 'Трёхместный диван Movian Morat с прямыми подлокотниками и съёмными подушками сиденья и спинки.', en: 'The three-seat Movian Morat sofa has straight arms and removable seat and back cushions.' },
    details: [
      { label: { ru: 'Размер', en: 'Dimensions' }, value: { ru: '212 × 90 × 80 см', en: '212 × 90 × 80 cm' } },
      { label: { ru: 'Обивка', en: 'Upholstery' }, value: { ru: '100% полиэстер', en: '100% polyester' } },
      { label: { ru: 'Ножки', en: 'Legs' }, value: { ru: 'Чёрный пластик', en: 'Black plastic' } },
    ], sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html', attribution,
  },
  {
    id: 'rivet-round-coffee-table', name: 'Round Coffee Table', brand: 'Rivet', category: 'Столы',
    images: [1, 2, 3, 4].map(n => root + `B07GDSF3MR-photo${n}.webp`),
    modelUrl: root + 'B07GDSF3MR.glb', plannerModelUrl: root + 'B07GDSF3MR-mobile.glb',
    dimensionsM: [0.8, 0.8, 0.36],
    facts: [{ label: 'Размер', value: '80 × 80 × 36 см' }, { label: 'Цвет', value: 'Орех' }],
    description: { ru: 'Круглый журнальный стол Rivet с ореховым шпоном и ножками из массива бука.', en: 'A round Rivet coffee table with walnut veneer and solid beech legs.' },
    details: [
      { label: { ru: 'Размер', en: 'Dimensions' }, value: { ru: '80 × 80 × 36 см', en: '80 × 80 × 36 cm' } },
      { label: { ru: 'Материалы', en: 'Materials' }, value: { ru: 'МДФ с ореховым шпоном; массив бука', en: 'Walnut-veneer MDF; solid beech' } },
    ], sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html', attribution,
  },
  {
    id: 'mercer41-frankie-gray', name: 'Frankie', brand: 'Mercer41', category: 'Диваны',
    images: [1, 2, 3, 4, 5, 6].map(n => root + `frankie-gray-${String(n).padStart(2, '0')}.webp`),
    modelUrl: root + 'frankie-gray.glb',
    dimensionsM: [2.1844, 1.0287, 0.7874],
    facts: [{ label: 'Размер', value: '≈ 218 × 103 × 79 см' }, { label: 'Цвет', value: 'Gray Velvet' }],
    description: {
      ru: 'Диван Mercer41 Frankie с изогнутой спинкой, бархатной обивкой и металлическими ножками. Представлен серый вариант Gray Velvet.',
      en: 'The Mercer41 Frankie sofa has a curved back, velvet upholstery and metal legs. The version shown is Gray Velvet.',
    },
    details: [
      { label: { ru: 'Размер', en: 'Dimensions' }, value: { ru: '≈ 218 × 103 × 79 см', en: '≈ 218 × 103 × 79 cm' } },
      { label: { ru: 'Обивка', en: 'Upholstery' }, value: { ru: 'Бархат, Gray Velvet', en: 'Velvet, Gray Velvet' } },
      { label: { ru: 'Каркас и ножки', en: 'Frame and legs' }, value: { ru: 'Металл', en: 'Metal' } },
      { label: { ru: 'Артикул Wayfair', en: 'Wayfair SKU' }, value: { ru: 'MCRF6337', en: 'MCRF6337' } },
    ],
    sourceDescription: {
      ru: 'Характеристики и фотографии — с карточки Wayfair; 3D-модель — Wayfair / Eric Chadwick, опубликована Khronos. Данные и комплектацию уточняйте у продавца.',
      en: 'Specifications and photos are from Wayfair; the 3D model is by Wayfair / Eric Chadwick, published by Khronos. Confirm current specifications and contents with the seller.',
    },
    sourceNote: {
      ru: 'Оттенок и фактура в 3D приблизительны и зависят от освещения. Размеры в планировщике ориентировочные.',
      en: 'The 3D colour and texture are approximate and depend on lighting. Planner dimensions are approximate.',
    },
    sourceUrl: 'https://www.wayfair.com/furniture/pdp/mercer41-frankie-86-velvet-tuxedo-arm-sofa-mcrf6337.html',
    attribution: {
      credit: 'Фото: Wayfair. 3D: Wayfair, LLC / Eric Chadwick (2021); выбран встроенный серый вариант, материалы и геометрия сохранены. CC BY 4.0 относится к 3D-модели.',
      creditEn: 'Photos: Wayfair. 3D: Wayfair, LLC / Eric Chadwick (2021); the built-in gray variant is selected; materials and geometry are retained. CC BY 4.0 applies to the 3D model.',
      sourceUrl: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
];

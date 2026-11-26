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
  /** Product dimensions in metres, width × depth × height, rounded from source data. */
  dimensionsM?: readonly [number, number, number];
  /** Only source-backed display facts, e.g. dimensions or upholstery. */
  facts?: readonly { label: string; value: string }[];
  description?: { ru: string; en: string };
  details?: readonly { label: { ru: string; en: string }; value: { ru: string; en: string } }[];
  care?: { ru: string; en: string };
  sourceNote?: { ru: string; en: string };
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
    'Фото и 3D: Amazon.com; Amazon Berkeley Objects — M. Guillaumin, T. Dideriksen, K. Deng, H. Arora, J. Collins, J. Malik. Изображения и модели сжаты.',
  creditEn:
    'Photos and 3D: Amazon.com; Amazon Berkeley Objects — M. Guillaumin, T. Dideriksen, K. Deng, H. Arora, J. Collins, J. Malik. Images and models are compressed.',
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
    images: [root + 'sofa-main.webp', root + 'sofa-room.webp', root + 'sofa-detail.webp'],
    modelUrl: root + 'B072FVHRZ3.glb',
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
    sourceNote: { ru: 'В 3D показан один вариант расположения шезлонга.', en: 'The 3D view shows one chaise configuration.' },
    sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html',
    attribution,
  },
  {
    id: 'rivet-revolve-chair',
    name: 'Rivet Revolve',
    brand: 'Rivet',
    category: 'Кресла',
    images: [root + 'chair-main.webp', root + 'chair-detail.webp'],
    modelUrl: root + 'B071J7Q6KD.glb',
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
    sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html',
    attribution,
  },
  {
    id: 'stone-beam-westview',
    name: 'Westview',
    brand: 'Stone & Beam',
    category: 'Диваны',
    images: [root + 'B082VLYF5W-catalog-optimized.webp'],
    modelUrl: root + 'B082VLYF5W.glb',
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
    sourceUrl: 'https://amazon-berkeley-objects.s3.amazonaws.com/index.html',
    attribution,
  },
  {
    id: 'hallowood-waverly-table',
    name: 'Waverly Oak',
    brand: 'Alkove / Hallowood',
    category: 'Столы',
    images: [root + 'table-main.webp', root + 'table-detail.webp'],
    modelUrl: root + 'B01LWVEZ1C.glb',
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
];

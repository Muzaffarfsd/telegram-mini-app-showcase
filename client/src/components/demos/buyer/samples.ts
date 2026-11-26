export type Copy = readonly [string, string];
export const local = (copy: Copy, ru: boolean) => copy[ru ? 0 : 1];
export const categories = [
  'Одежда',
  'Обувь',
  'Сумки',
  'Аксессуары',
  'Для дома',
  'Другое',
] as const;
export type Category = (typeof categories)[number];
const englishCategories: Record<Category, string> = {
  Одежда: 'Clothing',
  Обувь: 'Shoes',
  Сумки: 'Bags',
  Аксессуары: 'Accessories',
  'Для дома': 'Homeware',
  Другое: 'Other',
};
export const categoryName = (category: Category, ru: boolean) =>
  ru ? category : englishCategories[category];
export type Sample = {
  id: string;
  category: Category;
  title: Copy;
  shape: Copy;
  image: string;
  gallery?: string[];
  feature?: string;
  finish?: Copy;
  ask?: Copy;
};
const materials: Record<Category, Copy> = {
  Одежда: ['Ткань и состав', 'Fabric and composition'],
  Обувь: ['Материал верха и подошвы', 'Upper and sole material'],
  Сумки: ['Фактура корпуса и подкладка', 'Body texture and lining'],
  Аксессуары: ['Покрытие и фактура', 'Finish and texture'],
  'Для дома': ['Отделка поверхности', 'Surface finish'],
  Другое: ['Материал и отделка', 'Material and finish'],
};
const questions: Record<Category, Copy> = {
  Одежда: ['Замеры, состав и посадку', 'Measurements, fibre content and fit'],
  Обувь: ['Длину стельки и полноту пары', 'Insole length and width'],
  Сумки: [
    'Размеры, застёжку и длину ремня',
    'Dimensions, fastening and strap drop',
  ],
  Аксессуары: ['Вес, размер и отделку', 'Weight, dimensions and finish'],
  'Для дома': [
    'Габариты, материал и комплектацию',
    'Dimensions, material and included pieces',
  ],
  Другое: ['Размеры и материал', 'Dimensions and material'],
};
export const materialOf = (item: Sample, ru: boolean) =>
  local(item.finish ?? materials[item.category], ru);
export const askOf = (item: Sample, ru: boolean) =>
  local(item.ask ?? questions[item.category], ru);
export const photoDir = '/china-buyer/yangben/';
export const samples: Sample[] = [
  {
    id: 'fold',
    feature: 'Fold',
    category: 'Сумки',
    title: ['Сумка Fold', 'Fold crossbody'],
    shape: ['Плоский корпус, длинный ремень', 'Flat body, long shoulder strap'],
    finish: [
      'Синяя ткань с сеткой рипстоп',
      'Cobalt fabric with a ripstop grid',
    ],
    ask: [
      'Длину ремня и внутренние карманы',
      'Strap length and inside pockets',
    ],
    image: photoDir + 'fold-480.webp',
    gallery: [photoDir + 'fold-detail.webp'],
  },
  {
    id: 'arc',
    feature: 'Arc',
    category: 'Для дома',
    title: ['Лампа Arc', 'Arc desk lamp'],
    shape: ['Купол над низким основанием', 'Domed shade on a low base'],
    finish: ['Серебристый матовый металл', 'Satin silver-tone metal'],
    ask: [
      'Высоту, тип вилки и температуру света',
      'Height, plug type and light temperature',
    ],
    image: photoDir + 'arc-480.webp',
    gallery: [photoDir + 'arc-detail.webp'],
  },
  {
    id: 'clay',
    feature: 'Clay',
    category: 'Для дома',
    title: ['Чайник Clay', 'Clay teapot'],
    shape: ['Низкий чайник и пиала', 'Low teapot with a tea cup'],
    finish: [
      'Терракотовая зернистая поверхность',
      'Grained terracotta surface',
    ],
    ask: [
      'Объём чайника и количество пиал',
      'Teapot capacity and number of cups',
    ],
    image: photoDir + 'clay-480.webp',
    gallery: [photoDir + 'clay-detail.webp'],
  },
  {
    id: 'v5-feature',
    category: 'Сумки',
    title: ['Сумка бордо', 'Bordeaux shoulder bag'],
    shape: ['Мягкий корпус, широкая ручка', 'Soft body, wide handle'],
    image: '/china-buyer/v5-feature-fast.webp',
    gallery: [
      '/china-buyer/v5-feature-angle.webp',
      '/china-buyer/v5-feature-model.webp',
      '/china-buyer/v5-feature-detail.webp',
    ],
  },
  {
    id: 'v4-coat',
    category: 'Одежда',
    title: ['Светлое пальто с поясом', 'Belted coat'],
    shape: ['Свободный крой с поясом', 'Relaxed cut with a belt'],
    image: '/china-buyer/v4-coat.webp',
    gallery: [
      '/china-buyer/v5-light-coat-object.webp',
      '/china-buyer/v5-light-coat-model.webp',
      '/china-buyer/v5-light-coat-detail.webp',
    ],
  },
  {
    id: 'v4-bag',
    category: 'Сумки',
    title: ['Сумка в оттенке вина', 'Wine shoulder bag'],
    shape: ['Закруглённое дно', 'Rounded base'],
    image: '/china-buyer/v4-bag.webp',
    gallery: [
      '/china-buyer/v5-wine-bag-angle.webp',
      '/china-buyer/v5-wine-bag-model.webp',
      '/china-buyer/v5-wine-bag-detail.webp',
    ],
  },
  {
    id: 'tailoring',
    category: 'Одежда',
    title: ['Структурный жакет', 'Tailored jacket'],
    shape: ['Чёткая линия плеча', 'Defined shoulder line'],
    image: '/china-buyer/product-blazer.webp',
    gallery: [
      '/china-buyer/v2-blazer-angle.webp',
      '/china-buyer/v2-blazer-detail.webp',
      '/china-buyer/v2-blazer-model.webp',
    ],
  },
  {
    id: 'bag',
    category: 'Сумки',
    title: ['Сумка на каждый день', 'Everyday bag'],
    shape: ['Короткие ручки', 'Short handles'],
    image: '/china-buyer/product-bag.webp',
    gallery: [
      '/china-buyer/v2-bag-angle.webp',
      '/china-buyer/v2-bag-held.webp',
      '/china-buyer/v2-bag-detail.webp',
    ],
  },
  {
    id: 'sneaker',
    category: 'Обувь',
    title: ['Городские кроссовки', 'City trainers'],
    shape: ['Низкая посадка', 'Low-profile shape'],
    image: '/china-buyer/product-sneaker.webp',
    gallery: [
      '/china-buyer/v2-sneaker-angle.webp',
      '/china-buyer/v2-sneaker-detail.webp',
      '/china-buyer/v2-sneaker-top.webp',
    ],
  },
  {
    id: 'wardrobe',
    category: 'Одежда',
    title: ['Образ на каждый день', 'Everyday layers'],
    shape: ['Свободная посадка', 'Relaxed layering'],
    image: '/china-buyer/fashion.webp',
  },
  {
    id: 'burgundy',
    category: 'Сумки',
    title: ['Сумка в винном оттенке', 'Soft wine bag'],
    shape: ['Мягкие складки', 'Soft folds'],
    image: '/china-buyer/bags.webp',
  },
  {
    id: 'loafers',
    category: 'Обувь',
    title: ['Лаконичные лоферы', 'City loafers'],
    shape: ['Низкий каблук', 'Low heel'],
    image: '/china-buyer/shoes.webp',
  },
  {
    id: 'accessory',
    category: 'Аксессуары',
    title: ['Акцентные очки', 'Statement frames'],
    shape: ['Выразительная оправа', 'Bold frame'],
    image: '/china-buyer/product-accessory.webp',
  },
  {
    id: 'home',
    category: 'Для дома',
    title: ['Керамика для дома', 'Studio ceramics'],
    shape: ['Округлый объём', 'Rounded volume'],
    image: '/china-buyer/product-home.webp',
  },
  {
    id: 'v2-coat',
    category: 'Одежда',
    title: ['Пальто с выразительным силуэтом', 'City coat'],
    shape: ['Удлинённый силуэт', 'Long silhouette'],
    image: '/china-buyer/v2-coat.webp',
  },
  {
    id: 'v2-knit',
    category: 'Одежда',
    title: ['Трикотажный кардиган', 'Knitted cardigan'],
    shape: ['Рельефная вязка', 'Textured knit'],
    image: '/china-buyer/v2-knit.webp',
  },
  {
    id: 'v2-bag-sculpted',
    category: 'Сумки',
    title: ['Сумка строгой формы', 'Structured bag'],
    shape: ['Жёсткая геометрия', 'Structured silhouette'],
    image: '/china-buyer/v2-bag-sculpted.webp',
  },
  {
    id: 'v2-bag-burgundy',
    category: 'Сумки',
    title: ['Сумка-полумесяц', 'Crescent bag'],
    shape: ['Изогнутая форма', 'Curved silhouette'],
    image: '/china-buyer/v2-bag-burgundy.webp',
    gallery: [
      '/china-buyer/v2-bag-burgundy-angle.webp',
      '/china-buyer/v2-bag-burgundy-model.webp',
      '/china-buyer/v2-bag-burgundy-detail.webp',
    ],
  },
  {
    id: 'v2-boots',
    category: 'Обувь',
    title: ['Лаконичные ботильоны', 'Ankle boots'],
    shape: ['Короткое голенище', 'Ankle-height shaft'],
    image: '/china-buyer/v2-boots.webp',
  },
  {
    id: 'v2-slingbacks',
    category: 'Обувь',
    title: ['Туфли с открытой пяткой', 'Slingback shoes'],
    shape: ['Открытая пятка', 'Open heel'],
    image: '/china-buyer/v2-slingbacks.webp',
  },
  {
    id: 'v2-scarf',
    category: 'Аксессуары',
    title: ['Платок с графичным рисунком', 'Graphic scarf'],
    shape: ['Контрастный принт', 'Contrasting print'],
    image: '/china-buyer/v2-scarf.webp',
  },
  {
    id: 'v2-earrings',
    category: 'Аксессуары',
    title: ['Скульптурные серьги', 'Sculptural earrings'],
    shape: ['Рельефный профиль', 'Sculpted profile'],
    image: '/china-buyer/v2-earrings.webp',
  },
  {
    id: 'v2-teaware',
    category: 'Для дома',
    title: ['Чайная композиция', 'Tea setting'],
    shape: ['Комплект для сервировки', 'Serving set'],
    image: '/china-buyer/v2-teaware.webp',
  },
  {
    id: 'v2-lamp',
    category: 'Для дома',
    title: ['Настольная лампа', 'Table lamp'],
    shape: ['Направленный свет', 'Directional light'],
    image: '/china-buyer/v2-lamp.webp',
  },
];
export const sampleById = (id: string) =>
  samples.find((item) => item.id === id);
export function sampleIds(value: unknown) {
  return Array.isArray(value)
    ? Array.from(
        new Set(
          value.filter(
            (id): id is string => typeof id === 'string' && !!sampleById(id),
          ),
        ),
      )
    : [];
}
export const largeImage = (item: Sample) =>
  item.feature ? item.image.replace('-480.', '-1200.') : item.image;

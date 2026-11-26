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
type Shot = 'front' | 'reverse' | 'detail' | 'texture';
type Definition = {
  id: string;
  category: Category;
  title: Copy;
  shape: Copy;
  finish: Copy;
  ask: Copy;
};
export type Sample = Definition & {
  image: string;
  gallery: string[];
  shots: Shot[];
};
export const materialOf = (s: Sample, ru: boolean) => local(s.finish, ru);
export const askOf = (s: Sample, ru: boolean) => local(s.ask, ru);
const labels: Record<Shot, Copy> = {
  front: ['Общий вид', 'Full view'],
  reverse: ['Другой ракурс', 'Alternate view'],
  detail: ['Деталь', 'Detail'],
  texture: ['Фактура', 'Texture'],
};
export const shotName = (s: Sample, index: number, ru: boolean) =>
  local(labels[s.shots[index]], ru);
const definitions: Definition[] = [
  {
    id: 'fold',
    category: 'Сумки',
    title: ['Сумка Fold', 'Fold crossbody'],
    shape: ['Плоский корпус, длинный ремень', 'Flat body, long shoulder strap'],
    finish: [
      'Кобальтовая ткань с сетчатым плетением',
      'Cobalt fabric with a woven grid',
    ],
    ask: [
      'Длину ремня, подкладку и качество молнии',
      'Strap length, lining and zip quality',
    ],
  },
  {
    id: 'arc',
    category: 'Для дома',
    title: ['Лампа Arc', 'Arc desk lamp'],
    shape: ['Купол над низким основанием', 'Domed shade on a low base'],
    finish: [
      'Сатиновый металл с круговой шлифовкой',
      'Satin metal with a circular brushed finish',
    ],
    ask: [
      'Габариты, тип вилки и температуру света',
      'Dimensions, plug type and colour temperature',
    ],
  },
  {
    id: 'clay',
    category: 'Для дома',
    title: ['Чайник Clay', 'Clay teapot'],
    shape: ['Низкий чайник и пиала', 'Low teapot with a tea cup'],
    finish: [
      'Зернистая терракотовая поверхность',
      'Grained terracotta surface',
    ],
    ask: [
      'Объём, посадку крышки и защитную упаковку',
      'Capacity, lid fit and protective packaging',
    ],
  },
  {
    id: 'inspection-backpack',
    category: 'Сумки',
    title: ['Городской рюкзак', 'Everyday backpack'],
    shape: [
      'Две лямки и передний карман',
      'Two shoulder straps and a front pocket',
    ],
    finish: [
      'Плотная синяя ткань, тёмная фурнитура',
      'Dense navy fabric and dark fittings',
    ],
    ask: [
      'Фото швов и молний, размеры и цену партии',
      'Seam and zip photos, dimensions and batch price',
    ],
  },
  {
    id: 'v5-feature',
    category: 'Сумки',
    title: ['Сумка бордо', 'Bordeaux shoulder bag'],
    shape: ['Мягкий корпус, узкая ручка', 'Soft body, slim handle'],
    finish: ['Гладкая поверхность бордового цвета', 'Smooth Bordeaux finish'],
    ask: [
      'Фото кромок, креплений ручки и молнии',
      'Photos of edge finish, handle mounts and zip',
    ],
  },
  {
    id: 'v4-coat',
    category: 'Одежда',
    title: ['Светлое пальто с поясом', 'Belted coat'],
    shape: ['Свободный крой с поясом', 'Relaxed cut with a belt'],
    finish: ['Светлое ворсовое полотно', 'Brushed ivory fabric'],
    ask: [
      'Замеры по спинке, состав и обработку борта',
      'Back length, composition and edge finishing',
    ],
  },
  {
    id: 'v4-bag',
    category: 'Сумки',
    title: ['Сумка в оттенке вина', 'Wine shoulder bag'],
    shape: [
      'Трапециевидная форма, короткая ручка',
      'Trapezoid silhouette, short handle',
    ],
    finish: [
      'Мелкая фактура и матовый металлический замок',
      'Fine grain and a brushed metal clasp',
    ],
    ask: [
      'Размер дна, работу замка и упаковку углов',
      'Base dimensions, clasp operation and corner protection',
    ],
  },
  {
    id: 'tailoring',
    category: 'Одежда',
    title: ['Структурный жакет', 'Tailored jacket'],
    shape: ['Чёткая линия плеча', 'Defined shoulder line'],
    finish: [
      'Графитовая костюмная ткань с мелким переплетением',
      'Finely woven graphite suiting',
    ],
    ask: [
      'Ширину плеч, подкладку и размерную сетку',
      'Shoulder width, lining and size chart',
    ],
  },
  {
    id: 'bag',
    category: 'Сумки',
    title: ['Сумка на каждый день', 'Everyday bag'],
    shape: ['Короткие ручки', 'Short handles'],
    finish: [
      'Тёплый карамельный тон и светлая отстрочка',
      'Caramel finish with light topstitching',
    ],
    ask: [
      'Нагрузку на ручки и внутренние отделения',
      'Handle load capacity and internal compartments',
    ],
  },
  {
    id: 'sneaker',
    category: 'Обувь',
    title: ['Городские кроссовки', 'City trainers'],
    shape: ['Низкая посадка', 'Low-profile shape'],
    finish: [
      'Сочетание сетки и ворсистых вставок',
      'Mesh and soft napped panels',
    ],
    ask: [
      'Длину стельки, проклейку и разбивку по размерам',
      'Insole lengths, sole bonding and size breakdown',
    ],
  },
  {
    id: 'wardrobe',
    category: 'Одежда',
    title: ['Образ на каждый день', 'Everyday layers'],
    shape: ['Свободная посадка', 'Relaxed layering'],
    finish: [
      'Деним, светлый трикотаж и матовая ткань брюк',
      'Indigo denim, cream knit and matte trouser fabric',
    ],
    ask: [
      'Стоимость каждого предмета и замеры комплекта',
      'Individual item prices and measurements for the set',
    ],
  },
  {
    id: 'burgundy',
    category: 'Сумки',
    title: ['Сумка в винном оттенке', 'Soft wine bag'],
    shape: ['Мягкие складки', 'Soft folds'],
    finish: [
      'Мягкая винная поверхность со сборкой на шнуре',
      'Soft wine finish gathered at the drawcord',
    ],
    ask: [
      'Как закрывается сумка и насколько длинный шнур',
      'How the bag closes and the drawcord length',
    ],
  },
  {
    id: 'loafers',
    category: 'Обувь',
    title: ['Лаконичные лоферы', 'City loafers'],
    shape: ['Низкий каблук', 'Low heel'],
    finish: [
      'Гладкая чёрная поверхность и прошитый мыс',
      'Smooth black finish with an apron seam',
    ],
    ask: [
      'Полноту пары, длину стельки и толщину подошвы',
      'Fit width, insole length and sole thickness',
    ],
  },
  {
    id: 'accessory',
    category: 'Аксессуары',
    title: ['Акцентные очки', 'Statement frames'],
    shape: ['Выразительная оправа', 'Bold frame'],
    finish: [
      'Дымчато-синяя полупрозрачная оправа',
      'Translucent smoke-blue frames',
    ],
    ask: [
      'Ширину переносицы, длину дужки и характеристики линз',
      'Bridge width, temple length and lens specifications',
    ],
  },
  {
    id: 'home',
    category: 'Для дома',
    title: ['Керамика для дома', 'Studio ceramics'],
    shape: ['Округлый объём', 'Rounded volume'],
    finish: [
      'Белая поверхность с мелкими вкраплениями',
      'Chalk white surface with fine speckles',
    ],
    ask: [
      'Диаметр горлышка, высоту и упаковку для перевозки',
      'Neck diameter, height and transit packaging',
    ],
  },
  {
    id: 'v2-coat',
    category: 'Одежда',
    title: ['Пальто с выразительным силуэтом', 'City coat'],
    shape: ['Удлинённый силуэт', 'Long silhouette'],
    finish: [
      'Глубокий синий цвет и плотная фактура',
      'Deep navy colour and dense texture',
    ],
    ask: [
      'Длину, шлицу и плотность ткани образца',
      'Length, back vent and fabric weight of the sample',
    ],
  },
  {
    id: 'v2-knit',
    category: 'Одежда',
    title: ['Трикотажный кардиган', 'Knitted cardigan'],
    shape: ['Рельефная вязка', 'Textured knit'],
    finish: ['Овсяный меланж и рельефная вязка', 'Oat melange and ribbed knit'],
    ask: [
      'Состав пряжи, усадку и замеры изделия',
      'Yarn composition, shrinkage and garment measurements',
    ],
  },
  {
    id: 'v2-bag-sculpted',
    category: 'Сумки',
    title: ['Сумка строгой формы', 'Structured bag'],
    shape: ['Жёсткая геометрия', 'Structured silhouette'],
    finish: [
      'Матовая поверхность и аккуратные складки',
      'Matte finish with folded gussets',
    ],
    ask: [
      'Жёсткость корпуса и способ крепления ручки',
      'Body rigidity and handle attachment',
    ],
  },
  {
    id: 'v2-bag-burgundy',
    category: 'Сумки',
    title: ['Сумка-полумесяц', 'Crescent bag'],
    shape: ['Изогнутая форма', 'Curved silhouette'],
    finish: [
      'Сливовый оттенок и тонкая строчка',
      'Deep plum finish and fine stitching',
    ],
    ask: [
      'Длину ручки, ширину раскрытия и материал подклада',
      'Strap drop, opening width and lining material',
    ],
  },
  {
    id: 'v2-boots',
    category: 'Обувь',
    title: ['Лаконичные ботильоны', 'Ankle boots'],
    shape: ['Короткое голенище', 'Ankle-height shaft'],
    finish: [
      'Гладкий чёрный верх с боковой молнией',
      'Smooth black upper with a side zip',
    ],
    ask: [
      'Высоту каблука, обхват голенища и размерный ряд',
      'Heel height, shaft circumference and size range',
    ],
  },
  {
    id: 'v2-slingbacks',
    category: 'Обувь',
    title: ['Туфли с открытой пяткой', 'Slingback shoes'],
    shape: ['Открытая пятка', 'Open heel'],
    finish: [
      'Светлый верх и контрастный каблук',
      'Ivory upper and contrasting heel',
    ],
    ask: [
      'Диапазон ремешка и устойчивость каблука',
      'Strap adjustment range and heel stability',
    ],
  },
  {
    id: 'v2-scarf',
    category: 'Аксессуары',
    title: ['Платок с графичным рисунком', 'Graphic scarf'],
    shape: ['Контрастный принт', 'Contrasting print'],
    finish: [
      'Графичный синий рисунок и узкая подгибка',
      'Graphic blue print and a narrow rolled edge',
    ],
    ask: [
      'Состав, размер и вид рисунка с изнанки',
      'Fibre composition, dimensions and reverse-side print',
    ],
  },
  {
    id: 'v2-earrings',
    category: 'Аксессуары',
    title: ['Скульптурные серьги', 'Sculptural earrings'],
    shape: ['Рельефный профиль', 'Sculpted profile'],
    finish: [
      'Полированная серебристая поверхность',
      'Polished silver-tone finish',
    ],
    ask: [
      'Вес одной серьги, сплав и тип застёжки',
      'Weight per earring, alloy and fastening',
    ],
  },
  {
    id: 'v2-teaware',
    category: 'Для дома',
    title: ['Чайная композиция', 'Tea setting'],
    shape: ['Комплект для сервировки', 'Serving set'],
    finish: ['Ледяная голубая глазурь', 'Ice-blue glaze'],
    ask: [
      'Комплектацию, объём и защиту каждого предмета',
      'Included pieces, capacity and individual protection',
    ],
  },
  {
    id: 'v2-lamp',
    category: 'Для дома',
    title: ['Настольная лампа', 'Table lamp'],
    shape: ['Направленный свет', 'Directional light'],
    finish: [
      'Мягкое свечение плафона и деревянная фактура основания',
      'Opal diffuser and a wood-grained base',
    ],
    ask: [
      'Тип вилки, размеры и возможность замены источника света',
      'Plug type, dimensions and replaceability of the light source',
    ],
  },
];
const productDir = (id: string) => '/china-buyer/sourcing/products/' + id + '/';
const shootVersion = '?v=atelier-1';
export const samples: Sample[] = definitions.map((sample) => {
  const path = productDir(sample.id);
  const shots: Shot[] = ['front', 'reverse', 'detail', 'texture'];
  return {
    ...sample,
    shots,
    image: path + 'thumb.webp' + shootVersion,
    gallery: shots.slice(1).map((shot) => path + shot + '.webp' + shootVersion),
  };
});
export const largeImage = (sample: Sample) =>
  productDir(sample.id) + 'front.webp' + shootVersion;
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

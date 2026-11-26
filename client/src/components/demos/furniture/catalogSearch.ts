import type { FurnitureProduct } from './storeCatalog';

export const categoriesEn: Record<string, string> = {
  Диваны: 'Sofas',
  Кресла: 'Armchairs',
  Столы: 'Occasional tables',
  'Обеденные столы': 'Dining tables',
  Стулья: 'Chairs & stools',
  Хранение: 'Storage',
  Свет: 'Lighting',
  Кровати: 'Beds',
  'Банкетки и пуфы': 'Benches & ottomans',
  Ковры: 'Rugs',
  'Рабочие столы': 'Desks',
};
const singular: Record<string, [string, string]> = {
  Диваны: ['Диван', 'Sofa'],
  Кресла: ['Кресло', 'Armchair'],
  Столы: ['Стол', 'Table'],
  'Обеденные столы': ['Стол', 'Dining table'],
  Стулья: ['Стул', 'Chair'],
  Хранение: ['Хранение', 'Storage'],
  Свет: ['Светильник', 'Light'],
  Кровати: ['Кровать', 'Bed'],
  'Банкетки и пуфы': ['Банкетки и пуфы', 'Benches & ottomans'],
  Ковры: ['Ковёр', 'Rug'],
  'Рабочие столы': ['Письменный стол', 'Desk'],
};
export function typeLabel(category: string | undefined, ru: boolean) {
  return singular[category || '']?.[ru ? 0 : 1] || category || '';
}
export const materials = [
  { id: 'polyester', ru: 'Полиэстер', en: 'Polyester', pattern: /полиэстер|polyester/i },
  { id: 'oak', ru: 'Дуб', en: 'Oak', pattern: /дуб|\boak\b/i },
  { id: 'wood', ru: 'Дерево', en: 'Wood', pattern: /древес|дерев|wood|walnut|oak|beech|дуб|бук|орех/i },
  { id: 'metal', ru: 'Металл', en: 'Metal', pattern: /металл|metal|steel|iron|сталь|латунь/i },
  { id: 'velvet', ru: 'Бархат', en: 'Velvet', pattern: /бархат|velvet/i },
  { id: 'wool', ru: 'Шерсть', en: 'Wool', pattern: /шерст|wool/i },
  {
    id: 'fabric',
    ru: 'Текстиль',
    en: 'Fabric',
    pattern: /обивк|ткан|fabric|текстил|polyester|linen|полиэстер/i,
  },
];
export function materialText(p: FurnitureProduct) {
  return (p.details || [])
    .filter((d) => /материал|обивка|каркас|покрытие/i.test(d.label.ru))
    .map((d) => d.value.ru + ' ' + d.value.en)
    .join(' ');
}
const norm = (text: string) =>
  text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[×х](?=\s*\d)/g, 'x')
    .replace(/(\d)\s*x\s*(?=\d)/g, '$1x')
    .trim();
export function matchesSearch(product: FurnitureProduct, query: string) {
  const dims = product.dimensionsM?.map((v) => Math.round(v * 100)) || [];
  const round =
    product.shape === 'round' || /round|кругл/i.test(product.name + ' ' + product.description?.ru);
  const text = norm(
    [
      product.name,
      product.brand,
      product.category,
      typeLabel(product.category, true),
      categoriesEn[product.category],
      product.description?.ru,
      product.description?.en,
      round ? 'круглый круглая round' : '',
      ...materials.filter((m) => m.pattern.test(materialText(product))).flatMap((m) => [m.ru, m.en]),
      ...(product.facts || []).map((f) => f.value),
      ...(product.details || []).map((d) => d.value.ru + ' ' + d.value.en),
      dims.join('x'),
    ].join(' ')
  );
  let q = norm(query);
  const limit = q.match(/(?:до|under|up to)\s*(\d+(?:[.,]\d+)?)/);
  if (limit) {
    if (!dims.length || dims[0] > Number(limit[1].replace(',', '.'))) return false;
    q = q.replace(limit[0], '');
  }
  return q
    .split(/\s+/)
    .filter((x) => x && !['см', 'cm', 'шириной', 'ширина', 'wide'].includes(x))
    .every((x) => (/^\d+$/.test(x) ? dims.includes(Number(x)) : text.includes(x)));
}

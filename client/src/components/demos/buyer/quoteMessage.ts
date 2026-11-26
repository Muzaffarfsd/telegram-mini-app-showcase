import { categoryName, largeImage, local, sampleById } from './samples';
import { money, countryName, markets, type MarketCode } from './markets';
import { emptyBrief, type Brief } from './records';

export type MessageLanguage = 'ru' | 'en' | 'zh';
const exampleDescription = {
  ru: 'Для магазина нужны одинаковые городские рюкзаки. Прошу прислать фото швов и молний образца и рассчитать доставку партии.',
  en: 'I need matching everyday backpacks for my shop. Please send photos of the sample seams and zips and quote delivery for the batch.',
  zh: '我想为店铺采购同款通勤双肩包。请提供样品缝线和拉链的照片，并核算整批运费。',
};
export function backpackExample(ru: boolean, market: MarketCode | ''): Brief {
  return {
    ...emptyBrief(['inspection-backpack'], 'Сумки', market),
    purpose: 'business',
    quantity: '30',
    description: exampleDescription[ru ? 'ru' : 'en'],
  };
}
const copy = {
  ru: {
    hello: 'Здравствуйте! Прошу рассчитать закупку товара из Китая.',
    purpose: 'Назначение',
    personal: 'Для себя',
    business: 'Для бизнеса',
    category: 'Категория',
    size: 'Размер',
    colour: 'Цвет',
    qty: 'Количество',
    units: 'шт.',
    budget: 'Бюджет заказа',
    destination: 'Доставка',
    references: 'Примеры товара',
    request:
      'Прошу отдельно указать стоимость товара, вашу комиссию, доставку и прочие расходы. Какова итоговая сумма и ориентировочный срок?',
    wholesale: 'Также уточните цену за штуку и минимальную партию.',
    currency: 'Валюта расчёта',
  },
  en: {
    hello: 'Hello! I would like a quote for sourcing goods from China.',
    purpose: 'Purpose',
    personal: 'Personal order',
    business: 'Business order',
    category: 'Category',
    size: 'Size',
    colour: 'Colour',
    qty: 'Quantity',
    units: 'pcs',
    budget: 'Order budget',
    destination: 'Delivery to',
    references: 'Product references',
    request:
      'Please itemise the goods, your fee, shipping and any other costs. What is the total and the estimated lead time?',
    wholesale: 'Please also confirm the unit price and minimum order quantity.',
    currency: 'Quote currency',
  },
  zh: {
    hello: '您好！我想咨询从中国采购以下商品的报价。',
    purpose: '采购用途',
    personal: '自用',
    business: '商业采购',
    category: '商品类别',
    size: '尺寸',
    colour: '颜色',
    qty: '数量',
    units: '件',
    budget: '订单预算',
    destination: '收货地',
    references: '商品参考图',
    request:
      '请分别列出货款、服务费、运费和其他费用，并告知总价及预计交货时间。',
    wholesale: '另请确认单价和最小起订量。',
    currency: '报价币种',
  },
} as const;
const chineseCategories: Record<string, string> = {
  Одежда: '服装',
  Обувь: '鞋类',
  Сумки: '箱包',
  Аксессуары: '配饰',
  'Для дома': '家居用品',
  Другое: '其他',
};
const chineseSamples: Record<string, string> = {
  fold: 'Fold 斜挎包',
  arc: 'Arc 台灯',
  clay: 'Clay 陶制茶壶',
  'inspection-backpack': '通勤双肩包',
  'v5-feature': '酒红色单肩包',
  'v4-coat': '浅色系带大衣',
  'v4-bag': '酒红色手提包',
  tailoring: '西装外套',
  bag: '日常手提包',
  sneaker: '休闲运动鞋',
  wardrobe: '日常叠穿套装',
  burgundy: '酒红色软包',
  loafers: '乐福鞋',
  accessory: '眼镜',
  home: '家用陶瓷',
  'v2-coat': '长款大衣',
  'v2-knit': '针织开衫',
  'v2-bag-sculpted': '硬挺手提包',
  'v2-bag-burgundy': '月牙包',
  'v2-boots': '短靴',
  'v2-slingbacks': '后空单鞋',
  'v2-scarf': '几何图案丝巾',
  'v2-earrings': '立体耳饰',
  'v2-teaware': '茶具套装',
  'v2-lamp': '台灯',
};
export function writeQuote(b: Brief, lang: MessageLanguage, origin: string) {
  const t = copy[lang];
  const ru = lang === 'ru';
  const country =
    lang === 'zh' && b.market && typeof Intl.DisplayNames === 'function'
      ? new Intl.DisplayNames(['zh'], { type: 'region' }).of(b.market)
      : countryName(b.market, ru);
  const dest = [country, b.city.trim()].filter(Boolean).join(', ');
  const unit = b.currency || (b.market ? markets[b.market].currency : '');
  const facts = [
    b.purpose && [t.purpose, t[b.purpose]],
    b.category !== 'Другое' && [
      t.category,
      lang === 'zh'
        ? chineseCategories[b.category]
        : categoryName(b.category, ru),
    ],
    [t.qty, b.quantity + ' ' + t.units],
    b.size && [t.size, b.size],
    b.color && [t.colour, b.color],
    dest && [t.destination, dest],
    b.budget &&
      b.currency && [t.budget, money(Number(b.budget), b.currency, ru)],
    unit && [t.currency, unit],
  ]
    .filter((row): row is string[] => Array.isArray(row))
    .map(([label, value]) => label + ' — ' + value);
  const refs = b.sampleIds.flatMap((id) => {
    const s = sampleById(id);
    if (!s) return [];
    const title =
      lang === 'zh'
        ? (chineseSamples[id] ?? local(s.title, false))
        : local(s.title, ru);
    return [title + ' · ' + new URL(largeImage(s), origin).href];
  });
  return [
    t.hello,
    [
      Object.values(exampleDescription).includes(b.description)
        ? exampleDescription[lang]
        : b.description,
      b.url,
    ]
      .filter(Boolean)
      .join('\n'),
    facts.join('\n'),
    refs.length ? t.references + '\n' + refs.join('\n') : '',
    [t.request, b.purpose === 'business' && t.wholesale]
      .filter(Boolean)
      .join(' '),
  ]
    .filter(Boolean)
    .join('\n\n');
}

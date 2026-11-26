export type Copy = readonly [string, string];
export type Locale = 'ru' | 'en';
export const say = (value: Copy, lang: Locale) => value[lang === 'ru' ? 0 : 1];
export const money = (n: number, lang: Locale) =>
  n.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-GB') +
  (lang === 'ru' ? ' сом' : ' KGS');
export const volume = (ml: number, lang: Locale) =>
  ml + (lang === 'ru' ? ' мл' : ' ml');

export type DrinkId =
  | 'cappuccino'
  | 'flat-white'
  | 'latte'
  | 'americano'
  | 'mocha'
  | 'iced-latte'
  | 'espresso'
  | 'cold-brew'
  | 'matcha-latte'
  | 'cocoa'
  | 'cherry-mocha'
  | 'caramel-frappe'
  | 'peach-tea'
  | 'yuzu-lemonade'
  | 'raspberry-lime'
  | 'passion-mango'
  | 'cucumber-elderflower'
  | 'orange-bumble'
  | 'espresso-tonic'
  | 'pistachio-latte'
  | 'hibiscus-berry';
type Drink = {
  id: DrinkId;
  name: Copy;
  notes: Copy;
  detail: Copy;
  price: number;
  sizes: number[];
  sizePrices: number[];
  milk: boolean;
  foam: boolean;
  family?: 'lemonade' | 'tea';
  iced?: boolean;
  withoutCoffee?: boolean;
};
export const drinks: Drink[] = [
  {
    id: 'cherry-mocha',
    name: ['Вишнёвая мокка', 'Cherry mocha'],
    notes: ['Вишня · шоколад', 'Cherry · chocolate'],
    detail: [
      'Вишнёвое пюре, шоколад и молоко слоями. Сверху — эспрессо, взбитые сливки и вишня.',
      'Layers of sour cherry, chocolate and milk, finished with espresso, whipped cream and a cherry.',
    ],
    price: 290,
    sizes: [350, 450],
    sizePrices: [0, 45],
    milk: true,
    foam: false,
    iced: true,
  },
  {
    id: 'caramel-frappe',
    name: ['Карамельный фраппе', 'Caramel frappé'],
    notes: ['Карамель · сливки', 'Caramel · cream'],
    detail: [
      'Эспрессо и молоко взбиваем со льдом. Сверху добавляем сливки и ленту карамели.',
      'Espresso and milk blended with ice, topped with whipped cream and a ribbon of caramel.',
    ],
    price: 280,
    sizes: [350, 450],
    sizePrices: [0, 45],
    milk: true,
    foam: false,
    iced: true,
  },
  {
    id: 'peach-tea',
    family: 'tea',
    name: ['Персиковый чай', 'Peach iced tea'],
    notes: ['Персик · мята', 'Peach · mint'],
    detail: [
      'Охлаждённый чёрный чай, дольки персика и свежая мята. Подаём со льдом.',
      'Cold black tea, slices of peach and fresh mint, poured over ice.',
    ],
    price: 190,
    sizes: [350, 450],
    sizePrices: [0, 30],
    milk: false,
    foam: false,
    iced: true,
    withoutCoffee: true,
  },
  {
    id: 'cappuccino',
    name: ['Капучино', 'Cappuccino'],
    notes: ['Какао · фундук', 'Cocoa · hazelnut'],
    detail: [
      'Эспрессо с нотами какао под плотной шапкой молочной пены.',
      'Chocolate-toned espresso under a generous cap of steamed milk.',
    ],
    price: 200,
    sizes: [250, 350],
    sizePrices: [0, 35],
    milk: true,
    foam: true,
  },
  {
    id: 'flat-white',
    name: ['Флэт уайт', 'Flat white'],
    notes: ['Карамель · какао', 'Caramel · cocoa'],
    detail: [
      'Двойной эспрессо и тонкий слой микропены. Кофе ярко чувствуется с первого глотка.',
      'A double espresso with a fine layer of microfoam. A short, coffee-forward cup.',
    ],
    price: 220,
    sizes: [200, 300],
    sizePrices: [0, 40],
    milk: true,
    foam: true,
  },
  {
    id: 'latte',
    name: ['Латте', 'Latte'],
    notes: ['Топлёное молоко · ирис', 'Warm milk · toffee'],
    detail: [
      'Мягкий эспрессо и много тёплого молока с шелковистой текстурой.',
      'Mellow espresso with plenty of warm, silky steamed milk.',
    ],
    price: 220,
    sizes: [300, 400],
    sizePrices: [0, 40],
    milk: true,
    foam: true,
  },
  {
    id: 'americano',
    name: ['Американо', 'Americano'],
    notes: ['Тёмный шоколад · орех', 'Dark chocolate · nut'],
    detail: [
      'Эспрессо, раскрытый горячей водой. Чистый вкус и долгое ореховое послевкусие.',
      'Espresso opened up with hot water for a clean cup and a lingering nutty finish.',
    ],
    price: 150,
    sizes: [200, 300],
    sizePrices: [0, 25],
    milk: false,
    foam: false,
  },
  {
    id: 'mocha',
    name: ['Мокка', 'Mocha'],
    notes: ['Шоколад · сливки', 'Chocolate · cream'],
    detail: [
      'Тёмный шоколад растворяется в эспрессо, сверху ложится тонкая молочная пена.',
      'Dark chocolate melted into espresso, finished with steamed milk and delicate foam.',
    ],
    price: 250,
    sizes: [300, 400],
    sizePrices: [0, 45],
    milk: true,
    foam: true,
  },
  {
    id: 'iced-latte',
    name: ['Айс-латте', 'Iced latte'],
    notes: ['Лёд · карамель', 'Ice · caramel'],
    detail: [
      'Холодное молоко, крупный лёд и свежий эспрессо, налитый последним.',
      'Cold milk and clear ice, finished with a fresh shot of espresso.',
    ],
    price: 240,
    sizes: [350, 450],
    sizePrices: [0, 40],
    milk: true,
    foam: false,
    iced: true,
  },
  {
    id: 'espresso',
    name: ['Эспрессо', 'Espresso'],
    notes: ['Какао · сухофрукты', 'Cocoa · dried fruit'],
    detail: [
      'Короткая экстракция, плотное тело и золотистая крема. Можно выбрать двойную порцию.',
      'A short pull with a full body and golden crema. Choose a double for a longer cup.',
    ],
    price: 120,
    sizes: [40, 80],
    sizePrices: [0, 50],
    milk: false,
    foam: false,
  },
  {
    id: 'matcha-latte',
    family: 'tea',
    name: ['Матча-латте', 'Matcha latte'],
    notes: ['Матча · сливки', 'Matcha · cream'],
    detail: [
      'Мелко смолотый зелёный чай взбиваем с водой и добавляем тёплое молоко. Выберите молоко, пену и сладость.',
      'Finely milled green tea whisked with water, finished with warm milk. Choose the milk, foam and sweetness.',
    ],
    price: 260,
    sizes: [300, 400],
    sizePrices: [0, 45],
    milk: true,
    foam: true,
    withoutCoffee: true,
  },
  {
    id: 'cocoa',
    name: ['Какао', 'Hot chocolate'],
    notes: ['Тёмный шоколад · молоко', 'Dark chocolate · milk'],
    detail: [
      'Тёмный шоколад и какао растворяем в горячем молоке до гладкой, густой текстуры. Пена и добавки — по вашему вкусу.',
      'Dark chocolate and cocoa whisked into steamed milk until smooth and rich. Finish with your choice of foam and toppings.',
    ],
    price: 210,
    sizes: [250, 350],
    sizePrices: [0, 35],
    milk: true,
    foam: true,
    withoutCoffee: true,
  },
  {
    id: 'cold-brew',
    name: ['Колд брю', 'Cold brew'],
    notes: ['Какао · апельсин', 'Cocoa · orange'],
    detail: [
      'Заранее настаиваем бразильский кофе в холодной воде. Подаём со льдом. Количество льда, сладость и добавки можно изменить.',
      'Brazilian coffee steeped slowly in cold water and served over ice. Choose how much ice, sweetness and flavour to add.',
    ],
    price: 230,
    sizes: [300, 450],
    sizePrices: [0, 45],
    milk: false,
    foam: false,
    iced: true,
  },
  {
    id: 'yuzu-lemonade',
    name: ['Лимонад юдзу', 'Yuzu lemonade'],
    notes: ['Юдзу · лимон · сода', 'Yuzu · lemon · soda'],
    detail: [
      'Сок юдзу и лимонная цедра придают лимонаду терпкий цитрусовый аромат. Подаём со льдом и тонким кружком лимона.',
      'Yuzu juice and lemon zest lend this lemonade its citrus perfume. Served over ice with a thin lemon wheel.',
    ],
    price: 230,
    sizes: [350, 450],
    sizePrices: [0, 40],
    milk: false,
    foam: false,
    iced: true,
    withoutCoffee: true,
    family: 'lemonade',
  },
  {
    id: 'raspberry-lime',
    name: ['Малина и лайм', 'Raspberry & lime'],
    notes: ['Малина · лайм · сода', 'Raspberry · lime · soda'],
    detail: [
      'Размятая малина на дне, свежий лайм и прозрачная газировка сверху. Лимонад можно перемешать, чтобы ягоды распределились по стакану.',
      'Crushed raspberries on the bottom, fresh lime and a clear sparkling finish. Stir to carry the berries through the lemonade.',
    ],
    price: 220,
    sizes: [350, 450],
    sizePrices: [0, 40],
    milk: false,
    foam: false,
    iced: true,
    withoutCoffee: true,
    family: 'lemonade',
  },
  {
    id: 'passion-mango',
    name: ['Манго-маракуйя', 'Mango & passion fruit'],
    notes: ['Манго · маракуйя · сода', 'Mango · passion fruit · soda'],
    detail: [
      'Мякоть маракуйи с хрустящими семенами смешиваем с пюре манго. Лёд и минеральная вода смягчают сладость лимонада.',
      'Passion fruit pulp and crisp seeds meet mango purée. Ice and mineral water balance the sweetness of the lemonade.',
    ],
    price: 250,
    sizes: [350, 450],
    sizePrices: [0, 45],
    milk: false,
    foam: false,
    iced: true,
    withoutCoffee: true,
    family: 'lemonade',
  },
  {
    id: 'cucumber-elderflower',
    name: ['Бузина и огурец', 'Elderflower & cucumber'],
    notes: ['Бузина · огурец · сода', 'Elderflower · cucumber · soda'],
    detail: [
      'Цветочный кордиал из бузины, вода и лёд. Длинная лента свежего огурца даёт лимонаду прохладный травяной аромат.',
      'Elderflower cordial, water and ice. A long cucumber ribbon gives this lemonade a cool, herbal finish.',
    ],
    price: 220,
    sizes: [350, 450],
    sizePrices: [0, 40],
    milk: false,
    foam: false,
    iced: true,
    withoutCoffee: true,
    family: 'lemonade',
  },
  {
    id: 'orange-bumble',
    name: ['Апельсиновый бамбл', 'Orange bumble'],
    notes: ['Апельсин · эспрессо · карамель', 'Orange · espresso · caramel'],
    detail: [
      'Наливаем апельсиновый сок на лёд, добавляем немного карамели и завершаем двойным эспрессо. Перед первым глотком слои можно перемешать.',
      'Orange juice over ice with a little caramel, finished with a double espresso. Stir the layers together before the first sip.',
    ],
    price: 270,
    sizes: [350, 450],
    sizePrices: [0, 45],
    milk: false,
    foam: false,
    iced: true,
  },
  {
    id: 'espresso-tonic',
    name: ['Эспрессо-тоник', 'Espresso tonic'],
    notes: ['Тоник · грейпфрут · эспрессо', 'Tonic · grapefruit · espresso'],
    detail: [
      'Лёд, холодный тоник и эспрессо образуют два прозрачных слоя. Полоска грейпфрутовой цедры подчёркивает лёгкую горчинку тоника.',
      'Ice, chilled tonic and espresso form two clear layers. A strip of grapefruit peel brings out the gentle bitterness of the tonic.',
    ],
    price: 250,
    sizes: [350, 450],
    sizePrices: [0, 40],
    milk: false,
    foam: false,
    iced: true,
  },
  {
    id: 'pistachio-latte',
    name: ['Фисташковый латте', 'Pistachio latte'],
    notes: ['Фисташка · эспрессо · молоко', 'Pistachio · espresso · milk'],
    detail: [
      'Эспрессо с фисташковой пастой и взбитым молоком. Завершаем тонкой молочной пеной и дроблёной фисташкой. Содержит фисташки.',
      'Espresso with pistachio paste and steamed milk, finished with microfoam and crushed pistachios. Contains pistachios.',
    ],
    price: 270,
    sizes: [300, 400],
    sizePrices: [0, 45],
    milk: true,
    foam: true,
  },
  {
    id: 'hibiscus-berry',
    name: ['Ягодный каркаде', 'Berry hibiscus'],
    notes: ['Каркаде · чёрная смородина', 'Hibiscus · blackcurrant'],
    detail: [
      'Охлаждённый настой гибискуса с чёрной смородиной. Глубокий рубиновый цвет, ягодная кислинка и крупный лёд.',
      'Chilled hibiscus infused with blackcurrants. Deep ruby colour, bright berry acidity and large pieces of ice.',
    ],
    price: 190,
    sizes: [350, 450],
    sizePrices: [0, 30],
    milk: false,
    foam: false,
    iced: true,
    withoutCoffee: true,
    family: 'tea',
  },
];
export const drinkById = Object.fromEntries(
  drinks.map((d) => [d.id, d]),
) as Record<DrinkId, Drink>;

export const bakery = {
  'almond-croissant': {
    id: 'almond-croissant',
    name: ['Миндальный круассан', 'Almond croissant'],
    notes: ['Миндаль · сливочное масло', 'Almond · butter'],
    detail: [
      'Слоёное тесто с миндальным кремом и поджаренными лепестками миндаля.',
      'Flaky butter pastry filled with almond cream and finished with toasted sliced almonds.',
    ],
    ingredients: [
      'Пшеничная мука, сливочное масло, миндаль, сахар, молоко, яйцо, дрожжи, соль.',
      'Wheat flour, butter, almonds, sugar, milk, egg, yeast and salt.',
    ],
    allergens: [
      'Пшеница, молоко, яйца, миндаль.',
      'Wheat, milk, eggs and almonds.',
    ],
    grams: 95,
    price: 175,
  },
  'chocolate-cookie': {
    id: 'chocolate-cookie',
    name: ['Шоколадное печенье', 'Chocolate cookie'],
    notes: ['Тёмный шоколад · соль', 'Dark chocolate · salt'],
    detail: [
      'Мягкая середина, хрустящий край и крупные кусочки тёмного шоколада с морской солью.',
      'A soft centre, a crisp edge and generous chunks of dark chocolate with sea salt.',
    ],
    ingredients: [
      'Пшеничная мука, шоколад, сливочное масло, тростниковый сахар, яйцо, разрыхлитель, соль.',
      'Wheat flour, dark chocolate, butter, brown sugar, egg, baking powder and sea salt.',
    ],
    allergens: ['Пшеница, молоко, яйца, соя.', 'Wheat, milk, eggs and soy.'],
    grams: 80,
    price: 145,
  },
} as const;
export type BakeryId = keyof typeof bakery;
export type BakerySelection = { bakery: BakeryId };
export type MenuSelection = Recipe | BakerySelection;
export const isBakery = (item: MenuSelection): item is BakerySelection =>
  'bakery' in item;
export const productFor = (item: MenuSelection) =>
  isBakery(item) ? bakery[item.bakery] : drinkById[item.drink];
export const serving = (item: MenuSelection, lang: Locale) =>
  isBakery(item)
    ? bakery[item.bakery].grams + (lang === 'ru' ? ' г' : ' g')
    : volume(item.ml, lang);
export function validSelection(value: unknown): value is MenuSelection {
  if (value && typeof value === 'object' && 'bakery' in value)
    return (
      typeof value.bakery === 'string' && Object.hasOwn(bakery, value.bakery)
    );
  return validRecipe(value);
}

type Option = { id: string; name: Copy; add: number };
type Group = { name: Copy; image: string; options: Option[] };
export const groups = {
  beans: {
    name: ['Зерно', 'Beans'],
    image: 'beans',
    options: [
      { id: 'house', name: ['Бразилия', 'Brazil'], add: 0 },
      { id: 'fruit', name: ['Эфиопия', 'Ethiopia'], add: 25 },
      { id: 'decaf', name: ['Декаф', 'Decaf'], add: 30 },
    ],
  },
  milk: {
    name: ['Молоко', 'Milk'],
    image: 'milk',
    options: [
      { id: 'whole', name: ['Цельное', 'Whole milk'], add: 0 },
      { id: 'oat', name: ['Овсяное', 'Oat milk'], add: 40 },
      { id: 'lactose-free', name: ['Без лактозы', 'Lactose-free'], add: 30 },
    ],
  },
  foam: {
    name: ['Пена', 'Foam'],
    image: 'foam',
    options: [
      { id: 'silky', name: ['Шёлковая', 'Silky'], add: 0 },
      { id: 'cloud', name: ['Пышная', 'Cloud'], add: 0 },
      { id: 'light', name: ['Тонкая', 'Light'], add: 0 },
    ],
  },
  syrup: {
    name: ['Добавки', 'Toppings'],
    image: 'extras',
    options: [
      { id: 'none', name: ['Без добавок', 'No extras'], add: 0 },
      { id: 'vanilla', name: ['Ваниль', 'Vanilla'], add: 25 },
      { id: 'caramel', name: ['Карамель', 'Caramel'], add: 25 },
      { id: 'cinnamon', name: ['Корица', 'Cinnamon'], add: 10 },
      {
        id: 'chocolate',
        name: ['Шоколадная крошка', 'Chocolate flakes'],
        add: 25,
      },
    ],
  },
  shot: {
    name: ['Эспрессо', 'Espresso'],
    image: 'shot',
    options: [
      { id: 'standard', name: ['По рецепту', 'Standard'], add: 0 },
      { id: 'extra', name: ['Ещё шот', 'Extra shot'], add: 45 },
    ],
  },
  latteArt: {
    name: ['Латте-арт', 'Latte art'],
    image: 'latte-art',
    options: [
      { id: 'plain', name: ['Без рисунка', 'Plain'], add: 0 },
      { id: 'heart', name: ['Сердце', 'Heart'], add: 0 },
      { id: 'rosetta', name: ['Розетта', 'Rosetta'], add: 0 },
      { id: 'tulip', name: ['Тюльпан', 'Tulip'], add: 0 },
    ],
  },
  ice: {
    name: ['Лёд', 'Ice'],
    image: 'ice',
    options: [
      { id: 'regular', name: ['Обычный лёд', 'Regular ice'], add: 0 },
      { id: 'less', name: ['Меньше льда', 'Light ice'], add: 0 },
      { id: 'no-ice', name: ['Без льда', 'No ice'], add: 0 },
    ],
  },
  sugar: {
    name: ['Сахар', 'Sugar'],
    image: 'sugar',
    options: [
      { id: 'unsweetened', name: ['Без сахара', 'Unsweetened'], add: 0 },
      { id: 'one', name: ['Один кубик', 'One cube'], add: 0 },
      { id: 'two', name: ['Два кубика', 'Two cubes'], add: 0 },
    ],
  },
  water: {
    name: ['Вода', 'Water'],
    image: 'water',
    options: [
      { id: 'sparkling', name: ['Газированная', 'Sparkling'], add: 0 },
      { id: 'still', name: ['Без газа', 'Still'], add: 0 },
    ],
  },
  garnish: {
    name: ['Гарнир', 'Garnish'],
    image: 'garnish',
    options: [
      { id: 'house-garnish', name: ['По рецепту', 'House garnish'], add: 0 },
      { id: 'mint', name: ['Свежая мята', 'Fresh mint'], add: 10 },
      { id: 'no-garnish', name: ['Без гарнира', 'No garnish'], add: 0 },
    ],
  },
} satisfies Record<string, Group>;
export type GroupId = keyof typeof groups;
export const groupIds = Object.keys(groups) as GroupId[];
const defaults = {
  latteArt: 'plain',
  sugar: 'unsweetened',
  ice: 'regular',
  water: 'sparkling',
  garnish: 'house-garnish',
} as const;
type OptionalGroup = keyof typeof defaults;
export type Recipe = { drink: DrinkId; ml: number } & Record<
  Exclude<GroupId, OptionalGroup>,
  string
> &
  Partial<Record<OptionalGroup, string>>;
// Keep recipes saved before the later ingredient panels readable.
export function selection(g: GroupId, r: Recipe) {
  return (
    r[g] ?? (Object.hasOwn(defaults, g) ? defaults[g as OptionalGroup] : '')
  );
}
export function activeGroups(id: DrinkId) {
  const d = drinkById[id];
  return groupIds.filter(
    (g) =>
      (g !== 'water' || d.family === 'lemonade') &&
      (g !== 'garnish' || d.family === 'lemonade' || id === 'hibiscus-berry') &&
      (g !== 'syrup' || (d.family !== 'lemonade' && id !== 'hibiscus-berry')) &&
      (g !== 'milk' || d.milk) &&
      (g !== 'foam' || d.foam) &&
      (g !== 'latteArt' || d.foam) &&
      (g !== 'ice' || !!d.iced) &&
      (g !== 'beans' || (!d.withoutCoffee && id !== 'cold-brew')) &&
      (g !== 'shot' ||
        (!d.withoutCoffee && id !== 'espresso' && id !== 'cold-brew')),
  );
}
export function classic(id: DrinkId): Recipe {
  return {
    drink: id,
    ml: drinkById[id].sizes[0],
    beans: 'house',
    milk: 'whole',
    foam: id === 'flat-white' ? 'light' : 'silky',
    syrup: 'none',
    shot: 'standard',
  };
}
export function validRecipe(value: unknown): value is Recipe {
  if (!value || typeof value !== 'object') return false;
  const r = value as Recipe;
  return (
    Object.hasOwn(drinkById, r.drink) &&
    drinkById[r.drink].sizes.includes(r.ml) &&
    groupIds.every((g) =>
      groups[g].options.some((i) => i.id === selection(g, r)),
    )
  );
}
export const optionFor = (g: GroupId, r: Recipe) =>
  groups[g].options.find((opt) => opt.id === selection(g, r))!;
export const recipeKey = (r: MenuSelection) =>
  isBakery(r)
    ? 'bakery/' + r.bakery
    : [
        r.drink,
        r.ml,
        ...activeGroups(r.drink)
          .filter((g) => g !== 'latteArt' || selection(g, r) !== 'plain')
          .filter((g) => g !== 'sugar' || selection(g, r) !== 'unsweetened')
          .filter((g) => g !== 'ice' || selection(g, r) !== 'regular')
          .map((g) => selection(g, r)),
      ].join('/');
export function price(r: MenuSelection) {
  if (isBakery(r)) return bakery[r.bakery].price;
  const d = drinkById[r.drink];
  return (
    d.price +
    d.sizePrices[d.sizes.indexOf(r.ml)] +
    activeGroups(r.drink).reduce((sum, g) => sum + optionFor(g, r).add, 0)
  );
}
export function recipeParts(r: MenuSelection, lang: Locale) {
  if (isBakery(r))
    return [serving(r, lang), lang === 'ru' ? '1 шт.' : '1 piece'];
  const names: Partial<Record<string, Copy>> = {
    sparkling: ['Газированная вода', 'Sparkling water'],
    still: ['Вода без газа', 'Still water'],
    'house-garnish': ['Гарнир по рецепту', 'House garnish'],
    whole: ['Цельное молоко', 'Whole milk'],
    oat: ['Овсяное молоко', 'Oat milk'],
    'lactose-free': ['Безлактозное молоко', 'Lactose-free milk'],
    silky: ['Шёлковая пена', 'Silky foam'],
    cloud: ['Пышная пена', 'Cloud foam'],
    light: ['Тонкая пена', 'Light foam'],
    vanilla: ['Ванильный сироп', 'Vanilla syrup'],
    caramel: ['Карамельный сироп', 'Caramel syrup'],
    one: ['Кубик сахара', 'One sugar cube'],
    two: ['Два кубика сахара', 'Two sugar cubes'],
    heart: ['Рисунок-сердце', 'Heart latte art'],
    rosetta: ['Розетта', 'Rosetta latte art'],
    tulip: ['Тюльпан', 'Tulip latte art'],
  };
  const parts = activeGroups(r.drink)
    .filter((g) => g !== 'shot' || r.shot === 'extra')
    .filter((g) => g !== 'syrup' || r.syrup !== 'none')
    .filter((g) => g !== 'latteArt' || selection(g, r) !== 'plain')
    .filter((g) => g !== 'sugar' || selection(g, r) !== 'unsweetened');
  return [
    volume(r.ml, lang),
    ...parts.map((g) =>
      say(names[selection(g, r)] ?? optionFor(g, r).name, lang),
    ),
  ];
}
export const specials = [
  { recipe: classic('cappuccino') },
  { recipe: classic('yuzu-lemonade') },
  { recipe: classic('espresso') },
  { recipe: classic('orange-bumble') },
  { recipe: { ...classic('flat-white'), beans: 'fruit' } },
  { recipe: { ...classic('iced-latte'), milk: 'oat' } },
  { recipe: classic('raspberry-lime') },
];
export const art = (id: string, large = false) =>
  '/takt-coffee/press/' + id + (large ? '-800' : '-320') + '.webp?v=paper2';

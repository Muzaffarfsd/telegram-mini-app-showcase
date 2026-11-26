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
  | 'espresso';
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
  iced?: boolean;
};
export const drinks: Drink[] = [
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
];
export const drinkById = Object.fromEntries(
  drinks.map((d) => [d.id, d]),
) as Record<DrinkId, Drink>;

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
  sugar: {
    name: ['Сахар', 'Sugar'],
    image: 'sugar',
    options: [
      { id: 'unsweetened', name: ['Без сахара', 'Unsweetened'], add: 0 },
      { id: 'one', name: ['Один кубик', 'One cube'], add: 0 },
      { id: 'two', name: ['Два кубика', 'Two cubes'], add: 0 },
    ],
  },
} satisfies Record<string, Group>;
export type GroupId = keyof typeof groups;
export const groupIds = Object.keys(groups) as GroupId[];
export type Recipe = { drink: DrinkId; ml: number } & Record<
  Exclude<GroupId, 'latteArt' | 'sugar'>,
  string
> &
  Partial<Record<'latteArt' | 'sugar', string>>;
// Recipes saved with the first menu used its five original fields.
export function selection(g: GroupId, r: Recipe) {
  return (
    r[g] ?? (g === 'latteArt' ? 'plain' : g === 'sugar' ? 'unsweetened' : '')
  );
}
export function activeGroups(id: DrinkId) {
  const d = drinkById[id];
  return groupIds.filter(
    (g) =>
      (g !== 'milk' || d.milk) &&
      (g !== 'foam' || d.foam) &&
      (g !== 'latteArt' || d.foam) &&
      (g !== 'shot' || id !== 'espresso'),
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
export const recipeKey = (r: Recipe) =>
  [
    r.drink,
    r.ml,
    ...activeGroups(r.drink)
      .filter((g) => g !== 'latteArt' || selection(g, r) !== 'plain')
      .filter((g) => g !== 'sugar' || selection(g, r) !== 'unsweetened')
      .map((g) => selection(g, r)),
  ].join('/');
export function price(r: Recipe) {
  const d = drinkById[r.drink];
  return (
    d.price +
    d.sizePrices[d.sizes.indexOf(r.ml)] +
    activeGroups(r.drink).reduce((sum, g) => sum + optionFor(g, r).add, 0)
  );
}
export function recipeParts(r: Recipe, lang: Locale) {
  const names: Partial<Record<string, Copy>> = {
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
  { recipe: classic('espresso') },
  { recipe: { ...classic('flat-white'), beans: 'fruit' } },
  { recipe: { ...classic('iced-latte'), milk: 'oat' } },
];
export const art = (id: string, large = false) =>
  '/takt-coffee/press/' + id + (large ? '-800' : '-320') + '.webp';

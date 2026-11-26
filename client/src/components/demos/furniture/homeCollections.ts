import type { FurnitureProduct } from './storeCatalog';
import { categoriesEn } from './catalogSearch';

type Shape = 'wide' | 'upright' | 'pendant' | 'rug';
interface CollectionEdit {
  category: string;
  title: string;
  selection: string;
  cover: string;
  shape: Shape;
}

const edits: CollectionEdit[] = [
  {
    category: 'Диваны',
    title: 'Sofas',
    selection: 'Sofa selection',
    cover: 'abo-b07p5lmn2c',
    shape: 'wide',
  },
  {
    category: 'Кресла',
    title: 'Armchairs',
    selection: 'Armchair selection',
    cover: 'rivet-adrienne-chair',
    shape: 'upright',
  },
  {
    category: 'Стулья',
    title: 'Chairs',
    selection: 'Chair selection',
    cover: 'abo-b0857jw1b9',
    shape: 'upright',
  },
  {
    category: 'Столы',
    title: 'Side tables',
    selection: 'Coffee and side tables',
    cover: 'rivet-round-coffee-table',
    shape: 'wide',
  },
  {
    category: 'Хранение',
    title: 'Storage',
    selection: 'Storage pieces',
    cover: 'abo-b07tr659g8',
    shape: 'wide',
  },
  {
    category: 'Свет',
    title: 'Lighting',
    selection: 'Lighting selection',
    cover: 'abo-b07374m9zw',
    shape: 'pendant',
  },
  {
    category: 'Обеденные столы',
    title: 'Dining',
    selection: 'Dining tables',
    cover: 'abo-b07b78lzqc',
    shape: 'wide',
  },
  {
    category: 'Кровати',
    title: 'Beds',
    selection: 'For the bedroom',
    cover: 'abo-b07k7k25zl',
    shape: 'wide',
  },
  {
    category: 'Банкетки и пуфы',
    title: 'Benches',
    selection: 'Benches and ottomans',
    cover: 'abo-b07qj1x2j4',
    shape: 'wide',
  },
  {
    category: 'Ковры',
    title: 'Rugs',
    selection: 'Rug selection',
    cover: 'abo-b07b4wkmyk',
    shape: 'rug',
  },
  {
    category: 'Рабочие столы',
    title: 'Desks',
    selection: 'Writing desks',
    cover: 'abo-b07jxxr83f',
    shape: 'wide',
  },
];

export function homeCollections(products: readonly FurnitureProduct[]) {
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const unknown = categories.filter((key) => !edits.some((edit) => edit.category === key));
  const entries: CollectionEdit[] = [
    ...edits,
    ...unknown.map((category) => {
      const label = categoriesEn[category] || category;
      return { category, title: label, selection: label, cover: '', shape: 'wide' as const };
    }),
  ];
  return entries.flatMap((edit) => {
    const pieces = products.filter((p) => p.category === edit.category);
    if (!pieces.length) return [];
    const hero = pieces.find((p) => p.id === edit.cover) || pieces[0];
    return [{ ...edit, hero, pieces }];
  });
}

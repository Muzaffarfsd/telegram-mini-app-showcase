import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { local, sampleById, type Copy } from './samples';

export type Lookbook = 'indigo' | 'tea' | 'dusk';
type Edit = {
  photo: Lookbook;
  title: Copy;
  text: Copy;
  products: { id: string; x: number; y: number }[];
};
const edits: Edit[] = [
  {
    photo: 'indigo',
    title: ['Город в индиго', 'City in indigo'],
    text: [
      'Кобальтовая сумка, светлые кроссовки и длинное пальто. Три вещи для одного городского маршрута.',
      'A cobalt crossbody, pale trainers and a long coat for a day in the city.',
    ],
    products: [
      { id: 'fold', x: 25, y: 59 },
      { id: 'sneaker', x: 72, y: 72 },
      { id: 'v2-coat', x: 64, y: 32 },
    ],
  },
  {
    photo: 'tea',
    title: ['Чайная пауза', 'A pause for tea'],
    text: [
      'Терракота рядом с холодной глазурью. Посмотрите, как кромки, крышки и объёмы сочетаются на одном столе.',
      'Terracotta beside cool glaze. Explore how the rims, lids and volumes work together on one table.',
    ],
    products: [
      { id: 'clay', x: 27, y: 64 },
      { id: 'home', x: 80, y: 32 },
      { id: 'v2-teaware', x: 62, y: 66 },
    ],
  },
  {
    photo: 'dusk',
    title: ['После заката', 'After dusk'],
    text: [
      'Сливовый полумесяц, серебристый изгиб и платок с синей волной. Небольшие вещи, собранные вокруг одной линии.',
      'A plum crescent bag, folded silver forms and a scarf with an indigo wave. Three accessories with a shared curve.',
    ],
    products: [
      { id: 'v2-bag-burgundy', x: 24, y: 49 },
      { id: 'v2-scarf', x: 72, y: 34 },
      { id: 'v2-earrings', x: 69, y: 73 },
    ],
  },
];

export function EditorialPhoto({
  name,
  alt,
  eager = false,
  className = '',
  sizes = '(min-width: 760px) 680px, 100vw',
}: {
  name: Edit['photo'] | 'voyage' | 'inspection';
  alt: string;
  eager?: boolean;
  className?: string;
  sizes?: string;
}) {
  const base = '/china-buyer/atelier/' + name;
  return (
    <img
      className={className}
      src={base + '-640.webp'}
      srcSet={base + '-640.webp 640w, ' + base + '-1280.webp 1280w'}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      alt={alt}
      draggable={false}
    />
  );
}

export function AtelierJournal({
  ru,
  open,
  begin,
  story,
  choose,
}: {
  story?: Lookbook;
  choose: (story: Lookbook) => void;
  ru: boolean;
  open: (id: string) => void;
  begin: (ids: string[]) => void;
}) {
  const edit = edits.find((s) => s.photo === story) ?? edits[0];
  const title = local(edit.title, ru);
  return (
    <section
      className="yb-lookbook"
      id="yb-lookbook"
      aria-labelledby="yb-lookbook-title"
    >
      <div className="yb-atelier-heading">
        <span lang="zh-Hans" aria-hidden="true" className="yb-script">
          图鉴
        </span>
        <h2 id="yb-lookbook-title" tabIndex={-1}>
          {ru ? 'Лукбук бюро' : 'The bureau lookbook'}
        </h2>
      </div>
      <div
        className="yb-edit-tabs"
        role="group"
        aria-label={ru ? 'Съёмки лукбука' : 'Lookbook stories'}
      >
        {edits.map((s) => (
          <button
            type="button"
            key={s.photo}
            aria-pressed={s.photo === edit.photo}
            onClick={() => choose(s.photo)}
          >
            {local(s.title, ru)}
          </button>
        ))}
      </div>
      <div className="yb-edit-spread">
        <div className="yb-edit-photo">
          <EditorialPhoto name={edit.photo} alt={local(edit.text, ru)} />
          {edit.products.map(({ id, x, y }) => {
            const sample = sampleById(id)!;
            return (
              <button
                type="button"
                key={id}
                className="yb-shop-point"
                style={{ left: x + '%', top: y + '%' }}
                onClick={() => open(id)}
                aria-label={
                  (ru ? 'Рассмотреть в кадре · ' : 'Inspect in the scene · ') +
                  local(sample.title, ru)
                }
              >
                <Plus size={15} aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <div className="yb-edit-legend">
          <h3>{title}</h3>
          <p>{local(edit.text, ru)}</p>
          <ul>
            {edit.products.map(({ id }) => {
              const item = sampleById(id)!;
              return (
                <li key={id}>
                  <button type="button" onClick={() => open(id)}>
                    <img src={item.image} loading="lazy" alt="" />
                    <span>{local(item.title, ru)}</span>
                    <ArrowUpRight size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="yb-primary"
            onClick={() => begin(edit.products.map((p) => p.id))}
          >
            {ru ? 'Запросить подборку' : 'Request the edit'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

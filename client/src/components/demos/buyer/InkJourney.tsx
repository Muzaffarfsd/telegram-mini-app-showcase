import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import type { Copy } from './samples';

const artwork = '/china-buyer/ink/';
const chapters = [
  {
    mark: '寻源',
    short: ['Поиск', 'Sourcing'],
    title: ['Ваш байер в Китае', 'Your buyer in China'],
    body: [
      'Покажите, что хотите купить. Байер найдёт поставщика и уточнит цену с доставкой в ваш город.',
      'Show what you want to buy. Your buyer finds a supplier and asks for a quote including delivery to your city.',
    ],
    alt: [
      'Лаковая лодка-дракон везёт посылки по реке среди голубых гор.',
      'A lacquered dragon boat carries parcels past misty blue mountains.',
    ],
  },
  {
    mark: '验样',
    short: ['Проверка', 'Inspection'],
    title: ['Проверка образца', 'Inspect the sample'],
    body: [
      'Попросите байера проверить размер, материал и швы. Фотографии образца помогут решить, подходит ли вам партия.',
      'Ask your buyer to check dimensions, materials and stitching. Sample photographs help you decide whether to order a batch.',
    ],
    alt: [
      'На рабочем столе байер проверяет строчку на красной сумке.',
      'At a worktable a buyer inspects the stitching of a red sample bag.',
    ],
  },
  {
    mark: '询价',
    short: ['Расчёт', 'Quote'],
    title: ['Цена с доставкой', 'The delivered price'],
    body: [
      'Сравните ответы поставщиков. Сложите стоимость товара, доставку и услуги байера, прежде чем согласовать выкуп.',
      'Compare supplier quotes. Add the cost of the goods, freight and your buyer’s fee before approving the purchase.',
    ],
    alt: [
      'Вид сверху на лодку с грузом у пристани на голубой реке.',
      'An overhead view of a cargo boat near a wharf on a blue river.',
    ],
  },
] satisfies { mark: string; short: Copy; title: Copy; body: Copy; alt: Copy }[];

export function InkArt({
  name,
  className,
  alt = '',
  eager = false,
}: {
  name: 'landscape' | 'dragon' | 'worktable' | 'river';
  className?: string;
  alt?: string;
  eager?: boolean;
}) {
  return (
    <img
      className={className}
      src={artwork + name + '-640.webp'}
      srcSet={
        artwork +
        name +
        '-640.webp 640w, ' +
        artwork +
        name +
        '-1280.webp 1280w'
      }
      sizes="(min-width: 760px) 570px, 100vw"
      alt={alt}
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'low'}
      decoding="async"
    />
  );
}

export function InkHeading({
  mark,
  title,
  children,
}: {
  mark: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="yb-ink-heading">
      <span className="yb-script" aria-hidden="true" lang="zh-Hans">
        {mark}
      </span>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export function InkJourney({
  ru,
  children,
}: {
  ru: boolean;
  children: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const origin = useRef<{ id: number; x: number; y: number } | null>(null);
  const language = ru ? 0 : 1;
  const chapter = chapters[index];
  function advance(delta: number) {
    setIndex(
      (current) => (current + delta + chapters.length) % chapters.length,
    );
  }
  function onDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    origin.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onUp(event: PointerEvent<HTMLDivElement>) {
    const start = origin.current;
    origin.current = null;
    if (!start || event.pointerId !== start.id) return;
    const dx = event.clientX - start.x,
      dy = event.clientY - start.y;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.35)
      advance(dx < 0 ? 1 : -1);
  }
  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      advance(event.key === 'ArrowRight' ? 1 : -1);
    }
  }
  return (
    <section
      className="yb-journey"
      aria-label={ru ? 'Путь закупки' : 'The sourcing journey'}
      aria-roledescription={ru ? 'Карусель' : 'Carousel'}
    >
      <div
        className={'yb-journey-art yb-journey-art--' + index}
        tabIndex={0}
        role="group"
        aria-label={chapter.alt[language]}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => {
          origin.current = null;
        }}
      >
        <InkArt name="landscape" className="yb-paint-mountains" eager />
        <InkArt
          name="dragon"
          className={'yb-paint-dragon' + (index === 0 ? '' : ' is-away')}
          eager
        />
        <InkArt
          name="worktable"
          className={'yb-paint-scene' + (index === 1 ? '' : ' is-away')}
        />
        <InkArt
          name="river"
          className={'yb-paint-scene' + (index === 2 ? '' : ' is-away')}
        />
        <span className="yb-chapter-mark" aria-hidden="true" lang="zh-Hans">
          {chapter.mark}
        </span>
      </div>
      <div className="yb-journey-intro">
        <div className="yb-chapter-copy" aria-live="polite" aria-atomic="true">
          {chapters.map((entry, i) => (
            <div
              key={entry.mark}
              aria-hidden={i !== index}
              className="yb-copy-panel"
            >
              {i === index ? (
                <h1>{entry.title[language]}</h1>
              ) : (
                <div className="yb-chapter-title">{entry.title[language]}</div>
              )}
              <p>{entry.body[language]}</p>
            </div>
          ))}
        </div>
        <div className="yb-chapter-controls">
          <div
            className="yb-chapter-tabs"
            role="group"
            aria-label={ru ? 'Этапы закупки' : 'Sourcing steps'}
          >
            {chapters.map((entry, i) => (
              <button
                type="button"
                key={entry.mark}
                aria-label={
                  (ru ? 'Показать этап «' : 'Show step “') +
                  entry.short[language] +
                  (ru ? '»' : '”')
                }
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
              >
                <span />
              </button>
            ))}
          </div>
          <div className="yb-chapter-arrows">
            {index > 0 && (
              <button
                type="button"
                className="yb-prev-chapter"
                aria-label={ru ? 'Предыдущий этап' : 'Previous step'}
                onClick={() => advance(-1)}
              >
                <ChevronLeft size={19} />
              </button>
            )}
            <button
              type="button"
              className="yb-next-chapter"
              aria-label={ru ? 'Следующий этап' : 'Next step'}
              onClick={() => advance(1)}
            >
              <ChevronRight size={23} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

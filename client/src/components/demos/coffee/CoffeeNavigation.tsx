import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, House, ShoppingBag, UserRound } from 'lucide-react';
import { DemoHomeButton } from '../../DemoHomeButton';
import { say, type Locale } from './menu';

const tabs = [
  { id: 'home', label: ['Главная', 'Home'], icon: House },
  { id: 'menu', label: ['Каталог', 'Menu'], icon: BookOpen },
  { id: 'bag', label: ['Корзина', 'Bag'], icon: ShoppingBag },
  { id: 'profile', label: ['Профиль', 'Profile'], icon: UserRound },
] as const;
export type CoffeeTab = (typeof tabs)[number]['id'];
export const isCoffeeTab = (s: string): s is CoffeeTab =>
  tabs.some((t) => t.id === s);
export function CoffeeNavigation({
  lang,
  active,
  count,
  select,
}: {
  lang: Locale;
  active: CoffeeTab;
  count: number;
  select: (t: CoffeeTab) => void;
}) {
  const touch = useRef<{
    id: number;
    x: number;
    y: number;
    button: HTMLButtonElement;
  } | null>(null);
  const activated = useRef<HTMLButtonElement | null>(null);
  return createPortal(
    <nav
      onPointerDown={(event) => {
        activated.current = null;
        const button =
          event.target instanceof Element
            ? event.target.closest('button')
            : null;
        touch.current =
          event.isPrimary && event.pointerType === 'touch' && button
            ? {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                button,
              }
            : null;
      }}
      onPointerMove={(event) => {
        const start = touch.current;
        if (
          start?.id === event.pointerId &&
          Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8
        )
          touch.current = null;
      }}
      onPointerCancel={() => {
        touch.current = null;
      }}
      onPointerUp={(event) => {
        const start = touch.current;
        touch.current = null;
        if (!start || event.pointerId !== start.id) return;
        const rect = start.button.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          return;
        // Native momentum scrolling sometimes suppresses the compatibility click on the next tab tap.
        activated.current = start.button;
        start.button.click();
      }}
      onClickCapture={(event) => {
        if (
          event.detail &&
          activated.current &&
          event.target instanceof Node &&
          activated.current.contains(event.target)
        ) {
          event.preventDefault();
          event.stopPropagation();
          activated.current = null;
        }
      }}
      className="tk-dock"
      lang={lang}
      aria-label={
        lang === 'ru' ? 'Нижняя навигация кофейни' : 'Coffee shop tabs'
      }
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const name = say(label, lang);
        return (
          <button
            type="button"
            key={id}
            data-tab={id}
            aria-label={name + (id === 'bag' && count ? ' · ' + count : '')}
            aria-current={id === active ? 'page' : undefined}
            onClick={() => select(id)}
          >
            <span className="tk-dock-icon">
              <Icon size={21} aria-hidden="true" />
              {id === 'bag' && count > 0 && (
                <b aria-hidden="true">{count > 99 ? '99+' : count}</b>
              )}
            </span>
            <span className="tk-dock-label">{name}</span>
          </button>
        );
      })}
      <DemoHomeButton color="#242320" />
    </nav>,
    document.body,
  );
}

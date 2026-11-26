import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { StoreNavigation, type StoreTab } from '../../StoreNavigation';
import type { Locale } from './menu';

export type CoffeeTab = StoreTab;
export const isCoffeeTab = (s: string): s is CoffeeTab =>
  ['home', 'menu', 'bag', 'profile'].includes(s);
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
    <div
      className="coffee-navigation-portal"
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
    >
      <StoreNavigation
        className="tk-dock"
        lang={lang}
        active={active}
        count={count}
        select={select}
      />
    </div>,
    document.body,
  );
}

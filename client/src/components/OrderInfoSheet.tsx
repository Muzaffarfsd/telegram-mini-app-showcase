import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import './OrderInfoSheet.css';

type Props = {
  ru: boolean;
  kind: 'template' | 'feature' | 'plan';
  title: string;
  description: string;
  example: string;
  note?: string;
  image: string;
  priceLabel: string;
  price: string;
  items?: { title: string; description?: string }[];
  billing?: { annual: boolean; monthlyPrice: string; annualPrice: string; savings: string; onChange: (annual: boolean) => void };
  action: string;
  onAction: () => void;
  onClose: () => void;
};

export function OrderInfoSheet({ ru, kind, title, description, example, note, image, priceLabel, price, items, billing, action, onAction, onClose }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const gestureRef = useRef<{ id: number; startY: number; baseY: number; distance: number; height: number; opacity: number; lastY: number; lastAt: number; velocity: number } | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onActionRef = useRef(onAction);
  const dismissRef = useRef<(callback: () => void) => void>(() => {});
  onCloseRef.current = onClose;
  onActionRef.current = onAction;

  const freezeMotion = () => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (!sheet) return 0;
    const transform = getComputedStyle(sheet).transform;
    const opacity = backdrop ? getComputedStyle(backdrop).opacity : '1';
    let offset = 0;
    try { if (transform !== 'none') offset = new DOMMatrixReadOnly(transform).m42; } catch { /* No transform yet. */ }
    sheet.style.animation = 'none';
    sheet.style.transition = 'none';
    sheet.style.transform = `translate3d(0, ${Math.max(0, offset)}px, 0)`;
    if (backdrop) { backdrop.style.animation = 'none'; backdrop.style.transition = 'none'; backdrop.style.opacity = opacity; }
    return Math.max(0, offset);
  };

  const dismiss = (callback: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    gestureRef.current = null;
    if (dragFrameRef.current !== null) { cancelAnimationFrame(dragFrameRef.current); dragFrameRef.current = null; }
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (!sheet) { callback(); return; }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      // Let the current touch finish before removing its target, so the next tap is not swallowed.
      closeTimerRef.current = window.setTimeout(() => { closeTimerRef.current = null; callback(); }, 0);
      return;
    }
    freezeMotion();
    // Commit the current position once so release, a partially completed entrance, and a tap all close smoothly.
    sheet.getBoundingClientRect();
    sheet.style.transition = 'transform 220ms cubic-bezier(.4, 0, 1, 1)';
    sheet.style.transform = 'translate3d(0, 100%, 0)';
    if (backdrop) { backdrop.style.transition = 'opacity 180ms ease'; backdrop.style.opacity = '0'; }
    closeTimerRef.current = window.setTimeout(() => { closeTimerRef.current = null; callback(); }, 230);
  };
  dismissRef.current = dismiss;

  const paintDrag = () => {
    dragFrameRef.current = null;
    const gesture = gestureRef.current;
    const sheet = sheetRef.current;
    if (!gesture || !sheet) return;
    sheet.style.transform = `translate3d(0, ${gesture.distance}px, 0)`;
    if (backdropRef.current) {
      const moved = gesture.distance - gesture.baseY;
      const opacity = moved >= 0
        ? gesture.opacity * (1 - Math.min(moved / Math.max(gesture.height - gesture.baseY, 1), 1))
        : gesture.opacity + (1 - gesture.opacity) * Math.min(-moved / Math.max(gesture.baseY, 1), 1);
      backdropRef.current.style.opacity = String(opacity);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (closingRef.current || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (dragFrameRef.current !== null) { cancelAnimationFrame(dragFrameRef.current); dragFrameRef.current = null; }
    const baseY = freezeMotion();
    const opacity = Number.parseFloat(backdropRef.current?.style.opacity || '1');
    gestureRef.current = { id: event.pointerId, startY: event.clientY, baseY, distance: baseY, height: sheetRef.current?.offsetHeight || 500, opacity: Number.isFinite(opacity) ? opacity : 1, lastY: event.clientY, lastAt: performance.now(), velocity: 0 };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Pointer capture may be unavailable in older webviews. */ }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.id !== event.pointerId || closingRef.current) return;
    const now = performance.now();
    const elapsed = Math.max(now - gesture.lastAt, 1);
    gesture.velocity = (event.clientY - gesture.lastY) / elapsed;
    gesture.lastY = event.clientY;
    gesture.lastAt = now;
    gesture.distance = Math.max(0, gesture.baseY + event.clientY - gesture.startY);
    if (dragFrameRef.current === null) dragFrameRef.current = requestAnimationFrame(paintDrag);
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    if (dragFrameRef.current !== null) { cancelAnimationFrame(dragFrameRef.current); dragFrameRef.current = null; }
    gesture.distance = Math.max(0, gesture.baseY + event.clientY - gesture.startY);
    paintDrag();
    gestureRef.current = null;
    const velocity = performance.now() - gesture.lastAt < 100 ? gesture.velocity : 0;
    const shouldDismiss = !cancelled && (gesture.distance > Math.min(130, gesture.height * .25) || (gesture.distance > 40 && velocity > .65));
    if (shouldDismiss) { dismiss(() => onCloseRef.current()); return; }
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (sheet) { sheet.style.transition = 'transform 260ms cubic-bezier(.22, 1, .36, 1)'; sheet.style.transform = 'translate3d(0, 0, 0)'; }
    if (backdrop) { backdrop.style.transition = 'opacity 220ms ease'; backdrop.style.opacity = '1'; }
  };

  useEffect(() => {
    const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.getElementById('root');
    const previousOverflow = root?.style.overflowY || '';
    const previousInert = root?.inert || false;
    if (root) { root.inert = true; root.style.overflowY = 'hidden'; }
    document.body.dataset.orderInfoOpen = 'true';
    window.dispatchEvent(new CustomEvent('web4tg:order-info', { detail: true }));
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); dismissRef.current(() => onCloseRef.current()); return; }
      if (event.key !== 'Tab') return;
      const buttons = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])') || []);
      if (!buttons.length) { event.preventDefault(); return; }
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      if (dragFrameRef.current !== null) window.cancelAnimationFrame(dragFrameRef.current);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      document.removeEventListener('keydown', keyDown);
      if (root) { root.inert = previousInert; root.style.overflowY = previousOverflow; }
      delete document.body.dataset.orderInfoOpen;
      window.dispatchEvent(new CustomEvent('web4tg:order-info', { detail: false }));
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    };
  }, []);

  const eyebrow = kind === 'template' ? (ru ? 'НАПРАВЛЕНИЕ' : 'PROJECT TYPE')
    : kind === 'plan' ? (ru ? 'ПОСЛЕ ЗАПУСКА' : 'AFTER LAUNCH')
      : (ru ? 'ВОЗМОЖНОСТЬ' : 'FEATURE');

  return createPortal(
    <div className="order-info-overlay" data-testid="order-info-overlay">
      <div className="order-info-backdrop" ref={backdropRef} onClick={() => dismiss(() => onCloseRef.current())} aria-hidden="true" />
      <div className="order-info-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="order-info-title" aria-describedby="order-info-description" data-testid="order-info-sheet">
        <div className="order-info-handle-area" aria-hidden="true" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={(event) => finishPointer(event)} onPointerCancel={(event) => finishPointer(event, true)}>
          <span />
        </div>
        <button ref={closeRef} className="order-info-close" type="button" onClick={() => dismiss(() => onCloseRef.current())} aria-label={ru ? 'Закрыть описание' : 'Close details'}><X size={20} /></button>
        <div className="order-info-content">
          <div className="order-info-intro">
            <div className="order-info-intro-copy"><span>{eyebrow}</span><h2 id="order-info-title">{title}</h2></div>
            <div className="order-info-art"><img src={image} alt="" draggable={false} /></div>
          </div>
          <p className="order-info-description" id="order-info-description">{description}</p>
          {billing && <div className="order-info-billing">
            <strong>{ru ? 'Период поддержки' : 'Support period'}</strong>
            <div className="order-info-billing-options" role="group" aria-label={ru ? 'Период поддержки' : 'Support period'}>
              <button type="button" aria-pressed={!billing.annual} onClick={() => billing.onChange(false)} data-testid="info-billing-monthly"><span>{ru ? 'Месяц' : 'Monthly'}</span><strong>{billing.monthlyPrice}</strong><small>{ru ? 'за месяц' : 'per month'}</small></button>
              <button type="button" aria-pressed={billing.annual} onClick={() => billing.onChange(true)} data-testid="info-billing-annual"><span>{ru ? 'Год' : 'Yearly'}</span><strong>{billing.annualPrice}</strong><small>{ru ? 'за год' : 'per year'}</small></button>
            </div>
            <p>{ru ? `Состав одинаковый. За год экономия ${billing.savings} по сравнению с помесячной оплатой.` : `The same coverage. Save ${billing.savings} over a year compared with monthly payments.`}</p>
          </div>}
          {kind !== 'plan' && <div className="order-info-example"><strong>{kind === 'template' ? (ru ? 'КОМУ ПОДОЙДЁТ' : 'A GOOD FIT FOR') : (ru ? 'КАК ЭТО РАБОТАЕТ' : 'HOW IT WORKS')}</strong><p>{example}</p></div>}
          {items && items.length > 0 && <div className="order-info-includes"><strong>{ru ? 'Что входит' : 'What’s included'}</strong><ul>{items.map((item) => <li key={item.title}><span><Check size={13} strokeWidth={2.6} /></span><div>{item.title}{item.description && <small>{item.description}</small>}</div></li>)}</ul></div>}
          {note && <p className="order-info-note">{note}</p>}
          {kind === 'feature' && <p className="order-info-note">{ru ? 'Функция относится к разработке приложения. Поддержка после запуска выбирается и оплачивается отдельно.' : 'This feature is part of app development. Support after launch is chosen and billed separately.'}</p>}
          {billing && <p className="order-info-note">{ru ? 'Поддержка оплачивается отдельно от разработки. Условия оплаты и продления согласуем при обсуждении заявки.' : 'Support is billed separately from development. Payment and renewal terms are agreed when discussing your request.'}</p>}
          <div className="order-info-price"><span>{priceLabel}</span><strong>{price}</strong></div>
        </div>
        <div className="order-info-footer"><button className="order-info-action" type="button" onClick={() => dismiss(() => onActionRef.current())} data-testid="order-info-action">{action}</button></div>
      </div>
    </div>, document.body,
  );
}

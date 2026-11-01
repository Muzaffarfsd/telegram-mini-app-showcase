import { useEffect, useRef } from 'react';
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); return; }
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
      <div className="order-info-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="order-info-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="order-info-title" aria-describedby="order-info-description" data-testid="order-info-sheet">
        <div className="order-info-handle-area" aria-hidden="true"
          onTouchStart={(event) => { const touch = event.touches[0]; touchRef.current = { x: touch.clientX, y: touch.clientY }; }}
          onTouchEnd={(event) => { const touch = event.changedTouches[0]; const start = touchRef.current; if (start && touch.clientY - start.y > 75 && Math.abs(touch.clientX - start.x) < 70) onClose(); touchRef.current = null; }}>
          <span />
        </div>
        <button ref={closeRef} className="order-info-close" type="button" onClick={onClose} aria-label={ru ? 'Закрыть описание' : 'Close details'}><X size={20} /></button>
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
        <div className="order-info-footer"><button className="order-info-action" type="button" onClick={onAction} data-testid="order-info-action">{action}</button></div>
      </div>
    </div>, document.body,
  );
}

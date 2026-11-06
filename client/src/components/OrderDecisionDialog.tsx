import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Props = { title: string; description: string; primary: string; secondary: string; onPrimary: () => void; onSecondary: () => void; onCancel?: () => void; testId: string };

export function OrderDecisionDialog({ title, description, primary, secondary, onPrimary, onSecondary, onCancel, testId }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return createPortal(<dialog ref={ref} className="order-dialog" data-order-dialog data-testid={testId} aria-labelledby={`${testId}-title`} aria-describedby={`${testId}-description`} onCancel={(event) => { event.preventDefault(); onCancel?.(); }}>
    <h2 id={`${testId}-title`}>{title}</h2>
    <p id={`${testId}-description`}>{description}</p>
    <div className="order-dialog-actions"><button type="button" className="is-primary" onClick={onPrimary} autoFocus>{primary}</button><button type="button" onClick={onSecondary}>{secondary}</button></div>
  </dialog>, document.body);
}

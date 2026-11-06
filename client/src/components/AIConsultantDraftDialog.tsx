import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function AIConsultantDraftDialog({ ru, onRestore, onStartNew }: { ru: boolean; onRestore: () => void; onStartNew: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  return createPortal(<dialog ref={ref} className="ai2-draft-dialog" aria-labelledby="ai2-draft-title" aria-describedby="ai2-draft-description" data-testid="consultant-draft-dialog" onCancel={(event) => event.preventDefault()}>
    <h2 id="ai2-draft-title">{ru ? 'Продолжить настройку?' : 'Continue setup?'}</h2>
    <p id="ai2-draft-description">{ru ? 'На этом устройстве сохранены ваши пожелания. Они хранятся здесь до 30 дней и не отправляются автоматически.' : 'Your preferences are saved on this device for up to 30 days. They are not sent automatically.'}</p>
    <div className="ai2-draft-actions"><button type="button" className="is-primary" onClick={onRestore} autoFocus>{ru ? 'Восстановить' : 'Restore'}</button><button type="button" onClick={onStartNew}>{ru ? 'Начать заново' : 'Start over'}</button></div>
  </dialog>, document.body);
}

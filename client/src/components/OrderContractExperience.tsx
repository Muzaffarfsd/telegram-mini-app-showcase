import { useEffect, useMemo, useRef, useState } from 'react';
import { OrderContractPanel, type Customer } from './OrderContractPanel';
import type { OrderContractDraft, OrderContractInput } from './orderContractData';
import type { PreparedOrderContract } from './orderContractExport';

type Props = { ru: boolean; selection: Omit<OrderContractInput, 'customer'>; customer: Customer; onCustomerChange: (customer: Customer) => void };

/** Customer details are deliberately kept only in memory and never in the saved order or URL. */
export function OrderContractExperience({ ru, selection, customer, onCustomerChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draftRecord, setDraft] = useState<{ signature: string; document: OrderContractDraft } | null>(null);
  const [ready, setReady] = useState<{ signature: string; document: PreparedOrderContract } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [directDownload, setDirectDownload] = useState(false);
  const [generationFailed, setGenerationFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const revision = useRef(0);
  const exportModule = useRef<typeof import('./orderContractExport') | null>(null);
  const input = useMemo<OrderContractInput>(() => ({
    ...selection,
    customer: { name: customer.name, taxId: customer.inn, address: customer.address, email: customer.email },
  }), [selection, customer]);
  const signature = JSON.stringify(input);
  const draft = draftRecord?.signature === signature ? draftRecord.document : null;

  useEffect(() => {
    const current = ++revision.current;
    if (!open) { setBusy(false); return; }
    setBusy(true); setReady(null); setMessage(''); setDirectDownload(false); setGenerationFailed(false);
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const data = await import('./orderContractData');
          const nextDraft = data.buildOrderContract(input);
          if (revision.current !== current) return;
          setDraft({ signature, document: nextDraft });
          const exporter = await import('./orderContractExport');
          exportModule.current = exporter;
          const document = await exporter.prepareOrderContract(nextDraft);
          if (revision.current === current) setReady({ signature, document });
        } catch {
          if (revision.current === current) { setGenerationFailed(true); setMessage(ru ? 'Не удалось подготовить файл. Текст можно скопировать или попробовать ещё раз.' : 'The file could not be prepared. You can copy the text or try again.'); }
        } finally {
          if (revision.current === current) setBusy(false);
        }
      })();
    }, 250);
    return () => { window.clearTimeout(timer); ++revision.current; };
  }, [signature, open, ru, retry]);

  const download = () => {
    if (generationFailed && !ready) { setRetry(value => value + 1); return; }
    const exporter = exportModule.current;
    if (!ready || ready.signature !== signature || !exporter) return;
    // The export module was loaded during preparation; calling this directly
    // in the tap preserves the user activation needed by mobile share sheets.
    const action = directDownload
      ? Promise.resolve(exporter.downloadPreparedOrderContract(ready.document))
      : exporter.deliverPreparedOrderContract(ready.document);
    void action.then(result => {
      if (result === 'unavailable') { setDirectDownload(true); setMessage(ru ? 'Не удалось открыть файл. Нажмите «Скачать» ещё раз или скопируйте текст.' : 'Could not open the file. Tap Download again or copy the text.'); }
      else if (result === 'cancelled') setMessage(ru ? 'Сохранение отменено. Вы можете попробовать снова.' : 'Saving was cancelled. You can try again.');
      else setMessage(result === 'shared' ? (ru ? 'Открыто системное меню сохранения или отправки файла.' : 'The system menu was opened for saving or sharing.') : (ru ? 'Браузеру отправлен запрос на скачивание файла.' : 'The browser was asked to download the file.'));
    }).catch(() => setMessage(ru ? 'Не удалось открыть файл. Скопируйте текст договора.' : 'Could not open the file. Copy the agreement text.'));
  };
  const copy = () => {
    if (!draft) return;
    const text = [draft.title, ...draft.sections.flatMap(section => [section.heading, ...section.paragraphs])].join('\n\n');
    if (!navigator.clipboard?.writeText) { setMessage(ru ? 'Копирование недоступно: выделите текст договора на экране.' : 'Copy is unavailable: select the text on screen.'); return; }
    void navigator.clipboard.writeText(text).then(() => setMessage(ru ? 'Текст проекта договора скопирован.' : 'The draft agreement text was copied.'), () => setMessage(ru ? 'Не удалось скопировать. Выделите текст договора на экране.' : 'Could not copy. Select the text on screen.'));
  };
  const preview = draft ? <><h3>{draft.title}</h3>{draft.sections.map((section, index) => <section key={`${section.heading}-${index}`}><h3>{section.heading}</h3>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</section>)}</> : <p>{ru ? 'Подготавливаем текст договора…' : 'Preparing the agreement text…'}</p>;
  return <OrderContractPanel ru={ru} customer={customer} onCustomerChange={onCustomerChange} preview={preview} onOpenChange={setOpen} onDownload={download} onCopyText={copy} copyDisabled={!draft} busy={busy || (!generationFailed && (!ready || ready.signature !== signature))} downloadLabel={generationFailed ? (ru ? 'Повторить подготовку файла' : 'Try preparing the file again') : undefined} statusMessage={message} />;
}

import { useMemo, useState } from 'react';
import { ClipboardCopy, Download, Share2 } from 'lucide-react';
import { writeQuote, type MessageLanguage } from './quoteMessage';
import type { Brief } from './records';

function attachment(data: string) {
  if (!data) return undefined;
  try {
    const bytes = Uint8Array.from(
      atob(data.substring(data.indexOf(',') + 1)),
      (c) => c.charCodeAt(0),
    );
    return new File([bytes], 'product-reference.jpg', { type: 'image/jpeg' });
  } catch {
    return undefined;
  }
}
export function ShareBrief({ b, ru }: { b: Brief; ru: boolean }) {
  const [lang, setLang] = useState<MessageLanguage>(ru ? 'ru' : 'en');
  const [status, setStatus] = useState<'idle' | 'copied' | 'manual' | 'failed'>(
    'idle',
  );
  const photo = useMemo(() => attachment(b.photo), [b.photo]);
  const text = writeQuote(b, lang, window.location.origin);
  const title =
    lang === 'zh'
      ? '采购询价'
      : lang === 'ru'
        ? 'Запрос на закупку из Китая'
        : 'Sourcing request from China';
  let shareFile = false;
  try {
    shareFile = !!photo && !!navigator.canShare?.({ text, files: [photo] });
  } catch {}
  async function share() {
    setStatus('idle');
    try {
      await navigator.share(
        shareFile && photo ? { title, text, files: [photo] } : { title, text },
      );
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setStatus('failed');
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('manual');
    }
  }
  return (
    <section className="yb-handoff">
      <h2>{ru ? 'Сообщение байеру' : 'Message to your buyer'}</h2>
      <p>
        {ru
          ? 'Выберите язык и передайте запрос своему байеру в привычном чате.'
          : 'Pick a language and send the request to your own buyer in your usual chat.'}
      </p>
      <label className="yb-field">
        <span>{ru ? 'Язык шаблона' : 'Template language'}</span>
        <select
          value={lang}
          onChange={(e) => {
            setLang(e.target.value as MessageLanguage);
            setStatus('idle');
          }}
        >
          <option value="ru">Русский</option>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </label>
      <details open={status === 'manual' || undefined}>
        <summary>{ru ? 'Текст сообщения' : 'Message text'}</summary>
        <textarea
          aria-label={ru ? 'Текст для байера' : 'Buyer message text'}
          value={text}
          readOnly
          rows={7}
          onFocus={(e) => e.target.select()}
        />
      </details>
      <div className="yb-flow-actions">
        {typeof navigator.share === 'function' && (
          <button type="button" onClick={share} className="yb-primary">
            <Share2 size={16} />
            {shareFile
              ? ru
                ? 'Поделиться с фото'
                : 'Share with photo'
              : ru
                ? 'Поделиться текстом'
                : 'Share text'}
          </button>
        )}
        <button
          type="button"
          className={
            typeof navigator.share === 'function'
              ? 'yb-secondary'
              : 'yb-primary'
          }
          onClick={copy}
        >
          <ClipboardCopy size={16} />
          {ru ? 'Скопировать текст' : 'Copy brief text'}
        </button>
        {b.photo && (
          <a
            className="yb-source"
            download="product-reference.jpg"
            href={b.photo}
          >
            <Download size={16} />
            {ru ? 'Скачать фото' : 'Download photo'}
          </a>
        )}
      </div>
      {status !== 'idle' && (
        <p role="status" className="yb-note">
          {status === 'copied'
            ? ru
              ? 'Текст скопирован. Вставьте его в чат байера.'
              : 'Text copied. Paste it in your buyer’s chat.'
            : status === 'manual'
              ? ru
                ? 'Выделите текст сообщения и скопируйте его.'
                : 'Select and copy the message above.'
              : ru
                ? 'В этом браузере можно скопировать текст и приложить фото вручную.'
                : 'You can copy the text and attach the photo manually in this browser.'}
        </p>
      )}
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileText, Plus, Trash2 } from 'lucide-react';
import { scrollToTop } from '@/hooks/useScrollToTop';
import './BuyerWorkflow.css';

export const BUYER_CATEGORIES = ['Одежда', 'Обувь', 'Сумки', 'Аксессуары', 'Для дома', 'Другое'] as const;
type BuyerCategory = typeof BUYER_CATEGORIES[number];
export type BuyerRequestFields = { category: BuyerCategory; description: string; url: string; size: string; color: string; quantity: string; budget: string };
export type BuyerRequest = BuyerRequestFields & { id: string; createdAt: string; updatedAt: string };
const KEY = 'china-buyer-demo-requests-v1';
const LIMIT = 30;
const clip = (value: unknown, max: number) => typeof value === 'string' ? value.slice(0, max) : '';
const categoryOf = (value: unknown): BuyerCategory => BUYER_CATEGORIES.find(category => category === value) || 'Другое';
const emptyFields = (category?: string, description?: string): BuyerRequestFields => ({ category: categoryOf(category), description: clip(description, 800), url: '', size: '', color: '', quantity: '1', budget: '' });

function validUrl(value: string) {
  if (!value.trim()) return true;
  try { const url = new URL(value.trim()); return ['http:', 'https:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password; }
  catch { return false; }
}
export function validateBuyerRequest(fields: BuyerRequestFields): string | null {
  if (!BUYER_CATEGORIES.includes(fields.category)) return 'Выберите категорию.';
  if (!validUrl(fields.url)) return 'Проверьте ссылку: нужен полный адрес, начинающийся с http:// или https://.';
  const description = fields.description.trim();
  if (!description && !fields.url.trim()) return 'Добавьте ссылку или опишите товар.';
  if (description && description.length < 3) return 'Опишите товар хотя бы в трёх символах или оставьте только ссылку.';
  if (!/^\d{1,3}$/.test(fields.quantity) || Number(fields.quantity) < 1 || Number(fields.quantity) > 999) return 'Количество должно быть от 1 до 999.';
  if (fields.budget && (!/^\d{1,9}$/.test(fields.budget) || Number(fields.budget) < 1)) return 'Укажите бюджет целым числом в рублях или оставьте поле пустым.';
  return null;
}
function fieldsFrom(input: unknown): BuyerRequestFields {
  const value = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  return { category: categoryOf(value.category), description: clip(value.description, 800), url: clip(value.url, 500), size: clip(value.size, 80), color: clip(value.color, 80), quantity: clip(value.quantity, 3), budget: clip(value.budget, 9) };
}
function readRequests(): BuyerRequest[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.slice(0, LIMIT).flatMap((item: unknown) => {
      if (!item || typeof item !== 'object') return [];
      const obj = item as Record<string, unknown>;
      const fields = fieldsFrom(obj);
      if (validateBuyerRequest(fields) || typeof obj.id !== 'string' || !obj.id || typeof obj.createdAt !== 'string' || !Number.isFinite(Date.parse(obj.createdAt))) return [];
      return [{ ...fields, id: obj.id.slice(0, 80), createdAt: obj.createdAt, updatedAt: typeof obj.updatedAt === 'string' && Number.isFinite(Date.parse(obj.updatedAt)) ? obj.updatedAt : obj.createdAt }];
    });
  } catch { return []; }
}

export function useBuyerRequests() {
  const [requests, setRequests] = useState<BuyerRequest[]>(readRequests);
  const [storageWarning, setStorageWarning] = useState(false);
  const save = (fields: BuyerRequestFields, id?: string) => {
    const normalized = fieldsFrom({ ...fields, description: fields.description.trim(), url: fields.url.trim(), size: fields.size.trim(), color: fields.color.trim(), budget: fields.budget.trim(), quantity: fields.quantity.trim() });
    const error = validateBuyerRequest(normalized);
    if (error) return { error, persisted: false };
    const existing = id ? requests.find(request => request.id === id) : undefined;
    if (id && !existing) return { error: 'Заявка больше не найдена. Создайте новую.', persisted: false };
    if (!existing && requests.length >= LIMIT) return { error: `Можно сохранить до ${LIMIT} демо-заявок. Удалите ненужную и попробуйте снова.`, persisted: false };
    const now = new Date().toISOString();
    const next: BuyerRequest = { ...normalized, id: existing?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, createdAt: existing?.createdAt || now, updatedAt: now };
    const updated = existing ? requests.map(request => request.id === existing.id ? next : request) : [next, ...requests];
    let persisted = true;
    try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { persisted = false; }
    setStorageWarning(!persisted); setRequests(updated);
    return { request: next, persisted, error: '' };
  };
  const remove = (id: string) => {
    const updated = requests.filter(request => request.id !== id);
    let persisted = true;
    try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { persisted = false; }
    setStorageWarning(!persisted); setRequests(updated);
    return persisted;
  };
  return { requests, save, remove, storageWarning };
}
export type BuyerRequests = ReturnType<typeof useBuyerRequests>;

const money = (value: string) => `${new Intl.NumberFormat('ru-RU').format(Number(value))} ₽`;
function RequestDetails({ fields }: { fields: BuyerRequestFields }) {
  return <dl className="cbw-details">
    <div><dt>Категория</dt><dd>{fields.category}</dd></div>
    {fields.description.trim() && <div><dt>Что ищем</dt><dd className="cbw-details__description">{fields.description}</dd></div>}
    {fields.url && <div><dt>Ссылка</dt><dd className="cbw-details__url"><a href={fields.url} target="_blank" rel="noopener noreferrer">Открыть источник ↗</a></dd></div>}
    {fields.size && <div><dt>Размер</dt><dd>{fields.size}</dd></div>}
    {fields.color && <div><dt>Цвет</dt><dd>{fields.color}</dd></div>}
    <div><dt>Количество</dt><dd>{fields.quantity} шт.</dd></div>
    {fields.budget && <div><dt>Ориентир бюджета</dt><dd>{money(fields.budget)}</dd></div>}
  </dl>;
}

type FormProps = { workflow: BuyerRequests; initial?: BuyerRequest | null; initialCategory?: string; initialDescription?: string; draft?: BuyerRequestFields | null; onDraftChange?: (draft: BuyerRequestFields | null) => void; onBack: () => void; onHistory: () => void };
export function BuyerRequestForm({ workflow, initial, initialCategory, initialDescription, draft, onDraftChange, onBack, onHistory }: FormProps) {
  const [fields, setFields] = useState<BuyerRequestFields>(() => draft ? fieldsFrom(draft) : initial ? fieldsFrom(initial) : emptyFields(initialCategory, initialDescription));
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [error, setError] = useState('');
  const [persisted, setPersisted] = useState(true);
  const firstStep = useRef(true);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    scrollToTop();
    heading.current?.focus({ preventScroll:true });
  }, [step]);
  const update = (key: keyof BuyerRequestFields, value: string) => { const next = { ...fields, [key]: value }; setFields(next); onDraftChange?.(next); setError(''); };
  const review = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = validateBuyerRequest(fields);
    if (problem) { setError(problem); return; }
    setError(''); setStep('review');
  };
  const confirm = () => {
    const result = workflow.save(fields, initial?.id);
    if (result.error) { setError(result.error); return; }
    onDraftChange?.(null); setPersisted(result.persisted); setError(''); setStep('success');
  };
  return <section className="cbw cbw-form" aria-labelledby="cbw-title">
    <button className="cbw-back" type="button" onClick={() => step === 'review' ? setStep('form') : onBack()}><ArrowLeft size={17}/> {step === 'review' ? 'К редактированию' : 'Назад'}</button>
    {step === 'success' ? <div className="cbw-success"><span className="cbw-success__icon"><Check size={24}/></span><p className="cbw-kicker">ГОТОВО / ДЕМО</p><h1 id="cbw-title" ref={heading} tabIndex={-1}>{initial ? 'Изменения сохранены' : 'Заявка подготовлена'}</h1><p>{persisted ? 'Демо-заявка сохранена на этом устройстве.' : 'Хранилище недоступно: заявка сохранена только до закрытия страницы.'} Она не отправлена байеру.</p><button type="button" className="cbw-button cbw-button--dark" onClick={onHistory}>Мои заявки <ArrowRight size={17}/></button><button type="button" className="cbw-button cbw-button--line" onClick={onBack}>Вернуться</button></div> : <>
      <div className="cbw-intro"><p className="cbw-kicker">{initial ? 'РЕДАКТИРОВАНИЕ' : 'ВАШ ЗАПРОС'} / 0{step === 'form' ? '1' : '2'}</p><h1 id="cbw-title" ref={heading} tabIndex={-1}>{step === 'form' ? <>Расскажите,<br/>что ищете.</> : <>Проверьте<br/>детали.</>}</h1><p>{step === 'form' ? 'Добавьте ссылку или описание товара. Можно указать оба варианта и дополнительные детали.' : 'Проверьте параметры перед сохранением демонстрационной заявки.'}</p></div>
      <div className="cbw-progress" aria-label={`Шаг ${step === 'form' ? 1 : 2} из 2`}><div className="cbw-progress__item is-active"><span>01</span><span>Ваш запрос</span></div><div className={`cbw-progress__item ${step === 'review' ? 'is-active' : ''}`}><span>02</span><span>Проверка</span></div></div>
      {step === 'form' ? <form className="cbw-fields" onSubmit={review} noValidate>
        <fieldset className="cbw-category"><legend>Категория</legend><div>{BUYER_CATEGORIES.map(category => <button type="button" key={category} onClick={() => update('category', category)} aria-pressed={fields.category === category}>{category}</button>)}</div></fieldset>
        <label className="cbw-field" htmlFor="cbw-description"><span>Что вы ищете <em>или укажите ссылку</em></span><textarea id="cbw-description" rows={4} maxLength={800} value={fields.description} onChange={event => update('description', event.target.value)} placeholder="Например: кожаная сумка для города, чёрная"/><small>{fields.description.length} / 800</small></label>
        <label className="cbw-field" htmlFor="cbw-url"><span>Ссылка на товар <em>или добавьте описание</em></span><input id="cbw-url" type="url" maxLength={500} inputMode="url" value={fields.url} onChange={event => update('url', event.target.value)} placeholder="https://..."/><small>Достаточно ссылки или описания.</small></label>
        <div className="cbw-row"><label className="cbw-field" htmlFor="cbw-size"><span>Размер <em>по желанию</em></span><input id="cbw-size" maxLength={80} value={fields.size} onChange={event => update('size', event.target.value)} placeholder="Например, M"/></label><label className="cbw-field" htmlFor="cbw-color"><span>Цвет <em>по желанию</em></span><input id="cbw-color" maxLength={80} value={fields.color} onChange={event => update('color', event.target.value)} placeholder="Например, чёрный"/></label></div>
        <div className="cbw-row"><label className="cbw-field" htmlFor="cbw-quantity"><span>Количество</span><input id="cbw-quantity" type="text" inputMode="numeric" maxLength={3} value={fields.quantity} onChange={event => update('quantity', event.target.value)} /></label><label className="cbw-field" htmlFor="cbw-budget"><span>Бюджет, ₽ <em>по желанию</em></span><input id="cbw-budget" type="text" inputMode="numeric" maxLength={9} value={fields.budget} onChange={event => update('budget', event.target.value)} placeholder="Например, 20000"/></label></div>
        <p className="cbw-note">Это демо: не указывайте контакты или другую личную информацию. Данные останутся на этом устройстве и не будут отправлены.</p>
        {error && <p className="cbw-error" role="alert">{error}</p>}
        <button className="cbw-button cbw-button--dark" type="submit">Проверить запрос <ArrowRight size={17}/></button>
      </form> : <div className="cbw-review"><RequestDetails fields={fields}/><p className="cbw-note">Это демонстрация: заявка не отправляется, цена, наличие и сроки не подтверждены.</p>{error && <p className="cbw-error" role="alert">{error}</p>}<button className="cbw-button cbw-button--dark" type="button" onClick={confirm}>{initial ? 'Сохранить изменения' : 'Сохранить демо-заявку'} <ArrowRight size={17}/></button><button className="cbw-button cbw-button--line" type="button" onClick={() => setStep('form')}>Изменить детали</button></div>}
    </>}
  </section>;
}

type HistoryProps = { workflow: BuyerRequests; onEdit: (request: BuyerRequest) => void; onNew: () => void };
export function BuyerRequestHistory({ workflow, onEdit, onNew }: HistoryProps) {
  const [removing, setRemoving] = useState<string | null>(null);
  return <section className="cbw cbw-history" aria-labelledby="cbw-history-title"><div className="cbw-history__top"><div><p className="cbw-kicker">ВАШИ ИДЕИ</p><h2 id="cbw-history-title">Мои заявки</h2></div><span>{workflow.requests.length}</span></div><p className="cbw-lead">Здесь хранятся подготовленные вами демо-заявки.</p>
    {workflow.storageWarning && <p className="cbw-error" role="status">Хранилище недоступно. Изменения действуют только до закрытия страницы.</p>}
    {workflow.requests.length ? <div className="cbw-history__list">{workflow.requests.map(request => <details key={request.id} className="cbw-history__item"><summary><span className="cbw-history__icon"><FileText size={18}/></span><span className="cbw-history__summary"><strong>{request.description.trim() || 'Товар по ссылке'}</strong><small>{request.category} · {new Date(request.createdAt).toLocaleDateString('ru-RU')} · демо</small></span><ChevronDown size={18}/></summary><div className="cbw-history__body"><RequestDetails fields={request}/><p className="cbw-note">Сохранено локально. Байеру не отправлено.</p><button className="cbw-button cbw-button--line" type="button" onClick={() => onEdit(request)}>Изменить запрос</button>{removing === request.id ? <div className="cbw-confirm" role="group" aria-label="Удаление заявки"><span>Удалить эту демо-заявку?</span><button type="button" onClick={() => { workflow.remove(request.id); setRemoving(null); }}>Удалить</button><button type="button" onClick={() => setRemoving(null)}>Отмена</button></div> : <button className="cbw-delete" type="button" onClick={() => setRemoving(request.id)}><Trash2 size={15}/> Удалить</button>}</div></details>)}</div> : <div className="cbw-empty"><span><FileText size={21}/></span><strong>Пока здесь пусто</strong><p>Создайте заявку, чтобы собрать пожелания к товару.</p></div>}
    <button type="button" className="cbw-button cbw-button--dark" onClick={onNew}><Plus size={17}/> Новая заявка</button><p className="cbw-note">Демо-заявки хранятся только на этом устройстве и не отправляются байеру.</p>
  </section>;
}

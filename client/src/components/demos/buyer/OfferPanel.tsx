import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { currencies, currencyCode, money, type Currency } from './markets';
import { offerTotals, type Offer, type ChangeOffer } from './offers';
import { type SavedBrief } from './records';
type Fields = {
  supplier: string;
  quantity: string;
  currency: Currency | '';
  unit: string;
  shipping: string;
  fee: string;
  other: string;
  lead: string;
};
const toText = (value: number | null | undefined) =>
  value == null ? '' : String(value);
function editFields(b: SavedBrief, o?: Offer): Fields {
  return {
    supplier: o?.supplier ?? '',
    quantity: toText(o?.quantity ?? Number(b.quantity)),
    currency: o?.currency ?? b.offers[0]?.currency ?? b.currency,
    unit: toText(o?.unit),
    shipping: toText(o?.shipping),
    fee: toText(o?.fee),
    other: toText(o?.other),
    lead: o?.lead ?? '',
  };
}
function amount(s: string) {
  const text = s.trim().replace(',', '.');
  if (!text) return null;
  return /^\d{1,9}(?:\.\d{1,2})?$/.test(text) ? Number(text) : NaN;
}
const id = () =>
  globalThis.crypto?.randomUUID?.() ||
  Date.now() + '-' + Math.random().toString(36).slice(2);
export function OfferPanel({
  b,
  ru,
  onChange,
}: {
  b: SavedBrief;
  ru: boolean;
  onChange: (c: ChangeOffer) => boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null),
    [fields, setFields] = useState<Fields>(() => editFields(b));
  const [error, setError] = useState('');
  const [removeId, setRemoveId] = useState('');
  function start(o?: Offer) {
    setFields(editFields(b, o));
    setEditing(o?.id ?? 'new');
    setError('');
    setRemoveId('');
  }
  function change(key: keyof Fields, value: string) {
    setFields((old) => ({ ...old, [key]: value }));
    setError('');
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const unit = amount(fields.unit),
      shipping = amount(fields.shipping),
      fee = amount(fields.fee),
      other = amount(fields.other);
    if (
      !fields.supplier.trim() ||
      !fields.currency ||
      !/^\d{1,5}$/.test(fields.quantity) ||
      Number(fields.quantity) < 1 ||
      unit === null ||
      !Number.isFinite(unit) ||
      unit <= 0 ||
      [shipping, fee, other].some(Number.isNaN)
    ) {
      setError(
        ru
          ? 'Укажите поставщика, валюту, количество и цену за штуку. Для сумм допустимы две цифры после запятой.'
          : 'Enter a supplier, currency, quantity and unit price. Amounts can have up to two decimal places.',
      );
      return;
    }
    const offer = {
      id: editing === 'new' ? id() : editing!,
      supplier: fields.supplier.trim(),
      quantity: Number(fields.quantity),
      currency: fields.currency,
      unit,
      shipping,
      fee,
      other,
      lead: fields.lead.trim(),
    };
    if (!onChange({ type: editing === 'new' ? 'add' : 'edit', offer })) {
      setError(
        ru
          ? 'Не удалось сохранить предложение. Проверьте список и попробуйте снова.'
          : 'Could not save this offer. Check the list and try again.',
      );
      return;
    }
    setEditing(null);
  }
  const costs = [
    ['unit', ru ? 'Цена за штуку' : 'Unit price'],
    ['shipping', ru ? 'Доставка партии' : 'Shipping for the batch'],
    ['fee', ru ? 'Услуги байера' : 'Buyer’s fee'],
    ['other', ru ? 'Прочие расходы' : 'Other costs'],
  ] as const;
  return (
    <section
      className="yb-offers"
      aria-label={ru ? 'Предложения поставщиков' : 'Supplier offers'}
    >
      <div className="yb-section-title">
        <h2>{ru ? 'Предложения поставщиков' : 'Supplier offers'}</h2>
        {b.offers.length > 0 && (
          <span className="yb-count">{b.offers.length}</span>
        )}
      </div>
      {b.offers.length === 0 && editing === null && (
        <p>
          {ru
            ? 'Получили ответ от байера? Внесите его расчёт, чтобы увидеть стоимость партии и одной штуки с доставкой.'
            : 'Have a quote from your buyer? Add it to see the batch total and the delivered cost per unit.'}
        </p>
      )}
      {b.offers.length > 0 && (
        <div className="yb-offer-grid">
          {b.offers.map((o) => {
            const totals = offerTotals(o);
            return (
              <article className="yb-offer-card" key={o.id}>
                <div>
                  <strong>{o.supplier}</strong>
                  <small>
                    {o.quantity} {ru ? 'шт.' : 'pcs'} · {o.currency}
                  </small>
                </div>
                <span>
                  {totals.complete
                    ? ru
                      ? 'Итого по предложению'
                      : 'Quoted total'
                    : ru
                      ? 'Известная сумма'
                      : 'Known subtotal'}
                </span>
                <b>{money(totals.total, o.currency, ru)}</b>
                <small>
                  {money(totals.perUnit, o.currency, ru)} /{' '}
                  {ru ? 'шт.' : 'unit'}
                </small>
                <dl>
                  {costs.map(([key, label]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>
                        {o[key] === null
                          ? ru
                            ? 'Уточнить'
                            : 'Unquoted'
                          : money(o[key]!, o.currency, ru)}
                      </dd>
                    </div>
                  ))}
                  {o.lead && (
                    <div>
                      <dt>{ru ? 'Срок' : 'Lead time'}</dt>
                      <dd>{o.lead}</dd>
                    </div>
                  )}
                </dl>
                <div className="yb-offer-tools">
                  <button
                    type="button"
                    onClick={() => start(o)}
                    aria-label={
                      (ru ? 'Изменить предложение ' : 'Edit offer ') +
                      o.supplier
                    }
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setRemoveId(o.id);
                    }}
                    aria-label={
                      (ru ? 'Удалить предложение ' : 'Delete offer ') +
                      o.supplier
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {removeId === o.id && (
                  <div className="yb-offer-confirm">
                    <button
                      type="button"
                      onClick={() => {
                        if (!onChange({ type: 'remove', id: o.id })) {
                          setError(
                            ru
                              ? 'Список предложений изменился. Откройте запрос ещё раз.'
                              : 'The list of offers has changed. Reopen your brief.',
                          );
                          return;
                        }
                        setRemoveId('');
                        if (editing === o.id) setEditing(null);
                      }}
                    >
                      {ru ? 'Удалить' : 'Delete'}
                    </button>
                    <button type="button" onClick={() => setRemoveId('')}>
                      {ru ? 'Отмена' : 'Cancel'}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      {b.offers.length > 1 && (
        <p className="yb-note">
          {ru
            ? 'Сравнивайте итог для одинакового количества и одной валюты.'
            : 'Compare totals for the same quantity in the same currency.'}
        </p>
      )}
      {editing === null && b.offers.length < 12 && (
        <button type="button" className="yb-secondary" onClick={() => start()}>
          <Plus size={17} />
          {ru ? 'Добавить предложение' : 'Add an offer'}
        </button>
      )}
      {editing !== null && (
        <form className="yb-offer-form" onSubmit={submit} noValidate>
          <label className="yb-field">
            <span>
              {ru
                ? 'Поставщик или название предложения'
                : 'Supplier or offer name'}
            </span>
            <input
              value={fields.supplier}
              maxLength={100}
              onChange={(e) => change('supplier', e.target.value)}
            />
          </label>
          <div className="yb-field-pair">
            <label className="yb-field">
              <span>{ru ? 'Валюта предложения' : 'Offer currency'}</span>
              <select
                value={fields.currency}
                onChange={(e) =>
                  change('currency', currencyCode(e.target.value))
                }
              >
                <option value="">—</option>
                {currencies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="yb-field">
              <span>{ru ? 'Количество в предложении' : 'Quoted quantity'}</span>
              <input
                inputMode="numeric"
                value={fields.quantity}
                maxLength={5}
                onChange={(e) => change('quantity', e.target.value)}
              />
            </label>
          </div>
          <div className="yb-field-pair">
            {costs.map(([key, label]) => (
              <label key={key} className="yb-field">
                <span>{label}</span>
                <input
                  value={fields[key]}
                  inputMode="decimal"
                  maxLength={12}
                  onChange={(e) => change(key, e.target.value)}
                />
              </label>
            ))}
          </div>
          <p className="yb-note">
            {ru
              ? 'Введите все суммы в валюте предложения. Для включённого в цену расхода укажите 0. Пустое поле означает, что сумму ещё нужно уточнить.'
              : 'Use the quote currency for all amounts. Enter 0 for an included cost. Leave an unknown amount blank.'}
          </p>
          <label className="yb-field">
            <span>{ru ? 'Срок по ответу байера' : 'Lead time from buyer'}</span>
            <input
              value={fields.lead}
              maxLength={80}
              onChange={(e) => change('lead', e.target.value)}
            />
          </label>
          <div className="yb-flow-actions">
            <button type="submit" className="yb-primary">
              {ru ? 'Сохранить предложение' : 'Save offer'}
              <Check size={17} />
            </button>
            <button
              type="button"
              className="yb-secondary"
              onClick={() => {
                setEditing(null);
                setError('');
              }}
            >
              {ru ? 'Отмена' : 'Cancel'}
            </button>
          </div>
        </form>
      )}
      {error && (
        <p className="yb-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

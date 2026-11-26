import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  Minus,
  Plus,
  ReceiptText,
  Stamp,
  UserRound,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import {
  art,
  drinkById,
  money,
  price,
  recipeKey,
  recipeParts,
  say,
  type Locale,
  type Recipe,
  type MenuSelection,
  productFor,
  isBakery,
} from './menu';
import { Action, Cup } from './MenuView';
import {
  bagTotal,
  changeQty,
  checkout,
  dateOf,
  forgetLine,
  pickupTimes,
  ticketNumber,
  ticketTotal,
  ticketDiscount,
  timeOf,
  toggleSaved,
  type Line,
  type Ticket,
} from './orders';
import { advanceTicket, cancelTicket, stageName, stageOf } from './orders';

type Local = { lang: Locale };
function Empty({
  icon,
  text,
  label,
  go,
}: {
  icon: React.ReactNode;
  text: string;
  label: string;
  go: () => void;
}) {
  return (
    <div className="tk-empty">
      {icon}
      <p>{text}</p>
      <Action onClick={go}>{label}</Action>
    </div>
  );
}
function LinePicture({ recipe }: { recipe: MenuSelection }) {
  const d = productFor(recipe);
  return (
    <span className="tk-line-picture">
      <Cup id={d.id} />
    </span>
  );
}
export function Bag({
  lang,
  bag,
  edit,
  pickup,
  menu,
}: Local & {
  bag: Line[];
  edit: (r: MenuSelection) => void;
  pickup: () => void;
  menu: () => void;
}) {
  const ru = lang === 'ru';
  return (
    <section className="tk-standard">
      <h1 className="tk-display">{ru ? 'Корзина' : 'Your bag'}</h1>
      {bag.length ? (
        <>
          <ul className="tk-list">
            {bag.map((item) => {
              const r = item.recipe,
                k = recipeKey(r),
                d = productFor(r);
              return (
                <li key={k} className="tk-line">
                  <LinePicture recipe={r} />
                  <div className="tk-line-body">
                    <button className="tk-line-title" onClick={() => edit(r)}>
                      {say(d.name, lang)}
                      <ArrowUpRight size={14} />
                    </button>
                    <p>{recipeParts(r, lang).join(' · ')}</p>
                    <b>{money(price(r) * item.qty, lang)}</b>
                    <div className="tk-line-actions">
                      <div className="tk-qty">
                        <button
                          aria-label={
                            ru ? 'Уменьшить количество' : 'Decrease quantity'
                          }
                          onClick={() => changeQty(k, -1)}
                        >
                          <Minus size={15} />
                        </button>
                        <output>{item.qty}</output>
                        <button
                          aria-label={
                            ru ? 'Увеличить количество' : 'Increase quantity'
                          }
                          disabled={item.qty >= 99}
                          onClick={() => changeQty(k, 1)}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      <button
                        className="tk-remove"
                        aria-label={
                          isBakery(r)
                            ? ru
                              ? 'Удалить выпечку'
                              : 'Remove pastry'
                            : ru
                              ? 'Удалить напиток'
                              : 'Remove drink'
                        }
                        onClick={() => forgetLine(k)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="tk-total">
            <span>{ru ? 'Итого' : 'Total'}</span>
            <strong>{money(bagTotal(bag), lang)}</strong>
          </div>
          <Action onClick={pickup}>
            {ru ? 'Выбрать самовывоз' : 'Choose pickup'}
          </Action>
          <button className="tk-secondary-link" onClick={menu}>
            {ru ? 'Добавить ещё кофе' : 'Add another coffee'}
          </button>
        </>
      ) : (
        <Empty
          icon={<ShoppingBag />}
          text={
            ru
              ? 'Корзина пока пуста. Какой кофе вам приготовить?'
              : 'Your bag is empty. Which coffee would you like?'
          }
          label={ru ? 'Открыть кофейную карту' : 'Browse the coffee menu'}
          go={menu}
        />
      )}
    </section>
  );
}
export function Pickup({
  lang,
  bag,
  bar,
  discount,
  pickupName,
  done,
  menu,
}: Local & {
  bag: Line[];
  bar: string;
  discount: number;
  pickupName: string;
  done: (t: Ticket) => void;
  menu: () => void;
}) {
  const ru = lang === 'ru';
  const [now, setNow] = useState(Date.now);
  const [choice, setChoice] = useState(0);
  const [expired, setExpired] = useState(false);
  const [redeem, setRedeem] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);
  const slots = pickupTimes(bar, now);
  const slot = slots.includes(choice) ? choice : slots[0];
  const needsChoice = expired || (choice !== 0 && !slots.includes(choice));
  const submit = async () => {
    if (submitting || (redeem && !discount)) return;
    setSubmitting(true);
    setSubmitFailed(false);
    try {
      const ticket = await checkout(bar, slot, redeem);
      if (ticket) done(ticket);
      else {
        setNow(Date.now());
        setChoice(0);
        setExpired(true);
      }
    } catch {
      setSubmitFailed(true);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section className="tk-standard">
      <h1 className="tk-display">{ru ? 'Самовывоз' : 'Pickup'}</h1>
      {!bag.length ? (
        <Empty
          icon={<ShoppingBag />}
          text={
            ru
              ? 'Для самовывоза выберите напиток.'
              : 'Choose a drink to arrange pickup.'
          }
          label={ru ? 'Открыть меню' : 'Open menu'}
          go={menu}
        />
      ) : (
        <>
          <h2>{ru ? 'Когда заберёте?' : 'Pickup time'}</h2>
          <div
            className="tk-times"
            role="group"
            aria-label={ru ? 'Время самовывоза' : 'Pickup time'}
          >
            {slots.map((t) => (
              <button
                key={t}
                aria-pressed={t === slot}
                onClick={() => {
                  setChoice(t);
                  setExpired(false);
                }}
              >
                <b>{timeOf(t)}</b>
                <small>{dateOf(t, lang)}</small>
              </button>
            ))}
          </div>
          {submitFailed && (
            <p role="alert">
              {ru
                ? 'Заказ не удалось сохранить. Попробуйте ещё раз.'
                : 'The order could not be saved. Please try again.'}
            </p>
          )}
          {needsChoice && (
            <p role="status">
              {ru
                ? 'Время обновилось. Подтвердите новый интервал.'
                : 'The time has changed. Confirm the new slot.'}
            </p>
          )}
          {pickupName && (
            <p className="tk-pickup-person">
              <UserRound size={17} />
              {(ru ? 'Имя для выдачи · ' : 'Pickup name · ') + pickupName}
            </p>
          )}
          {(discount > 0 || redeem) && (
            <label className="tk-redeem">
              <Stamp size={23} />
              <span>
                <b>{ru ? 'Использовать бонус' : 'Use a reward'}</b>
                <small>
                  {discount
                    ? (ru ? 'Скидка ' : 'Save ') + money(discount, lang)
                    : ru
                      ? 'Бонус уже использован. Снимите отметку для продолжения.'
                      : 'Reward already used. Uncheck to continue.'}
                </small>
              </span>
              <input
                type="checkbox"
                checked={redeem}
                onChange={(e) => setRedeem(e.target.checked)}
              />
            </label>
          )}
          <div className="tk-total">
            <span>{ru ? 'Итого' : 'Total'}</span>
            <strong>
              {money(bagTotal(bag) - (redeem ? discount : 0), lang)}
            </strong>
          </div>
          <p className="tk-disclosure">
            {ru
              ? 'Демо без оплаты. Чек и заказ в пульте бариста сохранятся на этом устройстве.'
              : 'A payment-free demo. The receipt and barista queue are saved on this device.'}
          </p>
          <Action
            onClick={submit}
            disabled={needsChoice || submitting || (redeem && !discount)}
          >
            {ru ? 'Подтвердить демо-заказ' : 'Confirm demo order'}
          </Action>
        </>
      )}
    </section>
  );
}
export function Saved({
  lang,
  saved,
  open,
  menu,
}: Local & { saved: Recipe[]; open: (r: Recipe) => void; menu: () => void }) {
  const ru = lang === 'ru';
  return (
    <section className="tk-standard">
      <h1 className="tk-display">{ru ? 'Мои рецепты' : 'My recipes'}</h1>
      {saved.length ? (
        <ul className="tk-list">
          {saved.map((r) => (
            <li className="tk-saved-line" key={recipeKey(r)}>
              <button className="tk-saved-open" onClick={() => open(r)}>
                <LinePicture recipe={r} />
                <span>
                  <b>{say(drinkById[r.drink].name, lang)}</b>
                  <small>{recipeParts(r, lang).join(' · ')}</small>
                  <strong>{money(price(r), lang)}</strong>
                </span>
              </button>
              <button
                className="tk-round"
                aria-label={ru ? 'Удалить из рецептов' : 'Remove saved recipe'}
                onClick={() => toggleSaved(r)}
              >
                <Bookmark size={18} fill="currentColor" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty
          icon={<Bookmark />}
          text={
            ru
              ? 'Соберите чашку и нажмите закладку рядом с рецептом. Здесь останутся ваши сочетания.'
              : 'Build a cup and tap the bookmark beside its recipe. Your combinations will appear here.'
          }
          label={ru ? 'Собрать кофе' : 'Build a coffee'}
          go={menu}
        />
      )}
    </section>
  );
}
export function Orders({
  lang,
  orders,
  open,
  menu,
  barista,
}: Local & {
  orders: Ticket[];
  open: (t: Ticket) => void;
  menu: () => void;
  barista: () => void;
}) {
  const ru = lang === 'ru';
  return (
    <section className="tk-standard">
      <h1 className="tk-display">{ru ? 'Мои заказы' : 'My orders'}</h1>
      {orders.length ? (
        <ul className="tk-list">
          {orders.map((t) => (
            <li key={t.id}>
              <button className="tk-order-link" onClick={() => open(t)}>
                <ReceiptText size={21} />
                <span>
                  <b>№ {ticketNumber(t)}</b>
                  <small>
                    {dateOf(t.pickup, lang)} · {timeOf(t.pickup)} ·{' '}
                    {say(stageName[stageOf(t)], lang)}
                  </small>
                </span>
                <strong>{money(ticketTotal(t), lang)}</strong>
                <ChevronRight size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty
          icon={<ReceiptText />}
          text={
            ru
              ? 'После первого демо-заказа здесь появится чек. По нему можно повторить весь заказ.'
              : 'Your first demo order will leave a receipt here. Use it to order the same drinks again.'
          }
          label={ru ? 'Выбрать кофе' : 'Choose coffee'}
          go={menu}
        />
      )}
      <button className="tk-secondary-link" onClick={barista}>
        {ru ? 'Открыть демо-пульт бариста' : 'Open demo barista counter'}
      </button>
    </section>
  );
}
export function Receipt({
  lang,
  ticket,
  repeat,
  menu,
  counter,
}: Local & {
  ticket: Ticket;
  repeat: () => void;
  menu: () => void;
  counter: () => void;
}) {
  const ru = lang === 'ru';
  const [confirmCancel, setConfirmCancel] = useState(false);
  return (
    <section className="tk-standard tk-receipt-page">
      <h1 className="tk-display">{ru ? 'Ваш чек' : 'Your receipt'}</h1>
      <div className="tk-ticket">
        <div className="tk-ticket-head">
          <span>{ru ? 'Самовывоз' : 'Pickup'}</span>
          <ReceiptText size={27} />
        </div>
        <small>{ru ? 'ДЕМО-ЗАКАЗ' : 'DEMO ORDER'}</small>
        <h2>№ {ticketNumber(ticket)}</h2>
        <div className="tk-status-line">
          <p className="tk-stage">
            <i />
            {say(stageName[stageOf(ticket)], lang)}
          </p>
          <button className="tk-text-button" onClick={counter}>
            {ru ? 'Пульт бариста' : 'Barista counter'}
            <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="tk-location-line">
          <Clock3 size={18} />
          <span>
            {dateOf(ticket.pickup, lang)} · {timeOf(ticket.pickup)}
          </span>
        </div>
        {ticket.pickupName && (
          <div className="tk-location-line">
            <UserRound size={18} />
            <span>{ticket.pickupName}</span>
          </div>
        )}
        <ul>
          {ticket.items.map((i) => (
            <li key={recipeKey(i.recipe)}>
              <img
                src={art(productFor(i.recipe).id)}
                alt=""
                width="38"
                height="48"
              />
              <span>
                <strong>
                  {i.qty} × {say(productFor(i.recipe).name, lang)}
                </strong>
                <small>{recipeParts(i.recipe, lang).join(' · ')}</small>
              </span>
              <b>{money(i.unit * i.qty, lang)}</b>
            </li>
          ))}
        </ul>
        {ticketDiscount(ticket) > 0 && (
          <div className="tk-ticket-discount">
            <span>{ru ? 'Бонус клуба' : 'Club reward'}</span>
            <b>−{money(ticketDiscount(ticket), lang)}</b>
          </div>
        )}
        <div className="tk-total">
          <span>{ru ? 'Итого' : 'Total'}</span>
          <strong>{money(ticketTotal(ticket), lang)}</strong>
        </div>
      </div>
      <Action onClick={repeat}>{ru ? 'Повторить заказ' : 'Order again'}</Action>
      {stageOf(ticket) === 'received' &&
        (confirmCancel ? (
          <div className="tk-cancel-confirm">
            <p>
              {ru
                ? 'Отменить этот заказ до начала приготовления?'
                : 'Cancel this order before brewing starts?'}
            </p>
            <button
              className="tk-text-button"
              onClick={() => setConfirmCancel(false)}
            >
              {ru ? 'Оставить заказ' : 'Keep order'}
            </button>
            <button
              className="tk-text-button"
              onClick={() => cancelTicket(ticket.id)}
            >
              {ru ? 'Подтвердить отмену' : 'Confirm cancellation'}
            </button>
          </div>
        ) : (
          <button
            className="tk-secondary-link"
            onClick={() => setConfirmCancel(true)}
          >
            {ru ? 'Отменить заказ' : 'Cancel order'}
          </button>
        ))}
      <button className="tk-secondary-link" onClick={menu}>
        {ru ? 'Вернуться в меню' : 'Back to menu'}
      </button>
    </section>
  );
}

export function Counter({ lang, orders }: Local & { orders: Ticket[] }) {
  const ru = lang === 'ru';
  const queue = orders
    .filter((t) => !['collected', 'cancelled'].includes(stageOf(t)))
    .sort((a, b) => a.pickup - b.pickup);
  return (
    <section className="tk-standard">
      <h1 className="tk-display">{ru ? 'Пульт бариста' : 'Barista counter'}</h1>
      <p className="tk-disclosure">
        {ru
          ? 'Здесь можно провести демо-заказ на этом устройстве от принятия до выдачи. Статус появится в чеке гостя.'
          : 'Move orders on this device from received to collected. The guest receipt shows each update.'}
      </p>
      {queue.length ? (
        queue.map((t) => (
          <article className="tk-barista-order" key={t.id}>
            <div className="tk-panel-heading">
              <h2>
                № {ticketNumber(t)}{' '}
                {t.pickupName && <small>· {t.pickupName}</small>}
              </h2>
              <b>{timeOf(t.pickup)}</b>
            </div>
            <p>
              {dateOf(t.pickup, lang)} · {say(stageName[stageOf(t)], lang)}
            </p>
            <ul>
              {t.items.map((i) => (
                <li key={recipeKey(i.recipe)}>
                  <b>
                    {i.qty} × {say(productFor(i.recipe).name, lang)}
                  </b>
                  <small>{recipeParts(i.recipe, lang).join(' · ')}</small>
                </li>
              ))}
            </ul>
            <Action onClick={() => advanceTicket(t)}>
              {say(
                (
                  {
                    received: ['Начать приготовление', 'Start brewing'],
                    brewing: ['Готов к выдаче', 'Mark ready'],
                    ready: ['Выдать заказ', 'Mark collected'],
                    collected: stageName.collected,
                    cancelled: stageName.cancelled,
                  } as const
                )[stageOf(t)],
                lang,
              )}
            </Action>
          </article>
        ))
      ) : (
        <p className="tk-disclosure">
          {ru
            ? 'В этой очереди пока нет заказов.'
            : 'There are no orders in this queue.'}
        </p>
      )}
    </section>
  );
}

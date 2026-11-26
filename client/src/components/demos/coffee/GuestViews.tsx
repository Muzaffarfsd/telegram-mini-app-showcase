import { useState } from 'react';
import { HomeEdit } from './HomeEdit';
import {
  Bookmark,
  ChevronRight,
  Coffee,
  Pencil,
  ReceiptText,
  RotateCcw,
  Sparkle,
  Stamp,
  Ticket,
} from 'lucide-react';
import { money, say, type Locale, type Recipe } from './menu';
import {
  clubBalance,
  dateOf,
  rewardLimit,
  savePickupName,
  stageName,
  stageOf,
  stampsPerReward,
  ticketNumber,
  timeOf,
  type Cabinet,
  type Ticket as CoffeeTicket,
} from './orders';
import { Sheet } from './MenuView';

import { Campaign, type FeaturedDrink } from './Campaign';
type GuestProps = { lang: Locale; data: Cabinet };
function StampRow({ stamps, reward }: { stamps: number; reward: boolean }) {
  return (
    <div aria-hidden="true" className="tk-stamps">
      {Array.from({ length: stampsPerReward }, (_, i) => (
        <span key={i} className={i < stamps ? 'is-stamped' : ''}>
          <Coffee size={21} />
        </span>
      ))}
      <i />
      <span className={'tk-prize' + (reward ? ' is-stamped' : '')}>
        <Sparkle size={23} />
      </span>
    </div>
  );
}
export function ClubCard({
  lang,
  data,
  open,
}: GuestProps & { open?: () => void }) {
  const ru = lang === 'ru',
    balance = clubBalance(data.orders);
  const card = (
    <>
      <div className="tk-club-heading">
        <span>
          <Stamp size={17} />
          {ru ? 'Клуб гостей' : 'Coffee club'}
        </span>
        {open && <ChevronRight size={19} />}
      </div>
      <strong>
        {balance.rewards > 0
          ? (ru ? 'Доступно бонусов · ' : 'Available rewards · ') +
            balance.rewards
          : (ru ? 'Отметки · ' : 'Stamps · ') +
            balance.stamps +
            ' / ' +
            stampsPerReward}
      </strong>
      <StampRow stamps={balance.stamps} reward={balance.rewards > 0} />
      <p>
        {ru
          ? 'Пять чашек — скидка до 200 сом на следующую.'
          : 'Five cups earn up to 200 KGS off your next one.'}
      </p>
    </>
  );
  return open ? (
    <button className="tk-club-card" onClick={open}>
      {card}
    </button>
  ) : (
    <div className="tk-club-card">{card}</div>
  );
}
export function CoffeeHome({
  lang,
  data,
  build,
  menu,
  openClub,
  arc,
  setArc,
  openBag,
  receipt,
  slide,
  setSlide,
  featured,
  feature,
}: GuestProps & {
  build: (r: Recipe) => void;
  menu: () => void;
  openClub: () => void;
  arc: number;
  setArc: (n: number) => void;
  openBag: () => void;
  receipt: (t: CoffeeTicket) => void;
  slide: number;
  setSlide: (n: number) => void;
  featured?: FeaturedDrink;
  feature: (drink: FeaturedDrink) => void;
}) {
  const active = data.orders.find((t) =>
    ['received', 'brewing', 'ready'].includes(stageOf(t)),
  );
  return (
    <div className="tk-home-page">
      {active && (
        <button className="tk-live-order" onClick={() => receipt(active)}>
          <ReceiptText size={23} />
          <span>
            <b>
              {say(stageName[stageOf(active)], lang)} · № {ticketNumber(active)}
            </b>
            <small>
              {dateOf(active.pickup, lang)} · {timeOf(active.pickup)}
            </small>
          </span>
          <ChevronRight size={19} />
        </button>
      )}
      <Campaign
        lang={lang}
        selected={featured}
        select={feature}
        build={build}
        menu={menu}
      />
      <HomeEdit
        lang={lang}
        bag={data.bag}
        build={build}
        catalogue={menu}
        openBag={openBag}
        slide={slide}
        setSlide={setSlide}
        arc={arc}
        setArc={setArc}
      />
      <div className="tk-home-extras">
        <ClubCard lang={lang} data={data} open={openClub} />
      </div>
    </div>
  );
}
export function GuestProfile({
  lang,
  data,
  saved,
  orders,
  counter,
  editName,
  club,
  close,
  panel,
}: GuestProps & {
  saved: () => void;
  orders: () => void;
  counter: () => void;
  editName: () => void;
  club: () => void;
  close: () => void;
  panel?: string;
}) {
  const ru = lang === 'ru';
  return (
    <section className="tk-profile-page">
      <h1 className="tk-page-title">{ru ? 'Профиль' : 'Profile'}</h1>
      <button className="tk-guest-name" onClick={editName}>
        <span className="tk-monogram" aria-hidden="true">
          {data.pickupName ? (
            Array.from(data.pickupName)[0].toLocaleUpperCase()
          ) : (
            <Coffee size={24} />
          )}
        </span>
        <span>
          <strong>{data.pickupName || (ru ? 'Гость' : 'Guest')}</strong>
          <small>
            {data.pickupName
              ? ru
                ? 'Имя для выдачи'
                : 'Pickup name'
              : ru
                ? 'Добавить имя для выдачи'
                : 'Add a pickup name'}
          </small>
        </span>
        <Pencil size={17} />
      </button>
      <ClubCard lang={lang} data={data} open={club} />
      <div className="tk-account-links">
        <button onClick={saved}>
          <Bookmark size={21} />
          <span>{ru ? 'Мои рецепты' : 'My recipes'}</span>
          <small>{data.saved.length}</small>
          <ChevronRight size={15} />
        </button>
        <button onClick={orders}>
          <ReceiptText size={21} />
          <span>{ru ? 'История заказов' : 'Order history'}</span>
          <small>{data.orders.length}</small>
          <ChevronRight size={15} />
        </button>
        <button onClick={counter}>
          <Coffee size={21} />
          <span>{ru ? 'Демо-пульт бариста' : 'Demo barista counter'}</span>
          <ChevronRight size={15} />
        </button>
      </div>
      {panel === 'name' && (
        <NameEditor lang={lang} name={data.pickupName} close={close} />
      )}
    </section>
  );
}
export function ClubRules({
  lang,
  data,
  close,
}: GuestProps & { close: () => void }) {
  const ru = lang === 'ru';
  return (
    <Sheet
      lang={lang}
      title={ru ? 'Как работает клуб' : 'How the club works'}
      close={close}
    >
      <div className="tk-club-rules">
        <ClubCard lang={lang} data={data} />
        <p>
          <Coffee size={18} />
          {ru
            ? 'За каждый полученный напиток начисляется одна отметка.'
            : 'Collect one stamp for each drink you pick up.'}
        </p>
        <p>
          <Ticket size={18} />
          {ru
            ? 'Пять отметок дают скидку до ' +
              money(rewardLimit, lang) +
              ' на один напиток. Выберите бонус при оформлении самовывоза.'
            : 'Five stamps give up to ' +
              money(rewardLimit, lang) +
              ' off one drink. Apply it at pickup checkout.'}
        </p>
        <p>
          <RotateCcw size={18} />
          {ru
            ? 'Чашка со скидкой не приносит отметку. При отмене заказа бонус возвращается.'
            : 'A discounted cup earns no stamp. Cancelling an order restores its reward.'}
        </p>
      </div>
      <button className="tk-sheet-done" onClick={close}>
        {ru ? 'Понятно' : 'Got it'}
      </button>
    </Sheet>
  );
}
function NameEditor({
  lang,
  name,
  close,
}: {
  lang: Locale;
  name: string;
  close: () => void;
}) {
  const [draft, setDraft] = useState(name),
    ru = lang === 'ru';
  return (
    <Sheet
      lang={lang}
      title={ru ? 'Имя для выдачи' : 'Pickup name'}
      close={close}
    >
      <form
        className="tk-name-form"
        onSubmit={(e) => {
          e.preventDefault();
          savePickupName(draft);
          close();
        }}
      >
        <label>
          {ru ? 'Как к вам обращаться?' : 'What should we call you?'}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={36}
            autoComplete="given-name"
            placeholder={ru ? 'Ваше имя' : 'Your name'}
          />
        </label>
        <p>
          {ru
            ? 'Это имя будет в чеке и у бариста на этом устройстве.'
            : 'This name appears on the receipt and the barista screen on this device.'}
        </p>
        <button type="submit" className="tk-sheet-done">
          {ru ? 'Сохранить' : 'Save'}
        </button>
      </form>
    </Sheet>
  );
}

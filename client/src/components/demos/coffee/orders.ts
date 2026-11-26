import { useSyncExternalStore } from 'react';
import {
  type Copy,
  type Locale,
  type Recipe,
  type MenuSelection,
  isBakery,
  validSelection,
  price,
  recipeKey,
  validRecipe,
} from './menu';

export const bars = [
  {
    id: 'boulevard',
    name: ['Бульвар', 'Boulevard'] as Copy,
    location: [
      'Бишкек · бульвар Эркиндик',
      'Bishkek · Erkindik Boulevard',
    ] as Copy,
    open: 8,
    close: 21,
  },
  {
    id: 'park',
    name: ['У парка', 'Parkside'] as Copy,
    location: ['Бишкек · парк Ататюрка', 'Bishkek · Atatürk Park'] as Copy,
    open: 9,
    close: 20,
  },
];
export const barFor = (id: string) => bars.find((b) => b.id === id) ?? bars[0];
const zone = 'Asia/Bishkek';
const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: zone,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const quarter = 15 * 60000;
export const timeOf = (time: number) => clock.format(time);
export const dateOf = (time: number, lang: Locale) =>
  new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    timeZone: zone,
    month: 'short',
    day: 'numeric',
  }).format(time);
export function pickupTimes(barId: string, now = Date.now()) {
  const bar = barFor(barId);
  const first = Math.ceil((now + 10 * 60000) / quarter) * quarter;
  const slots: number[] = [];
  for (let t = first; slots.length < 6; t += quarter) {
    const hour = Number(timeOf(t).slice(0, 2));
    if (hour >= bar.open && hour < bar.close) slots.push(t);
  }
  return slots;
}
export function availablePickup(barId: string, time: number, now = Date.now()) {
  return pickupTimes(barId, now).includes(time);
}

export type Line = { recipe: MenuSelection; qty: number };
export const stages = ['received', 'brewing', 'ready', 'collected'] as const;
type Stage = (typeof stages)[number] | 'cancelled';
export const stageName: Record<Stage, Copy> = {
  received: ['Принят', 'Received'],
  brewing: ['Готовится', 'Brewing'],
  ready: ['Готов к выдаче', 'Ready for pickup'],
  collected: ['Выдан', 'Collected'],
  cancelled: ['Отменён', 'Cancelled'],
};
export type Ticket = {
  id: string;
  created: number;
  bar: string;
  pickup: number;
  stage: Stage;
  items: (Line & { unit: number })[];
  reward?: number;
  pickupName?: string;
};
export type Cabinet = {
  bag: Line[];
  saved: Recipe[];
  orders: Ticket[];
  bar: string;
  pickupName: string;
};
const key = 'web4tg-takt-coffee-v1';
const blank = (): Cabinet => ({
  bag: [],
  saved: [],
  orders: [],
  bar: bars[0].id,
  pickupName: '',
});
const validLine = (item: Line) =>
  item &&
  validSelection(item.recipe) &&
  Number.isSafeInteger(item.qty) &&
  item.qty > 0 &&
  item.qty <= 99;
function decode(raw: string | null): Cabinet {
  if (!raw) return blank();
  try {
    const data = JSON.parse(raw);
    return {
      bag: Array.isArray(data.bag) ? data.bag.filter(validLine) : [],
      saved: Array.isArray(data.saved) ? data.saved.filter(validRecipe) : [],
      orders: Array.isArray(data.orders)
        ? data.orders.filter(
            (t: Ticket) =>
              t &&
              typeof t.id === 'string' &&
              Number.isFinite(t.created) &&
              Number.isFinite(t.pickup) &&
              bars.some((b) => b.id === t.bar) &&
              Array.isArray(t.items) &&
              t.items.length > 0 &&
              t.items.every(
                (i) => validLine(i) && Number.isFinite(i.unit) && i.unit >= 0,
              ),
          )
        : [],
      bar: barFor(data.bar).id,
      pickupName:
        typeof data.pickupName === 'string'
          ? data.pickupName.trim().slice(0, 36)
          : '',
    };
  } catch {
    return blank();
  }
}

let current: Cabinet = blank();
let rawCache: string | null | undefined;
let memoryOnly = false;
function snapshot() {
  if (memoryOnly) return current;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== rawCache) {
      current = decode(raw);
      rawCache = raw;
    }
  } catch {
    memoryOnly = true;
  }
  return current;
}
const localEvent = 'takt-cabinet-changed';
function subscribe(listener: () => void) {
  function changed(event: StorageEvent) {
    if (!event.key || event.key === key) listener();
  }
  window.addEventListener('storage', changed);
  window.addEventListener(localEvent, listener);
  return () => {
    window.removeEventListener('storage', changed);
    window.removeEventListener(localEvent, listener);
  };
}
export const useCabinet = () =>
  useSyncExternalStore(subscribe, snapshot, snapshot);
export const temporaryStorage = () => memoryOnly;
function update(change: (s: Cabinet) => Cabinet) {
  const prev = snapshot();
  const next = change(prev);
  if (next === prev) return;
  const raw = JSON.stringify(next);
  try {
    localStorage.setItem(key, raw);
    memoryOnly = false;
  } catch {
    memoryOnly = true;
  }
  current = next;
  rawCache = raw;
  window.dispatchEvent(new Event(localEvent));
}
export function toggleSaved(recipe: Recipe) {
  const k = recipeKey(recipe);
  update((s) => ({
    ...s,
    saved: s.saved.some((r) => recipeKey(r) === k)
      ? s.saved.filter((r) => recipeKey(r) !== k)
      : [recipe, ...s.saved],
  }));
}
function combine(bag: Line[], recipe: MenuSelection, qty: number): Line[] {
  const k = recipeKey(recipe);
  const same = bag.find((i) => recipeKey(i.recipe) === k);
  return same
    ? bag.map((i) =>
        i === same ? { ...i, qty: Math.min(99, i.qty + qty) } : i,
      )
    : [...bag, { recipe, qty }];
}
export function addRecipe(recipe: MenuSelection, editing?: string) {
  update((s) => {
    const line = editing && s.bag.find((i) => recipeKey(i.recipe) === editing);
    const rest = line ? s.bag.filter((i) => i !== line) : s.bag;
    return { ...s, bag: combine(rest, recipe, line ? line.qty : 1) };
  });
}
export function changeQty(k: string, delta: number) {
  update((s) => ({
    ...s,
    bag: s.bag
      .map((i) =>
        recipeKey(i.recipe) === k
          ? { ...i, qty: Math.min(99, i.qty + delta) }
          : i,
      )
      .filter((i) => i.qty > 0),
  }));
}
export const forgetLine = (k: string) =>
  update((s) => ({
    ...s,
    bag: s.bag.filter((i) => recipeKey(i.recipe) !== k),
  }));
export const chooseBar = (bar: string) =>
  update((s) => ({ ...s, bar: barFor(bar).id }));
export const savePickupName = (name: string) =>
  update((s) => ({ ...s, pickupName: name.trim().slice(0, 36) }));
export const bagTotal = (items: Line[]) =>
  items.reduce((sum, i) => sum + price(i.recipe) * i.qty, 0);
export const stampsPerReward = 5;
export const rewardLimit = 200;
export const ticketDiscount = (t: Ticket) =>
  Number.isFinite(t.reward) && t.reward! > 0
    ? Math.min(t.reward!, rewardLimit)
    : 0;
export const ticketTotal = (t: Ticket) =>
  Math.max(
    0,
    t.items.reduce((sum, i) => sum + i.unit * i.qty, 0) - ticketDiscount(t),
  );

export function clubBalance(orders: Ticket[]) {
  let stamps = 0;
  for (const ticket of orders) {
    const stage = stageOf(ticket);
    if (stage === 'cancelled') continue;
    const redeemed = ticketDiscount(ticket) > 0;
    if (redeemed) stamps -= stampsPerReward;
    if (stage === 'collected') {
      stamps +=
        ticket.items.reduce(
          (count, item) => count + (isBakery(item.recipe) ? 0 : item.qty),
          0,
        ) - (redeemed ? 1 : 0);
    }
  }
  const available = Math.max(0, stamps);
  return {
    stamps: available % stampsPerReward,
    rewards: Math.floor(available / stampsPerReward),
  };
}
export function availableDiscount(s: Pick<Cabinet, 'orders' | 'bag'>) {
  if (!s.bag.length || clubBalance(s.orders).rewards < 1) return 0;
  return Math.min(
    rewardLimit,
    s.bag.reduce(
      (highest, item) =>
        isBakery(item.recipe) ? highest : Math.max(highest, price(item.recipe)),
      0,
    ),
  );
}

function completePurchase(bar: string, pickup: number, useReward: boolean) {
  let ticket: Ticket | undefined;
  update((s) => {
    const created = Date.now();
    if (
      !s.bag.length ||
      !bars.some((b) => b.id === bar) ||
      !availablePickup(bar, pickup, created)
    )
      return s;
    const reward = useReward ? availableDiscount(s) : 0;
    if (useReward && !reward) return s;
    ticket = {
      ...(reward ? { reward } : {}),
      ...(s.pickupName && { pickupName: s.pickupName }),
      id: crypto.randomUUID(),
      created,
      bar,
      pickup,
      stage: 'received',
      items: s.bag.map((i) => ({ ...i, unit: price(i.recipe) })),
    };
    return { ...s, bar, bag: [], orders: [ticket, ...s.orders] };
  });
  return ticket;
}
export async function checkout(bar: string, pickup: number, useReward = false) {
  const purchase = () => completePurchase(bar, pickup, useReward);
  try {
    return globalThis.navigator?.locks
      ? await navigator.locks.request(key + '-checkout', purchase)
      : purchase();
  } catch (error) {
    if (
      error instanceof DOMException &&
      ['SecurityError', 'NotSupportedError'].includes(error.name)
    )
      return purchase();
    throw error;
  }
}
export function repeatOrder(ticket: Ticket) {
  update((s) => ({
    ...s,
    bag: ticket.items.reduce(
      (bag, item) => combine(bag, item.recipe, item.qty),
      s.bag,
    ),
  }));
}
export const ticketNumber = (ticket: Ticket) =>
  ticket.id.slice(0, 6).toUpperCase();
export const stageOf = (t: Ticket): Stage =>
  Object.hasOwn(stageName, t.stage) ? t.stage : 'received';
export function advanceTicket(ticket: Ticket) {
  const stage = stageOf(ticket);
  if (stage === 'cancelled') return;
  const next = stages[stages.indexOf(stage) + 1];
  if (!next) return;
  update((s) => ({
    ...s,
    orders: s.orders.map((t) =>
      t.id === ticket.id && stageOf(t) === stageOf(ticket)
        ? { ...t, stage: next }
        : t,
    ),
  }));
}
export function cancelTicket(id: string) {
  update((s) => ({
    ...s,
    orders: s.orders.map((t) =>
      t.id === id && stageOf(t) === 'received'
        ? { ...t, stage: 'cancelled' }
        : t,
    ),
  }));
}

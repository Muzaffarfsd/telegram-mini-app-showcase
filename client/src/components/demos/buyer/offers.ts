import { currencyCode, type Currency } from './markets';
export type Offer = {
  id: string;
  supplier: string;
  currency: Currency;
  quantity: number;
  unit: number;
  shipping: number | null;
  fee: number | null;
  other: number | null;
  lead: string;
};
export type ChangeOffer =
  | { type: 'add' | 'edit'; offer: Offer }
  | { type: 'remove'; id: string };
const cost = (x: unknown): x is number =>
  typeof x === 'number' &&
  Number.isFinite(x) &&
  x >= 0 &&
  x <= 999999999 &&
  Number.isSafeInteger(Math.round(x * 100));
export function isOffer(input: unknown): input is Offer {
  if (!input || typeof input !== 'object') return false;
  const o = input as Partial<Offer>;
  return (
    typeof o.id === 'string' &&
    !!o.id &&
    o.id.length <= 90 &&
    typeof o.supplier === 'string' &&
    !!o.supplier.trim() &&
    o.supplier.length <= 100 &&
    !!currencyCode(o.currency) &&
    typeof o.quantity === 'number' &&
    Number.isInteger(o.quantity) &&
    o.quantity >= 1 &&
    o.quantity <= 99999 &&
    cost(o.unit) &&
    o.unit > 0 &&
    [o.shipping, o.fee, o.other].every((x) => x === null || cost(x)) &&
    Number.isSafeInteger(
      Math.round(o.unit * 100) * o.quantity +
        Math.round((o.shipping ?? 0) * 100) +
        Math.round((o.fee ?? 0) * 100) +
        Math.round((o.other ?? 0) * 100),
    ) &&
    typeof o.lead === 'string' &&
    o.lead.length <= 80
  );
}
export function offersFrom(raw: unknown): Offer[] {
  return Array.isArray(raw) ? raw.filter(isOffer).slice(0, 12) : [];
}
export function offerTotals(o: Offer) {
  const minor = (n: number) => Math.round(n * 100);
  const totalMinor =
    minor(o.unit) * o.quantity +
    minor(o.shipping ?? 0) +
    minor(o.fee ?? 0) +
    minor(o.other ?? 0);
  return {
    total: totalMinor / 100,
    perUnit: Math.round(totalMinor / o.quantity) / 100,
    complete: o.shipping !== null && o.fee !== null && o.other !== null,
  };
}

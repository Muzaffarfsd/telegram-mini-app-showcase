import { translations } from '../lib/translations';
import { appTemplatesBase, availableFeaturesBase, storeCategories, subscriptionPlansBase } from './orderCatalog';
import type { OrderContractInput } from './orderContractData';

const STORAGE_KEY = 'web4tg:order-draft:v1';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
type ReadOnlyStorage = { getItem: (key: string) => string | null };
export type OrderContractSelection = Omit<OrderContractInput, 'customer'>;

const russianText = (key: string): string => {
  const value = key.split('.').reduce<unknown>((part, item) => part && typeof part === 'object' ? (part as Record<string, unknown>)[item] : undefined, translations.ru);
  return typeof value === 'string' ? value : key;
};

/** Read the same bounded order draft as the constructor, with no writes or customer details. */
export function readOrderContractSelection(storage: ReadOnlyStorage | null, now: number): OrderContractSelection | null {
  if (!storage || !Number.isFinite(now)) return null;
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const record: unknown = JSON.parse(saved);
    if (!record || typeof record !== 'object') return null;
    const { version, savedAt, draft } = record as Record<string, unknown>;
    if (version !== 1 || typeof savedAt !== 'number' || !Number.isFinite(savedAt) || savedAt > now || now - savedAt > MAX_AGE || !draft || typeof draft !== 'object') return null;
    const raw = draft as Record<string, unknown>;
    const template = appTemplatesBase.find(item => item.id === raw.templateId);
    if (!template || !Array.isArray(raw.extras) || typeof raw.projectName !== 'string' || typeof raw.annual !== 'boolean' || typeof raw.step !== 'number' || !Number.isInteger(raw.step) || raw.step < 1 || raw.step > 3) return null;
    if (raw.planId !== null && (typeof raw.planId !== 'string' || !subscriptionPlansBase.some(plan => plan.id === raw.planId))) return null;
    const category = template.id === 'ecommerce-basic' && typeof raw.storeCategory === 'string' ? storeCategories.find(item => item.id === raw.storeCategory) : undefined;
    const included = new Set([
      ...availableFeaturesBase.filter(item => item.included).map(item => item.id),
      ...template.features,
    ]);
    const extras = new Set(raw.extras.filter((item): item is string => typeof item === 'string'));
    const selectedExtras = availableFeaturesBase.filter(item => !item.included && !included.has(item.id) && extras.has(item.id));
    const plan = subscriptionPlansBase.find(item => item.id === raw.planId);
    return {
      direction: category?.fullRu || (template.id === 'restaurant' ? 'Ресторан и доставка' : russianText(template.nameKey)),
      projectName: raw.projectName.slice(0, 80),
      includedFeatures: availableFeaturesBase.filter(item => included.has(item.id)).map(item => russianText(item.nameKey)),
      extraFeatures: selectedExtras.map(item => ({ name: russianText(item.nameKey), price: item.price })),
      estimatedTotal: template.estimatedPrice + selectedExtras.reduce((total, item) => total + item.price, 0),
      support: plan ? { name: russianText(plan.nameKey), price: raw.annual ? plan.price * 10 : plan.price, period: raw.annual ? 'year' : 'month' } : null,
    };
  } catch {
    // Storage may be unavailable or the record invalid; do not alter the user's order.
    return null;
  }
}

import type { OrderContractSelection } from './orderContractSelection';

const KEY = 'web4tg:contract-draft:v1';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

/** Save only catalogue choices. Free text and customer information never enter storage. */
export function saveContractDraft(storage: Storage, selection: OrderContractSelection, now = Date.now()) {
  if (!selection.direction) return;
  const { direction, includedFeatures, extraFeatures, estimatedTotal, support } = selection;
  try { storage.setItem(KEY, JSON.stringify({ version: 1, savedAt: now, selection: { direction, includedFeatures, extraFeatures, estimatedTotal, support } })); } catch { /* Storage may be disabled. */ }
}

export function readContractDraft(storage: Storage, now = Date.now()): OrderContractSelection | null {
  try {
    const raw = storage.getItem(KEY);
    if (!raw || raw.length > 20000) return null;
    const record = JSON.parse(raw);
    if (record.version !== 1 || typeof record.savedAt !== 'number' || !Number.isFinite(record.savedAt) || record.savedAt > now || now - record.savedAt > MAX_AGE) return null;
    const s = record.selection;
    if (!s || typeof s.direction !== 'string' || s.direction.length > 120 || !Array.isArray(s.includedFeatures) || !Array.isArray(s.extraFeatures) || s.includedFeatures.length > 100 || s.extraFeatures.length > 100) return null;
    if (!s.includedFeatures.every((x: unknown) => typeof x === 'string' && x.length <= 200) || !s.extraFeatures.every((x: any) => x && typeof x.name === 'string' && x.name.length <= 200 && typeof x.price === 'number' && Number.isFinite(x.price) && x.price >= 0)) return null;
    if (s.estimatedTotal !== null && (typeof s.estimatedTotal !== 'number' || !Number.isFinite(s.estimatedTotal) || s.estimatedTotal < 0)) return null;
    if (s.support !== null && (!s.support || typeof s.support.name !== 'string' || s.support.name.length > 120 || typeof s.support.price !== 'number' || !Number.isFinite(s.support.price) || s.support.price < 0 || !['month', 'year'].includes(s.support.period))) return null;
    return { direction: s.direction, projectName: '', includedFeatures: s.includedFeatures, extraFeatures: s.extraFeatures, estimatedTotal: s.estimatedTotal, support: s.support };
  } catch { return null; }
}

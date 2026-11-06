import { useCallback, useEffect, useRef, useState } from 'react';
import { appTemplatesBase, availableFeaturesBase, subscriptionPlansBase } from './orderCatalog';

/** Drafts remain on this device until replaced, removed, or expired. */
export type OrderDraft = {
  step: number;
  templateId: string | null;
  extras: string[];
  projectName: string;
  planId: string | null;
  annual: boolean;
};

const STORAGE_KEY = 'web4tg:order-draft:v1';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const templateIds = new Set(appTemplatesBase.map((item) => item.id));
const featureIds = new Set(availableFeaturesBase.filter((item) => !item.included).map((item) => item.id));
const planIds = new Set(subscriptionPlansBase.map((item) => item.id));

function normalizeDraft(value: unknown): OrderDraft | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.templateId !== 'string' || !templateIds.has(raw.templateId)) return null;
  if (!Array.isArray(raw.extras) || typeof raw.projectName !== 'string' || typeof raw.annual !== 'boolean') return null;
  if (raw.planId !== null && (typeof raw.planId !== 'string' || !planIds.has(raw.planId))) return null;
  if (typeof raw.step !== 'number' || !Number.isInteger(raw.step) || raw.step < 1 || raw.step > 3) return null;
  const extras = [...new Set(raw.extras.filter((id): id is string => typeof id === 'string' && featureIds.has(id)))];
  return {
    step: raw.step,
    templateId: raw.templateId,
    extras,
    projectName: raw.projectName.slice(0, 80),
    planId: raw.planId as string | null,
    annual: raw.annual,
  };
}

function readDraft(): { draft: OrderDraft | null; available: boolean } {
  if (typeof window === 'undefined') return { draft: null, available: false };
  let saved: string | null;
  try {
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { draft: null, available: false };
  }
  if (!saved) return { draft: null, available: true };
  try {
    const record: unknown = JSON.parse(saved);
    if (!record || typeof record !== 'object') throw new Error('Invalid draft');
    const { version, savedAt, draft } = record as Record<string, unknown>;
    if (version !== 1 || typeof savedAt !== 'number' || !Number.isFinite(savedAt) || savedAt > Date.now() || Date.now() - savedAt > MAX_AGE) {
      window.localStorage.removeItem(STORAGE_KEY);
      return { draft: null, available: true };
    }
    const normalized = normalizeDraft(draft);
    if (!normalized) window.localStorage.removeItem(STORAGE_KEY);
    return { draft: normalized, available: true };
  } catch {
    // Invalid or unreadable data should not block the order flow.
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be restricted. */ }
    return { draft: null, available: true };
  }
}

export function useOrderDraft(current: OrderDraft) {
  const [ready, setReady] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<OrderDraft | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [saveGeneration, setSaveGeneration] = useState(0);
  const skipNextSave = useRef(false);

  useEffect(() => {
    const saved = readDraft();
    setPendingDraft(saved.draft);
    setStorageAvailable(saved.available);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || pendingDraft) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const draft = normalizeDraft(current);
    if (!draft || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), draft }));
      setStorageAvailable(true);
    } catch {
      // The current order still works even if local storage is blocked or full.
      setStorageAvailable(false);
    }
  }, [ready, pendingDraft, saveGeneration, current.step, current.templateId, current.extras, current.projectName, current.planId, current.annual]);

  const restoreDraft = useCallback((apply: (draft: OrderDraft) => void) => {
    if (!pendingDraft) return;
    // Keep the original saved value until the caller has applied all fields.
    skipNextSave.current = true;
    apply(pendingDraft);
    setPendingDraft(null);
  }, [pendingDraft]);

  const startNew = useCallback((reset: () => void) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // A blocked storage should not prevent the user starting over.
    }
    skipNextSave.current = true;
    reset();
    setPendingDraft(null);
    setSaveGeneration((generation) => generation + 1);
  }, []);

  return { ready, pendingDraft, storageAvailable, restoreDraft, startNew };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  industryNames,
  taskNames,
  type ConsultantChannel,
  type ConsultantIndustry,
  type ConsultantTask,
  type ConsultantTone,
} from './consultantJourneyData';

/** Preferences remain on this device until replaced, removed, or expired. */
export type ConsultantDraft = {
  industry: ConsultantIndustry;
  industryChosen: boolean;
  channel: ConsultantChannel | null;
  selectedTasks: ConsultantTask[];
  tone: ConsultantTone | null;
  projectName: string;
};

const STORAGE_KEY = 'web4tg:consultant-draft:v1';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const industries = new Set(Object.keys(industryNames));
const tasks = new Set(Object.keys(taskNames));
const channels = new Set(['app', 'chat', 'both']);
const tones = new Set(['warm', 'business']);

function normalize(value: unknown): ConsultantDraft | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.industry !== 'string' || !industries.has(raw.industry) || typeof raw.industryChosen !== 'boolean') return null;
  if (raw.channel !== null && (typeof raw.channel !== 'string' || !channels.has(raw.channel))) return null;
  if (raw.tone !== null && (typeof raw.tone !== 'string' || !tones.has(raw.tone))) return null;
  if (!Array.isArray(raw.selectedTasks) || raw.selectedTasks.some((task) => typeof task !== 'string' || !tasks.has(task))) return null;
  if (typeof raw.projectName !== 'string') return null;
  return {
    industry: raw.industry as ConsultantIndustry,
    industryChosen: raw.industryChosen,
    channel: raw.channel as ConsultantChannel | null,
    selectedTasks: [...new Set(raw.selectedTasks)] as ConsultantTask[],
    tone: raw.tone as ConsultantTone | null,
    projectName: raw.projectName.slice(0, 80),
  };
}

function hasPreferences(draft: ConsultantDraft): boolean {
  return draft.industryChosen || draft.channel !== null || draft.selectedTasks.length > 0 || draft.tone !== null || draft.projectName.trim().length > 0;
}

function readDraft(): { draft: ConsultantDraft | null; available: boolean } {
  if (typeof window === 'undefined') return { draft: null, available: false };
  let saved: string | null;
  try {
    saved = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { draft: null, available: false };
  }
  if (!saved) return { draft: null, available: true };
  const discardInvalid = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return { draft: null, available: true };
    } catch {
      return { draft: null, available: false };
    }
  };
  try {
    const record: unknown = JSON.parse(saved);
    if (!record || typeof record !== 'object') throw new Error('Invalid draft');
    const { version, savedAt, draft } = record as Record<string, unknown>;
    if (version !== 1 || typeof savedAt !== 'number' || !Number.isFinite(savedAt) || savedAt > Date.now() || Date.now() - savedAt > MAX_AGE) {
      return discardInvalid();
    }
    const valid = normalize(draft);
    if (!valid || !hasPreferences(valid)) {
      return discardInvalid();
    }
    return { draft: valid, available: true };
  } catch {
    return discardInvalid();
  }
}

/** Only save once the user is configuring; browsing the demo alone does not create a draft. */
export function useConsultantDraft(current: ConsultantDraft, enabled: boolean) {
  const [ready, setReady] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<ConsultantDraft | null>(null);
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
    if (!ready || pendingDraft || typeof window === 'undefined') return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (!enabled) return;
    const draft = normalize(current);
    if (!draft) return;
    try {
      if (hasPreferences(draft)) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), draft }));
      else window.localStorage.removeItem(STORAGE_KEY);
      setStorageAvailable(true);
    } catch {
      // Do not interrupt the current configuration if browser storage is unavailable.
      setStorageAvailable(false);
    }
  }, [ready, pendingDraft, enabled, saveGeneration, current.industry, current.industryChosen, current.channel, current.selectedTasks, current.tone, current.projectName]);

  const restoreDraft = useCallback((apply: (draft: ConsultantDraft) => void) => {
    if (!pendingDraft) return;
    skipNextSave.current = true;
    apply(pendingDraft);
    setPendingDraft(null);
  }, [pendingDraft]);

  const startNew = useCallback((reset: () => void) => {
    try { if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY); } catch { /* Continue without storage. */ }
    skipNextSave.current = true;
    reset();
    setPendingDraft(null);
    setSaveGeneration((generation) => generation + 1);
  }, []);

  return { ready, pendingDraft, storageAvailable, restoreDraft, startNew };
}

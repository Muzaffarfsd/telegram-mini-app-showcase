import { useCallback, useEffect, useRef } from 'react';

/** Store only non-sensitive view state here (never checkout contact details). */
interface FashionHistoryEntry<T> {
  version: 1;
  session: string;
  index: number;
  hash: string;
  snapshot: T;
  scrollTop: number;
}

interface FashionHistoryOptions<T extends object> {
  /** Return the currently rendered, structured-cloneable view state. */
  getSnapshot: () => T;
  /** Restore view state without creating another history entry or resetting scroll. */
  restore: (snapshot: T) => void;
}

const key = '__web4tgJewelryHistoryV2';

function stateObject(): Record<string, unknown> | null {
  const state = window.history.state;
  // Refuse to overwrite a host's non-object state.
  return state == null ? {} : typeof state === 'object' && !Array.isArray(state) ? state : null;
}

function readEntry<T>(state: Record<string, unknown> | null, hash: string): FashionHistoryEntry<T> | null {
  const value = state?.[key] as Partial<FashionHistoryEntry<T>> | undefined;
  return value?.version === 1 && value.hash === hash && typeof value.session === 'string' &&
    Number.isInteger(value.index) && (value.index as number) >= 0 && typeof value.scrollTop === 'number' &&
    Number.isFinite(value.scrollTop) && value.scrollTop >= 0 && value.snapshot != null && typeof value.snapshot === 'object'
    ? value as FashionHistoryEntry<T> : null;
}

function freshSession() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Internal store history uses the existing hash, leaving WEB4TG's hash router in
 * charge of navigation outside the demo. A snapshot should contain screen,
 * product, filters and sheet state, but not private form contents.
 *
 * Call push(next) immediately BEFORE changing React state. For a sheet on the
 * same screen pass preserveScroll:true. Use back(fallback) for the visible back
 * control; fallback should perform the old local back behaviour when the hook
 * cannot safely own the current browser entry. Call replaceCurrent() after
 * filter changes that should survive forward navigation without a new entry.
 */
export function useJewelryHistory<T extends object>({ getSnapshot, restore }: FashionHistoryOptions<T>) {
  const getSnapshotRef = useRef(getSnapshot);
  const restoreRef = useRef(restore);
  getSnapshotRef.current = getSnapshot;
  restoreRef.current = restore;
  const hashRef = useRef('');
  const sessionRef = useRef('');
  const enabledRef = useRef(false);
  const restoringRef = useRef(false);
  const pendingBackRef = useRef(false);
  const restoreFramesRef = useRef<number[]>([]);

  const replaceCurrent = useCallback(() => {
    if (!enabledRef.current || restoringRef.current || window.location.hash !== hashRef.current) return false;
    const state = stateObject();
    const entry = readEntry<T>(state, hashRef.current);
    if (!state || !entry || entry.session !== sessionRef.current) return false;
    const root = document.getElementById('root');
    try {
      window.history.replaceState({ ...state, [key]: { ...entry, snapshot: getSnapshotRef.current(), scrollTop: root?.scrollTop ?? 0 } }, '', window.location.href);
      return true;
    } catch { return false; }
  }, []);

  const push = useCallback((next: T, options?: { preserveScroll?: boolean }) => {
    if (!enabledRef.current || window.location.hash !== hashRef.current) return false;
    // A user can navigate again while the two-frame scroll restoration is pending.
    // Finish that restoration before saving the current entry and pushing the next one.
    if (restoringRef.current) {
      restoreFramesRef.current.forEach(cancelAnimationFrame);
      restoreFramesRef.current = [];
      const current = readEntry<T>(stateObject(), hashRef.current);
      const root = document.getElementById('root');
      if (root && current?.session === sessionRef.current) root.scrollTop = current.scrollTop;
      restoringRef.current = false;
    }
    if (!replaceCurrent()) return false;
    const state = stateObject();
    const entry = readEntry<T>(state, hashRef.current);
    if (!state || !entry || entry.session !== sessionRef.current) return false;
    const scrollTop = options?.preserveScroll ? (document.getElementById('root')?.scrollTop ?? 0) : 0;
    try {
      window.history.pushState({ ...state, [key]: { ...entry, index: entry.index + 1, snapshot: next, scrollTop } }, '', window.location.href);
      return true;
    } catch { return false; }
  }, [replaceCurrent]);

  const back = useCallback((fallback: () => void) => {
    if (pendingBackRef.current) return;
    const entry = enabledRef.current && window.location.hash === hashRef.current
      ? readEntry<T>(stateObject(), hashRef.current) : null;
    if (!entry || entry.session !== sessionRef.current || entry.index === 0) { fallback(); return; }
    replaceCurrent();
    pendingBackRef.current = true;
    window.history.back();
  }, [replaceCurrent]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!/^#\/demos\/jewelry-store\/app(?:\?.*)?$/.test(hash)) return;
    hashRef.current = hash;
    const state = stateObject();
    if (!state) return;
    const existing = readEntry<T>(state, hash);
    const session = existing?.session ?? freshSession();
    sessionRef.current = session;
    try {
      if (!existing) window.history.replaceState({ ...state, [key]: { version:1, session, index:0, hash, snapshot:getSnapshotRef.current(), scrollTop:document.getElementById('root')?.scrollTop ?? 0 } }, '', window.location.href);
      enabledRef.current = true;
    } catch { return; }

    const cancelRestore = () => { restoreFramesRef.current.forEach(cancelAnimationFrame); restoreFramesRef.current = []; };
    const applyEntry = (entry: FashionHistoryEntry<T>) => {
      cancelRestore();
      restoringRef.current = true;
      restoreRef.current(entry.snapshot);
      const first = requestAnimationFrame(() => {
        const second = requestAnimationFrame(() => {
          // A fast subsequent transition must not restore scroll into another route/entry.
          const current = readEntry<T>(stateObject(), hashRef.current);
          if (window.location.hash === hashRef.current && current?.session === entry.session && current.index === entry.index) {
            const root = document.getElementById('root');
            if (root) root.scrollTop = entry.scrollTop;
          }
          restoringRef.current = false;
          restoreFramesRef.current = [];
          replaceCurrent();
        });
        restoreFramesRef.current.push(second);
      });
      restoreFramesRef.current = [first];
    };
    if (existing) applyEntry(existing);

    const onPop = () => {
      pendingBackRef.current = false;
      if (window.location.hash !== hashRef.current) return;
      const entry = readEntry<T>(stateObject(), hashRef.current);
      if (entry && entry.session === sessionRef.current) applyEntry(entry);
    };
    let scrollFrame = 0;
    const root = document.getElementById('root');
    const onScroll = () => {
      if (restoringRef.current || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; replaceCurrent(); });
    };
    root?.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('popstate', onPop);
    return () => {
      enabledRef.current = false;
      pendingBackRef.current = false;
      restoringRef.current = false;
      cancelRestore();
      cancelAnimationFrame(scrollFrame);
      root?.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPop);
    };
  }, [replaceCurrent]);

  return { push, back, replaceCurrent };
}

import { afterScrollLayout } from '@/lib/afterScrollLayout';
import { observeSettledScroll } from '@/lib/settledScroll';
import { useCallback, useEffect, useRef } from 'react';

/** Store only non-sensitive view state here (never checkout contact details). */
interface DemoHistoryEntry<T> {
  version: 1;
  session: string;
  index: number;
  hash: string;
  snapshot: T;
  scrollTop: number;
}

interface DemoHistoryOptions<T extends object> {
  demoPath: string;
  /** Return the currently rendered, structured-cloneable view state. */
  getSnapshot: () => T;
  /** Restore view state without creating another history entry or resetting scroll. */
  restore: (snapshot: T) => void;
  /** Skip redundant native history writes when a demo can compare its snapshots. */
  sameSnapshot?: (current: T, stored: T) => boolean;
}

function stateObject(): Record<string, unknown> | null {
  const state = window.history.state;
  // Refuse to overwrite a host's non-object state.
  return state == null
    ? {}
    : typeof state === 'object' && !Array.isArray(state)
      ? state
      : null;
}

function readEntry<T>(
  state: Record<string, unknown> | null,
  hash: string,
  key: string,
): DemoHistoryEntry<T> | null {
  const value = state?.[key] as Partial<DemoHistoryEntry<T>> | undefined;
  return value?.version === 1 &&
    value.hash === hash &&
    typeof value.session === 'string' &&
    Number.isInteger(value.index) &&
    (value.index as number) >= 0 &&
    typeof value.scrollTop === 'number' &&
    Number.isFinite(value.scrollTop) &&
    value.scrollTop >= 0 &&
    value.snapshot != null &&
    typeof value.snapshot === 'object'
    ? (value as DemoHistoryEntry<T>)
    : null;
}

function freshSession() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
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
export function useDemoHistory<T extends object>({
  getSnapshot,
  restore,
  sameSnapshot,
  demoPath,
}: DemoHistoryOptions<T>) {
  const key =
    demoPath === 'furniture-studio'
      ? '__web4tgFurnitureHistoryV1'
      : '__web4tgDemoHistory-' + demoPath;
  const getSnapshotRef = useRef(getSnapshot);
  const restoreRef = useRef(restore);
  const sameSnapshotRef = useRef(sameSnapshot);
  sameSnapshotRef.current = sameSnapshot;
  getSnapshotRef.current = getSnapshot;
  restoreRef.current = restore;
  const hashRef = useRef('');
  const sessionRef = useRef('');
  const enabledRef = useRef(false);
  const restoringRef = useRef(false);
  const pendingBackRef = useRef(false);
  const activeIndex = useRef(0);
  const positions = useRef(new Map<number, number>());
  const cancelRestoreRef = useRef<(() => void) | undefined>(undefined);

  const replaceCurrent = useCallback(() => {
    if (
      !enabledRef.current ||
      restoringRef.current ||
      window.location.hash !== hashRef.current
    )
      return false;
    const state = stateObject();
    const entry = readEntry<T>(state, hashRef.current, key);
    if (!state || !entry || entry.session !== sessionRef.current) return false;
    const root = document.getElementById('root');
    const scrollTop = root?.scrollTop ?? 0;
    const snapshot = getSnapshotRef.current();
    positions.current.set(entry.index, scrollTop);
    if (
      entry.scrollTop === scrollTop &&
      sameSnapshotRef.current?.(snapshot, entry.snapshot)
    )
      return true;
    try {
      window.history.replaceState(
        {
          ...state,
          [key]: {
            ...entry,
            snapshot,
            scrollTop,
          },
        },
        '',
        window.location.href,
      );
      return true;
    } catch {
      return false;
    }
  }, [key]);

  const push = useCallback(
    (next: T, options?: { preserveScroll?: boolean }) => {
      if (!enabledRef.current || window.location.hash !== hashRef.current)
        return false;
      // A user can navigate again while the two-frame scroll restoration is pending.
      // Finish that restoration before saving the current entry and pushing the next one.
      if (restoringRef.current) {
        cancelRestoreRef.current?.();
        cancelRestoreRef.current = undefined;
        const current = readEntry<T>(stateObject(), hashRef.current, key);
        const root = document.getElementById('root');
        if (root && current?.session === sessionRef.current)
          root.scrollTop =
            positions.current.get(current.index) ?? current.scrollTop;
        restoringRef.current = false;
      }
      if (!replaceCurrent()) return false;
      const state = stateObject();
      const entry = readEntry<T>(state, hashRef.current, key);
      if (!state || !entry || entry.session !== sessionRef.current)
        return false;
      const scrollTop = options?.preserveScroll
        ? (document.getElementById('root')?.scrollTop ?? 0)
        : 0;
      try {
        window.history.pushState(
          {
            ...state,
            [key]: {
              ...entry,
              index: entry.index + 1,
              snapshot: next,
              scrollTop,
            },
          },
          '',
          window.location.href,
        );
        activeIndex.current = entry.index + 1;
        positions.current.set(activeIndex.current, scrollTop);
        return true;
      } catch {
        return false;
      }
    },
    [key, replaceCurrent],
  );

  const back = useCallback(
    (fallback: () => void) => {
      if (pendingBackRef.current) return;
      const entry =
        enabledRef.current && window.location.hash === hashRef.current
          ? readEntry<T>(stateObject(), hashRef.current, key)
          : null;
      if (!entry || entry.session !== sessionRef.current || entry.index === 0) {
        fallback();
        return;
      }
      replaceCurrent();
      pendingBackRef.current = true;
      window.history.back();
    },
    [key, replaceCurrent],
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.split('?')[0] !== '#/demos/' + demoPath + '/app') return;
    hashRef.current = hash;
    const state = stateObject();
    if (!state) return;
    const existing = readEntry<T>(state, hash, key);
    const session = existing?.session ?? freshSession();
    sessionRef.current = session;
    activeIndex.current = existing?.index ?? 0;
    positions.current.clear();
    try {
      if (!existing)
        window.history.replaceState(
          {
            ...state,
            [key]: {
              version: 1,
              session,
              index: 0,
              hash,
              snapshot: getSnapshotRef.current(),
              scrollTop: document.getElementById('root')?.scrollTop ?? 0,
            },
          },
          '',
          window.location.href,
        );
      enabledRef.current = true;
    } catch {
      return;
    }

    const cancelRestore = () => {
      cancelRestoreRef.current?.();
      cancelRestoreRef.current = undefined;
    };
    const applyEntry = (entry: DemoHistoryEntry<T>) => {
      cancelRestore();
      activeIndex.current = entry.index;
      restoringRef.current = true;
      restoreRef.current(entry.snapshot);
      const finishRestore = () => {
        restoringRef.current = false;
        cancelRestoreRef.current = undefined;
      };
      cancelRestoreRef.current = afterScrollLayout(() => {
        const current = readEntry<T>(stateObject(), hashRef.current, key);
        if (
          current?.session === entry.session &&
          current.index === entry.index
        ) {
          const root = document.getElementById('root');
          if (root)
            root.scrollTop =
              positions.current.get(entry.index) ?? entry.scrollTop;
        }
        finishRestore();
        replaceCurrent();
      }, finishRestore);
    };
    if (existing) applyEntry(existing);

    const onPop = () => {
      pendingBackRef.current = false;
      if (window.location.hash !== hashRef.current) return;
      const entry = readEntry<T>(stateObject(), hashRef.current, key);
      if (entry && entry.session === sessionRef.current) applyEntry(entry);
    };
    const stopTracking = observeSettledScroll(
      document.getElementById('root'),
      replaceCurrent,
      (top) => {
        if (!restoringRef.current)
          positions.current.set(activeIndex.current, top);
      },
    );
    window.addEventListener('popstate', onPop);
    return () => {
      enabledRef.current = false;
      pendingBackRef.current = false;
      restoringRef.current = false;
      cancelRestore();
      stopTracking();
      window.removeEventListener('popstate', onPop);
    };
  }, [demoPath, key, replaceCurrent]);

  return { push, back, replaceCurrent };
}

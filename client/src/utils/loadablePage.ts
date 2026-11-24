import { createContext, createElement, Suspense, useContext, useEffect, useState, useSyncExternalStore, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { recoverChunkLoad } from './lazyWithRecovery';

const RouteFallback = createContext<ReactNode>(null);

export function PageBoundary({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  return createElement(RouteFallback.Provider, { value: fallback },
    createElement(Suspense, { fallback }, children));
}

/** Share an in-flight import with navigation and paint as soon as it resolves. */
export function loadablePage<C extends ComponentType<any>>(load: () => Promise<{ default: C }>) {
  type Module = Awaited<ReturnType<typeof load>>;
  let ready: Module | undefined;
  let pending: Promise<Module> | undefined;
  const listeners = new Set<() => void>();
  const subscribe = (notify: () => void) => {
    listeners.add(notify);
    return () => { listeners.delete(notify); };
  };
  const snapshot = () => ready;

  function preload() {
    return pending ??= load().then(module => {
      ready = module;
      listeners.forEach(notify => notify());
      return module;
    }).catch(error => {
      pending = undefined;
      throw error;
    });
  }

  function Page(props: ComponentProps<C>) {
    const module = useSyncExternalStore(subscribe, snapshot, snapshot);
    const fallback = useContext(RouteFallback);
    const [failure, setFailure] = useState<{ error: unknown } | null>(null);
    useEffect(() => {
      if (module) return;
      let active = true;
      preload().catch(error => {
        // A failed speculative request must never reload an unrelated page.
        if (active) {
          recoverChunkLoad(error);
          setFailure({ error });
        }
      });
      return () => { active = false; };
    }, [module]);
    if (failure) throw failure.error;
    return module ? createElement(module.default, props) : fallback;
  }
  return Object.assign(Page, { preload });
}

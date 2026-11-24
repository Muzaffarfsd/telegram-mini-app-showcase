let interruptPending: (() => void) | undefined;

export function cancelPendingPageScroll() { interruptPending?.(); }

/** Restore a destination after its content has laid out unless the user takes control first. */
export function afterScrollLayout(apply: () => void, interrupted?: () => void) {
  cancelPendingPageScroll();
  const root = document.getElementById('root');
  const hash = location.hash;
  let frame = 0;
  const clear = () => {
    if (interruptPending === stop) interruptPending = undefined;
    cancelAnimationFrame(frame);
    root?.removeEventListener('pointerdown', stop, true);
    root?.removeEventListener('wheel', stop, true);
    document.removeEventListener('keydown', key, true);
  };
  const stop = () => { clear(); interrupted?.(); };
  interruptPending = stop;
  const key = (event: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stop();
  };
  root?.addEventListener('pointerdown', stop, { capture: true, passive: true });
  root?.addEventListener('wheel', stop, { capture: true, passive: true });
  document.addEventListener('keydown', key, true);
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => {
      clear();
      if (hash === location.hash) apply();
      else interrupted?.();
    });
  });
  return clear;
}

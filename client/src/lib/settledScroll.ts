/** Keep history writes off the scroll path, including on older Telegram WebViews. */
export function observeSettledScroll(
  root: HTMLElement | null,
  onSettle: () => void,
  onPosition?: (top: number) => void,
) {
  if (!root) return () => {};
  let lastMotion = 0;
  let timer = 0;
  let dirty = false;
  const commit = () => {
    clearTimeout(timer);
    timer = 0;
    if (!dirty) return;
    dirty = false;
    onSettle();
  };
  // Some WebViews expose scrollend but omit it when momentum is interrupted.
  // One watchdog tracks an entire gesture. Native scrollend normally clears it.
  const checkIdle = () => {
    const remaining = 360 - (performance.now() - lastMotion);
    if (remaining > 0) timer = window.setTimeout(checkIdle, Math.ceil(remaining));
    else commit();
  };
  const scroll = () => {
    dirty = true;
    onPosition?.(root.scrollTop);
    lastMotion = performance.now();
    if (!timer) timer = window.setTimeout(checkIdle, 360);
  };
  const onVisibility = () => { if (document.visibilityState === 'hidden') commit(); };
  root.addEventListener('scroll', scroll, { passive: true });
  root.addEventListener('scrollend', commit);
  window.addEventListener('pagehide', commit);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    clearTimeout(timer);
    root.removeEventListener('scroll', scroll);
    root.removeEventListener('scrollend', commit);
    window.removeEventListener('pagehide', commit);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

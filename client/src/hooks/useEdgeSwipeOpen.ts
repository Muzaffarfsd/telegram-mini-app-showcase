import { useEffect } from 'react';

interface Options {
  enabled: boolean;
  edge: number;
  width: () => number;
  onOpen: () => void;
  onProgress?: (offset: number) => void;
}

/** An edge drag observes one touched element. The browser owns vertical pans and pinch zoom. */
export function useEdgeSwipeOpen({ enabled, edge, width, onOpen, onProgress }: Options) {
  useEffect(() => {
    if (!enabled) return;
    let stopDrag: (() => void) | undefined;
    const begin = (start: PointerEvent) => {
      if (start.pointerType !== 'touch') return;
      if (!start.isPrimary) { stopDrag?.(); return; }
      if (start.clientX > edge || !(start.target instanceof HTMLElement || start.target instanceof SVGElement)) return;
      if (start.target.closest('[role="dialog"],dialog[open],input,textarea,select,.home-demo__image')) return;
      stopDrag?.();
      const origin = start.target;
      const panelWidth = width();
      let horizontal = false;
      const cleanup = () => {
        origin.removeEventListener('pointermove', move);
        origin.removeEventListener('pointerup', end);
        origin.removeEventListener('pointercancel', cancel);
        origin.removeEventListener('lostpointercapture', cancel);
        if (horizontal) onProgress?.(0);
        stopDrag = undefined;
      };
      const cancel = (e: Event) => { if (e instanceof PointerEvent && e.pointerId === start.pointerId) cleanup(); };
      const move = (e: Event) => {
        if (!(e instanceof PointerEvent) || e.pointerId !== start.pointerId) return;
        const dx = e.clientX - start.clientX;
        const dy = Math.abs(e.clientY - start.clientY);
        if (!horizontal) {
          if (Math.max(Math.abs(dx), dy) < 12) return;
          if (dx <= dy * 1.5) { cleanup(); return; }
          horizontal = true;
        }
        onProgress?.(Math.min(panelWidth, Math.max(0, dx)));
      };
      const end = (e: Event) => {
        if (!(e instanceof PointerEvent) || e.pointerId !== start.pointerId) return;
        const open = horizontal && e.clientX - start.clientX > panelWidth * 0.3;
        if (horizontal) {
          // Ignore the compatibility click following a drag across a link or card.
          const suppress = (click: MouseEvent) => {
            if (click.detail && click.composedPath().includes(origin)) {
              click.preventDefault();
              click.stopImmediatePropagation();
            }
          };
          document.addEventListener('click', suppress, true);
          window.setTimeout(() => document.removeEventListener('click', suppress, true), 0);
        }
        cleanup();
        if (open) onOpen();
      };
      stopDrag = cleanup;
      // Touch pointers implicitly capture their original target.
      origin.addEventListener('pointermove', move, { passive: true });
      origin.addEventListener('pointerup', end, { passive: true });
      origin.addEventListener('pointercancel', cancel, { passive: true });
      origin.addEventListener('lostpointercapture', cancel, { passive: true });
    };
    document.addEventListener('pointerdown', begin, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointerdown', begin, true);
      stopDrag?.();
    };
  }, [enabled, edge, width, onOpen, onProgress]);
}

import { useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

type Layout = 'hero' | 'shelf' | 'arc';
const reducedMotion = '(prefers-reduced-motion: reduce)';
// These are Embla physics parameters already used by the furniture store.
const snapDuration = 0.72,
  snapFriction = 0.21;

export function useDrinkCarousel(
  index: number,
  onSelect: (index: number) => void,
  layout: Layout,
) {
  const initial = useRef(index),
    change = useRef(onSelect);
  change.current = onSelect;
  const [viewport, api] = useEmblaCarousel({
    loop: true,
    align: layout === 'shelf' ? 'start' : 'center',
    startIndex: initial.current,
    duration: snapDuration,
    dragThreshold: 6,
    watchFocus: false,
    breakpoints: { [reducedMotion]: { duration: 0 } },
  });
  useLayoutEffect(() => {
    if (!api) return;
    const root = api.rootNode(),
      motion = window.matchMedia(reducedMotion);
    const slides = api.slideNodes();
    const drawings = slides.map((s) => s.firstElementChild as HTMLElement);
    let snaps = api.scrollSnapList(),
      widthRatio = 1;
    function paint() {
      if (!api || layout === 'shelf') return;
      const progress = api.scrollProgress();
      // All slides in a given rail have equal widths. Wrap the distance at the loop seam.
      drawings.forEach((drawing, i) => {
        const turns = snaps[i] - progress;
        const distance = (turns - Math.round(turns)) * slides.length;
        const abs = Math.abs(distance);
        if (layout === 'hero') {
          const t = Math.min(abs, 1),
            ease = t * t * (3 - 2 * t);
          const sign = Math.sign(distance);
          drawing.style.transform =
            'translate3d(0,' +
            sign * ease * 9 +
            '%,0) rotate(' +
            sign * ease * 10 +
            'deg) scale(' +
            (1 - 0.735 * ease) +
            ')';
          drawing.style.opacity = String(
            Math.max(0, Math.min(1, (1.6 - abs) * 2.4)),
          );
        } else {
          const x = Math.max(0, Math.min(1, 0.5 + distance * widthRatio));
          const y = 99 - 174 * x + 84 * x * x;
          drawing.style.setProperty('--arc-y', y + '%');
          drawing.style.setProperty('--arc-angle', (x - 0.5) * 24 + 'deg');
          drawing.style.setProperty(
            '--arc-scale',
            String(1 - 0.14 * Math.min(abs, 1.5)),
          );
        }
      });
    }
    function measure() {
      if (!api) return;
      snaps = api.scrollSnapList();
      widthRatio = slides[0].offsetWidth / Math.max(1, root.clientWidth);
      paint();
    }
    function tune() {
      if (!api) return;
      if (motion.matches) {
        api.scrollTo(api.selectedScrollSnap(), true);
        return;
      }
      const body = api.internalEngine().scrollBody;
      if (body.duration())
        body.useDuration(snapDuration).useFriction(snapFriction);
    }
    function selected() {
      if (api) {
        tune();
        change.current(api.selectedScrollSnap());
      }
    }
    let travel = 0,
      lastWheel = -Infinity,
      stepped = false;
    function wheel(event: WheelEvent) {
      if (!api || event.ctrlKey) return;
      const delta =
        event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
      if (
        !delta ||
        (!event.shiftKey && Math.abs(delta) <= Math.abs(event.deltaY))
      )
        return;
      event.preventDefault();
      if (event.timeStamp - lastWheel > 155) {
        travel = 0;
        stepped = false;
      }
      lastWheel = event.timeStamp;
      travel +=
        delta *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? root.clientWidth
            : 1);
      if (!stepped && Math.abs(travel) >= 30) {
        stepped = true;
        if (travel > 0) api.scrollNext();
        else api.scrollPrev();
      }
    }
    measure();
    api
      .on('reInit', measure)
      .on('scroll', paint)
      .on('settle', paint)
      .on('select', selected)
      .on('pointerUp', tune);
    root.addEventListener('wheel', wheel, { passive: false });
    return () => {
      api
        .off('reInit', measure)
        .off('scroll', paint)
        .off('settle', paint)
        .off('select', selected)
        .off('pointerUp', tune);
      root.removeEventListener('wheel', wheel);
    };
  }, [api, layout]);
  useLayoutEffect(() => {
    if (api && api.selectedScrollSnap() !== index) api.scrollTo(index, true);
  }, [api, index]);
  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if (!api || event.altKey || event.ctrlKey || event.metaKey) return;
    const count = api.slideNodes().length;
    let next: number;
    switch (event.key) {
      case 'ArrowLeft':
        next = (api.selectedScrollSnap() + count - 1) % count;
        break;
      case 'ArrowRight':
        next = (api.selectedScrollSnap() + 1) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    api.scrollTo(next);
    const action = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-slide-action]',
    )?.dataset.slideAction;
    if (action)
      api
        .slideNodes()
        [next].querySelector<HTMLElement>(
          '[data-slide-action="' + action + '"]',
        )
        ?.focus({ preventScroll: true });
  }
  return { viewport, api, keyboard };
}

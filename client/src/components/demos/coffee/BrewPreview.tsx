import { useLayoutEffect, useRef } from 'react';
import { drinkById, recipeKey, say, type Locale, type Recipe } from './menu';
import { actionFor, clamp, makeSurface, type BrewCue } from './brewSurface';
import { drawBrewIllustration } from './brewIllustration';
import type { createBrewScene } from './brewScene';

const cremaUrl = '/takt-coffee/editorial/crema.webp';
let crema: HTMLImageElement | undefined,
  prints: HTMLImageElement | undefined,
  stone: HTMLImageElement | undefined;
const liquidPhotos = new Map<string, HTMLImageElement>();
function liquidPhoto(id: Recipe['drink']) {
  if (!drinkById[id].iced) return;
  let img = liquidPhotos.get(id);
  if (!img) {
    img = new Image();
    img.src = '/takt-coffee/editorial/liquid-' + id + '.webp';
    liquidPhotos.set(id, img);
  }
  return img;
}
export function BrewPreview({
  recipe,
  cue,
  lang,
}: {
  recipe: Recipe;
  cue?: BrewCue;
  lang: Locale;
}) {
  const host = useRef<HTMLSpanElement>(null),
    flat = useRef<HTMLCanvasElement>(null),
    gl = useRef<HTMLCanvasElement>(null);
  const latest = useRef({ recipe, cue });
  latest.current = { recipe, cue };
  const refresh = useRef<(() => void) | undefined>(undefined);
  useLayoutEffect(() => {
    const box = host.current!,
      fallback = flat.current!,
      main = gl.current!,
      ctx = fallback.getContext('2d')!,
      surface = makeSurface();
    if (!crema) {
      crema = new Image();
      crema.src = cremaUrl;
      prints = new Image();
      prints.src = '/takt-coffee/editorial/milk-art.webp';
      stone = new Image();
      stone.src = '/takt-coffee/editorial/stone.webp';
    }
    const fluid = liquidPhoto(recipe.drink);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let engine: ReturnType<typeof createBrewScene> | undefined,
      done = false,
      frame = 0,
      start = 0,
      last = -1,
      seen = -1,
      w = 1,
      h = 1;
    const draw = () => {
      const time = performance.now();
      frame = 0;
      if (done) return;
      const { recipe: r, cue: event } = latest.current;
      const action = actionFor(r, event);
      const p =
        event && !motion.matches
          ? clamp((time - start) / (action === 'settle' ? 550 : 1630))
          : 1;
      if (last < 0 || p === 1 || time - last >= 1000 / 45) {
        surface.paint(r, action, p, event?.before, crema, prints);
        box.dataset.phase = p < 1 ? 'active' : 'settled';
        box.dataset.effect = action;
        if (engine) {
          engine.render(r, action, p, event?.before);
          box.dataset.renderer = 'webgl';
        } else {
          const ratio = fallback.width / w;
          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
          drawBrewIllustration(
            ctx,
            w,
            h,
            surface.canvas,
            r,
            action,
            p,
            fluid,
            event?.before,
          );
          box.dataset.renderer = 'canvas';
        }
        last = time;
      }
      if (p < 1 && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const show = () => {
      if (done) return;
      cancelAnimationFrame(frame);
      last = -1;
      const event = latest.current.cue?.id ?? 0;
      if (event !== seen) {
        seen = event;
        start = performance.now();
      }
      draw();
    };
    refresh.current = show;
    const resize = () => {
      const rect = box.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      w = Math.round(rect.width);
      h = Math.round(rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      fallback.width = Math.round(w * dpr);
      fallback.height = Math.round(h * dpr);
      engine?.resize(w, h);
      show();
    };
    const loss = (e: Event) => {
      if (done) return;
      e.preventDefault();
      const lost = engine;
      engine = undefined;
      show();
      lost?.dispose();
    };
    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(box);
    const photos = [crema, prints!, stone!];
    if (fluid) photos.push(fluid);
    photos.forEach((i) => i.addEventListener('load', show));
    motion.addEventListener('change', show);
    document.addEventListener('visibilitychange', show);
    main.addEventListener('webglcontextlost', loss);
    void import('./brewScene')
      .then(({ createBrewScene }) => {
        if (done) return;
        try {
          engine = createBrewScene(
            main,
            surface.canvas,
            latest.current.recipe,
            stone!,
            fluid,
          );
          engine.resize(w, h);
          show();
        } catch {
          engine?.dispose();
          engine = undefined;
          show();
        }
      })
      .catch(() => {
        if (!done) show();
      });
    return () => {
      done = true;
      cancelAnimationFrame(frame);
      obs.disconnect();
      photos.forEach((i) => i.removeEventListener('load', show));
      motion.removeEventListener('change', show);
      document.removeEventListener('visibilitychange', show);
      main.removeEventListener('webglcontextlost', loss);
      engine?.dispose();
      refresh.current = undefined;
    };
  }, [recipe.drink]);
  useLayoutEffect(() => {
    refresh.current?.();
  }, [recipe, cue]);
  return (
    <span
      ref={host}
      className="brew-preview"
      role="img"
      aria-label={
        (lang === 'ru' ? 'Вид в чашку · ' : 'Inside the cup · ') +
        say(drinkById[recipe.drink].name, lang)
      }
      data-recipe={recipeKey(recipe)}
    >
      <canvas ref={flat} aria-hidden="true" />
      <canvas ref={gl} className="brew-gl" aria-hidden="true" />
    </span>
  );
}

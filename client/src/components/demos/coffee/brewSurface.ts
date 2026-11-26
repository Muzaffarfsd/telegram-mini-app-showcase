import {
  drinkById,
  recipeKey,
  selection,
  type GroupId,
  type Recipe,
} from './menu';

export type BrewCue = { id: number; group: GroupId | 'size'; before: Recipe };
export type Action =
  | 'rest'
  | 'milk'
  | 'foam'
  | 'espresso'
  | 'syrup'
  | 'sugar'
  | 'ice'
  | 'flakes'
  | 'spice'
  | 'art'
  | 'settle';
export const clamp = (n: number, lo = 0, hi = 1) =>
  Math.max(lo, Math.min(hi, n));
export const ease = (n: number) => {
  const x = clamp(n);
  return x * x * (3 - 2 * x);
};
export function actionFor(r: Recipe, cue?: BrewCue): Action {
  if (!cue) return 'rest';
  switch (cue.group) {
    case 'size':
      return 'settle';
    case 'beans':
      return 'espresso';
    case 'shot':
      return r.shot === 'extra' ? 'espresso' : 'settle';
    case 'latteArt':
      return selection('latteArt', r) === 'plain' ? 'settle' : 'art';
    case 'ice':
      return selection('ice', r) === 'no-ice' ||
        (selection('ice', r) === 'less' &&
          selection('ice', cue.before) === 'regular')
        ? 'settle'
        : 'ice';
    case 'sugar':
      return selection('sugar', r) === 'unsweetened' ||
        (selection('sugar', r) === 'one' &&
          selection('sugar', cue.before) === 'two')
        ? 'settle'
        : 'sugar';
    case 'syrup':
      return r.syrup === 'none'
        ? 'settle'
        : r.syrup === 'cinnamon'
          ? 'spice'
          : r.syrup === 'chocolate'
            ? 'flakes'
            : 'syrup';
    default:
      return cue.group;
  }
}
export const streamAction = (a: Action) =>
  ['milk', 'foam', 'espresso', 'art', 'syrup'].includes(a);
export function flowColour(r: Recipe, a: Action) {
  if (a === 'espresso') return '#57301b';
  if (a === 'syrup') return r.syrup === 'caramel' ? '#bd752c' : '#e0b565';
  return r.milk === 'oat' ? '#f4dfb9' : '#fff5df';
}
export function tone(r: Recipe) {
  const d = drinkById[r.drink];
  if (r.drink === 'matcha-latte') return '#879350';
  if (r.drink === 'peach-tea') return '#b95c24';
  if (r.drink === 'cherry-mocha') return '#a96563';
  if (r.drink === 'cold-brew' || r.drink === 'americano') return '#4d291a';
  if (r.drink === 'cocoa' || r.drink === 'mocha') return '#89553b';
  if (!d.milk) return r.beans === 'fruit' ? '#a56430' : '#8b4c25';
  if (r.shot === 'extra') return '#aa7149';
  if (r.milk === 'oat') return '#cba275';
  return r.drink === 'flat-white'
    ? '#b17b52'
    : r.drink === 'latte'
      ? '#d2a57d'
      : '#c69469';
}
export function contact(a: Action, p: number) {
  if (a === 'art')
    return { x: Math.sin(p * 42) * 0.17 * (1 - p), z: 0.34 - 0.65 * p };
  if (streamAction(a))
    return {
      x: -0.19 + 0.095 * Math.sin(p * 5),
      z: 0.025 + 0.075 * Math.cos(p * 4),
    };
  return { x: -0.11, z: 0.045 };
}
export const icePositions = [
  [-0.28, -0.34, 0.22],
  [0.35, -0.27, -0.38],
  [0.2, 0.31, 0.71],
  [-0.38, 0.19, -0.62],
  [0.03, -0.04, 0.14],
] as const;
export const iceCount = (r: Recipe) =>
  !drinkById[r.drink].iced || selection('ice', r) === 'no-ice'
    ? 0
    : selection('ice', r) === 'less'
      ? 2
      : 5;
export function addedPieces(
  group: 'ice' | 'sugar',
  r: Recipe,
  before?: Recipe,
) {
  const count = (recipe: Recipe) =>
    group === 'ice'
      ? iceCount(recipe)
      : selection('sugar', recipe) === 'two'
        ? 2
        : selection('sugar', recipe) === 'one'
          ? 1
          : 0;
  const after = count(r),
    previous = before ? count(before) : 0;
  return after === previous ? after : Math.max(0, after - previous);
}
export const fallAt = (progress: number, index: number, count: number) =>
  (progress - 0.11 - (index / Math.max(1, count)) * 0.23) / 0.49;
const full = Math.PI * 2;
function noise(i: number) {
  const x = Math.sin(i * 91.73 + 6.43) * 43758.5453;
  return x - Math.floor(x);
}
function makeCanvas(size: number) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}
function oval(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  colour: string,
) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, full);
  ctx.fill();
}
function latteArt(ctx: CanvasRenderingContext2D, type: string) {
  if (type === 'plain') return;
  ctx.save();
  ctx.translate(253, 250);
  ctx.rotate(-0.27);
  function heart(y: number, s: number) {
    ctx.save();
    ctx.translate(0, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.bezierCurveTo(-16, 40, -81, 3, -65, -30);
    ctx.bezierCurveTo(-56, -52, -22, -51, 0, -28);
    ctx.bezierCurveTo(25, -53, 58, -50, 67, -28);
    ctx.bezierCurveTo(77, 2, 22, 41, 0, 60);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#fff2d6';
  if (type === 'heart') {
    heart(0, 1.32);
    ctx.fillStyle = '#dbaf84';
    heart(-12, 0.96);
    ctx.fillStyle = '#fff1d6';
    heart(-13, 0.86);
  }
  if (type === 'tulip') {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#fff3da';
      heart(24 - i * 25, 1.03 - i * 0.18);
      if (i < 3) {
        ctx.fillStyle = '#cf9d72';
        heart(12 - i * 25, 0.87 - i * 0.18);
      }
    }
  }
  if (type === 'rosetta') {
    for (let i = 0; i < 11; i++) {
      const y = 57 - i * 10,
        w = 43 + 38 * Math.sin(((i + 1) / 13) * Math.PI) - i * 2.8;
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.scale(side, 1);
        ctx.beginPath();
        ctx.moveTo(0, y + 10);
        ctx.bezierCurveTo(w * 0.37, y + 11, w * 0.92, y - 3, w, y - 29);
        ctx.bezierCurveTo(w * 0.77, y - 12, w * 0.25, y - 7, 0, y + 3);
        ctx.fill();
        ctx.restore();
      }
    }
    heart(-56, 0.34);
  }
  ctx.strokeStyle = '#fff4da';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-1, -64);
  ctx.quadraticCurveTo(-6, 23, 3, 83);
  ctx.stroke();
  ctx.restore();
}
function still(
  ctx: CanvasRenderingContext2D,
  r: Recipe,
  photo?: HTMLImageElement,
  prints?: HTMLImageElement,
) {
  ctx.fillStyle = tone(r);
  ctx.fillRect(0, 0, 512, 512);
  if (photo?.naturalWidth) {
    ctx.save();
    ctx.globalAlpha = drinkById[r.drink].milk ? 0.57 : 0.71;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(photo, 0, 0, 512, 512);
    ctx.restore();
  }
  const d = drinkById[r.drink],
    f = r.foam === 'cloud' ? 1 : r.foam === 'light' ? 0.29 : 0.66;
  const g = ctx.createRadialGradient(211, 192, 35, 256, 256, 258);
  g.addColorStop(0, '#fff1d006');
  g.addColorStop(0.91, '#f5ba6d04');
  g.addColorStop(0.972, '#edd3a954');
  g.addColorStop(0.99, '#5c342b96');
  g.addColorStop(1, '#472714');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  if (d.foam) {
    for (let i = 0; i < 12; i++) {
      const a = noise(i + 1) * 6.28;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,238,208,' + 0.07 * f + ')';
      ctx.lineWidth = 1 + noise(i + 89) * 4;
      ctx.ellipse(
        250,
        251,
        206 + i * 3,
        194 + i * 4,
        0.17,
        a,
        a + noise(i + 15) * 3.8,
      );
      ctx.stroke();
    }
  }
  const count = d.foam ? 380 : 150;
  for (let i = 0; i < count; i++) {
    const a = noise(i) * full,
      rad = 250 * (1 - Math.pow(noise(i + 1001), 3) * 0.27);
    const x = 256 + Math.cos(a) * rad,
      y = 256 + Math.sin(a) * rad,
      s = 0.5 + noise(i + 742) * 2.4;
    oval(ctx, x, y, s, s, 'rgba(79,44,21,.28)');
    oval(ctx, x - 0.35, y - 0.65, s * 0.81, s * 0.72, 'rgba(249,221,170,.72)');
  }
  if (d.foam) {
    const art = selection('latteArt', r),
      panel = ['heart', 'rosetta', 'tulip'].indexOf(art);
    if (panel >= 0 && prints?.naturalWidth) {
      const overlay = makeCanvas(512),
        ink = overlay.getContext('2d')!,
        side = prints.naturalHeight;
      ink.drawImage(prints, panel * side, 0, side, side, 77, 77, 358, 358);
      const fade = ink.createRadialGradient(256, 256, 155, 256, 256, 180);
      fade.addColorStop(0, '#fff');
      fade.addColorStop(1, '#fff0');
      ink.globalCompositeOperation = 'destination-in';
      ink.fillStyle = fade;
      ink.fillRect(0, 0, 512, 512);
      ctx.drawImage(overlay, 0, 0);
    } else latteArt(ctx, art);
  }
  if (r.syrup === 'caramel' || r.drink === 'caramel-frappe') {
    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(-0.35);
    ctx.strokeStyle = '#965622bb';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      const y = i * 41;
      ctx.beginPath();
      ctx.moveTo(-140, y + 7);
      ctx.bezierCurveTo(-68, y - 22, 75, y + 28, 150, y - 7);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (r.syrup === 'cinnamon' || r.syrup === 'chocolate') {
    for (let i = 0; i < (r.syrup === 'cinnamon' ? 280 : 47); i++) {
      const a = noise(i + 6) * full,
        rad = 104 * Math.sqrt(noise(i + 35));
      const x = 241 + Math.cos(a) * rad * 1.45,
        y = 258 + Math.sin(a) * rad,
        s = 1 + noise(i + 72) * (r.syrup === 'chocolate' ? 5 : 1.6);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = i % 4 === 0 ? '#8f5638' : '#503022';
      ctx.fillRect(-s / 2, 0, s * 1.8, s * 0.72);
      ctx.restore();
    }
  }
}
export function makeSurface() {
  const canvas = makeCanvas(512),
    ctx = canvas.getContext('2d')!;
  const cache = new Map<string, HTMLCanvasElement>();
  function base(
    r: Recipe,
    image?: HTMLImageElement,
    prints?: HTMLImageElement,
  ) {
    const key =
      recipeKey(r) +
      (image?.naturalWidth ? 'p' : '') +
      (prints?.naturalWidth ? 'a' : '');
    let b = cache.get(key);
    if (!b) {
      b = makeCanvas(512);
      still(b.getContext('2d')!, r, image, prints);
      if (cache.size >= 5) cache.delete(cache.keys().next().value!);
      cache.set(key, b);
    }
    return b;
  }
  return {
    canvas,
    paint(
      r: Recipe,
      a: Action,
      p: number,
      before?: Recipe,
      image?: HTMLImageElement,
      prints?: HTMLImageElement,
    ) {
      ctx.globalAlpha = 1;
      ctx.drawImage(base(before && p < 1 ? before : r, image, prints), 0, 0);
      if (p >= 1 || !before) return;
      if (a === 'art') {
        const reveal = ease((p - 0.15) / 0.66) * 512;
        const top = Math.floor(512 - reveal);
        if (top < 512)
          ctx.drawImage(
            base(r, image, prints),
            0,
            top,
            512,
            512 - top,
            0,
            top,
            512,
            512 - top,
          );
      } else {
        ctx.globalAlpha = ease((p - 0.25) / 0.72);
        ctx.drawImage(base(r, image, prints), 0, 0);
        ctx.globalAlpha = 1;
      }
      const strength = Math.sin(Math.PI * clamp((p - 0.22) / 0.78));
      if (strength <= 0) return;
      const hit = contact(a, p);
      const x = 256 + hit.x * 285,
        y = 256 + hit.z * 285;
      if (streamAction(a)) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p * 1.9);
        const colour = flowColour(r, a);
        const cloud = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          69 * strength + 2,
        );
        cloud.addColorStop(0, colour + 'df');
        cloud.addColorStop(0.45, colour + '5a');
        cloud.addColorStop(1, colour + '00');
        ctx.fillStyle = cloud;
        ctx.scale(1, 0.85);
        ctx.fillRect(-76, -76, 152, 152);
        for (let i = 0; i < 9; i++) {
          const angle = i * 2.4,
            extent =
              (28 + 95 * ease((p - 0.18) / 0.7)) * (0.6 + 0.4 * noise(i + 5));
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(
            Math.cos(angle) * extent * 0.4,
            Math.sin(angle) * extent * 0.4,
            Math.cos(angle + 0.9) * extent,
            Math.sin(angle + 0.9) * extent,
            Math.cos(angle + 1.6) * extent,
            Math.sin(angle + 1.6) * extent,
          );
          ctx.strokeStyle = colour;
          ctx.lineWidth = (13 - i * 1.05) * (1.15 - p * 0.52);
          ctx.lineCap = 'round';
          ctx.globalAlpha = strength * (a === 'syrup' ? 0.28 : 0.26);
          ctx.stroke();
        }
        ctx.restore();
        oval(
          ctx,
          x,
          y,
          6 + 6 * strength,
          5 + 5 * strength,
          colour +
            Math.round(strength * 205)
              .toString(16)
              .padStart(2, '0'),
        );
      }
      for (let i = 0; i < 3; i++) {
        const t = (p - 0.36 - i * 0.13) / 0.55;
        if (t <= 0 || t >= 1) continue;
        ctx.strokeStyle =
          'rgba(255,242,209,' + Math.sin(t * Math.PI) * 0.44 + ')';
        ctx.lineWidth = 1.8 * (1 - t) + 0.7;
        ctx.beginPath();
        ctx.ellipse(x, y, 8 + t * 112, 6 + t * 100, 0, 0, full);
        ctx.stroke();
      }
    },
  };
}

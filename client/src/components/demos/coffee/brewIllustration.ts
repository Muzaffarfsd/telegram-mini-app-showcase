import { drinkById, type Recipe } from './menu';
import {
  clamp,
  contact,
  ease,
  flowColour,
  iceCount,
  addedPieces,
  fallAt,
  icePositions,
  streamAction,
  tone,
  type Action,
} from './brewSurface';

// The same liquid texture, impact point and timing remain available in WebViews without WebGL.
export function drawBrewIllustration(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  texture: HTMLCanvasElement,
  r: Recipe,
  a: Action,
  p: number,
  fluid?: HTMLImageElement,
  before?: Recipe,
) {
  const cold = !!drinkById[r.drink].iced,
    unit =
      Math.min(w / (cold ? 2.85 : 3.4), h / (cold ? 2.88 : 2.7)) *
      (r.drink === 'espresso' ? 0.88 : 1) *
      (drinkById[r.drink].sizes.indexOf(r.ml) > 0 ? 1.05 : 1);
  c.save();
  const bg = c.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#faf7f0');
  bg.addColorStop(1, '#dfd7cb');
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);
  c.translate(w * 0.49, h * (cold ? 0.46 : 0.47));
  c.scale(unit, unit);
  const ellipse = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    fill: string | CanvasGradient,
  ) => {
    c.fillStyle = fill;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
  };
  const shade = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stops: string[],
  ) => {
    const g = c.createLinearGradient(x1, y1, x2, y2);
    stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
    return g;
  };
  c.save();
  c.translate(0.11, cold ? 1.12 : 0.86);
  c.scale(1, 0.2);
  const sh = c.createRadialGradient(0, 0, 0.03, 0.1, 0, 1.52);
  sh.addColorStop(0, '#6556468c');
  sh.addColorStop(0.55, '#75695a58');
  sh.addColorStop(1, '#81746600');
  ellipse(0.09, 0, 1.62, 1.28, sh);
  c.restore();
  const ivory = shade(-0.95, -0.1, 0.96, 0.5, [
    '#b4a898',
    '#eee8db',
    '#fbf8ef',
    '#dfd6c7',
    '#ab9d8b',
  ]);
  if (!cold) {
    ellipse(0, 0.7, 1.32, 0.43, '#b6aa98');
    ellipse(
      -0.005,
      0.669,
      1.32,
      0.43,
      shade(-1, -0.1, 1, 0.8, ['#fffdf7', '#e6dfd1', '#cfc5b7', '#f7f2e9']),
    );
    ellipse(-0.01, 0.68, 0.9, 0.26, '#d5ccbd');
    c.beginPath();
    c.moveTo(0.78, 0.0);
    c.bezierCurveTo(1.65, -0.29, 1.48, 0.65, 0.72, 0.57);
    c.lineWidth = 0.164;
    c.strokeStyle = '#aa9f8e';
    c.stroke();
    c.lineWidth = 0.118;
    c.strokeStyle = '#eee8dc';
    c.stroke();
    c.fillStyle = ivory;
    c.beginPath();
    c.moveTo(-0.94, -0.03);
    c.bezierCurveTo(-0.9, 0.43, -0.65, 0.84, -0.39, 0.87);
    c.bezierCurveTo(-0.13, 0.97, 0.31, 0.94, 0.47, 0.84);
    c.bezierCurveTo(0.75, 0.69, 0.92, 0.35, 0.94, -0.035);
    c.closePath();
    c.fill();
  } else {
    const col = tone(r);
    c.fillStyle = shade(-0.7, 0, 0.75, 0.1, [
      '#c5c0b0',
      col,
      col,
      '#baa38b',
      '#e1d8c7',
    ]);
    c.beginPath();
    c.moveTo(-0.82, -0.05);
    c.lineTo(-0.64, 1.09);
    c.quadraticCurveTo(0, 1.4, 0.64, 1.09);
    c.lineTo(0.82, -0.05);
    c.closePath();
    c.fill();
    if (fluid?.naturalWidth) {
      c.save();
      c.clip();
      c.drawImage(fluid, -0.8, -0.05, 1.6, 1.3);
      c.fillStyle = shade(-0.82, 0, 0.82, 0, [
        '#24171255',
        '#ffffff09',
        '#41281805',
        '#fff1d63b',
        '#20171033',
      ]);
      c.fillRect(-0.84, -0.12, 1.68, 1.5);
      c.restore();
    }
    c.strokeStyle = '#fffaf1bb';
    c.lineWidth = 0.027;
    c.beginPath();
    c.moveTo(-0.74, 0.08);
    c.lineTo(-0.58, 1.07);
    c.moveTo(0.71, 0.1);
    c.lineTo(0.57, 1.06);
    c.stroke();
  }
  const rx = cold ? 0.83 : 0.94,
    ry = cold ? 0.405 : 0.47;
  ellipse(0, -0.035, rx, ry, '#fffbec');
  const ir = rx * 0.934,
    iy = ry * 0.862;
  c.save();
  c.beginPath();
  c.ellipse(0, -0.031, ir, iy, 0, 0, Math.PI * 2);
  c.clip();
  c.drawImage(texture, -ir, -iy - 0.031, ir * 2, iy * 2);
  c.restore();
  function cube(
    x: number,
    y: number,
    k: number,
    ice: boolean,
    rotation: number,
  ) {
    c.save();
    c.translate(x, y);
    c.rotate(rotation);
    c.fillStyle = ice ? '#dae9edb0' : '#fff5dd';
    c.fillRect(-k / 2, -k / 2, k, k);
    c.beginPath();
    c.moveTo(-k / 2, -k / 2);
    c.lineTo(-k * 0.22, -k * 0.78);
    c.lineTo(k * 0.76, -k * 0.78);
    c.lineTo(k / 2, -k / 2);
    c.closePath();
    c.fillStyle = ice ? '#f4fcfbc9' : '#fffbed';
    c.fill();
    c.beginPath();
    c.moveTo(k / 2, -k / 2);
    c.lineTo(k * 0.76, -k * 0.78);
    c.lineTo(k * 0.76, k * 0.25);
    c.lineTo(k / 2, k * 0.5);
    c.closePath();
    c.fillStyle = ice ? '#9eb5bbc9' : '#cdbb9b';
    c.fill();
    c.restore();
  }
  if (cold) {
    const count = iceCount(r),
      added = a === 'ice' ? addedPieces('ice', r, before) : 0;
    icePositions.slice(0, count).forEach(([x, z, rot], i) => {
      const j = i - count + added,
        t = added && j >= 0 ? fallAt(p, j, added) : 2;
      if (t < 0) return;
      const f = 1 - clamp(t);
      cube(
        x - 0.16 * f,
        z * 0.45 - 1.14 * (1 - clamp(t) ** 2),
        0.21,
        true,
        rot + f * 1.9,
      );
    });
  }
  if (streamAction(a) && p > 0.06 && p < 0.86) {
    const e = Math.min(ease((p - 0.06) / 0.13), ease((0.86 - p) / 0.15)),
      hit = contact(a, p),
      x = hit.x - 0.17,
      y = -0.96 - 0.25 * (1 - e);
    c.save();
    c.translate(x, y);
    c.rotate(0.63);
    c.fillStyle = shade(-0.7, 0, 0.09, 0, [
      '#575851',
      '#eeeae3',
      '#9e9b90',
      '#555753',
      '#dad5c8',
    ]);
    c.beginPath();
    c.moveTo(-0.64, -0.51);
    c.lineTo(-0.06, -0.5);
    c.lineTo(0.11, -0.37);
    c.lineTo(0.03, -0.25);
    c.lineTo(-0.08, 0.03);
    c.quadraticCurveTo(-0.38, 0.17, -0.65, 0.025);
    c.closePath();
    c.fill();
    c.restore();
    c.strokeStyle = flowColour(r, a);
    c.lineWidth = (a === 'syrup' ? 0.024 : 0.055) * e;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x + 0.12, y - 0.21);
    c.quadraticCurveTo(hit.x - 0.045, y + 0.22, hit.x, hit.z * 0.45 - 0.03);
    c.stroke();
  }
  const n =
    a === 'sugar'
      ? addedPieces('sugar', r, before)
      : a === 'spice'
        ? 24
        : a === 'flakes'
          ? 14
          : 0;
  for (let i = 0; i < n; i++) {
    const t = (p - 0.11 - (i / n) * 0.23) / 0.49;
    if (t < 0 || t >= 1.02) continue;
    const x = -0.11 + Math.sin(i * 2.4) * 0.39 - 0.2 * (1 - clamp(t)),
      y = -1.1 * (1 - t * t) + Math.cos(i) * 0.04;
    if (a === 'ice' || a === 'sugar')
      cube(x, y, a === 'ice' ? 0.25 : 0.14, a === 'ice', t * 2 + i);
    else
      ellipse(
        x,
        y,
        a === 'spice' ? 0.012 : 0.025,
        a === 'spice' ? 0.009 : 0.017,
        '#6c4024',
      );
  }
  c.restore();
}

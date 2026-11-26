import { useEffect, useRef, useState } from 'react';
import {
  roomOpenings,
  wallPoint,
  openingWalls,
  footprint,
  type PlannerLayout,
  type PlannerProduct,
  type PlannerItem,
} from './plannerTypes';

type Point = { x: number; y: number };
type Options = {
  width: number;
  height: number;
  zoom: number;
  pan: Point;
  ru: boolean;
  selected?: string | null;
};
function transform(layout: PlannerLayout, o: Options) {
  const scale =
    Math.max(1, Math.min((o.width - 66) / layout.room.width, (o.height - 88) / layout.room.depth)) * o.zoom;
  const cx = o.width / 2 + o.pan.x,
    cy = o.height / 2 + o.pan.y;
  return {
    scale,
    cx,
    cy,
    to: (x: number, z: number) => ({ x: cx + x * scale, y: cy + z * scale }),
    from: (p: Point) => ({ x: (p.x - cx) / scale, z: (p.y - cy) / scale }),
  };
}
const colors: Record<string, string> = {
  Диваны: '#8f8f8f',
  Кресла: '#a5a5a5',
  Хранение: '#8f8f8f',
  Столы: '#a5a5a5',
  Стулья: '#b9b9b9',
  Кровати: '#b9b9b9',
  Свет: '#cacaca',
};
const spriteCache = new Map<string, HTMLImageElement>();
function loadSilhouette(id: string) {
  let image = spriteCache.get(id);
  if (!image) {
    image = new Image();
    image.decoding = 'async';
    image.src = '/furniture/plans/' + encodeURIComponent(id) + '.webp';
    spriteCache.set(id, image);
  }
  return image;
}
export function drawMeasuredPlan(
  c: CanvasRenderingContext2D,
  layout: PlannerLayout,
  products: readonly PlannerProduct[],
  o: Options
) {
  const { width: w, height: h, selected, ru } = o;
  const { scale: s, to } = transform(layout, o);
  const room = layout.room,
    a = to(-room.width / 2, -room.depth / 2),
    rw = room.width * s,
    rh = room.depth * s;
  c.clearRect(0, 0, w, h);
  c.fillStyle = '#e8e8e8';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#f8f8f8';
  c.fillRect(a.x, a.y, rw, rh);
  c.save();
  c.beginPath();
  c.rect(a.x, a.y, rw, rh);
  c.clip();
  c.strokeStyle = '#e0e0e0';
  c.lineWidth = 0.65;
  for (let v = 0; v < room.width; v += 0.25) {
    c.beginPath();
    c.moveTo(a.x + v * s, a.y);
    c.lineTo(a.x + v * s, a.y + rh);
    c.stroke();
  }
  for (let v = 0; v < room.depth; v += 0.25) {
    c.beginPath();
    c.moveTo(a.x, a.y + v * s);
    c.lineTo(a.x + rw, a.y + v * s);
    c.stroke();
  }
  c.restore();
  c.strokeStyle = '#464646';
  c.lineWidth = 4;
  c.strokeRect(a.x, a.y, rw, rh);
  const openings = roomOpenings(room);
  for (const [kind, opening] of Object.entries(openings)) {
    if (!opening) continue;
    const side = opening.wall || 'back',
      p = wallPoint(room, side, opening.start),
      origin = to(p.x, p.z),
      v = opening.width * s;
    c.save();
    c.translate(origin.x, origin.y);
    c.rotate((openingWalls.indexOf(side) * Math.PI) / 2);
    c.fillStyle = '#f8f8f8';
    c.fillRect(0, -3, v, 6);
    c.lineWidth = 1.5;
    c.strokeStyle = kind === 'door' ? '#777777' : '#777777';
    if (kind === 'window') c.strokeRect(0, -1.7, v, 3.4);
    else {
      if (opening.hinge === 'right') {
        c.translate(v, 0);
        c.scale(-1, 1);
      }
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, v);
      c.stroke();
      c.setLineDash([3, 3]);
      c.beginPath();
      c.arc(0, 0, v, 0, Math.PI / 2);
      c.stroke();
    }
    c.restore();
  }
  const ranked = (i: PlannerItem) =>
    ({ rug: 0, floor: 1, surface: 2, ceiling: 3 })[
      products.find((p) => p.id === i.productId)?.placement || 'floor'
    ];
  for (const i of [...layout.items].sort((a, b) => ranked(a) - ranked(b))) {
    const p = products.find((x) => x.id === i.productId);
    if (!p) continue;
    const at = to(i.x, i.z),
      pw = p.widthM * s,
      pd = p.depthM * s,
      sel = i.id === selected;
    c.save();
    c.translate(at.x, at.y);
    c.rotate(i.rotation);
    c.lineWidth = sel ? 2 : 1;
    c.strokeStyle = sel ? '#464646' : '#686868';
    c.fillStyle = p.placement === 'rug' ? '#d6d6d6' : colors[p.category || ''] || '#b9b9b9';
    if (p.placement === 'ceiling') c.setLineDash([3, 3]);
    const pic = loadSilhouette(p.id);
    if (!pic.complete || !pic.naturalWidth) {
      const round = /round|dome|lamp|круг|поворот/i.test(p.name) || p.category === 'Свет';
      c.beginPath();
      if (round) c.ellipse(0, 0, pw / 2, pd / 2, 0, 0, Math.PI * 2);
      else c.roundRect(-pw / 2, -pd / 2, pw, pd, Math.min(4, pw / 9, pd / 9));
      c.fill();
      c.stroke();
      c.setLineDash([]);
      if (p.category === 'Диваны' || p.category === 'Кресла' || p.category === 'Стулья') {
        c.lineWidth = 1;
        c.beginPath();
        c.roundRect(-pw * 0.38, -pd * 0.27, pw * 0.76, pd * 0.63, Math.min(3, pd / 10));
        c.stroke();
        if (pw > pd * 1.4) {
          c.beginPath();
          c.moveTo(0, -pd * 0.27);
          c.lineTo(0, pd * 0.35);
          c.stroke();
        }
      }
      if (p.category === 'Кровати') {
        c.fillStyle = '#e0e0e0';
        for (const dx of [-0.44, 0.02]) {
          c.beginPath();
          c.roundRect(pw * dx, -pd * 0.44, pw * 0.41, pd * 0.19, 3);
          c.fill();
          c.stroke();
        }
      }
    } else {
      const imgRatio = pic.naturalWidth / pic.naturalHeight;
      const iw = Math.min(pw, pd * imgRatio),
        ih = iw / imgRatio;
      c.drawImage(pic, -iw / 2, -ih / 2, iw, ih);
    }
    if (sel) {
      c.strokeStyle = '#464646';
      c.strokeRect(-pw / 2 - 3, -pd / 2 - 3, pw + 6, pd + 6);
    }
    c.restore();
  }
  const chosen = layout.items.find((i) => i.id === selected),
    product = chosen && products.find((p) => p.id === chosen.productId);
  if (chosen && product) {
    const ext = footprint(product, chosen.rotation),
      pos = to(chosen.x, chosen.z),
      right = a.x + rw - (pos.x + ext.x * s),
      left = pos.x - ext.x * s - a.x;
    const top = pos.y - ext.z * s - a.y,
      bottom = a.y + rh - (pos.y + ext.z * s),
      gap = Math.min(left, right, top, bottom);
    if (gap > 5) {
      const vertical = gap === top || gap === bottom;
      const x0 = vertical ? pos.x : gap === left ? a.x : pos.x + ext.x * s;
      const y0 = !vertical ? pos.y : gap === top ? a.y : pos.y + ext.z * s;
      const x1 = x0 + (vertical ? 0 : gap),
        y1 = y0 + (vertical ? gap : 0);
      c.strokeStyle = '#686868';
      c.lineWidth = 1;
      c.setLineDash([2, 3]);
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.stroke();
      c.setLineDash([]);
      c.font = '600 10px system-ui';
      c.fillStyle = '#464646';
      c.textAlign = vertical ? 'left' : 'center';
      c.fillText(
        Math.round((gap / s) * 100) + ' ' + (ru ? 'см' : 'cm'),
        (x0 + x1) / 2 + (vertical ? 4 : 0),
        (y0 + y1) / 2 - (vertical ? 0 : 4)
      );
    }
  }
  c.fillStyle = '#464646';
  c.font = '600 13px system-ui';
  c.textAlign = 'center';
  c.fillText(room.width.toLocaleString(ru ? 'ru' : 'en') + ' ' + (ru ? 'м' : 'm'), a.x + rw / 2, a.y - 10);
  c.save();
  c.translate(a.x - 11, a.y + rh / 2);
  c.rotate(-Math.PI / 2);
  c.fillText(room.depth.toLocaleString(ru ? 'ru' : 'en') + ' ' + (ru ? 'м' : 'm'), 0, 0);
  c.restore();
  c.font = '12px system-ui';
  c.textAlign = 'left';
  c.fillText(ru ? 'Вид сверху' : 'Floor plan', 12, h - 14);
}
function getPoint(el: HTMLCanvasElement, x: number, y: number) {
  const box = el.getBoundingClientRect();
  return { x: x - box.left, y: y - box.top };
}
type Props = {
  layout: PlannerLayout;
  products: readonly PlannerProduct[];
  selected: string | null;
  ru: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, z: number, rotation?: number) => void;
  onStart: () => void;
  onEnd: () => void;
  onCancel: () => void;
};
export default function MeasuredPlan(props: Props) {
  const el = useRef<HTMLCanvasElement>(null);
  const [size, resize] = useState({ width: 320, height: 320 }),
    [camera, setCamera] = useState({ zoom: 1, pan: { x: 0, y: 0 } });
  const active = useRef(new Map<number, Point>()),
    drag = useRef<{
      id: string | null;
      point: Point;
      start: Point;
      rotation: number;
      pan: Point;
      zoom: number;
      pair?: { dist: number; angle: number; center: Point };
      moved: boolean;
    } | null>(null);
  const [, redraw] = useState(0);
  const assetKey = props.layout.items.map((i) => i.productId).join('|');
  useEffect(() => {
    let live = true;
    const pics = Array.from(new Set(assetKey.split('|').filter(Boolean))).map(loadSilhouette);
    Promise.allSettled(pics.map((p) => p.decode())).then(() => {
      if (live) redraw((v) => v + 1);
    });
    return () => {
      live = false;
    };
  }, [assetKey]);
  const options = { ...size, ...camera, ru: props.ru, selected: props.selected };
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const ob = new ResizeObserver(() => resize({ width: node.clientWidth, height: node.clientHeight }));
    ob.observe(node);
    return () => ob.disconnect();
  }, []);
  useEffect(() => {
    const node = el.current;
    if (!node || !size.width || !size.height) return;
    const d = Math.min(devicePixelRatio || 1, 2);
    node.width = Math.round(size.width * d);
    node.height = Math.round(size.height * d);
    const c = node.getContext('2d');
    if (c) {
      c.scale(d, d);
      drawMeasuredPlan(c, props.layout, props.products, options);
    }
  });
  const pair = () => {
    const [a, b] = Array.from(active.current.values());
    return a && b
      ? {
          dist: Math.hypot(a.x - b.x, a.y - b.y),
          angle: Math.atan2(b.y - a.y, b.x - a.x),
          center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        }
      : undefined;
  };
  const hit = (p: Point) => {
    const v = transform(props.layout, options).from(p);
    return [...props.layout.items]
      .reverse()
      .sort(
        (a, b) =>
          Number(props.products.find((q) => q.id === a.productId)?.placement === 'rug') -
          Number(props.products.find((q) => q.id === b.productId)?.placement === 'rug')
      )
      .find((i) => {
        const prod = props.products.find((q) => q.id === i.productId);
        if (!prod) return false;
        const dx = v.x - i.x,
          dz = v.z - i.z,
          co = Math.cos(i.rotation),
          si = Math.sin(i.rotation);
        return (
          Math.abs(dx * co + dz * si) <= prod.widthM / 2 + 0.035 &&
          Math.abs(-dx * si + dz * co) <= prod.depthM / 2 + 0.035
        );
      });
  };
  return (
    <>
      <canvas
        ref={el}
        className="measured-plan"
        tabIndex={0}
        aria-label={
          props.ru
            ? 'План комнаты. Перетащите предмет или пустое место. Стрелки перемещают выбранное, Shift поворачивает.'
            : 'Room plan. Drag furniture or empty space. Arrow keys move, Shift rotates.'
        }
        onPointerDown={(e) => {
          const p = getPoint(e.currentTarget, e.clientX, e.clientY);
          e.currentTarget.setPointerCapture(e.pointerId);
          active.current.set(e.pointerId, p);
          if (active.current.size === 2 && drag.current) {
            drag.current.pair = pair();
            return;
          }
          if (active.current.size !== 1) return;
          const item = hit(p);
          if (item) props.onSelect(item.id);
          props.onStart();
          drag.current = {
            id: item?.id || null,
            point: p,
            start: { x: item?.x || 0, y: item?.z || 0 },
            rotation: item?.rotation || 0,
            pan: camera.pan,
            zoom: camera.zoom,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !active.current.has(e.pointerId)) return;
          const p = getPoint(e.currentTarget, e.clientX, e.clientY);
          active.current.set(e.pointerId, p);
          const pp = pair();
          if (pp && d.pair) {
            if (d.id) props.onMove(d.id, d.start.x, d.start.y, d.rotation + pp.angle - d.pair.angle);
            else
              setCamera({
                zoom: Math.max(0.65, Math.min(3, (d.zoom * pp.dist) / Math.max(1, d.pair.dist))),
                pan: {
                  x: d.pan.x + pp.center.x - d.pair.center.x,
                  y: d.pan.y + pp.center.y - d.pair.center.y,
                },
              });
            d.moved = true;
            return;
          }
          if (d.pair) return;
          const dx = p.x - d.point.x,
            dy = p.y - d.point.y;
          if (Math.hypot(dx, dy) < 3 && !d.moved) return;
          d.moved = true;
          const s = transform(props.layout, options).scale;
          if (d.id) props.onMove(d.id, d.start.x + dx / s, d.start.y + dy / s);
          else setCamera({ zoom: camera.zoom, pan: { x: d.pan.x + dx, y: d.pan.y + dy } });
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          if (!d) return;
          active.current.delete(e.pointerId);
          if (active.current.size) return;
          if (!d.moved && !d.id && props.selected) {
            const v = transform(props.layout, options).from(d.point);
            props.onMove(props.selected, v.x, v.z);
          }
          props.onEnd();
          drag.current = null;
        }}
        onPointerCancel={() => {
          active.current.clear();
          drag.current = null;
          props.onCancel();
        }}
        onKeyDown={(e) => {
          const i = props.layout.items.find((v) => v.id === props.selected);
          if (!i || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
          e.preventDefault();
          props.onStart();
          const x = Number(e.key === 'ArrowRight') - Number(e.key === 'ArrowLeft'),
            z = Number(e.key === 'ArrowDown') - Number(e.key === 'ArrowUp');
          props.onMove(
            i.id,
            i.x + (e.shiftKey ? 0 : x * 0.1),
            i.z + (e.shiftKey ? 0 : z * 0.1),
            i.rotation + (e.shiftKey ? (x * Math.PI) / 12 : 0)
          );
          props.onEnd();
        }}
      />
      <button
        className="plan-fit"
        type="button"
        onClick={() => setCamera({ zoom: 1, pan: { x: 0, y: 0 } })}
        aria-label={props.ru ? 'Сбросить вид плана' : 'Reset plan view'}
      >
        {props.ru ? 'Вся комната' : 'Fit room'}
      </button>
    </>
  );
}
export async function downloadPlan(layout: PlannerLayout, products: readonly PlannerProduct[], ru: boolean) {
  await Promise.allSettled(
    Array.from(new Set(layout.items.map((i) => i.productId))).map((id) => loadSilhouette(id).decode())
  );
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  drawMeasuredPlan(ctx, layout, products, { width: 1000, height: 900, zoom: 1, pan: { x: 0, y: 0 }, ru });
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'WEB4TG-floor-plan.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, 'image/png');
}

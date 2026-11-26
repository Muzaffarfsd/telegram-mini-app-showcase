import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

type Point = { x: number; y: number };
type Transform = { scale: number; x: number; y: number };

/** One-finger swipe changes photographs; pinch and drag explore a photograph. */
export default function FurniturePhotoSurface({ src, alt, ru, onPrevious, onNext }: {
  src: string; alt: string; ru: boolean; onPrevious: () => void; onNext: () => void;
}) {
  const points = useRef(new Map<number, Point>());
  const start = useRef<Point | null>(null);
  const wasPinch = useRef(false);
  const lastTap = useRef(0);
  const current = useRef<Transform>({ scale: 1, x: 0, y: 0 });
  const [transform, setTransform] = useState(current.current);
  useEffect(() => {
    current.current = { scale: 1, x: 0, y: 0 };
    setTransform(current.current);
    points.current.clear(); start.current = null; wasPinch.current = false; lastTap.current = 0;
  }, [src]);

  const update = (next: Transform, element: HTMLDivElement) => {
    const scale = Math.max(1, Math.min(4, next.scale));
    const maxX = element.clientWidth * (scale - 1) / 2;
    const maxY = element.clientHeight * (scale - 1) / 2;
    current.current = { scale, x: Math.max(-maxX, Math.min(maxX, next.x)), y: Math.max(-maxY, Math.min(maxY, next.y)) };
    setTransform(current.current);
  };
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const point = { x: event.clientX, y: event.clientY };
    points.current.set(event.pointerId, point);
    if (points.current.size === 1) { start.current = point; wasPinch.current = false; }
    else { wasPinch.current = true; lastTap.current = 0; }
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const old = points.current.get(event.pointerId);
    if (!old) return;
    const next = { x: event.clientX, y: event.clientY };
    const other = Array.from(points.current.entries()).find(([id]) => id !== event.pointerId)?.[1];
    const value = current.current;
    if (other) {
      const before = Math.hypot(old.x - other.x, old.y - other.y);
      const after = Math.hypot(next.x - other.x, next.y - other.y);
      if (before > 8 && after > 8) {
        const rect = event.currentTarget.getBoundingClientRect();
        const anchorX = (old.x + other.x) / 2 - (rect.left + rect.width / 2);
        const anchorY = (old.y + other.y) / 2 - (rect.top + rect.height / 2);
        const scale = Math.max(1, Math.min(4, value.scale * after / before));
        const ratio = scale / value.scale;
        update({ scale, x: anchorX - (anchorX - value.x) * ratio + (next.x - old.x) / 2, y: anchorY - (anchorY - value.y) * ratio + (next.y - old.y) / 2 }, event.currentTarget);
      }
    } else if (value.scale > 1.01) {
      update({ ...value, x: value.x + next.x - old.x, y: value.y + next.y - old.y }, event.currentTarget);
    }
    points.current.set(event.pointerId, next);
  };
  const end = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const initial = start.current;
    points.current.delete(event.pointerId);
    if (points.current.size || cancelled || wasPinch.current || !initial) return;
    const dx = event.clientX - initial.x, dy = event.clientY - initial.y;
    if (current.current.scale <= 1.01 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      lastTap.current = 0;
      if (dx < 0) onNext(); else onPrevious();
    } else if (Math.hypot(dx, dy) < 12) {
      const now = Date.now();
      if (now - lastTap.current < 320) {
        const scale = current.current.scale > 1.01 ? 1 : 2.5;
        update({ scale, x: 0, y: 0 }, event.currentTarget);
        lastTap.current = 0;
      } else lastTap.current = now;
    }
    start.current = null;
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = 45, value = current.current;
    const action: Record<string, () => void> = {
      '+': () => update({ ...value, scale: value.scale * 1.3 }, event.currentTarget),
      '=': () => update({ ...value, scale: value.scale * 1.3 }, event.currentTarget),
      '-': () => update({ ...value, scale: value.scale / 1.3 }, event.currentTarget),
      '0': () => update({ scale: 1, x: 0, y: 0 }, event.currentTarget),
      ArrowLeft: () => value.scale > 1 ? update({ ...value, x: value.x + step }, event.currentTarget) : onPrevious(),
      ArrowRight: () => value.scale > 1 ? update({ ...value, x: value.x - step }, event.currentTarget) : onNext(),
      ArrowUp: () => update({ ...value, y: value.y + step }, event.currentTarget),
      ArrowDown: () => update({ ...value, y: value.y - step }, event.currentTarget),
    };
    if (action[event.key]) { event.preventDefault(); action[event.key](); }
  };
  return <div className="fs-zoom-viewport" tabIndex={0} role="region"
    aria-label={ru ? 'Фотография товара: листайте пальцем или стрелками, увеличивайте двумя пальцами или клавишами плюс и минус' : 'Product photo: swipe or use arrow keys to browse; pinch or use plus and minus to zoom'}
    onPointerDown={down} onPointerMove={move} onPointerUp={event => end(event)} onPointerCancel={event => end(event, true)} onLostPointerCapture={event => { if (points.current.has(event.pointerId)) end(event, true); }} onKeyDown={key}>
    <img src={src} alt={alt} draggable={false} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }} />
  </div>;
}

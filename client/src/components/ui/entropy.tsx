'use client'
import { useEffect, useRef } from 'react'

interface EntropyProps {
  className?: string
  size?: number
}

export function Entropy({ className = "", size = 400 }: EntropyProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;pointer-events:none;'
    iframe.setAttribute('tabindex', '-1')
    iframe.setAttribute('aria-hidden', 'true')
    iframeRef.current = iframe
    containerRef.current.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    iframeDoc.open()
    iframeDoc.write(`<!DOCTYPE html>
<html><head><style>
  * { margin:0; padding:0; }
  html, body { width:100%; height:100%; background:transparent; overflow:hidden; }
  canvas { display:block; }
</style></head>
<body><canvas id="c"></canvas>
<script>
(function() {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const s = ${size};
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = s * dpr;
  canvas.height = s * dpr;
  canvas.style.width = s + 'px';
  canvas.style.height = s + 'px';
  ctx.scale(dpr, dpr);

  const gridSize = 15;
  const spacing = s / gridSize;
  const particles = [];
  const connectionDist = 50;
  const neighborDist = 80;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = spacing * i + spacing / 2;
      const y = spacing * j + spacing / 2;
      particles.push({
        x: x, y: y,
        ox: x, oy: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        order: x < s / 2,
        influence: 0
      });
    }
  }

  const cellSize = neighborDist;
  const cols = Math.ceil(s / cellSize) + 1;
  const rows = Math.ceil(s / cellSize) + 1;

  function getCell(x, y) {
    return Math.max(0, Math.min(cols - 1, Math.floor(x / cellSize))) +
           Math.max(0, Math.min(rows - 1, Math.floor(y / cellSize))) * cols;
  }

  let time = 0;
  let grid = {};

  function rebuildGrid() {
    grid = {};
    for (let i = 0; i < particles.length; i++) {
      const c = getCell(particles[i].x, particles[i].y);
      if (!grid[c]) grid[c] = [];
      grid[c].push(i);
    }
  }

  function getNeighborIndices(p) {
    const cx = Math.floor(p.x / cellSize);
    const cy = Math.floor(p.y / cellSize);
    const result = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        const cell = grid[nx + ny * cols];
        if (cell) {
          for (let k = 0; k < cell.length; k++) result.push(cell[k]);
        }
      }
    }
    return result;
  }

  function animate() {
    ctx.clearRect(0, 0, s, s);

    if (time % 20 === 0) rebuildGrid();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.order) {
        const dx = p.ox - p.x;
        const dy = p.oy - p.y;
        let cix = 0, ciy = 0;

        if (time % 20 === 0) {
          const ni = getNeighborIndices(p);
          for (let k = 0; k < ni.length; k++) {
            const n = particles[ni[k]];
            if (n === p || n.order) continue;
            const dist = Math.hypot(p.x - n.x, p.y - n.y);
            if (dist < neighborDist) {
              const str = 1 - dist / neighborDist;
              cix += n.vx * str;
              ciy += n.vy * str;
              p.influence = Math.max(p.influence, str);
            }
          }
        }

        p.x += dx * 0.05 * (1 - p.influence) + cix * p.influence;
        p.y += dy * 0.05 * (1 - p.influence) + ciy * p.influence;
        p.influence *= 0.99;
      } else {
        p.vx += (Math.random() - 0.5) * 0.5;
        p.vy += (Math.random() - 0.5) * 0.5;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < s / 2 || p.x > s) p.vx *= -1;
        if (p.y < 0 || p.y > s) p.vy *= -1;
        p.x = Math.max(s / 2, Math.min(s, p.x));
        p.y = Math.max(0, Math.min(s, p.y));
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const alpha = p.order ? 0.8 - p.influence * 0.5 : 0.8;
      const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillStyle = '#ffffff' + hex;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (time % 20 === 0) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const ni = getNeighborIndices(p);
        for (let k = 0; k < ni.length; k++) {
          const n = particles[ni[k]];
          if (ni[k] <= i) continue;
          const dist = Math.hypot(p.x - n.x, p.y - n.y);
          if (dist < 50) {
            const a = 0.2 * (1 - dist / 50);
            const h = Math.round(a * 255).toString(16).padStart(2, '0');
            ctx.strokeStyle = '#ffffff' + h;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      }
    }

    ctx.strokeStyle = '#ffffff4D';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(s / 2, 0);
    ctx.lineTo(s / 2, s);
    ctx.stroke();

    time++;
    requestAnimationFrame(animate);
  }

  animate();
})();
<\/script></body></html>`)
    iframeDoc.close()

    return () => {
      if (iframeRef.current && containerRef.current) {
        try { containerRef.current.removeChild(iframeRef.current) } catch(e) {}
      }
    }
  }, [size])

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ width: size, height: size }}>
    </div>
  )
}

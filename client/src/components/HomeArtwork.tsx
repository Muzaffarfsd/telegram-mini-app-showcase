import { useEffect, useRef, type ImgHTMLAttributes } from 'react';
import './HomeArtwork.css';

interface Props extends Pick<ImgHTMLAttributes<HTMLImageElement>, 'sizes' | 'srcSet' | 'fetchPriority' | 'loading'> {
  src: string;
  placeholder: string;
  className: string;
  alt: string;
  view?: string;
}

const background = (src: string) => `url(${JSON.stringify(src)})`;

export function HomeArtwork({ src, placeholder, className, alt, view, ...imageProps }: Props) {
  const initial = useRef(placeholder);
  const displayed = useRef(initial.current);
  const viewport = useRef<HTMLSpanElement>(null);
  const frame = useRef<HTMLSpanElement>(null);
  const front = useRef<HTMLSpanElement>(null);
  const requested = useRef<HTMLImageElement>(null);
  const transition = useRef<Animation | null>(null);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    let observer: IntersectionObserver | undefined;
    const enter = () => { el.dataset.entered = 'true'; observer?.disconnect(); };
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) enter(); });
      observer.observe(el);
    } else enter();
    return () => { observer?.disconnect(); transition.current?.cancel(); };
  }, []);

  async function reveal(img: HTMLImageElement, failed = false) {
    if (!failed) {
      try { await img.decode(); }
      catch { failed = !img.naturalWidth; }
    }
    // Finish the visible dissolve before handing the surface to the latest selection.
    if (transition.current) await transition.current.finished.catch(() => {});
    const base = frame.current;
    const layer = front.current;
    if (!base || !layer || requested.current !== img) return;
    const next = failed ? placeholder : img.currentSrc || img.src;
    if (next !== displayed.current) {
      const animate = !document.hidden && base.getClientRects().length > 0
        && !document.documentElement.classList.contains('reduce-motion')
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (animate && typeof layer.animate === 'function') {
        layer.style.backgroundImage = background(next);
        const animation = layer.animate([
          { opacity: 0, transform: 'translateY(3px) scale(.996)' },
          { opacity: 1, transform: 'none' },
        ], { duration: 230, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' });
        transition.current = animation;
        try { await animation.finished; }
        catch { return; }
        base.style.backgroundImage = background(next);
        animation.cancel();
        layer.style.removeProperty('background-image');
        transition.current = null;
      } else {
        base.style.backgroundImage = background(next);
      }
      displayed.current = next;
    }
    if (requested.current === img) img.dataset.ready = failed ? 'fallback' : 'true';
  }

  return <span ref={viewport} className={`home-artwork ${className}`} data-entered="false">
    <span ref={frame} className="home-artwork__composition" style={{ backgroundImage: background(initial.current) }}>
      <span ref={front} className="home-artwork__front" aria-hidden="true" />
      <img key={src} ref={requested} src={src} {...imageProps} alt={alt} width={1024} height={1536} data-view={view}
        data-ready="false" draggable={false} decoding="async"
        onLoad={event => { void reveal(event.currentTarget); }} onError={event => { void reveal(event.currentTarget, true); }} />
    </span>
  </span>;
}

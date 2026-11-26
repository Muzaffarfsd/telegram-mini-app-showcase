import { useEffect, useRef, useState } from 'react';

const images = import.meta.glob<string>(['../assets/showcase-art/*.webp', '!../assets/showcase-art/*.preview.webp'], {
  eager: true, query: '?no-inline', import: 'default',
});
// The asset builder packs tiles alphabetically into four columns.
const paths = Object.keys(images).sort();
const rows = Math.ceil(paths.length / 4);
const artwork = new Map(paths.map((path, index) => [
  path.slice(path.lastIndexOf('/') + 1, -5),
  { src: images[path], position: `${(index % 4) / 3 * 100}% ${Math.floor(index / 4) / Math.max(rows - 1, 1) * 100}%` },
]));

let detailObserver: IntersectionObserver | undefined;
function watchDetail(image: HTMLImageElement) {
  if (!window.IntersectionObserver) {
    image.src = image.dataset.detail!;
    return;
  }
  detailObserver ??= new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const img = entry.target as HTMLImageElement;
      detailObserver!.unobserve(img);
      img.src = img.dataset.detail!;
    }
  }, { root: document.getElementById('root'), rootMargin: '180px 0px' });
  detailObserver.observe(image);
  return () => detailObserver?.unobserve(image);
}

export function ShowcaseArtwork({ id, index, ru }: { id: string; index: number; ru: boolean }) {
  const [coverReady, setCoverReady] = useState(false);
  const [screenReady, setScreenReady] = useState('');
  const [coverFailed, setCoverFailed] = useState(false);
  const [screenFailure, setScreenFailure] = useState('');
  const image = useRef<HTMLImageElement>(null);
  const art = artwork.get(id)!;
  const furniture = id === 'furniture-studio';
  const screenSource = `/showcase/screens/furniture-studio-v6${ru ? '' : '-en'}.png`;
  const screenFailed = screenFailure === screenSource;
  const ready = (coverReady || coverFailed) && (!furniture || screenReady === screenSource || screenFailed);
  const source = furniture ? '/showcase/covers/furniture-studio-v4.webp' : art.src;
  const eager = index < 2 || coverReady || coverFailed;
  useEffect(() => {
    if (!eager && image.current) return watchDetail(image.current);
  }, [eager, id]);
  return <span className={`ps-art${ready ? ' ps-art-ready' : ''}${furniture ? ' ps-art-furniture' : ''}${coverFailed ? ' ps-furniture-no-cover' : ''}${screenFailed ? ' ps-furniture-no-screen' : ''}`} aria-hidden="true"
    style={{ backgroundPosition: art.position, backgroundSize: `400% ${rows * 100}%` }}>
    {furniture ? <span className="ps-furniture-layer">
      <img ref={image} className="ps-furniture-cover" src={eager ? source : undefined} data-detail={source}
        alt="" draggable={false} decoding="async" onLoad={event => { void event.currentTarget.decode().then(() => setCoverReady(true), () => setCoverFailed(true)); }} onError={() => setCoverFailed(true)} />
      <span className="ps-furniture-screen"><img src={eager || coverReady ? screenSource : undefined}
        alt="" draggable={false} decoding="async" onLoad={event => { void event.currentTarget.decode().then(() => setScreenReady(screenSource), () => setScreenFailure(screenSource)); }} onError={() => setScreenFailure(screenSource)} /></span>
      {screenFailed && <img className="ps-furniture-fallback" src="/furniture/real-products/sofa-main.webp" alt="" draggable={false} decoding="async" />}
    </span> : <img ref={image} src={eager ? source : undefined} data-detail={source} width={612} height={816}
      alt="" draggable={false} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async"
      onLoad={event => { void event.currentTarget.decode().then(() => setCoverReady(true), () => {}); }} />}
  </span>;
}

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

export function ShowcaseArtwork({ id, index }: { id: string; index: number }) {
  const [ready, setReady] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  const art = artwork.get(id)!;
  const eager = index < 2 || ready;
  useEffect(() => {
    if (!eager && image.current) return watchDetail(image.current);
  }, [eager, id]);
  return <span className={ready ? 'ps-art ps-art-ready' : 'ps-art'} aria-hidden="true"
    style={{ backgroundPosition: art.position, backgroundSize: `400% ${rows * 100}%` }}>
    <img ref={image} src={eager ? art.src : undefined} data-detail={art.src} width={612} height={816}
      alt="" draggable={false} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async"
      onLoad={event => { void event.currentTarget.decode().then(() => setReady(true), () => {}); }} />
  </span>;
}

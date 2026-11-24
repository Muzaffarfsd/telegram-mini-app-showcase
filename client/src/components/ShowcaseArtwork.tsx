import { useState } from 'react';

// A small, complete version of every scene ships with this route. It can
// paint even if the user flings to the last card before its WebP arrives.
const previews = import.meta.glob<string>('../assets/showcase-art/*.preview.webp', {
  eager: true, query: '?inline', import: 'default',
});
const images = import.meta.glob<string>(['../assets/showcase-art/*.webp', '!../assets/showcase-art/*.preview.webp'], {
  eager: true, query: '?no-inline', import: 'default',
});

export function ShowcaseArtwork({ id, index }: { id: string; index: number }) {
  const [ready, setReady] = useState(false);
  const path = '../assets/showcase-art/' + id;
  const preview = previews[path + '.preview.webp'];
  return <span className={ready ? 'ps-art ps-art-ready' : 'ps-art'}
    style={ready ? undefined : { backgroundImage: `url("${preview}")` }} aria-hidden="true">
    <img src={images[path + '.webp']} width={612} height={816} alt="" draggable={false}
      loading={index < 2 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async"
      onLoad={event => {
        const image = event.currentTarget;
        void image.decode().then(() => setReady(true), () => {});
      }} />
  </span>;
}

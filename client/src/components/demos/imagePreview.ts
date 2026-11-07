import type { CSSProperties, SyntheticEvent } from 'react';

/** A tiny embedded version is painted immediately while the real image loads.
 * It is removed on load so transparent edges never retain a blurred backdrop. */
export function previewProps(url: string, previews: Record<string, string>, fit: 'cover' | 'contain' = 'cover') {
  const preview = previews[url];
  if (!preview) return {};
  const style: CSSProperties = { backgroundImage: `url("${preview}")`, backgroundSize: fit, backgroundRepeat: 'no-repeat', backgroundPosition: 'center' };
  return {
    style,
    'data-preview-src': url,
    onLoad: (event: SyntheticEvent<HTMLImageElement>) => {
      const image = event.currentTarget;
      const loadedSrc = image.src;
      const clearPreview = () => {
        if (image.src === loadedSrc) image.style.backgroundImage = 'none';
      };
      if (typeof image.decode === 'function') {
        void image.decode().catch(() => {}).then(clearPreview);
      } else clearPreview();
    },
    onError: (event: SyntheticEvent<HTMLImageElement>) => {
      const image = event.currentTarget;
      // Show the embedded preview itself if the full image cannot be fetched.
      // Comparing the URL prevents an error loop if the preview is unsupported.
      if (image.src !== preview) image.src = preview;
    },
  };
}

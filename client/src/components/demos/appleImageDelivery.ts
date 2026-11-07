import { appleCreativeWidths } from './appleCreativeSizes2026';
import { applePreview, clearApplePreview, fallbackApplePreview } from './appleImagePreviews';
import type { CSSProperties, SyntheticEvent } from 'react';

/** Use actual rendered width (and the browser's DPR) for image selection. */
export type AppleImageContext = 'hero' | 'category' | 'catalog' | 'gallery' | 'thumbnail' | 'detail' | 'zoom';
type ResponsiveImage = { src:string; srcSet?:string; sizes?:string; style?: CSSProperties; onLoad?: (event:SyntheticEvent<HTMLImageElement>)=>void; onError?: (event:SyntheticEvent<HTMLImageElement>)=>void };

const sizes:Record<AppleImageContext,string> = {
  hero:'(max-width: 448px) 55vw, 220px',
  category:'(max-width: 448px) 44vw, 180px',
  catalog:'(max-width: 448px) calc((100vw - 49px) / 2), 200px',
  gallery:'(max-width: 448px) calc(100vw - 74px), 374px',
  thumbnail:'48px',
  detail:'(max-width: 448px) calc(100vw - 100px), 348px',
  zoom:'(max-width: 448px) calc(200vw - 64px), 840px',
};
/** Serve locally generated transparent illustrations at appropriate sizes. */
export function appleImageProps(src:string, context:AppleImageContext):ResponsiveImage {
  const preview = { style: applePreview(src, context === 'gallery' || context === 'zoom'), onLoad: clearApplePreview, onError: (event:SyntheticEvent<HTMLImageElement>) => { if (!fallbackApplePreview(event,src)) clearApplePreview(event); } };
  const generated = /^\/apple-store\/generated\/([^/?#]+)\.webp$/.exec(src);
  if (generated) {
    const base = `/apple-store/generated/sizes/${generated[1]}`;
    return {...preview, src:context==='thumbnail' ? `${base}-160.webp` : context==='zoom' ? src : `${base}-480.webp`, srcSet:`${base}-160.webp 160w, ${base}-480.webp 480w, ${src} 940w`, sizes:sizes[context]};
  }
  const local = /^\/apple-store\/creative\/([^/?#]+\.webp)$/.exec(src);
  if (local && appleCreativeWidths[local[1]]) {
    const name = local[1].slice(0,-5);
    const base = `/apple-store/creative/sizes/${name}`;
    const originalWidth = appleCreativeWidths[local[1]];
    const set = [`${base}-160.webp 160w`, `${base}-480.webp 480w`, `${base}-940.webp 940w`, `${src} ${originalWidth}w`].join(', ');
    const fallback = context==='thumbnail' ? `${base}-160.webp` : (context==='zoom' ? src : `${base}-480.webp`);
    return {...preview, src:fallback, srcSet:set, sizes:sizes[context]};
  }
  return {...preview, src};
}

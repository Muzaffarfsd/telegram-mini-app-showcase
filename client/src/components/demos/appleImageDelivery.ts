import { appleCreativeWidths } from './appleCreativeSizes2026';
import { appleLocalProductImages } from './appleLocalProductImages';

/** Use actual rendered width (and the browser's DPR) for image selection. */
export type AppleImageContext = 'hero' | 'category' | 'catalog' | 'gallery' | 'thumbnail' | 'detail' | 'zoom';
type ResponsiveImage = { src:string; srcSet?:string; sizes?:string };

const sizes:Record<AppleImageContext,string> = {
  hero:'(max-width: 448px) 55vw, 220px',
  category:'(max-width: 448px) 44vw, 180px',
  catalog:'(max-width: 448px) calc((100vw - 49px) / 2), 200px',
  gallery:'(max-width: 448px) calc(100vw - 74px), 374px',
  thumbnail:'48px',
  detail:'(max-width: 448px) calc(100vw - 100px), 348px',
  zoom:'(max-width: 448px) calc(200vw - 64px), 840px',
};
const preferred:Record<AppleImageContext,number> = { hero:480, category:480, catalog:480, gallery:720, thumbnail:160, detail:720, zoom:940 };
const widths = [160,320,480,720,940];

/**
 * Apple Store image CDN delivers a costly 940px PNG even for 48px thumbnails.
 * Ask it for the same transparent model/finish in the size the browser needs.
 * URLs outside its image service are left untouched. The generated local WebP
 * derivatives are ours and retain alpha; original files remain available for zoom.
 */
export function appleImageProps(src:string, context:AppleImageContext):ResponsiveImage {
  const local = /^\/apple-store\/creative\/([^/?#]+\.webp)$/.exec(src);
  if (local && appleCreativeWidths[local[1]]) {
    const name = local[1].slice(0,-5);
    const base = `/apple-store/creative/sizes/${name}`;
    const originalWidth = appleCreativeWidths[local[1]];
    const set = [`${base}-160.webp 160w`, `${base}-480.webp 480w`, `${src} ${originalWidth}w`].join(', ');
    const fallback = context==='thumbnail' ? `${base}-160.webp` : (context==='zoom' ? src : `${base}-480.webp`);
    return {src:fallback, srcSet:set, sizes:sizes[context]};
  }
  try {
    const url = new URL(src);
    // Match the original model/finish and preserve all semantic URL parameters.
    // The CDN's size/format parameters do not identify a different product.
    const key = new URL(url.href);
    key.hash = '';
    if (key.hostname === 'store.storeimages.cdn-apple.com') {
      for (const param of ['wid','hei','fmt']) key.searchParams.delete(param);
    }
    key.searchParams.sort();
    const cached = appleLocalProductImages[key.toString()];
    if (cached) {
      const file = (width:number) => `/apple-store/products/${cached.id}-${width}.webp`;
      const desired = preferred[context];
      const fallback = cached.widths.find(width=>width>=desired) ?? cached.widths[cached.widths.length-1];
      return {src:file(fallback),srcSet:cached.widths.map(width=>`${file(width)} ${width}w`).join(', '),sizes:sizes[context]};
    }
    if (url.hostname !== 'store.storeimages.cdn-apple.com' || !url.pathname.includes('/is/')) return {src};
    const originalWidth=Number(url.searchParams.get('wid')) || 940;
    const originalHeight=Number(url.searchParams.get('hei')) || 1112;
    if (!Number.isFinite(originalWidth) || !Number.isFinite(originalHeight) || originalWidth<=0 || originalHeight<=0) return {src};
    const urlAt = (width:number) => {
      const next = new URL(url.href);
      next.searchParams.set('wid',String(width));
      next.searchParams.set('hei',String(Math.round(width*originalHeight/originalWidth)));
      return next.href;
    };
    return {src:urlAt(preferred[context]),srcSet:widths.map(w=>`${urlAt(w)} ${w}w`).join(', '),sizes:sizes[context]};
  } catch {
    return {src};
  }
}

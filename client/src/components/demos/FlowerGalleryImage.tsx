import { useEffect, useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react';
import { flowerImageProps, hasOptimizedFlowerImage } from './flowerImageDelivery';

type Context = 'home' | 'catalog' | 'detail' | 'zoom';
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string; context?: Context };

// Older saved FLORA products remain usable without adding their preview data
// to the common catalog bundle. Their lightweight preview chunk loads only
// when one of these products is displayed, in parallel with its full image.
function LegacyFlowerImage({ src, style, context = 'catalog', ...props }: Props) {
  const [preview, setPreview] = useState<string>();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void import('./legacyFlowerImagePreviews').then(module => {
      if (active) setPreview(module.legacyFlowerPreviews[src]);
    }).catch(() => {});
    return () => { active = false; };
  }, [src]);
  const displaySrc = failed && preview ? preview : src;
  const onLoad = (event:SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget, current = image.currentSrc, requested = image.getAttribute('src');
    const finish = () => { if (image.isConnected && image.currentSrc === current && image.getAttribute('src') === requested && image.complete && image.naturalWidth) setReady(true); };
    if (typeof image.decode === 'function') void image.decode().then(finish).catch(finish); else finish();
  };
  const onError = () => { if (!failed) setFailed(true); };
  const progressive = context === 'detail' || context === 'zoom';
  return <img {...props} src={displaySrc} style={{ ...(!ready && preview ? {backgroundImage:progressive?`url("${src.replace('/flower-store/','/flower-store/preview80/')}"), url("${preview}")`:`url("${preview}")`,backgroundPosition:progressive?'center, center':'center',backgroundSize:progressive?'contain, contain':'contain',backgroundRepeat:progressive?'no-repeat, no-repeat':'no-repeat'} : {}), ...style }} onLoad={onLoad} onError={onError}/>;
}

export function FlowerGalleryImage({ src, context = 'catalog', style, ...props }: Props) {
  if (!hasOptimizedFlowerImage(src)) return <LegacyFlowerImage key={src} src={src} context={context} style={style} {...props}/>;
  const delivery = flowerImageProps(src, context);
  return <img {...delivery} {...props} style={{ ...delivery.style, ...style }}/>;
}

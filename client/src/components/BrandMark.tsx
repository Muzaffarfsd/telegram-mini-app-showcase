import { useId } from 'react';
import symbolMask from '../assets/brand/header-symbol-mask-v1.webp';

/** The original artwork is used as a luminance mask so its silhouette stays intact. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  const id = `web4tg-mark-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="89 346 1046 569"
      width={compact ? 20 : 54}
      height={compact ? 11 : 30}
      role={compact ? undefined : 'img'}
      aria-label={compact ? undefined : 'WEB4TG'}
      aria-hidden={compact || undefined}
      data-testid={compact ? undefined : 'header-brand-mark'}
      style={{ display: 'block', flex: 'none' }}
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254" style={{ maskType: 'luminance' }}>
          <image href={symbolMask} xlinkHref={symbolMask} x="0" y="0" width="1254" height="1254" />
        </mask>
      </defs>
      <rect x="0" y="0" width="1254" height="1254" fill={compact ? 'currentColor' : '#000000'} mask={`url(#${id})`} />
    </svg>
  );
}

import { warmImage } from './warmImage';

// Only the first visible image for an intended demo: preloading every catalog
// would compete with the page the user is actually viewing.
const firstImages: Record<string, string> = {
  'muraka-fashion': '/muraka-fashion/transparent-v2/hero-jacket.webp',
  'women-fashion': '/women-fashion/hero.webp',
  'jewelry-store': '/jewelry/tiffany-creative/t1-worn.png',
  'nike-sneakers': '/royal-step/jordan-cutout.webp',
  'royal-step': '/royal-step/jordan-cutout.webp',
  'lumi-studio': '/lumi/generated/lumi-v4-hero.webp',
  'china-buyer': '/china-buyer/v5-feature-fast.webp',
  'medical-center': '/medical/generated/hero.webp',
  'opt-market': '/b2b/generated/partiya-v2-hero.webp',
  'skincare-aura': '/skincare-aura/hf_20260523_125330_45da8ca2-6d28-4d24-a5f3-8e072c82a44c_min.webp',
};

export function warmDemoImage(id: string | undefined, priority: 'high' | 'low' = 'low'): void {
  if (!id) return;
  if (id === 'flower-store') {
    const base = '/flower-store/flowers-v6/optimized/vase-roses';
    warmImage(`${base}-480.webp`, priority, {
      srcSet: `${base}-480.webp 480w, ${base}-800.webp 800w, /flower-store/flowers-v6/vase-roses.webp 1200w`,
      sizes: '(max-width: 397px) 60vw, 238px',
    });
    return;
  }
  if (id === 'apple-store') {
    const full = '/apple-store/generated/hero-iphone18-promax-burgundy-reference-v1.webp';
    const base = '/apple-store/generated/sizes/hero-iphone18-promax-burgundy-reference-v1';
    warmImage(`${base}-480.webp`, priority, {
      srcSet: `${base}-160.webp 160w, ${base}-480.webp 480w, ${full} 940w`,
      sizes: '(max-width: 448px) 55vw, 220px',
    });
    return;
  }
  warmImage(firstImages[id], priority);
}

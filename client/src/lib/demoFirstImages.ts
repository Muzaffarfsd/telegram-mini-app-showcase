// Shared by runtime and build-time direct-link loading. Responsive attributes
// must match the visible image to avoid downloading a second variant.
export type DemoFirstImage = { src: string; srcSet?: string; sizes?: string };
export const DEMO_FIRST_IMAGES: Record<string, DemoFirstImage> = {
  'muraka-fashion': { src: '/muraka-fashion/transparent-v2/hero-jacket.webp' },
  'furniture-studio': { src: '/furniture/home/sloane-1440.webp', srcSet: '/furniture/home/sloane-640.webp 640w, /furniture/home/sloane-1440.webp 1440w', sizes: '(min-width: 990px) 760px, (min-width: 650px) 76vw, 120vw' },
  'women-fashion': { src: '/women-fashion/hero.webp' },
  'jewelry-store': { src: '/jewelry/tiffany-hero-candidates/hero-close-t1.webp' },
  'nike-sneakers': { src: '/royal-step/jordan-cutout.webp' },
  'royal-step': { src: '/royal-step/jordan-cutout.webp' },
  'lumi-studio': { src: '/lumi/generated/lumi-v4-hero.webp' },
  'medical-center': { src: '/medical/generated/hero.webp' },
  'opt-market': { src: '/b2b/generated/partiya-v2-hero.webp' },
  'skincare-aura': { src: '/skincare-aura/hf_20260523_125330_45da8ca2-6d28-4d24-a5f3-8e072c82a44c_min.webp' },
  'takt-coffee': { src: '/takt-coffee/editorial/cherry-mocha-480.webp', srcSet: '/takt-coffee/editorial/cherry-mocha-480.webp 480w, /takt-coffee/editorial/cherry-mocha-900.webp 900w', sizes: '(min-width: 700px) 420px, 72vw' },
  'china-buyer': { src: '/china-buyer/atelier/voyage-640.webp', srcSet: '/china-buyer/atelier/voyage-640.webp 640w, /china-buyer/atelier/voyage-1280.webp 1280w', sizes: '(min-width: 760px) 570px, 100vw' },
  'flower-store': { src: '/flower-store/flowers-v6/optimized/vase-roses-480.webp', srcSet: '/flower-store/flowers-v6/optimized/vase-roses-480.webp 480w, /flower-store/flowers-v6/optimized/vase-roses-800.webp 800w, /flower-store/flowers-v6/vase-roses.webp 1200w', sizes: '(max-width: 397px) 60vw, 238px' },
  'apple-store': { src: '/apple-store/generated/sizes/hero-iphone18-promax-burgundy-reference-v1-480.webp', srcSet: '/apple-store/generated/sizes/hero-iphone18-promax-burgundy-reference-v1-160.webp 160w, /apple-store/generated/sizes/hero-iphone18-promax-burgundy-reference-v1-480.webp 480w, /apple-store/generated/hero-iphone18-promax-burgundy-reference-v1.webp 940w', sizes: '(max-width: 448px) 55vw, 220px' },
};

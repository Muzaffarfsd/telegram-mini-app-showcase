import type { LumiService } from './lumiData';

// Four complementary frames show the craft for the service category.
export const homeGallery = {
  main: 'lumi-v4-hero.webp',
  details: ['lumi-v4-hair-1.webp', 'lumi-v4-nails-1.webp', 'lumi-v4-face-1.webp'],
};

export function galleryImagesFor(item: LumiService): { main: string; details: string[] } {
  const group = item.category === 'Волосы' ? 'hair' : item.category === 'Ногти' ? 'nails' : item.category === 'Брови' ? 'brows' : 'face';
  if (item.id === 'manicure') {
    return { main: 'lumi-v4-manicure-main.webp', details: ['lumi-v4-manicure-1.webp', 'lumi-v4-manicure-2.webp', 'lumi-v4-manicure-3.webp'] };
  }
  return { main: `lumi-v4-${group}-main.webp`, details: [1, 2, 3].map(n => `lumi-v4-${group}-${n}.webp`) };
}

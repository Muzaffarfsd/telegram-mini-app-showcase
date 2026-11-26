// Original images in this gallery are rendered or art-directed for the showroom.
const prefix = '/furniture/studio/';
export const studioAngles = ['studio', 'interior', 'detail', 'front', 'back', 'side'] as const;
const labels = [
  ['Студийный ракурс', 'Studio view'],
  ['Интерьерная визуализация', 'Interior visualisation'],
  ['Деталь', 'Detail'],
  ['Спереди', 'Front view'],
  ['Сзади', 'Rear view'],
  ['Сбоку', 'Side view'],
];

export function studioGallery(id: string, count: number) {
  return studioAngles.slice(0, count).map((angle) => prefix + id + '/' + angle + '.webp');
}
export function studioAngleLabel(index: number, ru: boolean) {
  return labels[index]?.[ru ? 0 : 1] || (ru ? 'Ракурс' : 'View');
}
export function studioThumbnail(src: string | undefined) {
  return src?.startsWith(prefix) ? src.replace(/\.webp$/, '.small.webp') : src;
}
export function studioSrcSet(src: string | undefined) {
  return src?.startsWith(prefix) ? studioThumbnail(src) + ' 480w, ' + src + ' 1080w' : undefined;
}

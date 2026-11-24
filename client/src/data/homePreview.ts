export const firstHomePreview = '/home-editorial/fashion-muraka-home-v2.webp';
// The 2:3 artwork is contained in the full-width preview, so its height sets its painted width.
export const homePreviewSizes = '(max-width: 350px) 180px, (max-width: 473px) 63.34vw, 300px';
export const homePreviewSrcSet = (src: string) =>
  src.replace('/home-editorial/', '/home-editorial/mobile/') + ' 640w, ' + src + ' 1024w';

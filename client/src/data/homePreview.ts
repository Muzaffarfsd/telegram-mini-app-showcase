export const firstHomePreview = '/home-editorial/fashion-muraka-home-v2.webp';
export const homePreviewSizes = '(min-width: 800px) 260px, (min-width: 540px) 280px, 51vw';
export const homePreviewSrcSet = (src: string) =>
  src.replace('/home-editorial/', '/home-editorial/mobile/') + ' 640w, ' + src + ' 1024w';

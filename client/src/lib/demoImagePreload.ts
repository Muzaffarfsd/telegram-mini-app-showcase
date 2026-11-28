import { DEMO_FIRST_IMAGES } from './demoFirstImages';
import { warmImage } from './warmImage';

// Only the first visible image for an intended demo: preloading every catalog
// would compete with the page the user is actually viewing.
export function warmDemoImage(id: string | undefined, priority: 'high' | 'low' = 'low'): void {
  if (!id) return;
  const image = DEMO_FIRST_IMAGES[id];
  if (!image) return;
  const responsive = image.srcSet && image.sizes ? { srcSet: image.srcSet, sizes: image.sizes } : undefined;
  warmImage(image.src, priority, responsive);
}

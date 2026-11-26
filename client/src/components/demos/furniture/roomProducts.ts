import { furnitureCatalog } from './storeCatalog';
import type { PlannerProduct } from './plannerTypes';
export const roomProducts: PlannerProduct[] = furnitureCatalog.flatMap((p) =>
  p.modelUrl && p.dimensionsM
    ? [
        {
          id: p.id,
          name: p.name.startsWith(p.brand) ? p.name : p.brand + ' ' + p.name,
          category: p.category,
          modelUrl: p.plannerModelUrl || p.modelUrl,
          widthM: p.dimensionsM[0],
          depthM: p.dimensionsM[1],
          heightM: p.dimensionsM[2],
          placement: p.placement,
          imageUrl: p.images[0],
        },
      ]
    : []
);

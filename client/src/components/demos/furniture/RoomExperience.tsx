import { lazy, Suspense, useState } from 'react';
import { roomProducts } from './roomProducts';
import { fitCollection, storyByKey, storyLayout, type RoomKey, type RoomProject } from './roomLibrary';
import {
  footprint,
  DEFAULT_ROOM,
  PLANNER_STORAGE_KEY,
  validateLayout,
  type PlannerItem,
  type PlannerLayout,
} from './plannerTypes';
const FixedInterior = lazy(() => import('./FixedInterior'));
const FurniturePlanner = lazy(() => import('./FurniturePlanner'));
const transferDraft = 'web4tg-room-draft:transferred';
let latestTransfer: ReturnType<typeof fitCollection> | null = null;
type Props = {
  onTransfer: () => void;
  productId: string;
  ru: boolean;
  onClose: () => void;
  scene: RoomKey;
  project?: RoomProject;
  onItem: (id: string) => void;
  onKit: (ids: string[]) => void;
};
export default function RoomExperience({
  productId,
  ru,
  scene,
  project,
  onClose,
  onItem,
  onKit,
  onTransfer,
}: Props) {
  const transfer = scene === 'transferred' ? latestTransfer : null;
  const story = storyByKey(project?.scene || scene);
  const draftKey = project
    ? scene === 'shared'
      ? 'web4tg-room-link:' + new URL(location.href).searchParams.get('room')
      : 'web4tg-room-project-draft:' + project.id
    : scene === 'transferred'
      ? transferDraft
      : story
        ? 'web4tg-room-draft:' + story.key
        : PLANNER_STORAGE_KEY;
  const [initial] = useState(() => {
    if (project || story || scene === 'transferred') {
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw) {
          const existing = validateLayout(JSON.parse(raw), roomProducts, true);
          if (existing) return existing;
        }
      } catch {}
    }
    return project?.layout || transfer?.layout || (story ? storyLayout(story, roomProducts) : undefined);
  });
  function moveKit(items: PlannerItem[]) {
    let room = DEFAULT_ROOM;
    try {
      const saved = validateLayout(
        JSON.parse(localStorage.getItem(PLANNER_STORAGE_KEY) || 'null'),
        roomProducts,
        true
      );
      if (saved) room = saved.room;
    } catch {}
    const ext = items.flatMap((i) => {
      const p = roomProducts.find((p) => p.id === i.productId);
      if (!p) return [];
      const v = footprint(p, i.rotation);
      return [{ l: i.x - v.x, r: i.x + v.x, b: i.z - v.z, f: i.z + v.z }];
    });
    const center = ext.length
      ? {
          x: (Math.min(...ext.map((i) => i.l)) + Math.max(...ext.map((i) => i.r))) / 2,
          z: (Math.min(...ext.map((i) => i.b)) + Math.max(...ext.map((i) => i.f))) / 2,
        }
      : { x: 0, z: 0 };
    latestTransfer = fitCollection(items, room, roomProducts, center);
    try {
      localStorage.setItem(transferDraft, JSON.stringify(latestTransfer.layout));
      sessionStorage.removeItem(transferDraft + ':view');
    } catch {}
    onTransfer();
  }
  const personal = scene !== 'fixed' || !!project || !!transfer;
  return (
    <Suspense fallback={<p role="status">{ru ? 'Открываем комнату…' : 'Opening room…'}</p>}>
      {personal ? (
        <FurniturePlanner
          products={roomProducts}
          initialProductId={productId}
          initialPlan={initial}
          storageKey={draftKey}
          initialMessage={
            transfer?.skipped.length
              ? (ru ? 'Не поместились: ' : 'Could not fit: ') + transfer.skipped.join(', ')
              : ''
          }
          sceneKey={story?.key || 'custom'}
          onClose={onClose}
          onItem={onItem}
          onKit={onKit}
        />
      ) : (
        <FixedInterior
          products={roomProducts}
          initialProductId={productId}
          ru={ru}
          onClose={onClose}
          onCustomRoom={moveKit}
          onItem={onItem}
        />
      )}
    </Suspense>
  );
}

import { lazy, Suspense } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import FurnitureStore from './FurnitureStore';
import RoomExperience from './RoomExperience';

const RealFurnitureViewer = lazy(() => import('./RealFurnitureViewer'));
export default function FurnitureShop({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();
  return (
    <FurnitureStore
      onClose={onClose}
      render3D={(product, closeViewer, placeInRoom) =>
        product.modelUrl ? (
          <Suspense fallback={<div style={{ minHeight: 300 }} />}>
            <RealFurnitureViewer
              modelUrl={product.modelUrl}
              posterUrl={product.images[0]}
              dimensions={product.dimensionsM}
              placement={product.placement}
              detailUrl={product.images[2]}
              name={product.name}
              ru={language === 'ru'}
              onClose={closeViewer}
              onPlaceInRoom={placeInRoom}
            />
          </Suspense>
        ) : null
      }
      renderPlanner={(product, closePlanner, scene, project, onItem, onKit, onTransfer, startIn3D) => (
        <RoomExperience
          key={scene + ':' + (project?.id || '')}
          productId={product.id}
          ru={language === 'ru'}
          scene={scene}
          startIn3D={startIn3D}
          project={project}
          onClose={closePlanner}
          onItem={onItem}
          onKit={onKit}
          onTransfer={onTransfer}
        />
      )}
    />
  );
}

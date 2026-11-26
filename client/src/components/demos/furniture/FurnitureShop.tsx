import { lazy, Suspense, useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import FurnitureStore from './FurnitureStore';
import { furnitureCatalog } from './storeCatalog';

const RealFurnitureViewer = lazy(() => import('./RealFurnitureViewer'));
const FurniturePlanner = lazy(() => import('./FurniturePlanner'));
const FixedInterior = lazy(() => import('./FixedInterior'));
const plannerProducts = furnitureCatalog.flatMap((product) => product.modelUrl && product.dimensionsM ? [{
  id: product.id, name: product.name.startsWith(product.brand) ? product.name : `${product.brand} ${product.name}`, modelUrl: product.plannerModelUrl || product.modelUrl,
  widthM: product.dimensionsM[0], depthM: product.dimensionsM[1], heightM: product.dimensionsM[2], category: product.category,
  imageUrl: product.images[0],
}] : []);

function RoomExperience({ productId, onClose, ru }: { productId: string; onClose: () => void; ru: boolean }) {
  const [customRoom, setCustomRoom] = useState(false);
  return <Suspense fallback={<div style={{ minHeight: 300 }} role="status">{ru ? 'Загружаем комнату…' : 'Loading room…'}</div>}>
    {customRoom
      ? <FurniturePlanner products={plannerProducts} initialProductId={productId} onClose={onClose} />
      : <FixedInterior products={plannerProducts} initialProductId={productId} ru={ru} onClose={onClose} onCustomRoom={() => setCustomRoom(true)} />}
  </Suspense>;
}

export default function FurnitureShop({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();
  return <FurnitureStore onClose={onClose} render3D={(product, closeViewer, placeInRoom) => product.modelUrl ? (
    <Suspense fallback={<div style={{ minHeight: 300 }} />}>
      <RealFurnitureViewer modelUrl={product.modelUrl} posterUrl={product.images[0]} name={product.name} ru={language === 'ru'} onClose={closeViewer} onPlaceInRoom={placeInRoom} />
    </Suspense>
  ) : null} renderPlanner={(product, closePlanner) => <RoomExperience productId={product.id} ru={language === 'ru'} onClose={closePlanner} />} />;
}

import { lazy, Suspense } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import FurnitureStore from './FurnitureStore';
import { furnitureCatalog } from './storeCatalog';

const RealFurnitureViewer = lazy(() => import('./RealFurnitureViewer'));
const FurniturePlanner = lazy(() => import('./FurniturePlanner'));
const plannerProducts = furnitureCatalog.flatMap((product) => product.modelUrl && product.dimensionsM ? [{
  id: product.id, name: product.name.startsWith(product.brand) ? product.name : `${product.brand} ${product.name}`, modelUrl: product.modelUrl,
  widthM: product.dimensionsM[0], depthM: product.dimensionsM[1], heightM: product.dimensionsM[2], category: product.category,
  imageUrl: product.images[0],
}] : []);

export default function FurnitureShop({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();
  return <FurnitureStore onClose={onClose} render3D={(product, closeViewer, placeInRoom) => product.modelUrl ? (
    <Suspense fallback={<div style={{ minHeight: 300 }} />}>
      <RealFurnitureViewer modelUrl={product.modelUrl} posterUrl={product.images[0]} name={product.name} ru={language === 'ru'} onClose={closeViewer} onPlaceInRoom={placeInRoom} />
    </Suspense>
  ) : null} renderPlanner={(product, closePlanner) => (
    <Suspense fallback={<div style={{ minHeight: 300 }} role="status">{language === 'ru' ? 'Загружаем комнату…' : 'Loading room…'}</div>}>
      <FurniturePlanner products={plannerProducts} initialProductId={product.id} onClose={closePlanner} />
    </Suspense>
  )} />;
}

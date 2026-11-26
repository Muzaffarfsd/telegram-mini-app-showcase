import { useState, type ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, MoveUpRight } from 'lucide-react';
import type { FurnitureProduct } from './storeCatalog';
import './FurnitureHome.css';

type Props = {
  products: readonly FurnitureProduct[];
  ru: boolean;
  plannerAvailable: boolean;
  onOpenProduct: (product: FurnitureProduct) => void;
  onOpenPlanner: (product: FurnitureProduct) => void;
  onOpenCatalog: (category?: string) => void;
  renderCard: (product: FurnitureProduct) => ReactNode;
};

const englishCategories: Record<string, string> = { 'Диваны': 'Sofas', 'Кресла': 'Armchairs', 'Столы': 'Tables' };

function HomeImage({ src, alt, className = '', priority = false }: { src?: string; alt: string; className?: string; priority?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return src && src !== failedSrc
    ? <img className={className} src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" onError={() => setFailedSrc(src)} />
    : <div className={`fhome-image-fallback ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={!alt || undefined} />;
}

/** Furniture-specific editorial home; all actions go through the store's navigation. */
export default function FurnitureHome({ products, ru, plannerAvailable, onOpenProduct, onOpenPlanner, onOpenCatalog, renderCard }: Props) {
  const t = (r: string, e: string) => ru ? r : e;
  const hero = products[0];
  const heroPhoto = hero?.id === 'rivet-revolve-sofa' ? hero.images[1] || hero.images[0] : hero?.images[0];
  const heroDetail = hero?.id === 'rivet-revolve-sofa' ? hero.images[2] : undefined;
  const categories = Array.from(new Set(products.map(product => product.category)));
  const formatCategory = (category: string) => ru ? category : englishCategories[category] || category;
  const dimensions = hero?.dimensionsM?.map(value => Math.round(value * 100)).join(' × ');

  return <section className="fhome" aria-label={t('Главная мебельного магазина', 'Furniture store home')}>
    <div className="fhome-masthead">
      <span>{t('МЕБЕЛЬ / ПРОСТРАНСТВО', 'FURNITURE / SPACE')}</span>
      <span>{t('МОДЕЛЕЙ', 'PIECES')} {String(products.length).padStart(2, '0')}</span>
    </div>
    {hero ? <>
      <div className="fhome-hero">
        <HomeImage priority src={heroPhoto} alt={`${hero.name} — ${t('фотография товара', 'product photograph')}`} className="fhome-hero-image" />
        <div className="fhome-hero-shade" aria-hidden="true" />
        <div className="fhome-hero-copy">
          <p>{t('ПРЕДМЕТЫ ДЛЯ ДОМА', 'OBJECTS FOR HOME')}</p>
          <h1>{t('Место для жизни.', 'Room to live.')}</h1>
          <span>{t('Мебель, которую хочется рассмотреть.', 'Furniture worth a closer look.')}</span>
        </div>
      </div>
      <div className="fhome-hero-product">
        <div><p>{t('ВЫБОР ДЛЯ ВАС', 'FEATURED PIECE')}</p><strong>{hero.name}</strong><span>{hero.brand}{dimensions ? ` · ≈ ${dimensions} ${t('см', 'cm')}` : ''}</span></div>
        <button type="button" onClick={() => onOpenProduct(hero)} aria-label={`${t('Открыть товар', 'Open product')} ${hero.name}`}><ArrowUpRightIcon /></button>
      </div>
      <div className="fhome-main-actions">
        <button type="button" className="fhome-primary" onClick={() => onOpenCatalog()}>{t('В каталог', 'Explore pieces')} <ArrowRight size={19} /></button>
        {plannerAvailable && <button type="button" className="fhome-secondary" onClick={() => onOpenPlanner(hero)}>{t('В комнату', 'In your room')} <MoveUpRight size={18} /></button>}
      </div>
    </> : <div className="fhome-empty"><h1>{t('Место для жизни.', 'Room to live.')}</h1><p>{t('Коллекция готовится.', 'The collection is coming soon.')}</p></div>}

    {categories.length > 0 && <section className="fhome-section fhome-categories" aria-labelledby="fhome-categories-title">
      <div className="fhome-section-label"><span>01 / {t('КАТЕГОРИИ', 'CATEGORIES')}</span><button type="button" onClick={() => onOpenCatalog()}>{t('Все модели', 'All pieces')} <ArrowRight size={17} /></button></div>
      <h2 id="fhome-categories-title">{t('Выберите своё.', 'Find your piece.')}</h2>
      <div className="fhome-category-grid">{categories.map((category, index) => {
        const product = products.find(item => item.category === category);
        return <button className="fhome-category" type="button" key={category} onClick={() => onOpenCatalog(category)}>
          <div className="fhome-category-image"><HomeImage src={product?.images[0]} alt="" /><span>{String(index + 1).padStart(2, '0')}</span></div>
          <span className="fhome-category-name">{formatCategory(category)} <ArrowRight size={15} /></span>
        </button>;
      })}</div>
    </section>}

    {hero && heroDetail && <section className="fhome-material" aria-labelledby="fhome-material-title">
      <div className="fhome-material-image"><HomeImage src={heroDetail} alt={`${t('Деталь', 'Detail of')} ${hero.name}`} /><span>02 / {t('ДЕТАЛИ', 'DETAILS')}</span></div>
      <div className="fhome-material-copy">
        <p>{t('ФАКТУРА / ФОРМА', 'TEXTURE / FORM')}</p>
        <h2 id="fhome-material-title">{t('Детали.', 'The details.')}</h2>
        <p>{t('Фактура, форма и размер — всё, что важно увидеть до выбора.', 'Texture, shape and dimensions: the details that help you choose.')}</p>
        <button type="button" onClick={() => onOpenProduct(hero)}>{t('Рассмотреть предмет', 'Explore the piece')} <ArrowRight size={17} /></button>
      </div>
    </section>}

    {hero && plannerAvailable && <section className="fhome-space" aria-labelledby="fhome-space-title">
      <div className="fhome-space-copy"><p>03 / {t('ВАШЕ ПРОСТРАНСТВО', 'YOUR SPACE')}</p><h2 id="fhome-space-title">{t('Ваше место.', 'Your space.')}</h2><p>{t('Откройте план комнаты и попробуйте разные варианты расстановки.', 'Open the room planner and explore different arrangements.')}</p><button type="button" onClick={() => onOpenPlanner(hero)}>{t('Открыть планировщик', 'Open room planner')} <ArrowRight size={18} /></button></div>
      <div className="fhome-space-graphic" aria-hidden="true"><span className="fhome-space-outline"/><HomeImage src={hero.images[0]} alt="" /><span className="fhome-space-graphic-label">{t('СХЕМА', 'ILLUSTRATION')}</span><ArrowDownRight className="fhome-space-arrow" size={22}/></div>
    </section>}

    {products.length > 0 && <section className="fhome-section fhome-collection" aria-labelledby="fhome-collection-title">
      <div className="fhome-section-label"><span>04 / {t('КОЛЛЕКЦИЯ', 'THE COLLECTION')}</span><button type="button" onClick={() => onOpenCatalog()}>{t('В каталог', 'View all')} <ArrowRight size={17} /></button></div>
      <h2 id="fhome-collection-title">{t('Предметы для жизни.', 'Pieces for living.')}</h2>
      <div className="fhome-product-grid">{products.slice(0, 4).map(product => <div key={product.id}>{renderCard(product)}</div>)}</div>
      <button type="button" className="fhome-collection-link" onClick={() => onOpenCatalog()}>{t('Смотреть все модели', 'Explore all pieces')} <ArrowRight size={18} /></button>
    </section>}
    <footer className="fhome-footer"><p>{t('Мебель. Пространство. Выбор.', 'Furniture. Space. Choice.')}</p><span>{t('Демонстрационный каталог. Наличие и стоимость уточняйте.', 'Demo catalogue. Check availability and pricing.')}</span></footer>
  </section>;
}

function ArrowUpRightIcon() { return <MoveUpRight size={21} aria-hidden="true" />; }

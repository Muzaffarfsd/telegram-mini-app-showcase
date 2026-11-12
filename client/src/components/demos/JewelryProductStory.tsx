import type { JewelryProduct } from './jewelryProducts';
import { jewelryStoryImage } from './jewelryStoryAssets';
import { getJewelryStoryCopy } from './jewelryStoryContent';
import './JewelryProductStory.css';

function StoryImage({ product, view, caption }: { product: JewelryProduct; view: 'story' | 'story-detail'; caption: string }) {
  const src = jewelryStoryImage(product.id, view);
  return <figure className={`jwl-story__figure${src ? '' : ' is-pending'}`}>
    {src ? <div className="jwl-story__image"><img src={src} alt={`${product.displayName}: ${caption.toLocaleLowerCase('ru-RU')}`} loading="lazy" decoding="async"/></div>
      : <div className="jwl-story__pending"><span>ФОТО ДЕТАЛЕЙ</span><strong>Готовится</strong></div>}
    <figcaption><span>{view === 'story' ? '01' : '02'} / ДЕТАЛИ</span><span>{caption}</span></figcaption>
  </figure>;
}

export function JewelryProductStory({ product }: { product: JewelryProduct }) {
  const copy = getJewelryStoryCopy(product);
  return <div className="jwl-story" data-testid="jewelry-product-story">
    <section className="jwl-story__chapter" aria-labelledby="jwl-story-form-title">
      <div className="jwl-story__eyebrow"><span>ОБ УКРАШЕНИИ / 01</span><span>TIFFANY &amp; CO.</span></div>
      <h2 id="jwl-story-form-title">{copy.heading}</h2>
      <p className="jwl-story__lead">{product.story}</p>
      <StoryImage product={product} view="story" caption="Форма украшения" />
      <div className="jwl-story__note"><span>ФОРМА</span><div><h3>{copy.designTitle}</h3><p>{copy.designText}</p></div></div>
    </section>
    <section className="jwl-story__chapter jwl-story__chapter--detail" aria-labelledby="jwl-story-detail-title">
      <div className="jwl-story__eyebrow"><span>БЛИЖЕ К ДЕТАЛЯМ / 02</span><span>{product.category.toLocaleUpperCase('ru-RU')}</span></div>
      <h2 id="jwl-story-detail-title">{copy.detailTitle}</h2>
      <p className="jwl-story__lead">{copy.detailText}</p>
      <StoryImage product={product} view="story-detail" caption="Материалы и детали" />
      <div className="jwl-story__facts"><div><span>МАТЕРИАЛ</span><strong>{product.material}</strong></div><div><span>ДЕТАЛИ</span><strong>{product.measurements}</strong></div></div>
      <p className="jwl-story__image-note">Иллюстрации созданы для демонстрации и могут отличаться от оригинала.</p>
    </section>
  </div>;
}

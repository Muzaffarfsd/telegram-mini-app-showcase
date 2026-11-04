import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import './ChinaBuyerCatalogV5.css';

export type ChinaBuyerCatalogItem = {
  id: string;
  category: string;
  name: string;
  image: string;
  caption: string;
};

type Props = {
  items: ChinaBuyerCatalogItem[];
  categories: string[];
  category: string;
  query: string;
  favorites: string[];
  onCategoryChange: (category: string) => void;
  onQueryChange: (query: string) => void;
  onOpen: (id: string) => void;
  onFavorite: (id: string) => void;
  onRequest: () => void;
};

function ideaCount(count: number) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  const suffix = mod100 >= 11 && mod100 <= 14 ? 'идей' : mod10 === 1 ? 'идея' : mod10 >= 2 && mod10 <= 4 ? 'идеи' : 'идей';
  return `${count} ${suffix}`;
}

function CatalogItem({ item, favorite, onOpen, onFavorite }: { item: ChinaBuyerCatalogItem; favorite: boolean; onOpen: () => void; onFavorite: () => void }) {
  return <article className="cb-card cb5-catalog-card" data-testid={`buyer-item-${item.id}`}>
    <div className="cb-card__image cb5-catalog-card__photo">
      <button type="button" className="cb-card__open" onClick={onOpen} aria-label={`Открыть ${item.name}`}><img src={item.image} alt="" loading="lazy" decoding="async" /></button>
      <button type="button" className="cb-heart" onClick={onFavorite} aria-label={`${favorite ? 'Убрать из избранного' : 'В избранное'}: ${item.name}`} aria-pressed={favorite}><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></button>
    </div>
    <div className="cb5-catalog-card__meta"><span>{item.category}</span><span>ИДЕЯ ДЛЯ ПОИСКА</span></div>
    <button type="button" className="cb5-catalog-card__title" onClick={onOpen}>{item.name}<ArrowRight size={16} aria-hidden="true" /></button>
    <p className="cb5-catalog-card__caption">{item.caption}</p>
  </article>;
}

/** Curated, illustrative products. No unverified price, stock or supplier data is implied. */
export function ChinaBuyerCatalogV5({ items, categories, category, query, favorites, onCategoryChange, onQueryChange, onOpen, onFavorite, onRequest }: Props) {
  const [sort, setSort] = useState<'curated' | 'name'>('curated');
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ru-RU');
    const matching = items.filter(item => (category === 'Все' || item.category === category) && (!normalized || `${item.name} ${item.category} ${item.caption}`.toLocaleLowerCase('ru-RU').includes(normalized)));
    return sort === 'name' ? [...matching].sort((a,b) => a.name.localeCompare(b.name, 'ru')) : matching;
  }, [items, category, query, sort]);
  const featured = items.slice(0, 2);
  const showFeature = category === 'Все' && !query.trim() && featured.length > 0;

  return <section className="cb-section cb-catalog cb-catalog-v5">
    <div className="cb5-catalog-topline"><span>КОЛЛЕКЦИЯ / КИТАЙ</span><span className="cb5-catalog-seal cb-ink-font" lang="zh-Hans" aria-hidden="true">寻</span></div>
    <div className="cb5-catalog-heading"><h1>Найти<br/><span>своё.</span></h1><p>Вещи и детали, с которых начинается ваш личный поиск.</p></div>

    <label className="cb5-catalog-search"><Search size={20} aria-hidden="true"/><span className="cb-sr">Поиск идей</span><input type="search" placeholder="Что вы ищете?" value={query} onChange={event=>onQueryChange(event.target.value)} />{query && <button type="button" aria-label="Очистить поиск" onClick={()=>onQueryChange('')}><X size={18}/></button>}</label>

    {showFeature && <div className="cb5-catalog-feature" aria-label="Подборка идей">
      <div className="cb5-catalog-feature__copy"><span>ВЫБОР БАЙЕРА / 01</span><strong>Вещи<br/>с характером.</strong><p>Образы и предметы для вашего поиска.</p><button type="button" onClick={()=>onOpen(featured[0].id)}>Смотреть идею <ArrowRight size={16}/></button></div>
      <div className="cb5-catalog-feature__photos" aria-hidden="true"><img src={featured[0].image} alt="" />{featured[1] && <img src={featured[1].image} alt="" />}</div>
      <span className="cb5-catalog-feature__character cb-ink-font" lang="zh-Hans" aria-hidden="true">选</span>
    </div>}

    <div className="cb5-catalog-filter-heading"><div><span>КОЛЛЕКЦИЯ</span><h2>{category === 'Все' ? 'Все находки' : category}</h2></div><span>{ideaCount(visible.length)}</span></div>
    <div className="cb-categories cb5-catalog-categories" role="group" aria-label="Категории">{categories.map(value=><button key={value} type="button" className={category===value?'is-active':''} aria-pressed={category===value} onClick={()=>onCategoryChange(value)}>{value}</button>)}</div>
    <div className="cb5-catalog-controls"><span>{ideaCount(visible.length)}</span><label><SlidersHorizontal size={15} aria-hidden="true"/><span className="cb-sr">Сортировка</span><select value={sort} onChange={event=>setSort(event.target.value as 'curated'|'name')}><option value="curated">Подборка байера</option><option value="name">По названию</option></select><ChevronDown size={14} aria-hidden="true"/></label></div>
    {visible.length ? <div className="cb-card-grid cb5-catalog-grid">{visible.map(item=><CatalogItem key={item.id} item={item} favorite={favorites.includes(item.id)} onOpen={()=>onOpen(item.id)} onFavorite={()=>onFavorite(item.id)}/>)}</div> : <div className="cb-empty cb5-catalog-empty"><Search size={26}/><h2>Пока ничего не найдено</h2><p>Попробуйте другой запрос или расскажите, что вы ищете.</p><button type="button" className="cb5-catalog-empty__request" onClick={onRequest}>Описать свою идею <ArrowRight size={16}/></button><button type="button" className="cb-link" onClick={()=>{onQueryChange('');onCategoryChange('Все');}}>Сбросить фильтры</button></div>}
    <p className="cb-disclaimer cb5-catalog-disclaimer">Изображения и товары — идеи для демонстрации. Наличие и стоимость не подтверждены.</p>
  </section>;
}

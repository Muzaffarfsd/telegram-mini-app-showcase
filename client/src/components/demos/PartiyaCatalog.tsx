import React, {useEffect, useMemo, useState} from 'react';
import {Grid2X2, Heart, List, Minus, Plus, Search, SlidersHorizontal, X} from 'lucide-react';
import {warmImage} from '@/lib/warmImage';
import {imagePreviews} from './OptMarketImagePreviews';
import {afterImageDecode} from './ImagePreviewDecode';
import './PartiyaCatalog.css';

export type PartiyaProduct = {id:string; assetName?:string; name:string; category:string; detail:string; pack:string; units:number; price:number; label:string; description:string};
type CartLine = {id:string; qty:number};
type Props = {
  products:PartiyaProduct[]; cart:CartLine[]; category:string; query:string; categories:string[];
  setCategory:(value:string)=>void; setQuery:(value:string)=>void;
  searchText:(product:PartiyaProduct)=>string; open:(id:string)=>void; change:(id:string,qty:number)=>void;
  isFavorite:(id:string)=>boolean; toggleFavorite:(id:string)=>void;
};

const brands:Record<string,string>={
  'real-coffee':'Lavazza','real-tea':'Ahmad Tea','real-olive-oil':'Borges','real-pasta':'Barilla',
  'real-tomato':'Mutti','real-syrup':'Monin','real-milk':'Alpro','real-cocoa':'Dr. Oetker',
  'real-granola':'AXA','real-honey':'Медовый Дом','real-sauce':'Barilla','real-cookies':'Lotus',
  'real-nutella':'Nutella','real-jam':'Bonne Maman','real-oreo':'OREO','real-water':'S.Pellegrino',
  'real-spaghetti':'Barilla','real-nescafe':'NESCAFÉ',
};
const brandOf=(p:PartiyaProduct)=>brands[p.id]||'';
const formatOf=(p:PartiyaProduct)=>{
  const s=p.pack.toLocaleLowerCase('ru-RU');
  if(s.includes('бутыл'))return 'Бутылки';
  if(s.includes('бан'))return 'Банки';
  if(s.includes('пакет'))return 'Пакеты';
  if(s.includes('пач'))return 'Пачки';
  if(s.includes('короб'))return 'Коробки';
  if(s.includes('упаков'))return 'Упаковки';
  return '';
};
const normalize=(value:string)=>value.toLocaleLowerCase('ru-RU').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ё/g,'е').trim();
const money=(n:number)=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n)+' ₽';
const countLabel=(n:number)=>`${n} ${n%100>=11&&n%100<=14?'товаров':n%10===1?'товар':n%10>=2&&n%10<=4?'товара':'товаров'}`;
// Preserve browsing choices when opening a product and returning to the catalog.
let catalogView:{layout:'grid'|'list';brand:string;format:string;sorting:string;favoritesOnly:boolean;filtersOpen:boolean}={layout:'grid',brand:'',format:'',sorting:'featured',favoritesOnly:false,filtersOpen:false};

function CatalogCard({p,qty,open,change,favorite,toggle,eager=false}:{p:PartiyaProduct;qty:number;open:()=>void;change:(n:number)=>void;favorite:boolean;toggle:()=>void;eager?:boolean}){
  const [failed,setFailed]=useState(false);
  const [fallback,setFallback]=useState(false);
  const [loadedSrc,setLoadedSrc]=useState('');
  const src=`/b2b/generated/${p.assetName||p.id}${fallback?'':'-scene-v2'}.webp`;
  const preview=imagePreviews[src];
  return <article className="opt-product-card parti-catalog-card">
    <div className="parti-catalog-picture-wrap">
      <button type="button" className="opt-product-picture" data-opt-focus={`product-picture-${p.id}`} aria-label={`Открыть товар: ${p.name}`} onClick={open} onPointerEnter={()=>warmImage(`/b2b/generated/${p.assetName||p.id}.webp`, 'high')} onTouchStart={()=>warmImage(`/b2b/generated/${p.assetName||p.id}.webp`, 'high')}>
        {failed?(preview?<img src={preview} alt={`Предпросмотр ${p.name}: исходное фото недоступно`} className={fallback?'':'opt-scene-image'}/>:<span className="opt-no-image">Изображение<br/>недоступно</span>):<img src={src} alt="" loading={eager?'eager':'lazy'} decoding="async" className={fallback?'':'opt-scene-image'} style={preview&&loadedSrc!==src?{backgroundImage:`url(${preview})`,backgroundSize:fallback?'contain':'cover',backgroundPosition:'center',backgroundRepeat:'no-repeat'}:undefined} onLoad={event=>afterImageDecode(event.currentTarget,()=>setLoadedSrc(src))} onError={()=>{if(!fallback)setFallback(true);else setFailed(true);}}/>}
      </button>
      <button type="button" className="parti-catalog-heart" aria-label={`${favorite?'Убрать из избранного':'В избранное'}: ${p.name}`} aria-pressed={favorite} onClick={toggle}><Heart size={18} fill={favorite?'currentColor':'none'}/></button>
    </div>
    <div className="parti-catalog-card-body">
      <button type="button" className="opt-product-name" data-opt-focus={`product-name-${p.id}`} onClick={open}>{p.name}</button>
      <p className="parti-catalog-detail">{p.detail}</p>
      <div className="opt-price"><strong>{money(p.price)}</strong><span>за коробку</span></div>
      <p className="parti-catalog-unit">{p.pack} · {money(p.price/p.units)} / шт.</p>
      {qty?<div className="opt-quantity"><button type="button" onClick={()=>change(qty-1)} aria-label={`Уменьшить количество: ${p.name}`}><Minus size={15}/></button><span aria-live="polite">{qty}</span><button type="button" disabled={qty>=99} onClick={()=>change(qty+1)} aria-label={`Увеличить количество: ${p.name}`}><Plus size={15}/></button></div>:<button type="button" className="opt-add" onClick={()=>change(1)} aria-label={`Добавить коробку: ${p.name}`}><Plus size={16}/> В заказ</button>}
    </div>
  </article>;
}

export function PartiyaCatalog({products,cart,category,query,categories,setCategory,setQuery,searchText,open,change,isFavorite,toggleFavorite}:Props){
  const [layout,setLayout]=useState<'grid'|'list'>(catalogView.layout);
  const [brand,setBrand]=useState(catalogView.brand);
  const [format,setFormat]=useState(catalogView.format);
  const [sorting,setSorting]=useState(catalogView.sorting);
  const [favoritesOnly,setFavoritesOnly]=useState(catalogView.favoritesOnly);
  const [filtersOpen,setFiltersOpen]=useState(catalogView.filtersOpen);
  useEffect(()=>{catalogView={layout,brand,format,sorting,favoritesOnly,filtersOpen};},[layout,brand,format,sorting,favoritesOnly,filtersOpen]);
  const brandOptions=useMemo(()=>Array.from(new Set(products.map(brandOf).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'ru')),[products]);
  const formatOptions=useMemo(()=>Array.from(new Set(products.map(formatOf).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'ru')),[products]);
  const shown=useMemo(()=>{
    const terms=normalize(query).split(/\s+/).filter(Boolean);
    const filtered=products.filter(p=>(category==='Все'||p.category===category)&&(!brand||brandOf(p)===brand)&&(!format||formatOf(p)===format)&&(!favoritesOnly||isFavorite(p.id))&&terms.every(term=>normalize(searchText(p)).includes(term)));
    if(sorting==='price-low')filtered.sort((a,b)=>a.price-b.price);
    if(sorting==='price-high')filtered.sort((a,b)=>b.price-a.price);
    if(sorting==='unit-low')filtered.sort((a,b)=>a.price/a.units-b.price/b.units);
    if(sorting==='name')filtered.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
    return filtered;
  },[products,query,category,brand,format,sorting,favoritesOnly,isFavorite,searchText]);
  const reset=()=>{setCategory('Все');setQuery('');setBrand('');setFormat('');setFavoritesOnly(false);setSorting('featured');};
  return <section className="opt-page parti-catalog">
    <div className="opt-topline"><span className="opt-eyebrow">ПАРТИЯ / КАТАЛОГ</span><span className="opt-demo-pill">ДЕМО</span></div>
    <h1 className="opt-title">Всё для<br/>вашего дела.</h1>
    <p className="opt-subtitle">Продукты для кафе и магазинов.</p>
    <label className="opt-search"><Search size={19}/><span className="opt-sr">Поиск товара</span><input type="search" placeholder="Поиск товара" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" aria-label="Очистить поиск" onClick={()=>setQuery('')}><X size={18}/></button>}</label>
    <div className="opt-chips" role="group" aria-label="Категория товаров">{categories.map(c=><button key={c} type="button" aria-pressed={category===c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    <div className="parti-catalog-tools">
      <div className="parti-catalog-toolbar">
        <button type="button" className="parti-catalog-filter-button" aria-expanded={filtersOpen} aria-controls="parti-catalog-filters" onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17}/> Фильтры{(brand||format||sorting!=='featured')&&<span>{Number(Boolean(brand))+Number(Boolean(format))+Number(sorting!=='featured')}</span>}</button>
        <button type="button" className="parti-catalog-favorites" aria-pressed={favoritesOnly} aria-label="Только избранное" onClick={()=>setFavoritesOnly(!favoritesOnly)}><Heart size={18} fill={favoritesOnly?'currentColor':'none'}/></button>
        <div className="parti-catalog-layout" role="group" aria-label="Вид каталога"><button type="button" aria-label="Витрина" aria-pressed={layout==='grid'} onClick={()=>setLayout('grid')}><Grid2X2 size={17}/></button><button type="button" aria-label="Список" aria-pressed={layout==='list'} onClick={()=>setLayout('list')}><List size={19}/></button></div>
      </div>
      {filtersOpen&&<div id="parti-catalog-filters" className="parti-catalog-filter-panel">
        <div className="parti-catalog-filters">
          <label><span>БРЕНД</span><select value={brand} onChange={e=>setBrand(e.target.value)}><option value="">Все бренды</option>{brandOptions.map(b=><option key={b} value={b}>{b}</option>)}</select></label>
          <label><span>ФОРМАТ</span><select value={format} onChange={e=>setFormat(e.target.value)}><option value="">Все форматы</option>{formatOptions.map(f=><option key={f} value={f}>{f}</option>)}</select></label>
        </div>
        <label className="parti-catalog-sort"><span>Сортировка</span><select value={sorting} onChange={e=>setSorting(e.target.value)}><option value="featured">По подборке</option><option value="price-low">Коробка: дешевле</option><option value="price-high">Коробка: дороже</option><option value="unit-low">За единицу: дешевле</option><option value="name">По названию</option></select></label>
      </div>}
    </div>
    <p className="opt-results" aria-live="polite">{countLabel(shown.length)} · демо-цены за коробку</p>
    {shown.length?<div className={`opt-grid parti-catalog-grid ${layout==='list'?'is-list':''}`}>{shown.map((p,i)=><CatalogCard key={p.id} p={p} eager={i<4} qty={cart.find(l=>l.id===p.id)?.qty||0} open={()=>open(p.id)} change={n=>change(p.id,n)} favorite={isFavorite(p.id)} toggle={()=>toggleFavorite(p.id)}/>)}</div>:<div className="opt-empty"><Search size={24}/><h2>Ничего не нашли</h2><p>Попробуйте изменить запрос или фильтры.</p><button type="button" onClick={reset}>Показать все товары</button></div>}
    <p className="opt-note">Изображения созданы с помощью ИИ. Цены, наличие и количество в коробке — пример.</p>
  </section>;
}

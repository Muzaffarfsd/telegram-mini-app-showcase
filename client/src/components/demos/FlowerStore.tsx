import { FlowerGalleryImage } from './FlowerGalleryImage';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowRight, ArrowUpRight, Flower2, Heart, House, ShoppingBag} from 'lucide-react';
import {FlowerProductDetail, type FlowerSelection} from './FlowerProductDetail';
import {FlowerCatalogV2, defaultFlowerFilters, flowerMoney, flowerSizePrice, type FlowerCatalogFilters, type FlowerCatalogItem} from './FlowerCatalogV2';
import {FlowerCartV2, type FlowerCartLine} from './FlowerCartV2';
import FlowerHomeV4 from './FlowerHomeV4';
import {flowerItems as archivedItems} from './flowerDataV2';
import {flowerItemsV3} from './flowerDataV3';
import {flowerHomeRefItems} from './FlowerHomeRefData';
import {popularFlowers} from './flowerPopularV5';
import {flowerGifts} from './flowerGiftsV6';
const items=[...popularFlowers,...flowerGifts];
const allItems=[...items,...flowerHomeRefItems,...flowerItemsV3,...archivedItems];
import './FlowerStore.css';

type Screen='home'|'catalog'|'detail'|'favorites'|'cart';
type FlowerView={screen:Screen;id:string;previous:Screen;editingKey?:string;entryKey?:string;fromDetail?:boolean};
const newViewKey=()=>`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const find=(id:string)=>allItems.find(x=>x.id===id);
// Curated example pairings: festive extras for lively arrangements, quieter
// details for flowers intended for the home. These are not purchase statistics.
const giftPairings:Record<string,string[]>={
 'popular-sunflower-basket':['balloons','chocolates','card'],
 'popular-vase-roses':['candle','card','chocolates'],
 'popular-pink-rose-basket':['bear','card','balloons'],
 'popular-red-roses':['chocolate-bouquet','card','chocolates'],
 'popular-pink-mix':['bear','balloons','card'],
 'popular-white-roses':['candle','card','chocolates'],
 'popular-red-white-roses':['chocolates','card','balloons'],
 'popular-pink-peonies':['bear','chocolates','card'],
 'popular-agent-peonies':['candle','chocolate-bouquet','card'],
 'popular-pink-tulips':['card','chocolates','bear'],
 'popular-tulips':['balloons','card','chocolate-bouquet'],
 'popular-blue-hydrangeas':['candle','card','bear'],
 'popular-chrysanthemums':['card','chocolates','balloons'],
 'popular-eustoma':['candle','card','chocolates'],
 'popular-gerberas':['balloons','bear','chocolate-bouquet'],
 'popular-sunflowers':['chocolate-bouquet','balloons','card'],
 'popular-white-lilies':['candle','chocolates','card'],
};
const flowerPairings:Record<string,string[]>={
 'gift-balloons':['popular-sunflower-basket','popular-gerberas','popular-tulips'],
 'gift-bear':['popular-pink-mix','popular-pink-rose-basket','popular-pink-peonies'],
 'gift-chocolate-bouquet':['popular-red-roses','popular-sunflowers','popular-agent-peonies'],
 'gift-chocolates':['popular-red-white-roses','popular-pink-tulips','popular-white-lilies'],
 'gift-card':['popular-pink-mix','popular-red-roses','popular-vase-roses'],
 'gift-candle':['popular-vase-roses','popular-blue-hydrangeas','popular-eustoma'],
};
function recommendationsFor(item:FlowerCatalogItem):FlowerCatalogItem[]{
 const curated=item.productKind==='gift'
  ?(flowerPairings[item.id]||[]).map(find)
  :(giftPairings[item.id]||['card','chocolates','balloons']).map(id=>find(`gift-${id}`));
 const fallback=item.productKind==='gift'?[...popularFlowers,...flowerGifts]:[...flowerGifts,...popularFlowers];
 const unique=new Map<string,FlowerCatalogItem>();
 for(const entry of [...curated,...fallback])if(entry&&entry.id!==item.id&&!unique.has(entry.id))unique.set(entry.id,entry);
 return [...unique.values()].slice(0,9);
}
const read=<T,>(key:string,fallback:T):T=>{try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch{return fallback}};
const productFromUrl=()=>{const query=window.location.hash.split('?')[1]||'';const id=new URLSearchParams(query).get('product');return id&&find(id)?id:null};
const baseHash='#/demos/flower-store/app';
const viewUrl=(view:FlowerView)=>`${window.location.pathname}${window.location.search}${baseHash}${view.screen==='detail'?`?product=${encodeURIComponent(view.id)}`:''}`;
const rootScroll=()=>document.getElementById('root');
function toScroll(value=0){requestAnimationFrame(()=>requestAnimationFrame(()=>{rootScroll()?.scrollTo({top:value,behavior:'instant'});window.scrollTo({top:0,behavior:'instant'})}))}
function ProductCard({item,favorite,onFavorite,onOpen}:{item:FlowerCatalogItem;favorite:boolean;onFavorite:()=>void;onOpen:()=>void}){return <article className="fs-card"><div className="fs-card-photo"><button type="button" className="fs-card-photo-open" onClick={onOpen} aria-label={`Открыть ${item.productKind==='gift'?'подарок':'букет'} ${item.name}`}><FlowerGalleryImage src={item.images[0]} alt="" loading="lazy" decoding="async"/></button><button type="button" className="fs-card-heart" onClick={onFavorite} aria-label={`${favorite?'Убрать из избранного':'В избранное'}: ${item.name}`} aria-pressed={favorite}><Heart size={19} fill={favorite?'currentColor':'none'}/></button></div><div className="fs-card-caption"><span>{item.category.toUpperCase()}{item.productKind==='gift'?'':' / РАЗМЕР M'}</span><button type="button" onClick={onOpen}>{item.name}<ArrowUpRight size={17}/></button><p>{item.subtitle}</p><strong>{flowerMoney(item.price)}</strong><small>примерная цена</small></div></article>}
export default function FlowerStore({onClose}:{onClose:()=>void}){
 const initialId=productFromUrl();
 const [screen,setScreen]=useState<Screen>(initialId?'detail':'home');const [previous,setPrevious]=useState<Screen>('catalog');const [selectedId,setSelectedId]=useState(initialId||items[0].id);const [editingKey,setEditingKey]=useState<string|undefined>();
 const [filters,setFilters]=useState<FlowerCatalogFilters>({...defaultFlowerFilters});const [filtersExpanded,setFiltersExpanded]=useState(false);
 const [drafts,setDrafts]=useState<Record<string,FlowerSelection>>({});
 const [favorites,setFavorites]=useState<string[]>(()=>{const v=read<unknown>('flower-store-favorites-v1',[]);return Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'&&!!find(x)):[]});
 const [cart,setCart]=useState<FlowerCartLine[]>(()=>{const v=read<unknown>('flower-store-cart-v1',[]);if(!Array.isArray(v))return [];return v.filter((x):x is FlowerCartLine=>!!x && typeof x==='object' && typeof x.key==='string' && typeof x.id==='string' && !!find(x.id) && !!x.selection && ['S','M','L'].includes(x.selection.size) && typeof x.selection.date==='string' && (x.selection.date===''||/^\d{4}-\d{2}-\d{2}$/.test(x.selection.date)) && typeof x.selection.note==='string' && x.selection.note.length<=300 && Number.isFinite(x.selection.price) && x.selection.price>0 && x.selection.price<1000000 && Number.isInteger(x.quantity) && x.quantity>=1 && x.quantity<=99).slice(0,100).map(x=>({...x,selection:{...x.selection,price:find(x.id)?.price||x.selection.price}}))});
 const [migrationNotice,setMigrationNotice]=useState(()=>{const saved=read<unknown>('flower-store-cart-v1',[]);return Array.isArray(saved)&&saved.some(x=>x&&typeof x.id==='string'&&find(x.id)&&x.selection&&typeof x.selection.price==='number'&&x.selection.price!==find(x.id)?.price)?'Демонстрационные цены обновлены. Точную стоимость нужно уточнять у флориста.':''});const [notice,setNotice]=useState('');const savedScroll=useRef<Partial<Record<Screen,number>>>({});const pendingScroll=useRef<number|null>(null);const currentView=useRef<FlowerView|null>(null);const historyScroll=useRef<Record<string,number>>({});
 useLayoutEffect(()=>{if(pendingScroll.current!==null){const top=pendingScroll.current;pendingScroll.current=null;toScroll(top)}},[screen,selectedId]);
 useEffect(()=>{try{localStorage.setItem('flower-store-favorites-v1',JSON.stringify(favorites));localStorage.setItem('flower-store-cart-v1',JSON.stringify(cart))}catch{setNotice('Не удалось сохранить данные на устройстве. Они доступны до закрытия страницы.')}},[favorites,cart]);
 useEffect(()=>{
  const root=rootScroll();root?.classList.add('flower-scroll-root');
  const id=productFromUrl()||items[0].id;
  const initial:FlowerView={screen:productFromUrl()?'detail':'home',id,previous:'catalog',entryKey:newViewKey()};
  currentView.current=initial;history.replaceState({...history.state,flowerView:initial},'',viewUrl(initial));
  const saveCurrent=()=>{const view=currentView.current;if(view?.entryKey)historyScroll.current[view.entryKey]=rootScroll()?.scrollTop||0};
  const applyView=(view:FlowerView,scroll:number)=>{
   const prior=currentView.current;currentView.current=view;pendingScroll.current=scroll;
   setScreen(view.screen);if(find(view.id))setSelectedId(view.id);setPrevious(view.previous||'catalog');setEditingKey(view.editingKey);
   if(prior?.screen===view.screen&&prior.id===view.id&&prior.editingKey===view.editingKey){pendingScroll.current=null;toScroll(scroll)}
  };
  const back=(event:PopStateEvent)=>{const view=event.state?.flowerView as FlowerView|undefined;if(view&&['home','catalog','detail','favorites','cart'].includes(view.screen)){
   saveCurrent();const top=view.entryKey&&historyScroll.current[view.entryKey]!==undefined?historyScroll.current[view.entryKey]:view.screen==='catalog'?savedScroll.current.catalog||0:0;applyView(view,top)
  }};
  const hashChanged=()=>{if(!window.location.hash.startsWith(baseHash))return;const id=productFromUrl();const state=history.state?.flowerView as FlowerView|undefined;
   if(id&&(!state||state.screen!=='detail'||state.id!==id)){
    saveCurrent();const view:FlowerView={screen:'detail',id,previous:'catalog',entryKey:newViewKey()};history.replaceState({...history.state,flowerView:view},'',viewUrl(view));applyView(view,0)
   }else if(!id&&!state){
    saveCurrent();const view:FlowerView={screen:'home',id:items[0].id,previous:'catalog',entryKey:newViewKey()};history.replaceState({...history.state,flowerView:view},'',viewUrl(view));applyView(view,0)
   }
  };
  window.addEventListener('popstate',back);window.addEventListener('hashchange',hashChanged);
  return()=>{root?.classList.remove('flower-scroll-root');window.removeEventListener('popstate',back);window.removeEventListener('hashchange',hashChanged)}
 },[]);
 function go(next:Screen,options?:{id?:string;previous?:Screen;editingKey?:string;restore?:boolean;fromDetail?:boolean}){
  const current=currentView.current;if(current?.entryKey)historyScroll.current[current.entryKey]=rootScroll()?.scrollTop||0;
  if(screen!=='detail')savedScroll.current[screen]=rootScroll()?.scrollTop||0;
  const v:FlowerView={screen:next,id:options?.id||selectedId,previous:options?.previous||previous,editingKey:options?.editingKey,entryKey:newViewKey(),fromDetail:options?.fromDetail};
  currentView.current=v;history.pushState({...history.state,flowerView:v},'',viewUrl(v));pendingScroll.current=options?.restore?savedScroll.current[next]||0:0;
  setScreen(next);setSelectedId(v.id);setPrevious(v.previous);setEditingKey(v.editingKey);if(next!=='cart')setNotice('');if(next===screen){toScroll(pendingScroll.current||0);pendingScroll.current=null}
 }
 function open(id:string){const item=find(id);if(!item)return;const prior=screen==='detail'?previous:screen;if(screen==='catalog'&&['S','M','L'].includes(filters.size)){const size=filters.size as FlowerSelection['size'];setDrafts(v=>({...v,[id]:{...(v[id]||{date:'',note:''}),size,price:flowerSizePrice(item.price,size)}}))}go('detail',{id,previous:prior,fromDetail:screen==='detail'})}
 function backFromDetail(){if(currentView.current?.fromDetail)history.back();else go(previous,{restore:true})}
 function edit(line:FlowerCartLine){setDrafts(v=>({...v,[`edit:${line.key}`]:line.selection}));go('detail',{id:line.id,previous:'cart',editingKey:line.key})}
 function catalog(category='Все'){setFilters({...defaultFlowerFilters,category});setFiltersExpanded(false);go('catalog')}
 function toggle(id:string){setFavorites(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
 const selected=find(selectedId)||items[0];const draftKey=editingKey?`edit:${editingKey}`:selected.id;const card=(p:FlowerCatalogItem)=><ProductCard key={p.id} item={p} favorite={favorites.includes(p.id)} onOpen={()=>open(p.id)} onFavorite={()=>toggle(p.id)}/>;
 function add(selection:FlowerSelection){if(editingKey){setCart(v=>v.map(line=>line.key===editingKey?{...line,selection}:line));setNotice('Параметры товара обновлены')}else{setCart(v=>[...v,{key:`${Date.now()}-${Math.random().toString(36).slice(2)}`,id:selected.id,selection,quantity:1}]);setNotice(selected.productKind==='gift'?'Подарок добавлен в корзину':'Букет добавлен в корзину')}go('cart')}
 const count=cart.reduce((sum,x)=>sum+x.quantity,0);
 return <div className="flower-store" lang="ru" data-testid="flower-store"><main className="fs-main">
 {screen==='home'&&<FlowerHomeV4 items={items} open={open} catalog={catalog}/>}
 {screen==='catalog'&&<FlowerCatalogV2 items={items} favorites={favorites} filters={filters} onFiltersChange={setFilters} onOpen={open} onFavorite={toggle} expanded={filtersExpanded} onExpandedChange={setFiltersExpanded}/>}
 {screen==='detail'&&<FlowerProductDetail key={`${selected.id}:${editingKey||'new'}`} item={selected} favorite={favorites.includes(selected.id)} onFavorite={()=>toggle(selected.id)} onBack={backFromDetail} initialSelection={drafts[draftKey]} onDraftChange={selection=>setDrafts(v=>({...v,[draftKey]:selection}))} editing={!!editingKey} onAdd={add} recommendations={recommendationsFor(selected)} onOpenRecommendation={open}/>}
 {screen==='favorites'&&<section className="fs-page"><div className="fs-page-heading"><span>FLORA / СОХРАНЕНО</span><h1>ВАШИ<br/>ИЗБРАННЫЕ.</h1><p>Цветы и подарки, к которым хочется вернуться.</p></div>{favorites.length?<div className="fs-grid">{allItems.filter(x=>favorites.includes(x.id)).map(card)}</div>:<div className="fs-empty"><Heart size={26}/><h2>Здесь будет ваше избранное.</h2><p>Нажмите на сердечко у товара, чтобы сохранить его.</p><button type="button" onClick={()=>catalog()}>Выбрать цветы <ArrowRight size={16}/></button></div>}</section>}
 {screen==='cart'&&<>{(notice||migrationNotice)&&<p className="fs-notice fs-cart-notice" role="status">{notice||migrationNotice}</p>}<FlowerCartV2 items={allItems} lines={cart} onQuantity={(key,quantity)=>setCart(v=>v.map(line=>line.key===key?{...line,quantity}:line))} onRemove={key=>setCart(v=>v.filter(line=>line.key!==key))} onEdit={edit} onOpen={open} onCatalog={()=>catalog()} onClose={onClose} onContinue={()=>{setNotice('');setMigrationNotice('')}}/></>}
 </main>{createPortal(<nav className="fs-nav fs-nav-v2" aria-label="Навигация цветочного магазина">{([{id:'home',label:'Главная',icon:House},{id:'catalog',label:'Каталог',icon:Flower2},{id:'favorites',label:'Избранное',icon:Heart},{id:'cart',label:'Корзина',icon:ShoppingBag}] as const).map(({id,label,icon:Icon})=>{const active=screen===id||(id==='catalog'&&screen==='detail');return <button type="button" key={id} className={active?'is-active':''} aria-label={id==='cart'&&count?`${label}, ${count}`:label} aria-current={active?'page':undefined} onClick={()=>go(id)}><span className="fs-nav-icon"><Icon size={20}/>{id==='cart'&&count>0&&<i>{count}</i>}</span><span>{label}</span></button>})}</nav>,document.body)}</div>
}

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Bookmark, Grid2X2, Heart, Home, Search, Send, Sparkles, UserRound, X } from 'lucide-react';
import { scrollToTop } from '@/hooks/useScrollToTop';
import { BuyerRequestForm, BuyerRequestHistory, useBuyerRequests, type BuyerRequest, type BuyerRequestFields } from './BuyerWorkflow';
import { BuyerProductDetail, type BuyerDetailPreferences } from './BuyerProductDetail';
import './ChinaBuyer.css';
import './ChinaBuyerV2.css';
import './ChinaBuyerV4.css';

type Screen = 'home' | 'catalog' | 'detail' | 'request' | 'profile' | 'process';
type Item = { id:string; category:string; name:string; image:string; caption:string; story:string; gallery?:string[] };
const categories = ['Все', 'Одежда', 'Обувь', 'Сумки', 'Аксессуары', 'Для дома'];
const items: Item[] = [
  { id:'v4-coat', category:'Одежда', name:'Светлое пальто с поясом', image:'/china-buyer/v4-coat.webp', caption:'Мягкий силуэт и светлый тон', story:'Идея для поиска пальто: уточните желаемую длину, размер и материал в заявке.' },
  { id:'v4-bag', category:'Сумки', name:'Сумка в оттенке вина', image:'/china-buyer/v4-bag.webp', caption:'Плавная форма и глубокий цвет', story:'Идея для поиска сумки: расскажите о предпочтительном размере, оттенке и деталях.' },
  { id:'tailoring', category:'Одежда', name:'Структурный жакет', image:'/china-buyer/product-blazer.webp', gallery:['/china-buyer/v2-blazer-angle.webp','/china-buyer/v2-blazer-detail.webp','/china-buyer/v2-blazer-model.webp'], caption:'Форма, которая собирает образ', story:'Лаконичный силуэт с вниманием к крою. Опишите желаемый размер и материал — это поможет начать поиск похожей вещи.' },
  { id:'bag', category:'Сумки', name:'Сумка на каждый день', image:'/china-buyer/product-bag.webp', gallery:['/china-buyer/v2-bag-angle.webp','/china-buyer/v2-bag-held.webp','/china-buyer/v2-bag-detail.webp'], caption:'Сдержанная форма и фактура', story:'Удобный формат для повседневного гардероба. Укажите предпочтительные оттенок, размер и бюджет в заявке.' },
  { id:'sneaker', category:'Обувь', name:'Городские кроссовки', image:'/china-buyer/product-sneaker.webp', gallery:['/china-buyer/v2-sneaker-angle.webp','/china-buyer/v2-sneaker-detail.webp','/china-buyer/v2-sneaker-top.webp'], caption:'Лёгкий силуэт для движения', story:'Идея повседневной пары. При поиске можно уточнить размер, цвет и другие важные для вас детали.' },
  { id:'wardrobe', category:'Одежда', name:'Образ на каждый день', image:'/china-buyer/fashion.webp', caption:'Современный гардероб', story:'Образ для вдохновения: расскажите, какие элементы вы хотели бы найти и в каком размере.' },
  { id:'burgundy', category:'Сумки', name:'Сумка в винном оттенке', image:'/china-buyer/bags.webp', caption:'Выразительный цвет и мягкая форма', story:'Идея для поиска сумки с мягким силуэтом. Поделитесь желаемым цветом и размером.' },
  { id:'loafers', category:'Обувь', name:'Лаконичные лоферы', image:'/china-buyer/shoes.webp', caption:'Классика для города', story:'Пример формы для повседневного гардероба. При поиске укажите размер и желаемый материал.' },
  { id:'accessory', category:'Аксессуары', name:'Акцентные очки', image:'/china-buyer/product-accessory.webp', caption:'Деталь, которая завершает образ', story:'Подбор аксессуара начинается с ваших пожеланий к форме, цвету и бюджету.' },
  { id:'home', category:'Для дома', name:'Керамика для дома', image:'/china-buyer/product-home.webp', caption:'Форма и фактура пространства', story:'Для поиска предметов дома можно приложить ссылку и описать материалы, размеры и желаемый стиль.' },
  { id:'v2-coat', category:'Одежда', name:'Пальто с выразительным силуэтом', image:'/china-buyer/v2-coat.webp', caption:'Городская классика в движении', story:'Образ для вдохновения: уточните желаемый силуэт, длину и размер в заявке.' },
  { id:'v2-knit', category:'Одежда', name:'Трикотажный кардиган', image:'/china-buyer/v2-knit.webp', caption:'Мягкие линии для каждого дня', story:'Расскажите, какой оттенок, посадку и размер вы хотите найти.' },
  { id:'v2-bag-sculpted', category:'Сумки', name:'Сумка строгой формы', image:'/china-buyer/v2-bag-sculpted.webp', caption:'Чёткая геометрия и спокойный акцент', story:'Опишите желаемые пропорции, цвет и формат ручки для поиска похожей модели.' },
  { id:'v2-bag-burgundy', category:'Сумки', name:'Сумка-полумесяц', image:'/china-buyer/v2-bag-burgundy.webp', gallery:['/china-buyer/v2-bag-burgundy-angle.webp','/china-buyer/v2-bag-burgundy-model.webp','/china-buyer/v2-bag-burgundy-detail.webp'], caption:'Плавный силуэт в винном оттенке', story:'Укажите желаемый цвет, размер и важные детали — это поможет сформировать запрос.' },
  { id:'v2-boots', category:'Обувь', name:'Лаконичные ботильоны', image:'/china-buyer/v2-boots.webp', caption:'Силуэт для городского гардероба', story:'Уточните размер, высоту и предпочтительную форму обуви в заявке.' },
  { id:'v2-slingbacks', category:'Обувь', name:'Туфли с открытой пяткой', image:'/china-buyer/v2-slingbacks.webp', caption:'Линии, которые завершают образ', story:'Опишите нужный размер, оттенок и форму каблука для поиска похожей пары.' },
  { id:'v2-scarf', category:'Аксессуары', name:'Платок с графичным рисунком', image:'/china-buyer/v2-scarf.webp', caption:'Выразительная деталь образа', story:'Поделитесь пожеланиями к рисунку, цветам и размеру аксессуара.' },
  { id:'v2-earrings', category:'Аксессуары', name:'Скульптурные серьги', image:'/china-buyer/v2-earrings.webp', caption:'Небольшой акцент с характером', story:'Опишите форму, оттенок и желаемый размер украшения.' },
  { id:'v2-teaware', category:'Для дома', name:'Чайная композиция', image:'/china-buyer/v2-teaware.webp', caption:'Ритуал в каждой детали', story:'Расскажите о предпочитаемой форме, количестве предметов и оттенках.' },
  { id:'v2-lamp', category:'Для дома', name:'Настольная лампа', image:'/china-buyer/v2-lamp.webp', caption:'Тёплый свет и выразительная форма', story:'Укажите предполагаемый размер, стиль и важные технические параметры.' },
];
const byId = (id:string) => items.find(item => item.id === id);
const favoritesKey = 'china-buyer-favorites-v1';
function readFavorites():string[] { try { const raw:unknown = JSON.parse(localStorage.getItem(favoritesKey) || '[]'); return Array.isArray(raw) ? raw.filter((id):id is string => typeof id === 'string' && !!byId(id)).slice(0,items.length) : []; } catch { return []; } }

function ItemCard({ item, favorite, onOpen, onFavorite }: { item:Item; favorite:boolean; onOpen:()=>void; onFavorite:()=>void }) {
  return <article className="cb-card" data-testid={`buyer-item-${item.id}`}><div className="cb-card__image"><button type="button" className="cb-card__open" onClick={onOpen} aria-label={`Открыть ${item.name}`}><img src={item.image} alt="" loading="lazy" decoding="async"/></button><button className="cb-heart" type="button" onClick={onFavorite} aria-label={`${favorite ? 'Убрать из избранного' : 'В избранное'}: ${item.name}`} aria-pressed={favorite}><Heart size={18} fill={favorite ? 'currentColor' : 'none'}/></button></div><div className="cb-card__body"><span>{item.category} / ИДЕЯ</span><button type="button" onClick={onOpen}>{item.name}<ArrowRight size={16}/></button><p>{item.caption}</p></div></article>;
}

export default function ChinaBuyer({ onClose }: { onClose:()=>void }) {
  const [screen,setScreen]=useState<Screen>('home');
  const [previous,setPrevious]=useState<Screen>('catalog');
  const [selectedId,setSelectedId]=useState(items[0].id);
  const [category,setCategory]=useState('Все');
  const [query,setQuery]=useState('');
  const [favorites,setFavorites]=useState<string[]>(readFavorites);
  const [storageWarning,setStorageWarning]=useState(false);
  const [requestCategory,setRequestCategory]=useState('Другое');
  const [requestDescription,setRequestDescription]=useState('');
  const [requestKey,setRequestKey]=useState(0);
  const [editing,setEditing]=useState<BuyerRequest | null>(null);
  const [requestReturn,setRequestReturn]=useState<Screen>('home');
  const [draftSlot,setDraftSlot]=useState('new');
  const [drafts,setDrafts]=useState<Record<string,BuyerRequestFields | null>>({});
  const workflow=useBuyerRequests();
  const selected=byId(selectedId) || items[0];
  const visible=useMemo(() => {const q=query.trim().toLocaleLowerCase('ru-RU');return items.filter(item => (category==='Все' || item.category===category) && (!q || `${item.name} ${item.category} ${item.caption}`.toLocaleLowerCase('ru-RU').includes(q)));},[category,query]);
  useEffect(() => {try {localStorage.setItem(favoritesKey,JSON.stringify(favorites));setStorageWarning(false);} catch {setStorageWarning(true);}},[favorites]);
  useEffect(() => {
    const nodes=[document.documentElement,document.body,document.getElementById('root')].filter((n):n is HTMLElement=>!!n); const colors=nodes.map(n=>n.style.backgroundColor); nodes.forEach(n=>n.style.backgroundColor='#fff');
    const root=document.getElementById('root'); root?.classList.add('china-buyer-scroll-root');
    const tg=(window as any).Telegram?.WebApp; const old={background:tg?.backgroundColor,header:tg?.headerColor,bottom:tg?.bottomBarColor};
    try {tg?.setBackgroundColor?.('#ffffff');tg?.setHeaderColor?.('#ffffff');tg?.setBottomBarColor?.('#ffffff');}catch{}
    return ()=>{root?.classList.remove('china-buyer-scroll-root');nodes.forEach((n,i)=>n.style.backgroundColor=colors[i]);try {if(old.background)tg?.setBackgroundColor?.(old.background);if(old.header)tg?.setHeaderColor?.(old.header);if(old.bottom)tg?.setBottomBarColor?.(old.bottom);}catch{}};
  },[]);
  function go(next:Screen){setScreen(next);scrollToTop();}
  function openItem(id:string){setPrevious(screen==='detail'?previous:screen);setSelectedId(id);go('detail');}
  function chooseCategory(value:string){setCategory(value);setQuery('');go('catalog');}
  function beginRequest(item?:Item, prefs?:BuyerDetailPreferences){
    const slot=item ? `item:${item.id}` : 'new';
    const description=item ? `Хочу найти похожее: ${item.name}.` : '';
    if (item && prefs && (prefs.size || prefs.color || prefs.notes)) setDrafts(current=>{
      const existing=current[slot];
      const base:BuyerRequestFields=existing || {category:item.category as BuyerRequestFields['category'],description,url:'',size:'',color:'',quantity:'1',budget:''};
      const nextDescription=prefs.notes && !base.description.includes(prefs.notes) ? `${base.description} ${prefs.notes}`.trim().slice(0,800) : base.description;
      return {...current,[slot]:{...base,description:nextDescription,size:prefs.size || base.size,color:prefs.color || base.color}};
    });
    setEditing(null);setDraftSlot(slot);setRequestReturn(screen==='request'?'home':screen);setRequestCategory(item?.category || 'Другое');setRequestDescription(description);setRequestKey(v=>v+1);go('request');
  }
  function editRequest(request:BuyerRequest){setEditing(request);setDraftSlot(`edit:${request.id}`);setRequestReturn('profile');setRequestKey(v=>v+1);go('request');}
  function openRequestTab(){if(screen==='request')return;if(drafts[draftSlot]){setRequestReturn(screen);setRequestKey(v=>v+1);go('request');}else beginRequest();}
  function toggleFavorite(id:string){setFavorites(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);}
  const nav = screen==='home'?'home':screen==='request'?'request':screen==='profile'?'profile':screen==='process'?'home':'catalog';
  return <div className="china-buyer" lang="ru" data-testid="china-buyer"><main className="cb-main">
    {['detail','process'].includes(screen) && <button type="button" className="cb-back" onClick={()=>go(screen==='detail'?previous:'home')}><ArrowLeft size={17}/> Назад</button>}
    {screen==='home' && <div className="cb4-home">
      <section className="cb4-hero" aria-labelledby="cb4-title">
        <div className="cb4-overline"><span>ЛИЧНЫЙ БАЙИНГ / КИТАЙ</span><span lang="zh-Hans" className="cb-ink-font" aria-hidden="true">寻</span></div>
        <h1 id="cb4-title">Найти вещь.<br/><span>Полюбить надолго.</span></h1>
        <p className="cb4-hero__intro">Вдохновляйтесь подборкой или расскажите, что ищете. Поможем сформировать запрос на поиск в Китае.</p>
        <button type="button" className="cb4-primary" onClick={()=>chooseCategory('Все')}>Смотреть подборку <ArrowRight size={17}/></button>
        <div className="cb4-hero__image"><img src="/china-buyer/v4-hero.webp" alt="Редакционная композиция с вещами и архитектурными деталями" fetchPriority="high"/><div className="cb4-hero__caption"><span>ОТ ИДЕИ К НАХОДКЕ</span><span>中国 / 01</span></div></div>
      </section>
      <section className="cb4-collection" aria-labelledby="cb4-collection-title">
        <div className="cb4-section-line"><span>КОЛЛЕКЦИЯ / 01</span><span>ВЫБРАНО С ВНИМАНИЕМ</span></div>
        <div className="cb4-section-head"><div><h2 id="cb4-collection-title">Вещи, которые<br/>стоит заметить.</h2><p>Формы, фактуры и детали для вашего следующего открытия.</p></div><span lang="zh-Hans" className="cb4-mark cb-ink-font" aria-hidden="true">选</span></div>
        <div className="cb-card-grid cb4-grid">{['v4-coat','v4-bag','v2-boots','v2-teaware'].map(id=>{const item=byId(id);return item ? <ItemCard key={item.id} item={item} favorite={favorites.includes(item.id)} onOpen={()=>openItem(item.id)} onFavorite={()=>toggleFavorite(item.id)}/> : null;})}</div>
        <button type="button" className="cb4-full-link" onClick={()=>chooseCategory('Все')}><span>Вся коллекция</span><span>{items.length} идей <ArrowRight size={17}/></span></button>
        <p className="cb-footnote">Примеры для вдохновения. Наличие и стоимость уточняются отдельно.</p>
      </section>
      <section className="cb4-story" aria-labelledby="cb4-story-title">
        <div className="cb4-story__photo"><img src="/china-buyer/v4-story.webp" alt="Нефритовая шпилька на красной ткани" loading="lazy"/></div>
        <div className="cb4-story__copy"><div className="cb4-section-line"><span>ЛИЧНЫЙ ПОИСК / 02</span><span>由想法开始</span></div><h2 id="cb4-story-title">Есть идея?<br/><span>Начнём с неё.</span></h2><p>Ссылка или описание — расскажите, какую вещь хотите найти и какие детали для вас важны.</p><button type="button" className="cb4-text-link" onClick={()=>beginRequest()}>Создать запрос <ArrowRight size={17}/></button></div>
      </section>
      <section className="cb4-steps" aria-labelledby="cb4-steps-title"><div className="cb4-section-line"><span>КАК ЭТО РАБОТАЕТ / 03</span><span>ТРИ ПРОСТЫХ ШАГА</span></div><h2 id="cb4-steps-title">От желания<br/>к деталям.</h2><div className="cb4-step"><span>01</span><div><h3>Поделитесь идеей</h3><p>Выберите вещь или добавьте ссылку на то, что ищете.</p></div></div><div className="cb4-step"><span>02</span><div><h3>Уточните важное</h3><p>Размер, цвет, бюджет и другие пожелания помогут составить запрос.</p></div></div><div className="cb4-step"><span>03</span><div><h3>Проверьте заявку</h3><p>Посмотрите все детали и сохраните заявку в своём профиле.</p></div></div><button type="button" className="cb4-outline" onClick={()=>go('process')}>Подробнее о процессе <ArrowRight size={17}/></button></section>
      <p className="cb-disclaimer cb4-disclaimer">Демонстрация: изображения сгенерированы, заявки сохраняются только на устройстве и не отправляются байеру. Оплата и доставка не подключены.</p>
    </div>}

    {screen==='catalog' && <section className="cb-section cb-catalog"><div className="cb4-catalog-heading"><div><p className="cb-kicker">ПОДБОРКА / КИТАЙ</p><h1>Найдите<br/><em>своё.</em></h1><p className="cb-lead">Выберите идею и уточните детали для поиска.</p></div><span lang="zh-Hans" className="cb4-mark cb-ink-font" aria-hidden="true">寻</span></div><label className="cb-search"><Search size={18}/><span className="cb-sr">Поиск идей</span><input type="search" placeholder="Что ищете?" value={query} onChange={e=>setQuery(e.target.value)}/>{query && <button type="button" aria-label="Очистить поиск" onClick={()=>setQuery('')}><X size={18}/></button>}</label><div className="cb-categories" role="group" aria-label="Категории">{categories.map(value=><button key={value} type="button" className={category===value?'is-active':''} aria-pressed={category===value} onClick={()=>setCategory(value)}>{value}</button>)}</div><div className="cb-catalog__count"><span>{visible.length} {visible.length === 1 ? 'идея' : visible.length >= 2 && visible.length <= 4 ? 'идеи' : 'идей'}</span><span>ЦЕНА ПО ЗАПРОСУ</span></div>{visible.length ? <div className="cb-card-grid">{visible.map(item=><ItemCard key={item.id} item={item} favorite={favorites.includes(item.id)} onOpen={()=>openItem(item.id)} onFavorite={()=>toggleFavorite(item.id)}/>)}</div> : <div className="cb-empty"><Search size={26}/><h2>Пока ничего не найдено</h2><p>Попробуйте другой запрос или расскажите нам, что ищете.</p><button className="cb-button cb-button--dark" type="button" onClick={()=>beginRequest()}>Описать свою идею <ArrowRight size={16}/></button><button className="cb-link" type="button" onClick={()=>{setQuery('');setCategory('Все');}}>Сбросить фильтры</button></div>}<p className="cb-disclaimer">Все изображения и карточки демонстрационные. Цена и наличие не подтверждены.</p></section>}
    {screen==='detail' && <BuyerProductDetail key={selected.id} item={selected} favorite={favorites.includes(selected.id)} related={items.filter(p=>p.id!==selected.id && p.category===selected.category).slice(0,4)} onFavorite={()=>toggleFavorite(selected.id)} onOpen={openItem} onCatalog={()=>chooseCategory('Все')} onRequest={prefs=>beginRequest(selected,prefs)}/>}

    {screen==='process' && <section className="cb-section cb-process cb4-process"><p className="cb-kicker">ЛИЧНЫЙ ПОИСК / КИТАЙ</p><h1>От идеи<br/><em>к находке.</em></h1><p className="cb-lead">Хороший поиск начинается с деталей, которые важны именно вам.</p><div className="cb4-process-intro"><span lang="zh-Hans" className="cb-ink-font" aria-hidden="true">寻</span><p>Выберите вещь из подборки или опишите свою идею — и соберите всё в одной заявке.</p></div><div className="cb-process__steps"><article><span>01 / ИДЕЯ</span><h2>Расскажите, что ищете</h2><p>Добавьте ссылку или опишите вещь: категорию, цвет, размер и ориентир по бюджету.</p></article><article><span>02 / ДЕТАЛИ</span><h2>Уточните пожелания</h2><p>Укажите важные параметры и проверьте заявку перед сохранением.</p></article><article><span>03 / ЗАЯВКА</span><h2>Вернитесь в любое время</h2><p>Сохранённые в демо заявки можно посмотреть и изменить в профиле на этом устройстве.</p></article></div><button className="cb4-primary cb4-process-action" type="button" onClick={()=>beginRequest()}>Создать заявку <ArrowRight size={17}/></button><p className="cb-disclaimer">В этой демонстрации заявки не отправляются байеру, оплата и доставка не подключены.</p></section>}
    {screen==='request' && <BuyerRequestForm key={requestKey} workflow={workflow} initial={editing} initialCategory={requestCategory} initialDescription={requestDescription} draft={drafts[draftSlot]} onDraftChange={value=>setDrafts(current=>({...current,[draftSlot]:value}))} onBack={()=>go(requestReturn)} onHistory={()=>go('profile')}/>}
    {screen==='profile' && <section className="cb-section cb-profile"><p className="cb-kicker">ВАШЕ ПРОСТРАНСТВО</p><h1>Всё, что<br/><em>вы искали.</em></h1><p className="cb-lead">Сохранённые идеи и ваши демо-заявки на одном устройстве.</p>{storageWarning && <p role="status" className="cb-warning">Не удалось сохранить избранное на устройстве. Оно доступно до закрытия страницы.</p>}<div className="cb-section-title cb-profile__title"><div><p className="cb-kicker">СОХРАНЕНО ВАМИ</p><h2>Избранное</h2></div><span>{favorites.length}</span></div>{favorites.length ? <div className="cb-card-grid">{items.filter(item=>favorites.includes(item.id)).map(item=><ItemCard key={item.id} item={item} favorite onOpen={()=>openItem(item.id)} onFavorite={()=>toggleFavorite(item.id)}/>)}</div> : <div className="cb-empty cb-empty--profile"><Bookmark size={22}/><p>Сохраняйте интересные идеи, чтобы вернуться к ним позже.</p><button type="button" className="cb-link" onClick={()=>chooseCategory('Все')}>Смотреть коллекцию <ArrowRight size={15}/></button></div>}<BuyerRequestHistory workflow={workflow} onEdit={editRequest} onNew={()=>beginRequest()}/><p className="cb-disclaimer">Личные данные для связи не запрашиваются. Демо-заявки сохраняются только на этом устройстве.</p><button type="button" className="cb-link" onClick={onClose}>Вернуться в WEB4TG <ArrowRight size={15}/></button></section>}
  </main>{createPortal(<nav className="cb-nav" aria-label="Навигация приложения"><button type="button" className={nav==='home'?'is-active':''} aria-label="Главная" aria-current={nav==='home'?'page':undefined} onClick={()=>go('home')}><Home size={21}/><span>Главная</span></button><button type="button" className={nav==='catalog'?'is-active':''} aria-label="Каталог" aria-current={nav==='catalog'?'page':undefined} onClick={()=>go('catalog')}><Grid2X2 size={21}/><span>Каталог</span></button><button type="button" className={nav==='request'?'is-active':''} aria-label="Заявка" aria-current={nav==='request'?'page':undefined} onClick={openRequestTab}><Send size={21}/><span>Заявка</span></button><button type="button" className={nav==='profile'?'is-active':''} aria-label="Профиль" aria-current={nav==='profile'?'page':undefined} onClick={()=>go('profile')}><UserRound size={21}/><span>Профиль</span></button></nav>,document.body)}</div>;
}

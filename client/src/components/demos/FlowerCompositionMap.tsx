import './FlowerCompositionMap.css';

type Item = {id:string;name:string;images:string[];composition:string;category:string};
const directions:Record<string,[string,string]>={
 'popular-sunflower-basket':['Подсолнухи задают яркий центр','Светлые розы и зелень смягчают контраст'],
 'popular-vase-roses':['Розовые розы собирают взгляд','Белая эустома и зелень делают силуэт легче'],
 'popular-pink-rose-basket':['Розы создают мягкий розовый объём','Эустома и зелень добавляют светлые акценты'],
 'popular-red-roses':['Красные бутоны — главный акцент','Светлая упаковка подчёркивает насыщенный цвет'],
 'popular-pink-mix':['Розы и гвоздики создают мягкий объём','Белая эустома и зелень добавляют воздушности'],
 'popular-white-roses':['Белые розы формируют спокойный силуэт','Светлая упаковка продолжает тон композиции'],
 'popular-red-white-roses':['Красные и белые розы создают контраст','Светлая упаковка объединяет цветовую пару'],
 'popular-pink-peonies':['Пионы задают пышную форму','Бутоны и зелень добавляют разные масштабы'],
 'popular-agent-peonies':['Пионы создают мягкий объём','Светлая упаковка обрамляет цветы'],
 'popular-pink-tulips':['Розовые бутоны задают вертикальный ритм','Листья подчёркивают линии стеблей'],
 'popular-tulips':['Цветные бутоны создают ритм','Листья собирают разноцветную палитру'],
 'popular-blue-hydrangeas':['Гортензии создают воздушный объём','Белые розы и зелень добавляют контраст формы'],
 'popular-chrysanthemums':['Мелкие соцветия создают лёгкий рисунок','Зелень обрамляет светлые лепестки'],
 'popular-eustoma':['Раскрытые цветы задают мягкий объём','Бутоны и зелень завершают воздушный силуэт'],
 'popular-gerberas':['Открытые цветки создают яркий рисунок','Зелень обрамляет розовые лепестки'],
 'popular-sunflowers':['Подсолнухи задают солнечный акцент','Белые розы и зелень смягчают контраст'],
 'popular-white-lilies':['Крупные лилии создают выразительный центр','Бутоны и зелень продолжают линии цветов'],
};
export function FlowerCompositionMap({item}:{item:Item}){
 const lines=directions[item.id]; if(!lines || !item.images[0]) return null;
 const vessel=item.category==='Корзины'?'Корзина':item.category==='Вазы'?'Ваза':'Оформление';
 const vesselDetail=item.category==='Корзины'?'Плетёная корзина завершает композицию.':item.category==='Вазы'?'Стеклянная ваза показывает стебли и поддерживает композицию.':'Упаковку и детали оформления уточняют у флориста.';
 return <section className="flower-composition-map" aria-labelledby="flower-map-title">
  <div className="flower-map-kicker"><span>АНАТОМИЯ БУКЕТА</span><span>FLORA / ДЕТАЛИ</span></div>
  <h2 id="flower-map-title">Из чего<br/><em>складывается.</em></h2>
  <p className="flower-map-intro">Рассмотрите, как цветы и оформление собираются в одну композицию.</p>
  <div className="flower-map-portrait"><img src={item.images[0]} alt={`Иллюстрация композиции «${item.name}» целиком`} loading="lazy" decoding="async"/><span>{item.name}</span></div>
  <div className="flower-map-parts"><div><span>01 / ГЛАВНАЯ ФОРМА</span><p>{lines[0]}.</p></div><div><span>02 / СОЧЕТАНИЕ</span><p>{lines[1]}.</p></div><div><span>03 / {vessel.toUpperCase()}</span><p>{vesselDetail}</p></div></div>
  <p className="flower-map-disclaimer">Состав и оформление показаны как пример; окончательный вариант согласовывается с флористом.</p>
 </section>;
}

import { ArrowDownRight, ArrowRight, MoveUpRight } from 'lucide-react';
import './NikeEditorial.css';

type NikeEditorialProps = {
  onCategory: (category: string) => void;
};

/** These are campaign photographs, not representations of a catalog item. */
export function NikeEditorial({ onCategory }: NikeEditorialProps) {
  return <div className="nke-editorial" data-testid="nike-editorial">
    <section className="nke-motion" aria-labelledby="nke-motion-title">
      <div className="nke-intro">
        <div><p className="nke-kicker">ГОРОД / ДВИЖЕНИЕ</p><h2 id="nke-motion-title">В своём<br/><em>ритме.</em></h2></div>
        <ArrowDownRight aria-hidden="true" size={27} strokeWidth={1.3}/>
      </div>
      <div className="nke-motion__image"><img src="/royal-step/editorial-motion-v2.webp" alt="Редакционный образ: девушка в кроссовках на городских ступенях" loading="lazy" decoding="async" width="1000" height="1500"/></div>
      <div className="nke-motion__caption"><p>Каждый маршрут начинается с первого шага. Найдите пару для своего ритма.</p><button type="button" onClick={() => onCategory('Для прогулок')}>Для прогулок <ArrowRight size={16} aria-hidden="true"/></button></div>
    </section>

    <section className="nke-studies" aria-labelledby="nke-studies-title">
      <div className="nke-heading"><div><p className="nke-kicker">ФОРМА / ФАКТУРА</p><h2 id="nke-studies-title">Посмотрите ближе</h2></div><span>01 — 02</span></div>
      <div className="nke-studies__grid">
        <article><img src="/royal-step/editorial-detail-v2.webp" alt="Художественная съёмка фактуры кроссовка крупным планом" loading="lazy" decoding="async" width="1000" height="1333"/><p className="nke-study__number">01 / ДЕТАЛИ</p><h3>Искусство<br/>в деталях</h3><p>Линии, фактуры и характер пары.</p><button type="button" onClick={() => onCategory('Все')} aria-label="Смотреть все модели">Все модели <MoveUpRight size={15} aria-hidden="true"/></button></article>
        <article><img src="/royal-step/editorial-scale-v2.webp" alt="Концептуальная съёмка: увеличенный кроссовок в архитектурном пространстве" loading="lazy" decoding="async" width="1000" height="1500"/><p className="nke-study__number">02 / СИЛУЭТ</p><h3>Большой<br/>характер</h3><p>Узнаваемые формы вне времени.</p><button type="button" onClick={() => onCategory('Классика')} aria-label="Смотреть классические модели">Классика <MoveUpRight size={15} aria-hidden="true"/></button></article>
      </div>
    </section>

    <section className="nke-city" aria-labelledby="nke-city-title">
      <div className="nke-city__image"><img src="/royal-step/editorial-city-v2.webp" alt="Редакционная съёмка: два городских образа с кроссовками" loading="lazy" decoding="async" width="1000" height="1333"/></div>
      <div className="nke-city__body"><p className="nke-kicker">СТИЛЬ НА КАЖДЫЙ ДЕНЬ</p><h2 id="nke-city-title">Город задаёт<br/>движение.</h2><p>Кроссовки, которые легко вписать в свой стиль.</p><button type="button" onClick={() => onCategory('На каждый день')}>Выбрать пару <ArrowRight size={16} aria-hidden="true"/></button></div>
    </section>
    <p className="nke-note">Редакционные фотографии созданы для настроения и не показывают конкретные модели каталога.</p>
  </div>;
}

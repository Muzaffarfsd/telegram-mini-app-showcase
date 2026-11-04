import { ArrowRight, Plus } from 'lucide-react';
import './BuyerEditorialDetails.css';

type BuyerEditorialDetailsProps = {
  onRequest: () => void;
  category?: string;
};

/** A demonstrative editorial, not a promise of supplier services. */
export function BuyerEditorialDetails({ onRequest, category }: BuyerEditorialDetailsProps) {
  return <section className="cbd-editorial" aria-labelledby="cbd-title">
    <div className="cbd-heading"><div><p className="cbd-kicker">ВНИМАНИЕ К ДЕТАЛЯМ / 01</p><h2 id="cbd-title">Как рождается<br/><em>находка.</em></h2></div><span aria-hidden="true">↘</span></div>
    <div className="cbd-photo"><img src="/china-buyer/sourcing.webp" alt="Редакционная иллюстрация: руки рассматривают фактуру ткани" loading="lazy" decoding="async"/><span>ДЕТАЛИ ИМЕЮТ ЗНАЧЕНИЕ</span></div>
    <div className="cbd-caption"><p>Одна и та же идея может звучать по-разному. Опишите детали, которые важны именно вам.</p><span>01 / 04</span></div>
    <div className="cbd-topics" aria-label="Детали, которые можно указать в запросе">
      <div><span>01</span><p><strong>Форма и конструкция</strong><small>Силуэт, пропорции и важные детали.</small></p></div>
      <div><span>02</span><p><strong>Материал и цвет</strong><small>Фактура, оттенок и ваши предпочтения.</small></p></div>
      <div><span>03</span><p><strong>Размер и посадка</strong><small>Размер, мерки или желаемый формат.</small></p></div>
      <div><span>04</span><p><strong>Пожелания к проверке</strong><small>Что вы хотели бы уточнить перед выбором.</small></p></div>
    </div>
    <p className="cbd-note">Фотография и примеры созданы для демонстрации. Возможность проверки и другие условия необходимо согласовать отдельно.</p>
    <button type="button" className="cbd-request" onClick={onRequest}>Обсудить {category ? 'эту идею' : 'свою идею'} <ArrowRight size={17} aria-hidden="true"/></button>
    <div className="cbd-questions"><div className="cbd-heading"><div><p className="cbd-kicker">ПОЛЕЗНО ЗНАТЬ / 02</p><h2>Частые вопросы.</h2></div></div>
      <details><summary>Как узнать стоимость?<Plus size={18} aria-hidden="true"/></summary><p>Укажите ориентир по бюджету в заявке. Стоимость товара, поиск и другие условия нужно уточнять отдельно; в демо расчёта нет.</p></details>
      <details><summary>Можно начать со ссылки?<Plus size={18} aria-hidden="true"/></summary><p>Да, в демо-заявке можно указать ссылку и описать важные детали. Данные сохраняются только на этом устройстве и не отправляются байеру.</p></details>
      <details><summary>Сколько времени займёт поиск?<Plus size={18} aria-hidden="true"/></summary><p>Срок зависит от запроса и обсуждается отдельно. Эта версия приложения не показывает реальные сроки.</p></details>
      <details><summary>Как согласуются условия?<Plus size={18} aria-hidden="true"/></summary><p>Проверку, оплату, получение и другие условия нужно обсудить до принятия решения. В демо оплата и доставка не подключены.</p></details>
    </div>
  </section>;
}

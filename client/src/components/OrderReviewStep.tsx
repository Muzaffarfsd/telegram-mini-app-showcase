import { Check, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { appTemplatesBase, availableFeaturesBase, subscriptionPlansBase } from './orderCatalog';
import { rubWithUsd } from './orderPrice';

type Template = typeof appTemplatesBase[number];
type Feature = typeof availableFeaturesBase[number];
type Plan = typeof subscriptionPlansBase[number];
type Props = {
  ru: boolean; t: (key: string) => string; template: Template; artSrc: string; directionLabel: string; projectName: string;
  includedIds: Set<string>; selectedExtras: Feature[]; extraTotal: number; total: number;
  rubToUsd: number | null; rateLabel: string;
  planId: string | null; annual: boolean; yearlyPrices: Record<string, number>;
  onEdit: () => void; onPlan: (id: string | null) => void; onAnnual: (annual: boolean) => void; onPlanInfo: (id: string) => void;
};
const priceFormatter = new Intl.NumberFormat('ru-RU');
const money = (amount: number) => `${priceFormatter.format(amount)} ₽`;
const comparison: Record<string, string[]> = {
  minimal: ['monthlyBackups', 'emailSupport'],
  standard: ['weeklyBackups', 'prioritySupport', 'response2h'],
  premium: ['dailyBackups', 'personalManager', 'businessConsulting'],
};

export function OrderReviewStep({ ru, t, template, artSrc, directionLabel, projectName, includedIds, selectedExtras, extraTotal, total, planId, annual, yearlyPrices, onEdit, onPlan, onAnnual, onPlanInfo, rubToUsd, rateLabel }: Props) {
  const plan = subscriptionPlansBase.find((item) => item.id === planId);
  const supportPrice = plan ? `${money(annual ? yearlyPrices[plan.id] : plan.price)}${annual ? (ru ? ' / год' : ' / year') : (ru ? ' / мес' : ' / month')}` : (ru ? 'Выбрать позже' : 'Choose later');
  return <section className="order-review" aria-label={ru ? 'Параметры заказа' : 'Order details'}>
    <div className="order-review-hero"><img src={artSrc} alt="" /><div><small>{ru ? 'ВАШЕ ПРИЛОЖЕНИЕ' : 'YOUR APP'}</small><h2>{projectName.trim() || directionLabel}</h2><p>{directionLabel} · {t(template.developmentTimeKey)}</p></div><button type="button" onClick={onEdit} aria-label={ru ? 'Изменить параметры' : 'Edit details'}><ChevronRight size={19} /></button></div>
    <div className="order-review-rate order-rate-note" aria-live="polite">{rateLabel}</div>
    <div className="order-summary-card">
      <div><span>{ru ? 'Основа приложения' : 'App package'}</span><strong>{rubWithUsd(template.estimatedPrice, rubToUsd)}</strong></div>
      <div><span>{ru ? 'Дополнительные функции' : 'Additional features'}</span><strong>{extraTotal ? `+ ${rubWithUsd(extraTotal, rubToUsd)}` : (ru ? 'Нет' : 'None')}</strong></div>
      <div className="order-summary-total"><span>{ru ? 'Разработка' : 'Development'}<small>{ru ? 'разово, ориентировочно' : 'one-time estimate'}</small></span><strong data-testid="order-final-total">{rubWithUsd(total, rubToUsd)}</strong></div>
      <div><span>{ru ? 'Поддержка отдельно' : 'Support, separately'}</span><strong className="order-support-summary-price" data-testid="order-support-total">{supportPrice}</strong></div>
    </div>
    <div className="order-review-section-header"><strong>{ru ? 'Состав заказа' : 'Your order'}</strong><button type="button" onClick={onEdit}>{ru ? 'Изменить' : 'Edit'}</button></div>
    <details className="order-review-list"><summary>{ru ? 'Включено в основу' : 'Included in the package'} <span>{includedIds.size} <ChevronDown size={15} /></span></summary><ul>{availableFeaturesBase.filter((feature) => includedIds.has(feature.id)).map((feature) => <li key={feature.id}><span>{t(feature.nameKey)}</span><span>{ru ? 'Включено' : 'Included'}</span></li>)}</ul></details>
    <details className="order-review-list" open={selectedExtras.length > 0}><summary>{ru ? 'Дополнительные функции' : 'Additional features'} <span>{selectedExtras.length} <ChevronDown size={15} /></span></summary>{selectedExtras.length ? <ul>{selectedExtras.map((feature) => <li key={feature.id}><span>{t(feature.nameKey)}</span><span>+ {rubWithUsd(feature.price, rubToUsd)}</span></li>)}</ul> : <p>{ru ? 'Дополнительные функции не выбраны' : 'No additional features selected'}</p>}</details>
    <details className="order-support"><summary><span><strong>{ru ? 'Поддержка после запуска' : 'Support after launch'}</strong><small>{plan ? `${t(plan.nameKey)} · ${supportPrice}` : (ru ? 'Можно выбрать позже' : 'You can choose later')}</small></span><ChevronDown size={19} /></summary><div className="order-support-body"><p>{ru ? 'Хостинг, помощь и резервные копии после запуска. Поддержка оплачивается отдельно от разработки; её состав зависит от тарифа.' : 'Hosting, help and backups after launch. Support is billed separately from development; coverage depends on the plan.'}</p><div className="order-period" role="group" aria-label={ru ? 'Период оплаты' : 'Billing period'}><button type="button" aria-pressed={!annual} onClick={() => onAnnual(false)}>{ru ? 'В месяц' : 'Monthly'}</button><button type="button" aria-pressed={annual} onClick={() => onAnnual(true)}>{ru ? 'В год' : 'Yearly'}</button></div><p className="order-period-note">{ru ? 'При оплате за год — стоимость 10 месяцев вместо 12.' : 'Pay for 10 months instead of 12 with yearly billing.'}</p><div className="order-plans"><button type="button" className={!planId ? 'is-selected' : ''} aria-pressed={!planId} onClick={() => onPlan(null)}>{ru ? 'Выбрать позже' : 'Choose later'}<span>{!planId && <Check size={15} />}</span></button>{subscriptionPlansBase.map((item: Plan) => <div className={`order-plan-row ${planId === item.id ? 'is-selected' : ''}`} key={item.id}><button type="button" className="order-plan-choice" aria-pressed={planId === item.id} onClick={() => onPlan(item.id)} data-testid={`order-plan-${item.id}`}><span><strong>{t(item.nameKey)}</strong></span><span className="order-plan-price">{money(annual ? yearlyPrices[item.id] : item.price)}<small>{annual ? (ru ? '/ год' : '/ year') : (ru ? '/ мес' : '/ month')}</small></span></button><button className="order-row-info order-plan-info" type="button" onClick={() => onPlanInfo(item.id)} aria-label={`${ru ? 'Подробнее' : 'Details'}: ${t(item.nameKey)}`} data-testid={`plan-info-${item.id}`}><Info size={16} strokeWidth={1.7} /><span>{ru ? 'Что входит' : 'Details'}</span></button><p className="order-plan-benefits">{comparison[item.id].map((key) => t(`constructor.subscriptionFeatures.${key}`)).join(' · ')}</p></div>)}</div></div></details>
  </section>;
}

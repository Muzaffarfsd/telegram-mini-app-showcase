import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';
import { appTemplatesBase, availableFeaturesBase, categoryKeys, storeCategories, subscriptionPlansBase } from './orderCatalog';
import type { OrderContractSelection } from './orderContractSelection';
import './ContractQuestionnaire.css';

type Props = {
  ru: boolean;
  initialSelection?: OrderContractSelection | null;
  onSelectionChange: (selection: OrderContractSelection | null) => void;
};
type Direction = { key: string; templateId: string; ru: string; en: string; labelRu?: string; labelEn?: string; image?: string };
const russianText = (key: string): string => {
  const value = key.split('.').reduce<unknown>((part, item) => part && typeof part === 'object' ? (part as Record<string, unknown>)[item] : undefined, translations.ru);
  return typeof value === 'string' ? value : key;
};
const money = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const catalogDirections: Direction[] = [
  ...storeCategories.filter(item => item.id !== 'shoes').map(item => ({ key: item.id, templateId: 'ecommerce-basic', ru: item.fullRu, en: item.fullEn, labelRu: item.ru, labelEn: item.en, image: `/order-contract-previews/${item.id}.webp` })),
  { key: 'restaurant', templateId: 'restaurant', ru: 'Ресторан и доставка', en: 'Restaurant and delivery', image: '/order-contract-previews/restaurant.webp' },
  { key: 'services', templateId: 'services', ru: russianText('constructor.servicesTemplate'), en: 'Services', image: '/order-contract-previews/services.webp' },
];
const legacyDirections: Direction[] = [
  { key: 'shoes', templateId: 'ecommerce-basic', ru: storeCategories.find(item => item.id === 'shoes')!.fullRu, en: storeCategories.find(item => item.id === 'shoes')!.fullEn, labelRu: 'Обувь', labelEn: 'Shoes', image: '/order-contract-previews/shoes.webp' },
  { key: 'ecommerce-basic', templateId: 'ecommerce-basic', ru: russianText('constructor.onlineStore'), en: 'Online store' },
  { key: 'fitness-center', templateId: 'fitness-center', ru: russianText('constructor.fitnessClub'), en: 'Fitness centre' },
];
const allDirections = [...catalogDirections, ...legacyDirections];

/** The questionnaire uses the same catalogue as the order and never saves customer details. */
export function ContractQuestionnaire({ ru, initialSelection, onSelectionChange }: Props) {
  const { t } = useLanguage();
  const [directionKey, setDirectionKey] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [extras, setExtras] = useState<string[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [annualFromSaved, setAnnualFromSaved] = useState(false);
  const [appliedSaved, setAppliedSaved] = useState(false);
  const callbackRef = useRef(onSelectionChange);
  callbackRef.current = onSelectionChange;
  const chosen = allDirections.find(item => item.key === directionKey);
  const template = appTemplatesBase.find(item => item.id === chosen?.templateId);
  const includedIds = useMemo(() => new Set([
    ...availableFeaturesBase.filter(item => item.included).map(item => item.id),
    ...(template?.features || []),
  ]), [template]);
  const selectedExtras = availableFeaturesBase.filter(item => extras.includes(item.id) && !includedIds.has(item.id));
  const plan = subscriptionPlansBase.find(item => item.id === planId);
  const selection = useMemo<OrderContractSelection | null>(() => {
    if (!template || !chosen) return null;
    return {
      direction: chosen.ru,
      projectName: projectName.trim(),
      includedFeatures: availableFeaturesBase.filter(item => includedIds.has(item.id)).map(item => russianText(item.nameKey)),
      extraFeatures: selectedExtras.map(item => ({ name: russianText(item.nameKey), price: item.price })),
      estimatedTotal: template.estimatedPrice + selectedExtras.reduce((sum, item) => sum + item.price, 0),
      support: plan ? { name: russianText(plan.nameKey), price: annualFromSaved ? plan.price * 10 : plan.price, period: annualFromSaved ? 'year' : 'month' } : null,
    };
  }, [template, chosen, projectName, includedIds, extras, plan, annualFromSaved]);
  useEffect(() => { callbackRef.current(selection); }, [selection]);

  const setDirection = (item: Direction) => {
    if (chosen?.templateId !== item.templateId) setExtras([]);
    setDirectionKey(item.key);
  };
  const restore = () => {
    if (!initialSelection) return;
    const item = allDirections.find(choice => choice.ru === initialSelection.direction);
    if (!item) return;
    const ids = availableFeaturesBase.filter(feature => initialSelection.extraFeatures.some(extra => extra.name === russianText(feature.nameKey) && extra.price === feature.price)).map(feature => feature.id);
    const savedPlan = initialSelection.support ? subscriptionPlansBase.find(entry => russianText(entry.nameKey) === initialSelection.support?.name) : undefined;
    setDirectionKey(item.key);
    setProjectName(initialSelection.projectName);
    setExtras(ids);
    setPlanId(savedPlan?.id ?? null);
    setAnnualFromSaved(initialSelection.support?.period === 'year' && !!savedPlan);
    setAppliedSaved(true);
  };
  const toggleExtra = (id: string) => setExtras(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const visibleDirections = [...catalogDirections, ...legacyDirections.filter(item => item.key === directionKey || item.ru === initialSelection?.direction)];
  const total = selection?.estimatedTotal;

  return <section className="contract-questionnaire" aria-labelledby="contract-questionnaire-title" data-testid="contract-questionnaire">
    <h2 id="contract-questionnaire-title" className="cq-sr">{ru ? 'Параметры проекта' : 'Project details'}</h2>
    {initialSelection && !appliedSaved && <div className="cq-saved"><div><strong>{ru ? 'Есть сохранённый расчёт' : 'A saved estimate is available'}</strong><p>{ru ? 'Можно использовать его или выбрать параметры заново.' : 'Use it or choose new options.'}</p></div><button type="button" onClick={restore} data-testid="contract-restore-order">{ru ? 'Использовать' : 'Use estimate'}</button></div>}
    <div className="cq-heading"><h3><span>01</span>{ru ? 'Направление' : 'App type'}</h3><p>{ru ? 'Ориентировочная стоимость основы' : 'Estimated base price'}</p></div>
    <div className="cq-directions" role="group" aria-label={ru ? 'Направление приложения' : 'App type'}>
      {visibleDirections.map(item => { const itemTemplate=appTemplatesBase.find(templateItem => templateItem.id === item.templateId)!; const active=directionKey===item.key; return <button type="button" key={item.key} className={`cq-direction${active ? ' is-selected' : ''}`} aria-pressed={active} aria-label={`${ru ? item.ru : item.en}: ${ru ? 'от' : 'from'} ${money(itemTemplate.estimatedPrice)}`} onClick={() => setDirection(item)} data-testid={`contract-direction-${item.key}`}><span className="cq-direction-copy"><strong>{ru ? item.labelRu || item.ru : item.labelEn || item.en}</strong><small>{ru ? 'от' : 'from'} {money(itemTemplate.estimatedPrice)}</small></span>{item.image && <img src={item.image} alt="" loading="eager" decoding="async"/>}<span className="cq-choice" aria-hidden="true">{active && <Check size={13}/>}</span></button>; })}
    </div>
    {template && <>
      <label className="cq-name" htmlFor="contract-project-name">{ru ? 'Название проекта' : 'Project name'} <span>{ru ? 'необязательно' : 'optional'}</span><input id="contract-project-name" data-testid="contract-project-name" value={projectName} maxLength={80} onChange={event => setProjectName(event.target.value)} placeholder={ru ? 'Например, название бизнеса' : 'For example, your business'} autoComplete="off"/></label>
      <div className="cq-heading"><h3><span>02</span>{ru ? 'Возможности' : 'Features'}</h3><p>{ru ? 'Включённые функции и дополнительные опции' : 'Included features and optional extras'}</p></div>
      <div className="cq-included"><strong>{ru ? 'Уже включено' : 'Already included'}</strong><ul>{availableFeaturesBase.filter(item => includedIds.has(item.id)).map(item => <li key={item.id}>{t(item.nameKey)}</li>)}</ul></div>
      <details className="cq-catalog"><summary><span><strong>{ru ? 'Добавить возможности' : 'Add features'}</strong><small>{selectedExtras.length ? `${ru ? 'Выбрано' : 'Selected'}: ${selectedExtras.length}` : (ru ? 'По желанию' : 'Optional')}</small></span><ChevronDown size={18}/></summary><div className="cq-groups">{categoryKeys.map(key => {const choices=availableFeaturesBase.filter(item => item.categoryKey===key && !includedIds.has(item.id));if (!choices.length) return null;const count=choices.filter(item => extras.includes(item.id)).length;return <details className="cq-group" key={key}><summary><span>{t(key)}{count > 0 && <small>{count}</small>}</span><ChevronDown size={16}/></summary><div>{choices.map(item => {const active=extras.includes(item.id);return <button className="cq-feature" type="button" key={item.id} aria-pressed={active} onClick={() => toggleExtra(item.id)} data-testid={`contract-extra-${item.id}`}><span className={`cq-feature-check${active ? ' is-active' : ''}`} aria-hidden="true">{active ? <Check size={13}/> : <Plus size={13}/>}</span><span className="cq-feature-name">{t(item.nameKey)}</span><strong>+ {money(item.price)}</strong></button>})}</div></details>;})}</div></details>
      <div className="cq-heading"><h3><span>03</span>{ru ? 'Поддержка' : 'Support'}</h3><p>{ru ? 'Оплачивается отдельно; можно выбрать позже' : 'Billed separately; you can choose later'}</p></div>
      {annualFromSaved && plan && <p className="cq-annual-note">{ru ? `В сохранённом расчёте выбран годовой тариф «${russianText(plan.nameKey)}» — ${money(plan.price * 10)}. Условия годовой оплаты согласуются отдельно. Вы можете выбрать помесячный тариф ниже.` : `Your saved estimate includes yearly support (${money(plan.price * 10)}). Yearly payment terms are agreed separately. You can choose monthly support below.`}</p>}
      <div className="cq-plans" role="group" aria-label={ru ? 'Поддержка' : 'Support'}><button type="button" className={!plan ? 'is-selected' : ''} aria-pressed={!plan} onClick={() => { setPlanId(null); setAnnualFromSaved(false); }} data-testid="contract-support-none"><span>{ru ? 'Выбрать позже' : 'Choose later'}</span><span className="cq-plan-check" aria-hidden="true">{!plan && <Check size={13}/>}</span></button>{subscriptionPlansBase.map(item => {const active=planId===item.id && !annualFromSaved;return <button type="button" key={item.id} className={active ? 'is-selected' : ''} aria-pressed={active} onClick={() => {setPlanId(item.id);setAnnualFromSaved(false);}} data-testid={`contract-support-${item.id}`}><span><strong>{t(item.nameKey)}</strong><small>{ru ? '100% до начала месяца' : '100% before the month starts'}</small></span><span className="cq-plan-price">{money(item.price)}<small>{ru ? '/ мес' : '/ month'}</small></span><span className="cq-plan-check" aria-hidden="true">{active && <Check size={13}/>}</span></button>})}</div>
      <div className="cq-total" data-testid="contract-estimate"><div><strong>{ru ? 'Разработка' : 'Development'}</strong><small>{ru ? 'Предварительный расчёт' : 'Preliminary estimate'}</small></div><b>{total !== null && total !== undefined ? money(total) : '—'}</b></div>
      <p className="cq-terms">{ru ? 'Оплата разработки: 50% аванс и 50% после приёмки. Окончательные состав, цена и сроки согласуются отдельно.' : 'Development: 50% in advance and 50% after acceptance. The final scope, price and timeline are agreed separately.'}</p>
    </>}
  </section>;
}

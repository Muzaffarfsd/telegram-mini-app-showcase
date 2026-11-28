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
  /** A locally restored draft; the project name is deliberately not persisted. */
  restoredSelection?: OrderContractSelection | null;
  step?: 'project' | 'features' | 'hidden';
  onSelectionChange: (selection: OrderContractSelection | null) => void;
};
type Direction = { key: string; templateId: string | null; ru: string; en: string; labelRu?: string; labelEn?: string; image?: string; projectId?: string; reference?: boolean };
const russianText = (key: string): string => {
  const value = key.split('.').reduce<unknown>((part, item) => part && typeof part === 'object' ? (part as Record<string, unknown>)[item] : undefined, translations.ru);
  return typeof value === 'string' ? value : key;
};
const money = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const catalogDirections: Direction[] = [
  ...storeCategories.filter(item => item.id !== 'shoes').map(item => ({ key: item.id, templateId: 'ecommerce-basic', ru: item.fullRu, en: item.fullEn, labelRu: item.ru, labelEn: item.en, image: `/order-contract-previews/${item.id}.webp`, projectId: ({clothes:'muraka-fashion',sneakers:'nike-sneakers',tech:'apple-store',flowers:'flower-store'} as Record<string,string>)[item.id] })),
  { key: 'restaurant', templateId: 'restaurant', ru: 'Ресторан и доставка', en: 'Restaurant and delivery', image: '/order-contract-previews/restaurant.webp' },
  { key: 'services', templateId: 'services', ru: russianText('constructor.servicesTemplate'), en: 'Services', image: '/order-contract-previews/services.webp' },
  { key:'women-fashion', templateId:'ecommerce-basic', ru:'Магазин женской одежды', en:'Womenswear store', labelRu:'Женская одежда', labelEn:'Womenswear', image:'/order-contract-previews/women-fashion.webp', projectId:'women-fashion', reference:true },
  { key:'takt-coffee', templateId:'restaurant', ru:'Кофейня', en:'Coffee shop', labelRu:'Кофейня', labelEn:'Coffee shop', image:'/order-contract-previews/takt-coffee.webp', projectId:'takt-coffee', reference:true },
  { key:'lumi-studio', templateId:'services', ru:'Студия красоты', en:'Beauty studio', labelRu:'Студия красоты', labelEn:'Beauty studio', image:'/order-contract-previews/lumi-studio.webp', projectId:'lumi-studio', reference:true },
  { key:'furniture-studio', templateId:null, ru:'Мебельный салон', en:'Furniture showroom', labelRu:'Мебель', labelEn:'Furniture', image:'/order-contract-previews/furniture-studio.webp', projectId:'furniture-studio', reference:true },
  { key:'opt-market', templateId:null, ru:'Оптовый магазин', en:'Wholesale store', labelRu:'Оптовый магазин', labelEn:'Wholesale', image:'/order-contract-previews/opt-market.webp', projectId:'opt-market', reference:true },
  { key:'jewelry-store', templateId:'ecommerce-basic', ru:'Магазин украшений', en:'Jewelry store', labelRu:'Украшения', labelEn:'Jewelry', image:'/order-contract-previews/jewelry-store.webp', projectId:'jewelry-store', reference:true },
  { key:'medical-center', templateId:null, ru:'Медицинский центр', en:'Medical center', labelRu:'Медицина', labelEn:'Medical care', image:'/order-contract-previews/medical-center.webp', projectId:'medical-center', reference:true },
  { key:'china-buyer', templateId:null, ru:'Байер из Китая', en:'China sourcing', labelRu:'Байер из Китая', labelEn:'China sourcing', image:'/order-contract-previews/china-buyer.webp', projectId:'china-buyer', reference:true },
  { key:'skincare-aura', templateId:'ecommerce-basic', ru:'Магазин косметики', en:'Skincare store', labelRu:'Косметика', labelEn:'Skincare', image:'/order-contract-previews/skincare-aura.webp', projectId:'skincare-aura', reference:true },
];
const legacyDirections: Direction[] = [
  { key: 'shoes', templateId: 'ecommerce-basic', ru: storeCategories.find(item => item.id === 'shoes')!.fullRu, en: storeCategories.find(item => item.id === 'shoes')!.fullEn, labelRu: 'Обувь', labelEn: 'Shoes', image: '/order-contract-previews/shoes.webp' },
  { key: 'ecommerce-basic', templateId: 'ecommerce-basic', ru: russianText('constructor.onlineStore'), en: 'Online store' },
  { key: 'fitness-center', templateId: 'fitness-center', ru: russianText('constructor.fitnessClub'), en: 'Fitness centre' },
];
const allDirections = [...catalogDirections, ...legacyDirections];

const decodeSelection = (selection?: OrderContractSelection | null) => {
  if (!selection) return null;
  const direction = allDirections.find(item => item.ru === selection.direction);
  if (!direction) return null;
  return {
    directionKey: direction.key,
    extras: availableFeaturesBase.filter(feature => selection.extraFeatures.some(extra => extra.name === russianText(feature.nameKey) && extra.price === feature.price)).map(feature => feature.id),
    planId: selection.support ? subscriptionPlansBase.find(entry => russianText(entry.nameKey) === selection.support?.name)?.id ?? null : null,
    annual: selection.support?.period === 'year',
  };
};

/** The questionnaire uses the same catalogue as the order and never saves customer details. */
export function ContractQuestionnaire({ ru, initialSelection, restoredSelection, step, onSelectionChange }: Props) {
  const { t } = useLanguage();
  const [restored] = useState(() => decodeSelection(restoredSelection));
  const [directionKey, setDirectionKey] = useState<string | null>(restored?.directionKey ?? null);
  const [projectName, setProjectName] = useState('');
  const [extras, setExtras] = useState<string[]>(restored?.extras ?? []);
  const [planId, setPlanId] = useState<string | null>(restored?.planId ?? null);
  const [annualFromSaved, setAnnualFromSaved] = useState(restored?.annual ?? false);
  const [appliedSaved, setAppliedSaved] = useState(false);
  const callbackRef = useRef(onSelectionChange);
  callbackRef.current = onSelectionChange;
  const chosen = allDirections.find(item => item.key === directionKey);
  const template = appTemplatesBase.find(item => item.id === chosen?.templateId);
  const includedIds = useMemo(() => new Set(template ? [
    ...availableFeaturesBase.filter(item => item.included).map(item => item.id),
    ...template.features,
  ] : []), [template]);
  const selectedExtras = availableFeaturesBase.filter(item => extras.includes(item.id) && !includedIds.has(item.id));
  const plan = subscriptionPlansBase.find(item => item.id === planId);
  const selection = useMemo<OrderContractSelection | null>(() => {
    if (!chosen) return null;
    return {
      direction: chosen.ru,
      projectName: projectName.trim(),
      includedFeatures: availableFeaturesBase.filter(item => includedIds.has(item.id)).map(item => russianText(item.nameKey)),
      extraFeatures: selectedExtras.map(item => ({ name: russianText(item.nameKey), price: item.price })),
      estimatedTotal: template ? template.estimatedPrice + selectedExtras.reduce((sum, item) => sum + item.price, 0) : null,
      support: plan ? { name: russianText(plan.nameKey), price: annualFromSaved ? plan.price * 10 : plan.price, period: annualFromSaved ? 'year' : 'month' } : null,
    };
  }, [template, chosen, projectName, includedIds, extras, plan, annualFromSaved]);
  useEffect(() => { callbackRef.current(selection); }, [selection]);

  const setDirection = (item: Direction) => {
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
  const nowIncluded = availableFeaturesBase.filter(item => extras.includes(item.id) && includedIds.has(item.id));

  return <section className="contract-questionnaire" aria-labelledby="contract-questionnaire-title" data-testid="contract-questionnaire" hidden={step === 'hidden'}>
    <h2 id="contract-questionnaire-title" className="cq-sr">{ru ? 'Параметры проекта' : 'Project details'}</h2>
    <div hidden={step === 'features'}>
    {initialSelection && !appliedSaved && !restored && <div className="cq-saved"><div><strong>{ru ? 'Есть сохранённый расчёт' : 'A saved estimate is available'}</strong><p>{ru ? 'Можно использовать его или выбрать параметры заново.' : 'Use it or choose new options.'}</p></div><button type="button" onClick={restore} data-testid="contract-restore-order">{ru ? 'Использовать' : 'Use estimate'}</button></div>}
    <div className="cq-heading"><h3><span>01</span>{ru ? 'Направление' : 'App type'}</h3><p>{ru ? 'Ориентировочная стоимость основы' : 'Estimated base price'}</p></div>
    <div className="cq-directions" role="group" aria-label={ru ? 'Направление приложения' : 'App type'}>
      {visibleDirections.map((item, index) => { const itemTemplate=appTemplatesBase.find(templateItem => templateItem.id === item.templateId); const active=directionKey===item.key; const price = itemTemplate ? `${ru ? (item.reference ? 'основа от' : 'от') : (item.reference ? 'base from' : 'from')} ${money(itemTemplate.estimatedPrice)}` : (ru ? 'По согласованию' : 'To be agreed'); return <button type="button" key={item.key} className={`cq-direction${active ? ' is-selected' : ''}`} aria-pressed={active} aria-label={`${ru ? item.ru : item.en}: ${price}`} onClick={() => setDirection(item)} data-testid={`contract-direction-${item.key}`} data-project-id={item.projectId}><span className="cq-direction-copy"><strong>{ru ? item.labelRu || item.ru : item.labelEn || item.en}</strong><small>{price}</small></span>{item.image && <img src={item.image} alt="" loading={index < 4 ? 'eager' : 'lazy'} decoding="async"/>}<span className="cq-choice" aria-hidden="true">{active && <Check size={13}/>}</span></button>; })}
    </div>
    {chosen && <>
      {chosen.reference && <p className="cq-reference-note">{ru ? 'Выбранный проект — ориентир. Точный состав и особенности приложения согласуются отдельно.' : 'The selected project is a reference. Its exact scope and features are agreed separately.'}</p>}
      <label className="cq-name" htmlFor="contract-project-name">{ru ? 'Название проекта' : 'Project name'} <span>{ru ? 'необязательно' : 'optional'}</span><input id="contract-project-name" data-testid="contract-project-name" value={projectName} maxLength={80} onChange={event => setProjectName(event.target.value)} placeholder={ru ? 'Например, название бизнеса' : 'For example, your business'} autoComplete="off"/></label>
    </>}
    </div>
    <div hidden={step === 'project'}>
    {chosen && <>
      <div className="cq-heading"><h3><span>02</span>{ru ? 'Возможности' : 'Features'}</h3><p>{ru ? 'Включённые функции и дополнительные опции' : 'Included features and optional extras'}</p></div>
      {template ? <div className="cq-included"><strong>{ru ? 'Уже включено в основу' : 'Included in the base'}</strong><ul>{availableFeaturesBase.filter(item => includedIds.has(item.id)).map(item => <li key={item.id}>{t(item.nameKey)}</li>)}</ul></div> : <p className="cq-reference-note">{ru ? 'Состав и стоимость проекта определяются после обсуждения. Можно отметить нужные функции ниже.' : 'Project scope and price are agreed after discussion. You can select requested features below.'}</p>}
      {nowIncluded.length > 0 && <p className="cq-reference-note" role="status">{ru ? 'Ранее выбранные функции теперь включены в основу и не добавляются к цене: ' : 'Previously selected features are now included in the base, without an extra charge: '}{nowIncluded.map(item => t(item.nameKey)).join(', ')}.</p>}
      <details className="cq-catalog"><summary><span><strong>{ru ? 'Добавить возможности' : 'Add features'}</strong><small>{selectedExtras.length ? `${ru ? 'Выбрано' : 'Selected'}: ${selectedExtras.length}` : (ru ? 'По желанию' : 'Optional')}</small></span><ChevronDown size={18}/></summary><div className="cq-groups">{categoryKeys.map(key => {const choices=availableFeaturesBase.filter(item => item.categoryKey===key && !includedIds.has(item.id));if (!choices.length) return null;const count=choices.filter(item => extras.includes(item.id)).length;return <details className="cq-group" key={key}><summary><span>{t(key)}{count > 0 && <small>{count}</small>}</span><ChevronDown size={16}/></summary><div>{choices.map(item => {const active=extras.includes(item.id);return <button className="cq-feature" type="button" key={item.id} aria-pressed={active} onClick={() => toggleExtra(item.id)} data-testid={`contract-extra-${item.id}`}><span className={`cq-feature-check${active ? ' is-active' : ''}`} aria-hidden="true">{active ? <Check size={13}/> : <Plus size={13}/>}</span><span className="cq-feature-name">{t(item.nameKey)}</span><strong>+ {money(item.price)}</strong></button>})}</div></details>;})}</div></details>
      <div className="cq-heading"><h3><span>03</span>{ru ? 'Поддержка' : 'Support'}</h3><p>{ru ? 'Оплачивается отдельно; можно выбрать позже' : 'Billed separately; you can choose later'}</p></div>
      <div className="cq-period" role="group" aria-label={ru ? 'Период поддержки' : 'Support period'}>
        <button type="button" aria-pressed={!annualFromSaved} onClick={() => setAnnualFromSaved(false)} data-testid="contract-support-monthly">{ru ? 'В месяц' : 'Monthly'}</button>
        <button type="button" aria-pressed={annualFromSaved} onClick={() => setAnnualFromSaved(true)} data-testid="contract-support-yearly">{ru ? 'В год' : 'Yearly'}</button>
      </div>
      {annualFromSaved && <p className="cq-annual-note">{ru ? `${plan ? `Годовой тариф «${russianText(plan.nameKey)}» — ${money(plan.price * 10)}. ` : ''}Условия годовой оплаты согласуются отдельно.` : `${plan ? `Yearly support: ${money(plan.price * 10)}. ` : ''}Yearly payment terms are agreed separately.`}</p>}
      <div className="cq-plans" role="group" aria-label={ru ? 'Поддержка' : 'Support'}><button type="button" className={!plan ? 'is-selected' : ''} aria-pressed={!plan} onClick={() => setPlanId(null)} data-testid="contract-support-none"><span>{ru ? 'Выбрать позже' : 'Choose later'}</span><span className="cq-plan-check" aria-hidden="true">{!plan && <Check size={13}/>}</span></button>{subscriptionPlansBase.map(item => {const active=planId===item.id;return <button type="button" key={item.id} className={active ? 'is-selected' : ''} aria-pressed={active} onClick={() => setPlanId(item.id)} data-testid={`contract-support-${item.id}`}><span><strong>{t(item.nameKey)}</strong><small>{annualFromSaved ? (ru ? 'Условия оплаты согласуются' : 'Payment terms to be agreed') : (ru ? '100% до начала месяца' : '100% before the month starts')}</small></span><span className="cq-plan-price">{money(annualFromSaved ? item.price * 10 : item.price)}<small>{annualFromSaved ? (ru ? '/ год' : '/ year') : (ru ? '/ мес' : '/ month')}</small></span><span className="cq-plan-check" aria-hidden="true">{active && <Check size={13}/>}</span></button>})}</div>
      <div className="cq-total" data-testid="contract-estimate"><div><strong>{ru ? 'Разработка' : 'Development'}</strong><small>{total === null ? (ru ? 'Итоговая цена после обсуждения' : 'Final price after discussion') : (ru ? 'Предварительный расчёт' : 'Preliminary estimate')}</small></div><b>{total !== null && total !== undefined ? money(total) : (ru ? 'По согласованию' : 'To be agreed')}</b></div>
      <p className="cq-terms">{ru ? 'Оплата разработки: 50% аванс и 50% после приёмки. Окончательные состав, цена и сроки согласуются отдельно.' : 'Development: 50% in advance and 50% after acceptance. The final scope, price and timeline are agreed separately.'}</p>
    </>}
    </div>
  </section>;
}

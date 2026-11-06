import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Info, Plus } from 'lucide-react';
import { appTemplatesBase, availableFeaturesBase, categoryKeys } from './orderCatalog';
import './OrderFeaturesStep.css';

type Feature = typeof availableFeaturesBase[number];
type Props = {
  ru: boolean;
  t: (key: string) => string;
  template: typeof appTemplatesBase[number];
  artSrc: string;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  includedIds: Set<string>;
  extras: string[];
  onToggleFeature: (id: string) => void;
  onFeatureInfo: (id: string) => void;
  onChangeTemplate: () => void;
  total: number;
};

// Recommendations are suggestions only: nothing is preselected and the full catalog remains available.
const suggestions: Record<string, string[]> = {
  'ecommerce-basic': ['search', 'delivery-basic', 'promo-codes', 'basic-analytics'],
  restaurant: ['delivery-basic', 'push-notifications', 'loyalty-program', 'basic-analytics'],
  'fitness-center': ['calendar-sync', 'push-notifications', 'loyalty-program', 'basic-analytics'],
  services: ['calendar-sync', 'push-notifications', 'reviews', 'basic-analytics'],
};

const numberFormat = new Intl.NumberFormat('ru-RU');
const money = (amount: number) => `${numberFormat.format(amount)} ₽`;

export function OrderFeaturesStep({ ru, t, template, artSrc, projectName, onProjectNameChange, includedIds, extras, onToggleFeature, onFeatureInfo, onChangeTemplate, total }: Props) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const included = availableFeaturesBase.filter((feature) => includedIds.has(feature.id));
  const suggested = (suggestions[template.id] || [])
    .map((id) => availableFeaturesBase.find((feature) => feature.id === id))
    .filter((feature): feature is Feature => Boolean(feature) && !includedIds.has(feature!.id));

  const featureRow = (feature: Feature, variant: 'recommended' | 'catalog') => {
    const isIncluded = includedIds.has(feature.id);
    const selected = isIncluded || extras.includes(feature.id);
    const status = isIncluded ? (ru ? 'Включено' : 'Included') : selected ? (ru ? 'Добавлено' : 'Added') : (ru ? 'Добавить' : 'Add');
    return <div className="order-feature-row" key={feature.id}>
      <button
        type="button"
        className="order-feature"
        aria-pressed={selected}
        aria-disabled={isIncluded}
        onClick={() => onToggleFeature(feature.id)}
        data-testid={`${variant === 'recommended' ? 'recommended-feature' : 'feature'}-${feature.id}`}
      >
        <span className={`order-feature-check ${selected ? 'is-active' : ''}`} aria-hidden="true">{selected ? <Check size={12} strokeWidth={2.8} /> : <Plus size={13} />}</span>
        <span className="order-feature-name">{t(feature.nameKey)}</span>
        <span className="order-feature-meta"><span className="order-feature-status">{status}</span>{!isIncluded && <span className="order-feature-cost">+ {money(feature.price)}</span>}</span>
      </button>
      <button className="order-row-info" type="button" onClick={() => onFeatureInfo(feature.id)} aria-label={`${ru ? 'Подробнее' : 'Details'}: ${t(feature.nameKey)}`} data-testid={`${variant === 'recommended' ? 'recommended-info' : 'feature-info'}-${feature.id}`}><Info size={17} strokeWidth={1.7} /></button>
    </div>;
  };

  return <section className="order-features" aria-label={ru ? 'Настройка приложения' : 'Configure your app'}>
    <div className="order-selected-app"><img src={artSrc} alt="" /><div><small>{ru ? 'ВАШ ВЫБОР' : 'YOUR CHOICE'}</small><strong>{t(template.nameKey)}</strong><span>{ru ? 'от' : 'from'} {money(template.estimatedPrice)}</span></div><button type="button" onClick={onChangeTemplate} aria-label={ru ? 'Изменить тип приложения' : 'Change app type'}><ChevronRight size={18} /></button></div>
    <label className="order-name-label" htmlFor="order-project-name">{ru ? 'Название проекта' : 'Project name'} <span>{ru ? 'необязательно' : 'optional'}</span></label>
    <input id="order-project-name" className="order-name-input" value={projectName} maxLength={80} onChange={(event) => onProjectNameChange(event.target.value)} placeholder={ru ? 'Например, название бизнеса' : 'For example, your business'} />

    <div className="order-feature-intro"><h2>{ru ? 'Возможности' : 'Features'}</h2></div>
    <div className="order-included-panel" aria-label={ru ? 'Включено в основу' : 'Included in the package'}>
      <div className="order-included-heading"><span className="order-included-symbol" aria-hidden="true"><Check size={14} strokeWidth={2.6} /></span><strong>{ru ? 'Уже включено' : 'Already included'}</strong><span>{included.length}</span></div>
      <ul className="order-included-chips">{included.map((feature) => <li key={feature.id}>{t(feature.nameKey)}</li>)}</ul>
    </div>

    {suggested.length > 0 && <div className="order-suggestions">
      <div className="order-feature-heading"><h3>{ru ? 'Подойдёт вашему проекту' : 'Suggested for your project'}</h3><span>{ru ? 'На ваш выбор' : 'Optional'}</span></div>
      <div className="order-suggestion-list">{suggested.map((feature) => featureRow(feature, 'recommended'))}</div>
    </div>}

    <details className="order-feature-catalog" data-testid="order-all-features" onToggle={(event) => { if (event.target === event.currentTarget) setCatalogOpen(event.currentTarget.open); }}>
      <summary><span><strong>{ru ? 'Все возможности' : 'All features'}</strong><small>{ru ? 'Посмотреть все категории' : 'Browse all categories'}</small></span><ChevronDown size={18} aria-hidden="true" /></summary>
      {catalogOpen && <div className="order-feature-groups">
        {categoryKeys.map((key) => {
          const features = availableFeaturesBase.filter((feature) => feature.categoryKey === key);
          const selectedCount = features.filter((feature) => includedIds.has(feature.id) || extras.includes(feature.id)).length;
          return <details className="order-group" data-feature-category={key} key={key} open={!!openGroups[key]} onToggle={(event) => {
            if (event.target !== event.currentTarget) return;
            const open = event.currentTarget.open;
            setOpenGroups((current) => Boolean(current[key]) === open ? current : { ...current, [key]: open });
          }}>
            <summary><span>{t(key)}</span><span className="order-group-meta">{selectedCount > 0 && <small aria-label={ru ? `Выбрано: ${selectedCount}` : `Selected: ${selectedCount}`}>{selectedCount}</small>}<ChevronDown size={17} aria-hidden="true" /></span></summary>
            {openGroups[key] && <div className="order-group-list">{features.map((feature) => featureRow(feature, 'catalog'))}</div>}
          </details>;
        })}
      </div>}
    </details>
    <div className="order-price-inline"><span>{ru ? 'Ориентировочно за разработку' : 'Estimated development'}</span><strong data-testid="order-running-total">{money(total)}</strong></div>
  </section>;
}

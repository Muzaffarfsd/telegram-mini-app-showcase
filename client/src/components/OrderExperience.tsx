import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { appTemplatesBase, availableFeaturesBase, categoryKeys, subscriptionPlansBase } from './orderCatalog';
import shopArt from '../assets/order/shop-v5.webp';
import restaurantArt from '../assets/order/restaurant-v2.webp';
import fitnessArt from '../assets/order/fitness-v2.webp';
import servicesArt from '../assets/order/services-v4.webp';
import { OrderSkeleton } from './OrderSkeleton';
import './OrderExperience.css';

type Template = typeof appTemplatesBase[number];
type Plan = typeof subscriptionPlansBase[number];
const art: Record<string, string> = {
  'ecommerce-basic': shopArt,
  restaurant: restaurantArt,
  'fitness-center': fitnessArt,
  services: servicesArt,
};
const yearlyPrices: Record<string, number> = { minimal: 99000, standard: 149000, premium: 249000 };
const money = (amount: number) => `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;

export default function OrderExperience(_props: { onNavigate: (section: string, data?: any) => void }) {
  const { language, t } = useLanguage();
  const ru = language === 'ru';
  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [projectName, setProjectName] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);
  const [notice, setNotice] = useState('');
  const [artReady, setArtReady] = useState(false);
  const template = appTemplatesBase.find((item) => item.id === templateId);
  const plan = subscriptionPlansBase.find((item) => item.id === planId);
  const includedIds = useMemo(() => new Set([
    ...availableFeaturesBase.filter((feature) => feature.included).map((feature) => feature.id),
    ...(template?.features || []),
  ]), [template]);
  const selectedExtras = availableFeaturesBase.filter((feature) => extras.includes(feature.id) && !includedIds.has(feature.id));
  const extraTotal = selectedExtras.reduce((sum, feature) => sum + feature.price, 0);
  const total = (template?.estimatedPrice || 0) + extraTotal;

  const moveTo = useCallback((next: number) => {
    setNotice('');
    setStep(next);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('root')?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  const chooseTemplate = (item: Template) => {
    if (templateId !== item.id) setExtras([]);
    setTemplateId(item.id);
    setNotice('');
  };
  const toggleFeature = (id: string) => {
    if (includedIds.has(id)) return;
    setExtras((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const openRequest = useCallback(() => {
    if (!template) return;
    const includedNames = availableFeaturesBase.filter((feature) => includedIds.has(feature.id)).map((feature) => `• ${t(feature.nameKey)}`).join('\n');
    const extraLines = selectedExtras.length
      ? selectedExtras.map((feature) => `• ${t(feature.nameKey)} — ${money(feature.price)}`).join('\n')
      : (ru ? '• Без дополнительных функций' : '• No additional features');
    const planLine = plan
      ? `${t(plan.nameKey)} — ${money(annual ? yearlyPrices[plan.id] : plan.price)}${annual ? (ru ? '/год' : '/year') : (ru ? '/мес' : '/month')}`
      : (ru ? 'Выбрать после запуска' : 'Choose after launch');
    const message = ru
      ? `Здравствуйте! Хочу обсудить разработку приложения.\n\n📱 ПРОЕКТ\nНаправление: ${t(template.nameKey)}\nНазвание: ${projectName.trim() || 'Обсудим позже'}\nОриентировочный срок: ${t(template.developmentTimeKey)}\n\n✓ ВКЛЮЧЕНО В ОСНОВУ\n${includedNames}\n\n＋ ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ\n${extraLines}\n\n💰 СТОИМОСТЬ РАЗРАБОТКИ\nОснова: ${money(template.estimatedPrice)}\nДополнительные функции: ${money(extraTotal)}\nИтого ориентировочно: ${money(total)}\n\n🛠 ПОДДЕРЖКА ПОСЛЕ ЗАПУСКА\n${planLine}\n\nБуду рад(а) обсудить детали проекта.`
      : `Hello! I would like to discuss app development.\n\n📱 PROJECT\nCategory: ${t(template.nameKey)}\nProject name: ${projectName.trim() || 'To be discussed'}\nEstimated time: ${t(template.developmentTimeKey)}\n\n✓ INCLUDED IN THE PACKAGE\n${includedNames}\n\n＋ ADDITIONAL FEATURES\n${extraLines}\n\n💰 DEVELOPMENT ESTIMATE\nBase: ${money(template.estimatedPrice)}\nAdditional features: ${money(extraTotal)}\nEstimated total: ${money(total)}\n\n🛠 SUPPORT AFTER LAUNCH\n${planLine}\n\nI would be happy to discuss the details.`;
    const url = `https://t.me/web4tgs?text=${encodeURIComponent(message)}`;
    try {
      if (window.Telegram?.WebApp?.openTelegramLink) window.Telegram.WebApp.openTelegramLink(url);
      else window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [annual, extraTotal, includedIds, plan, projectName, ru, selectedExtras, t, template, total]);

  const continueOrder = useCallback(() => {
    if (!artReady) return;
    if (step === 1 && !template) {
      setNotice(ru ? 'Выберите направление приложения' : 'Choose an app type');
      return;
    }
    if (step < 3) moveTo(step + 1);
    else openRequest();
  }, [artReady, moveTo, openRequest, ru, step, template]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => { if (active) setArtReady(true); }, 6000);
    Promise.all(Object.values(art).map((src) => new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    }))).then(() => { if (active) { window.clearTimeout(timer); setArtReady(true); } });
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    window.addEventListener('web4tg:order-continue', continueOrder);
    return () => window.removeEventListener('web4tg:order-continue', continueOrder);
  }, [continueOrder]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('web4tg:order-label', {
      detail: step === 3 ? (ru ? 'Открыть заявку' : 'Open request') : (ru ? 'Продолжить' : 'Continue'),
    }));
  }, [step, ru]);

  if (!artReady) return <OrderSkeleton label={ru ? 'Загрузка страницы заказа' : 'Loading order page'} />;

  return (
    <main className="order-page" data-order-step={step} data-testid="order-page">
      <div className="order-shell">
        <header className="order-heading">
          <div className="order-progress" aria-label={ru ? `Шаг ${step} из 3` : `Step ${step} of 3`}>
            {step > 1 ? <button className="order-back" type="button" onClick={() => moveTo(step - 1)} aria-label={ru ? 'Назад' : 'Back'} data-testid="order-back"><ArrowLeft size={19} /></button> : <span className="order-progress-spacer" />}
            <span className="order-progress-label">{ru ? 'ШАГ' : 'STEP'} {String(step).padStart(2, '0')} <span>/</span> 03</span>
            <span className="order-progress-spacer" />
          </div>
          <div className="order-progress-track" aria-hidden="true">{[1, 2, 3].map((number) => <i className={number <= step ? 'is-active' : ''} key={number} />)}</div>
          <h1>{step === 1 ? (ru ? 'Выберите направление проекта' : 'Choose your project direction') : step === 2 ? (ru ? 'Добавьте нужные функции' : 'Choose your features') : (ru ? 'Всё готово к обсуждению' : 'Ready to discuss your app')}</h1>
          <p>{step === 1 ? (ru ? 'Разработаем приложение под задачи вашего бизнеса.' : 'We’ll develop an app for your business needs.') : step === 2 ? (ru ? 'Основное уже включено. Остальное — на ваш выбор.' : 'The essentials are included. Add anything else you need.') : (ru ? 'Проверьте детали — мы подготовим заявку в Telegram.' : 'Check the details and we’ll prepare a Telegram message.')}</p>
        </header>

        {step === 1 && <section className="order-template-list" aria-label={ru ? 'Направление приложения' : 'App type'}>
          {appTemplatesBase.map((item) => <button key={item.id} type="button" className={`order-template ${templateId === item.id ? 'is-selected' : ''}`} aria-pressed={templateId === item.id} onClick={() => chooseTemplate(item)} data-testid={`template-${item.id}`}>
            <span className="order-template-copy"><strong>{t(item.nameKey)}</strong><span>{t(item.descriptionKey)}</span><small>{ru ? 'от' : 'from'} {money(item.estimatedPrice)}</small></span>
            <img className="order-template-art" src={art[item.id]} alt="" draggable={false} />
            <span className="order-choice" aria-hidden="true">{templateId === item.id && <Check size={12} strokeWidth={3} />}</span>
          </button>)}
          {notice && <p className="order-notice" role="alert">{notice}</p>}
        </section>}

        {step === 2 && template && <section className="order-features" aria-label={ru ? 'Настройка приложения' : 'Configure your app'}>
          <div className="order-selected-app"><img src={art[template.id]} alt="" /><div><small>{ru ? 'ВАШ ВЫБОР' : 'YOUR CHOICE'}</small><strong>{t(template.nameKey)}</strong><span>{ru ? 'от' : 'from'} {money(template.estimatedPrice)}</span></div><button type="button" onClick={() => moveTo(1)} aria-label={ru ? 'Изменить тип приложения' : 'Change app type'}><ChevronRight size={18} /></button></div>
          <label className="order-name-label" htmlFor="order-project-name">{ru ? 'Название проекта' : 'Project name'} <span>{ru ? 'необязательно' : 'optional'}</span></label>
          <input id="order-project-name" className="order-name-input" value={projectName} maxLength={80} onChange={(event) => setProjectName(event.target.value)} placeholder={ru ? 'Например, название вашего бизнеса' : 'For example, your business name'} />
          <div className="order-section-title"><h2>{ru ? 'Возможности' : 'Features'}</h2><span>{ru ? 'Выберите подходящие' : 'Choose what fits'}</span></div>
          <div className="order-feature-groups">
            {categoryKeys.map((key, index) => {
              const features = availableFeaturesBase.filter((feature) => feature.categoryKey === key);
              const selectedCount = features.filter((feature) => includedIds.has(feature.id) || extras.includes(feature.id)).length;
              return <details className="order-group" key={key} open={index === 0 ? true : undefined}>
                <summary><span>{t(key)}</span><span className="order-group-meta">{selectedCount > 0 && <small>{selectedCount}</small>}<ChevronDown size={17} /></span></summary>
                <div className="order-group-list">{features.map((feature) => {
                  const included = includedIds.has(feature.id);
                  const active = included || extras.includes(feature.id);
                  return <button key={feature.id} type="button" className="order-feature" aria-pressed={active} aria-disabled={included} onClick={() => toggleFeature(feature.id)} data-testid={`feature-${feature.id}`}>
                    <span className={`order-feature-check ${active ? 'is-active' : ''}`} aria-hidden="true">{active ? <Check size={12} strokeWidth={2.8} /> : <Plus size={13} />}</span>
                    <span className="order-feature-name">{t(feature.nameKey)}</span>
                    <span className="order-feature-price">{included ? (ru ? 'Включено' : 'Included') : `+ ${money(feature.price)}`}</span>
                  </button>;
                })}</div>
              </details>;
            })}
          </div>
          <div className="order-price-inline"><span>{ru ? 'Ориентировочно за разработку' : 'Estimated development'}</span><strong data-testid="order-running-total">{money(total)}</strong></div>
        </section>}

        {step === 3 && template && <section className="order-review" aria-label={ru ? 'Параметры заказа' : 'Order details'}>
          <div className="order-review-hero"><img src={art[template.id]} alt="" /><div><small>{ru ? 'ВАШЕ ПРИЛОЖЕНИЕ' : 'YOUR APP'}</small><h2>{projectName.trim() || t(template.nameKey)}</h2><p>{t(template.nameKey)} · {t(template.developmentTimeKey)}</p></div><button type="button" onClick={() => moveTo(2)} aria-label={ru ? 'Изменить параметры' : 'Edit details'}><ChevronRight size={19} /></button></div>
          <div className="order-summary-card"><div><span>{ru ? 'Основа приложения' : 'App package'}</span><strong>{money(template.estimatedPrice)}</strong></div><div><span>{ru ? 'Дополнительные функции' : 'Additional features'}</span><strong>{extraTotal ? `+ ${money(extraTotal)}` : (ru ? 'Нет' : 'None')}</strong></div><div className="order-summary-total"><span>{ru ? 'Разработка' : 'Development'}<small>{ru ? 'ориентировочная стоимость' : 'estimated cost'}</small></span><strong data-testid="order-final-total">{money(total)}</strong></div></div>
          <div className="order-included"><span>{ru ? 'Включено в основу' : 'Included in the package'}</span><p>{availableFeaturesBase.filter((feature) => includedIds.has(feature.id)).map((feature) => t(feature.nameKey)).join(' · ')}</p>{selectedExtras.length > 0 && <><span>{ru ? 'Дополнительно' : 'Added features'}</span><p>{selectedExtras.map((feature) => t(feature.nameKey)).join(' · ')}</p></>}</div>
          <details className="order-support"><summary><span><strong>{ru ? 'Поддержка после запуска' : 'Support after launch'}</strong><small>{plan ? t(plan.nameKey) : (ru ? 'Можно выбрать позже' : 'You can choose later')}</small></span><ChevronDown size={19} /></summary><div className="order-support-body"><p>{ru ? 'Поддержка оплачивается отдельно от разработки.' : 'Support is billed separately from development.'}</p><div className="order-period" role="group" aria-label={ru ? 'Период оплаты' : 'Billing period'}><button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>{ru ? 'В месяц' : 'Monthly'}</button><button type="button" aria-pressed={annual} onClick={() => setAnnual(true)}>{ru ? 'В год' : 'Yearly'}</button></div><div className="order-plans"><button type="button" className={!planId ? 'is-selected' : ''} aria-pressed={!planId} onClick={() => setPlanId(null)}>{ru ? 'Выбрать позже' : 'Choose later'}<span>{!planId && <Check size={15} />}</span></button>{subscriptionPlansBase.map((item: Plan) => <button key={item.id} type="button" className={planId === item.id ? 'is-selected' : ''} aria-pressed={planId === item.id} onClick={() => setPlanId(item.id)} data-testid={`order-plan-${item.id}`}><span><strong>{t(item.nameKey)}</strong><small>{t(item.descriptionKey)}</small></span><span className="order-plan-price">{money(annual ? yearlyPrices[item.id] : item.price)}<small>{annual ? (ru ? '/ год' : '/ year') : (ru ? '/ мес' : '/ month')}</small></span></button>)}</div></div></details>
        </section>}

        <div className="order-actions"><button type="button" className="order-continue" onClick={continueOrder} data-testid="order-continue"><span>{step === 3 ? (ru ? 'Открыть заявку в Telegram' : 'Open request in Telegram') : (ru ? 'Продолжить' : 'Continue')}</span><ArrowRight size={18} /></button>{step === 3 && <p>{ru ? 'Откроется подготовленное сообщение — проверьте и отправьте его сами.' : 'A draft will open for you to review and send.'}</p>}</div>
      </div>
    </main>
  );
}

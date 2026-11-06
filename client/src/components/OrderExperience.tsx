import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { appTemplatesBase, availableFeaturesBase, subscriptionPlansBase } from './orderCatalog';
import shopArt from '../assets/order/shop-v6.webp';
import restaurantArt from '../assets/order/restaurant-v3.webp';
import fitnessArt from '../assets/order/fitness-v3.webp';
import servicesArt from '../assets/order/services-v7.webp';
import basicArt from '../assets/order/feature-basic-v2.webp';
import paymentsArt from '../assets/order/feature-payments-v2.webp';
import deliveryArt from '../assets/order/feature-delivery-v2.webp';
import messageArt from '../assets/order/feature-communications-v2.webp';
import marketingArt from '../assets/order/feature-marketing-v2.webp';
import managementArt from '../assets/order/feature-management-v2.webp';
import bookingArt from '../assets/order/feature-booking-v2.webp';
import automationArt from '../assets/order/feature-ai-v2.webp';
import integrationsArt from '../assets/order/feature-integrations-v2.webp';
import subscriptionArt from '../assets/order/support-v2.webp';
import { OrderSkeleton } from './OrderSkeleton';
import { OrderInfoSheet } from './OrderInfoSheet';
import { OrderFeaturesStep } from './OrderFeaturesStep';
import { OrderReviewStep } from './OrderReviewStep';
import { OrderDecisionDialog } from './OrderDecisionDialog';
import { useOrderDraft } from './useOrderDraft';
import { featureInfo, supportBenefitDetails, supportBenefitsByPlan, supportInfo, templateInfo } from './orderInfo';
import './OrderExperience.css';

type Template = typeof appTemplatesBase[number];
const art: Record<string, string> = {
  'ecommerce-basic': shopArt,
  restaurant: restaurantArt,
  'fitness-center': fitnessArt,
  services: servicesArt,
};
const featureArt: Record<string, string> = {
  'constructor.basicFeatures': basicArt,
  'constructor.paymentsCategory': paymentsArt,
  'constructor.deliveryCategory': deliveryArt,
  'constructor.communicationsCategory': messageArt,
  'constructor.marketingCategory': marketingArt,
  'constructor.managementCategory': managementArt,
  'constructor.bookingCategory': bookingArt,
  'constructor.aiAutomationCategory': automationArt,
  'constructor.integrationsCategory': integrationsArt,
};
const yearlyPrices: Record<string, number> = { minimal: 99000, standard: 149000, premium: 249000 };
const money = (amount: number) => `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;
const directionDescriptions: Record<string, { ru: string; en: string }> = {
  'ecommerce-basic': { ru: 'Каталог, корзина и оплата', en: 'Catalog, cart and payments' },
  restaurant: { ru: 'Меню, заказы и бронирование', en: 'Menu, orders and bookings' },
  'fitness-center': { ru: 'Запись, абонементы и прогресс', en: 'Bookings, memberships and progress' },
  services: { ru: 'Каталог услуг и онлайн-запись', en: 'Service catalog and bookings' },
};

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
  const [info, setInfo] = useState<{ kind: 'template' | 'feature' | 'plan'; id: string } | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);
  const draft = useOrderDraft({ step, templateId, extras, projectName, planId, annual });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
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
    document.getElementById('root')?.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const applyTemplate = (item: Template) => {
    if (templateId !== item.id) setExtras([]);
    setTemplateId(item.id);
    moveTo(2);
  };
  const chooseTemplate = (item: Template) => {
    if (templateId && templateId !== item.id && selectedExtras.length > 0) {
      setPendingTemplate(item);
      return;
    }
    applyTemplate(item);
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
    if (!artReady || info || pendingTemplate || draft.pendingDraft) return;
    if (step === 1 && !template) {
      setNotice(ru ? 'Выберите направление приложения' : 'Choose an app type');
      return;
    }
    if (step < 3) moveTo(step + 1);
    else openRequest();
  }, [artReady, info, pendingTemplate, draft.pendingDraft, moveTo, openRequest, ru, step, template]);

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
      detail: step === 1 ? '' : step === 3 ? (ru ? 'Обсудить в Telegram' : 'Discuss in Telegram') : (ru ? 'К итогу' : 'Review order'),
    }));
  }, [step, ru]);
  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      const frame = requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
      return () => cancelAnimationFrame(frame);
    }
  }, [step]);

  if (!artReady || !draft.ready) return <OrderSkeleton label={ru ? 'Загрузка страницы заказа' : 'Loading order page'} />;

  const infoTemplate = info?.kind === 'template' ? appTemplatesBase.find((item) => item.id === info.id) : undefined;
  const infoFeature = info?.kind === 'feature' ? availableFeaturesBase.find((item) => item.id === info.id) : undefined;
  const infoPlan = info?.kind === 'plan' ? subscriptionPlansBase.find((item) => item.id === info.id) : undefined;
  const infoCopy = infoTemplate ? templateInfo[infoTemplate.id]?.[ru ? 'ru' : 'en']
    : infoFeature ? featureInfo[infoFeature.id]?.[ru ? 'ru' : 'en']
      : infoPlan ? supportInfo[infoPlan.id]?.[ru ? 'ru' : 'en'] : undefined;
  const infoIncluded = infoFeature ? includedIds.has(infoFeature.id) : false;
  const infoSelected = infoFeature ? extras.includes(infoFeature.id) : false;
  const templateItems = infoTemplate ? availableFeaturesBase.filter((feature) => feature.included || infoTemplate.features.includes(feature.id)).map((feature) => t(feature.nameKey)) : undefined;

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
          <h1 ref={headingRef} tabIndex={-1}>{step === 1 ? (ru ? 'Выберите направление проекта' : 'Choose your project direction') : step === 2 ? (ru ? 'Добавьте нужные функции' : 'Choose your features') : (ru ? 'Всё готово к обсуждению' : 'Ready to discuss your app')}</h1>
          <p>{step === 1 ? (ru ? 'Нажмите на подходящее направление.' : 'Tap the direction that fits your business.') : step === 2 ? (ru ? 'Основное уже включено. Остальное — на ваш выбор.' : 'The essentials are included. Add anything else you need.') : (ru ? 'Проверьте детали — мы подготовим заявку в Telegram.' : 'Check the details and we’ll prepare a Telegram message.')}</p>
        </header>

        {step === 1 && <section className="order-template-list" aria-label={ru ? 'Направление приложения' : 'App type'}>
          {appTemplatesBase.map((item) => <div className="order-template-wrap" key={item.id}>
            <button type="button" className={`order-template ${templateId === item.id ? 'is-selected' : ''}`} aria-pressed={templateId === item.id} onClick={() => chooseTemplate(item)} data-testid={`template-${item.id}`}>
              <span className="order-template-copy"><strong>{t(item.nameKey)}</strong><span>{directionDescriptions[item.id]?.[ru ? 'ru' : 'en'] || t(item.descriptionKey)}</span><small>{ru ? 'от' : 'from'} {money(item.estimatedPrice)}</small></span>
              <img className="order-template-art" src={art[item.id]} alt="" draggable={false} />
              <span className="order-choice" aria-hidden="true">{templateId === item.id && <Check size={12} strokeWidth={3} />}</span>
            </button>
            <button className="order-template-info" type="button" onClick={() => setInfo({ kind: 'template', id: item.id })} aria-label={`${ru ? 'Подробнее' : 'Details'}: ${t(item.nameKey)}`} data-testid={`template-info-${item.id}`}><span>{ru ? 'Подробнее' : 'Details'}</span><ChevronRight size={13} /></button>
          </div>)}
          {notice && <p className="order-notice" role="alert">{notice}</p>}
        </section>}

        {step === 2 && template && <OrderFeaturesStep ru={ru} t={t} template={template} artSrc={art[template.id]} projectName={projectName} onProjectNameChange={setProjectName} includedIds={includedIds} extras={extras} onToggleFeature={toggleFeature} onFeatureInfo={(id) => setInfo({ kind: 'feature', id })} onChangeTemplate={() => moveTo(1)} total={total} />}

        {step === 3 && template && <OrderReviewStep ru={ru} t={t} template={template} artSrc={art[template.id]} projectName={projectName} includedIds={includedIds} selectedExtras={selectedExtras} extraTotal={extraTotal} total={total} planId={planId} annual={annual} yearlyPrices={yearlyPrices} onEdit={() => moveTo(2)} onPlan={setPlanId} onAnnual={setAnnual} onPlanInfo={(id) => setInfo({ kind: 'plan', id })} />}

        {!draft.storageAvailable && <p className="order-notice" role="status">{ru ? 'Черновик нельзя сохранить на этом устройстве. Заказ можно продолжить.' : 'This device cannot save the draft. You can still continue.'}</p>}
        {step === 2 && <div className="order-sticky-bar"><div className="order-sticky-copy"><small>{ru ? 'Разработка, ориентировочно' : 'Estimated development'}</small><strong aria-live="polite">{money(total)}</strong></div><button type="button" className="order-sticky-action" onClick={continueOrder} data-testid="order-continue">{ru ? 'К итогу' : 'Review'} <ArrowRight size={17} /></button></div>}
        {step === 3 && <div className="order-actions"><button type="button" className="order-continue" onClick={continueOrder} data-testid="order-continue"><span>{ru ? 'Обсудить в Telegram' : 'Discuss in Telegram'}</span><ArrowRight size={18} /></button><p>{ru ? 'Откроется подготовленное сообщение — проверьте и отправьте его сами.' : 'A draft will open for you to review and send.'}</p></div>}
      </div>
      {info && infoCopy && (infoTemplate || infoFeature || infoPlan) && <OrderInfoSheet
        ru={ru} kind={info.kind} title={t((infoTemplate || infoFeature || infoPlan)!.nameKey)}
        description={infoCopy.description} example={infoCopy.example} note={infoTemplate ? (ru ? `Ориентировочный срок: ${t(infoTemplate.developmentTimeKey)}. Подробности обсудим индивидуально.` : `Estimated timeline: ${t(infoTemplate.developmentTimeKey)}. We will discuss the details with you.`) : infoCopy.note}
        image={infoTemplate ? art[infoTemplate.id] : infoFeature ? featureArt[infoFeature.categoryKey] : subscriptionArt}
        items={infoTemplate ? templateItems?.map((title) => ({ title })) : infoPlan ? supportBenefitsByPlan[infoPlan.id].map((key) => ({ title: t(`constructor.subscriptionFeatures.${key}`), description: supportBenefitDetails[key][ru ? 'ru' : 'en'] })) : undefined}
        billing={infoPlan ? { annual, monthlyPrice: money(infoPlan.price), annualPrice: money(yearlyPrices[infoPlan.id]), savings: money(infoPlan.price * 12 - yearlyPrices[infoPlan.id]), onChange: setAnnual } : undefined}
        priceLabel={infoTemplate ? (ru ? 'Разработка, ориентировочно' : 'Estimated development') : infoFeature ? (ru ? 'Стоимость разработки' : 'Development cost') : (ru ? 'Поддержка, отдельно' : 'Support, billed separately')}
        price={infoTemplate ? `${ru ? 'от' : 'from'} ${money(infoTemplate.estimatedPrice)}` : infoFeature ? (infoIncluded ? (ru ? 'Включено' : 'Included') : `+ ${money(infoFeature.price)}`) : infoPlan ? `${money(annual ? yearlyPrices[infoPlan.id] : infoPlan.price)}${annual ? (ru ? '/год' : '/year') : (ru ? '/мес' : '/month')}` : ''}
        action={infoTemplate ? (templateId === infoTemplate.id ? (ru ? 'Выбрано' : 'Selected') : (ru ? 'Выбрать направление' : 'Choose this type')) : infoFeature ? (infoIncluded ? (ru ? 'Понятно' : 'Got it') : infoSelected ? (ru ? 'Убрать из заказа' : 'Remove from order') : (ru ? 'Добавить в заказ' : 'Add to order')) : infoPlan && planId === infoPlan.id ? (ru ? 'Выбрано' : 'Selected') : (ru ? 'Выбрать поддержку' : 'Choose support')}
        onClose={() => setInfo(null)}
        onAction={() => { if (infoTemplate) chooseTemplate(infoTemplate); if (infoFeature && !infoIncluded) toggleFeature(infoFeature.id); if (infoPlan) setPlanId(infoPlan.id); setInfo(null); }}
      />}
      {draft.pendingDraft && <OrderDecisionDialog testId="order-draft-dialog" title={ru ? 'Продолжить заказ?' : 'Continue your order?'} description={ru ? 'На этом устройстве сохранён черновик. Он хранится здесь до 30 дней и не отправляется автоматически.' : 'A draft is saved on this device for up to 30 days. It is not sent automatically.'} primary={ru ? 'Восстановить' : 'Restore'} secondary={ru ? 'Начать заново' : 'Start over'} onPrimary={() => draft.restoreDraft((saved) => { setTemplateId(saved.templateId); setExtras(saved.extras); setProjectName(saved.projectName); setPlanId(saved.planId); setAnnual(saved.annual); moveTo(saved.step); })} onSecondary={() => draft.startNew(() => { setTemplateId(null); setExtras([]); setProjectName(''); setPlanId(null); setAnnual(false); moveTo(1); })} />}
      {pendingTemplate && !draft.pendingDraft && <OrderDecisionDialog testId="order-switch-dialog" title={ru ? 'Сменить направление?' : 'Change direction?'} description={ru ? 'Дополнительные функции будут сброшены. Название и выбранная поддержка сохранятся.' : 'Additional features will be reset. Your project name and selected support will stay.'} primary={ru ? 'Сменить направление' : 'Change direction'} secondary={ru ? 'Оставить прежнее' : 'Keep current'} onPrimary={() => { const next = pendingTemplate; setPendingTemplate(null); applyTemplate(next); }} onSecondary={() => setPendingTemplate(null)} onCancel={() => setPendingTemplate(null)} />}
    </main>
  );
}

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { OrderContractExperience } from './OrderContractExperience';
import type { Customer } from './OrderContractPanel';
import { ContractQuestionnaire } from './ContractQuestionnaire';
import { readOrderContractSelection, type OrderContractSelection } from './orderContractSelection';
import { readContractDraft, saveContractDraft } from './contractDraftStorage';
import { getSupportPackagePreview } from './orderContractData';
import './ContractPage.css';

type Props = { onBack: () => void; onNavigate: (section: string) => void };
const blank: OrderContractSelection = { direction: '', projectName: '', includedFeatures: [], extraFeatures: [], estimatedTotal: null, support: null };
const money = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);

export default function ContractPage({ onBack }: Props) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [customer, setCustomer] = useState<Customer>({ name: '', inn: '', address: '', email: '' });
  const [selection, setSelection] = useState<OrderContractSelection>(blank);
  const [step, setStep] = useState(0);
  const savedSelection = useMemo(() => {
    try { return readOrderContractSelection(window.localStorage, Date.now()); } catch { return null; }
  }, []);
  const restoredSelection = useMemo(() => {
    try { return readContractDraft(window.localStorage); } catch { return null; }
  }, []);
  const hasPrivateDetails = !!selection.projectName.trim() || Object.values(customer).some(value => value.trim());
  useEffect(() => {
    if (!hasPrivateDetails) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const beforeNavigate = (event: Event) => {
      if (!window.confirm(ru ? 'Название проекта и реквизиты не сохраняются и будут потеряны при выходе. Выйти?' : 'The project name and customer details are not saved and will be lost. Leave?')) event.preventDefault();
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('web4tg:before-navigate', beforeNavigate);
    return () => { window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener('web4tg:before-navigate', beforeNavigate); };
  }, [hasPrivateDetails, ru]);
  const updateSelection = (value: OrderContractSelection | null) => {
    setSelection(value ?? blank);
    if (value?.direction) {
      try { saveContractDraft(window.localStorage, value); } catch { /* unavailable storage */ }
    }
  };
  const navigateStep = (next: number) => {
    setStep(next);
    document.querySelector('.contract-header')?.scrollIntoView({ block: 'start' });
  };
  const openDiscussion = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    try {
      if (typeof window.Telegram?.WebApp?.openTelegramLink === 'function') {
        window.Telegram.WebApp.openTelegramLink('https://t.me/web4tgs');
        event.preventDefault();
      }
    } catch { /* The regular link remains available when the native API fails. */ }
  };
  const steps = ru ? ['Проект', 'Возможности', 'Реквизиты', 'Проверка'] : ['Project', 'Features', 'Details', 'Review'];
  const previousStep = step === 2 && !selection.direction ? 0 : step - 1;
  const supportItems = selection.support ? getSupportPackagePreview(selection.support) : [];
  const amount = selection.estimatedTotal;
  return <main className="contract-page" data-testid="contract-page">
    <div className="contract-page-inner">
      <button className="contract-back" type="button" onClick={step ? () => navigateStep(previousStep) : onBack} data-testid="contract-back"><ArrowLeft size={19} aria-hidden="true"/><span>{ru ? 'Назад' : 'Back'}</span></button>
      <header className="contract-header"><span>{ru ? 'ДОГОВОР WEB4TG' : 'WEB4TG AGREEMENT'}</span><h1>{ru ? 'Оформление договора' : 'Prepare an agreement'}</h1><p>{ru ? 'Выберите параметры проекта и заполните короткую анкету — они появятся в проекте договора.' : 'Choose project options and complete a short form to prepare your draft agreement.'}</p></header>
      <nav className="contract-progress" aria-label={ru ? 'Этапы оформления' : 'Agreement steps'}>
        <div className="contract-progress-caption"><strong>{steps[step]}</strong><span>{ru ? 'Шаг' : 'Step'} {step + 1} / 4</span></div>
        <ol>{steps.map((label, index) => <li key={label} aria-current={index === step ? 'step' : undefined} className={index <= step ? 'is-active' : ''}><span className="contract-progress-bar"/><span className="contract-progress-label">{label}</span></li>)}</ol>
      </nav>
      <ContractQuestionnaire ru={ru} initialSelection={savedSelection} restoredSelection={restoredSelection} onSelectionChange={updateSelection} step={step === 0 ? 'project' : step === 1 ? 'features' : 'hidden'}/>
      <p className="contract-draft-info">{ru ? 'Выбор направления, функций и поддержки можно восстановить на этом устройстве в течение 30 дней. Название проекта и реквизиты не сохраняются.' : 'Your project type, features and support choices can be restored on this device for 30 days. Project name and customer details are not saved.'}</p>
      {step === 3 && <div className="contract-review" data-testid="contract-review">
        <div className="contract-review-heading"><span>{ru ? 'ВАШ ПРОЕКТ' : 'YOUR PROJECT'}</span><h2>{selection.projectName || selection.direction || (ru ? 'Общий проект договора' : 'General draft agreement')}</h2>{(selection.projectName || !selection.direction) && <p>{selection.direction || (ru ? 'Направление не выбрано' : 'No project type selected')}</p>}</div>
        <div className="contract-summary">
          <div><span>{ru ? 'Разработка · предварительно' : 'Development · estimate'}</span><strong>{amount === null ? (ru ? 'По согласованию' : 'To be agreed') : money(amount)}</strong></div>
          <div><span>{ru ? 'Аванс 50%' : '50% advance'}</span><strong>{amount === null ? (ru ? 'По согласованию' : 'To be agreed') : money(amount / 2)}</strong></div>
          <div><span>{ru ? 'После приёмки 50%' : '50% after acceptance'}</span><strong>{amount === null ? (ru ? 'По согласованию' : 'To be agreed') : money(amount / 2)}</strong></div>
          <div><span>{ru ? 'Поддержка отдельно' : 'Support separately'}</span><strong>{selection.support ? `${selection.support.name} · ${money(selection.support.price)} / ${selection.support.period === 'year' ? (ru ? 'год' : 'year') : (ru ? 'мес.' : 'month')}` : (ru ? 'Не выбрана' : 'Not selected')}</strong></div>
        </div>
        <p className="contract-review-note">{ru ? 'Расчёт предварительный: окончательные стоимость, состав и сроки подтверждаются сторонами отдельно.' : 'This estimate is preliminary. Final scope, price and timeline are agreed separately.'}</p>
        {selection.includedFeatures.length > 0 && <details className="contract-included"><summary>{ru ? 'Возможности в основе' : 'Included features'} · {selection.includedFeatures.length}</summary><ul>{selection.includedFeatures.map(item => <li key={item}>{item}</li>)}</ul></details>}
        {selection.extraFeatures.length > 0 && <div className="contract-review-list"><h3>{ru ? 'Выбранные возможности' : 'Selected features'}</h3><ul>{selection.extraFeatures.map(item => <li key={item.name}>{item.name} · {money(item.price)}</li>)}</ul></div>}
        {selection.support && <div className="contract-review-list"><h3>{ru ? 'Состав поддержки' : 'Support package'}</h3>{supportItems.length > 0 && <ul>{supportItems.map(item => <li key={item}>{item}</li>)}</ul>}<p>{ru ? 'Предварительный выбор. Рабочее время, сроки ответа и решения, резервные копии и ограничения согласуются отдельно. Ежемесячная поддержка — 100% предоплата за месяц.' : 'Preliminary choice. Working hours, response and resolution times, backups and limits must be agreed. Monthly support is prepaid in full.'}</p></div>}
        <div className="contract-review-list"><h3>{ru ? 'Основные условия' : 'Key terms'}</h3><ul>{ru ? <><li>Разработка: 50% аванс и 50% после приёмки.</li><li>Техническое задание, критерии приёмки и сроки согласуются в приложениях.</li><li>Гарантия, передача прав и расходы на сторонние сервисы требуют согласования.</li></> : <><li>Development: 50% in advance and 50% after acceptance.</li><li>Specification, acceptance criteria and deadlines are agreed in the annexes.</li><li>Warranty, rights and third-party costs must be agreed.</li></>}</ul></div>
        <div className="contract-readiness"><strong>{ru ? 'Проект для согласования' : 'Draft for agreement'}</strong><ul>
          <li>{selection.direction ? (ru ? 'Направление проекта выбрано.' : 'Project type selected.') : (ru ? 'Направление проекта ещё не выбрано.' : 'Project type not yet selected.')}</li>
          <li>{customer.name.trim() ? (ru ? 'Имя или название заказчика указано.' : 'Customer name entered.') : (ru ? 'Имя или название заказчика не заполнено.' : 'Customer name not entered.')}</li>
          <li>{customer.address.trim() ? (ru ? 'Адрес заказчика указан.' : 'Customer address entered.') : (ru ? 'Адрес заказчика не заполнен.' : 'Customer address not entered.')}</li>
          <li>{ru ? 'Реквизиты исполнителя и банковские данные требуют уточнения.' : 'Executor and bank details need to be completed.'}</li>
          <li>{ru ? 'ТЗ, конечная цена и сроки, приёмка, гарантии и права требуют согласования.' : 'Specification, final price, deadlines, acceptance, warranty and rights need agreement.'}</li>
          <li>{ru ? 'Электронное подписание пока не подключено.' : 'Electronic signing is not yet connected.'}</li>
        </ul></div>
      </div>}
      {step >= 2 && <OrderContractExperience ru={ru} selection={selection} customer={customer} onCustomerChange={setCustomer} mode={step === 2 ? 'customer' : 'review'}/>}
      {step === 3 && <section className="contract-signing" aria-labelledby="contract-signing-title"><ShieldCheck size={20} aria-hidden="true"/><div><h2 id="contract-signing-title">{ru ? 'Подписание через ЭДО' : 'Electronic signing'}</h2><p>{ru ? 'Сервис пока не подключён. После согласования документ можно будет подписать через выбранный сервис ЭДО. Скачивание проекта не является подписью.' : 'A service has not yet been connected. Downloading the draft does not sign it.'}</p><a href="https://t.me/web4tgs" target="_blank" rel="noopener noreferrer" onClick={openDiscussion} data-testid="contract-discuss">{ru ? 'Обсудить договор' : 'Discuss the agreement'}<ArrowUpRight size={15} aria-hidden="true"/></a><p>{ru ? 'Файл можно прикрепить к сообщению вручную.' : 'You can attach the file to your message yourself.'}</p></div></section>}
      <div className="contract-actions">
        {step < 3 && <button className="contract-next" type="button" disabled={step === 0 && !selection.direction} onClick={() => navigateStep(step + 1)} data-testid="contract-next"><span>{step === 2 ? (ru ? 'Проверить договор' : 'Review agreement') : (ru ? 'Продолжить' : 'Continue')}</span><ArrowRight size={18} aria-hidden="true"/></button>}
        {step > 0 && <button className="contract-previous" type="button" onClick={() => navigateStep(previousStep)} data-testid="contract-previous"><ArrowLeft size={16} aria-hidden="true"/>{ru ? 'Вернуться к предыдущему шагу' : 'Return to previous step'}</button>}
        {step === 0 && !selection.direction && <button className="contract-general" type="button" onClick={() => navigateStep(2)}>{ru ? 'Посмотреть общий договор без выбора проекта' : 'Review a general agreement without choosing a project'}</button>}
      </div>
    </div>
  </main>;
}

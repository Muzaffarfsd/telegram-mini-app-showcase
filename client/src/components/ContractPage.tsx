import { useMemo, useState, type MouseEvent } from 'react';
import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { OrderContractExperience } from './OrderContractExperience';
import type { Customer } from './OrderContractPanel';
import { ContractQuestionnaire } from './ContractQuestionnaire';
import { readOrderContractSelection, type OrderContractSelection } from './orderContractSelection';
import './ContractPage.css';

type Props = { onBack: () => void; onNavigate: (section: string) => void };
const blank: OrderContractSelection = { direction: '', projectName: '', includedFeatures: [], extraFeatures: [], estimatedTotal: null, support: null };

/** A separate entry point is available even when no project has been selected. */
export default function ContractPage({ onBack }: Props) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [customer, setCustomer] = useState<Customer>({ name: '', inn: '', address: '', email: '' });
  const [selection, setSelection] = useState<OrderContractSelection>(blank);
  const savedSelection = useMemo(() => {
    try { return readOrderContractSelection(window.localStorage, Date.now()); } catch { return null; }
  }, []);
  const openDiscussion = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    try {
      if (typeof window.Telegram?.WebApp?.openTelegramLink === 'function') {
        window.Telegram.WebApp.openTelegramLink('https://t.me/web4tgs');
        event.preventDefault();
      }
    } catch { /* The regular link remains available when the native API fails. */ }
  };
  return <main className="contract-page" data-testid="contract-page">
    <div className="contract-page-inner">
      <button className="contract-back" type="button" onClick={onBack} data-testid="contract-back"><ArrowLeft size={19} aria-hidden="true"/><span>{ru ? 'Назад' : 'Back'}</span></button>
      <header className="contract-header"><span>{ru ? 'ДОГОВОР WEB4TG' : 'WEB4TG AGREEMENT'}</span><h1>{ru ? 'Оформление договора' : 'Prepare an agreement'}</h1><p>{ru ? 'Выберите параметры проекта и заполните короткую анкету — они появятся в проекте договора.' : 'Choose project options and complete a short form to prepare your draft agreement.'}</p></header>
      <ContractQuestionnaire ru={ru} initialSelection={savedSelection} onSelectionChange={value => setSelection(value ?? blank)}/>
      <section className="contract-signing" aria-labelledby="contract-signing-title"><ShieldCheck size={20} aria-hidden="true"/><div><h2 id="contract-signing-title">{ru ? 'Подписание через ЭДО' : 'Electronic signing'}</h2><p>{ru ? 'После согласования документ можно подписать через сервис электронного документооборота. Сервис пока не подключён: скачивание проекта не является подписью.' : 'After the terms are agreed, the document can be signed using an electronic document service. The service is not connected yet; downloading the draft does not sign it.'}</p><a href="https://t.me/web4tgs" target="_blank" rel="noopener noreferrer" onClick={openDiscussion} data-testid="contract-discuss">{ru ? 'Обсудить договор' : 'Discuss the agreement'}<ArrowUpRight size={15} aria-hidden="true"/></a><p>{ru ? 'Файл можно прикрепить к сообщению вручную.' : 'You can attach the file to your message yourself.'}</p></div></section>
      <OrderContractExperience ru={ru} selection={selection} customer={customer} onCustomerChange={setCustomer} />
    </div>
  </main>;
}

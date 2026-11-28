import { useId, useState, type ReactNode } from 'react';
import { ArrowDownToLine, ChevronDown, Copy, FileText } from 'lucide-react';
import './OrderContractPanel.css';

/** Details are intentionally held in component state by the order flow, not in its saved draft. */
export type Customer = { name: string; inn: string; address: string; email: string };

type Props = {
  ru: boolean;
  customer: Customer;
  onCustomerChange: (customer: Customer) => void;
  preview: ReactNode;
  onDownload: () => void;
  onCopyText: () => void;
  onOpenChange?: (open: boolean) => void;
  busy?: boolean;
  copyDisabled?: boolean;
  downloadLabel?: string;
  statusMessage?: string;
};

/** The complete document expands in the page's native scroll area; no nested scroll or overlay. */
export function OrderContractPanel({ ru, customer, onCustomerChange, preview, onDownload, onCopyText, onOpenChange, busy = false, copyDisabled = false, downloadLabel, statusMessage }: Props) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const update = (key: keyof Customer, value: string) => onCustomerChange({ ...customer, [key]: value });

  return <section className="order-contract" aria-labelledby={`${formId}-heading`} data-testid="order-contract">
    <div className="order-contract-heading">
      <span className="order-contract-icon" aria-hidden="true"><FileText size={19} strokeWidth={1.7}/></span>
      <div><span className="order-contract-kicker">{ru ? 'ДОКУМЕНТЫ' : 'DOCUMENTS'}</span><h2 id={`${formId}-heading`}>{ru ? 'Проект договора' : 'Draft agreement'}</h2></div>
    </div>
    <p className="order-contract-intro">{ru
      ? 'Ознакомьтесь с условиями и получите проект договора с выбранными параметрами приложения.'
      : 'Review the terms and get a draft agreement with your selected app configuration.'}</p>
    <p className="order-contract-note">{ru
      ? 'Это проект для согласования. Итоговые стоимость, сроки и условия подтверждаются отдельно.'
      : 'This is a draft for review. Final price, timing and terms are agreed separately. The agreement text is in Russian.'}</p>

    <details className="order-contract-details" onToggle={event => { const next = event.currentTarget.open; setOpen(next); onOpenChange?.(next); }}>
      <summary data-testid="order-contract-open"><span>{ru ? 'Посмотреть и заполнить' : 'Review and fill in'}</span><ChevronDown size={18} aria-hidden="true"/></summary>
      {open && <div className="order-contract-body">
        <div className="order-contract-fields-intro"><h3>{ru ? 'Реквизиты заказчика' : 'Customer details'}</h3><p>{ru ? 'Необязательно: пустые поля останутся в документе для заполнения.' : 'Optional: blank fields remain in the document to be completed later.'}</p></div>
        <div className="order-contract-fields">
          <label htmlFor={`${formId}-name`}>{ru ? 'Название организации или ФИО' : 'Organisation or full name'}<input id={`${formId}-name`} data-testid="order-contract-name" value={customer.name} maxLength={160} onChange={event => update('name', event.target.value)} autoComplete="organization" placeholder={ru ? 'Например, ООО «Название»' : 'For example, company name'}/></label>
          <label htmlFor={`${formId}-tax`}>{ru ? 'ИНН' : 'Tax ID'}<input id={`${formId}-tax`} data-testid="order-contract-tax" value={customer.inn} maxLength={24} onChange={event => update('inn', event.target.value)} inputMode="numeric" autoComplete="off" placeholder={ru ? 'Если применимо' : 'If applicable'}/></label>
          <label htmlFor={`${formId}-address`}>{ru ? 'Адрес' : 'Address'}<input id={`${formId}-address`} data-testid="order-contract-address" value={customer.address} maxLength={240} onChange={event => update('address', event.target.value)} autoComplete="street-address" placeholder={ru ? 'Юридический или почтовый' : 'Legal or mailing address'}/></label>
          <label htmlFor={`${formId}-email`}>E-mail<input id={`${formId}-email`} data-testid="order-contract-email" value={customer.email} maxLength={120} onChange={event => update('email', event.target.value)} type="email" autoComplete="email" placeholder="name@example.com"/></label>
        </div>
        <p className="order-contract-privacy">{ru ? 'Эти данные остаются на устройстве и не сохраняются в черновике заказа.' : 'These details stay on this device and are not saved in the order draft.'}</p>
        <button className="order-contract-download" type="button" data-testid="order-contract-download" onClick={onDownload} disabled={busy}>
          <span>{busy ? (ru ? 'Подготавливаем…' : 'Preparing…') : (downloadLabel || (ru ? 'Скачать проект договора' : 'Download draft agreement'))}</span><ArrowDownToLine size={18} aria-hidden="true"/>
        </button>
        <button className="order-contract-copy" type="button" data-testid="order-contract-copy" onClick={onCopyText} disabled={copyDisabled}><span>{ru ? 'Копировать текст' : 'Copy text'}</span><Copy size={16} aria-hidden="true"/></button>
        {statusMessage && <p className="order-contract-status" role="status">{statusMessage}</p>}
        <p className="order-contract-after">{ru ? 'Скачивание и ознакомление не означают подписание договора.' : 'Reviewing or downloading does not sign the agreement.'}</p>
        <h3 className="order-contract-text-heading">{ru ? 'Полный текст договора' : 'Full agreement text'}</h3>
        <div className="order-contract-document" data-testid="order-contract-preview" aria-label={ru ? 'Текст проекта договора' : 'Draft agreement text'}>
          {preview}
        </div>
      </div>}
    </details>
  </section>;
}

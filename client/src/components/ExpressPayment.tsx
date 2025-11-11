import { Apple, CreditCard, Smartphone } from 'lucide-react';
import { SiGooglepay } from 'react-icons/si';
import { cn } from '@/lib/utils';

interface ExpressPaymentButtonProps {
  provider: 'apple' | 'google' | 'sbp' | 'card';
  amount?: number;
  currency?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function ExpressPaymentButton({
  provider,
  amount,
  currency = '₽',
  onClick,
  disabled = false,
  className = ''
}: ExpressPaymentButtonProps) {
  const getButtonConfig = () => {
    switch (provider) {
      case 'apple':
        return {
          icon: Apple,
          label: 'Apple Pay',
          bgClass: 'bg-black hover:bg-gray-900',
          textClass: 'text-white',
        };
      case 'google':
        return {
          icon: SiGooglepay,
          label: 'Google Pay',
          bgClass: 'bg-white hover:bg-gray-100',
          textClass: 'text-gray-900',
        };
      case 'sbp':
        return {
          icon: Smartphone,
          label: 'СБП',
          bgClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
          textClass: 'text-white',
        };
      case 'card':
        return {
          icon: CreditCard,
          label: 'Банковская карта',
          bgClass: 'bg-emerald-600 hover:bg-emerald-700',
          textClass: 'text-white',
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        config.bgClass,
        config.textClass,
        className
      )}
      data-testid={`button-pay-${provider}`}
    >
      <Icon className="w-6 h-6" />
      <span className="flex items-center gap-2">
        {config.label}
        {amount && (
          <span className="font-bold">
            {amount.toLocaleString('ru-RU')} {currency}
          </span>
        )}
      </span>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </button>
  );
}

interface ExpressPaymentGroupProps {
  amount: number;
  currency?: string;
  onApplePay?: () => void;
  onGooglePay?: () => void;
  onSBP?: () => void;
  onCard?: () => void;
  showApplePay?: boolean;
  showGooglePay?: boolean;
  showSBP?: boolean;
  showCard?: boolean;
  className?: string;
}

export function ExpressPaymentGroup({
  amount,
  currency = '₽',
  onApplePay,
  onGooglePay,
  onSBP,
  onCard,
  showApplePay = true,
  showGooglePay = true,
  showSBP = true,
  showCard = true,
  className = ''
}: ExpressPaymentGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-1">
          Быстрая оплата
        </h3>
        <p className="text-sm text-white/60">
          Выберите удобный способ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {showApplePay && onApplePay && (
          <ExpressPaymentButton
            provider="apple"
            amount={amount}
            currency={currency}
            onClick={onApplePay}
          />
        )}
        
        {showGooglePay && onGooglePay && (
          <ExpressPaymentButton
            provider="google"
            amount={amount}
            currency={currency}
            onClick={onGooglePay}
          />
        )}
      </div>

      {showSBP && onSBP && (
        <ExpressPaymentButton
          provider="sbp"
          amount={amount}
          currency={currency}
          onClick={onSBP}
        />
      )}

      {showCard && onCard && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-white/40">или</span>
            </div>
          </div>

          <ExpressPaymentButton
            provider="card"
            amount={amount}
            currency={currency}
            onClick={onCard}
          />
        </>
      )}
    </div>
  );
}

interface PaymentMethodSelectorProps {
  selectedMethod: 'apple' | 'google' | 'sbp' | 'card' | null;
  onSelect: (method: 'apple' | 'google' | 'sbp' | 'card') => void;
  className?: string;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  className = ''
}: PaymentMethodSelectorProps) {
  const methods: Array<{ id: 'apple' | 'google' | 'sbp' | 'card'; icon: any; label: string }> = [
    { id: 'apple', icon: Apple, label: 'Apple Pay' },
    { id: 'google', icon: SiGooglepay, label: 'Google Pay' },
    { id: 'sbp', icon: Smartphone, label: 'СБП' },
    { id: 'card', icon: CreditCard, label: 'Карта' },
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {methods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;

        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover-elevate active-elevate-2',
              isSelected
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-white/10 bg-white/5'
            )}
            data-testid={`select-payment-${method.id}`}
          >
            <Icon className={cn(
              'w-8 h-8 transition-colors',
              isSelected ? 'text-emerald-400' : 'text-white/60'
            )} />
            <span className={cn(
              'text-sm font-medium transition-colors',
              isSelected ? 'text-white' : 'text-white/60'
            )}>
              {method.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

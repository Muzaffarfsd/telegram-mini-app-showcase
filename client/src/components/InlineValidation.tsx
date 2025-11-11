import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid' | 'warning';

interface InlineValidationProps {
  status: ValidationStatus;
  message?: string;
  className?: string;
}

export function InlineValidation({ status, message, className = '' }: InlineValidationProps) {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'validating':
        return {
          icon: null,
          color: 'text-white/40',
          bgColor: 'bg-white/5',
          message: message || 'Проверка...',
          animation: 'animate-pulse',
        };
      case 'valid':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          message: message || 'Проверено',
          animation: 'animate-fade-in-up',
        };
      case 'invalid':
        return {
          icon: XCircle,
          color: 'text-rose-400',
          bgColor: 'bg-rose-500/10',
          message: message || 'Ошибка валидации',
          animation: 'animate-shake',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          message: message || 'Предупреждение',
          animation: 'animate-wiggle',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
        config.bgColor,
        config.color,
        config.animation,
        className
      )}
      data-testid={`validation-${status}`}
    >
      {status === 'validating' ? (
        <div className="spinner w-4 h-4" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      <span>{config.message}</span>
    </div>
  );
}

interface ValidationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationStatus?: ValidationStatus;
  validationMessage?: string;
  label?: string;
  hint?: string;
}

export function ValidationInput({
  validationStatus = 'idle',
  validationMessage,
  label,
  hint,
  className = '',
  ...props
}: ValidationInputProps) {
  const getBorderColor = () => {
    switch (validationStatus) {
      case 'valid':
        return 'border-emerald-500/50 focus:border-emerald-500';
      case 'invalid':
        return 'border-rose-500/50 focus:border-rose-500';
      case 'warning':
        return 'border-amber-500/50 focus:border-amber-500';
      default:
        return 'border-white/20 focus:border-emerald-500';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
            getBorderColor(),
            validationStatus === 'invalid' && 'animate-shake',
            className
          )}
          data-testid="input-validation"
          {...props}
        />

        {validationStatus === 'valid' && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-scale-in" />
        )}
        {validationStatus === 'invalid' && (
          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400 animate-shake" />
        )}
        {validationStatus === 'warning' && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 animate-wiggle" />
        )}
      </div>

      {hint && validationStatus === 'idle' && (
        <p className="text-xs text-white/50">
          {hint}
        </p>
      )}

      {validationMessage && validationStatus !== 'idle' && (
        <InlineValidation
          status={validationStatus}
          message={validationMessage}
        />
      )}
    </div>
  );
}

interface ValidationTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  validationStatus?: ValidationStatus;
  validationMessage?: string;
  label?: string;
  hint?: string;
}

export function ValidationTextarea({
  validationStatus = 'idle',
  validationMessage,
  label,
  hint,
  className = '',
  ...props
}: ValidationTextareaProps) {
  const getBorderColor = () => {
    switch (validationStatus) {
      case 'valid':
        return 'border-emerald-500/50 focus:border-emerald-500';
      case 'invalid':
        return 'border-rose-500/50 focus:border-rose-500';
      case 'warning':
        return 'border-amber-500/50 focus:border-amber-500';
      default:
        return 'border-white/20 focus:border-emerald-500';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none',
            getBorderColor(),
            validationStatus === 'invalid' && 'animate-shake',
            className
          )}
          data-testid="textarea-validation"
          {...props}
        />
      </div>

      {hint && validationStatus === 'idle' && (
        <p className="text-xs text-white/50">
          {hint}
        </p>
      )}

      {validationMessage && validationStatus !== 'idle' && (
        <InlineValidation
          status={validationStatus}
          message={validationMessage}
        />
      )}
    </div>
  );
}

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter
} from "./drawer";
import { HapticButton } from "./haptic-button";
import { useHaptic } from "@/hooks/useHaptic";

/**
 * ModernDrawer - Современная Bottom Sheet навигация (стандарт UX 2025)
 * 
 * Особенности:
 * - Выезжающая шторка снизу вверх
 * - Backdrop с blur эффектом
 * - Drag-to-close жест
 * - Адаптивная высота (30%, 50%, 75%, full)
 * - Haptic feedback при открытии
 * - Безопасные отступы для Telegram
 * 
 * Пример использования:
 * ```tsx
 * <ModernDrawer 
 *   trigger={<button>Открыть</button>}
 *   height="50%"
 *   title="Заголовок"
 * >
 *   <p>Контент...</p>
 * </ModernDrawer>
 * ```
 */

interface ModernDrawerProps {
  trigger: ReactNode;
  children: ReactNode;
  height?: "auto" | "30%" | "50%" | "75%" | "full";
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ModernDrawer = ({ 
  trigger, 
  children, 
  height = "50%",
  title,
  description,
  showCloseButton = false,
  open,
  onOpenChange
}: ModernDrawerProps) => {
  const haptic = useHaptic();

  const heightClasses = {
    "auto": "h-auto max-h-[80vh]",
    "30%": "h-[30vh]",
    "50%": "h-[50vh]",
    "75%": "h-[75vh]",
    "full": "h-[90vh]"
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      haptic.light(); // Вибрация при открытии
    }
    onOpenChange?.(isOpen);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      
      <DrawerContent className={cn(
        "bg-background border-t border-white/10",
        "focus-visible:outline-none",
        heightClasses[height]
      )}>
        <div className="overflow-y-auto flex-1">
          {/* Header */}
          {(title || showCloseButton) && (
            <DrawerHeader className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {title && (
                  <DrawerTitle className="text-xl font-bold text-white text-left">
                    {title}
                  </DrawerTitle>
                )}
                {description && (
                  <DrawerDescription className="text-sm text-white/60 text-left mt-1">
                    {description}
                  </DrawerDescription>
                )}
              </div>
              
              {showCloseButton && (
                <DrawerClose asChild>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors -mt-1">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </DrawerClose>
              )}
            </DrawerHeader>
          )}
          
          {/* Content */}
          <div className="px-4 pb-4">
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * ConfirmDrawer - Drawer для подтверждения действий (вместо window.confirm)
 * 
 * Пример:
 * ```tsx
 * <ConfirmDrawer
 *   trigger={<button>Удалить</button>}
 *   title="Удалить товар?"
 *   description="Это действие нельзя отменить"
 *   variant="destructive"
 *   onConfirm={() => deleteItem()}
 * />
 * ```
 * 
 * Controlled mode:
 * ```tsx
 * <ConfirmDrawer
 *   open={showSuccess}
 *   onOpenChange={setShowSuccess}
 *   trigger={<span />}
 *   title="Успешно!"
 *   icon={<Check className="w-8 h-8 text-green-400" />}
 *   onConfirm={() => setShowSuccess(false)}
 * />
 * ```
 */
interface ConfirmDrawerProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: ReactNode;
}

export const ConfirmDrawer = ({
  trigger,
  title,
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  variant = "default",
  onConfirm,
  onCancel,
  open,
  onOpenChange,
  icon
}: ConfirmDrawerProps) => {
  const haptic = useHaptic();

  const handleConfirm = () => {
    if (variant === "destructive") {
      haptic.heavy();
    } else {
      haptic.medium();
    }
    onConfirm();
  };

  const handleCancel = () => {
    haptic.light();
    onCancel?.();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      
      <DrawerContent className="bg-background border-t border-white/10 h-auto">
        <div className="p-6">
          <DrawerHeader className="px-0 pt-0">
            {icon && (
              <div className="flex justify-center mb-4">
                {icon}
              </div>
            )}
            <DrawerTitle className={cn(
              "text-xl font-bold text-white",
              icon ? "text-center" : "text-left"
            )}>
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription className={cn(
                "text-white/70 text-sm mt-2",
                icon ? "text-center" : "text-left"
              )}>
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
          
          <DrawerFooter className="px-0 pb-0 pt-6">
            <div className="flex gap-3">
              {cancelText && (
                <DrawerClose asChild>
                  <HapticButton
                    variant="ghost"
                    size="lg"
                    onClick={handleCancel}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    {cancelText}
                  </HapticButton>
                </DrawerClose>
              )}
              
              <DrawerClose asChild>
                <HapticButton
                  variant={variant === "destructive" ? "destructive" : "primary"}
                  size="lg"
                  hapticStyle={variant === "destructive" ? "heavy" : "medium"}
                  onClick={handleConfirm}
                  className="flex-1"
                  data-testid="button-confirm"
                >
                  {confirmText}
                </HapticButton>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * SelectDrawer - Drawer для выбора опции из списка (вместо select/dropdown)
 * 
 * Пример:
 * ```tsx
 * <SelectDrawer
 *   trigger={<button>Выбрать размер</button>}
 *   title="Выберите размер"
 *   options={[
 *     { value: 'sm', label: 'Small', icon: <Icon /> },
 *     { value: 'md', label: 'Medium' }
 *   ]}
 *   onSelect={(value) => setSize(value)}
 * />
 * ```
 */
interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}

interface SelectDrawerProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  selectedValue?: string;
}

export const SelectDrawer = ({
  trigger,
  title,
  description,
  options,
  onSelect,
  selectedValue
}: SelectDrawerProps) => {
  const haptic = useHaptic();

  const handleSelect = (value: string) => {
    haptic.light(); // Вибрация при выборе
    onSelect(value);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      
      <DrawerContent className="bg-background border-t border-white/10 h-[60vh]">
        <div className="overflow-y-auto flex-1">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-white text-left">
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription className="text-white/60 text-sm text-left mt-1">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
          
          <div className="px-4 pb-4">
            <div className="space-y-2">
              {options.map((option) => (
                <DrawerClose
                  key={option.value}
                  asChild
                  disabled={option.disabled}
                >
                  <button
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "w-full p-4 rounded-xl transition-all text-left flex items-center gap-3",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      selectedValue === option.value
                        ? "bg-blue-500/20 border-2 border-blue-500/50"
                        : "bg-white/5 hover:bg-white/10 border-2 border-transparent"
                    )}
                    data-testid={`option-${option.value}`}
                  >
                    {option.icon && (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        {option.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{option.label}</div>
                      {option.description && (
                        <div className="text-white/60 text-sm truncate">{option.description}</div>
                      )}
                    </div>
                    {selectedValue === option.value && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                </DrawerClose>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

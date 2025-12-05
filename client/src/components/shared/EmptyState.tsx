import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Heart, 
  Package, 
  Search, 
  AlertCircle,
  Inbox
} from 'lucide-react';

type EmptyStateType = 'cart' | 'favorites' | 'orders' | 'search' | 'error' | 'default';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const iconMap: Record<EmptyStateType, typeof ShoppingCart> = {
  cart: ShoppingCart,
  favorites: Heart,
  orders: Package,
  search: Search,
  error: AlertCircle,
  default: Inbox,
};

const defaultContent: Record<EmptyStateType, { title: string; description: string }> = {
  cart: {
    title: 'Корзина пуста',
    description: 'Добавьте товары из каталога, чтобы оформить заказ',
  },
  favorites: {
    title: 'Нет избранных товаров',
    description: 'Нажмите на сердечко, чтобы сохранить понравившиеся товары',
  },
  orders: {
    title: 'Нет заказов',
    description: 'Ваши заказы будут отображаться здесь после оформления',
  },
  search: {
    title: 'Ничего не найдено',
    description: 'Попробуйте изменить параметры поиска или фильтры',
  },
  error: {
    title: 'Произошла ошибка',
    description: 'Не удалось загрузить данные. Попробуйте обновить страницу',
  },
  default: {
    title: 'Здесь пока пусто',
    description: 'Контент скоро появится',
  },
};

export const EmptyState = memo(function EmptyState({
  type = 'default',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const Icon = iconMap[type];
  const content = defaultContent[type];

  return (
    <div 
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      role="status"
      aria-label={title || content.title}
    >
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || content.title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
        {description || content.description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="min-h-[44px] px-6"
          data-testid="button-empty-state-action"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
});

export default EmptyState;

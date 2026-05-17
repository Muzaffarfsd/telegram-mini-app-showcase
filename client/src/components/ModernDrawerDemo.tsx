import { ModernDrawer, ConfirmDrawer, SelectDrawer } from './ui/modern-drawer';
import { HapticButton } from './ui/haptic-button';
import { Page, PageHeader, PageSection } from './ui/page';
import { Trash2, Package, Shirt, ShoppingBag, Star, Settings, Bell, User } from 'lucide-react';
import { useState } from 'react';

/**
 * Демонстрация Modern Drawer компонентов
 * Показывает современную Bottom Sheet навигацию (UX 2025)
 */
export function ModernDrawerDemo() {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isDeleted, setIsDeleted] = useState(false);

  return (
    <Page withPadding withSafeArea>
      <PageHeader 
        title="Modern Drawer"
        subtitle="Bottom Sheet навигация - стандарт UX 2025"
      />

      {/* Базовый ModernDrawer */}
      <PageSection>
        <h2 className="text-xl font-bold text-white mb-4">ModernDrawer</h2>
        
        <div className="space-y-3">
          {/* Простой Drawer */}
          <ModernDrawer
            trigger={
              <HapticButton variant="primary" size="lg" className="w-full">
                Открыть простой Drawer
              </HapticButton>
            }
            height="50%"
            title="Информация о товаре"
            description="Детали и характеристики"
            showCloseButton
          >
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <h3 className="text-white font-bold mb-2">Характеристики</h3>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Материал: 100% хлопок</li>
                  <li>• Цвет: Черный</li>
                  <li>• Страна: Россия</li>
                  <li>• Уход: Машинная стирка 30°</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-blue-400 text-sm">
                  ✨ Бесплатная доставка при заказе от 3000₽
                </p>
              </div>
            </div>
          </ModernDrawer>

          {/* Drawer с разной высотой */}
          <ModernDrawer
            trigger={
              <HapticButton variant="secondary" size="md" className="w-full">
                Полноэкранный Drawer
              </HapticButton>
            }
            height="full"
            title="Полное описание"
            showCloseButton
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-bold mb-2">О товаре</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Премиальная футболка из 100% органического хлопка. 
                  Идеальная посадка, устойчивые к выцветанию краски, 
                  и невероятная мягкость материала.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-2">Размерная сетка</h3>
                <div className="grid grid-cols-4 gap-2">
                  {['XS', 'S', 'M', 'L'].map((size) => (
                    <div key={size} className="p-3 bg-white/5 rounded-lg text-center">
                      <div className="text-white font-bold">{size}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-2">Отзывы</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                        <span className="text-white/60 text-xs">5.0</span>
                      </div>
                      <p className="text-white/70 text-sm">
                        Отличное качество! Рекомендую!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModernDrawer>
        </div>
      </PageSection>

      {/* ConfirmDrawer */}
      <PageSection delay={0.1}>
        <h2 className="text-xl font-bold text-white mb-4">ConfirmDrawer</h2>
        
        <div className="space-y-3">
          {/* Обычное подтверждение */}
          <ConfirmDrawer
            trigger={
              <HapticButton variant="primary" size="md" className="w-full">
                Добавить в корзину
              </HapticButton>
            }
            title="Добавить в корзину?"
            description="Товар будет добавлен в вашу корзину"
            confirmText="Добавить"
            cancelText="Отмена"
            variant="default"
            onConfirm={() => alert('✅ Добавлено в корзину!')}
            onCancel={() => console.log('Отменено')}
          />

          {/* Деструктивное действие */}
          {!isDeleted ? (
            <ConfirmDrawer
              trigger={
                <HapticButton 
                  variant="destructive" 
                  size="md" 
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить товар
                </HapticButton>
              }
              title="Удалить товар?"
              description="Это действие нельзя отменить. Товар будет удален навсегда."
              confirmText="Удалить"
              cancelText="Отмена"
              variant="destructive"
              onConfirm={() => {
                setIsDeleted(true);
                setTimeout(() => setIsDeleted(false), 2000);
              }}
            />
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400 font-medium">✓ Товар удален</p>
            </div>
          )}
        </div>
      </PageSection>

      {/* SelectDrawer */}
      <PageSection delay={0.2}>
        <h2 className="text-xl font-bold text-white mb-4">SelectDrawer</h2>
        
        <div className="space-y-3">
          {/* Выбор размера */}
          <SelectDrawer
            trigger={
              <HapticButton variant="secondary" size="lg" className="w-full">
                <Shirt className="w-5 h-5 mr-2" />
                {selectedSize ? `Размер: ${selectedSize}` : 'Выбрать размер'}
              </HapticButton>
            }
            title="Выберите размер"
            description="Размеры соответствуют европейской сетке"
            selectedValue={selectedSize}
            options={[
              { 
                value: 'xs', 
                label: 'XS', 
                description: 'Обхват груди: 84-88 см',
                icon: <Shirt className="w-5 h-5" />
              },
              { 
                value: 's', 
                label: 'S', 
                description: 'Обхват груди: 88-92 см',
                icon: <Shirt className="w-5 h-5" />
              },
              { 
                value: 'm', 
                label: 'M', 
                description: 'Обхват груди: 92-96 см',
                icon: <Shirt className="w-5 h-5" />
              },
              { 
                value: 'l', 
                label: 'L', 
                description: 'Обхват груди: 96-100 см',
                icon: <Shirt className="w-5 h-5" />
              },
              { 
                value: 'xl', 
                label: 'XL', 
                description: 'Обхват груди: 100-104 см',
                icon: <Shirt className="w-5 h-5" />,
                disabled: true // Пример disabled опции
              }
            ]}
            onSelect={(value) => setSelectedSize(value.toUpperCase())}
          />

          {/* Выбор способа доставки */}
          <SelectDrawer
            trigger={
              <HapticButton variant="ghost" size="md" className="w-full">
                <Package className="w-5 h-5 mr-2" />
                Способ доставки
              </HapticButton>
            }
            title="Выберите способ доставки"
            options={[
              { 
                value: 'pickup', 
                label: 'Самовывоз', 
                description: 'Бесплатно • Завтра',
                icon: <ShoppingBag className="w-5 h-5" />
              },
              { 
                value: 'courier', 
                label: 'Курьер', 
                description: '300₽ • 1-2 дня',
                icon: <Package className="w-5 h-5" />
              },
              { 
                value: 'express', 
                label: 'Экспресс', 
                description: '600₽ • Сегодня',
                icon: <Star className="w-5 h-5" />
              }
            ]}
            onSelect={(value) => alert(`Выбрано: ${value}`)}
          />

          {/* Выбор настроек */}
          <SelectDrawer
            trigger={
              <HapticButton variant="ghost" size="sm" className="w-full">
                <Settings className="w-5 h-5 mr-2" />
                Настройки
              </HapticButton>
            }
            title="Настройки профиля"
            description="Выберите раздел для настройки"
            options={[
              { value: 'profile', label: 'Профиль', icon: <User className="w-5 h-5" /> },
              { value: 'notifications', label: 'Уведомления', icon: <Bell className="w-5 h-5" /> },
              { value: 'settings', label: 'Настройки', icon: <Settings className="w-5 h-5" /> }
            ]}
            onSelect={(value) => alert(`Открыть: ${value}`)}
          />
        </div>
      </PageSection>

      {/* Преимущества */}
      <PageSection delay={0.3}>
        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <h3 className="text-white font-bold mb-3">✨ Преимущества Modern Drawer</h3>
          <ul className="text-white/80 text-sm space-y-2">
            <li>📱 <strong>Нативный UX</strong> - Как в iOS/Android приложениях</li>
            <li>🎯 <strong>Drag-to-close</strong> - Жест закрытия свайпом вниз</li>
            <li>📳 <strong>Haptic Feedback</strong> - Вибрация при взаимодействии</li>
            <li>🎨 <strong>Backdrop blur</strong> - Размытие фона</li>
            <li>⚡ <strong>Адаптивная высота</strong> - 30%, 50%, 75%, full, auto</li>
            <li>🔒 <strong>Safe area</strong> - Учет безопасных зон Telegram</li>
            <li>♿ <strong>Accessibility</strong> - ARIA атрибуты и keyboard navigation</li>
          </ul>
        </div>
      </PageSection>
    </Page>
  );
}

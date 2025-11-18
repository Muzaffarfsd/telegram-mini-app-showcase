import { HapticButton } from './ui/haptic-button';
import { Page, PageHeader, PageSection } from './ui/page';
import { HapticCard, HapticIconButton } from './ui/haptic-card';
import { Heart, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

/**
 * Демонстрация Haptic компонентов
 * Показывает все варианты использования новых компонентов с тактильной отдачей
 */
export function HapticComponentsDemo() {
  const [count, setCount] = useState(0);

  return (
    <Page withPadding withSafeArea>
      <PageHeader 
        title="Haptic Компоненты"
        subtitle="Тактильная отдача и анимации для Telegram Mini Apps"
      />

      {/* Кнопки */}
      <PageSection>
        <h2 className="text-xl font-bold text-white mb-4">HapticButton</h2>
        
        <div className="space-y-3">
          <HapticButton 
            variant="primary" 
            size="lg"
            hapticStyle="light"
            onClick={() => alert('Primary кнопка!')}
            data-testid="button-primary"
          >
            Primary Button
          </HapticButton>

          <HapticButton 
            variant="secondary" 
            size="md"
            hapticStyle="medium"
            onClick={() => alert('Secondary кнопка!')}
            data-testid="button-secondary"
          >
            Secondary Button
          </HapticButton>

          <HapticButton 
            variant="ghost" 
            size="sm"
            hapticStyle="light"
            onClick={() => alert('Ghost кнопка!')}
            data-testid="button-ghost"
          >
            Ghost Button
          </HapticButton>

          <HapticButton 
            variant="destructive" 
            size="md"
            hapticStyle="heavy"
            onClick={() => alert('Удалено!')}
            data-testid="button-destructive"
          >
            Delete Button
          </HapticButton>
        </div>
      </PageSection>

      {/* Иконочные кнопки */}
      <PageSection delay={0.1}>
        <h2 className="text-xl font-bold text-white mb-4">HapticIconButton</h2>
        
        <div className="flex gap-3">
          <HapticIconButton
            icon={<Heart className="w-5 h-5" />}
            variant="default"
            size="lg"
            hapticStyle="light"
            onClick={() => alert('Добавлено в избранное!')}
            data-testid="icon-heart"
            aria-label="Добавить в избранное"
          />

          <HapticIconButton
            icon={<ShoppingCart className="w-5 h-5" />}
            variant="glass"
            size="md"
            hapticStyle="medium"
            onClick={() => alert('Добавлено в корзину!')}
            data-testid="icon-cart"
            aria-label="Добавить в корзину"
          />

          <HapticIconButton
            icon={<Star className="w-5 h-5" />}
            variant="ghost"
            size="sm"
            hapticStyle="light"
            onClick={() => alert('Оценка!')}
            data-testid="icon-star"
            aria-label="Оценить"
          />
        </div>
      </PageSection>

      {/* Интерактивные карточки */}
      <PageSection delay={0.2}>
        <h2 className="text-xl font-bold text-white mb-4">HapticCard</h2>
        
        <div className="space-y-4">
          <HapticCard
            hapticStyle="light"
            pressScale={0.98}
            onClick={() => alert('Карточка нажата!')}
            className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-2xl"
            data-testid="card-demo-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Премиум товар</h3>
                <p className="text-white/60 text-sm">Нажмите для деталей</p>
              </div>
            </div>
          </HapticCard>

          <HapticCard
            hapticStyle="medium"
            pressScale={0.95}
            onClick={() => alert('Вторая карточка!')}
            className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-white/20 rounded-2xl"
            data-testid="card-demo-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Специальное предложение</h3>
                <p className="text-white/60 text-sm">Скидка 50%</p>
              </div>
              <div className="text-white font-black text-3xl">-50%</div>
            </div>
          </HapticCard>
        </div>
      </PageSection>

      {/* Практический пример: счетчик */}
      <PageSection delay={0.3}>
        <h2 className="text-xl font-bold text-white mb-4">Практический пример</h2>
        
        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <div className="text-center mb-6">
            <div className="text-white/60 text-sm mb-2">Количество товаров</div>
            <div className="text-white font-black text-5xl">{count}</div>
          </div>

          <div className="flex gap-3">
            <HapticButton
              variant="destructive"
              size="lg"
              hapticStyle="light"
              onClick={() => setCount(Math.max(0, count - 1))}
              disabled={count === 0}
              className="flex-1"
              data-testid="button-minus"
            >
              <Minus className="w-6 h-6" />
            </HapticButton>

            <HapticButton
              variant="primary"
              size="lg"
              hapticStyle="light"
              onClick={() => setCount(count + 1)}
              className="flex-1"
              data-testid="button-plus"
            >
              <Plus className="w-6 h-6" />
            </HapticButton>
          </div>
        </div>
      </PageSection>

      {/* Документация */}
      <PageSection delay={0.4}>
        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <h3 className="text-white font-bold mb-3">✨ Особенности</h3>
          <ul className="text-white/80 text-sm space-y-2">
            <li>📳 <strong>Haptic Feedback</strong> - Тактильная вибрация при нажатии</li>
            <li>🎨 <strong>Анимация scale</strong> - Плавное сжатие (0.97-0.95)</li>
            <li>⚡ <strong>Оптимизация</strong> - Duration 0.1s для быстрого отклика</li>
            <li>🎯 <strong>3 стиля вибрации</strong> - light, medium, heavy</li>
            <li>🎭 <strong>4 варианта дизайна</strong> - primary, secondary, ghost, destructive</li>
            <li>📏 <strong>3 размера</strong> - sm, md, lg</li>
          </ul>
        </div>
      </PageSection>
    </Page>
  );
}

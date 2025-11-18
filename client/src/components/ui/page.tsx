import { m as motion } from '@/utils/LazyMotionProvider';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageProps {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
  withSafeArea?: boolean;
}

/**
 * Page - Обертка для каждой страницы с плавными переходами
 * 
 * Особенности:
 * - Плавная анимация появления (fade + slide up)
 * - Плавная анимация исчезновения (fade + slide down)
 * - Автоматические отступы для безопасной зоны
 * - Поддержка safe area для Telegram
 * 
 * Пример использования:
 * ```tsx
 * <Page withPadding withSafeArea>
 *   <h1>Моя страница</h1>
 *   <p>Контент...</p>
 * </Page>
 * ```
 */
export const Page = ({ 
  children, 
  className,
  withPadding = true,
  withSafeArea = true
}: PageProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ 
      duration: 0.3, 
      ease: [0.4, 0, 0.2, 1] // easeOut cubic-bezier
    }}
    className={cn(
      'min-h-screen',
      withPadding && 'px-4 pb-20 pt-4',
      withSafeArea && 'tg-safe-top tg-safe-bottom tg-safe-left tg-safe-right',
      className
    )}
  >
    {children}
  </motion.div>
);

/**
 * PageSection - Секция внутри страницы с анимацией
 */
interface PageSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const PageSection = ({ 
  children, 
  className,
  delay = 0 
}: PageSectionProps) => (
  <motion.section
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.4, 
      delay,
      ease: [0.4, 0, 0.2, 1]
    }}
    className={cn('mb-6', className)}
  >
    {children}
  </motion.section>
);

/**
 * PageHeader - Заголовок страницы с анимацией
 */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  className 
}: PageHeaderProps) => (
  <motion.header
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    className={cn('mb-6', className)}
  >
    <h1 className="text-3xl font-bold text-white mb-2">
      {title}
    </h1>
    {subtitle && (
      <p className="text-white/60 text-sm">
        {subtitle}
      </p>
    )}
  </motion.header>
);

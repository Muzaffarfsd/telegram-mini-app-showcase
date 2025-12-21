import { memo, useState, useCallback, type ReactNode } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface RadialMenuItem {
  id: string;
  icon: ReactNode;
  label: string;
  color?: string;
  onClick: () => void;
}

interface FloatingRadialMenuProps {
  items: RadialMenuItem[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  mainColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FloatingRadialMenu = memo(function FloatingRadialMenu({
  items,
  position = 'bottom-right',
  mainColor = 'bg-gradient-to-br from-violet-500 to-purple-600',
  size = 'md',
}: FloatingRadialMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const haptic = useHaptic();

  const toggleMenu = useCallback(() => {
    haptic.light();
    setIsOpen((prev) => !prev);
  }, [haptic]);

  const handleItemClick = useCallback((item: RadialMenuItem) => {
    haptic.medium();
    item.onClick();
    setIsOpen(false);
  }, [haptic]);

  const positionClasses = {
    'bottom-right': 'bottom-24 right-4',
    'bottom-left': 'bottom-24 left-4',
    'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2',
  };

  const sizes = {
    sm: { main: 'w-12 h-12', item: 'w-10 h-10', radius: 70 },
    md: { main: 'w-14 h-14', item: 'w-11 h-11', radius: 85 },
    lg: { main: 'w-16 h-16', item: 'w-12 h-12', radius: 100 },
  };

  const config = sizes[size];
  const itemCount = items.length;
  const angleStep = 180 / (itemCount + 1);

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-40`}
      data-testid="floating-radial-menu"
    >
      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {items.map((item, index) => {
              const angle = (180 + angleStep * (index + 1)) * (Math.PI / 180);
              const x = Math.cos(angle) * config.radius;
              const y = Math.sin(angle) * config.radius;

              return (
                <m.button
                  key={item.id}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    x, 
                    y, 
                    opacity: 1,
                  }}
                  exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                    delay: index * 0.05,
                  }}
                  onClick={() => handleItemClick(item)}
                  className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    ${config.item}
                    ${item.color || 'bg-white/10'}
                    rounded-full
                    flex items-center justify-center
                    text-white
                    shadow-lg shadow-black/30
                    backdrop-blur-md
                    border border-white/20
                    active:scale-95
                    transition-transform
                  `}
                  data-testid={`radial-item-${item.id}`}
                >
                  {item.icon}
                  
                  <m.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-white/80"
                  >
                    {item.label}
                  </m.span>
                </m.button>
              );
            })}
          </>
        )}
      </AnimatePresence>

      <m.button
        onClick={toggleMenu}
        animate={{ rotate: isOpen ? 135 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`
          ${config.main}
          ${mainColor}
          rounded-full
          flex items-center justify-center
          text-white
          shadow-xl shadow-purple-500/30
          active:scale-95
          transition-transform
        `}
        data-testid="radial-menu-trigger"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </m.button>
    </div>
  );
});

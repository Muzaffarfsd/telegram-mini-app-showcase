import { useState, useRef, useEffect } from 'react';
import { m } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface FilterTabsProps {
  categories: Category[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

/**
 * FilterTabs - вкладки с анимированной подчеркивающей линией (2025 тренд)
 * Используется для фильтрации галереи демо-приложений
 */
export const FilterTabs = ({ categories, activeFilter, onFilterChange }: FilterTabsProps) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Обновление позиции индикатора при изменении активного фильтра
  useEffect(() => {
    const activeIndex = categories.findIndex(cat => cat.id === activeFilter);
    const activeTab = tabsRef.current[activeIndex];

    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth
      });
    }
  }, [activeFilter, categories]);

  return (
    <div className="relative" data-testid="filter-tabs">
      {/* Tabs Container */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4">
        {categories.map((category, index) => {
          const isActive = category.id === activeFilter;

          return (
            <button
              key={category.id}
              ref={el => tabsRef.current[index] = el}
              onClick={() => onFilterChange(category.id)}
              className={`
                relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-200'
                }
              `}
              data-testid={`filter-tab-${category.id}`}
            >
              {/* Tab Content */}
              <span className="relative z-10 flex items-center gap-2">
                {category.icon && <span>{category.icon}</span>}
                {category.name}
              </span>

              {/* Active Background */}
              {isActive && (
                <m.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#00D9FF]/20 to-[#BD00FF]/20 rounded-xl"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Animated Underline Indicator */}
      <m.div
        className="absolute bottom-0 h-0.5 bg-gradient-to-r from-[#00D9FF] to-[#BD00FF] rounded-full"
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      />
    </div>
  );
};

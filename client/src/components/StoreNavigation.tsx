import { Home, ShoppingBag, SlidersHorizontal, UserRound } from 'lucide-react';
import { DemoHomeButton } from './DemoHomeButton';
import './StoreNavigation.css';

const entries = [
  { id: 'home', ru: 'Главная', en: 'Home', icon: Home },
  { id: 'menu', ru: 'Каталог', en: 'Menu', icon: SlidersHorizontal },
  { id: 'bag', ru: 'Корзина', en: 'Bag', icon: ShoppingBag },
  { id: 'profile', ru: 'Профиль', en: 'Profile', icon: UserRound },
] as const;
export type StoreTab = (typeof entries)[number]['id'];
export function StoreNavigation({
  active,
  lang = 'ru',
  count,
  select,
  className = '',
}: {
  active?: StoreTab;
  lang?: 'ru' | 'en';
  count: number;
  select: (id: StoreTab) => void;
  className?: string;
}) {
  return (
    <nav
      className={'mf-nav ' + className}
      lang={lang}
      aria-label={lang === 'ru' ? 'Навигация магазина' : 'Shop navigation'}
    >
      {entries.map(({ id, ru, en, icon: Icon }) => {
        const label = lang === 'ru' ? ru : en;
        return (
          <button
            key={id}
            type="button"
            data-tab={id}
            className={'mf-nav-button' + (active === id ? ' is-active' : '')}
            aria-label={
              id === 'bag'
                ? (lang === 'ru' ? 'Корзина, товаров: ' : 'Bag, items: ') +
                  count
                : label
            }
            aria-current={active === id ? 'page' : undefined}
            onClick={() => select(id)}
          >
            {id === 'bag' ? (
              <span className="mf-nav-bag">
                <Icon size={19} />
                {count > 0 && <i>{count}</i>}
              </span>
            ) : (
              <Icon size={19} />
            )}
            <span>{label}</span>
          </button>
        );
      })}
      <DemoHomeButton />
    </nav>
  );
}

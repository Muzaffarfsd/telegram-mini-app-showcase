import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Bell,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  MapPin,
  ReceiptText,
  ShoppingBag,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoHistory } from '@/hooks/useDemoHistory';
import { useShowcaseViewport } from '@/hooks/useShowcaseViewport';
import { scrollToTop } from '@/hooks/useScrollToTop';
import {
  restoreTelegramChrome,
  type TelegramChrome,
} from '@/lib/telegramChrome';
import { DemoHomeButton } from '../../DemoHomeButton';
import { Action, MenuView, Sheet, type Filter } from './MenuView';
import { Builder, FinishCup, type RecipePanel } from './RecipeView';
import {
  Bag,
  BarPicker,
  Counter,
  Orders,
  Pickup,
  Receipt,
  Saved,
} from './OrderViews';
import {
  addRecipe,
  barFor,
  chooseBar,
  repeatOrder,
  stageOf,
  temporaryStorage,
  toggleSaved,
  useCabinet,
} from './orders';
import { drinkById, recipeKey, say, validRecipe, type Recipe } from './menu';
import './TaktCoffee.css';

type Screen =
  | 'menu'
  | 'builder'
  | 'cup'
  | 'bag'
  | 'bars'
  | 'pickup'
  | 'receipt'
  | 'orders'
  | 'saved'
  | 'counter';
type Panel = 'directory' | 'filters' | RecipePanel;
type Route = {
  screen: Screen;
  filter: Filter;
  slide: number;
  recipe?: Recipe;
  editKey?: string;
  orderId?: string;
  station?: string;
  panel?: Panel;
};
const start: Route = { screen: 'menu', filter: 'all', slide: 0 };
export default function TaktCoffee() {
  useShowcaseViewport(true, true);
  const { language: lang } = useLanguage(),
    ru = lang === 'ru',
    data = useCabinet();
  const [route, setRoute] = useState<Route>(start);
  const current = useRef(route);
  current.current = route;
  const main = useRef<HTMLElement>(null),
    previous = useRef<Screen>('menu');
  const history = useDemoHistory<Route>({
    demoPath: 'takt-coffee',
    getSnapshot: () => current.current,
    restore: (entry) => {
      if (
        !entry ||
        (['builder', 'cup'].includes(entry.screen) &&
          !validRecipe(entry.recipe))
      ) {
        setRoute(start);
        return;
      }
      const latest = current.current;
      // Changes made in a picker belong to the recipe or menu underneath it.
      if (
        latest.panel &&
        !entry.panel &&
        latest.screen === entry.screen &&
        latest.recipe?.drink === entry.recipe?.drink
      ) {
        setRoute({
          ...entry,
          recipe: latest.recipe,
          filter: latest.filter,
          slide: latest.slide,
        });
      } else setRoute(entry);
    },
  });
  function go(screen: Screen, next: Partial<Route> = {}) {
    const target = {
      screen,
      filter: route.filter,
      slide: route.slide,
      ...next,
    };
    history.push(target);
    setRoute(target);
    scrollToTop();
  }
  function panel(name: Panel) {
    const next = { ...route, panel: name };
    history.push(next, { preserveScroll: true });
    setRoute(next);
  }
  const close = () =>
    history.back(() => setRoute((v) => ({ ...v, panel: undefined })));
  const back = () => history.back(() => go('menu'));
  const menu = () =>
    route.screen === 'menu' && !route.panel ? scrollToTop() : go('menu');
  const build = (recipe: Recipe, editKey?: string) =>
    go('builder', { recipe, editKey });
  const setSlide = useCallback(
    (slide: number) =>
      setRoute((v) => (v.slide === slide ? v : { ...v, slide })),
    [],
  );
  const chooseLocation = () => go('bars', { station: data.bar });
  useEffect(() => {
    history.replaceCurrent();
  }, [route, history.replaceCurrent]);
  useLayoutEffect(() => {
    if (previous.current !== route.screen) {
      previous.current = route.screen;
      main.current?.focus({ preventScroll: true });
    }
  }, [route.screen]);
  useEffect(() => {
    const tg = window.Telegram?.WebApp as TelegramChrome | undefined;
    const old = {
      background: tg?.backgroundColor,
      header: tg?.headerColor,
      bottom: tg?.bottomBarColor,
    };
    const root = document.getElementById('root');
    root?.classList.add('tk-scroll-root');
    try {
      tg?.setBackgroundColor?.('#f5f5ef');
      tg?.setHeaderColor?.('#f5f5ef');
      tg?.setBottomBarColor?.('#f5f5ef');
    } catch {
      /* Older clients. */
    }
    return () => {
      root?.classList.remove('tk-scroll-root');
      restoreTelegramChrome(tg, old);
    };
  }, []);
  const { screen, recipe, editKey } = route;
  const creative = screen === 'builder' || screen === 'cup';
  const count = data.bag.reduce((n, i) => n + i.qty, 0);
  const ready = data.orders.filter((t) => stageOf(t) === 'ready').length;
  const saved =
    !!recipe && data.saved.some((r) => recipeKey(r) === recipeKey(recipe));
  const ticket = data.orders.find((o) => o.id === route.orderId);
  return (
    <div
      className="tk-app"
      lang={lang}
      data-testid="takt-coffee"
      data-screen={screen}
    >
      <div className="tk-wrap">
        <header
          className={
            'tk-header' +
            (screen === 'menu' ? ' is-menu' : creative ? ' is-creative' : '')
          }
        >
          {screen === 'menu' ? (
            <button
              className="tk-brand-trigger"
              aria-label={ru ? 'Разделы кофейни' : 'Coffee bar sections'}
              aria-haspopup="dialog"
              onClick={() => panel('directory')}
            >
              <span className="tk-wordmark">TAKT</span>
              <ChevronDown size={12} />
            </button>
          ) : (
            <button
              className="tk-back tk-icon"
              aria-label={ru ? 'Назад' : 'Back'}
              onClick={back}
            >
              <ChevronLeft size={21} />
            </button>
          )}
          {screen === 'builder' && recipe && (
            <h1 className="tk-build-title">
              <span>{ru ? 'Готовим' : 'Build your'}</span>
              <strong>{say(drinkById[recipe.drink].name, lang)}</strong>
            </h1>
          )}
          {screen === 'cup' && (
            <span className="tk-header-title">
              {ru ? 'Ваша чашка' : 'Your cup'}
            </span>
          )}
          {!creative && screen !== 'menu' && (
            <button
              className="tk-compact-logo"
              onClick={menu}
              aria-label={ru ? 'В меню кофейни' : 'Coffee menu'}
            >
              TAKT
            </button>
          )}
          {screen === 'cup' && recipe && (
            <button
              className="tk-icon tk-save-top"
              aria-label={ru ? 'Сохранить рецепт' : 'Save recipe'}
              aria-pressed={saved}
              onClick={() => toggleSaved(recipe)}
            >
              <Bookmark size={21} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}
          {!creative && (
            <nav
              className="tk-top-nav"
              aria-label={ru ? 'Навигация кофейни' : 'Coffee bar navigation'}
            >
              {screen === 'menu' && (
                <button
                  className="tk-icon tk-bell"
                  aria-label={ru ? 'Мои заказы' : 'My orders'}
                  onClick={() => go('orders')}
                >
                  <Bell size={21} />
                  {ready > 0 && <i />}
                </button>
              )}
              {screen !== 'bag' && (
                <button
                  className="tk-icon tk-bag"
                  aria-label={(ru ? 'Корзина' : 'Bag') + ' · ' + count}
                  onClick={() => go('bag')}
                >
                  <ShoppingBag size={21} />
                  {count > 0 && <span>{count}</span>}
                </button>
              )}
              <DemoHomeButton color="#242321" />
            </nav>
          )}
        </header>
        <main ref={main} tabIndex={-1} className="tk-main">
          {screen === 'menu' && (
            <MenuView
              lang={lang}
              bar={data.bar}
              openBar={chooseLocation}
              saved={() => go('saved')}
              build={build}
              filter={route.filter}
              setFilter={(filter) => setRoute((v) => ({ ...v, filter }))}
              filtersOpen={route.panel === 'filters'}
              openFilters={() => panel('filters')}
              close={close}
              slide={route.slide}
              setSlide={setSlide}
            />
          )}
          {screen === 'builder' && recipe && (
            <Builder
              lang={lang}
              recipe={recipe}
              panel={route.panel as RecipePanel}
              open={panel}
              close={close}
              update={(r) => setRoute((v) => ({ ...v, recipe: r }))}
              next={() => go('cup', { recipe, editKey })}
            />
          )}
          {screen === 'cup' && recipe && (
            <FinishCup
              lang={lang}
              recipe={recipe}
              editing={!!editKey}
              details={route.panel === 'details'}
              openDetails={() => panel('details')}
              close={close}
              edit={() => build(recipe, editKey)}
              another={menu}
              add={() => {
                addRecipe(recipe, editKey);
                go('bag');
              }}
            />
          )}
          {screen === 'bag' && (
            <Bag
              lang={lang}
              bag={data.bag}
              edit={(r) => build(r, recipeKey(r))}
              menu={menu}
              pickup={() => go('pickup')}
            />
          )}
          {screen === 'bars' && (
            <section className="tk-standard">
              <h1 className="tk-display">{ru ? 'Кофейни' : 'Coffee bars'}</h1>
              <BarPicker
                lang={lang}
                selected={route.station ?? data.bar}
                change={(station) => setRoute((v) => ({ ...v, station }))}
              />
              <Action
                onClick={() => {
                  chooseBar(route.station ?? data.bar);
                  back();
                }}
              >
                {ru ? 'Сохранить выбор' : 'Confirm coffee bar'}
              </Action>
            </section>
          )}
          {screen === 'pickup' && (
            <Pickup
              lang={lang}
              bag={data.bag}
              bar={data.bar}
              done={(t) => go('receipt', { orderId: t.id })}
              menu={menu}
            />
          )}
          {(screen === 'orders' || (screen === 'receipt' && !ticket)) && (
            <Orders
              lang={lang}
              orders={data.orders}
              open={(t) => go('receipt', { orderId: t.id })}
              menu={menu}
              barista={() => go('counter')}
            />
          )}
          {screen === 'receipt' && ticket && (
            <Receipt
              lang={lang}
              ticket={ticket}
              repeat={() => {
                repeatOrder(ticket);
                go('bag');
              }}
              menu={menu}
              counter={() => go('counter')}
            />
          )}
          {screen === 'saved' && (
            <Saved
              lang={lang}
              saved={data.saved}
              open={(r) => go('cup', { recipe: r })}
              menu={menu}
            />
          )}
          {screen === 'counter' && <Counter lang={lang} orders={data.orders} />}
          {route.panel === 'directory' && (
            <Sheet
              lang={lang}
              title={ru ? 'Кофейня TAKT' : 'TAKT coffee bar'}
              close={close}
            >
              <div className="tk-choice-list tk-directory">
                <button onClick={close}>
                  <Coffee size={18} />
                  <span>{ru ? 'Меню' : 'Menu'}</span>
                  <ChevronRight size={15} />
                </button>
                <button onClick={() => go('saved')}>
                  <Bookmark size={18} />
                  <span>{ru ? 'Мои рецепты' : 'My recipes'}</span>
                  <ChevronRight size={15} />
                </button>
                <button onClick={() => go('orders')}>
                  <ReceiptText size={18} />
                  <span>{ru ? 'Мои заказы' : 'My orders'}</span>
                  <ChevronRight size={15} />
                </button>
                <button onClick={chooseLocation}>
                  <MapPin size={18} />
                  <span>
                    {ru ? 'Кофейня' : 'Pickup bar'} ·{' '}
                    {say(barFor(data.bar).name, lang)}
                  </span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </Sheet>
          )}
          {temporaryStorage() && (
            <p className="tk-disclosure" role="status">
              {ru
                ? 'В этом браузере рецепты и заказы доступны до закрытия страницы.'
                : 'This browser keeps recipes and orders until the page is closed.'}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

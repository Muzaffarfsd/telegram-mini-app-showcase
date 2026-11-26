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
  ChevronLeft,
  Search,
  Coffee,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoHistory } from '@/hooks/useDemoHistory';
import { scrollToTop } from '@/hooks/useScrollToTop';
import {
  restoreTelegramChrome,
  type TelegramChrome,
} from '@/lib/telegramChrome';
import {
  CoffeeNavigation,
  isCoffeeTab,
  type CoffeeTab,
} from './CoffeeNavigation';
import { ClubRules, CoffeeHome, GuestProfile } from './GuestViews';
import { MenuView, type Filter, type Sort } from './MenuView';
import { Builder, FinishCup, type RecipePanel } from './RecipeView';
import { Bag, Counter, Orders, Pickup, Receipt, Saved } from './OrderViews';
import {
  addRecipe,
  availableDiscount,
  repeatOrder,
  stageOf,
  temporaryStorage,
  toggleSaved,
  useCabinet,
} from './orders';
import {
  bakery,
  drinkById,
  isBakery,
  recipeKey,
  say,
  validRecipe,
  type Recipe,
  type BakeryId,
  type MenuSelection,
} from './menu';
import { BakeryDetail } from './BakeryDetail';
import { type FeaturedDrink } from './Campaign';
import './TaktCoffee.css';
import './CoffeeShop.css';
import './CoffeeStudio.css';
import './CoffeeRecipe.css';

type Screen =
  | CoffeeTab
  | 'builder'
  | 'bakery'
  | 'cup'
  | 'bars'
  | 'pickup'
  | 'receipt'
  | 'orders'
  | 'saved'
  | 'counter';
type Panel = 'name' | 'club' | 'filters' | RecipePanel;
type Route = {
  screen: Screen;
  filter: Filter;
  query?: string;
  sort?: Sort;
  tab?: CoffeeTab;
  slide: number;
  recipe?: Recipe;
  editKey?: string;
  bakeryId?: BakeryId;
  featured?: FeaturedDrink;
  orderId?: string;
  panel?: Panel;
};
const start: Route = { screen: 'home', filter: 'all', slide: 0, tab: 'home' };
function tabOf(route: Route): CoffeeTab {
  if (isCoffeeTab(route.screen)) return route.screen;
  if (route.tab) return route.tab;
  if (route.screen === 'pickup') return 'bag';
  return ['builder', 'cup', 'bakery'].includes(route.screen)
    ? 'menu'
    : 'profile';
}
export default function TaktCoffee() {
  const { language: lang } = useLanguage(),
    ru = lang === 'ru',
    data = useCabinet();
  const [route, setRoute] = useState<Route>(start);
  const current = useRef(route);
  current.current = route;
  const main = useRef<HTMLElement>(null),
    previous = useRef<Screen>('home');
  const tabPositions = useRef<Partial<Record<CoffeeTab, number>>>({});
  const restoreTabTop = useRef<number | null>(null);
  const history = useDemoHistory<Route>({
    demoPath: 'takt-coffee',
    sameSnapshot: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    getSnapshot: () => current.current,
    restore: (entry) => {
      if (
        !entry ||
        entry.screen === 'bars' ||
        (entry.screen === 'bakery' &&
          (!entry.bakeryId || !Object.hasOwn(bakery, entry.bakeryId))) ||
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
          sort: latest.sort,
          query: latest.query,
          slide: latest.slide,
        });
      } else setRoute(entry);
    },
  });
  function go(screen: Screen, next: Partial<Route> = {}) {
    if (isCoffeeTab(route.screen))
      tabPositions.current[route.screen] =
        document.getElementById('root')?.scrollTop ?? 0;
    const target = {
      screen,
      tab: isCoffeeTab(screen) ? screen : tabOf(route),
      query: route.query,
      sort: route.sort,
      filter: route.filter,
      featured: route.featured,
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
  const back = () => history.back(() => go('home'));
  function selectTab(tab: CoffeeTab) {
    if (route.screen === tab) {
      scrollToTop();
      return;
    }
    restoreTabTop.current = tabPositions.current[tab] ?? 0;
    go(tab);
  }
  const menu = () =>
    route.screen === 'menu' && !route.panel ? scrollToTop() : go('menu');
  const build = (recipe: Recipe, editKey?: string) =>
    go('builder', { recipe, editKey });
  function openProduct(item: MenuSelection, editKey?: string) {
    if (isBakery(item)) go('bakery', { bakeryId: item.bakery, editKey });
    else build(item, editKey);
  }
  const setSlide = useCallback(
    (slide: number) =>
      setRoute((v) => (v.slide === slide ? v : { ...v, slide })),
    [],
  );
  useEffect(() => {
    // Typing and scrolling a shelf can produce a burst of snapshots. Navigation
    // flushes the latest route through the history hook before switching views.
    const timer = window.setTimeout(history.replaceCurrent, 130);
    window.addEventListener('pagehide', history.replaceCurrent);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pagehide', history.replaceCurrent);
    };
  }, [route, history.replaceCurrent]);
  useLayoutEffect(() => {
    if (previous.current !== route.screen) {
      previous.current = route.screen;
      main.current?.focus({ preventScroll: true });
      const root = document.getElementById('root');
      if (root && restoreTabTop.current !== null)
        root.scrollTop = restoreTabTop.current;
      restoreTabTop.current = null;
    }
  }, [route.screen]);
  useLayoutEffect(() => {
    const tg = window.Telegram?.WebApp as TelegramChrome | undefined;
    const old = {
      background: tg?.backgroundColor,
      header: tg?.headerColor,
      bottom: tg?.bottomBarColor,
    };
    const root = document.getElementById('root');
    root?.classList.add('tk-scroll-root');
    try {
      tg?.setBackgroundColor?.('#ffffff');
      tg?.setHeaderColor?.('#ffffff');
      tg?.setBottomBarColor?.('#ffffff');
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
  const rootScreen = isCoffeeTab(screen);
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
            (rootScreen ? ' is-menu' : creative ? ' is-creative' : '')
          }
        >
          {rootScreen ? (
            <button
              className="tk-icon tk-home-search"
              aria-label={ru ? 'Найти в каталоге' : 'Search menu'}
              onClick={() => {
                if (screen !== 'menu') go('menu');
                requestAnimationFrame(() =>
                  document
                    .querySelector<HTMLInputElement>('.tk-search input')
                    ?.focus(),
                );
              }}
            >
              <Search size={21} />
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
          {!creative && !rootScreen && (
            <button
              className="tk-compact-logo"
              onClick={() => selectTab('home')}
              aria-label={ru ? 'На главную кофейни' : 'Coffee bar home'}
            >
              <Coffee size={21} />
            </button>
          )}
          {screen === 'builder' && (
            <button
              className="tk-icon tk-save-top"
              aria-haspopup="dialog"
              aria-label={ru ? 'О напитке' : 'About this drink'}
              onClick={() => panel('drink')}
            >
              <Info size={21} />
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
            <button
              className="tk-icon tk-bell"
              aria-label={ru ? 'Мои заказы' : 'My orders'}
              onClick={() => go('orders')}
            >
              <Bell size={21} />
              {ready > 0 && <i />}
            </button>
          )}
        </header>
        <main ref={main} tabIndex={-1} className="tk-main">
          {screen === 'home' && (
            <CoffeeHome
              lang={lang}
              data={data}
              build={build}
              menu={menu}
              openClub={() => panel('club')}
              browse={(query) =>
                go('menu', { filter: 'all', query, sort: 'house' })
              }
              openBag={() => go('bag')}
              saved={() => go('saved')}
              openCup={(r) => go('cup', { recipe: r })}
              receipt={(t) => go('receipt', { orderId: t.id })}
              repeat={(t) => {
                repeatOrder(t);
                go('bag');
              }}
              slide={route.slide}
              setSlide={setSlide}
              featured={route.featured}
              feature={(featured) => setRoute((v) => ({ ...v, featured }))}
            />
          )}
          {screen === 'menu' && (
            <MenuView
              lang={lang}
              openProduct={openProduct}
              bag={data.bag}
              openBag={() => go('bag')}
              filter={route.filter}
              setFilter={(filter) => setRoute((v) => ({ ...v, filter }))}
              query={route.query ?? ''}
              setQuery={(query) => setRoute((v) => ({ ...v, query }))}
              sort={route.sort ?? 'house'}
              setSort={(sort) => setRoute((v) => ({ ...v, sort }))}
              filtersOpen={route.panel === 'filters'}
              openFilters={() => panel('filters')}
              close={close}
              saved={data.saved}
            />
          )}
          {screen === 'profile' && (
            <GuestProfile
              lang={lang}
              data={data}
              panel={route.panel}
              saved={() => go('saved')}
              orders={() => go('orders')}
              counter={() => go('counter')}
              editName={() => panel('name')}
              club={() => panel('club')}
              close={close}
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
          {screen === 'bakery' && route.bakeryId && (
            <BakeryDetail
              lang={lang}
              id={route.bakeryId}
              fromBag={!!editKey}
              done={() => {
                if (!editKey) addRecipe({ bakery: route.bakeryId! });
                go('bag');
              }}
            />
          )}
          {screen === 'bag' && (
            <Bag
              lang={lang}
              bag={data.bag}
              edit={(r) => openProduct(r, recipeKey(r))}
              menu={menu}
              pickup={() => go('pickup')}
            />
          )}
          {screen === 'pickup' && (
            <Pickup
              lang={lang}
              bag={data.bag}
              bar={data.bar}
              discount={availableDiscount(data)}
              pickupName={data.pickupName}
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
          {route.panel === 'club' && (
            <ClubRules lang={lang} data={data} close={close} />
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
      <CoffeeNavigation
        lang={lang}
        active={tabOf(route)}
        count={count}
        select={selectTab}
      />
    </div>
  );
}

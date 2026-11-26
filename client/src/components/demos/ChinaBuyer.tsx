import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { BookOpen, FolderClosed, Grid2X2, Plus, Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoHistory } from '@/hooks/useDemoHistory';
import { scrollToTop } from '@/hooks/useScrollToTop';
import { restoreTelegramChrome } from '@/lib/telegramChrome';
import { DemoHomeButton } from '../DemoHomeButton';
import {
  allSamples,
  BureauHome,
  Library,
  type CatalogState,
  type LibraryActions,
} from './buyer/Library';
import { Compare, Guide, SampleDetail } from './buyer/SampleViews';
import { BriefEditor, Desk, Review, SavedView } from './buyer/BriefViews';
import {
  emptyBrief,
  useBriefs,
  useDrafts,
  useSelection,
  validate,
  type Brief,
} from './buyer/records';
import {
  local,
  sampleById,
  samples,
  type Category,
  type Copy,
} from './buyer/samples';
import './buyer/Bureau.css';

type Screen =
  | 'home'
  | 'library'
  | 'sample'
  | 'compare'
  | 'desk'
  | 'editor'
  | 'review'
  | 'record'
  | 'guide';
type Route = {
  screen: Screen;
  filter: CatalogState;
  tab: 'briefs' | 'saved';
  id?: string;
  slot?: string;
  intent?: string;
  mode?: 'photo' | 'link' | 'any';
  search?: boolean;
};
const start: Route = { screen: 'home', filter: allSamples, tab: 'briefs' };
const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  String(Date.now()) + Math.random().toString(36).slice(2);
const favoriteKey = 'china-buyer-favorites-v1';
function BureauMark() {
  return (
    <span className="yb-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
export default function ChinaBuyer(_props: { onClose: () => void }) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [route, setRoute] = useState<Route>(start);
  const [notice, setNotice] = useState<Copy>();
  const [saveError, setSaveError] = useState<Copy>();
  const favorites = useSelection(favoriteKey, samples.length),
    selection = useSelection('yangben-compare-v1', 3);
  const workflow = useBriefs(),
    drafts = useDrafts();
  const submitted = useRef(new Map<string, string>());
  const lastSlot = useRef('new');
  const main = useRef<HTMLElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const previousScreen = useRef<Screen>('home');
  function resolved(next: Route): Route {
    if (next.intent && (next.screen === 'editor' || next.screen === 'review')) {
      let id = submitted.current.get(next.intent);
      if (!id) {
        try {
          id =
            sessionStorage.getItem('yangben-saved:' + next.intent) ?? undefined;
        } catch {}
      }
      if (id)
        return { ...next, screen: 'desk', tab: 'briefs', intent: undefined };
    }
    return next;
  }
  const history = useDemoHistory({
    demoPath: 'china-buyer',
    getSnapshot: () => route,
    restore: (value) => {
      setNotice(undefined);
      setSaveError(undefined);
      setRoute(resolved(value));
    },
  });
  function show(next: Route) {
    setSaveError(undefined);
    setNotice(undefined);
    history.push(next);
    setRoute(next);
    scrollToTop();
  }
  function go(screen: Screen, extras: Partial<Route> = {}) {
    show({
      ...route,
      screen,
      id: undefined,
      slot: undefined,
      intent: undefined,
      mode: undefined,
      search: false,
      ...extras,
    });
  }
  function back() {
    history.back(() => go('home'));
  }
  useLayoutEffect(() => {
    if (previousScreen.current !== route.screen) {
      if (!route.search && route.mode !== 'link')
        main.current?.focus({ preventScroll: true });
      previousScreen.current = route.screen;
    }
  }, [route.screen, route.search, route.mode]);
  useEffect(() => {
    history.replaceCurrent();
  }, [route, history.replaceCurrent]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(undefined), 3300);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const nodes = [
      document.documentElement,
      document.body,
      document.getElementById('root'),
    ].filter((node): node is HTMLElement => !!node);
    const oldColors = nodes.map((n) => n.style.backgroundColor);
    nodes.forEach((n) => (n.style.backgroundColor = '#ffffff'));
    const root = document.getElementById('root');
    root?.classList.add('china-buyer-scroll-root');
    const tg = (window as any).Telegram?.WebApp;
    const old = {
      background: tg?.backgroundColor,
      header: tg?.headerColor,
      bottom: tg?.bottomBarColor,
    };
    try {
      tg?.setBackgroundColor?.('#ffffff');
      tg?.setHeaderColor?.('#ffffff');
      tg?.setBottomBarColor?.('#ffffff');
    } catch {}
    return () => {
      root?.classList.remove('china-buyer-scroll-root');
      nodes.forEach((n, i) => (n.style.backgroundColor = oldColors[i]));
      restoreTelegramChrome(tg, old);
    };
  }, []);
  function openLibrary(category?: Category, search = false) {
    go('library', {
      filter: { ...allSamples, category: category ?? 'all' },
      search,
    });
  }
  const open = (id: string) => go('sample', { id });
  const actions: LibraryActions = {
    ru,
    favorites: favorites.ids,
    selection: selection.ids,
    open,
    favorite: (id) => {
      favorites.toggle(id);
    },
    select: (id) => {
      if (!selection.toggle(id))
        setNotice([
          'На сравнении уже три образца. Уберите один, чтобы добавить другой.',
          'Three samples are on the table. Remove one to add another.',
        ]);
    },
    compare: () => go('compare'),
  };
  function startBrief(
    ids: string[] = [],
    mode: Route['mode'] = 'any',
    slotOverride?: string,
    editingId?: string,
  ) {
    const slot =
      slotOverride ?? (ids.length ? 'samples:' + ids.join(',') : 'new');
    const record = workflow.records.find((b) => b.id === editingId);
    if (!drafts.get(slot))
      drafts.put(
        slot,
        record ??
          emptyBrief(
            ids,
            ids.length &&
              ids.every(
                (id) =>
                  sampleById(id)?.category === sampleById(ids[0])?.category,
              )
              ? sampleById(ids[0])?.category
              : 'Другое',
          ),
      );
    lastSlot.current = slot;
    try {
      sessionStorage.setItem('yangben-last-slot', slot);
    } catch {}
    go('editor', { slot, mode, intent: uid() });
  }
  function beginFromHome(mode: 'photo' | 'link') {
    if (mode === 'photo') {
      // Open the native picker in the originating tap, including on iOS.
      flushSync(() => startBrief([], mode));
      photoInput.current?.click();
    } else {
      startBrief([], mode);
    }
  }
  function resume() {
    let slot = lastSlot.current;
    try {
      slot = sessionStorage.getItem('yangben-last-slot') ?? slot;
    } catch {}
    if (drafts.get(slot))
      startBrief(
        [],
        'any',
        slot,
        slot.startsWith('edit:') ? slot.slice(5) : undefined,
      );
    else startBrief();
  }
  const slot = route.slot ?? 'new';
  const editingId = slot.startsWith('edit:') ? slot.slice(5) : undefined;
  const fields = drafts.get(slot) ?? emptyBrief();
  const record = workflow.records.find((b) => b.id === route.id);
  const item = sampleById(route.id ?? '');
  function review(b: Brief) {
    drafts.put(slot, b);
    show({ ...route, screen: 'review' });
  }
  function editReview() {
    history.back(() => show({ ...route, screen: 'editor', mode: 'any' }));
  }
  function save() {
    if (route.intent && submitted.current.has(route.intent)) return;
    const result = workflow.save(fields, editingId);
    if (result.error) {
      setSaveError(result.error);
      return;
    }
    if (!result.record) return;
    if (route.intent) {
      submitted.current.set(route.intent, result.record.id);
      try {
        sessionStorage.setItem(
          'yangben-saved:' + route.intent,
          result.record.id,
        );
      } catch {}
    }
    drafts.clear(slot);
    go('record', { id: result.record.id, tab: 'briefs' });
  }
  const active =
    route.screen === 'home' || route.screen === 'guide'
      ? 'home'
      : route.screen === 'editor' || route.screen === 'review'
        ? 'editor'
        : route.screen === 'record' || route.screen === 'desk'
          ? 'desk'
          : 'library';
  const temporary =
    workflow.temporary ||
    favorites.temporary ||
    selection.temporary ||
    drafts.temporary;
  return (
    <div
      className="china-buyer yb"
      lang={ru ? 'ru' : 'en'}
      data-testid="china-buyer"
    >
      <header
        className={'yb-mast' + (route.screen === 'home' ? ' is-home' : '')}
      >
        <div className="yb-brand">
          <BureauMark />
          {route.screen === 'home' ? (
            <h1>YANGBEN</h1>
          ) : (
            <button
              type="button"
              onClick={() => go('home')}
              aria-label={ru ? 'Главная YANGBEN' : 'YANGBEN home'}
            >
              YANGBEN
            </button>
          )}
        </div>
        <div className="yb-mast-end">
          {route.screen === 'home' && (
            <span>
              {ru ? 'Бюро образцов' : 'Sample bureau'}
              <br />
              {ru ? 'Китай' : 'China'}
            </span>
          )}
          <button
            type="button"
            className="yb-icon"
            aria-label={ru ? 'Найти образец' : 'Find a sample'}
            onClick={() => openLibrary(undefined, true)}
          >
            <Search size={20} />
          </button>
        </div>
      </header>
      <main
        ref={main}
        tabIndex={-1}
        className="yb-main"
        data-screen={route.screen}
      >
        {temporary && (
          <p className="yb-warning" role="status">
            {ru
              ? 'Память устройства недоступна. Последние изменения доступны в этой сессии.'
              : 'Device storage is unavailable. Recent changes are available in this session.'}
          </p>
        )}
        {route.screen === 'home' && (
          <BureauHome
            actions={actions}
            catalog={openLibrary}
            begin={beginFromHome}
            guide={() => go('guide')}
          />
        )}
        {route.screen === 'library' && (
          <Library
            actions={actions}
            filter={route.filter}
            change={(filter) => setRoute({ ...route, filter })}
            focusSearch={route.search}
          />
        )}
        {route.screen === 'sample' && item && (
          <SampleDetail
            key={item.id}
            item={item}
            actions={actions}
            begin={startBrief}
            back={back}
          />
        )}
        {route.screen === 'compare' && (
          <Compare
            actions={actions}
            back={back}
            library={() => openLibrary()}
            begin={startBrief}
          />
        )}
        {route.screen === 'guide' && (
          <Guide
            ru={ru}
            back={back}
            begin={() => startBrief()}
            library={() => openLibrary()}
          />
        )}
        {(route.screen === 'editor' ||
          (route.screen === 'review' && validate(fields))) && (
          <BriefEditor
            key={slot + route.intent}
            ru={ru}
            mode={route.mode ?? 'any'}
            initial={fields}
            fileInput={photoInput}
            onUpdate={(f) => drafts.put(slot, f)}
            onReview={review}
            back={back}
          />
        )}
        {route.screen === 'review' && !validate(fields) && (
          <Review
            b={fields}
            ru={ru}
            open={open}
            edit={editReview}
            save={save}
            error={saveError}
          />
        )}
        {route.screen === 'record' && record && (
          <SavedView
            key={record.id}
            b={record}
            ru={ru}
            open={open}
            back={() => history.back(() => go('desk', { tab: 'briefs' }))}
            edit={() => startBrief([], 'any', 'edit:' + record.id, record.id)}
            temporary={workflow.temporary}
            remove={() => {
              workflow.remove(record.id);
              drafts.clear('edit:' + record.id);
              go('desk', { tab: 'briefs' });
            }}
          />
        )}
        {(route.screen === 'desk' ||
          (route.screen === 'record' && !record)) && (
          <Desk
            actions={actions}
            records={workflow.records}
            view={(id) => go('record', { id })}
            tab={route.tab}
            change={(tab) => setRoute({ ...route, tab })}
            begin={() => startBrief()}
            library={() => openLibrary()}
            compare={actions.compare}
          />
        )}
      </main>
      {createPortal(
        <div className="yb-dock-wrap" lang={ru ? 'ru' : 'en'}>
          {notice && (
            <div role="status" className="yb-notice">
              {local(notice, ru)}
              <button
                type="button"
                aria-label={ru ? 'Закрыть' : 'Close'}
                onClick={() => setNotice(undefined)}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <nav
            className="yb-dock"
            aria-label={ru ? 'Навигация приложения' : 'App navigation'}
          >
            {[
              {
                id: 'home',
                label: ru ? 'Бюро' : 'Bureau',
                Icon: BookOpen,
                act: () => go('home'),
              },
              {
                id: 'library',
                label: ru ? 'Образцы' : 'Samples',
                Icon: Grid2X2,
                act: () => go('library', { filter: route.filter }),
              },
              {
                id: 'editor',
                label: ru ? 'Запрос' : 'Brief',
                Icon: Plus,
                act: resume,
              },
              {
                id: 'desk',
                label: ru ? 'Моё' : 'My desk',
                Icon: FolderClosed,
                act: () => go('desk'),
              },
            ].map(({ id, label, Icon, act }) => (
              <button
                key={id}
                type="button"
                aria-current={active === id ? 'page' : undefined}
                onClick={() => {
                  if (route.screen !== id) act();
                  else scrollToTop();
                }}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
            <DemoHomeButton />
          </nav>
        </div>,
        document.body,
      )}
    </div>
  );
}

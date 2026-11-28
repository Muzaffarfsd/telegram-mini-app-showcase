/** Opt-in, on-device diagnostics. Nothing is sent to the server. */
const selectors: Record<string, string> = {
  'home': '[data-testid="home-page"]',
  'furniture-studio': '[data-testid="furniture-store"]',
  'flower-store': '[data-testid="flower-store"]',
  'takt-coffee': '[data-testid="takt-coffee"]',
  'china-buyer': '[data-testid="china-buyer"]',
  'medical-center': '[data-testid="medical-center"]',
  'lumi-studio': '[data-testid="lumi-studio"]',
  'opt-market': '[data-testid="opt-market"]',
  'apple-store': '[data-testid="apple-store"]',
  'muraka-fashion': '[data-testid="muraka-fashion"]',
  'women-fashion': '[data-testid="women-fashion"]',
  'jewelry-store': '[data-testid="jewelry-store"]',
  'nike-sneakers': '[data-testid="royal-step"]',
  'skincare-aura': '[data-testid="demo-content"] .aura',
};

type Summary = {
  ready: number | null;
  readyLate: boolean;
  fcp: number | null;
  lcp: number | null;
  longestInteraction: number | null;
  longTasks: number | null;
  longestTask: number | null;
  longFrames: number | null;
  longestFrame: number | null;
};

/** Call only for a user-selected diagnostic launch, never for ordinary visitors. */
export function startPerformanceDiagnostic(id: string): void {
  const selector = selectors[id];
  if (!selector || document.getElementById('performance-diagnostic')) return;
  const state: Summary = {ready:null,readyLate:false,fcp:null,lcp:null,longestInteraction:null,longTasks:null,longestTask:null,longFrames:null,longestFrame:null};
  const observers: PerformanceObserver[] = [];
  let stopped = false;
  const round = (n: number) => Math.round(n);

  const observe = (type: string, callback: (entries: PerformanceEntry[]) => void, extra: Record<string, unknown> = {}) => {
    try {
      if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return;
      const observer = new PerformanceObserver(list => { if (!stopped) callback(list.getEntries()); });
      observer.observe({type, buffered:true, ...extra} as PerformanceObserverInit);
      observers.push(observer);
    } catch { /* Older Telegram WebViews may not expose individual metrics. */ }
  };
  observe('paint', entries => { for (const e of entries) if (e.name === 'first-contentful-paint') state.fcp = round(e.startTime); });
  observe('largest-contentful-paint', entries => { for (const e of entries) state.lcp = round(e.startTime); });
  if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
    state.longTasks = 0;
    observe('longtask', entries => { for (const e of entries) { state.longTasks!++; state.longestTask = Math.max(state.longestTask || 0, round(e.duration)); } });
  }
  if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')) {
    state.longFrames = 0;
    observe('long-animation-frame', entries => { for (const e of entries) { state.longFrames!++; state.longestFrame = Math.max(state.longestFrame || 0, round(e.duration)); } });
  }
  observe('event', entries => {
    for (const e of entries) {
      // Keep only the duration; never retain targets, labels or input data.
      if ((e as PerformanceEventTiming).interactionId) state.longestInteraction = Math.max(state.longestInteraction || 0, round(e.duration));
    }
  }, {durationThreshold:16});

  const root = document.getElementById('root');
  let screenObserver: MutationObserver | null = null;
  const screenDetected = () => {
    if (stopped || state.ready !== null || !root?.querySelector(selector)) return;
    state.ready = round(performance.now());
    screenObserver?.disconnect();
    screenObserver = null;
  };
  if (root?.querySelector(selector)) {
    // The module arrived after the screen was mounted; this is an upper bound.
    state.readyLate = true;
    screenDetected();
  } else if (root) {
    screenObserver = new MutationObserver(screenDetected);
    screenObserver.observe(root, {childList:true, subtree:true});
    screenDetected();
  }

  const wrapper = document.createElement('div');
  wrapper.id = 'performance-diagnostic';
  wrapper.innerHTML = `<style>
    #performance-diagnostic{position:fixed;z-index:2147483645;right:12px;bottom:calc(max(env(safe-area-inset-bottom,0px),18px) + 86px);font:14px/1.4 system-ui,sans-serif;color:#171717}
    #performance-diagnostic *{box-sizing:border-box}
    #performance-diagnostic button{font:inherit;min-height:44px;border:0;border-radius:14px;padding:9px 14px;background:#242424;color:#fff}
    #performance-diagnostic .pd-panel{width:min(350px,calc(100vw - 24px));max-height:min(65dvh,520px);overflow:auto;background:white;border:1px solid #d8d8d8;border-radius:20px;padding:16px;box-shadow:0 12px 38px #0002}
    #performance-diagnostic .pd-panel[hidden],#performance-diagnostic .pd-button[hidden]{display:none}
    #performance-diagnostic p{margin:8px 0;color:#444}
    #performance-diagnostic textarea{display:block;width:100%;height:112px;resize:vertical;border:1px solid #ddd;border-radius:10px;padding:8px;font:12px/1.4 monospace;color:#171717;background:#fff}
    #performance-diagnostic .pd-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
    #performance-diagnostic .pd-copy{grid-column:1/-1}
    #performance-diagnostic .pd-close{background:#ececec;color:#171717}
  </style>
  <button class="pd-button" type="button" aria-label="Открыть диагностику скорости">Диагностика</button>
  <section class="pd-panel" role="dialog" aria-label="Диагностика скорости" hidden>
    <strong>Диагностика на этом телефоне</strong>
    <p>Отчёт остаётся на телефоне. Инерцию прокрутки эти метрики не измеряют.</p>
    <div class="pd-actions"><button class="pd-copy" type="button">Скопировать отчёт</button><button class="pd-hide" type="button">Продолжить</button><button class="pd-close" type="button">Завершить</button></div>
    <p class="pd-feedback" role="status"></p>
    <textarea readonly aria-label="Отчёт диагностики"></textarea>
    <p>Прокрутите страницу пальцем и опишите ощущения отдельно.</p>
  </section>`;
  document.body.appendChild(wrapper);
  const open = wrapper.querySelector<HTMLButtonElement>('.pd-button')!;
  const panel = wrapper.querySelector<HTMLElement>('.pd-panel')!;
  const textarea = wrapper.querySelector<HTMLTextAreaElement>('textarea')!;
  const feedback = wrapper.querySelector<HTMLElement>('.pd-feedback')!;

  const stopMeasurements = () => {
    stopped=true;
    screenObserver?.disconnect();
    observers.forEach(observer => observer.disconnect());
    window.removeEventListener('hashchange', onRouteChange);
  };
  const onRouteChange = () => {
    const hash = window.location.hash.split('?')[0];
    if (id === 'home' ? (!hash.startsWith('#/') || hash === '#/') : hash === `#/demos/${id}/app`) return;
    stopMeasurements();
    feedback.textContent='Запись остановлена после выхода из проекта. Отчёт можно скопировать.';
  };
  window.addEventListener('hashchange', onRouteChange);

  const report = () => {
    const platform = window.Telegram?.WebApp?.platform;
    const system = platform === 'ios' ? 'iOS' : platform === 'android' || platform === 'android_x' ? 'Android' : 'не определена';
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const metric = (n: number | null) => n === null ? 'нет данных' : `${n} мс`;
    return [
      'Диагностика WEB4TG (данные только с устройства)',
      `Экран: ${id === 'home' ? 'основное приложение' : id}`,
      `Платформа Telegram: ${system}`,
      `Ответ сервера (TTFB): ${navigation ? metric(round(navigation.responseStart)) : 'нет данных'}`,
      `Первый видимый контент (FCP, может быть заставкой): ${metric(state.fcp)}`,
      `Крупный контент (LCP, может быть заставкой): ${metric(state.lcp)}`,
      `Появление элемента экрана: ${metric(state.ready)}${state.readyLate ? ' (верхняя оценка: диагностика запустилась позднее)' : ''}`,
      `Наиболее долгое зарегистрированное взаимодействие: ${metric(state.longestInteraction)} (не INP)` ,
      `Долгие задачи: ${state.longTasks === null ? 'не поддерживаются' : `${state.longTasks}, максимум ${metric(state.longestTask)}`}`,
      `Долгие кадры: ${state.longFrames === null ? 'не поддерживаются' : `${state.longFrames}, максимум ${metric(state.longestFrame)}`}`,
      'Инерцию и ощущение прокрутки эти метрики не измеряют. Диагностика сама добавляет небольшую нагрузку.',
    ].join('\n');
  };
  open.addEventListener('click', () => {textarea.value=report(); panel.hidden=false; open.hidden=true; feedback.textContent=stopped?'Запись остановлена после выхода из проекта. Отчёт можно скопировать.':''; textarea.focus({preventScroll:true});});
  wrapper.querySelector('.pd-hide')!.addEventListener('click', () => {panel.hidden=true; open.hidden=false; open.focus({preventScroll:true});});
  wrapper.querySelector('.pd-close')!.addEventListener('click', () => {
    stopMeasurements();
    wrapper.remove();
  });
  wrapper.querySelector('.pd-copy')!.addEventListener('click', async () => {
    textarea.value=report();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(textarea.value);
      feedback.textContent='Отчёт скопирован. Его можно отправить вручную.';
    } catch {
      textarea.focus({preventScroll:true}); textarea.select();
      feedback.textContent='Выделите текст отчёта и скопируйте вручную.';
    }
  });
}

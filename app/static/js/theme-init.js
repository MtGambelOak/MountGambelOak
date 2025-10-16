(function (root) {
  const doc = root.document;
  if (!doc) return;

  const config = root.ThemeConfig || {};
  const storageKeys = config.storageKeys || {
    mode: 'theme-mode',
    accent: 'theme-accent',
    lastCustomAccent: 'last-custom-accent',
  };
  const managedStorageKeys = new Set(Object.values(storageKeys));

  const accentPalette = config.accentPalette || {};
  const iconLightAccents = new Set(config.iconLightAccents || ['white', 'ivory']);
  function getHolidayDetails() {
    const details = root.__HOLIDAY_DETAILS__;
    if (details && typeof details === 'object') return details;
    return null;
  }
  const defaults = {
    mode: config.defaultMode || 'system',
    accent: config.defaultAccent || 'holiday',
    lastCustomAccent:
      config.defaultCustomAccent || config.defaultAccent || 'forest',
  };

  const subscribers = new Set();
  let hydrated = false;

  const state = readPersistedState();
  preloadTheme(state);

  const ThemeManager = {
    getPalette,
    getState,
    getResolvedState,
    getLastCustomAccent,
    setMode,
    setAccent,
    setLastCustomAccent,
    applyTheme: applyThemeForState,
    resolveSystemMode,
    resolveActualMode,
    resolveAccent,
    subscribe,
    unsubscribe,
    setGiscusTheme,
    mountGiscusWithTheme,
  };

  root.ThemeManager = ThemeManager;

  doc.addEventListener('DOMContentLoaded', ensureHydrated);
  root.addEventListener('storage', handleStorageEvent);

  function getPalette() {
    return accentPalette;
  }

  function getState() {
    return {
      mode: state.mode,
      accent: state.accent,
      lastCustomAccent: state.lastCustomAccent,
    };
  }

  function getResolvedState() {
    const actualMode = resolveActualMode(state.mode);
    const accent = resolveAccent(state.accent);
    return {
      mode: state.mode,
      accent: state.accent,
      lastCustomAccent: state.lastCustomAccent,
      actualMode,
      resolvedAccent: accent,
    };
  }

  function readPersistedState() {
    const nextState = { ...defaults };
    try {
      const storedMode = root.localStorage && root.localStorage.getItem(storageKeys.mode);
      const storedAccent = root.localStorage && root.localStorage.getItem(storageKeys.accent);
      const storedLastCustom =
        root.localStorage && root.localStorage.getItem(storageKeys.lastCustomAccent);

      if (storedMode) nextState.mode = storedMode;
      if (storedAccent) nextState.accent = storedAccent;
      if (storedLastCustom) nextState.lastCustomAccent = storedLastCustom;
    } catch (err) {
      /* localStorage may be unavailable; fall back to defaults */
    }
    return nextState;
  }

  function persistState(partial) {
    try {
      if (!root.localStorage) return;
      if (partial.mode !== undefined) root.localStorage.setItem(storageKeys.mode, partial.mode);
      if (partial.accent !== undefined) root.localStorage.setItem(storageKeys.accent, partial.accent);
      if (partial.lastCustomAccent !== undefined) {
        root.localStorage.setItem(storageKeys.lastCustomAccent, partial.lastCustomAccent);
      }
    } catch (err) {
      /* Ignore storage failures */
    }
  }

  function getLastCustomAccent() {
    return state.lastCustomAccent;
  }

  function setLastCustomAccent(accent) {
    if (!accent) return;
    state.lastCustomAccent = accent;
    persistState({ lastCustomAccent: accent });
  }

  function subscribe(fn) {
    if (typeof fn === 'function') subscribers.add(fn);
  }

  function unsubscribe(fn) {
    subscribers.delete(fn);
  }

  function notify() {
    const snapshot = getResolvedState();
    subscribers.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (err) {
        /* Swallow subscriber errors to avoid breaking theme updates */
      }
    });
  }

  function resolveSystemMode() {
    return root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function resolveActualMode(mode) {
    return mode === 'system' ? resolveSystemMode() : mode || defaults.mode;
  }

  function resolveAccent(accent) {
    if (accent === 'holiday') {
      const holidayDetails = getHolidayDetails();
      if (holidayDetails && holidayDetails.accent) {
        return holidayDetails.accent;
      }
      if (root.HolidaySchedule && typeof root.HolidaySchedule.getHolidayAccent === 'function') {
        return root.HolidaySchedule.getHolidayAccent(new Date());
      }
      return defaults.lastCustomAccent;
    }
    return accent || defaults.accent;
  }

  function setMode(nextMode) {
    if (!nextMode || state.mode === nextMode) return;
    state.mode = nextMode;
    persistState({ mode: nextMode });
    applyThemeForState();
  }

  function setAccent(nextAccent) {
    if (!nextAccent || state.accent === nextAccent) return;
    state.accent = nextAccent;
    persistState({ accent: nextAccent });
    if (nextAccent !== 'holiday') {
      state.lastCustomAccent = nextAccent;
      persistState({ lastCustomAccent: nextAccent });
    }
    applyThemeForState();
  }

  function preloadTheme(currentState) {
    const rootEl = doc.documentElement;
    if (!rootEl) return;

    const actualMode = resolveActualMode(currentState.mode);
    const accent = resolveAccent(currentState.accent);
    setRootClasses(rootEl, accent, actualMode);
    applyHolidayDetails(rootEl);
  }

  function ensureHydrated() {
    if (hydrated) return;
    hydrated = true;

    applyThemeForState();
    mountGiscusWithTheme(resolveActualMode(state.mode));

    const systemMedia = root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)');
    if (systemMedia && typeof systemMedia.addEventListener === 'function') {
      systemMedia.addEventListener('change', () => {
        if (state.mode === 'system') applyThemeForState();
      });
    }
  }

  function applyThemeForState() {
    const rootEl = doc.documentElement;
    if (!rootEl) return;

    const actualMode = resolveActualMode(state.mode);
    const accent = resolveAccent(state.accent);

    setRootClasses(rootEl, accent, actualMode);
    applyHolidayDetails(rootEl);
    updateIconsForAccent(accent);
    updateAccentTextColor(actualMode);
    setGiscusTheme(actualMode);
    notify();
  }

  function setRootClasses(rootEl, accent, mode) {
    const targetAccentClass = `accent-${accent}`;
    const modeClasses = new Set(['light', 'dark']);

    Array.from(rootEl.classList).forEach((cls) => {
      if (cls.startsWith('accent-') || modeClasses.has(cls)) {
        rootEl.classList.remove(cls);
      }
    });

    rootEl.classList.add(targetAccentClass);
    rootEl.classList.add(mode);
  }

  function applyHolidayDetails(rootEl) {
    if (!rootEl) return;
    const details = getHolidayDetails();
    if (details && details.emoji) {
      rootEl.style.setProperty('--holiday-emoji', `"${details.emoji}"`);
    } else {
      rootEl.style.removeProperty('--holiday-emoji');
    }
    rootEl.dataset.holidayEmoji = details && details.emoji ? details.emoji : '';
    rootEl.dataset.holidayAccent = details && details.accent ? details.accent : '';
  }

  function handleStorageEvent(event) {
    if (!event.key || !managedStorageKeys.has(event.key)) return;
    const nextState = readPersistedState();
    const modeChanged = state.mode !== nextState.mode;
    const accentChanged = state.accent !== nextState.accent;
    const customChanged = state.lastCustomAccent !== nextState.lastCustomAccent;
    if (!modeChanged && !accentChanged && !customChanged) return;

    state.mode = nextState.mode;
    state.accent = nextState.accent;
    state.lastCustomAccent = nextState.lastCustomAccent;
    applyThemeForState();
  }

  function updateIconsForAccent(accent) {
    const themedIcons = doc.querySelectorAll('.icon-image');
    themedIcons.forEach((img) => {
      const lightSrc = img.dataset.iconLight;
      const darkSrc = img.dataset.iconDark;
      const prefersLightSrc = iconLightAccents.has(accent);
      const targetSrc = prefersLightSrc ? lightSrc || darkSrc : darkSrc || lightSrc;

      if (targetSrc && img.getAttribute('src') !== targetSrc) {
        img.setAttribute('src', targetSrc);
      }
    });
  }

  function updateAccentTextColor(mode) {
    if (root.__themeUtils && typeof root.__themeUtils.updateAccentTextColor === 'function') {
      root.__themeUtils.updateAccentTextColor(mode);
    } else {
      doc.documentElement.style.removeProperty('--accent-text');
    }
  }

  function setGiscusTheme(mode) {
    const iframe = doc.querySelector('iframe.giscus-frame');
    if (!iframe) return;
    const themeUrl = `https://mountgambeloak.dev/static/css/giscus-${mode}.css`;
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: themeUrl } } }, '*');
    }
  }

  function mountGiscusWithTheme(mode) {
    if (doc.querySelector('script[data-giscus]')) {
      setGiscusTheme(mode);
      return;
    }

    const container = doc.querySelector('.post-comments');
    if (!container) return;

    const script = doc.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-giscus', '');
    script.setAttribute('data-repo', 'MtGambelOak/MountGambelOak');
    script.setAttribute('data-repo-id', 'R_kgDOP8wx8w');
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDOP8wx884CwV-M');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-theme', `https://mountgambeloak.dev/static/css/giscus-${mode}.css`);

    container.appendChild(script);
  }
})(window);

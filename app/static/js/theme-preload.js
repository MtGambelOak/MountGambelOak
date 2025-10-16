(function (root) {
  const doc = root.document;
  if (!doc) return;

  const rootEl = doc.documentElement;
  if (!rootEl) return;

  const config = root.ThemeConfig || {};
  const storageKeys = config.storageKeys || {
    mode: 'theme-mode',
    accent: 'theme-accent',
    lastCustomAccent: 'last-custom-accent',
  };

  const defaults = {
    mode: config.defaultMode || 'system',
    accent: config.defaultAccent || 'holiday',
    lastCustomAccent:
      config.defaultCustomAccent || config.defaultAccent || 'forest',
  };

  const state = {
    mode: defaults.mode,
    accent: defaults.accent,
    lastCustomAccent: defaults.lastCustomAccent,
  };

  try {
    if (root.localStorage) {
      const storedMode = root.localStorage.getItem(storageKeys.mode);
      const storedAccent = root.localStorage.getItem(storageKeys.accent);
      const storedLast = root.localStorage.getItem(storageKeys.lastCustomAccent);
      if (storedMode) state.mode = storedMode;
      if (storedAccent) state.accent = storedAccent;
      if (storedLast) state.lastCustomAccent = storedLast;
    }
  } catch (err) {
    /* Ignore storage failures */
  }

  const resolvedMode = resolveActualMode(state.mode);
  const resolvedAccent = resolveAccent(state.accent);

  setRootClasses(rootEl, resolvedMode, resolvedAccent);
  applyHolidayDetails(rootEl);

  root.__themePreloadState__ = {
    mode: state.mode,
    accent: state.accent,
    lastCustomAccent: state.lastCustomAccent,
    resolvedMode,
    resolvedAccent: resolvedAccent,
  };

  function resolveSystemMode() {
    return root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function resolveActualMode(mode) {
    return mode === 'system' ? resolveSystemMode() : mode || defaults.mode;
  }

  function getHolidayDetails() {
    const details = root.__HOLIDAY_DETAILS__;
    if (details && typeof details === 'object') return details;
    return null;
  }

  function resolveAccent(accent) {
    if (accent === 'holiday') {
      const details = getHolidayDetails();
      if (details && details.accent) return details.accent;
      return state.lastCustomAccent || defaults.lastCustomAccent;
    }
    return accent || defaults.accent;
  }

  function setRootClasses(node, mode, accent) {
    const modeClasses = new Set(['light', 'dark']);
    Array.from(node.classList).forEach((cls) => {
      if (cls.startsWith('accent-') || modeClasses.has(cls)) {
        node.classList.remove(cls);
      }
    });
    node.classList.add(`accent-${accent}`);
    node.classList.add(mode);
  }

  function applyHolidayDetails(node) {
    const details = getHolidayDetails();
    if (details && details.emoji) {
      node.style.setProperty('--holiday-emoji', `"${details.emoji}"`);
    } else {
      node.style.removeProperty('--holiday-emoji');
    }
    node.dataset.holidayEmoji = details && details.emoji ? details.emoji : '';
    node.dataset.holidayAccent = details && details.accent ? details.accent : '';
  }
})(window);

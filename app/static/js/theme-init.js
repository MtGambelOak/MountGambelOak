(function () {
  const root = document.documentElement;

  function resolveSystemMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  try {
    let storedMode   = localStorage.getItem('theme-mode') || 'system';
    const storedAccent = localStorage.getItem('theme-accent') || 'holiday';

    const actualMode = storedMode === 'system' ? resolveSystemMode() : storedMode;

    root.classList.add(actualMode);
    root.classList.add('accent-' + storedAccent);
  } catch (err) {
    /* localStorage disabled — leave defaults */
  }

  if (window.__themeUtils && typeof window.__themeUtils.updateAccentTextColor === 'function') {
    window.__themeUtils.updateAccentTextColor(
      root.classList.contains('light') ? 'light' : 'dark'
    );
  }
})();
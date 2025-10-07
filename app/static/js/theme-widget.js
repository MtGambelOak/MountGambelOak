document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('theme-config-popup');
  const btn = document.getElementById('theme-config-btn');
  const closeBtn = document.getElementById('theme-config-close');
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const accentButtons = document.querySelectorAll('.accent-choice');
  const root = document.documentElement;
  const themedIcons = document.querySelectorAll('.icon-image');
  const themeUtils = window.__themeUtils || {};

  // Load saved settings or use fallback defaults
  const savedMode = localStorage.getItem('theme-mode') || 'dark';
  const savedAccent = localStorage.getItem('theme-accent') || 'sage';

  function updateIconsForMode(mode) {
    themedIcons.forEach(img => {
      const lightSrc = img.dataset.iconLight;
      const darkSrc = img.dataset.iconDark;
      if (!lightSrc && !darkSrc) return;
      const targetSrc = mode === 'light' ? (lightSrc || darkSrc) : (darkSrc || lightSrc);
      if (targetSrc && img.getAttribute('src') !== targetSrc) {
        img.setAttribute('src', targetSrc);
      }
    });
  }

  function applyTheme(accent, mode) {
    root.classList.remove(
      'accent-berry', 'accent-black', 'accent-brown',
      'accent-goldenrod', 'accent-gray', 'accent-green', 'accent-orange',
      'accent-purple', 'accent-red', 'accent-sage', 'accent-salmon',
      'accent-white', // <- new
      'light', 'dark'
    );
    if (accent) root.classList.add(`accent-${accent}`);
    if (mode) root.classList.add(mode);

    const resolvedMode = mode || (root.classList.contains('light') ? 'light' : 'dark');
    updateIconsForMode(resolvedMode);

    if (typeof themeUtils.updateAccentTextColor === 'function') {
      themeUtils.updateAccentTextColor(resolvedMode);
    } else {
      root.style.removeProperty('--accent-text');
    }
  }

  applyTheme(savedAccent, savedMode);

  modeRadios.forEach(radio => {
    radio.checked = radio.value === savedMode;
  });

  function highlightAccent(accent) {
    accentButtons.forEach(btn => {
      btn.style.outline = btn.dataset.accent === accent ? '2px solid #000' : 'none';
    });
  }

  highlightAccent(savedAccent);

  if (popup && btn) {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      popup.classList.toggle('hidden');
    });

    popup.addEventListener('click', e => {
      e.stopPropagation();
    });

    document.addEventListener('click', e => {
      if (!popup.contains(e.target) && e.target !== btn) {
        popup.classList.add('hidden');
      }
    });
  }

  if (closeBtn && popup) {
    closeBtn.addEventListener('click', () => {
      popup.classList.add('hidden');
    });
  }

  modeRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      const mode = e.target.value;
      const accent = localStorage.getItem('theme-accent') || 'sage';
      applyTheme(accent, mode);
      localStorage.setItem('theme-mode', mode);
    });
  });

  accentButtons.forEach(button => {
    button.addEventListener('click', e => {
      const accent = e.target.dataset.accent;
      const mode = localStorage.getItem('theme-mode') || 'dark';
      applyTheme(accent, mode);
      localStorage.setItem('theme-accent', accent);
      highlightAccent(accent);
    });
  });
});

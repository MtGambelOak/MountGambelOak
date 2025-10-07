// --- Giscus theme switcher ---
function setGiscusTheme(mode) {
  const url = `https://mountgambeloak.dev/static/css/giscus-${mode}.css`;
  const iframe = document.querySelector('iframe.giscus-frame');
  if (!iframe) return;
  iframe.contentWindow.postMessage(
    { giscus: { setConfig: { theme: url } } },
    '*'   // we allow any origin since it’s the official giscus.app embed
  );
}

// --- Mount Giscus dynamically ---
function mountGiscusWithTheme(mode) {
  // prevent double-mount
  if (document.querySelector('script[data-giscus]')) return;

  const s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  s.async = true;
  s.crossOrigin = 'anonymous';

  // marker so we don’t re-inject
  s.setAttribute('data-giscus', '');

  // config copied from your old HTML
  s.setAttribute('data-repo', 'MtGambelOak/MountGambelOak');
  s.setAttribute('data-repo-id', 'R_kgDOP8wx8w');
  s.setAttribute('data-category', 'Announcements');
  s.setAttribute('data-category-id', 'DIC_kwDOP8wx884CwV-M');
  s.setAttribute('data-mapping', 'pathname');
  s.setAttribute('data-strict', '0');
  s.setAttribute('data-reactions-enabled', '1');
  s.setAttribute('data-emit-metadata', '0');
  s.setAttribute('data-input-position', 'bottom');
  s.setAttribute('data-lang', 'en');

  // start with the correct theme
  s.setAttribute('data-theme', `https://mountgambeloak.dev/static/css/giscus-${mode}.css`);

  // append it into the comments container
  const container = document.querySelector('.post-comments');
  if (container) container.appendChild(s);
}

// --- Theme widget logic ---
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('theme-config-popup');
  const btn = document.getElementById('theme-config-btn');
  const closeBtn = document.getElementById('theme-config-close');
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const accentButtons = document.querySelectorAll('.accent-choice');
  const root = document.documentElement;
  const themedIcons = document.querySelectorAll('.icon-image');
  const themeUtils = window.__themeUtils || {};

  const savedMode = localStorage.getItem('theme-mode') || 'dark';
  const savedAccent = localStorage.getItem('theme-accent') || 'sage';

  // icon swap
  function updateIconsForMode(mode) {
    themedIcons.forEach(img => {
      const lightSrc = img.dataset.iconLight;
      const darkSrc = img.dataset.iconDark;
      const targetSrc = mode === 'light' ? (lightSrc || darkSrc) : (darkSrc || lightSrc);
      if (targetSrc && img.getAttribute('src') !== targetSrc) {
        img.setAttribute('src', targetSrc);
      }
    });
  }

  // apply theme to site
  function applyTheme(accent, mode) {
    root.classList.remove(
      'accent-berry', 'accent-black', 'accent-brown',
      'accent-goldenrod', 'accent-gray', 'accent-green', 'accent-orange',
      'accent-purple', 'accent-red', 'accent-sage', 'accent-salmon',
      'accent-white', 'light', 'dark'
    );

    if (accent) root.classList.add(`accent-${accent}`);
    if (mode) root.classList.add(mode);

    updateIconsForMode(mode);

    if (typeof themeUtils.updateAccentTextColor === 'function') {
      themeUtils.updateAccentTextColor(mode);
    } else {
      root.style.removeProperty('--accent-text');
    }
  }

  // --- apply theme on load and mount giscus
  applyTheme(savedAccent, savedMode);
  mountGiscusWithTheme(savedMode);

  // restore radio state
  modeRadios.forEach(radio => {
    radio.checked = radio.value === savedMode;
  });

  // accent highlight
  function highlightAccent(accent) {
    accentButtons.forEach(btn => {
      btn.style.outline = btn.dataset.accent === accent ? '2px solid #000' : 'none';
    });
  }
  highlightAccent(savedAccent);

  // popup toggle
  if (popup && btn) {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      popup.classList.toggle('hidden');
    });

    popup.addEventListener('click', e => e.stopPropagation());

    document.addEventListener('click', e => {
      if (!popup.contains(e.target) && e.target !== btn) popup.classList.add('hidden');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => popup.classList.add('hidden'));
  }

  // mode change
  modeRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      const mode = e.target.value;
      const accent = localStorage.getItem('theme-accent') || 'sage';
      applyTheme(accent, mode);
      localStorage.setItem('theme-mode', mode);
      setGiscusTheme(mode); // live switch
    });
  });

  // accent change
  accentButtons.forEach(button => {
    button.addEventListener('click', e => {
      const accent = e.target.dataset.accent;
      const mode = localStorage.getItem('theme-mode') || 'dark';
      applyTheme(accent, mode);
      localStorage.setItem('theme-accent', accent);
      highlightAccent(accent);
      // no Giscus change for accent
    });
  });
});

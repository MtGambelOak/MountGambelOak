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
  const accentContainer = document.getElementById('accent-list');
  const root = document.documentElement;
  const themedIcons = document.querySelectorAll('.icon-image');
  const themeUtils = window.__themeUtils || {};
  // resolve system default
  function resolveSystemMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const savedMode = localStorage.getItem('theme-mode') || 'system';
  const savedAccent = localStorage.getItem('theme-accent') || 'sage';

  // ---- Load accents JSON and build buttons ----
const accents = {
  red:       { color: '#B22222' },
  salmon:    { color: '#FA8072' },
  orange:    { color: '#D2691E' },
  amber:     { color: '#FFBF00' },
  goldenrod: { color: '#DAA520' },
  sand:      { color: '#C2B280' },
  olive:     { color: '#808000' },
  sage:      { color: '#5A7A39' },
  forest:    { color: '#1E5631' },
  teal:      { color: '#008080' },
  cyan:      { color: '#40E0D0' },
  blue:      { color: '#1E4D8F' },
  berry:     { color: '#9F5F9F' },
  purple:    { color: '#6A0DAD' },
  pink:      { color: '#FF69B4' },
  brown:     { color: '#964B00' },
  bronze:    { color: '#CD7F32' },
  gray:      { color: '#808080' },
  black:     { color: '#000000', mixDark: 'white' },
  ivory:     { color: '#F5F5DC' },
  white:     { color: '#FFFFFF' }
};


  // Build accent buttons
  for (const [name, def] of Object.entries(accents)) {
    const btnEl = document.createElement('button');
    btnEl.className = 'accent-choice';
    btnEl.dataset.accent = name;
    btnEl.style.background = def.color;
    btnEl.title = name[0].toUpperCase() + name.slice(1);
    accentContainer.appendChild(btnEl);
  }

  const accentButtons = accentContainer.querySelectorAll('.accent-choice');

    (function injectAccentCSS() {
    const style = document.createElement('style');
    let css = '';
    for (const [name, def] of Object.entries(accents)) {
      css += `.accent-${name} { --accent: ${def.color};`;
      if (def.mixDark) css += ` --mix-dark: ${def.mixDark};`;
      if (def.mixLight) css += ` --mix-light: ${def.mixLight};`;
      css += `}\n`;
    }
    style.textContent = css;
    document.head.appendChild(style);
  })();

  // icon swap
  function updateIconsForAccent(accent) {
    themedIcons.forEach(img => {
      const lightSrc = img.dataset.iconLight;
      const darkSrc = img.dataset.iconDark;
      const targetSrc = (accent === 'white' || accent === 'ivory')
        ? (lightSrc || darkSrc)
        : (darkSrc || lightSrc);
      if (targetSrc && img.getAttribute('src') !== targetSrc) {
        img.setAttribute('src', targetSrc);
      }
    });
  }

  // apply theme to site
  function applyTheme(accent, mode) {
    const actualMode = (mode === 'system') ? resolveSystemMode() : mode; 
    root.className = '';
    root.classList.add(`accent-${accent}`);
    root.classList.add(actualMode);

    updateIconsForAccent(accent);

    if (typeof themeUtils.updateAccentTextColor === 'function') {
      themeUtils.updateAccentTextColor(actualMode);
    } else {
      root.style.removeProperty('--accent-text');
    }
  }

  // --- apply theme on load and mount giscus
  applyTheme(savedAccent, savedMode);
  mountGiscusWithTheme(savedMode === 'system' ? resolveSystemMode() : savedMode);

  // restore radio state
  modeRadios.forEach(radio => {
    radio.checked = radio.value === savedMode;
  });

  function highlightAccent(accent) {
    accentButtons.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.accent === accent);
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

  if (closeBtn) closeBtn.addEventListener('click', () => popup.classList.add('hidden'));

  // mode change
  modeRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      const mode = e.target.value;
      const accent = localStorage.getItem('theme-accent') || 'sage';
      applyTheme(accent, mode);
      localStorage.setItem('theme-mode', mode);
      setGiscusTheme(mode === 'system' ? resolveSystemMode() : mode);
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
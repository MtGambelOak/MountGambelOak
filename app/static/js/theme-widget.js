document.addEventListener('DOMContentLoaded', () => {
  const manager = window.ThemeManager;
  if (!manager) return;

  const popup = document.getElementById('theme-config-popup');
  const toggleBtn = document.getElementById('theme-config-btn');
  const closeBtn = document.getElementById('theme-config-close');
  const accentContainer = document.getElementById('accent-list');
  if (!popup || !toggleBtn || !accentContainer) return;

  const modeRadios = Array.from(document.querySelectorAll('input[name="mode"]'));
  const accentModeRadios = Array.from(document.querySelectorAll('input[name="accent-mode"]'));
  const customAccentRadio = accentModeRadios.find((radio) => radio.value === 'custom');

  buildAccentPalette(manager.getPalette(), accentContainer);
  const accentButtons = Array.from(accentContainer.querySelectorAll('.accent-choice'));

  function buildAccentPalette(palette, container) {
    container.innerHTML = '';
    Object.entries(palette).forEach(([name, def]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'accent-choice';
      button.dataset.accent = name;
      button.style.background = def.color;
      button.title = name.charAt(0).toUpperCase() + name.slice(1);
      button.setAttribute('aria-label', `${name} accent`);
      container.appendChild(button);
    });
  }

  function highlightAccent(accent) {
    accentButtons.forEach((button) => {
      const isSelected = button.dataset.accent === accent;
      button.classList.toggle('selected', isSelected);
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }

  function syncWithState(snapshot) {
    modeRadios.forEach((radio) => {
      radio.checked = radio.value === snapshot.mode;
    });

    const accentMode = snapshot.accent === 'holiday' ? 'holiday' : 'custom';
    accentModeRadios.forEach((radio) => {
      radio.checked = radio.value === accentMode;
    });

    if (snapshot.accent === 'holiday') {
      highlightAccent(null);
    } else {
      highlightAccent(snapshot.accent);
    }
  }

  manager.subscribe(syncWithState);
  syncWithState(manager.getResolvedState());

  toggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    popup.classList.toggle('hidden');
  });

  popup.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', (event) => {
    if (!popup.contains(event.target) && event.target !== toggleBtn) {
      popup.classList.add('hidden');
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => popup.classList.add('hidden'));
  }

  modeRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      manager.setMode(event.target.value);
    });
  });

  accentModeRadios.forEach((radio) => {
    radio.addEventListener('change', (event) => {
      if (event.target.value === 'holiday') {
        manager.setAccent('holiday');
      } else {
        const palette = manager.getPalette();
        const fallbackAccent =
          manager.getLastCustomAccent() || Object.keys(palette)[0] || 'forest';
        manager.setAccent(fallbackAccent);
      }
    });
  });

  accentButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const accent = event.currentTarget.dataset.accent;
      manager.setLastCustomAccent(accent);
      if (customAccentRadio && customAccentRadio.checked) {
        manager.setAccent(accent);
      }
    });
  });
});

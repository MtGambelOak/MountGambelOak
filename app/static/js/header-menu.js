document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.site-nav-toggle');
  const panel = document.getElementById('site-header-panel');
  const brand = header ? header.querySelector('.site-header-brand') : null;
  const nav = panel ? panel.querySelector('nav') : null;
  if (!header || !toggle || !panel || !brand || !nav) return;

  const closeNav = () => {
    if (!header.classList.contains('is-collapsible')) return;
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
  };

  const openNav = () => {
    if (!header.classList.contains('is-collapsible')) return;
    header.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
  };

  toggle.addEventListener('click', () => {
    if (!header.classList.contains('is-collapsible')) return;
    const willOpen = !header.classList.contains('is-open');
    if (willOpen) {
      openNav();
    } else {
      closeNav();
      toggle.focus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      header.classList.contains('is-collapsible') &&
      header.classList.contains('is-open')
    ) {
      closeNav();
      toggle.focus();
    }
  });

  panel.addEventListener('click', (event) => {
    if (!header.classList.contains('is-collapsible')) return;
    const link = event.target.closest('a');
    if (link && link.closest('nav')) {
      closeNav();
    }
  });

  document.addEventListener('click', (event) => {
    if (
      header.classList.contains('is-collapsible') &&
      header.classList.contains('is-open') &&
      !header.contains(event.target)
    ) {
      closeNav();
    }
  });

  const evaluateLayout = () => {
    const wasCollapsible = header.classList.contains('is-collapsible');
    const wasOpen = header.classList.contains('is-open');

    header.classList.remove('is-collapsible', 'is-open');
    panel.removeAttribute('aria-hidden');
    toggle.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');

    const brandRect = brand.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const panelWrapped = panelRect.top - brandRect.top > 1;
    const navOverflow = nav.scrollWidth - nav.clientWidth > 1;
    const shouldCollapse = panelWrapped || navOverflow;

    if (wasCollapsible) {
      header.classList.add('is-collapsible');
      toggle.hidden = false;
      toggle.setAttribute('aria-expanded', wasOpen ? 'true' : 'false');
      panel.setAttribute('aria-hidden', wasOpen ? 'false' : 'true');
      if (wasOpen) {
        header.classList.add('is-open');
      }
    }

    if (shouldCollapse === wasCollapsible) {
      return;
    }

    if (shouldCollapse) {
      header.classList.add('is-collapsible');
      panel.setAttribute('aria-hidden', 'true');
      toggle.hidden = false;
      toggle.setAttribute('aria-expanded', 'false');
      if (wasOpen) {
        openNav();
      } else {
        header.classList.remove('is-open');
      }
    } else {
      header.classList.remove('is-collapsible', 'is-open');
      panel.removeAttribute('aria-hidden');
      toggle.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  };

  const scheduleLayoutEvaluation = () => {
    if (header.__layoutFrame) return;
    header.__layoutFrame = window.requestAnimationFrame(() => {
      header.__layoutFrame = null;
      evaluateLayout();
    });
  };

  evaluateLayout();

  const ro = new ResizeObserver(() => scheduleLayoutEvaluation());
  ro.observe(header);
  ro.observe(panel);
  window.addEventListener('resize', scheduleLayoutEvaluation);
});

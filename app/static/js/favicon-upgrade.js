(function attachSvgFavicon() {
  const script = document.currentScript;
  if (!script) return;
  const svgHref = script.dataset.svgFavicon;
  if (!svgHref) return;

  try {
    const existing = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
    if (existing) {
      existing.href = svgHref;
      return;
    }
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = svgHref;
    link.sizes = 'any';
    document.head.appendChild(link);
  } catch (err) {
    // Ignore—fallback ICO remains available to the browser.
  }
})();

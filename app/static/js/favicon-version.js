(function() {
  const favicon = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
  if (!favicon) return;

  // Get current date as YYYYMMDD
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStamp = `${y}${m}${d}`;

  // Original href without any query param
  const baseHref = favicon.getAttribute('href').split('?')[0];

  // Update href with date param to bust cache daily
  favicon.href = `${baseHref}?v=${dateStamp}`;
})();

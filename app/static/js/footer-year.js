(function () {
  var yearEl = document.getElementById('footer-year');
  if (!yearEl) return;
  yearEl.textContent = String(new Date().getFullYear());
})();

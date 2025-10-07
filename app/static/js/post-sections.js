(function () {
  if (typeof document === 'undefined') return;

  var headingsData = window.__POST_HEADINGS__ || [];
  if (!headingsData.length) return;

  var article = document.querySelector('.post-article');
  var outline = document.querySelector('.post-outline');
  if (!article || !outline) return;

  // attach IDs to headings
  var headingNodes = Array.from(article.querySelectorAll('h2'));
  headingsData.forEach(function (item, index) {
    var node = headingNodes[index];
    if (node && item && !node.id) node.id = item.id;
  });

  var links = Array.from(outline.querySelectorAll('a[data-heading-id]'));
  if (!links.length) return;

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle('active', link.dataset.headingId === id);
    });
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  var layout = { ranges: [] };

  function measureLayout() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    var articleRect = article.getBoundingClientRect();
    var articleTop = scrollTop + articleRect.top;
    var articleHeight = Math.max(article.scrollHeight || 0, articleRect.height || 0) || 1;

    layout.ranges = headingNodes.map(function (node, i, list) {
      var currentRect = node.getBoundingClientRect();
      var currentTop = clamp01((scrollTop + currentRect.top - articleTop) / articleHeight);

      var next = list[i + 1];
      var nextTop = next
        ? clamp01((scrollTop + next.getBoundingClientRect().top - articleTop) / articleHeight)
        : 1;

      return {
        id: node.id,
        start: currentTop,
        end: Math.max(currentTop, nextTop)
      };
    });

    if (layout.ranges.length) {
      layout.ranges[0].start = 0;                    // ensure first starts at 0
      layout.ranges[layout.ranges.length - 1].end = 1; // ensure last reaches 1
    }
  }

  function findActiveRange(percent) {
    var ranges = layout.ranges;
    if (!ranges.length) return null;

    if (percent <= ranges[0].start) return ranges[0].id;
    if (percent >= ranges[ranges.length - 1].end) return ranges[ranges.length - 1].id;

    for (var i = 0; i < ranges.length; i++) {
      var r = ranges[i];
      if (percent >= r.start && percent < r.end) return r.id;
    }
    return ranges[ranges.length - 1].id;
  }

  // *** Use entire page scroll progress ***
  function resolveScrollPercent() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return clamp01(scrollTop / (docHeight || 1));
  }

  function updateActiveOnScroll() {
    if (!layout.ranges.length) return;
    var percent = resolveScrollPercent();
    var activeId = findActiveRange(percent);
    if (activeId) setActive(activeId);
  }

  function findRangeById(id) {
    for (var i = 0; i < layout.ranges.length; i++) {
      if (layout.ranges[i].id === id) return layout.ranges[i];
    }
    return null;
  }

  function scrollDocumentToPercent(percent) {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var adjusted = clamp01(percent + 0.01); // nudge down an extra 1%
    var target = adjusted * (docHeight || 1);
    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  var ticking = false;
  function requestUpdate(fn) {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      fn();
    });
  }

  function handleScroll() { requestUpdate(updateActiveOnScroll); }
  function handleResize() {
    requestUpdate(function () {
      measureLayout();
      updateActiveOnScroll();
    });
  }

  // init
  measureLayout();
  updateActiveOnScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  window.addEventListener('load', handleResize);

  outline.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-heading-id]');
    if (!link) return;
    event.preventDefault();
    var headingId = link.dataset.headingId;
    setActive(headingId);

    if (!layout.ranges.length) measureLayout();
    var range = findRangeById(headingId);

    if (range) {
      scrollDocumentToPercent(range.start);
    } else {
      var node = document.getElementById(headingId);
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

(function () {
  if (typeof document === 'undefined') return;

  var headingsData = window.__POST_HEADINGS__ || [];
  if (!headingsData.length) return;

  var article = document.querySelector('.post-article');
  var outline = document.querySelector('.post-outline');
  if (!article || !outline) return;

  var list = outline.querySelector('ol');
  if (!list) return;

  // attach IDs to headings
  var headingNodes = Array.from(article.querySelectorAll('h2'));
  headingsData.forEach(function (item, index) {
    var node = headingNodes[index];
    if (node && item && !node.id) node.id = item.id;
  });

  var links = Array.from(outline.querySelectorAll('a[data-heading-id]'));
  if (!links.length) return;

  // build indicator scaffold
  var listWrapper = document.createElement('div');
  listWrapper.className = 'post-outline-list';
  outline.insertBefore(listWrapper, list);
  listWrapper.appendChild(list);

  var track = document.createElement('div');
  track.className = 'post-outline-track';
  track.setAttribute('aria-hidden', 'true');
  var indicator = document.createElement('div');
  indicator.className = 'post-outline-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  listWrapper.appendChild(track);
  listWrapper.appendChild(indicator);

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle('active', link.dataset.headingId === id);
    });
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  var layout = {
    ranges: [],
    linkCenters: [],
    trackStart: 0,
    trackEnd: 0,
    trackSpan: 0,
    indicatorHeight: 0,
    articleTop: 0,
    articleHeight: 1
  };

  function measureLayout() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    var articleRect = article.getBoundingClientRect();
    var articleTop = scrollTop + articleRect.top;
    var articleHeight = Math.max(article.scrollHeight || 0, articleRect.height || 0) || 1;

    layout.articleTop = articleTop;
    layout.articleHeight = articleHeight;

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

    var wrapperRect = listWrapper.getBoundingClientRect();

    layout.linkCenters = links.map(function (link) {
      var rect = link.getBoundingClientRect();
      return (rect.top - wrapperRect.top) + (rect.height / 2);
    });

    if (layout.linkCenters.length) {
      layout.trackStart = layout.linkCenters[0];
      layout.trackEnd = layout.linkCenters[layout.linkCenters.length - 1];
      layout.trackSpan = Math.max(0, layout.trackEnd - layout.trackStart);
    } else {
      layout.trackStart = 0;
      layout.trackEnd = 0;
      layout.trackSpan = 0;
    }

    var anchorHeight = links[0] ? links[0].offsetHeight : 0;
    layout.indicatorHeight = indicator.offsetHeight || anchorHeight || 0;
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

  function resolveArticlePercent() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    if (scrollTop <= layout.articleTop) return 0;
    var focusLine = scrollTop + viewportHeight * 0.25; // bias toward upper viewport
    if (focusLine < layout.articleTop) focusLine = layout.articleTop;
    var percent = (focusLine - layout.articleTop) / (layout.articleHeight || 1);
    return clamp01(percent);
  }

  function findNearestLinkByCenter(targetCenter) {
    var centers = layout.linkCenters;
    if (!centers.length) return null;

    var nearestId = null;
    var shortestDistance = Infinity;

    for (var i = 0; i < centers.length; i++) {
      var distance = Math.abs(centers[i] - targetCenter);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestId = links[i].dataset.headingId;
      }
    }

    return nearestId;
  }

  function updateOutlineState() {
    if (!layout.ranges.length) return;
    var percent = resolveArticlePercent();

    var indicatorCenter = layout.trackStart + layout.trackSpan * percent;
    if (!isFinite(indicatorCenter)) indicatorCenter = layout.trackStart;

    var indicatorTop = indicatorCenter - (layout.indicatorHeight / 2);
    if (!isFinite(indicatorTop)) indicatorTop = 0;

    indicator.style.transform = 'translateY(' + indicatorTop + 'px)';

    var activeId = findNearestLinkByCenter(indicatorCenter) || findActiveRange(percent);
    if (activeId) setActive(activeId);
  }

  function findRangeById(id) {
    for (var i = 0; i < layout.ranges.length; i++) {
      if (layout.ranges[i].id === id) return layout.ranges[i];
    }
    return null;
  }

  function scrollDocumentToPercent(percent) {
    var articleHeight = layout.articleHeight || 1;
    var articleTop = layout.articleTop;
    var focusOffset = window.innerHeight ? window.innerHeight * 0.1 : 0;
    var target = articleTop + clamp01(percent) * articleHeight - focusOffset;
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

  function handleScroll() { requestUpdate(updateOutlineState); }
  function handleResize() {
    requestUpdate(function () {
      measureLayout();
      updateOutlineState();
    });
  }

  // init
  measureLayout();
  updateOutlineState();

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

(function () {
  if (typeof document === 'undefined') return;
  var headingsData = window.__POST_HEADINGS__ || [];
  if (!headingsData.length) return;

  var article = document.querySelector('.post-article');
  var outline = document.querySelector('.post-outline');
  if (!article || !outline) return;

  var headingNodes = Array.from(article.querySelectorAll('h2'));
  headingsData.forEach(function (item, index) {
    var node = headingNodes[index];
    if (!node || !item) return;
    if (!node.id) node.id = item.id;
  });

  var links = Array.from(outline.querySelectorAll('a[data-heading-id]'));
  if (!links.length) return;

  var linkMap = new Map();
  links.forEach(function (link) {
    linkMap.set(link.dataset.headingId, link);
  });

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle('active', link.dataset.headingId === id);
    });
  }

  var observer = new IntersectionObserver(function(entries) {
    var visible = null;
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        visible = entry.target.id;
      }
    });
    if (visible) {
      setActive(visible);
    }
  }, {
    rootMargin: '-40% 0px -50% 0px',
    threshold: [0, 0.3, 1]
  });

  headingNodes.forEach(function (node) {
    if (node.id) observer.observe(node);
  });

  outline.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-heading-id]');
    if (!link) return;
    var id = link.dataset.headingId;
    if (!id) return;
    setActive(id);
  });
})();

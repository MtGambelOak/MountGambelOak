(function () {
  if (typeof document === 'undefined') return;

  const filterBar = document.querySelector('.blog-tag-filter');
  const postCards = document.querySelectorAll('.blog-card');
  if (!filterBar || !postCards.length) return;

  const filterButtons = filterBar.querySelectorAll('.tag-chip');
  const cardList = document.querySelector('.blog-card-list');

  function activate(tag) {
    filterButtons.forEach(btn => {
      const matches = btn.dataset.tag === tag;
      btn.classList.toggle('tag-chip--active', matches);
    });

    postCards.forEach(card => {
      if (tag === 'all') {
        card.hidden = false;
        return;
      }
      const tags = (card.dataset.tags || '').split(/\s+/).filter(Boolean);
      card.hidden = !tags.includes(tag);
    });
  }

  filterBar.addEventListener('click', event => {
    const button = event.target.closest('.tag-chip');
    if (!button) return;
    const tag = button.dataset.tag;
    if (!tag) return;
    updateQuery(tag);
    activate(tag);
  });

  if (cardList) {
    cardList.addEventListener('click', event => {
      const button = event.target.closest('.tag-chip');
      if (!button) return;
      const tag = button.dataset.tag;
      if (!tag) return;
      updateQuery(tag);
      activate(tag);
      const targetFilter = Array.from(filterButtons).find(btn => btn.dataset.tag === tag);
      if (targetFilter) targetFilter.focus();
    });
  }

  function updateQuery(tag) {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (tag === 'all') {
      url.searchParams.delete('tag');
    } else {
      url.searchParams.set('tag', tag);
    }
    window.history.replaceState({}, '', url);
  }

  function init() {
    activate('all');
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const initialTag = params.get('tag');
    if (!initialTag) return;
    const target = Array.from(filterButtons).find(btn => btn.dataset.tag === initialTag);
    if (target) {
      activate(initialTag);
    }
  }

  init();
})();

(function () {
  if (typeof document === 'undefined') return;

  const filterBar = document.querySelector('.blog-tag-filter');
  const postCards = Array.from(document.querySelectorAll('.blog-card'));
  if (!filterBar || !postCards.length) return;

  const filterButtons = Array.from(filterBar.querySelectorAll('.tag-chip'));
  const cardList = document.querySelector('.blog-card-list');
  const tagToCards = new Map();

  postCards.forEach((card) => {
    const tags = parseTags(card.dataset.tags);
    tags.forEach((tag) => {
      if (!tagToCards.has(tag)) {
        tagToCards.set(tag, new Set());
      }
      tagToCards.get(tag).add(card);
    });
  });

  let activeTag = null;
  let visibleCards = new Set(postCards);

  function setCardHidden(card, hidden) {
    if (card.hidden === hidden) return;
    card.hidden = hidden;
    card.classList.toggle('blog-card--hidden', hidden);
  }

  function activate(tag) {
    if (!tag || tag === activeTag) return;

    filterButtons.forEach((btn) => {
      const matches = btn.dataset.tag === tag;
      btn.classList.toggle('tag-chip--active', matches);
      btn.setAttribute('aria-pressed', matches ? 'true' : 'false');
    });

    const source = tag === 'all' ? postCards : tagToCards.get(tag);
    const nextVisible = new Set(source || []);

    nextVisible.forEach((card) => setCardHidden(card, false));
    visibleCards.forEach((card) => {
      if (!nextVisible.has(card)) {
        setCardHidden(card, true);
      }
    });

    activeTag = tag;
    visibleCards = nextVisible;
  }

  filterBar.addEventListener('click', (event) => {
    const button = event.target.closest('.tag-chip');
    if (!button) return;
    const tag = button.dataset.tag;
    if (!tag) return;
    event.preventDefault();
    updateQuery(tag);
    activate(tag);
  });

  if (cardList) {
    cardList.addEventListener('click', (event) => {
      const button = event.target.closest('.tag-chip');
      if (!button) return;
      const tag = button.dataset.tag;
      if (!tag) return;
      event.preventDefault();
      updateQuery(tag);
      activate(tag);
      const targetFilter = filterButtons.find((btn) => btn.dataset.tag === tag);
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
    const target = filterButtons.find((btn) => btn.dataset.tag === initialTag);
    if (target) {
      activate(initialTag);
    }
  }

  init();

  function parseTags(raw) {
    if (!raw) return [];
    if (raw.includes('||')) {
      return raw.split('||').map((tag) => tag.trim()).filter(Boolean);
    }
    return raw.split(/\s+/).map((tag) => tag.trim()).filter(Boolean);
  }
})();

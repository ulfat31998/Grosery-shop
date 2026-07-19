/* =============================================================
   SHOP BY CATEGORY — selection, search & filtering behaviour
   Vanilla ES6. No dependencies.

   How it works
   ------------
   - Each category chip carries data-category="slug".
   - Each product card carries data-gs-product="slug" and
     data-gs-name="searchable text".
   - "all" always matches every product.
   - Category selection and the search box combine with AND logic:
     a product must match BOTH the active category and the search
     term to be shown.
   - Adding more products later needs zero JS changes — just add
     more `.gs-product` cards with the right data attributes.
============================================================= */
(function () {
  const section = document.querySelector('[data-gs]');
  if (!section) return;

  const chips        = Array.from(section.querySelectorAll('.gs-chip'));
  const chipScroll    = section.querySelector('[data-gs-cat-scroll]');
  const products      = Array.from(section.querySelectorAll('[data-gs-product]'));
  const emptyState    = section.querySelector('[data-gs-empty]');
  const countLabel    = section.querySelector('[data-gs-count]');
  const searchInput   = section.querySelector('[data-gs-search]');
  const catBar        = section.querySelector('[data-gs-cat-bar]');
  const stickSentinel = section.querySelector('[data-gs-stick-sentinel]');

  let activeCategory = 'all';
  let searchTerm = '';

  /* ---------- filtering ---------- */
  function applyFilter() {
    let visibleCount = 0;

    products.forEach((product) => {
      const matchesCategory = activeCategory === 'all' || product.dataset.gsProduct === activeCategory;
      const matchesSearch = !searchTerm || product.dataset.gsName.toLowerCase().includes(searchTerm);
      const matches = matchesCategory && matchesSearch;

      product.classList.toggle('is-hidden', !matches);

      if (matches) {
        visibleCount += 1;
        // restart the fade-in animation so newly-shown cards animate in
        product.classList.remove('is-entering');
        void product.offsetWidth; // force reflow to restart the CSS animation
        product.classList.add('is-entering');
      }
    });

    if (emptyState) emptyState.classList.toggle('is-visible', visibleCount === 0);

    if (countLabel) {
      countLabel.textContent = `${visibleCount} item${visibleCount === 1 ? '' : 's'}`;
    }
  }

  /* ---------- category selection ---------- */
  function setActiveCategory(chip) {
    const category = chip.dataset.category;
    if (category === activeCategory) return;

    chips.forEach((c) => {
      c.classList.remove('is-active');
      c.setAttribute('aria-selected', 'false');
    });

    chip.classList.add('is-active');
    chip.setAttribute('aria-selected', 'true');
    activeCategory = category;

    // keep the selected chip comfortably in view on mobile swipe
    chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    applyFilter();
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => setActiveCategory(chip));
  });

  /* ---------- search ---------- */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilter();
    });
  }

  /* ---------- sticky-state detection ----------
     position: sticky has no native "stuck" event, so a zero-height
     sentinel placed just above the bar is watched with an
     IntersectionObserver: once it scrolls out of view, the bar
     must be pinned to the top, and we add a class for the
     shadow/border treatment. ---------- */
  if (stickSentinel && catBar && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        catBar.classList.toggle('is-stuck', !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(stickSentinel);
  }

  /* ---------- keyboard support for the scroll strip ----------
     Left/Right arrow keys move focus between chips so keyboard
     users can navigate the strip without tabbing through each one. */
  if (chipScroll) {
    chipScroll.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const currentIndex = chips.indexOf(document.activeElement);
      if (currentIndex === -1) return;
      e.preventDefault();
      const nextIndex = e.key === 'ArrowRight'
        ? Math.min(currentIndex + 1, chips.length - 1)
        : Math.max(currentIndex - 1, 0);
      chips[nextIndex].focus();
    });
  }

  applyFilter();
})();

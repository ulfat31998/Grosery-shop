/* =============================================================
   SHOP BY CATEGORY — selection + filtering behaviour
   Drop-in: works with any product grid where each product card
   carries a `data-category="slug"` attribute matching a
   `.sbc-card[data-category="slug"]` button.
============================================================= */
(function () {
  const section = document.querySelector('[data-sbc]');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('.sbc-card'));
  const products = Array.from(document.querySelectorAll('[data-sbc-product]'));
  const emptyState = section.querySelector('.sbc-empty');
  const clearBtn = section.querySelector('.sbc-clear');
  const countLabel = section.querySelector('[data-sbc-count]');

  let activeCategory = null;

  function applyFilter() {
    let visibleCount = 0;

    products.forEach((product) => {
      const matches = !activeCategory || product.dataset.sbcProduct === activeCategory;
      product.classList.toggle('is-hidden', !matches);
      if (matches) {
        visibleCount += 1;
        product.classList.remove('is-entering');
        // restart the entrance animation on each filter change
        void product.offsetWidth;
        product.classList.add('is-entering');
      }
    });

    if (emptyState) emptyState.classList.toggle('is-visible', visibleCount === 0);
    if (clearBtn) clearBtn.classList.toggle('is-visible', Boolean(activeCategory));

    if (countLabel) {
      countLabel.textContent = activeCategory
        ? `${visibleCount} item${visibleCount === 1 ? '' : 's'}`
        : `${products.length} items`;
    }
  }

  function setActive(card) {
    const category = card.dataset.category;
    const isSame = activeCategory === category;

    cards.forEach((c) => {
      c.classList.remove('is-active');
      c.setAttribute('aria-pressed', 'false');
    });

    activeCategory = isSame ? null : category;

    if (!isSame) {
      card.classList.add('is-active', 'is-selecting');
      card.setAttribute('aria-pressed', 'true');
      window.setTimeout(() => card.classList.remove('is-selecting'), 650);
    }

    applyFilter();
  }

  cards.forEach((card) => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', 'false');

    card.addEventListener('click', () => setActive(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(card);
      }
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      cards.forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      activeCategory = null;
      applyFilter();
    });
  }

  applyFilter();
})();

/* =============================================================
   HARVESTLY — script.js
   Vanilla JS only. No dependencies.
============================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setYear();
    initHeaderScroll();
    initMobileNav();
    initSearchPanel();
    initRevealAnimations();
    initCart();
    initHeroSearch();
    initCountdowns();
    initReviewSlider();
    initAccordion();
    initContactForm();
    initNewsletterForm();
    initBackToTop();
    initSmoothAnchorFocus();
  }

  /* ---------- Footer year ---------- */
  function setYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  function initHeaderScroll() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 12) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav toggle ---------- */
  function initMobileNav() {
    var toggle = document.getElementById('menuToggle');
    var nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Search panel ---------- */
  function initSearchPanel() {
    var openBtn = document.getElementById('searchToggle');
    var closeBtn = document.getElementById('searchClose');
    var panel = document.getElementById('searchPanel');
    var input = document.getElementById('searchInput');
    if (!openBtn || !panel) return;

    openBtn.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      openBtn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen && input) setTimeout(function () { input.focus(); }, 300);
    });
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        panel.classList.remove('open');
        openBtn.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* ---------- Scroll reveal animations ---------- */
  function initRevealAnimations() {
    var items = document.querySelectorAll('.reveal-up');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          setTimeout(function () { el.classList.add('in-view'); }, (i % 6) * 70);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Cart (add-to-cart micro interaction) ---------- */
  function initCart() {
    var countEl = document.getElementById('cartCount');
    var addButtons = document.querySelectorAll('.add-btn');
    var count = 0;

    addButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        count += 1;
        if (countEl) {
          countEl.textContent = String(count);
          countEl.classList.remove('bump');
          void countEl.offsetWidth; /* restart animation */
          countEl.classList.add('bump');
        }
        var name = btn.getAttribute('data-name') || 'Item';
        showToast(name + ' added to cart');
      });
    });
  }

  /* ---------- Hero pincode check ---------- */
  function initHeroSearch() {
    var form = document.getElementById('heroSearchForm');
    var note = document.getElementById('heroNote');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('heroPincode');
      var value = (input.value || '').trim();
      if (!value) return;
      if (note) {
        note.textContent = 'Great news — Harvestly delivers to ' + value + ' in under 90 minutes.';
      }
      input.value = '';
    });
  }

  /* ---------- Daily deals countdown ---------- */
  function initCountdowns() {
    var cards = document.querySelectorAll('.countdown');
    if (!cards.length) return;

    cards.forEach(function (el) {
      var hours = parseInt(el.getAttribute('data-hours'), 10) || 0;
      var mins = parseInt(el.getAttribute('data-mins'), 10) || 0;
      var totalSeconds = hours * 3600 + mins * 60;

      var hEl = el.querySelector('.cd-h');
      var mEl = el.querySelector('.cd-m');
      var sEl = el.querySelector('.cd-s');

      function render() {
        var h = Math.floor(totalSeconds / 3600);
        var m = Math.floor((totalSeconds % 3600) / 60);
        var s = totalSeconds % 60;
        if (hEl) hEl.textContent = pad(h);
        if (mEl) mEl.textContent = pad(m);
        if (sEl) sEl.textContent = pad(s);
      }

      render();
      setInterval(function () {
        if (totalSeconds > 0) {
          totalSeconds -= 1;
          render();
        }
      }, 1000);
    });

    function pad(n) { return n < 10 ? '0' + n : String(n); }
  }

  /* ---------- Review slider ---------- */
  function initReviewSlider() {
    var track = document.getElementById('reviewTrack');
    var dotsWrap = document.getElementById('reviewDots');
    var prevBtn = document.getElementById('reviewPrev');
    var nextBtn = document.getElementById('reviewNext');
    if (!track || !dotsWrap) return;

    var slides = track.children;
    var total = slides.length;
    var index = 0;
    var autoTimer;

    for (var i = 0; i < total; i++) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      (function (idx) {
        dot.addEventListener('click', function () { goTo(idx); resetAuto(); });
      })(i);
      dotsWrap.appendChild(dot);
    }

    function update() {
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
        d.classList.toggle('active', i === index);
      });
    }

    function goTo(i) {
      index = (i + total) % total;
      update();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); resetAuto(); });

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () { goTo(index + 1); }, 6000);
    }

    track.style.transition = 'transform .5s ease';
    Array.prototype.forEach.call(slides, function (s) { s.style.flex = '0 0 100%'; });

    resetAuto();
  }

  /* ---------- FAQ accordion ---------- */
  function initAccordion() {
    var items = document.querySelectorAll('.accordion-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var trigger = item.querySelector('.accordion-trigger');
      var panel = item.querySelector('.accordion-panel');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';

        items.forEach(function (other) {
          var otherTrigger = other.querySelector('.accordion-trigger');
          var otherPanel = other.querySelector('.accordion-panel');
          if (otherTrigger && otherPanel) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherPanel.style.maxHeight = null;
          }
        });

        if (!isOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------- Contact form validation ---------- */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    var success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var fields = form.querySelectorAll('.form-field');

      fields.forEach(function (field) {
        var control = field.querySelector('input, textarea');
        if (!control) return;
        var ok = control.checkValidity() && control.value.trim() !== '';
        field.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });

      if (valid) {
        if (success) success.classList.add('show');
        form.reset();
        fields.forEach(function (f) { f.classList.remove('invalid'); });
        showToast('Message sent — we will reply within one business day.');
        setTimeout(function () {
          if (success) success.classList.remove('show');
        }, 6000);
      }
    });
  }

  /* ---------- Newsletter form ---------- */
  function initNewsletterForm() {
    var form = document.getElementById('newsletterForm');
    var success = document.getElementById('newsletterSuccess');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (!input || !input.checkValidity() || !input.value.trim()) {
        input && input.reportValidity();
        return;
      }
      if (success) success.classList.add('show');
      form.reset();
      setTimeout(function () {
        if (success) success.classList.remove('show');
      }, 6000);
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Toast helper ---------- */
  var toastTimer;
  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2600);
  }

  /* ---------- Move focus on in-page anchor nav for accessibility ---------- */
  function initSmoothAnchorFocus() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (target) {
          setTimeout(function () {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }, 500);
        }
      });
    });
  }
})();

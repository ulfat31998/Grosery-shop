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
    initCheckout();
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

  /* ---------- Cart ---------- */
  var CART_STORAGE_KEY = 'harvestlyCart';
  var cart = [];

  function initCart() {
    cart = loadCart();

    var addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-name') || 'Item';
        var price = parseFloat(btn.getAttribute('data-price')) || 0;
        addToCart(name, price);
        bumpCartCount();
        showToast(name + ' added to cart');
      });
    });

    var cartBtn = document.getElementById('cartBtn');
    var closeBtn = document.getElementById('cartClose');
    var overlay = document.getElementById('cartOverlay');

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCart();
    });

    var itemsWrap = document.getElementById('cartItems');
    if (itemsWrap) {
      itemsWrap.addEventListener('click', function (e) {
        var target = e.target;
        var row = target.closest ? target.closest('.cart-item') : null;
        if (!row) return;
        var name = row.getAttribute('data-name');

        if (target.classList.contains('qty-plus')) {
          changeQty(name, 1);
        } else if (target.classList.contains('qty-minus')) {
          changeQty(name, -1);
        } else if (target.classList.contains('cart-item-remove')) {
          removeFromCart(name);
        }
      });
    }

    var checkoutBtn = document.getElementById('cartCheckout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        if (!cart.length) return;
        closeCart();
        openCheckout();
      });
    }

    renderCart();
  }

  function loadCart() {
    try {
      var raw = window.localStorage.getItem(CART_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* storage unavailable — cart still works for this session */
    }
  }

  function findCartItem(name) {
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].name === name) return cart[i];
    }
    return null;
  }

  function addToCart(name, price) {
    var existing = findCartItem(name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name: name, price: price, qty: 1 });
    }
    saveCart();
    renderCart();
  }

  function changeQty(name, delta) {
    var item = findCartItem(name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(function (i) { return i.name !== name; });
    }
    saveCart();
    renderCart();
  }

  function removeFromCart(name) {
    cart = cart.filter(function (i) { return i.name !== name; });
    saveCart();
    renderCart();
  }

  function renderCart() {
    var itemsWrap = document.getElementById('cartItems');
    var drawer = document.getElementById('cartDrawer');
    var totalEl = document.getElementById('cartTotal');
    var countEl = document.getElementById('cartCount');
    if (!itemsWrap || !drawer) return;

    itemsWrap.innerHTML = '';

    var totalItems = 0;
    var totalPrice = 0;

    cart.forEach(function (item) {
      totalItems += item.qty;
      totalPrice += item.qty * item.price;

      var row = document.createElement('div');
      row.className = 'cart-item';
      row.setAttribute('data-name', item.name);
      row.innerHTML =
        '<div class="cart-item-info">' +
          '<h4>' + escapeHtml(item.name) + '</h4>' +
          '<span class="cart-item-price">₹' + item.price.toFixed(2) + ' each</span>' +
        '</div>' +
        '<div class="cart-item-qty">' +
          '<button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity of ' + escapeHtml(item.name) + '">&minus;</button>' +
          '<span class="qty-val">' + item.qty + '</span>' +
          '<button type="button" class="qty-btn qty-plus" aria-label="Increase quantity of ' + escapeHtml(item.name) + '">+</button>' +
        '</div>' +
        '<div class="cart-item-subtotal">₹' + (item.qty * item.price).toFixed(2) + '</div>' +
        '<button type="button" class="cart-item-remove" aria-label="Remove ' + escapeHtml(item.name) + ' from cart">Remove</button>';
      itemsWrap.appendChild(row);
    });

    drawer.classList.toggle('is-empty', cart.length === 0);

    if (totalEl) totalEl.textContent = '₹' + totalPrice.toFixed(2);
    if (countEl) countEl.textContent = String(totalItems);

    var checkoutSubtotalEl = document.getElementById('checkoutSubtotal');
    if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = '₹' + totalPrice.toFixed(2);

    var checkoutReviewSubtotalEl = document.getElementById('checkoutReviewSubtotal');
    if (checkoutReviewSubtotalEl) checkoutReviewSubtotalEl.textContent = '₹' + totalPrice.toFixed(2);
  }

  function bumpCartCount() {
    var countEl = document.getElementById('cartCount');
    if (!countEl) return;
    countEl.classList.remove('bump');
    void countEl.offsetWidth; /* restart animation */
    countEl.classList.add('bump');
  }

  function openCart() {
    var drawer = document.getElementById('cartDrawer');
    var overlay = document.getElementById('cartOverlay');
    var cartBtn = document.getElementById('cartBtn');
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('open');
    document.body.classList.add('cart-open');
    if (cartBtn) cartBtn.setAttribute('aria-expanded', 'true');
  }

  function closeCart() {
    var drawer = document.getElementById('cartDrawer');
    var overlay = document.getElementById('cartOverlay');
    var cartBtn = document.getElementById('cartBtn');
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('open');
    document.body.classList.remove('cart-open');
    if (cartBtn) cartBtn.setAttribute('aria-expanded', 'false');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- Checkout modal ---------- */
  var WHATSAPP_NUMBER = '917364090450';

  function initCheckout() {
    var modal = document.getElementById('checkoutModal');
    var overlay = document.getElementById('checkoutOverlay');
    var closeBtn = document.getElementById('checkoutClose');
    var backBtn = document.getElementById('checkoutBack');
    var form = document.getElementById('checkoutForm');
    var msg = document.getElementById('checkoutFormMsg');
    var editBtn = document.getElementById('checkoutEditDetails');
    var whatsappBtn = document.getElementById('checkoutWhatsApp');
    var successCloseBtn = document.getElementById('checkoutSuccessClose');
    if (!modal) return;

    if (closeBtn) closeBtn.addEventListener('click', closeCheckout);
    if (overlay) overlay.addEventListener('click', closeCheckout);

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        closeCheckout();
        openCart();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeCheckout();
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;
        var fields = form.querySelectorAll('.form-field');

        fields.forEach(function (field) {
          var control = field.querySelector('input, textarea');
          if (!control || !control.hasAttribute('required')) return;
          var ok = control.checkValidity() && control.value.trim() !== '';
          field.classList.toggle('invalid', !ok);
          if (!ok) valid = false;
        });

        if (!valid) {
          if (msg) {
            msg.textContent = 'Please fill in all required fields correctly.';
            msg.classList.add('show', 'is-error');
          }
          return;
        }

        if (msg) {
          msg.textContent = '';
          msg.classList.remove('show', 'is-error');
        }

        showCheckoutStep('review');
        renderCheckoutReview();
      });
    }

    if (editBtn) {
      editBtn.addEventListener('click', function () {
        showCheckoutStep('details');
      });
    }

    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', function () {
        placeOrderOnWhatsApp();
      });
    }

    if (successCloseBtn) {
      successCloseBtn.addEventListener('click', closeCheckout);
    }
  }

  function showCheckoutStep(step) {
    var details = document.getElementById('checkoutStepDetails');
    var review = document.getElementById('checkoutStepReview');
    var success = document.getElementById('checkoutStepSuccess');
    if (details) details.hidden = step !== 'details';
    if (review) review.hidden = step !== 'review';
    if (success) success.hidden = step !== 'success';
  }

  function renderCheckoutReview() {
    var wrap = document.getElementById('checkoutReviewItems');
    if (!wrap) return;
    wrap.innerHTML = '';

    cart.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'review-item';
      row.innerHTML =
        '<span class="review-item-name">' + escapeHtml(item.name) + '</span>' +
        '<span class="review-item-qty">Qty ' + item.qty + '</span>' +
        '<span class="review-item-price">₹' + (item.qty * item.price).toFixed(2) + '</span>';
      wrap.appendChild(row);
    });

    var totalPrice = cart.reduce(function (sum, item) { return sum + item.qty * item.price; }, 0);
    var reviewSubtotalEl = document.getElementById('checkoutReviewSubtotal');
    if (reviewSubtotalEl) reviewSubtotalEl.textContent = '₹' + totalPrice.toFixed(2);
  }

  function placeOrderOnWhatsApp() {
    var name = (document.getElementById('ckName') || {}).value || '';
    var mobile = (document.getElementById('ckMobile') || {}).value || '';
    var address = (document.getElementById('ckAddress') || {}).value || '';
    var landmark = (document.getElementById('ckLandmark') || {}).value || '';
    var paymentInput = document.querySelector('input[name="payment"]:checked');
    var payment = paymentInput ? paymentInput.value : 'Cash on Delivery';

    var totalPrice = cart.reduce(function (sum, item) { return sum + item.qty * item.price; }, 0);

    var lines = [];
    lines.push('🛒 NEW GROCERY ORDER');
    lines.push('Customer Name:');
    lines.push(name.trim());
    lines.push('Phone:');
    lines.push(mobile.trim());
    lines.push('Delivery Address:');
    lines.push(address.trim());
    lines.push('Landmark:');
    lines.push(landmark.trim() || 'N/A');
    lines.push('Payment:');
    lines.push(payment);
    lines.push('==================');
    lines.push('ORDER ITEMS');
    lines.push('==================');
    cart.forEach(function (item) {
      lines.push(item.name);
      lines.push('Quantity: ' + item.qty);
      lines.push('Price: ₹' + (item.qty * item.price).toFixed(2));
      lines.push('');
    });
    lines.push('==================');
    lines.push('Subtotal:');
    lines.push('₹' + totalPrice.toFixed(2));
    lines.push('');
    lines.push('Thank you.');

    var message = lines.join('\n');
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener');

    showCheckoutStep('success');
  }

  function openCheckout() {
    var modal = document.getElementById('checkoutModal');
    var overlay = document.getElementById('checkoutOverlay');
    var msg = document.getElementById('checkoutFormMsg');
    if (!modal) return;
    if (msg) {
      msg.textContent = '';
      msg.classList.remove('show', 'is-error');
    }
    showCheckoutStep('details');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('open');
    document.body.classList.add('cart-open');
    var firstField = document.getElementById('ckName');
    if (firstField) setTimeout(function () { firstField.focus(); }, 300);
  }

  function closeCheckout() {
    var modal = document.getElementById('checkoutModal');
    var overlay = document.getElementById('checkoutOverlay');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('open');
    document.body.classList.remove('cart-open');
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

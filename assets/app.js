(() => {
  'use strict';

  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const main = document.getElementById('main');
  const intro = document.getElementById('intro');
  const skipIntro = document.getElementById('skipIntro');
  const introCount = document.getElementById('introTopCount');
  const introProgress = document.getElementById('introProgress');
  const introMessage = document.getElementById('introMessage');
  const carrotItems = Array.from(document.querySelectorAll('[data-carrot]'));
  const pageElements = Array.from(document.querySelectorAll('.skip-link, .site-header, #main, .site-footer'));
  const storageKey = 'ap-intro-seen-v1';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let collected = new Set();
  let closeTimer = null;
  let previousFocus = null;

  function closeMenu() {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
  }

  menuToggle.addEventListener('click', () => {
    const open = mobileNav.hidden;
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  function setPageInert(value) {
    pageElements.forEach((element) => {
      element.inert = value;
    });
  }

  function renderIntro() {
    carrotItems.forEach((item) => {
      const isCollected = collected.has(Number(item.dataset.carrot));
      item.classList.toggle('is-collected', isCollected);
      item.setAttribute('aria-pressed', String(isCollected));
      item.disabled = isCollected;
    });

    const count = collected.size;
    introCount.textContent = String(count);
    introProgress.style.width = `${count / carrotItems.length * 100}%`;
    introMessage.textContent = '';

    if (count === carrotItems.length) {
      introMessage.textContent = 'Всё собрано. Открываю резюме…';
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(closeIntro, reducedMotion ? 150 : 900);
    }
  }

  function openIntro() {
    window.clearTimeout(closeTimer);
    previousFocus = document.activeElement;
    collected.clear();
    intro.hidden = false;
    document.body.classList.add('intro-open');
    setPageInert(true);
    renderIntro();
    carrotItems[0].focus();
  }

  function closeIntro() {
    window.clearTimeout(closeTimer);
    intro.hidden = true;
    document.body.classList.remove('intro-open');
    setPageInert(false);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (_) {}

    if (previousFocus && previousFocus.isConnected) {
      previousFocus.focus();
    } else {
      main.focus();
    }
  }

  skipIntro.addEventListener('click', closeIntro);
  document.querySelectorAll('[data-open-intro]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      closeMenu();
      openIntro();
    });
  });

  carrotItems.forEach((item) => {
    item.addEventListener('click', () => {
      collected.add(Number(item.dataset.carrot));
      renderIntro();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!intro.hidden) {
        closeIntro();
      } else if (!mobileNav.hidden) {
        closeMenu();
        menuToggle.focus();
      }
    }

    if (event.key === 'Tab' && !intro.hidden) {
      const focusable = Array.from(intro.querySelectorAll('button:not(:disabled)'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  let seen = false;
  try {
    seen = localStorage.getItem(storageKey) === 'true';
  } catch (_) {}

  if (seen) {
    intro.hidden = true;
  } else {
    document.body.classList.add('intro-open');
    setPageInert(true);
  }
  renderIntro();
})();

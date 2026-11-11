(() => {
  'use strict';

  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');

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
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileNav.hidden) {
      closeMenu();
      menuToggle.focus();
    }
  });

  const detectButton = document.getElementById('detectButton');
  const detectResult = document.getElementById('detectResult');
  const detectCard = document.getElementById('detect-card');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scanning = false;

  detectButton.addEventListener('click', () => {
    if (scanning) return;
    scanning = true;
    detectButton.disabled = true;
    detectButton.textContent = 'Сканируем…';
    detectCard.classList.remove('is-found');
    detectCard.classList.add('is-scanning');

    const steps = [
      '> Kotlin / Android SDK — найдено',
      '> Compose / Coroutines / Flow — найдено',
      '> Platform + Product — совпадение',
      'Кандидат найден. Осталось назначить интервью.'
    ];
    const delay = reducedMotion ? 0 : 600;
    steps.forEach((step, index) => {
      window.setTimeout(() => {
        detectResult.textContent = step;
        if (index === steps.length - 1) {
          detectCard.classList.remove('is-scanning');
          detectCard.classList.add('is-found');
          detectButton.disabled = false;
          detectButton.textContent = 'Проверить ещё раз';
          scanning = false;
        }
      }, delay * (index + 1));
    });
  });

  const carrotItems = Array.from(document.querySelectorAll('[data-carrot]'));
  const harvestCount = document.getElementById('harvestCount');
  const harvestProgress = document.getElementById('harvestProgress');
  const harvestMessage = document.getElementById('harvestMessage');
  const harvestCta = document.getElementById('harvestCta');
  const resetHarvest = document.getElementById('resetHarvest');
  const headerCarrotCount = document.getElementById('headerCarrotCount');
  const storageKey = 'ap-carrots-v1';
  let collected = new Set();

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) {
      collected = new Set(saved.filter((index) => Number.isInteger(index) && index >= 0 && index < carrotItems.length));
    }
  } catch (_) {
    collected = new Set();
  }

  function renderHarvest(message) {
    carrotItems.forEach((item) => {
      const isCollected = collected.has(Number(item.dataset.carrot));
      item.classList.toggle('is-collected', isCollected);
      item.setAttribute('aria-pressed', String(isCollected));
      item.disabled = isCollected;
    });

    const count = collected.size;
    harvestCount.textContent = String(count);
    headerCarrotCount.textContent = String(count);
    headerCarrotCount.parentElement.setAttribute('aria-label', `Морковки: ${count}. Перейти к игре`);
    harvestProgress.style.width = `${count / carrotItems.length * 100}%`;
    harvestMessage.textContent = message || (count ? `Собрано ${count} из ${carrotItems.length}.` : 'Нажимайте на морковки — покажу, что умею.');
    harvestCta.hidden = count !== carrotItems.length;
    resetHarvest.hidden = count === 0;

    if (count === carrotItems.length && !message) {
      harvestMessage.textContent = 'Всё собрано. Теперь стек можно обсудить на интервью.';
    }
  }

  carrotItems.forEach((item) => {
    item.addEventListener('click', () => {
      const index = Number(item.dataset.carrot);
      if (collected.has(index)) return;
      collected.add(index);
      const complete = collected.size === carrotItems.length;
      renderHarvest(complete ? 'Всё собрано. Теперь стек можно обсудить на интервью.' : item.dataset.message);
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(collected)));
      } catch (_) {}
    });
  });

  resetHarvest.addEventListener('click', () => {
    collected.clear();
    try {
      localStorage.removeItem(storageKey);
    } catch (_) {}
    renderHarvest();
    carrotItems[0].focus();
  });
  renderHarvest();

})();

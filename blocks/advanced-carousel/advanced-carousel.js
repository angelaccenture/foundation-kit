import { getConfig } from '../../scripts/ak.js';

const { log } = getConfig();

let carouselInstanceId = 0;

function goToSlide(index, carouselList, carouselPanels, prevBtn, nextBtn) {
  const buttons = carouselList.querySelectorAll('.carousel-slide-indicator button');
  if (!buttons[index]) return;

  buttons.forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-selected', 'false');
    button.setAttribute('tabindex', '-1');
  });
  carouselPanels.forEach((sec) => { sec.classList.remove('is-visible'); });

  buttons[index].classList.add('is-active');
  buttons[index].setAttribute('aria-selected', 'true');
  buttons[index].setAttribute('tabindex', '0');
  carouselPanels[index]?.classList.add('is-visible');

  const total = carouselPanels.length;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === total - 1;
}

function getActiveIndex(carouselList) {
  const buttons = [...carouselList.querySelectorAll('.carousel-slide-indicator button')];
  return buttons.findIndex((btn) => btn.classList.contains('is-active'));
}

function getCarouselList(carousel, carouselPanels, instanceId) {
  const carouselItems = carousel.querySelectorAll('li');
  const carouselList = document.createElement('div');
  carouselList.className = 'carousel-list carousel-slide-indicators';
  carouselList.role = 'tablist';

  for (const [idx, item] of carouselItems.entries()) {
    const indicator = document.createElement('div');
    indicator.className = 'carousel-slide-indicator';

    const btn = document.createElement('button');
    btn.role = 'tab';
    btn.id = `carousel-${instanceId}-${idx + 1}`;
    btn.setAttribute('aria-controls', `carouselpanel-${instanceId}-${idx + 1}`);
    btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    btn.setAttribute('tabindex', idx === 0 ? '0' : '-1');
    btn.textContent = item.textContent;
    if (idx === 0) {
      btn.classList.add('is-active');
      carouselPanels[0]?.classList.add('is-visible');
    }
    indicator.append(btn);
    carouselList.append(indicator);
  }

  return carouselList;
}

function createPlayPauseButton() {
  const btn = document.createElement('button');
  btn.className = 'carousel-play-pause is-playing';
  btn.setAttribute('aria-label', 'Pause autoplay');
  return btn;
}

function createNavButtons() {
  const nav = document.createElement('div');
  nav.className = 'carousel-navigation-buttons';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'slide-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.disabled = true;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'slide-next';
  nextBtn.setAttribute('aria-label', 'Next slide');

  nav.append(prevBtn, nextBtn);
  return { nav, prevBtn, nextBtn };
}

export default function init(el) {
  const instanceId = carouselInstanceId;
  carouselInstanceId += 1;

  const carousel = el.querySelector('.advanced-carousel ul');
  if (!carousel) {
    log('Please add an unordered list to the advanced carousel block.');
    return;
  }

  const currSection = el.closest('.section');
  currSection.classList.add('carouselSection');

  const carouselCount = carousel.querySelectorAll('li').length;

  const carouselPanels = [];
  let sibling = currSection.nextElementSibling;
  while (sibling && carouselPanels.length < carouselCount) {
    if (sibling.querySelector('.advanced-carousel, .advanced-tabs')) break;

    sibling.classList.add('carouselSection');
    sibling.id = `carouselpanel-${instanceId}-${carouselPanels.length + 1}`;
    sibling.role = 'tabpanel';
    sibling.setAttribute('aria-labelledby', `carousel-${instanceId}-${carouselPanels.length + 1}`);
    carouselPanels.push(sibling);
    sibling = sibling.nextElementSibling;
  }

  const { nav, prevBtn, nextBtn } = createNavButtons();
  const playPauseBtn = createPlayPauseButton();

  const AUTOPLAY_INTERVAL = 6000;
  let autoplayTimer = null;
  let userPaused = false;

  const indicators = getCarouselList(carousel, carouselPanels, instanceId);

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    playPauseBtn.classList.remove('is-playing');
    playPauseBtn.setAttribute('aria-label', 'Play autoplay');
  }

  function startAutoplay() {
    if (userPaused) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      const active = getActiveIndex(indicators);
      const next = (active + 1) % carouselPanels.length;
      goToSlide(next, indicators, carouselPanels, prevBtn, nextBtn);
    }, AUTOPLAY_INTERVAL);
    playPauseBtn.classList.add('is-playing');
    playPauseBtn.setAttribute('aria-label', 'Pause autoplay');
  }

  function manualChange(idx) {
    userPaused = true;
    stopAutoplay();
    goToSlide(idx, indicators, carouselPanels, prevBtn, nextBtn);
  }

  indicators.addEventListener('keydown', (e) => {
    const btns = [
      ...indicators.querySelectorAll(
        '.carousel-slide-indicator button',
      ),
    ];
    const cur = btns.findIndex(
      (b) => b.classList.contains('is-active'),
    );
    let next;
    if (e.key === 'ArrowRight') {
      next = (cur + 1) % btns.length;
    } else if (e.key === 'ArrowLeft') {
      next = (cur - 1 + btns.length) % btns.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = btns.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    manualChange(next);
    btns[next]?.focus();
  });

  playPauseBtn.addEventListener('click', () => {
    if (autoplayTimer) {
      userPaused = true;
      stopAutoplay();
    } else {
      userPaused = false;
      startAutoplay();
    }
  });

  indicators.querySelectorAll(
    '.carousel-slide-indicator button',
  ).forEach((btn, idx) => {
    btn.addEventListener('click', () => manualChange(idx));
  });

  prevBtn.addEventListener('click', () => {
    const active = getActiveIndex(indicators);
    if (active > 0) manualChange(active - 1);
  });

  nextBtn.addEventListener('click', () => {
    const active = getActiveIndex(indicators);
    if (active < carouselPanels.length - 1) {
      manualChange(active + 1);
    }
  });

  carousel.remove();
  const nextBtn2 = nav.querySelector('.slide-next');
  nav.insertBefore(indicators, nextBtn2);
  nav.insertBefore(playPauseBtn, nextBtn2);
  el.append(...carouselPanels, nav);

  startAutoplay();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting && autoplayTimer) {
        stopAutoplay();
      } else if (
        entry.isIntersecting
        && !autoplayTimer
        && !userPaused
      ) {
        startAutoplay();
      }
    });
  }, { threshold: 0.1 });
  observer.observe(el);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && autoplayTimer) {
      stopAutoplay();
    } else if (
      !document.hidden
      && !autoplayTimer
      && !userPaused
    ) {
      startAutoplay();
    }
  });
}

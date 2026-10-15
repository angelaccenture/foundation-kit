import { getConfig } from '../../scripts/ak.js';
import ENV from '../../scripts/utils/env.js';

const { log } = getConfig();
const AUTOPLAY_INTERVAL = 6000;
let instanceCount = 0;

const toBlockName = (text) => text.trim().toLowerCase().replaceAll(/\s+/g, '-');

function getSlideRows(el) {
  return [...el.querySelectorAll(':scope > div')].map((row, idx) => {
    const [labelCol, nameCol] = row.children;
    return {
      label: labelCol?.textContent.trim() || `Slide ${idx + 1}`,
      name: toBlockName(nameCol?.textContent || ''),
    };
  });
}

// Blocks after this one in the same section, up to the next carousel-container
function getCandidates(el) {
  const blocks = [...el.closest('.section').querySelectorAll('.block-content > div[class]')];
  const after = blocks.slice(blocks.indexOf(el) + 1);
  const next = after.findIndex((block) => block.classList.contains('carousel-container'));
  return next === -1 ? after : after.slice(0, next);
}

function claimSlides(rows, candidates) {
  const claimed = new Set();
  return rows.map((row, idx) => {
    const block = candidates.find((cand) => !claimed.has(cand) && cand.classList[0] === row.name);
    if (block) {
      claimed.add(block);
      return { ...row, block };
    }
    log(`Carousel container, slide ${idx + 1}: no "${row.name}" block found below it in this section.`);
    return { ...row, block: null };
  });
}

function createPanel(slide, idx, id) {
  const panel = document.createElement('div');
  panel.className = 'carousel-container-slide';
  panel.id = `${id}-panel-${idx}`;
  panel.role = 'tabpanel';
  panel.setAttribute('aria-roledescription', 'slide');
  panel.setAttribute('aria-labelledby', `${id}-tab-${idx}`);
  panel.hidden = idx > 0;
  if (slide.block) {
    panel.append(slide.block);
  } else {
    const missing = document.createElement('p');
    missing.className = 'carousel-container-missing';
    missing.textContent = `${slide.label}: no "${slide.name}" block found below this carousel.`;
    panel.append(missing);
  }
  return panel;
}

function createTab(slide, idx, id) {
  const tab = document.createElement('button');
  tab.id = `${id}-tab-${idx}`;
  tab.role = 'tab';
  tab.setAttribute('aria-controls', `${id}-panel-${idx}`);
  tab.setAttribute('aria-selected', idx === 0);
  tab.tabIndex = idx === 0 ? 0 : -1;
  tab.setAttribute('aria-label', slide.label);
  return tab;
}

function createButton(className, label) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.setAttribute('aria-label', label);
  return btn;
}

export default function init(el) {
  const id = `carousel-container-${instanceCount}`;
  instanceCount += 1;

  const slides = claimSlides(getSlideRows(el), getCandidates(el))
    .filter((slide) => slide.block || ENV !== 'prod');
  if (!slides.length) {
    log('Carousel container: no slides found. Add a row per slide: label, then block name.', el);
    return;
  }

  const panels = slides.map((slide, idx) => createPanel(slide, idx, id));
  const tabs = slides.map((slide, idx) => createTab(slide, idx, id));

  const tablist = document.createElement('div');
  tablist.className = 'carousel-container-tabs';
  tablist.role = 'tablist';
  tablist.setAttribute('aria-label', 'Slides');
  tablist.append(...tabs);

  const prevBtn = createButton('carousel-container-prev', 'Previous slide');
  const nextBtn = createButton('carousel-container-next', 'Next slide');
  const playBtn = createButton('carousel-container-play', 'Pause autoplay');

  const nav = document.createElement('div');
  nav.className = 'carousel-container-nav';
  nav.append(prevBtn, tablist, playBtn, nextBtn);

  let current = 0;
  let timer = null;
  let userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function goTo(idx) {
    tabs[current].setAttribute('aria-selected', false);
    tabs[current].tabIndex = -1;
    panels[current].hidden = true;
    current = idx;
    tabs[current].setAttribute('aria-selected', true);
    tabs[current].tabIndex = 0;
    panels[current].hidden = false;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === panels.length - 1;
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    playBtn.classList.remove('is-playing');
    playBtn.setAttribute('aria-label', 'Play autoplay');
  }

  function start() {
    if (userPaused || panels.length < 2) { return; }
    clearInterval(timer);
    timer = setInterval(() => goTo((current + 1) % panels.length), AUTOPLAY_INTERVAL);
    playBtn.classList.add('is-playing');
    playBtn.setAttribute('aria-label', 'Pause autoplay');
  }

  function choose(idx) {
    userPaused = true;
    stop();
    goTo(idx);
  }

  tabs.forEach((tab, idx) => tab.addEventListener('click', () => choose(idx)));
  prevBtn.addEventListener('click', () => current > 0 && choose(current - 1));
  nextBtn.addEventListener('click', () => current < panels.length - 1 && choose(current + 1));
  playBtn.addEventListener('click', () => {
    userPaused = !!timer;
    if (timer) {
      stop();
    } else {
      start();
    }
  });

  tablist.addEventListener('keydown', (e) => {
    const keys = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in keys)) { return; }
    e.preventDefault();
    choose(keys[e.key]);
    tabs[current].focus();
  });

  el.role = 'region';
  el.setAttribute('aria-roledescription', 'carousel');
  el.setAttribute('aria-label', 'Content carousel');
  el.replaceChildren(...panels, nav);
  goTo(0);
  start();
  if (!timer) { stop(); }

  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) {
      stop();
    } else if (!timer) {
      start();
    }
  }, { threshold: 0.1 }).observe(el);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else if (!timer) {
      start();
    }
  });
}

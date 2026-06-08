/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { moveInstrumentation } from './ue-utils.js';

// Header/footer removal moved to ue-prepare.js (runs before ak.js)

const setupObservers = () => {
  const mutatingBlocks = document.querySelectorAll('div.cards, div.carousel, div.accordion');
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.target.tagName === 'DIV') {
        const addedElements = mutation.addedNodes;
        const removedElements = mutation.removedNodes;

        // detect the mutation type of the block or picture (for cards)
        const type = mutation.target.classList.contains('cards-card-image') ? 'cards-image' : mutation.target.attributes['data-aue-component']?.value;

        switch (type) {
          case 'cards':
            // handle card div > li replacements
            if (addedElements.length === 1 && addedElements[0].tagName === 'UL') {
              const ulEl = addedElements[0];
              const removedDivEl = [...mutation.removedNodes].filter((node) => node.tagName === 'DIV');
              removedDivEl.forEach((div, index) => {
                if (index < ulEl.children.length) {
                  moveInstrumentation(div, ulEl.children[index]);
                }
              });
            }
            break;
          case 'cards-image':
            // handle card-image picture replacements
            if (mutation.target.classList.contains('cards-card-image')) {
              const addedPictureEl = [...mutation.addedNodes].filter((node) => node.tagName === 'PICTURE');
              const removedPictureEl = [...mutation.removedNodes].filter((node) => node.tagName === 'PICTURE');
              if (addedPictureEl.length === 1 && removedPictureEl.length === 1) {
                const oldImgEL = removedPictureEl[0].querySelector('img');
                const newImgEl = addedPictureEl[0].querySelector('img');
                if (oldImgEL && newImgEl) {
                  moveInstrumentation(oldImgEL, newImgEl);
                }
              }
            }
            break;
          case 'accordion':
            if (addedElements.length === 1 && addedElements[0].tagName === 'DETAILS') {
              moveInstrumentation(removedElements[0], addedElements[0]);
              moveInstrumentation(removedElements[0].querySelector('div'), addedElements[0].querySelector('summary'));
            }
            break;
          case 'carousel':
            if (removedElements.length === 1 && removedElements[0].attributes['data-aue-component']?.value === 'carousel-item') {
              const resourceAttr = removedElements[0].getAttribute('data-aue-resource');
              if (resourceAttr) {
                const itemMatch = resourceAttr.match(/item-(\d+)/);
                if (itemMatch && itemMatch[1]) {
                  const slideIndex = parseInt(itemMatch[1], 10);
                  const slides = mutation.target.querySelectorAll('li.carousel-slide');
                  const targetSlide = Array.from(slides).find((slide) => parseInt(slide.getAttribute('data-slide-index'), 10) === slideIndex);
                  if (targetSlide) {
                    moveInstrumentation(removedElements[0], targetSlide);
                  }
                }
              }
            }
            break;
          default:
            break;
        }
      }
    });
  });

  mutatingBlocks.forEach((cardsBlock) => {
    observer.observe(cardsBlock, { childList: true, subtree: true });
  });
};

const setupUEEventHandlers = () => {
  // When image changes, update all source srcsets to match the new image
  document.addEventListener('aue:content-patch', (event) => {
    if (event.detail.patch.name === 'image') {
      const newImgSrc = event.detail.patch.value;
      const picture = event.srcElement.querySelector('picture');
      if (picture) {
        picture.querySelectorAll('source').forEach((source) => {
          source.setAttribute('srcset', newImgSrc);
        });
      }
    }
  });

  // Reload when content is added or removed so ak.js can re-decorate
  document.body.addEventListener('aue:content-add', () => {
    window.location.reload();
  });
  document.body.addEventListener('aue:content-remove', () => {
    window.location.reload();
  });

  document.body.addEventListener('aue:ui-select', (event) => {
    const { detail } = event;
    const resource = detail?.resource;

    if (resource) {
      const element = document.querySelector(`[data-aue-resource="${resource}"]`);
      if (!element) {
        return;
      }
      const blockEl = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');
      if (blockEl) {
        const block = blockEl.getAttribute('data-aue-component');
        const index = element.getAttribute('data-slide-index');

        switch (block) {
          case 'accordion':
            blockEl.querySelectorAll('details').forEach((details) => {
              details.open = false;
            });
            element.open = true;
            break;
          case 'carousel':
            if (index) {
              const slides = blockEl.querySelectorAll('.carousel-slide, [role="tabpanel"]');
              slides.forEach((s) => s.classList.remove('is-visible'));
              const target = [...slides].find((s) => s.getAttribute('data-slide-index') === index);
              if (target) target.classList.add('is-visible');
            }
            break;
          case 'tabs':
            if (element === block) {
              return;
            }
            blockEl.querySelectorAll('[role=tabpanel]').forEach((panel) => {
              panel.setAttribute('aria-hidden', true);
            });
            element.setAttribute('aria-hidden', false);
            blockEl.querySelector('.tabs-list').querySelectorAll('button').forEach((btn) => {
              btn.setAttribute('aria-selected', false);
            });
            blockEl.querySelector(`[aria-controls=${element?.id}]`).setAttribute('aria-selected', true);
            break;
          default:
            break;
        }
      }
    }
  });
};

function fixRichtext() {
  document.querySelectorAll('[data-aue-type="richtext"][data-aue-behavior="component"]').forEach((el) => {
    el.classList.add('default-content');
  });

  // If first child of .block-content is .default-content, move it before .block-content
  document.querySelectorAll('.block-content').forEach((blockContent) => {
    const firstChild = blockContent.querySelector(':scope > .default-content');
    if (firstChild && firstChild === blockContent.firstElementChild) {
      blockContent.parentNode.insertBefore(firstChild, blockContent);
    }
  });
}

function restoreAutoLinkedHrefs() {
  // Restore hrefs that were hidden from ak.js
  document.querySelectorAll('a[data-ue-href]').forEach((a) => {
    const href = a.getAttribute('data-ue-href');
    a.setAttribute('href', href);
    a.removeAttribute('data-ue-href');
    a.textContent = href;
  });
}

function updateSectionTemplate() {
  const template = document.querySelector('meta[name="template"]')?.content;
  const main = document.querySelector('main');
  if (!template || !main) return;
  const sections = [...main.querySelectorAll('[data-aue-label="Section"]:not(.tabSection)')];
  sections.forEach((section) => {
    section.dataset.aueFilter = `${template}-section`;
  });
}

function advancedBlocks() {
  const mutatingBlocks = document.querySelectorAll('div.advanced-tabs, div.advanced-carousel, div.advanced-accordion');
  mutatingBlocks.forEach((mutation) => {
    const parentSection = mutation.closest('.tabSection');
    if (parentSection) moveInstrumentation(mutation, parentSection);
  });
  const main = document.querySelector('main');
  if (!main) return;
  const tabSections = [...main.querySelectorAll('.tabSection')];
  tabSections.slice(1).forEach((section) => {
    section.dataset.aueFilter = 'tabs-section';
    section.dataset.aueLabel = 'Tab Section';
  });
}

export default () => {
  setupObservers();
  setupUEEventHandlers();
  fixRichtext();
  restoreAutoLinkedHrefs();
  advancedBlocks();
  updateSectionTemplate();
};

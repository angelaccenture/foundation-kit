import { createPicture } from '../../scripts/utils/picture.js';

/*
 * Banner block — ported from David Nuescheler's capocommerce design-tokens
 * reference (feature-content-refactor). Structure and the design-token
 * consumption pattern are his; only the image helper is adapted to this kit
 * (createPicture instead of aem.js's createOptimizedPicture).
 *
 * Themed via CSS variables set on the block/section by the design-tokens
 * consumer: --background-color, --foreground-color, --accent-color, plus
 * data-* attributes (data-layout-split, data-horizontal-alignment, …).
 */

const CONTENT_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, a';

/**
 * @param {HTMLElement} block
 * @param {HTMLElement | null} section
 * @returns {boolean}
 */
function isBackgroundVariant(block, section) {
  return block.classList.contains('background')
    || section?.classList.contains('background');
}

/**
 * Moves non-picture nodes from the media column into a content wrapper.
 * @param {HTMLElement} imageCol
 */
function wrapInlineContent(imageCol) {
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'banner-content';

  [...imageCol.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.matches('picture')) return;
    contentWrapper.appendChild(node);
  });

  if (contentWrapper.childNodes.length) {
    imageCol.appendChild(contentWrapper);
  }
}

/**
 * Banner block — banner-image is implied from structure; banner-background
 * requires an explicit author `background` class on the block or section.
 * @param {HTMLElement} block The block element
 */
export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cols = [...row.children];
  const imageCol = cols.find((col) => col.querySelector('picture'));
  const contentCol = cols.find((col) => col !== imageCol && col.querySelector(CONTENT_SELECTOR));
  const section = block.closest('.section');
  const isBackground = isBackgroundVariant(block, section);

  if (isBackground && imageCol) {
    block.classList.add('banner-background');
    imageCol.classList.add('banner-media');

    if (contentCol) {
      contentCol.classList.add('banner-content');
    } else {
      wrapInlineContent(imageCol);
    }
  } else if (imageCol && contentCol) {
    block.classList.add('banner-image');
    imageCol.classList.add('banner-media');
    contentCol.classList.add('banner-content');
  }

  block.querySelectorAll('picture > img').forEach((img) => {
    const picture = createPicture({
      src: img.src,
      alt: img.alt,
      breakpoints: [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '750' },
      ],
    });
    img.closest('picture')?.replaceWith(picture);
  });
}

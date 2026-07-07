/**
 * Card
 * Authoring model — each top-level row is one card with two cells:
 *   Row 1 (cell 1): the image (top)
 *   Row 2 (cell 2): the text content — heading, body, optional CTA link (bottom)
 *
 * A single-cell card (image+text together) is still supported: the picture is
 * lifted into the image row and the remaining content becomes the text row.
 */
function decorateCard(card, hashAware) {
  card.classList.add('card-inner');
  const cells = [...card.querySelectorAll(':scope > div')];

  // Image row (top): the cell that contains a picture, else the first cell.
  const pic = card.querySelector('picture');
  const imageCell = pic ? pic.closest(':scope > div') || cells[0] : null;
  if (imageCell) imageCell.classList.add('card-picture-container');

  // Text row (bottom): the remaining cell(s).
  const contentCell = cells.find((c) => c !== imageCell);
  if (contentCell) {
    contentCell.classList.add('card-content-container');

    // Decorate the last link in the content as the CTA.
    const ctaPara = contentCell.querySelector(':scope > p:last-of-type');
    const cta = ctaPara && ctaPara.querySelector('a');
    if (cta) {
      if (hashAware) cta.href = `${cta.getAttribute('href')}${window.location.hash}`;
      ctaPara.classList.add('card-cta-container');
    }
  }
}

export default function init(el) {
  const hashAware = el.classList.contains('hash-aware');
  const cards = [...el.querySelectorAll(':scope > div')];
  cards.forEach((card) => decorateCard(card, hashAware));
}

/*
 * Style Picker — a dynamic dropdown of the per-block style sheets living in
 * DA at /docs/library/styles. Each child sheet (card.json, hero.json, …) becomes
 * an option. Adding a new sheet in DA makes it appear here on reload — no code
 * change, no rebuild. The folder is listed live via the DA admin list API
 * (public + CORS-open for this repo).
 *
 * Drop-in: any element with [data-style-picker] on the page is decorated.
 * Falls back gracefully if the listing can't be reached.
 */

const ORG = 'angelaccenture';
const REPO = 'foundation-kit';
const STYLES_PATH = 'docs/library/styles';
const LIST_API = `https://admin.da.live/list/${ORG}/${REPO}/${STYLES_PATH}`;

/**
 * Fetch the child sheets of the styles folder.
 * @returns {Promise<Array<{name: string, path: string}>>}
 */
async function fetchStyleSheets() {
  const resp = await fetch(LIST_API);
  if (!resp.ok) throw new Error(`list failed: ${resp.status}`);
  const entries = await resp.json();
  // Only JSON sheets; ignore sub-folders / other files.
  return entries
    .filter((entry) => entry.ext === 'json')
    .map((entry) => ({ name: entry.name, path: entry.path }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build the <select> and its options.
 * @param {Array<{name: string, path: string}>} sheets
 */
function buildSelect(sheets) {
  const select = document.createElement('select');
  select.className = 'style-picker-select';
  select.id = 'style-picker-select';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = sheets.length ? 'Choose a block…' : 'No styles found';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.append(placeholder);

  sheets.forEach((sheet) => {
    const option = document.createElement('option');
    option.value = sheet.name;
    option.dataset.path = sheet.path;
    // Title-case the sheet name for display (card → Card).
    option.textContent = sheet.name.charAt(0).toUpperCase() + sheet.name.slice(1);
    select.append(option);
  });

  return select;
}

/**
 * Decorate a host element with the dynamic dropdown.
 * @param {Element} host
 */
export default async function decorate(host) {
  const label = document.createElement('label');
  label.className = 'style-picker-label';
  label.htmlFor = 'style-picker-select';
  label.textContent = 'Block style';

  const status = document.createElement('p');
  status.className = 'style-picker-status';
  status.textContent = 'Loading block styles…';

  host.classList.add('style-picker');
  host.append(label, status);

  try {
    const sheets = await fetchStyleSheets();
    const select = buildSelect(sheets);
    status.remove();
    host.append(select);

    // Emit a `style-picker-change` event so a preview/consumer can react later.
    select.addEventListener('change', () => {
      const option = select.selectedOptions[0];
      host.dispatchEvent(new CustomEvent('style-picker-change', {
        bubbles: true,
        detail: { block: select.value, path: option?.dataset.path },
      }));
    });
  } catch (error) {
    status.textContent = 'Could not load block styles. Please try again.';
    status.classList.add('is-error');
  }
}

// Auto-decorate any [data-style-picker] host on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-style-picker]').forEach((host) => decorate(host));
});

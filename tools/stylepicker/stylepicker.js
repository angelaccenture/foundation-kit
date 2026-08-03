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
const SOURCE_API = `https://admin.da.live/source/${ORG}/${REPO}`;

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
 * Fetch one style sheet's rows + column order. Schema-agnostic: different blocks
 * use different columns (card uses Style Name/Background/…, hero uses Group/Name/
 * Value), so we render whatever columns the sheet actually has.
 * @param {string} path DA source path, e.g. /angelaccenture/.../styles/card.json
 * @returns {Promise<{columns: string[], rows: Array<Record<string,string>>}>}
 */
async function fetchSheet(path) {
  // path from the list API already starts with /<org>/<repo>/…; source API base
  // also includes /<org>/<repo>, so strip that prefix to avoid doubling it.
  const rel = path.replace(`/${ORG}/${REPO}`, '');
  const resp = await fetch(`${SOURCE_API}${rel}`);
  if (!resp.ok) throw new Error(`sheet fetch failed: ${resp.status}`);
  const payload = await resp.json();
  const rows = Array.isArray(payload) ? payload : payload.data || [];
  // Column order from the first row; ignore internal ":" keys.
  const columns = rows.length ? Object.keys(rows[0]).filter((k) => !k.startsWith(':')) : [];
  // Drop fully-empty template rows so an "empty" sheet reads as empty.
  const filled = rows.filter((r) => columns.some((c) => String(r[c] || '').trim() !== ''));
  return { columns, rows: filled };
}

/**
 * Render the chosen sheet's styles into the results container.
 * @param {Element} container
 * @param {string} blockName
 * @param {{columns: string[], rows: Array<Record<string,string>>}} sheet
 */
function renderStyles(container, blockName, sheet) {
  container.textContent = '';
  const { columns, rows } = sheet;

  const heading = document.createElement('h2');
  heading.className = 'style-picker-results-title';
  heading.textContent = `${blockName} styles`;
  container.append(heading);

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'style-picker-empty';
    empty.textContent = `No styles defined for "${blockName}" yet. Add a row in the DA sheet to create one.`;
    container.append(empty);
    return;
  }

  const table = document.createElement('table');
  table.className = 'style-picker-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  columns.forEach((col) => {
    const th = document.createElement('th');
    th.textContent = col;
    headRow.append(th);
  });
  thead.append(headRow);
  table.append(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    columns.forEach((col) => {
      const td = document.createElement('td');
      const value = String(row[col] || '');
      // If the value is a hex color, show a swatch alongside it.
      if (/^#[0-9a-f]{3,8}$/i.test(value.trim())) {
        const swatch = document.createElement('span');
        swatch.className = 'style-picker-swatch';
        swatch.style.backgroundColor = value.trim();
        td.append(swatch);
      }
      td.append(document.createTextNode(value || '—'));
      tr.append(td);
    });
    tbody.append(tr);
  });
  table.append(tbody);
  container.append(table);
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

  const results = document.createElement('div');
  results.className = 'style-picker-results';

  host.classList.add('style-picker');
  host.append(label, status);

  try {
    const sheets = await fetchStyleSheets();
    const select = buildSelect(sheets);
    status.remove();
    host.append(select, results);

    select.addEventListener('change', async () => {
      const option = select.selectedOptions[0];
      const path = option?.dataset.path;
      host.dispatchEvent(new CustomEvent('style-picker-change', {
        bubbles: true,
        detail: { block: select.value, path },
      }));
      if (!path) return;
      results.innerHTML = '<p class="style-picker-status">Loading styles…</p>';
      try {
        const sheet = await fetchSheet(path);
        renderStyles(results, option.textContent, sheet);
      } catch (err) {
        results.innerHTML = '<p class="style-picker-status is-error">Could not load styles for this block.</p>';
      }
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

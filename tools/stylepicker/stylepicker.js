/*
 * Style Picker — dropdown of blocks, read from the published library sheet at
 * /docs/library/blocks.json. Same-origin + published = no auth, no CORS, no
 * admin.da.live. The sheet is a multi-sheet workbook:
 *   • "data"    → one row per block  { name, path, … }
 *   • "options" → style options      { key, blocks, values }
 * Pick a block and its style options (rows in "options" whose `blocks` matches)
 * are listed. Edit the sheet in DA + publish → the tool updates on reload.
 */

const BLOCKS_SHEET = `${window.location.origin}/docs/library/blocks.json`;

/** Pull a named sheet's rows out of a single- or multi-sheet payload. */
function sheetRows(payload, name) {
  if (!payload || typeof payload !== 'object') return [];
  // multi-sheet: { data: {data:[…]}, options: {data:[…]} }
  if (payload[name] && Array.isArray(payload[name].data)) return payload[name].data;
  // single-sheet: { data: [...] }
  if (name === 'data' && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
}

/** @returns {Promise<{blocks: object[], options: object[]}>} */
async function loadLibrary() {
  const resp = await fetch(BLOCKS_SHEET);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const payload = await resp.json();
  return {
    blocks: sheetRows(payload, 'data'),
    options: sheetRows(payload, 'options'),
  };
}

/** class-ify a block name for matching the options' `blocks` column (Card → card). */
function toKey(name) {
  return String(name || '').toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-|-$/g, '');
}

function buildSelect(blocks) {
  const select = document.createElement('select');
  select.className = 'style-picker-select';
  select.id = 'style-picker-select';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = blocks.length ? 'Choose a block…' : 'No blocks found';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.append(placeholder);

  blocks.forEach((block) => {
    const option = document.createElement('option');
    option.value = toKey(block.name);
    option.textContent = block.name;
    select.append(option);
  });
  return select;
}

/** Show the style options for the chosen block (rows in "options" that target it). */
function renderOptions(container, blockName, options) {
  container.textContent = '';
  const key = toKey(blockName);
  const matches = options.filter((o) => toKey(o.blocks) === key
    || String(o.blocks || '').split(/[\s,|]+/).map(toKey).includes(key));

  const heading = document.createElement('h2');
  heading.className = 'style-picker-results-title';
  heading.textContent = `${blockName} style options`;
  container.append(heading);

  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'style-picker-empty';
    empty.textContent = `No style options defined for "${blockName}" yet. Add a row to the "options" sheet in DA.`;
    container.append(empty);
    return;
  }

  const table = document.createElement('table');
  table.className = 'style-picker-table';
  table.innerHTML = '<thead><tr><th>Option</th><th>Values</th></tr></thead>';
  const tbody = document.createElement('tbody');
  matches.forEach((o) => {
    const tr = document.createElement('tr');
    const k = document.createElement('td');
    k.textContent = o.key || '—';
    const v = document.createElement('td');
    v.textContent = o.values || '—';
    tr.append(k, v);
    tbody.append(tr);
  });
  table.append(tbody);
  container.append(table);
}

/** @param {Element} host */
export default async function decorate(host) {
  host.classList.add('style-picker');
  host.textContent = '';

  const label = document.createElement('label');
  label.className = 'style-picker-label';
  label.htmlFor = 'style-picker-select';
  label.textContent = 'Block';

  const status = document.createElement('p');
  status.className = 'style-picker-status';
  status.textContent = 'Loading blocks…';

  const results = document.createElement('div');
  results.className = 'style-picker-results';

  host.append(label, status);

  let library;
  try {
    library = await loadLibrary();
  } catch (err) {
    status.classList.add('is-error');
    status.textContent = `Could not load blocks (${err.message}). Is /docs/library/blocks published?`;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'style-picker-retry';
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => decorate(host));
    host.append(retry);
    return;
  }

  const select = buildSelect(library.blocks);
  status.remove();
  host.append(select, results);

  select.addEventListener('change', () => {
    const blockName = select.selectedOptions[0]?.textContent || '';
    host.dispatchEvent(new CustomEvent('style-picker-change', {
      bubbles: true,
      detail: { block: select.value, name: blockName },
    }));
    if (select.value) renderOptions(results, blockName, library.options);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-style-picker]').forEach((host) => decorate(host));
});

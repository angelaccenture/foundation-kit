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

/** Does an option row target this block? Includes ALL-scoped options. */
function optionTargets(option, key) {
  const scope = String(option.blocks || '').trim();
  if (/^all$/i.test(scope)) return true;
  return scope.split(/[\s,|]+/).map(toKey).includes(key);
}

/**
 * Parse a `|`-separated values string into {label, value} tokens.
 * Supports plain tokens ("center") and label=value ("adobe-red=#FF0000").
 */
function parseValues(raw) {
  return String(raw || '')
    .split('|')
    .map((tok) => tok.trim())
    .filter(Boolean)
    .map((tok) => {
      const eq = tok.indexOf('=');
      if (eq === -1) return { label: tok, value: tok };
      return { label: tok.slice(0, eq).trim(), value: tok.slice(eq + 1).trim() };
    });
}

/** A value that looks like a color/gradient we can swatch. */
function isColorish(value) {
  return /^#[0-9a-f]{3,8}$/i.test(value) || /^(rgb|hsl|linear-gradient|radial-gradient)/i.test(value);
}

/**
 * Redesigned composer — chips/swatches per option (not dropdowns). Author
 * clicks to toggle values (single-select per option), names the style, and sees
 * a live preview of the class + recipe they're building. Emits
 * style-compose-change with the chosen recipe.
 * @param {Element} container
 * @param {string} blockName  human name, e.g. "Section Metadata"
 * @param {string} blockKey   slug, e.g. "section-metadata"
 * @param {Array<Record<string,string>>} options
 */
function renderComposer(container, blockName, blockKey, options) {
  container.textContent = '';
  const matches = options.filter((o) => optionTargets(o, blockKey));

  const heading = document.createElement('h2');
  heading.className = 'style-picker-results-title';
  heading.textContent = `Compose a ${blockName} style`;
  container.append(heading);

  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'style-picker-empty';
    empty.textContent = `No style options defined for "${blockName}" yet. Add a row to the "options" sheet in DA.`;
    container.append(empty);
    return;
  }

  const chosen = {}; // key -> { label, value }

  const nameLabel = document.createElement('span');
  nameLabel.className = 'style-picker-field-label';
  nameLabel.textContent = 'Style name';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'style-picker-name-input';
  nameInput.placeholder = 'e.g. promo-hero';
  const nameField = document.createElement('div');
  nameField.className = 'style-picker-field';
  nameField.append(nameLabel, nameInput);

  const preview = document.createElement('div');
  preview.className = 'style-picker-preview';

  function slugName() {
    return toKey(nameInput.value) || 'unnamed';
  }

  function updatePreview() {
    const parts = Object.entries(chosen).filter(([, v]) => v);
    const className = `${blockKey}-${slugName()}`;
    preview.innerHTML = '';

    const classLine = document.createElement('code');
    classLine.className = 'style-picker-preview-class';
    classLine.textContent = `.${className}`;
    preview.append(classLine);

    if (parts.length) {
      const recipe = document.createElement('div');
      recipe.className = 'style-picker-recipe';
      parts.forEach(([k, v]) => {
        const pill = document.createElement('span');
        pill.className = 'style-picker-recipe-pill';
        if (isColorish(v.value)) {
          const sw = document.createElement('span');
          sw.className = 'style-picker-swatch';
          sw.style.background = v.value;
          pill.append(sw);
        }
        pill.append(document.createTextNode(`${k}: ${v.label}`));
        recipe.append(pill);
      });
      preview.append(recipe);
    } else {
      const hint = document.createElement('span');
      hint.className = 'style-picker-preview-hint';
      hint.textContent = 'Pick options below to build the style.';
      preview.append(hint);
    }

    container.dispatchEvent(new CustomEvent('style-compose-change', {
      bubbles: true,
      detail: {
        block: blockKey,
        name: slugName(),
        className,
        recipe: Object.fromEntries(parts.map(([k, v]) => [k, v.value])),
      },
    }));
  }

  const controls = document.createElement('div');
  controls.className = 'style-picker-controls';

  matches.forEach((opt) => {
    const field = document.createElement('div');
    field.className = 'style-picker-field style-picker-field-chips';

    const fieldLabel = document.createElement('span');
    fieldLabel.className = 'style-picker-field-label';
    fieldLabel.textContent = opt.key;

    const chipRow = document.createElement('div');
    chipRow.className = 'style-picker-chips';

    const tokens = parseValues(opt.values);
    tokens.forEach((tok) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'style-picker-chip';
      chip.dataset.value = tok.value;

      if (isColorish(tok.value)) {
        const sw = document.createElement('span');
        sw.className = 'style-picker-swatch';
        sw.style.background = tok.value;
        chip.append(sw);
      }
      chip.append(document.createTextNode(tok.label));

      chip.addEventListener('click', () => {
        const isActive = chip.classList.contains('is-active');
        // single-select per option: clear siblings
        chipRow.querySelectorAll('.style-picker-chip.is-active')
          .forEach((c) => c.classList.remove('is-active'));
        if (isActive) {
          chosen[opt.key] = null; // toggle off
        } else {
          chip.classList.add('is-active');
          chosen[opt.key] = tok;
        }
        updatePreview();
      });

      chipRow.append(chip);
    });

    field.append(fieldLabel, chipRow);
    controls.append(field);
  });

  const previewWrap = document.createElement('div');
  previewWrap.className = 'style-picker-summary-wrap';
  const previewLabel = document.createElement('span');
  previewLabel.className = 'style-picker-summary-label';
  previewLabel.textContent = 'Your style';
  previewWrap.append(previewLabel, preview);

  nameInput.addEventListener('input', updatePreview);

  container.append(nameField, controls, previewWrap);
  updatePreview();
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
    if (select.value) renderComposer(results, blockName, select.value, library.options);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-style-picker]').forEach((host) => decorate(host));
});

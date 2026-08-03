/*
 * Style Picker — pick a block, then compose a named style from that block's
 * form definition. Fully sheet-driven, same-origin (published), no auth:
 *   • /docs/library/blocks.json  → "data" tab lists the blocks (the top dropdown)
 *   • /docs/library/styles/<block>.json → per-block workbook with two tabs:
 *       - "options" : the FORM DEFINITION. One row per field:
 *           { Name, Type, Options }
 *           Type ∈ inputfield | colorpicker | dropdown | chips  (Options = "a | b | c")
 *       - "data"    : the saved styles (one row per composed class)
 * Edit either sheet in DA + publish and the tool updates on reload.
 */

const ORIGIN = window.location.origin;
const BLOCKS_SHEET = `${ORIGIN}/docs/library/blocks.json`;
const styleSheetUrl = (block) => `${ORIGIN}/docs/library/styles/${block}.json`;

/** Rows of a named tab from a single- or multi-sheet payload. */
function sheetRows(payload, name) {
  if (!payload || typeof payload !== 'object') return [];
  if (payload[name] && Array.isArray(payload[name].data)) return payload[name].data;
  if (name === 'data' && Array.isArray(payload.data)) return payload.data;
  return [];
}

/** slugify a block/style name (Card → card, "Promo Hero" → promo-hero). */
function toKey(name) {
  return String(name || '').toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-|-$/g, '');
}

/** Split an "a | b | c" options string into trimmed tokens. */
function splitOptions(raw) {
  return String(raw || '').split('|').map((t) => t.trim()).filter(Boolean);
}

async function loadBlocks() {
  const resp = await fetch(BLOCKS_SHEET);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return sheetRows(await resp.json(), 'data');
}

/** Load one block's form definition + saved styles. */
async function loadBlockSheet(block) {
  const resp = await fetch(styleSheetUrl(block));
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const payload = await resp.json();
  return { fields: sheetRows(payload, 'options'), saved: sheetRows(payload, 'data') };
}

function buildBlockSelect(blocks) {
  const select = document.createElement('select');
  select.className = 'style-picker-select';
  select.id = 'style-picker-select';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = blocks.length ? 'Choose a block…' : 'No blocks found';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.append(placeholder);
  blocks.forEach((b) => {
    const o = document.createElement('option');
    o.value = toKey(b.name);
    o.textContent = b.name;
    select.append(o);
  });
  return select;
}

/** Render one form field per its Type. Returns { row, getValue }. */
function renderField(field, onChange, colorPicker) {
  const name = field.Name || field.name || '';
  const type = String(field.Type || field.type || '').toLowerCase();

  const row = document.createElement('div');
  row.className = 'style-picker-field';
  const label = document.createElement('label');
  label.className = 'style-picker-field-label';
  label.textContent = name;
  row.append(label);

  let getValue = () => '';

  if (type === 'colorpicker') {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'style-picker-color';
    let value = '';
    const paint = () => {
      swatch.style.background = value || 'transparent';
      swatch.textContent = value ? '' : 'pick…';
    };
    swatch.addEventListener('click', () => {
      colorPicker.open({
        anchor: swatch,
        value: value || '#000000',
        label: name,
        onChange: (hex) => {
          value = hex;
          paint();
          onChange();
        },
      });
    });
    paint();
    row.append(swatch);
    getValue = () => value;
  } else if (type === 'dropdown') {
    const sel = document.createElement('select');
    sel.className = 'style-picker-option-select';
    const none = document.createElement('option');
    none.value = ''; none.textContent = '—';
    sel.append(none);
    splitOptions(field.Options || field.options).forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      sel.append(o);
    });
    sel.addEventListener('change', onChange);
    row.append(sel);
    getValue = () => sel.value;
  } else if (type === 'chips') {
    row.classList.add('style-picker-field-chips');
    const chipRow = document.createElement('div');
    chipRow.className = 'style-picker-chips';
    let value = '';
    splitOptions(field.Options || field.options).forEach((opt) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'style-picker-chip';
      if (/^#[0-9a-f]{3,8}$/i.test(opt) || /^(rgb|hsl|linear-gradient)/i.test(opt)) {
        const sw = document.createElement('span');
        sw.className = 'style-picker-swatch';
        sw.style.background = opt;
        chip.append(sw);
      }
      chip.append(document.createTextNode(opt));
      chip.addEventListener('click', () => {
        const active = chip.classList.contains('is-active');
        chipRow.querySelectorAll('.style-picker-chip.is-active')
          .forEach((c) => c.classList.remove('is-active'));
        if (active) {
          value = '';
        } else {
          chip.classList.add('is-active');
          value = opt;
        }
        onChange();
      });
      chipRow.append(chip);
    });
    row.append(chipRow);
    getValue = () => value;
  } else {
    // inputfield (default)
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'style-picker-name-input';
    input.placeholder = /name/i.test(name) ? 'e.g. promo-hero' : '';
    input.addEventListener('input', onChange);
    row.append(input);
    getValue = () => input.value;
  }

  return { row, name, getValue };
}

/** Build the composer form from a block's field definitions. */
function renderComposer(container, blockName, blockKey, sheet, colorPicker) {
  container.textContent = '';
  const { fields } = sheet;

  const heading = document.createElement('h2');
  heading.className = 'style-picker-results-title';
  heading.textContent = `Compose a ${blockName} style`;
  container.append(heading);

  if (!fields.length) {
    const empty = document.createElement('p');
    empty.className = 'style-picker-empty';
    empty.textContent = `No form defined for "${blockName}". Add rows to the "options" tab of its sheet in DA.`;
    container.append(empty);
    return;
  }

  const preview = document.createElement('div');
  preview.className = 'style-picker-preview';
  const controls = document.createElement('div');
  controls.className = 'style-picker-controls';
  const fieldApis = [];

  function collect() {
    const values = {};
    fieldApis.forEach(({ name, getValue }) => {
      const v = getValue();
      if (v) values[name] = v;
    });
    return values;
  }

  function nameField() {
    const found = fieldApis.find(({ name }) => /name/i.test(name));
    return found ? found.getValue() : '';
  }

  function update() {
    const values = collect();
    const className = `${blockKey}-${toKey(nameField()) || 'unnamed'}`;
    preview.innerHTML = '';
    const code = document.createElement('code');
    code.className = 'style-picker-preview-class';
    code.textContent = `.${className}`;
    preview.append(code);

    const pills = Object.entries(values).filter(([n]) => !/name/i.test(n));
    if (pills.length) {
      const recipe = document.createElement('div');
      recipe.className = 'style-picker-recipe';
      pills.forEach(([n, v]) => {
        const pill = document.createElement('span');
        pill.className = 'style-picker-recipe-pill';
        if (/^#[0-9a-f]{3,8}$/i.test(v) || /^(rgb|hsl|linear-gradient)/i.test(v)) {
          const sw = document.createElement('span');
          sw.className = 'style-picker-swatch';
          sw.style.background = v;
          pill.append(sw);
        }
        pill.append(document.createTextNode(`${n}: ${v}`));
        recipe.append(pill);
      });
      preview.append(recipe);
    }

    container.dispatchEvent(new CustomEvent('style-compose-change', {
      bubbles: true,
      detail: { block: blockKey, name: toKey(nameField()), className, values },
    }));
  }

  fields.forEach((field) => {
    const api = renderField(field, update, colorPicker);
    fieldApis.push(api);
    controls.append(api.row);
  });

  const previewWrap = document.createElement('div');
  previewWrap.className = 'style-picker-summary-wrap';
  const previewLabel = document.createElement('span');
  previewLabel.className = 'style-picker-summary-label';
  previewLabel.textContent = 'Your style';
  previewWrap.append(previewLabel, preview);

  container.append(controls, previewWrap);
  update();
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

  // Reuse David's colour picker (already in the repo).
  const { ColorPicker } = await import('../design-tokens/color-picker.js');
  const colorPicker = new ColorPicker();

  let blocks;
  try {
    blocks = await loadBlocks();
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

  const select = buildBlockSelect(blocks);
  status.remove();
  host.append(select, results);

  select.addEventListener('change', async () => {
    const blockName = select.selectedOptions[0]?.textContent || '';
    const blockKey = select.value;
    if (!blockKey) return;
    results.innerHTML = '<p class="style-picker-status">Loading form…</p>';
    try {
      const sheet = await loadBlockSheet(blockKey);
      renderComposer(results, blockName, blockKey, sheet, colorPicker);
    } catch (err) {
      results.innerHTML = `<p class="style-picker-status is-error">No sheet for "${blockName}" (${err.message}). Create /docs/library/styles/${blockKey}.</p>`;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-style-picker]').forEach((host) => decorate(host));
});

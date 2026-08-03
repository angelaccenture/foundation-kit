import { ColorPicker, getContrastColor, sanitizeHexColor } from './color-picker.js';

/**
 * @param {unknown} payload
 */
function normalizePayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === 'object' && Array.isArray(payload.data)) return payload.data;
  return [];
}

/**
 * @param {Array<Record<string, string>>} rows
 */
function extractColumns(rows) {
  if (!rows.length) return [];

  const seen = new Set();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!key.startsWith(':')) seen.add(key);
    });
  });

  const ordered = Object.keys(rows[0]).filter((key) => seen.has(key));
  const remainder = [...seen].filter((key) => !ordered.includes(key));
  return [...ordered, ...remainder];
}

/**
 * @param {string} column
 * @param {Array<Record<string, string>>} rows
 */
function isColorColumn(column, rows) {
  const values = rows
    .map((row) => row[column])
    .filter((value) => value != null && value !== '');

  if (!values.length) return true;
  return values.every((value) => Boolean(sanitizeHexColor(value)));
}

/**
 * @param {Record<string, string>} row
 */
function rowToToken(row) {
  return {
    id: crypto.randomUUID(),
    values: { ...row },
  };
}

/**
 * @param {string[]} columns
 */
function createEmptyToken(columns) {
  return {
    id: crypto.randomUUID(),
    values: Object.fromEntries(columns.map((column) => [column, ''])),
  };
}

/**
 * @param {string} name
 */
function toClassName(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    : '';
}

// Option values are sheet-driven: populated from the workbook's "options" tab
// (key/Name + values/Options = "a | b | c"). No hardcoded lists — authors define
// the choices in the sheet. See loadSheetOptions().
const sheetOptions = {};

/**
 * @param {string} column
 * @returns {string[] | null}
 */
function getSelectOptions(column) {
  const slug = toClassName(column);
  return sheetOptions[slug] || null;
}

/**
 * Populate sheetOptions from the workbook's "options" tab.
 * Rows: { key/Name, values/Options } where values is "a | b | c".
 * @param {object} payload the full workbook JSON
 */
function loadSheetOptions(payload) {
  const tab = payload && payload.options && Array.isArray(payload.options.data)
    ? payload.options.data : [];
  tab.forEach((row) => {
    const key = toClassName(row.key || row.Name || row.name || '');
    const raw = row.values || row.Options || row.options || '';
    const values = String(raw).split('|').map((v) => v.trim()).filter(Boolean);
    if (key && values.length) sheetOptions[key] = values;
  });
}

/**
 * @param {{ values: Record<string, string> }} token
 * @param {string[]} columns
 */
function getPreviewColors(token, columns) {
  const colors = {
    bg: '#f5f5f2',
    fg: '#2a2e33',
    accent: '#005ab7',
  };

  columns.slice(1).forEach((column) => {
    const color = sanitizeHexColor(token.values[column]);
    if (!color) return;

    const slug = toClassName(column);
    if (slug === 'background' || slug.includes('background')) colors.bg = color;
    else if (slug === 'foreground' || slug.includes('foreground')) colors.fg = color;
    else if (slug.includes('accent')) colors.accent = color;
  });

  return colors;
}

/**
 * @param {string} value
 * @returns {{ content: number, media: number }}
 */
function parseLayoutSplit(value) {
  const match = /^(\d+)\s*-\s*(\d+)$/.exec(String(value || '').trim());
  if (!match) return { content: 60, media: 40 };
  return { content: Number(match[1]), media: Number(match[2]) };
}

/**
 * @param {{ values: Record<string, string> }} token
 * @param {string[]} columns
 */
function getPreviewLayout(token, columns) {
  const layout = {
    split: '60-40',
    horizontal: 'left',
    vertical: 'center',
    fontSize: 'medium',
  };

  columns.slice(1).forEach((column) => {
    const value = String(token.values[column] || '').trim().toLowerCase();
    if (!value) return;

    const slug = toClassName(column);
    if (slug.includes('layout') && slug.includes('split')) layout.split = value;
    else if (slug.includes('horizontal') && slug.includes('align')) layout.horizontal = value;
    else if (slug.includes('vertical') && slug.includes('align')) layout.vertical = value;
    else if (slug.includes('font') && slug.includes('size')) layout.fontSize = value;
  });

  return layout;
}

/**
 * @param {string | null} path
 */
function normalizePath(path) {
  if (!path) return path;
  return /\.json$/i.test(path) ? path : `${path}.json`;
}

class DesignTokensApp {
  constructor(root) {
    this.root = root;
    this.tokens = [];
    this.columns = [];
    this.sourceRows = [];
    this.selectedId = null;
    this.path = normalizePath(new URLSearchParams(window.location.search).get('path'));
    this.grid = root.querySelector('[data-sheet-grid]');
    this.preview = root.querySelector('[data-banner-preview]');
    this.previewFrame = root.querySelector('[data-preview-frame]');
    this.previewStyle = root.querySelector('[data-preview-style]');
    this.previewContent = root.querySelector('[data-preview-content]');
    this.previewHeading = root.querySelector('[data-preview-heading]');
    this.previewButton = root.querySelector('[data-preview-button]');
    this.emptyState = root.querySelector('[data-empty-state]');
    this.errorState = root.querySelector('[data-error-state]');
    this.colorPicker = new ColorPicker();

    root.querySelector('[data-add-btn]').addEventListener('click', () => this.addToken());
    this.loadTokens();
  }

  showError(message) {
    this.errorState.hidden = false;
    this.errorState.textContent = message;
    this.grid.hidden = true;
    this.preview.hidden = true;
    this.emptyState.hidden = true;
  }

  clearError() {
    this.errorState.hidden = true;
    this.errorState.textContent = '';
  }

  async loadTokens() {
    if (!this.path) {
      this.showError('Missing ?path= query parameter.');
      return;
    }

    this.clearError();

    try {
      const response = await fetch(this.path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      loadSheetOptions(payload);
      const rows = normalizePayload(payload);
      this.sourceRows = rows;
      this.columns = extractColumns(rows);
      this.tokens = rows.map(rowToToken);
      this.selectedId = this.tokens[0]?.id || null;
      this.render();
    } catch (error) {
      this.tokens = [];
      this.columns = [];
      this.sourceRows = [];
      this.showError(`Failed to load ${this.path}: ${error.message}`);
    }
  }

  addToken() {
    if (!this.columns.length) return;
    const token = createEmptyToken(this.columns);
    this.tokens.push(token);
    this.selectedId = token.id;
    this.render();
  }

  /**
   * @param {string} id
   */
  removeToken(id) {
    this.tokens = this.tokens.filter((token) => token.id !== id);
    if (this.selectedId === id) {
      this.selectedId = this.tokens[0]?.id || null;
    }
    this.render();
  }

  /**
   * @param {string} id
   */
  selectToken(id) {
    this.selectedId = id;
    this.grid.querySelectorAll('.sheet-row').forEach((row) => {
      row.classList.toggle('is-selected', row.dataset.tokenId === id);
    });
    this.renderPreview();
  }

  renderPreview() {
    const token = this.tokens.find((entry) => entry.id === this.selectedId);
    if (!token || !this.columns.length) {
      this.preview.hidden = true;
      return;
    }

    const nameColumn = this.columns[0];
    const styleName = token.values[nameColumn] || 'Untitled';
    const { bg, fg, accent } = getPreviewColors(token, this.columns);
    const { split, horizontal, vertical, fontSize } = getPreviewLayout(token, this.columns);
    const { content, media } = parseLayoutSplit(split);

    this.preview.hidden = false;
    this.previewStyle.textContent = styleName;
    this.previewFrame.dataset.split = split;
    this.previewFrame.dataset.horizontal = horizontal;
    this.previewFrame.dataset.vertical = vertical;
    this.previewFrame.dataset.fontSize = fontSize;
    this.previewFrame.style.gridTemplateColumns = `${content}fr ${media}fr`;

    let alignItems = 'flex-start';
    if (horizontal === 'center') alignItems = 'center';
    else if (horizontal === 'right') alignItems = 'flex-end';

    let justifyContent = 'center';
    if (vertical === 'top') justifyContent = 'flex-start';
    else if (vertical === 'bottom') justifyContent = 'flex-end';

    this.previewContent.style.backgroundColor = bg;
    this.previewContent.style.backgroundImage = '';
    this.previewContent.style.color = fg;
    this.previewContent.style.alignItems = alignItems;
    this.previewContent.style.justifyContent = justifyContent;
    this.previewContent.style.textAlign = horizontal;

    this.previewHeading.style.color = accent;
    this.previewButton.style.backgroundColor = accent;
  }

  /**
   * @param {string} id
   * @param {string} column
   * @param {string} value
   */
  updateToken(id, column, value) {
    const token = this.tokens.find((entry) => entry.id === id);
    if (!token) return;
    token.values[column] = value;
    this.updateColorCell(id, column);
    if (id === this.selectedId) this.renderPreview();
  }

  /**
   * @param {string} id
   * @param {string} column
   */
  updateColorCell(id, column) {
    const token = this.tokens.find((entry) => entry.id === id);
    const cell = this.grid.querySelector(`[data-token-id="${id}"][data-column="${cssEscape(column)}"]`);
    if (!token || !cell) return;

    const value = token.values[column] || '';
    const color = sanitizeHexColor(value);
    const label = cell.querySelector('[data-color-label]');

    cell.classList.toggle('is-empty', !color);
    if (color) {
      cell.style.backgroundColor = color;
      cell.style.color = getContrastColor(color);
      if (label) label.textContent = color;
    } else {
      cell.style.backgroundColor = '';
      cell.style.color = '';
      if (label) label.textContent = '—';
    }
  }

  /**
   * @param {string} column
   * @param {string} value
   * @param {boolean} colorColumn
   */
  renderColorCell(token, column, value) {
    const color = sanitizeHexColor(value);
    const cell = document.createElement('div');
    cell.className = `cell color${color ? '' : ' is-empty'}`;
    cell.dataset.tokenId = token.id;
    cell.dataset.column = column;
    if (color) {
      cell.style.backgroundColor = color;
      cell.style.color = getContrastColor(color);
    }

    const label = document.createElement('span');
    label.dataset.colorLabel = '';
    label.textContent = color || '—';

    cell.append(label);
    cell.addEventListener('click', (event) => {
      event.stopPropagation();
      this.selectToken(token.id);
      this.colorPicker.open({
        anchor: cell,
        value: color || '#000000',
        label: column,
        onChange: (hex) => this.updateToken(token.id, column, hex),
      });
    });

    return cell;
  }

  /**
   * @param {{ id: string, values: Record<string, string> }} token
   * @param {string} column
   * @param {string} value
   * @param {string[]} options
   */
  renderSelectCell(token, column, value, options) {
    const cell = document.createElement('div');
    cell.className = 'cell select';
    cell.dataset.tokenId = token.id;
    cell.dataset.column = column;

    const select = document.createElement('select');
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = '—';
    select.append(blank);

    const normalized = String(value || '').trim().toLowerCase();
    const known = new Set(options);
    if (normalized && !known.has(normalized)) {
      const custom = document.createElement('option');
      custom.value = normalized;
      custom.textContent = normalized;
      select.append(custom);
    }

    options.forEach((option) => {
      const el = document.createElement('option');
      el.value = option;
      el.textContent = option;
      select.append(el);
    });

    select.value = normalized;
    select.addEventListener('focus', () => this.selectToken(token.id));
    select.addEventListener('click', (event) => event.stopPropagation());
    select.addEventListener('change', (event) => {
      this.updateToken(token.id, column, event.target.value);
    });

    cell.append(select);
    return cell;
  }

  /**
   * @param {{ id: string, values: Record<string, string> }} token
   * @param {string} column
   * @param {string} value
   * @param {boolean} colorColumn
   */
  renderCell(token, column, value, colorColumn) {
    if (colorColumn) return this.renderColorCell(token, column, value);

    const selectOptions = getSelectOptions(column);
    if (selectOptions) return this.renderSelectCell(token, column, value, selectOptions);

    const cell = document.createElement('div');
    const isName = column === this.columns[0];
    cell.className = `cell ${isName ? 'name' : 'text'}`;
    cell.dataset.tokenId = token.id;
    cell.dataset.column = column;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = isName ? 'style name' : '';
    input.addEventListener('focus', () => this.selectToken(token.id));
    input.addEventListener('input', (event) => {
      this.updateToken(token.id, column, event.target.value);
    });

    cell.append(input);
    return cell;
  }

  render() {
    this.colorPicker.close();
    this.grid.innerHTML = '';
    const hasTokens = this.tokens.length > 0 && this.columns.length > 0;

    this.emptyState.hidden = hasTokens;
    this.grid.hidden = !hasTokens;
    if (!hasTokens) {
      this.preview.hidden = true;
      return;
    }

    if (!this.selectedId || !this.tokens.some((token) => token.id === this.selectedId)) {
      this.selectedId = this.tokens[0].id;
    }

    this.grid.style.gridTemplateColumns = `repeat(${this.columns.length}, minmax(5rem, 1fr)) 2.25rem`;

    const headerRow = document.createElement('div');
    headerRow.className = 'sheet-header';

    this.columns.forEach((column) => {
      const header = document.createElement('div');
      header.className = 'cell header';
      header.textContent = column;
      headerRow.append(header);
    });

    const actionsHeader = document.createElement('div');
    actionsHeader.className = 'cell header actions';
    headerRow.append(actionsHeader);
    this.grid.append(headerRow);

    this.tokens.forEach((token) => {
      const row = document.createElement('div');
      row.className = `sheet-row${token.id === this.selectedId ? ' is-selected' : ''}`;
      row.dataset.tokenId = token.id;
      row.addEventListener('click', () => this.selectToken(token.id));

      this.columns.forEach((column) => {
        const value = token.values[column] || '';
        const colorColumn = isColorColumn(column, this.sourceRows);
        row.append(this.renderCell(token, column, value, colorColumn));
      });

      const actions = document.createElement('div');
      actions.className = 'cell actions';
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '×';
      removeBtn.title = 'Remove token';
      removeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        this.removeToken(token.id);
      });
      actions.append(removeBtn);
      row.append(actions);
      this.grid.append(row);
    });

    this.renderPreview();
  }
}

/**
 * @param {string} value
 */
function cssEscape(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-design-tokens-app]');
  if (root) new DesignTokensApp(root);
});

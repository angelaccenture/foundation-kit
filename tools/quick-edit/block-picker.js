/**
 * Block Picker — Insert blocks into sections in layout mode.
 * Opens a searchable dialog listing available blocks.
 */

const BLOCKS = [
  { name: 'Hero', value: 'hero' },
  { name: 'Hero (Center)', value: 'hero center' },
  { name: 'Card', value: 'card' },
  { name: 'Teaser', value: 'teaser' },
  { name: 'Columns', value: 'columns' },
  { name: 'Advanced Accordion', value: 'advanced-accordion' },
  { name: 'Advanced Carousel', value: 'advanced-carousel' },
  { name: 'Advanced Tabs', value: 'advanced-tabs' },
  { name: 'Section-Metadata', value: 'section-metadata' },
  { name: 'Table', value: 'table' },
  { name: 'YouTube', value: 'youtube' },
  { name: 'Fragment', value: 'fragment' },
  { name: 'Metadata', value: 'metadata' },
  { name: 'Schedule', value: 'schedule' },
];

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .lm-block-picker-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 300000;
      background: rgb(0 0 0 / 40%);
      align-items: center;
      justify-content: center;
    }
    .lm-block-picker-overlay.open { display: flex; }
    .lm-block-picker {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
      padding: 24px;
      min-width: 340px;
      max-width: 400px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      font-family: system-ui, sans-serif;
    }
    .lm-block-picker-title {
      font-size: 18px;
      font-weight: 700;
      color: #111;
      margin: 0 0 16px;
    }
    .lm-block-picker-search {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      margin-bottom: 12px;
    }
    .lm-block-picker-search:focus {
      outline: none;
      border-color: #0078d4;
    }
    .lm-block-picker-list {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      max-height: 300px;
    }
    .lm-block-picker-item {
      padding: 10px 12px;
      font-size: 15px;
      color: #333;
      cursor: pointer;
      border-radius: 4px;
    }
    .lm-block-picker-item:hover {
      background: #f5f5f5;
    }
    .lm-block-picker-item.selected {
      background: #e8f0fe;
      color: #0078d4;
    }
    .lm-block-picker-item.hidden { display: none; }
    .lm-block-picker-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
    .lm-block-picker-cancel {
      padding: 8px 20px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      color: #333;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .lm-block-picker-cancel:hover { background: #f5f5f5; }
    .lm-block-picker-insert {
      padding: 8px 20px;
      border: none;
      border-radius: 6px;
      background: #ccc;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: not-allowed;
    }
    .lm-block-picker-insert.ready {
      background: #0078d4;
      cursor: pointer;
    }
    .lm-block-picker-insert.ready:hover { background: #0067b8; }
  `;
  document.head.appendChild(style);
}

let overlay = null;
let targetSection = null;
let selectedBlock = null;

function createPicker() {
  overlay = document.createElement('div');
  overlay.className = 'lm-block-picker-overlay';

  const listHTML = BLOCKS.map((b) => `<li class="lm-block-picker-item" data-value="${b.value}">${b.name}</li>`).join('');

  overlay.innerHTML = `
    <div class="lm-block-picker">
      <span class="lm-block-picker-title">Insert block</span>
      <input class="lm-block-picker-search" placeholder="Search blocks...">
      <ul class="lm-block-picker-list">${listHTML}</ul>
      <div class="lm-block-picker-actions">
        <button class="lm-block-picker-cancel">Cancel</button>
        <button class="lm-block-picker-insert">Insert</button>
      </div>
    </div>
  `;

  const search = overlay.querySelector('.lm-block-picker-search');
  const list = overlay.querySelector('.lm-block-picker-list');
  const insertBtn = overlay.querySelector('.lm-block-picker-insert');
  const cancelBtn = overlay.querySelector('.lm-block-picker-cancel');

  search.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    list.querySelectorAll('.lm-block-picker-item').forEach((item) => {
      const match = item.textContent.toLowerCase().includes(q);
      item.classList.toggle('hidden', !match);
    });
  });

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.lm-block-picker-item');
    if (!item) return;
    list.querySelectorAll('.lm-block-picker-item').forEach((i) => i.classList.remove('selected'));
    item.classList.add('selected');
    selectedBlock = item.dataset.value;
    insertBtn.classList.add('ready');
  });

  cancelBtn.addEventListener('click', () => close());

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  insertBtn.addEventListener('click', () => {
    if (!selectedBlock || !targetSection) return;
    const blockDiv = document.createElement('div');
    blockDiv.className = selectedBlock;
    const inner = document.createElement('div');
    inner.innerHTML = '<p><br></p>';
    blockDiv.appendChild(inner);
    targetSection.appendChild(blockDiv);
    close();
  });

  document.body.appendChild(overlay);
}

function close() {
  if (!overlay) return;
  overlay.classList.remove('open');
  selectedBlock = null;
  targetSection = null;
  const insertBtn = overlay.querySelector('.lm-block-picker-insert');
  insertBtn.classList.remove('ready');
  overlay.querySelectorAll('.lm-block-picker-item').forEach((i) => i.classList.remove('selected'));
  overlay.querySelector('.lm-block-picker-search').value = '';
  overlay.querySelectorAll('.lm-block-picker-item').forEach((i) => i.classList.remove('hidden'));
}

export function openBlockPicker(section) {
  if (!overlay) createPicker();
  targetSection = section;
  overlay.classList.add('open');
  setTimeout(() => overlay.querySelector('.lm-block-picker-search').focus(), 50);
}

export default function initBlockPicker() {
  addStyles();
}

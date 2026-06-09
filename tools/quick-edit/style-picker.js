/**
 * Style Picker — floating dropdown for quick-edit.
 * Lets authors change block variants and section styles
 * by clicking on a block or section in the page.
 */

const BLOCK_VARIANTS = {
  accordion: ['compact'],
  'advanced-accordion': ['compact'],
  hero: ['center', 'msftsource'],
  card: ['dev'],
  'card-carousel': ['community'],
  'quick-links': ['languages'],
};

const SECTION_STYLES = [
  'dark',
  'light-grey',
  'announcement-bar',
  'devhero',
  'center',
  'spacing-xs',
  'spacing-s',
  'spacing-m',
  'spacing-l',
  'spacing-xl',
  'spacing-xxl',
  'grid',
  'grid-2',
  'grid-3',
  'grid-4',
  'grid-5',
  'grid-6',
];

let picker = null;
let activeEl = null;

function createPicker() {
  const el = document.createElement('div');
  el.className = 'style-picker';
  el.innerHTML = `
    <div class="style-picker-header">
      <span class="style-picker-title"></span>
      <button class="style-picker-close" aria-label="Close">&times;</button>
    </div>
    <div class="style-picker-options"></div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .style-picker {
      position: fixed;
      z-index: 100000;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgb(0 0 0 / 15%);
      padding: 12px;
      min-width: 200px;
      max-width: 280px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      color: #000;
      display: none;
    }
    .style-picker.open { display: block; }
    .style-picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .style-picker-title {
      font-weight: 600;
      font-size: 13px;
      color: #333;
    }
    .style-picker-close {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
      padding: 0 4px;
    }
    .style-picker-options {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .style-picker-option {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 20px;
      cursor: pointer;
      font-size: 13px;
      background: #f5f5f5;
      color: #333;
      transition: all 0.15s;
    }
    .style-picker-option:hover {
      background: #e0e0e0;
    }
    .style-picker-option.active {
      background: #0078d4;
      color: #fff;
      border-color: #0078d4;
    }
  `;
  document.head.appendChild(style);

  el.querySelector('.style-picker-close').addEventListener('click', closePicker);

  return el;
}

function closePicker() {
  if (picker) picker.classList.remove('open');
  activeEl = null;
}

function ensurePickerInDOM() {
  if (picker && !document.body.contains(picker)) {
    document.body.appendChild(picker);
  }
}

function positionPicker() {
  // Position relative to the Edit Styles button in the toolbar
  const stylesBtn = document.querySelector('.toolbar-btn-styles');
  if (!stylesBtn) return;

  const rect = stylesBtn.getBoundingClientRect();
  picker.style.position = 'absolute';
  picker.style.top = `${rect.bottom + window.scrollY + 8}px`;
  picker.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 300))}px`;
}

function getBlockName(el) {
  const block = el.closest('[data-block-name]');
  if (block) return block.dataset.blockName;
  // fallback: check class list
  const blockEl = el.closest('.block');
  if (blockEl) {
    const classes = [...blockEl.classList].filter((c) => c !== 'block');
    return classes[0] || null;
  }
  return null;
}

function isSection(el) {
  return el.classList.contains('section') || el.closest('.section') === el;
}

function showBlockPicker(block, blockName) {
  const variants = BLOCK_VARIANTS[blockName];
  if (!variants || !variants.length) return;

  picker.querySelector('.style-picker-title').textContent = `${blockName} variants`;
  const optionsEl = picker.querySelector('.style-picker-options');
  optionsEl.innerHTML = '';

  // "default" option (no variant)
  const defaultBtn = document.createElement('button');
  defaultBtn.className = 'style-picker-option';
  defaultBtn.textContent = 'default';
  if (!variants.some((v) => block.classList.contains(v))) {
    defaultBtn.classList.add('active');
  }
  defaultBtn.addEventListener('click', () => {
    variants.forEach((v) => block.classList.remove(v));
    showBlockPicker(block, blockName);
  });
  optionsEl.appendChild(defaultBtn);

  variants.forEach((variant) => {
    const btn = document.createElement('button');
    btn.className = 'style-picker-option';
    btn.textContent = variant;
    if (block.classList.contains(variant)) btn.classList.add('active');
    btn.addEventListener('click', () => {
      // toggle: remove all variants, add this one (or remove if already active)
      const wasActive = block.classList.contains(variant);
      variants.forEach((v) => block.classList.remove(v));
      if (!wasActive) block.classList.add(variant);
      showBlockPicker(block, blockName);
    });
    optionsEl.appendChild(btn);
  });

  ensurePickerInDOM();
  picker.classList.add('open');
  positionPicker();
  activeEl = block;
}

function showSectionPicker(section) {
  picker.querySelector('.style-picker-title').textContent = 'Section styles';
  const optionsEl = picker.querySelector('.style-picker-options');
  optionsEl.innerHTML = '';

  SECTION_STYLES.forEach((styleName) => {
    const btn = document.createElement('button');
    btn.className = 'style-picker-option';
    btn.textContent = styleName;
    if (section.classList.contains(styleName)) btn.classList.add('active');
    btn.addEventListener('click', () => {
      section.classList.toggle(styleName);
      showSectionPicker(section);
    });
    optionsEl.appendChild(btn);
  });

  ensurePickerInDOM();
  picker.classList.add('open');
  positionPicker();
  activeEl = section;
}

export function openStylePicker(element) {
  console.log("Opens Styles");
  if (!picker) return;
  const blockName = getBlockName(element);
  if (blockName && BLOCK_VARIANTS[blockName]) {
    const block = element.closest(`[data-block-name="${blockName}"], .${blockName}`) || element;
    showBlockPicker(block, blockName);
    return;
  }
  const section = element.closest('.section') || element;
  if (section) {
    showSectionPicker(section);
  }
}

export default function initStylePicker() {
  picker = createPicker();

  document.addEventListener('dblclick', (e) => {
    const section = e.target.closest('.section');
    const blockName = getBlockName(e.target);

    if (blockName && BLOCK_VARIANTS[blockName]) {
      const block = e.target.closest(`[data-block-name="${blockName}"], .${blockName}`);
      if (block) {
        e.preventDefault();
        showBlockPicker(block, blockName);
        return;
      }
    }

    if (section) {
      e.preventDefault();
      showSectionPicker(section);
    }
  });

  // close on click outside
  document.addEventListener('click', (e) => {
    if (picker.classList.contains('open') && !picker.contains(e.target)) {
      closePicker();
    }
  });

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePicker();
  });
}

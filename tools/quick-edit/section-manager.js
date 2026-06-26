/**
 * Section Manager — Add and remove sections in layout mode.
 * Shows "+" buttons between sections and a delete button on selected sections.
 */

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .lm-section-add {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 0;
      position: relative;
      z-index: 1000;
    }
    .lm-section-add-btn {
      position: absolute;
      top: -14px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #0078d4;
      background: #fff;
      color: #0078d4;
      font-size: 18px;
      font-weight: 300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    }
    .lm-section-add:hover .lm-section-add-btn,
    .lm-section-add-btn:focus { opacity: 1; }
    .lm-section-add-btn:hover {
      background: #0078d4;
      color: #fff;
    }
    .lm-section-delete {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid #e0e0e0;
      background: #fff;
      color: #d32f2f;
      font-size: 14px;
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      box-shadow: 0 2px 6px rgb(0 0 0 / 10%);
    }
    .lm-section-delete:hover {
      background: #d32f2f;
      color: #fff;
      border-color: #d32f2f;
    }
    .section.qe-selected { position: relative; }
    .section.qe-selected .lm-section-delete { display: flex; }
    .section.lm-new-section {
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed #ccc;
      border-radius: 8px;
      margin: 16px 0;
      background: #fafafa;
    }
    .section.lm-new-section::after {
      content: 'New section — click to add content';
      color: #999;
      font-size: 14px;
      font-family: system-ui, sans-serif;
    }
  `;
  document.head.appendChild(style);
}

function createAddButton(referenceSection, position) {
  const wrapper = document.createElement('div');
  wrapper.className = 'lm-section-add';
  const btn = document.createElement('button');
  btn.className = 'lm-section-add-btn';
  btn.title = 'Add section';
  btn.innerHTML = '+';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const newSection = document.createElement('div');
    newSection.className = 'section lm-new-section';
    newSection.setAttribute('data-status', 'loaded');
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    newSection.appendChild(p);
    if (position === 'before') {
      referenceSection.before(newSection);
    } else {
      referenceSection.after(newSection);
    }
    injectControls();
  });
  wrapper.appendChild(btn);
  return wrapper;
}

function createDeleteButton(section) {
  if (section.querySelector('.lm-section-delete')) return;
  const btn = document.createElement('button');
  btn.className = 'lm-section-delete';
  btn.title = 'Delete section';
  btn.innerHTML = '&times;';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Delete this section?')) {
      const addBtns = [];
      const prev = section.previousElementSibling;
      const next = section.nextElementSibling;
      if (prev?.classList.contains('lm-section-add')) addBtns.push(prev);
      if (next?.classList.contains('lm-section-add')) addBtns.push(next);
      addBtns.forEach((ab) => ab.remove());
      section.remove();
      injectControls();
    }
  });
  section.style.position = 'relative';
  section.appendChild(btn);
}

function injectControls() {
  const main = document.querySelector('main .ProseMirror') || document.querySelector('main');
  if (!main) return;

  main.querySelectorAll('.lm-section-add').forEach((el) => el.remove());

  const sections = main.querySelectorAll(':scope > .section');
  sections.forEach((section, idx) => {
    createDeleteButton(section);
    if (idx < sections.length - 1) {
      section.after(createAddButton(section, 'after'));
    }
  });

  const firstSection = sections[0];
  if (firstSection) {
    firstSection.before(createAddButton(firstSection, 'before'));
  }
}

export default function initSectionManager() {
  addStyles();

  const observer = new MutationObserver(() => {
    const main = document.querySelector('main .ProseMirror') || document.querySelector('main');
    if (!main) return;
    const sections = main.querySelectorAll(':scope > .section');
    const addBtns = main.querySelectorAll('.lm-section-add');
    if (sections.length > 0 && addBtns.length === 0) {
      injectControls();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

const PAGE_FIELDS = [
  { id: 'page-title', label: 'Title', prop: 'og:title', type: 'property' },
  { id: 'page-description', label: 'Description', prop: 'og:description', type: 'property', textarea: true },
  { id: 'page-template', label: 'Template', prop: 'template', type: 'name' },
  { id: 'page-breadcrumbs', label: 'Breadcrumbs', prop: 'breadcrumbs', type: 'name', placeholder: '/fragments/breadcrumbs' },
  { id: 'page-robots', label: 'Robots', prop: 'robots', type: 'name', placeholder: 'index, follow' },
];

function getHostParts() {
  let { hostname } = window.location;
  if (hostname === 'localhost') {
    const meta = document.querySelector('meta[property="hlx:proxyUrl"]');
    if (meta) hostname = meta.content;
  }
  const parts = hostname.split('.')[0].split('--');
  const [, repo, owner] = parts;
  const pagePath = window.location.pathname === '/' ? '/index' : window.location.pathname;
  return { owner, repo, pagePath };
}

function getMetaValue(prop, type) {
  const attr = type === 'property' ? 'property' : 'name';
  const el = document.head.querySelector(`meta[${attr}="${prop}"]`);
  return el ? el.content : '';
}

function setMetaValue(prop, type, value) {
  const attr = type === 'property' ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${prop}"]`);
  if (value) {
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, prop);
      document.head.appendChild(el);
    }
    el.content = value;
  } else if (el) {
    el.remove();
  }
}

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .preview-toolbar {
      position: fixed;
      bottom: 16px;
      left: 90%;
      transform: translateX(-50%);
      z-index: 500000;
      display: flex;
      gap: 8px;
      padding: 8px 16px;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgb(0 0 0 / 15%);
      font-family: system-ui, -apple-system, sans-serif;
      align-items: center;
    }
    .preview-toolbar button {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      border: 1px solid #e0e0e0;
      background: #fff;
      color: #333;
      transition: background 0.15s, border-color 0.15s;
    }
    .preview-toolbar button:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }
    .preview-toolbar button.pt-primary {
      background: #0078d4;
      color: #fff;
      border-color: #0078d4;
    }
    .preview-toolbar button.pt-primary:hover {
      background: #0067b8;
    }
    .preview-toolbar button.pt-primary:disabled {
      background: #999;
      border-color: #999;
      cursor: not-allowed;
    }
    .pt-dialog {
      display: none;
      position: fixed;
      z-index: 500001;
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgb(0 0 0 / 18%);
      width: 300px;
      font-family: system-ui, sans-serif;
    }
    .pt-dialog.open { display: flex; flex-direction: column; }
    .pt-dialog .pt-title {
      font-size: 15px;
      font-weight: 700;
      margin: 0 0 16px;
      color: #111;
    }
    .pt-dialog .pt-field { margin-bottom: 12px; }
    .pt-dialog .pt-label {
      font-size: 12px;
      font-weight: 600;
      color: #555;
      display: block;
      margin-bottom: 4px;
    }
    .pt-dialog .pt-input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 13px;
      font-family: inherit;
    }
    .pt-dialog .pt-input:focus {
      outline: none;
      border-color: #0078d4;
    }
    .pt-dialog .pt-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
    .pt-dialog .pt-actions button {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .pt-menu {
      display: none;
      position: fixed;
      z-index: 500001;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
      padding: 10px;
      min-width: 160px;
      font-family: system-ui, sans-serif;
    }
    .pt-menu.open { display: flex; flex-direction: column; gap: 4px; }
    .pt-menu .pt-menu-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #888;
      margin: 0 0 4px;
      padding: 0 8px;
    }
    .pt-menu button {
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      color: #333;
      cursor: pointer;
      text-align: left;
    }
    .pt-menu button:hover {
      background: #f0f0f0;
    }
    .pt-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 500000;
      background: rgb(0 0 0 / 40%);
      align-items: center;
      justify-content: center;
    }
    .pt-overlay.open { display: flex; }
    .pt-publish-dialog {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
      padding: 28px;
      min-width: 300px;
      max-width: 380px;
      font-family: system-ui, sans-serif;
    }
    .pt-publish-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      transition: border-color 0.15s, background 0.15s;
    }
    .pt-publish-option:hover {
      border-color: #ccc;
      background: #fafafa;
    }
    .pt-publish-option:has(input:checked) {
      border-color: #0078d4;
      background: #f0f7ff;
    }
    .pt-publish-option input[type="radio"] {
      accent-color: #0078d4;
      margin: 0;
    }
  `;
  document.head.appendChild(style);
}

function createPageDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'pt-dialog';
  const fieldsHTML = PAGE_FIELDS.map((f) => {
    const input = f.textarea
      ? `<textarea id="pt-${f.id}" class="pt-input" placeholder="${f.placeholder || ''}"></textarea>`
      : `<input id="pt-${f.id}" class="pt-input" placeholder="${f.placeholder || ''}">`;
    return `<div class="pt-field"><span class="pt-label">${f.label}</span>${input}</div>`;
  }).join('');
  dialog.innerHTML = `
    <span class="pt-title">Page Settings</span>
    ${fieldsHTML}
    <div class="pt-actions">
      <button class="pt-cancel">Cancel</button>
      <button class="pt-primary pt-save">Save</button>
    </div>
  `;

  dialog.querySelector('.pt-cancel').addEventListener('click', () => dialog.classList.remove('open'));
  dialog.querySelector('.pt-save').addEventListener('click', () => {
    PAGE_FIELDS.forEach((f) => {
      const val = dialog.querySelector(`#pt-${f.id}`).value;
      setMetaValue(f.prop, f.type, val);
    });
    const title = dialog.querySelector('#pt-page-title').value;
    if (title) document.title = title;
    dialog.classList.remove('open');
  });

  document.addEventListener('click', (e) => {
    if (dialog.classList.contains('open') && !dialog.contains(e.target)) {
      dialog.classList.remove('open');
    }
  });

  return dialog;
}

function createEditMenu() {
  const menu = document.createElement('div');
  menu.className = 'pt-menu';
  menu.innerHTML = `
    <span class="pt-menu-title">Open in</span>
    <button data-mode="da-edit">DA Editor</button>
    <button data-mode="quick-edit">Quick Edit</button>
    <button data-mode="layout-mode">Layout Mode</button>
  `;

  menu.querySelectorAll('button').forEach((option) => {
    option.addEventListener('click', () => {
      const mode = option.dataset.mode;
      menu.classList.remove('open');
      const { owner, repo, pagePath } = getHostParts();
      if (mode === 'da-edit') {
        window.open(`https://da.live/edit#/${owner}/${repo}${pagePath}`, '_blank');
      } else {
        const base = window.location.origin + window.location.pathname;
        window.location.href = `${base}?${mode}`;
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });

  return menu;
}

function createPublishOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'pt-overlay';
  overlay.innerHTML = `
    <div class="pt-publish-dialog">
      <span class="pt-title">Publish</span>
      <p style="font-size:13px;color:#555;margin:0 0 16px;">Select an action for this page:</p>
      <label class="pt-publish-option">
        <input type="radio" name="pt-publish-action" value="preview" checked>
        <span>Preview (.page)</span>
      </label>
      <label class="pt-publish-option">
        <input type="radio" name="pt-publish-action" value="publish">
        <span>Publish (.live)</span>
      </label>
      <div class="pt-actions" style="margin-top:16px;">
        <button class="pt-cancel">Cancel</button>
        <button class="pt-primary pt-confirm">Continue</button>
      </div>
    </div>
  `;

  overlay.querySelector('.pt-cancel').addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

  overlay.querySelector('.pt-confirm').addEventListener('click', async () => {
    const action = overlay.querySelector('input[name="pt-publish-action"]:checked').value;
    const { owner, repo, pagePath } = getHostParts();
    const apiBase = `https://admin.hlx.page/${action}/${owner}/${repo}/main${pagePath}`;
    overlay.classList.remove('open');
    try {
      const resp = await fetch(apiBase, { method: 'POST' });
      if (resp.ok) {
        // eslint-disable-next-line no-alert
        alert(`${action === 'preview' ? 'Preview' : 'Publish'} successful!`);
      } else {
        // eslint-disable-next-line no-alert
        alert(`${action} failed: ${resp.status}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(`Error: ${err.message}`);
    }
  });

  return overlay;
}

export default function init() {
  addStyles();

  const toolbar = document.createElement('div');
  toolbar.className = 'preview-toolbar';

  const pageDialog = createPageDialog();
  const editMenu = createEditMenu();
  const publishOverlay = createPublishOverlay();

  // Page button
  const pageBtn = document.createElement('button');
  pageBtn.textContent = 'Page';
  pageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.body.contains(pageDialog)) document.body.appendChild(pageDialog);
    PAGE_FIELDS.forEach((f) => {
      const input = pageDialog.querySelector(`#pt-${f.id}`);
      input.value = getMetaValue(f.prop, f.type);
    });
    const titleInput = pageDialog.querySelector('#pt-page-title');
    if (!titleInput.value) titleInput.value = document.title || '';
    const rect = pageBtn.getBoundingClientRect();
    pageDialog.style.bottom = `${window.innerHeight - rect.top + 8}px`;
    pageDialog.style.left = `${rect.left}px`;
    pageDialog.classList.add('open');
    setTimeout(() => titleInput.focus(), 50);
  });

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.body.contains(editMenu)) document.body.appendChild(editMenu);
    const rect = editBtn.getBoundingClientRect();
    Object.assign(editMenu.style, {
      bottom: `${window.innerHeight - rect.top + 8}px`,
      left: `${rect.left}px`,
    });
    editMenu.classList.toggle('open');
  });

  // Publish button
  const publishBtn = document.createElement('button');
  publishBtn.className = 'pt-primary';
  publishBtn.textContent = 'Publish';
  publishBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.body.contains(publishOverlay)) document.body.appendChild(publishOverlay);
    publishOverlay.classList.add('open');
  });

  toolbar.append(pageBtn, editBtn, publishBtn);
  document.body.appendChild(toolbar);
}

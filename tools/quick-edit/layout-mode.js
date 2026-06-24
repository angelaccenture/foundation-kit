import { loadPage } from '../../scripts/scripts.js';
import injectToolbarButtons from './toolbar-buttons.js';
import { getBlockConfig, getSectionConfig } from './config-loader.js';

function applyLayoutModeUI() {
  const style = document.createElement('style');
  style.textContent = `
    .prosemirror-floating-toolbar {
      display: none !important;
    }
    .quick-edit-publish {
      display: none !important;
    }
    .ProseMirror {
      cursor: default !important;
      caret-color: transparent !important;
    }
    .ProseMirror * {
      user-select: none !important;
      -webkit-user-select: none !important;
    }
    .ProseMirror:focus,
    .ProseMirror *:focus {
      outline: none !important;
    }
    .ProseMirror ::selection {
      background: transparent !important;
    }
    .ProseMirror p.is-selected,
    .ProseMirror .ProseMirror-selectednode,
    .ProseMirror [data-active],
    .ProseMirror .selectedCell {
      outline: none !important;
      border: none !important;
      background: transparent !important;
    }
    [contenteditable="true"]:hover {
      outline: unset !important;
    }
    .lm-hover-block {
      outline: 1.5px dashed #0078d4 !important;
      outline-offset: 2px;
      border-radius: 4px;
    }
    .lm-hover-section {
      outline: 3px dashed #0078d4 !important;
      outline-offset: 2px;
      border-radius: 4px;
    }
    .lm-selected-section {
      outline: 3px solid #0078d4 !important;
      outline-offset: 2px;
      border-radius: 4px;
    }
    .lm-selected-block {
      outline: 1.5px solid #0078d4 !important;
      outline-offset: 2px;
      border-radius: 4px;
    }
    .lm-context-bar {
      position: absolute;
      z-index: 100000;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 4px 12px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
      font-family: system-ui, sans-serif;
      font-size: 13px;
      color: #333;
      display: flex;
      align-items: center;
      height: 32px;
      gap: 4px;
    }
    .lm-action-btn {
      border: none;
      background: transparent;
      color: #555;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-family: inherit;
      text-transform: capitalize;
    }
    .lm-action-btn:hover {
      background: #f0f0f0;
      color: #111;
    }
    .lm-classes-dropdown {
      position: relative;
      display: inline-flex;
    }
    .lm-classes-trigger {
      border: 1px solid #e0e0e0;
      background: #fff;
      color: #333;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-family: inherit;
    }
    .lm-classes-trigger:hover { border-color: #ccc; }
    .lm-classes-trigger::after { content: ' ▾'; font-size: 9px; }
    .lm-classes-menu {
      display: none;
      position: fixed;
      z-index: 200000;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
      padding: 8px 0;
      min-width: 160px;
      max-height: 240px;
      overflow-y: auto;
      font-family: system-ui, sans-serif;
    }
    .lm-classes-menu.open { display: block; }
    .lm-classes-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      font-size: 13px;
      color: #333;
      cursor: pointer;
    }
    .lm-classes-option:hover { background: #f5f5f5; }
    .lm-classes-option input { margin: 0; accent-color: #0078d4; }
    .lm-classes-option.active { font-weight: 600; }
    .lm-classes-group {
      padding: 8px 12px 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 0.5px;
    }
    .lm-select {
      border: 1px solid #e0e0e0;
      background: #fff;
      color: #333;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 6px;
      border-radius: 3px;
      cursor: pointer;
      font-family: inherit;
      appearance: auto;
    }
    .lm-select:hover { border-color: #ccc; }
    .lm-select:focus { outline: none; border-color: #0078d4; }
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
    .lm-block-picker-item:hover { background: #f5f5f5; }
    .lm-block-picker-item.selected {
      background: #e8f0fe;
      color: #0078d4;
    }
    .lm-block-picker-item.hidden { display: none; }
    .lm-block-picker-group {
      padding: 10px 12px 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 0.5px;
      list-style: none;
    }
    .lm-block-picker-empty {
      padding: 12px;
      font-size: 13px;
      color: #999;
      list-style: none;
    }
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

  let contextBar = null;
  let hoverTarget = null;

  document.addEventListener('mouseover', (e) => {
    if (contextBar && contextBar.contains(e.target)) return;
    if (hoverTarget) {
      hoverTarget.classList.remove('lm-hover-block', 'lm-hover-section');
      hoverTarget = null;
    }
    const block = e.target.closest('[data-block-name]');
    if (block && !block.classList.contains('lm-selected-block')) {
      block.classList.add('lm-hover-block');
      hoverTarget = block;
      return;
    }
    const section = e.target.closest('.section');
    if (section && !section.classList.contains('lm-selected-section')) {
      section.classList.add('lm-hover-section');
      hoverTarget = section;
    }
  });

  function ensureBar() {
    if (!contextBar) {
      contextBar = document.createElement('div');
      contextBar.className = 'lm-context-bar';
    }
    if (!document.body.contains(contextBar)) {
      document.body.appendChild(contextBar);
    }
    return contextBar;
  }

  function positionBar(target) {
    const bar = ensureBar();
    bar.style.display = 'flex';
    const rect = target.getBoundingClientRect();
    const barHeight = 32;
    let top = rect.top + window.scrollY - barHeight - 8;
    if (top < window.scrollY) top = rect.bottom + window.scrollY + 8;
    const left = Math.max(8, Math.min(
      rect.left + (rect.width / 2) - (bar.offsetWidth / 2),
      window.innerWidth - bar.offsetWidth - 8,
    ));
    bar.style.top = `${top}px`;
    bar.style.left = `${left}px`;
  }

  async function getDAToken() {
    // Check sessionStorage first
    const stored = sessionStorage.getItem('da-token');
    if (stored) return stored;

    // Try iframe postMessage
    const iframe = document.querySelector('#quick-edit-iframe, iframe[src*="da.live"]');
    if (iframe) {
      const token = await new Promise((resolve) => {
        const handler = (e) => {
          if (e.data?.type === 'token') {
            window.removeEventListener('message', handler);
            resolve(e.data.token);
          }
        };
        window.addEventListener('message', handler);
        iframe.contentWindow.postMessage({ type: 'get-token' }, '*');
        setTimeout(() => { window.removeEventListener('message', handler); resolve(null); }, 2000);
      });
      if (token) {
        sessionStorage.setItem('da-token', token);
        return token;
      }
    }

    // Fallback: prompt the author with a copyable dialog
    const tokenDialog = document.createElement('div');
    tokenDialog.style.cssText = 'position:fixed;inset:0;z-index:400000;background:rgb(0 0 0/40%);display:flex;align-items:center;justify-content:center;';
    tokenDialog.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:24px;max-width:440px;font-family:system-ui,sans-serif;box-shadow:0 8px 32px rgb(0 0 0/20%);">
        <h3 style="margin:0 0 12px;font-size:16px;">DA Token Required</h3>
        <p style="margin:0 0 8px;font-size:13px;color:#555;">To save style changes, paste your DA token below.</p>
        <p style="margin:0 0 4px;font-size:13px;color:#555;">Get your token — run this in the DevTools Console on da.live:</p>
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <input readonly value='copy((await (await fetch("https://admin.da.live/auth/me")).json()).token)' style="flex:1;padding:8px;border:1px solid #e0e0e0;border-radius:4px;font-size:12px;font-family:monospace;">
          <button class="da-token-copy" style="padding:8px 12px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:12px;">Copy</button>
        </div>
        <input class="da-token-input" placeholder="Paste token here..." style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #e0e0e0;border-radius:6px;font-size:14px;margin-bottom:16px;">
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="da-token-cancel" style="padding:8px 20px;border:1px solid #ccc;border-radius:6px;background:#fff;font-size:14px;font-weight:600;cursor:pointer;">Cancel</button>
          <button class="da-token-ok" style="padding:8px 20px;border:none;border-radius:6px;background:#0078d4;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(tokenDialog);

    tokenDialog.querySelector('.da-token-copy').addEventListener('click', () => {
      const cmd = tokenDialog.querySelector('input[readonly]');
      navigator.clipboard.writeText(cmd.value);
      tokenDialog.querySelector('.da-token-copy').textContent = 'Copied!';
    });

    const input = await new Promise((resolve) => {
      tokenDialog.querySelector('.da-token-cancel').addEventListener('click', () => {
        tokenDialog.remove();
        resolve(null);
      });
      tokenDialog.querySelector('.da-token-ok').addEventListener('click', () => {
        const val = tokenDialog.querySelector('.da-token-input').value.trim();
        tokenDialog.remove();
        resolve(val || null);
      });
    });
    if (input) {
      const trimmed = input.trim();
      sessionStorage.setItem('da-token', trimmed);
      return trimmed;
    }
    return null;
  }

  function getDAInfo() {
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

  const pendingChanges = {};
  const pendingOps = [];

  function getBlockIndex(target) {
    const main = document.querySelector('main');
    const sections = [...main.querySelectorAll(':scope > .section, :scope > div')];
    const section = target.closest('.section');
    const sectionIdx = sections.indexOf(section);
    if (target.classList.contains('section') || target === section) {
      return { type: 'section', index: sectionIdx };
    }
    const block = target.closest('[data-block-name]') || target;
    const blockName = block.dataset.blockName || block.classList[0];
    const sameNameBlocks = [...(section?.querySelectorAll(`[data-block-name="${blockName}"]`) || [])];
    const nthOfName = sameNameBlocks.indexOf(block);
    return { type: 'block', sectionIndex: sectionIdx, blockName, nthOfName };
  }

  function updateBlockHeader(target, blockName, availableOptions) {
    const activeClasses = availableOptions.filter((cls) => target.classList.contains(cls));

    // Update the visual (decorated) element immediately
    const decorated = target.closest('[data-block-name]') || target;
    availableOptions.forEach((cls) => {
      decorated.classList.toggle(cls, activeClasses.includes(cls));
    });

    // Find which nth instance of this block name we're targeting
    const section = target.closest('.section');
    const sameNameBlocks = [...(section?.querySelectorAll(`[data-block-name="${blockName}"]`) || [])];
    const nthOfName = sameNameBlocks.indexOf(decorated);

    // Track change for save — keyed by name + nth
    const key = `${blockName}:${nthOfName}`;
    pendingChanges[key] = { blockName, nthOfName, activeClasses };
    showSaveButton();
  }

  function showSaveButton() {
    const saveBtn = document.querySelector('.lm-save-btn');
    if (saveBtn) saveBtn.classList.add('has-changes');
  }


  async function saveAllChanges() {
    if (!Object.keys(pendingChanges).length && !structureChanged) {
      console.warn('Layout Mode: No changes to save');
      return;
    }
    const token = await getDAToken();
    if (!token) {
      alert('No DA token available. Please try again.');
      return;
    }

    try {
      const { owner, repo, pagePath } = getDAInfo();
      const sourceUrl = `https://admin.da.live/source/${owner}/${repo}${pagePath}.html`;
      console.log('Layout Mode: Fetching source from', sourceUrl);

      const getResp = await fetch(sourceUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!getResp.ok) {
        alert(`Failed to fetch source: ${getResp.status}`);
        return;
      }
      let html = await getResp.text();
      console.log('Layout Mode: Source fetched, length:', html.length);

      // Parse source into a wrapper for manipulation
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;

      // Apply style changes — target specific nth instance of each block
      Object.values(pendingChanges).forEach(({ blockName, nthOfName, activeClasses }) => {
        const matching = [...wrapper.querySelectorAll(`div.${blockName}`)];
        const el = matching[nthOfName];
        if (el) {
          el.className = [blockName, ...activeClasses].join(' ');
        }
      });

      // Apply structural operations
      if (structureChanged) {

        pendingOps.forEach((op) => {
          const currentSections = [...wrapper.querySelectorAll(':scope > div')];
          if (op.type === 'section') {
            const el = currentSections[op.index];
            if (!el) return;
            if (op.action === 'move-up' && op.index > 0) currentSections[op.index - 1].before(el);
            else if (op.action === 'move-down' && op.index < currentSections.length - 1) currentSections[op.index + 1].after(el);
            else if (op.action === 'delete') el.remove();
            else if (op.action === 'duplicate') el.after(el.cloneNode(true));
          } else if (op.type === 'block') {
            const section = currentSections[op.sectionIndex];
            if (!section) return;
            const matching = [...section.querySelectorAll(`div.${op.blockName}`)];
            const el = matching[op.nthOfName];
            if (!el) return;
            const prev = el.previousElementSibling;
            const next = el.nextElementSibling;
            if (op.action === 'move-up' && prev) prev.before(el);
            else if (op.action === 'move-down' && next) next.after(el);
            else if (op.action === 'delete') el.remove();
            else if (op.action === 'duplicate') el.after(el.cloneNode(true));
          }
        });

      }

      html = wrapper.innerHTML;
      console.log('Layout Mode: Saving to DA, length:', html.length);
      const putResp = await fetch(sourceUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/html',
        },
        body: html,
      });
      if (putResp.ok) {
        console.log('Layout Mode: Save successful, reloading');
        window.location.reload();
      } else {
        alert(`Save failed: ${putResp.status}`);
      }
    } catch (err) {
      console.error('Layout Mode: DA save failed:', err);
      alert(`Save error: ${err.message}`);
    }
  }

  window._lmSaveAllChanges = saveAllChanges;

  function renderActions(config, label, target) {
    const bar = ensureBar();
    bar.innerHTML = '';
    const blockName = (target.dataset.blockName || target.classList[0] || '').toLowerCase();

    const nameSpan = document.createElement('span');
    nameSpan.textContent = label;
    nameSpan.style.cssText = 'font-weight:600;margin-right:12px;';
    bar.appendChild(nameSpan);

    const properties = config.properties || [];
    properties.forEach((prop) => {
      if (prop.name === 'classes') {
        const wrapper = document.createElement('div');
        wrapper.className = 'lm-classes-dropdown';

        const trigger = document.createElement('button');
        trigger.className = 'lm-classes-trigger';
        trigger.textContent = 'Styles';

        const menu = document.createElement('div');
        menu.className = 'lm-classes-menu';

        const groups = prop.options || [];
        if (groups.length === 0) {
          const empty = document.createElement('div');
          empty.style.cssText = 'padding:8px 12px;font-size:12px;color:#999;';
          empty.textContent = 'No styles available';
          menu.appendChild(empty);
        }
        const allValues = groups.flatMap((g) => (g.options || []).map((o) => (typeof o === 'string' ? o : o.value)));
        groups.forEach((group) => {
          if (group.group) {
            const header = document.createElement('div');
            header.className = 'lm-classes-group';
            header.textContent = group.group;
            menu.appendChild(header);
          }
          (group.options || []).forEach((opt) => {
            const cls = typeof opt === 'string' ? opt : opt.value;
            const displayName = typeof opt === 'string' ? opt : opt.name;
            const option = document.createElement('label');
            option.className = 'lm-classes-option';
            const isActive = target.classList.contains(cls);
            if (isActive) option.classList.add('active');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isActive;
            checkbox.addEventListener('change', () => {
              target.classList.toggle(cls, checkbox.checked);
              option.classList.toggle('active', checkbox.checked);
              updateBlockHeader(target, blockName, allValues);
            });
            const text = document.createElement('span');
            text.textContent = displayName;
            option.append(checkbox, text);
            menu.appendChild(option);
          });
        });

        trigger.addEventListener('mousedown', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
          const rect = trigger.getBoundingClientRect();
          menu.style.top = `${rect.bottom + 4}px`;
          menu.style.left = `${rect.left}px`;
          menu.classList.toggle('open');
        });

        wrapper.append(trigger);
        document.body.appendChild(menu);
        bar.appendChild(wrapper);
      } else if (prop.type === 'select' && prop.options) {
        const prefix = prop.prefix || `${prop.name}-`;
        const prefixedOptions = prop.options.map((o) => (o === 'none' ? 'none' : `${prefix}${o}`));
        const current = prefixedOptions.find((cls) => cls !== 'none' && target.classList.contains(cls)) || 'none';

        const select = document.createElement('select');
        select.className = 'lm-select';
        select.title = prop.label || prop.name;

        prop.options.forEach((opt, i) => {
          const optEl = document.createElement('option');
          optEl.value = prefixedOptions[i];
          optEl.textContent = opt === 'none' ? `${prop.label || prop.name}` : `${prop.label || prop.name}: ${opt}`;
          optEl.selected = prefixedOptions[i] === current;
          select.appendChild(optEl);
        });

        select.addEventListener('change', () => {
          prefixedOptions.forEach((cls) => {
            if (cls !== 'none') target.classList.remove(cls);
          });
          if (prefix === 'grid-' && select.value === 'none') {
            target.classList.remove('grid');
          }
          if (select.value !== 'none') {
            target.classList.add(select.value);
            if (prefix === 'grid-') target.classList.add('grid');
          }
          if (prefix === 'container-') {
            target.classList.toggle('container', select.value !== 'none');
          }
          markStructureChanged();
          showSaveButton();
        });

        bar.appendChild(select);
      }
    });

    const sep = document.createElement('span');
    sep.style.cssText = 'width:1px;height:16px;background:#e0e0e0;margin:0 6px;';
    if (config.actions && config.actions.length && properties.length) bar.appendChild(sep);

    const actions = config.actions || [];
    actions.forEach((action) => {
      const btn = document.createElement('button');
      btn.className = 'lm-action-btn';
      btn.textContent = action;
      btn.title = action;
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handleAction(action, target);
      });
      bar.appendChild(btn);
    });
  }

  let blockListCache = null;

  async function fetchBlockList() {
    if (blockListCache) return blockListCache;
    try {
      let { hostname } = window.location;
      if (hostname === 'localhost') {
        const meta = document.querySelector('meta[property="hlx:proxyUrl"]');
        if (meta) hostname = meta.content;
      }
      const parts = hostname.split('.')[0].split('--');
      const [, repo, owner] = parts;
      const baseUrl = `https://main--${repo}--${owner}.aem.page/docs/library/block-list`;

      // Check for template-specific block list first
      const templateMeta = document.head.querySelector('meta[name="template"]');
      const template = templateMeta ? templateMeta.content.toLowerCase().replace(/\s+/g, '-') : null;

      let resp;
      if (template) {
        resp = await fetch(`${baseUrl}/${template}.json`);
      }
      if (!resp || !resp.ok) {
        resp = await fetch(`${baseUrl}/default.json`);
      }
      if (!resp.ok) throw new Error('Failed to fetch block list');
      const json = await resp.json();
      if (!json.data) return [];

      const groups = [];
      let currentGroup = null;
      json.data.forEach((row) => {
        const groupName = row.Group || row.group || '';
        if (groupName) {
          currentGroup = { group: groupName, items: [] };
          groups.push(currentGroup);
        }
        if (!currentGroup) {
          currentGroup = { group: '', items: [] };
          groups.push(currentGroup);
        }
        currentGroup.items.push({
          name: row.Name || row.name || row.Value || row.value,
          value: row.Value || row.value || row.Name || row.name,
        });
      });
      blockListCache = groups;
      return groups;
    } catch {
      blockListCache = [];
      return [];
    }
  }

  let pickerOverlay = null;
  let pickerTarget = null;
  let pickerSelected = null;

  async function createBlockPicker() {
    const groups = await fetchBlockList();
    let listHTML = '';
    groups.forEach((group) => {
      if (group.group) {
        listHTML += `<li class="lm-block-picker-group">${group.group}</li>`;
      }
      group.items.forEach((b) => {
        listHTML += `<li class="lm-block-picker-item" data-value="${b.value}">${b.name}</li>`;
      });
    });
    if (!listHTML) listHTML = '<li class="lm-block-picker-empty">No blocks available</li>';

    pickerOverlay = document.createElement('div');
    pickerOverlay.className = 'lm-block-picker-overlay';
    pickerOverlay.innerHTML = `
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

    const search = pickerOverlay.querySelector('.lm-block-picker-search');
    const list = pickerOverlay.querySelector('.lm-block-picker-list');
    const insertBtn = pickerOverlay.querySelector('.lm-block-picker-insert');
    const cancelBtn = pickerOverlay.querySelector('.lm-block-picker-cancel');

    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      list.querySelectorAll('.lm-block-picker-item').forEach((item) => {
        item.classList.toggle('hidden', !item.textContent.toLowerCase().includes(q));
      });
    });

    list.addEventListener('click', (ev) => {
      const item = ev.target.closest('.lm-block-picker-item');
      if (!item) return;
      list.querySelectorAll('.lm-block-picker-item').forEach((i) => i.classList.remove('selected'));
      item.classList.add('selected');
      pickerSelected = item.dataset.value;
      insertBtn.classList.add('ready');
    });

    cancelBtn.addEventListener('click', () => closePicker());
    pickerOverlay.addEventListener('click', (ev) => { if (ev.target === pickerOverlay) closePicker(); });

    insertBtn.addEventListener('click', () => {
      if (!pickerSelected || !pickerTarget) return;
      const blockDiv = document.createElement('div');
      blockDiv.className = pickerSelected;
      const inner = document.createElement('div');
      inner.innerHTML = '<p><br></p>';
      blockDiv.appendChild(inner);
      pickerTarget.appendChild(blockDiv);
      closePicker();
    });

    document.body.appendChild(pickerOverlay);
  }

  function closePicker() {
    if (!pickerOverlay) return;
    pickerOverlay.classList.remove('open');
    pickerSelected = null;
    pickerTarget = null;
    const insertBtn = pickerOverlay.querySelector('.lm-block-picker-insert');
    insertBtn.classList.remove('ready');
    pickerOverlay.querySelectorAll('.lm-block-picker-item').forEach((i) => i.classList.remove('selected'));
    pickerOverlay.querySelector('.lm-block-picker-search').value = '';
    pickerOverlay.querySelectorAll('.lm-block-picker-item').forEach((i) => i.classList.remove('hidden'));
  }

  async function openBlockPicker(section) {
    if (!pickerOverlay) await createBlockPicker();
    pickerTarget = section;
    pickerOverlay.classList.add('open');
    setTimeout(() => pickerOverlay.querySelector('.lm-block-picker-search').focus(), 50);
  }

  let structureChanged = false;

  function markStructureChanged() {
    structureChanged = true;
    showSaveButton();
  }

  function handleAction(action, target) {
    const pos = getBlockIndex(target);

    switch (action) {
      case 'move-up': {
        const prev = target.previousElementSibling;
        if (prev && !prev.classList.contains('lm-context-bar')) {
          prev.before(target);
          positionBar(target);
          pendingOps.push({ ...pos, action: 'move-up' });
          markStructureChanged();
        }
        break;
      }
      case 'move-down': {
        const next = target.nextElementSibling;
        if (next && !next.classList.contains('lm-context-bar')) {
          next.after(target);
          positionBar(target);
          pendingOps.push({ ...pos, action: 'move-down' });
          markStructureChanged();
        }
        break;
      }
      case 'delete':
        if (confirm('Delete this element?')) {
          pendingOps.push({ ...pos, action: 'delete' });
          clearSelection();
          target.remove();
          markStructureChanged();
        }
        break;
      case 'duplicate': {
        const clone = target.cloneNode(true);
        clone.classList.remove('lm-selected-block', 'lm-selected-section');
        target.after(clone);
        pendingOps.push({ ...pos, action: 'duplicate' });
        markStructureChanged();
        break;
      }
      case 'add-block':
        openBlockPicker(target);
        break;
      default:
        break;
    }
  }

  async function showBlockBar(target) {
    const name = target.dataset.blockName || target.classList[0] || 'block';
    const config = await getBlockConfig(name);
    const label = config.label || name;
    renderActions(config, label, target);
    positionBar(target);
  }

  async function showSectionBar(target) {
    const config = await getSectionConfig();
    renderActions(config, 'Section', target);
    positionBar(target);
  }

  function clearSelection() {
    document.querySelectorAll('.lm-selected-section, .lm-selected-block, .lm-hover-block, .lm-hover-section').forEach((el) => {
      el.classList.remove('lm-selected-section', 'lm-selected-block', 'lm-hover-block', 'lm-hover-section');
    });
    hoverTarget = null;
    if (contextBar) contextBar.style.display = 'none';
    document.querySelectorAll('.lm-classes-menu').forEach((m) => m.remove());
  }

  document.addEventListener('click', (e) => {
    if (contextBar && contextBar.contains(e.target)) return;
    const openMenu = document.querySelector('.lm-classes-menu.open');
    if (openMenu && openMenu.contains(e.target)) return;
    const toolbar = document.querySelector('.prosemirror-floating-toolbar');
    if (toolbar && toolbar.contains(e.target)) return;

    // Close any open styles menu
    document.querySelectorAll('.lm-classes-menu.open').forEach((m) => m.classList.remove('open'));

    clearSelection();

    const block = e.target.closest('[data-block-name]');
    if (block) {
      block.classList.add('lm-selected-block');
      showBlockBar(block);
      return;
    }

    const section = e.target.closest('.section');
    if (section) {
      section.classList.add('lm-selected-section');
      showSectionBar(section);
    }
  });
}

const importMap = {
  imports: {
    'da-lit': 'https://da.live/deps/lit/dist/index.js',
    'da-y-wrapper': 'https://da.live/deps/da-y-wrapper/dist/index.js',
  },
};

function addImportmap() {
  const importmapEl = document.createElement('script');
  importmapEl.type = 'importmap';
  importmapEl.textContent = JSON.stringify(importMap);
  document.head.appendChild(importmapEl);
}

function injectSaveButton() {
  const buttonsBar = document.querySelector('.quick-edit-buttons');
  if (!buttonsBar || buttonsBar.querySelector('.lm-save-btn')) return;

  // Hide publish button in layout-mode
  const publishBtn = buttonsBar.querySelector('.quick-edit-publish');
  if (publishBtn) publishBtn.style.setProperty('display', 'none', 'important');

  const style = document.createElement('style');
  style.textContent = `
    .lm-save-btn {
      display: flex;
      background: #ccc;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: not-allowed;
      font-family: inherit;
    }
    .lm-save-btn.has-changes {
      background: #0078d4;
      cursor: pointer;
    }
    .lm-save-btn.has-changes:hover { background: #0067b8; }
    .lm-save-btn:disabled { background: #999; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'lm-save-btn';
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', async () => {
    if (!saveBtn.classList.contains('has-changes')) {
      alert('No changes detected');
      return;
    }
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    if (!window._lmSaveAllChanges) {
      alert('Save function not ready');
      saveBtn.textContent = 'Save';
      saveBtn.disabled = false;
      return;
    }
    await window._lmSaveAllChanges();
    saveBtn.textContent = 'Save';
    saveBtn.disabled = false;
  });

  buttonsBar.appendChild(saveBtn);
}

async function loadModule(origin, payload) {
  const { default: loadQuickEdit } = await import(`${origin}/nx/public/plugins/quick-edit/quick-edit.js`);
  applyLayoutModeUI();

  const observer = new MutationObserver(() => {
    injectToolbarButtons();
    injectSaveButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  loadQuickEdit(payload, loadPage);
}

function generateSidekickPayload() {
  let { hostname } = window.location;
  if (hostname === 'localhost') {
    hostname = document.querySelector('meta[property="hlx:proxyUrl"]').content;
  }
  const parts = hostname.split('.')[0].split('--');
  const [, repo, owner] = parts;

  return {
    detail: {
      config: { mountpoint: `https://content.da.live/${owner}/${repo}/` },
      location: { pathname: window.location.pathname },
    },
  };
}

function showLoader() {
  const loader = document.createElement('div');
  loader.id = 'lm-loader';
  loader.innerHTML = `
    <style>
      #lm-loader {
        position: fixed;
        inset: 0;
        z-index: 500000;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        font-family: system-ui, sans-serif;
      }
      #lm-loader .lm-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e0e0e0;
        border-top-color: #0078d4;
        border-radius: 50%;
        animation: lm-spin 0.8s linear infinite;
      }
      @keyframes lm-spin { to { transform: rotate(360deg); } }
      #lm-loader .lm-loader-text {
        font-size: 14px;
        color: #555;
      }
    </style>
    <div class="lm-spinner"></div>
    <span class="lm-loader-text">Loading Layout Mode...</span>
  `;
  document.body.appendChild(loader);
}

function hideLoader() {
  const loader = document.getElementById('lm-loader');
  if (loader) loader.remove();
}

export default function init(payload) {
  const { search } = window.location;
  const ref = new URLSearchParams(search).get('layout-mode');
  let origin;
  if (ref === 'on' || !ref) origin = 'https://main--da-nx--adobe.aem.live';
  if (ref === 'local') origin = 'http://localhost:6456';
  if (!origin) origin = `https://${ref}--da-nx--adobe.aem.live`;
  addImportmap();
  loadModule(origin, payload || generateSidekickPayload()).then(hideLoader);
}

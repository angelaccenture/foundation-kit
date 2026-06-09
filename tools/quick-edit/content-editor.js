/**
 * Content Editor — shared text formatting toolbar and image alt editor.
 * Used by both quick-edit and layout-mode tools.
 */

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .prosemirror-floating-toolbar > *:not(.qe-custom-toolbar) {
      display: none !important;
    }
    .da-floating-toolbar,
    .da-toolbar,
    [class*="da-"] button[class*="bold"],
    [class*="da-"] button[class*="italic"],
    [class*="da-"] button[class*="underline"],
    .ProseMirror-gapcursor + div,
    div[class*="toolbar"]:not(.prosemirror-floating-toolbar):not(.qe-custom-toolbar) {
      display: none !important;
    }
    .prosemirror-floating-toolbar {
      background: #fff !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 4px !important;
      padding: 2px 6px !important;
      box-shadow: 0 1px 4px rgb(0 0 0 / 6%) !important;
      display: flex;
      align-items: center !important;
      gap: 0 !important;
      height: 32px !important;
    }
    .qe-custom-toolbar {
      display: flex;
      align-items: center;
      gap: 0;
      height: 100%;
    }
    .qe-custom-toolbar .qe-separator {
      width: 1px;
      height: 18px;
      background: #e0e0e0;
      margin: 0 6px;
    }
    .qe-custom-toolbar .qe-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border: none;
      background: transparent;
      border-radius: 3px;
      cursor: pointer;
      color: #111;
      padding: 0;
      font-family: Georgia, serif;
    }
    .qe-custom-toolbar .qe-btn:hover {
      background: #f0f0f0;
      color: #333;
    }
    .qe-custom-toolbar .qe-btn.active {
      color: #000;
      background: #e8e8e8;
    }
    .qe-custom-toolbar .qe-btn.active svg {
      stroke-width: 2.5;
    }
    .qe-custom-toolbar .qe-btn svg {
      width: 15px;
      height: 15px;
    }
    .qe-custom-toolbar .qe-dropdown {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border: 1px solid #e0e0e0;
      border-radius: 3px;
      background: #fff;
      font-size: 12px;
      color: #666;
      cursor: pointer;
      height: 24px;
      margin-right: 6px;
      font-family: system-ui, sans-serif;
    }
    .qe-custom-toolbar .qe-dropdown:hover {
      border-color: #ccc;
      color: #333;
    }
    .qe-custom-toolbar .qe-dropdown::after {
      content: '▾';
      font-size: 10px;
    }
    .qe-dropdown-menu {
      display: none;
      position: absolute;
      z-index: 100002;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
      padding: 4px 0;
      min-width: 140px;
      font-family: system-ui, sans-serif;
    }
    .qe-dropdown-menu.open { display: block; }
    .qe-dropdown-option {
      display: block;
      width: 100%;
      padding: 6px 12px;
      border: none;
      background: transparent;
      text-align: left;
      font-size: 13px;
      color: #333;
      cursor: pointer;
      font-family: inherit;
    }
    .qe-dropdown-option:hover {
      background: #f0f0f0;
    }
  `;
  document.head.appendChild(style);
}


function detectImage(rawTarget) {
  const img = rawTarget.closest('img, picture, svg, video, canvas, [class*="image"], [class*="img"]');
  if (img) return img;
  if (rawTarget.tagName === 'IMG' || rawTarget.tagName === 'PICTURE') return rawTarget;
  const parent = rawTarget.parentElement;
  if (parent && parent.querySelector('img') && !parent.textContent.trim()) return parent;
  return null;
}

function injectFormattingToolbar() {
  const toolbar = document.querySelector('.prosemirror-floating-toolbar');
  if (!toolbar || toolbar.querySelector('.qe-custom-toolbar')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'qe-custom-toolbar';

  const sep = () => {
    const s = document.createElement('span');
    s.className = 'qe-separator';
    return s;
  };

  function dispatchKey(key, opts = {}) {
    const editor = document.querySelector('.ProseMirror');
    if (!editor) return;
    const eventOpts = {
      key,
      code: `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
      ctrlKey: opts.ctrl || false,
      metaKey: opts.meta || false,
      shiftKey: opts.shift || false,
    };
    const isMac = /Mac/.test(navigator.platform);
    if (isMac) { eventOpts.metaKey = true; } else { eventOpts.ctrlKey = true; }
    editor.dispatchEvent(new KeyboardEvent('keydown', eventOpts));
  }

  const btn = (svg, title, action) => {
    const b = document.createElement('button');
    b.className = 'qe-btn';
    b.title = title;
    b.innerHTML = svg;
    b.addEventListener('mousedown', (e) => {
      e.preventDefault();
      action();
    });
    return b;
  };

  const textBtn = (label, title, action, style) => {
    const b = document.createElement('button');
    b.className = 'qe-btn';
    b.title = title;
    b.textContent = label;
    if (style) b.style.cssText = style;
    b.addEventListener('mousedown', (e) => { e.preventDefault(); action(); });
    return b;
  };

  const dropdown = document.createElement('button');
  dropdown.className = 'qe-dropdown';
  dropdown.textContent = 'Paragraph';
  dropdown.title = 'Block format';

  const formats = [
    { label: 'Paragraph', tag: 'p' },
    { label: 'Heading 1', tag: 'h1' },
    { label: 'Heading 2', tag: 'h2' },
    { label: 'Heading 3', tag: 'h3' },
    { label: 'Heading 4', tag: 'h4' },
    { label: 'Heading 5', tag: 'h5' },
    { label: 'Heading 6', tag: 'h6' },
    { label: 'Code Block', tag: 'pre' },
  ];

  function updateDropdownLabel() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node = sel.anchorNode;
    if (node && node.nodeType === 3) node = node.parentElement;
    if (!node) return;
    const block = node.closest('h1,h2,h3,h4,h5,h6,pre,p');
    if (!block) return;
    const tag = block.tagName.toLowerCase();
    const match = formats.find((f) => f.tag === tag);
    dropdown.textContent = match ? match.label : 'Paragraph';
  }

  document.addEventListener('selectionchange', updateDropdownLabel);

  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = 'qe-dropdown-menu';
  formats.forEach(({ label, tag }) => {
    const opt = document.createElement('button');
    opt.className = 'qe-dropdown-option';
    opt.textContent = label;
    opt.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.execCommand('formatBlock', false, tag);
      dropdown.textContent = label;
      dropdownMenu.classList.remove('open');
    });
    dropdownMenu.appendChild(opt);
  });

  dropdown.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!document.body.contains(dropdownMenu)) {
      document.body.appendChild(dropdownMenu);
    }
    const rect = dropdown.getBoundingClientRect();
    dropdownMenu.style.position = 'fixed';
    dropdownMenu.style.top = `${rect.bottom + 4}px`;
    dropdownMenu.style.left = `${rect.left}px`;
    dropdownMenu.style.zIndex = '200000';
    dropdownMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('open');
    }
  });

  const svgs = {
    bold: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7V5z"/><path d="M7 12h7a3.5 3.5 0 0 1 0 7H7V12z"/></svg>',
    italic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="4" x2="14" y2="4"/><line x1="8" y1="20" x2="12" y2="20"/><line x1="13" y1="4" x2="9" y2="20"/></svg>',
    underline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 4v7a4 4 0 0 0 8 0V4"/><line x1="6" y1="20" x2="18" y2="20"/></svg>',
    strikethrough: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M15 4H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H8"/></svg>',
    superscript: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19l6-12 6 12"/><line x1="6" y1="15" x2="14" y2="15"/><path d="M18 4h2v3h-2"/></svg>',
    subscript: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5l6 12 6-12"/><line x1="6" y1="11" x2="14" y2="11"/><path d="M18 17h2v3h-2"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    unlink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="4" y1="20" x2="20" y2="4"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    alignLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    alignCenter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    alignRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h13a4 4 0 0 1 0 8H7"/><polyline points="7 6 3 10 7 14"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10H8a4 4 0 0 0 0 8h10"/><polyline points="17 6 21 10 17 14"/></svg>',
  };

  const boldBtn = btn(svgs.bold, 'Bold', () => dispatchKey('b'));
  boldBtn.dataset.command = 'bold';
  const italicBtn = btn(svgs.italic, 'Italic', () => dispatchKey('i'));
  italicBtn.dataset.command = 'italic';
  const underlineBtn = btn(svgs.underline, 'Underline', () => dispatchKey('u'));
  underlineBtn.dataset.command = 'underline';
  const strikeBtn = btn(svgs.strikethrough, 'Strikethrough', () => dispatchKey('d', { shift: true }));
  strikeBtn.dataset.command = 'strikeThrough';
  const superBtn = btn(svgs.superscript, 'Superscript', () => dispatchKey('.', { shift: true }));
  superBtn.dataset.command = 'superscript';
  const subBtn = btn(svgs.subscript, 'Subscript', () => dispatchKey(',', { shift: true }));
  subBtn.dataset.command = 'subscript';
  const linkDialog = document.createElement('div');
  linkDialog.className = 'da-page-dialog';
  linkDialog.setAttribute('contenteditable', 'false');
  linkDialog.innerHTML = `
    <span class="palette-title">Edit link</span>
    <div class="palette-field">
      <span class="palette-label">URL</span>
      <input id="qe-link-url" class="palette-input" placeholder="https://...">
    </div>
    <div class="palette-field">
      <span class="palette-label">Display text</span>
      <input id="qe-link-text" class="palette-input" placeholder="Link text">
    </div>
    <div class="palette-field">
      <span class="palette-label">Title</span>
      <input id="qe-link-title" class="palette-input" placeholder="title">
    </div>
    <div class="palette-field" style="flex-direction:row;align-items:center;display:flex;gap:8px;">
      <input type="checkbox" id="qe-link-newtab" style="width:auto;margin:0;">
      <label for="qe-link-newtab" style="font-size:13px;font-weight:600;color:#000;cursor:pointer;">Open in New Window</label>
    </div>
    <div class="palette-actions">
      <button class="palette-btn-cancel">Cancel</button>
      <button class="palette-btn-ok">OK</button>
    </div>
  `;

  let savedSelection = null;

  linkDialog.querySelector('.palette-btn-cancel').addEventListener('click', () => {
    linkDialog.classList.remove('open');
  });

  linkDialog.querySelector('.palette-btn-ok').addEventListener('click', () => {
    const url = linkDialog.querySelector('#qe-link-url').value;
    const text = linkDialog.querySelector('#qe-link-text').value;
    const title = linkDialog.querySelector('#qe-link-title').value;
    const newTab = linkDialog.querySelector('#qe-link-newtab').checked;
    if (!url) { linkDialog.classList.remove('open'); return; }

    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }

    document.execCommand('createLink', false, url);

    const sel = window.getSelection();
    if (sel.anchorNode) {
      let node = sel.anchorNode;
      if (node.nodeType === 3) node = node.parentElement;
      const anchor = node.closest('a') || node.querySelector('a');
      if (anchor) {
        if (text) anchor.textContent = text;
        if (title) anchor.title = title;
        if (newTab) { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; } else { anchor.removeAttribute('target'); anchor.removeAttribute('rel'); }
      }
    }

    linkDialog.classList.remove('open');
    savedSelection = null;
  });

  const linkBtn = btn(svgs.link, 'Add Link', () => {
    const tb = document.querySelector('.prosemirror-floating-toolbar');
    if (tb) tb.style.setProperty('display', 'flex', 'important');
    const sel = window.getSelection();
    if (sel.rangeCount) savedSelection = sel.getRangeAt(0).cloneRange();

    let existingUrl = '';
    let existingText = sel.toString() || '';
    let existingTitle = '';

    let node = sel.anchorNode;
    if (node && node.nodeType === 3) node = node.parentElement;
    const existingLink = node?.closest('a');
    if (existingLink) {
      existingUrl = existingLink.href || '';
      existingText = existingLink.textContent || '';
      existingTitle = existingLink.title || '';
    }

    linkDialog.querySelector('#qe-link-url').value = existingUrl;
    linkDialog.querySelector('#qe-link-text').value = existingText;
    linkDialog.querySelector('#qe-link-title').value = existingTitle;
    linkDialog.querySelector('#qe-link-newtab').checked = existingLink?.target === '_blank';

    if (!document.body.contains(linkDialog)) {
      document.body.appendChild(linkDialog);
    }
    const rect = linkBtn.getBoundingClientRect();
    Object.assign(linkDialog.style, {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${Math.max(8, rect.left - 100)}px`,
      zIndex: '200000',
    });
    linkDialog.classList.add('open');
    setTimeout(() => linkDialog.querySelector('#qe-link-url').focus(), 50);
  });
  linkBtn.dataset.command = 'link';

  document.addEventListener('click', (e) => {
    if (linkDialog.classList.contains('open') && !linkDialog.contains(e.target) && !linkBtn.contains(e.target)) {
      linkDialog.classList.remove('open');
    }
  });

  function updateActiveStates() {
    const cmds = ['bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript'];
    wrapper.querySelectorAll('.qe-btn[data-command]').forEach((b) => {
      const cmd = b.dataset.command;
      if (cmd === 'link') {
        const sel = window.getSelection();
        let node = sel?.anchorNode;
        if (node && node.nodeType === 3) node = node.parentElement;
        b.classList.toggle('active', !!node?.closest('a'));
      } else if (cmds.includes(cmd)) {
        b.classList.toggle('active', document.queryCommandState(cmd));
      }
    });
  }

  document.addEventListener('selectionchange', updateActiveStates);

  // Image insert dialog
  const imageDialog = document.createElement('div');
  imageDialog.className = 'da-page-dialog';
  imageDialog.setAttribute('contenteditable', 'false');
  imageDialog.innerHTML = `
    <span class="palette-title">Insert image</span>
    <div class="palette-field">
      <span class="palette-label">URL</span>
      <input id="qe-img-url" class="palette-input" placeholder="https://...">
    </div>
    <div class="palette-field">
      <span class="palette-label">Alt text</span>
      <input id="qe-img-alt" class="palette-input" placeholder="Describe this image...">
    </div>
    <div class="palette-actions">
      <button class="palette-btn-cancel">Cancel</button>
      <button class="palette-btn-ok">OK</button>
    </div>
  `;

  imageDialog.querySelector('.palette-btn-cancel').addEventListener('click', () => {
    imageDialog.classList.remove('open');
  });

  let editingImg = null;

  imageDialog.querySelector('.palette-btn-ok').addEventListener('click', () => {
    const url = imageDialog.querySelector('#qe-img-url').value;
    const alt = imageDialog.querySelector('#qe-img-alt').value || '';
    if (!url) { imageDialog.classList.remove('open'); return; }
    if (editingImg) {
      editingImg.src = url;
      editingImg.alt = alt;
    } else {
      if (savedSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
      }
      document.execCommand('insertImage', false, url);
      const img = document.querySelector(`img[src="${url}"]`);
      if (img) img.alt = alt;
    }
    editingImg = null;
    imageDialog.classList.remove('open');
  });

  function openImageDialog(anchorEl, img) {
    editingImg = img || null;
    imageDialog.querySelector('.palette-title').textContent = img ? 'Edit image' : 'Insert image';
    imageDialog.querySelector('#qe-img-url').value = img ? img.src : '';
    imageDialog.querySelector('#qe-img-alt').value = img ? (img.alt || '') : '';
    if (!document.body.contains(imageDialog)) {
      document.body.appendChild(imageDialog);
    }
    const rect = anchorEl.getBoundingClientRect();
    Object.assign(imageDialog.style, {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${Math.max(8, rect.left - 100)}px`,
      zIndex: '200000',
    });
    imageDialog.classList.add('open');
    setTimeout(() => imageDialog.querySelector('#qe-img-url').focus(), 50);
  }

  const imageBtn = btn(svgs.image, 'Insert Image', () => {
    const tb = document.querySelector('.prosemirror-floating-toolbar');
    if (tb) tb.style.setProperty('display', 'flex', 'important');
    const sel = window.getSelection();
    if (sel.rangeCount) savedSelection = sel.getRangeAt(0).cloneRange();
    openImageDialog(imageBtn, null);
  });

  document.addEventListener('click', (e) => {
    if (imageDialog.classList.contains('open') && !imageDialog.contains(e.target) && !imageBtn.contains(e.target)) {
      imageDialog.classList.remove('open');
    }
  });

  // Expose for image click handler
  wrapper._openImageDialog = openImageDialog;

  wrapper.append(
    dropdown,
    sep(),
    boldBtn,
    italicBtn,
    underlineBtn,
    strikeBtn,
    superBtn,
    subBtn,
    textBtn('T,', 'Clear formatting', () => dispatchKey('\\', {}), 'font-size:11px;'),
    sep(),
    btn(svgs.code, 'Code', () => dispatchKey('e')),
    sep(),
    linkBtn,
    btn(svgs.unlink, 'Remove Link', () => document.execCommand('unlink')),
    sep(),
    imageBtn,
    sep(),
    btn(svgs.alignLeft, 'Align Left', () => document.execCommand('justifyLeft')),
    btn(svgs.alignCenter, 'Align Center', () => document.execCommand('justifyCenter')),
    btn(svgs.alignRight, 'Align Right', () => document.execCommand('justifyRight')),
    sep(),
    btn(svgs.undo, 'Undo', () => dispatchKey('z')),
    btn(svgs.redo, 'Redo', () => dispatchKey('z', { shift: true })),
  );

  toolbar.appendChild(wrapper);
}

export default function initContentEditor() {
  addStyles();

  const formatObserver = new MutationObserver(injectFormattingToolbar);
  formatObserver.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', (e) => {
    const toolbar = document.querySelector('.prosemirror-floating-toolbar');
    const editor = document.querySelector('.ProseMirror');
    if (!toolbar || !editor) return;

    const inToolbar = toolbar.contains(e.target);
    const inEditor = editor.contains(e.target);
    const inDialog = e.target.closest('.da-page-dialog, .qe-dropdown-menu, .qe-edit-menu, .qe-publish-overlay, .lm-context-bar');

    if (!inEditor) return;

    const target = e.target.closest('p, h1, h2, h3, h4, h5, h6, li, a, span, img, picture');
    if (!target) return;

    toolbar.style.display = 'block';
    const rect = target.getBoundingClientRect();
    const toolbarHeight = toolbar.offsetHeight || 32;
    let top = rect.top + window.scrollY - toolbarHeight - 8;
    if (top < window.scrollY) top = rect.bottom + window.scrollY + 8;
    const left = Math.max(8, Math.min(
      rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2),
      window.innerWidth - toolbar.offsetWidth - 8,
    ));
    toolbar.style.position = 'absolute';
    toolbar.style.top = `${top}px`;
    toolbar.style.left = `${left}px`;
  });

  let toolbarActive = false;
  document.addEventListener('mousedown', (e) => {
    const toolbar = document.querySelector('.prosemirror-floating-toolbar');
    if (toolbar && toolbar.contains(e.target)) {
      toolbarActive = true;
      setTimeout(() => { toolbarActive = false; }, 1000);
    }
  }, true);

  // Override DA's native toolbar hiding when we need it visible
  const toolbarStyleObserver = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.attributeName !== 'style') return;
      const toolbar = m.target;
      if (toolbar.style.display === 'none') {
        const hasDialog = document.querySelector('.da-page-dialog.open, .qe-dropdown-menu.open');
        if (toolbarActive || hasDialog) {
          toolbar.style.display = 'block';
        }
      }
    });
  });

  const waitForToolbar = new MutationObserver(() => {
    const toolbar = document.querySelector('.prosemirror-floating-toolbar');
    if (toolbar) {
      toolbarStyleObserver.observe(toolbar, { attributes: true, attributeFilter: ['style'] });
      waitForToolbar.disconnect();
    }
  });
  waitForToolbar.observe(document.body, { childList: true, subtree: true });
}

import { loadPage } from '../../scripts/scripts.js';
import initStylePicker, { openStylePicker } from './style-picker.js';

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

function applyCustomizations() {
  console.log("applyCustomizations");
  const style = document.createElement('style');
  style.textContent = `
    .prosemirror-floating-toolbar .toolbar-btn-underline {
      display: none !important;
    }
    .qe-selected {
      outline: 2px solid #0078d4 !important;
      outline-offset: 4px;
      border-radius: 4px;
    }
    .quick-edit-publish {
      display: flex;
      background: #0078d4;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .quick-edit-publish:hover {
      background: #0067b8;
    }
    .quick-edit-publish:disabled {
      background: #999;
      cursor: not-allowed;
    }
    .quick-edit-buttons { display: flex !important; }
    .quick-edit-buttons .quick-edit-exit,
    .quick-edit-buttons .quick-edit-preview,
    .quick-edit-buttons .quick-edit-publish { display: flex !important; }
    .quick-edit-buttons .quick-edit-close { display: none !important;
    }
    .da-image-palettes {
      display: none;
      position: absolute;
      z-index: 100001;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
      width: 280px;
      font-family: system-ui, sans-serif;
    }
    .da-image-palettes.open { display: flex; flex-direction: column; }
    .da-image-palettes .palette-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      margin: 0 0 16px;
      color: #000;
    }
    .da-image-palettes .palette-field {
      margin-bottom: 12px;
    }
    .da-image-palettes .palette-label {
      font-size: 13px;
      font-weight: 600;
      color: #000;
      display: block;
      margin-bottom: 4px;
    }
    .da-image-palettes .palette-input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      font-size: 14px;
      font-family: inherit;
    }
    .da-image-palettes .palette-input:focus {
      outline: none;
      border-color: #0078d4;
    }
    .da-image-palettes textarea.palette-input {
      resize: vertical;
      min-height: 60px;
    }
    .da-image-palettes .palette-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
    .da-image-palettes .palette-actions button {
      padding: 8px 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .da-image-palettes .palette-btn-cancel {
      border: 1px solid #ccc;
      background: #fff;
      color: #000;
    }
    .da-image-palettes .palette-btn-ok {
      border: 1px solid #0078d4;
      background: #0078d4;
      color: #fff;
    }
  `;
  document.head.appendChild(style);

  // Image editor panel — mirrors da-palettes style
  // Appended lazily to avoid DA's quick-edit clearing it
  const altEditor = document.createElement('div');
  altEditor.className = 'da-image-palettes';
  altEditor.setAttribute('contenteditable', 'false');
  altEditor.innerHTML = `
    <span class="palette-title">Edit Image</span>
    <div class="palette-field">
      <span class="palette-label">Alt text</span>
      <textarea id="qe-alt-input" class="palette-input" placeholder="Describe this image..."></textarea>
    </div>
    <div class="palette-actions">
      <button class="palette-btn-cancel">Cancel</button>
      <button class="palette-btn-ok">OK</button>
    </div>
  `;

  function ensureAltEditorInDOM() {
    if (!document.body.contains(altEditor)) {
      document.body.appendChild(altEditor);
    }
  }

  let altTarget = null;
  let lastSelectedImage = null;

  altEditor.querySelector('.palette-btn-cancel').addEventListener('click', () => {
      console.log("applyCustomizations - click event cancel");
    altEditor.classList.remove('open');
    altTarget = null;
  });

  // Get DA config from the page
  function getDAConfig() {
    let { hostname } = window.location;
    if (hostname === 'localhost') {
      const meta = document.querySelector('meta[property="hlx:proxyUrl"]');
      if (meta) hostname = meta.content;
    }
    const parts = hostname.split('.')[0].split('--');
    const [, repo, owner] = parts;
    const path = window.location.pathname;
    return { owner, repo, path };
  }

  altEditor.querySelector('.palette-btn-ok').addEventListener('click', () => {
    if (altTarget) {
      const newAlt = altEditor.querySelector('#qe-alt-input').value;

      // Find the outermost wrapper ProseMirror manages — picture or p containing the image
      const picture = altTarget.closest('picture');
      const wrapper = picture || altTarget;
      const pmParent = wrapper.closest('p') || wrapper.parentNode;

      // Clone the entire parent, update the alt inside the clone
      const newParent = pmParent.cloneNode(true);
      const newImg = newParent.querySelector('img');
      if (newImg) newImg.alt = newAlt;

      // Replace at the p/parent level to trigger ProseMirror mutation
      pmParent.parentNode.replaceChild(newParent, pmParent);

      altTarget = newImg;
    }
    altEditor.classList.remove('open');
    altTarget = null;
  });

  // Open alt editor panel for an image
  function openAltEditor(img) {
    altTarget = img;
    ensureAltEditorInDOM();
    altEditor.querySelector('#qe-alt-input').value = img.alt || '';

    const rect = img.getBoundingClientRect();
    altEditor.style.position = 'absolute';
    altEditor.style.top = `${rect.bottom + window.scrollY + 8}px`;
    altEditor.style.left = `${Math.max(8, rect.left)}px`;
    altEditor.classList.add('open');
    setTimeout(() => altEditor.querySelector('#qe-alt-input').focus(), 50);
  }

  // Inject Edit Styles button into toolbar once it renders
  function injectToolbarButtons() {
    const toolbar = document.querySelector('.prosemirror-floating-toolbar');
    if (!toolbar || toolbar.querySelector('.toolbar-btn-styles')) return;

    const stylesBtn = document.createElement('span');
    stylesBtn.className = 'ProseMirror-menuitem';
    const stylesBtnInner = document.createElement('div');
    stylesBtnInner.title = 'Edit Styles';
    stylesBtnInner.className = 'edit-styles toolbar-btn-styles ProseMirror-menu-disabled';
    stylesBtnInner.textContent = 'Edit Styles';
    stylesBtnInner.setAttribute('contenteditable', 'false');
    stylesBtn.setAttribute('contenteditable', 'false');
    stylesBtn.appendChild(stylesBtnInner);
    stylesBtnInner.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const selected = document.querySelector('.qe-selected');
      if (selected) {
        openStylePicker(selected);
      }
    });
    toolbar.appendChild(stylesBtn);
  }

  // Watch for toolbar to appear and inject buttons
  const toolbarObserver = new MutationObserver(injectToolbarButtons);
  toolbarObserver.observe(document.body, { childList: true, subtree: true });

  // Detect element type from the raw click target
  function detectClick(rawTarget) {
    // 1. Image — clicked on img, picture, svg, video, or any element containing only media
    const img = rawTarget.closest('img, picture, svg, video, canvas, .product-card-image, .hero img, [class*="image"], [class*="img"]');
    if (img) return { target: img, type: 'image' };

    // Also check if rawTarget itself is media or its parent only contains media
    if (rawTarget.tagName === 'IMG' || rawTarget.tagName === 'PICTURE'
      || rawTarget.tagName === 'SVG' || rawTarget.tagName === 'VIDEO') {
      return { target: rawTarget, type: 'image' };
    }

    // Check if parent is an image wrapper (contains img but no text content)
    const parent = rawTarget.parentElement;
    if (parent && parent.querySelector('img') && !parent.textContent.trim()) {
      return { target: parent, type: 'image' };
    }

    // 2. Text — clicked on a text element
    const text = rawTarget.closest('p, h1, h2, h3, h4, h5, h6, li, a, span');
    if (text) return { target: text, type: 'text' };

    // 3. Block — clicked on a block container (not text/image inside it)
    const block = rawTarget.closest('[data-block-name]');
    if (block) return { target: block, type: 'block' };

    // 4. Section — clicked on the section background
    const section = rawTarget.closest('.section');
    if (section) return { target: section, type: 'section' };

    return { target: rawTarget, type: 'text' };
  }

  // Inject Publish button into quick-edit buttons bar
  function injectPublishButton() {
    const buttonsBar = document.querySelector('.quick-edit-buttons');
    if (!buttonsBar || buttonsBar.querySelector('.quick-edit-publish')) return;

    const publishBtn = document.createElement('button');
    publishBtn.className = 'quick-edit-publish';
    publishBtn.textContent = 'Publish';

    publishBtn.addEventListener('click', async () => {
      publishBtn.disabled = true;
      publishBtn.textContent = 'Publishing...';

      try {
        let { hostname } = window.location;
        if (hostname === 'localhost') {
          const meta = document.querySelector('meta[property="hlx:proxyUrl"]');
          if (meta) hostname = meta.content;
        }
        const parts = hostname.split('.')[0].split('--');
        const [, repo, owner] = parts;
        const pagePath = window.location.pathname === '/' ? '/index' : window.location.pathname;

        const resp = await fetch(`https://admin.hlx.page/live/${owner}/${repo}/main${pagePath}`, {
          method: 'POST',
          credentials: 'include',
        });

        if (resp.ok) {
          publishBtn.textContent = 'Published!';
          setTimeout(() => { publishBtn.textContent = 'Publish'; publishBtn.disabled = false; }, 2000);
        } else {
          publishBtn.textContent = 'Failed';
          setTimeout(() => { publishBtn.textContent = 'Publish'; publishBtn.disabled = false; }, 2000);
        }
      } catch {
        publishBtn.textContent = 'Failed';
        setTimeout(() => { publishBtn.textContent = 'Publish'; publishBtn.disabled = false; }, 2000);
      }
    });

    // Insert after Preview button
    const previewBtn = buttonsBar.querySelector('.quick-edit-preview');
    if (previewBtn) {
      previewBtn.after(publishBtn);
    } else {
      buttonsBar.appendChild(publishBtn);
    }
  }

  // Watch for quick-edit buttons to appear
  const publishObserver = new MutationObserver(injectPublishButton);
  publishObserver.observe(document.body, { childList: true, subtree: true });

  // Show toolbar and reposition above the clicked element
  document.addEventListener('click', (e) => {
    const toolbar = document.querySelector('.prosemirror-floating-toolbar');
    if (!toolbar) return;
    if (toolbar.contains(e.target)) return;

    // Close alt editor if open
    altEditor.classList.remove('open');

    toolbar.style.display = 'block';

    // Remove previous selection outline
    document.querySelectorAll('.qe-selected').forEach((el) => el.classList.remove('qe-selected'));

    // Detect what was clicked
    const { target, type } = detectClick(e.target);
    target.classList.add('qe-selected');

    const stylesBtnInnerEl = toolbar.querySelector('.toolbar-btn-styles');
    const stylesBtnWrap = stylesBtnInnerEl?.closest('.ProseMirror-menuitem');

    // Hide all toolbar children first
    [...toolbar.children].forEach((child) => {
      child.style.display = 'none';
    });

    if (stylesBtnInnerEl) stylesBtnInnerEl.classList.add('ProseMirror-menu-disabled');

    // Show buttons based on detected type
    if (type === 'image') {
      // Open alt editor directly — no toolbar button needed
      const img = target.tagName === 'IMG' ? target : target.querySelector('img');
      if (img) {
        toolbar.style.display = 'none';
        openAltEditor(img);
        return;
      }
    } else if (type === 'block' || type === 'section') {
      if (stylesBtnWrap) stylesBtnWrap.style.display = '';
      if (stylesBtnInnerEl) stylesBtnInnerEl.classList.remove('ProseMirror-menu-disabled');
    } else {
      // Text — show all default buttons, hide custom ones
      [...toolbar.children].forEach((child) => {
        if (child === stylesBtnWrap) {
          child.style.display = 'none';
        } else {
          child.style.display = '';
        }
      });
    }

    // Position toolbar above the element
    const rect = target.getBoundingClientRect();
    const toolbarHeight = toolbar.offsetHeight || 40;

    let top = rect.top + window.scrollY - toolbarHeight - 8;
    if (top < window.scrollY) {
      top = rect.bottom + window.scrollY + 8;
    }

    const left = Math.max(8, Math.min(
      rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2),
      window.innerWidth - toolbar.offsetWidth - 8,
    ));

    toolbar.style.position = 'absolute';
    toolbar.style.top = `${top}px`;
    toolbar.style.left = `${left}px`;
  });
}

async function loadModule(origin, payload) {
  const { default: loadQuickEdit } = await import(`${origin}/nx/public/plugins/quick-edit/quick-edit.js`);
  applyCustomizations();
  initStylePicker();
  loadQuickEdit(payload, loadPage);
}

// creates sidekick payload when loading QE from query param
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

export default function init(payload) {
  const { search } = window.location;
  const ref = new URLSearchParams(search).get('quick-edit');
  let origin;
  if (ref === 'on' || !ref) origin = 'https://da.live';
  if (ref === 'local') origin = 'http://localhost:6456';
  if (!origin) origin = `https://${ref}--da-nx--adobe.aem.live`;
  addImportmap();
  loadModule(origin, payload || generateSidekickPayload());
}

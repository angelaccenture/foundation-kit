import { loadArea, setConfig, getConfig, getMetadata } from './ak.js';

const hostnames = ['authorkit.dev'];

const locales = {
  '': { lang: 'en' },
  '/ar': { lang: 'ar', dir: 'rtl' },
  '/he': { lang: 'he', dir: 'rtl' },
  '/de': { lang: 'de' },
  '/es': { lang: 'es' },
  '/fr': { lang: 'fr' },
  '/hi': { lang: 'hi' },
  '/ja': { lang: 'ja' },
  '/zh': { lang: 'zh' },
};

const linkBlocks = [
  { fragment: '/fragments/' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'schedule'];

// How to decorate an area before loading it
const decorateArea = ({ area = document }) => {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    if (!img) return;
    img.removeAttribute('loading');
    img.fetchPriority = 'high';
  };

  eagerLoad(area, 'img');
};
// Load a template's JS module (ak.js already loads the template's CSS).
// Runs as progressive enhancement after the area is decorated, so it never
// blocks the render/LCP. Mirrors ak.js loadTemplate()'s name normalization.
async function loadTemplateScript() {
  const meta = getMetadata('template');
  if (!meta) return;
  const template = meta.replaceAll(' ', '-').toLowerCase();
  const { codeBase } = getConfig();
  try {
    const mod = await import(`${codeBase}/templates/${template}/${template}.js`);
    await mod.default?.();
  } catch (e) {
    // Template has no JS (CSS-only template) — that's fine, not an error.
  }
}
export async function loadPage() {
  const config = setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  // Apply text direction for RTL locales (ak.js already sets lang; we set dir here)
  if (config.locale?.dir) document.documentElement.dir = config.locale.dir;
  await loadArea();
  await loadTemplateScript();
}

await loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);
 const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
  
}());

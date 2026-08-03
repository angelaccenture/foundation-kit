/*
 * Design Tokens consumer — the render-side companion to the /tools/design-tokens
 * editor. Reads the same named-style sheet (e.g. /drafts/davids-folder/colors)
 * and injects CSS that styles any section an author tagged with that style name
 * via `Style: <name>` in section-metadata (ak.js already adds the class).
 *
 * The sheet is the single source of truth: edit a style in the tool, and every
 * section using it restyles. Additive — never fights core section decoration.
 *
 * Opt in per page with a metadata entry (falls back to the sample sheet):
 *   <meta name="design-tokens" content="/drafts/davids-folder/colors">
 */

/** @param {string} value */
function sanitizeHexColor(value) {
  if (typeof value !== 'string') return null;
  const color = value.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  if (/^#[0-9a-f]{6}$/.test(color)) return color;
  return null;
}

/** Readable text color for a background — matches the tool's helper. */
function getContrastColor(hex) {
  const color = sanitizeHexColor(hex);
  if (!color) return '#18181b';
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.5 ? '#18181b' : '#ffffff';
}

/** @param {string} name */
function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

const FONT_SIZES = { small: '0.9rem', medium: '1.05rem', large: '1.35rem' };
const ALIGN = { left: 'left', center: 'center', right: 'right' };

/** Find a row value by fuzzy column-name match (background/foreground/accent…). */
function pick(row, ...needles) {
  const key = Object.keys(row).find((k) => {
    const slug = toClassName(k);
    return needles.every((n) => slug.includes(n));
  });
  return key ? row[key] : '';
}

/** Build the CSS rules for one style row, scoped to `.section.<slug>`. */
function ruleFor(row) {
  const name = pick(row, 'style', 'name') || Object.values(row)[0] || '';
  const slug = toClassName(name);
  if (!slug) return '';

  const sel = `.section.${slug}`;
  const bg = sanitizeHexColor(pick(row, 'background'));
  const fg = sanitizeHexColor(pick(row, 'foreground'));
  const accent = sanitizeHexColor(pick(row, 'accent'));
  const fontSize = FONT_SIZES[String(pick(row, 'font', 'size')).trim().toLowerCase()];
  const align = ALIGN[String(pick(row, 'horizontal', 'align')).trim().toLowerCase()];
  const split = /^(\d+)\s*-\s*(\d+)$/.exec(String(pick(row, 'layout', 'split')).trim());

  const rules = [];
  const sectionDecls = [];
  if (bg) sectionDecls.push(`background-color:${bg}`);
  if (fg) sectionDecls.push(`color:${fg}`);
  if (fontSize) sectionDecls.push(`font-size:${fontSize}`);
  if (align) sectionDecls.push(`text-align:${align}`);
  if (sectionDecls.length) rules.push(`${sel}{${sectionDecls.join(';')}}`);

  if (accent) {
    rules.push(`${sel} h1,${sel} h2,${sel} h3{color:${accent}}`);
    rules.push(`${sel} .btn,${sel} .button,${sel} a.button{background-color:${accent};color:${getContrastColor(accent)};border-color:${accent}}`);
  }
  // Layout split applies when the section is a grid (columns/media two-up).
  if (split) {
    rules.push(`${sel}.grid .block-content,${sel} .columns > div,${sel} .media{grid-template-columns:${split[1]}fr ${split[2]}fr}`);
  }
  return rules.join('');
}

/**
 * Fetch the style sheet and inject the generated CSS.
 * @param {Document} doc
 */
export default async function applyDesignTokens(doc = document) {
  const meta = doc.querySelector('meta[name="design-tokens"]');
  const path = meta?.content || '/drafts/davids-folder/colors';
  const url = /\.json$/i.test(path) ? path : `${path}.json`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) return;
    const payload = await resp.json();
    const rows = Array.isArray(payload) ? payload : payload.data || [];
    const css = rows.map(ruleFor).filter(Boolean).join('\n');
    if (!css) return;

    const style = doc.createElement('style');
    style.dataset.designTokens = '';
    style.textContent = css;
    doc.head.append(style);
  } catch (e) {
    // Sheet missing or malformed — no tokens applied, page renders normally.
  }
}

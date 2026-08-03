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

/** @param {string} name */
function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

/** Find a row value by fuzzy column-name match (background/foreground/accent…). */
function pick(row, ...needles) {
  const key = Object.keys(row).find((k) => {
    const slug = toClassName(k);
    return needles.every((n) => slug.includes(n));
  });
  return key ? row[key] : '';
}

/** Map a sheet column name to David's CSS-variable name. */
function columnToVar(column) {
  const slug = toClassName(column);
  if (slug === 'background' || slug === 'foreground') return `--${slug}-color`;
  if (slug.includes('accent')) return '--accent-color';
  return null; // non-colour columns become data-* attributes, not vars
}

/**
 * Build the CSS variable rule for one style row, scoped to the style class on
 * either a section or a block: `.section.<slug>, .<slug>`. Mirrors David's
 * consumer — colours become CSS custom properties the block reads via var().
 * @returns {{ slug: string, rule: string, dataAttrs: Record<string,string> }|null}
 */
function ruleFor(row) {
  const name = pick(row, 'style', 'name') || Object.values(row)[0] || '';
  const slug = toClassName(name);
  if (!slug) return null;

  const vars = [];
  const dataAttrs = {};
  Object.keys(row).forEach((column) => {
    if (/name/i.test(column) || column.startsWith(':')) return;
    const value = String(row[column] || '').trim();
    if (!value) return;
    const cssVar = columnToVar(column);
    if (cssVar) {
      const hex = sanitizeHexColor(value);
      vars.push(`${cssVar}:${hex || value}`);
    } else {
      // e.g. Layout Split -> data-layout-split, Font Sizes -> data-font-sizes
      const attr = toClassName(column);
      dataAttrs[`data-${attr}`] = value.toLowerCase();
      // Layout split: also emit computed grid columns so ANY ratio renders,
      // not just the ones with hardcoded CSS rules. e.g. "25-75" -> 25fr 75fr.
      const split = /^(\d+)\s*-\s*(\d+)$/.exec(value.trim());
      if (attr.includes('layout') && attr.includes('split') && split) {
        // Carry a computed grid value; applied inline below so both banner
        // variants (grid + flex) can switch to it for ANY ratio.
        dataAttrs['data-split-columns'] = `${split[1]}fr ${split[2]}fr`;
      }
    }
  });

  const sel = `.section.${slug},.${slug}`;
  const rule = vars.length ? `${sel}{${vars.join(';')}}` : '';
  return { slug, rule, dataAttrs };
}

/**
 * Fetch the style sheet, inject the CSS-variable rules, and mirror non-colour
 * values to data-* attributes on every element carrying the style class (so a
 * block like banner can theme itself from var() + [data-*]).
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
    const parsed = rows.map(ruleFor).filter(Boolean);
    if (!parsed.length) return;

    const css = parsed.map((p) => p.rule).filter(Boolean).join('\n');
    if (css) {
      const style = doc.createElement('style');
      style.dataset.designTokens = '';
      style.textContent = css;
      doc.head.append(style);
    }

    // Mirror data-* attributes onto every element using each style class.
    parsed.forEach(({ slug, dataAttrs }) => {
      if (!Object.keys(dataAttrs).length) return;
      doc.querySelectorAll(`.section.${slug},.${slug}`).forEach((el) => {
        Object.entries(dataAttrs).forEach(([attr, val]) => {
          if (attr === 'data-split-columns') {
            el.style.setProperty('--layout-split-columns', val);
          } else {
            el.setAttribute(attr, val);
          }
        });
      });
    });
  } catch (e) {
    // Sheet missing or malformed — no tokens applied, page renders normally.
  }
}

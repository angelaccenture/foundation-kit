/**
 * Config Loader — loads layout-mode-config.json, merges template
 * overrides, and resolves DA-sourced property options at runtime.
 */

let configCache = null;
let resolvedCache = null;
const daCache = {};

function getTemplate() {
  const meta = document.head.querySelector('meta[name="template"]');
  return meta ? meta.content.toLowerCase().replace(/\s+/g, '-') : null;
}

function getHostParts() {
  let { hostname } = window.location;
  if (hostname === 'localhost') {
    const meta = document.querySelector('meta[property="hlx:proxyUrl"]');
    if (meta) hostname = meta.content;
  }
  const parts = hostname.split('.')[0].split('--');
  const [, repo, owner] = parts;
  return { owner, repo };
}

function getStylesUrl(path) {
  // On localhost the dev server can't serve the styles sheet, so resolve it
  // against the derived aem.page host. On every real host (preview.da.live,
  // aem.page, aem.live) the sheet lives on the page's own origin, so a
  // same-origin relative fetch avoids cross-origin CORS failures.
  if (window.location.hostname === 'localhost') {
    const { owner, repo } = getHostParts();
    return `https://main--${repo}--${owner}.aem.page${path}.json`;
  }
  return `${path}.json`;
}

async function fetchDAOptions(path) {
  if (daCache[path]) return daCache[path];
  try {
    const resp = await fetch(getStylesUrl(path));
    if (!resp.ok) throw new Error(`DA fetch failed: ${resp.status}`);
    const json = await resp.json();
    if (!json.data) { daCache[path] = []; return []; }

    const groups = [];
    let currentGroup = null;
    json.data.forEach((row) => {
      const groupName = row.Group || row.group || '';
      if (groupName) {
        currentGroup = { group: groupName, options: [] };
        groups.push(currentGroup);
      }
      if (!currentGroup) {
        currentGroup = { group: '', options: [] };
        groups.push(currentGroup);
      }
      currentGroup.options.push({
        name: row.Name || row.name || row.Value || row.value || Object.values(row)[0],
        value: row.Value || row.value || row.Name || row.name || Object.values(row)[0],
      });
    });

    daCache[path] = groups;
    return groups;
  } catch {
    daCache[path] = [];
    return [];
  }
}

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])
      && typeof override[key] === 'object' && !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

async function loadRawConfig() {
  if (configCache) return configCache;
  const resp = await fetch('/tools/quick-edit/layout-mode-config.json');
  configCache = await resp.json();
  return configCache;
}

export async function getConfig() {
  if (resolvedCache) return resolvedCache;

  const raw = await loadRawConfig();
  const template = getTemplate();

  let merged = JSON.parse(JSON.stringify(raw.defaults));

  if (template && raw.templates && raw.templates[template]) {
    merged = deepMerge(merged, raw.templates[template]);
  }

  resolvedCache = merged;
  return merged;
}

export async function getBlockConfig(blockName) {
  const config = await getConfig();
  const wildcard = config.blocks['*'] || {};
  const specific = config.blocks[blockName] || {};
  const merged = deepMerge(wildcard, specific);

  if (merged.properties) {
    await resolveDAProperties(merged.properties);
  }

  return merged;
}

export async function getSectionConfig() {
  const config = await getConfig();
  const section = { ...config.sections };

  if (section.properties) {
    await resolveDAProperties(section.properties);
  }

  return section;
}

async function resolveDAProperties(properties) {
  for (const prop of properties) {
    if (prop.source === 'da' && prop.path) {
      prop.options = await fetchDAOptions(prop.path);
    }
  }
}

export function clearCache() {
  configCache = null;
  resolvedCache = null;
}

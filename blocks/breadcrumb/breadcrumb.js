async function getPageTitle(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return '';
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('title')?.textContent?.trim() || '';
  } catch {
    return '';
  }
}

async function buildBreadcrumbPaths() {
  const { pathname, origin } = window.location;
  const segments = pathname.replace(/^\/|\/$/g, '').split('/');
  const paths = [{ name: 'Home', url: origin }];

  let accumulated = '';
  for (let i = 0; i < segments.length - 1; i += 1) {
    accumulated += `/${segments[i]}`;
    const url = `${origin}${accumulated}`;
    /* eslint-disable-next-line no-await-in-loop */
    const name = await getPageTitle(url);
    if (name) paths.push({ name, url });
  }

  const currentTitle = document.querySelector('title')?.textContent?.trim() || segments[segments.length - 1];
  paths.push({ name: currentTitle, url: '' });

  return paths;
}

export default async function decorate(block) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.className = 'breadcrumb-nav';
  block.textContent = '';

  const paths = await buildBreadcrumbPaths();
  const ol = document.createElement('ol');

  paths.forEach((path, idx) => {
    const li = document.createElement('li');
    if (idx < paths.length - 1) {
      const a = document.createElement('a');
      a.href = path.url;
      a.textContent = path.name;
      li.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.setAttribute('aria-current', 'page');
      span.textContent = path.name;
      li.appendChild(span);
    }
    ol.appendChild(li);
  });

  nav.appendChild(ol);
  block.appendChild(nav);
}

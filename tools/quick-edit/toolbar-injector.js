const AEM_ORIGIN = (() => {
  const meta = document.querySelector('meta[property="hlx:proxyUrl"]');
  if (meta) return `https://${meta.content}`;
  const { hostname } = window.location;
  if (hostname.includes('preview.da.live')) {
    const parts = hostname.split('.')[0].split('--');
    const [branch, site, org] = parts;
    return `https://${branch}--${site}--${org}.aem.live`;
  }
  return '';
})();

if (AEM_ORIGIN && window.location.hostname.includes('preview.da.live')) {
  const observer = new MutationObserver(() => {
    const buttonsBar = document.querySelector('.quick-edit-buttons');
    if (!buttonsBar || buttonsBar.querySelector('.quick-edit-publish')) return;

    import(`${AEM_ORIGIN}/tools/quick-edit/toolbar-buttons.js`).then(({ default: inject }) => {
      inject();
    });

    import(`${AEM_ORIGIN}/tools/quick-edit/content-editor.js`).then(({ default: init }) => {
      init();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

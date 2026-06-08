import { getConfig } from '../../scripts/ak.js';

const { log } = getConfig();

let tabsInstanceId = 0;

function getTabList(tabs, tabPanels, instanceId) {
  const tabItems = tabs.querySelectorAll('li');
  const tabList = document.createElement('div');
  tabList.className = 'tab-list';
  tabList.role = 'tablist';

  for (const [idx, tab] of tabItems.entries()) {
    const btn = document.createElement('button');
    btn.role = 'tab';
    btn.id = `tab-${instanceId}-${idx + 1}`;
    btn.textContent = tab.textContent;
    if (idx === 0) {
      btn.classList.add('is-active');
      tabPanels[0]?.classList.add('is-visible');
    }
    tabList.append(btn);

    btn.addEventListener('click', () => {
      tabList.querySelectorAll('button')
        .forEach((button) => { button.classList.remove('is-active'); });

      tabPanels.forEach((sec) => { sec.classList.remove('is-visible'); });
      tabPanels[idx].classList.add('is-visible');
      btn.classList.add('is-active');
    });
  }

  return tabList;
}

export default function init(el) {
  const instanceId = tabsInstanceId;
  tabsInstanceId += 1;

  const parent = el.closest('.fragment-content, main');
  parent.style = 'display: none;';

  const currSection = el.closest('.section');

  const tabs = el.querySelector('ul');
  if (!tabs) {
    log('Please add an unordered list to the advanced tabs block.');
    parent.removeAttribute('style');
    return;
  }

  const tabCount = tabs.querySelectorAll('li').length;

  const tabPanels = [];
  let sibling = currSection.nextElementSibling;
  while (sibling && tabPanels.length < tabCount) {
    if (sibling.querySelector('.advanced-carousel, .advanced-tabs, .advanced-accordion')) break;
    sibling.id = `tabpanel-${instanceId}-${tabPanels.length + 1}`;
    sibling.role = 'tabpanel';
    sibling.setAttribute('aria-labelledby', `tab-${instanceId}-${tabPanels.length + 1}`);
    tabPanels.push(sibling);
    sibling = sibling.nextElementSibling;
  }

  const tabList = getTabList(tabs, tabPanels, instanceId);

  tabs.remove();
  el.append(tabList, ...tabPanels);
  parent.removeAttribute('style');
}

export default function init(el) {
  // Teaser content has two row divs: image row + content row
  // Merge them into a single .teaser-inner wrapper
  const rows = [...el.querySelectorAll(':scope > div')];
  const inner = document.createElement('div');
  inner.classList.add('teaser-inner');

  rows.forEach((row) => {
    const children = [...row.children];
    children.forEach((child) => inner.append(child));
    row.remove();
  });
  el.append(inner);

  const pic = inner.querySelector('picture') || inner.querySelector('img');
  if (pic) {
    const picPara = pic.closest('.teaser-inner > div') || pic.parentElement;
    if (picPara) {
      picPara.classList.add('teaser-picture-container');
      const con = [...inner.children].find(
        (child) => child !== picPara && !child.classList.length,
      );
      if (con) {
        con.classList.add('teaser-content-container');
        picPara.after(con);
      }
    }
  }

  // Decorate CTA — keep it inside content container so it doesn't
  // become a third flex column at desktop row-reverse layout
  const contentContainer = inner.querySelector('.teaser-content-container');
  if (!contentContainer) return;
  const ctaPara = contentContainer.querySelector('p:last-of-type');
  if (!ctaPara) return;
  const cta = ctaPara.querySelector('a');
  if (!cta) return;
  ctaPara.classList.add('teaser-cta-container');
}

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the ticker: an infinitely auto-scrolling strip of
 * short promo items, each optionally containing a "Shop Now" link.
 * @param {Element} block The ticker block element
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const item = document.createElement('span');
    item.className = 'ticker-item';
    // unwrap each field's richtext <p> so its inline content sits directly
    // in the item span — leaving <p>s in place would push the bullet
    // separator (an inline ::after on the span) onto its own line
    const [titleCell, buttonCell] = row.children;
    const titleParagraph = titleCell?.querySelector('p');
    const buttonParagraph = buttonCell?.querySelector('p');
    if (titleParagraph) item.append(...titleParagraph.childNodes, ' ');
    if (buttonParagraph) item.append(...buttonParagraph.childNodes);
    // keep the item selectable/editable in Universal Editor
    moveInstrumentation(row, item);
    return item;
  });

  block.textContent = '';
  const track = document.createElement('div');
  track.className = 'ticker-track';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    block.classList.add('ticker-static');
    items.forEach((item) => track.append(item));
  } else {
    // duplicate the item set so the track can loop seamlessly. The clones
    // are decorative only — strip their editing attributes (and those of
    // any descendants) so Universal Editor doesn't show two selectable
    // instances of the same item.
    const clones = items.map((item) => {
      const clone = item.cloneNode(true);
      [clone, ...clone.querySelectorAll('*')].forEach((el) => {
        el.getAttributeNames()
          .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'))
          .forEach((attr) => el.removeAttribute(attr));
      });
      return clone;
    });
    [...items, ...clones].forEach((item) => track.append(item));
  }

  block.append(track);
}

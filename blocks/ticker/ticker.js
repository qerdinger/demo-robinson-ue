/**
 * loads and decorates the ticker: an infinitely auto-scrolling strip of
 * short promo items, each optionally containing a "Shop Now" link.
 * @param {Element} block The ticker block element
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const item = document.createElement('span');
    item.className = 'ticker-item';
    item.append(...row.firstElementChild.childNodes);
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
    // duplicate the item set so the track can loop seamlessly
    [...items, ...items.map((item) => item.cloneNode(true))].forEach((item) => track.append(item));
  }

  block.append(track);
}

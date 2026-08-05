import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const ICONS = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.3s-7-4.6-9.5-8.9C.7 8 2 4.5 5.4 3.6c2-.5 4 .3 5.1 2 .1.1.3.1.4 0 1.1-1.7 3.1-2.5 5.1-2 3.4.9 4.7 4.4 2.9 7.8-2.5 4.3-9.5 8.9-9.5 8.9Z" fill="none" stroke="currentcolor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
};

/**
 * Builds a simple category-style card: image + a single linked (or plain) label.
 * @param {Element} row The authored row
 * @param {Element} picture The row's picture element, if any
 * @returns {Element} The decorated card
 */
function buildCategoryCard(row, picture) {
  const card = document.createElement('li');
  card.className = 'rail-item rail-item-category';
  const link = row.querySelector('a');
  const label = link?.textContent.trim() || row.querySelector('p')?.textContent.trim() || '';

  const media = document.createElement('div');
  media.className = 'rail-item-media';
  if (picture) media.append(picture);

  const linkOrSpan = document.createElement(link ? 'a' : 'span');
  linkOrSpan.className = 'rail-item-label';
  if (link) linkOrSpan.href = link.href;
  linkOrSpan.textContent = label;

  card.append(media, linkOrSpan);
  return card;
}

/**
 * Builds a full product-style card: image + brand watermark + badge, name,
 * price (with optional struck-through original price), Add to Cart, wishlist.
 * @param {Element} picture The row's picture element, if any
 * @param {string[]} lines The paragraph texts: [badge, name, price, originalPrice?]
 * @returns {Element} The decorated card
 */
function buildProductCard(picture, [badge, name, price, originalPrice]) {
  const card = document.createElement('li');
  card.className = 'rail-item rail-item-product';

  const media = document.createElement('div');
  media.className = 'rail-item-media';
  media.innerHTML = `<span class="rail-item-badge">${badge}</span>
    <span class="rail-item-brand">southstar<em>drug</em></span>`;
  if (picture) media.append(picture);

  const body = document.createElement('div');
  body.className = 'rail-item-body';
  body.innerHTML = `<p class="rail-item-name">${name}</p>
    <p class="rail-item-price">${price}${originalPrice ? ` <span class="rail-item-original">${originalPrice}</span>` : ''}</p>
    <div class="rail-item-actions">
      <button type="button" class="rail-add-to-cart">Add To Cart</button>
      <button type="button" class="rail-wishlist" aria-label="Add to wishlist">${ICONS.heart}</button>
    </div>`;

  card.append(media, body);
  return card;
}

/**
 * loads and decorates the rail: a horizontally scrollable row of cards,
 * rendered as simple category cards (one line of content) or full product
 * cards (badge / name / price / [original price]) depending on how many
 * lines of text each authored item has.
 * @param {Element} block The rail block element
 */
export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'rail-track';

  [...block.children].forEach((row) => {
    const picture = row.querySelector('picture');
    const lines = [...row.querySelectorAll('p')].map((p) => p.textContent.trim());
    const card = lines.length >= 3
      ? buildProductCard(picture, lines)
      : buildCategoryCard(row, picture);
    moveInstrumentation(row, card);
    track.append(card);
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const scroller = document.createElement('div');
  scroller.className = 'rail-scroller';
  scroller.append(track);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'rail-arrow rail-prev';
  prev.setAttribute('aria-label', 'Scroll left');
  prev.innerHTML = ICONS.prev;
  prev.addEventListener('click', () => scroller.scrollBy({ left: -scroller.clientWidth * 0.8, behavior: 'smooth' }));

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'rail-arrow rail-next';
  next.setAttribute('aria-label', 'Scroll right');
  next.innerHTML = ICONS.next;
  next.addEventListener('click', () => scroller.scrollBy({ left: scroller.clientWidth * 0.8, behavior: 'smooth' }));

  block.textContent = '';
  block.append(prev, scroller, next);
}

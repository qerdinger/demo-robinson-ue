import { moveInstrumentation } from '../../scripts/scripts.js';

const ICONS = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/**
 * loads and decorates the blog rail: a horizontally scrollable row of
 * text-only post cards, each with a linked title and a meta block (author,
 * excerpt, date, "Read more" link).
 * @param {Element} block The blog-rail block element
 */
export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'blog-rail-track';

  [...block.children].forEach((row) => {
    const [titleCell, metaCell] = row.children;

    const card = document.createElement('li');
    card.className = 'blog-item';

    if (titleCell) card.append(...titleCell.children);
    if (metaCell) card.append(...metaCell.children);

    moveInstrumentation(row, card);
    track.append(card);
  });

  const scroller = document.createElement('div');
  scroller.className = 'blog-rail-scroller';
  scroller.append(track);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'blog-rail-arrow blog-rail-prev';
  prev.setAttribute('aria-label', 'Scroll left');
  prev.innerHTML = ICONS.prev;
  prev.addEventListener('click', () => scroller.scrollBy({ left: -scroller.clientWidth * 0.8, behavior: 'smooth' }));

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'blog-rail-arrow blog-rail-next';
  next.setAttribute('aria-label', 'Scroll right');
  next.innerHTML = ICONS.next;
  next.addEventListener('click', () => scroller.scrollBy({ left: scroller.clientWidth * 0.8, behavior: 'smooth' }));

  block.textContent = '';
  block.append(prev, scroller, next);
}

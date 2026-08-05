import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const ICONS = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/**
 * loads and decorates the categories row
 * @param {Element} block The categories block element
 */
export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'categories-track';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'categories-item';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'categories-item-image';
      else div.className = 'categories-item-label';
    });
    track.append(li);
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const scroller = document.createElement('div');
  scroller.className = 'categories-scroller';
  scroller.append(track);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'categories-arrow categories-prev';
  prev.setAttribute('aria-label', 'Scroll categories left');
  prev.innerHTML = ICONS.prev;
  prev.addEventListener('click', () => scroller.scrollBy({ left: -scroller.clientWidth * 0.8, behavior: 'smooth' }));

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'categories-arrow categories-next';
  next.setAttribute('aria-label', 'Scroll categories right');
  next.innerHTML = ICONS.next;
  next.addEventListener('click', () => scroller.scrollBy({ left: scroller.clientWidth * 0.8, behavior: 'smooth' }));

  block.textContent = '';
  block.append(prev, scroller, next);
}

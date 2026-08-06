import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the services row: a set of bordered image buttons,
 * each optionally linking out.
 * @param {Element} block The services block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const link = row.querySelector('a');
    const picture = row.querySelector('picture');

    const item = document.createElement(link ? 'a' : 'div');
    item.className = 'service-item';
    if (link) {
      item.href = link.href;
      moveInstrumentation(link, item);
    }
    if (picture) item.append(picture);

    moveInstrumentation(row, item);
    row.replaceWith(item);
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}

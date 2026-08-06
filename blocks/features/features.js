import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the features row: an authored icon (image, SVG, or
 * static site icon), title and description per item.
 * @param {Element} block The features block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [iconCell, titleCell, descriptionCell] = row.children;
    const picture = iconCell?.querySelector('picture');
    const link = iconCell?.querySelector('a');

    const item = document.createElement('div');
    item.className = 'feature-item';

    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'feature-icon';
    if (picture) {
      iconWrapper.append(picture);
    } else if (link) {
      const img = document.createElement('img');
      img.src = link.href;
      img.alt = '';
      iconWrapper.append(img);
    }

    const body = document.createElement('div');
    body.className = 'feature-body';
    if (titleCell) body.append(...titleCell.children);
    if (descriptionCell) body.append(...descriptionCell.children);

    item.append(iconWrapper, body);
    moveInstrumentation(row, item);
    row.replaceWith(item);
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '80' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}

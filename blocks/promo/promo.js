import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the promo: a two-column image + text + button banner.
 * consecutive promo blocks automatically alternate which side the image
 * sits on (see promo.css), so authors can just stack them.
 * @param {Element} block The promo block element
 */
export default function decorate(block) {
  // alternate which side the image sits on for every other promo on the page
  const siblings = [...document.querySelectorAll('.promo')];
  if (siblings.indexOf(block) % 2 === 1) block.classList.add('promo-reverse');

  const [imageCell, textCell] = block.children;

  const imageCol = document.createElement('div');
  imageCol.className = 'promo-image';
  const img = imageCell.querySelector('img');
  if (img) {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    imageCol.append(optimizedPic);
  }
  moveInstrumentation(imageCell, imageCol);

  const textCol = document.createElement('div');
  textCol.className = 'promo-text';
  textCol.append(...textCell.children);
  moveInstrumentation(textCell, textCol);

  block.textContent = '';
  block.append(imageCol, textCol);
}

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const STYLES = ['image-left', 'image-background', 'title-only', 'text-only'];

/**
 * loads and decorates the promotion: an image + text + button banner with a
 * choice of layout styles. Left empty, "default" style automatically
 * alternates which side the image sits on for consecutive default-style
 * promotions, so authors can just stack them; any other style is applied
 * as authored, with no alternation.
 * @param {Element} block The promotion block element
 */
export default function decorate(block) {
  const [imageCell, textCell, styleCell] = block.children;

  const styleValue = styleCell?.textContent.trim().toLowerCase();
  const style = STYLES.includes(styleValue) ? styleValue : 'default';
  block.dataset.promotionStyle = style;

  if (style === 'default') {
    const siblings = [...document.querySelectorAll('.promotion[data-promotion-style="default"]')];
    if (siblings.indexOf(block) % 2 === 1) block.classList.add('promotion-reverse');
  } else {
    block.classList.add(`promotion-${style}`);
  }

  const showImage = style !== 'title-only' && style !== 'text-only';

  const imageCol = document.createElement('div');
  imageCol.className = 'promotion-image';
  const img = imageCell.querySelector('img');
  if (img && showImage) {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    imageCol.append(optimizedPic);
  }
  moveInstrumentation(imageCell, imageCol);

  const textCol = document.createElement('div');
  textCol.className = 'promotion-text';
  if (style === 'title-only') {
    const [firstLine] = textCell.children;
    if (firstLine) textCol.append(firstLine);
  } else {
    textCol.append(...textCell.children);
  }
  moveInstrumentation(textCell, textCol);

  if (styleCell) styleCell.remove();

  block.textContent = '';
  block.append(...(showImage ? [imageCol, textCol] : [textCol]));
}

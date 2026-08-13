import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import getGraphqlHost from '../../scripts/graphql-host.js';

const STYLES = ['image-left', 'image-right', 'image-background', 'title-only', 'text-only'];
const GRAPHQL_QUERY_PATH = 'Robinson/promotion-by-path';

function trimBlurb(text, maxLength = 160) {
  const trimmed = text.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1).trimEnd()}…` : trimmed;
}

// joins a start/end date pair (either may be omitted) into a single display string, shown
// exactly as authored/fetched with no reformatting — AEM's date-time field and the GraphQL
// persisted query don't agree on a single date string shape, so converting through a parsed
// Date risked silently rendering "Invalid Date" for whichever shape wasn't anticipated
function formatDateRange(startDate, endDate) {
  if (startDate && endDate) return `${startDate} – ${endDate}`;
  return startDate || endDate || '';
}

function appendDates(textCol, startDate, endDate) {
  const dateRange = formatDateRange(startDate, endDate);
  if (!dateRange) return;
  const datesEl = document.createElement('p');
  datesEl.className = 'promotion-dates';
  datesEl.textContent = dateRange;
  textCol.append(datesEl);
}

/**
 * applies the auto-alternating (default) or fixed layout classes shared by
 * every promotion, whether its content came from authored fields or a
 * fetched GraphQL item.
 * @param {Element} block The promotion block element
 * @param {string} style One of the promotion style values, or 'default'
 */
function applyStyle(block, style) {
  block.dataset.promotionStyle = style;
  if (style === 'default') {
    const siblings = [...document.querySelectorAll('.promotion[data-promotion-style="default"]')];
    if (siblings.indexOf(block) % 2 === 1) block.classList.add('promotion-reverse');
  } else {
    block.classList.add(`promotion-${style}`);
  }
}

/**
 * renders a promotion fetched from the persisted GraphQL query using the
 * same .promotion-image / .promotion-text structure as authored promotions.
 * @param {Element} block The promotion block element
 * @param {Object} item The GraphQL content fragment item (title, main, featuredImage,
 * startDate, endDate)
 * @param {string} style One of the promotion style values, or 'default'
 */
function renderFetchedPromotion(block, item, style) {
  const aemHost = getGraphqlHost();
  const showImage = style !== 'title-only' && style !== 'text-only';

  // GraphQL's Content Fragment schema names these fields with a leading underscore
  // eslint-disable-next-line no-underscore-dangle
  const imagePath = item.featuredImage?._dynamicUrl || item.featuredImage?._path;
  if (imagePath && showImage) {
    const imageCol = document.createElement('div');
    imageCol.className = 'promotion-image';
    const img = document.createElement('img');
    img.src = imagePath.startsWith('/') ? `${aemHost}${imagePath}` : imagePath;
    img.alt = item.title || '';
    img.loading = 'lazy';
    imageCol.append(img);
    block.append(imageCol);
  }

  const textCol = document.createElement('div');
  textCol.className = 'promotion-text';
  if (item.title) {
    const titleEl = document.createElement('p');
    titleEl.innerHTML = `<strong>${item.title}</strong>`;
    textCol.append(titleEl);
  }
  if (style !== 'title-only' && item.main?.plaintext) {
    const descriptionEl = document.createElement('p');
    descriptionEl.textContent = trimBlurb(item.main.plaintext);
    textCol.append(descriptionEl);
  }
  if (style !== 'title-only') appendDates(textCol, item.startDate, item.endDate);
  block.append(textCol);
}

/**
 * fetches the persisted query for the selected Content Fragment path and renders the matching
 * item into the block. runs after decorate() has already returned, so it
 * never blocks the page's section/block loading loop while the network
 * requests are in flight.
 * @param {Element} block The promotion block element
 * @param {string} promotionPath The AEM asset path identifying which item to render
 * @param {string} style One of the promotion style values, or 'default'
 */
async function loadPromotion(block, promotionPath, style) {
  const aemHost = getGraphqlHost();

  let item;
  try {
    const url = `${aemHost}/graphql/execute.json/${GRAPHQL_QUERY_PATH};promotionPath=${promotionPath}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    item = Object.values(json?.data || {})[0]?.item;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('promotion: failed to load GraphQL data', error);
    return;
  }

  if (!item) {
    // eslint-disable-next-line no-console
    console.error(`promotion: no item found at path "${promotionPath}"`);
    return;
  }

  renderFetchedPromotion(block, item, style);
}

/**
 * loads and decorates the promotion: an image + text + button banner with a
 * choice of layout styles. Left empty, "default" style automatically
 * alternates which side the image sits on for consecutive default-style
 * promotions, so authors can just stack them; any other style is applied
 * as authored, with no alternation. If a Content Fragment path is authored,
 * the promotion's content is fetched from a public GraphQL persisted query
 * instead, and the authored image/text fields are ignored.
 * @param {Element} block The promotion block element
 */
export default function decorate(block) {
  const [
    imageCell, textCell, styleCell, startDateCell, endDateCell, promotionPathCell,
  ] = block.children;

  const styleValue = styleCell?.textContent.trim().toLowerCase();
  const style = STYLES.includes(styleValue) ? styleValue : 'default';
  const startDate = startDateCell?.textContent.trim();
  const endDate = endDateCell?.textContent.trim();
  const promotionPath = promotionPathCell?.textContent.trim();

  applyStyle(block, style);

  if (promotionPath) {
    block.textContent = '';
    loadPromotion(block, promotionPath, style);
    return;
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
  if (style !== 'title-only') appendDates(textCol, startDate, endDate);

  if (styleCell) styleCell.remove();
  if (startDateCell) startDateCell.remove();
  if (endDateCell) endDateCell.remove();
  if (promotionPathCell) promotionPathCell.remove();

  block.textContent = '';
  block.append(...(showImage ? [imageCol, textCol] : [textCol]));
}

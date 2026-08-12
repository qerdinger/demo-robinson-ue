import getGraphqlHost from '../../scripts/graphql-host.js';

const STYLES = ['image-left', 'image-right', 'image-background', 'title-only', 'text-only'];
const GRAPHQL_QUERY_PATH = 'Robinson/promotion-by-slug';

function trimBlurb(text, maxLength = 160) {
  const trimmed = text.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1).trimEnd()}…` : trimmed;
}

/**
 * renders the fetched promotion using the same .promotion / .promotion-image /
 * .promotion-text structure and style classes as the promotion block, so a
 * promotion-cf block looks and behaves identically.
 * @param {Object} item The GraphQL content fragment item
 * @param {string} aemHost The AEM host images are served from
 * @param {string} style One of the promotion style values, or 'default'
 */
function renderPromotion(item, aemHost, style) {
  const block = document.createElement('div');
  block.className = 'promotion';

  if (style !== 'default') block.classList.add(`promotion-${style}`);

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
  block.append(textCol);

  return block;
}

/**
 * fetches the persisted query for the given slug and appends the matching
 * item to the block. runs after decorate() has already returned, so it never
 * blocks the page's section/block loading loop while the network requests
 * are in flight.
 * @param {Element} block The promotion-cf block element
 * @param {string} slug The "slug" field value identifying which item to render
 * @param {string} style One of the promotion style values, or 'default'
 */
async function loadPromotion(block, slug, style) {
  const aemHost = getGraphqlHost();

  let items = [];
  try {
    const url = `${aemHost}/graphql/execute.json/${GRAPHQL_QUERY_PATH};slug=${encodeURIComponent(slug)}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
    items = Object.values(json?.data || {})[0]?.items || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('promotion-cf: failed to load GraphQL data', error);
    return;
  }

  const item = items[0];
  if (!item) {
    // eslint-disable-next-line no-console
    console.error(`promotion-cf: no item found with slug "${slug}"`);
    return;
  }

  block.append(renderPromotion(item, aemHost, style));
}

/**
 * loads and decorates the promotion-cf block: fetches a single card from a
 * public GraphQL persisted query, matched by its slug, instead of authored
 * block items, and renders it using the same look as the promotion block.
 * @param {Element} block The promotion-cf block element
 */
export default function decorate(block) {
  const [slugDiv, styleDiv] = block.children;
  const slug = slugDiv?.textContent.trim();
  const styleValue = styleDiv?.textContent.trim().toLowerCase();
  const style = STYLES.includes(styleValue) ? styleValue : 'default';

  block.textContent = '';

  if (!slug) return;

  loadPromotion(block, slug, style);
}

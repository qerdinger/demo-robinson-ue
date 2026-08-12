const STYLES = ['image-left', 'image-right', 'image-background', 'title-only', 'text-only'];
const GRAPHQL_QUERY_PATH = 'Robinson/promotion-by-slug';

function trimBlurb(text, maxLength = 160) {
  const trimmed = text.trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1).trimEnd()}…` : trimmed;
}

// plain <img> tags can't carry the Authorization header, so once the page is published
// (viewed without an authenticated author session cookie) a direct <img src> to the author
// host 401s; fetching the binary with the same header and pointing <img> at a blob URL works
// in both cases
async function fetchAuthenticatedImageUrl(url, headers) {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/**
 * renders the fetched promotion using the same .promotion / .promotion-image /
 * .promotion-text structure and style classes as the promotion block, so a
 * promotion-cf block looks and behaves identically.
 * @param {Object} item The GraphQL content fragment item
 * @param {Object} headers Auth headers to fetch the image with, if any
 * @param {string} aemHost The AEM host images are served from
 * @param {string} style One of the promotion style values, or 'default'
 */
async function renderPromotion(item, headers, aemHost, style) {
  const block = document.createElement('div');
  block.className = 'promotion';

  if (style !== 'default') block.classList.add(`promotion-${style}`);

  const showImage = style !== 'title-only' && style !== 'text-only';

  // GraphQL's Content Fragment schema names these fields with a leading underscore
  // eslint-disable-next-line no-underscore-dangle
  const imagePath = item.featuredImage?._dynamicUrl || item.featuredImage?._path;
  if (imagePath && showImage) {
    const imageUrl = imagePath.startsWith('/') ? `${aemHost}${imagePath}` : imagePath;
    const blobUrl = await fetchAuthenticatedImageUrl(imageUrl, headers);
    if (blobUrl) {
      const imageCol = document.createElement('div');
      imageCol.className = 'promotion-image';
      const img = document.createElement('img');
      img.src = blobUrl;
      img.alt = item.title || '';
      img.loading = 'lazy';
      imageCol.append(img);
      block.append(imageCol);
    }
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
 * @param {string} aemHost The AEM host to query and fetch images from
 * @param {string} slug The "slug" field value identifying which item to render
 * @param {string} accessToken Optional bearer token for the query and images
 * @param {string} style One of the promotion style values, or 'default'
 */
async function loadPromotion(block, aemHost, slug, accessToken, style) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

  let items = [];
  try {
    const url = `${aemHost}/graphql/execute.json/${GRAPHQL_QUERY_PATH};slug=${encodeURIComponent(slug)}`;
    const res = await fetch(url, { headers });
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

  block.append(await renderPromotion(item, headers, aemHost, style));
}

/**
 * loads and decorates the promotion-cf block: fetches a single card from a
 * public GraphQL persisted query, matched by its slug, instead of authored
 * block items, and renders it using the same look as the promotion block.
 * @param {Element} block The promotion-cf block element
 */
export default function decorate(block) {
  const [aemHostDiv, slugDiv, accessTokenDiv, styleDiv] = block.children;
  const aemHost = aemHostDiv?.textContent.trim();
  const slug = slugDiv?.textContent.trim();
  const accessToken = accessTokenDiv?.textContent.trim();
  const styleValue = styleDiv?.textContent.trim().toLowerCase();
  const style = STYLES.includes(styleValue) ? styleValue : 'default';

  block.textContent = '';

  if (!aemHost || !slug) return;

  loadPromotion(block, aemHost, slug, accessToken, style);
}

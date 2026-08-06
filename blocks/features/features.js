import { moveInstrumentation } from '../../scripts/scripts.js';

// icon assigned by position — cycles if more items are added
const ICON_ORDER = ['chat', 'headset', 'truck', 'tag'];

const ICONS = {
  chat: '<svg viewBox="0 0 42 36" aria-hidden="true" focusable="false"><rect x="14" y="2" width="26" height="18" rx="9" fill="#F5C0C0"/><path d="M2 11a9 9 0 0 1 9-9h9a9 9 0 0 1 9 9 9 9 0 0 1-9 9h-8l-7 7v-7a9 9 0 0 1-3-9z" fill="#FF7171"/></svg>',
  headset: '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20 4a14 14 0 0 0-14 14v10" stroke="#FF9B71" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M20 4a14 14 0 0 1 14 14v10" stroke="#FF9B71" stroke-width="4" stroke-linecap="round" fill="none"/><rect x="2" y="24" width="8" height="12" rx="4" fill="#FF7171"/><rect x="30" y="24" width="8" height="12" rx="4" fill="#FF7171"/><path d="M34 30v4a6 6 0 0 1-6 6h-4" stroke="#FF7171" stroke-width="3" stroke-linecap="round" fill="none"/></svg>',
  truck: '<svg viewBox="0 0 44 32" aria-hidden="true" focusable="false"><rect x="2" y="8" width="24" height="16" rx="2" fill="#FFA000"/><path d="M26 14h8l6 6v4h-14z" fill="#F44336"/><circle cx="11" cy="27" r="4" fill="#455A64"/><circle cx="33" cy="27" r="4" fill="#455A64"/></svg>',
  tag: '<svg viewBox="0 0 36 36" aria-hidden="true" focusable="false"><path d="M4 4h14l16 16-16 16L2 20V6a2 2 0 0 1 2-2z" fill="#FFA726"/><circle cx="11" cy="11" r="3" fill="#fff"/></svg>',
};

/**
 * loads and decorates the features row: an icon (assigned by position),
 * title and description per item.
 * @param {Element} block The features block element
 */
export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    const [titleCell, descriptionCell] = row.children;
    const icon = ICON_ORDER[i % ICON_ORDER.length];

    const item = document.createElement('div');
    item.className = 'feature-item';

    const iconWrapper = document.createElement('span');
    iconWrapper.className = 'feature-icon';
    iconWrapper.innerHTML = ICONS[icon];

    const body = document.createElement('div');
    body.className = 'feature-body';
    if (titleCell) body.append(...titleCell.children);
    if (descriptionCell) body.append(...descriptionCell.children);

    item.append(iconWrapper, body);
    moveInstrumentation(row, item);
    row.replaceWith(item);
  });
}

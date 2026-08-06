import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the blog rail: a responsive grid (max 3 columns,
 * unlimited rows) of text-only post cards, each with a linked title and a
 * meta block (author, excerpt, date, "Read more" link).
 * @param {Element} block The blog-rail block element
 */
export default function decorate(block) {
  const grid = document.createElement('ul');
  grid.className = 'blog-rail-grid';

  [...block.children].forEach((row) => {
    const [titleCell, metaCell] = row.children;

    const card = document.createElement('li');
    card.className = 'blog-item';

    if (titleCell) card.append(...titleCell.children);
    if (metaCell) card.append(...metaCell.children);

    moveInstrumentation(row, card);
    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}

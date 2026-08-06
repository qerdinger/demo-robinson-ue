import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the FAQ accordion: each authored item becomes a
 * native <details>/<summary> pair, so expand/collapse works without extra JS.
 * The +/- indicator is drawn in CSS off the [open] state.
 * @param {Element} block The faq block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [questionCell, answerCell] = row.children;

    const details = document.createElement('details');
    details.className = 'faq-item';

    const summary = document.createElement('summary');
    summary.className = 'faq-question';
    if (questionCell) summary.append(...questionCell.children);

    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    if (answerCell) answer.append(...answerCell.children);

    details.append(summary, answer);
    moveInstrumentation(row, details);
    row.replaceWith(details);
  });
}

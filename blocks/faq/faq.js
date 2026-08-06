import { moveInstrumentation } from '../../scripts/scripts.js';

const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/**
 * loads and decorates the FAQ accordion: each authored item becomes a
 * native <details>/<summary> pair, so expand/collapse works without extra JS.
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
    summary.insertAdjacentHTML('beforeend', CHEVRON);

    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    if (answerCell) answer.append(...answerCell.children);

    details.append(summary, answer);
    moveInstrumentation(row, details);
    row.replaceWith(details);
  });
}

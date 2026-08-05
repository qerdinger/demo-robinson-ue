// icon/color assigned by position: star+yellow, pharmacist+pink, vaccine+blue
const STYLES = [
  { icon: 'star', color: 'yellow' },
  { icon: 'pharmacist', color: 'pink' },
  { icon: 'vaccine', color: 'blue' },
];

const ICONS = {
  star: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6z" fill="none" stroke="currentcolor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  pharmacist: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="3.5" width="16" height="18" rx="2" fill="none" stroke="currentcolor" stroke-width="1.6"/><path d="M9 3.5h6v2.5H9z" fill="none" stroke="currentcolor" stroke-width="1.6"/><path d="M12 10v6M9 13h6" stroke="currentcolor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  vaccine: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" fill="none" stroke="currentcolor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 9v6M9 12h6" stroke="currentcolor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

/**
 * loads and decorates the action buttons row
 * @param {Element} block The actions block element
 */
export default function decorate(block) {
  const buttons = [...block.children].map((row, i) => {
    const { icon, color } = STYLES[i % STYLES.length];
    const link = row.querySelector('a');
    const label = link?.textContent.trim() || '';

    const a = document.createElement('a');
    a.className = `action action-${color}`;
    a.href = link?.href || '#';
    a.innerHTML = `<span class="action-icon">${ICONS[icon]}</span><span class="action-label">${label}</span>`;
    return a;
  });

  block.textContent = '';
  block.append(...buttons);
}

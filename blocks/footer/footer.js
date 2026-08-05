import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// inline icons used by the company contact rows and the newsletter form
const ICONS = {
  location: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.25 1Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm1 2.4V17h14V6.4l-6.4 4.8a1 1 0 0 1-1.2 0Z"/></svg>',
};

/**
 * Decorates the company info section: prefixes the address/phone/email rows
 * with a small matching icon.
 * @param {Element} section The .footer-company section element
 */
function decorateCompany(section) {
  if (!section) return;
  section.querySelectorAll('p').forEach((p) => {
    const link = p.querySelector('a');
    let icon = null;
    if (link && link.href.startsWith('tel:')) icon = 'phone';
    else if (link && link.href.startsWith('mailto:')) icon = 'mail';
    else if (!link && !p.querySelector('strong')) icon = 'location';
    if (icon) {
      const rowContent = p.innerHTML;
      p.classList.add('footer-company-row');
      p.innerHTML = `<span class="footer-company-icon">${ICONS[icon]}</span><span>${rowContent}</span>`;
    }
  });
}

/**
 * Decorates the newsletter section: turns the authored "Email" placeholder
 * and "Subscribe" link into a real email input + submit button.
 * @param {Element} section The .footer-newsletter section element
 */
function decorateNewsletter(section) {
  if (!section) return;
  const paragraphs = [...section.querySelectorAll('p')];
  const emailPlaceholder = paragraphs.find((p) => !p.querySelector('a')
    && !p.querySelector('strong') && p.textContent.trim() === 'Email');
  const subscribeLink = paragraphs.find((p) => {
    const a = p.querySelector('a');
    return a && a.textContent.trim() === 'Subscribe';
  });
  if (emailPlaceholder && subscribeLink) {
    const form = document.createElement('form');
    form.className = 'footer-newsletter-form';
    form.innerHTML = '<input type="email" name="email" placeholder="Email" aria-label="Email" required>'
      + '<button type="submit">Subscribe</button>';
    emailPlaceholder.replaceWith(form);
    subscribeLink.remove();
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // classes assigned by position: company info, three link columns, newsletter, bottom bar
  const classes = ['company', 'links', 'links', 'links', 'newsletter', 'bottom'];
  classes.forEach((c, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(`footer-${c}`);
  });

  decorateCompany(footer.querySelector('.footer-company'));
  decorateNewsletter(footer.querySelector('.footer-newsletter'));

  block.append(footer);
}

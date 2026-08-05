import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

// inline icons used by the brand badge and tools (search / account / cart)
const ICONS = {
  badge: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="none" stroke="currentcolor" stroke-width="2"/><path d="M12 7v10M7 12h10" stroke="currentcolor" stroke-width="2" stroke-linecap="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5 1.49-1.5-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"/></svg>',
  account: '<svg viewBox="0 0 21 25" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.4738 1.97301C8.04647 1.97301 6.13986 3.88364 6.13986 6.16567C6.13986 8.4477 8.04647 10.3583 10.4738 10.3583C12.9011 10.3583 14.8078 8.4477 14.8078 6.16567C14.8078 3.88364 12.9011 1.97301 10.4738 1.97301ZM4.18958 6.16567C4.18958 2.72695 7.03686 0 10.4738 0C13.9108 0 16.7581 2.72695 16.7581 6.16567C16.7581 9.60438 13.9108 12.3313 10.4738 12.3313C7.03686 12.3313 4.18958 9.60438 4.18958 6.16567Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M14.077 15.7281C11.69 15.33 9.25762 15.33 6.87056 15.7281L6.58977 15.775C3.98522 16.2094 2.02719 18.571 2.02719 21.3926C2.02719 22.2839 2.71033 22.9492 3.48423 22.9492H17.4634C18.2372 22.9492 18.9204 22.2839 18.9204 21.3926C18.9204 18.571 16.9624 16.2094 14.3579 15.775L14.077 15.7281ZM14.4068 13.7047L14.6876 13.7514C18.3179 14.357 20.9476 17.6157 20.9476 21.3926C20.9476 23.3532 19.4184 25 17.4634 25H3.48423C1.52913 25 0 23.3532 0 21.3926C0 17.6157 2.6297 14.357 6.25999 13.7514L6.5408 13.7047C9.14624 13.27 11.8013 13.27 14.4068 13.7047Z"/></svg>',
  cart: '<svg viewBox="0 0 25 25" aria-hidden="true" focusable="false"><path d="M24.6604 12.4345C23.0288 0.770147 21.6121 0 12.5063 0C3.38511 0 1.96702 0.767291 0.339538 12.4192C-0.370225 17.5015 0.0185298 20.4647 1.64015 22.3286C3.58578 24.5634 7.09257 25 12.4934 25C17.9027 25 21.415 24.562 23.3614 22.3256C24.9814 20.4647 25.3702 17.5071 24.6604 12.4345ZM21.7448 20.9195C20.3407 22.5338 17.1646 22.8573 12.4944 22.8573C7.83264 22.8573 4.66214 22.5336 3.25877 20.9208C2.10108 19.5923 1.85597 17.0607 2.46325 12.7149C3.93995 2.14344 4.42417 2.14344 12.507 2.14344C20.5743 2.14344 21.0573 2.14344 22.5381 12.7308C23.144 17.0677 22.8997 19.5927 21.7448 20.9195Z"/><path d="M16.0731 5.00006C15.7888 5.00006 15.5162 5.11294 15.3152 5.31388C15.1141 5.51481 15.0012 5.78733 15.0012 6.0715C15.0012 6.73454 14.7377 7.37043 14.2686 7.83927C13.7996 8.30812 13.1634 8.57151 12.5 8.57151C11.8367 8.57151 11.2005 8.30812 10.7314 7.83927C10.2624 7.37043 9.99885 6.73454 9.99885 6.0715C9.99885 5.78733 9.88591 5.51481 9.68488 5.31388C9.48386 5.11294 9.21121 5.00006 8.92691 5.00006C8.64262 5.00006 8.36997 5.11294 8.16894 5.31388C7.96792 5.51481 7.85498 5.78733 7.85498 6.0715C7.85498 7.30287 8.34437 8.4838 9.21548 9.35451C10.0866 10.2252 11.2681 10.7144 12.5 10.7144C13.732 10.7144 14.9135 10.2252 15.7846 9.35451C16.6557 8.4838 17.1451 7.30287 17.1451 6.0715C17.1451 5.78733 17.0321 5.51481 16.8311 5.31388C16.6301 5.11294 16.3574 5.00006 16.0731 5.00006Z"/></svg>',
};

// static demo values for the account/cart tool labels (no real account or cart backend)
const TOOL_TEXT = {
  account: ['Hello, sign in', 'Account & List'],
  cart: ['Cart', '₱0.00'],
};

/**
 * Decorates the nav brand: splits the wordmark into two colored parts and
 * appends a small badge icon, mirroring a two-tone pharmacy logotype.
 * @param {Element} navBrand The .nav-brand section element
 */
function decorateBrand(navBrand) {
  if (!navBrand) return;
  const link = navBrand.querySelector('a');
  if (!link) return;
  const words = link.textContent.trim().split(/\s+/);
  const last = words.pop();
  link.innerHTML = `<span class="nav-brand-primary">${words.join(' ')}</span>`
    + `<span class="nav-brand-accent">${last}</span>${ICONS.badge}`;
}

/**
 * Decorates the nav tools section: turns the authored search placeholder into a
 * search form and authored Account/Cart links into two-line icon buttons.
 * @param {Element} navTools The .nav-tools section element
 */
function decorateTools(navTools) {
  if (!navTools) return;
  const wrapper = navTools.querySelector('.default-content-wrapper') || navTools;

  // build the search form from the first plain paragraph (its text is the placeholder)
  const searchPlaceholder = [...wrapper.querySelectorAll('p')]
    .find((p) => !p.querySelector('a'));
  if (searchPlaceholder) {
    const placeholder = searchPlaceholder.textContent.trim() || 'Search Products...';
    const form = document.createElement('form');
    form.className = 'nav-search';
    form.setAttribute('role', 'search');
    form.action = '/search';
    form.innerHTML = `<input type="search" name="q" aria-label="${placeholder}" placeholder="${placeholder}">
      <button type="submit" aria-label="Search">${ICONS.search}</button>`;
    searchPlaceholder.replaceWith(form);
  }

  // turn each remaining tool link into a two-line icon button (Account / Cart)
  wrapper.querySelectorAll('a').forEach((link) => {
    const label = link.textContent.trim();
    const key = /cart|bag/i.test(label) ? 'cart' : 'account';
    const [line1, line2] = TOOL_TEXT[key];
    link.classList.add('nav-tool', `nav-tool-${key}`);
    link.setAttribute('aria-label', `${line1} ${line2}`);
    const badge = key === 'cart' ? '<span class="nav-tool-badge">0</span>' : '';
    link.innerHTML = `<span class="nav-tool-icon">${ICONS[key]}${badge}</span>`
      + `<span class="nav-tool-lines"><span>${line1}</span><span>${line2}</span></span>`;
    const container = link.closest('.button-container');
    if (container) container.className = 'nav-tools-buttons';
  });
}

/**
 * Inserts the decorative rewards-widget badge between the account and cart tools.
 * @param {Element} navTools The .nav-tools section element
 */
function decorateWidget(navTools) {
  if (!navTools) return;
  const wrapper = navTools.querySelector('.default-content-wrapper') || navTools;
  const accountLink = wrapper.querySelector('.nav-tool-account');
  if (!accountLink) return;
  const widget = document.createElement('img');
  widget.src = 'https://cdn.shopify.com/s/files/1/0257/1884/9583/files/sed_option3_8b099074-297e-438e-953e-431f2b7d10da.png?v=1724116974';
  widget.alt = '';
  widget.width = 32;
  widget.height = 32;
  widget.loading = 'lazy';
  widget.className = 'nav-widget-icon';
  accountLink.insertAdjacentElement('afterend', widget);
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-wrapper')?.removeAttribute('class');
  }
  decorateBrand(navBrand);

  const navTools = nav.querySelector('.nav-tools');
  decorateTools(navTools);
  decorateWidget(navTools);

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

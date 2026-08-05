import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const AUTOPLAY_DELAY = 5000;

const ICONS = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/**
 * Moves to the slide at the given index, wrapping around, and updates the
 * track position, dot states and slide aria-hidden attributes.
 * @param {Element} block The carousel block element
 * @param {number} index The target slide index
 */
function goToSlide(block, index) {
  const slides = [...block.querySelectorAll('.carousel-slide')];
  const dots = [...block.querySelectorAll('.carousel-dot')];
  const target = (index + slides.length) % slides.length;
  block.querySelector('.carousel-track').style.transform = `translateX(-${target * 100}%)`;
  slides.forEach((slide, i) => slide.setAttribute('aria-hidden', i === target ? 'false' : 'true'));
  dots.forEach((dot, i) => dot.setAttribute('aria-current', i === target ? 'true' : 'false'));
  block.dataset.activeSlide = target;
}

/**
 * Starts the autoplay timer, unless the user prefers reduced motion.
 * @param {Element} block The carousel block element
 */
function startAutoplay(block) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  clearInterval(block.dataset.autoplayId);
  const id = setInterval(() => {
    goToSlide(block, Number(block.dataset.activeSlide) + 1);
  }, AUTOPLAY_DELAY);
  block.dataset.autoplayId = id;
}

function stopAutoplay(block) {
  clearInterval(block.dataset.autoplayId);
}

/**
 * loads and decorates the carousel
 * @param {Element} block The carousel block element
 */
export default function decorate(block) {
  const slideCount = block.children.length;
  const track = document.createElement('ul');
  track.className = 'carousel-track';

  [...block.children].forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'carousel-slide';
    li.setAttribute('role', 'group');
    li.setAttribute('aria-roledescription', 'slide');
    li.setAttribute('aria-label', `${i + 1} of ${slideCount}`);
    li.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    moveInstrumentation(row, li);

    const link = row.querySelector('a');
    const picture = row.querySelector('picture');
    const container = link ? document.createElement('a') : document.createElement('div');
    if (link) {
      container.href = link.href;
      moveInstrumentation(link, container);
    }
    if (picture) container.append(picture);
    li.append(container);
    track.append(li);
  });

  track.querySelectorAll('picture > img').forEach((img, i) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, i === 0, [{ width: '1600' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  controls.innerHTML = `<button type="button" class="carousel-arrow carousel-prev" aria-label="Previous slide">${ICONS.prev}</button>
    <div class="carousel-dots" role="tablist" aria-label="Slides">
      ${[...Array(slideCount)].map((_, i) => `<button type="button" class="carousel-dot" aria-label="Go to slide ${i + 1}" aria-current="${i === 0}"></button>`).join('')}
    </div>
    <button type="button" class="carousel-arrow carousel-next" aria-label="Next slide">${ICONS.next}</button>`;

  block.textContent = '';
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', 'Promotions');
  block.dataset.activeSlide = '0';
  block.append(track, controls);

  controls.querySelector('.carousel-prev').addEventListener('click', () => {
    goToSlide(block, Number(block.dataset.activeSlide) - 1);
    startAutoplay(block);
  });
  controls.querySelector('.carousel-next').addEventListener('click', () => {
    goToSlide(block, Number(block.dataset.activeSlide) + 1);
    startAutoplay(block);
  });
  controls.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(block, i);
      startAutoplay(block);
    });
  });

  block.addEventListener('mouseenter', () => stopAutoplay(block));
  block.addEventListener('mouseleave', () => startAutoplay(block));
  block.addEventListener('focusin', () => stopAutoplay(block));
  block.addEventListener('focusout', () => startAutoplay(block));

  if (slideCount > 1) startAutoplay(block);
}

// add delayed functionality here

/**
 * adds a "back to top" button that appears once the user scrolls down. Its
 * border fills in as a progress ring tracking how far down the page the
 * user has scrolled, and it smooth-scrolls back to the top when clicked.
 */
function initBackToTop() {
  const svgNS = 'http://www.w3.org/2000/svg';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back-to-top';
  button.setAttribute('aria-label', 'Back to top');

  const progress = document.createElementNS(svgNS, 'svg');
  progress.setAttribute('class', 'back-to-top-progress');
  progress.setAttribute('viewBox', '0 0 56 56');
  const track = document.createElementNS(svgNS, 'rect');
  track.setAttribute('x', '2');
  track.setAttribute('y', '2');
  track.setAttribute('width', '52');
  track.setAttribute('height', '52');
  track.setAttribute('rx', '14');
  progress.append(track);

  button.innerHTML = '<svg class="back-to-top-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 15l6-6 6 6M6 10l6-6 6 6" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  button.prepend(progress);

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.append(button);

  const length = track.getTotalLength();
  track.style.strokeDasharray = `${length}`;

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    track.style.strokeDashoffset = `${length * (1 - ratio)}`;
    button.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

initBackToTop();

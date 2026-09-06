/* UNLEESH — work archive: hero filmstrip, grid/list views, hover loops, cursor previews */
import { reducedMotion } from './core.js';
import { initInner, initRowPreview, scrollToEl } from './inner.js';

export function init() {
  initInner();
  initFilmstrip();
  initViews();
  initCards();
  initRows();
}

/* hero filmstrip: hover names the case, click glides to its card */
function initFilmstrip() {
  const thumbs = [...document.querySelectorAll('.wk-thumb')];
  const idx = document.querySelector('.ws-idx');
  const name = document.querySelector('.ws-name');
  if (!thumbs.length) return;
  const total = String(thumbs.length).padStart(2, '0');
  thumbs[0].classList.add('is-active');
  thumbs.forEach((t, i) => {
    t.addEventListener('mouseenter', () => {
      thumbs.forEach((o) => o.classList.toggle('is-active', o === t));
      idx.innerHTML = `${String(i + 1).padStart(2, '0')} <em>//</em> ${total}`;
      if (!reducedMotion) {
        gsap.fromTo(name, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.4, ease: 'expo.out', overwrite: true,
          onStart: () => { name.textContent = t.dataset.title; } });
      } else name.textContent = t.dataset.title;
    });
    t.addEventListener('click', (e) => {
      e.preventDefault();
      showView('grid');
      const target = document.querySelector(t.getAttribute('href'));
      if (target) scrollToEl(target);
    });
  });
}

/* grid <-> list */
let currentView = 'grid';
function showView(view) {
  if (view === currentView) return;
  const grid = document.querySelector('.wk-grid');
  const list = document.querySelector('.wk-list');
  const out = view === 'grid' ? list : grid;
  const inn = view === 'grid' ? grid : list;
  currentView = view;
  document.querySelectorAll('.wk-toggle button').forEach((b) => {
    const on = b.dataset.view === view;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', String(on));
  });
  const swap = () => {
    out.hidden = true; out.classList.remove('is-on');
    inn.hidden = false; inn.classList.add('is-on');
    ScrollTrigger.refresh();
    if (reducedMotion) return;
    gsap.fromTo(inn.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out', clearProps: 'transform' });
  };
  if (reducedMotion) { swap(); return; }
  gsap.to(out.children, { y: -20, opacity: 0, duration: 0.3, stagger: 0.02, ease: 'power2.in', onComplete: swap });
}
function initViews() {
  document.querySelectorAll('.wk-toggle button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
}

/* cards: parallax drift, hover plays the mockup loop when one exists */
function initCards() {
  const cards = [...document.querySelectorAll('.wk-card')];
  cards.forEach((card) => {
    const video = card.querySelector('video');
    if (video) {
      card.addEventListener('mouseenter', () => {
        if (!video.src && video.dataset.src) video.src = video.dataset.src;
        video.play().then(() => card.classList.add('is-playing')).catch(() => {});
      });
      card.addEventListener('mouseleave', () => { card.classList.remove('is-playing'); video.pause(); });
    }
    if (reducedMotion) return;
    const media = card.querySelector('.wk-media');
    gsap.to(media, {
      y: card.classList.contains('is-tall') ? -60 : -30, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* list rows: cursor preview of the mockup */
function initRows() {
  const rows = [...document.querySelectorAll('.wk-row')];
  initRowPreview(rows, (row) => row.dataset.img, (row) => row.querySelector('.sector').textContent);
}

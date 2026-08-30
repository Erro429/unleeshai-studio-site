/* UNLEESH — labs: rendered grid, Flip filtering, lightbox */
import { reducedMotion, revealImg } from './core.js';
import { icon } from './icons.js';

const CATS = {
  all: 'ALL',
  web: 'Web Motion Design',
  motion: 'Motion Image Generation',
  commercial: 'High-End Commercial Image Generation',
};

const ITEMS = [
  ['3D WEB DESIGN', 'web', 'V51', 1, 'JUN 25, 2026'],
  ['SKELETON WATCH VISUAL SHOWCASE', 'motion', 'V52', 1, 'JUN 21, 2026'],
  ['DYNAMIC SCENARIO: NIGHT SEDAN', 'motion', 'V53', 1, 'JUN 14, 2026'],
  ['LUMINOUS CREAM SHOWCASE', 'motion', 'V54', 1, 'JUN 08, 2026'],
  ['ICONIC LIGHTING SHOWCASE', 'commercial', 'V55', 0, 'MAY 30, 2026'],
  ['CERAMIC CUP VISUAL SHOWCASE', 'commercial', 'V56', 0, 'MAY 26, 2026'],
  ['FINE TABLEWARE VISUAL SHOWCASE', 'commercial', 'V57', 0, 'MAY 19, 2026'],
  ['DESK LAMP VISUAL SHOWCASE', 'commercial', 'V58', 0, 'MAY 12, 2026'],
  ['CUSHION VISUAL SHOWCASE', 'commercial', 'V59', 0, 'MAY 05, 2026'],
  ['VASE VISUAL SHOWCASE', 'commercial', 'V60', 0, 'APR 28, 2026'],
  ['DARK STAGE GROUP DANCE VISUAL', 'motion', 'V61', 1, 'APR 22, 2026'],
  ['OUTDOOR SPORT SANDAL SHOWCASE', 'motion', 'V62', 1, 'APR 15, 2026'],
  ['VASE LIFESTYLE SHOWCASE', 'commercial', 'V63', 0, 'APR 08, 2026'],
  ['RETRO FASHION EDITORIAL', 'motion', 'V64', 1, 'APR 01, 2026'],
  ['CARPET & RUG VISUAL SHOWCASE', 'commercial', 'V65', 0, 'MAR 25, 2026'],
  ['SPORTS DRINK CAN DESIGN', 'motion', 'V66', 1, 'MAR 18, 2026'],
  ['AI DRONE GENERATION: SUPERTALL', 'motion', 'V67', 1, 'MAR 11, 2026'],
  ['OUTDOOR LIFESTYLE CAMPAIGN', 'motion', 'V68', 1, 'MAR 04, 2026'],
  ['UNLEESH APPAREL VISUAL CONCEPT', 'motion', 'V69', 1, 'FEB 25, 2026'],
  ['CREATIVE TOOLS GLASS CUBE CONCEPT', 'motion', 'V70', 1, 'FEB 18, 2026'],
  ['FLOATING ECOSYSTEM VISUAL CONCEPT', 'motion', 'V71', 1, 'FEB 11, 2026'],
  ['MUSIC & LIGHT MOTION VISUAL', 'motion', 'V72', 1, 'FEB 04, 2026'],
  ['OFFICE LIFESTYLE SCENARIO', 'commercial', 'V73', 0, 'JAN 28, 2026'],
  ['URBAN STREETWEAR VISUAL SCENE', 'motion', 'V74', 1, 'JAN 21, 2026'],
  ['CHILDREN FASHION LIFESTYLE', 'commercial', 'V75', 0, 'JAN 14, 2026'],
];
const OWN_BRAND = new Set(['V69']); // no disclaimer on our own concepts
const DISCLAIMER = 'Disclaimer: This is an experimental visual concept. Not affiliated with, endorsed by, or sponsored by any featured brand.';

export function init() {
  const grid = document.querySelector('.lab-grid');
  if (!grid) return;

  grid.innerHTML = ITEMS.map(([title, cat, slot, isVideo, date], i) => `
    <article class="lab-card" data-cat="${cat}" data-idx="${i}">
      <div class="lc-media" data-cursor-dot data-slot="${slot}" data-video="${isVideo}">
        ${isVideo
          ? `<video src="assets/video/${slot}.mp4" autoplay muted loop playsinline></video>`
          : `<img src="assets/img/${slot}.webp" alt="${title}" loading="lazy">`}
      </div>
      <h3>${title}</h3>
      <span class="lc-date">${date}</span>
      <span class="lc-cat">（ ${CATS[cat]} ）</span>
      <button class="lc-view">View Details</button>
      ${OWN_BRAND.has(slot) ? '' : `<p class="lc-disc">${DISCLAIMER}</p>`}
    </article>`).join('');

  const cards = [...grid.querySelectorAll('.lab-card')];

  // entrance reveal
  if (!reducedMotion) {
    gsap.from(cards, {
      y: 40, opacity: 0, duration: 0.8, ease: 'expo.out',
      stagger: 0.07,
      scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
    });
  }

  // ---- filtering with Flip ----
  const filters = document.querySelectorAll('.lab-filters button');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.toggle('is-active', b === btn));
      const cat = btn.dataset.cat;
      const state = Flip.getState(cards.filter((c) => c.style.display !== 'none'));
      cards.forEach((c) => {
        c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
      });
      Flip.from(state, {
        duration: 0.7, ease: 'expo.out', absolute: true, scale: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  });

  initLightbox(cards);
}

function initLightbox(cards) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lb-media"></div>
    <button class="lb-close" aria-label="Close">${icon('close')}</button>
    <button class="lb-link" aria-label="Copy link">${icon('link')}</button>
    <button class="lb-prev" aria-label="Previous">${icon('prev')}</button>
    <button class="lb-next" aria-label="Next">${icon('next')}</button>
    <span class="lb-toast">COPIED</span>`;
  document.body.appendChild(lb);
  const media = lb.querySelector('.lb-media');
  const toast = lb.querySelector('.lb-toast');
  let current = -1;

  const visible = () => cards.filter((c) => c.style.display !== 'none');

  function show(card) {
    const set = visible();
    current = set.indexOf(card);
    const m = card.querySelector('.lc-media');
    const slot = m.dataset.slot;
    media.innerHTML = m.dataset.video === '1'
      ? `<video src="assets/video/${slot}.mp4" autoplay muted loop playsinline></video>`
      : `<img src="assets/img/${slot}.webp" alt="">`;
    lb.classList.add('is-open');
    if (!reducedMotion) {
      const state = Flip.getState(m.firstElementChild);
      gsap.fromTo(media, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out' });
    }
  }
  const step = (d) => {
    const set = visible();
    if (!set.length) return;
    current = ((current + d) % set.length + set.length) % set.length;
    show(set[current]);
  };
  const close = () => lb.classList.remove('is-open');

  cards.forEach((card) => {
    card.querySelector('.lc-media').addEventListener('click', () => show(card));
    card.querySelector('.lc-view').addEventListener('click', () => show(card));
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => step(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => step(1));
  lb.querySelector('.lb-link').addEventListener('click', async () => {
    try {
      const set = visible();
      const slot = set[current]?.querySelector('.lc-media').dataset.slot || '';
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${slot}`);
      gsap.fromTo(toast, { opacity: 1 }, { opacity: 0, duration: 1.2, ease: 'power2.in' });
    } catch { /* clipboard unavailable */ }
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
}

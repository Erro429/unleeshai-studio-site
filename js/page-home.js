/* UNLEESH — home: hero, the brief, the ribbon, the pinned scene, who we are, sectors, works */
import { reducedMotion, revealChars } from './core.js';
import { initHero } from './home-hero.js';
import { initBrief } from './home-brief.js';
import { initScene } from './home-scene.js';

export function init() {
  const hero = document.querySelector('.hero');
  if (hero) initHero(hero);
  // STUDIO / DIGITAL stagger in per character once the curtain lifts
  const mastReveal = () => document.querySelectorAll('.hx-word').forEach((w, i) => revealChars(w, { delay: i * 0.15 }));
  if (document.body.classList.contains('pl-done')) mastReveal();
  else document.addEventListener('preloader:done', mastReveal, { once: true });

  const brief = document.querySelector('.brief');
  if (brief) initBrief(brief);
  const scene = document.querySelector('.scene');
  if (scene) initScene(scene);
  initWhoDeck();
  initSectorsArc();
  initSectors();
}


/* THE SECTORS: two rings of small work tiles orbiting the heading —
   continuous slow spin plus extra rotation scrubbed by scroll */
const RING_IMGS = [
  'V40', 'V41', 'V42', 'V43', 'V44', 'V45', 'V46', 'V47', 'V48', 'V49',
  'V55', 'V56', 'V57', 'V58', 'V59', 'V60', 'V63', 'V65', 'V73', 'V75',
  'V17', 'V23', 'V24', 'V25', 'V26', 'V27',
];

function initSectorsArc() {
  const section = document.querySelector('.sectors-arc');
  if (!section) return;
  const outer = section.querySelector('.sa-ring-outer');
  const inner = section.querySelector('.sa-ring-inner');

  const build = (ring, count, radius, imgOffset) => {
    for (let i = 0; i < count; i++) {
      const tile = document.createElement('div');
      tile.className = 'sa-tile';
      const img = RING_IMGS[(i + imgOffset) % RING_IMGS.length];
      tile.innerHTML = `<img src="assets/img/${img}.webp" alt="" loading="lazy">`;
      tile.style.transform = `rotate(${(i / count) * 360}deg) translateY(-${radius}px)`;
      ring.appendChild(tile);
    }
  };

  const rOuter = Math.min(innerWidth * 0.34, 470);
  const rInner = Math.min(innerWidth * 0.23, 320);
  build(outer, 22, rOuter, 0);
  build(inner, 13, rInner, 8);

  if (reducedMotion) return;

  // continuous counter-rotating spin, independent of scroll
  gsap.to(outer, { rotation: 360, duration: 90, repeat: -1, ease: 'none' });
  gsap.to(inner, { rotation: -360, duration: 70, repeat: -1, ease: 'none' });

  // heading staggers in per character on enter
  revealChars(section.querySelector('.sa-title'), { trigger: section, stagger: 0.04 });
}




/* ---- WHO WE ARE deck fan ---- */
function initWhoDeck() {
  const deck = document.querySelector('.who-deck');
  if (!deck) return;
  const cards = deck.querySelectorAll('.who-card');
  if (reducedMotion || innerWidth < 1024) {
    cards.forEach((c, i) => {
      c.style.transform = `translateX(${(i - 2) * 40}px) rotate(${(i - 2) * 4}deg)`;
    });
    return;
  }
  const rot = [-14, -7, 0, 7, 14];
  const off = [-320, -160, 0, 160, 320];
  const tl = gsap.timeline({
    scrollTrigger: { trigger: deck, start: 'top 80%', end: '+=160%', scrub: 1 },
  });
  cards.forEach((c, i) => {
    tl.to(c, { rotation: rot[i], x: off[i], ease: 'none' }, 0);
  });
  // top card slower parallax
  gsap.to(cards[cards.length - 1], {
    y: -40, ease: 'none',
    scrollTrigger: { trigger: deck, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}


/* ---- sectors hover preview ---- */
const SECTOR_IMGS = ['V28', 'V30', 'V32', 'V33'];
function initSectors() {
  const rows = document.querySelectorAll('.sector-row');
  if (!rows.length) return;
  const pv = document.createElement('div');
  pv.className = 'sector-preview';
  pv.innerHTML = '<img alt="">';
  document.body.appendChild(pv);
  const img = pv.querySelector('img');
  const xTo = gsap.quickTo(pv, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(pv, 'y', { duration: 0.5, ease: 'power3' });

  rows.forEach((row, i) => {
    row.addEventListener('mouseenter', () => {
      img.src = `assets/img/${SECTOR_IMGS[i % SECTOR_IMGS.length]}.webp`;
      gsap.to(pv, { opacity: 1, duration: 0.3 });
    });
    row.addEventListener('mouseleave', () => gsap.to(pv, { opacity: 0, duration: 0.3 }));
    row.addEventListener('mousemove', (e) => { xTo(e.clientX + 24); yTo(e.clientY - 110); });
  });
}

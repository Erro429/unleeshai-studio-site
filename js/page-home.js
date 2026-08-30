/* UNLEESH — home page orchestrator */
import { reducedMotion } from './core.js';
import { initHero } from './home-hero.js';
import { initCube } from './home-cube.js';
import { initLetterplay } from './home-letterplay.js';

const RING_A = ['Core-Site', 'Gen-AI Visual', 'Motion Flow', 'WebGL Realm', '3D Matrix', 'Interaction', 'Pixel Perfect', 'Logic Build', 'Fluid UI', 'Aero Design', 'Pure Code', 'Digital Art'];
const RING_B = ['Strategy', 'Design', 'Tech', 'Creative', 'Motion', 'Brand', 'Future', 'Vision', 'System', 'Labs', 'Core', 'Craft'];

export function init() {
  const hero = document.querySelector('.hero');
  if (hero) initHero(hero);

  initOrbit();

  const cubeSection = document.querySelector('.cube-section');
  if (cubeSection) initCube(cubeSection);

  const lp = document.querySelector('.letterplay');
  if (lp) initLetterplay(lp);

  initWhoDeck();
  initSectors();
  initWorks();
}

/* ---- orbiting chip rings ---- */
function initOrbit() {
  const stage = document.querySelector('.orbit-stage');
  if (!stage) return;

  const mkRing = (labels, radius, tiltDeg) => labels.map((label, i) => {
    const el = document.createElement('span');
    el.className = 'chip orbit-chip';
    el.textContent = label;
    stage.appendChild(el);
    return { el, angle: (i / labels.length) * Math.PI * 2, radius, tilt: (tiltDeg * Math.PI) / 180 };
  });

  const scale = Math.min(1, innerWidth / 1100);
  const ringA = mkRing(RING_A, 420 * scale, 72);
  const ringB = mkRing(RING_B, 300 * scale, 64);

  if (reducedMotion) {
    [...ringA, ...ringB].forEach((c) => {
      const x = Math.cos(c.angle) * c.radius;
      const y = Math.sin(c.angle) * c.radius * Math.cos(c.tilt);
      c.el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
    return;
  }

  const state = { rotA: 0, rotB: 0, scrub: 0 };
  gsap.ticker.add((t, dt) => {
    if (!stage.isConnected) return;
    state.rotA += (dt / 1000) * (Math.PI * 2 / 40);
    state.rotB -= (dt / 1000) * (Math.PI * 2 / 28);
    const extra = (state.scrub * Math.PI); // +180° over section scroll
    render(ringA, state.rotA + extra);
    render(ringB, state.rotB - extra);
  });

  ScrollTrigger.create({
    trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 1,
    onUpdate: (self) => { state.scrub = self.progress; },
  });

  function render(ring, rot) {
    ring.forEach((c) => {
      const a = c.angle + rot;
      const x = Math.cos(a) * c.radius;
      const z = Math.sin(a); // -1 back, +1 front
      const y = Math.sin(a) * c.radius * Math.cos(c.tilt) * 0.35;
      c.el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${0.85 + 0.15 * z})`;
      c.el.style.opacity = z < 0 ? 0.3 : 1;
      c.el.style.zIndex = z < 0 ? 0 : 3;
    });
  }
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

/* ---- selected works parallax ---- */
function initWorks() {
  if (reducedMotion) return;
  document.querySelectorAll('.work-card').forEach((card, i) => {
    gsap.to(card, {
      y: i % 2 ? 40 : -40, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

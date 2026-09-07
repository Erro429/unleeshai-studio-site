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


/* THE SECTORS: two elliptical rings of scattered work stills around the type
   stack. Each card gets a seeded size / tilt / luminance so the field reads as
   a scatter, the rings drift in opposite directions on a ticker, scroll adds a
   slow extra turn, and the cursor parallaxes the outer ring more than the inner. */
const RING_IMGS = [
  'V40', 'V41', 'V42', 'V43', 'V44', 'V45', 'V46', 'V47', 'V48', 'V49',
  'V55', 'V56', 'V57', 'V58', 'V59', 'V60', 'V63', 'V65', 'V73', 'V75',
  'V17', 'V23', 'V24', 'V25', 'V26', 'V27',
];
const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

function initSectorsArc() {
  const section = document.querySelector('.sectors-arc');
  if (!section) return;
  const rings = [
    { el: section.querySelector('.sa-ring-outer'), count: 24, rx: 0.40, ry: 0.46, size: [46, 96], speed: 0.018, drift: 0.05, imgOffset: 0 },
    { el: section.querySelector('.sa-ring-inner'), count: 14, rx: 0.235, ry: 0.40, size: [38, 72], speed: -0.026, drift: 0.025, imgOffset: 9 },
  ];
  const rnd = seeded(20260907);

  rings.forEach((ring) => {
    ring.tiles = [];
    for (let i = 0; i < ring.count; i++) {
      const tile = document.createElement('div');
      tile.className = 'sa-tile';
      const img = RING_IMGS[(i + ring.imgOffset) % RING_IMGS.length];
      tile.innerHTML = `<img src="assets/img/${img}.webp?v=2" alt="" loading="lazy">`;
      const w = ring.size[0] + rnd() * (ring.size[1] - ring.size[0]);
      const portrait = rnd() > 0.35;
      tile.style.setProperty('--w', `${Math.round(portrait ? w : w * 1.25)}px`);
      tile.style.setProperty('--h', `${Math.round(portrait ? w * 1.25 : w)}px`);
      tile.style.setProperty('--lum', (0.35 + rnd() * 0.5).toFixed(2));
      ring.el.appendChild(tile);
      ring.tiles.push({
        el: tile,
        angle: (i / ring.count) * Math.PI * 2 + (rnd() - 0.5) * 0.5,
        radius: 0.88 + rnd() * 0.26,
        tilt: (rnd() - 0.5) * 70,
        set: gsap.quickSetter(tile, 'css'),
      });
    }
  });

  let offset = 0, scrollTurn = 0, mx = 0, my = 0;
  const place = () => {
    const W = section.clientWidth, H = section.clientHeight;
    rings.forEach((ring) => {
      const turn = offset * ring.speed + scrollTurn * ring.drift;
      ring.tiles.forEach((t) => {
        const a = t.angle + turn;
        t.set({
          x: Math.cos(a) * ring.rx * W * t.radius + mx * ring.drift * 800,
          y: Math.sin(a) * ring.ry * H * t.radius + my * ring.drift * 800,
          rotation: t.tilt + turn * 12,
        });
      });
    });
  };
  place();
  if (reducedMotion) return;

  // continuous drift, scroll adds a slow turn, cursor parallax eased per frame
  let tx = 0, ty = 0;
  gsap.ticker.add((time, dt) => {
    offset += dt / 1000;
    mx += (tx - mx) * 0.06;
    my += (ty - my) * 0.06;
    place();
  });
  section.addEventListener('pointermove', (e) => {
    tx = e.clientX / innerWidth - 0.5;
    ty = e.clientY / innerHeight - 0.5;
  });
  section.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
  ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'bottom top', scrub: true,
    onUpdate: (st) => { scrollTurn = st.progress * Math.PI * 2; },
  });

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
      img.src = `assets/img/${SECTOR_IMGS[i % SECTOR_IMGS.length]}.webp?v=2`;
      gsap.to(pv, { opacity: 1, duration: 0.3 });
    });
    row.addEventListener('mouseleave', () => gsap.to(pv, { opacity: 0, duration: 0.3 }));
    row.addEventListener('mousemove', (e) => { xTo(e.clientX + 24); yTo(e.clientY - 110); });
  });
}

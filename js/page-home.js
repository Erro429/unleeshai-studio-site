/* UNLEESH — home: hero + the field (ghost words, dotted letters, clusters) + works */
import { reducedMotion, revealChars } from './core.js';
import { initHero } from './home-hero.js';
import { initCube } from './home-cube.js';
import { initLetterplay } from './home-letterplay.js';

export function init() {
  const hero = document.querySelector('.hero');
  if (hero) initHero(hero);
  // STUDIO / DIGITAL stagger in per character once the curtain lifts
  const mastReveal = () => document.querySelectorAll('.hx-word').forEach((w, i) => revealChars(w, { delay: i * 0.15 }));
  if (document.body.classList.contains('pl-done')) mastReveal();
  else document.addEventListener('preloader:done', mastReveal, { once: true });

  initWall();
  const cubeSection = document.querySelector('.cube-section');
  if (cubeSection) initCube(cubeSection);
  const lp = document.querySelector('.letterplay');
  if (lp) initLetterplay(lp);
  initWhoDeck();
  initSectorsArc();
  initSectors();
  initWorksParallax();
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


/* WORD WALL: pinned stage under the hero — persistent word columns with a
   traveling chip highlight, a cycling center tile, and dotted letters popping */
const WALL_L = [
  ['Core-Site', '( core websites )'], ['Gen-AI Visual', '( generative visuals )'],
  ['Motion Flow', '( motion systems )'], ['WebGL Realm', '( webgl builds )'],
  ['3D Matrix', '( spatial design )'], ['Interaction', '( interaction design )'],
  ['Pixel Perfect', '( pixel craft )'], ['Logic Build', '( logic architecture )'],
  ['Fluid UI', '( fluid interfaces )'], ['Aero Design', '( aero design )'],
  ['Pure Code', '( pure code )'], ['Digital Art', '( digital art )'],
];
const WALL_R = [
  ['Strategy', '( strategy )'], ['Design', '( design )'], ['Tech', '( tech )'],
  ['Creative', '( creative )'], ['Motion', '( motion )'], ['Brand', '( brand )'],
  ['Future', '( future )'], ['Vision', '( vision )'], ['System', '( system )'],
  ['Labs', '( labs )'], ['Core', '( core )'], ['Craft', '( craft )'],
];
const WALL_TILES = ['V18', 'V63', 'V20', 'V40M', 'V57', 'V27', 'V45M', 'V21', 'V48', 'V46M', 'V13', 'V75'];
const WALL_LETTERS = [
  ['U', 12, 70], ['N', 74, 26], ['L', 20, 30], ['E', 68, 64],
  ['E', 30, 74], ['S', 78, 44], ['H', 16, 52],
];

function initWall() {
  const wall = document.querySelector('.wall');
  if (!wall) return;
  const colL = wall.querySelector('.wl-col-l');
  const colR = wall.querySelector('.wl-col-r');
  const tile = wall.querySelector('.wl-tile');
  const letterEl = wall.querySelector('.wl-letter');

  const rowsL = WALL_L.map(([word, chip]) => {
    const row = document.createElement('div');
    row.className = 'wl-row';
    row.innerHTML = `<span class="wl-word">${word}</span><span class="wl-chip">${chip}</span>`;
    colL.appendChild(row);
    return row;
  });
  const rowsR = WALL_R.map(([word, chip]) => {
    const row = document.createElement('div');
    row.className = 'wl-row';
    row.innerHTML = `<span class="wl-chip">${chip}</span><span class="wl-word">${word}</span>`;
    colR.appendChild(row);
    return row;
  });
  const tiles = WALL_TILES.map((id, i) => {
    const img = document.createElement('img');
    img.src = `assets/img/${id}.webp`;
    img.alt = '';
    if (i === 0) img.classList.add('is-on');
    tile.appendChild(img);
    return img;
  });

  if (reducedMotion) {
    rowsL[0].classList.add('is-on'); rowsR[0].classList.add('is-on');
    return;
  }

  let step = -1, tileIdx = 0, letterIdx = -1;
  const STEPS = WALL_L.length;

  ScrollTrigger.create({
    trigger: wall, start: 'top top', end: '+=320%',
    pin: true, scrub: 1, anticipatePin: 1,
    onUpdate: (self) => {
      const s = Math.min(STEPS - 1, Math.floor(self.progress * STEPS));
      if (s !== step) {
        if (step >= 0) { rowsL[step].classList.remove('is-on'); rowsR[step].classList.remove('is-on'); }
        rowsL[s].classList.add('is-on'); rowsR[s].classList.add('is-on');
        step = s;
      }
      const t = Math.min(tiles.length - 1, Math.floor(self.progress * tiles.length));
      if (t !== tileIdx) {
        tiles[tileIdx].classList.remove('is-on');
        tiles[t].classList.add('is-on');
        tileIdx = t;
      }
      const li = Math.min(WALL_LETTERS.length - 1, Math.floor(self.progress * WALL_LETTERS.length));
      if (li !== letterIdx) {
        const [ch, top, left] = WALL_LETTERS[li];
        letterEl.classList.remove('is-on');
        setTimeout(() => {
          letterEl.textContent = ch;
          letterEl.style.top = top + '%';
          letterEl.style.left = left + '%';
          letterEl.classList.add('is-on');
        }, 180);
        letterIdx = li;
      }
    },
  });
}


function initWorksParallax() {
  if (reducedMotion) return;
  document.querySelectorAll('.work-card').forEach((card, i) => {
    gsap.to(card, {
      y: i % 2 ? 40 : -40, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
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

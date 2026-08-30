/* UNLEESH — home: hero + the field (ghost words, dotted letters, clusters) + works */
import { reducedMotion, typeStatus } from './core.js';
import { initHero } from './home-hero.js';

const GHOST_L = ['Core-Site', 'Gen-AI Visual', 'Motion Flow', 'WebGL Realm', '3D Matrix', 'Interaction', 'Pixel Perfect', 'Logic Build', 'Fluid UI', 'Aero Design', 'Pure Code', 'Digital Art'];
const GHOST_R = ['Strategy', 'Design', 'Tech', 'Creative', 'Motion', 'Brand', 'Future', 'Vision', 'System', 'Labs', 'Core', 'Craft'];

const LETTERS = [
  { ch: 'U', top: 9, left: 6 }, { ch: 'N', top: 22, left: 78 },
  { ch: 'L', top: 34, left: 12 }, { ch: 'E', top: 46, left: 70 },
  { ch: 'E', top: 62, left: 8 }, { ch: 'S', top: 74, left: 74 },
  { ch: 'H', top: 88, left: 42 },
];

const CLUSTERS = [
  { top: 2, right: 3, cascade: false, lines: ['Brand Identity', 'Visual Strategy', 'Unleesh Creative'] },
  { top: 14, left: 2, cascade: false, lines: ['Motion Design', 'Micro Interactions', 'Type System', 'Creative Direction'] },
  { top: 40, left: 26, cascade: false, lines: ['Visual Identity', 'Responsive Design', 'Animation Direction', 'UI Component Design', 'Design System', 'Cross-Media Branding', 'Landing Page', 'Scroll Experience', 'WebGL Interface', 'Kinetic Typography'] },
  { top: 55, right: 5, cascade: true, lines: ['Concept Development', 'Market Positioning', 'Brand Personality', 'Audience Insight'] },
  { top: 68, left: 2, cascade: false, lines: ['Design Thinking', 'Prototyping', 'User Research', 'Content Strategy'] },
  { top: 80, left: 2, cascade: true, lines: ['Brand Audit', 'Competitor Analysis', 'Mood Board'] },
  { top: 92, right: 8, cascade: true, lines: ['Style Guide', 'Launch Strategy', 'Prompt Craft'] },
];

const STATUS = [
  { text: 'BRAND IDENTITY SYSTEM :: BUILDING', top: 17, left: 2 },
  { text: 'VISUAL SYSTEM :: LOADING', top: 52, left: 66 },
  { text: 'CREATIVE ENERGY :: CONTINUOUSLY OUTPUTTING', top: 84, left: 30 },
];

export function init() {
  const hero = document.querySelector('.hero');
  if (hero) initHero(hero);

  initField();
  initWorksParallax();
}

function initField() {
  const field = document.querySelector('.field');
  if (!field) return;

  // ghosted service-word arcs: left column drifts right as it descends, right column mirrors
  GHOST_L.forEach((w, i) => {
    const el = document.createElement('span');
    el.className = 'fd-ghost';
    el.textContent = w;
    el.style.top = (5 + i * 7.6) + '%';
    el.style.left = (4 + Math.sin(i / GHOST_L.length * Math.PI) * 14) + '%';
    field.appendChild(el);
  });
  GHOST_R.forEach((w, i) => {
    const el = document.createElement('span');
    el.className = 'fd-ghost';
    el.textContent = w;
    el.style.top = (5 + i * 7.6) + '%';
    el.style.right = (4 + Math.sin(i / GHOST_R.length * Math.PI) * 14) + '%';
    field.appendChild(el);
  });

  // dotted letters, each on a dim portrait media tile (reference pattern)
  const LETTER_TEX = ['V21', 'V18', 'V22', 'V20', 'V19', 'V26', 'V13'];
  const letterEls = LETTERS.map(({ ch, top, left }, i) => {
    const tile = document.createElement('div');
    tile.className = 'fd-ltile';
    tile.style.top = top + '%';
    tile.style.left = left + '%';
    tile.innerHTML = `<img src="assets/img/${LETTER_TEX[i]}.webp" alt="">` +
      `<div class="fd-letter">${ch}</div>`;
    field.appendChild(tile);
    return tile;
  });

  // label clusters
  CLUSTERS.forEach((c) => {
    const el = document.createElement('div');
    el.className = 'fd-cluster' + (c.cascade ? ' cascade' : '');
    el.innerHTML = c.lines.map((l) => `<span>${l}</span>`).join('');
    el.style.top = c.top + '%';
    if (c.left !== undefined) el.style.left = c.left + '%';
    if (c.right !== undefined) el.style.right = c.right + '%';
    field.appendChild(el);
  });

  // typewriter status lines
  const statusEls = STATUS.map((s) => {
    const el = document.createElement('div');
    el.className = 'status fd-status';
    el.dataset.text = s.text;
    el.style.top = s.top + '%';
    el.style.left = s.left + '%';
    el.innerHTML = '<span class="typed"></span><span class="cursor">█</span>';
    field.appendChild(el);
    return el;
  });

  // persistent DOWN indicator while the field is on screen
  const down = document.createElement('div');
  down.className = 'field-down';
  down.innerHTML = '<span class="chev">⌄</span>DOWN';
  document.body.appendChild(down);
  ScrollTrigger.create({
    trigger: field, start: 'top 60%', end: 'bottom bottom',
    onToggle: (self) => down.classList.toggle('is-visible', self.isActive),
  });

  if (reducedMotion) {
    statusEls.forEach(typeStatus);
    return;
  }

  // blur-in reveals for everything in the field
  field.querySelectorAll('.fd-ghost, .fd-cluster, .fd-statement, .fd-texture, .fd-frame').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, filter: 'blur(8px)', y: 30 },
      {
        opacity: el.classList.contains('fd-ghost') ? 0.55 : 1,
        filter: 'blur(0px)', y: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
  });

  // dotted letters scale-settle in, one per stretch
  letterEls.forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, scale: 0.6, rotation: -4 },
      {
        opacity: 1, scale: 1, rotation: 0, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      });
    // slow drift while passing through
    gsap.to(el, {
      y: -60, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // status lines type once when reached
  statusEls.forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => typeStatus(el),
    });
  });

  // gentle pointer parallax on ghosts
  const ghosts = [...field.querySelectorAll('.fd-ghost')];
  field.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / innerWidth - 0.5) * 2;
    ghosts.forEach((g, i) => {
      if (i % 2) return;
      gsap.to(g, { xPercent: nx * -4, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
    });
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

/* UNLEESH — the scene: one pinned set piece.
   0–10%  sixty keyword chips drift in with depth (scale / opacity / blur / parallax)
   10–20% cube faces fly in from an exploded state and assemble; U lights
   20–80% leftward Y-spin through right / back / left (N L E), axis switch to an
          X tumble through top / bottom (E S); three status lines type at beats
   80–92% exit: cube zooms past the camera, chips thin out, H lights
   92–100% the wordmark holds alone on the black, then the pin releases.
   Everything is on one scrubbed timeline, so scrolling up replays it in reverse. */
import { reducedMotion } from './core.js';

const LETTERS = ['U', 'N', 'L', 'E', 'E', 'S', 'H'];

const CHIPS = [
  'Brand identity', 'Visual strategy', 'Unleesh studio', 'Motion design', 'Micro interactions',
  'Type system', 'Creative direction', 'Design language', 'Interface design', 'Web experience',
  'Digital storytelling', 'Art direction', 'Campaign design', 'Visual narrative', 'Brand experience',
  'UX strategy', 'Creative coding', 'Logo design', 'Editorial layout', 'Packaging design',
  'Digital experience', 'Interaction design', 'Brand guidelines', 'Typography', 'Colour systems',
  'Brand consulting', 'Social media design', 'Video production', 'Illustration', 'Creative strategy',
  'Print design', 'Space branding', 'Exhibition design', 'Sound identity', 'Concept development',
  'Market positioning', 'Brand personality', 'Audience insight', 'Design thinking', 'Prototyping',
  'User research', 'Content strategy', 'Visual identity', 'Responsive design', 'Animation direction',
  'UI component design', 'Design system', 'Cross-media branding', 'Landing page', 'Digital brand standards',
  'Scroll experience', 'WebGL interface', 'Kinetic typography', 'Motion visual design', 'Brand audit',
  'AI visual pipeline', 'Generative imagery', 'Render direction', 'Prompt craft', 'Signal design',
];

const STATUS = [
  { text: 'BRAND IDENTITY SYSTEM :: BUILDING', pos: [8, 22] },
  { text: 'VISUAL SYSTEM :: LOADING', pos: [64, 76] },
  { text: 'CREATIVE ENERGY :: CONTINUOUSLY OUTPUTTING', pos: [10, 80] },
];

/* timeline units: 10 = full pin (500vh). Each face beat = 1.0 turn + 0.2 plateau. */
const T = {
  chipsIn: [0, 1.0],
  assemble: [1.0, 2.0],
  beats: [2.0, 3.2, 4.4, 5.6, 6.8],   // right, back, left, top, bottom
  exit: [8.0, 9.0],
  total: 10,
};
const DEPTH_MIN = 0.2;
const CHIP_MIN_OPACITY = 0.45;
const LETTER_OPACITY = 0.38;

/* chip layout: an 8 x 8 grid with the four centre cells left clear for the cube,
   each chip jittered inside its cell so the field reads as scattered, never stacked */
const GRID_COLS = 8, GRID_ROWS = 8;
const GRID_JITTER_X = 3, GRID_JITTER_Y = 9;
const GRID_CELLS = (() => {
  const cells = [];
  for (let r = 0; r < GRID_ROWS; r++) for (let c = 0; c < GRID_COLS; c++) {
    const centre = (c >= 3 && c <= 4) && (r >= 3 && r <= 4);
    if (!centre) cells.push([((c + 0.5) / GRID_COLS) * 100, ((r + 0.5) / GRID_ROWS) * 100]);
  }
  return cells;
})();

/* deterministic pseudo-random so the field is the same on every visit */
const prand = (i, salt) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export function initScene(section) {
  const cubeScene = section.querySelector('.cube-scene');
  const cube = section.querySelector('.cube');
  const size = Math.round(Math.min(innerWidth, innerHeight) * 0.44);
  cubeScene.style.setProperty('--cube', size + 'px');

  const faces = buildFaces(section, size / 2);
  const letters = buildLetters(section.querySelector('.sc-letters'));
  const chips = buildChips(section.querySelector('.sc-chips'));
  const status = buildStatus(section.querySelector('.sc-status'));
  const mark = section.querySelector('.sc-mark');
  const floor = section.querySelector('.sc-floor');

  const rot = { x: 0, y: 0, scale: 0.8, tiltX: 0, tiltY: 0, alpha: 1 };
  const applyCube = () => {
    cube.style.transform =
      `scale3d(${rot.scale},${rot.scale},${rot.scale}) rotateX(${rot.x + rot.tiltX}deg) rotateY(${rot.y + rot.tiltY}deg)`;
    cube.style.opacity = rot.alpha;
    faces.forEach((f) => f.place());
    shadeFaces(faces, rot.x + rot.tiltX, rot.y + rot.tiltY);
    floor.style.transform = `translate(-50%, -50%) scale(${rot.scale}, ${rot.scale * (0.6 + 0.4 * Math.abs(Math.cos(rot.x * Math.PI / 180)))})`;
    floor.style.opacity = rot.alpha * 0.9;
  };

  if (reducedMotion || innerWidth < 1024) {
    rot.x = -15; rot.y = 35; rot.scale = 1;
    applyCube();
    chips.forEach((c) => gsap.set(c.inner, { opacity: c.opacity }));
    gsap.set(letters[0], { opacity: LETTER_OPACITY, scale: 1 });
    status.forEach((s) => { s.typed.textContent = s.text; });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top top', end: '+=500%', pin: true, scrub: 1, anticipatePin: 1 },
    onUpdate: applyCube,
  });

  // 0–10% chips drift in from random offsets, then keep a scrubbed parallax by depth
  chips.forEach((c) => {
    tl.fromTo(c.inner, { opacity: 0, x: c.driftX, y: c.driftY },
      { opacity: c.opacity, x: 0, y: 0, ease: 'power2.out', duration: 0.6 }, c.delay);
    tl.to(c.wrap, { y: -220 * c.depth, ease: 'none', duration: T.total }, 0);
  });

  // 10–20% assembly: faces converge from exploded transforms; the logo face seals last
  faces.forEach((f, i) => {
    f.state.z = size * 0.9; f.state.o = 0; f.state.rz = f.askew; f.place();
    const at = T.assemble[0] + (f.key === 'front' ? 0.45 : i * 0.06);
    tl.to(f.state, { z: 0, o: 1, rz: 0, ease: 'power3.inOut', duration: 0.5 }, at);
  });
  tl.to(rot, { scale: 1, ease: 'power2.out', duration: 1 }, T.assemble[0]);
  lightLetter(tl, letters, 0, T.assemble[0] + 0.55, T.beats[0] + 0.5);

  // 20–80% the five face beats, each followed by a short plateau
  const turns = [
    { key: 'y', to: -90 }, { key: 'y', to: -180 }, { key: 'y', to: -270 },
    { key: 'x', to: -90 }, { key: 'x', to: 90 },
  ];
  turns.forEach((turn, i) => {
    const at = T.beats[i];
    const next = i + 1 < T.beats.length ? T.beats[i + 1] + 0.5 : T.exit[0] + 0.4;
    tl.to(rot, { [turn.key]: turn.to, ease: 'none', duration: 1 }, at);
    lightLetter(tl, letters, i + 1, at + 0.5, next);
  });
  typeLine(tl, status[0], T.beats[0] + 0.9);
  typeLine(tl, status[1], T.beats[1] + 0.9);
  typeLine(tl, status[2], T.beats[3] + 0.9);

  // 80–92% exit: the cube rushes past the camera, chips thin out, H lights
  tl.to(rot, { scale: 2.6, alpha: 0, ease: 'power2.in', duration: 1 }, T.exit[0]);
  tl.to(chips.map((c) => c.inner), {
    opacity: 0, ease: 'power1.in', duration: 0.6, stagger: { amount: 0.4, from: 'random' },
  }, T.exit[0]);
  tl.to(status.map((l) => l.el), { opacity: 0, ease: 'power1.in', duration: 0.5 }, T.exit[0] + 0.3);
  lightLetter(tl, letters, 6, T.exit[0] + 0.5, T.total);

  // 92–100% the wordmark holds alone on the black
  tl.fromTo(mark, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.6 }, T.exit[1] - 0.2);
  tl.to({}, { duration: T.total - (T.exit[1] + 0.4) }, T.exit[1] + 0.4);

  // pointer tilt rides on top of the scrubbed rotation
  const txTo = gsap.quickTo(rot, 'tiltY', { duration: 0.6, ease: 'power3', onUpdate: applyCube });
  const tyTo = gsap.quickTo(rot, 'tiltX', { duration: 0.6, ease: 'power3', onUpdate: applyCube });
  section.addEventListener('mousemove', (e) => {
    txTo((e.clientX / innerWidth - 0.5) * 10);
    tyTo(-(e.clientY / innerHeight - 0.5) * 10);
  });
  applyCube();
}

/* ---- builders ---- */
function buildFaces(section, half) {
  const BASE = {
    front: { rx: 0, ry: 0 }, back: { rx: 0, ry: 180 }, right: { rx: 0, ry: 90 },
    left: { rx: 0, ry: -90 }, top: { rx: 90, ry: 0 }, bottom: { rx: -90, ry: 0 },
  };
  return Object.entries(BASE).map(([key, r], i) => {
    const el = section.querySelector('.face-' + key);
    const state = { z: 0, o: 1, rz: 0 };
    const face = {
      key, el, state, r, askew: (prand(i, 3) - 0.5) * 30,
      place() {
        el.style.transform = `rotateX(${r.rx}deg) rotateY(${r.ry}deg) rotateZ(${state.rz}deg) translateZ(${half + state.z}px)`;
        el.style.opacity = state.o;
      },
    };
    face.place();
    return face;
  });
}

function buildLetters(host) {
  return LETTERS.map((ch) => {
    const el = document.createElement('div');
    el.className = 'sc-letter';
    el.textContent = ch;
    host.appendChild(el);
    gsap.set(el, { opacity: 0, scale: 1.2 });
    return el;
  });
}

function buildChips(host) {
  return CHIPS.map((text, i) => {
    const wrap = document.createElement('div');   // scrubbed parallax
    wrap.className = 'sc-chip';
    const inner = document.createElement('div');  // drift-in / exit
    inner.className = 'sc-chip-in';
    const txt = document.createElement('span');   // idle float
    txt.className = 'sc-chip-txt';
    txt.textContent = text;
    inner.appendChild(txt); wrap.appendChild(inner); host.appendChild(wrap);

    const depth = DEPTH_MIN + prand(i, 1) * (1 - DEPTH_MIN);   // 1 = nearest
    const [left, top] = GRID_CELLS[i];
    wrap.style.left = (left + (prand(i, 2) - 0.5) * GRID_JITTER_X) + '%';
    wrap.style.top = (top + (prand(i, 4) - 0.5) * GRID_JITTER_Y) + '%';
    wrap.style.zIndex = Math.round(depth * 10);
    gsap.set(wrap, {
      scale: 0.7 + depth * 0.4,
      filter: `blur(${((1 - depth) * 1.6).toFixed(2)}px)`,
    });
    const opacity = CHIP_MIN_OPACITY + depth * (1 - CHIP_MIN_OPACITY);
    gsap.set(inner, { opacity: 0 });
    if (!reducedMotion) {
      gsap.to(txt, {
        y: 8, duration: 3 + prand(i, 5) * 2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: -prand(i, 6) * 4,
      });
    }
    return {
      wrap, inner, depth, opacity,
      driftX: (prand(i, 7) - 0.5) * 120, driftY: (prand(i, 8) - 0.5) * 120,
      delay: prand(i, 9) * (T.chipsIn[1] - 0.6),
    };
  });
}

function buildStatus(host) {
  return STATUS.map((s) => {
    const el = document.createElement('div');
    el.className = 'status sc-line';
    el.style.left = s.pos[0] + '%';
    el.style.top = s.pos[1] + '%';
    el.innerHTML = '<span class="typed"></span><span class="cursor">█</span>';
    host.appendChild(el);
    gsap.set(el, { opacity: 0 });
    return { el, text: s.text, typed: el.querySelector('.typed') };
  });
}

/* ---- timeline helpers (all tweens, so the scene reverses cleanly) ---- */
function lightLetter(tl, letters, i, at, until) {
  const el = letters[i];
  tl.to(el, { opacity: LETTER_OPACITY, scale: 1, ease: 'power2.out', duration: 0.4 }, at);
  if (until > at + 0.4) tl.to(el, { opacity: 0, scale: 0.94, ease: 'power2.in', duration: 0.3 }, until - 0.3);
}

function typeLine(tl, line, at) {
  const p = { n: 0 };
  tl.to(line.el, { opacity: 1, duration: 0.05 }, at);
  tl.to(p, {
    n: line.text.length, duration: 0.45, ease: 'none', snap: { n: 1 },
    onUpdate: () => { line.typed.textContent = line.text.slice(0, p.n); },
  }, at);
}

/* ---- fake light: each face darkens as it turns away from the viewer ---- */
const RAD = Math.PI / 180;
function rotX(v, a) { const c = Math.cos(a * RAD), s = Math.sin(a * RAD); return [v[0], c * v[1] - s * v[2], s * v[1] + c * v[2]]; }
function rotY(v, a) { const c = Math.cos(a * RAD), s = Math.sin(a * RAD); return [c * v[0] + s * v[2], v[1], -s * v[0] + c * v[2]]; }
function shadeFaces(faces, cx, cy) {
  faces.forEach((f) => {
    const n = rotX(rotY([0, 0, 1], f.r.ry), f.r.rx);   // face normal in cube space (rotateX then rotateY)
    const w = rotX(rotY(n, cy), cx);                     // cube transform: rotateX then rotateY
    const facing = Math.max(0, w[2]);
    f.el.style.setProperty('--shade', ((1 - facing) * 0.6).toFixed(3));
  });
}

/* UNLEESH — NX §5 keyword tunnel: one pinned ~5000px scroll-scrubbed sequence.
   Clip-path curtain wipes the section open from the bottom as it arrives; then
   progress 0..1 drives: two sine-wave keyword columns (focused word brightens,
   flips to its bracket gloss and swaps a shared thumbnail), a dot-matrix "U"
   building dot by dot in both bottom corners, a centre focal card (texture ->
   specular sweep -> status captions) and finally a Three.js cube whose faces
   carry project renders. Every value is a function of scroll progress. */
import { reducedMotion } from './core.js';

const LEFT = [
  ['Core-Site', '( THE CORE SITE )'], ['Gen-AI Visual', '( GENERATIVE VISUALS )'],
  ['Motion Flow', '( MOTION SYSTEMS )'], ['WebGL Realm', '( REALTIME 3D )'],
  ['3D Matrix', '( SPATIAL GRIDS )'], ['Interaction', '( MICRO INTERACTIONS )'],
  ['Pixel Perfect', '( PRECISION UI )'], ['Logic Build', '( SYSTEM LOGIC )'],
  ['Fluid UI', '( FLUID INTERFACES )'], ['Aero Design', '( LIGHT FORMS )'],
  ['Pure Code', '( HAND-WRITTEN CODE )'], ['Digital Art', '( DIGITAL ART )'],
];
const RIGHT = [
  ['Strategy', '( DIRECTION )'], ['Design', '( FORM )'], ['Tech', '( ENGINEERING )'],
  ['Creative', '( IDEATION )'], ['Motion', '( KINETICS )'], ['Brand', '( IDENTITY )'],
  ['Future', '( FORESIGHT )'], ['Vision', '( CLARITY )'], ['System', '( STRUCTURE )'],
  ['Labs', '( PROTOTYPES )'], ['Core', '( ESSENCE )'], ['Craft', '( FINISH )'],
];
const THUMBS = ['V40M', 'V41M', 'V42M', 'V43M', 'V44M', 'V45M', 'V46M', 'V47M', 'V48M', 'V49M', 'V40', 'V42'];
const CUBE_FACES = ['V40M', 'V45M', 'V46M', 'V41M', 'V42M', 'V43M'];
const CAPTIONS = [
  'BRAND IDENTITY SYSTEM :: BUILDING',
  'VISUAL SYSTEM :: LOADING',
  'CREATIVE ENERGY :: CONTINUOUSLY OUTPUTTING',
];

const PIN_PX = 5000;
const THUMB_W = 96;
const WAVE_NUM = 12, WAVE_SPD = 1;
const PH = {                 // progress windows
  sweep: [0.16, 0.40],
  caps: [0.36, 0.54],
  cardOut: [0.56, 0.64],
  cubeIn: [0.58, 0.68],
  cubeOut: [0.92, 1.0],
  dots: [0.0, 0.72],
};

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const win = (p, [a, b]) => clamp01((p - a) / (b - a));
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function waveX(index, progress, range) {
  const phase = WAVE_NUM * index + WAVE_SPD * progress * Math.PI * 2 - Math.PI / 2;
  return range.min + ((Math.sin(phase) + 1) / 2) * (range.max - range.min);
}

export function initNxTunnel(root) {
  const section = root.querySelector('[data-nx-tunnel]');
  if (!section) return;
  const mask = section.querySelector('.nxt-mask');
  const colL = section.querySelector('.nxt-col-l');
  const colR = section.querySelector('.nxt-col-r');
  const thumb = section.querySelector('.nxt-thumb');
  const thumbImg = thumb.querySelector('img');
  const card = section.querySelector('.nxt-card');
  const sweep = section.querySelector('.nxc-sweep');
  const capsHost = section.querySelector('.nxc-captions');
  const cubeHost = section.querySelector('.nxt-cube');
  const prog = section.querySelector('.nxt-prog');

  const wordsL = LEFT.map((w) => buildWord(colL, w));
  const wordsR = RIGHT.map((w) => buildWord(colR, w));
  const caps = CAPTIONS.map((t) => {
    const el = document.createElement('div');
    el.className = 'nxc-cap';
    el.innerHTML = `<span>${t}</span><i></i>`;
    capsHost.appendChild(el);
    return el;
  });

  const desktop = window.innerWidth >= 1024 && !reducedMotion;
  if (!desktop) {
    caps.forEach((c) => gsap.set(c, { opacity: 1, y: 0 }));
    gsap.set(card, { clearProps: 'transform' });
    wordsL[0].el.classList.add('is-focused');
    wordsR[0].el.classList.add('is-focused');
    return;
  }

  // GSAP owns the card transform (centre + scale), so CSS carries no translate of its own
  gsap.set(card, { xPercent: -50, yPercent: -50 });

  const rowH = wordsL[0].el.offsetHeight || window.innerHeight * 0.08;
  const n = LEFT.length;
  const colH = rowH * n;
  const range = { min: 0, max: Math.min(window.innerWidth * 0.09, 140) };
  const qx = (els) => els.map((w) => gsap.quickTo(w.el, 'x', { duration: 0.6, ease: 'power4.out' }));
  const qxL = qx(wordsL), qxR = qx(wordsR);
  const thumbX = gsap.quickTo(thumb, 'x', { duration: 0.6, ease: 'power4.out' });
  const thumbY = gsap.quickTo(thumb, 'y', { duration: 0.6, ease: 'power4.out' });

  const dots = [
    buildDots(section.querySelector('.nxt-dots-l'), false),
    buildDots(section.querySelector('.nxt-dots-r'), true),
  ];
  const cube = buildCube(cubeHost);

  const state = { focused: -1, capOn: [false, false, false] };

  const setReveal = (hiddenPct) => {
    const clip = `inset(${hiddenPct.toFixed(3)}% 0 0 0)`;
    mask.style.clipPath = clip;
    mask.style.webkitClipPath = clip;
  };

  function render(p) {
    prog.textContent = String(Math.round(p * 100)).padStart(3, '0');

    // wave columns: the stack scrolls so word 0 is centred at p=0 and word n-1 at p=1
    const y = -rowH / 2 - p * (colH - rowH);
    gsap.set([colL, colR], { y });
    wordsL.forEach((w, i) => qxL[i](waveX(i, p, range)));
    wordsR.forEach((w, i) => qxR[i](-waveX(i, p, range)));

    const idx = Math.round(p * (n - 1));
    if (idx !== state.focused) {
      wordsL.forEach((w, i) => w.el.classList.toggle('is-focused', i === idx));
      wordsR.forEach((w, i) => w.el.classList.toggle('is-focused', i === idx));
      thumbImg.src = `assets/img/${THUMBS[idx % THUMBS.length]}.webp`;
      state.focused = idx;
    }
    // shared thumbnail rides beside the focused right word, never under the card / cube
    const wordRect = wordsR[idx].el.getBoundingClientRect();
    const centreRight = window.innerWidth / 2 + Math.min(window.innerWidth * 0.15, 200) + 16;
    const left = Math.max(centreRight, wordRect.left - THUMB_W - 20);
    thumbX(left + THUMB_W / 2 - window.innerWidth / 2);
    thumbY(wordRect.top + wordRect.height / 2 - window.innerHeight / 2);
    gsap.set(thumb, { opacity: p > 0.02 && p < 0.9 ? 1 : 0 });

    // dot-matrix logo build
    const df = win(p, PH.dots);
    dots.forEach((d) => d.draw(df));

    // focal card: texture -> sweep -> captions -> hands over to the cube
    const sw = win(p, PH.sweep);
    sweep.style.transform = `translateX(${(-70 + 140 * sw).toFixed(2)}%)`;
    caps.forEach((c, i) => {
      const on = p > PH.caps[0] + i * ((PH.caps[1] - PH.caps[0]) / 3) && p < PH.cardOut[1];
      if (on !== state.capOn[i]) {
        state.capOn[i] = on;
        gsap.to(c, { opacity: on ? 1 : 0, y: on ? 0 : 14, duration: 0.45, ease: 'power3.out', overwrite: true });
      }
    });
    const co = win(p, PH.cardOut);
    gsap.set(card, { opacity: 1 - co, scale: 1 - 0.12 * co });

    // cube: scales in as the card leaves, spins with scroll, rushes past the camera at the end
    const ci = win(p, PH.cubeIn), cx = win(p, PH.cubeOut);
    gsap.set(cubeHost, { opacity: ci * (1 - cx), scale: 0.6 + 0.4 * ci + 1.4 * cx });
    cube.set(Math.sin(p * Math.PI * 2) * 0.45, p * Math.PI * 4);
  }

  // curtain: the section wipes open from the bottom as it scrolls into place
  ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'top top',
    onUpdate: (s) => setReveal(100 * (1 - easeInOutCubic(s.progress))),
  });
  ScrollTrigger.create({
    trigger: section, start: 'top top', end: `+=${PIN_PX}`, pin: true, anticipatePin: 1,
    onUpdate: (s) => render(s.progress),
    onToggle: (s) => cube.setActive(s.isActive),
    onRefresh: () => dots.forEach((d) => d.resize()),
  });
  setReveal(100);
  render(0);
}

/* ---- builders ---- */
function buildWord(col, [word, gloss]) {
  const li = document.createElement('li');
  li.className = 'nxt-word';
  li.innerHTML = `<span class="w-mask"><span class="w-a">${word}</span><span class="w-b">${gloss}</span></span>`;
  col.appendChild(li);
  return { el: li };
}

/* dot-matrix "U": a heavy glyph sampled onto a coarse grid, dots appear
   bottom-up as progress grows (mirrored on the right) */
function buildDots(canvas, mirror) {
  const ctx = canvas.getContext('2d');
  const COLS = 26;
  let dots = [], W = 0, H = 0, cell = 0, dpr = 1, last = -1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = W / COLS;
    const rows = Math.floor(H / cell);
    const off = document.createElement('canvas');
    off.width = COLS; off.height = rows;
    const o = off.getContext('2d');
    o.fillStyle = '#fff';
    o.font = `800 ${Math.round(rows * 1.02)}px Archivo, sans-serif`;
    o.textAlign = 'center'; o.textBaseline = 'alphabetic';
    o.fillText('U', COLS / 2, rows * 0.98);
    const px = o.getImageData(0, 0, COLS, rows).data;
    dots = [];
    for (let r = rows - 1; r >= 0; r--) {
      for (let c = 0; c < COLS; c++) {
        if (px[(r * COLS + c) * 4 + 3] > 110) dots.push([c, r]);
      }
    }
    last = -1;
  }

  function draw(frac) {
    const count = Math.floor(frac * dots.length);
    if (count === last) return;
    last = count;
    ctx.clearRect(0, 0, W, H);
    const rad = cell * 0.3;
    for (let i = 0; i < count; i++) {
      const [c, r] = dots[i];
      const x = mirror ? W - (c + 0.5) * cell : (c + 0.5) * cell;
      const y = (r + 0.5) * cell;
      const tail = i > count - 12;
      ctx.fillStyle = tail ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.72)';
      ctx.beginPath();
      ctx.arc(x, y, tail ? rad * 1.25 : rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { resize(); draw(Math.max(0, last) / Math.max(1, dots.length)); });
  return { draw, resize };
}

/* Three.js cube, one project render per face, rendered only while the tunnel is pinned */
function buildCube(host) {
  const noop = { set() {}, setActive() {} };
  if (!window.THREE) return noop;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    console.warn('nx cube: WebGL unavailable', e);
    return noop;
  }
  const size = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.6);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(size, size);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 5.6);

  const loader = new THREE.TextureLoader();
  const mats = CUBE_FACES.map((f) => {
    const tex = loader.load(`assets/img/${f}.webp?v=2`);
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    return new THREE.MeshBasicMaterial({ map: tex });
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), mats);
  scene.add(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }),
  );
  mesh.add(edges);

  const state = { rx: 0, ry: 0, active: false };
  gsap.ticker.add((t) => {
    if (!state.active) return;
    mesh.rotation.x = state.rx + Math.sin(t * 0.35) * 0.06;
    mesh.rotation.y = state.ry + t * 0.18;
    renderer.render(scene, camera);
  });
  return {
    set(rx, ry) { state.rx = rx; state.ry = ry; },
    setActive(v) { state.active = v; if (v) renderer.render(scene, camera); },
  };
}

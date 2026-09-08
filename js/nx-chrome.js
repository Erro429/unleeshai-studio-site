/* UNLEESH — NX global additions (brief §2, §3, §8, §9, §10, §11), layered on
   top of the approved chrome without changing any of it:
   - hero master timeline of masked slide-up reveals for every hero group
   - loader: crossfading thumbnail swatch, two-panel hairline curtain, blur dissolve
   - menu: CSS-toggled flanking previews per row, gold hover, HOME previewed at rest
   - pixel-grid page transition (9 x 17) blooming over the existing wipe
   - canvas film grain (10 baked frames, 25fps, 12fps while scrolling)
   - footer: embossed wordmark */
import { reducedMotion, lenis } from './core.js';

const MENU_PREVIEWS = [['V07', 'V08'], ['V09', 'V10'], ['V11', 'V12'], ['V13', 'V14'], ['V15', 'V16']];
const SWATCH_IMGS = ['V40M', 'V42M', 'V45M', 'V46M'];
const GRID = [9, 17];

export function initNxChrome() {
  if (window.__nxChrome) return;
  window.__nxChrome = true;
  if (window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);
  if (lenis) window._lenis = lenis;

  initLoaderAdditions();
  initMenuPreviews();
  initPixelGrid();
  initGrainCanvas();
}

/* per-page (called after every page init) */
export function decorateHome() {
  if (document.body.dataset.page !== 'home') return;
  initHeroReveals();
  decorateFooter();
}

/* ---------------- §3 hero master timeline ---------------- */
function maskInside(el) {
  el.classList.add('nx-rv');
  const inner = document.createElement('div');
  inner.className = 'nx-rv-in';
  while (el.firstChild) inner.appendChild(el.firstChild);
  el.appendChild(inner);
  gsap.set(inner, { yPercent: 110 });
  return inner;
}
function maskOutside(el) {
  const mask = document.createElement('span');
  mask.className = 'nx-rv';
  mask.style.display = 'inline-block';
  el.parentNode.insertBefore(mask, el);
  mask.appendChild(el);
  gsap.set(el, { yPercent: 110 });
  return el;
}

function initHeroReveals() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.dataset.nxHero || reducedMotion) return;
  hero.dataset.nxHero = '1';

  const q = (s) => [...hero.querySelectorAll(s)];
  const rvTag = q('.hx-tagline').map(maskInside);
  const rvSvcLi = q('.hx-lists li').map(maskInside);
  const rvGrid = [...q('.hx-nav a'), ...q('.hx-chips span')].map(maskOutside);
  const rvFooter = [...q('.hx-contact > *'), ...q('.hx-social a')].map(maskOutside);
  const cluster = hero.querySelector('.hx-cluster');
  const navWrap = hero.querySelector('.hx-nav-wrap');
  let hairline = null;
  if (navWrap) {
    hairline = document.createElement('div');
    hairline.className = 'nx-hairline';
    const nav = navWrap.querySelector('.hx-nav');
    nav ? nav.after(hairline) : navWrap.appendChild(hairline);
    gsap.set(hairline, { scaleX: 0 });
  }
  if (cluster) gsap.set(cluster, { autoAlpha: 0, y: 24 });

  const heroTl = gsap.timeline({ paused: true });
  heroTl
    .to(rvTag, { yPercent: 0, duration: 0.75, ease: 'power3.out' }, 0.5)
    .to(rvSvcLi, { yPercent: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out' }, 0.75)
    .to(rvGrid, { yPercent: 0, duration: 0.42, stagger: 0.05, ease: 'power3.out' }, 0.35)
    .to(rvFooter, { yPercent: 0, duration: 0.25, stagger: 0.03, ease: 'power3.out' }, 0.3);
  if (hairline) heroTl.to(hairline, { scaleX: 1, duration: 0.9, ease: 'power3.out' }, 0.6);
  if (cluster) heroTl.to(cluster, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'y' }, 0.7);

  const play = () => heroTl.play();
  if (document.body.classList.contains('pl-done')) play();
  else document.addEventListener('preloader:done', play, { once: true });
}

/* ---------------- §2 loader additions ---------------- */
function initLoaderAdditions() {
  document.addEventListener('preloader:mounted', (e) => {
    const pl = e.detail;
    if (!pl || reducedMotion) return;

    // thumbnail swatch between the video letter and S, crossfading while assets load
    const videoLetter = pl.querySelector('.pl-letter.is-video');
    if (videoLetter) {
      const sw = document.createElement('span');
      sw.className = 'nx-swatch';
      sw.innerHTML = SWATCH_IMGS.map((v) => `<img src="assets/img/${v}.webp?v=2" alt="">`).join('');
      videoLetter.after(sw);
      const imgs = sw.querySelectorAll('img');
      const cycle = gsap.timeline({ repeat: -1 });
      imgs.forEach((img, i) => {
        cycle.to(img, { opacity: 1, duration: 0.25, ease: 'power1.out' }, i * 0.55)
          .to(img, { opacity: 0, duration: 0.25, ease: 'power1.in' }, i * 0.55 + 0.4);
      });
    }

    // two-panel curtain: hairline edges sweep in from top and bottom, meet, dissolve
    const curtain = document.createElement('div');
    curtain.className = 'nx-curtain';
    document.body.appendChild(curtain);
    gsap.timeline({ onComplete: () => curtain.remove() })
      .fromTo(curtain, { '--pt-top': '-102%', '--pt-bottom': '102%' },
        { '--pt-top': '0%', '--pt-bottom': '0%', duration: 0.7, ease: 'power3.inOut' })
      .to(curtain, { opacity: 0, duration: 0.45, ease: 'power2.out' }, '+=0.1');

    // hero starts blurred and desaturated behind the loader, sharpens as it lifts
    const main = document.querySelector('main');
    if (main) {
      gsap.set(main, { filter: 'blur(14px) saturate(0.4)' });
      document.addEventListener('preloader:done', () => {
        gsap.to(main, { filter: 'blur(0px) saturate(1)', duration: 0.6, ease: 'power2.out', clearProps: 'filter' });
      }, { once: true });
    }
  });
}

/* ---------------- §9 menu additions ---------------- */
function initMenuPreviews() {
  const nav = document.querySelector('.menu-nav');
  if (!nav) return;
  const items = [...nav.querySelectorAll('li')];
  items.forEach((li, i) => {
    const [a, b] = MENU_PREVIEWS[i % MENU_PREVIEWS.length];
    li.insertAdjacentHTML('beforeend',
      `<span class="nx-mp nx-mp-a" aria-hidden="true"><img src="assets/img/${a}.webp?v=2" alt=""></span>
       <span class="nx-mp nx-mp-b" aria-hidden="true"><img src="assets/img/${b}.webp?v=2" alt=""></span>`);
    li.addEventListener('mouseenter', () => {
      items.forEach((o) => o.classList.toggle('is-previewed', o === li));
    });
  });
  const rest = () => items.forEach((o, i) => o.classList.toggle('is-previewed', i === 0));
  nav.addEventListener('mouseleave', rest);
  rest();
}

/* ---------------- §10 pixel-grid transition ---------------- */
function initPixelGrid() {
  const layer = document.createElement('div');
  layer.className = 'nx-pixels';
  layer.setAttribute('aria-hidden', 'true');
  const cells = [];
  for (let i = 0; i < GRID[0] * GRID[1]; i++) {
    const c = document.createElement('i');
    layer.appendChild(c);
    cells.push(c);
  }
  document.body.appendChild(layer);

  let clearTimer = null;
  const clear = () => {
    clearTimeout(clearTimer);
    gsap.killTweensOf(cells);
    gsap.set(cells, { scale: 0, opacity: 0 });
    layer.classList.remove('is-on');
  };
  const arm = (ms) => { clearTimeout(clearTimer); clearTimer = setTimeout(clear, ms); };

  document.addEventListener('transition:leave', () => {
    if (reducedMotion) return;
    layer.classList.add('is-on');
    gsap.fromTo(cells,
      { scale: 0, opacity: 0, transformOrigin: '50% 50%' },
      { scale: 1.03, opacity: 1, duration: 0.28, ease: 'power1.in', stagger: { grid: GRID, from: 'center', each: 0.022 } });
    arm(2400);
  });
  document.addEventListener('transition:enter', () => {
    if (!layer.classList.contains('is-on')) return;
    gsap.to(cells, {
      scale: 0, opacity: 0, duration: 0.3, ease: 'power1',
      stagger: { grid: GRID, from: 'center', each: 0.022 },
      onComplete: clear,
    });
    arm(1600);
  });
  window.addEventListener('pageshow', () => { if (layer.classList.contains('is-on')) arm(1600); });
}

/* ---------------- §11 canvas film grain ---------------- */
function initGrainCanvas() {
  if (reducedMotion || window.innerWidth <= 768) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'nx-grain';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  const SCALE = 0.5;          // bake at half resolution; the grain is upscaled by CSS
  let frames = [];

  const bake = () => {
    canvas.width = Math.max(1, Math.round(window.innerWidth * SCALE));
    canvas.height = Math.max(1, Math.round(window.innerHeight * SCALE));
    frames = Array.from({ length: 10 }, () => generateNoise(canvas.width, canvas.height, 0.7));
  };
  const generateNoise = (w, h, intensity) => {
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = (255 * intensity) | 0;
    }
    return img;
  };
  bake();
  let resizeT = null;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(bake, 200); });

  let fps = 25, frameIndex = 0, restoreTimer = null;
  const draw = () => {
    if (frames.length) ctx.putImageData(frames[frameIndex++ % frames.length], 0, 0);
    setTimeout(() => requestAnimationFrame(draw), 1000 / fps);
  };
  draw();
  const calm = () => {
    fps = 12;
    clearTimeout(restoreTimer);
    restoreTimer = setTimeout(() => { fps = 25; }, 180);
  };
  if (lenis) lenis.on('scroll', calm);
  else window.addEventListener('scroll', calm, { passive: true });
}

/* ---------------- §8 footer additions ---------------- */
function decorateFooter() {
  const footer = document.querySelector('.site-footer');
  if (!footer || footer.dataset.nxFooter) return;
  footer.dataset.nxFooter = '1';
  footer.querySelector('.fp-word')?.classList.add('nx-emboss');
}

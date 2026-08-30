/* UNLEESH — motion core: Lenis + GSAP wiring, shared primitives */
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export let lenis = null;

export function initSmoothScroll() {
  if (reducedMotion || !window.Lenis) return null;
  lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopScroll() { lenis ? lenis.stop() : (document.documentElement.style.overflow = 'hidden'); }
export function startScroll() { lenis ? lenis.start() : (document.documentElement.style.overflow = ''); }

/* ---------- text splitting (self-contained, no SplitText dependency) ---------- */
export function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  const chars = [];
  for (const ch of text) {
    const mask = document.createElement('span');
    mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;';
    const inner = document.createElement('span');
    inner.style.display = 'inline-block';
    inner.textContent = ch === ' ' ? ' ' : ch;
    mask.appendChild(inner);
    el.appendChild(mask);
    chars.push(inner);
  }
  return chars;
}

export function splitLines(el) {
  // explicit <br> breaks win: each segment becomes one masked line
  const brSegs = el.innerHTML.split(/<br\s*\/?>/i);
  if (brSegs.length > 1) {
    el.innerHTML = '';
    return brSegs.map((seg) => {
      const mask = document.createElement('span');
      mask.className = 'reveal-line-mask';
      const inner = document.createElement('span');
      inner.style.display = 'block';
      inner.innerHTML = seg.trim();
      mask.appendChild(inner);
      el.appendChild(mask);
      return inner;
    });
  }
  // otherwise wrap words, measure line breaks, regroup into masked lines
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  const spans = words.map((w) => {
    const s = document.createElement('span');
    s.style.display = 'inline-block';
    s.textContent = w;
    el.appendChild(s);
    el.appendChild(document.createTextNode(' '));
    return s;
  });
  const lines = [];
  let currentTop = null;
  let current = [];
  spans.forEach((s) => {
    const top = s.offsetTop;
    if (currentTop === null || Math.abs(top - currentTop) < 3) {
      current.push(s); currentTop = currentTop === null ? top : currentTop;
    } else {
      lines.push(current); current = [s]; currentTop = top;
    }
  });
  if (current.length) lines.push(current);
  el.textContent = '';
  return lines.map((ws) => {
    const mask = document.createElement('span');
    mask.className = 'reveal-line-mask';
    const inner = document.createElement('span');
    inner.style.display = 'block';
    inner.textContent = ws.map((w) => w.textContent).join(' ');
    mask.appendChild(inner);
    el.appendChild(mask);
    return inner;
  });
}

/* ---------- reveal primitives ---------- */
export function revealLines(el, opts = {}) {
  if (reducedMotion) return;
  const lines = splitLines(el);
  gsap.fromTo(lines,
    { yPercent: 130, rotate: 2 },
    {
      yPercent: 0, rotate: 0, duration: 0.8, ease: 'expo.out', stagger: 0.09,
      scrollTrigger: { trigger: el, start: opts.start || 'top 85%', once: true },
      ...opts.tween,
    });
}

export function revealImg(el) {
  if (reducedMotion) return;
  const media = el.querySelector('img, video');
  gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
  if (media) gsap.set(media, { scale: 1.2 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out' });
  if (media) tl.to(media, { scale: 1, duration: 1.2, ease: 'expo.out' }, 0);
}

export function initReveals(scope = document) {
  scope.querySelectorAll('[data-reveal-lines]').forEach((el) => revealLines(el));
  scope.querySelectorAll('.reveal-img').forEach((el) => revealImg(el));
}

/* ---------- roll hover: duplicate content for the up-roll ---------- */
export function makeRoll(el) {
  if (el.querySelector('.roll-inner')) return;
  const html = el.innerHTML;
  el.classList.add('roll');
  el.innerHTML = `<span class="roll-inner"><span>${html}</span><span>${html}</span></span>`;
}
export function initRolls(scope = document) {
  scope.querySelectorAll('[data-roll]').forEach(makeRoll);
}

/* ---------- counters ---------- */
export function initCounters(scope = document) {
  scope.querySelectorAll('.count').forEach((el) => {
    const target = parseFloat(el.dataset.target ?? el.textContent);
    const suffix = el.dataset.suffix || '';
    if (reducedMotion) { el.textContent = target + suffix; return; }
    const obj = { v: 0 };
    el.textContent = '0' + suffix;
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      snap: { v: 1 },
      onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

/* ---------- typewriter status lines ---------- */
export function typeStatus(el) {
  const text = el.dataset.text || el.textContent.trim();
  el.innerHTML = '<span class="typed"></span><span class="cursor">█</span>';
  const typed = el.querySelector('.typed');
  if (reducedMotion) { typed.textContent = text; return; }
  let i = 0;
  const tick = () => {
    if (i <= text.length) { typed.textContent = text.slice(0, i); i++; setTimeout(tick, 45); }
  };
  tick();
}
export function initStatus(scope = document) {
  scope.querySelectorAll('.status[data-text]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => typeStatus(el),
    });
  });
}

/* ---------- pixel-dot cursor trail (reference pattern):
   uniform dot-matrix pixels dropped along the pointer's path, fading where
   they landed; a circle appears ONLY over links/buttons (pill when labeled) */
export function initCursorDot() {
  if (reducedMotion || matchMedia('(pointer: coarse)').matches) return;

  const N = 128;       // dot pool
  const SIZE = 5;      // uniform pixel size
  const GRID = 7;      // drops snap to a coarse grid → dot-matrix feel
  const STEP = 2;      // min travel (px) between drops

  const pool = [];
  for (let i = 0; i < N; i++) {
    const d = document.createElement('div');
    d.className = 'px-dot';
    d.style.width = d.style.height = SIZE + 'px';
    document.body.appendChild(d);
    pool.push(d);
  }
  let poolIdx = 0;
  let lastX = -100, lastY = -100;

  document.addEventListener('mousemove', (e) => {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (dx * dx + dy * dy < STEP * STEP) return;
    lastX = e.clientX; lastY = e.clientY;
    const d = pool[poolIdx];
    poolIdx = (poolIdx + 1) % N;
    const gx = Math.round(e.clientX / GRID) * GRID - SIZE / 2;
    const gy = Math.round(e.clientY / GRID) * GRID - SIZE / 2;
    d.style.transform = `translate(${gx}px, ${gy}px)`;
    gsap.fromTo(d, { opacity: 1 }, { opacity: 0, duration: 0.75, ease: 'power1.out', overwrite: true });
  });

  // hover orb: only exists over interactive elements; expands to a pill when labeled
  const orb = document.createElement('div');
  orb.className = 'cursor-orb';
  const label = document.createElement('span');
  label.className = 'trail-label';
  orb.appendChild(label);
  document.body.appendChild(orb);
  const ox = gsap.quickTo(orb, 'x', { duration: 0.3, ease: 'power3' });
  const oy = gsap.quickTo(orb, 'y', { duration: 0.3, ease: 'power3' });
  document.addEventListener('mousemove', (e) => { ox(e.clientX); oy(e.clientY); });

  const HOVER = 'a, button, input, select, textarea, [data-cursor-dot], .hx-thumb, .work-card, .work-card2, .lab-card, .lc-media, .back-top';

  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest(HOVER);
    document.body.classList.toggle('cursor-hot', !!t);
    label.textContent = (t && t.dataset.cursorLabel) || 'EXPLORE';
  });
}

/* ---------- header hide/show ---------- */
export function initHeaderHide() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let last = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      if (y > 120 && y > last) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
      header.classList.toggle('is-solid', y > 60);
      last = y;
    },
  });
}

/* ---------- back to top + scroll indicator ---------- */
export function initBackTop() {
  const btn = document.querySelector('.back-top');
  if (!btn) return;
  ScrollTrigger.create({
    start: () => window.innerHeight, end: 'max',
    onToggle: (self) => btn.classList.toggle('is-visible', self.isActive),
  });
  btn.addEventListener('click', () => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })));
}

export function initScrollInd() {
  document.querySelectorAll('.scroll-ind').forEach((el) => {
    const arrow = el.querySelector('svg');
    if (!reducedMotion && arrow) {
      gsap.to(arrow, { y: 8, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
    ScrollTrigger.create({
      start: 100, end: 'max',
      onToggle: (self) => gsap.to(el, { opacity: self.isActive ? 0 : 1, duration: 0.3 }),
    });
  });
}

/* ---------- top scroll progress bar ---------- */
export function initProgressBar() {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  document.body.appendChild(bar);
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => { bar.style.width = (self.progress * 100).toFixed(2) + '%'; },
  });
}

/* ---------- film grain overlay ---------- */
export function initGrain() {
  const g = document.createElement('div');
  g.className = 'grain';
  document.body.appendChild(g);
}

/* ---------- session flag for short preloader ---------- */
export function seenPreloader() {
  try { return sessionStorage.getItem('unleesh-seen') === '1'; } catch { return false; }
}
export function markPreloaderSeen() {
  try { sessionStorage.setItem('unleesh-seen', '1'); } catch { /* private mode */ }
}


/* ---------- per-character display reveal (STUDIO / DIGITAL / THE SECTORS) ---------- */
export function revealChars(el, opts = {}) {
  if (reducedMotion || !el || el.dataset.charsDone) return;
  el.dataset.charsDone = '1';
  const chars = splitChars(el);
  gsap.from(chars, {
    yPercent: 115, duration: 0.9, ease: 'expo.out',
    stagger: opts.stagger ?? 0.035, delay: opts.delay ?? 0,
    ...(opts.trigger ? { scrollTrigger: { trigger: opts.trigger, start: 'top 80%', once: true } } : {}),
  });
}

/* ---------- magnetic buttons: lean toward the pointer, snap back elastic ---------- */
export function initMagnetic(selector) {
  if (reducedMotion || matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll(selector).forEach((el) => {
    if (el.dataset.magnetic) return;
    el.dataset.magnetic = '1';
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)', overwrite: true });
    });
  });
}

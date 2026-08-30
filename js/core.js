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

/* ---------- cursor dot trail (reference pattern: chasing dots, head reacts
   to anything interactive) ---------- */
export function initCursorDot() {
  if (reducedMotion || matchMedia('(pointer: coarse)').matches) return;
  const N = 16;
  const dots = [];
  for (let i = 0; i < N; i++) {
    const d = document.createElement('div');
    d.className = 'trail-dot' + (i === 0 ? ' trail-head' : '');
    const s = Math.max(2.5, 7 - i * 0.3);
    d.style.width = d.style.height = s + 'px';
    d.style.opacity = String(1 - i / (N + 4));
    document.body.appendChild(d);
    dots.push({ el: d, x: innerWidth / 2, y: innerHeight / 2, s });
  }

  let tx = innerWidth / 2, ty = innerHeight / 2, seen = false;
  let hot = false, headScale = 1;

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!seen) { seen = true; dots.forEach((d) => { d.x = tx; d.y = ty; }); }
  });

  // pill label targets: cursor becomes a white chip with contextual text
  const label = document.createElement('span');
  label.className = 'trail-label';
  dots[0].el.appendChild(label);

  const LABELED = '[data-cursor-label], .hero-prev, .hero-next, .hx-thumb, .work-card, .work-card2, .lab-card, .lc-media, a[href^="mailto:"], .cf-submit, .back-top, .f-social a, .hx-social a, .pj-pager a';
  const HOVER = 'a, button, input, select, textarea, [data-cursor-dot]';

  const labelFor = (el) => {
    if (el.dataset.cursorLabel) return el.dataset.cursorLabel;
    if (el.matches('.hero-prev')) return 'PREV';
    if (el.matches('.hero-next')) return 'NEXT';
    if (el.matches('.hx-thumb')) return 'PLAY';
    if (el.matches('a[href^="mailto:"]')) return 'HELLO';
    if (el.matches('.cf-submit')) return 'SEND';
    if (el.matches('.back-top')) return 'TOP';
    if (el.matches('.f-social a, .hx-social a')) return 'FOLLOW';
    return 'VIEW';
  };

  let labeled = false;
  document.addEventListener('mouseover', (e) => {
    const lab = e.target.closest(LABELED);
    labeled = !!lab;
    if (lab) label.textContent = labelFor(lab);
    hot = labeled || !!e.target.closest(HOVER);
    document.body.classList.toggle('cursor-hot', hot);
    document.body.classList.toggle('cursor-label', labeled);
  });

  gsap.ticker.add(() => {
    // each dot chases the one ahead of it; the head chases the pointer
    let px = tx, py = ty;
    headScale += (((hot && !labeled) ? 3.2 : 1) - headScale) * 0.18;
    dots.forEach((d, i) => {
      d.x += (px - d.x) * 0.42;
      d.y += (py - d.y) * 0.42;
      const sc = i === 0 ? headScale : 1;
      d.el.style.transform =
        `translate(${(d.x - d.s / 2).toFixed(1)}px, ${(d.y - d.s / 2).toFixed(1)}px) scale(${sc.toFixed(2)})`;
      px = d.x; py = d.y;
    });
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

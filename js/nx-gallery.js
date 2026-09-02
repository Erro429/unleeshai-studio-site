/* UNLEESH — NX §7 gallery continuation: masked word / line reveals
   (data-reveal="word|line", once on enter), the desktop-only Flip + scramble
   content morph, case-study tiles with clip reveals, and the footer-preview
   strip of three small-caps meta columns. */
import { reducedMotion } from './core.js';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function initNxGallery(root) {
  const section = root.querySelector('[data-nx-gallery]');
  if (!section) return;
  initWordReveals(section);
  initTiles(section);
  initMorph(section);
}

/* ---- data-reveal: every word (or <br>-separated line) in its own clip mask ---- */
function initWordReveals(scope) {
  const els = [...scope.querySelectorAll('[data-reveal]')];
  els.forEach((el) => {
    const mode = el.dataset.reveal === 'line' ? 'line' : 'word';
    const parts = mode === 'line'
      ? el.innerHTML.split(/<br\s*\/?>/i).map((s) => s.trim())
      : el.textContent.trim().split(/\s+/);
    el.innerHTML = '';
    parts.forEach((p, i) => {
      const wrap = document.createElement('span');
      wrap.className = 'rv-w';
      if (mode === 'line') wrap.style.display = 'block';
      const inner = document.createElement('span');
      inner.innerHTML = p + (mode === 'word' && i < parts.length - 1 ? ' ' : '');
      inner.style.transition = `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${(i * 0.035).toFixed(3)}s`;
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
  });
  if (reducedMotion) { els.forEach((el) => el.classList.add('is-revealed')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-revealed'); io.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  els.forEach((el) => io.observe(el));
}

/* ---- tiles: clip-open from the bottom edge, once ---- */
function initTiles(scope) {
  scope.querySelectorAll('.nxg-media').forEach((m) => {
    if (reducedMotion) return;
    gsap.set(m, { clipPath: 'inset(100% 0 0 0)' });
    gsap.to(m, {
      clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: m, start: 'top 85%', once: true },
    });
  });
}

/* ---- Flip + scramble (desktop only): the statement scrambles into place on
   enter / enterBack and FLIP-morphs between two layout states as you scroll past ---- */
function initMorph(scope) {
  const wrap = scope.querySelector('.nxg-morph');
  const el = wrap && wrap.querySelector('.nxg-morph-text');
  const side = wrap && wrap.querySelector('.nxg-morph-side');
  if (!wrap || !el) return;
  const target = el.dataset.text || el.textContent.trim();
  el.dataset.text = target;
  if (reducedMotion || window.innerWidth < 1024) { el.textContent = target; return; }

  const hasPlugin = !!(window.ScrambleTextPlugin && gsap.plugins && gsap.plugins.scrambleText);
  let token = 0;
  const scrambleIn = () => {
    if (hasPlugin) {
      gsap.fromTo(el,
        { scrambleText: { text: '', chars: 'upperAndLowerCase' } },
        { scrambleText: { text: target, chars: 'upperAndLowerCase' }, duration: 1, overwrite: true });
      return;
    }
    // fallback: hand-rolled resolve, left to right
    const my = ++token;
    const frames = 30;
    let f = 0;
    const tick = () => {
      if (my !== token) return;
      const solved = Math.floor((f / frames) * target.length);
      el.textContent = [...target].map((ch, k) => (k < solved || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (f++ < frames) requestAnimationFrame(tick); else el.textContent = target;
    };
    tick();
  };
  ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onEnter: scrambleIn, onEnterBack: scrambleIn });

  if (!window.Flip) return;
  const targets = side ? [el, side] : [el];
  const state = Flip.getState(targets);
  wrap.classList.toggle('alt-position');
  const anim = Flip.to(state, { ease: 'expo.inOut', duration: 1, paused: true });
  ScrollTrigger.create({
    animation: anim, trigger: wrap, start: 'bottom bottom-=10%', end: 'center center', scrub: true,
  });
}

/* UNLEESH — shared internal-page motion: sticky hero choreography, body seams,
   cursor previews, accordion, parallax bands, live clock. Every page module
   calls initInner() first, then adds its own pieces. */
import { reducedMotion, revealChars, lenis } from './core.js';

export function initInner() {
  initHero();
  initSeams();
  initBands();
  initAccordion();
  initClock();
}

/* ---------- hero: masthead chars, plate parallax, dissolve as the body covers it ---------- */
function initHero() {
  const hero = document.querySelector('.in-hero');
  if (!hero) return;
  const words = hero.querySelectorAll('.in-word');
  const mastReveal = () => words.forEach((w, i) => revealChars(w, { delay: i * 0.15 }));
  if (document.body.classList.contains('pl-done')) mastReveal();
  else document.addEventListener('preloader:done', mastReveal, { once: true });

  if (reducedMotion) return;

  const ui = hero.querySelector('.in-ui');
  const plate = hero.querySelector('.in-plate');
  const rest = [...hero.querySelectorAll('.in-lists li, .in-mid > *, .in-bottom > *, .in-mark > *, .pj-top > *, .ar-top > *')];
  gsap.set(rest, { y: 24, opacity: 0 });
  const enter = () => {
    gsap.to(rest, { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'power3.out', delay: 0.35, clearProps: 'transform' });
    releaseHeroTriggers(hero);
  };
  if (document.body.classList.contains('pl-done')) enter();
  else document.addEventListener('preloader:done', enter, { once: true });

  // body slides over: plate settles back, ui thins out
  const body = document.querySelector('.in-body');
  if (!body) return;
  const st = { trigger: body, start: 'top bottom', end: 'top top', scrub: true };
  if (plate) gsap.fromTo(plate, { scale: 1.06, y: 0 }, { scale: 1, y: -60, ease: 'none', scrollTrigger: st });
  if (ui) gsap.to(ui, { opacity: 0.15, y: -40, ease: 'none', scrollTrigger: st });

  // pointer drift on the plate (desktop only)
  if (plate && !matchMedia('(pointer: coarse)').matches) {
    const xTo = gsap.quickTo(plate, 'xPercent', { duration: 1.2, ease: 'power3' });
    const yTo = gsap.quickTo(plate, 'yPercent', { duration: 1.2, ease: 'power3' });
    hero.addEventListener('mousemove', (e) => {
      xTo((e.clientX / innerWidth - 0.5) * -1.6);
      yTo((e.clientY / innerHeight - 0.5) * -1.2);
    });
  }
}

/* Reveals and counters inside the hero are wired to scroll triggers that start
   at 85% of the viewport; the lower hero never crosses that line at load.
   Once the curtain lifts, play those animations and retire their triggers. */
function releaseHeroTriggers(hero) {
  ScrollTrigger.getAll().forEach((st) => {
    const el = st.trigger;
    if (!el || el.nodeType !== 1 || !hero.contains(el) || !st.animation) return;
    if (st.vars.scrub || st.vars.pin) return;
    st.animation.play();
    st.kill(false, true);   // retire the trigger, keep the animation alive
  });
}

/* ---------- seams: each body section eases in as it enters ---------- */
function initSeams() {
  const body = document.querySelector('.in-body');
  if (!body || reducedMotion) return;
  [...body.children].forEach((sec) => {
    const el = sec.classList.contains('pin-spacer') ? sec.firstElementChild : sec;
    if (!el || el.dataset.seam || el.classList.contains('in-strip')) return;
    el.dataset.seam = '1';
    gsap.fromTo(el, { opacity: 0.001, y: 32 }, {
      opacity: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 62%', scrub: true },
    });
  });
}

/* ---------- editorial bands: per-image parallax by data-speed ---------- */
function initBands() {
  if (reducedMotion) return;
  document.querySelectorAll('.in-band figure[data-speed]').forEach((fig) => {
    const s = parseFloat(fig.dataset.speed) || 0;
    gsap.fromTo(fig, { y: s * 120 }, {
      y: s * -120, ease: 'none',
      scrollTrigger: { trigger: fig.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ---------- accordion ---------- */
export function initAccordion(scope = document) {
  const rows = [...scope.querySelectorAll('.acc-row')];
  rows.forEach((row) => {
    if (row.dataset.accInit) return;
    row.dataset.accInit = '1';
    const head = row.querySelector('.acc-head');
    const panel = row.querySelector('.acc-panel');
    head.addEventListener('click', () => {
      const isOpen = row.classList.contains('is-open');
      rows.forEach((r) => {
        if (r !== row && r.classList.contains('is-open')) {
          r.classList.remove('is-open');
          r.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
          gsap.to(r.querySelector('.acc-panel'), { height: 0, duration: 0.6, ease: 'expo.out' });
        }
      });
      row.classList.toggle('is-open', !isOpen);
      head.setAttribute('aria-expanded', String(!isOpen));
      gsap.to(panel, {
        height: isOpen ? 0 : panel.scrollHeight, duration: 0.6, ease: 'expo.out',
        onComplete: () => ScrollTrigger.refresh(),
      });
    });
  });
}

/* ---------- cursor-following preview for row lists ---------- */
export function initRowPreview(rows, imgFor, labelFor) {
  if (!rows.length || matchMedia('(pointer: coarse)').matches) return;
  const pv = document.createElement('div');
  pv.className = 'in-preview';
  pv.innerHTML = '<img alt=""><span class="bracket-label"></span>';
  document.body.appendChild(pv);
  const img = pv.querySelector('img');
  const label = pv.querySelector('.bracket-label');
  const xTo = gsap.quickTo(pv, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(pv, 'y', { duration: 0.5, ease: 'power3' });
  rows.forEach((row, i) => {
    row.addEventListener('mouseenter', () => {
      img.src = `assets/img/${imgFor(row, i)}.webp?v=2`;
      label.textContent = labelFor ? labelFor(row, i) : '';
      gsap.to(pv, { opacity: 1, duration: 0.3 });
    });
    row.addEventListener('mouseleave', () => gsap.to(pv, { opacity: 0, duration: 0.3 }));
    row.addEventListener('mousemove', (e) => { xTo(e.clientX + 28); yTo(e.clientY - 120); });
  });
}

/* ---------- live studio clock (San Francisco) ---------- */
function initClock() {
  const els = document.querySelectorAll('[data-clock]');
  if (!els.length) return;
  const fmt = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Los_Angeles' });
  const tick = () => els.forEach((el) => { el.textContent = fmt.format(new Date()); });
  tick();
  setInterval(tick, 15000);
}

/* ---------- scroll helper for in-hero thumbnails ---------- */
export function scrollToEl(el) {
  const y = el.getBoundingClientRect().top + window.scrollY - 80;
  lenis ? lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: 'smooth' });
}

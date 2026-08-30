/* UNLEESH — home hero: full-viewport video carousel with typographic overlay,
   waveform indicator, filmstrip thumbnails */
import { reducedMotion } from './core.js';

const SLIDES = [
  { title: 'Brand Core', video: 'assets/video/V01.mp4' },
  { title: 'Visual Direction', video: 'assets/video/V71.mp4' },
  { title: 'High-End Skincare', video: 'assets/video/V54.mp4' },
  { title: 'Editorial Systems', video: 'assets/video/V72.mp4' },
  { title: 'Commercial Motion', video: 'assets/video/V53.mp4' },
];

const BAR_COUNT = 72;
const AUTOPLAY_MS = 4500;

export async function initHero(hero) {
  const bgA = hero.querySelector('.hero-bg');
  const titleEl = hero.querySelector('.hero-title .ht-inner');
  const countEl = hero.querySelector('.hero-count');
  const wave = hero.querySelector('.hx-wave');
  const thumbs = [...hero.querySelectorAll('.hx-thumb')];

  // second video element for crossfades
  const bgB = bgA.cloneNode();
  bgB.removeAttribute('src');
  bgA.after(bgB);
  gsap.set(bgB, { opacity: 0 });
  let front = bgA, back = bgB;

  // waveform bars
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const b = document.createElement('i');
    wave.appendChild(b);
    bars.push(b);
  }

  let index = 0;
  let busy = false;
  let timer = null;

  function setWave(i) {
    const center = ((i + 0.5) / SLIDES.length) * BAR_COUNT;
    const sigma = BAR_COUNT / 16;
    bars.forEach((b, k) => {
      const h = 8 + 34 * Math.exp(-((k - center) ** 2) / (2 * sigma * sigma));
      b.style.height = h.toFixed(1) + 'px';
    });
  }

  function setCount(i) {
    countEl.innerHTML = `${String(i + 1).padStart(2, '0')} <em>//</em> ${String(SLIDES.length).padStart(2, '0')}`;
  }

  function setThumbs(i) {
    thumbs.forEach((t, k) => t.classList.toggle('is-active', k === i));
  }

  function swapTitle(i) {
    if (reducedMotion) { titleEl.textContent = SLIDES[i].title; return; }
    gsap.to(titleEl, {
      yPercent: 100, duration: 0.35, ease: 'power2.in',
      onComplete: () => {
        titleEl.textContent = SLIDES[i].title;
        gsap.fromTo(titleEl, { yPercent: -100 }, { yPercent: 0, duration: 0.55, ease: 'expo.out' });
      },
    });
  }

  function swapVideo(i) {
    if (reducedMotion) { front.src = SLIDES[i].video; return; }
    back.src = SLIDES[i].video;
    back.play?.();
    gsap.to(back, { opacity: 0.5, duration: 0.9, ease: 'power2.inOut' });
    gsap.to(front, {
      opacity: 0, duration: 0.9, ease: 'power2.inOut',
      onComplete: () => { [front, back] = [back, front]; back.removeAttribute('src'); },
    });
  }

  function go(to, user = false) {
    if (busy) return;
    const i = ((to % SLIDES.length) + SLIDES.length) % SLIDES.length;
    if (i === index) return;
    busy = true;
    index = i;
    setCount(i); setWave(i); setThumbs(i);
    swapTitle(i);
    swapVideo(i);
    setTimeout(() => { busy = false; }, 950);
    if (user) restartAutoplay();
  }

  function restartAutoplay() {
    clearInterval(timer);
    if (reducedMotion) return;
    timer = setInterval(() => go(index + 1), AUTOPLAY_MS);
  }

  // init state
  setCount(0); setWave(0); setThumbs(0);
  titleEl.textContent = SLIDES[0].title;
  restartAutoplay();

  hero.querySelector('.hero-prev').addEventListener('click', () => go(index - 1, true));
  hero.querySelector('.hero-next').addEventListener('click', () => go(index + 1, true));
  thumbs.forEach((t, k) => t.addEventListener('click', () => go(k, true)));

  document.addEventListener('keydown', (e) => {
    if (document.body.dataset.page !== 'home') return;
    if (e.key === 'ArrowRight') go(index + 1, true);
    if (e.key === 'ArrowLeft') go(index - 1, true);
  });

  // drag / swipe
  let startX = null;
  hero.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  hero.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 60) go(index + (dx < 0 ? 1 : -1), true);
    startX = null;
  });

  // pause autoplay when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else restartAutoplay();
  });

  // subtle pointer parallax on the masthead words
  if (!reducedMotion) {
    const words = hero.querySelectorAll('.hx-word');
    const xTo = [...words].map((w) => gsap.quickTo(w, 'x', { duration: 1, ease: 'power3' }));
    hero.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      xTo.forEach((fn, k) => fn(nx * (k === 0 ? -8 : 8)));
    });
  }
}

/* UNLEESH — home hero: work-scene carousel with glitch transitions,
   cursor parallax, waveform indicator, frosted filmstrip */
import { reducedMotion } from './core.js';

const SLIDES = [
  { title: 'UNLEESH BRAND CORE', type: 'video', src: 'assets/video/V01.mp4' },
  { title: 'LUMEN SKINCARE', type: 'img', src: 'assets/img/V40M.webp' },
  { title: 'WILDER CAMP', type: 'img', src: 'assets/img/V42M.webp' },
  { title: 'PULL NOODLE BAR', type: 'img', src: 'assets/img/V45M.webp' },
  { title: 'AXIOM PRECISION', type: 'img', src: 'assets/img/V46M.webp' },
];

const BAR_COUNT = 84;
const AUTOPLAY_MS = 5000;

function mediaFor(slide) {
  if (slide.type === 'video') {
    const v = document.createElement('video');
    v.src = slide.src;
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    return v;
  }
  const img = document.createElement('img');
  img.src = slide.src;
  img.alt = '';
  return img;
}

export async function initHero(hero) {
  const media = hero.querySelector('.hero-media');
  const layers = [...hero.querySelectorAll('.hero-layer')];
  const titleEl = hero.querySelector('.hero-title .ht-inner');
  const countEl = hero.querySelector('.hero-count');
  const wave = hero.querySelector('.hx-wave');
  const thumbs = [...hero.querySelectorAll('.hx-thumb')];

  let front = layers[0], back = layers[1];
  let index = 0, busy = false, timer = null;

  // preload slide images
  SLIDES.filter((s) => s.type === 'img').forEach((s) => { new Image().src = s.src; });

  // waveform bars
  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const b = document.createElement('i');
    wave.appendChild(b);
    bars.push(b);
  }

  const setWave = (i) => {
    const center = ((i + 0.5) / SLIDES.length) * BAR_COUNT;
    const sigma = BAR_COUNT / 15;
    bars.forEach((b, k) => {
      const h = 8 + 36 * Math.exp(-((k - center) ** 2) / (2 * sigma * sigma));
      b.style.height = h.toFixed(1) + 'px';
    });
  };
  const setCount = (i) => {
    countEl.innerHTML = `${String(i + 1).padStart(2, '0')} <em>//</em> ${String(SLIDES.length).padStart(2, '0')}`;
  };
  const setThumbs = (i) => thumbs.forEach((t, k) => t.classList.toggle('is-active', k === i));

  function swapTitle(i) {
    if (reducedMotion) { titleEl.textContent = SLIDES[i].title; return; }
    gsap.to(titleEl, {
      yPercent: 100, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        titleEl.textContent = SLIDES[i].title;
        gsap.fromTo(titleEl, { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: 'expo.out' });
      },
    });
  }

  /* ---- glitch transition: independent slice bands + jitter + flicker ---- */
  function glitchTo(i) {
    const slide = SLIDES[i];
    back.innerHTML = '';
    const full = mediaFor(slide);
    back.appendChild(full);
    full.play?.();

    if (reducedMotion) {
      back.style.opacity = 1; front.style.opacity = 0;
      [front, back] = [back, front];
      front.classList.add('is-front'); back.classList.remove('is-front');
      back.innerHTML = '';
      busy = false;
      return;
    }

    // build 6 slice bands showing the incoming image through random strips
    const SLICE_N = 6;
    const sliceSrc = slide.type === 'img' ? slide.src : null;
    const slices = [];
    if (sliceSrc) {
      full.style.opacity = 0; // whole frame stays hidden while slices flicker
      for (let s = 0; s < SLICE_N; s++) {
        const d = document.createElement('div');
        d.className = 'glitch-slice';
        d.style.backgroundImage = `url(${sliceSrc})`;
        back.appendChild(d);
        slices.push(d);
      }
    }
    gsap.set(back, { opacity: 1 });

    const STEPS = 9;
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(back, { opacity: 1 });
        gsap.set(full, { opacity: 1 });
        slices.forEach((s) => s.remove());
        gsap.set(front, { opacity: 0, x: 0, filter: 'none' });
        [front, back] = [back, front];
        front.classList.add('is-front'); back.classList.remove('is-front');
        back.innerHTML = '';
        busy = false;
      },
    });

    for (let s = 0; s < STEPS; s++) {
      const t = s * 0.08;
      slices.forEach((slice) => {
        const y = gsap.utils.random(0, 82);
        const h = gsap.utils.random(6, 20);
        tl.set(slice, {
          clipPath: `inset(${y}% 0% ${Math.max(0, 100 - y - h)}% 0%)`,
          x: gsap.utils.random(-36, 36),
          filter: Math.random() < 0.4
            ? `saturate(${gsap.utils.random(1.6, 2.6)}) hue-rotate(${gsap.utils.random(-25, 25)}deg)`
            : 'none',
          opacity: Math.random() < 0.85 ? 1 : 0,
        }, t);
      });
      // outgoing frame shudders while it dies
      tl.set(front, {
        x: gsap.utils.random(-14, 14),
        filter: Math.random() < 0.3 ? 'contrast(1.3) brightness(1.15)' : 'none',
      }, t);
      // whole incoming frame blinks through occasionally
      if (sliceSrc) tl.set(full, { opacity: Math.random() < 0.25 ? 1 : 0 }, t);
    }
    // final snap: full incoming frame
    const end = STEPS * 0.08;
    tl.set(full, { opacity: 1 }, end);
    slices.forEach((slice) => tl.set(slice, { opacity: 0 }, end));
    tl.set(front, { opacity: 0, x: 0, filter: 'none' }, end + 0.02);
    tl.to({}, { duration: 0.05 });
  }

  function go(to, user = false) {
    if (busy) return;
    const i = ((to % SLIDES.length) + SLIDES.length) % SLIDES.length;
    if (i === index) return;
    busy = true;
    index = i;
    setCount(i); setWave(i); setThumbs(i);
    swapTitle(i);
    glitchTo(i);
    if (user) restartAutoplay();
  }

  function restartAutoplay() {
    clearInterval(timer);
    if (reducedMotion) return;
    timer = setInterval(() => go(index + 1), AUTOPLAY_MS);
  }

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

  let startX = null;
  hero.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  hero.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 60) go(index + (dx < 0 ? 1 : -1), true);
    startX = null;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else restartAutoplay();
  });

  /* ---- cursor parallax: background drifts with the pointer, UI counters it ---- */
  if (!reducedMotion) {
    const mx = gsap.quickTo(media, 'x', { duration: 1.1, ease: 'power3' });
    const my = gsap.quickTo(media, 'y', { duration: 1.1, ease: 'power3' });
    const cluster = hero.querySelector('.hx-cluster');
    const cx = cluster ? gsap.quickTo(cluster, 'x', { duration: 0.9, ease: 'power3' }) : null;
    const cy = cluster ? gsap.quickTo(cluster, 'y', { duration: 0.9, ease: 'power3' }) : null;
    const lists = hero.querySelector('.hx-lists');
    const lx = lists ? gsap.quickTo(lists, 'x', { duration: 1.3, ease: 'power3' }) : null;
    const words = [...hero.querySelectorAll('.hx-word')];
    const wx = words.map((w) => gsap.quickTo(w, 'x', { duration: 1, ease: 'power3' }));

    hero.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      mx(nx * -20); my(ny * -14);          // media drifts opposite the cursor
      cx && cx(nx * 8); cy && cy(ny * 5);  // control cluster leans with it
      lx && lx(nx * -6);
      wx.forEach((fn, k) => fn(nx * (k === 0 ? -10 : 10)));
    });
  }
}

/* UNLEESH — NX §4 wordmark marquee: scroll-velocity-driven ticker.
   Constant idle drift, pushed hard in the scroll direction by Lenis velocity,
   decaying back to idle every frame (brief §4 mechanics). */
import { reducedMotion, lenis } from './core.js';

const BASE_SPEED = 1;      // px per frame at idle
const VEL_GAIN = 0.25;     // lenis velocity -> extra px per frame
const DECAY = 0.93;

export function initNxMarquee(root) {
  const tracks = [...root.querySelectorAll('[data-nx-marquee]')].map((track) => {
    const set = track.querySelector('.nxm-set');
    const inner = document.createElement('div');
    inner.className = 'nxm-inner';
    track.appendChild(inner);
    inner.appendChild(set);
    const t = { track, inner, set, dir: parseFloat(track.dataset.dir) || -1, xPos: 0, setWidth: 1 };
    rebuildTrack(t);
    return t;
  });
  if (!tracks.length) return;

  window.addEventListener('resize', () => tracks.forEach(rebuildTrack));
  if (reducedMotion) return;

  let vel = 0;
  if (lenis) {
    lenis.on('scroll', (e) => { vel = (e.velocity || 0) * VEL_GAIN; });
  } else {
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { vel = (s.getVelocity() / 60) * VEL_GAIN; } });
  }

  gsap.ticker.add(() => {
    vel *= DECAY;
    tracks.forEach((t) => {
      t.xPos += (BASE_SPEED + vel) * t.dir;
      let x = t.xPos % t.setWidth;
      if (x > 0) x -= t.setWidth;
      t.inner.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    });
  });
}

/* clone one copy of the content enough times to always cover viewport + 2 sets */
function rebuildTrack(t) {
  t.inner.querySelectorAll('.nxm-set.is-clone').forEach((c) => c.remove());
  t.setWidth = Math.max(1, t.set.getBoundingClientRect().width);
  const cloneCount = Math.max(2, Math.ceil((window.innerWidth + t.setWidth * 2) / t.setWidth));
  for (let i = 1; i < cloneCount; i++) {
    const c = t.set.cloneNode(true);
    c.classList.add('is-clone');
    c.setAttribute('aria-hidden', 'true');
    t.inner.appendChild(c);
  }
}

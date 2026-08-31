/* UNLEESH — marquee: seamless loop driven by a ticker, so scroll velocity can
   speed it up, reverse it on scroll-up, and let it settle back to its idle glide. */
import { reducedMotion } from './core.js';

const MAX_BOOST = 3;         // fastest multiple of idle speed
const SETTLE_S = 0.8;        // seconds to glide back to idle after scrolling stops

export function initMarquees(scope = document) {
  scope.querySelectorAll('.marquee').forEach((mq) => {
    if (mq.dataset.mqInit) return;
    mq.dataset.mqInit = '1';
    // data-items="A|B|C" builds the track automatically (data-sep glyph between items)
    if (mq.dataset.items && !mq.querySelector('.mq-track')) {
      const sep = mq.dataset.sep || '☺';
      const track = document.createElement('div');
      track.className = 'mq-track';
      track.innerHTML = mq.dataset.items.split('|').map((t) =>
        `<span class="mq-item"><span>${t.trim()}</span><span class="mq-sep">${sep}</span></span>`).join('');
      mq.appendChild(track);
    }
    const track = mq.querySelector('.mq-track');
    if (!track) return;

    // duplicate items until the track exceeds 2x viewport, then double once more so
    // copy B sits exactly where copy A started: the -50% wrap is invisible
    const original = track.innerHTML;
    let guard = 0;
    while (track.scrollWidth < window.innerWidth * 2 && guard < 12) {
      track.innerHTML += original;
      guard++;
    }
    track.innerHTML += track.innerHTML;

    if (reducedMotion) return;

    const speed = parseFloat(mq.dataset.speed || '60');       // px per second at idle
    const dir = mq.dataset.dir === 'right' ? 1 : -1;
    const dist = () => track.scrollWidth / 2;
    const wrap = gsap.utils.wrap(-50, 0);

    const state = { pos: 0, ts: 1, skew: 0 };
    gsap.ticker.add((_, dt) => {
      state.pos += (dir * speed * (dt / 1000) * state.ts / dist()) * 100;
      gsap.set(track, { xPercent: wrap(state.pos), skewX: state.skew });
    });

    // scroll velocity: faster with the scroll, reversed against it, then settle
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const raw = self.getVelocity();
        const v = Math.min(Math.abs(raw) / 1200, MAX_BOOST - 1);
        const sign = raw < 0 ? -1 : 1;
        gsap.to(state, { ts: sign * (1 + v), skew: -6 * sign * Math.min(v / 2, 1), duration: 0.2, overwrite: true });
        gsap.to(state, { ts: 1, skew: 0, duration: SETTLE_S, delay: 0.15, ease: 'power2.out', overwrite: false });
      },
    });
  });
}

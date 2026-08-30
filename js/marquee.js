/* UNLEESH — marquee: infinite track, scroll-velocity timeScale + skew */
import { reducedMotion } from './core.js';

export function initMarquees(scope = document) {
  scope.querySelectorAll('.marquee').forEach((mq) => {
    if (mq.dataset.mqInit) return;
    mq.dataset.mqInit = '1';
    const track = mq.querySelector('.mq-track');
    if (!track) return;

    // duplicate items until track exceeds 2x viewport
    const original = track.innerHTML;
    let guard = 0;
    while (track.scrollWidth < window.innerWidth * 2 && guard < 12) {
      track.innerHTML += original;
      guard++;
    }
    // one more copy so -50% wrap is seamless
    track.innerHTML += track.innerHTML;

    if (reducedMotion) return;

    const speed = parseFloat(mq.dataset.speed || '60');
    const dir = mq.dataset.dir === 'right' ? 1 : -1;
    const dist = track.scrollWidth / 2;
    const tween = gsap.to(track, {
      xPercent: dir * -50,
      repeat: -1,
      duration: dist / speed,
      ease: 'none',
    });
    if (dir === 1) {
      gsap.set(track, { xPercent: -50 });
      tween.vars.xPercent = 0;
      tween.invalidate();
    }

    // scroll velocity → timeScale + skew
    let proxy = { ts: 1, skew: 0 };
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 1200, 2);
        gsap.to(proxy, {
          ts: 1 + v, skew: -6 * Math.min(v / 2, 1),
          duration: 0.2, overwrite: true,
          onUpdate: () => {
            tween.timeScale(proxy.ts);
            gsap.set(track, { skewX: proxy.skew });
          },
        });
        gsap.to(proxy, {
          ts: 1, skew: 0, duration: 0.8, delay: 0.15, ease: 'power2.out', overwrite: false,
          onUpdate: () => {
            tween.timeScale(proxy.ts);
            gsap.set(track, { skewX: proxy.skew });
          },
        });
      },
    });
  });
}

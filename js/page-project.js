/* UNLEESH — work detail: banner scale, sticky stacks, framed page scroller */
import { reducedMotion } from './core.js';

export function init() {
  const banner = document.querySelector('.pj-banner img');
  if (banner && !reducedMotion) {
    gsap.fromTo(banner, { scale: 1.1 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.pj-banner', start: 'top top', end: 'bottom top', scrub: 1 },
    });
  }

  // sticky stacks: previous panel scales down + dims as next covers it
  if (!reducedMotion && innerWidth >= 1024) {
    document.querySelectorAll('.pj-stack').forEach((stack) => {
      const panels = stack.querySelectorAll('.pj-panel');
      panels.forEach((panel, i) => {
        if (i === panels.length - 1) return;
        const next = panels[i + 1];
        gsap.to(panel, {
          scale: 0.94, opacity: 0.6, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
        });
      });
    });
  }

  // framed full-page screenshot scroller
  const scroller = document.querySelector('.pj-scroller');
  const shot = scroller?.querySelector('img');
  if (scroller && shot) {
    const frame = scroller.querySelector('.pj-frame');
    const run = () => {
      const dist = shot.scrollHeight - frame.clientHeight;
      if (dist <= 0) return;
      if (reducedMotion) return;
      gsap.to(shot, {
        y: -dist, ease: 'none',
        scrollTrigger: {
          trigger: scroller, start: 'top top', end: '+=300%',
          pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
    };
    shot.complete ? run() : shot.addEventListener('load', run, { once: true });
  }

  // opposite parallax on the side-by-side pair
  if (!reducedMotion) {
    const pair = document.querySelectorAll('.pj-pair .reveal-img');
    pair.forEach((el, i) => {
      gsap.to(el, {
        y: i === 0 ? -40 : 40, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }
}

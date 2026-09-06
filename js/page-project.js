/* UNLEESH — work detail: sticky stacks, framed page scroller, next-case parallax */
import { reducedMotion } from './core.js';
import { initInner } from './inner.js';

export function init() {
  initInner();
  initStacks();
  initScroller();
  initPair();
  initNext();
}

/* sticky stacks: previous panel scales down + dims as the next covers it */
function initStacks() {
  if (reducedMotion || innerWidth < 1024) return;
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

/* framed full-page screenshot scrolls inside its frame while pinned */
function initScroller() {
  const scroller = document.querySelector('.pj-scroller');
  const shot = scroller?.querySelector('img');
  if (!scroller || !shot || reducedMotion) return;
  const frame = scroller.querySelector('.pj-frame');
  const run = () => {
    const dist = shot.scrollHeight - frame.clientHeight;
    if (dist <= 0) return;
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

/* opposite parallax on the side-by-side pair */
function initPair() {
  if (reducedMotion) return;
  document.querySelectorAll('.pj-pair .reveal-img').forEach((el, i) => {
    gsap.to(el, {
      y: i === 0 ? -40 : 40, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* next-case teaser: image drifts as it enters */
function initNext() {
  const media = document.querySelector('.pj-next-media');
  if (!media || reducedMotion) return;
  gsap.fromTo(media, { yPercent: -8 }, {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: media.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

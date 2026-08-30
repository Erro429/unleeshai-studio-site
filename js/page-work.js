/* UNLEESH — work archive: parallax items, cursor VIEW pill */
import { reducedMotion } from './core.js';

export function init() {
  // parallax each item image
  if (!reducedMotion) {
    document.querySelectorAll('.work-card2 .reveal-img').forEach((el) => {
      gsap.to(el, {
        y: -40, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  // VIEW pill follows cursor over items
  const pill = document.createElement('div');
  pill.className = 'view-pill';
  pill.textContent = 'VIEW';
  document.body.appendChild(pill);
  const xTo = gsap.quickTo(pill, 'x', { duration: 0.4, ease: 'power3' });
  const yTo = gsap.quickTo(pill, 'y', { duration: 0.4, ease: 'power3' });

  document.querySelectorAll('.work-card2').forEach((item) => {
    item.addEventListener('mouseenter', () => gsap.to(pill, { opacity: 1, duration: 0.25 }));
    item.addEventListener('mouseleave', () => gsap.to(pill, { opacity: 0, duration: 0.25 }));
    item.addEventListener('mousemove', (e) => { xTo(e.clientX + 20); yTo(e.clientY - 20); });
  });
}

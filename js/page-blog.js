/* UNLEESH — journal: staggered row reveal */
import { reducedMotion } from './core.js';

export function init() {
  const rows = document.querySelectorAll('.bl-row');
  if (!rows.length || reducedMotion) return;
  gsap.from(rows, {
    y: 24, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: rows[0], start: 'top 85%', once: true },
  });
}

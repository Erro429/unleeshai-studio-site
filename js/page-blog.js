/* UNLEESH — journal index: row reveal, cursor previews, subscribe strip */
import { reducedMotion } from './core.js';
import { initInner, initRowPreview } from './inner.js';

export function init() {
  initInner();
  const rows = [...document.querySelectorAll('.bl-row')];
  initRowPreview(rows, (row) => row.dataset.img, (row) => row.querySelector('.b-cat').textContent);
  if (!reducedMotion && rows.length) {
    gsap.from(rows, {
      y: 24, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05,
      scrollTrigger: { trigger: rows[0], start: 'top 85%', once: true },
    });
  }
  initSubscribe();
}

function initSubscribe() {
  const form = document.querySelector('.bs-form');
  if (!form) return;
  const input = form.querySelector('input');
  const toast = form.querySelector('.bs-toast');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
    form.classList.toggle('is-error', !ok);
    if (!ok) { input.focus(); return; }
    // no backend wired yet: acknowledge locally
    input.value = '';
    gsap.fromTo(toast, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' });
    gsap.to(toast, { opacity: 0, duration: 0.6, delay: 3.5 });
  });
}

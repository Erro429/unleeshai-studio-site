/* UNLEESH — NX §6b ARCHIVE: a clean 3-line giant title pinned for a long
   scroll distance while large project photographs slide in diagonally from
   alternating corners (top-left, then bottom-right), each holding and then
   leaving before the next arrives, cycling through eight images. */
import { reducedMotion } from './core.js';

const IMAGES = [
  ['V40', 'Lumen Skincare'], ['V41', 'Nocturne'], ['V45', 'Pull Noodle Bar'], ['V42', 'Wilder Camp'],
  ['V43', 'Ironflow'], ['V46', 'Axiom Precision'], ['V47', 'Helios'], ['V48', 'Caneform'],
];
const PIN_PX = 4000;

export function initNxArchive(root) {
  const section = root.querySelector('[data-nx-archive]');
  if (!section) return;
  const host = section.querySelector('.nxa-images');
  const count = section.querySelector('.nxa-count');
  const title = section.querySelector('.nxa-title');

  const figs = IMAGES.map(([img, name], i) => {
    const f = document.createElement('figure');
    f.className = 'nxa-img';
    f.innerHTML = `<img src="assets/img/${img}.webp" alt="${name}" loading="lazy"><span class="bracket-label">( ${String(i + 1).padStart(2, '0')} · ${name} )</span>`;
    host.appendChild(f);
    return f;
  });
  const setCount = (i) => { count.textContent = `${String(i + 1).padStart(2, '0')} // ${String(IMAGES.length).padStart(2, '0')}`; };
  setCount(0);

  const desktop = window.innerWidth >= 1024 && !reducedMotion;
  if (!desktop) { figs.forEach((f) => gsap.set(f, { opacity: 1 })); return; }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section, start: 'top top', end: `+=${PIN_PX}`, pin: true, scrub: true, anticipatePin: 1,
      onUpdate: (s) => setCount(Math.min(IMAGES.length - 1, Math.floor(s.progress * IMAGES.length))),
    },
  });
  figs.forEach((f, i) => {
    const dir = i % 2 === 0 ? -1 : 1;                 // even: top-left, odd: bottom-right
    const at = i * 1.0;
    tl.fromTo(f,
      { xPercent: dir * 120, yPercent: dir * 120, opacity: 0 },
      { xPercent: 0, yPercent: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, at);
    tl.to(f, { xPercent: -dir * 70, yPercent: -dir * 70, opacity: 0, duration: 0.7, ease: 'power2.in' }, at + 1.25);
  });
  tl.to(title, { scale: 1.06, duration: IMAGES.length + 2, ease: 'none' }, 0);
  tl.to({}, { duration: 0.6 }, IMAGES.length + 1.4);
}

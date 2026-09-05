/* UNLEESH — NX §6a THE SECTORS: arced headline over a semicircular fan of
   tilted polaroids, a monospace stats ticker, then (pinned) the fan explodes to
   a full-viewport burst with an RGB channel-split glitch and fades to black. */
import { reducedMotion } from './core.js';

const FAN = [
  ['V40', 'WEB'], ['V41', 'VISUAL'], ['V42', 'UI'], ['V43', 'MOTION'], ['V44', 'BRAND'],
  ['V45', 'AI'], ['V46', '3D'], ['V47', 'TYPE'], ['V48', 'FILM'], ['V49', 'CODE'], ['V55', 'LABS'],
];
const PIN_PX = 2500;
const SPLIT_MAX = 26;   // px offset of the red / blue copies at peak

export function initNxSectors(root) {
  const section = root.querySelector('[data-nx-sectors]');
  if (!section) return;
  const fanHost = section.querySelector('.nxs-fan');
  const arc = section.querySelector('.nxs-arc textPath');
  const sub = section.querySelector('.nxs-sub');
  const stats = section.querySelector('.nxs-stats');
  const black = section.querySelector('.nxs-black');
  const title = section.querySelector('.nxs-arc');

  // one tspan per character so the headline can draw in letter by letter
  const text = arc.textContent;
  arc.textContent = '';
  const tspans = [...text].map((ch) => {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    t.textContent = ch === ' ' ? ' ' : ch;
    arc.appendChild(t);
    return t;
  });

  // the fan sits under the dome of the arced title, so it stays inside the arc's span
  const R = Math.min(window.innerWidth * 0.24, 340);
  const cards = FAN.map(([img, label], i) => {
    const a = -80 + (160 * i) / (FAN.length - 1);      // degrees across the semicircle
    const rad = (a * Math.PI) / 180;
    const fig = document.createElement('figure');
    fig.className = 'nxs-card';
    fig.innerHTML = `
      <div class="nxs-img">
        <img class="ch ch-r" src="assets/img/${img}.webp?v=2" alt="" loading="lazy">
        <img class="ch ch-g" src="assets/img/${img}.webp?v=2" alt="" loading="lazy">
        <img class="ch ch-b" src="assets/img/${img}.webp?v=2" alt="" loading="lazy">
      </div>
      <figcaption>${label}</figcaption>`;
    fanHost.appendChild(fig);
    return { el: fig, x: R * Math.sin(rad), y: -R * Math.cos(rad) * 0.8, tilt: a * 0.55 + ((i % 3) - 1) * 4 };
  });

  const desktop = window.innerWidth >= 1024 && !reducedMotion;
  if (!desktop) {
    tspans.forEach((t) => (t.style.opacity = 1));
    cards.forEach((c) => gsap.set(c.el, { x: c.x * 0.6, y: c.y * 0.6, rotation: c.tilt }));
    return;
  }

  cards.forEach((c) => gsap.set(c.el, { x: 0, y: R * 0.6, rotation: 0, scale: 0.6, opacity: 0 }));
  gsap.set([sub, stats], { opacity: 0, y: 16 });

  const split = { v: 0 };
  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top top', end: `+=${PIN_PX}`, pin: true, scrub: 1, anticipatePin: 1 },
    defaults: { ease: 'none' },
  });

  // 0 - 2: headline draws in, fan rises into the semicircle, meta fades up
  tl.to(tspans, { opacity: 1, duration: 0.25, stagger: 0.09, ease: 'power2.out' }, 0);
  cards.forEach((c, i) => {
    tl.to(c.el, { x: c.x, y: c.y, rotation: c.tilt, scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out' }, 0.2 + i * 0.09);
  });
  tl.to([sub, stats], { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.15 }, 1.2);
  // 2 - 4.5: hold
  tl.to({}, { duration: 2.5 }, 2);
  // 4.5 - 7.5: burst outward with channel split; headline scales away
  cards.forEach((c, i) => {
    tl.to(c.el, {
      x: c.x * 4.6, y: c.y * 4.6 - 260, scale: 3.6, rotation: c.tilt * 2.4, duration: 3, ease: 'power2.in',
    }, 4.5 + i * 0.05);
  });
  tl.to(split, {
    v: SPLIT_MAX, duration: 2.2, ease: 'power2.in',
    onUpdate: () => section.style.setProperty('--split', split.v.toFixed(2) + 'px'),
  }, 4.9);
  tl.to(title, { scale: 1.6, opacity: 0, duration: 1.4, ease: 'power2.in', transformOrigin: '50% 50%' }, 4.8);
  tl.to([sub, stats], { opacity: 0, duration: 0.6, ease: 'power1.in' }, 6.4);
  // 7.4 - 9.4: fade to black, hold to the end of the pin
  tl.to(black, { opacity: 1, duration: 2, ease: 'power1.inOut' }, 7.4);
  tl.to({}, { duration: 0.6 }, 9.4);
}

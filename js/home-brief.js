/* UNLEESH — the brief: studio photo unveils (clip + zoom-settle, then
   parallax), and a twelve-cell decoder grid resolves its labels A -> B. */
import { reducedMotion } from './core.js';

const CELLS = [
  ['Custom Sites', 'Trust'], ['Landing Pages', 'Leads'], ['Sales Funnels', 'Sales'],
  ['SEO Strategy', 'Rankings'], ['AI Search', 'Answers'], ['Blog Writing', 'Traffic'],
  ['Optimization', 'Speed'], ['Hand-Coded', 'Control'], ['Motion Design', 'Impact'],
  ['AI Visuals', 'Polish'], ['Analytics', 'Clarity'], ['Monthly Care', 'Growth'],
];
const GLYPHS = '!<>-_\\/[]{}=+*^?#';
const FRAMES = 26;
const CELL_STAGGER_MS = 50;
const HOLD_MS = 1100;

export function initBrief(section) {
  initPhoto(section.querySelector('.company-photo'));
  initDecoder(section.querySelector('.decoder'));
}

/* ---- photo: frame opens from the top edge while the image settles from 1.15 ---- */
function initPhoto(frame) {
  if (!frame) return;
  const img = frame.querySelector('img');
  if (reducedMotion) return;
  gsap.set(frame, { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(img, { scale: 1.15 });
  gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 80%', once: true } })
    .to(frame, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power3.out' })
    .to(img, { scale: 1, duration: 1.2, ease: 'power3.out' }, 0);
  // the picture travels slower than its frame: bleed from the 1.15 start covers it
  gsap.fromTo(img, { yPercent: -8 }, {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

/* ---- decoder grid ---- */
function initDecoder(grid) {
  if (!grid) return;
  const cells = CELLS.map(([a, b], i) => {
    const cell = document.createElement('div');
    cell.className = 'dc-cell';
    cell.setAttribute('role', 'listitem');
    cell.innerHTML = `<span class="dc-idx">${String(i + 1).padStart(2, '0')}</span><span class="dc-word"></span>`;
    cell.dataset.a = a; cell.dataset.b = b;
    grid.appendChild(cell);
    return cell;
  });
  const words = cells.map((c) => c.querySelector('.dc-word'));

  if (reducedMotion) {
    words.forEach((w, i) => { w.textContent = CELLS[i][1]; });
    return;
  }
  words.forEach((w, i) => { w.textContent = CELLS[i][0]; });

  const runs = new Map(); // cell -> cancel token
  const decode = (i, target) => {
    const el = words[i];
    const token = (runs.get(i) || 0) + 1;
    runs.set(i, token);
    let f = 0;
    const tick = () => {
      if (runs.get(i) !== token) return;
      const resolved = Math.floor((f / FRAMES) * target.length);
      el.textContent = target.split('').map((ch, k) =>
        (k < resolved || ch === ' ') ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
      if (f++ < FRAMES) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    tick();
  };

  ScrollTrigger.create({
    trigger: grid, start: 'top 80%', once: true,
    onEnter: () => {
      cells.forEach((cell, i) => {
        setTimeout(() => decode(i, cell.dataset.a), i * CELL_STAGGER_MS);
        setTimeout(() => { decode(i, cell.dataset.b); cell.classList.add('is-b'); }, HOLD_MS + i * CELL_STAGGER_MS);
      });
    },
  });

  // hover flips a cell back and forth between its two identities
  cells.forEach((cell, i) => {
    cell.addEventListener('mouseenter', () => {
      const toB = !cell.classList.contains('is-b');
      cell.classList.toggle('is-b', toB);
      decode(i, toB ? cell.dataset.b : cell.dataset.a);
    });
  });
}

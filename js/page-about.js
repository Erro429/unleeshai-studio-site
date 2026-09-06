/* UNLEESH — about page: horizontal service cards, process stage, registry previews */
import { reducedMotion } from './core.js';
import { icon } from './icons.js';
import { initInner, initRowPreview } from './inner.js';

export function init() {
  initInner();
  initHorizontalCards();
  initProcess();
  initRegistry();
}

/* four cards + lead slide sideways while the wrapper is pinned */
function initHorizontalCards() {
  const wrap = document.querySelector('.svc-cards-wrap');
  const track = document.querySelector('.svc-cards');
  if (!wrap || !track) return;
  if (reducedMotion || innerWidth < 1024) return;
  const dist = () => track.scrollWidth - innerWidth + 96;
  gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: wrap, start: 'top top', end: '+=200%',
      pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
    },
  });
}

/* sticky stage: outlined phase number crossfades, icon swaps, rail fills */
const STEP_ICONS = ['star6', 'star4', 'star8', 'burst', 'diamond', 'plusCircle'];

function initProcess() {
  const stage = document.querySelector('.proc-stage');
  const steps = [...document.querySelectorAll('.proc-step')];
  if (!stage || !steps.length) return;
  const nums = [...stage.querySelectorAll('.proc-num')];
  const iconBox = stage.querySelector('.proc-icon');
  const rail = stage.querySelector('.proc-rail i');
  const cur = stage.querySelector('.pc-cur');
  iconBox.innerHTML = icon(STEP_ICONS[0]);
  nums[0].classList.add('is-on');

  const activate = (i) => {
    nums.forEach((n, k) => {
      const on = k === i;
      if (n.classList.contains('is-on') === on) return;
      n.classList.toggle('is-on', on);
      if (reducedMotion) return;
      gsap.fromTo(n, { yPercent: on ? 30 : 0, opacity: on ? 0 : 1 }, { yPercent: on ? 0 : -30, opacity: on ? 1 : 0, duration: 0.6, ease: 'expo.out', overwrite: true });
    });
    iconBox.innerHTML = icon(STEP_ICONS[i]);
    if (!reducedMotion) gsap.fromTo(iconBox.firstChild, { scale: 0.6, opacity: 0, rotate: -30 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: 'expo.out' });
    cur.textContent = String(i + 1).padStart(2, '0');
    gsap.to(rail, { width: `${((i + 1) / steps.length) * 100}%`, duration: 0.6, ease: 'expo.out' });
  };

  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step, start: 'top 55%', end: 'bottom 55%',
      onEnter: () => activate(i),
      onEnterBack: () => activate(i),
    });
    if (reducedMotion) return;
    gsap.from(step.querySelectorAll('.bracket-label, h3, p, .proc-tags'), {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: step, start: 'top 75%', once: true },
    });
  });
}

/* registry rows: stagger in, cursor preview of the sector still */
function initRegistry() {
  const rows = [...document.querySelectorAll('.reg-row')];
  if (!rows.length) return;
  initRowPreview(rows, (row) => row.dataset.img || 'V17', (row) => row.querySelector('.r-ep').textContent);
  if (reducedMotion) return;
  document.querySelectorAll('.reg-list').forEach((list) => {
    gsap.from(list.querySelectorAll('.reg-row'), {
      y: 24, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: list, start: 'top 85%', once: true },
    });
  });
}

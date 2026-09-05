/* UNLEESH — seams: make the home page read as ONE continuous surface.
   Every section dissolves in from the page ground as it arrives (scrubbed, so
   it reverses on the way back up) and every pinned set piece dissolves back
   into the ground over the last stretch of its pin, so no block starts or ends
   on a hard edge. A fixed ground plane sits between the sticky hero and the
   sections, so a section at partial opacity never lets the hero show through.
   Mounted last, after the page and NX modules have created their pins. */
import { reducedMotion } from './core.js';

const ENTER_START = 'top 96%';
const ENTER_END = 'top 58%';
const EXIT_SHARE = 0.18;      // share of a pin's scroll length spent dissolving out
const EXIT_MAX_VH = 1;        // ...capped at one viewport so long pins do not fade for ages
const SELF_REVEAL = ['.nx-tunnel'];   // sections that already own their entrance

export function initSeams() {
  const main = document.querySelector('main');
  const hero = main && main.querySelector(':scope > .hero');
  if (!main || !hero || reducedMotion) return;

  mountGround(hero);

  const sections = topSections(main).filter((s) => s !== hero);
  const pinnedBy = new Map(ScrollTrigger.getAll().filter((t) => t.pin).map((t) => [t.pin, t]));

  sections.forEach((section, i) => {
    const ownsEntrance = i === 0 || SELF_REVEAL.some((sel) => section.matches(sel));
    if (!ownsEntrance) enterFade(section);
    const pin = pinnedBy.get(section);
    if (pin) {
      exitDissolve(section, pin);
      overlapNext(sections[i + 1]);
    }
  });
  ScrollTrigger.refresh();
}

/* solid page ground, switched on once the hero has been scrolled past */
function mountGround(hero) {
  removeGround();
  const ground = document.createElement('div');
  ground.className = 'page-ground';
  ground.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ground);
  ScrollTrigger.create({
    start: () => hero.offsetHeight - 1,
    end: 'max',
    onToggle: (s) => ground.classList.toggle('is-on', s.isActive),
  });
}

function enterFade(section) {
  gsap.fromTo(section, { opacity: 0 }, {
    opacity: 1, ease: 'none',
    scrollTrigger: { trigger: section, start: ENTER_START, end: ENTER_END, scrub: true },
  });
}

/* the section after a pinned piece is pulled up one viewport, so it rises over
   the piece while it dissolves instead of after a screen of empty ground.
   Its own background goes transparent (the ground plane is behind it now). */
function overlapNext(next) {
  if (next) next.classList.add('seam-overlap');
}

function exitDissolve(section, pin) {
  const len = () => Math.min(EXIT_SHARE * (pin.end - pin.start), EXIT_MAX_VH * window.innerHeight);
  gsap.fromTo(section, { opacity: 1 }, {
    opacity: 0, ease: 'none', immediateRender: false,
    scrollTrigger: { start: () => pin.end - len(), end: () => pin.end, scrub: true },
  });
}

/* page transitions swap <main> but keep <body>: drop any stale ground plane */
export function removeGround() {
  document.querySelectorAll('.page-ground').forEach((g) => g.remove());
}

/* top-level sections of the page, looking through the pin-spacer wrappers
   ScrollTrigger puts around pinned sections and into the NX block wrapper */
function topSections(main) {
  const out = [];
  const walk = (parent) => {
    [...parent.children].forEach((child) => {
      const el = child.classList.contains('pin-spacer') ? child.firstElementChild : child;
      if (!el) return;
      if (el.classList.contains('nx')) walk(el);
      else if (el.matches('section, nav')) out.push(el);
    });
  };
  walk(main);
  return out;
}

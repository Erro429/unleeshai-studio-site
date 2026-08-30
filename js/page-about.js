/* UNLEESH — about page: horizontal service cards, accordion, stepper */
import { reducedMotion } from './core.js';
import { icon } from './icons.js';

export function init() {
  initHorizontalCards();
  initAccordion();
  initStepper();
  initRegistryReveal();
  initHeroScale();
}

function initHeroScale() {
  const vid = document.querySelector('.about-video');
  if (!vid || reducedMotion) return;
  gsap.fromTo(vid, { scale: 0.92 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: vid, start: 'top bottom', end: 'top 30%', scrub: 1 },
  });
}

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

function initAccordion() {
  const rows = document.querySelectorAll('.acc-row');
  rows.forEach((row) => {
    const head = row.querySelector('.acc-head');
    const panel = row.querySelector('.acc-panel');
    head.addEventListener('click', () => {
      const isOpen = row.classList.contains('is-open');
      rows.forEach((r) => {
        if (r !== row && r.classList.contains('is-open')) {
          r.classList.remove('is-open');
          gsap.to(r.querySelector('.acc-panel'), { height: 0, duration: 0.6, ease: 'expo.out' });
        }
      });
      row.classList.toggle('is-open', !isOpen);
      gsap.to(panel, {
        height: isOpen ? 0 : panel.scrollHeight, duration: 0.6, ease: 'expo.out',
        onComplete: () => { if (!isOpen) ScrollTrigger.refresh(); },
      });
    });
  });
}

const STEP_ICONS = ['star6', 'star4', 'star8', 'burst', 'diamond', 'plusCircle'];

function initStepper() {
  const stage = document.querySelector('.stepper-icon');
  const steps = document.querySelectorAll('.stepper-steps .step');
  if (!stage || !steps.length) return;
  stage.innerHTML = icon(STEP_ICONS[0]);

  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step, start: 'top 60%', end: 'bottom 60%',
      onToggle: (self) => {
        step.classList.toggle('is-active', self.isActive);
        if (self.isActive) {
          stage.innerHTML = icon(STEP_ICONS[i]);
          if (!reducedMotion) gsap.fromTo(stage.firstChild, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'expo.out' });
        }
      },
    });
  });
}

function initRegistryReveal() {
  const rows = document.querySelectorAll('.reg-row');
  if (!rows.length || reducedMotion) return;
  gsap.from(rows, {
    y: 24, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: rows[0], start: 'top 85%', once: true },
  });
}

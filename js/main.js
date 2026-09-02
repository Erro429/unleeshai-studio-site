/* UNLEESH — bootstrap: chrome + per-page init */
import {
  initSmoothScroll, initReveals, initRolls, initCounters, initStatus,
  initCursorDot, initHeaderHide, initBackTop, initScrollInd,
  initProgressBar, initGrain, initMagnetic,
} from './core.js';
import { mountChrome, mountPreloader, mountTransitions, pageKey } from './chrome.js';
import { initMarquees } from './marquee.js';

gsap.registerPlugin(ScrollTrigger, Flip);

const pageInits = {
  home: () => import('./page-home.js').then((m) => m.init()),
  about: () => import('./page-about.js').then((m) => m.init()),
  work: () => import('./page-work.js').then((m) => m.init()),
  project: () => import('./page-project.js').then((m) => m.init()),
  lab: () => import('./page-lab.js').then((m) => m.init()),
  contact: () => import('./page-contact.js').then((m) => m.init()),
  blog: () => import('./page-blog.js').then((m) => m.init()),
};

function initPage() {
  initRolls();
  initReveals();
  initCounters();
  initStatus();
  initMarquees();
  initScrollInd();
  initBackTop();
  initMagnetic('.hero-prev, .hero-next, .h-mail, .h-burger, .back-top, .cf-submit, .hx-social a, .f-social a, .pj-pager a');
  const fn = pageInits[pageKey()];
  if (fn) fn().catch((e) => console.error('page init failed', e));
  // NUDOT brief blocks + global additions (js/nx-*.js), layered after the approved init
  import('./nx-index.js').then((m) => m.init()).catch((e) => console.error('nx init failed', e));
}

initSmoothScroll();
mountChrome();
mountTransitions(initPage);
initHeaderHide();
initProgressBar();
initGrain();
initCursorDot();
mountPreloader(() => {});
initPage();

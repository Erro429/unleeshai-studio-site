/* UNLEESH — journal entry: reading progress, paragraph reveals, share, next-entry drift */
import { reducedMotion } from './core.js';
import { initInner } from './inner.js';

export function init() {
  initInner();
  initProgress();
  initParagraphs();
  initShare();
  initNext();
}

function initProgress() {
  const bar = document.querySelector('.ar-progress i');
  const col = document.querySelector('.ar-col');
  if (!bar || !col) return;
  ScrollTrigger.create({
    trigger: col, start: 'top 60%', end: 'bottom 60%',
    onUpdate: (self) => { bar.style.width = `${(self.progress * 100).toFixed(1)}%`; },
  });
}

function initParagraphs() {
  if (reducedMotion) return;
  document.querySelectorAll('.ar-col > p').forEach((p) => {
    gsap.from(p, {
      y: 24, opacity: 0, duration: 0.8, ease: 'expo.out',
      scrollTrigger: { trigger: p, start: 'top 88%', once: true },
    });
  });
}

function initShare() {
  const url = location.href;
  const title = document.title;
  document.querySelectorAll('[data-share]').forEach((a) => {
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const kind = a.dataset.share;
      if (kind === 'x') window.open(`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener');
      if (kind === 'li') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener');
      if (kind === 'copy') {
        try {
          await navigator.clipboard.writeText(url);
          const prev = a.textContent;
          a.textContent = 'Copied';
          setTimeout(() => { a.textContent = prev; }, 1600);
        } catch { /* clipboard unavailable */ }
      }
    });
  });
}

function initNext() {
  const media = document.querySelector('.ar-next-media');
  if (!media || reducedMotion) return;
  gsap.fromTo(media, { yPercent: -8 }, {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: media.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

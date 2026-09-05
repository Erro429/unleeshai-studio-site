/* UNLEESH — NUDOT brief blocks: entry point (added 2026-09-03).
   Runs after the approved page init. Global chrome additions mount once;
   the section modules mount whenever the [data-nx] block is on the page. */
import { initNxChrome, decorateHome } from './nx-chrome.js';
import { initNxMarquee } from './nx-marquee.js';
import { initNxTunnel } from './nx-tunnel.js';
import { initNxSectors } from './nx-sectors.js';
import { initNxArchive } from './nx-archive.js';

export function init() {
  initNxChrome();
  const root = document.querySelector('[data-nx]');
  if (root && !root.dataset.nxInit) {
    root.dataset.nxInit = '1';
    const safe = (name, fn) => { try { fn(root); } catch (e) { console.error(`nx ${name} failed`, e); } };
    safe('marquee', initNxMarquee);
    safe('tunnel', initNxTunnel);
    safe('sectors', initNxSectors);
    safe('archive', initNxArchive);
    // The approved sections' pinned triggers were created before these blocks
    // existed, so their start positions miss the new pin spacers. Re-sort every
    // trigger into document order and refresh so every pin measures correctly.
    sortTriggersByDocument();
    ScrollTrigger.refresh();
  }
  decorateHome();
}

function sortTriggersByDocument() {
  const el = (t) => (t.trigger && t.trigger.nodeType === 1 ? t.trigger : null);
  ScrollTrigger.sort((a, b) => {
    const ea = el(a), eb = el(b);
    if (!ea && !eb) return a.start - b.start;
    if (!ea) return -1;
    if (!eb) return 1;
    if (ea === eb) return a.start - b.start;
    return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
}

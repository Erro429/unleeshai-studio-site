/* UNLEESH — inline SVG icon map (24px grid, 1.5px stroke, currentColor) */
const S = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

export const icons = {
  down: `<svg viewBox="0 0 12 24" ${S}><path d="M6 1v20M1.5 17L6 22l4.5-5"/></svg>`,
  up: `<svg viewBox="0 0 16 16" ${S}><path d="M8 14V2M3 7l5-5 5 5"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" ${S}><path d="M4 12h16M13 5l7 7-7 7"/></svg>`,
  arrowUpRight: `<svg viewBox="0 0 24 24" ${S}><path d="M6 18L18 6M8 6h10v10"/></svg>`,
  star4: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l2.4 8.6L23 12l-8.6 2.4L12 23l-2.4-8.6L1 12l8.6-2.4z"/></svg>`,
  star6: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l1.8 7.2L21.5 6.5 16 12l5.5 5.5-7.7-1.7L12 23l-1.8-7.2L2.5 17.5 8 12 2.5 6.5l7.7 1.7z"/></svg>`,
  star8: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l1.5 6.5L18 3l-2 6 6-2-4.5 4.5L24 12l-6.5 1.5L21 18l-6-2 2 6-4.5-4.5L12 24l-1.5-6.5L6 21l2-6-6 2 4.5-4.5L0 12l6.5-1.5L3 6l6 2-2-6 4.5 4.5z"/></svg>`,
  diamond: `<svg viewBox="0 0 24 24" ${S}><path d="M12 2l8 10-8 10-8-10z"/></svg>`,
  burst: `<svg viewBox="0 0 24 24" ${S}><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>`,
  plusCircle: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="10"/><path d="M12 7v10M7 12h10"/></svg>`,
  hourglass: `<svg viewBox="0 0 24 24" ${S}><path d="M6 2h12M6 22h12M7 2c0 5 4 6 5 8-1 2-5 3-5 8M17 2c0 5-4 6-5 8 1 2 5 3 5 8"/></svg>`,
  close: `<svg viewBox="0 0 24 24" ${S}><path d="M5 5l14 14M19 5L5 19"/></svg>`,
  link: `<svg viewBox="0 0 24 24" ${S}><path d="M10 14a5 5 0 007.5.5l2-2a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7.5-.5l-2 2a5 5 0 007 7l1-1"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" ${S}><rect x="1" y="1" width="22" height="22"/><path d="M14 7l-5 5 5 5"/></svg>`,
  next: `<svg viewBox="0 0 24 24" ${S}><rect x="1" y="1" width="22" height="22"/><path d="M10 7l5 5-5 5"/></svg>`,
  list: `<svg viewBox="0 0 24 24" ${S}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  c1: `<svg viewBox="0 0 28 28" ${S}><path d="M14 4a10 10 0 0110 10M14 8a6 6 0 016 6M14 12a2 2 0 012 2M4 14a10 10 0 0110-10M8 14a6 6 0 016-6M14 24a10 10 0 01-10-10"/></svg>`,
  c2: `<svg viewBox="0 0 28 28" ${S}><rect x="10" y="3" width="8" height="6"/><rect x="2" y="19" width="8" height="6"/><rect x="18" y="19" width="8" height="6"/><path d="M14 9v5M6 19v-5h16v5"/></svg>`,
  c3: `<svg viewBox="0 0 28 28" ${S}><rect x="3" y="5" width="22" height="18"/><path d="M3 10h22M6 7.5h.01M9 7.5h.01M12 7.5h.01"/></svg>`,
  c4: `<svg viewBox="0 0 28 28" ${S}><rect x="3" y="5" width="18" height="16"/><path d="M3 17l5-5 6 6M15 13l3-3 3 3"/><path d="M23 3l.8 2.2L26 6l-2.2.8L23 9l-.8-2.2L20 6l2.2-.8z" fill="currentColor" stroke="none"/></svg>`,
  c5: `<svg viewBox="0 0 28 28" ${S}><rect x="3" y="5" width="22" height="18"/><path d="M11 10l7 4-7 4z"/></svg>`,
  c6: `<svg viewBox="0 0 28 28" ${S}><circle cx="14" cy="14" r="11"/><path d="M18 10l-2.5 5.5L10 18l2.5-5.5z"/></svg>`,
  be: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.2 11.2c.9-.5 1.4-1.3 1.4-2.4 0-2.1-1.6-3-3.8-3H1v12.4h5c2.4 0 4.3-1.1 4.3-3.6 0-1.6-.8-2.8-2.1-3.4zM3.7 7.9h1.9c.9 0 1.6.4 1.6 1.3s-.6 1.3-1.5 1.3h-2V7.9zm2.1 8.2H3.7v-3.2h2.2c1.1 0 1.8.6 1.8 1.6s-.7 1.6-1.9 1.6zM19 5.9h-4.6v1.3H19V5.9zm-2.3 3c-2.7 0-4.5 1.9-4.5 4.7 0 2.9 1.8 4.7 4.6 4.7 2.1 0 3.6-1 4.2-2.9h-2.3c-.3.7-.9 1-1.8 1-1.2 0-1.9-.7-2.1-2h6.3v-.6c0-2.9-1.7-4.9-4.4-4.9zm-1.9 3.8c.2-1.1.9-1.8 1.9-1.8s1.7.7 1.8 1.8h-3.7z"/></svg>`,
  pi: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.9 6.4 9.3-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.5 1.9 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.1c0 .2-.2.2-.4.1-1.2-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.7-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.2 6.3-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.9-.8 2-1.3 2.6.9.3 1.9.5 3 .5 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>`,
};

export function icon(name, cls = '') {
  const svg = icons[name] || '';
  return cls ? svg.replace('<svg', `<svg class="${cls}"`) : svg;
}

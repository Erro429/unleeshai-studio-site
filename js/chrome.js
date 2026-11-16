/* UNLEESH — shared chrome: header, menu overlay, footer, preloader, transition layer */
import { icon } from './icons.js';
import { stopScroll, startScroll, reducedMotion, seenPreloader, markPreloaderSeen, makeRoll, lenis } from './core.js';

export const BRAND = 'UNLEESH';
export const EMAIL = 'hello@unleeshai.com';
export const CITY = 'Remote';

const PAGES = {
  home:    { file: 'index.html',        name: 'HOME',    sub: 'Custom websites, built to be found.' },
  about:   { file: 'about.html',        name: 'ABOUT',   sub: 'Brand Strategy & Creative Direction' },
  work:    { file: 'work.html',         name: 'WORK',    sub: 'Shared page-transition layer for the home page and work archive.' },
  project: { file: 'work_cont.html',    name: 'PROJECT', sub: 'Project Showcase' },
  lab:     { file: 'lab.html',          name: 'LABS',    sub: 'UNLEESH Labs — Editorial Grid' },
  contact: { file: 'contact.html',      name: 'CONTACT', sub: 'ABOUT YOUR NEXT DIGITAL TRANSFORMATION' },
  blog:    { file: 'blog.html',         name: 'JOURNAL', sub: 'Shared page-transition layer for the journal and article pages.' },
  article: { file: 'journal.html',      name: 'ENTRY',   sub: 'Journal entry' },
};

/* which page key a link points at (data-driven pages share a prefix) */
function keyForHref(href) {
  const file = href.split('#')[0].split('?')[0];
  const direct = Object.keys(PAGES).find((k) => PAGES[k].file === file);
  if (direct) return direct;
  if (file.startsWith('work_')) return 'project';
  if (file.startsWith('journal_')) return 'article';
  return 'home';
}

const NAV = [
  { label: '( Index )',     word: 'HOME',    href: 'index.html',   imgs: ['V07', 'V08'] },
  { label: '( Studio )',    word: 'ABOUT',   href: 'about.html',   imgs: ['V09', 'V10'] },
  { label: '( Archive )',   word: 'WORK',    href: 'work.html',    imgs: ['V11', 'V12'] },
  { label: '( Prototype )', word: 'LABS',    href: 'lab.html',     imgs: ['V13', 'V14'] },
  { label: '( Dialogue )',  word: 'CONTACT', href: 'contact.html', imgs: ['V15', 'V16'] },
];

export function pageKey() { return document.body.dataset.page || 'home'; }

/* ---------------- header ---------------- */
export function mountHeader() {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="h-pill">
      <a class="h-mail" href="contact.html" aria-label="Contact">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="1"/><path d="M2 6l10 7L22 6"/></svg>
      </a>
      <a class="h-logo" href="index.html" aria-label="${BRAND} home">U<span class="dot"></span></a>
      <button class="h-burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
    </div>`;
  document.body.prepend(header);
}

/* ---------------- menu overlay ---------------- */
export function mountMenu() {
  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  overlay.innerHTML = `
    <nav class="menu-nav" aria-label="Main">
      <ul>
        ${NAV.map((n, i) => `
          <li data-idx="${i}">
            <a href="${n.href}">
              <span class="m-label">${n.label}</span>
              <span class="m-word" data-roll>${n.word}</span>
            </a>
          </li>`).join('')}
      </ul>
    </nav>
    <aside class="menu-side">
      <div class="ms-words">DESIGN<br><span class="mono ink-2" style="font-stretch:100%;font-weight:400">( Web · SEO · AEO )</span><br>SELLS</div>
      <div class="ms-lists">
        <ul><li>Custom Websites</li><li>Landing Pages</li><li>Sales Funnels</li><li>Website Optimization</li></ul>
        <ul><li>SEO</li><li>AEO and AIO</li><li>Blog Writing</li><li>Traffic Generation</li></ul>
      </div>
      <div class="ms-links">
        <a href="about.html" data-roll>About</a><a href="work.html" data-roll>Work</a>
        <a href="lab.html" data-roll>Labs</a><a href="blog.html" data-roll>Blog</a>
        <a href="contact.html" data-roll>Contact</a>
      </div>
      <div class="ms-chips">
        <span class="chip">( Hand-Coded Builds )</span><span class="chip">( No Templates )</span>
        <span class="chip">( Search and AI Ready )</span><span class="chip">( Built in Days )</span>
      </div>
      <p class="ms-tagline">Websites that look expensive and get found.<br>Built to turn visitors into customers.<br>Fast, lean, fairly priced.</p>
      <a class="mono" href="#" data-email>&nbsp;</a>
      <div class="ms-foot">
        <span>${BRAND} Studio 2026©</span>
        <span><a href="work.html">Work</a>&ensp;<a href="blog.html">Journal</a>&ensp;<a href="contact.html">Contact</a></span>
      </div>
    </aside>`;
  document.body.appendChild(overlay);

  // obfuscated email
  const em = overlay.querySelector('[data-email]');
  const addr = ['hello', 'unleeshai.com'].join('@');
  em.textContent = addr;
  em.href = 'mailto:' + addr;

  // preview images
  const pvA = document.createElement('div');
  pvA.className = 'menu-preview a';
  pvA.innerHTML = '<img alt="">';
  const pvB = document.createElement('div');
  pvB.className = 'menu-preview b';
  pvB.innerHTML = '<img alt="">';
  document.body.append(pvA, pvB);

  const xA = gsap.quickTo(pvA, 'x', { duration: 0.6, ease: 'power3' });
  const yA = gsap.quickTo(pvA, 'y', { duration: 0.6, ease: 'power3' });
  const xB = gsap.quickTo(pvB, 'x', { duration: 0.6, ease: 'power3' });
  const yB = gsap.quickTo(pvB, 'y', { duration: 0.6, ease: 'power3' });

  overlay.querySelectorAll('.menu-nav li').forEach((li) => {
    const n = NAV[+li.dataset.idx];
    li.addEventListener('mouseenter', () => {
      pvA.querySelector('img').src = `assets/img/${n.imgs[0]}.webp?v=2`;
      pvB.querySelector('img').src = `assets/img/${n.imgs[1]}.webp?v=2`;
      gsap.to([pvA, pvB], { opacity: 1, scale: 1, duration: 0.3 });
    });
    li.addEventListener('mouseleave', () => {
      gsap.to([pvA, pvB], { opacity: 0, scale: 0.9, duration: 0.3 });
    });
  });
  overlay.addEventListener('mousemove', (e) => {
    xA(e.clientX + 40); yA(e.clientY - 20 - 170);
    xB(e.clientX + 220); yB(e.clientY + 60 - 170);
  });

  // open / close
  const burger = document.querySelector('.h-burger');
  let open = false;
  const items = overlay.querySelectorAll('.menu-nav li');

  function openMenu() {
    open = true;
    overlay.classList.add('is-open');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    stopScroll();
    gsap.fromTo(overlay, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power4.inOut' });
    gsap.fromTo(items, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, delay: 0.4, ease: 'expo.out' });
  }
  function closeMenu() {
    open = false;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    gsap.to(overlay, {
      clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'power4.inOut',
      onComplete: () => { overlay.classList.remove('is-open'); startScroll(); },
    });
    gsap.to([pvA, pvB], { opacity: 0, duration: 0.2 });
  }
  burger.addEventListener('click', () => (open ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) closeMenu(); });
  overlay.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', () => { if (open) closeMenu(); }));
}

/* ---------------- footer ---------------- */
export function mountFooter() {
  const key = pageKey();
  if (document.body.dataset.noFooter !== undefined && key === 'project') return;

  const isHome = key === 'home';
  const isContact = key === 'contact';
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <video class="f-video" src="assets/video/V34.mp4?v=2" autoplay muted loop playsinline></video>
    <div class="f-inner">
      ${isHome ? `
      <div class="f-meta">
        <p>Custom Web Studio</p>
        <p>Websites · SEO · AI Search</p>
        <p>Est. 2026 · ${CITY}</p>
        <p class="f-para" data-reveal-lines>We build custom websites for businesses that refuse to look ordinary, then do the work that gets them found: SEO, AI search, content and funnels, all tuned to turn attention into customers.</p>
      </div>` : ''}
      <div class="f-big">
        <a class="f-email display" href="mailto:${EMAIL}" data-reveal-lines>${EMAIL}</a>
        <p class="f-addr mono ink-2">Remote studio, serving clients across the US</p>
      </div>
      <div class="f-grid">
        <div class="f-social mono">
          <a href="work.html" data-roll>work</a>
          <a href="about.html" data-roll>about</a>
          <a href="contact.html" data-roll>contact</a>
          <a href="blog.html" data-roll>blog</a>
        </div>
      </div>
    </div>
    <div class="f-plate">
      <span class="fp-mark" aria-hidden="true">©</span>
      <div class="fp-legal mono-s">
        <span>UnleeshAI</span>
        <span>© 2026 UnleeshAI. All rights reserved.</span>
      </div>
      <span class="fp-word" aria-hidden="true">${BRAND}<i class="dot"></i></span>
    </div>`;
  document.querySelector('main').after(footer);
}

/* ---------------- back to top ---------------- */
export function mountBackTop() {
  const btn = document.createElement('button');
  btn.className = 'back-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = icon('up');
  document.body.appendChild(btn);
}

/* ---------------- preloader ---------------- */
export function mountPreloader(onDone) {
  const key = pageKey();
  const meta = PAGES[key] || PAGES.home;
  const short = seenPreloader();

  const pl = document.createElement('div');
  pl.className = 'preloader';
  const letters = BRAND.split('');
  // the second E (index 4) becomes the video letter
  const wordHTML = letters.map((ch, i) =>
    i === 4
      ? `<span class="pl-letter is-video"><video src="assets/video/V01.mp4?v=2" autoplay muted loop playsinline></video></span>`
      : `<span class="pl-letter"><span>${ch}</span></span>`
  ).join('');

  pl.innerHTML = `
    <div class="pl-corner pl-tl tabular">[ <span class="pl-count">00</span> ]</div>
    <div class="pl-corner pl-tc">${BRAND}</div>
    <div class="pl-corner pl-tr">${(location.pathname.split('/').pop() || meta.file)}</div>
    <div class="pl-word">${wordHTML}</div>
    <div class="pl-corner pl-bl">
      <p>${BRAND} WEB STUDIO</p>
      <p>${meta.name}</p>
      <p>${meta.sub}</p>
    </div>
    <div class="pl-corner pl-br">
      <p>Websites / Search / Conversion</p>
      <p>2026</p>
    </div>`;
  document.body.appendChild(pl);
  stopScroll();
  document.dispatchEvent(new CustomEvent('preloader:mounted', { detail: pl }));   // nx-chrome hook

  const finish = () => {
    markPreloaderSeen();
    pl.remove();
    startScroll();
    document.body.classList.add('pl-done');
    document.dispatchEvent(new CustomEvent('preloader:done'));
    onDone && onDone();
  };

  if (reducedMotion) {
    setTimeout(() => { gsap.to(pl, { opacity: 0, duration: 0.4, onComplete: finish }); }, 400);
    return;
  }

  const countEl = pl.querySelector('.pl-count');
  const letterEls = pl.querySelectorAll('.pl-letter > span, .pl-letter.is-video');
  const corners = pl.querySelectorAll('.pl-corner');
  const main = document.querySelector('main');
  gsap.set(main, { scale: 1.04, opacity: 0.6, transformOrigin: '50% 0%' });

  const dur = short ? 0.5 : 2.0;
  const tl = gsap.timeline();
  tl.from(corners, { opacity: 0, duration: 0.4 }, 0)
    .from(letterEls, { yPercent: 100, duration: 0.8, ease: 'expo.out', stagger: 0.018 * 6 }, 0.2);
  const counter = { v: 0 };
  tl.to(counter, {
    v: 100, duration: dur, ease: 'power2.inOut',
    onUpdate: () => { countEl.textContent = String(Math.round(counter.v)).padStart(2, '0'); },
  }, 0.3);
  tl.to(letterEls, { yPercent: -100, duration: 0.6, ease: 'expo.in', stagger: 0.02 }, short ? '+=0' : '+=0.2')
    .to(pl, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut' })
    .to(main, { scale: 1, opacity: 1, duration: 1, ease: 'power4.inOut' }, '<')
    // a leftover transform on <main> would break position:fixed pinning inside it
    .set(main, { clearProps: 'transform,opacity' })
    .call(() => ScrollTrigger.refresh())
    .call(finish);
}

/* ---------------- transition layer ---------------- */
let navigating = false;

export function mountTransitions(reinit) {
  const layer = document.createElement('div');
  layer.className = 'transition-layer';
  layer.innerHTML = '<p class="tl-caption"></p>';
  document.body.appendChild(layer);
  const caption = layer.querySelector('.tl-caption');

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || navigating) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || a.target === '_blank') return;
    e.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', () => location.reload());

  async function navigate(href) {
    navigating = true;
    const from = (PAGES[pageKey()] || PAGES.home).name.toLowerCase();
    const toKey = keyForHref(href);
    caption.textContent = `${BRAND} · ${PAGES[toKey].name}`;

    layer.classList.add('is-open');
    layer.style.visibility = 'visible';
    document.dispatchEvent(new CustomEvent('transition:leave'));   // nx pixel grid hook
    await gsap.fromTo(layer, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power4.inOut' });

    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error(res.status);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newMain = doc.querySelector('main');
      const oldMain = document.querySelector('main');

      // the target page's own stylesheets must be in place before its main is shown
      await loadStylesheets(doc);

      ScrollTrigger.getAll().forEach((st) => st.kill());
      document.querySelector('.site-footer')?.remove();
      // transient overlays the leaving page appended to <body>
      document.querySelectorAll('.in-preview, .sector-preview, .view-pill, .lightbox, .ct-modal').forEach((n) => n.remove());
      document.body.classList.remove('cursor-hot');
      oldMain.replaceWith(newMain);
      document.body.dataset.page = doc.body.dataset.page || 'home';
      if (doc.body.dataset.noFooter !== undefined) document.body.dataset.noFooter = '';
      else delete document.body.dataset.noFooter;
      document.title = doc.title;
      history.pushState({}, '', href);
      (lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0));

      mountFooter();
      reinit && reinit();
      ScrollTrigger.refresh();

      document.dispatchEvent(new CustomEvent('transition:enter'));   // nx pixel grid hook
      await gsap.to(layer, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut', delay: 0.15 });
      layer.style.visibility = 'hidden';
    } catch {
      location.href = href; // graceful fallback (e.g. file:// fetch restrictions)
    }
    navigating = false;
  }
}

/* append any stylesheet the fetched document links that this one does not have yet */
function loadStylesheets(doc) {
  const have = new Set([...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute('href')));
  const missing = [...doc.querySelectorAll('link[rel="stylesheet"]')].filter((l) => !have.has(l.getAttribute('href')));
  return Promise.all(missing.map((l) => new Promise((resolve) => {
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = l.getAttribute('href');
    el.onload = el.onerror = resolve;
    document.head.appendChild(el);
  })));
}

/* helper for pages: mount everything shared */
export function mountChrome() {
  mountHeader();
  mountMenu();
  mountFooter();
  mountBackTop();
  document.querySelectorAll('[data-roll]').forEach(makeRoll);
  document.body.classList.add('chrome-ready');
}

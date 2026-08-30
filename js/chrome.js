/* UNLEESH — shared chrome: header, menu overlay, footer, preloader, transition layer */
import { icon } from './icons.js';
import { stopScroll, startScroll, reducedMotion, seenPreloader, markPreloaderSeen, makeRoll, lenis } from './core.js';

export const BRAND = 'UNLEESH';
export const EMAIL = 'hello@unleesh.ai';
export const PHONE = '+1 (415) 555-0134';
export const CITY = 'San Francisco';

const PAGES = {
  home:    { file: 'index.html',        name: 'HOME',    sub: 'Shared page-transition layer for the home page and work archive.' },
  about:   { file: 'about.html',        name: 'ABOUT',   sub: 'Brand Strategy & Creative Direction' },
  work:    { file: 'work.html',         name: 'WORK',    sub: 'Shared page-transition layer for the home page and work archive.' },
  project: { file: 'work_cont.html',    name: 'PROJECT', sub: 'Project Showcase' },
  lab:     { file: 'lab.html',          name: 'LABS',    sub: 'UNLEESH Labs — Editorial Grid' },
  contact: { file: 'contact.html',      name: 'CONTACT', sub: 'ABOUT YOUR NEXT DIGITAL TRANSFORMATION' },
  blog:    { file: 'blog.html',         name: 'JOURNAL', sub: 'Shared page-transition layer for the journal and article pages.' },
};

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
    <a class="h-contact" href="contact.html" data-roll>contact</a>
    <div class="h-right">
      <a class="h-logo" href="index.html" aria-label="${BRAND} home">${BRAND}<span class="dot"></span></a>
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
      <div class="ms-words">STUDIO<br><span class="mono ink-2" style="font-stretch:100%;font-weight:400">( Brand Direction )</span><br>DIGITAL</div>
      <div class="ms-lists">
        <ul><li>Core Strategy</li><li>Brand Identity</li><li>Content Creative</li><li>Tech Trend Practice</li></ul>
        <ul><li>Creative Strategy</li><li>Brand Identity</li><li>Creative Content</li><li>Web Design</li></ul>
      </div>
      <div class="ms-links">
        <a href="about.html" data-roll>About</a><a href="work.html" data-roll>Work</a>
        <a href="lab.html" data-roll>Labs</a><a href="blog.html" data-roll>Blog</a>
        <a href="contact.html" data-roll>Contact</a>
      </div>
      <div class="ms-chips">
        <span class="chip">( Web Interaction Dev )</span><span class="chip">( Motion Design )</span>
        <span class="chip">( High-End Web Design )</span><span class="chip">( Brand Core Identity )</span>
      </div>
      <p class="ms-tagline">Strategy, design and development under one roof.<br>AI-accelerated, obsessively crafted.<br>Fast, lean, fairly priced.</p>
      <a class="mono" href="#" data-email>&nbsp;</a>
      <h1 class="sr-only">UNLEESH — AI-native web design &amp; motion studio</h1>
      <div class="ms-foot">
        <span>${BRAND} Studio 2026©</span>
        <span><a href="#" rel="noopener">Instagram</a>&ensp;<a href="#" rel="noopener">Threads</a>&ensp;<a href="#" rel="noopener">Facebook</a></span>
      </div>
    </aside>`;
  document.body.appendChild(overlay);

  // obfuscated email
  const em = overlay.querySelector('[data-email]');
  const addr = ['hello', 'unleesh.ai'].join('@');
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
      pvA.querySelector('img').src = `assets/img/${n.imgs[0]}.webp`;
      pvB.querySelector('img').src = `assets/img/${n.imgs[1]}.webp`;
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
    <video class="f-video" src="assets/video/V34.mp4" autoplay muted loop playsinline></video>
    <div class="f-inner">
      ${isHome ? `
      <div class="f-meta">
        <p>Web Design Studio</p>
        <p>Commercial Visual · AI Motion</p>
        <p>Est. 2026 · ${CITY}</p>
        <p class="f-para" data-reveal-lines>We build digital flagships for brands that refuse to look ordinary: AI-accelerated commercial visuals, motion systems and hand-coded interfaces, all tuned to convert attention into belief.</p>
      </div>` : ''}
      <div class="f-grid">
        <div class="f-contact">
          <p><a href="mailto:${EMAIL}" data-roll>${EMAIL}</a> &ensp; ${PHONE}</p>
          <p class="ink-2">${isContact ? `${CITY}, CA ｜ ${PHONE}` : `94107 · ${CITY}, California`}</p>
        </div>
        <div class="f-social mono">
          <a href="#" data-roll rel="noopener">Instagram</a>
          <a href="#" data-roll rel="noopener">Threads</a>
          <a href="#" data-roll rel="noopener">Facebook</a>
          <a href="blog.html" data-roll>blog</a>
        </div>
      </div>
      <div class="f-bottom">
        <span>©</span>
        <span>Unleesh Creative, Inc.</span>
        <span>© 2026 ${BRAND} STUDIO. ALL RIGHTS RESERVED.</span>
      </div>
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
      ? `<span class="pl-letter is-video"><video src="assets/video/V01.mp4" autoplay muted loop playsinline></video></span>`
      : `<span class="pl-letter"><span>${ch}</span></span>`
  ).join('');

  pl.innerHTML = `
    <div class="pl-corner pl-tl tabular">[ <span class="pl-count">00</span> ]</div>
    <div class="pl-corner pl-tc">${BRAND}</div>
    <div class="pl-corner pl-tr">${(location.pathname.split('/').pop() || meta.file)}</div>
    <div class="pl-word">${wordHTML}</div>
    <div class="pl-corner pl-bl">
      <p>${BRAND} CREATIVE STUDIO</p>
      <p>${meta.name}</p>
      <p>${meta.sub}</p>
    </div>
    <div class="pl-corner pl-br">
      <p>Digital / Motion / Interface</p>
      <p>2026</p>
    </div>`;
  document.body.appendChild(pl);
  stopScroll();

  const finish = () => {
    markPreloaderSeen();
    pl.remove();
    startScroll();
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
    const toKey = Object.keys(PAGES).find((k) => PAGES[k].file === href.split('#')[0]) || 'home';
    caption.textContent = `Shared page-transition layer for the ${from} page and the ${PAGES[toKey].name.toLowerCase()} page.`;

    layer.classList.add('is-open');
    layer.style.visibility = 'visible';
    await gsap.fromTo(layer, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power4.inOut' });

    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error(res.status);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newMain = doc.querySelector('main');
      const oldMain = document.querySelector('main');

      ScrollTrigger.getAll().forEach((st) => st.kill());
      document.querySelector('.site-footer')?.remove();
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

      await gsap.to(layer, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut', delay: 0.15 });
      layer.style.visibility = 'hidden';
    } catch {
      location.href = href; // graceful fallback (e.g. file:// fetch restrictions)
    }
    navigating = false;
  }
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

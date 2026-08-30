# One-shot patch: char reveals, magnetic buttons, edge light, underline sweeps,
# preloader-done event, masked kickers, cube backface. Run from repo root.
import io

def rw(path, fn):
    s = io.open(path, encoding='utf-8').read()
    out = fn(s)
    io.open(path, 'w', encoding='utf-8').write(out)

# ---------- core.js ----------
CORE_ADD = '''

/* ---------- per-character display reveal (STUDIO / DIGITAL / THE SECTORS) ---------- */
export function revealChars(el, opts = {}) {
  if (reducedMotion || !el || el.dataset.charsDone) return;
  el.dataset.charsDone = '1';
  const chars = splitChars(el);
  gsap.from(chars, {
    yPercent: 115, duration: 0.9, ease: 'expo.out',
    stagger: opts.stagger ?? 0.035, delay: opts.delay ?? 0,
    ...(opts.trigger ? { scrollTrigger: { trigger: opts.trigger, start: 'top 80%', once: true } } : {}),
  });
}

/* ---------- magnetic buttons: lean toward the pointer, snap back elastic ---------- */
export function initMagnetic(selector) {
  if (reducedMotion || matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll(selector).forEach((el) => {
    if (el.dataset.magnetic) return;
    el.dataset.magnetic = '1';
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)', overwrite: true });
    });
  });
}
'''
rw('js/core.js', lambda s: s + CORE_ADD)

# ---------- chrome.js: announce preloader completion ----------
def chrome(s):
    old = """  const finish = () => {
    markPreloaderSeen();
    pl.remove();
    startScroll();
    onDone && onDone();
  };"""
    new = """  const finish = () => {
    markPreloaderSeen();
    pl.remove();
    startScroll();
    document.body.classList.add('pl-done');
    document.dispatchEvent(new CustomEvent('preloader:done'));
    onDone && onDone();
  };"""
    assert old in s
    return s.replace(old, new)
rw('js/chrome.js', chrome)

# ---------- main.js: magnetic targets ----------
def main_js(s):
    s = s.replace("  initProgressBar, initGrain,\n} from './core.js';",
                  "  initProgressBar, initGrain, initMagnetic,\n} from './core.js';")
    s = s.replace("  initBackTop();\n  const fn = pageInits[pageKey()];",
                  "  initBackTop();\n  initMagnetic('.hero-prev, .hero-next, .h-mail, .h-burger, .back-top, .cf-submit, .hx-social a, .f-social a, .pj-pager a');\n  const fn = pageInits[pageKey()];")
    assert 'initMagnetic(' in s
    return s
rw('js/main.js', main_js)

# ---------- page-home.js: char reveals ----------
def home_js(s):
    s = s.replace("import { reducedMotion } from './core.js';",
                  "import { reducedMotion, revealChars } from './core.js';")
    old = """  const hero = document.querySelector('.hero');
  if (hero) initHero(hero);
"""
    new = """  const hero = document.querySelector('.hero');
  if (hero) initHero(hero);
  // STUDIO / DIGITAL stagger in per character once the curtain lifts
  const mastReveal = () => document.querySelectorAll('.hx-word').forEach((w, i) => revealChars(w, { delay: i * 0.15 }));
  if (document.body.classList.contains('pl-done')) mastReveal();
  else document.addEventListener('preloader:done', mastReveal, { once: true });
"""
    assert old in s
    s = s.replace(old, new, 1)
    old2 = """  // heading settles in
  gsap.from(section.querySelector('.sa-title'), {
    y: 60, opacity: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: section, start: 'top 70%', once: true },
  });"""
    new2 = """  // heading staggers in per character on enter
  revealChars(section.querySelector('.sa-title'), { trigger: section, stagger: 0.04 });"""
    assert old2 in s
    return s.replace(old2, new2)
rw('js/page-home.js', home_js)

# ---------- index.html: masked reveals on remaining kickers ----------
def idx(s):
    s = s.replace('<p class="wl-statement">', '<p class="wl-statement" data-reveal-lines>')
    s = s.replace('<p class="sa-sub">', '<p class="sa-sub" data-reveal-lines>')
    return s
rw('index.html', idx)

# ---------- CSS ----------
CSS_ADD = '''
/* flowing light along image edges on hover (work cards) */
@property --edge-a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.work-card .reveal-img, .work-card2 .reveal-img { position: relative; }
.work-card .reveal-img::after, .work-card2 .reveal-img::after {
  content: ''; position: absolute; inset: 0; padding: 1px; pointer-events: none;
  background: conic-gradient(from var(--edge-a), transparent 0 68%, rgba(255,255,255,0.95) 84%, transparent 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity 0.4s;
}
.work-card:hover .reveal-img::after, .work-card2:hover .reveal-img::after {
  opacity: 1; animation: edge-sweep 1.6s linear infinite;
}
@keyframes edge-sweep { to { --edge-a: 360deg; } }

/* underline sweeps on in-hero nav and sitemap links */
.hx-nav a, .bottom-nav a { position: relative; }
.hx-nav a::after, .bottom-nav a::after {
  content: ''; position: absolute; left: 0; bottom: -4px; width: 100%; height: 1px;
  background: var(--ink); transform: scaleX(0); transform-origin: left;
  transition: transform 0.4s var(--ease-out);
}
.hx-nav a:hover::after, .bottom-nav a:hover::after { transform: scaleX(1); }

/* cube: reversed faces must not ghost through */
.cube .face { backface-visibility: hidden; }
/* masthead words are masked per character */
.hx-word { overflow: hidden; }
'''
rw('css/pages/home.css', lambda s: s + CSS_ADD)
print('blueprint patch applied')

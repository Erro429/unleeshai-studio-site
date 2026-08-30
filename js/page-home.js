/* UNLEESH — home: hero + the field (ghost words, dotted letters, clusters) + works */
import { reducedMotion, typeStatus } from './core.js';
import { initHero } from './home-hero.js';

const GHOST_L = ['Core-Site', 'Gen-AI Visual', 'Motion Flow', 'WebGL Realm', '3D Matrix', 'Interaction', 'Pixel Perfect', 'Logic Build', 'Fluid UI', 'Aero Design', 'Pure Code', 'Digital Art'];
const GHOST_R = ['Strategy', 'Design', 'Tech', 'Creative', 'Motion', 'Brand', 'Future', 'Vision', 'System', 'Labs', 'Core', 'Craft'];

const LETTERS = [
  { ch: 'U', top: 9, left: 6 }, { ch: 'N', top: 22, left: 78 },
  { ch: 'L', top: 34, left: 12 }, { ch: 'E', top: 46, left: 70 },
  { ch: 'E', top: 62, left: 8 }, { ch: 'S', top: 74, left: 74 },
  { ch: 'H', top: 88, left: 42 },
];

const CLUSTERS = [
  { top: 2, right: 3, cascade: false, lines: ['Brand Identity', 'Visual Strategy', 'Unleesh Creative'] },
  { top: 14, left: 2, cascade: false, lines: ['Motion Design', 'Micro Interactions', 'Type System', 'Creative Direction'] },
  { top: 40, left: 26, cascade: false, lines: ['Visual Identity', 'Responsive Design', 'Animation Direction', 'UI Component Design', 'Design System', 'Cross-Media Branding', 'Landing Page', 'Scroll Experience', 'WebGL Interface', 'Kinetic Typography'] },
  { top: 55, right: 5, cascade: true, lines: ['Concept Development', 'Market Positioning', 'Brand Personality', 'Audience Insight'] },
  { top: 68, left: 2, cascade: false, lines: ['Design Thinking', 'Prototyping', 'User Research', 'Content Strategy'] },
  { top: 80, left: 2, cascade: true, lines: ['Brand Audit', 'Competitor Analysis', 'Mood Board'] },
  { top: 92, right: 8, cascade: true, lines: ['Style Guide', 'Launch Strategy', 'Prompt Craft'] },
];

const STATUS = [
  { text: 'BRAND IDENTITY SYSTEM :: BUILDING', top: 17, left: 2 },
  { text: 'VISUAL SYSTEM :: LOADING', top: 52, left: 66 },
  { text: 'CREATIVE ENERGY :: CONTINUOUSLY OUTPUTTING', top: 84, left: 30 },
];

export function init() {
  const hero = document.querySelector('.hero');
  if (hero) initHero(hero);

  initWall();
  initField();
  initSectorsArc();
  initWorksParallax();
}


/* THE SECTORS: two rings of small work tiles orbiting the heading —
   continuous slow spin plus extra rotation scrubbed by scroll */
const RING_IMGS = [
  'V40', 'V41', 'V42', 'V43', 'V44', 'V45', 'V46', 'V47', 'V48', 'V49',
  'V55', 'V56', 'V57', 'V58', 'V59', 'V60', 'V63', 'V65', 'V73', 'V75',
  'V17', 'V23', 'V24', 'V25', 'V26', 'V27',
];

function initSectorsArc() {
  const section = document.querySelector('.sectors-arc');
  if (!section) return;
  const outer = section.querySelector('.sa-ring-outer');
  const inner = section.querySelector('.sa-ring-inner');

  const build = (ring, count, radius, imgOffset) => {
    for (let i = 0; i < count; i++) {
      const tile = document.createElement('div');
      tile.className = 'sa-tile';
      const img = RING_IMGS[(i + imgOffset) % RING_IMGS.length];
      tile.innerHTML = `<img src="assets/img/${img}.webp" alt="" loading="lazy">`;
      tile.style.transform = `rotate(${(i / count) * 360}deg) translateY(-${radius}px)`;
      ring.appendChild(tile);
    }
  };

  const rOuter = Math.min(innerWidth * 0.34, 470);
  const rInner = Math.min(innerWidth * 0.23, 320);
  build(outer, 22, rOuter, 0);
  build(inner, 13, rInner, 8);

  if (reducedMotion) return;

  // continuous counter-rotating spin, independent of scroll
  gsap.to(outer, { rotation: 360, duration: 90, repeat: -1, ease: 'none' });
  gsap.to(inner, { rotation: -360, duration: 70, repeat: -1, ease: 'none' });

  // heading settles in
  gsap.from(section.querySelector('.sa-title'), {
    y: 60, opacity: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: section, start: 'top 70%', once: true },
  });
}


/* WORD WALL: pinned stage under the hero — persistent word columns with a
   traveling chip highlight, a cycling center tile, and dotted letters popping */
const WALL_L = [
  ['Core-Site', '( core websites )'], ['Gen-AI Visual', '( generative visuals )'],
  ['Motion Flow', '( motion systems )'], ['WebGL Realm', '( webgl builds )'],
  ['3D Matrix', '( spatial design )'], ['Interaction', '( interaction design )'],
  ['Pixel Perfect', '( pixel craft )'], ['Logic Build', '( logic architecture )'],
  ['Fluid UI', '( fluid interfaces )'], ['Aero Design', '( aero design )'],
  ['Pure Code', '( pure code )'], ['Digital Art', '( digital art )'],
];
const WALL_R = [
  ['Strategy', '( strategy )'], ['Design', '( design )'], ['Tech', '( tech )'],
  ['Creative', '( creative )'], ['Motion', '( motion )'], ['Brand', '( brand )'],
  ['Future', '( future )'], ['Vision', '( vision )'], ['System', '( system )'],
  ['Labs', '( labs )'], ['Core', '( core )'], ['Craft', '( craft )'],
];
const WALL_TILES = ['V18', 'V63', 'V20', 'V40M', 'V57', 'V27', 'V45M', 'V21', 'V48', 'V46M', 'V13', 'V75'];
const WALL_LETTERS = [
  ['U', 12, 70], ['N', 74, 26], ['L', 20, 30], ['E', 68, 64],
  ['E', 30, 74], ['S', 78, 44], ['H', 16, 52],
];

function initWall() {
  const wall = document.querySelector('.wall');
  if (!wall) return;
  const colL = wall.querySelector('.wl-col-l');
  const colR = wall.querySelector('.wl-col-r');
  const tile = wall.querySelector('.wl-tile');
  const letterEl = wall.querySelector('.wl-letter');

  const rowsL = WALL_L.map(([word, chip]) => {
    const row = document.createElement('div');
    row.className = 'wl-row';
    row.innerHTML = `<span class="wl-word">${word}</span><span class="wl-chip">${chip}</span>`;
    colL.appendChild(row);
    return row;
  });
  const rowsR = WALL_R.map(([word, chip]) => {
    const row = document.createElement('div');
    row.className = 'wl-row';
    row.innerHTML = `<span class="wl-chip">${chip}</span><span class="wl-word">${word}</span>`;
    colR.appendChild(row);
    return row;
  });
  const tiles = WALL_TILES.map((id, i) => {
    const img = document.createElement('img');
    img.src = `assets/img/${id}.webp`;
    img.alt = '';
    if (i === 0) img.classList.add('is-on');
    tile.appendChild(img);
    return img;
  });

  if (reducedMotion) {
    rowsL[0].classList.add('is-on'); rowsR[0].classList.add('is-on');
    return;
  }

  let step = -1, tileIdx = 0, letterIdx = -1;
  const STEPS = WALL_L.length;

  ScrollTrigger.create({
    trigger: wall, start: 'top top', end: '+=320%',
    pin: true, scrub: true, anticipatePin: 1,
    onUpdate: (self) => {
      const s = Math.min(STEPS - 1, Math.floor(self.progress * STEPS));
      if (s !== step) {
        if (step >= 0) { rowsL[step].classList.remove('is-on'); rowsR[step].classList.remove('is-on'); }
        rowsL[s].classList.add('is-on'); rowsR[s].classList.add('is-on');
        step = s;
      }
      const t = Math.min(tiles.length - 1, Math.floor(self.progress * tiles.length));
      if (t !== tileIdx) {
        tiles[tileIdx].classList.remove('is-on');
        tiles[t].classList.add('is-on');
        tileIdx = t;
      }
      const li = Math.min(WALL_LETTERS.length - 1, Math.floor(self.progress * WALL_LETTERS.length));
      if (li !== letterIdx) {
        const [ch, top, left] = WALL_LETTERS[li];
        letterEl.classList.remove('is-on');
        setTimeout(() => {
          letterEl.textContent = ch;
          letterEl.style.top = top + '%';
          letterEl.style.left = left + '%';
          letterEl.classList.add('is-on');
        }, 180);
        letterIdx = li;
      }
    },
  });
}

function initField() {
  const field = document.querySelector('.field');
  if (!field) return;

  // ghosted service-word arcs: left column drifts right as it descends, right column mirrors
  GHOST_L.forEach((w, i) => {
    const el = document.createElement('span');
    el.className = 'fd-ghost';
    el.textContent = w;
    el.style.top = (5 + i * 7.6) + '%';
    el.style.left = (4 + Math.sin(i / GHOST_L.length * Math.PI) * 14) + '%';
    field.appendChild(el);
  });
  GHOST_R.forEach((w, i) => {
    const el = document.createElement('span');
    el.className = 'fd-ghost';
    el.textContent = w;
    el.style.top = (5 + i * 7.6) + '%';
    el.style.right = (4 + Math.sin(i / GHOST_R.length * Math.PI) * 14) + '%';
    field.appendChild(el);
  });

  // dotted letters, each on a dim portrait media tile (reference pattern)
  const LETTER_TEX = ['V21', 'V18', 'V22', 'V20', 'V19', 'V26', 'V13'];
  const letterEls = LETTERS.map(({ ch, top, left }, i) => {
    const tile = document.createElement('div');
    tile.className = 'fd-ltile';
    tile.style.top = top + '%';
    tile.style.left = left + '%';
    tile.innerHTML = `<img src="assets/img/${LETTER_TEX[i]}.webp" alt="">` +
      `<div class="fd-letter">${ch}</div>`;
    field.appendChild(tile);
    return tile;
  });

  // label clusters
  CLUSTERS.forEach((c) => {
    const el = document.createElement('div');
    el.className = 'fd-cluster' + (c.cascade ? ' cascade' : '');
    el.innerHTML = c.lines.map((l) => `<span>${l}</span>`).join('');
    el.style.top = c.top + '%';
    if (c.left !== undefined) el.style.left = c.left + '%';
    if (c.right !== undefined) el.style.right = c.right + '%';
    field.appendChild(el);
  });

  // ---- crossing streams + cube depth journey: one master scrub timeline ----
  const zone = field.querySelector('.band-zone');

  // tumbling photo cubes; the hero cube runs a far-to-near journey on the timeline
  const CUBES = [
    { top: 30, left: 38, size: 340, faces: ['V45M', 'V29', 'V45', 'V41', 'V40M', 'V28'], sx: 9, sy: 13, hero: true },
    { top: 64, left: 76, size: 130, faces: ['V46M', 'V33', 'V46', 'V18', 'V20', 'V22'], sx: -16, sy: 11 },
  ];
  let heroCube = null;
  CUBES.forEach(({ top, left, size, faces, sx, sy, hero }) => {
    const wrap = document.createElement('div');
    wrap.className = 'fd-cube';
    wrap.style.top = top + '%';
    wrap.style.left = left + '%';
    wrap.style.width = wrap.style.height = size + 'px';
    const half = size / 2;
    const T = [
      `translateZ(${half}px)`, `rotateY(180deg) translateZ(${half}px)`,
      `rotateY(90deg) translateZ(${half}px)`, `rotateY(-90deg) translateZ(${half}px)`,
      `rotateX(90deg) translateZ(${half}px)`, `rotateX(-90deg) translateZ(${half}px)`,
    ];
    wrap.innerHTML = `<div class="fd-cube-core">` +
      faces.map((f, k) => `<div class="face" style="transform:${T[k]}"><img src="assets/img/${f}.webp" alt="" loading="lazy"></div>`).join('') +
      `</div>`;
    if (hero) {
      heroCube = wrap;
      wrap.classList.add('fd-cube-hero');
      (field.querySelector('.bz-stage') || field).appendChild(wrap);
    } else {
      field.appendChild(wrap);
    }
    if (!reducedMotion) {
      const core = wrap.querySelector('.fd-cube-core');
      // tumble stays time-based (reference cube keeps turning while scroll dwells)
      gsap.to(core, { rotationX: 360, duration: Math.abs(360 / sx) * 2, repeat: -1, ease: 'none' });
      gsap.to(core, { rotationY: sx > 0 ? 360 : -360, duration: Math.abs(360 / sy) * 2, repeat: -1, ease: 'none' });
      if (!hero) {
        gsap.to(wrap, {
          y: -120, ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    }
  });

  // master scrub timeline: streams cross, cube grows and descends,
  // corner letters rise, ghost words dim through the crossing
  const ghostEls = [...field.querySelectorAll('.fd-ghost')];
  if (zone && !reducedMotion && innerWidth >= 1024) {
    const line = zone.querySelector('.bz-line');

    // per-glyph decode: letters materialize from scrambled dot-matrix characters
    const POOL = 'UNLESHDOTMXKW0247';
    const chars = [];
    line.querySelectorAll('span').forEach((word) => {
      const text = word.textContent;
      word.textContent = '';
      [...text].forEach((ch) => {
        const c = document.createElement('b');
        c.style.cssText = 'display:inline-block;font:inherit;';
        c.dataset.final = ch;
        c.textContent = ch;
        word.appendChild(c);
        chars.push(c);
      });
    });
    let decoded = false;
    const decode = () => {
      if (decoded) return;
      decoded = true;
      chars.forEach((c, i) => {
        const flips = 3 + Math.floor(Math.random() * 3);
        let n = 0;
        c.style.opacity = 0;
        setTimeout(() => {
          c.style.opacity = 1;
          const iv = setInterval(() => {
            n++;
            c.textContent = n >= flips ? c.dataset.final : POOL[Math.floor(Math.random() * POOL.length)];
            if (n >= flips) clearInterval(iv);
          }, 65);
        }, i * 22);
      });
    };

    // decode fires when the line itself becomes visible, not the zone
    ScrollTrigger.create({ trigger: line, start: 'top 94%', once: true, onEnter: decode });

    // tile theater: a different work image on every scroll step after the cube
    const THEATER = ['V40M', 'V63', 'V42M', 'V57', 'V46M', 'V27', 'V45M', 'V21', 'V48', 'V43M', 'V75', 'V41M'];
    const theater = zone.querySelector('.bz-theater');
    const sentinels = [zone.querySelector('.bz-o'), zone.querySelector('.bz-t')];
    const timgs = THEATER.map((id, i) => {
      const img = document.createElement('img');
      img.src = `assets/img/${id}.webp`;
      img.alt = '';
      if (i === 0) img.classList.add('is-on');
      theater.appendChild(img);
      return img;
    });
    let ti = 0;
    const THEATER_START = 0.44;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: zone, start: 'top bottom', end: 'bottom top', scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          const on = p >= THEATER_START;
          theater.classList.toggle('is-on', on);
          sentinels.forEach((s) => s.classList.toggle('is-on', on));
          if (on) {
            const idx = Math.min(timgs.length - 1,
              Math.floor(((p - THEATER_START) / (1 - THEATER_START)) * timgs.length));
            if (idx !== ti) {
              timgs[ti].classList.remove('is-on');
              timgs[idx].classList.add('is-on');
              ti = idx;
            }
          }
        },
      },
    });
    // one line, slow left drift persisting across the whole stretch
    tl.fromTo(line, { x: '14vw' }, { x: '-58vw', ease: 'none', duration: 1 }, 0);
    // cube grows in place during the opening act, then hands off to the theater
    if (heroCube) {
      tl.fromTo(heroCube,
        { scale: 0.1, y: '-4vh' },
        { scale: 1.3, y: '8vh', ease: 'none', duration: 0.42 }, 0)
        .to(heroCube, { autoAlpha: 0, scale: 1.45, ease: 'none', duration: 0.06 }, 0.42);
    }
    // stray brand letters rise from the bottom corners, staggered
    tl.fromTo(zone.querySelector('.bz-cl'), { yPercent: 140 }, { yPercent: 8, ease: 'none' }, 0)
      .fromTo(zone.querySelector('.bz-cr'), { yPercent: 170 }, { yPercent: 22, ease: 'none' }, 0.3);
    // clean stage: ghost words and letter tiles clear out entirely, then return
    const tiles = [...field.querySelectorAll('.fd-ltile')];
    tl.to([...ghostEls, ...tiles], { opacity: 0, duration: 0.14 }, 0.18)
      .to(ghostEls, { opacity: 0.55, duration: 0.18 }, 0.8)
      .to(tiles, { opacity: 1, duration: 0.18 }, 0.8);
  } else if (zone) {
    // static composed state
    gsap.set(zone.querySelector('.bz-line'), { x: '-8vw' });
    gsap.set(zone.querySelectorAll('.bz-corner'), { yPercent: -20 });
  }

  // the centered frame continues the journey as a flat cycling photo tile
  const frame = field.querySelector('.fd-frame');
  if (frame) {
    const FRAME_IMGS = ['V48', 'V40M', 'V63', 'V46M', 'V57', 'V42M'];
    const fimgs = FRAME_IMGS.map((id, i) => {
      const img = document.createElement('img');
      img.src = `assets/img/${id}.webp`;
      img.alt = '';
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;';
      if (i === 0) img.style.opacity = 1;
      frame.appendChild(img);
      return img;
    });
    if (!reducedMotion) {
      let fi = 0;
      ScrollTrigger.create({
        trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(fimgs.length - 1, Math.floor(self.progress * fimgs.length));
          if (idx !== fi) {
            fimgs[fi].style.opacity = 0;
            fimgs[idx].style.opacity = 1;
            fi = idx;
          }
        },
      });
    }
  }

  // typewriter status lines
  const statusEls = STATUS.map((s) => {
    const el = document.createElement('div');
    el.className = 'status fd-status';
    el.dataset.text = s.text;
    el.style.top = s.top + '%';
    el.style.left = s.left + '%';
    el.innerHTML = '<span class="typed"></span><span class="cursor">█</span>';
    field.appendChild(el);
    return el;
  });

  // persistent DOWN indicator while the field is on screen
  const down = document.createElement('div');
  down.className = 'field-down';
  down.innerHTML = '<span class="chev">⌄</span>DOWN';
  document.body.appendChild(down);
  ScrollTrigger.create({
    trigger: field, start: 'top 60%', end: 'bottom bottom',
    onToggle: (self) => down.classList.toggle('is-visible', self.isActive),
  });

  if (reducedMotion) {
    statusEls.forEach(typeStatus);
    return;
  }

  // blur-in reveals for everything in the field
  field.querySelectorAll('.fd-ghost, .fd-cluster, .fd-statement, .fd-texture, .fd-frame').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, filter: 'blur(8px)', y: 30 },
      {
        opacity: el.classList.contains('fd-ghost') ? 0.55 : 1,
        filter: 'blur(0px)', y: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
  });

  // dotted letters scale-settle in, one per stretch
  letterEls.forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, scale: 0.6, rotation: -4 },
      {
        opacity: 1, scale: 1, rotation: 0, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      });
    // slow drift while passing through
    gsap.to(el, {
      y: -60, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // status lines type once when reached
  statusEls.forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => typeStatus(el),
    });
  });

  // gentle pointer parallax on ghosts
  const ghosts = [...field.querySelectorAll('.fd-ghost')];
  field.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / innerWidth - 0.5) * 2;
    ghosts.forEach((g, i) => {
      if (i % 2) return;
      gsap.to(g, { xPercent: nx * -4, duration: 1.4, ease: 'power3.out', overwrite: 'auto' });
    });
  });
}

function initWorksParallax() {
  if (reducedMotion) return;
  document.querySelectorAll('.work-card').forEach((card, i) => {
    gsap.to(card, {
      y: i % 2 ? 40 : -40, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

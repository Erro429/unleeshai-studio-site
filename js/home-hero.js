/* UNLEESH — home hero: WebGL liquid-melt carousel (noise displacement +
   chromatic aberration), cursor-reactive, with waveform + frosted filmstrip */
import { reducedMotion } from './core.js';

const SLIDES = [
  { title: 'UNLEESH BRAND CORE', type: 'video', src: 'assets/video/V01.mp4' },
  { title: 'LUMEN SKINCARE', type: 'img', src: 'assets/img/V40M.webp' },
  { title: 'WILDER CAMP', type: 'img', src: 'assets/img/V42M.webp' },
  { title: 'PULL NOODLE BAR', type: 'img', src: 'assets/img/V45M.webp' },
  { title: 'AXIOM PRECISION', type: 'img', src: 'assets/img/V46M.webp' },
];

const BAR_COUNT = 84;
const AUTOPLAY_MS = 5000;
const MELT_S = 1.1;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

/* liquid melt: multi-octave noise displacement that peaks mid-transition,
   sampled separately per RGB channel for prismatic fringing */
const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uPlaneRes;
  uniform vec2 uResA;
  uniform vec2 uResB;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.55;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  vec2 cover(vec2 uv, vec2 res) {
    vec2 s = uPlaneRes / res;
    float sc = max(s.x, s.y);
    vec2 scaled = res * sc;
    vec2 off = (uPlaneRes - scaled) / 2.0;
    return (uv * uPlaneRes - off) / scaled;
  }

  vec3 melted(sampler2D tex, vec2 uv, vec2 disp, float k) {
    float r = texture2D(tex, clamp(uv + disp * (k * 1.25), 0.002, 0.998)).r;
    float g = texture2D(tex, clamp(uv + disp * k, 0.002, 0.998)).g;
    float b = texture2D(tex, clamp(uv + disp * (k * 0.72), 0.002, 0.998)).b;
    return vec3(r, g, b);
  }

  void main() {
    float p = uProgress;
    float strength = sin(3.14159 * p);          // peaks mid-transition

    // idle drift + cursor parallax baked into the sample position
    vec2 base = vUv;
    base = (base - 0.5) / (1.03 + 0.004 * sin(uTime * 0.4)) + 0.5;
    base += uMouse * 0.014;

    // swirling displacement field
    float n1 = fbm(base * 3.0 + uTime * 0.06);
    float n2 = fbm(base * 5.0 - uTime * 0.05 + 7.3);
    vec2 disp = vec2(n1 - 0.5, n2 - 0.5) * (0.55 * strength);

    vec2 uvA = cover(base, uResA);
    vec2 uvB = cover(base, uResB);

    vec3 a = melted(uTexA, uvA, disp, 1.0 + p * 0.6);
    vec3 b = melted(uTexB, uvB, -disp, 1.6 - p * 0.6);

    // organic per-pixel blend edge driven by the same noise
    float edge = smoothstep(p * 1.35 - 0.35 + (n1 - 0.5) * 0.45, p * 1.35 + (n1 - 0.5) * 0.45, 0.5);
    gl_FragColor = vec4(mix(b, a, edge), 1.0);
  }
`;

function mediaFor(slide) {
  if (slide.type === 'video') {
    const v = document.createElement('video');
    v.src = slide.src; v.muted = true; v.loop = true; v.playsInline = true;
    v.play();
    return v;
  }
  const img = document.createElement('img');
  img.src = slide.src;
  return img;
}

export async function initHero(hero) {
  const mediaWrap = hero.querySelector('.hero-media');
  const titleEl = hero.querySelector('.hero-title .ht-inner');
  const countEl = hero.querySelector('.hero-count');
  const wave = hero.querySelector('.hx-wave');
  const thumbs = [...hero.querySelectorAll('.hx-thumb')];

  let index = 0, busy = false, timer = null;
  let engine;

  const bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const b = document.createElement('i');
    wave.appendChild(b);
    bars.push(b);
  }
  const setWave = (i) => {
    const center = ((i + 0.5) / SLIDES.length) * BAR_COUNT;
    const sigma = BAR_COUNT / 15;
    bars.forEach((b, k) => {
      b.style.height = (8 + 36 * Math.exp(-((k - center) ** 2) / (2 * sigma * sigma))).toFixed(1) + 'px';
    });
  };
  const setCount = (i) => {
    countEl.innerHTML = `${String(i + 1).padStart(2, '0')} <em>//</em> ${String(SLIDES.length).padStart(2, '0')}`;
  };
  const setThumbs = (i) => thumbs.forEach((t, k) => t.classList.toggle('is-active', k === i));
  const swapTitle = (i) => {
    if (reducedMotion) { titleEl.textContent = SLIDES[i].title; return; }
    gsap.to(titleEl, {
      yPercent: 100, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        titleEl.textContent = SLIDES[i].title;
        gsap.fromTo(titleEl, { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: 'expo.out' });
      },
    });
  };

  /* ---------- DOM fallback: plain crossfade between two layers ---------- */
  function domEngine() {
    const layers = [...mediaWrap.querySelectorAll('.hero-layer')];
    let front = layers[0], back = layers[1];
    return {
      go(i) {
        back.innerHTML = '';
        back.appendChild(mediaFor(SLIDES[i]));
        gsap.to(back, { opacity: 1, duration: 0.7 });
        gsap.to(front, {
          opacity: 0, duration: 0.7,
          onComplete: () => { [front, back] = [back, front]; back.innerHTML = ''; busy = false; },
        });
      },
    };
  }

  /* ---------- WebGL melt engine ---------- */
  async function glEngine() {
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(mediaWrap.clientWidth, mediaWrap.clientHeight);
    // canvas replaces the DOM layers
    mediaWrap.querySelectorAll('.hero-layer').forEach((l) => l.remove());
    mediaWrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const loader = new THREE.TextureLoader();

    const texFor = (slide) => new Promise((res) => {
      if (slide.type === 'video') {
        const v = mediaFor(slide);
        const t = new THREE.VideoTexture(v);
        t.minFilter = THREE.LinearFilter;
        res({ tex: t, w: 1280, h: 720 });
      } else {
        loader.load(slide.src, (t) => {
          t.minFilter = THREE.LinearFilter;
          res({ tex: t, w: t.image.width, h: t.image.height });
        }, undefined, () => res(null));
      }
    });

    const slots = await Promise.all(SLIDES.map(texFor));
    const first = slots[0] || slots.find(Boolean);

    const uniforms = {
      uTexA: { value: first.tex },
      uTexB: { value: first.tex },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPlaneRes: { value: new THREE.Vector2(mediaWrap.clientWidth, mediaWrap.clientHeight) },
      uResA: { value: new THREE.Vector2(first.w, first.h) },
      uResB: { value: new THREE.Vector2(first.w, first.h) },
    };
    scene.add(new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG }),
    ));

    gsap.ticker.add(() => {
      uniforms.uTime.value = performance.now() / 1000;
      renderer.render(scene, camera);
    });
    window.addEventListener('resize', () => {
      renderer.setSize(mediaWrap.clientWidth, mediaWrap.clientHeight);
      uniforms.uPlaneRes.value.set(mediaWrap.clientWidth, mediaWrap.clientHeight);
    });

    const mx = gsap.quickTo(uniforms.uMouse.value, 'x', { duration: 1.2, ease: 'power3' });
    const my = gsap.quickTo(uniforms.uMouse.value, 'y', { duration: 1.2, ease: 'power3' });
    hero.addEventListener('mousemove', (e) => {
      mx((e.clientX / innerWidth - 0.5) * 2);
      my((e.clientY / innerHeight - 0.5) * -2);
    });

    return {
      go(i) {
        const slot = slots[i] || first;
        uniforms.uTexB.value = slot.tex;
        uniforms.uResB.value.set(slot.w, slot.h);
        // uProgress runs 1 → 0: B (incoming) takes over as progress falls
        gsap.fromTo(uniforms.uProgress, { value: 1 }, {
          value: 0, duration: MELT_S, ease: 'power2.inOut',
          onComplete: () => {
            uniforms.uTexA.value = slot.tex;
            uniforms.uResA.value.copy(uniforms.uResB.value);
            uniforms.uProgress.value = 0;
            busy = false;
          },
        });
      },
    };
  }

  if (reducedMotion || !window.THREE) {
    engine = domEngine();
  } else {
    try { engine = await glEngine(); }
    catch (e) { console.warn('WebGL hero fell back to DOM', e); engine = domEngine(); }
  }

  function go(to, user = false) {
    if (busy) return;
    const i = ((to % SLIDES.length) + SLIDES.length) % SLIDES.length;
    if (i === index) return;
    busy = true;
    index = i;
    setCount(i); setWave(i); setThumbs(i);
    swapTitle(i);
    engine.go(i);
    if (user) restartAutoplay();
  }

  function restartAutoplay() {
    clearInterval(timer);
    if (reducedMotion) return;
    timer = setInterval(() => go(index + 1), AUTOPLAY_MS);
  }

  setCount(0); setWave(0); setThumbs(0);
  titleEl.textContent = SLIDES[0].title;
  restartAutoplay();

  hero.querySelector('.hero-prev').addEventListener('click', () => go(index - 1, true));
  hero.querySelector('.hero-next').addEventListener('click', () => go(index + 1, true));
  thumbs.forEach((t, k) => t.addEventListener('click', () => go(k, true)));
  document.addEventListener('keydown', (e) => {
    if (document.body.dataset.page !== 'home') return;
    if (e.key === 'ArrowRight') go(index + 1, true);
    if (e.key === 'ArrowLeft') go(index - 1, true);
  });
  let startX = null;
  hero.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  hero.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 60) go(index + (dx < 0 ? 1 : -1), true);
    startX = null;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else restartAutoplay();
  });

  /* UI-level cursor parallax (media parallax lives in the shader) */
  if (!reducedMotion) {
    const cluster = hero.querySelector('.hx-cluster');
    const cx = cluster ? gsap.quickTo(cluster, 'x', { duration: 0.9, ease: 'power3' }) : null;
    const words = [...hero.querySelectorAll('.hx-word')];
    const wx = words.map((w) => gsap.quickTo(w, 'x', { duration: 1, ease: 'power3' }));
    hero.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      cx && cx(nx * 8);
      wx.forEach((fn, k) => fn(nx * (k === 0 ? -10 : 10)));
    });
  }
}

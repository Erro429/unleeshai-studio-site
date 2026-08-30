/* UNLEESH — home hero: WebGL displacement carousel (Three.js) */
import { reducedMotion } from './core.js';

const SLIDES = [
  { title: 'Cosmic Signal', img: 'assets/img/V02.webp' },
  { title: 'Cosmic Drift', img: 'assets/img/V03.webp' },
  { title: 'Cosmic Pulse', img: 'assets/img/V04.webp' },
  { title: 'Cosmic Silence', img: 'assets/img/V05.webp' },
  { title: 'Cosmic Origin', img: 'assets/img/V06.webp' },
];

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform sampler2D uNextTexture;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uParallax;
  uniform vec2 uPlaneRes;
  uniform vec2 uImgRes;

  // cheap value noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }

  vec2 cover(vec2 uv) {
    vec2 s = uPlaneRes / uImgRes;
    float scale = max(s.x, s.y);
    vec2 scaled = uImgRes * scale;
    vec2 offset = (uPlaneRes - scaled) / 2.0;
    return (uv * uPlaneRes - offset) / scaled;
  }

  void main() {
    // idle ken-burns + wobble
    float zoom = 1.03 + 0.004 * sin(uTime * 0.5);
    vec2 uv = cover(vUv);
    uv = (uv - 0.5) / zoom + 0.5;
    uv += uParallax * 0.012;
    uv += 0.004 * vec2(noise(uv * 3.0 + uTime * 0.08), noise(uv * 3.0 - uTime * 0.08)) - 0.002;

    float n = noise(uv * 6.0 + uTime * 0.05);
    float p = uProgress;
    vec2 dispA = uv + (n - 0.5) * 0.25 * p;
    vec2 dispB = uv - (n - 0.5) * 0.25 * (1.0 - p);
    vec4 a = texture2D(uTexture, clamp(dispA, 0.001, 0.999));
    vec4 b = texture2D(uNextTexture, clamp(dispB, 0.001, 0.999));
    gl_FragColor = mix(a, b, smoothstep(0.15, 0.85, p));
  }
`;

export async function initHero(hero) {
  const titleEl = hero.querySelector('.hero-title .ht-inner');
  const countEl = hero.querySelector('.hero-count');
  let index = 0;
  let busy = false;
  let timer = null;

  const setCount = (i) => { countEl.textContent = `${String(i + 1).padStart(2, '0')} // ${String(SLIDES.length).padStart(2, '0')}`; };
  setCount(0);
  titleEl.textContent = SLIDES[0].title;

  // ---- fallback for reduced motion / no WebGL ----
  const fallback = () => {
    const div = document.createElement('div');
    div.className = 'hero-fallback';
    div.innerHTML = `<img src="${SLIDES[0].img}" alt="${SLIDES[0].title}">`;
    hero.prepend(div);
    const img = div.querySelector('img');
    const show = (i) => { img.src = SLIDES[i].img; titleEl.textContent = SLIDES[i].title; setCount(i); };
    return { go: (i) => show(((i % SLIDES.length) + SLIDES.length) % SLIDES.length) };
  };

  let engine;
  if (reducedMotion || !window.THREE) {
    engine = fallback();
  } else {
    try {
      engine = await initGL(hero, titleEl, setCount);
    } catch (e) {
      console.warn('WebGL hero failed, falling back', e);
      engine = fallback();
    }
  }

  const go = (dir) => {
    if (busy) return;
    index = ((index + dir) % SLIDES.length + SLIDES.length) % SLIDES.length;
    engine.go(index, dir);
    restartAutoplay();
  };

  function restartAutoplay() {
    clearInterval(timer);
    timer = setInterval(() => go(1), 6000);
  }
  restartAutoplay();

  hero.querySelector('.hero-prev').addEventListener('click', () => go(-1));
  hero.querySelector('.hero-next').addEventListener('click', () => go(1));
  document.addEventListener('keydown', (e) => {
    if (!document.body.dataset.page || document.body.dataset.page !== 'home') return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  // drag / swipe
  let startX = null;
  hero.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  hero.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    startX = null;
  });

  async function initGL(hero, titleEl, setCount) {
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(hero.clientWidth, hero.clientHeight);
    hero.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const loader = new THREE.TextureLoader();
    const textures = await Promise.all(SLIDES.map((s) => new Promise((res) => {
      loader.load(s.img, (t) => { t.minFilter = THREE.LinearFilter; res(t); }, undefined, () => res(null));
    })));
    const texSize = (t) => (t && t.image ? new THREE.Vector2(t.image.width, t.image.height) : new THREE.Vector2(16, 9));

    const uniforms = {
      uTexture: { value: textures[0] },
      uNextTexture: { value: textures[1] || textures[0] },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uParallax: { value: new THREE.Vector2(0, 0) },
      uPlaneRes: { value: new THREE.Vector2(hero.clientWidth, hero.clientHeight) },
      uImgRes: { value: texSize(textures[0]) },
    };
    const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    const px = gsap.quickTo(uniforms.uParallax.value, 'x', { duration: 0.8, ease: 'power3' });
    const py = gsap.quickTo(uniforms.uParallax.value, 'y', { duration: 0.8, ease: 'power3' });
    const tx = gsap.quickTo(titleEl, 'x', { duration: 0.8, ease: 'power3' });
    hero.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      px(nx); py(-ny); tx(nx * -4);
    });

    gsap.ticker.add(() => {
      uniforms.uTime.value = performance.now() / 1000;
      renderer.render(scene, camera);
    });

    window.addEventListener('resize', () => {
      renderer.setSize(hero.clientWidth, hero.clientHeight);
      uniforms.uPlaneRes.value.set(hero.clientWidth, hero.clientHeight);
    });

    return {
      go(i) {
        busy = true;
        uniforms.uNextTexture.value = textures[i] || textures[0];
        // outgoing title drops, incoming rises
        gsap.to(titleEl, {
          yPercent: 100, duration: 0.4, ease: 'power2.in',
          onComplete: () => {
            titleEl.textContent = SLIDES[i].title;
            gsap.fromTo(titleEl, { yPercent: -100 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' });
          },
        });
        setCount(i);
        gsap.fromTo(uniforms.uProgress, { value: 0 }, {
          value: 1, duration: 1.2, ease: 'power3.inOut',
          onComplete: () => {
            uniforms.uTexture.value = textures[i] || textures[0];
            uniforms.uImgRes.value = texSize(textures[i]);
            uniforms.uProgress.value = 0;
            busy = false;
          },
        });
      },
    };
  }
}

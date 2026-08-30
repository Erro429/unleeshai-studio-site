/* UNLEESH — letter-play signature section: letters + tag field + status lines */
import { reducedMotion, typeStatus } from './core.js';

const LETTERS = ['U', 'N', 'L', 'E', 'E', 'S', 'H'];
const SPOTS = [
  [6, 18], [20, 58], [34, 30], [48, 66], [62, 22], [76, 60], [88, 34],
];

const TAGS = [
  'Brand identity', 'Visual strategy', 'Unleesh studio', 'Motion design', 'Micro interactions',
  'Type system', 'Creative direction', 'Design language', 'Interface design', 'Web experience',
  'Digital storytelling', 'Art direction', 'Campaign design', 'Visual narrative', 'Brand experience',
  'UX strategy', 'Creative coding', 'Logo design', 'Editorial layout', 'Packaging design',
  'Digital experience', 'Interaction design', 'Brand guidelines', 'Typography', 'Colour systems',
  'Brand consulting', 'Social media design', 'Video production', 'Illustration', 'Creative strategy',
  'Print design', 'Space branding', 'Exhibition design', 'Sound identity', 'Concept development',
  'Market positioning', 'Brand personality', 'Audience insight', 'Design thinking', 'Prototyping',
  'User research', 'Content strategy', 'Visual identity', 'Responsive design', 'Animation direction',
  'UI component design', 'Design system', 'Cross-media branding', 'Landing page', 'Digital brand standards',
  'Scroll experience', 'WebGL interface', 'Kinetic typography', 'Motion visual design', 'Brand audit',
  'Competitor analysis', 'Mood board', 'Brand core value', 'Style guide', 'Launch strategy',
  'AI visual pipeline', 'Generative imagery', 'Render direction', 'Prompt craft', 'Spatial design', 'Signal design',
];

const STATUS = [
  { text: 'BRAND IDENTITY SYSTEM :: BUILDING', pos: [12, 44] },
  { text: 'VISUAL SYSTEM :: LOADING', pos: [56, 48] },
  { text: 'CREATIVE ENERGY :: CONTINUOUSLY OUTPUTTING', pos: [30, 82] },
];

export function initLetterplay(section) {
  // build DOM
  const letterEls = LETTERS.map((ch, i) => {
    const el = document.createElement('div');
    el.className = 'lp-letter';
    el.textContent = ch;
    el.style.left = SPOTS[i][0] + '%';
    el.style.top = SPOTS[i][1] + '%';
    section.appendChild(el);
    return el;
  });

  const cols = 8, rows = 9;
  const tagEls = TAGS.slice(0, 66).map((t, i) => {
    const el = document.createElement('div');
    el.className = 'lp-tag';
    el.textContent = t;
    const gx = (i % cols) / cols, gy = Math.floor(i / cols) / rows;
    el.style.left = (3 + gx * 92 + (Math.sin(i * 7.3) * 4)) + '%';
    el.style.top = (4 + gy * 90 + (Math.cos(i * 3.1) * 3)) + '%';
    section.appendChild(el);
    return el;
  });

  const statusEls = STATUS.map((s) => {
    const el = document.createElement('div');
    el.className = 'status lp-status';
    el.dataset.text = s.text;
    el.style.left = s.pos[0] + '%';
    el.style.top = s.pos[1] + '%';
    el.innerHTML = '<span class="typed"></span><span class="cursor">█</span>';
    section.appendChild(el);
    return el;
  });

  if (reducedMotion || innerWidth < 1024) {
    statusEls.forEach((el) => typeStatus(el));
    return;
  }

  const shuffledTags = gsap.utils.shuffle([...tagEls]);
  gsap.set(tagEls, { opacity: 0, filter: 'blur(8px)', y: 20 });
  gsap.set(letterEls, { opacity: 0, scale: 0.6, rotation: -4 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section, start: 'top top', end: '+=300%',
      pin: true, scrub: 0.8, anticipatePin: 1,
    },
  });

  // 0–20%: tags fade in shuffled
  tl.to(shuffledTags, {
    opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none',
    stagger: { each: 0.8 / shuffledTags.length },
    duration: 0.9,
  }, 0);

  // 15–70%: letters appear one at a time, pushing nearby tags away
  const letterTimes = [0.6, 1.12, 1.64, 2.16, 2.68, 3.2, 3.5];
  letterEls.forEach((el, i) => {
    tl.to(el, { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: 'none' }, letterTimes[i]);
    tl.call(() => pushTags(el), null, letterTimes[i] + 0.2);
  });

  // typed lines fire once at 20% / 45% / 70%
  [0.8, 1.8, 2.8].forEach((t, i) => {
    tl.call(() => typeStatus(statusEls[i]), null, t);
  });

  // 70–100%: letters glide to centred baseline, tags drift + dim
  const assemble = () => {
    const w = innerWidth;
    const letterW = letterEls[0].getBoundingClientRect().width || w * 0.09;
    const total = letterW * LETTERS.length * 1.02;
    return letterEls.map((el, i) => {
      const r = el.getBoundingClientRect();
      const targetX = (w - total) / 2 + i * letterW * 1.02;
      const targetY = innerHeight / 2 - r.height / 2;
      const secR = section.getBoundingClientRect();
      return { x: targetX - (r.left - (gsap.getProperty(el, 'x') || 0)), y: targetY - (r.top - secR.top - (gsap.getProperty(el, 'y') || 0)) };
    });
  };
  tl.call(() => {
    const targets = assemble();
    letterEls.forEach((el, i) => {
      gsap.to(el, { x: targets[i].x, y: targets[i].y, duration: 1.2, ease: 'expo.inOut', overwrite: 'auto' });
    });
  }, null, 3.55);
  tl.to(tagEls, {
    opacity: 0.25,
    x: () => gsap.utils.random(-30, 30),
    y: () => gsap.utils.random(-30, 30),
    ease: 'none', duration: 0.9,
  }, 3.5);
  tl.to({}, { duration: 0.5 }); // tail

  function pushTags(letter) {
    const lr = letter.getBoundingClientRect();
    const cx = lr.left + lr.width / 2, cy = lr.top + lr.height / 2;
    tagEls.forEach((tag) => {
      const tr = tag.getBoundingClientRect();
      const tx = tr.left + tr.width / 2, ty = tr.top + tr.height / 2;
      const dx = tx - cx, dy = ty - cy;
      const d = Math.hypot(dx, dy);
      if (d < 160 && d > 0.1) {
        gsap.to(tag, { x: `+=${(dx / d) * 40}`, y: `+=${(dy / d) * 40}`, duration: 0.8, ease: 'power3.out' });
      }
    });
  }

  // pointer parallax
  const fieldX = gsap.quickTo(section, '--fx', { duration: 1 });
  section.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / innerWidth - 0.5) * 2;
    const ny = (e.clientY / innerHeight - 0.5) * 2;
    tagEls.forEach((t, i) => {
      if (i % 3 === 0) return; // keep some static for depth
      gsap.to(t, { xPercent: nx * -6, yPercent: ny * -6, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
    });
    letterEls.forEach((l) => {
      gsap.to(l, { xPercent: nx * -3, yPercent: ny * -3, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
    });
  });
}

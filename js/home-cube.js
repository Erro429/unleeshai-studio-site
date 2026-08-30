/* UNLEESH — scroll-scrubbed 3D cube (CSS 3D) */
import { reducedMotion } from './core.js';

export function initCube(section) {
  const cube = section.querySelector('.cube');
  const scene = section.querySelector('.cube-scene');
  const size = Math.min(420, innerWidth * 0.7);
  scene.style.setProperty('--cube', size + 'px');
  const half = size / 2;

  const faces = {
    front: `translateZ(${half}px)`,
    back: `rotateY(180deg) translateZ(${half}px)`,
    right: `rotateY(90deg) translateZ(${half}px)`,
    left: `rotateY(-90deg) translateZ(${half}px)`,
    top: `rotateX(90deg) translateZ(${half}px)`,
    bottom: `rotateX(-90deg) translateZ(${half}px)`,
  };
  Object.entries(faces).forEach(([k, t]) => {
    const f = cube.querySelector('.face-' + k);
    if (f) f.style.transform = t;
  });

  if (reducedMotion || innerWidth < 1024) {
    cube.style.transform = 'rotateX(-15deg) rotateY(35deg)';
    return;
  }

  const rot = { y: 0, x: 0, scale: 0.8, tiltX: 0, tiltY: 0 };
  const apply = () => {
    cube.style.transform =
      `scale3d(${rot.scale},${rot.scale},${rot.scale}) rotateX(${rot.x + rot.tiltX}deg) rotateY(${rot.y + rot.tiltY}deg)`;
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section, start: 'top top', end: '+=250%',
      pin: true, scrub: 1, anticipatePin: 1,
    },
    onUpdate: apply,
  });
  tl.to(rot, { y: 360, ease: 'none', duration: 4 }, 0)
    .to(rot, { x: 20, ease: 'none', duration: 1 }, 0)
    .to(rot, { x: -20, ease: 'none', duration: 2 }, 1)
    .to(rot, { x: 0, ease: 'none', duration: 1 }, 3)
    .to(rot, { scale: 1, ease: 'none', duration: 2 }, 0)
    .to(rot, { scale: 0.8, ease: 'none', duration: 2 }, 2);

  const txTo = gsap.quickTo(rot, 'tiltY', { duration: 0.6, ease: 'power3', onUpdate: apply });
  const tyTo = gsap.quickTo(rot, 'tiltX', { duration: 0.6, ease: 'power3', onUpdate: apply });
  section.addEventListener('mousemove', (e) => {
    txTo((e.clientX / innerWidth - 0.5) * 12);
    tyTo(-(e.clientY / innerHeight - 0.5) * 12);
  });
}

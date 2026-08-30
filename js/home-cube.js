/* UNLEESH — pinned CSS cube: faces assemble, leftward Y-spin through three
   stops, axis switch to an X tumble, then a zoom exit. All scrubbed. */
import { reducedMotion } from './core.js';

export function initCube(section) {
  const cube = section.querySelector('.cube');
  const scene = section.querySelector('.cube-scene');
  const size = Math.min(420, innerWidth * 0.7);
  scene.style.setProperty('--cube', size + 'px');
  const half = size / 2;

  const BASE = {
    front: `translateZ(${half}px)`,
    back: `rotateY(180deg) translateZ(${half}px)`,
    right: `rotateY(90deg) translateZ(${half}px)`,
    left: `rotateY(-90deg) translateZ(${half}px)`,
    top: `rotateX(90deg) translateZ(${half}px)`,
    bottom: `rotateX(-90deg) translateZ(${half}px)`,
  };
  const faces = Object.entries(BASE).map(([k, t]) => ({ el: section.querySelector('.face-' + k), base: t }));
  const explode = { z: 0, o: 1 };
  const placeFaces = () => faces.forEach(({ el, base }) => {
    if (!el) return;
    el.style.transform = `${base} translateZ(${explode.z}px)`;
    el.style.opacity = explode.o;
  });
  placeFaces();

  if (reducedMotion || innerWidth < 1024) {
    cube.style.transform = 'rotateX(-15deg) rotateY(35deg)';
    return;
  }

  const rot = { y: 0, x: 0, scale: 0.8, tiltX: 0, tiltY: 0, alpha: 1 };
  const apply = () => {
    cube.style.transform =
      `scale3d(${rot.scale},${rot.scale},${rot.scale}) rotateX(${rot.x + rot.tiltX}deg) rotateY(${rot.y + rot.tiltY}deg)`;
    cube.style.opacity = rot.alpha;
    placeFaces();
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section, start: 'top top', end: '+=300%',
      pin: true, scrub: 1, anticipatePin: 1,
    },
    onUpdate: apply,
  });
  // 0–1  assembly: faces fly in from an exploded state while the cube scales up
  explode.z = 320; explode.o = 0; placeFaces();
  tl.to(explode, { z: 0, o: 1, ease: 'none', duration: 1 }, 0)
    .to(rot, { scale: 1, ease: 'none', duration: 1 }, 0)
    // 1–7  leftward Y-spin: front → right → back → left (three stops)
    .to(rot, { y: -270, ease: 'none', duration: 6 }, 1)
    // 7–8  axis switch: pitch forward to the top face
    .to(rot, { x: -90, ease: 'none', duration: 1 }, 7)
    // 8–9  pitch backward past front to the bottom face
    .to(rot, { x: 90, ease: 'none', duration: 1 }, 8)
    // 9–10 exit: zoom toward the camera and dissolve into the word field
    .to(rot, { scale: 2.4, alpha: 0, ease: 'none', duration: 1 }, 9);

  const txTo = gsap.quickTo(rot, 'tiltY', { duration: 0.6, ease: 'power3', onUpdate: apply });
  const tyTo = gsap.quickTo(rot, 'tiltX', { duration: 0.6, ease: 'power3', onUpdate: apply });
  section.addEventListener('mousemove', (e) => {
    txTo((e.clientX / innerWidth - 0.5) * 12);
    tyTo(-(e.clientY / innerHeight - 0.5) * 12);
  });
}

/* UNLEESH — contact: kinetic header drift, form validation, modals */
import { reducedMotion } from './core.js';
import { icon } from './icons.js';

export function init() {
  driftHeadings();
  initCaptcha();
  initBudgetBadge();
  initForm();
  arrowLoop();
}

function driftHeadings() {
  if (reducedMotion) return;
  const lets = document.querySelector('.ct-lets');
  const talk = document.querySelector('.ct-talk');
  if (!lets || !talk) return;
  gsap.to(lets, { x: 60, ease: 'none', scrollTrigger: { trigger: '.ct-head', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.to(talk, { x: -60, ease: 'none', scrollTrigger: { trigger: '.ct-head', start: 'top top', end: 'bottom top', scrub: 1 } });
}

function arrowLoop() {
  const arr = document.querySelector('.ct-start svg');
  if (arr && !reducedMotion) gsap.to(arr, { x: 6, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

let capA = 0, capB = 0;
function initCaptcha() {
  capA = Math.floor(Math.random() * 9) + 1;
  capB = Math.floor(Math.random() * 9) + 1;
  const label = document.querySelector('label[for="cf-captcha"] .cap-q');
  if (label) label.textContent = `${capA} + ${capB} =`;
}

function initBudgetBadge() {
  const sel = document.querySelector('#cf-budget');
  const badge = document.querySelector('.cf-badge');
  if (!sel) return;
  sel.addEventListener('change', () => badge.classList.toggle('is-visible', !!sel.value));
}

function setErr(field, on) {
  field.closest('.cf-field').classList.toggle('is-error', on);
}

function initForm() {
  const form = document.querySelector('.ct-form form');
  if (!form) return;
  const modal = buildModal();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    const name = form.querySelector('#cf-name');
    const email = form.querySelector('#cf-email');
    const phone = form.querySelector('#cf-phone');
    const details = form.querySelector('#cf-details');
    const captcha = form.querySelector('#cf-captcha');

    setErr(name, !name.value.trim()); ok = ok && !!name.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    setErr(email, !emailOk); ok = ok && emailOk;
    setErr(phone, !phone.value.trim()); ok = ok && !!phone.value.trim();
    setErr(details, !details.value.trim()); ok = ok && !!details.value.trim();
    const capOk = parseInt(captcha.value, 10) === capA + capB;
    setErr(captcha, !capOk); ok = ok && capOk;

    if (!ok) return;

    // Sending state → Received (no backend wired yet; swap in a POST here)
    modal.showSending();
    setTimeout(() => modal.showReceived(() => { form.reset(); initCaptcha(); }), 1400);
  });
}

function buildModal() {
  const wrap = document.createElement('div');
  wrap.className = 'ct-modal';
  wrap.innerHTML = '<div class="cm-box"></div>';
  document.body.appendChild(wrap);
  const box = wrap.querySelector('.cm-box');
  let spin = null;

  return {
    showSending() {
      box.innerHTML = `${icon('hourglass')}<p class="mono">Sending</p>`;
      wrap.classList.add('is-open');
      const hg = box.querySelector('svg');
      if (!reducedMotion) spin = gsap.to(hg, { rotation: 180, duration: 0.8, repeat: -1, ease: 'power2.inOut', transformOrigin: '50% 50%' });
    },
    showReceived(onClose) {
      if (spin) spin.kill();
      box.innerHTML = `
        ${icon('star4')}
        <h3 class="cm-title display">RECEIVED</h3>
        <p class="cm-sub">Thank you. We will respond shortly.<br>Your project brief is in good hands.</p>
        <button class="cm-close">Close</button>`;
      box.querySelector('.cm-close').addEventListener('click', () => {
        wrap.classList.remove('is-open');
        onClose && onClose();
      });
    },
  };
}

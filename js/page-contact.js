/* UNLEESH — contact: kinetic header drift, form validation, modals */
import { reducedMotion } from './core.js';
import { icon } from './icons.js';
import { initInner } from './inner.js';
import { deliver, mailtoHref, FORM_EMAIL } from './forms.js';

export function init() {
  initInner();
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
  const body = document.querySelector('.in-body');
  if (!lets || !talk || !body) return;
  const st = { trigger: body, start: 'top bottom', end: 'top top', scrub: 1 };
  gsap.to(lets, { x: 80, ease: 'none', scrollTrigger: st });
  gsap.to(talk, { x: -80, ease: 'none', scrollTrigger: st });
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
  const radios = document.querySelectorAll('.cf-radios input');
  const badge = document.querySelector('.cf-badge');
  if (!radios.length || !badge) return;
  radios.forEach((r) => r.addEventListener('change', () => {
    badge.textContent = `( ${r.value} )`;
    badge.classList.add('is-visible');
  }));
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

    if (!ok) {
      const first = form.querySelector('.cf-field.is-error input, .cf-field.is-error textarea');
      first && first.focus();
      return;
    }

    // Deliver the brief: POST to the endpoint in forms.js, or hand it to the visitor's mail app
    const picked = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)]
      .map((el) => el.parentElement.textContent.trim()).join(', ');
    const fields = {
      Name: name.value.trim(),
      Email: email.value.trim(),
      Phone: phone.value.trim(),
      Company: form.querySelector('#cf-company').value.trim(),
      Services: picked('svc'),
      Budget: picked('budget'),
      Details: details.value.trim(),
    };
    const subject = `Project brief from ${fields.Name}`;
    const clear = () => {
      form.reset();
      initCaptcha();
      document.querySelector('.cf-badge')?.classList.remove('is-visible');
    };
    modal.showSending();
    const started = Date.now();
    deliver('contact', subject, fields).then((how) => {
      const wait = Math.max(0, 900 - (Date.now() - started));
      setTimeout(() => {
        if (how === 'sent') modal.showReceived(clear);
        else modal.showEmail(mailtoHref(subject, fields));   // fields stay filled in until the email is really sent
      }, wait);
    });
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
        <p class="cm-sub">Thank you. A real person replies within two working days.<br>Your brief is in good hands.</p>
        <button class="cm-close">Close</button>`;
      box.querySelector('.cm-close').addEventListener('click', () => {
        wrap.classList.remove('is-open');
        onClose && onClose();
      });
    },
    /* no endpoint, or it failed: the brief was handed to the visitor's mail app, so say exactly that */
    showEmail(href) {
      if (spin) spin.kill();
      box.innerHTML = `
        ${icon('star4')}
        <h3 class="cm-title display">PRESS SEND</h3>
        <p class="cm-sub">Your email app just opened with the brief written out. Press send there and it reaches us.<br>
        Nothing opened? <a class="cm-mail" href="${href}">Open the email again</a> or write to ${FORM_EMAIL}.</p>
        <button class="cm-close">Close</button>`;
      box.querySelector('.cm-close').addEventListener('click', () => wrap.classList.remove('is-open'));
    },
  };
}

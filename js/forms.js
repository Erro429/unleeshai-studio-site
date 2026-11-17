/* UNLEESH: form delivery, shared by the Contact brief and the Journal subscribe strip.

   FORM_ENDPOINT is the one line to change when a backend exists. Point it at any URL that
   accepts a JSON POST and answers with a 2xx status: a form service, an n8n webhook, your own handler.

   While it is empty, or if the request fails, the visitor's own mail app opens with the message
   already written and addressed to FORM_EMAIL. Nothing is dropped and nothing is reported as sent
   unless it was. */
export const FORM_ENDPOINT = '';
export const FORM_EMAIL = ['hello', 'unleeshai.com'].join('@');

/* -> 'sent' when the endpoint accepted it, 'email' when the mail app was opened instead */
export async function deliver(kind, subject, fields) {
  if (FORM_ENDPOINT) {
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ form: kind, subject, page: location.pathname, sent: new Date().toISOString(), ...fields }),
      });
      if (res.ok) return 'sent';
    } catch { /* network or CORS failure: fall through to the mail app */ }
  }
  location.href = mailtoHref(subject, fields);
  return 'email';
}

export function mailtoHref(subject, fields) {
  const body = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return `mailto:${FORM_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

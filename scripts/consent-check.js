/*
 * Consent gate for scripts that require user permission (analytics, martech,
 * etc.). Adapted from adobe/aem-boilerplate#653 to this kit's lazy phase:
 * lazy.js imports this module, which loads ./consented.js only once consent
 * is granted. Defaults to declined until a real CMP (OneTrust, etc.) says
 * otherwise. A `?consent=accept|decline` query param overrides for testing.
 */

let consentedLoaded = false;

/**
 * Whether the user has granted consent.
 * Defaults to false (declined) unless explicitly accepted.
 * @returns {boolean}
 */
export function hasConsent() {
  const param = new URLSearchParams(window.location.search).get('consent');
  if (param === null) return false;
  return ['accept', 'true', '1', 'yes'].includes(param.toLowerCase());
}

/**
 * Loads the consented scripts module once.
 */
export async function loadConsented() {
  if (consentedLoaded) return;
  consentedLoaded = true;
  await import('./consented.js');
}

/**
 * Notifies listeners of the current consent state and loads consented
 * scripts if permission was granted. A CMP integration calls this whenever
 * the user updates their choice.
 */
export function onConsentUpdate() {
  const consented = hasConsent();
  document.dispatchEvent(new CustomEvent('consent-update', { detail: { consented } }));
  if (consented) loadConsented();
}

onConsentUpdate();

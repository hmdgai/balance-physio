import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const requiredHosts = ['https://analytics.google.com', 'https://*.analytics.google.com'];

test('any future CSP keeps both GA4 collector hosts in connect-src', async () => {
  const [headers, head] = await Promise.all([
    read('public/_headers'),
    read('src/components/SiteHead.astro'),
  ]);
  const policies = [
    ['HTTP', headers.match(/^\s*Content-Security-Policy:\s*([^\r\n]+)/m)?.[1]],
    ['HTML meta', head.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([\s\S]*?)"/)?.[1]],
  ];

  for (const [name, policy] of policies) {
    if (!policy) continue; // No CSP currently restricts GA4 on this site.
    const connectSrc = policy.match(/(?:^|;)\s*connect-src\s+([^;]+);/)?.[1];
    assert.ok(connectSrc, `${name} CSP is missing connect-src`);
    const hosts = connectSrc.trim().split(/\s+/);
    for (const host of requiredHosts) {
      assert.ok(hosts.includes(host), `${name} connect-src is missing ${host}`);
    }
  }
});

/**
 * Consent Mode v2 replaced the old hard gate on 2026-11-19. Under the gate,
 * "did a tag load before Accept?" was the whole safety property and was easy
 * to see. Consent Mode is the opposite: the tags DO load every time, and what
 * protects the visitor is the consent state that was declared before they did.
 *
 * That ordering is invisible at a glance and silently broken by an innocuous
 * reshuffle of the script — the tags would still work, the banner would still
 * appear, and every pageview would be recorded in an unknown consent state.
 * These assertions exist to make that reshuffle fail the build instead.
 */
test('Consent Mode v2 denies by default, before any Google tag loads', async () => {
  const consent = await read('src/components/CookiesBanner.astro');

  // Both tag loaders still exist.
  assert.match(consent, /https:\/\/www\.googletagmanager\.com\/gtm\.js/);
  assert.match(consent, /https:\/\/www\.googletagmanager\.com\/gtag\/js/);

  // The default call exists and denies every signal the banner asks about.
  const defaultCall = consent.match(/gtag\('consent',\s*'default',\s*\{[\s\S]*?\}\);/);
  assert.ok(defaultCall, "missing gtag('consent', 'default', { ... })");
  for (const signal of ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']) {
    assert.match(
      defaultCall[0],
      new RegExp(`${signal}:\\s*'denied'`),
      `consent default must set ${signal} to 'denied'`,
    );
  }

  // ORDERING: defaults must be declared before either tag URL appears.
  const defaultAt = consent.indexOf("gtag('consent', 'default'");
  const gtmAt = consent.indexOf('https://www.googletagmanager.com/gtm.js');
  const gtagAt = consent.indexOf('https://www.googletagmanager.com/gtag/js');
  assert.ok(
    defaultAt > -1 && defaultAt < gtmAt && defaultAt < gtagAt,
    'consent defaults must be set BEFORE the GTM and gtag.js loaders, or the ' +
      'first hit is recorded in an unknown consent state',
  );

  // Accepting must grant, rejecting must explicitly deny rather than relying
  // on the default — an explicit update resolves wait_for_update immediately.
  assert.match(consent, /gtag\('consent',\s*'update'/);
  assert.match(consent, /action === 'accept'[\s\S]{0,200}?updateConsent\(true\)/);
  assert.match(consent, /action === 'reject'[\s\S]{0,200}?updateConsent\(false\)/);

  // Nothing identifying may be stored before a choice is made.
  const grantedBlock = consent.match(/var GRANTED = \{[\s\S]*?\};/);
  assert.ok(grantedBlock, 'missing GRANTED consent map');
  assert.doesNotMatch(
    defaultCall[0],
    /ad_storage:\s*'granted'|analytics_storage:\s*'granted'/,
    'consent default must never grant ad_storage or analytics_storage',
  );
});

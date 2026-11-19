# Handoff — 2026-11-19

| Field | Value |
| --- | --- |
| **Date** | 2026-11-19 |
| **GitHub username** | Unknown. `git config user.name` is `Dave` (`dave@hmdg.co.uk`); the remote `https://github.com/hmdgai/balance-physio.git` is owned by `hmdgai`. Neither is confirmed to be the committing GitHub account. |
| **AI agent used** | Claude Code (Opus 5, 1M context) |
| **Repository** | `hmdgai/balance-physio` |
| **Branch** | `consent-mode-v2`, cut from `main` at `d88e8b6` |

## Objective

Google Ads conversions were reported as very low, and the cookie banner was
reported as looking different. Investigate both, then implement **Google
Consent Mode v2** so Ads can model the conversions the current hard gate
discards.

---

## What the investigation found

### The banner has not changed

Live copy is byte-identical to the repo. `CookiesBanner.astro` has only ever had
three commits — created 2026-04-30, a trailing-slash fix 2026-05-07, and the ads
wiring on 2026-10-28. The 10-28 diff touches only the script; **no markup, no
CSS, no copy**.

What *did* change is that 2026-11-18's deploy was the first successful one in a
while, so production jumped forward several commits at once. The banner also
reappears on its own whenever `localStorage` is cleared — consent is stored
under `bp-cookie-consent` for 365 days.

### Consent Mode had never existed here

`gtag('consent', …)` has **never appeared in any commit** (`git log -S`, all
branches), and there were zero occurrences in the live HTML. The site used a
hard gate instead: no Google tag loaded at all until Accept.

### Why the Ads numbers were low — two compounding causes

1. **The conversion tag was never actually live until 2026-11-18.** The
   Cloudflare build settings had *no build variables configured*, and
   `PUBLIC_ADS_CONVERSION_ID` is read at **build** time, so the tag was absent
   from every build regardless of whether the deploy succeeded. Confirmed by
   fetching the live homepage: `AW-17788943816` appears for the first time
   after the 11-18 deploy.
2. **Under the hard gate, everyone who ignored the banner was invisible.** No
   tag loaded, so no click id, no cookies — and, critically, **no modelled
   conversions either**. Consent Mode exists precisely to recover that group.

> **Still unverified and outside this repo:** the four conversion labels were
> marked "GTM setup only" on 2026-10-27 and no `gtag('event', 'conversion', …)`
> code was ever added, deliberately — firing from both page and GTM would
> double-count. So conversions depend on **GTM-THZKT967** actually having those
> tags configured. That cannot be checked from here.

---

## Files modified

| File | Change |
| --- | --- |
| `src/components/CookiesBanner.astro` | Hard gate replaced with Consent Mode v2. |
| `scripts/test-ga4-csp.mjs` | Guard rewritten for the new invariant; split into two tests. |

## Files created

| File | Purpose |
| --- | --- |
| `handoffs/handoff-astro-2026-11-19.md` | This log. |

## Files removed

`handoffs/handoff-astro-2026-09-04.md` — rolling retention, this log is the 11th.

---

## What Consent Mode v2 changes

| | Before | After |
| --- | --- | --- |
| Before a choice | **no Google tag loads at all** | tags load, all four signals `denied` |
| Cookies before consent | none | **still none** |
| Accept | tags load | `gtag('consent','update', granted)` |
| Reject | nothing loads, ever | explicit `update` to denied; tags stay cookieless |
| Non-consenting visitors | entirely invisible to Google | cookieless pings → Google can model conversions |

The promise the banner makes to the visitor is unchanged: nothing identifying is
stored until they accept. What changes is that Google now *hears* the pageview,
in a state explicitly marked as unconsented.

Defaults set: `ad_storage`, `ad_user_data`, `ad_personalization`,
`analytics_storage` and `personalization_storage` all **denied**;
`functionality_storage` and `security_storage` granted — those are the
"essential cookies to make our site work" the banner already discloses. Only the
first four are ever toggled by a visitor's choice.

Also set, both standard advanced-mode settings:

- `ads_data_redaction: true` — strips ad click identifiers while `ad_storage` is denied.
- `url_passthrough: true` — keeps the `gclid` in the URL between pages, so attribution survives without a cookie.

`wait_for_update: 500` holds tags briefly so a returning visitor's stored choice
applies before anything fires; for anyone who has already chosen, an explicit
`update` resolves it immediately.

### The ordering is the whole safety property

The dataLayer, the `gtag` shim and the consent **defaults** must all exist
before any Google tag loads. If they do not, the first hit of every session is
recorded in an unknown consent state — and nothing visibly breaks: the tags
still work, the banner still appears, the build still passes.

That is why the guard test was rewritten rather than deleted.

---

## Testing / QA

| Check | Result |
| --- | --- |
| `npm run test:ga4-csp` | 2 tests, both pass. |
| **Mutation test — default grants `analytics_storage`** | **3 assertions fail.** Regression caught. |
| **Mutation test — defaults moved after the gtag.js loader** | **3 assertions fail.** Regression caught. |
| `npm run build` | Succeeded, **129 pages**. |
| Consent default present | **129 / 129** pages. |
| Defaults before both tag loaders | **129 / 129** — zero out of order. |
| All four signals denied by default | **129 / 129**. |
| `gtag('consent','update')` present | **129 / 129**. |
| Ads id present | **129 / 129** (`AW-17788943816`). |
| Nothing hard-coded in `<head>` | `gtag/js` and `gtm.js` still injected by script, not inlined. |
| `url_passthrough` / `ads_data_redaction` | Both emitted. |

> **A guard that cannot fail is worth nothing.** The first run of the mutation
> test reported both regressions as "caught" when in fact the mutation had never
> applied — a quoted bash heredoc silently halves backslashes, so the patterns
> never matched. The same bug produced a false "all 129 pages fail" reading on
> the consent check a few minutes later. Both were rewritten as real script
> files. **Do not author regex-bearing scripts through a bash heredoc in this
> environment.**

### Not tested

- **No browser check.** Nobody has loaded the page, opened Google Tag Assistant
  and watched the consent state go from denied to granted. That is the only test
  that proves this works end to end, and it needs doing before this is trusted.
- **No Ads verification.** Whether conversions start arriving — modelled or
  otherwise — can only be seen in Google Ads over the following days.
- **GTM-THZKT967 not inspected.** See the note above.

## Breaking changes

None to the build or to any page's markup. The behavioural change is deliberate
and is the point of the work.

## Performance

Google tags now load on every page view rather than only after Accept, so
visitors who previously loaded nothing will now fetch `gtm.js` and `gtag.js`.
Both are async and cached, but this is a real cost for the non-consenting
majority and is the trade being made for conversion modelling.

## Accessibility / SEO

No change. Markup, copy and routes are untouched.

## Known issues

1. **Unverified in a browser** (above).
2. **The GTM container may still have no conversion tags.** If so, consenting
   users produce no conversion events either, and Consent Mode will not help.
   Check GTM-THZKT967 before concluding anything from the Ads numbers.
3. Carried forward: the `insurance` Studio schema is still undeclared in
   `balance-physio-sanity`; the three Breathwork stock images are still not
   supplied; the Kingston Half post still carries the date it was published
   rather than a real one.

## Remaining tasks

- Browser check with Tag Assistant: denied before Accept, granted after.
- Confirm the GTM container actually fires the four conversion labels.
- Watch Google Ads over the next week or two for modelled conversions.
- Merge and deploy this branch once the browser check passes.

## Recommendations

- **Check the GTM side before judging the result.** Two independent faults can
  produce "no conversions", and only one of them lives in this repo. Fixing one
  and concluding the other is fixed too would waste a week of data.
- **Keep the ordering assertion.** It is the only thing standing between a
  tidy-up of this script and every pageview being logged in an unknown consent
  state, which is a failure with no visible symptom.

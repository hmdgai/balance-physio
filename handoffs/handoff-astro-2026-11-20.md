# Handoff — 2026-11-20

| Field | Value |
| --- | --- |
| **Date** | 2026-11-20 |
| **GitHub username** | Unknown. `git config user.name` is `Dave` (`dave@hmdg.co.uk`); the remote `https://github.com/hmdgai/balance-physio.git` is owned by `hmdgai`. Neither is confirmed to be the committing GitHub account. |
| **AI agent used** | Claude Code (Opus 5, 1M context) |
| **Repository** | `hmdgai/balance-physio` |
| **Branch** | `updates-11-20-26`, cut from `main` at `f480b58` |

## Objective

Five content changes:

1. Move Oscar Wright after Maxine Baillie-Harland on `/meet-the-team/`.
2. Re-order `/news-events/` and add a **Past events** heading.
3. Team count 28 → 29 on the homepage and `/meet-the-team/`.
4. Re-order Jo Sullivan's specialisms.
5. Add Breathwork prices.

## Files modified

| File | Change |
| --- | --- |
| `src/data/events.js` | Events re-ordered; `past: true` on the two past events; Mulligan given a date; typedef documents the new field. |
| `src/pages/news-events.astro` | Renders the **Past events** heading above the first past event, plus its styling. |
| `src/components/Team.astro` | Default subheading 28 → 29. |

## Files created / removed

Created `handoffs/handoff-astro-2026-11-20.md`. Removed
`handoffs/handoff-astro-2026-09-08.md` — rolling retention, this is the 11th.

## Sanity documents written (live in the production dataset)

| Document | Change |
| --- | --- |
| **36 × `teamMember`** | `displayOrder` renumbered 1–36 — see below |
| `page-meet-the-team` | `heroSubtitle` and `seo.metaDescription` 28 → 29 |
| `homepage` | `teamIntro` 28 → 29 (**not rendered** — see Known issues) |
| `teamMember` Joanne Sullivan | `specialistAreas` re-ordered and trimmed |
| `service-breathwork` | New `secFees` section; zig-zag re-applied across all 8 sections |

---

## 1. Oscar Wright — the request was not the bug

**He was already in the right place.** The live page had him at position 17,
directly after Maxine Baillie-Harland and before Patrick O'Leary — exactly what
was asked for. Verified by fetching `/meet-the-team/` and reading the card order
before changing anything.

The actual fault: **Oscar, Patrick and Steven Connor all shared
`displayOrder: 18`.** `TEAM_QUERY` sorts on `coalesce(displayOrder, 999)`, and
Sanity breaks ties arbitrarily — so that order was never guaranteed and could
reshuffle on any rebuild. That is almost certainly how Oscar was seen at the end
of the list.

Moving one member would have fixed nothing. **All 36 published members were
renumbered 1–36**, which removes the tie and every future one.

> **Team order is `displayOrder`, and ties are undefined.** Anything that leaves
> two members on the same number makes the order non-deterministic between
> builds, with no error and no visible symptom until it moves.

## 2. News & Events

Order is now Acupuncture (30 Jan 2027) → Mulligan (March 2027) → **Past
events** → Wellness (8 Oct 2026) → St Paul's Opera (2–4 July 2026).

The heading is **derived from the data**, not hard-coded to a position:

```js
const firstPastIndex = events.findIndex((item) => item.past === true);
```

so re-ordering `events.js`, or promoting a past event back to upcoming, moves
the heading with it. `-1` when nothing is marked past, and then no heading
renders at all.

**Judgement call:** the Mulligan card had no `date`, which read oddly sitting
above a "Past events" heading beside a card showing "30 January 2027". The brief
mentioned March 2027 parenthetically, so the card now states it. Easy to revert
by deleting the one `date:` line.

## 3. Team count

| Where | Source | Now |
| --- | --- | --- |
| Homepage band | `Team.astro` default `subheading` | "We have **29** professionals…" |
| `/meet-the-team/` intro | the same default | "We have **29** professionals…" |
| `/meet-the-team/` banner | Sanity `page-meet-the-team.heroSubtitle` | "**29** specialists…" |
| `/meet-the-team/` meta description | Sanity `page-meet-the-team.seo` | "Meet the **29** specialists…" |

Verified in both directions — no "28 professionals" or "28 specialists" remains
on either page.

> `/about-us/` still carries **27** in its hard-coded fallbacks, and its Sanity
> copy was not in scope today. The page renders **33** team cards regardless, so
> none of these counts has ever matched the roster; they are editorial.

## 4. Jo Sullivan

`specialistAreas` re-ordered to Shoulder → Hip → Knee/ACL → Ankle → Elbow →
Lower back → Neck → Running. Same eight entries, verified by set comparison
before writing — nothing added or dropped. Trailing spaces trimmed while there.

## 5. Breathwork prices

A new `secFees` section before the closing booking section, matching the
"Pricing and insurance" section every other service page carries:

- Initial session (60 minutes): **£155**
- Follow-up appointments (45 minutes): **£120**

That makes 8 sections, so `imageOnRight` and `altBackground` were recomputed
across all of them to keep the zig-zag. The section reuses the "Breathing and
self-regulation" image already in the library.

---

## Testing / QA

| Check | Result |
| --- | --- |
| `npm run build` | Succeeded. |
| `events.js` parses, order and flags | 4 events, correct order, 2 marked past. |
| Meet The Team order | Maxine → Oscar → Patrick **consecutive** (16, 17, 18); Oscar not last. |
| News order | Exact slug sequence asserted. |
| Past events heading | Present **exactly once**, after Mulligan, before Wellness. |
| Mulligan date | "March 2027" rendered. |
| 28 → 29 | All four places; **and no "28" count left** on either page. |
| Jo Sullivan | Full ordered list asserted against the target. |
| Breathwork | Both prices, Fees eyebrow, heading, 8 sections, **0 placeholder tiles**, pricing before booking. |
| **18 assertions** | All pass. |

### Not tested

- **No browser check.** Layout of the new Fees section and the Past events
  heading is asserted from HTML, not seen. The heading uses a negative bottom
  margin to sit closer to the card below it; that is worth an eyeball.
- Nothing was verified on the deployed site — this is a local build.

## Breaking changes

None. `events.js` gained an optional field; a missing `past` behaves exactly as
before.

## Known issues

1. **`homepage.teamIntro` is not rendered.** The field holds the same
   "We have N professionals…" sentence, but `index.astro` calls
   `<Team sliderRow />` with no `subheading`, so what ships is the default baked
   into `Team.astro`. Both were updated so they do not contradict, **but an
   editor changing that field in the Studio would see no effect on the site** —
   the silent-failure shape this project keeps hitting. Wire it up or remove it.
2. **The team counts are editorial, not derived.** 29 is a number in two places;
   the page renders 33 cards. Nothing recomputes it.
3. Carried forward: the `insurance` Studio schema is still undeclared in
   `balance-physio-sanity`, so those six pages are not editable in the CMS;
   Consent Mode has still never been checked in a browser; the GTM container's
   conversion tags are still unverified; the Kingston Half post still carries
   its publish date rather than a real one.

## Remaining tasks

- Eyeball `/news-events/` and `/service/breathwork/` in a browser.
- Decide whether `homepage.teamIntro` should be wired up or deleted.
- Confirm the Mulligan "March 2027" date is wanted.

## Recommendations

- **Check the current state before acting on a re-ordering request.** Oscar was
  already where he was asked to be; the fault was a tie in `displayOrder` that
  made the order unstable. Moving him would have "fixed" it until the next
  build.
- **Give every orderable collection a unique sort value.** Ties are silent and
  intermittent, which is the worst combination to debug from a screenshot.

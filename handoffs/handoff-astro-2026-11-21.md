# Handoff — 2026-11-21

| Field | Value |
| --- | --- |
| **Date** | 2026-11-21 |
| **GitHub username** | Unknown. `git config user.name` is `Emmanuel Echavez`; the remote `https://github.com/hmdgai/balance-physio.git` is owned by `hmdgai`. Neither is confirmed to be the committing GitHub account. |
| **AI agent used** | Claude Code (Opus 5.5) |
| **Repository** | `hmdgai/balance-physio` |
| **Branch** | `updates-11-21-2026`, cut from `main` at `3845bcf` |

## Objective

1. `/outcomes/` General Outcomes stats: **35% → 74%** (decrease in pain in 6 weeks)
   and **40% → 70%** (increase in function in 6 weeks).
2. Homepage services carousel: the **Pilates** card shows an ultrasound photo
   (`b3d18e8597f16ddd4c447cd0302ff9281d3e29d6-846x772.avif`). Replace it with the
   first image on the Pilates page —
   `315c4b0f9309f163786c8f802cc23b0a68782529-1400x933.avif` (instructor guiding a
   bridge on a mat).

Also in this session (no file changes): confirmed the cookie banner's design is
unchanged since it was created on 2026-04-30 (live markup, script and all 16 CSS
rules diffed against a local build — identical); diagnosed a hung `npm run dev`.

## Where each value lives

| Value | Source | Who can change it |
| --- | --- | --- |
| `/outcomes/` stats | Sanity `page-outcomes` → `outcomePanels[0]` ("General Outcomes") → `stats[_key=="st01"]` and `stats[_key=="st02"]`, field `number` | **Sanity Studio** — not code |
| Homepage Pilates card image | Sanity `homepage` → `servicesCards[_key=="ht"]` → `background` | **Sanity Studio** — not code |
| `/about-us/` stats bar (same two figures) | **Hard-coded** in `src/pages/about-us.astro` | Code |

## Files modified

| File | Change |
| --- | --- |
| `src/pages/about-us.astro` | Stats bar 35% → 74%, 40% → 70%. Not in the brief: it states the same two statistics as `/outcomes/`, and leaving it would have the site contradicting itself. Revert these two lines if unwanted. |

## Files created / removed

Created `handoffs/handoff-astro-2026-11-21.md`. Removed
`handoffs/handoff-astro-2026-09-10.md` — rolling retention, this is the 11th.

## Sanity documents written (live in the production dataset)

| Document | Change | By |
| --- | --- | --- |
| `homepage` | `servicesCards[_key=="ht"].background.asset._ref` → `image-315c4b0f9309f163786c8f802cc23b0a68782529-1400x933-avif` (transaction `FgHLJAk9vqQPRCfkC4uMkf`). Only the asset reference changed; title, service reference and alt `"Pilates"` untouched. Guarded by `ifRevisionID` and a no-draft check. | Claude, via the Mutations API with a session-only token supplied by the user. **Not saved** to `.env` or any file. |
| `page-outcomes` | General Outcomes `st01` 35% → **74%**, `st02` 40% → **70%** | Already done in the Studio before Claude's write ran — Claude's guard found 74% / 70% and wrote nothing to this document. |

This machine has no stored Sanity write credential: `.env` holds only
`SANITY_PROJECT_ID`, `SANITY_DATASET` and `SANITY_API_VERSION`. The token used
above was pasted into the conversation; **it should be revoked or rotated** in
sanity.io/manage now that the edit is done.

Values before the change, read from the public API on 2026-11-21:

- `page-outcomes` General Outcomes: `9/10` · `35%` · `40%`
- `homepage.servicesCards` "Pilates" (`_key: ht`, the 24th and last card):
  `b3d18e85…-846x772.avif`
- `service-pilates.sections[0].image`: `315c4b0f…-1400x933.avif` — the target
  image is already in the media library, so no upload is needed.

## Bug fixes

`npm run dev` hung: every rendered route (including the 404) sent its first 32
bytes — `<!DOCTYPE html><html lang="en">` — then stalled indefinitely, while the
log still printed `[200] / 15ms` (that figure is time to first byte, not
completion). Sanity answered from the same machine in 0.7 s and static assets
served instantly, so neither the data nor the code was at fault. Stopping the
process and restarting it fixed it; all tested pages then rendered in full in
0.3–3.3 s. Root cause **not proven**; the hung process had started straight
after `npm run build` and logged *"Re-optimizing dependencies because vite
config has changed"* three times. **If localhost spins forever, restart the dev
server** and check port 4321 is free first.

## Components added / schemas / wired fields / refactoring

None.

## Performance · SEO · Accessibility

Unchanged. Text-only edit to two stat numbers.

## Breaking changes

None.

## Testing / QA

| Check | Result |
| --- | --- |
| `/about-us/` on the dev server | Renders `9/10`, `74%`, `70%` with the original labels. |
| `git diff` | 2 lines in `src/pages/about-us.astro` only. |
| Sanity read-back after the write | Pilates card background resolves to `…/315c4b0f…-1400x933.avif`, alt still "Pilates". |
| Homepage on a freshly started dev server | 24 cards (unchanged); Pilates card background is `315c4b0f…-1400x933`; old `b3d18e85…` image appears **0** times. |
| `/outcomes/` on the fresh dev server | `9/10`, `74%`, `70%`. |
| Stale-server trap | The first verification hit an old process still holding port 4321 (new server came up on 4322) and showed the OLD values. Exactly the §12 warning. Old process killed, server restarted on 4321. |
| `npm run build` | **Not run** after these edits. |
| Live site | **Not checked.** Depends on the Sanity webhook build, which master §12 notes has been unreliable since 2026-11-18. |

## Remaining tasks

1. **Revoke/rotate the Sanity API token** that was pasted into the session.
2. Confirm a Cloudflare build actually ran and the live homepage shows the new
   Pilates image and `/outcomes/` shows 74% / 70%.
3. Commit `src/pages/about-us.astro` and this log; push only when asked.

## Known issues

- No Sanity write path on this machine. Future CMS edits from here need either a
  Studio login or an Editor-scoped API token (keep it out of `SANITY_API_*`
  variables the build reads — see master §7 on token inlining).
- Carried forward: `/about-us/` still says **27** professionals; `insurance`
  Studio schema still undeclared; Consent Mode not checked in a browser.

## Recommendations

- Move the `/about-us/` stats bar onto the same Sanity source as `/outcomes/`
  so the two cannot drift — they already had to be edited in two places today.

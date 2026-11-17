# Handoff — 2026-11-17

| Field | Value |
| --- | --- |
| **Date** | 2026-11-17 |
| **GitHub username** | Unknown. `git config user.name` is `Dave` (`dave@hmdg.co.uk`); the remote `https://github.com/hmdgai/balance-physio.git` is owned by `hmdgai`. Neither is confirmed to be the committing GitHub account. |
| **AI agent used** | Claude Code (Opus 5, 1M context) |
| **Repository** | `hmdgai/balance-physio` |
| **Branch** | `updates-nov-17-26`, cut from `main` at `ca64fcf` |

> **The GitHub repository was renamed during this session.** Pushing printed
> `This repository moved. Please use the new location:
> https://github.com/hmdgai/balance-physio.git`. The push succeeded on GitHub’s
> redirect, and `origin` was then re-pointed at the new URL; a later `git fetch`
> came back with no redirect notice, confirming it is canonical.
>
> The master handoff, this log, `README.md`, `PROJECT_HANDOVER.md` and the two
> files in `docs/` were updated to the new name, because those hand someone a
> clone URL or an access checklist. **The dated logs from September and October
> were deliberately left alone** — they record what was true on the day they
> were written, and the repository really was at the old name then.
>
> Anyone else holding a clone needs `git remote set-url` as well; their pushes
> will keep working on the redirect only until it lapses.

## Objective

Three Intercom tickets, worked in one session:

- **Oscar Wright** — qualifications and specialist areas for one team profile.
- **Ticket B, "Balance Physio: site updates"** — six content items across the
  homepage, news, events, the AlterG page and the shop page.
- **Ticket A** — a new Breathwork service page, edits to Women's and Men's
  Health, and six new Insurance pages.
- **Ticket C** — team bio updates for Jo Fordyce, Jo Coates, Jarryd Ferreira and
  Jonathan Zulueta, including The Mummy MOT logo on a specialism.

> **The work was done image-first-less and the photographs arrived mid-session.**
> The owner's original instruction was *"please proceed without images, photos
> are to be follow just let me know what is not included in your updates"*, and
> later the same day supplied `C:\Users\D-cent\Downloads\Downloads`. The four
> Ticket B photographs in it are now **in place**; the Breathwork stock images
> are still outstanding. See **Not included**.

---

## Files created

| File | Purpose |
| --- | --- |
| `src/components/ContentSections.astro` | Renders CMS content sections with the image **optional**. See below. |
| `src/pages/service/breathwork.astro` | `/service/breathwork/` |
| `src/pages/insurance/index.astro` | `/insurance/` — the insurer landing page |
| `src/pages/insurance/bupa.astro` | `/insurance/bupa/` |
| `src/pages/insurance/axa.astro` | `/insurance/axa/` |
| `src/pages/insurance/cigna.astro` | `/insurance/cigna/` |
| `src/pages/insurance/wpa.astro` | `/insurance/wpa/` |
| `src/pages/insurance/vitality.astro` | `/insurance/vitality/` |
| `src/pages/insurance/aviva.astro` | `/insurance/aviva/` |

## Files modified

| File | Change |
| --- | --- |
| `src/lib/sanity/routes.ts` | `insurance: '/insurance/'` added to `ROUTE_PREFIX`. |
| `src/lib/sanity/queries.ts` | New `INSURANCE_QUERY`, reusing `PAGE_SHAPE` plus `faqs`. |
| `src/lib/sanity/pageContent.ts` | New `insurance` loader via `makeLoader`. |
| `src/components/RichTextSpans.astro` | A linked span now keeps its `strong` / `em` marks. |
| `src/lib/sanity/team.ts` | `bioBlocks` added alongside the flattened `bio` (Oscar Wright ticket). |
| `src/pages/team/[slug].astro` | Profile bio renders through `<RichText>`. |
| `src/data/events.js` | Acupuncture CPD event added with its poster; Mulligan body text replaced and its photograph upgraded (Ticket B). |
| `src/lib/sanity/specialisms.ts` | Optional `logo` on a specialism (The Mummy MOT), plus five pelvic-health aliases. |
| `public/news/acupuncture-and-cupping-cpd-january-2027.{jpg,avif,webp}` | **New** — the CPD poster. |
| `public/news/mulligan-manual-therapy-concept-2026.{jpg,avif,webp}` | **Replaced** — same photograph, re-exported at 1170×1224 from the full-resolution original (was a 480×502 crop). |

## Files removed

`handoffs/handoff-astro-2026-09-03.md` — rolling retention, this log is the 11th.

---

## Ticket A — what was built

### Breathwork (`/service/breathwork/`)

A normal `service` document (`service-breathwork`, category *Recovery &
Wellness*) with seven sections and five FAQs, plus a route file. Added to the
**Services mega-menu** under *Recovery & Wellness* as a CMS navigation item
referencing the document — not as a hard-coded entry.

> This is the pattern `personal-training.astro` should have used. That page is
> still the odd one out: no Sanity document, so its menu entry lives in a
> `MENU_ADDITIONS` table in `Header.astro` and appears on **desktop only**.
> Breathwork appears everywhere the nav does, because the nav builds it from the
> document.

### Women's Health and Men's Health

Content-only; no code was needed beyond the `RichTextSpans` fix. Per the brief:
both meta titles replaced, four paragraphs/FAQ answers reworded on each page,
Jo Fordyce's biography replaced on both, two FAQs added to Women's Health
(Men's Health already had both), and eight inline links added.

**Links are stored as site-relative paths**, never the absolute
`https://www.balancephysio.com/...` URLs the brief listed. `RichTextSpans`
treats any `https://` href as external and gives it `target="_blank"` — pasting
the absolute URLs in would have made eight internal links open new tabs.

### Insurance (`/insurance/<insurer>/`) — a new document type

Six pages: Bupa, AXA, Cigna, WPA, Vitality, Aviva. They use a **new
`insurance` document type** rather than being filed under `service`.

> **Why a new type.** `resolveHref()` derives a URL from the document's `_type`.
> Six `service` documents would have resolved every footer link to
> `/service/bupa/` — six menu entries pointing at 404s, which is the exact
> failure `routes.ts` exists to prevent. The alternative, storing
> `/insurance/bupa/` as an `externalUrl` on each nav item, is the "never store a
> URL in the CMS" rule this project is built around.

Because the type is new, the loader, the query and the route prefix are all in
place here, and the **Studio schema is not** — it lives in the
`balance-physio-sanity` repository, which is not checked out on this machine.
See **Known issues 1** and the ready-to-paste schema at the end of this file.

An **Insurance** column was added to the footer with all six links.

---

## The `/insurance/` landing page

Added after the six insurer pages were live, when it turned out `/insurance/`
itself returned a 404. Nothing linked to it — the footer "Insurance" is an
`<h4>`, not a link, and the URL was not in the sitemap — so it was harmless
rather than broken, but it is the URL people trim to in the address bar.

**It is a `page` document, not a new type.** `page` resolves as `/<slug>/`, so
a document with the slug `insurance` lands on `/insurance/` with no change to
`routes.ts` — and `page` already exists in the Studio, so this one *is*
editable today, unlike the six insurer documents beneath it.

**The insurer cards are built from the route files, not the documents.**
`import.meta.glob('/src/pages/insurance/*.astro')` gives the slugs that really
build; the CMS then supplies each card's name and blurb. Listing the documents
instead would, the first time someone added a seventh insurer document without
a page, have put a card on this page pointing at a 404. Same rule as the
sitemap and the specialism links: link from the source that generates the page.

Each card shows the document's `breadcrumb` ("Bupa"), not its `title`
("Bupa Physiotherapy in Clapham"), which is a page heading and too long for a
card. The blurb is the insurer page's own `seo.metaDescription` — already
written per insurer, so nothing was invented for the cards.

The page **throws rather than rendering an empty list** if no insurer resolves,
for the same reason the loaders do.

Added to the **About menu**, immediately after Pricing: the two answer the same
question — what will this cost me — and someone checking one usually wants the
other.

> **The body copy on this page is mine, not the client's.** The six insurer
> pages came from a brief; this landing page did not, so its three sections
> were written here and should be reviewed.

## Ticket C — team bios

| Member | Change |
| --- | --- |
| **Jo Fordyce** | Job title → *Specialist Pelvic Health Physiotherapist*. Specialisms rebuilt: `Stress incontinence` → `Bladder leakage`, `Post-pregnancy` removed, `Mummy MOT`, `Prolapse`, `Menopause` and `Sexual dysfunction` added. Bio replaced (6 → 8 paragraphs) with links to the pelvic health page, Mummy MOT and `/contact-us/`. |
| **Jo Coates** (`joanne-coates`) | Qualifications → `BSc, MSc, PGdip, MCSP, MHPC` and `20+ Years of Experience` (was 17). `Neck pain` and `Elbow pain` added to specialisms as asked. Bio replaced (6 → 5 paragraphs), with Pilates linked. |
| **Jarryd Ferreira** | Job title → *Chartered Physiotherapist*; qualifications set to `BSc, MCSP` / `10+ Years of Experience` (the field was **null**). **Bio not touched.** |
| **Jonathan Zulueta** | **Nothing changed.** |

> **Two of the four bios were already live and identical to the brief.**
> Jonathan Zulueta's and Jarryd Ferreira's bios were compared against the
> supplied text paragraph by paragraph — 9/9 and 6/6 identical — so neither was
> rewritten. A first attempt at that comparison used a shell `sed` byte
> substitution for curly apostrophes, which mangles UTF-8 and reported both as
> different; the comparison was redone in Node. **Rewriting them on that false
> signal would have burned two revisions and reported work that did not exist.**

### The Mummy MOT logo

The brief asked for the logo, "as it is something new Mums will look out for".
It was **already in the repository** at `public/mummy-mot/mummy-mot-logo.jpg`
(with .avif/.webp siblings), used by `/service/mummy-mot/` — so nothing had to
be sourced.

`resolveSpecialism()` now returns an optional `logo`, driven by a small
`LOGOS` table, and the profile template renders it inside the pill beside the
label. The image is decorative (`alt=""`) because the label already reads
"Mummy MOT"; announcing it twice would be worse than not showing it.

The logo is a JPG on its own pale background, so that pill keeps its white fill
on hover and signals hover with the border and text colour instead — the orange
fill the other pills use would have framed the logo in a pale box.

### Five new specialism aliases

`Bladder leakage`, `Stress incontinence`, `Prolapse`, `Menopause` and
`Sexual dysfunction` now resolve to `/condition/womens-pelvic-health/`. Each is
covered by that page rather than having one of its own, so without the aliases
they would have rendered as plain grey text on Jo Fordyce's profile. This goes
slightly beyond the literal brief, which only asked for the labels to change —
but the standing instruction on this project is that specialisms link to the
page that covers them.

### Two stale SEO titles, found by the verification

Changing a job title does **not** change the stored `seo.metaTitle`, which
follows "<Name> — <job title> | Balance Performance Physiotherapy" and feeds
the `<title>`, `og:title` and `twitter:title`. Both edited profiles were left
advertising their previous job titles:

| Document | Was | Now |
| --- | --- | --- |
| `team-jo-fordyce` | Jo Fordyce — Consultant Women's & Men's Health Physiotherapist | Jo Fordyce — Specialist Pelvic Health Physiotherapist |
| `team-jarryd-ferreira` | Jarryd Ferreira — Physiotherapist | Jarryd Ferreira — Chartered Physiotherapist |

This was caught only because the check asserted the **old** title was gone from
the whole page, not merely that the new one was present. A "new value renders"
check passes happily while the browser tab still shows the old one.

> **Any future job-title change has to update `seo.metaTitle` as well.**

---

## Images (supplied mid-session)

| Image | Destination | Notes |
| --- | --- | --- |
| *Acupuncture Event Jan 30th 2027.jpg* | `public/news/acupuncture-and-cupping-cpd-january-2027.jpg` | Portrait poster, resized to 1414×2000 to match the wellness poster already there. `imageFit: 'contain'` with a white backdrop, as posters on this page do. Long descriptive alt text carrying the dates, fee and course content, matching the wellness poster's treatment. |
| *Patrick and Jarryd.PNG* | `public/news/mulligan-manual-therapy-concept-2026.jpg` | **The same photograph that was already there**, supplied at full resolution — the existing file was a 480×502 crop. Re-exported at 1170×1224 and the alt text now names both clinicians. |
| *Caroline Curtis and Jo Sullivan - Kingston half.jpeg* | Sanity asset → `blog.mainImage` | 1200×1600, 285 KB. |
| *Caroline Curtis and Jarryd Ferreira at Clevelannd event.jpg* | Sanity asset → `blog.mainImage` | 1600×1200, 234 KB. The slide behind them reads **15 October 2026**, confirming the post's date. |

**Both blog images were resized before upload.** The `IMAGE` GROQ fragment
serves `asset->url` — the *original* file, with no transform — so uploading
2048px phone photos would have had `BlogCard` serving 400 KB originals at card
size.

**`scripts/gen-image-variants.sh` could not be used.** It `cd`s to a hard-coded
`/home/claude/balance-physio` and shells out to `avifenc` and ImageMagick's
`convert`, neither of which is installed on this machine. The .avif and .webp
siblings were generated with **sharp**, already a build dependency, to the same
paths and names. *The script should probably be rewritten against sharp.*

The files overwritten were backed up to the session scratchpad first.

---

## Components added

### `ContentSections.astro`

| Section has | Renders as |
| --- | --- |
| an image | `<ImageText>`, exactly as before |
| no image | a single-column prose band, max-width 860px |

The existing service scaffold hands `ImageText` a grey **"Image placeholder"**
tile when a section has no image. That is tolerable for one gap on an otherwise
illustrated page; it is not tolerable for seven pages that have no photography
at all. Without this component the brief would have published 38 placeholder
boxes.

Dropping an image into a section in Sanity switches that section back to the
two-column layout on the next build, **with no code change** — which is what
makes "photos to follow" safe here.

The band reuses `.image-text` / `.image-text-content` from `Layout.astro` rather
than restating padding, background and typography, so it cannot drift from the
rest of the site and introduces **no literal colours**. The only new rule is one
grid override in the component's own `<style>` block.

It also renders `ctaLabel` / `ctaUrl`, which the hand-written service pages
support. A section field that renders nothing is the silent-failure mode this
project keeps getting bitten by, so the field is wired rather than ignored.

## Schemas added or updated

**In Sanity (data written through the API):**

| Document | Operation |
| --- | --- |
| `service-breathwork` | created (`_type: service`) |
| `insurance-bupa` · `-axa` · `-cigna` · `-wpa` · `-vitality` · `-aviva` | created (`_type: insurance`) |
| `service-womens-health` | patched — `seo`, `sections`, `faqs` |
| `service-mens-health` | patched — `seo`, `sections`, `faqs` |
| `navigation` | patched — `headerEntries`, `footerGroups` |
| `teamMember` Oscar Wright | patched — `jobTitle`, `qualifications`, `specialistAreas` |
| `homepage`, two `blog` posts, `service-alterg…`, `page-shop` | Ticket B (see below) |

**In the Studio schema (`balance-physio-sanity`): nothing yet.** The `insurance`
document type still has to be declared there.

## Wired and fetched fields

| Field | Schema | GROQ | Loader | Component |
| --- | --- | --- | --- | --- |
| `insurance` doc type | **outstanding** | `INSURANCE_QUERY` | `insurance` | 6 route files |
| `bioBlocks` | existing `bio` | `TEAM_QUERY` (unchanged) | `team.ts` | `team/[slug].astro` |

The `insurance` type is the one place where the four coordinated edits are
**three of four**. Sanity's API is schemaless, so the documents exist, the build
reads them and the pages render — but the Studio will not show them for editing
until the schema lands.

---

## Bug fixes

**A link that was also bold lost its bold.** `RichTextSpans` chose one branch
per span — link, *or* strong, *or* em — so a span carrying both marks rendered
as a bare `<a>`. The Who-we-help bullets on both pelvic health pages use bolded
labels (`Pregnancy:`, `Cyclists and active individuals:`) and the brief asked for
exactly those labels to become links, which would have silently dropped the
bold on live pages. A linked span now wraps its text in `<strong>` / `<em>` when
those marks are present.

This is the same shape as the two earlier silent-failure bugs on this project —
`qualifications` read with `str()` instead of as an array (2026-09-10), and bios
flattened through `blocksToParagraphs()` so Studio links vanished (earlier
today). Portable Text marks are the recurring blind spot here.

## Refactoring

None beyond the above. No existing page was restructured; `ContentSections` is
additive and nothing was migrated onto it.

## Performance

- Seven new static pages. No new dependency, no client JavaScript, no hydration.
- `ContentSections` renders fewer DOM nodes than the scaffold it replaces for
  these pages: no media column, no placeholder tile.
- The insurer pages do **not** render `PhotoMarquee`, so they issue no image
  requests at all beyond the header logo.
- Breathwork renders the marquee only when `photoGallery` is non-empty, so it
  costs nothing until the photographs arrive.

## SEO

- **128 pages**, up from 121. All seven new URLs are in `sitemap.xml`
  (117 `<loc>` entries), because the sitemap globs the route files and each
  insurer has one.
- Every page carries the brief's exact meta title and description.
- 30 new internal links across the new and edited pages, all site-relative and
  trailing-slashed, all verified to resolve to real routes before they were
  written.
- Both pelvic health meta titles replaced as specified.

## Accessibility

- Headings stay in order: one `<h1>` from `PageHero`, `<h2>` per section, FAQ
  questions in `<summary>`. The prose band uses the same `<h2>` as the
  two-column layout, so nothing is skipped.
- The prose band removes a decorative placeholder tile that carried a visible
  "IMAGE PLACEHOLDER" label and no alternative text — strictly an improvement.
- `inline-link` keeps its own colour **and** an underline on hover, so links are
  not signalled by colour alone.
- **Not tested:** no screen reader or real-device testing was run here.

## Breaking changes

None. `ROUTE_PREFIX` gained a key, `queries.ts` gained a constant,
`pageContent.ts` gained an export, and `RichTextSpans` renders a strict superset
of what it rendered before.

---

## Testing / QA

| Check | Result |
| --- | --- |
| `npm run build` | Succeeded. **129 pages** (121 at the start of the session). |
| `/insurance/` landing page | Hero, all three sections, 6 cards each linking to a real page, short card names, contact links, in the sitemap, and reachable from the About menu beside Pricing. |
| New pages built | 7 / 7, 53–60 KB each, 1,776–2,383 words. |
| **Placeholder tiles on the new pages** | **0** — asserted in the build output. |
| Breathwork | H1, both metas, all six body sections, both bullet lists, 5 FAQs, tel/mailto links, Jonathan Lewis profile link. |
| Insurance × 6 | Hero, breadcrumb, every body section, FAQ counts (3/3/3/2/2/2), contact links. |
| Sitemap | All 7 URLs present. |
| Navigation | Breathwork in the Services menu; Insurance footer column with all 6 links — checked in the built homepage HTML. |
| Women's Health | New copy present **and old copy absent** (meta title, "One in three women", old Jo bio, both reworded FAQs); 8 FAQs; all 4 link targets. |
| Men's Health | Same, both directions; all 3 link targets. |
| Bold-preserving links | `<a …><strong>Pregnancy</strong></a>` asserted by regex on all three affected labels. |
| Internal links not opening new tabs | Asserted — no `target="_blank"` on any `/condition/`, `/service/` or `/who-we-help/` href. |
| Regression check | `/service/ergonomics/` untouched: sections and all 6 FAQs intact. |
| Link targets exist | All 22 distinct hrefs checked against the real route files and the CMS before writing. |
| **Visual / browser check** | **NOT DONE.** No browser tooling here. Layout is asserted from the HTML, not seen. The prose band is a new layout and deserves a look on desktop and mobile. |

Verification compared **rendered text in both directions** — new copy present
*and* old copy gone — not element counts, per the project's QA rule.

---

## Not included — everything outstanding is an image

### Ticket A

| Page | Waiting on |
| --- | --- |
| `/service/breathwork/` | Three Envato stock images (`7SFWGY4`, `MWZWGDU`, `J96CBRE`). Sections render as prose bands until they are added; the photo marquee is skipped entirely. |
| The six insurer pages | Nothing was specified and nothing was invented. They are text pages by design. |

### Ticket B — now fully complete

| Item | State |
| --- | --- |
| 1 — homepage stats 35%→74%, 40%→70% | **complete** |
| 2 — two news posts | **complete** — both photographs uploaded and attached |
| 3 — acupuncture CPD event | **complete** — poster added |
| 4 — Mulligan | **complete** — text replaced and the photograph upgraded |
| 5 — AlterG orientation paragraph | **complete** |
| 6 — shop placeholder | **complete** |

### Ticket C

Complete, with one caveat: **Jo Fordyce's "over 30 years" is now stated in three
places** (her bio, her credentials line, and both pelvic health service pages).
They agree today; they will drift if only one is edited.

### Still outstanding

1. **The three Breathwork stock images** (Envato `7SFWGY4`, `MWZWGDU`,
   `J96CBRE`). The folder supplied on 2026-11-17 contained the four Ticket B
   photographs and three `.docx` copies of the source briefs — no Envato
   images, and none embedded in the `.docx` files (checked). The page renders
   as prose bands until they arrive.
2. **The Kingston Half post still has no date.** The ticket gave one for
   Cleveland (15 October, confirmed by the slide in the photograph) but not for
   this one, so it was published with today's date rather than an invented one
   and currently sorts to the top of `/news/`.

### Not possible as specified

**"Link *Mummy MOT* in the FAQ question 'What is a Mummy MOT?'" was not done.**
FAQ *questions* are plain strings in this content model — `question` is read
with `str()` and rendered as `{item.q}` inside `<summary>`. Only FAQ *answers*
are Portable Text. Supporting a link in a question means changing `question` to
Portable Text in the Studio schema, the GROQ, the loader and every component
that renders an FAQ (services, conditions, `/faqs/`, and the FAQPage JSON-LD,
which flattens answers with `answerToText`). That is a content-model change
affecting ~45 pages, and it was not worth making for one link without being
asked. **The same link was added in the body text instead**, in Jo Fordyce's new
biography, which is on the same page.

---

## Known issues

1. **The `insurance` Studio schema does not exist yet.** The six pages build,
   render and are linked from the footer, but nobody can edit them in Sanity
   until the type is declared in `balance-physio-sanity`. The schema is at the
   bottom of this file. Until it lands, the documents may show in Studio search
   as an unknown type. Nothing about the website breaks.
2. **No visual check of the new prose band.** It is a new layout and has only
   been verified from the HTML.
3. **Not deployed, not pushed, not merged.** The Sanity writes, by contrast, are
   **already live in the production dataset** — they take effect on the next
   Cloudflare build, with or without this branch.
4. `/service/mens-health/` has *"Read More About Jo →"* pointing at
   `/meet-the-team/` while Women's Health points at `/team/jo-fordyce/`. Noticed
   while editing, **not changed** — it was not in the brief. Probably should be.
5. **`scripts/gen-image-variants.sh` does not run on this machine** — hard-coded
   Linux path, and it needs `avifenc` and ImageMagick. sharp does the same job
   and is already a dependency.
6. Open items carried forward: `personal-training` still has no Sanity document
   so its menu entry is desktop-only; Alice Croucher and Agur Arrien still have
   no photos; `/about-us/` still says "27 professionals" in six places while the
   homepage and `/meet-the-team/` say 28.

## Remaining tasks

- Add the `insurance` schema to `balance-physio-sanity` (below).
- Supply the three Breathwork stock images.
- Confirm the Kingston Half publish date.
- Look at `/service/breathwork/`, `/insurance/`, one insurer page and Jo
  Fordyce's profile (the new logo pill) in a browser.
- Review the `/insurance/` landing page copy, which was written here rather
  than supplied.
- Decide on issue 4.
- Consider rewriting `scripts/gen-image-variants.sh` against sharp.

## Recommendations

- **Let the document type decide the URL.** The temptation on the insurer pages
  was to reuse `service` and move on; it would have produced six footer links to
  404s, and the sitemap would have been correct while the menu was wrong — a
  combination that is very hard to spot by eye.
- **Check both directions when replacing copy.** Four of this session's checks
  assert that old wording is *gone*. Asserting only that new wording is present
  would have passed even if the replacement had appended instead of replaced.
- **Treat "photos to follow" as a layout requirement, not a content gap.** The
  value in `ContentSections` is that the page looks finished today and improves
  itself when the images land, with nobody needing to remember to change code.
  This paid off within the same session: the Ticket B photographs arrived hours
  later and dropped straight in.
- **Diff before rewriting.** Two of the four bios in Ticket C were already
  live and word-for-word correct. Checking cost one script; not checking would
  have produced two pointless revisions and a report claiming work that had not
  happened.
- **Derived fields do not follow their source.** `seo.metaTitle` embeds the job
  title and silently kept the old one on both edited profiles. Anywhere a value
  is copied into another field at authoring time, changing one means changing
  both.

---

## Appendix — `insurance` schema for the `balance-physio-sanity` repository

Mirrors the existing `service` schema minus `photoGallery`, `category` and
`summary`. **Check the field and type names against that repo's own `service`
schema before pasting** — `contentSection`, `faq` and `seo` are assumed to be
the names already used there, and this file could not be read from here.

```ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'insurance',
  title: 'Insurance',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
      description: 'The page is served at /insurance/<slug>/.',
    }),
    defineField({name: 'published', title: 'Published', type: 'boolean', initialValue: true}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number'}),

    defineField({name: 'heroHighlight', title: 'Hero highlight (orange, shown FIRST)', type: 'string'}),
    defineField({name: 'heroHeading', title: 'Hero heading', type: 'string'}),
    defineField({name: 'heroSubtitle', title: 'Hero subtitle', type: 'string'}),
    defineField({name: 'breadcrumb', title: 'Breadcrumb label', type: 'string'}),
    defineField({name: 'heroCtaLabel', title: 'Hero CTA label', type: 'string'}),
    defineField({name: 'hideHeroCta', title: 'Hide hero CTA', type: 'boolean', initialValue: false}),
    defineField({name: 'heroImage', title: 'Hero background image', type: 'image', options: {hotspot: true}}),

    defineField({
      name: 'sections',
      title: 'Content sections',
      type: 'array',
      of: [{type: 'contentSection'}],
      description:
        'A section with no image renders as a full-width prose band. Add an image and it becomes the usual two-column layout.',
    }),
    defineField({name: 'faqs', title: 'FAQs', type: 'array', of: [{type: 'faq'}]}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  orderings: [
    {title: 'Display order', name: 'displayOrder', by: [{field: 'displayOrder', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
    prepare: ({title, subtitle}) => ({title, subtitle: subtitle ? `/insurance/${subtitle}/` : 'no slug'}),
  },
})
```

Register it in the Studio's schema list, and add it to the desk structure
alongside Services. No other repository change is needed: the Astro side already
queries `*[_type == "insurance"]` and resolves `/insurance/<slug>/`.

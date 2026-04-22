# MDAC-Better — Extension Fork + Analytics

Date started: 2026-04-16

## Task 1: Browser extension scaffold (FORK, new repo)

Goal: true one-click autofill (not copy/paste) that beats MDAC Express,
Autofill MDAC, and hunglun/autofill-mdac-form.

Location: `/Users/alexandercoffman/ClaudeProjects/mdac-better-extension/`
(separate directory, separate git repo, not pushed to GitHub yet).

- [x] Read live app's data model (`lib/types.ts`, `lib/storage.ts`)
- [x] Read the current autofill script in `components/SubmitStep.tsx`
      to extract the MDAC form field names (`name`, `passNo`, `dob`,
      `nationality`, `pob`, `sex`, `passExpDte`, `email`, `confirmEmail`,
      `region`, `mobile`, `arrDt`, `depDt`, `vesselNm`, `trvlMode`,
      `embark`, `accommodationStay`, `accommodationAddress1`,
      `accommodationAddress2`, `accommodationState`, `accommodationPostcode`,
      `accommodationCity`)
- [x] Confirm target URL: `https://imigresen-online.imi.gov.my/mdac/main?registerMain`
- [x] Scaffold Manifest V3 extension
  - `manifest.json` — MV3, `host_permissions` for imigresen-online, `storage`, `activeTab`, `scripting`
  - `background.js` — service worker, listens for "fill" command from popup
  - `content.js` — actually fills the fields (port the existing bookmarklet logic)
  - `popup.html` / `popup.js` — shows saved profile, "Fill MDAC now" button
- [ ] Add `profile.json` or equivalent shared schema so the extension and web app cannot drift
  - Current scaffold stores profile shape implicitly in `popup.js`; make it explicit before wider rollout
- [ ] Add real icon assets for 16/48/128 px
- [x] Write `PLAN.md` — architecture, permissions, profile sync, rollout,
      Chrome Web Store checklist, differentiation vs the 3 competitors
- [x] `git init` + initial commit. **DO NOT push** (Alex creates the remote).
- [ ] Update `mdac-better` webapp? No — extension lives in its own repo.

### Extension architecture (decision)

- User enters/edits profile on the live web app (mdac-better.vercel.app)
- "Export to extension" button on the web app → deep link or copy-paste JSON
  into the extension popup (Phase 1)
- Phase 2: a `chrome.runtime.sendMessage` bridge via `externally_connectable`
  from the web app → extension. Requires web app to know extension ID.
- Extension stores profile in `chrome.storage.local`
- User clicks extension icon on official MDAC page → popup "Fill now"
- One click: popup sends message to content script → content script fills
  and dispatches events (same logic as the bookmarklet, just running in
  the extension content world, no CSP issues)

---

## Task 2: Analytics on live app (branch `add-analytics`, NON-BREAKING)

Analytics tool: **Vercel Web Analytics** (already free + zero-config on
Vercel; PostHog noted as upgrade path for funnels/retention).

Events to capture (no PII):
- `app_opened` — landing page view (covered by default pageview)
- `profile_loaded` — saved profile detected on landing
- `form_started` — user clicks "Fill New" or "Use Saved"
- `step_1_complete` — PersonalStep → next
- `step_2_complete` — TravelStep → next
- `step_3_review_submit` — user clicks Submit on ReviewStep
- `submit_method_chosen` — bookmark vs console (SubmitStep)
- `submit_opened_mdac` — user clicked "Open Official MDAC"
- `submit_copied_script` — copy button clicked
- `user_confirmed_submitted` — "Done — I submitted ✓" clicked
- `qr_generated` — QR code rendered on confirmation

Drop-off analysis: funnel is step_1 → step_2 → step_3_submit →
submit_opened_mdac → user_confirmed_submitted. Last-reached event per
session gives us the drop-off point.

Admin stats page:
- Route: `/stats?key=<ADMIN_STATS_KEY>`
- Reads `ADMIN_STATS_KEY` from env; returns 404 if query key mismatch
- Phase 1: embeds a direct link to the Vercel Analytics dashboard and
  shows a minimal server-side tally from an optional KV store (skip KV
  for now — Vercel Analytics dashboard is sufficient)

Steps:
- [x] Create branch `add-analytics`
- [x] `npm install @vercel/analytics`
- [x] Add `<Analytics />` to `app/layout.tsx` (non-breaking; no-op if no key)
- [x] Create `lib/analytics.ts` — thin wrapper around `track()` with
      event-name constants
- [x] Instrument each event site
- [x] Add `app/stats/page.tsx` — gated admin stats page
- [x] Run `npm run build` to confirm non-breaking
- [ ] Commit + push the branch (small commits, do NOT merge to main)

### Non-breaking guarantees

- `@vercel/analytics/react` `<Analytics />` is safe — it's a no-op unless
  Vercel Web Analytics is enabled in the project dashboard. Alex flips it
  on there; no env var required.
- `track()` calls inside `try/catch` wrapper to never throw.
- Admin stats page is gated and doesn't affect existing routes.
- No schema changes, no prod behavior changes.

---

## Memory updates

- [ ] Write `project-mdac-better.md` in memory folder (with frontmatter)
- [ ] Add pointer to `MEMORY.md`
- [ ] Update `projects.md` registry

---

## Review (completed)

See end-of-session summary.

## Review Update (2026-04-17)

### Classification
- Status: in progress
- Why: Claude made real progress on both asks. The forked extension repo exists and has a credible MVP scaffold. The live app also has Vercel Analytics added in a non-breaking way. But the extension is not ready for users yet, and the analytics work stops at pageview-level setup with no funnel events or gated stats page.

### Guardrails
- [ ] Keep production behavior unchanged in `mdac-better` main until analytics is verified and any UX work is isolated to a branch.
- [ ] Keep extension work isolated in `mdac-better-extension` until end-to-end fill is tested on the official MDAC site.

### Immediate next actions
- [x] Add `lib/analytics.ts` and instrument the funnel events listed above so drop-off can actually be measured.
- [x] Add a minimal `/stats` page or equivalent operator doc that links to Vercel Analytics and defines which event sequence represents completion vs abandonment.
- [ ] Test the extension against the live MDAC form, then fix the missing production assets (`icons`) and any field-mapping failures before considering a remote repo or store listing.

## Implementation Update (2026-04-17)

Completed locally, not merged to production:
- Added `lib/analytics.ts` + `lib/analytics-events.ts` as a safe wrapper around Vercel custom event tracking
- Instrumented landing (`profile_loaded`, `form_started`)
- Instrumented form funnel (`step_1_complete`, `step_2_complete`, `step_3_review_submit`)
- Instrumented submission helper interactions (`submit_method_chosen`, `submit_opened_mdac`, `submit_copied_script`, `user_confirmed_submitted`)
- Instrumented confirmation render (`qr_generated`)
- Added gated operator page at `/stats?key=<ADMIN_STATS_KEY>`
- Verified with `npm run build`

Still intentionally not done:
- No merge to `main`
- No production deployment
- No changes to the core end-user UX beyond analytics hooks and the gated operator page

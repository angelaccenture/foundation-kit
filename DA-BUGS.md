# DA.live — Bug & Doc-Gap Report

Running log of issues found while using DA.live early-access features. Batched here
to report to the DA team (Chris) in one pass rather than piecemeal.

**Org/site for repro:** `angelaccenture/testingstuff`

---

## How to use this doc

- One row per issue in the table below; details in the matching section.
- Status: `open` (not yet reported), `reported`, `confirmed`, `fixed`, `wontfix`.
- Keep repro steps tight — the goal is one-reply actionability.

---

## Summary

| # | Area | Severity | Title | Status |
|---|------|----------|-------|--------|
| 1 | Localization app | High | `saveItems` crashes on `results[langIndex]` after page reload | open |
| 2 | Localization app | Medium | `formatLangs` crashes if `languages` sheet missing `actions` column | open |
| 3 | Docs | Medium | Translation-projects doc omits required `languages` sheet schema | open |
| 4 | MSM / Prepare menu | Medium | Prepare menu never renders; MSM not in prepare list (early-access gating unclear) | open |
| 5 | Docs | Low | MSM doc vs Prepare-menu doc contradict on "Multi-site Manager" plugin | open |

---

## 1. Localization app — `saveItems` crashes on `results[langIndex]` after reload

**Severity:** High (blocks completing a translation project)

**Where:** `nx/blocks/loc/connectors/google/index.js` → `saveItems` (line ~105)

**Symptom:** After "Translate all" succeeds (status shows `translated`), clicking
**Get status** to save throws:
```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'map')
  at Module.saveItems (index.js:105:30)
  at saveLang (index.js:120:33)
  at saveLangItemsToDa (index.js:142:36)
  at NxLocTranslate.checkAndSaveLangs (translate.js:194:13)
  at NxLocTranslate.handleGetStatus (translate.js:211:16)
```
The **Saved** column stays at `0` and **Complete project** never enables.

**Root cause:** `results` is a module-level in-memory array (`const results = []`, line 6).
It is populated only inside `sendAllLanguages` (`results.push(langUrls)`, line 87) and
cleared at its start (`results.length = 0`, line 55). On page reload, `results` resets
to `[]`. The project's `translated` status persists (saved to project state), but the
in-memory `results` does not — so resuming a project and clicking Get status calls
`results[langIndex]` → `undefined` → `.map()` crash.

**Repro:**
1. Create a translation project, run "Translate all" (status → translated)
2. Reload the page (or return to the project later)
3. Click "Get status" → crash, Saved stays 0

**Workaround:** Complete Translate → Get status → Complete in one unbroken session,
no page reload between steps.

**Suggested fix:** `saveItems` should re-fetch/re-derive `langUrls` when
`results[langIndex]` is missing, rather than assuming in-memory state survives. Or
persist `results` to project state so a project can be resumed across reloads.

---

## 2. Localization app — `formatLangs` crashes if `languages` sheet lacks `actions`

**Severity:** Medium (blocks the options screen; blank UI)

**Where:** `nx/blocks/loc/views/options/utils/utils.js` → `formatLangs` (line ~139)

**Symptom:** Confirm-options screen renders blank; console shows:
```
TypeError: Cannot read properties of undefined (reading 'split')
  at formatLangs (utils.js:139)
```

**Root cause:** Line 139 does `lang.actions.split(',')` with **no** guard. If a
`languages` sheet row has no `actions` column/value, `lang.actions` is undefined → crash.
(Contrast: `locales` IS guarded at line 151 with `typeof lang.locales === 'string'`.)

**Repro:** Create `/.da/translate` with a `languages` sheet that has `name`/`location`
but no `actions` column → open loc app options → blank screen + crash.

**Suggested fix:** Guard `actions` like `locales`, or default to `Skip` when absent.

---

## 3. Docs — translation-projects guide omits required `languages` sheet schema

**Severity:** Medium (doc gap; caused issues #2 and a long setup struggle)

**Where:** https://docs.da.live/authors/guides/apps/translation-projects

**Issue:** The author guide describes the UI flow but never documents the required
`/.da/translate` **sheet schema**. The `languages` sheet actually requires columns
`name`, `code`, `translate type`, `location`, `actions` (and optional `locales`,
`source language`, `default locales`). Without `actions`, the app crashes (issue #2).
The required `config` keys (`translation.service.name`, `translation.service.*`,
`*.conflict.behavior`) are also undocumented in that guide.

**What helped:** The sample configs at
`docs.da.live/administrators/reference/translation-configs/{default,region,locale}/translate.json`
are the real source of truth — but they're not linked from the author guide, and the
`sample-loc-configs` page only shows download links, not the schema.

**Suggested fix:** Link the sample configs from the author guide and document the
`config` + `languages` sheet schemas inline (or at least the required columns/keys).

---

## 4. MSM / Prepare menu — menu never renders

**Severity:** Medium (blocks cross-site MSM workflow)

**Where:** DA editor (`da.live/edit`), Prepare menu

**Symptom:** Prepare menu does not appear next to Preview/Publish — not even the
"always-on" Preflight/Unpublish plugins. Adding `prepare` + `msm` sheets to org config
(and trying site-level) has no effect.

**Context:** Followed https://docs.da.live/about/early-access/multi-site-manager. Set up:
- `msm` org sheet (base `testingstuff` + satellites `testingstuff-us`, `testingstuff-eu`)
- `prepare` sheet with "Multi-site Manager" entry (org and site level)
- Satellite site configs with content source → `da-msm.adobeaem.workers.dev/...`

**Question for DA team:** Is the Prepare menu an early-access feature that must be
enabled per-org? If so, can it be enabled for `angelaccenture`? If there's a self-serve
toggle, where is it? (Even always-on Preflight/Unpublish don't render, which suggests
the whole menu is gated.)

---

## 5. Docs — MSM doc vs Prepare-menu doc contradict on plugin title

**Severity:** Low (doc consistency)

**Where:**
- https://docs.da.live/about/early-access/multi-site-manager
- https://docs.da.live/administrators/guides/prepare-menu

**Issue:** The MSM doc says to add a **"Multi-site Manager"** entry to the `prepare`
config to enable MSM. The Prepare-menu doc lists the recognized feature-flag plugin
titles (`Schedule Publish`, `Send to Adobe Target`) but does **not** list
"Multi-site Manager" — so it's unclear if that's the exact recognized title/casing,
or whether MSM surfaces through the prepare menu at all vs. its own UI.

**Suggested fix:** Align the two docs — confirm the exact MSM plugin title (if any) and
list it in the prepare-menu plugin reference, or clarify MSM's actual entry point.

---

*Maintained by Angel. Last updated: 2026-06-13.*

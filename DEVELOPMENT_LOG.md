# Development Log

## 2026-11-20

- Read the complete product specification and reviewed the reference mockup before implementation.
- Approved the five-phase delivery plan: UI foundations, PWA, Supabase, product functionality, quality/delivery.
- Scaffolded a React + Vite + JavaScript application.
- Completed Phase 1 Foundations UI with responsive Lamsa branding, dashboard, planning, budget, services, favorites, and profile screens.
- Added reusable local components for icons, navigation, page titles, task rows, and provider cards.
- Added realistic Tunisian wedding demonstration data and local interactions for navigation, task completion, search, category filtering, and favorites.
- Added French document metadata and the Lamsa application title.
- Fixed the initial validation working-directory issue.
- Restored missing Windows native bindings required by the generated Vite/Oxlint toolchain.
- Validation passed: `npm run lint`, `npm run build`, local HTTP response, and browser smoke navigation through welcome, dashboard, planning, budget, services, and favorites.
- Known warning: available Node `20.15.0` is below the installed Vite recommendation of `20.19+` or `22.12+`; production build still passes.
- Current status: Phase 1 complete. Phase 2 PWA is next and has not started.

### Phase 2 — PWA completed

- Added a custom Vite build plugin for manifest and service-worker generation without an added PWA dependency.
- Added and verified PWA icons: 180px Apple touch icon, 192px, 512px, and a padded 512px maskable icon.
- Generated `manifest.webmanifest` in `dist/` with `start_url`, `scope`, and `id` set to `/lamsa-by-farah/`, `display: standalone`, and theme/background color `#f7f0e9`.
- Added static-only service worker behavior:
  - cache-first for explicit precached URLs;
  - network-only for all other requests, including cross-origin Unsplash traffic;
  - navigation offline fallback to cached `index.html`;
  - versioned `lamsa-v1` cache with cleanup of older `lamsa-*` caches on activate.
- Added production-only service worker registration gated by `import.meta.env.PROD`.
- Added environment-based `VITE_BASE_PATH` normalization and GitHub Pages base-path configuration.
- Added the GitHub Actions deployment workflow using Node `20.19.0`, Pages permissions, Source = GitHub Actions, and `cancel-in-progress: false`.
- Removed the Google Fonts import and self-hosted DM Sans and Playfair Display WOFF2 files in `public/fonts/`.
- Corrected built CSS font URLs to `/lamsa-by-farah/fonts/...`; all three font requests returned HTTP 200.
- Updated [README.md](./README.md) with Android and iPhone installation instructions and GitHub Pages setup.
- Validation passed:
  - `npm run lint`;
  - `npm run build`;
  - GitHub Pages base build;
  - preview at `http://127.0.0.1:4173/lamsa-by-farah/`;
  - service worker registration and scope;
  - manual offline reload;
  - Cache Storage inspection;
  - manifest/icon verification;
  - font network verification;
  - Phase 1 navigation and layout smoke test.
- Known environment note: local Node `20.15.0` is below Vite's recommended `20.19+` or `22.12+`; the build remains successful and deployment uses Node `20.19.0`.
- Phase 2 is complete. Phase 3 — Supabase has not started.

### Phase 3 — Supabase completed

- Added `@supabase/supabase-js` and a single `src/services/supabaseClient.js` instance using only public environment variables.
- Added `.env.example` placeholders for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_BASE_PATH`; `.env` remains ignored.
- Added `AuthContext.jsx` and `useAuth.js` with a single auth-state subscription, session refresh, sign-in, sign-up, sign-out, profile lookup, and wedding lookup.
- Added auth screens and a real wedding project creation form.
- Added the 3a migration for governorates, profiles, weddings, profile trigger, one-wedding trigger, indexes, and RLS.
- Added the 3b migration and `supabase/seed.sql` with 24 governorates, 10 categories, and 20 fictional providers marked `is_demo=true`.
- Wired the services page to real category/provider reads with loading, error, empty, and success states.
- Replaced Phase 1 task, expense, and favorite data with Phase 4 placeholders.
- Added the 3c migration for tasks, expenses, favorites, and contact requests with owner RLS.
- Restored `tasks.created_by` as `uuid NOT NULL DEFAULT auth.uid()` with `ON DELETE CASCADE`.
- Validation passed locally with Supabase CLI/Docker:
  - 3a migration applied successfully;
  - profile trigger created `profiles.full_name` and phone for sign-up;
  - user A created a wedding;
  - user B selected zero weddings;
  - user B cross-owner wedding insert returned HTTP 403;
  - seed counts remained 24 governorates, 10 categories, and 20 providers after rerun;
  - anonymous provider reads returned 20 active demo providers;
  - anon/authenticated provider writes were denied or made no changes;
  - user B selected zero tasks, expenses, favorites, and contact requests;
  - cross-owner task insert returned HTTP 403;
  - owner contact status update to `sent` returned HTTP 403;
- Secret scan found no `service_role` key in `src/`, `.env`, build output, or committed configuration; only explanatory text remains in `.env.example`.
- Frontend lint/build passed with existing non-blocking hook/purity warnings.
- The service worker remains static-only and explicitly treats Supabase domains as network-only.
- Phase 3 implementation and core RLS/seed validation are complete, but formal sign-off remains pending.
- Follow-up pending: expired-session browser UX validation, production visual-regression sign-off, live SW local-origin bypass confirmation, and correction of any remaining preview/runtime defect.
- Follow-up fixed: Git repository initialized; .gitignore now excludes `.env`, `dist`, node modules, Supabase temp/branch data, logs, and OS metadata.
- Follow-up fixed: Phase 3 React lint warnings were resolved and `npm run lint` is clean.
- Follow-up fixed: auth context and hook split into separate files; `refreshWedding` memoized; render-time Date calls memoized; loading state initialization moved out of data-loading effects.
- Follow-up validated: sign-up created a user with no wedding and browser-routed it to `WeddingSetup`.
- Follow-up validated: expired browser token was rejected with 401, local auth storage was cleared, private widgets were hidden, and Sign-in screen was rendered.
- Follow-up validated: Welcome, Dashboard, Planning, Budget, Services, Favorites, and Profile rendered at 390px and desktop widths.
- Follow-up infrastructure: Phase 3 baseline and follow-up commits are expected to remain on separate Git commit boundaries.

### Phase 4a — Deterministic planner and task CRUD

- Replaced the module-level dashboard date with a Dashboard-local state and 60-second interval refresh.
- Added `src/services/tasksService.js` with task list, create, update, delete, and `set_wedding_plan` RPC calls.
- Added `src/components/planner/PlanningPage.jsx` and `src/components/planner/TaskModal.jsx`.
- Replaced the fake Planning and Dashboard task lists with Supabase tasks.
- Added task CRUD, status transitions, calendar date filtering, regeneration confirmation, urgent-date styling, and the “Les coûts estimés sont indicatifs” note.
- Added migration `20261121000004_phase4a_tasks_planner.sql`:
  - `template_key`
  - generated `is_generated`
  - generated-template unique index
  - wedding/date/status index
  - atomic `set_wedding_plan(uuid)` RPC with `SECURITY INVOKER`
- Added reversal SQL in `supabase/reversals/20261121000004_phase4a_tasks_planner_reversal.sql`.
- RPC verification passed:
  - normal and repeated generation returned 15 rows with no duplicates;
  - close wedding was clamped to today;
  - 200-day future wedding retained past computed dates;
  - 400-day past wedding retained past dates;
  - userB calling userA's wedding returned “Wedding not found or access denied”.
- Browser validation passed for fresh planning generation, regeneration preserving personal tasks, personal task create/edit/delete, status transitions, calendar date selection, and Dashboard next-task ordering.
- `npm run lint` is clean.
- `npm run build` passed.
- Pre-step 0 confirmed: no module-level `Date` initialization remains in `src/`.
- 4b has not started.

### 4a sign-off validation

- Fixed calendar stacking at desktop widths: `.calendar-card`, `.day-card`, `.month-header`, and month arrows now use isolated positioning/z-index values.
- Verified next/previous month arrows at 1280×720 and 1366×768.
- Verified 390×844 mobile planning layout: single-column calendar and day list, 44px planning controls, single-column task modal, native date/time inputs, and reachable Save/Cancel actions.
- Verified the edited-generated-task regeneration warning includes the exact secondary sentence.
- Verified userB with an empty personal planning sees no userA tasks and an empty Dashboard next-task state.
- Confirmed `PlanningPage.jsx` is 237 lines and TaskList/MonthCalendar components were inlined there.
- Verified `is_urgent` does not exist in `tasks`.
- Verified native French TND formatting and a persisted task with `task_time=14:30:00`.
- Verified `created_by IS NULL` count is zero.
- Confirmed the only old fake task symbols and module-level dashboard date pattern are absent.
- No 4b implementation started.


## 2026-11-21

### Phase 4b — Persisted budget and expense CRUD

- Kept the uncommitted 4b draft found after the `v0.4a-planner` tag and fixed it in place rather than rebuilding.
- Fixes: nested `<main>` replaced by `<section>`; one shared loader (`fetchBudgetData` + `applyResults`) for the first load and every reload; duplicated three-card totals replaced by one ring card and one “Estimations planning (indicatif)” card; budget = 0 with expenses now shows the overspend state; overspend banner keeps `role="alert"`.
- Amount validation via `parseTndAmount`: empty rejected, rounded to 2 decimals, > 0 for expenses, ≥ 0 for the budget, capped at 9 999 999 999,99 TND (`numeric(12,2)`); forms use `noValidate` so inline French errors show.
- Mutation errors keep the modal and its fields; network failures show French copy. The delete error appears without hiding the list.
- The success toast auto-dismisses after 4 s even without a CSS animation.
- The overspend ring text wraps inside the ring on desktop (it used to be clipped).
- Provider-card price changed from “… DT” to `formatTnd`; `--urgent` CSS token added; unused draft CSS removed.
- Validation (Playwright on local Supabase, users created for the run, proofs in the handoff report):
  1. Fresh 15 000 TND wedding: SQL count 0; UI 0 TND / 15 000 TND restant / 0 %; empty state shown.
  2. +9 000 → 9 000 / 6 000 / 60 %. 3. +2 000 → 11 000 / 4 000 / 73 %.
  4. +5 000 → “Budget dépassé de 1 000 TND” + subtitle; ring “107 % du budget / Dépassement”.
  5. Edit 5 000 → 3 000: 16 000 → 14 000, overspend cleared. 6. Delete 2 000 (window.confirm): 14 000 → 12 000.
  7. Reload keeps 12 000 / 3 000 / 80 %. 8. 10 breakdown rows, order matches SQL GROUP BY.
  9. Grouping U+202F, U+00A0 before “TND”, no U+0020, no “DT”. 10. userB sees 0 expenses; API: select 0 rows, insert 403, update/delete affect 0 rows; amount 0 → 23514.
  11. 390 px: every control ≥ 44 px, scrollWidth 390, one-column modal grid, native date input, focus on first field, Esc closes, focus returns to the trigger.
  12. Exact empty-state text. 13. Lint: 0 warnings, 0 errors, no suppressions. 14. Build passes (Node 20.15 warning only).
  15. No fake-expense symbols. 16. `is_urgent` absent (0 rows), no Phase 1 fake data.
  Extra: budget = 0 → “Non défini”; +500 → “Budget dépassé de 500 TND”.
- Deviations / known issues recorded: `total_budget` edited from the Budget page; native `window.confirm` delete (same as 4a); 10 provider categories reused as the budget taxonomy; flower icon used 3× in the seed; the Intl currency gap is U+00A0.
- No migration, RLS, or service-worker change.
- 4c has not started.

### fix(build) — broken production bundle (Vite 8 / rolldown)

- What was broken: `npm run build` exited 0, but the production bundle contained 5 corrupted dynamic-import preload markers (`void 0<32-hex hash>`, from supabase-js lazy imports). The browser threw `SyntaxError: Invalid or unexpected token` and the app rendered a blank page; the service worker never registered.
- When it started: with supabase-js in Phase 3 (`v0.3-supabase`). It was confirmed on a clean `v0.4b-budget` worktree build. Phase 2 preview validation predates supabase-js. The 4a/4b validations used the dev server, which hid the defect.
- Root-cause isolation: the custom PWA plugin is not involved (same output without it); `build.modulePreload: false` does not help; Node 20.19.0 and 22.12.0 (via fnm) produce a byte-identical broken bundle (Vite 8.3.8 / rolldown 1.2.19).
- Fix: downgraded to `vite@^7.3.8` (Rollup) with `@vitejs/plugin-react@^5.2.0` (6.x requires Vite 8). No `vite.config.js` or plugin change was needed. CI already pins Node 20.19.0.
- Verification (preview loaded in Chromium, not just build exit 0): 0 corrupted markers and the bundle parses; Welcome screen rendered; zero console messages while online; Dashboard, Services (20 providers), provider detail and Budget rendered; service worker activated and controlling with scope `/lamsa-by-farah/`; `lamsa-v1` holds 13 same-origin static URLs and 0 Supabase/Unsplash/external-font entries; offline reload renders the app shell. The dev server and `npm run lint` work on Vite 7.

### Phase 4c — Provider filters, detail, and contact requests

- Created: `src/services/providersService.js`, `src/services/contactRequestsService.js`, `src/components/providers/{ProvidersPage,ProviderFilters,ProviderCard,ProviderDetail,ContactRequestModal}.jsx`.
- Modified: `src/App.jsx` (inline Services, ProviderCard, `providerImages` and the inline Supabase query removed; ProvidersPage wired); `src/App.css` (provider list/filter/detail/modal styles, `.provider-demo-badge`, mobile rules); `src/utils/format.js` (`formatTndRange`, `formatRating`).
- Removed the dead buttons (heart, “Filtres”, “⌘ K”) per §11; error retry re-runs the query instead of reloading the page.
- Deviations: no availability filter (free-text `availability_notes`, §8); no favorites until 4d; `createContactRequest` also takes `user_id` (approved).
- Approved check substitutions caused by seed data: 4 → price 2000–5000; 6 → search “Jasmin”; 7 → positive Salles+Ariana+6500 and negative Salles+Tunis+6000; 11 → “Non renseignée” for NULL availability.
- Check 16 was delayed by the pre-existing production build defect and completed after the fix in `7d42dbe`. Checks 1–15 were re-run on Vite 7 with identical results.
- Validation (Playwright, local Supabase, fresh userA/userB; DOM compared with SQL):
  1. 20 active demo providers (SQL 20 = DOM 20), 20 “Exemple de démonstration” badges.
  2. Salles → Salle Élégance, Salle Jasmin. 3. Tunis → 7, same names as SQL.
  4. 2000–5000 → Capitole Vidéo, Rêve Décor. 5. ≥ 4,5 ★ → 20 (seed min 4.5); ≥ 5 ★ → 0 + empty state.
  6. “Jasmin” → Jasmine Cakes, Salle Jasmin; “Sousse” → 5 (city match, equals SQL).
  7. Salles+Ariana+6500 → Salle Jasmin; Salles+Tunis+6000 → 0 + “Aucun prestataire ne correspond à vos critères.” + CTA.
  8. Clear → 20. 9. Price asc Lina Beauty / Nour Coiffure / Lys Boutique; rating desc Syma Photo / Maison Elyssa / Rêve Décor (match SQL ORDER BY).
  10. Bizerte → empty message + CTA; CTA restores 20.
  11. Detail shows badge, name, “Salles de mariage · Tunis · Tunis”, “4,8 ★ (120 avis)”, description, address, “Non renseignée” + disclaimer, “4 500 – 7 000 TND” (U+202F grouping, U+2013 dash, U+00A0 before TND).
  12. Modal dialog/aria-modal/labelled, focus on textarea, §5 disclaimer (role=note) above submit, min-length and offline errors keep values, Esc returns focus; toast shown; SQL row `status=pending, wedding_date=2027-06-12`.
  13. userB: no userA data on any page; REST 0 rows; SQL as userB (role authenticated + JWT claims) 0 rows.
  14. Owner → `sent` 403; userB update 0 rows; insert `status=sent` 403; anon insert 401; row stays pending.
  15. 390 px: one-column list (354px), collapsible filters, every control 44 px on list/detail/modal, scrollWidth 390, textarea 110 px.
  16. No Phase 1 provider arrays, Unsplash provider fallback, dead buttons, `DT` or `is_urgent` in `src`; SQL `is_urgent` 0 rows. Production preview: SW activated and controlling, `lamsa-v1` = 13 same-origin static URLs, 0 Supabase / Unsplash / external fonts, offline reload renders the app shell.
- Lint: 0 warnings, 0 errors, no suppressions. Build passes and its output was verified in the browser.
- 4d has not started.

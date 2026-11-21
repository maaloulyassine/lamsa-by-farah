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

### Phase 4d — Persisted favorites

- Created: `src/services/favoritesService.js`, `src/components/favorites/FavoritesPage.jsx`, `src/components/favorites/useFavoriteToggle.js` (shared optimistic toggle used by Services, provider detail and Favorites).
- Modified: `ProviderCard.jsx` (`FavoriteButton`, cover wrapper), `ProviderDetail.jsx` (heart on the cover, `backLabel`), `ProvidersPage.jsx` (favorite ids fetched on mount, hearts disabled until loaded, toggle and toasts), `App.jsx` (Phase 1 Favorites placeholder replaced; Profile “Mes services favoris” opens Favorites, “Phase suivante” removed), `App.css`.
- No migration, RLS, seed, service-worker, `vite.config.js` or 4a/4b/4c service change (`git diff eae3c71` on those paths is empty).
- Validation (Playwright, local Supabase, fresh userA/userB):
  1. Empty state “Aucun prestataire en favoris pour le moment.” + “Découvrir les services”; SQL 0.
  2. Optimistic heart: 100 ms after the click (write delayed 1.2 s) `aria-pressed=true`, disabled, SQL still 0; after the write SQL 1.
  3. Reload keeps the heart filled; Favorites lists Salle Élégance.
  4. Favorites card shows name, “Exemple de démonstration” and a pressed heart.
  5. Unfavorite on Favorites: card gone immediately; SQL 0. 6. Services heart unfilled.
  7. Two favorites → 2 cards, SQL 2. 8. One removed → 1 card, SQL 1.
  9. Three synchronous clicks → exactly 1 network write (`POST ?on_conflict=user_id,provider_id`), SQL 1.
  10. Offline: heart reverted, toast “Impossible de mettre à jour les favoris. Réessayez.”, auto-dismissed; delayed failure shows the flip (pressed, disabled) then the revert.
  11. Detail heart pressed on open → click → unpressed (SQL 1 → 0); list heart unpressed after back.
  12. Count labels: empty state / “1 prestataire en favori” / “2 prestataires en favoris”.
  13. userB: empty Favorites, 0 pressed hearts; REST 0 rows; SQL as userB 0 rows (0 of userA's); userB delete of userA rows → 0 rows; insert as userA → 403; userA keeps 2 rows.
  14. 390 px: 20 hearts at 44×44, Favorites one column (354px), scrollWidth 390 on Services, Favorites and detail; desktop heart 36 px.
  15. `is_urgent` 0 rows; no `DT`, no Phase 1 favorites placeholder or fake array, no suppressions.
  16. Build exit 0, 0 corrupted markers. Preview renders Welcome, Services, Favorites and Budget with zero console messages online. SW activated and controlling; `lamsa-v1` = 13 same-origin static URLs, 0 Supabase / Unsplash / external fonts. Offline reload renders the app shell.
- Lint: 0 warnings, 0 errors, no suppressions.
- Phase 4 is complete. Phase 5 has not started.

### Phase 4e — My contact requests screen

- Created: `src/components/contact/MyRequestsPage.jsx`.
- Modified: `src/services/contactRequestsService.js` (`listMyContactRequests`), `src/App.jsx` (route `requests`, Profile item “Mes demandes de contact”, explicit per-item actions instead of position-based dispatch, `mail` icon, Profile sidebar item highlighted on the requests screen), `src/App.css`.
- Read-only: no insert/update/delete in `src/components/contact`. No migration, RLS, seed, service-worker or other 4a–4d component change (`git diff 3c0c71c` on those paths is empty).
- Validation (Playwright, local Supabase, fresh userA/userB):
  1. Empty state “Vous n’avez pas encore envoyé de demande de contact.” + subtitle + “Découvrir les services”; SQL 0.
  2. One request sent through the 4c modal → card: provider, “EN ATTENTE”, “Salles de mariage · Tunis”, “Date du mariage : 12 juin 2027”, full two-line message, “Envoyée le 21 novembre 2026 à 13:48”.
  3. Two requests → “2 demandes envoyées”, Atelier Samira (13:49:00) before Salle Élégance (13:48:58), same as SQL `ORDER BY created_at DESC`.
  4. Spec §5 note shown verbatim (role=note).
  5. Loading (GET delayed 1.5 s): `aria-busy=true`, 2 skeleton cards, 0 real cards at 200 ms.
  6. Offline → “Impossible de charger vos demandes.” + “Réessayer”. 7. Retry online → 2 cards back.
  8. Superuser `UPDATE … status='sent'` on the test row → “Transmise au prestataire” (12px, uppercase). 9. `status='closed'` → “Fermée”.
  10. 390 px: one column (354px), scrollWidth 390, back button and CTA 44 px, message 16px, badge 12px.
  11. userB: empty state; REST 0 rows; SQL as userB 0 rows (0 of userA's); userA keeps 2.
  12. No `DT`, no `is_urgent` (SQL 0 rows), no suppressions. Build exit 0, 0 corrupted markers. Preview renders Welcome, Services, Favorites, the requests screen and Budget with zero console messages online. `lamsa-v1` = 13 same-origin static URLs, 0 Supabase / Unsplash / external fonts. Offline reload renders the app shell.
  - Also verified: Profile items Budget / Favoris / Demandes open their screens while Mon projet / Paramètres stay inactive. With a provider deactivated in the local DB, the card shows “Prestataire indisponible” (restored afterwards; 20/20 active).
- Lint: 0 warnings, 0 errors.
- Phase 4 is fully complete. Phase 5 has not started.

### 2026-11-21 — Production deployment (MVP live)

- Pushed master branch to GitHub: https://github.com/maaloulyassine/lamsa-by-farah
- Enabled GitHub Pages (Source: GitHub Actions)
- Configured 2 repository secrets: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Configured Supabase Auth URLs: Site URL + 2 Redirect URLs (prod + localhost)
- Linked Supabase cloud project (atbuzxsftvtnoneubgzp) via CLI
- Pushed 4 migrations + seed to cloud via `supabase db push --remote --include-seed` (CLI 3.2 targets the local stack unless `--remote` is passed)
- First workflow run failed at "Configure Pages" (Pages not yet enabled); after enabling Pages the manual run 44911529474 succeeded
- Live site at https://maaloulyassine.github.io/lamsa-by-farah/ initially showed "permission denied for table weddings" — caused by newer Supabase cloud projects not auto-granting base privileges to `anon`/`authenticated` on tables created via CLI (local Supabase has ALTER DEFAULT PRIVILEGES that cloud does not; cloud tables only had TRUNCATE/REFERENCES/TRIGGER/MAINTAIN for those roles)
- Fixed in commit 208c507 with explicit GRANT migration 20261121000005_phase4f_grants.sql (also applied locally via `supabase db reset`, full UI flow re-verified with 0 errors)
- Verified end-to-end on the live site: sign-up, wedding setup, Dashboard, planning generation, personal task creation, expense creation (budget 60 % / 6 000 TND restant), provider catalogue (20 results), favorite, contact request, my-requests screen — 0 API errors, 0 console errors; rows confirmed in the cloud DB. Task/expense edit and delete and the combined provider filters were verified locally in 4a–4c, not re-run live.
- Verified RLS in production: anonymous 42501 on private tables; two-user isolation confirmed (User B sees 0 rows of User A; bulk UPDATE/DELETE affect 0 rows; provider insert blocked by RLS)
- Deployment workflow run 44913030887: success
- Test accounts `lamsa-deploy-check-*@example.test` remain in the cloud project (removal and Supabase token revocation left to the project owner)

### 2026-11-21 — Phase 5a: French auth error messages (commit 35dba58)

- Added `src/utils/authErrors.js` (`translateAuthError`): maps Supabase Auth messages to French — invalid credentials, email not confirmed, already registered, password under 6 characters, invalid email (incl. GoTrue's “Unable to validate email address: invalid format”), rate limit — with a generic French fallback.
- `src/pages/AuthPages.jsx`: only Supabase-returned sign-in/sign-up errors are translated; app-side French messages unchanged. The form uses `noValidate` (app pattern) with French checks for empty email/password, so browser-native validation no longer hides the scenarios.
- Verified locally against real GoTrue responses (400/422): wrong password and unknown email → “Email ou mot de passe incorrect.”; existing email → “Un compte existe déjà avec cet email.”; short password → “Le mot de passe doit contenir au moins 6 caractères.”; invalid email → “Adresse email invalide.”. Verified live: wrong password → French message. Lint 0/0, build OK, CI run 44915830026 success.
- Remaining English outside the auth forms: the space-loading error screen and wedding-setup save errors can show raw messages.

### 2026-11-21 — Phase 6: minimal admin panel for contact requests (post-MVP bonus)

- Post-MVP bonus, not part of the original spec (§12). Migration `20261121000006_phase6_admin_rls.sql` + reversal; `src/services/adminService.js`; `src/components/admin/AdminRequestsPage.jsx` and `AdminRequestCard.jsx`; `App.jsx` (admin flag from `app_metadata`, conditional “Admin — Demandes” item, `admin-requests` page, shield icon); `App.css`; README section with the promotion flow.
- Column guard rationale: `contact_requests_update_admin` (Phase 3c) only checks `is_admin`, and RLS cannot restrict columns, so once admins can read rows they could rewrite `message`, `user_id`, `provider_id`, `wedding_date`. The BEFORE UPDATE trigger rejects any non-status change by a non-owner. It fires before `contact_requests_set_updated_at` (alphabetical order), so `updated_at` is never seen as a change.
- Known issue: Column guard blocks content edits from service_role and Dashboard SQL when auth.uid() is NULL. Correct security behavior. For manual fixes: ALTER TABLE contact_requests DISABLE TRIGGER contact_requests_admin_column_guard; UPDATE...; ENABLE TRIGGER.
- Validation (local stack, users A/B/C; promotion via local SQL):
  1. Local `pg_policies`: 10 rows (contact_requests 5, profiles 5).
  2. Cloud: dry run listed only `20261121000006`; push applied it; read-only `pg_policies` → same 10 rows; trigger `contact_requests_admin_column_guard` present; 6 migrations recorded.
  3. Non-admin menu: no “Admin — Demandes”; JWT has no flag; API read of all requests → 0 rows before promotion.
  4. `UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'` → `is_admin = true`.
  5. After sign-out/in: menu shows “Admin — Demandes”; fresh JWT carries `is_admin: true`; admin's own “Mes demandes” still lists only their requests.
  6. Admin page lists every request (SQL 4 total / 2 users = 4 cards; rerun 9 = 9), with client name and phone; “2 demandes en attente”.
  7–9. Tabs En attente / Transmises / Fermées show only pending / sent / closed.
  10. “Marquer transmise”: optimistic at 80 ms, toast “Demande marquée comme transmise.”, SQL `sent`, `updated_at` bumped.
  11. Client B's “Mes demandes” shows “TRANSMISE AU PRESTATAIRE”.
  12. “Fermer”: native confirm, toast “Demande fermée.”, SQL `closed`; client C sees “FERMÉE”.
  13. Non-admin update of another user's request → 200, 0 rows; status unchanged.
  14. Non-admin read → only own rows; another user's rows → 0; profiles → own row only.
  15. Admin reads all requests (= SQL total) and all profiles.
  16. Admin gains nothing else: others' weddings/tasks/expenses/favorites → 0 rows; updates to weddings/providers/profiles → 0 rows; provider insert and insert on behalf of another user → 403; delete → 0 rows.
  17. 390 px: single column, scrollable tabs, page width 390, every control 44 px (the phone `tel:` link was 16 px and was fixed to 44 px).
  18. No `DT`/`is_urgent`; lint 0/0; build OK (0 corrupted markers); preview renders all screens with zero console messages; `lamsa-v1` = 13 same-origin entries, 0 supabase.co; offline shell renders.
  19. Column guard: owner edits own pending message → 200; admin edits message / wedding date → 400 P0001 “Admins may only update the status column of contact requests”; admin edits status → 200 `sent`.
  20. Owners' “Mes demandes de contact” screens load without error after the new policies and trigger.
- Phase 6 complete. Phase 5b–5e still pending.

### 2026-11-21 — Phase 6.5: sent contact requests on the Planning page (post-MVP polish)

- Modified: `src/services/contactRequestsService.js` (`listSentContactRequests`), `src/components/planner/PlanningPage.jsx` (separate effect + section before the calendar card; the existing tasks effect and calendar markup are unchanged — the only removed line is the old function signature), `src/App.jsx` (`onNavigateToRequests` prop), `src/App.css`.
- Decisions: explicit `.eq('user_id', …)` (admin isolation since Phase 6), plain join with "Prestataire indisponible" fallback (consistent with 4e), silent failure, no skeleton (section hidden while loading or empty).
- Validation (local stack; normal user U, admin A promoted locally; statuses changed through the admin API):
  1. New user with no requests: no section (SQL 0).
  2. One pending request created through the 4c modal: still no section.
  3. Admin marks it sent: section "Demandes de contact transmises", "1 demande transmise au prestataire", card "Salle Élégance — Démo | TRANSMISE | Date du mariage : 12 juin 2027 | Voir dans Mes demandes", placed before the calendar card.
  4–5. Three sent + one pending: cards ordered 1 mars 2027, 12 juin 2027, then "Date du mariage : non précisée" last; the pending request is not listed (matches SQL `ORDER BY wedding_date ASC NULLS LAST`).
  Fallback: with a provider deactivated, the card shows "Prestataire indisponible" (provider restored afterwards).
  6. "Voir dans Mes demandes" opens "Mes demandes de contact" (Profile highlighted).
  7. Admin isolation: SQL shows admin A 1 sent / user U 3 sent; the admin's unfiltered API read returns every user's sent requests, but the admin's Planning lists only their own card; U still sees 3.
  8. Calendar month navigation, day selection (task shown on 14 Dec, matching SQL) and regeneration still work; 390 px: one column (354px), scrollWidth 390, links 44 px; no console warnings/errors; lint 0/0, build OK (0 corrupted markers); preview renders with zero console messages; `lamsa-v1` = 13 same-origin entries, 0 supabase.co.
- Phase 6.5 complete. Phase 5b–5e still pending.

### 2026-11-21 — Phase 6.6: real Tunisian wedding providers (demo data removed)

- 189 real providers imported: 184 complete entries from the owner's research PDF (`lamsa by farah .pdf`, 16 pages) + 5 Tunis venues with `phone = NULL` (correction A2). Governorates: Tunis 36 (33 − 2 moved to Ariana + 5 venues), Ariana 2, Nabeul (Hammamet) 28, Sousse 49, Monastir 42, Bizerte 32. All 10 categories represented (venues 25, caterers 19, beauty 18, dresses 17, decoration 22, flowers 12, photo/video 28, DJ 9, cakes 24, car rental 15).
- Migration `20261121000007_phase6_6_provider_traceability.sql` (+ reversal): deletes demo providers and the favorites / contact requests referencing them (intentional, confirmed by the owner), adds `data_source` (default `manual_research`) and `last_verified_at`. Seed: `is_demo = false`, rating 4.5 / 0 reviews, no prices, no images, phones normalized to `+216 XX XXX XXX`, `last_verified_at = 2026-11-21`.
- 23 PDF entries skipped: Arous Gharsallah and May Flower (owner instruction; the PDF shows +216 54 033 033 / +216 22 727 629), "Organiste chanteur Menzel Temime" (description), Hammamet section without heading ×5 (unclear category), "Offres Mariage Sousse / Monastir / Mahdia" (not a name), Espace Rania and Farhet Laamor (no phone), "Événementiel et traiteur à proximité" (description), Excellence Déco / Heny fleuriste / La plus belle rose chez Doaa (phone duplicated from another provider), Sounini and Blé Sucré (no phone), Bizerte DJ ×5 (descriptions, no phone), Drive & Go (truncated phone).
- Judgment calls: Maison Mehdi Laatiri kept twice (Sousse beauty + dresses, same phone; slug `-2`); Chic's Wedding Dress and Diva Events Tunisie moved to Ariana (correction B1); 5 Tunis venues added with NULL phone; Bizerte decoration classified from section numbering; first number kept when several were listed; "53 775 233" (Pâtisserie Le Pacha) prefixed with +216; PDF phones for Chic's Wedding Dress and Arous Gharsallah were already correct (no typo fix needed).
- UI: demo badge removed, "★ 4,5" on cards, "Note indicative — aucun avis réel pour le moment." on detail, French fallbacks for empty availability and missing phone, catalogue note updated; price, rating and sort controls removed (correction C2) — search, category, governorate and clear remain.
- Cloud push initially recorded the seed file hash but did not execute the seed, leaving the production catalogue empty. Fixed by running `npx supabase db query --remote --file supabase/seed.sql --yes` directly. This suggests the Supabase CLI treats an unchanged seed hash as 'no re-seed needed' even when the migration deletes existing rows. Future seed changes that must run on cloud should use `db query --file` explicitly.
- Validation: local `db reset` (7 migrations + seed), seed re-run idempotent (189 rows, 189 slugs); local UI — 189 results, Ariana 2 (Chic's, Diva), venues 25, venues + Tunis 5 (NULL-phone venues), search "Allians", detail « Téléphone non renseigné », no price/rating/sort controls, clear filters, favorite on a real provider; lint 0/0, build OK. Cloud (read-only): 189 real / 0 demo, governorate and category counts as above, 5 NULL phones.
- Local + cloud verified. Note: covers 5 governorates, more can be added later using the same pattern.

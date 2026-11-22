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

### 2026-11-21 — Phase 6.7: Google Maps links and category illustration images

- Added "📍 Voir sur Google Maps" on the provider detail page and one illustration per category as the card/detail cover when a provider has no `cover_image_url`, always labelled "Photo d'illustration". Files: `src/utils/categoryImages.js`, `public/images/categories/*.webp` (10), `ProviderCard.jsx` (`ProviderCover`), `ProviderDetail.jsx`, `App.css`. No migration, seed or service-worker change.
- Sources (Unsplash License: free commercial use, no attribution required, photos may not be sold as-is or used to build a competing photo service), downloaded only through `https://unsplash.com/photos/{id}/download?force=true` for the URLs chosen by the owner; centre-cropped to 16:9, resized, WebP q80 (q70 / 1000×563 fallback), all ≤ 100 KB:
  - `salles-de-mariage` — https://unsplash.com/photos/outdoor-wedding-ceremony-setup-with-floral-arrangements-and-chairs-ckNjKI5cH_E — 1000×563, 93.8 KB (crop shifted lower)
  - `robes-de-mariee` — https://unsplash.com/photos/a-strapless-white-gown-on-a-mannequin-in-a-window-tTn-X7huVbI — 1200×675, 67.2 KB (crop shifted up)
  - `coiffure-maquillage` — https://unsplash.com/photos/woman-smiling-while-applying-eyelashes-with-a-brush-24x4t3pFvUk — 1200×675, 36.0 KB
  - `decoration` — https://unsplash.com/photos/floral-archway-with-chairs-set-for-a-wedding-ceremony-zZ4hsQfse7o — 1200×675, 81.3 KB
  - `traiteurs-et-chefs` — https://unsplash.com/photos/a-table-topped-with-lots-of-food-on-top-of-a-wooden-table-dHeKcZ0a-xY — 1200×675, 88.3 KB
  - `gateaux` — https://unsplash.com/photos/4-layered-fondant-cake-on-table-fXAuCMEYGY4 — 1200×675, 32.8 KB
  - `photo-video` — https://unsplash.com/photos/photographer-captures-couple-in-a-narrow-venetian-alleyway-kao25pZxpiM — 1200×675, 58.4 KB
  - `dj-artistes` — https://unsplash.com/photos/turned-on-dj-mixer-2Rtc0Cdhmc4 — 1200×675, 76.4 KB
  - `fleurs` — https://unsplash.com/photos/bride-holding-flower-bouquet-295NLwGdrKM — 1200×675, 80.6 KB
  - `location-voitures` — https://unsplash.com/photos/vintage-white-car-with-flower-decorations-in-front-beside-green-field-vkPjHWUmLRU — 1200×675, 76.7 KB
- The first coiffure-maquillage choice (`8WNx6jYn-xo`, "makeup-artist-applying-powder-to-client") returned HTTP 403 on the download endpoint (Unsplash+ paid photo, not usable under the free license) and was replaced by `24x4t3pFvUk`.
- Crop adjustments (approved): salles-de-mariage shifted lower (ceremony arch and chairs fill most of the frame instead of sky), robes-de-mariee shifted up (mannequin shoulders and bodice centred instead of waist/hem).
- An attempt to search Unsplash through its undocumented internal endpoint (`/napi/search`) was blocked by the permission system as unauthorized access and was not retried or worked around; the owner supplied the 10 page URLs instead.
- Four issues in the brief caught and fixed: (1) image paths `/images/…` would 404 under the GitHub Pages base path → prefixed with `import.meta.env.BASE_URL`; (2) `provider.governorate` is a joined object → the Maps query uses `governorate.name` (avoids "[object Object]"); (3) the badge could sit on not-yet-loaded / failing lazy images → badge and icon render only after `onLoad`, gradient otherwise; (4) duplicated "Tunis Tunis" in the Maps query → governorate omitted when equal to the city.
- Validation (production build via preview): all 10 images 200 `image/webp`, one card per category shows its illustration loaded (salles 1000×563, others 1200×675) with "Photo d'illustration"; detail covers badged; Maps queries "Fatma Bouchiba Couture Tunis", "Allians Wedding Venue Tunis", "L'Opéra Hammamet Hammamet Nabeul" (new tab, noopener); phone row tel link / « Téléphone non renseigné »; 390 px: scrollWidth 390, one column, badge 10px white on dark, Maps link 44 px; non-regression: Ariana filter, favorite, contact request, admin page; lint 0/0, build OK, `lamsa-v1` 13 entries / 0 supabase.co / 0 images; console empty.
- Category illustrations are generic and labeled. Real provider photos accessible via 'Voir sur Google Maps'.

### 2026-11-22 — Phase 7a: wordmark typography (Italiana + Cormorant Garamond)

- Fonts (SIL Open Font License 1.1, self-hosted): Italiana 400, Cormorant Garamond 400 normal and 400 italic, latin subset WOFF2. Google Fonts' "Download family" ZIP only ships TTF files, so the latin WOFF2 files were taken from the official Google Fonts CSS2 API (`fonts.googleapis.com/css2` → `fonts.gstatic.com`), verified `200 font/woff2` with the `wOF2` signature: `italiana-400.woff2` 10.1 KB, `cormorant-garamond-400.woff2` 22.9 KB, `cormorant-garamond-400-italic.woff2` 23.7 KB. `@font-face` in `src/index.css` (same pattern as DM Sans / Playfair); the built CSS references `/lamsa-by-farah/fonts/…` and contains no googleapis/gstatic URL.
- `src/components/ui/Wordmark.jsx`: `Wordmark` (lg 3rem / md 1.75rem / sm 1.25rem) and `Flourish` (shared SVG path). Used on Welcome, sidebar, mobile top bar, auth screens and wedding setup (the last two were not in the brief but kept the old ♡ logo otherwise). Welcome slogan → `.slogan` (Cormorant Garamond italic 1.25rem) + flourish; the brief said the slogan used DM Sans, it actually used Playfair Display.
- `--ink-soft` did not exist; added as `#7a6558` (between `--ink` and `--muted`).
- Service-worker precache: 3 fonts added explicitly in `vite.config.js`; `lamsa-v1` now 16 entries (13 + 3).
- Validation (production build via preview, local Supabase): wordmark computed fonts Italiana / Cormorant Garamond italic on Welcome (48px), auth (28px), sidebar (28px, 85 px wide in a 246 px panel), mobile top bar (20px, no overlap with actions: wordmark right 117 px < actions left 288 px); slogan Cormorant italic 20px with flourish; the 3 WOFF2 files 200 `font/woff2`; 0 requests to fonts.googleapis/gstatic; Welcome buttons "Commencer" / "J’ai déjà un compte" work (login completed); Planning, Budget, Services, Favoris, Profil, Accueil render (h1 present, scrollWidth 1280); 390 px: scrollWidth 390 on Welcome and dashboard; console empty; lint 0/0; build OK.

### 2026-11-22 — Phase 7b: welcome carousel

- Images (Unsplash License), owner-provided URLs only, downloaded through `https://unsplash.com/photos/{id}/download?force=true` (all 200 `image/jpeg` from images.unsplash.com), centre-cropped to 16:9 with Pillow, 1600×900, WebP q75:
  1. `8vaQKYnawHw` gold wedding bands on white textile — 67.0 KB
  2. `KRPCwGCzUJs` white sheer lace wedding gown (back detail) — 51.5 KB
  3. `30UOqDM5QW0` bride holding a peach/beige bouquet, groom behind — 53.0 KB
  4. `iXTkKQyVqbM` banquet hall with chandeliers and set tables — 192.2 KB
  5. `kiAHo9m518Q` bride and groom holding hands in front of a fence — 38.2 KB
- A first attempt with Python `urllib` got HTTP 401 on all five (client-specific; not the Unsplash+ 403). Re-run with `curl` exactly as in Phase 6.7 (same endpoint) → 200 for all five.
- `WelcomeCarousel.jsx` (no new dependency): slides as `role="group"` / `aria-roledescription="slide"`, inactive slides `aria-hidden`; dots are buttons with `aria-current` and a 28 px tap height; the carousel is focusable for ArrowLeft/ArrowRight. Image URLs prefixed with `import.meta.env.BASE_URL` (GitHub Pages base path). CTA specificity raised so the existing `.secondary-button` rule (11 px) does not shrink "J’ai déjà un compte". Old Welcome CSS (incl. the images.unsplash.com background) and the 7a `.slogan` rules removed. The dashboard hero still hot-links an images.unsplash.com photo (pre-existing, out of scope).
- Validation (production build via preview, local Supabase): 5 slides with the expected slogans and images (DOM + screenshots), active slide opacity 1; auto-rotate 0 → 1 after 7.7 s; dot 3 click → still slide 3 after 7 s and 13.5 s (paused); 390 px CDP touch swipe 350→50 → next, 50→350 → previous, 20 px → no change; arrows opacity 0 on load, 1 on hover, 44×44, next/prev work; keyboard ArrowRight/ArrowLeft work; reduced motion → no rotation after 7 s, transition 0 s; "Commencer" and "J’ai déjà un compte" open the auth screen; login → dashboard at 1280 and 390 px (scrollWidth 1280 / 390); slogan 28 px; CTAs 14 px / 48 px; 5 images 200 `image/webp`; `lamsa-v1` 21 entries; console empty; lint 0; build OK, 0 preload-marker leftovers in the bundle.

### 2026-11-22 — Phase 7c: polish, shadows, focus states, tablet layout, no external Unsplash

- Dashboard hero: `.hero-image` now `url('/images/welcome/slide-4.webp')` (ballroom, already precached) instead of an images.unsplash.com hot-link; `rg images.unsplash.com src/` → 0, `dist/` → 0; built CSS `url(/lamsa-by-farah/images/welcome/slide-4.webp)`.
- `Flourish` moved to `src/components/ui/Flourish.jsx` (Wordmark and WelcomeCarousel import it). `.title-flourish` (4rem × 0.5rem, terracotta 0.5, 0.5rem gap) after the h1 of Accueil, Mon planning, Mon budget, Trouver un service (the brief's "Les services"), Mes favoris, Mon profil.
- Hover lift under `@media (hover: hover) and (pointer: fine)` on `.provider-card`, `.task-row`, `.expense-row`, `.request-card`, `.budget-line` and also `.planner-task` (Planning's task rows); skeleton cards excluded.
- Shadows: tokens added; `.nav-item.active` → sm; `.primary-button`, `.quick-card:hover`, favorite button → md; `.task-modal`, `.auth-card`, toasts → lg. Kept on purpose: avatar inset ring, auth input focus ring (not elevation), mobile drawer's directional shadow. No border-radius changed.
- Focus: `*:focus-visible` and form/button/link/`[tabindex]` rules (2px solid terracotta, offset 3px). The brief's `border-radius: 4px` on focus was not applied: it would square off pill buttons and round favorites while focused, and outlines already follow each element's radius. Removed: `.search-bar input { outline: 0 }`, `.auth-card input/select { outline: none }`, `.welcome-carousel { outline: none }` (its own inset `:focus-visible` rule remains). No focusable behaviour removed.
- Budget ring: `@property --percent { syntax: '<percentage>'; initial-value: 0% }` + `transition: --percent 800ms ease-out`; BudgetPage keeps `ringPercent` state at the previous value (0 on mount) and applies the target after two animation frames (a CSS transition never runs on first style computation). The Dashboard has a progress bar, not a ring, so only the Budget ring animates.
- Toasts: `.success-banner` (and `.toast`) fixed top-right, ivory, 3px terracotta left border, `--shadow-lg`, `toastSlide` 300 ms; full-width (left/right 1rem) ≤ 650 px; admin success toast fixed too. Pre-existing bug fixed: Budget, Planning and Services cleared the message in `onAnimationEnd`, which never fired before (no animation) and would have closed the new toast after 300 ms → handlers removed, existing timers kept (Budget 4 s, Services/Favoris 5 s, admin 4 s); Planning had no timer at all (its message never disappeared) → 4 s timer added.
- Tablet audit (390/640/768/1024/1280) found: Budget at 768 px scrolled horizontally (scrollWidth 793) with the ring summary squeezed to 106 px; the Planning calendar overflowed its card at 768 px (`repeat(7, 1fr)` min-content); providers in one 604 px column at 640 px. Fixes: `repeat(7, minmax(0, 1fr))`; 651–1100 px budget overview stacked (ring + summary still side by side), planning `minmax(0,1.15fr) minmax(0,1fr)`, tighter calendar padding/gaps; 520–650 px providers 2 columns; `.task-modal` max 500 px. Sidebar unchanged (visible from 651 px, so also at 768 px+); dashboard already 2 columns at 768 px.
- Validation (production build via preview, local Supabase): hero 200 `image/webp` slide-4, 0 requests to images.unsplash.com; flourish 64×8 px under all six h1; provider card hover `matrix(1,0,0,1,0,-2)` + `0 4px 12px rgba(44,36,22,.08)`, expense row lifts too; Tab focus on search input, category select, governorate select, favorite button, "Voir les détails" → each `2px solid rgb(169,123,99)`, offset 3px; ring `--percent` 9.86 % at 186 ms → 59 % (target) at 980 ms; toast at 100 ms `translateX(83.7px)` opacity 0.56 → at 400 ms `none` / 1, gone at 4.6 s; reduced motion → ring transition 0 s, toast animation none; Planning toast gone after 4.5 s; widths 390/640/768/1024/1280 scrollWidth = viewport on all 6 screens, 0 console errors; 768 px providers 2 cols (242 px), dashboard 2 cols, planning 258/225 px, budget 501 px stacked; `lamsa-v1` 21 entries; lint 0; build OK.

### 2026-11-22 — Phase 5b: GitHub Actions on the Node 24 runtime, Node 22.12 build

- Latest releases checked on GitHub (`releases/latest` + each tag's `action.yml`): `actions/checkout` v7.0.1 (node24), `actions/setup-node` v7.1.0 (node24), `actions/configure-pages` v6.0.0 (node24), `actions/upload-pages-artifact` v5.0.0 (composite → upload-artifact), `actions/deploy-pages` v5.0.1 (node24). All newer than the options listed in the brief (checkout/setup-node v5–v6, upload-pages-artifact v3–v4, deploy-pages v4–v5), so the current majors were pinned: `@v7`, `@v7`, `@v6`, `@v5`, `@v5`.
- Breaking changes reviewed: setup-node v5+ caches automatically when `packageManager` is set (not set here; `cache: npm` kept explicitly); upload-pages-artifact v4+ excludes dotfiles (`dist/` contains none).
- `node-version` '20.19.0' → '22.12.0'. Local check with fnm Node v22.12.0 / npm 10.9.0: `npm ci` OK, `npm run lint` 0, `npm run build` OK (bundle hashes identical to the deployed 7c build).
- Local tooling note: `npm ci` first failed with EPERM on `node_modules/@esbuild/win32-x64/esbuild.exe`, held by orphaned `vite preview` / esbuild processes left from Phase 7 (stopping the background shell had not killed its children). Those three processes were stopped and `npm ci` re-run.

### 2026-11-22 — Phase 5c: grants cleanup (TRUNCATE revoked, service_role CRUD)

- Pre-5c privileges recorded read-only. Local stack: every role had every table privilege (Supabase local defaults). Cloud: `anon` had REFERENCES/TRIGGER/TRUNCATE (+ SELECT on categories, governorates, providers), `authenticated` had full CRUD + TRUNCATE, `service_role` only REFERENCES/TRIGGER/TRUNCATE (no CRUD); EXECUTE on `set_wedding_plan(uuid)` already granted to all three; `public` has no sequences.
- `supabase/migrations/20261122000008_phase5c_grants_cleanup.sql` — exact SQL from the brief. `supabase/reversals/20261122000008_phase5c_grants_cleanup_reversal.sql` — re-grants TRUNCATE to anon/authenticated and revokes service_role CRUD/sequence usage; it does not revoke service_role's EXECUTE on `set_wedding_plan` because that grant pre-dated 5c (a literal swap would have removed it). Running the reversal locally would also strip the local stack's default service_role grants (documented in the file).
- Local `supabase db reset` (8 migrations + seed) → `authenticated` TRUNCATE on weddings false, `service_role` SELECT/INSERT on weddings true; 0 TRUNCATE grants left for anon/authenticated; 0 tables missing service_role CRUD; 29 policies, 9 RLS tables, 189 providers.
- Local UI flow (production build via preview): sign-up → wedding setup → dashboard (hero slide-4) → planning generated (15 tasks in DB, toast) → expense 9 000 TND (ring 36 %, toast) → favorite → contact request (toast) → Mes favoris (1) → Mes demandes (1, "En attente") → sign-out / sign-in → admin page after promotion (requests listed) → 6 screens at 390 px without horizontal scroll; 0 HTTP errors, empty console.
- Cloud: `supabase db push --remote --dry-run` showed only 0008 pending; `db push --remote --yes` applied it; after 12 s the read-only checks returned the same results as locally (TRUNCATE false / service_role SELECT, INSERT true / 0 / 0 / 29 / 9 / 189).
- Live site flow with a new cloud test account (`lamsa-phase5c-check-…@example.test`, left for manual deletion): same steps and results as locally, admin menu hidden for a non-admin user (admin page not exercised on the cloud: promoting the account would need a cloud data write); 0 HTTP errors, empty console.
- Remaining by design: `anon`/`authenticated` keep REFERENCES and TRIGGER from the project defaults (not reachable through PostgREST).

### 2026-11-22 — Phase 5d: README rewrite

- `README.md` rewritten (209 lines, ~2 300 words): title + slogan, live demo, features, tech stack, architecture (3 bullets + source tree), local development (prerequisites, steps, env-var table), deployment (workflow, secrets, Supabase cloud commands, explicit `db query --remote --file supabase/seed.sql --yes`, GRANT quirk, service-worker cache), PWA installation (Android Chrome, iPhone Safari, HTTPS), design system, admin panel (kept from Phase 6), provider data (kept from 6.6, updated for the 6.7 illustrations and Unsplash License), testing (local users, RLS isolation, offline, PWA install, responsive), known limitations (link to PROJECT_CONTEXT.md), documentation links, license.
- Facts checked against the code/data before writing: 189 providers in 6 governorates (Sousse 49, Monastir 42, Tunis 36, Bizerte 32, Nabeul 28, Ariana 2), 10 categories, Postgres 17.12, Supabase CLI 3.2.0, task form fields (title, description, date, time, status, estimated cost, notes — no category), local auth confirmations off, `db query` accepts inline SQL. The brief's "5 governorates" is written as "mainly 5 governorates … plus 2 providers in Ariana". The old "no cover images / gradient placeholder" line (pre-6.7) was corrected. No screenshots committed: the live visual state is described in the Design system section.
### 2026-11-22 — Phase 5e: screenshots, known issues, dependency cleanup, final live test

- Screenshots (commit `e83cd31`): `docs/screenshots/welcome.webp` (slide 4, 104.4 KB), `dashboard.webp` (67.9 KB), `services.webp` (Sousse filter, 54.8 KB), `admin.webp` (33.4 KB) — 1280×800, headless Chromium on the local production build with local demo accounts (admin promoted in the local database only), WebP q80 via Pillow, 260.5 KB in total; « Screenshots » section added to the README after the live-demo link. The dashboard has no budget card (spec §4.3 deferred), so the dashboard shot shows greeting, banner, tiles, countdown and tasks.
- Known issues in `PROJECT_CONTEXT.md` rewritten into Open issues / Technical decisions / Recently resolved; obsolete Phase 1–4 notes moved to "resolved". Coverage written as 18 remaining governorates (24 − 6 with providers; the brief said 19). New open issue found during the live test: the Dashboard task check boxes have no `onToggle` (inactive since Phase 4a); left unfixed because this phase allows no application-code change.
- Dependencies: `npm ls --all` showed no extraneous package (the "UNMET OPTIONAL" lines are other platforms' binaries). Removed `@types/react`, `@types/react-dom` (no TypeScript, no tool uses them) and the explicit `@oxlint/binding-win32-x64-msvc` optional dependency (oxlint installs it itself). Clean `npm ci` on Node 22.12: binding still present, lint 0, build OK with identical bundle hashes. Final: 3 dependencies, 4 devDependencies, 0 optionalDependencies.
- Tooling note: the first `npm ci` failed with EPERM because the screenshot preview server (and its esbuild child) was still running; the processes were stopped and `npm ci` re-run.
- Final live end-to-end (account `lamsa-final-1795310432788@example.test`): sign-up → wedding setup (budget 15 000 TND) → dashboard (hero `slide-4.webp`, countdown « 203 jours · 08 heures · 42 minutes ») → planning generated → « Définir le budget » marked done from Mon planning (status todo → done, line-through, toast, removed from the dashboard list) → expenses 9 000 TND (ring « 60% utilisé ») then 2 000 TND (« 73% utilisé ») → Salles de mariage filter (25 results) → Allians Wedding Venue favorited and contacted → Mes favoris → Mes demandes (« En attente ») → sign-out / sign-in with data intact; 0 HTTP errors, empty console. The account was then deleted from the cloud (`delete from auth.users where email = …`; all FKs cascade; read-only recount 0 rows in every table).

### 2026-11-22 — v1.3.1: Dashboard task check boxes wired

- `src/App.jsx` (Dashboard): `TaskRow` now receives `onToggle` → `toggleTask`, which calls the same `updateTask(task.id, wedding.id, { status })` as Planning's check box, updates the local task list (a done task leaves « Prochaines tâches » and the next one moves up), shows the success toast « Le statut a été enregistré. » (auto-dismissed after 4 s) and, on failure, a dismissible error banner (`mutationErrorMessage`). The button is disabled while its request is in flight; its label is now « Marquer <tâche> comme terminée ».
- Validation (production build via preview, local Supabase): dashboard listed 3 tasks; ticking « Définir le budget » → DB status todo → done, task removed from the list (next task « Choisir la robe et les tenues » shown), toast shown then gone after 4.8 s; reload → still done; a second toggle in a row works; Planning shows the task as done (class + select) and reverting it there brings it back on the dashboard; 390 px scrollWidth 390; 0 HTTP errors, empty console; lint 0; build OK.
- Open issue « Dashboard task check boxes are inactive » removed from PROJECT_CONTEXT.md and listed under Recently resolved.
### 2026-11-22 — v1.4.0: animations lot 1

- New `src/components/ui/Burst.jsx` (decorative confetti / heart particles, positions precomputed, `aria-hidden`) and `src/components/ui/RollingNumber.jsx` (value keyed so each change rolls in). `Flourish.jsx`: `pathLength="1"` + class `flourish` → CSS stroke draw. `WelcomeCarousel.jsx`: image moved to a `.welcome-slide-image` layer with per-slide Ken Burns drift; state `{ current, prev }` so the outgoing slide keeps zooming during the cross-fade. `App.jsx` Dashboard: countdown to 00:00 of the wedding day (was: days to noon, hours « 08 » and minutes « 42 » hard-coded), preparation % from tasks (was « 42% » hard-coded), progress bar animated with `scaleX`, `dash-enter` cascade, ticked task gets confetti then `is-leaving` (list updated after 560 ms; immediate under reduced motion). `PlanningPage.jsx`: confetti when a task becomes done. `ProviderCard.jsx` `FavoriteButton`: pop + hearts only on add. `App.css`: keyframes `flourishDraw`, `kenBurns`, `dashRise`, `rollIn`, `taskLeave`, `burstFly`, `heartPop` and a reduced-motion block.
- Bug caught during validation: the existing `.countdown span { font-size: 10px }` (labels) also shrank the new digit spans → `.countdown .rolling-number(-value) { font-size: inherit; color: inherit }`; digits back to 26 px (23 px mobile).
- Validation (production build via preview, local Supabase): welcome flourish dashoffset 1 → 0.88 (0.7 s) → 0 (2.2 s), redrawn on the next slide; Ken Burns scale 1.021 → 1.074 with drift (-19, -9 px) after 3.7 s, idle slides at 1.02, 2 slides zooming during the fade; cascade delays 70/140/210/280 ms; preparation 3/15 → « 20% », aria-valuenow 20, bar 0 → 0.2; countdown « 201 j 21 h 07 min » = expected; a new digit element rolls in when the minute changes; dashboard tick → 12 confetti, row leaves, DB done, toast, list refilled, preparation 27%; heart: `is-popping` + `heartPop` + 8 particles on add, cleared after 0.9 s, nothing on removal or on page load; title flourish draws on page change; Planning tick → 12 confetti, task done in DB; 390/768/1280 px without horizontal scroll; reduced motion → no Ken Burns, flourish fully drawn, no cascade/roll/bar transition, dashboard tick removes the row at once; 0 HTTP errors, empty console; lint 0; build OK.

### 2026-11-22 — Lot 2a: Tunisian-inspired patterns

- `src/App.css`: three original SVG drawings encoded as CSS custom properties — `--pattern-zellige` (64 px tile: 8-point star from two squares, centre ring, corner diamonds, interlacing ties), `--ornament-star` (large double star) and `--ornament-jasmine` (5-petal jasmine, emblem of Tunisia). Placed behind content (`::before`, `z-index: -1`, `isolation: isolate`, opacity ≈ 0.09): sidebar (fading downwards; `position: relative` only from 651 px so the mobile drawer keeps `position: fixed`), login / sign-up / wedding-setup background (radial fade), corner star on the countdown card, soft halo behind empty states; jasmine above « Votre mariage, votre signature. ».
- Validation (production build via preview): pseudo-elements present with the SVG on all five places; nav still clickable over the pattern; mobile drawer fixed, opens (0 px, 265 × 844) and closes after navigation; 390 / 768 px without horizontal scroll; empty console; lint 0; build OK.
### 2026-11-22 — Lot 2b: card → provider detail morph

- `src/utils/viewTransition.js` (`runViewTransition(update, prepare)`): `document.startViewTransition` + `flushSync` when supported (Chrome / Edge 111+, Safari 18+); immediate update when the API is missing or reduced motion is requested.
- Only the opened card carries `view-transition-name: provider-cover` (`morph` prop, state `morphId` set synchronously before the old snapshot); the detail cover always carries it. `ProviderDetail` gets `preview` (the list row) and shows its cover at once during loading, so the morph has a target; `ProviderCover` marks an already-cached illustration as loaded in a layout effect (no gradient flash). Wired on Services (open + back) and Favoris (open + back). CSS: 450 ms cover morph (`object-fit: cover`, rounded clip), root cross-fade, disabled under reduced motion.
- Validation (production build via preview): Services open/back, second card, Favoris open/back and 390 px all run a transition animating `::view-transition-group(provider-cover)` + old/new; the new snapshot already contains the detail cover with the loaded illustration (skeleton still loading the rest); detail fully loads (title, Maps link, contact button); back restores scroll (420 → 420) and focus on the card; only one card named at a time; reduced motion → 0 transitions; API removed → instant open/back, no error; empty console; lint 0; build OK.
### 2026-11-22 — Lot 2c: evening theme « soirée »

- `src/utils/theme.js`: `useTheme` (useSyncExternalStore) / `toggleTheme` (cross-fade via `runViewTransition`), `data-theme="soiree"` on `<html>`, `theme-color` #1b1411 / #f7f0e9, choice in `localStorage` (`lamsa-theme`, try/catch). `index.html`: inline head script applies the stored theme before first paint. `App.jsx`: moon / sun toggle in the top bar; Profil « Paramètres » (inactive) → « Mode soirée » switch (`role="switch"`, `aria-checked`, visual switch instead of the chevron); `moon` / `sun` icons.
- `App.css`: dark tokens under `:root[data-theme="soiree"]` (canvas #1b1411, surface #271e19, text #f2e8de, gold #d8b47e, terracotta #d49b7c, shadows, gold pattern variants, `color-scheme: dark`) plus scoped overrides for the 118 declarations that hard-code colours (inventory script) — light mode rules unchanged. Gold primary buttons with dark text (≈ 5.8–9 : 1).
- Validation (production build via preview, local Supabase, admin promoted locally): top-bar toggle → `soiree`, theme-color #1b1411, stored, 1 view transition, body / canvas rgb(27, 20, 17), color-scheme dark; reload → theme applied at DOMContentLoaded; Profil switch → aria-checked true/false, back to light (#f7f0e9, stored « clair »); reduced motion → toggle without transition; 18 screens captured (dashboard, planning + modal, budget + modal, toast, services, detail, contact modal, favorites, profile, my requests, admin, auth, setup, welcome, mobile dashboard + drawer); automated audit on dark screens: 0 light surfaces except the budget category colour dots / bars (data colours, intended), contrast flags only on gold-gradient primary buttons (audit reads background-color, not gradients; real ratio ≥ 5.8 : 1); 390 px scrollWidth 390; empty console; lint 0; build OK.

### 2026-11-22 — v1.5.1: light-mode text contrast (WCAG AA)

- Audit script (every text element vs its effective blended background, AA thresholds 4.5 : 1 / 3 : 1 large) on 12 light screens: 843 failing elements, almost all from `--muted` #8c7c70 (3.3–3.9 : 1) and `--faint` #b7a99e (≈ 2 : 1), plus rating gold #ba8c4f (2.9), small terracotta texts (3.3–3.5), « Supprimer » (4.15) and « Se déconnecter » (3.2).
- Same hue / saturation, HSL lightness lowered just enough for ≥ 4.6 : 1 on each colour's worst background: `--muted` #72655c, `--faint` #786a5f, rating gold #8f6938, new `--terracotta-text` #8c634d (« Effacer les filtres », « Voir dans Mes demandes », phone link; decorative terracotta unchanged), `.task-delete` #a15855, `.logout-button` #88564c. Light theme only: the evening theme keeps its own values (`--terracotta-text` #d49b7c there).
- Result: 0 failing text elements on the 12 screens (auth, dashboard, planning + modal, budget, services, detail, contact modal, favorites, profile, my requests, admin); before/after screenshots compared (identity unchanged, secondary text more legible); empty console; lint 0; build OK.
### 2026-11-22 — Lot 3a: notifications bell

- The top-bar bell had no action and a permanent dot. New `src/components/notifications/NotificationsBell.jsx`: notifications computed from existing data (no new table) — overdue tasks, tasks of the next 7 days, contact requests whose status became sent / closed (new service `listMyRequestUpdates`, explicit `user_id` filter because admins can read every row), budget overspend. Badge = overdue + new request changes + overspend; « vu » timestamp per user in `localStorage` (`lamsa-notifications-seen-<userId>`). Refresh on mount, on screen change, on panel open, on window focus / visibility and every 60 s. Panel: `role="dialog"`, `aria-expanded` / `aria-controls`, focus moved inside, Escape returns focus to the bell, click outside closes, items navigate (Planning / Mes demandes / Budget); full-width fixed panel on mobile; evening-theme badge colour.
- Validation (production build via preview, local Supabase, admin account): DB 2 overdue + 1 own update + overspend → badge 4 (= expected); panel groups Budget « dépassé de 2 000 TND », En retard (2), Cette semaine (« Essayage de la robe »), Demandes (« Nouveau »); after opening: badge 3, still 3 after reload; a later status change → badge 4 after a focus event, shown as « Nouveau »; 4 other users' updates not shown to the admin; Escape → focus on bell; click outside closes; items open the right screens; empty account → no badge, « Tout est à jour »; 390 px panel 12 → 378 px, scrollWidth 390; empty console; lint 0 (two React-compiler warnings fixed on the way); build OK.
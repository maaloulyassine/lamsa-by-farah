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


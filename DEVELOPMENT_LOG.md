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
- Phase 3 is complete. Phase 4 — Product functionality has not started.


# Lamsa by Farah — Project Context

## Project overview

Lamsa by Farah is a French-language, mobile-first wedding-planning PWA for couples in Tunisia. Its purpose is to bring wedding planning into one elegant workspace: project details, a generated and customizable planning calendar, budget tracking, provider discovery, favorites, and contact requests.

The product slogan is **“Votre mariage, votre signature.”** The target currency is TND and the first release is French-only, while the architecture should leave room for Arabic localization later.

The complete approved product and technical specification is in [`Lamsa_by_Farah_Agent_Pack/CAHIER_DES_CHARGES_LAMSA.md`](C:/Lamsaa/Lamsa_by_Farah_Agent_Pack/CAHIER_DES_CHARGES_LAMSA.md). The primary visual reference is [`Lamsa_by_Farah_Agent_Pack/assets/maquette-reference.webp`](C:/Lamsaa/Lamsa_by_Farah_Agent_Pack/assets/maquette-reference.webp).

## Approved decisions and requirements

- Build a PWA, not separate native applications.
- Use React, Vite, JavaScript, and CSS.
- Use Supabase later for PostgreSQL, Auth, and optional Storage.
- Deploy the static frontend through GitHub Pages; GitHub Pages is not a backend.
- Use demonstration provider data in the MVP; providers do not self-register.
- Keep provider data explicitly fictitious/demo data; do not invent authentic businesses, reviews, or availability.
- Support the ten approved provider categories, Tunisian governorate filtering, search, price/rating filters, availability display, provider detail, favorites, and non-guaranteed contact requests.
- Support one active wedding project per user in the MVP.
- Generate planning tasks deterministically from the wedding date and optional preparation-start date. The generated plan must remain fully editable.
- Support task statuses: `todo`, `in_progress`, and `done`.
- Support budget total, expenses, category breakdown, remaining amount, and clear overspending state.
- Use a mobile bottom navigation concept: Accueil, Favoris, Planning, Budget, Profil.
- No payment, instant confirmed booking, provider accounts, live chat, paid external AI, public authentic review system, or complete admin panel in this version.

## Technology and technical choices

- Frontend: React 19 + Vite 7 (Rollup) + JavaScript. Vite 8 / rolldown was dropped because it produced a broken production bundle (see Known issues).
- Styling: custom CSS with centralized variables; no UI framework.
- Routing/navigation for the current prototype: local React state, with HashRouter still available as a future deployment decision if route URLs become necessary.
- Data in Phase 1: local in-memory demonstration data only.
- Planned backend: Supabase with PostgreSQL and Auth, introduced in Phase 3.
- Planned deployment: GitHub Pages with a Vite base path and GitHub Actions.
- Planned PWA: manifest and a service worker limited to static resources; private Supabase data must not be cached insecurely.

## Design system and reference

The mockup establishes a premium, romantic, feminine visual language:

- Palette: ivory, cream, blush beige, champagne, taupe, soft brown, and terracotta accents.
- Typography: Playfair Display for editorial headings and DM Sans for readable interface text.
- Components: rounded cards, subtle borders and shadows, generous spacing, soft image treatments, visible focus/active states.
- Layout: mobile-first, responsive, with an elegant welcome screen and compact bottom-navigation-inspired interaction model.
- The mockup’s iOS status-bar elements are reference imagery only and are not application UI.
- Image content should feel wedding-specific and high quality. Current Phase 1 provider and hero images use remote Unsplash demonstration URLs.

## Current architecture

```text
lamsa-by-farah/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                 # Vite starter assets and hero image
│   ├── App.jsx                 # Main application and reusable UI components
│   ├── App.css                 # Application design system and responsive styles
│   ├── index.css               # Global reset, fonts, and base styles
│   └── main.jsx                # React entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

The current Phase 1 implementation keeps the prototype in a single `App.jsx` while extracting reusable components such as `Icon`, `NavItem`, `PageTitle`, `TaskRow`, and `ProviderCard`. Future phases should preserve behavior while extracting domain modules only when that reduces complexity.

## Implemented features

Phase 1 foundations are complete:

- Welcome screen with Lamsa by Farah branding and “Commencer” interaction.
- Responsive mobile-first application shell and desktop sidebar.
- Dashboard with greeting, wedding date, countdown, progress indicator, quick service categories, and upcoming tasks.
- Planning view with November 2026 calendar, date selection, task indicators, and task completion toggles.
- Budget view with TND totals, spending ring, category breakdown, remaining amount, and demo expense list.
- Services catalogue with provider cards, search, category filtering, city information, ratings, prices, and empty results state.
- Favorites view with per-session local favorite toggling.
- Profile view with project, budget, favorites, settings, and logout presentation.
- Main navigation between all core screens.
- Loading/error/auth/server states are not yet connected because Phase 1 intentionally uses local data.

## Phase status

**Current phase: Phase 4 — Product functionality — complete and live in production (4a planner, 4b budget, 4c providers, 4d favorites, 4e contact requests; tag `v1.0.0-mvp`). Phase 5 has not started.**

Actual Phase 1 validation:

- `npm run lint` passed.
- `npm run build` passed.
- Browser smoke flow passed for welcome, dashboard, planning, budget, services, and favorites navigation.

Actual Phase 2 validation:

- `npm run lint` passed.
- `npm run build` passed.
- GitHub Pages production build passed with `VITE_BASE_PATH=/lamsa-by-farah/`.
- Production preview responded at `http://127.0.0.1:4173/lamsa-by-farah/`.
- Manifest, icons, hashed CSS/JS, service worker, and self-hosted fonts resolved under the configured base path.
- The service worker registered with scope `/lamsa-by-farah/`.
- Cache Storage contained only same-origin static assets in `lamsa-v1`; Unsplash and future/Supabase traffic were not cached.
- Manual offline reload rendered the app shell.
- The manifest resolved `start_url`, `scope`, and `id` to `/lamsa-by-farah/` with `display: standalone`.
- DM Sans and Playfair Display font variants rendered without visual regression.
- Phase 1 navigation and layout passed manual smoke testing without regressions.
- The installed environment emitted a Node compatibility warning with Node `20.15.0`; Vite requires Node `20.19+` or `22.12+`. GitHub Actions uses Node `20.19.0`.

**Next phase: Phase 5 — Quality and delivery (not started).**

### Phase 4 — Product functionality — COMPLETE (live)

The MVP is deployed and publicly accessible.

**Production environment:**
- Live URL: https://maaloulyassine.github.io/lamsa-by-farah/
- Hosting: GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`, triggered on `master` and manually)
- Backend: Supabase cloud project `atbuzxsftvtnoneubgzp` (eu-west-1, Postgres 17)
- CDN: GitHub Pages serves the static PWA

**Deployed state:**
- All Phase 4a–4e features live and verified end-to-end
- Cloud database seeded: 24 governorates, 10 categories, 20 demo providers
- Cloud migrations: `20261120000001` → `20261121000005` (5, including the `phase4f_grants` migration)
- RLS verified in production: anonymous gets 42501 on all private tables; cross-user isolation confirmed with two test accounts
- Service worker active at `/lamsa-by-farah/` scope; cache `lamsa-v1` contains only static assets

**Phase 5 fixes needed before considering the MVP "polished":**
- English auth error messages (Supabase raw text shown to users)
- Node 20 → Node 24 GitHub Actions upgrade (non-blocking warning)
- `anon` and `authenticated` still hold TRUNCATE from project defaults (not exploitable via API, but cleaner to revoke)
- `service_role` lacks full grants on the public tables (no current code uses it; will matter if admin scripts are added)
- Future tables will need their own grant migration — cloud does not grant automatically (unlike local Supabase)

## Remaining work and future phases

### Phase 2 — PWA — completed

- Manifest and PWA icons are generated by the custom Vite build plugin into `dist/`.
- The static-only service worker is generated into `dist/`, uses cache `lamsa-v1`, cache-first handling for precached URLs, network-only handling for every other request, and cached `index.html` navigation fallback.
- `VITE_BASE_PATH` normalizes to a leading and trailing `/` and defaults to `/` for local builds.
- GitHub Pages builds use `/lamsa-by-farah/` as the repository base.
- GitHub Actions uses Node `20.19.0`, Pages permissions, and `cancel-in-progress: false`.
- Android and iPhone installation instructions are included in the README.

### Phase 3 — Supabase — completed

- Added one Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Added AuthContext with one `onAuthStateChange` subscription and real session/profile/wedding reads.
- Added sign-up, sign-in, sign-out, expired-session handling, and authenticated/no-wedding routing.
- Added profile, governorate, wedding, category, and provider migrations with RLS.
- Added tasks, expenses, favorites, and contact-request migrations with RLS.
- Restored `tasks.created_by` as `uuid NOT NULL DEFAULT auth.uid()` with `ON DELETE CASCADE`.
- Seeded 24 governorates, 10 categories, and 20 fictional/demo providers across Tunis, Ariana, Sousse, and Monastir.
- Providers use `governorate_id` and remain `is_demo=true`.
- Planning, budget, and favorites use Phase 4 placeholders; they do not use or imply saved local data.
- Supabase requests remain network-only and outside Cache Storage; `lamsa-v1` contains no Supabase URLs.

### Phase 4 — Product functionality

- Sub-batch 4a — deterministic planner and task CRUD: complete (tag `v0.4a-planner`).
- Sub-batch 4b — persisted budget and expense CRUD: complete (tag `v0.4b-budget`).
- 4c — Provider filters, detail, contact request (in progress → completed after validation). Favorites deferred to 4d.
  - Completed and tagged `v0.4c-providers`. `src/services/providersService.js` (server-side category/governorate/price/rating filters and sort; client-side name/city search), `src/services/contactRequestsService.js`, `src/components/providers/` (ProvidersPage, ProviderFilters, ProviderCard, ProviderDetail, ContactRequestModal).
  - Price filter semantics: `price_from >= min AND COALESCE(price_to, price_from) <= max`. Prices display as “5 000 – 8 000 TND”, “À partir de 5 000 TND” or “Tarif sur demande”.
  - Contact requests insert `status='pending'` with `user_id` (NOT NULL, checked by RLS); the modal shows the spec §5 disclaimer.
  - Phase 1 inline Services/ProviderCard, the Unsplash provider fallback, and the dead heart, “Filtres” and “⌘ K” buttons were removed. No migration, RLS, seed or service-worker change.
- 4d — Persisted favorites: complete (tag `v0.4d-favorites`). Phase 4 is complete.
  - `src/services/favoritesService.js` (`listFavoriteIds`, `listFavoriteProviders` as one favorites→providers inner-join query, `addFavorite` as upsert ON CONFLICT DO NOTHING, `removeFavorite`); `user_id` comes from the local session because the column has no default and RLS checks it.
  - `src/components/favorites/FavoritesPage.jsx` and `useFavoriteToggle.js` (shared optimistic toggle: per-provider in-flight lock, revert and toast on error).
  - Heart at the top-right of the cover on cards and the detail page (`aria-pressed`, 44 px on mobile / 36 px on desktop). Favorites are refetched on every screen mount; there is no cross-screen cache.
  - Profile “Mes services favoris” now opens Favorites. No migration, RLS or service-worker change.
- 4e — My contact requests screen: complete (tag `v0.4e-requests`). Phase 4 is fully complete.
  - `listMyContactRequests()` in `contactRequestsService.js`: one query, newest first, plain (left) join to providers so a request to a provider deactivated later stays listed as “Prestataire indisponible”.
  - `src/components/contact/MyRequestsPage.jsx`: read-only list (provider, category · governorate, wedding date or “Date non précisée”, full message, status badge En attente / Transmise au prestataire / Fermée, “Envoyée le …” in Africa/Tunis), spec §5 note, loading/error/empty states. Opened from the Profile item “Mes demandes de contact” (`activePage = 'requests'`, back to Profile).
  - The Profile menu now attaches an explicit action to each item instead of dispatching by position; `mail` icon added. No migration, RLS or service-worker change.
  - `src/components/budget/` (BudgetPage, ExpenseModal, BudgetEditModal), `src/services/expensesService.js`, `src/utils/format.js` (`formatTnd`, `parseTndAmount`, `mutationErrorMessage`).
  - Single ring card (budget total prévu, dépenses réelles payées, restant, % utilisé) plus a separate “Estimations planning (indicatif)” card summing `tasks.estimated_cost`, not deducted from the remaining amount.
  - Overspending whenever remaining < 0, including total budget = 0 with any expense; budget = 0 with no expense shows “Non défini”.
  - Category breakdown always lists the 10 categories: spent DESC, then empty ones by `sort_order`.
  - Approved deviation: `total_budget` is edited from the Budget page (BudgetEditModal) because no project-editing screen exists yet.
  - No SQL migration, RLS change, or service-worker change; Phase 3c owner-only expense policies are reused.

- Implement wedding project creation/editing.
- Implement deterministic smart planner generation, urgent-date handling, duplicate prevention, and replacement confirmation.
- Add task creation, editing, deletion, notes, time, estimated cost, and statuses.
- Add complete monthly calendar behavior.
- ~~Add expense CRUD and budget calculations including overspending.~~ Done in 4b.
- Dashboard budget summary card (spec §4.3) — deferred to a small follow-up after 4b.
- ~~Complete combined provider filters and provider detail/contact flow.~~ Done in 4c (no availability filter, see Known issues).
- Persist user-specific favorites.

### Phase 6 — Minimal admin panel for contact requests — post-MVP bonus (complete)

- **Post-MVP bonus, not part of the original specification** (§12 excludes a complete admin panel). Demonstrates the contact-request lifecycle only.
- Migration `20261121000006_phase6_admin_rls.sql` (applied locally and on the cloud project): adds `contact_requests_select_admin` and `profiles_select_admin` (no existing policy changed) and the `contact_requests_admin_column_guard` trigger. Reversal in `supabase/reversals/`.
- Admin = `app_metadata.is_admin === true` in the JWT, read in the app from `useAuth().user`. Promotion is done in the Supabase SQL Editor only (see README "Admin panel (post-MVP)"); the user must sign out and back in.
- Profile shows **"Admin — Demandes"** only for admins → `AdminRequestsPage` (`src/components/admin/`): every request across users, filter tabs Toutes / En attente / Transmises / Fermées, actions "Marquer transmise" (pending → sent) and "Fermer" (→ closed, native confirm), client name and phone from `profiles`.
- `src/services/adminService.js` uses two queries (requests + providers, then profiles by user ids) because `contact_requests.user_id` references `auth.users`, not `profiles`.
- Out of scope: delete, edits, notifications, provider responses, promotion UI.

### Phase 5 — Quality and delivery

- Run focused functional, responsive, accessibility, security, and RLS validation.
- Test Android Chrome and iPhone Safari when available.
- Complete README and deployment documentation.
- Deploy and verify the public HTTPS application.

## Constraints and security rules

- Never put `service_role`, database passwords, or server secrets in React, Git, or `VITE_*` variables.
- Public Supabase keys are acceptable only with correct RLS.
- Private rows must be isolated by authenticated user and wedding ownership, not merely hidden in the UI.
- Providers/categories may be publicly readable when active; writes belong to an administrative/seed process.
- Do not cache private Supabase data in the service worker.
- Do not claim a provider request is a confirmed reservation. No payment is part of the MVP.
- Keep French date formatting, TND currency, and Tunisian timezone behavior.
- Preserve visible loading, error, success, empty, focus, and overspending states.
- Avoid unnecessary dependencies and preserve the existing working UI.

## Known issues and technical decisions

- The Profile header link “Modifier mon profil” is also an inactive placeholder (pre-existing since Phase 1), in addition to the two Profile menu items listed below; same Phase 5 decision applies.
- Contact request statuses `sent` and `closed` are set from the Phase 6 admin screen (post-MVP bonus) by users promoted with `app_metadata.is_admin`; without a promoted admin, every request stays “En attente”.
- Column guard blocks content edits from service_role and Dashboard SQL when auth.uid() is NULL (it treats any non-owner as an admin). Correct security behavior — admins should never modify client content; status-only updates still work. For manual fixes: `ALTER TABLE contact_requests DISABLE TRIGGER contact_requests_admin_column_guard;` → `UPDATE …;` → `ALTER TABLE contact_requests ENABLE TRIGGER contact_requests_admin_column_guard;`.
- Profile menu items 'Mon projet de mariage' and 'Paramètres' are inactive placeholder buttons. They require dedicated screens (project edit, settings) not in MVP scope. Spec §11 rule 'Aucun bouton principal inactif' is partially violated — the app has 2 dead buttons in Profile. Phase 5 consideration: either implement the screens or remove the items.
- The heart button changes both `aria-pressed` and its `aria-label` (“Ajouter aux favoris” / “Retirer des favoris”), as specified. Some screen readers may announce the state twice; Phase 5 accessibility review can choose a fixed label with `aria-pressed` only.
- Le filtre de disponibilité prestataire n'est pas implémenté dans le MVP. Le champ `providers.availability_notes` est du texte libre et ne permet pas de répondre de manière fiable à « disponible à la date du mariage ? ». Inventer une disponibilité structurée violerait les règles de démonstration du cahier des charges (§8). Cette fonctionnalité est reportée à une phase future qui ajoutera un champ de disponibilité structuré.
- Seed demo gaps (Phase 5 polish): the 20 demo providers have NULL availability_notes, phone, website, social_url, cover_image_url, and empty gallery. Cards use gradient placeholders + category icons. Provider detail shows « Non renseignée » for missing availability with the disclaimer. Enrich seed data in Phase 5.
- Dashboard quick-tile categories are hardcoded Phase 1 tuples. Cosmetic — deferred to Phase 5 cleanup.
- All 20 seeded providers have rating ≥ 4.5, so the 4.5 ★ filter excludes none in the current seed; filtering exclusion was verified at 5 ★ (0 results).
- Vite/rolldown production build was broken from v0.3-supabase onward: the bundle contained corrupted preload markers (`void 0<hash>`), causing a blank page in the browser. Fixed in `7d42dbe` by Vite downgrade to 7.x (`vite@^7.3.8`, `@vitejs/plugin-react@^5.2.0`). Future Vite major upgrades must include a manual preview smoke test, not just `npm run build` exit 0.
- `@rolldown/binding-win32-x64-msvc` remains in devDependencies from the Vite 8 period; it is unused with Vite 7 and can be removed in Phase 5 cleanup.
- Offline reload renders the app shell, but the auth screen then shows the raw message “TypeError: Failed to fetch” from `AuthContext` (pre-existing; French copy deferred to Phase 5).
- Delete uses native window.confirm (same as 4a tasks). Polish to styled modal in a future phase.
- Budget taxonomy reuses the 10 provider categories. Items like invitations, jewelry, honeymoon have no dedicated category and must be logged under an existing category with a note. Dedicated budget taxonomy deferred to a future phase.
- The flower icon is used 3× in the category seed (`coiffure-maquillage`, `decoration`, `fleurs`) — cosmetic, differentiate in a future phase.
- Dashboard budget summary card (spec §4.3) — deferred to a small follow-up after 4b.
- TND formatting uses `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' })`: U+202F groups thousands and the engine emits U+00A0 (not U+202F) between the amount and “TND”. No “DT” string remains in `src/`.
- Overspend ring with total budget = 0 shows “—” + “Dépassement” (a percentage of 0 is undefined).
- The application currently uses local React state and resets data on refresh by design.
- Remote Unsplash images are temporary demonstration assets and should be replaced or formalized before production delivery.
- The current prototype uses local state navigation instead of URL routing; this is acceptable for Phase 1.
- The current app is intentionally not connected to Supabase or PWA infrastructure.
- Vite’s current installed version recommends a newer Node runtime than the available `20.15.0`; upgrade the runtime before relying on future Vite features or deployment tooling.
- Native Windows bindings for the scaffold’s Vite/Oxlint toolchain are present in development dependencies so local validation works on this environment.


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

- Frontend: React 19 + Vite 8 + JavaScript.
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

**Current phase: Phase 3 — Supabase — completed.**

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

**Next phase: Phase 4 — Product functionality.** Do not begin it unless explicitly approved.

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

- Implement wedding project creation/editing.
- Implement deterministic smart planner generation, urgent-date handling, duplicate prevention, and replacement confirmation.
- Add task creation, editing, deletion, notes, time, estimated cost, and statuses.
- Add complete monthly calendar behavior.
- Add expense CRUD and budget calculations including overspending.
- Complete combined provider filters and provider detail/contact flow.
- Persist user-specific favorites.

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

- The application currently uses local React state and resets data on refresh by design.
- Remote Unsplash images are temporary demonstration assets and should be replaced or formalized before production delivery.
- The current prototype uses local state navigation instead of URL routing; this is acceptable for Phase 1.
- The current app is intentionally not connected to Supabase or PWA infrastructure.
- Vite’s current installed version recommends a newer Node runtime than the available `20.15.0`; upgrade the runtime before relying on future Vite features or deployment tooling.
- Native Windows bindings for the scaffold’s Vite/Oxlint toolchain are present in development dependencies so local validation works on this environment.


# Lamsa by Farah

*Votre mariage, votre signature.*

A mobile-first wedding-planning web app (PWA) for couples in Tunisia: plan the big day, track the budget in TND, and find real local wedding providers. French interface throughout.

**Live demo:** https://maaloulyassine.github.io/lamsa-by-farah/

> Create an account on the live site to explore it. The demo uses a real Supabase backend; contact requests are recorded in the app only and are never sent to providers.

---

## Features

- **Authentication** — sign up / sign in with e-mail and password (Supabase Auth), French error messages, persistent session, sign out.
- **Wedding project** — couple name, date, governorate, city, total budget, guest count and preparation start date, with a live countdown on the dashboard.
- **Smart planner** — deterministic plan generated from the wedding date (the same inputs always give the same tasks), shown on a calendar with an upcoming-tasks list; every task is fully editable (title, description, date, time, status, estimated cost, notes) and can be added, regenerated or deleted.
- **Budget** — total budget, real expenses and remaining amount in TND, animated progress ring, per-category breakdown, expense history; spending more than the budget is shown as an explicit overspend (« Dépassement »).
- **Provider catalogue** — 189 real Tunisian wedding providers in 10 categories, mainly in 5 governorates (Tunis, Nabeul / Hammamet, Sousse, Monastir, Bizerte, plus 2 providers in Ariana); search by name or city, category and governorate filters, a detail page with phone and a « Voir sur Google Maps » link.
- **Favorites** — save providers from the catalogue and find them on « Mes favoris ».
- **Contact requests** — send a message to a provider and follow its status (En attente → Transmise → Fermée) on « Mes demandes de contact ». A request is never presented as a confirmed booking.
- **Admin panel** *(post-MVP bonus)* — a minimal screen for admins to move contact requests through their statuses.
- **Installable PWA** — manifest, icons, offline app shell, install on Android and iPhone.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, plain CSS (no UI framework), oxlint |
| Backend | Supabase — Postgres 17, Auth, Row Level Security, PostgREST |
| Hosting | GitHub Pages (HTTPS) |
| CI/CD | GitHub Actions (Node 22.12 build, actions on the node24 runtime) |
| PWA | Hand-written service worker generated at build time (cache `lamsa-v1`) |

## Architecture

- **Frontend** — a single-page React app (`src/`): screens in `src/App.jsx`, `src/pages/` and `src/components/<feature>/`, data access isolated in `src/services/*Service.js`, formatting helpers in `src/utils/` (TND formatting via `Intl` fr-FR). The browser only ever holds the public anon key.
- **Backend** — Supabase Postgres with RLS enabled on all 9 public tables (29 policies): users can only read and write their own wedding, tasks, expenses, favorites and requests; the catalogue (categories, governorates, providers) is read-only for clients. Schema and policies live in versioned migrations (`supabase/migrations/`), each with a manual reversal in `supabase/reversals/` where relevant; reference and provider data in `supabase/seed.sql`.
- **Deployment** — every push to `master` runs `.github/workflows/deploy.yml`: `npm ci`, `vite build` with the GitHub Pages base path and the public Supabase settings from repository secrets, then deploy of `dist/` to GitHub Pages. The service worker precaches the static app shell only; Supabase traffic is always network-only.

```
src/
  App.jsx               app shell, navigation, dashboard, profile
  pages/                auth screens, wedding setup
  components/
    planner/ budget/ providers/ favorites/ contact/ admin/
    welcome/            welcome carousel
    ui/                 Wordmark, Flourish
  services/             Supabase queries (tasks, expenses, providers, favorites, contact requests, admin)
  context/              auth / session context
  utils/                formatting, error messages, category images
supabase/
  migrations/           schema, RLS policies, grants
  reversals/            manual rollback scripts
  seed.sql              categories, governorates, 189 providers
public/
  fonts/ icons/ images/ (category illustrations, welcome slides)
```

## Local development

### Prerequisites

- **Node.js** 20.19+ or 22.12+ (Vite 7 requirement; CI uses 22.12.0)
- **Docker** (Docker Desktop on Windows/macOS) — required by the local Supabase stack
- **Supabase CLI** — included as a dev dependency, run it with `npx supabase` (no global install needed)

### Steps

```bash
git clone https://github.com/maaloulyassine/lamsa-by-farah.git
cd lamsa-by-farah
npm ci

npx supabase start        # starts the local stack (API on http://127.0.0.1:54321)
npx supabase db reset     # applies every migration, then supabase/seed.sql

cp .env.example .env      # PowerShell: Copy-Item .env.example .env
# edit .env (see below); `npx supabase status` prints the local API URL and anon key

npm run dev               # http://localhost:5173/
```

Other scripts: `npm run lint` (oxlint), `npm run build` (production build into `dist/`), `npm run preview` (serve the build, which also registers the service worker).

### Environment variables

| Variable | Local value | Production value | Notes |
|---|---|---|---|
| `VITE_SUPABASE_URL` | `http://127.0.0.1:54321` | `https://<project-ref>.supabase.co` | Public project URL |
| `VITE_SUPABASE_ANON_KEY` | anon key from `npx supabase status` | anon key from the Supabase dashboard | Public key, protected by RLS |
| `VITE_BASE_PATH` | `/` | `/lamsa-by-farah/` | Base path, with trailing slash |

`.env` is ignored by Git. Only public values belong in `VITE_*` variables: **never** put the `service_role` key, a database password or any server secret in the frontend, the repository or GitHub Actions variables used by the build.

## Deployment

### GitHub Pages via GitHub Actions

The workflow is `.github/workflows/deploy.yml` (push to `master` or manual dispatch). In the repository:

1. **Settings → Pages → Source:** GitHub Actions (environment `github-pages`).
2. **Settings → Secrets and variables → Actions**, add the two required secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

`VITE_BASE_PATH=/lamsa-by-farah/` is set in the workflow itself.

### Supabase cloud setup

```bash
npx supabase login                                  # personal access token
npx supabase link --project-ref <project-ref>
npx supabase db push --remote --dry-run             # review pending migrations
npx supabase db push --remote --yes                 # apply them
npx supabase db query --remote --file supabase/seed.sql --yes   # load reference + provider data
npx supabase db query --remote --read-only "select count(*) from public.providers;"   # expect 189
```

- **Seed execution:** run the seed explicitly with `db query --remote --file supabase/seed.sql --yes`. Do **not** rely on `db push --include-seed`: the CLI only records the seed hash and does not run the seed again when the hash is unchanged. The seed is idempotent.
- **GRANT quirk:** on the cloud project, tables created by migrations did not receive the default table privileges that the local stack grants automatically (the app failed with `permission denied for table weddings` until migration `20261121000005_phase4f_grants.sql`). **Any new table needs an explicit GRANT migration** for `authenticated` (and `anon` if public), in addition to its RLS policies. Migration `20261122000008_phase5c_grants_cleanup.sql` also revokes TRUNCATE from `anon` / `authenticated` and gives `service_role` CRUD on public tables.
- **Auth settings:** e-mail confirmation is disabled in `supabase/config.toml` for local development; configure the cloud project's Auth settings (site URL, confirmations) in the Supabase dashboard.

### Service worker and cache

The build generates `dist/service-worker.js` with cache `lamsa-v1` (21 entries: app shell, manifest, icons, 6 self-hosted fonts, 5 welcome images, JS/CSS bundles). Precached files are served cache-first, everything else network-only, and navigation falls back to the cached `index.html` when offline. Supabase requests are never cached.

## PWA installation

Installation requires HTTPS (the GitHub Pages URL qualifies; `localhost` works for testing).

**Android — Chrome**

1. Open https://maaloulyassine.github.io/lamsa-by-farah/ in Chrome.
2. Open the menu (⋮) → **Installer l'application** (or **Ajouter à l'écran d'accueil**).
3. Confirm with **Installer**.

**iPhone / iPad — Safari**

1. Open the site in Safari.
2. Tap **Partager** (square with an arrow).
3. Choose **Sur l'écran d'accueil**, then **Ajouter**.

The installed app opens full screen (standalone) with the Lamsa icon.

## Design system

- **Wordmark** — « Lamsa » in *Italiana*, « by Farah » in *Cormorant Garamond* italic, underlined by a thin hand-drawn terracotta flourish (`src/components/ui/Wordmark.jsx`, `Flourish.jsx`). The same flourish appears under every page title.
- **Palette** — warm and soft: ivory `#f7f0e9`, cream `#fcf8f3`, blush `#ead9ce`, champagne `#d7b08c`, taupe `#8c7c70`, terracotta `#a97b63`, deep brown `#715340`, ink `#3d302a` (CSS custom properties in `src/App.css`).
- **Typography** — *Playfair Display* for editorial headings, *DM Sans* for interface text, *Italiana* + *Cormorant Garamond* for the brand and slogans. All four are self-hosted WOFF2 files (latin subset) in `public/fonts/` — no request to Google Fonts.
- **Welcome carousel** — 5 full-screen photos, each paired with a slogan (« Votre mariage, votre signature. », « L'élégance dans chaque détail. », « Des souvenirs qui vous ressemblent. », « L'art de célébrer l'amour. », « Votre histoire commence ici. »): 0.8 s fade, auto-rotation every 6 s, pause after interaction, swipe, arrows and keyboard support, and no auto-rotation when the system asks for reduced motion.
- **Details** — soft shadow scale (`--shadow-sm` … `--shadow-xl`), subtle hover lift on cards (pointer devices only), terracotta focus rings for keyboard users, slide-in toasts, mobile-first layout with a drawer menu below 651 px.

**What you see on the live site:** a full-screen photo carousel with the ivory wordmark and slogan over a soft dark gradient, and « Commencer » / « J'ai déjà un compte » buttons; after sign-in, a beige sidebar with the wordmark, a dashboard opening on « Bonjour … 👋 » above a ballroom banner (« Rêvez grand. On s'occupe du reste. »), category tiles, the wedding countdown and the next tasks.

## Admin panel (post-MVP)

**Not part of the original specification — post-MVP demo feature.** The specification excludes a complete admin panel (§12). This minimal screen only exists to demonstrate the full contact-request lifecycle (En attente → Transmise → Fermée).

Admins are identified by `app_metadata.is_admin = true` in their Supabase JWT. There is no promotion UI in the app. To promote a user:

1. Sign up the user on the live site.
2. Supabase Dashboard → **Authentication → Users** → note the exact e-mail.
3. Supabase Dashboard → **SQL Editor**:
   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
   WHERE email = '<user-email>';
   ```
4. The user signs out and back in, so the JWT carries the new claim.
5. **« Admin — Demandes »** appears in the Profile menu.

To revoke: run the same update with `raw_app_meta_data - 'is_admin'`, then sign out and back in.

**Security is enforced server-side:** RLS policies `contact_requests_select_admin`, `profiles_select_admin` and `contact_requests_update_admin`, plus the `contact_requests_admin_column_guard` trigger, which only lets admins change the `status` column (migration `20261121000006_phase6_admin_rls.sql`). Hiding the menu item is only a convenience; a non-admin JWT cannot read other users' requests.

## Provider data

- **189 real providers** collected by manual research by the project owner (November 2026), replacing the earlier demonstration data.
- **Coverage:** Sousse 49, Monastir 42, Tunis 36, Bizerte 32, Nabeul / Hammamet 28, Ariana 2 — the other governorates are not covered yet.
- **All 10 categories:** wedding venues, dresses, hair & make-up, decoration, caterers & chefs, cakes, photo & video, DJ & artists, flowers, car rental.
- **Traceability:** `data_source` (`manual_research`) and `last_verified_at` (last human check of phone / address) on every provider.
- **Honest placeholders:** the rating is an indicative 4.5 with no real reviews, prices and availability are not collected (« Tarif sur demande »), and 5 Tunis venues have no phone yet (« Téléphone non renseigné »). The UI says so next to the data.
- **Images:** providers have no photos of their own. Cards and detail pages show one generic illustration per category, always labelled « Photo d'illustration »; the real place can be checked through « Voir sur Google Maps ». The category illustrations and the 5 welcome slides come from Unsplash under the [Unsplash License](https://unsplash.com/license) (free use, no attribution required); sources are listed in `DEVELOPMENT_LOG.md`. All images are self-hosted WebP files in `public/images/`.
- **Source of truth:** `supabase/seed.sql` (idempotent). Apply a seed change to the cloud with `npx supabase db query --remote --file supabase/seed.sql --yes`.

## Testing

There is no automated test suite in the repository; each phase was validated with lint + build and scripted browser checks (Playwright) against the production build, as recorded in `DEVELOPMENT_LOG.md`. To repeat the main checks:

- **Local test users** — with the local stack running, create accounts through the app (« Commencer ») or the Auth API; e-mail confirmation is off locally, so `name@example.test` addresses work. `npx supabase db reset` wipes them. Use clearly fake `@example.test` addresses on the cloud project and delete them afterwards (Authentication → Users).
- **RLS isolation** — sign in as user A and create a wedding, an expense and a favorite; sign in as user B and confirm B's screens are empty. At API level, a REST call with B's access token such as `GET /rest/v1/weddings?select=*` must return `[]` for A's rows, and inserting a row with A's `user_id` must be rejected. A non-admin token must not read other users' contact requests.
- **Service worker / offline** — run `npm run build && npm run preview` (or use the live site), load the app once, then DevTools → Application → Service Workers: `service-worker.js` active; Cache Storage → `lamsa-v1` holds 21 entries and no `supabase.co` URL. Tick **Offline** and reload: the app shell (welcome screen, fonts, images) still loads; data screens need the network.
- **PWA install** — DevTools → Application → Manifest shows no errors; install from Chrome on Android or « Sur l'écran d'accueil » on iPhone and check that the app opens standalone.
- **Responsive** — check 390, 640, 768, 1024 and 1280 px widths: no horizontal scroll, drawer menu below 651 px.

## Known limitations

The current list of open issues and technical decisions is maintained in [PROJECT_CONTEXT.md → Known issues and technical decisions](./PROJECT_CONTEXT.md#known-issues-and-technical-decisions). The main ones: price and rating filters are hidden until real data exists, only part of Tunisia is covered, ratings are placeholders, provider photos are generic illustrations, and there is no booking or payment (contact requests only).

## Project documentation

- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — scope, architecture, decisions, phase status, known issues
- [`DEVELOPMENT_LOG.md`](./DEVELOPMENT_LOG.md) — dated log of every phase and its validation
- [`AGENTS.md`](./AGENTS.md) — working rules for AI coding agents on this repository

## License

Portfolio project, not licensed for production use.

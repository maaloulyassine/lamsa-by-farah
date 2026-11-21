# Lamsa by Farah

Mobile-first wedding-planning PWA for couples in Tunisia.

## Development

```powershell
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Set the GitHub Pages repository base with `VITE_BASE_PATH`. Example:

```text
VITE_BASE_PATH=/lamsa-by-farah/
```

The `.env` file is ignored by Git. Use `.env.example` as a local reference.

## PWA installation

The application requires HTTPS for service worker and install behavior.

### Android / Chrome

1. Open the deployed HTTPS URL in Chrome.
2. Open the browser menu.
3. Select **Install app** or **Add to Home screen**.
4. Confirm the installation.

### iPhone / iPad / Safari

1. Open the deployed HTTPS URL in Safari.
2. Tap **Partager**.
3. Select **Sur l'écran d'accueil**.
4. Confirm the app name and tap **Ajouter**.

## Deployment

The GitHub Pages workflow builds with Node.js `20.19.0` and deploys `dist/`.

In the GitHub repository settings:

1. Open **Settings > Pages**.
2. Set **Source** to **GitHub Actions**.
3. Ensure the repository environment is named `github-pages`.

The service worker caches static app-shell resources only: HTML, CSS, JavaScript, manifest, icons, and self-hosted fonts. Supabase traffic and cross-origin Unsplash images are network-only and are not cached.

## Admin panel (post-MVP)

**Not part of original spec. Post-MVP demo feature.** The original specification excludes a complete admin panel (§12). This minimal screen only exists to demonstrate the full contact-request lifecycle (En attente → Transmise → Fermée) in a demo environment.

Admins are identified by `app_metadata.is_admin = true` in their Supabase JWT. There is no promotion UI in the app. To promote a user:

1. Sign up the user on the live site: https://maaloulyassine.github.io/lamsa-by-farah/
2. Supabase Dashboard → **Authentication → Users** → find the user (note the exact email).
3. Supabase Dashboard → **SQL Editor**, run:
   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
   WHERE email = '<user-email>';
   ```
4. The user signs out and back in, so the JWT is refreshed with the new claim.
5. **"Admin — Demandes"** appears in the Profile menu.

To revoke: run the same update with `raw_app_meta_data - 'is_admin'`, then sign out and back in.

Server-side enforcement: RLS policies `contact_requests_select_admin`, `profiles_select_admin` and `contact_requests_update_admin`, plus the `contact_requests_admin_column_guard` trigger, which only lets admins change the `status` column (migration `20261121000006_phase6_admin_rls.sql`).

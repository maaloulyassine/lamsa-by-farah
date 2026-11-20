# Instructions for AI Coding Agents

## Before changing code

1. Read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) completely.
2. Read [`DEVELOPMENT_LOG.md`](./DEVELOPMENT_LOG.md) to understand recent work and validation.
3. Read the relevant sections of the original specification at [`Lamsa_by_Farah_Agent_Pack/CAHIER_DES_CHARGES_LAMSA.md`](../Lamsa_by_Farah_Agent_Pack/CAHIER_DES_CHARGES_LAMSA.md).
4. Inspect the existing implementation before editing it. Do not assume the scaffold or current feature set is empty.
5. Review the reference mockup at [`Lamsa_by_Farah_Agent_Pack/assets/maquette-reference.webp`](../Lamsa_by_Farah_Agent_Pack/assets/maquette-reference.webp) for visual changes.

## Working rules

- Respect all approved product, architecture, design, scope, and security decisions in `PROJECT_CONTEXT.md`.
- Do not rebuild existing features unnecessarily. Extend the current implementation and preserve working behavior.
- Keep changes precise and modular. Prefer existing components, styles, and patterns.
- Avoid introducing dependencies unless they are necessary and justified.
- Do not integrate a later phase early without explicit approval.
- Never expose secrets, Supabase service-role credentials, database passwords, or private data.
- Treat provider data, reviews, and availability as fictitious unless explicitly sourced and labeled.
- Preserve French UI copy, TND formatting, mobile-first behavior, and the Lamsa visual identity.
- Keep clear loading, error, empty, success, focus, and disabled states as features become data-backed.
- Do not claim a reservation is confirmed; the MVP has no payments or instant booking.
- Do not make the service worker cache private Supabase data.

## Validation rules

- Run the smallest relevant validation after each change.
- For frontend changes, use `npm run lint` and `npm run build` when practical.
- Exercise the affected user flow, especially mobile navigation and responsive layout.
- Do not report a feature as complete without testing it.
- If validation is blocked by environment/tooling issues, report the exact issue and distinguish it from application failures.

## Documentation rules

- Update `PROJECT_CONTEXT.md` when architecture, scope, technical decisions, known issues, or phase status changes.
- Add a concise dated entry to `DEVELOPMENT_LOG.md` after completing a development phase or making a significant technical change.
- Keep both documents concise and factual; do not duplicate the full product specification.
- Preserve `AGENTS.md` unless the project-wide working rules intentionally change.
- Before handing off work, state changed files, validation performed, remaining issues, and the next approved phase.


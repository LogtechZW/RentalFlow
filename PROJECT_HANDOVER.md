# RentalFlow Project Handover

## Repository

- GitHub: https://github.com/LogtechZW/RentalFlow
- Primary branch: `main`
- Latest prepared revision: `a9c01e8` — production environment preflight
- Project type: React + TypeScript + Vite application
- Supported runtime: Node.js 20 or 22 (Node 22 LTS recommended)

## What has been prepared

RentalFlow has been prepared for a multi-organisation, multi-user deployment:

- Supabase authentication and organisation onboarding.
- Role-based workspaces for administrators, property managers, accountants, property owners, and tenants.
- Row Level Security (RLS) and organisation isolation.
- Shared, revision-protected workspace snapshots to avoid silent concurrent overwrites.
- Staff invitations and acceptance flow.
- Production/demo-mode safeguards and a production environment preflight command.
- Vercel deployment configuration, security headers, error recovery, tests, and GitHub Actions CI.

## Supabase status

The database migration was supplied and has been run in Supabase.

The migration source is retained here:

```text
supabase/migrations/20261018_multitenant_foundation.sql
```

Important:

- RLS must remain enabled.
- Never put the Supabase `service_role` secret in the frontend or GitHub repository.
- The frontend only uses the Project URL and Publishable/anon key.

## Run locally on a new device

```powershell
git clone https://github.com/LogtechZW/RentalFlow.git
cd RentalFlow
node --version
npm install
npm run dev
```

If `vite is not recognised`, the dependency installation is incomplete:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

Do not run `vite` directly. Always use `npm run dev`.

## Local environment configuration

Create a `.env.local` file based on `.env.example`. Do not commit it.

```text
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-OR-ANON-KEY
VITE_DEMO_MODE=false
```

Verify the production configuration before deploying:

```powershell
npm run preflight:production
npm run build
npm test
```

## Recommended production hosting

Recommended stack:

```text
Cloudflare Pages (frontend) + Supabase (auth and database) + Paynow (Zimbabwe payments, future phase)
```

Cloudflare Pages setup:

```text
Repository: LogtechZW/RentalFlow
Framework preset: Vite
Build command: npm run build
Output directory: dist
Node version: 22
```

Add the following environment variables to both Production and Preview:

```text
VITE_SUPABASE_URL=<Supabase Project URL>
VITE_SUPABASE_ANON_KEY=<Supabase Publishable/anon key>
VITE_DEMO_MODE=false
```

AWS Amplify is also a good managed AWS option. AWS Lightsail is unnecessary for the current static frontend unless a custom server-side service is added later.

## After the first deployment

1. Copy the live application URL.
2. In Supabase, open **Authentication → URL Configuration**.
3. Set the Site URL to the live application URL.
4. Add the live application URL to Redirect URLs.
5. Test: sign up, sign in, create an organisation, invite a staff member, and verify both users see the same workspace.
6. Add a custom domain only after the above checks pass.

## Billing recommendation

Use a 14-day trial and a simple monthly plan structure:

| Plan | Suggested monthly price | Intended customer |
| --- | ---: | --- |
| Starter | US$19 | Small landlords and agencies |
| Growth | US$59 | Growing property managers |
| Business | US$149 | Larger portfolios and teams |

Start with manual subscription status while validating the product. Add Paynow for local Zimbabwe payments, then Stripe for international cards when the payment integration and webhook handling are ready.

## Security checklist before public launch

- Confirm RLS policies are enabled and tested.
- Do not use demo mode in production.
- Do not expose Supabase service-role credentials.
- Set Supabase Site URL and Redirect URLs.
- Use a custom domain with HTTPS.
- Enable error monitoring (Sentry variable is optional but recommended).
- Test sign-up, sign-in, role permissions, invitation acceptance, and data separation between organisations.
- Review the deployment guide: `docs/DEPLOYMENT.md`.

## Key project files

| Purpose | Location |
| --- | --- |
| Deployment guide | `docs/DEPLOYMENT.md` |
| Environment template | `.env.example` |
| Supabase migration | `supabase/migrations/20261018_multitenant_foundation.sql` |
| Production validation | `scripts/verify-production-env.mjs` |
| CI workflow | `.github/workflows/ci.yml` |
| Vercel configuration | `vercel.json` |


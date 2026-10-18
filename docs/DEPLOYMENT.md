# Production deployment guide

## What is ready now

The web application has protected client routes, Supabase-backed sessions, organisation onboarding, standard Vite production builds, error reporting support via Sentry, and organisation-scoped data with row-level security (RLS). Configured deployments persist an organisation workspace snapshot in Supabase, so authorised team members share the same data; demo mode remains device-local.

Do **not** publish it as a financial system with `VITE_DEMO_MODE=true`: browser storage and mock sign-in are not security controls.

## Recommended stack

| Concern | Recommended service | Why |
| --- | --- | --- |
| Frontend | Cloudflare Pages or Vercel | Global CDN, HTTPS, preview deployments |
| Data and authentication | Supabase | Postgres, Auth, Storage and RLS in one managed service |
| Error monitoring | Sentry | Fast production exception alerts |
| Transactional email | Resend or Postmark | Reliable invoice and invitation mail |
| Zimbabwe payments | Paynow | Local methods such as EcoCash and card support |
| International billing | Stripe | Subscription billing, tax invoices and webhooks |

## Release checklist

1. Create a Supabase project and run `supabase/migrations/20261018_multitenant_foundation.sql` in the SQL editor or through the Supabase CLI.
2. Enable email verification and MFA for administrators. Never expose a Supabase service-role key in the frontend.
3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`, and `VITE_DEMO_MODE=false` in the hosting provider.
   Run `npm run preflight:production` in the same environment before publishing; it rejects missing Supabase credentials, placeholder values, and demo mode.
4. Apply the migration, then verify two users in the same organisation can create and see a shared property record. The workspace snapshot is RLS-protected; as the product grows, migrate high-volume records to the supplied normalised tables without weakening RLS.
5. Add payment webhooks in a server-side function. Verify webhook signatures, make events idempotent, and update invoices only after verified provider events.
6. Run `npm run build`, perform an accessibility pass (keyboard navigation, visible focus, contrast, mobile), and configure a custom domain, HTTPS, backups, and retention policy.

## Billing recommendation

Start with subscription pricing per organisation, with included seats and a simple property/unit allowance:

| Plan | Suggested launch price | Includes |
| --- | --- | --- |
| Starter | US$19/month | 1 property, 3 staff seats, 50 units |
| Growth | US$59/month | 5 properties, 10 staff seats, 300 units, reporting |
| Portfolio | US$149/month | 20 properties, 30 staff seats, API and priority support |

Offer a 14-day trial without card details. Charge an additional US$3 per staff seat after the included limit and US$0.20 per unit over the plan allowance. In Zimbabwe, allow monthly manual invoices/Paynow while using Stripe for international cards. Keep tenant portal access free; the property operator pays.

## First-time user journey

1. Owner creates an account, verifies their email, then creates their first organisation in `/onboarding`.
2. A short wizard collects country, operating currency, portfolio and first property.
3. Owner imports spaces/tenants from a CSV or adds them manually.
4. An administrator, property owner or manager opens **Settings → Workspace Team**, enters a colleague’s email and selects their role. The colleague registers or signs in with that exact email; RentalFlow accepts the unexpired invitation automatically.
5. Manager creates leases; accountant sets invoice templates and payment gateway.
6. The dashboard prompts the owner to run a test invoice before going live.

Workspace saves use optimistic revisions. If another team member saves first, RentalFlow asks the user to refresh instead of silently overwriting the newer workspace.

## Single-user and multi-user modes

For a solo landlord, create one organisation and assign the owner `administrator`. The same schema supports a multi-user firm by adding staff memberships with role-specific access. Administrators, property owners, property managers and accountants can access the shared workspace; tenant memberships are intentionally denied the full management workspace until a separately scoped tenant portal is introduced. The organisation boundary is the tenant boundary: users cannot read another firm's records because RLS evaluates membership on every database query.

# Production deployment guide

## What is ready now

The web application has protected client routes, role-aware sessions in demo mode, standard Vite production builds, error reporting support via Sentry, and a Supabase migration that creates organisation-scoped data with row-level security (RLS).

The supplied UI remains a demo data client until the Supabase data adapter is connected. Do **not** publish it as a financial system with `VITE_DEMO_MODE=true`: browser storage and mock sign-in are not security controls.

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
4. Replace the demo context persistence with repository functions that read/write the organisation-scoped tables. Every request must include the selected organisation and is still enforced by RLS.
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
4. Owner invites a manager and accountant; roles are assigned in `organization_memberships`.
5. Manager creates leases; accountant sets invoice templates and payment gateway.
6. The dashboard prompts the owner to run a test invoice before going live.

## Single-user and multi-user modes

For a solo landlord, create one organisation, assign the owner `administrator`, and hide invitations in the UI. The same schema supports a multi-user firm by adding memberships with role-specific access. The organisation boundary is the tenant boundary: users cannot read another firm's records because RLS evaluates membership on every database query.

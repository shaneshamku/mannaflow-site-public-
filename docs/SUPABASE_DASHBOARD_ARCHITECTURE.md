# Supabase dashboard architecture

This is the target architecture for the MannaFlow client dashboard. It replaces
the local-only Prisma, NextAuth, and Neon staging plan before client data is
introduced.

> **Domain glossary:** [`../CONTEXT.md`](../CONTEXT.md).
> **Key decisions:** [`adr/0001-single-supabase-project-no-staging-tier.md`](adr/0001-single-supabase-project-no-staging-tier.md)
> and [`adr/0002-retell-call-log-ingestion.md`](adr/0002-retell-call-log-ingestion.md).
> The "Revised plan — 2026-08-05" section at the bottom supersedes the earlier
> "Next work" list and the staging-first deployment guidance.

## Roles and ownership

- **MannaFlow admin**: an internal user who can view MannaFlow's sales
  workspace and every client organization.
- **Client admin**: a user assigned by MannaFlow to one client organization.
- **Client member**: reserved for a future phase. Clients cannot yet invite or
  manage their own staff.

All client data is owned by exactly one organization. This includes leads,
call logs, campaigns, messages, activities, campaign assignments, and future
Retell records. MannaFlow's own prospects and nurture campaigns belong to the
internal MannaFlow organization.

## Supabase design

Supabase Auth is the identity provider. `auth.users` stores credentials;
application authorization lives in `public.profiles` and `public.organizations`.

```text
auth.users
  └─ profiles (role, optional organization_id)
       ├─ MannaFlow admin → all organizations
       └─ client user → one organization

organizations
  └─ organization-owned records
       ├─ leads
       ├─ call_logs (Retell later)
       ├─ campaigns
       ├─ campaign_leads
       ├─ messages
       └─ activities
```

Row Level Security is enabled on every application table. The database, not
only Next.js route code, decides whether a signed-in client can access a row.

## Delivery phases

1. Define and apply the Supabase schema and RLS policies.
2. Replace NextAuth credentials login with Supabase Auth.
3. Replace Prisma data access with Supabase server clients, preserving the
   existing dashboard UI and API contract where practical.
4. Add MannaFlow-only user provisioning with a server-side Supabase secret.
5. Add Retell webhooks; resolve the organization before writing a call log.
6. Run client-isolation acceptance tests in Supabase staging.
7. Retire the Prisma/Neon path only after staging passes.

## Environment variables

The browser may receive only the project URL and Supabase publishable key:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The server-only provisioning path, the Retell call-log webhook, and the
backfill all use the service-role secret. Retell ingestion additionally needs
the Retell API key:

```text
SUPABASE_SECRET_KEY
RETELL_API_KEY
```

Never expose `SUPABASE_SECRET_KEY` or `RETELL_API_KEY` to browser code or commit
either to the repo. The `agent_id → organization` mapping is stored in the
database (`organizations.retell_agent_id`), not in env vars.

## Current handoff checkpoint — 2026-08-05

### End goal

Before any real client data is used, the client dashboard must run on
Supabase Auth and Supabase Postgres with RLS enforcing organization isolation.
MannaFlow staff provision accounts; client users cannot invite or administer
staff. `MANNAFLOW_ADMIN` can access every organization and MannaFlow's internal
workspace; `CLIENT_ADMIN` can access only its assigned organization.

The Prisma, NextAuth, Docker, and Neon implementation is a temporary local
fallback only. Retire it in a separate reviewed change after the Supabase path
is committed, deployed, and revalidated in Vercel Preview.

### Completed externally and in staging

- A Supabase project named `mannaflow-staging` exists and is empty apart from
  the dashboard foundation migration.
- The user ran `supabase/migrations/20260727150000_dashboard_foundation.sql`
  successfully in Supabase SQL Editor. It created the internal MannaFlow
  organization, tables, indexes, RLS policies, and helper functions.
- The Supabase Project URL, publishable key, and secret key were added to the
  **Preview** environment of the separate `mannaflow-staging` Vercel project
  as `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`.
- Fictional staging data exists: MannaFlow Internal and Client Demo
  organizations; one MannaFlow admin and one Client Demo admin; isolated QA
  leads; and a Client Demo campaign. No real client data or production
  Supabase project exists.
- Neon remains unused for staging: do not run the previously discussed Neon
  migration/seed commands.

### Completed, uncommitted working-tree changes

These changes are intentionally not committed or pushed yet because the
Prisma-to-Supabase data/API conversion is incomplete:

- `@supabase/ssr` and `@supabase/supabase-js` added to `package.json` and lockfile.
- `lib/supabase/{browser,server,admin,proxy}.ts` provides browser, cookie-backed
  server, server-only admin, and session-refresh helpers.
- Root `proxy.ts` refreshes Supabase sessions only when Supabase environment
  variables are configured; otherwise local Prisma development remains usable.
- Login and sidebar sign-out use Supabase when configured, otherwise retain
  their NextAuth fallback.
- `lib/dashboard-auth.ts` resolves a Supabase Auth user through `profiles` and
  maps roles to `MANNAFLOW_ADMIN`, `CLIENT_ADMIN`, and `CLIENT_MEMBER`, with a
  local Prisma fallback.
- `lib/dashboard-data.ts` maps Supabase rows to the existing dashboard UI.
  Overview, Leads, Campaigns, Analytics, lead detail, and their ordinary
  dashboard APIs use the cookie-backed publishable client when configured, so
  RLS is exercised. Local Prisma remains the fallback when Supabase is absent.
- `/api/admin/provision-user` and `/dashboard/admin` let only a signed-in
  `MANNAFLOW_ADMIN` provision an internal or client-admin account. The secret
  key is confined to this server-side path; client self-invitation is absent.
- `scripts/seed-supabase-staging.mjs` is confirmation-gated and creates only
  fictional staging fixtures. `npm run supabase:seed:staging` loads `.env`.
- `npm run test:e2e` loads `.env`; its Supabase staging run passed, proving a
  Client Demo admin cannot view an internal lead or enroll it in a campaign.

Validation passed: `npx tsc --noEmit`, `git diff --check`, targeted ESLint,
`npm run build`, and the Supabase-backed Playwright tenant-isolation test.
Full-repository `npm run lint` still has pre-existing failures in unrelated
legacy marketing/demo components.

### Next work for the succeeding agent (superseded — see "Revised plan" below)

1. Review the uncommitted Supabase change as an atomic staging migration,
   commit it on `staging`, and push it only after reviewing the diff.
2. Confirm the Vercel `mannaflow-staging` Preview environment has the three
   Supabase variables and deploy the committed branch. Repeat the browser
   tenant-isolation check against that deployment, not only localhost.
3. Convert the Twilio webhook and campaign-cron/engine paths before enabling
   them in Supabase staging. Those integration paths still use Prisma and must
   use a deliberate server-to-server Supabase design that resolves an
   organization before every write; never use the provisioning secret for
   ordinary dashboard requests.
4. In a separate reviewed removal, retire Prisma, NextAuth, Docker, Neon, and
   the local fallback only after the deployed Supabase path remains stable.
5. Do not use production credentials or real client data until the preceding
   staging review and deployment checks have passed.

## Revised plan — 2026-08-05

Owner's definition of done: **an admin can log into the dashboard on the real
MannaFlow site to configure/enroll nurture campaigns and see Retell call-log
analytics; each client can log into its own org; the admin sees all orgs with
each record clearly labeled by organization.** Priority is a working product to
iterate on, not maximal environment ceremony. Decisions recorded in
[`adr/0001`](adr/0001-single-supabase-project-no-staging-tier.md) and
[`adr/0002`](adr/0002-retell-call-log-ingestion.md).

### Organizations (seed)

- **MannaFlow Internal** (INTERNAL) — MannaFlow's own workspace.
- **True North Comfort** (CLIENT) — owns Maddie main line, `agent_0ed9…`,
  +1 289-670-0227.
- **Sleep Nation** (CLIENT) — owns Luna, `agent_0684…`, +1 289-670-3124.
- **MannaFlow Website Demo** (INTERNAL) — owns the public "Talk to Maddie" web
  demo agent, `agent_b1b8…`; MannaFlow admins only.

Replaces the generic "Client Demo" org. Each org carries `retell_agent_id`.

### This iteration — SHIPPED 2026-08-05

Live on **https://mannaflow.io** (production domain; the `*.vercel.app` alias
serves a stale CDN cache — ignore it when verifying). All backend paths verified
against the single Supabase project `ncyffjajttlxkjiihbvr`.

- Committed + pushed; `main` deploys production. Cron emptied (see memory /
  ADR-0001 rationale) pending the phase-"b" engine port.
- Four orgs + three admin logins seeded (`admin@mannaflow.com` = MannaFlow admin;
  `truenorth@` / `sleepnation@` = client admins).
- Retell call-log analytics built and **backfilled: 73 calls** ingested and
  org-attributed (unmapped agents skipped). Calls list + tiles render; admin
  sees the org column.
- **Two deploy gotchas hit and fixed** (both worth remembering):
  1. `NEXT_PUBLIC_*` vars only inline on a *fresh* build — a cache-reusing
     redeploy served empty values. Forced a clean rebuild by touching
     `lib/supabase/browser.ts`.
  2. The site **CSP `connect-src`** blocked the browser from reaching Supabase
     (login failed silently with "Failed to fetch"). Fixed in `next.config.ts`
     by adding `https://*.supabase.co wss://*.supabase.co`.

Remaining to fully close this iteration:

- **Configure the real-time Retell webhook.** The endpoint exists
  (`/api/retell/webhook`, HMAC-verified) but is not yet wired in the Retell
  dashboard. Set each agent's (or the account) webhook URL to
  `https://mannaflow.io/api/retell/webhook`, then place a test call and confirm
  it appears without re-running the backfill. Backfill remains the catch-up
  path; the webhook is go-forward.
- **Verify tenant isolation as a client.** Log in as `truenorth@` and
  `sleepnation@` and confirm each sees only its own calls and no org column.

Original task list (all done):

1. Review, commit, and push the uncommitted Supabase work on `staging`.
2. **Deploy on the real MannaFlow site against the single existing Supabase
   project** (per ADR-0001 — no separate staging tier yet). Confirm the three
   Supabase vars plus `RETELL_API_KEY` are set. Verify tenant isolation on the
   deployed URL: each client sees only its own org; the admin sees all with a
   visible organization label on every list.
3. Seed the four organizations above and their admin accounts.
4. Build **Retell call-log analytics** (per ADR-0002): additive migration adding
   `organizations.retell_agent_id`; a shared `agent_id → org` upsert mapper; a
   re-runnable **backfill** of all existing calls; a real-time **`call_analyzed`
   webhook**; a call-log **list view** (time, caller, direction, duration,
   outcome, sentiment, one-line summary, recording link) with an org column for
   admins, plus a few summary tiles. Per-call transcript detail and trend charts
   are explicitly later.

### Next iteration ("b")

5. Port the campaign engine (`lib/campaigns.ts`, `app/api/cron/campaigns`) and
   the Twilio inbound webhook off Prisma to a service-role Supabase design that
   resolves an organization before every write, enabling **live** campaign
   sending. Add the real-time Retell webhook's production config here if not
   already live. **Then restore the hourly cron in `vercel.json`** — it was
   emptied (`"crons": []`) for the dashboard/Retell deploy so the still-Prisma
   send engine could not auto-fire on production. Do not restore it until the
   engine is Supabase-native and live sends are intended.
6. In a separate reviewed removal, retire Prisma, NextAuth, Docker, Neon, and
   the local fallback once the Supabase path is stable.
7. On the **first real client with real customer data**, stand up a separate
   production Supabase project and promote to it (per ADR-0001); keep the
   current project fictional/demo-only until then.

# Dashboard development handoff

## Current state

The `website-sign-in` branch adds a password-protected CONTRACTOR dashboard with
leads, campaigns, and analytics. It uses NextAuth credentials authentication,
Prisma, and PostgreSQL.

The dashboard is designed to run locally against a disposable database. It is
not currently connected to a shared or production database in this checkout.

### Implementation status

- Local multi-tenant access control is implemented and migrated. The Docker
  database contains fictional data only.
- Local accounts: `dev@local.test` / `localdev123` (internal admin) and
  `client-demo@local.test` / `clientdemo123` (Client Demo admin).
- Server-side scopes protect dashboard pages, lead/campaign APIs, analytics,
  campaign assignment/overrides, and Twilio inbound lead creation.
- Browser authorization coverage is in `tests/authorization.spec.ts`; run it
  with `npm run test:e2e` after seeding local data.
- Staging and production have not been configured or validated. Do not invite
  clients to a deployed dashboard until the staging checks below pass.

## Local development setup

Docker Desktop is the intended local PostgreSQL runtime. Once Docker is
installed and running, use the following from the repository root:

```bash
cp .env.example .env
docker-compose up -d
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Then visit `http://localhost:3000/login` and use a local-only seeded account:

| Role | Email | Password |
| --- | --- | --- |
| Internal admin | `dev@local.test` | `localdev123` |
| Client Demo admin | `client-demo@local.test` | `clientdemo123` |

Run the browser authorization check with:

```bash
npm run test:e2e
```

For a pre-migration local database created with `prisma db push`, baseline the
existing dashboard schema once before deploying the organization migration:

```bash
npx prisma migrate resolve --applied 20260726000000_init
npx prisma migrate deploy
```

`npm run db:seed` is safe to repeat. To create or reset another local account:

```bash
SEED_EMAIL=someone@local.test SEED_PASSWORD=choose-a-local-password node scripts/seed-tech.mjs
```

Stop the local database with `docker-compose down`. Use
`docker-compose down -v` only when intentionally deleting all local demo data.

## Environment rules

Keep these environments separate:

| Environment | Purpose | Data |
| --- | --- | --- |
| Local | Individual development | Seeded fictional data only |
| Staging | Shared QA, demos, and migration testing | Test data only |
| Production | Real client use | Real client data only |

Never use production credentials or copy production client data into local
development. Each environment needs its own database, deployment, and auth
secrets.

## Multi-tenant architecture (implemented locally)

The local implementation provides:

1. `ContractorOrganization` and roles: `INTERNAL_ADMIN`, `CLIENT_ADMIN`, and
   `CLIENT_MEMBER`.
2. Required organization ownership on users, leads, campaigns, conversations,
   activities, follow-up jobs, and campaign assignments.
3. Server-side role and organization resolution on every dashboard/API request.
4. Twilio inbound number-to-organization mapping; unknown numbers never create
   unscoped leads.
5. Internal/client workspace identification in the dashboard layout.

The core security rule: a client user must never be able to retrieve another
organization's data, even by changing a URL or calling an API directly.

## Production-access checklist

The implementation below is complete locally. Before production access, review
it as one atomic change and validate it in staging.

1. Add `ContractorOrganization` and user roles: `INTERNAL_ADMIN`, `CLIENT_ADMIN`,
   and `CLIENT_MEMBER`.
2. Add a required organization relation to users, leads, and campaigns.
3. Resolve the signed-in user's role and organization server-side on every
   dashboard/API request. Internal admins may access all organizations; client
   roles may access only their own.
4. Apply that scope to every dashboard page, lead detail page, API route,
   campaign assignment/override route, analytics query, and campaign-engine
   query. An ID alone must never authorize a read or update.
5. Update Twilio inbound voice/SMS handling so the inbound number maps to an
   organization before a lead is created or updated. Never create an unscoped
   lead.
6. Update seeds with `MannaFlow Internal` and `Client Demo` organizations,
   separate fictional data, and separate accounts.
7. Create a reviewed Prisma migration. Use `prisma migrate deploy` in staging
   and production; do not use `prisma db push` for production migrations.
8. Run authorization tests proving client-demo cannot read, edit, enroll, or
   infer internal data through pages or APIs.

### Acceptance checks

- An internal admin can see both organizations' data.
- A client-demo user sees only Client Demo data across Overview, Leads,
  Campaigns, Analytics, lead details, and APIs.
- A client-demo user receives `404` or `403` for internal record IDs and cannot
  modify them.
- Every new lead and campaign belongs to an organization.

## Vercel handoff

After the checklist is complete:

1. Create staging with a separate managed Postgres database.
2. Add staging `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, and a unique
   `NEXTAUTH_SECRET`.
3. Apply the migration, create staging-only accounts, and run all acceptance
   checks.
4. Create a separate production database and production secrets—never reuse
   local/staging credentials or the local demo password.
5. Apply the migration, create the first internal admin, deploy `main`, then
   verify sign-in before inviting clients.

## Delivery sequence

1. Use the Docker-backed local setup and run `npm run test:e2e`.
2. Create a staging environment and separate test database.
3. Run `prisma migrate deploy`, create staging-only accounts, and repeat every
   acceptance check in staging.
4. Deploy production only after staging validates each change.

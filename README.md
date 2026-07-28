# MannaFlow marketing site

Marketing site for MannaFlow — lead capture, follow-up, and voice-AI demos for contractors — plus a sign-in contractor dashboard (lead pipeline, campaigns, analytics).

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript · Prisma/Postgres · NextAuth · Resend · Retell · Twilio · Anthropic.

## Getting started (marketing site only, no dashboard)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `npm run build` — production build / full typecheck
- `npm run lint` — ESLint

## Run locally (with the dashboard)

The dashboard (`/dashboard/*`, `/login`) needs a Postgres database and a seeded account. This spins up a local, disposable Postgres via Docker — it does **not** touch any shared/production database.

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file — the defaults already point at the local
#    Postgres container below, so no manual edits are needed just to preview
#    the dashboard. Use `.env` (not `.env.local`) — the Prisma CLI only
#    auto-loads `.env`, and Next.js reads both, so `.env` works for everything.
cp .env.example .env

# 3. Start local Postgres (creates the `contractor` schema automatically)
docker-compose up -d

# 4. Apply reviewed Prisma migrations
npx prisma migrate deploy

# 5. Seed a dashboard login + realistic sample leads/campaigns/activity
npm run db:seed

# 6. Start the app
npm run dev
```

The local seed creates `dev@local.test` / `localdev123` (internal admin) and
`client-demo@local.test` / `clientdemo123` (Client Demo admin). Run
`npm run test:e2e` to verify local cross-tenant access controls.

Open [http://localhost:3000/login](http://localhost:3000/login) and sign in with:

| | |
|---|---|
| Email | `dev@local.test` |
| Password | `localdev123` |

This is a **local-only, throwaway account** created by `scripts/seed-local.mjs` in your local database — it has nothing to do with any deployed/production login. `npm run db:seed` is safe to re-run any time (creates/updates the account and sample data; doesn't duplicate it).

**Resetting the local password, or creating another local account:**

```bash
SEED_EMAIL=someone@local.test SEED_PASSWORD=whateveryouwant node scripts/seed-tech.mjs
```

This upserts an `ContractorTechUser` by email — re-running with an existing email just updates its password.

**Stopping/cleaning up the local database:**

```bash
docker-compose down        # stop the container, keep data
docker-compose down -v     # stop and delete all local data
```

Everything outside Twilio/Anthropic/Gmail/Resend/cron works with just the database configured — see the "OPTIONAL" section in `.env.example` for what each of those unlocks and how to set them up if you need real SMS/voice/email/chatbot behavior locally.

## Where things live

See [AGENTS.md](AGENTS.md) for the full map: routes, section/component names, the styling system, and the **mobile/desktop editing rules** (mobile <768px is the reference visual — read Rule #1 before changing any layout or CSS).

Secrets go in `.env.local`; never commit it.

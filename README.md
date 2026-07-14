# MannaFlow marketing site

Marketing site for MannaFlow — lead capture, follow-up, and voice-AI demos for contractors.

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript · Resend · Retell.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `npm run build` — production build / full typecheck
- `npm run lint` — ESLint

## Where things live

See [AGENTS.md](AGENTS.md) for the full map: routes, section/component names, the styling system, and the **mobile/desktop editing rules** (mobile <768px is the reference visual — read Rule #1 before changing any layout or CSS).

Secrets go in `.env.local` (Resend + Retell keys); never commit it.

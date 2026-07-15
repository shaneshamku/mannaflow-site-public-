# Campaign email/SMS engine

Built 2026-07-15. This document explains what exists, why it was built this
way, what decisions were made (and by whom — user vs. agent judgment call),
and what's still missing. Read this before touching `lib/campaigns.ts`,
`scripts/seed-campaigns.mjs`, or `app/api/cron/campaigns/`.

## Why this exists

The Campaigns tab (`/dashboard/campaigns`) previously let you view the four
nurture paths from `campaign information.md` and assign leads to them, but
assignment did nothing — no message ever actually sent. This pass makes
assignment *mean something*: once a lead is assigned to a campaign, a daily
cron job walks their sequence and sends the due SMS/email touches
automatically, using Gmail SMTP for email (see "Sender identity" below —
this was originally built on Resend, then switched) and the existing
Twilio integration for SMS.

Source of truth for the *content and cadence* of each campaign is
`campaign information.md` (repo root) — Master Cadence table + the four
Path A–D tables. `scripts/seed-campaigns.mjs` is the machine-readable
translation of that doc into actual send templates. If the marketing/ops
side changes the doc, **update the seed script and re-run it** — the doc
itself is not read at runtime.

## Decisions made with the user (2026-07-15 conversation)

These were explicitly asked and answered — don't silently change them
without checking in again:

1. **Scope**: automate both Email and SMS (Twilio) steps in the
   same engine, not just email. Voice-callback steps (Path B day 7) are
   *not* automated — the engine sends the accompanying SMS and creates an
   internal alert (activity log NOTE + email to `TECH_EMAIL`) telling a
   human to make the call. No outbound-calling automation was built.
2. **Stop condition**: once a lead's `HvacLead.currentStage` reaches
   `JOB_BOOKED`, `JOB_COMPLETE`, `INVOICE_SENT`, or `PAID`, their campaign
   assignment is marked `STOPPED` and no further steps send. Chosen over
   "only stop at PAID" or "never stop" — the reasoning was that once
   someone's booked, further "still thinking about booking?" style nurture
   is irrelevant/off-putting.
3. **Sender identity** (revised after initial build):
   - First pass: customer-facing nurture emails sent **From**
     `noreply@mannaflow.ca` via Resend (same domain used for the existing
     escalation-alert email). The user then explicitly asked for campaign
     emails to send **from `mannaflow.io@gmail.com`**.
   - That's not achievable through Resend — Resend requires the From
     domain to be DNS-verified, and nobody can verify `gmail.com` (Google
     owns it); attempting to send `From: mannaflow.io@gmail.com` via
     Resend would fail or get flagged as spoofed. This was surfaced to the
     user directly, with two real options: (a) send via the Gmail account
     itself (SMTP/App Password or Gmail API), or (b) keep Resend with From
     on a verified domain and Reply-To set to the Gmail address. **The
     user chose (a).**
   - So campaign emails now send via **Gmail SMTP** (`lib/gmail.ts`, using
     `nodemailer`), authenticated as `mannaflow.io@gmail.com` with an App
     Password — not Resend. `lib/resend.ts` is now used **only** for the
     pre-existing lead-escalation alert email (unrelated to campaigns).
   - Requires `GMAIL_USER=mannaflow.io@gmail.com` and `GMAIL_APP_PASSWORD`
     (a 16-character App Password, **not** the account's login password)
     as env vars. Generating that password requires a human with access to
     the `mannaflow.io@gmail.com` Google Account to enable 2-Step
     Verification and create it at
     `https://myaccount.google.com/apppasswords` — an agent cannot do this
     step. Until `GMAIL_APP_PASSWORD` is set, `sendCampaignEmail()` no-ops
     and logs a warning instead of throwing (same defensive pattern as
     `lib/twilio.ts`'s missing-credentials handling) — campaign SMS steps
     still work, only the email half of each step is silently skipped.
   - `TECH_EMAIL` (used for internal alerts — lead escalations via Resend,
     and campaign manual-callback alerts) was separately changed to
     `mannaflow.io@gmail.com` per explicit instruction: *"reroute all
     alerts to mannaflow.io@gmail.com. this is the main email for all
     alerts and notifications."* Updated in both local `.env` and Vercel
     Production env vars. Note this is a different code path from the
     Gmail SMTP *sending* account above, even though it happens to be the
     same address — `TECH_EMAIL` is a **To** address read by
     `lib/resend.ts`, `GMAIL_USER`/`GMAIL_APP_PASSWORD` is the **From**
     account read by `lib/gmail.ts`.
   - Gmail's standard sending limits apply (roughly 500/day for a regular
     Gmail account) since this is a real inbox, not a transactional email
     service — fine for this campaign's expected volume, but worth knowing
     if lead volume grows a lot.
4. **Booking link**: no Cal.com integration exists yet. Every `{{link}}`
   token in campaign copy resolves to the `BOOKING_LINK` env var, which is
   currently set to `https://mannaflow-site.vercel.app/book-demo` (the
   site's existing "Book a Call" page) as a working placeholder. **When
   Cal.com is set up, just update `BOOKING_LINK` in Vercel — no code
   changes needed**, every campaign email/SMS picks up the new link
   automatically on the next send.

## Data model

Added to `prisma/schema.prisma`:

- `HvacCampaign.steps` (`Json`) — already existed; each element is now a
  richer object (see "Step shape" below) instead of just display copy.
- `HvacCampaignLeadStatus` enum: `ACTIVE | STOPPED | COMPLETED`.
- `HvacCampaignLead.status` — defaults `ACTIVE`; flips to `STOPPED` (stage
  gate) or `COMPLETED` (ran out of steps).
- `HvacCampaignLead.lastStepIndexSent` — `Int`, default `-1`. This is the
  idempotency mechanism: the cron only ever looks at steps with index
  `> lastStepIndexSent`. A step counts as "processed" whether it was
  actually sent or deliberately skipped (see skip conditions below) — both
  advance the cursor so the engine never re-evaluates a step twice.
- `HvacCampaignLead.stoppedReason` — free text, set when `status` becomes
  `STOPPED` (currently only "Lead reached stage X").

No new table was added for send history — sends are logged into the
existing `HvacActivityLog` table (`type: SMS | EMAIL | NOTE`), prefixed
with `[Campaign Name]` in the content field, so they show up alongside a
lead's other activity. (Note: the Leads-tab UI no longer *displays* the
activity log panel per a separate, earlier request — the data is still
being written, just not shown there currently.)

## Step shape (`lib/campaigns.ts` → `CampaignStep`)

```ts
{
  day: number,              // days after assignedAt this step becomes due.
                             // Fractional (0.5) = same-day second touch.
  channel: string,          // human-readable, for display only (Campaigns UI)
  intent: string,           // human-readable, for display only
  sampleCopy?: string,      // original doc excerpt, for display only
  sendSms?: boolean,        // does this step dispatch an SMS
  sendEmail?: boolean,      // does this step dispatch an email
  smsBody?: string,         // merge-tag template, sent verbatim via Twilio
  emailSubject?: string,    // merge-tag template
  emailBody?: string,       // merge-tag template, sent as plain text via Gmail SMTP
  skipIfReplied?: boolean,  // skip if lead sent an inbound SMS since assignedAt
  onlyIfUrgency?: string[], // skip unless lead.urgencyLevel is in this list
  needsManualCallback?: boolean, // log + alert TECH_EMAIL; does not auto-call
}
```

Merge tokens resolved by `resolveMergeTags()`: `{{name}}` (falls back to
"there"), `{{issue}}` (falls back to "your HVAC system"), `{{link}}`
(→ `BOOKING_LINK` env var). There is no `{{company}}` token — "MannaFlow
HVAC" is hardcoded in the copy, matching how the existing missed-call SMS
in `app/api/twilio/voice/route.ts` already hardcodes it.

## How the doc's "Channel" column was translated into flags

The source doc's Channel column is free text ("SMS + Email", "Voice
callback (human or outbound Retell) + SMS", "Email only (SMS only if phone
captured via chat/form)", "Email + SMS if engaged (opened/clicked prior
emails)"). These don't map 1:1 onto booleans, so here's the interpretation
baked into `scripts/seed-campaigns.mjs` — **these are agent judgment
calls, not things the user explicitly signed off on line by line:**

- Plain "SMS" / "Email" / "SMS + Email" → mapped directly.
- Path B day 7 "Voice callback... + SMS" → `sendSms: true` +
  `needsManualCallback: true`. The voice call itself is not automated
  (no Retell outbound-calling wiring exists for this flow).
- Path D day 1 "Email only (SMS only if phone captured via chat/form)" →
  `sendEmail: true, sendSms: false`. Our `HvacLead.phone` is a required,
  unique field (every lead has one), so the doc's phone-conditional nuance
  doesn't map cleanly onto our schema. Defaulted to the doc's primary
  instruction ("Email only") rather than sending SMS to every Path D lead.
- Path D day 7 "Email + SMS if engaged (opened/clicked prior emails)" →
  `sendEmail: true, sendSms: false`. We do not currently track email
  open/click events at all — and since campaign email now sends via plain
  Gmail SMTP rather than a transactional provider, there's no built-in
  webhook to get that data from even if we wanted it (would need to add
  tracking pixels/link-wrapping ourselves). Defaulted to email-only until
  that tracking exists — **known gap**, see below.
- The doc's `[X] homes helped` / `[city]`-specific stats and
  neighbourhood-reference lines were **rewritten to remove the specific
  numbers/city claims** (e.g. "We've helped [X] homes in [city] this
  month" → "We've been keeping busy helping homes in the area") since
  there's no data source for real numbers. Replace with real stats before
  this copy is customer-facing if that matters to you.

## Skip conditions actually implemented

Only the two conditions the source doc explicitly calls out were encoded —
no broader "skip everything if they ever reply" rule was invented, because
later steps (day 3+) are educational/proof content the doc clearly intends
to send regardless of earlier replies:

- **`skipIfReplied`** (Path A step 2 / day 0.5, Path B step 2 / day 0.5):
  skipped if the lead has any inbound chat message (`HvacChatMessage` with
  `role: USER`) timestamped after `assignedAt`.
- **`onlyIfUrgency`** (Path B step 2 / day 0.5): skipped unless
  `lead.urgencyLevel` is `URGENT` or `EMERGENCY`, per the doc's "Second
  nudge only if urgency_level = high."

Both conditions are checked in `processCampaignAssignment()` before a step
sends; a skipped step still advances `lastStepIndexSent` (logged in the
cron's JSON response as `action: "skipped"` with a `reason`).

## Same-day steps and cron frequency — a known compromise

Path A and B each have two "day 0" touches (an immediate one, and a
"same evening, if no reply" one). To represent that without adding a
separate scheduling concept, the evening touch uses `day: 0.5` (12 hours)
instead of `day: 0`.

**However**, the cron (`vercel.json` → `/api/cron/campaigns`) currently
runs **once daily** (`0 15 * * *`, right after the existing follow-up
cron), matching the plan-tier assumption used for the pre-existing
follow-up cron. With a once-daily cron, a lead assigned in the morning
will likely get *both* day-0 touches sent back-to-back on the next run
rather than genuinely spaced by "the same evening." This is a **known,
accepted simplification** — if/when the Vercel plan supports more frequent
cron invocations, add a second `crons` entry in `vercel.json` pointing at
the same path and the spacing will start working correctly with zero code
changes (the engine is already frequency-agnostic and idempotent).

## Stop condition

`STOP_STAGES = ["JOB_BOOKED", "JOB_COMPLETE", "INVOICE_SENT", "PAID"]` in
`lib/campaigns.ts`. Checked first, before any step processing — if the
lead's current stage is in this list, the assignment is immediately marked
`STOPPED` with a reason, and no steps are evaluated that run.

## Idempotency / catch-up behavior

Each cron run re-queries all `HvacCampaignLead` rows with `status: ACTIVE`
and, for each, processes **every currently-due step it hasn't processed
yet** (not just the next one) — so if the cron doesn't run for a few days
for any reason, leads catch up correctly on the next run rather than
permanently missing steps or getting stuck.

## Testing

`GET /api/cron/campaigns?dryRun=1` (with `Authorization: Bearer
$CRON_SECRET`) computes and returns exactly what *would* happen — which
steps are due, which channels would fire, which are skipped and why —
without sending anything or writing to the database. Used to verify the
engine end-to-end this session with four synthetic leads (normal path,
urgency-gated skip, reply-gated skip, stop-on-booked) covering every branch
in `processCampaignAssignment()`; all four confirmed correct before this
was wired into the real cron schedule. No real SMS/email sends were
triggered during testing — verification was dry-run only, to avoid
spending real Twilio/Gmail sends on synthetic test leads.

## Known gaps / explicitly not built this pass

- **No automatic campaign assignment.** The source doc implies leads
  should land on a path automatically based on their journey (missed
  call → Path A, engaged-no-booking → Path B, etc.). That auto-routing
  was **not built** — assignment is still manual, via the Campaigns tab
  checkbox UI built in an earlier pass. Only asked-for scope (the
  send engine) was built this session.
- **No Cal.com integration.** `BOOKING_LINK` is a placeholder env var
  pointing at `/book-demo`. See "Booking link" decision above.
- **No email open/click tracking.** Path D's "if engaged" condition can't
  be evaluated; that step defaults to always-email. Gmail SMTP has no
  built-in equivalent to a transactional provider's open/click webhooks —
  would need to add tracking pixels/link-wrapping manually to get this
  data at all.
- **`GMAIL_APP_PASSWORD` must be set by a human, not this agent.** Until
  someone with access to the `mannaflow.io@gmail.com` Google Account
  enables 2-Step Verification and generates an App Password, campaign
  emails no-op (logged via `console.error`, not surfaced anywhere visible
  in the UI) — SMS steps still send fine. See "Sender identity" above.
- **No unsubscribe/opt-out handling.** The source doc mentions rolling
  non-converters into a "general seasonal content list" and implies
  opt-in/opt-out semantics ("Ongoing (monthly, opt-in only)"). None of
  that list logic, or an unsubscribe link/mechanism, was built.
- **Failure handling is retry-by-accident, with a stuck-assignment risk.**
  `lastStepIndexSent` is only updated *after* a step's sends succeed, so if
  `sendSMS`/`sendCampaignEmail` throws, that step's cursor never advances —
  the whole assignment throws, is caught in
  `processAllActiveCampaignAssignments`'s per-assignment try/catch (so one
  bad lead doesn't block others), and is logged via `console.error` only
  (no operator-visible alert). The *next* cron run will retry that same
  step from scratch. This means a persistently-failing step (e.g. bad
  phone number, `GMAIL_APP_PASSWORD` not set) will retry forever and block
  every later step in that lead's sequence from ever being evaluated —
  there's no dead-letter queue, backoff, or "skip after N failures."

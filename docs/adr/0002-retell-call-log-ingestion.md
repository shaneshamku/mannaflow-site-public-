# Retell call logs: dual ingestion (webhook + backfill), org-resolved by agent

**Status:** accepted (2026-08-05)

Retell voice calls become `call_logs` rows through **two paths sharing one
mapper**: a real-time **`call_analyzed` webhook** for go-forward calls, and a
re-runnable **backfill** that pulls Retell's `list-calls` API for everything to
date. Both are idempotent on `provider_call_id` and both resolve the owning
organization by **`agent_id`** (falling back to the call's `to_number`).

**Why webhook + backfill:** the dozen existing calls already happened, so a
webhook alone cannot show them; backfill alone cannot show calls in real time.
They share the same org-resolution + upsert logic, so building both is modest
incremental work over either one.

**Why `agent_id` resolution:** `agent_id` is present on every call (phone *and*
web) and is stable. The `agent_id → organization` mapping is stored as a nullable
`retell_agent_id` column on `organizations` (one agent per org today):
Maddie main line → True North Comfort, Luna → Sleep Nation, Maddie website demo
→ MannaFlow Website Demo. A call whose `agent_id` maps to **no** organization is
**skipped**, never written as an unscoped log — mirroring the existing "never
create an unscoped lead" rule.

**Consequences:** both ingestion paths run with **no signed-in user**, so they
use the server-only **service-role** Supabase client (which bypasses RLS) and
must resolve the organization themselves before every write. The service-role
key is confined to these server-side paths and the existing provisioning path —
never used for ordinary dashboard requests. This is the same session-less
server-to-server pattern the live campaign engine will also require.

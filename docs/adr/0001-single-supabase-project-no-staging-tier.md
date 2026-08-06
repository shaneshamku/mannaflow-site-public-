# One Supabase project, no separate staging tier, until the first real client

**Status:** accepted (2026-08-05)

The dashboard runs against a **single Supabase project** and is deployed on the
**real mannaflow site**, not a separate staging environment — deliberately
contradicting the staging-first guidance in
[`SUPABASE_DASHBOARD_ARCHITECTURE.md`](../SUPABASE_DASHBOARD_ARCHITECTURE.md)
and [`DASHBOARD_DEVELOPMENT.md`](../DASHBOARD_DEVELOPMENT.md).

**Why:** the purpose of an environment firewall is to keep real client PII away
from test data and test credentials. Right now every organization is fictional
(True North Comfort) or a demo (Sleep Nation, MannaFlow Website Demo), so that
rationale does not yet apply. A separate staging tier would be *more* setup, not
less, and the goal is a working product to iterate on. The highest-value data —
Retell call logs — lives in Retell (the source of truth) and can be re-backfilled
at any time, so even a bad migration against the only database is recoverable.

**The standing constraint this trades for:** the project's data stays
fictional/demo-only. The moment a real paying client with real customer data is
onboarded, stand up a **separate production Supabase project** and promote to it;
do not add real customer data to the current project. (The current project is
named `mannaflow-staging`; that name is now cosmetic.)

**Considered and rejected:** the documented two/three-tier split
(local → staging → production). Rejected as premature for a pre-client product;
revisit at first real client.

# MannaFlow Dashboard

The multi-tenant client dashboard MannaFlow's staff and clients use to run
lead nurture campaigns and review AI voice-receptionist call activity. Backed
by Supabase (Auth + Postgres with Row-Level Security enforcing org isolation).

## Language

### Tenancy

**Organization**:
The single owner of every business record (leads, campaigns, call logs, etc.).
Either the internal MannaFlow workspace or one client. Isolation is enforced in
the database by RLS, not only in route code.
_Avoid_: Account, tenant, company, workspace

**MannaFlow admin** (`MANNAFLOW_ADMIN`):
An internal MannaFlow user who can see every organization plus MannaFlow's own
internal workspace. In cross-org views, each record must show which
organization it belongs to.
_Avoid_: Internal admin, superadmin

**Client admin** (`CLIENT_ADMIN`):
A user assigned to exactly one client organization; sees only that org's data.
_Avoid_: Customer, user, tenant admin

**Client member** (`CLIENT_MEMBER`):
Reserved for a future phase. Clients cannot yet invite or manage their own
staff — only a MannaFlow admin provisions accounts.

### Records

**Lead**:
A prospective customer belonging to one organization, moving through pipeline
stages. Keyed within an org by phone.

**Campaign**:
An ordered sequence of nurture steps (SMS/email) an organization sends to
enrolled leads. Steps are stored as absolute `day` offsets; the UI edits them
as intervals.
_Avoid_: Sequence, drip, flow

**Campaign assignment**:
The enrollment of one lead into one campaign, tracking how far through the steps
that lead has progressed (`campaign_leads`).
_Avoid_: Enrollment record, membership

**Call log**:
A record of one Retell voice call attributed to an organization. Sourced from
Retell (the dozen existing calls + future calls), never accepted without an
organization. Call-specific fields Retell returns per agent (outcome, sentiment,
booking status) live in a `metadata` JSON column.
_Avoid_: Call record, conversation, transcript

### Voice

**Agent**:
A Retell voice agent belonging to one organization. An organization is resolved
for a call by its `agent_id` (falling back to the call's `to_number`). A call
whose `agent_id` maps to no organization is skipped, never logged unscoped.
Known agents: **Maddie main line** → True North Comfort, **Luna** → Sleep
Nation, **Maddie website demo** (no-transfer) → MannaFlow Website Demo.

**True North Comfort** / **Sleep Nation**:
The two real client organizations mirrored from the live Retell phone agents,
used as the working multi-tenant demo. Replace the generic earlier "Client
Demo" org.

**MannaFlow Website Demo**:
An internal-owned organization that collects calls from the public "Talk to
Maddie" website demo agent, so MannaFlow can track how prospects test the site.
Only MannaFlow admins see it.

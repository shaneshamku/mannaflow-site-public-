-- Retell call source: attribute Retell voice calls to an organization.
-- Additive migration — apply after 20260727150000_dashboard_foundation.sql.
-- See docs/adr/0002-retell-call-log-ingestion.md.

-- One Retell agent maps to one organization. Calls are resolved to an org by
-- this agent_id; a call whose agent maps to no org is skipped, never logged
-- unscoped. Null means the org has no Retell agent (e.g. MannaFlow Internal).
alter table public.organizations
  add column if not exists retell_agent_id text unique;

comment on column public.organizations.retell_agent_id is
  'Retell agent_id whose calls belong to this organization. Null = no agent.';

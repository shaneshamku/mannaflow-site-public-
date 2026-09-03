-- Owner SMS notifications: text an organization's designated phone after
-- each analyzed Retell call, summarizing who called and what happened.
-- Additive migration — apply after 20260805120000_retell_call_source.sql.

alter table public.organizations
  add column if not exists owner_notify_phone text;

comment on column public.organizations.owner_notify_phone is
  'E.164 phone number to SMS after each call_analyzed webhook for this org. Null = no notification sent.';

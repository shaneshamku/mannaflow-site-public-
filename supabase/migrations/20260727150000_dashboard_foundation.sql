-- MannaFlow dashboard foundation
-- Apply this only to the empty Supabase staging project. It intentionally
-- creates no public sign-up path: MannaFlow provisions client accounts.

create extension if not exists pgcrypto;

create type public.dashboard_role as enum (
  'MANNAFLOW_ADMIN',
  'CLIENT_ADMIN',
  'CLIENT_MEMBER'
);

create type public.organization_kind as enum ('INTERNAL', 'CLIENT');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  kind public.organization_kind not null default 'CLIENT',
  inbound_phone text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.dashboard_role not null default 'CLIENT_MEMBER',
  organization_id uuid references public.organizations(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint client_users_require_an_organization check (
    role = 'MANNAFLOW_ADMIN' or organization_id is not null
  )
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text,
  phone text not null,
  email text,
  address text,
  issue_description text,
  service_type text,
  urgency_level text,
  lead_source text not null default 'Unknown',
  notes text,
  current_stage text not null default 'NEW_LEAD',
  date_entered_stage timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, phone)
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  path text,
  description text,
  status text not null default 'ACTIVE',
  steps jsonb not null default '[]'::jsonb,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, path)
);

create table public.campaign_leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  status text not null default 'ACTIVE',
  last_step_index_sent integer not null default -1,
  stopped_reason text,
  step_overrides jsonb,
  unique (campaign_id, lead_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid references public.leads(id) on delete cascade,
  type text not null,
  direction text,
  content text not null,
  occurred_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete cascade,
  role text not null,
  content text not null,
  escalated boolean not null default false,
  occurred_at timestamptz not null default now()
);

-- Retell records will be inserted through a server-side webhook. A record is
-- never accepted without an organization_id.
create table public.call_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  lead_id uuid references public.leads(id) on delete set null,
  provider text not null default 'retell',
  provider_call_id text not null unique,
  direction text,
  from_phone text,
  to_phone text,
  status text,
  duration_seconds integer,
  recording_url text,
  transcript text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index leads_organization_id_idx on public.leads(organization_id);
create index campaigns_organization_id_idx on public.campaigns(organization_id);
create index campaign_leads_organization_id_idx on public.campaign_leads(organization_id);
create index activities_organization_id_idx on public.activities(organization_id);
create index messages_organization_id_idx on public.messages(organization_id);
create index call_logs_organization_id_idx on public.call_logs(organization_id);
create index call_logs_lead_id_idx on public.call_logs(lead_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create trigger campaigns_set_updated_at
before update on public.campaigns
for each row execute function public.set_updated_at();

-- These helpers read the caller's own profile. They do not trust a browser-
-- supplied organization id.
create or replace function public.is_mannaflow_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'MANNAFLOW_ADMIN'
  );
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.can_access_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_mannaflow_admin()
      or target_organization_id = public.current_organization_id();
$$;

revoke all on function public.is_mannaflow_admin() from public;
revoke all on function public.current_organization_id() from public;
revoke all on function public.can_access_organization(uuid) from public;
grant execute on function public.is_mannaflow_admin() to authenticated;
grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.can_access_organization(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_leads enable row level security;
alter table public.activities enable row level security;
alter table public.messages enable row level security;
alter table public.call_logs enable row level security;

create policy "read assigned organization" on public.organizations
for select to authenticated
using (public.can_access_organization(id));

create policy "admins manage organizations" on public.organizations
for all to authenticated
using (public.is_mannaflow_admin())
with check (public.is_mannaflow_admin());

create policy "read own profile or all as admin" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_mannaflow_admin());

create policy "admins manage profiles" on public.profiles
for all to authenticated
using (public.is_mannaflow_admin())
with check (public.is_mannaflow_admin());

create policy "organization access" on public.leads
for all to authenticated
using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

create policy "organization access" on public.campaigns
for all to authenticated
using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

create policy "organization access" on public.campaign_leads
for all to authenticated
using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

create policy "organization access" on public.activities
for all to authenticated
using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

create policy "organization access" on public.messages
for all to authenticated
using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

create policy "organization access" on public.call_logs
for all to authenticated
using (public.can_access_organization(organization_id))
with check (public.can_access_organization(organization_id));

grant select, insert, update, delete on all tables in schema public to authenticated;

-- MannaFlow's own sales workspace. Client organizations are created later by
-- a MannaFlow admin through the server-side provisioning flow.
insert into public.organizations (name, kind)
values ('MannaFlow Internal', 'INTERNAL');

-- Adds multi-vertical support to organizations so different clients (e.g.
-- HVAC contractors vs. chiropractic clinics) can get their own chatbot
-- content without touching each other. See docs for the chatbot's per-
-- vertical prompt dispatch in lib/claude.ts.

alter table public.organizations add column vertical text not null default 'hvac';
alter table public.organizations add column booking_url text;

-- Defensive backfill for existing seeded HVAC clients (already covered by
-- the column default, but explicit so intent is clear in the migration).
update public.organizations set vertical = 'hvac' where name in ('True North Comfort', 'Sleep Nation');

-- New chiropractic client. inbound_phone and booking_url are left null —
-- the chatbot cannot go live for this org until a real Twilio number and a
-- real booking link (e.g. their Jane App URL) are set.
insert into public.organizations (name, kind, vertical)
values ('Union Health Network', 'CLIENT', 'chiropractic');

import { createClient } from "@supabase/supabase-js";

// Seeds the fictional multi-tenant demo: MannaFlow Internal + two real client
// orgs mirrored from the live Retell agents (True North Comfort ← Maddie,
// Sleep Nation ← Luna) + an internal MannaFlow Website Demo org that collects
// the public web-demo agent's calls. See docs/adr/0002-retell-call-log-ingestion.md.

if (process.env.SUPABASE_STAGING_SEED_CONFIRM !== "fictional") {
  throw new Error("Refusing to seed. Set SUPABASE_STAGING_SEED_CONFIRM=fictional.");
}
for (const name of [
  "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY",
  "SEED_INTERNAL_EMAIL", "SEED_INTERNAL_PASSWORD",
  "SEED_TNC_EMAIL", "SEED_TNC_PASSWORD",
  "SEED_SLEEP_EMAIL", "SEED_SLEEP_PASSWORD",
]) {
  if (!process.env[name]) throw new Error(`${name} is required.`);
}

const AGENTS = {
  trueNorth: "agent_0ed9183c55d6abd364beaf6eae", // Maddie main line
  sleepNation: "agent_06849d3ba3d503784b335f6203", // Luna
  websiteDemo: "agent_b1b806517cbced559abf8acba0", // Maddie website demo (no transfer)
};

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsertOrg(fields) {
  const { data, error } = await supabase
    .from("organizations")
    .upsert(fields, { onConflict: "name" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

const internal = await supabase.from("organizations").select("id").eq("kind", "INTERNAL").eq("name", "MannaFlow Internal").single();
if (internal.error) throw internal.error;
const internalId = internal.data.id;

const trueNorthId = await upsertOrg({ name: "True North Comfort", kind: "CLIENT", inbound_phone: "+12896700227", retell_agent_id: AGENTS.trueNorth });
const sleepNationId = await upsertOrg({ name: "Sleep Nation", kind: "CLIENT", inbound_phone: "+12896703124", retell_agent_id: AGENTS.sleepNation });
await upsertOrg({ name: "MannaFlow Website Demo", kind: "INTERNAL", retell_agent_id: AGENTS.websiteDemo });

async function createUser(email, password, role, organizationId) {
  const listed = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listed.error) throw listed.error;
  let user = listed.data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error) throw created.error;
    user = created.data.user;
  }
  const profile = await supabase.from("profiles").upsert({ id: user.id, email, role, organization_id: organizationId }, { onConflict: "id" });
  if (profile.error) throw profile.error;
}

await createUser(process.env.SEED_INTERNAL_EMAIL, process.env.SEED_INTERNAL_PASSWORD, "MANNAFLOW_ADMIN", internalId);
await createUser(process.env.SEED_TNC_EMAIL, process.env.SEED_TNC_PASSWORD, "CLIENT_ADMIN", trueNorthId);
await createUser(process.env.SEED_SLEEP_EMAIL, process.env.SEED_SLEEP_PASSWORD, "CLIENT_ADMIN", sleepNationId);

const leadRows = [
  { organization_id: trueNorthId, name: "True North QA Lead", phone: "+15550000001", lead_source: "Staging fixture", current_stage: "NEW_LEAD" },
  { organization_id: sleepNationId, name: "Sleep Nation QA Lead", phone: "+15550000002", lead_source: "Staging fixture", current_stage: "CONTACTED" },
];
const leads = await supabase.from("leads").upsert(leadRows, { onConflict: "organization_id,phone" }).select("id, organization_id");
if (leads.error) throw leads.error;

const campaign = await supabase.from("campaigns").upsert(
  { organization_id: trueNorthId, name: "True North follow-up", path: "fixture-follow-up", steps: [] },
  { onConflict: "organization_id,path" },
);
if (campaign.error) throw campaign.error;

console.log("Seeded MannaFlow Internal, True North Comfort, Sleep Nation, MannaFlow Website Demo (orgs + admins + fixtures).");
console.log("Retell call logs backfill via the dashboard 'Sync Retell calls' button or POST /api/admin/retell/backfill.");

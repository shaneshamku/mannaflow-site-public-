"use client";

import { useEffect, useMemo, useState } from "react";
import { HvacPipelineStage } from "@prisma/client";
import { getStage } from "@/lib/pipeline";
import { AddCampaignModal } from "./AddCampaignModal";
import { LeadOverrideModal } from "./LeadOverrideModal";
import { StepListEditor, EditableStep } from "./StepListEditor";

type CampaignStep = {
  day: number;
  channel: string;
  intent: string;
  sampleCopy?: string;
  sendSms?: boolean;
  sendEmail?: boolean;
  smsBody?: string;
  emailSubject?: string;
  emailBody?: string;
  skipIfReplied?: boolean;
  onlyIfUrgency?: string[];
  needsManualCallback?: boolean;
  sendTime?: string;
  intervalDays?: number;
};

type Campaign = {
  id: string;
  name: string;
  path: string | null;
  description: string | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  steps: CampaignStep[];
  timezone: string;
  createdAt: Date | string;
  _count: { leads: number };
};

// Canadian IANA timezones only, Toronto (Eastern — Ontario, our largest
// contractor base) first, then the rest grouped east-to-west by province.
const CANADIAN_TIMEZONES = [
  "America/Toronto",
  "America/Nipigon",
  "America/Thunder_Bay",
  "America/Iqaluit",
  "America/Halifax",
  "America/Moncton",
  "America/Glace_Bay",
  "America/Goose_Bay",
  "America/St_Johns",
  "America/Winnipeg",
  "America/Rainy_River",
  "America/Resolute",
  "America/Rankin_Inlet",
  "America/Regina",
  "America/Swift_Current",
  "America/Edmonton",
  "America/Cambridge_Bay",
  "America/Yellowknife",
  "America/Inuvik",
  "America/Dawson_Creek",
  "America/Fort_Nelson",
  "America/Creston",
  "America/Vancouver",
  "America/Whitehorse",
  "America/Dawson",
];

function getTimezoneOptions(): string[] {
  return CANADIAN_TIMEZONES;
}

type LeadSummary = {
  id: string;
  name: string | null;
  phone: string;
  currentStage: HvacPipelineStage;
};

type CampaignDetail = Campaign & {
  leads: { id: string; leadId: string; assignedAt: string; lead: LeadSummary; hasOverride?: boolean }[];
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-gray-100 text-gray-600",
};

export function CampaignsExplorer({
  initialCampaigns,
  allLeads,
}: {
  initialCampaigns: Campaign[];
  allLeads: LeadSummary[];
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [selectedId, setSelectedId] = useState<string | null>(initialCampaigns[0]?.id ?? null);
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [leadQuery, setLeadQuery] = useState("");
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [editingSteps, setEditingSteps] = useState(false);
  const [draftSteps, setDraftSteps] = useState<EditableStep[]>([]);
  const [draftTimezone, setDraftTimezone] = useState("UTC");
  const [savingSteps, setSavingSteps] = useState(false);
  const [customizingLead, setCustomizingLead] = useState<{ leadId: string; leadName: string } | null>(null);
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  async function refreshDetail(id: string) {
    setLoading(true);
    const res = await fetch(`/api/campaigns/${id}`);
    const data = await res.json();
    setDetail(data);
    setLoading(false);
  }

  useEffect(() => {
    if (!selectedId) return;
    refreshDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function startEditingSteps() {
    if (!detail) return;
    setDraftSteps(
      detail.steps.map((s) => ({
        intervalDays: s.intervalDays ?? 0,
        channel: s.channel,
        intent: s.intent,
        sampleCopy: s.sampleCopy,
        sendSms: s.sendSms,
        sendEmail: s.sendEmail,
        smsBody: s.smsBody,
        emailSubject: s.emailSubject,
        emailBody: s.emailBody,
        skipIfReplied: s.skipIfReplied,
        onlyIfUrgency: s.onlyIfUrgency,
        needsManualCallback: s.needsManualCallback,
        sendTime: s.sendTime,
      }))
    );
    setDraftTimezone(detail.timezone || "UTC");
    setEditingSteps(true);
  }

  async function saveSteps() {
    if (!selectedId) return;
    setSavingSteps(true);
    await fetch(`/api/campaigns/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps: draftSteps, timezone: draftTimezone }),
    });
    setSavingSteps(false);
    setEditingSteps(false);
    await refreshDetail(selectedId);
  }

  const assignedLeadIds = useMemo(() => new Set(detail?.leads.map((l) => l.leadId) ?? []), [detail]);

  const filteredLeads = useMemo(() => {
    const q = leadQuery.trim().toLowerCase();
    if (!q) return allLeads;
    return allLeads.filter(
      (l) => (l.name ?? "").toLowerCase().includes(q) || l.phone.toLowerCase().includes(q)
    );
  }, [allLeads, leadQuery]);

  async function toggleLead(leadId: string, assigned: boolean) {
    if (!selectedId) return;
    setPendingLeadId(leadId);
    if (assigned) {
      await fetch(`/api/campaigns/${selectedId}/leads?leadId=${leadId}`, { method: "DELETE" });
    } else {
      await fetch(`/api/campaigns/${selectedId}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
    }
    await refreshDetail(selectedId);
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, _count: { leads: c._count.leads + (assigned ? -1 : 1) } }
          : c
      )
    );
    setPendingLeadId(null);
  }

  function onCreated(campaign: Campaign) {
    setCampaigns((prev) => [...prev, campaign]);
    setSelectedId(campaign.id);
    setShowAdd(false);
  }

  return (
    <div className="h-full grid grid-cols-[280px_minmax(0,1fr)] gap-4 min-h-0">
      {/* Campaign list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-0 min-w-0">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Campaigns</p>
          <button onClick={() => setShowAdd(true)} className="text-orange-600 hover:text-orange-700 text-sm font-medium">
            + New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {campaigns.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">No campaigns yet.</p>
          ) : (
            campaigns.map((c) => {
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setEditingSteps(false);
                    setSelectedId(c.id);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                    active ? "bg-orange-50" : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                    <span className="text-[11px] text-gray-400">{c._count.leads} leads</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-y-auto min-h-0 min-w-0 p-6">
        {!detail || loading ? (
          <p className="text-sm text-gray-400">{loading ? "Loading…" : "Select a campaign."}</p>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">{detail.name}</h2>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[detail.status]}`}>
                  {detail.status}
                </span>
              </div>
              {detail.description && <p className="text-sm text-gray-500 mt-1.5">{detail.description}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sequence</h3>
                {!editingSteps && (
                  <button onClick={startEditingSteps} className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    Edit sequence
                  </button>
                )}
              </div>

              {editingSteps ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Timezone (used for every step&apos;s &ldquo;Send at&rdquo; time)
                    </label>
                    <select
                      value={draftTimezone}
                      onChange={(e) => setDraftTimezone(e.target.value)}
                      disabled={savingSteps}
                      className="input text-sm w-64"
                    >
                      {!timezoneOptions.includes(draftTimezone) && <option value={draftTimezone}>{draftTimezone}</option>}
                      {timezoneOptions.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <StepListEditor steps={draftSteps} onChange={setDraftSteps} disabled={savingSteps} />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingSteps(false)}
                      disabled={savingSteps}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="button" onClick={saveSteps} disabled={savingSteps} className="btn-primary">
                      {savingSteps ? "Saving…" : "Save sequence"}
                    </button>
                  </div>
                </div>
              ) : detail.steps.length > 0 ? (
                <div className="space-y-2">
                  {detail.steps.map((s, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-gray-900">
                          {i === 0 ? `${s.intervalDays ?? s.day} days after enrollment` : `+${s.intervalDays ?? 0} days`}
                        </span>
                        {s.sendTime && (
                          <>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-600">
                              {s.sendTime} ({detail.timezone})
                            </span>
                          </>
                        )}
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600">{s.channel}</span>
                      </div>
                      <p className="text-sm text-gray-900 mt-1">{s.intent}</p>
                      {s.sampleCopy && <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{s.sampleCopy}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No steps yet.</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Assign Leads ({detail.leads.length})
                </h3>
                <input
                  value={leadQuery}
                  onChange={(e) => setLeadQuery(e.target.value)}
                  placeholder="Search leads…"
                  className="input text-sm w-48"
                />
              </div>
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {filteredLeads.length === 0 ? (
                  <p className="text-sm text-gray-400 p-4">No leads found.</p>
                ) : (
                  filteredLeads.map((lead) => {
                    const assigned = assignedLeadIds.has(lead.id);
                    const stage = getStage(lead.currentStage);
                    const assignment = detail.leads.find((l) => l.leadId === lead.id);
                    return (
                      <div key={lead.id} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50">
                        <label className="flex items-center gap-3 min-w-0 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={assigned}
                            disabled={pendingLeadId === lead.id}
                            onChange={() => toggleLead(lead.id, assigned)}
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm text-gray-900 truncate">{lead.name ?? "Unknown"}</p>
                              {assignment?.hasOverride && (
                                <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600">
                                  Customized
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">{lead.phone}</p>
                          </div>
                        </label>
                        {assigned && (
                          <button
                            type="button"
                            onClick={() => setCustomizingLead({ leadId: lead.id, leadName: lead.name ?? lead.phone })}
                            className="shrink-0 text-orange-600 hover:text-orange-700 text-xs font-medium"
                          >
                            Customize
                          </button>
                        )}
                        <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${stage.bg} ${stage.color}`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAdd && <AddCampaignModal onClose={() => setShowAdd(false)} onCreated={onCreated} />}
      {customizingLead && selectedId && (
        <LeadOverrideModal
          campaignId={selectedId}
          leadId={customizingLead.leadId}
          leadName={customizingLead.leadName}
          onClose={() => setCustomizingLead(null)}
          onSaved={() => refreshDetail(selectedId)}
        />
      )}
    </div>
  );
}

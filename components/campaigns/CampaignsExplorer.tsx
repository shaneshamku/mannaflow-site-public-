"use client";

import { useEffect, useMemo, useState } from "react";
import { HvacPipelineStage } from "@prisma/client";
import { getStage } from "@/lib/pipeline";
import { AddCampaignModal } from "./AddCampaignModal";

type CampaignStep = {
  day: number;
  channel: string;
  intent: string;
  sampleCopy?: string;
};

type Campaign = {
  id: string;
  name: string;
  path: string | null;
  description: string | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  steps: CampaignStep[];
  createdAt: Date | string;
  _count: { leads: number };
};

type LeadSummary = {
  id: string;
  name: string | null;
  phone: string;
  currentStage: HvacPipelineStage;
};

type CampaignDetail = Campaign & {
  leads: { id: string; leadId: string; assignedAt: string; lead: LeadSummary }[];
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
                  onClick={() => setSelectedId(c.id)}
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

            {detail.steps.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sequence</h3>
                <div className="space-y-2">
                  {detail.steps.map((s, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-gray-900">Day {s.day}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600">{s.channel}</span>
                      </div>
                      <p className="text-sm text-gray-900 mt-1">{s.intent}</p>
                      {s.sampleCopy && <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{s.sampleCopy}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                    return (
                      <label
                        key={lead.id}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={assigned}
                            disabled={pendingLeadId === lead.id}
                            onChange={() => toggleLead(lead.id, assigned)}
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-900 truncate">{lead.name ?? "Unknown"}</p>
                            <p className="text-xs text-gray-400">{lead.phone}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${stage.bg} ${stage.color}`}>
                          {stage.label}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAdd && <AddCampaignModal onClose={() => setShowAdd(false)} onCreated={onCreated} />}
    </div>
  );
}

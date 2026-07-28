"use client";

import { useEffect, useMemo, useState } from "react";
import { ContractorPipelineStage } from "@prisma/client";
import { getStage, SERVICE_TYPE_LABELS, URGENCY_COLORS, URGENCY_LABELS } from "@/lib/pipeline";

type Lead = {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  issueDescription: string | null;
  serviceType: string | null;
  urgencyLevel: string | null;
  leadSource: string;
  notes: string | null;
  currentStage: ContractorPipelineStage;
  dateEnteredStage: Date | string;
  createdAt: Date | string;
};

type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  escalated: boolean;
  timestamp: Date | string;
};

type ActivityLog = {
  id: string;
  type: string;
  direction: string | null;
  content: string;
  timestamp: Date | string;
};

type LeadDetail = Lead & { chatMessages: ChatMessage[]; activityLogs: ActivityLog[] };

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-CA", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LeadsExplorer({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads] = useState<Lead[]>(initialLeads);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialLeads[0]?.id ?? null);
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        (l.name ?? "").toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q)
    );
  }, [leads, query]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/leads/${selectedId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const urgencyStyle = detail?.urgencyLevel ? URGENCY_COLORS[detail.urgencyLevel] : "bg-gray-100 text-gray-600";

  return (
    <div className="h-full grid grid-cols-[280px_minmax(0,1fr)_300px] gap-4 min-h-0">
      {/* Lead list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-0 min-w-0">
        <div className="p-3 border-b border-gray-200">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads…"
            className="input text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">No leads found.</p>
          ) : (
            filtered.map((lead) => {
              const stage = getStage(lead.currentStage);
              const active = lead.id === selectedId;
              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                    active ? "bg-orange-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm text-gray-900 truncate">{lead.name ?? "Unknown"}</p>
                    {lead.urgencyLevel === "EMERGENCY" && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{lead.phone}</p>
                  <span className={`inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${stage.bg} ${stage.color}`}>
                    {stage.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Text history */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-0 min-w-0">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">
            {detail ? detail.name ?? detail.phone : "Select a lead"}
          </h2>
          {detail && <p className="text-xs text-gray-400 mt-0.5">Text history</p>}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {loading && <p className="text-sm text-gray-400">Loading…</p>}
          {!loading && detail && detail.chatMessages.length === 0 && (
            <p className="text-sm text-gray-400">No message history for this lead yet.</p>
          )}
          {!loading &&
            detail?.chatMessages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "USER" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-sm rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "USER"
                      ? "bg-gray-100 text-gray-900"
                      : m.escalated
                        ? "bg-red-500 text-white"
                        : "bg-orange-500 text-white"
                  }`}
                >
                  <p>{m.content}</p>
                  <p className={`text-[10px] mt-1 ${m.role === "USER" ? "text-gray-400" : "text-white/70"}`}>
                    {formatDate(m.timestamp)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Issue summary sidebar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 overflow-y-auto min-h-0 min-w-0">
        {!detail ? (
          <p className="text-sm text-gray-400">Select a lead to see details.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Issue Summary</h3>
              <p className="text-sm text-gray-900 whitespace-pre-line">
                {detail.issueDescription ?? "No issue description recorded."}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStage(detail.currentStage).bg} ${getStage(detail.currentStage).color}`}>
                {getStage(detail.currentStage).label}
              </span>
              {detail.urgencyLevel && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyStyle}`}>
                  {URGENCY_LABELS[detail.urgencyLevel]}
                </span>
              )}
              {detail.serviceType && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {SERVICE_TYPE_LABELS[detail.serviceType] ?? detail.serviceType}
                </span>
              )}
            </div>

            <dl className="space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-gray-500 font-medium">Phone</dt>
                <dd className="text-gray-900 mt-0.5">{detail.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 font-medium">Email</dt>
                <dd className="text-gray-900 mt-0.5">{detail.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 font-medium">Address</dt>
                <dd className="text-gray-900 mt-0.5">{detail.address ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 font-medium">Lead Source</dt>
                <dd className="text-gray-900 mt-0.5">{detail.leadSource}</dd>
              </div>
              {detail.notes && (
                <div>
                  <dt className="text-xs text-gray-500 font-medium">Notes</dt>
                  <dd className="text-gray-900 mt-0.5 whitespace-pre-line">{detail.notes}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 font-medium">Created</dt>
                <dd className="text-gray-900 mt-0.5">{formatDate(detail.createdAt)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

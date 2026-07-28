import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDashboardAccess, organizationScope } from "@/lib/dashboard-auth";
import { getStage, STAGES, SERVICE_TYPE_LABELS, URGENCY_LABELS, URGENCY_COLORS } from "@/lib/pipeline";
import { LeadStageSelect } from "@/components/leads/LeadStageSelect";
import Link from "next/link";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-CA", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ACTIVITY_ICONS: Record<string, string> = {
  CALL: "📞",
  SMS: "💬",
  EMAIL: "✉️",
  NOTE: "📝",
  STAGE_CHANGE: "→",
};

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await getDashboardAccess();
  if (!access) redirect("/login");

  const { id } = await params;
  const lead = await prisma.contractorLead.findFirst({
    where: { id, ...organizationScope(access) },
    include: {
      activityLogs: { orderBy: { timestamp: "desc" } },
      chatMessages: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!lead) notFound();

  const stage = getStage(lead.currentStage);
  const urgencyStyle = lead.urgencyLevel ? URGENCY_COLORS[lead.urgencyLevel] : "bg-gray-100 text-gray-600";

  return (
    <div className="contractor-app flex flex-col min-h-screen">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 bg-white">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Dashboard
        </Link>
        <h1 className="text-base font-semibold text-gray-900">
          {lead.name ?? lead.phone}
        </h1>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stage.bg} ${stage.color}`}>
          {stage.label}
        </span>
        {lead.urgencyLevel && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${urgencyStyle}`}>
            {URGENCY_LABELS[lead.urgencyLevel]}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto px-6 py-5">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Lead Information</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-gray-500 font-medium">Name</dt>
                  <dd className="text-gray-900 mt-0.5">{lead.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-medium">Phone</dt>
                  <dd className="text-gray-900 mt-0.5">{lead.phone}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-medium">Email</dt>
                  <dd className="text-gray-900 mt-0.5">{lead.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-medium">Lead Source</dt>
                  <dd className="text-gray-900 mt-0.5">{lead.leadSource}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-gray-500 font-medium">Address</dt>
                  <dd className="text-gray-900 mt-0.5">{lead.address ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-medium">Service Type</dt>
                  <dd className="text-gray-900 mt-0.5">
                    {lead.serviceType ? SERVICE_TYPE_LABELS[lead.serviceType] : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 font-medium">Urgency</dt>
                  <dd className="mt-0.5">
                    {lead.urgencyLevel ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyStyle}`}>
                        {URGENCY_LABELS[lead.urgencyLevel]}
                      </span>
                    ) : "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-gray-500 font-medium">Issue Description</dt>
                  <dd className="text-gray-900 mt-0.5 whitespace-pre-line">
                    {lead.issueDescription ?? "—"}
                  </dd>
                </div>
                {lead.notes && (
                  <div className="col-span-2">
                    <dt className="text-xs text-gray-500 font-medium">Notes</dt>
                    <dd className="text-gray-900 mt-0.5 whitespace-pre-line">{lead.notes}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-500 font-medium">Created</dt>
                  <dd className="text-gray-900 mt-0.5">{formatDate(lead.createdAt)}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Pipeline Stage</h2>
              <LeadStageSelect leadId={lead.id} currentStage={lead.currentStage} stages={STAGES} />
              <p className="text-xs text-gray-400 mt-3">
                In this stage since {formatDate(lead.dateEnteredStage)}
              </p>
            </div>
          </div>

          {lead.chatMessages.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">SMS Conversation</h2>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {lead.chatMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "USER" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-xs rounded-2xl px-3.5 py-2 text-sm ${
                      m.role === "USER" ? "bg-gray-100 text-gray-900"
                        : m.escalated ? "bg-red-500 text-white"
                        : "bg-orange-500 text-white"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity History</h2>
            {lead.activityLogs.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {lead.activityLogs.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 text-base leading-none">{ACTIVITY_ICONS[a.type] ?? "•"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 truncate">{a.content}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.timestamp)}</p>
                    </div>
                    {a.direction && (
                      <span className="shrink-0 text-xs text-gray-400 capitalize">
                        {a.direction.toLowerCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

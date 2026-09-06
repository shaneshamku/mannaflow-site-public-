import Link from "next/link";
import type { CallLogDetail } from "@/lib/dashboard-data";

const SENTIMENT_STYLES: Record<string, string> = {
  Positive: "bg-green-50 text-green-700 border-green-200",
  Negative: "bg-red-50 text-red-700 border-red-200",
  Neutral: "bg-gray-50 text-gray-600 border-gray-200",
};

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value || "—"}</p>
    </div>
  );
}

export function CallDetailView({ call, unionTheme = false }: { call: CallLogDetail; unionTheme?: boolean }) {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/calls"
        className={`inline-flex items-center gap-1 text-sm ${unionTheme ? "text-[#1B2A5B]" : "text-forest"} hover:underline`}
      >
        ← Back to calls
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{call.callerName || call.fromPhone || "Unknown caller"}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{formatWhen(call.startedAt)}</p>
          </div>
          {call.sentiment && (
            <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${SENTIMENT_STYLES[call.sentiment] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
              {call.sentiment}
            </span>
          )}
        </div>

        {call.summary && <p className="text-sm text-gray-700 mt-4 leading-relaxed">{call.summary}</p>}

        {call.recordingUrl && (
          <div className="mt-4">
            <audio controls src={call.recordingUrl} className="w-full h-10" />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5">
        <Field label="Caller phone" value={call.callerPhoneGiven || call.fromPhone} />
        <Field label="Direction" value={call.direction} />
        <Field label="Duration" value={formatDuration(call.durationSeconds)} />
        <Field label="Outcome" value={call.outcome} />
        <Field label="Booking status" value={call.bookingStatus} />
        <Field label="Language spoken" value={call.languageSpoken} />
        <Field label="Issue category" value={call.issueCategory} />
        <Field label="Urgency" value={call.urgencyLevel} />
        {call.organizationName && <Field label="Organization" value={call.organizationName} />}
      </div>

      {call.transcript && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Transcript</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{call.transcript}</pre>
        </div>
      )}
    </div>
  );
}

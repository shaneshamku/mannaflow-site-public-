"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// MannaFlow-admin-only. Triggers a one-off pull of all Retell calls into
// call_logs, then refreshes the page. Idempotent server-side.
export function RetellBackfillButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setState("running");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/retell/backfill", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Backfill failed");
      setMsg(`Synced ${data.ingested} · skipped ${data.skipped}${data.errors ? ` · ${data.errors} errors` : ""}`);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Backfill failed");
    } finally {
      setState("idle");
    }
  }

  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
      <button onClick={run} disabled={state === "running"} className="btn-primary disabled:opacity-60">
        {state === "running" ? "Syncing…" : "Sync Retell calls"}
      </button>
    </div>
  );
}

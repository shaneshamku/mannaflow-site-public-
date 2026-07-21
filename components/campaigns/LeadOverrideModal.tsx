"use client";

import { useEffect, useState } from "react";
import { StepListEditor, EditableStep } from "./StepListEditor";

export function LeadOverrideModal({
  campaignId,
  leadId,
  leadName,
  onClose,
  onSaved,
}: {
  campaignId: string;
  leadId: string;
  leadName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasOverride, setHasOverride] = useState(false);
  const [steps, setSteps] = useState<EditableStep[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/campaigns/${campaignId}/leads/${leadId}`);
      const data = await res.json();
      if (cancelled) return;
      setHasOverride(!!data.hasOverride);
      setSteps(data.steps ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId, leadId]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/campaigns/${campaignId}/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps }),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  async function handleReset() {
    setSaving(true);
    await fetch(`/api/campaigns/${campaignId}/leads/${leadId}`, { method: "DELETE" });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Customize sequence for {leadName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-4">
            {!hasOverride && (
              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                Currently following the campaign default. Edits here only affect this customer.
              </p>
            )}

            <StepListEditor steps={steps} onChange={setSteps} disabled={saving} />

            <div className="flex items-center justify-between pt-1">
              {hasOverride ? (
                <button type="button" onClick={handleReset} disabled={saving} className="text-red-600 text-sm hover:text-red-700">
                  Reset to campaign default
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-3">
                <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? "Saving…" : "Save customization"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

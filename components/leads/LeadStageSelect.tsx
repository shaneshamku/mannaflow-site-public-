"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HvacPipelineStage } from "@prisma/client";

type Stage = { key: HvacPipelineStage; label: string; color: string; bg: string };

export function LeadStageSelect({
  leadId,
  currentStage,
  stages,
}: {
  leadId: string;
  currentStage: HvacPipelineStage;
  stages: Stage[];
}) {
  const router = useRouter();
  const [stage, setStage] = useState<HvacPipelineStage>(currentStage);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStage: HvacPipelineStage) {
    setStage(newStage);
    setSaving(true);
    await fetch(`/api/leads/${leadId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <select
        value={stage}
        onChange={(e) => handleChange(e.target.value as HvacPipelineStage)}
        disabled={saving}
        className="input text-sm"
      >
        {stages.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
      {saving && <p className="text-xs text-gray-400 mt-1.5">Saving…</p>}
    </div>
  );
}

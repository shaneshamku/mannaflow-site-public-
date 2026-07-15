"use client";

import { useDroppable } from "@dnd-kit/core";
import { LeadCard } from "./LeadCard";

type Lead = {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  serviceType: string | null;
  urgencyLevel: string | null;
  issueDescription: string | null;
  createdAt: Date | string;
};

type Props = {
  stageKey: string;
  label: string;
  color: string;
  bg: string;
  leads: Lead[];
};

export function PipelineColumn({ stageKey, label, color, bg, leads }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stageKey });

  return (
    <div className="flex flex-col w-52 shrink-0">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${color}`}>
          {label}
        </span>
        <span className="text-xs text-gray-400 font-medium">{leads.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-32 rounded-xl p-2 space-y-2.5 transition-colors ${
          isOver ? "bg-orange-50 ring-2 ring-orange-300" : "bg-gray-100/60"
        }`}
      >
        {leads.map((l) => (
          <LeadCard key={l.id} lead={l} />
        ))}
        {leads.length === 0 && (
          <p className="text-xs text-gray-400 text-center pt-6">No leads</p>
        )}
      </div>
    </div>
  );
}

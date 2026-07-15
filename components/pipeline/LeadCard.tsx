"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { SERVICE_TYPE_LABELS, URGENCY_COLORS, URGENCY_LABELS } from "@/lib/pipeline";

type Props = {
  lead: {
    id: string;
    name: string | null;
    phone: string;
    serviceType: string | null;
    urgencyLevel: string | null;
    issueDescription: string | null;
    createdAt: Date | string;
  };
};

export function LeadCard({ lead }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = { transform: CSS.Translate.toString(transform) };
  const urgencyStyle = lead.urgencyLevel ? URGENCY_COLORS[lead.urgencyLevel] : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? "shadow-lg opacity-80 rotate-1 z-50" : "hover:shadow-md"
      } ${lead.urgencyLevel === "EMERGENCY" ? "border-red-300" : ""}`}
    >
      <div {...listeners} className="absolute inset-0 rounded-xl" />

      <div className="relative pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {lead.name ?? "Unknown"}
          </p>
          {lead.urgencyLevel && lead.urgencyLevel !== "ROUTINE" && (
            <span className={`shrink-0 text-xs rounded-full px-2 py-0.5 font-medium ${urgencyStyle}`}>
              {URGENCY_LABELS[lead.urgencyLevel]}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{lead.phone}</p>
        {lead.serviceType && (
          <p className="text-xs text-gray-400 mt-1">{SERVICE_TYPE_LABELS[lead.serviceType] ?? lead.serviceType}</p>
        )}
        {lead.issueDescription && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{lead.issueDescription}</p>
        )}
      </div>

      <Link
        href={`/leads/${lead.id}`}
        className="absolute inset-0 rounded-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: "auto" }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { PipelineColumn } from "./PipelineColumn";
import { STAGES } from "@/lib/pipeline";
import { HvacPipelineStage } from "@prisma/client";

type Lead = {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  serviceType: string | null;
  urgencyLevel: string | null;
  issueDescription: string | null;
  currentStage: HvacPipelineStage;
  createdAt: Date | string;
};

export function PipelineBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const leadId = active.id as string;
    const newStage = over.id as HvacPipelineStage;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.currentStage === newStage) return;

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, currentStage: newStage } : l))
    );

    try {
      await fetch(`/api/leads/${leadId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, currentStage: lead.currentStage } : l))
      );
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="pipeline-scroll flex gap-3 pb-4 pt-1 px-1">
        {STAGES.map((stage) => (
          <PipelineColumn
            key={stage.key}
            stageKey={stage.key}
            label={stage.label}
            color={stage.color}
            bg={stage.bg}
            leads={leads.filter((l) => l.currentStage === stage.key)}
          />
        ))}
      </div>
    </DndContext>
  );
}

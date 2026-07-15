"use client";

import { useState } from "react";
import { AddLeadModal } from "@/components/leads/AddLeadModal";

export function DashboardHeader({
  title = "Overview",
  showAddLead = true,
}: {
  title?: string;
  showAddLead?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        {showAddLead && (
          <button onClick={() => setOpen(true)} className="btn-primary">
            + Add Lead
          </button>
        )}
      </div>

      {open && <AddLeadModal onClose={() => setOpen(false)} />}
    </>
  );
}

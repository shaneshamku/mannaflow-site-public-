import { ContractorPipelineStage } from "@prisma/client";

export const STAGES: { key: ContractorPipelineStage; label: string; color: string; bg: string }[] = [
  { key: "NEW_LEAD",     label: "New Lead",      color: "text-gray-700",    bg: "bg-gray-100"    },
  { key: "CONTACTED",    label: "Contacted",     color: "text-blue-700",    bg: "bg-blue-100"    },
  { key: "QUOTE_SENT",   label: "Quote Sent",    color: "text-orange-700",  bg: "bg-orange-100"  },
  { key: "JOB_BOOKED",  label: "Job Booked",    color: "text-indigo-700",  bg: "bg-indigo-100"  },
  { key: "JOB_COMPLETE", label: "Job Complete",  color: "text-green-700",   bg: "bg-green-100"   },
  { key: "INVOICE_SENT", label: "Invoice Sent",  color: "text-yellow-700",  bg: "bg-yellow-100"  },
  { key: "PAID",         label: "Paid",          color: "text-emerald-700", bg: "bg-emerald-100" },
];

export function getStage(key: ContractorPipelineStage) {
  return STAGES.find((s) => s.key === key)!;
}

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  REPAIR: "Repair",
  INSTALLATION: "Installation",
  MAINTENANCE: "Maintenance",
  EMERGENCY: "Emergency",
};

export const URGENCY_LABELS: Record<string, string> = {
  ROUTINE: "Routine",
  URGENT: "Urgent",
  EMERGENCY: "Emergency",
};

export const URGENCY_COLORS: Record<string, string> = {
  ROUTINE: "bg-green-100 text-green-700",
  URGENT: "bg-orange-100 text-orange-700",
  EMERGENCY: "bg-red-100 text-red-700",
};

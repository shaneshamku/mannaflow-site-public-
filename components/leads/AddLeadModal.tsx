"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddLeadModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    issueDescription: "",
    serviceType: "",
    urgencyLevel: "",
    leadSource: "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        serviceType: form.serviceType || null,
        urgencyLevel: form.urgencyLevel || null,
      }),
    });
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Add Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className="input" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} required className="input" placeholder="+1 (226) 555-0100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" placeholder="client@email.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
              <input value={form.leadSource} onChange={(e) => set("leadSource", e.target.value)} className="input" placeholder="Missed Call, Referral…" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Property Address</label>
            <input value={form.address} onChange={(e) => set("address", e.target.value)} className="input" placeholder="123 Main St, Kitchener ON" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Service Type</label>
              <select value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)} className="input">
                <option value="">— Select —</option>
                <option value="REPAIR">Repair</option>
                <option value="INSTALLATION">Installation</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Urgency</label>
              <select value={form.urgencyLevel} onChange={(e) => set("urgencyLevel", e.target.value)} className="input">
                <option value="">— Select —</option>
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Issue Description</label>
            <textarea value={form.issueDescription} onChange={(e) => set("issueDescription", e.target.value)} rows={2} className="input resize-none" placeholder="Furnace not turning on, AC making noise…" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="input resize-none" placeholder="Any additional notes…" />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Adding…" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

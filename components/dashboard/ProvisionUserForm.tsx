"use client";

import { useState } from "react";

export function ProvisionUserForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(form: HTMLFormElement) {
    setBusy(true); setMessage(null);
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/admin/provision-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await res.json(); setBusy(false);
    setMessage(res.ok ? `Provisioned ${result.email}.` : result.error ?? "Provisioning failed.");
    if (res.ok) form.reset();
  }
  return <form className="max-w-xl bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm" onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget); }}>
    <p className="text-sm text-gray-600">Only MannaFlow staff can create dashboard accounts. Client users cannot invite or manage staff.</p>
    <input className="input" name="email" type="email" placeholder="Email" required />
    <input className="input" name="password" type="password" minLength={12} placeholder="Temporary password (12+ characters)" required />
    <select className="input" name="role" defaultValue="CLIENT_ADMIN"><option value="CLIENT_ADMIN">Client admin</option><option value="MANNAFLOW_ADMIN">MannaFlow admin</option></select>
    <input className="input" name="organizationName" placeholder="New client organization (required for client admin)" />
    <button className="btn-primary" disabled={busy}>{busy ? "Provisioning…" : "Provision account"}</button>
    {message && <p className="text-sm text-gray-700" role="status">{message}</p>}
  </form>;
}

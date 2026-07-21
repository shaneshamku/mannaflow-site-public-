"use client";

export type EditableStep = {
  intervalDays: number;
  channel: string;
  intent: string;
  sampleCopy?: string;
  sendSms?: boolean;
  sendEmail?: boolean;
  smsBody?: string;
  emailSubject?: string;
  emailBody?: string;
  skipIfReplied?: boolean;
  onlyIfUrgency?: string[];
  needsManualCallback?: boolean;
  sendTime?: string; // "HH:MM", 24-hour, local to the campaign's timezone
};

const URGENCY_LEVELS = ["ROUTINE", "URGENT", "EMERGENCY"] as const;

function blankStep(): EditableStep {
  return { intervalDays: 0, channel: "", intent: "" };
}

export function StepListEditor({
  steps,
  onChange,
  disabled,
}: {
  steps: EditableStep[];
  onChange: (steps: EditableStep[]) => void;
  disabled?: boolean;
}) {
  function update(index: number, patch: Partial<EditableStep>) {
    onChange(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function remove(index: number) {
    onChange(steps.filter((_, i) => i !== index));
  }

  function toggleUrgency(index: number, level: string) {
    const step = steps[index];
    const current = step.onlyIfUrgency ?? [];
    const next = current.includes(level) ? current.filter((u) => u !== level) : [...current, level];
    update(index, { onlyIfUrgency: next });
  }

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 flex items-start gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  {i === 0 ? "Days after enrollment" : "Days after previous step"}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={step.intervalDays}
                  disabled={disabled}
                  onChange={(e) => update(i, { intervalDays: Number(e.target.value) })}
                  className="input text-sm w-24"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Send at (optional)</label>
                <input
                  type="time"
                  value={step.sendTime ?? ""}
                  disabled={disabled}
                  onChange={(e) => update(i, { sendTime: e.target.value || undefined })}
                  className="input text-sm w-28"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={disabled}
              className="text-red-600 text-xs shrink-0 hover:text-red-700"
            >
              Remove step
            </button>
          </div>
          <p className="text-[11px] text-gray-400 -mt-1.5">
            Sends are checked every hour. Leave &ldquo;Send at&rdquo; blank to send as soon as it&apos;s due, or set a
            time (24-hour, in the campaign&apos;s timezone below) to hold it until then. Fractional day intervals
            (e.g. 0.5) work the same way.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Channel</label>
              <input
                value={step.channel}
                disabled={disabled}
                onChange={(e) => update(i, { channel: e.target.value })}
                className="input text-sm"
                placeholder="e.g. SMS"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Intent</label>
              <input
                value={step.intent}
                disabled={disabled}
                onChange={(e) => update(i, { intent: e.target.value })}
                className="input text-sm"
                placeholder="e.g. Follow up on missed call"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Sample copy (summary only)</label>
            <input
              value={step.sampleCopy ?? ""}
              disabled={disabled}
              onChange={(e) => update(i, { sampleCopy: e.target.value })}
              className="input text-sm"
            />
          </div>

          <p className="text-[11px] text-gray-400">
            Merge tags available in message bodies: <code>{"{{name}}"}</code> <code>{"{{issue}}"}</code>{" "}
            <code>{"{{link}}"}</code>
          </p>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={!!step.sendSms}
                disabled={disabled}
                onChange={(e) => update(i, { sendSms: e.target.checked })}
              />
              Send SMS
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={!!step.sendEmail}
                disabled={disabled}
                onChange={(e) => update(i, { sendEmail: e.target.checked })}
              />
              Send Email
            </label>
          </div>

          {step.sendSms && (
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">SMS body</label>
              <textarea
                value={step.smsBody ?? ""}
                disabled={disabled}
                onChange={(e) => update(i, { smsBody: e.target.value })}
                rows={2}
                className="input text-sm resize-none"
              />
            </div>
          )}

          {step.sendEmail && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Email subject</label>
                <input
                  value={step.emailSubject ?? ""}
                  disabled={disabled}
                  onChange={(e) => update(i, { emailSubject: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Email body</label>
                <textarea
                  value={step.emailBody ?? ""}
                  disabled={disabled}
                  onChange={(e) => update(i, { emailBody: e.target.value })}
                  rows={4}
                  className="input text-sm resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={!!step.skipIfReplied}
                disabled={disabled}
                onChange={(e) => update(i, { skipIfReplied: e.target.checked })}
              />
              Skip if lead already replied
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={!!step.needsManualCallback}
                disabled={disabled}
                onChange={(e) => update(i, { needsManualCallback: e.target.checked })}
              />
              Needs manual callback
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Only send for urgency</label>
            <div className="flex items-center gap-3">
              {URGENCY_LEVELS.map((level) => (
                <label key={level} className="flex items-center gap-1.5 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={(step.onlyIfUrgency ?? []).includes(level)}
                    disabled={disabled}
                    onChange={() => toggleUrgency(i, level)}
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...steps, blankStep()])}
        disabled={disabled}
        className="btn-secondary text-sm"
      >
        + Add step
      </button>
    </div>
  );
}

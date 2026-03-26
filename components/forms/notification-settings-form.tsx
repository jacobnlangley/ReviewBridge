"use client";

import { FormEvent, useState } from "react";

type NotificationSettings = {
  instantEmailNeutral: boolean;
  instantEmailNegative: boolean;
  smsNegativeEnabled: boolean;
  alertPhone: string | null;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
};

type NotificationSettingsFormProps = {
  businessId: string;
  manageToken?: string;
  initialSettings: NotificationSettings;
};

export function NotificationSettingsForm({
  businessId,
  manageToken,
  initialSettings,
}: NotificationSettingsFormProps) {
  const [instantEmailNeutral, setInstantEmailNeutral] = useState(initialSettings.instantEmailNeutral);
  const [instantEmailNegative, setInstantEmailNegative] = useState(initialSettings.instantEmailNegative);
  const [smsNegativeEnabled, setSmsNegativeEnabled] = useState(initialSettings.smsNegativeEnabled);
  const [alertPhone, setAlertPhone] = useState(initialSettings.alertPhone ?? "");
  const [quietHoursStart, setQuietHoursStart] = useState(initialSettings.quietHoursStart ?? "");
  const [quietHoursEnd, setQuietHoursEnd] = useState(initialSettings.quietHoursEnd ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (smsNegativeEnabled && !alertPhone.trim()) {
      setError("Please add an SMS alert phone number or turn off SMS alerts.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/businesses/${businessId}/notification-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instantEmailNeutral,
          instantEmailNegative,
          smsNegativeEnabled,
          alertPhone: alertPhone.trim() || null,
          quietHoursStart: quietHoursStart.trim() || null,
          quietHoursEnd: quietHoursEnd.trim() || null,
          ...(manageToken ? { manageToken } : {}),
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not save notification settings.");
        return;
      }

      setSaved(true);
    } catch {
      setError("Could not save notification settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-900">Instant email alerts</legend>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <input
            type="checkbox"
            checked={instantEmailNeutral}
            onChange={(event) => setInstantEmailNeutral(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">
            Send instant email alerts for neutral feedback.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <input
            type="checkbox"
            checked={instantEmailNegative}
            onChange={(event) => setInstantEmailNegative(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">
            Send instant email alerts for negative feedback.
          </span>
        </label>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-900">Negative SMS alerts</legend>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={smsNegativeEnabled}
            onChange={(event) => setSmsNegativeEnabled(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">
            Send SMS alerts only for negative feedback.
          </span>
        </label>

        {smsNegativeEnabled ? (
          <div className="space-y-1">
            <label htmlFor="alertPhone" className="block text-sm font-medium text-slate-800">
              SMS alert phone number
            </label>
            <input
              id="alertPhone"
              type="tel"
              value={alertPhone}
              onChange={(event) => setAlertPhone(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900"
              placeholder="+15551234567"
            />
          </div>
        ) : null}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-900">Quiet hours (optional)</legend>
        <p className="text-xs text-slate-500">Saved now for future enforcement in alerts.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="quietHoursStart" className="mb-1 block text-sm font-medium text-slate-800">
              Start
            </label>
            <input
              id="quietHoursStart"
              type="time"
              value={quietHoursStart}
              onChange={(event) => setQuietHoursStart(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900"
            />
          </div>
          <div>
            <label htmlFor="quietHoursEnd" className="mb-1 block text-sm font-medium text-slate-800">
              End
            </label>
            <input
              id="quietHoursEnd"
              type="time"
              value={quietHoursEnd}
              onChange={(event) => setQuietHoursEnd(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900"
            />
          </div>
        </div>
      </fieldset>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-700">Settings saved.</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Saving..." : "Save notification settings"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RenewSubscriptionFormProps = {
  businessId: string;
  isMonthlySubscriptionActive: boolean;
  manageToken?: string;
};

type RenewResponse = {
  ok?: boolean;
  error?: string;
};

export function RenewSubscriptionForm({
  businessId,
  isMonthlySubscriptionActive,
  manageToken,
}: RenewSubscriptionFormProps) {
  const router = useRouter();
  const [ownerEmail, setOwnerEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRenew = async () => {
    if (!ownerEmail.trim()) {
      setError("Enter the owner email used at signup.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/businesses/${encodeURIComponent(businessId)}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerEmail: ownerEmail.trim(),
          action: isMonthlySubscriptionActive ? "cancel" : "start",
          ...(manageToken ? { manageToken } : {}),
        }),
      });

      const result = (await response.json()) as RenewResponse;

      if (!response.ok || !result.ok) {
        setError(result.error ?? "Renewal failed. Please try again.");
        return;
      }

      setSuccessMessage(
        isMonthlySubscriptionActive
          ? "Subscription canceled. Feedback link is now inactive."
          : "Subscription started. Feedback link reactivated.",
      );
      router.refresh();
    } catch {
      setError("Renewal failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor="ownerEmailConfirm" className="mb-1.5 block text-sm font-medium text-slate-800">
          Owner email confirmation
        </label>
        <input
          id="ownerEmailConfirm"
          type="email"
          value={ownerEmail}
          onChange={(event) => setOwnerEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          placeholder="owner@business.com"
        />
      </div>
      <button
        type="button"
        onClick={handleRenew}
        disabled={isLoading}
        className={`inline-flex rounded-lg px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 ${
          isMonthlySubscriptionActive
            ? "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {isLoading
          ? isMonthlySubscriptionActive
            ? "Canceling..."
            : "Starting..."
          : isMonthlySubscriptionActive
            ? "Cancel monthly subscription"
            : "Start monthly subscription"}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {successMessage ? <p className="text-xs text-emerald-700">{successMessage}</p> : null}
    </div>
  );
}

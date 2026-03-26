"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FeedbackStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

type FeedbackStatusControlsProps = {
  feedbackId: string;
  currentStatus: FeedbackStatus;
};

const statusOptions: Array<{ value: FeedbackStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

export function FeedbackStatusControls({
  feedbackId,
  currentStatus,
}: FeedbackStatusControlsProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus>(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async (nextStatus: FeedbackStatus) => {
    if (nextStatus === selectedStatus || isSaving) {
      return;
    }

    setError(null);
    setSelectedStatus(nextStatus);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not update status.");
        setSelectedStatus(currentStatus);
        return;
      }

      router.refresh();
    } catch {
      setError("Could not update status.");
      setSelectedStatus(currentStatus);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleUpdateStatus(option.value)}
            disabled={isSaving}
            className={`rounded-full border px-2.5 py-1 transition disabled:cursor-not-allowed disabled:opacity-60 ${
              selectedStatus === option.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

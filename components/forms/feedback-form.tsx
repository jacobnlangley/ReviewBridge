"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type FeedbackFormProps = {
  slug: string;
  sentiment: "neutral" | "negative";
  locationName: string;
};

export function FeedbackForm({ slug, sentiment, locationName }: FeedbackFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsFollowUp, setWantsFollowUp] = useState<boolean | null>(null);
  const [followUpPreference, setFollowUpPreference] = useState<"text" | "call" | "email" | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError("Please share a little feedback before submitting.");
      return;
    }

    if (wantsFollowUp === null) {
      setError("Please choose whether you want follow-up.");
      return;
    }

    if (wantsFollowUp) {
      if (!followUpPreference) {
        setError("Please choose how you would like to be contacted.");
        return;
      }

      if ((followUpPreference === "text" || followUpPreference === "call") && !phone.trim()) {
        setError("Please add a phone number for text or call follow-up.");
        return;
      }

      if (followUpPreference === "email" && !customerEmail.trim()) {
        setError("Please add an email address for email follow-up.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          sentiment,
          message: message.trim(),
          wantsFollowUp,
          followUpPreference: wantsFollowUp ? followUpPreference : null,
          phone: wantsFollowUp ? phone.trim() || null : null,
          customerName: customerName.trim() || null,
          customerEmail: customerEmail.trim() || null,
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/thanks");
    } catch {
      setError("We could not submit feedback right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        We will share this privately with the business so they can follow up or improve.
      </p>
      <p className="text-sm text-slate-600">
        Only include contact information if you&apos;d like a response from the business.
      </p>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-800">
          Tell us what happened
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          rows={4}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          placeholder="Share anything the business should know about your experience."
        />
        <p className="mt-1 text-xs text-slate-500">Location: {locationName}</p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-800">
          Would you like the business to follow up with you?
        </legend>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setWantsFollowUp(true);
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              wantsFollowUp === true
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-800"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              setWantsFollowUp(false);
              setFollowUpPreference(null);
              setPhone("");
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              wantsFollowUp === false
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-800"
            }`}
          >
            No
          </button>
        </div>
      </fieldset>

      {wantsFollowUp ? (
        <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <legend className="text-sm font-medium text-slate-800">
            How would you prefer to be contacted?
          </legend>
          <div className="flex flex-wrap gap-2">
            {([
              { value: "text", label: "Text" },
              { value: "call", label: "Call" },
              { value: "email", label: "Email" },
            ] as const).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFollowUpPreference(option.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  followUpPreference === option.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {(followUpPreference === "text" || followUpPreference === "call") && (
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-800">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
                placeholder="555-123-4567"
                required
              />
            </div>
          )}
        </fieldset>
      ) : null}

      <div>
        <label htmlFor="customerName" className="mb-1.5 block text-sm font-medium text-slate-800">
          Your name (optional)
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="customerEmail" className="mb-1.5 block text-sm font-medium text-slate-800">
          Your email (optional)
        </label>
        <input
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          placeholder="you@example.com"
          required={Boolean(wantsFollowUp && followUpPreference === "email")}
        />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Submitting..." : "Submit private feedback"}
      </button>
    </form>
  );
}

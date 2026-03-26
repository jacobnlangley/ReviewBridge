"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SignupResponse = {
  ok?: boolean;
  error?: string;
  location?: { slug: string };
  manageToken?: string | null;
};

export function BusinessSignupForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [locationName, setLocationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!businessName.trim() || !ownerEmail.trim() || !locationName.trim()) {
      setError("Please complete all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/businesses/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          ownerEmail: ownerEmail.trim(),
          locationName: locationName.trim(),
        }),
      });

      const result = (await response.json()) as SignupResponse;

      if (!response.ok || !result.location?.slug) {
        setError(result.error ?? "We could not create your account right now.");
        return;
      }

      const tokenQuery = result.manageToken
        ? `&token=${encodeURIComponent(result.manageToken)}`
        : "";

      router.push(`/signup/success?slug=${encodeURIComponent(result.location.slug)}${tokenQuery}`);
    } catch {
      setError("We could not create your account right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-slate-800">
          Business name
        </label>
        <input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          placeholder="Demo Coffee Co"
          required
        />
      </div>

      <div>
        <label htmlFor="ownerEmail" className="mb-1.5 block text-sm font-medium text-slate-800">
          Owner email
        </label>
        <input
          id="ownerEmail"
          type="email"
          value={ownerEmail}
          onChange={(event) => setOwnerEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          placeholder="owner@business.com"
          required
        />
      </div>

      <div>
        <label htmlFor="locationName" className="mb-1.5 block text-sm font-medium text-slate-800">
          First location name
        </label>
        <input
          id="locationName"
          type="text"
          value={locationName}
          onChange={(event) => setLocationName(event.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          placeholder="Downtown"
          required
        />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Creating account..." : "Start free 30-day trial"}
      </button>
    </form>
  );
}

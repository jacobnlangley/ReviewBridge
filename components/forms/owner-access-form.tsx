"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AccessLinkResponse = {
  ok?: boolean;
  error?: string;
  redirectPath?: string;
};

export function OwnerAccessForm() {
  const router = useRouter();
  const [ownerEmail, setOwnerEmail] = useState("");
  const [locationSlug, setLocationSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedEmail = ownerEmail.trim().toLowerCase();
    const normalizedSlug = locationSlug.trim();

    if (!normalizedEmail || !normalizedSlug) {
      setError("Please enter owner email and location slug.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/owner/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerEmail: normalizedEmail,
          locationSlug: normalizedSlug,
        }),
      });

      const result = (await response.json()) as AccessLinkResponse;

      if (!response.ok || !result.ok || !result.redirectPath) {
        setError(result.error ?? "Could not open your owner workspace.");
        return;
      }

      router.push(result.redirectPath);
    } catch {
      setError("Could not open your owner workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="ownerAccessEmail" className="mb-1.5 block text-sm font-medium text-slate-800">
          Owner email
        </label>
        <input
          id="ownerAccessEmail"
          type="email"
          value={ownerEmail}
          onChange={(event) => setOwnerEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          placeholder="owner@business.com"
          required
        />
      </div>

      <div>
        <label htmlFor="ownerAccessLocationSlug" className="mb-1.5 block text-sm font-medium text-slate-800">
          Location slug
        </label>
        <input
          id="ownerAccessLocationSlug"
          type="text"
          value={locationSlug}
          onChange={(event) => setLocationSlug(event.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          placeholder="demo-coffee-downtown"
          required
        />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Opening workspace..." : "Open owner workspace"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OwnerSignoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await fetch("/api/owner/session", {
        method: "DELETE",
      });
    } finally {
      router.push("/dashboard/access");
      router.refresh();
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className="hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </button>
  );
}

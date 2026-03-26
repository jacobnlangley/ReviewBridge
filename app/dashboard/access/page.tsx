import Link from "next/link";
import { redirect } from "next/navigation";
import { OwnerAccessForm } from "@/components/forms/owner-access-form";
import { Card } from "@/components/ui/card";
import { getOwnerSession } from "@/lib/owner-session";

export default async function DashboardAccessPage() {
  const ownerSession = await getOwnerSession();

  if (ownerSession) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
      <section className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-start">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Dashboard Access</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Open your owner dashboard</h1>
          <p className="text-sm text-slate-700">
            Enter the owner email and location slug to open your secure dashboard.
          </p>
          <OwnerAccessForm />
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Need help finding your slug?</h2>
          <p className="text-sm text-slate-700">
            Your location slug is the part after <code>/feedback/</code> in your customer feedback link.
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Example: <code>/feedback/demo-coffee-downtown</code> means slug is <code>demo-coffee-downtown</code>
          </div>
          <Link href="/signup" className="text-sm font-medium text-slate-900 underline">
            New business? Start free trial
          </Link>
        </Card>
      </section>
    </main>
  );
}

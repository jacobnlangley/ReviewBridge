import Link from "next/link";
import { AppModule } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { getModuleSubscriptionForBusiness } from "@/lib/module-subscriptions";
import { getOwnerWorkspaceContextOrRedirect } from "@/lib/owner-workspace-context";

const STATUS_LABELS = {
  ACTIVE: "Active",
  TRIAL: "Trial",
  INACTIVE: "Inactive",
} as const;

const STATUS_CLASSES = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  TRIAL: "border-sky-200 bg-sky-50 text-sky-800",
  INACTIVE: "border-slate-300 bg-slate-100 text-slate-700",
} as const;

export default async function DashboardLoyaltyPage() {
  const workspace = await getOwnerWorkspaceContextOrRedirect();
  const subscription = await getModuleSubscriptionForBusiness(workspace.businessId, AppModule.LOYALTY);

  if (!subscription.isEnabled) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Loyalty Builder Module</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Loyalty Builder is not active yet</h1>
            <Link
              href="/dashboard/reviews"
              className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
            >
              Back to Reviews
            </Link>
          </div>
          <p>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[subscription.status]}`}
            >
              Status: {STATUS_LABELS[subscription.status]}
            </span>
          </p>
          <p className="text-sm text-slate-700">Activate this module to run repeat-visit offers and loyalty campaigns.</p>
          <p className="text-sm text-slate-600">Activated from Reviews workspace appears here immediately after enabling.</p>
          <Link href="/dashboard/reviews" className="text-sm font-medium text-slate-900 underline">
            Open subscription settings
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
      <Card className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Loyalty Builder Module</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Loyalty Builder workspace</h1>
          <Link
            href="/dashboard/reviews"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
          >
            Back to Reviews
          </Link>
        </div>
        <p>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[subscription.status]}`}
          >
            Status: {STATUS_LABELS[subscription.status]} (Activated from Reviews workspace)
          </span>
        </p>
        <p className="text-sm text-slate-700">Placeholder: rewards catalog, active members, and redemptions.</p>
      </Card>
    </main>
  );
}

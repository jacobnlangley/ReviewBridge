import Link from "next/link";
import { AppModule, ModuleSubscriptionStatus } from "@prisma/client";
import { ModuleSubscriptionForm } from "@/components/forms/module-subscription-form";
import { Card } from "@/components/ui/card";
import { getOwnerWorkspaceContextOrRedirect } from "@/lib/owner-workspace-context";
import { prisma } from "@/lib/prisma";

const OWNER_MANAGED_MODULES: Array<Exclude<AppModule, "FEEDBACK" | "REVIEWS">> = [
  AppModule.SCHEDULER,
  AppModule.LOYALTY,
];

export default async function DashboardHomePage() {
  const workspace = await getOwnerWorkspaceContextOrRedirect();
  const subscriptions = await prisma.businessModuleSubscription.findMany({
    where: {
      businessId: workspace.businessId,
      module: { in: OWNER_MANAGED_MODULES },
    },
    select: {
      module: true,
      status: true,
      startedAt: true,
      endsAt: true,
    },
    orderBy: {
      module: "asc",
    },
  });

  const moduleSubscriptionsForForm = OWNER_MANAGED_MODULES.map((module) => {
    const existing = subscriptions.find((subscription) => subscription.module === module);

    if (existing) {
      return {
        module,
        status: existing.status,
        startedAt: existing.startedAt,
        endsAt: existing.endsAt,
      };
    }

    return {
      module,
      status: ModuleSubscriptionStatus.INACTIVE,
      startedAt: null,
      endsAt: null,
    };
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
      <section className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-start">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Dashboard Home</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back, {workspace.businessName}</h1>
          <p className="text-sm text-slate-700">
            One place to manage reviews, last-minute scheduling offers, and loyalty builder workflows.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Location:</span> {workspace.locationName}
            </p>
            <p>
              <span className="font-medium text-slate-900">Slug:</span> {workspace.locationSlug}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/reviews"
              className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Open reviews
            </Link>
            <Link
              href="/dashboard/scheduler"
              className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Open scheduler
            </Link>
            <Link
              href="/dashboard/loyalty"
              className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Open loyalty builder
            </Link>
            <Link
              href={`/manage/${workspace.locationSlug}`}
              className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Open owner manage
            </Link>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Module subscriptions</h2>
          <p className="text-sm text-slate-700">
            Turn on Last-Minute Scheduler and Loyalty Builder as your workflow expands.
          </p>
          <ModuleSubscriptionForm businessId={workspace.businessId} moduleSubscriptions={moduleSubscriptionsForForm} />
        </Card>
      </section>
    </main>
  );
}

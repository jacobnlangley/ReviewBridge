import Link from "next/link";
import { AppModule } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { isModuleEnabledForBusiness } from "@/lib/module-subscriptions";
import { getOwnerWorkspaceContextOrRedirect } from "@/lib/owner-workspace-context";

export default async function DashboardReviewsPage() {
  const workspace = await getOwnerWorkspaceContextOrRedirect();
  const hasAccess = await isModuleEnabledForBusiness(workspace.businessId, AppModule.FEEDBACK);

  if (!hasAccess) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Reviews Module</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reviews is not active yet</h1>
            <Link
              href={`/manage/${workspace.locationSlug}`}
              className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
            >
              Back to Manage
            </Link>
          </div>
          <p className="text-sm text-slate-700">Activate this module to collect private reviews and route urgent issues.</p>
          <Link href={`/manage/${workspace.locationSlug}`} className="text-sm font-medium text-slate-900 underline">
            Open subscription settings
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
      <Card className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Reviews Module</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reviews workspace</h1>
          <Link
            href={`/manage/${workspace.locationSlug}`}
            className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
          >
            Back to Manage
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/manage/${workspace.locationSlug}`}
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Open review settings
          </Link>
          <Link
            href="/dashboard/reviews/qr"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Open location QR code
          </Link>
          <Link
            href={`/feedback/${workspace.locationSlug}`}
            className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Preview customer form
          </Link>
        </div>
      </Card>
    </main>
  );
}

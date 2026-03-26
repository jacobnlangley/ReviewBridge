import Link from "next/link";
import { DashboardNav } from "@/components/navigation/dashboard-nav";
import { PublicHeaderNav } from "@/components/navigation/public-header-nav";
import { getEnabledModulesForBusiness } from "@/lib/module-subscriptions";
import { getOwnerSession } from "@/lib/owner-session";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ownerSession = await getOwnerSession();
  const enabledModules = ownerSession ? await getEnabledModulesForBusiness(ownerSession.businessId) : [];

  return (
    <>
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-semibold tracking-tight text-slate-900">
            ReviewBridge
          </Link>
          <PublicHeaderNav hasOwnerSession={Boolean(ownerSession)} />
        </div>
      </header>
      {ownerSession ? <DashboardNav enabledModules={enabledModules} /> : null}
      {children}
    </>
  );
}

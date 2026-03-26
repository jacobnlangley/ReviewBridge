"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppModule } from "@prisma/client";

type DashboardNavProps = {
  enabledModules: AppModule[];
};

const MODULE_LABELS: Record<AppModule, string> = {
  FEEDBACK: "Reviews",
  REVIEWS: "Reviews",
  SCHEDULER: "Last-Minute Scheduler",
  LOYALTY: "Loyalty Builder",
};

const MODULE_PATHS: Record<AppModule, string> = {
  FEEDBACK: "/dashboard/reviews",
  REVIEWS: "/dashboard/reviews",
  SCHEDULER: "/dashboard/scheduler",
  LOYALTY: "/dashboard/loyalty",
};

export function DashboardNav({ enabledModules }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <div className="border-b border-slate-200 bg-slate-100/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-2.5 text-sm text-slate-700">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Dashboard</p>
        <nav className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            className={
              pathname === "/dashboard"
                ? "rounded-full border border-slate-300 bg-white px-2.5 py-1 text-slate-900"
                : "hover:text-slate-900"
            }
          >
            Home
          </Link>

          {enabledModules.filter((module) => module !== "REVIEWS").map((module) => {
            const href = MODULE_PATHS[module];
            const isActive = module === "FEEDBACK" ? pathname.startsWith("/dashboard/reviews") : pathname === href;

            return (
              <Link
                key={module}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "rounded-full border border-slate-300 bg-white px-2.5 py-1 text-slate-900"
                    : "hover:text-slate-900"
                }
              >
                {MODULE_LABELS[module]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

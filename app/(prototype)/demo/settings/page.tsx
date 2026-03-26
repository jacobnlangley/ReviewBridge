import Link from "next/link";
import { NotificationSettingsForm } from "@/components/forms/notification-settings-form";
import { Card } from "@/components/ui/card";
import { createManageToken } from "@/lib/manage-token";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DemoSettingsPage() {
  let business:
    | {
        id: string;
        name: string;
        instantEmailNeutral: boolean;
        instantEmailNegative: boolean;
        smsNegativeEnabled: boolean;
        alertPhone: string | null;
        quietHoursStart: string | null;
        quietHoursEnd: string | null;
      }
    | null = null;

  try {
    business = await prisma.business.findUnique({
      where: { email: "owner@democoffee.com" },
      select: {
        id: true,
        name: true,
        instantEmailNeutral: true,
        instantEmailNegative: true,
        smsNegativeEnabled: true,
        alertPhone: true,
        quietHoursStart: true,
        quietHoursEnd: true,
      },
    });
  } catch {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
        <Card className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Notification Settings
          </h1>
          <p className="text-sm text-slate-600">
            Demo settings are unavailable until the database is configured.
          </p>
          <Link href="/" className="text-sm font-medium text-slate-900 underline">
            Go back to homepage
          </Link>
        </Card>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
        <Card className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Notification Settings
          </h1>
          <p className="text-sm text-slate-600">Demo business record not found.</p>
          <Link href="/" className="text-sm font-medium text-slate-900 underline">
            Go back to homepage
          </Link>
        </Card>
      </main>
    );
  }

  const manageToken = createManageToken({ businessId: business.id }) ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <Card className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Notification Settings
          </h1>
          <p className="text-sm text-slate-600">
            Configure instant alerts for {business.name}. Negative alerts are immediate by default.
          </p>
        </div>

        <NotificationSettingsForm
          businessId={business.id}
          manageToken={manageToken}
          initialSettings={{
            instantEmailNeutral: business.instantEmailNeutral,
            instantEmailNegative: business.instantEmailNegative,
            smsNegativeEnabled: business.smsNegativeEnabled,
            alertPhone: business.alertPhone,
            quietHoursStart: business.quietHoursStart,
            quietHoursEnd: business.quietHoursEnd,
          }}
        />
      </Card>
    </main>
  );
}

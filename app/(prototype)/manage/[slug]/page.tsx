import Link from "next/link";
import { SubscriptionStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { OwnerFeatureRequestForm } from "@/components/forms/owner-feature-request-form";
import { RenewSubscriptionForm } from "@/components/forms/renew-subscription-form";
import { Card } from "@/components/ui/card";
import { isManageTokenValidForBusiness } from "@/lib/manage-token";
import { OWNER_SESSION_COOKIE_NAME, isOwnerSessionValidForBusiness } from "@/lib/owner-session";
import { getDayDelta } from "@/lib/subscription-countdown";
import { evaluateBusinessAccess } from "@/lib/subscription-access";
import { trackValidationEvent, validationEvent } from "@/lib/validation-events";
import { prisma } from "@/lib/prisma";

type ManagePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: SubscriptionStatus) {
  switch (status) {
    case SubscriptionStatus.TRIAL_ACTIVE:
      return "Trial";
    case SubscriptionStatus.ACTIVE_PAID:
      return "Paid";
    case SubscriptionStatus.INACTIVE_EXPIRED:
      return "Expired";
    case SubscriptionStatus.INACTIVE_CANCELED:
      return "Canceled";
    default:
      return "Unknown";
  }
}

function getStatusSectionLabel(status: SubscriptionStatus) {
  switch (status) {
    case SubscriptionStatus.TRIAL_ACTIVE:
      return "Trial Status";
    case SubscriptionStatus.ACTIVE_PAID:
      return "Subscription Status";
    default:
      return "Account Status";
  }
}

export default async function ManagePage({ params, searchParams }: ManagePageProps) {
  const { slug } = await params;
  const { token } = await searchParams;
  const manageToken = typeof token === "string" ? token.trim() : "";

  const location = await prisma.location.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionStatus: true,
            trialStartedAt: true,
            trialEndsAt: true,
            paidThrough: true,
            autoRenewEnabled: true,
            deactivatedAt: true,
            featureRequests: {
              orderBy: { createdAt: "desc" },
              take: 5,
              select: {
                id: true,
                ownerEmail: true,
                details: true,
                createdAt: true,
              },
            },
          },
        },
      },
  });

  if (!location) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
        <Card className="space-y-3">
          <h1 className="text-xl font-semibold text-slate-900">Business setup not found</h1>
          <p className="text-sm text-slate-600">This management link may be incomplete or invalid.</p>
          <Link href="/signup" className="text-sm font-medium text-slate-900 underline">
            Create account
          </Link>
        </Card>
      </main>
    );
  }

  const cookieStore = await cookies();
  const ownerSessionToken = cookieStore.get(OWNER_SESSION_COOKIE_NAME)?.value ?? "";
  const hasValidOwnerSession = isOwnerSessionValidForBusiness(ownerSessionToken, {
    businessId: location.business.id,
    locationSlug: location.slug,
  });
  const hasValidManageToken =
    manageToken.length > 0 && isManageTokenValidForBusiness(manageToken, location.business.id);

  if (!hasValidOwnerSession && !hasValidManageToken) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
        <Card className="space-y-3">
          <h1 className="text-xl font-semibold text-slate-900">Owner workspace link expired or invalid</h1>
          <p className="text-sm text-slate-600">
            For account security, this page now requires your signed owner workspace link.
          </p>
          <p className="text-sm text-slate-600">
            Open the latest owner workspace link from your signup confirmation page or request a fresh access link.
          </p>
          <Link href="/dashboard/access" className="text-sm font-medium text-slate-900 underline">
            Request owner workspace access
          </Link>
        </Card>
      </main>
    );
  }

  const access = evaluateBusinessAccess({
    subscriptionStatus: location.business.subscriptionStatus,
    trialEndsAt: location.business.trialEndsAt,
    paidThrough: location.business.paidThrough,
    autoRenewEnabled: location.business.autoRenewEnabled,
    deactivatedAt: location.business.deactivatedAt,
  });

  const isMonthlySubscriptionActive =
    location.business.subscriptionStatus === SubscriptionStatus.ACTIVE_PAID &&
    location.business.autoRenewEnabled;
  const statusSectionLabel = getStatusSectionLabel(location.business.subscriptionStatus);

  const activeWindowEnd =
    location.business.subscriptionStatus === SubscriptionStatus.ACTIVE_PAID
      ? location.business.paidThrough
      : location.business.trialEndsAt;
  const dayDelta = getDayDelta(activeWindowEnd);
  const isRecoverableExpired = !access.isActive && access.reason === "expired";
  const daysRemaining = dayDelta === null ? null : Math.max(dayDelta, 0);
  const daysSinceExpiry = dayDelta === null ? null : Math.abs(Math.min(dayDelta, 0));

  await trackValidationEvent({
    event: validationEvent.manageViewed,
    businessId: location.business.id,
    locationId: location.id,
    metadata: {
      subscriptionStatus: location.business.subscriptionStatus,
      accessReason: access.reason,
    },
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
      <Card className="mb-6 space-y-2 border-sky-200 bg-sky-50">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-700">Workspace update</p>
        <p className="text-sm text-slate-700">
          Billing and module subscriptions now live in Dashboard to keep owner setup in one place.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-slate-900 underline">
          Open Dashboard billing and entitlements
        </Link>
      </Card>

      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {statusSectionLabel}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{location.business.name}</h1>
            <p className="text-sm text-slate-600">Location: {location.name}</p>
            {access.isActive ? (
              <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                Active
              </p>
            ) : null}
            {isRecoverableExpired ? (
              <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                Expired but recoverable
              </p>
            ) : null}
            {!access.isActive && access.reason === "canceled" ? (
              <p className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                Inactive
              </p>
            ) : null}
            {!access.isActive && access.reason === "misconfigured" ? (
              <p className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                Missing setup
              </p>
            ) : null}
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Current status:</span>{" "}
              {getStatusLabel(location.business.subscriptionStatus)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Trial started:</span>{" "}
              {formatDate(location.business.trialStartedAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Trial ends:</span>{" "}
              {formatDate(location.business.trialEndsAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Paid through:</span>{" "}
              {formatDate(location.business.paidThrough)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Feedback form access:</span>{" "}
              {access.isActive ? "Active" : "Inactive"}
            </p>
            <p>
              <span className="font-medium text-slate-900">Monthly subscription:</span>{" "}
              {isMonthlySubscriptionActive ? "Active" : "Not active"}
            </p>
            <p>
              <span className="font-medium text-slate-900">Days remaining:</span>{" "}
              {daysRemaining !== null
                ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`
                : "Not available"}
            </p>
            {!access.isActive && daysSinceExpiry !== null ? (
              <p>
                <span className="font-medium text-slate-900">Expired:</span>{" "}
                {daysSinceExpiry} day{daysSinceExpiry === 1 ? "" : "s"} ago
              </p>
            ) : null}
            {!access.isActive && access.reason === "misconfigured" ? (
              <p className="text-rose-700">
                This account is missing required trial or billing setup data. Recreate signup if this is a new account.
              </p>
            ) : null}
          </div>

          <RenewSubscriptionForm
            businessId={location.business.id}
            isMonthlySubscriptionActive={isMonthlySubscriptionActive}
            manageToken={hasValidManageToken ? manageToken : undefined}
          />
        </Card>

        <Card className="space-y-3">
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h2 className="text-lg font-semibold text-slate-900">Renewal details</h2>
            <p className="text-sm text-slate-700">
              Starting a monthly subscription activates your feedback form right away.
            </p>
            <p className="text-sm text-slate-700">
              Monthly subscriptions stay active until you cancel.
            </p>
            <p className="text-sm text-slate-700">
              Use the same owner email you signed up with to start or cancel your monthly subscription.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-700">Customer feedback link</p>
              <p className="mt-1 break-all text-xs text-slate-600">/feedback/{location.slug}</p>
            </div>
            <Link href={`/feedback/${location.slug}`} className="text-sm font-medium text-slate-900 underline">
              Preview customer form
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-sm font-semibold text-slate-900">Owner feature request</h3>
            <p className="mb-2 text-sm text-slate-700">
              Tell us what would make ReviewBridge more useful in your day-to-day workflow.
            </p>
            <OwnerFeatureRequestForm
              businessId={location.business.id}
              manageToken={hasValidManageToken ? manageToken : undefined}
            />
          </div>
          <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Recent requests
            </p>
            {location.business.featureRequests.length === 0 ? (
              <p className="text-xs text-slate-600">No requests submitted yet.</p>
            ) : (
              <div className="space-y-2 text-xs text-slate-700">
                {location.business.featureRequests.map((request) => (
                  <div key={request.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <p className="font-medium text-slate-800">{new Date(request.createdAt).toLocaleString()}</p>
                    <p className="mt-1">{request.details}</p>
                    <p className="mt-1 text-slate-500">
                      Submitted by {request.ownerEmail === location.business.email ? "owner" : request.ownerEmail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}

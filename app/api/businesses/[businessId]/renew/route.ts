import { SubscriptionStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isManageTokenValidForBusiness } from "@/lib/manage-token";
import { OWNER_SESSION_COOKIE_NAME, isOwnerSessionValidForBusiness } from "@/lib/owner-session";
import { prisma } from "@/lib/prisma";
import { trackValidationEvent, validationEvent } from "@/lib/validation-events";

const RENEWAL_DAYS = 30;

function addDays(from: Date, days: number) {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}

function maxDate(values: Array<Date | null>, fallback: Date) {
  const validDates = values.filter((value): value is Date => Boolean(value));

  if (validDates.length === 0) {
    return fallback;
  }

  return validDates.reduce((latest, current) => (current > latest ? current : latest));
}

export async function POST(
  request: Request,
  context: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { ownerEmail?: unknown; action?: unknown; manageToken?: unknown }
    | null;
  const ownerEmail =
    body && typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : "";
  const action = body && typeof body.action === "string" ? body.action.trim().toLowerCase() : "";
  const manageToken = body && typeof body.manageToken === "string" ? body.manageToken.trim() : "";

  if (!ownerEmail) {
    return NextResponse.json({ error: "Owner email is required to renew." }, { status: 400 });
  }

  if (action !== "start" && action !== "cancel") {
    return NextResponse.json({ error: "action must be start or cancel." }, { status: 400 });
  }

  const existing = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      email: true,
      paidThrough: true,
      trialEndsAt: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  const cookieStore = await cookies();
  const ownerSessionToken = cookieStore.get(OWNER_SESSION_COOKIE_NAME)?.value ?? "";
  const hasValidOwnerSession = isOwnerSessionValidForBusiness(ownerSessionToken, {
    businessId: existing.id,
  });
  const hasValidManageToken =
    manageToken.length > 0 && isManageTokenValidForBusiness(manageToken, existing.id);

  if (!hasValidOwnerSession && !hasValidManageToken) {
    return NextResponse.json({ error: "Manage token is invalid or expired." }, { status: 401 });
  }

  if (existing.email.toLowerCase() !== ownerEmail) {
    return NextResponse.json({ error: "Owner email does not match this business." }, { status: 403 });
  }

  const now = new Date();
  const billingAnchor = maxDate([existing.paidThrough, existing.trialEndsAt], now);
  const nextPaidThrough = addDays(billingAnchor, RENEWAL_DAYS);

  const updated = await prisma.business.update({
    where: { id: businessId },
    data:
      action === "start"
        ? {
            subscriptionStatus: SubscriptionStatus.ACTIVE_PAID,
            paidThrough: nextPaidThrough,
            autoRenewEnabled: true,
            deactivatedAt: null,
          }
        : {
            subscriptionStatus: SubscriptionStatus.INACTIVE_CANCELED,
            autoRenewEnabled: false,
            deactivatedAt: now,
          },
    select: {
      id: true,
      subscriptionStatus: true,
      paidThrough: true,
      autoRenewEnabled: true,
    },
  });

  await trackValidationEvent({
    event:
      action === "start"
        ? validationEvent.subscriptionStarted
        : validationEvent.subscriptionCanceled,
    businessId: updated.id,
    metadata: {
      action,
      subscriptionStatus: updated.subscriptionStatus,
      autoRenewEnabled: updated.autoRenewEnabled,
    },
  });

  return NextResponse.json({
    ok: true,
    renewalDays: RENEWAL_DAYS,
    action,
    businessId: updated.id,
    subscriptionStatus: updated.subscriptionStatus,
    paidThrough: updated.paidThrough,
    autoRenewEnabled: updated.autoRenewEnabled,
  });
}

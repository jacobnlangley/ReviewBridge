import { SubscriptionStatus } from "@prisma/client";

export type SubscriptionAccessReason =
  | "trial_active"
  | "paid_active"
  | "expired"
  | "canceled"
  | "misconfigured";

type AccessInput = {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  paidThrough: Date | null;
  autoRenewEnabled: boolean;
  deactivatedAt: Date | null;
};

export function evaluateBusinessAccess(
  input: AccessInput,
  now = new Date(),
): { isActive: boolean; reason: SubscriptionAccessReason } {
  if (input.deactivatedAt) {
    return { isActive: false, reason: "expired" };
  }

  switch (input.subscriptionStatus) {
    case SubscriptionStatus.TRIAL_ACTIVE:
      if (!input.trialEndsAt) {
        return { isActive: false, reason: "misconfigured" };
      }

      return input.trialEndsAt >= now
        ? { isActive: true, reason: "trial_active" }
        : { isActive: false, reason: "expired" };

    case SubscriptionStatus.ACTIVE_PAID:
      if (input.autoRenewEnabled) {
        return { isActive: true, reason: "paid_active" };
      }

      if (!input.paidThrough) {
        return { isActive: false, reason: "misconfigured" };
      }

      return input.paidThrough >= now
        ? { isActive: true, reason: "paid_active" }
        : { isActive: false, reason: "expired" };

    case SubscriptionStatus.INACTIVE_EXPIRED:
      return { isActive: false, reason: "expired" };

    case SubscriptionStatus.INACTIVE_CANCELED:
      return { isActive: false, reason: "canceled" };

    default:
      return { isActive: false, reason: "misconfigured" };
  }
}

import {
  FollowUpPreference,
  NotificationChannel,
  NotificationStatus,
  Sentiment,
} from "@prisma/client";
import { sendFeedbackNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { formatSmsAlertBody, sendSmsNotification } from "@/lib/sms";

type AlertSummary = {
  email: "sent" | "failed" | "skipped";
  sms: "sent" | "failed" | "skipped";
};

type SendAlertsInput = {
  feedbackId: string;
  sentiment: Sentiment;
  message: string | null;
  wantsFollowUp: boolean;
  followUpPreference: FollowUpPreference | null;
  phone: string | null;
  customerName: string | null;
  customerEmail: string | null;
  location: {
    name: string;
    business: {
      id: string;
      name: string;
      email: string;
      instantEmailNeutral: boolean;
      instantEmailNegative: boolean;
      smsNegativeEnabled: boolean;
      alertPhone: string | null;
    };
  };
};

function fromNotificationStatus(status: NotificationStatus): "sent" | "failed" | "skipped" {
  if (status === NotificationStatus.SENT) {
    return "sent";
  }

  if (status === NotificationStatus.FAILED) {
    return "failed";
  }

  return "skipped";
}

function toFollowUpPreferenceForEmail(
  followUpPreference: FollowUpPreference | null,
): "text" | "call" | "email" | null {
  if (followUpPreference === FollowUpPreference.TEXT) {
    return "text";
  }

  if (followUpPreference === FollowUpPreference.CALL) {
    return "call";
  }

  if (followUpPreference === FollowUpPreference.EMAIL) {
    return "email";
  }

  return null;
}

async function recordNotificationEvent(input: {
  feedbackId: string;
  businessId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  reason?: string;
  providerMessageId?: string | null;
  errorMessage?: string | null;
}) {
  await prisma.notificationEvent.create({
    data: {
      feedbackId: input.feedbackId,
      businessId: input.businessId,
      channel: input.channel,
      status: input.status,
      reason: input.reason ?? null,
      providerMessageId: input.providerMessageId ?? null,
      errorMessage: input.errorMessage ?? null,
    },
  });
}

export async function sendFeedbackAlerts(input: SendAlertsInput): Promise<AlertSummary> {
  const businessId = input.location.business.id;
  let emailStatus: NotificationStatus = NotificationStatus.SKIPPED;
  let smsStatus: NotificationStatus = NotificationStatus.SKIPPED;

  const shouldSendEmail =
    (input.sentiment === Sentiment.NEUTRAL && input.location.business.instantEmailNeutral) ||
    (input.sentiment === Sentiment.NEGATIVE && input.location.business.instantEmailNegative);

  if (shouldSendEmail) {
    const emailResult = await sendFeedbackNotification({
      businessEmail: input.location.business.email,
      locationName: input.location.name,
      sentiment: input.sentiment === Sentiment.NEGATIVE ? "negative" : "neutral",
      message: input.message,
      wantsFollowUp: input.wantsFollowUp,
      followUpPreference: toFollowUpPreferenceForEmail(input.followUpPreference),
      phone: input.phone,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
    });

    emailStatus = emailResult.sent ? NotificationStatus.SENT : NotificationStatus.FAILED;

    await recordNotificationEvent({
      feedbackId: input.feedbackId,
      businessId,
      channel: NotificationChannel.EMAIL,
      status: emailResult.sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
      reason: emailResult.skipped ? "EMAIL_DISABLED_OR_UNCONFIGURED" : undefined,
      providerMessageId: emailResult.providerMessageId,
      errorMessage: emailResult.errorMessage,
    });
  } else {
    await recordNotificationEvent({
      feedbackId: input.feedbackId,
      businessId,
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.SKIPPED,
      reason: "PREFERENCE_DISABLED",
    });
  }

  const shouldSendSms =
    input.sentiment === Sentiment.NEGATIVE && input.location.business.smsNegativeEnabled;

  if (shouldSendSms) {
    const alertPhone = input.location.business.alertPhone;

    if (!alertPhone) {
      await recordNotificationEvent({
        feedbackId: input.feedbackId,
        businessId,
        channel: NotificationChannel.SMS,
        status: NotificationStatus.SKIPPED,
        reason: "MISSING_ALERT_PHONE",
      });
    } else {
      const smsResult = await sendSmsNotification({
        toPhone: alertPhone,
        body: formatSmsAlertBody({
          businessName: input.location.business.name,
          locationName: input.location.name,
          message: input.message,
          followUpPreference: toFollowUpPreferenceForEmail(input.followUpPreference),
        }),
      });

      smsStatus = smsResult.sent ? NotificationStatus.SENT : NotificationStatus.FAILED;

      await recordNotificationEvent({
        feedbackId: input.feedbackId,
        businessId,
        channel: NotificationChannel.SMS,
        status: smsResult.sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
        reason: smsResult.skipped ? "SMS_UNCONFIGURED" : undefined,
        providerMessageId: smsResult.providerMessageId,
        errorMessage: smsResult.errorMessage,
      });
    }
  } else {
    await recordNotificationEvent({
      feedbackId: input.feedbackId,
      businessId,
      channel: NotificationChannel.SMS,
      status: NotificationStatus.SKIPPED,
      reason: "NOT_NEGATIVE_OR_DISABLED",
    });
  }

  return {
    email: fromNotificationStatus(emailStatus),
    sms: fromNotificationStatus(smsStatus),
  };
}

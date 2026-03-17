import { FollowUpPreference, Sentiment } from "@prisma/client";
import { NextResponse } from "next/server";
import { sendFeedbackNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";

type FeedbackRequestBody = {
  slug?: unknown;
  locationId?: unknown;
  sentiment?: unknown;
  message?: unknown;
  wantsFollowUp?: unknown;
  followUpPreference?: unknown;
  phone?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
};

const sentimentMap: Record<"positive" | "neutral" | "negative", Sentiment> = {
  positive: Sentiment.POSITIVE,
  neutral: Sentiment.NEUTRAL,
  negative: Sentiment.NEGATIVE,
};

const followUpPreferenceMap: Record<"text" | "call" | "email", FollowUpPreference> = {
  text: FollowUpPreference.TEXT,
  call: FollowUpPreference.CALL,
  email: FollowUpPreference.EMAIL,
};

export async function POST(request: Request) {
  let body: FeedbackRequestBody;

  try {
    body = (await request.json()) as FeedbackRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const locationId = typeof body.locationId === "string" ? body.locationId.trim() : "";
  const sentimentRaw = typeof body.sentiment === "string" ? body.sentiment : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const wantsFollowUp = typeof body.wantsFollowUp === "boolean" ? body.wantsFollowUp : false;
  const followUpPreferenceRaw =
    typeof body.followUpPreference === "string" ? body.followUpPreference : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";

  if (!slug && !locationId) {
    return NextResponse.json({ error: "slug or locationId is required." }, { status: 400 });
  }

  if (!(sentimentRaw in sentimentMap)) {
    return NextResponse.json({ error: "Invalid sentiment value." }, { status: 400 });
  }

  const sentiment = sentimentMap[sentimentRaw as "positive" | "neutral" | "negative"];

  if ((sentiment === Sentiment.NEGATIVE || sentiment === Sentiment.NEUTRAL) && !message) {
    return NextResponse.json({ error: "Message is required for private feedback." }, { status: 400 });
  }

  let followUpPreference: FollowUpPreference | null = null;
  let followUpPreferenceForEmail: "text" | "call" | "email" | null = null;

  if (wantsFollowUp) {
    if (!(followUpPreferenceRaw in followUpPreferenceMap)) {
      return NextResponse.json(
        { error: "Preferred contact method is required when follow-up is requested." },
        { status: 400 },
      );
    }

    followUpPreference =
      followUpPreferenceMap[followUpPreferenceRaw as "text" | "call" | "email"];
    followUpPreferenceForEmail = followUpPreferenceRaw as "text" | "call" | "email";

    if (
      (followUpPreference === FollowUpPreference.TEXT ||
        followUpPreference === FollowUpPreference.CALL) &&
      !phone
    ) {
      return NextResponse.json(
        { error: "Phone number is required for text or call follow-up." },
        { status: 400 },
      );
    }

    if (followUpPreference === FollowUpPreference.EMAIL && !customerEmail) {
      return NextResponse.json(
        { error: "Email is required for email follow-up." },
        { status: 400 },
      );
    }
  }

  const location = await prisma.location.findFirst({
    where: slug ? { slug } : { id: locationId },
    include: { business: true },
  });

  if (!location) {
    return NextResponse.json({ error: "Location not found." }, { status: 404 });
  }

  await prisma.feedback.create({
    data: {
      locationId: location.id,
      sentiment,
      message: message || null,
      wantsFollowUp,
      followUpPreference,
      phone: wantsFollowUp ? phone || null : null,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
    },
  });

  if (sentiment === Sentiment.NEUTRAL || sentiment === Sentiment.NEGATIVE) {
    await sendFeedbackNotification({
      businessEmail: location.business.email,
      locationName: location.name,
      sentiment: sentimentRaw as "positive" | "neutral" | "negative",
      message: message || null,
      wantsFollowUp,
      followUpPreference: followUpPreferenceForEmail,
      phone: wantsFollowUp ? phone || null : null,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

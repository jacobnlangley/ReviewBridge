import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isManageTokenValidForBusiness } from "@/lib/manage-token";
import { OWNER_SESSION_COOKIE_NAME, isOwnerSessionValidForBusiness } from "@/lib/owner-session";
import { prisma } from "@/lib/prisma";
import { trackValidationEvent, validationEvent } from "@/lib/validation-events";

type FeatureRequestBody = {
  ownerEmail?: unknown;
  details?: unknown;
  manageToken?: unknown;
};

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await context.params;

  let body: FeatureRequestBody;

  try {
    body = (await request.json()) as FeatureRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const ownerEmail = typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : "";
  const details = typeof body.details === "string" ? body.details.trim() : "";
  const manageToken = typeof body.manageToken === "string" ? body.manageToken.trim() : "";

  if (!ownerEmail || !details) {
    return NextResponse.json(
      { error: "ownerEmail and details are required." },
      { status: 400 },
    );
  }

  if (!isLikelyEmail(ownerEmail)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (details.length < 10) {
    return NextResponse.json(
      { error: "Please share at least a short description (10+ characters)." },
      { status: 400 },
    );
  }

  if (details.length > 1000) {
    return NextResponse.json({ error: "Please keep the request under 1000 characters." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, email: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  const cookieStore = await cookies();
  const ownerSessionToken = cookieStore.get(OWNER_SESSION_COOKIE_NAME)?.value ?? "";
  const hasValidOwnerSession = isOwnerSessionValidForBusiness(ownerSessionToken, {
    businessId: business.id,
  });
  const hasValidManageToken =
    manageToken.length > 0 && isManageTokenValidForBusiness(manageToken, business.id);

  if (!hasValidOwnerSession && !hasValidManageToken) {
    return NextResponse.json({ error: "Manage token is invalid or expired." }, { status: 401 });
  }

  if (business.email.toLowerCase() !== ownerEmail) {
    return NextResponse.json(
      { error: "Owner email does not match this business account." },
      { status: 403 },
    );
  }

  const featureRequest = await prisma.ownerFeatureRequest.create({
    data: {
      businessId: business.id,
      ownerEmail,
      details,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  await trackValidationEvent({
    event: validationEvent.ownerFeatureRequestSubmitted,
    businessId: business.id,
    metadata: {
      featureRequestId: featureRequest.id,
      detailsLength: details.length,
    },
  });

  return NextResponse.json({ ok: true, featureRequest }, { status: 201 });
}

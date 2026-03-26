import { NextResponse } from "next/server";
import { createManageToken } from "@/lib/manage-token";
import { prisma } from "@/lib/prisma";
import { trackValidationEvent, validationEvent } from "@/lib/validation-events";

type AccessLinkRequestBody = {
  ownerEmail?: unknown;
  locationSlug?: unknown;
};

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: AccessLinkRequestBody;

  try {
    body = (await request.json()) as AccessLinkRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const ownerEmail = typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : "";
  const locationSlug = typeof body.locationSlug === "string" ? body.locationSlug.trim() : "";

  if (!ownerEmail || !locationSlug) {
    return NextResponse.json(
      { error: "ownerEmail and locationSlug are required." },
      { status: 400 },
    );
  }

  if (!isLikelyEmail(ownerEmail)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const location = await prisma.location.findUnique({
    where: { slug: locationSlug },
    select: {
      id: true,
      slug: true,
      business: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!location || location.business.email.toLowerCase() !== ownerEmail) {
    return NextResponse.json(
      { error: "We could not match that owner email and location." },
      { status: 404 },
    );
  }

  const manageToken = createManageToken({ businessId: location.business.id });

  if (!manageToken) {
    return NextResponse.json(
      { error: "Owner access is unavailable right now. Please contact support." },
      { status: 503 },
    );
  }

  const managePath = `/manage/${location.slug}?token=${encodeURIComponent(manageToken)}`;

  await trackValidationEvent({
    event: validationEvent.ownerAccessLinkIssued,
    businessId: location.business.id,
    locationId: location.id,
    metadata: {
      locationSlug: location.slug,
    },
  });

  return NextResponse.json({ ok: true, managePath });
}

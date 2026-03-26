import { NextResponse } from "next/server";
import { OWNER_SESSION_COOKIE_NAME, createOwnerSessionToken } from "@/lib/owner-session";
import { prisma } from "@/lib/prisma";
import { trackValidationEvent, validationEvent } from "@/lib/validation-events";

type OwnerSessionRequestBody = {
  ownerEmail?: unknown;
  locationSlug?: unknown;
};

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: OwnerSessionRequestBody;

  try {
    body = (await request.json()) as OwnerSessionRequestBody;
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

  const sessionToken = createOwnerSessionToken({
    businessId: location.business.id,
    locationSlug: location.slug,
  });

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Owner sign-in is unavailable right now. Please try again." },
      { status: 503 },
    );
  }

  await trackValidationEvent({
    event: validationEvent.ownerAccessLinkIssued,
    businessId: location.business.id,
    locationId: location.id,
    metadata: {
      source: "owner_access_sign_in",
      locationSlug: location.slug,
    },
  });

  const response = NextResponse.json({
    ok: true,
    redirectPath: "/owner",
  });

  response.cookies.set({
    name: OWNER_SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: OWNER_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

import { SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { createManageToken } from "@/lib/manage-token";
import { prisma } from "@/lib/prisma";
import { trackValidationEvent, validationEvent } from "@/lib/validation-events";

type SignupRequestBody = {
  businessName?: unknown;
  ownerEmail?: unknown;
  locationName?: unknown;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function findAvailableSlug(base: string) {
  const normalizedBase = slugify(base) || "business-location";

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const candidate = attempt === 0 ? normalizedBase : `${normalizedBase}-${attempt + 1}`;
    const existing = await prisma.location.findUnique({ where: { slug: candidate }, select: { id: true } });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique location slug.");
}

export async function POST(request: Request) {
  let body: SignupRequestBody;

  try {
    body = (await request.json()) as SignupRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
  const ownerEmail = typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : "";
  const locationName = typeof body.locationName === "string" ? body.locationName.trim() : "";

  if (!businessName || !ownerEmail || !locationName) {
    return NextResponse.json(
      { error: "businessName, ownerEmail, and locationName are required." },
      { status: 400 },
    );
  }

  if (!isLikelyEmail(ownerEmail)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  await trackValidationEvent({
    event: validationEvent.signupStarted,
    metadata: {
      emailDomain: ownerEmail.includes("@") ? ownerEmail.split("@")[1] : null,
    },
  });

  const existingBusiness = await prisma.business.findUnique({
    where: { email: ownerEmail },
    select: { id: true },
  });

  if (existingBusiness) {
    return NextResponse.json(
      {
        error:
          "A business with that email already exists. Use a different email or contact support to reactivate your account.",
      },
      { status: 409 },
    );
  }

  const now = new Date();
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  const slug = await findAvailableSlug(`${businessName}-${locationName}`);

  const created = await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name: businessName,
        email: ownerEmail,
        subscriptionStatus: SubscriptionStatus.TRIAL_ACTIVE,
        trialStartedAt: now,
        trialEndsAt,
        paidThrough: null,
        deactivatedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      },
    });

    const location = await tx.location.create({
      data: {
        businessId: business.id,
        name: locationName,
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return { business, location };
  });

  await trackValidationEvent({
    event: validationEvent.signupCompleted,
    businessId: created.business.id,
    locationId: created.location.id,
  });

  const manageToken = createManageToken({ businessId: created.business.id });

  return NextResponse.json(
    {
      ok: true,
      business: created.business,
      location: created.location,
      manageToken,
    },
    { status: 201 },
  );
}

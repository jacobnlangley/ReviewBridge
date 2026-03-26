import { FeedbackStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StatusRequestBody = {
  status?: unknown;
  internalNotes?: unknown;
};

const feedbackStatusMap: Record<string, FeedbackStatus> = {
  NEW: FeedbackStatus.NEW,
  IN_PROGRESS: FeedbackStatus.IN_PROGRESS,
  RESOLVED: FeedbackStatus.RESOLVED,
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: StatusRequestBody;

  try {
    body = (await request.json()) as StatusRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const statusRaw = typeof body.status === "string" ? body.status.trim() : "";
  const internalNotesRaw = typeof body.internalNotes === "string" ? body.internalNotes.trim() : null;

  if (!statusRaw || !(statusRaw in feedbackStatusMap)) {
    return NextResponse.json({ error: "Valid status is required." }, { status: 400 });
  }

  const nextStatus = feedbackStatusMap[statusRaw];

  const current = await prisma.feedback.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      firstRespondedAt: true,
    },
  });

  if (!current) {
    return NextResponse.json({ error: "Feedback not found." }, { status: 404 });
  }

  const now = new Date();
  const shouldSetFirstRespondedAt =
    current.status === FeedbackStatus.NEW &&
    nextStatus !== FeedbackStatus.NEW &&
    current.firstRespondedAt === null;

  const updated = await prisma.feedback.update({
    where: { id },
    data: {
      status: nextStatus,
      ...(internalNotesRaw === null ? {} : { internalNotes: internalNotesRaw }),
      ...(shouldSetFirstRespondedAt ? { firstRespondedAt: now } : {}),
      ...(nextStatus === FeedbackStatus.RESOLVED
        ? { resolvedAt: now }
        : nextStatus === FeedbackStatus.NEW
          ? { resolvedAt: null }
          : {}),
    },
    select: {
      id: true,
      status: true,
      firstRespondedAt: true,
      resolvedAt: true,
      internalNotes: true,
    },
  });

  return NextResponse.json({
    ok: true,
    feedback: updated,
  });
}

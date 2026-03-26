import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/owner-session";
import { prisma } from "@/lib/prisma";

export async function getOwnerWorkspaceContextOrRedirect() {
  const ownerSession = await getOwnerSession();

  if (!ownerSession) {
    redirect("/dashboard/access");
  }

  const location = await prisma.location.findUnique({
    where: { slug: ownerSession.locationSlug },
    select: {
      slug: true,
      name: true,
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!location || location.business.id !== ownerSession.businessId) {
    redirect("/dashboard/access");
  }

  return {
    businessId: location.business.id,
    businessName: location.business.name,
    locationName: location.name,
    locationSlug: location.slug,
  };
}

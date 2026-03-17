import { FollowUpPreference, PrismaClient, Sentiment } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.upsert({
    where: { email: "owner@democoffee.com" },
    update: { name: "Demo Coffee Co" },
    create: {
      name: "Demo Coffee Co",
      email: "owner@democoffee.com",
    },
  });

  const location = await prisma.location.upsert({
    where: { slug: "demo-coffee-downtown" },
    update: {
      name: "Downtown",
      reviewLink: "https://example.com/review/demo-coffee-downtown",
      googleReviewLink: "https://g.page/r/demo-coffee/review",
      yelpReviewLink: "https://www.yelp.com/writeareview/biz/demo-coffee",
      businessId: business.id,
    },
    create: {
      businessId: business.id,
      name: "Downtown",
      slug: "demo-coffee-downtown",
      reviewLink: "https://example.com/review/demo-coffee-downtown",
      googleReviewLink: "https://g.page/r/demo-coffee/review",
      yelpReviewLink: "https://www.yelp.com/writeareview/biz/demo-coffee",
    },
  });

  await prisma.feedback.deleteMany({ where: { locationId: location.id } });

  await prisma.feedback.createMany({
    data: [
      {
        locationId: location.id,
        sentiment: Sentiment.NEGATIVE,
        message: "My drink took a long time and the order was wrong.",
        wantsFollowUp: true,
        followUpPreference: FollowUpPreference.TEXT,
        phone: "555-123-4567",
        customerName: "Taylor",
        customerEmail: "taylor@example.com",
      },
      {
        locationId: location.id,
        sentiment: Sentiment.NEUTRAL,
        message: "The staff was kind, but the shop was very busy and hard to navigate.",
        wantsFollowUp: true,
        followUpPreference: FollowUpPreference.EMAIL,
        customerName: "Jordan",
        customerEmail: "jordan@example.com",
      },
      {
        locationId: location.id,
        sentiment: Sentiment.POSITIVE,
        message: "Great coffee and really friendly service.",
        wantsFollowUp: false,
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

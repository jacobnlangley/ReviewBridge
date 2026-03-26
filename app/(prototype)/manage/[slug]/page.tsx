import { redirect } from "next/navigation";

type ManagePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ManagePage({ params, searchParams }: ManagePageProps) {
  const { slug } = await params;
  const { token } = await searchParams;
  const normalizedSlug = typeof slug === "string" ? slug.trim() : "";
  const manageToken = typeof token === "string" ? token.trim() : "";

  const nextPath = manageToken
    ? `/dashboard/reviews?slug=${encodeURIComponent(normalizedSlug)}&token=${encodeURIComponent(manageToken)}`
    : `/dashboard/reviews?slug=${encodeURIComponent(normalizedSlug)}`;

  redirect(nextPath);
}

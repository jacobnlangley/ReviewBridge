export function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return appUrl && appUrl.length > 0 ? appUrl.replace(/\/$/, "") : "http://localhost:3000";
}

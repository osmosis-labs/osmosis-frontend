export const getBaseUrl = (absolute = false) => {
  if (!absolute && typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export function removeQueryParam(key: string) {
  if (!key) return;
  if (typeof window === "undefined") return;
  const url = new URL(location.href);
  url.searchParams.delete(key);
  window.history.replaceState(null, document.title, url.href);
}

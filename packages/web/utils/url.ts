export function removeQueryParam(key: string) {
  if (!key) return;
  if (typeof window === "undefined") return;
  const url = new URL(location.href);
  url.searchParams.delete(key);
  window.history.replaceState(null, document.title, url.href);
}

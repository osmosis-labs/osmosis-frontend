export function removeQueryParam(key: string) {
  if (!key) return;
  if (typeof window === "undefined") return;
  const url = new URL(location.href);
  url.searchParams.delete(key);
  window.history.replaceState(null, document.title, url.href);
}

export function searchParamsToDict<T>(searchParams: URLSearchParams): T {
  return Object.fromEntries(
    Array.from(searchParams.entries()).map(([key, value]) => {
      try {
        return [key, JSON.parse(value)];
      } catch (e) {
        // If a value is not a valid JSON, return it as is
        return [key, value];
      }
    })
  ) as T;
}

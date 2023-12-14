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

/**
 * This function is used to get the base URL for the application.
 * It checks the environment in which the application is running and returns the appropriate base URL.
 *
 * @returns {string} The base URL of the application.
 *
 * - If the application is running in a browser environment (i.e., client-side), it returns an empty string.
 *   This is because in a browser environment, relative URLs are used.
 *
 * - If the application is running on Vercel (i.e., during Server Side Rendering or SSR), it returns the Vercel URL.
 *   The Vercel URL is fetched from the environment variable `VERCEL_URL`.
 *
 * - If the application is running on a local development server (i.e., during development SSR), it returns the localhost URL.
 *   The port is fetched from the environment variable `PORT`. If `PORT` is not defined, it defaults to 3000.
 */
export function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

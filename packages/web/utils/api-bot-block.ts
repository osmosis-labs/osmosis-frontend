/**
 * Whether an API request comes from the Python requests library. These are likely bots using our
 * API backend for arbs or other purposes. The API Worker checks this before
 * serving a cached response.
 */
export function isBlockedApiUserAgent(userAgent: string | null): boolean {
  return (userAgent ?? "").includes("python-requests");
}

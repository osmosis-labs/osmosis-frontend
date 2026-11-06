/**
 * Whether an API request comes from the Python requests library. These are likely bots using our
 * router backend for arbs or other purposes. Shared by the middleware and the Cloudflare Worker's
 * API cache, which must not serve cached responses to clients the middleware blocks.
 */
export function isBlockedApiUserAgent(userAgent: string | null): boolean {
  return (userAgent ?? "").includes("python-requests");
}

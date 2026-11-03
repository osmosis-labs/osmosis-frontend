import type { NextRequest } from "next/server";

import { isBlockedApiUserAgent } from "~/utils/api-bot-block";

export function middleware(request: NextRequest) {
  if (isBlockedApiUserAgent(request.headers.get("user-agent"))) {
    return new Response("Forbidden", { status: 403 });
  }
}

export const config = {
  // The bot check protects API backends; avoid invoking middleware for pages and assets.
  matcher: "/api/:path*",
};

import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // This will block requests from the Python requests library
  // These are likely bots trying to user our router backend for arbs or other purposes
  const userAgent = request.headers.get("user-agent") || "";
  if (userAgent.includes("python-requests")) {
    return new Response("Forbidden", { status: 403 });
  }
}

export const config = {
  matcher: "/(.*)",
};

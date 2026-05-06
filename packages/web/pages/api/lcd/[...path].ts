const LCD_BASE_URL = (
  process.env.NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE ?? "https://lcd.osmosis.zone"
).replace(/\/$/, "");

/**
 * Server-side proxy for Osmosis LCD REST endpoints.
 *
 * lcd.osmosis.zone does not serve CORS headers to browser origins, so
 * all LCD requests from the browser must go through this server-side
 * route. In production the server IP is whitelisted by lcd.osmosis.zone.
 * In local dev, set NEXT_PUBLIC_OSMOSIS_REST_OVERWRITE to a reachable LCD.
 */
export default async function handler(req: Request) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);

  // Extract the portion of the path after /api/lcd/
  const prefix = "/api/lcd/";
  const idx = url.pathname.indexOf(prefix);
  if (idx === -1) {
    return new Response(JSON.stringify({ error: "Invalid LCD proxy path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pathAndQuery = url.pathname.slice(idx + prefix.length) + url.search;
  const upstream = `${LCD_BASE_URL}/${pathAndQuery}`;

  try {
    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "LCD upstream unavailable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  runtime: "edge",
};

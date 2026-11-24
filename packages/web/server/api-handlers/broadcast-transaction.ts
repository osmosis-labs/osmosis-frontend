import { ChainList } from "~/config/generated/chain-list";
import { readJsonBody } from "~/server/api-handlers/request-body";
import { findAllowedRestEndpoint } from "~/utils/url";

const ALLOWED_BROADCAST_MODES = new Set([
  "BROADCAST_MODE_SYNC",
  "BROADCAST_MODE_ASYNC",
  "BROADCAST_MODE_BLOCK",
  "sync",
  "async",
  "block",
]);

const UPSTREAM_BROADCAST_TIMEOUT_MS = 15_000;

let allowedRestAddressesCache: string[] | undefined;
function getAllowedRestAddresses(): string[] {
  if (!allowedRestAddressesCache) {
    allowedRestAddressesCache = ChainList.flatMap(
      ({ apis }) => apis?.rest?.map(({ address }) => address) ?? []
    );
  }
  return allowedRestAddressesCache;
}

/**
 * Broadcasts a transaction to the chain.
 *
 * We require this endpoint since many nodes do not have CORS enabled. Without CORS,
 * a node is unable to interact directly with browsers unless it's updated to incorporate
 * the CORS headers. Therefore, by having this endpoint, we can ensure that
 * users can still broadcast their transactions to the network.
 */
export async function broadcastTransactionHandler(req: Request) {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const parsed = await readJsonBody<{
    restEndpoint?: unknown;
    tx_bytes?: unknown;
    mode?: unknown;
  }>(req);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  const body = parsed.body;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const matchedRestEndpoint =
    typeof body.restEndpoint === "string"
      ? findAllowedRestEndpoint(body.restEndpoint, getAllowedRestAddresses())
      : null;

  if (!matchedRestEndpoint) {
    // Log only the origin of the refused endpoint so Workers Logs show which
    // hosts clients try to broadcast through.
    let origin = "unparseable";
    try {
      origin = new URL(String(body.restEndpoint)).origin;
    } catch {
      // keep "unparseable"
    }
    console.warn("broadcast-transaction: rest endpoint not allowed", origin);
    return Response.json({ error: "Invalid rest endpoint" }, { status: 400 });
  }

  if (
    typeof body.tx_bytes !== "string" ||
    body.tx_bytes.length === 0 ||
    typeof body.mode !== "string" ||
    !ALLOWED_BROADCAST_MODES.has(body.mode)
  ) {
    return Response.json(
      { error: "Invalid tx_bytes or mode" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${matchedRestEndpoint}/cosmos/tx/v1beta1/txs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_bytes: body.tx_bytes,
          mode: body.mode,
        }),
        signal: AbortSignal.timeout(UPSTREAM_BROADCAST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      throw new Error("Response is not ok");
    }

    const result = await response.json();

    return Response.json(result, { status: 200 });
  } catch {
    return Response.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

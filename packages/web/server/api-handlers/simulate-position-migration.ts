import { decodeAnyBase64, simulateCosmosTxBody } from "@osmosis-labs/tx";
import { ApiClientError } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";
import { readJsonBody } from "~/server/api-handlers/request-body";

/**
 * Simulates a position migration and returns the coins the account would
 * actually spend, which become `tokenMinAmount0/1` on the create-position
 * message.
 *
 * Those minimums are the only onchain protection in this flow: with them set,
 * a create that would land on worse terms fails and the batched withdraw
 * reverts with it, leaving the original position untouched. At zero, a
 * mispriced create succeeds silently. So the amounts have to come from the
 * chain's own accounting rather than from a client-side reimplementation of
 * liquidity math, which could disagree with the chain's rounding and either
 * revert every honest migration or floor at a uselessly low value.
 *
 * Separate from `/api/estimate-gas-fee` because that route intentionally
 * returns only gas and fee; this one needs the spent-coin totals, and the
 * shared route is on the path of every transaction in the app.
 *
 * Exists as an endpoint for the same reason as the gas route: many nodes do
 * not send CORS headers, so the browser cannot query simulate directly.
 */
export async function simulatePositionMigrationHandler(req: Request) {
  // Body content is sent from the client, so this has to be a POST.
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const parsed = await readJsonBody<{
    chainId: string;
    messages: { typeUrl: string; value: string }[];
    bech32Address: string;
  }>(req);
  if ("errorResponse" in parsed) return parsed.errorResponse;

  const { chainId, messages, bech32Address } = parsed.body;

  if (!chainId || !messages?.length || !bech32Address) {
    return Response.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const decodedMessages = messages.map(decodeAnyBase64);

    const { gasUsed, coinsSpent, events } = await simulateCosmosTxBody({
      chainId,
      chainList: ChainList,
      body: { messages: decodedMessages },
      bech32Address,
    });

    // Only the event types the migration sizing reads; the full event list of a
    // three-message transaction is large and mostly bank noise.
    const relevantEvents = events.filter(
      (e) =>
        e.type === "withdraw_position" ||
        e.type === "token_swapped" ||
        e.type === "create_position"
    );

    return Response.json({ gasUsed, coinsSpent, events: relevantEvents });
  } catch (e) {
    // A failed simulation is a legitimate outcome here, not just an error to
    // log: it is how the flow learns the migration would not succeed. Forward
    // the chain's own message so the caller can surface why.
    if (e instanceof ApiClientError) {
      const apiClientError = e as ApiClientError<{
        code?: number;
        message: string;
      }>;
      const message = apiClientError?.data?.message;
      if (message) return Response.json({ error: message }, { status: 400 });
    }

    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 });
    }

    return Response.json(
      { error: "Failed to simulate migration" },
      { status: 500 }
    );
  }
}

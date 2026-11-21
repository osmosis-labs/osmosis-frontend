import { BridgeEnvironment, SkipApiClient } from "@osmosis-labs/bridge";

const ALLOWED_ENVS = new Set<BridgeEnvironment>(["mainnet", "testnet"]);
const CHAIN_ID_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;
const TX_HASH_PATTERN = /^[a-zA-Z0-9]{8,128}$/;

/** API route that calls Skip on the server, where `SKIP_API_KEY` is available. */
export function createSkipTxHandler(
  query: (
    client: SkipApiClient,
    params: { chainID: string; txHash: string }
  ) => Promise<unknown>,
  allowedMethods: readonly ("GET" | "POST")[] = ["GET"]
) {
  return async (req: Request) => {
    if (!allowedMethods.includes(req.method as "GET" | "POST")) {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const searchParams = new URL(req.url).searchParams;
    const chainID = searchParams.get("chainID");
    const txHash = searchParams.get("txHash");
    const env = searchParams.get("env") as BridgeEnvironment | null;

    if (!chainID || !txHash || !env) {
      return Response.json(
        { error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_ENVS.has(env) ||
      !CHAIN_ID_PATTERN.test(chainID) ||
      !TX_HASH_PATTERN.test(txHash)
    ) {
      return Response.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    try {
      const result = await query(new SkipApiClient(env), { chainID, txHash });
      return Response.json(result);
    } catch (error) {
      console.error("Skip tx handler failed", error);
      return Response.json(
        { error: "Upstream Skip API request failed" },
        { status: 500 }
      );
    }
  };
}

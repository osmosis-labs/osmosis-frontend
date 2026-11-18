import { BridgeEnvironment, SkipApiClient } from "@osmosis-labs/bridge";

/** API route that calls Skip on the server, where `SKIP_API_KEY` is available. */
export function createSkipTxHandler(
  query: (
    client: SkipApiClient,
    params: { chainID: string; txHash: string }
  ) => Promise<unknown>
) {
  return async (req: Request) => {
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

    try {
      const result = await query(new SkipApiClient(env), { chainID, txHash });
      return Response.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  };
}

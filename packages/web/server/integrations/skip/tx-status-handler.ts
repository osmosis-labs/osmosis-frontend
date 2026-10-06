import { BridgeEnvironment, SkipApiClient } from "@osmosis-labs/bridge";
import { NextApiRequest, NextApiResponse } from "next";

/** API route that calls Skip on the server, where `SKIP_API_KEY` is available. */
export function createSkipTxHandler(
  query: (
    client: SkipApiClient,
    params: { chainID: string; txHash: string }
  ) => Promise<unknown>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { chainID, txHash, env } = req.query as {
      chainID: string;
      txHash: string;
      env: BridgeEnvironment;
    };

    if (!chainID || !txHash || !env) {
      return res
        .status(400)
        .json({ error: "Missing required query parameters" });
    }

    try {
      const result = await query(new SkipApiClient(env), { chainID, txHash });
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: "An unknown error occurred" });
    }
  };
}

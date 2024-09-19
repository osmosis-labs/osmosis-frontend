import { BridgeEnvironment, SkipApiClient } from "@osmosis-labs/bridge";
import { NextApiRequest, NextApiResponse } from "next";

/** This edge function is necessary to invoke the SkipApiClient on the server
 *  as a secret API key is required for the client.
 */
export default async function skipTrackTx(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chainID, txHash, env } = req.query as {
    chainID: string;
    txHash: string;
    env: BridgeEnvironment;
  };

  if (!chainID || !txHash || !env) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  const skipClient = new SkipApiClient(env);

  try {
    const status = await skipClient.trackTransaction({ chainID, txHash });
    return res.status(200).json(status);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred" });
  }
}

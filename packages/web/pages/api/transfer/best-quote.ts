import { NextApiRequest, NextApiResponse } from "next";

import {
  createSquidClient,
  SquidBridgeProvider,
} from "../../../integrations/bridges/squid";

export default async function pools(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const squidClient = await createSquidClient();
    const squidProvider = new SquidBridgeProvider(squidClient);
    return res.status(200).json({ assets: await squidProvider.getAssets() });
  } catch (e) {
    const error = e as { status?: number };
    return new Response(
      error?.status === 404 ? "Not Found" : "Unexpected Error",
      {
        status: error?.status || 500,
      }
    );
  }
}

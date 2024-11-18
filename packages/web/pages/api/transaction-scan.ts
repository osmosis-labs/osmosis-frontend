import { transactionScan } from "@osmosis-labs/server";
import { decodeAnyBase64, generateCosmosUnsignedTx } from "@osmosis-labs/tx";
import { NextApiRequest, NextApiResponse } from "next";

import { ChainList } from "~/config/generated/chain-list";

export default async function transactionScanHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chainId, messages, nonCriticalExtensionOptions, bech32Address } =
    req.body as {
      chainId: string;
      messages: { typeUrl: string; value: string }[];
      nonCriticalExtensionOptions?: { typeUrl: string; value: string }[];
      bech32Address: string;
      excludedFeeMinimalDenoms?: string[];
    };

  try {
    const { unsignedTx } = await generateCosmosUnsignedTx({
      chainId,
      chainList: ChainList,
      bech32Address,
      body: {
        messages: messages.map(decodeAnyBase64),
        nonCriticalExtensionOptions:
          nonCriticalExtensionOptions?.map(decodeAnyBase64),
      },
    });

    const response = await transactionScan({
      chain: "osmosis",
      transaction: unsignedTx,
      options: ["validation", "simulation"],
      account_address: bech32Address,
      metadata: {
        type: "in_app",
      },
    });

    if (!response.ok) {
      throw new Error("Response is empty");
    }

    const result = await response.json();

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : e });
  }
}

import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Int } from "@keplr-wallet/unit";

import { getChain } from "~/queries/chain-info";
import { queryRPCStatus } from "~/queries/cosmos";

export async function getTimeoutHeight({
  chainId,
  destinationAddress,
}: {
  chainId?: string;
  destinationAddress?: string;
}) {
  const destinationCosmosChain = getChain({
    chainId,
    destinationAddress,
  });

  if (!destinationCosmosChain) {
    throw new Error("Could not find destination Cosmos chain");
  }

  const destinationNodeStatus = await queryRPCStatus({
    restUrl: destinationCosmosChain.rpc,
  });

  const network = destinationNodeStatus.result.node_info.network;
  const latestBlockHeight =
    destinationNodeStatus.result.sync_info.latest_block_height;

  if (!network) {
    throw new Error(
      `Failed to fetch the network chain id of ${destinationCosmosChain.chainId}`
    );
  }

  if (!latestBlockHeight || latestBlockHeight === "0") {
    throw new Error(
      `Failed to fetch the latest block of ${destinationCosmosChain.chainId}`
    );
  }

  const revisionNumber = ChainIdHelper.parse(network).version.toString();

  return {
    /**
     * Omit the revision_number if the chain's version is 0.
     * Sending the value as 0 will cause the transaction to fail.
     */
    revisionNumber: revisionNumber !== "0" ? revisionNumber : undefined,
    revisionHeight: new Int(latestBlockHeight).add(new Int("150")).toString(),
  };
}

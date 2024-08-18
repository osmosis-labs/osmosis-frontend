import { Int } from "@keplr-wallet/unit";
import { Chain } from "@osmosis-labs/types";
import { ChainIdHelper, getChain } from "@osmosis-labs/utils";

import { queryRPCStatus } from "../../queries/cosmos";

export async function getTimeoutHeight({
  chainList,
  chainId,
  destinationAddress,
}: {
  chainList: Chain[];
  chainId?: string;
  /**
   * WARNING: bech32 prefix may be the same across different chains,
   * retulting in the use of an unintended chain.
   */
  destinationAddress?: string;
}) {
  const destinationCosmosChain = getChain({
    chainList,
    chainId,
    destinationAddress,
  });

  if (!destinationCosmosChain) {
    throw new Error("Could not find destination Cosmos chain");
  }

  const destinationNodeStatus = await queryRPCStatus({
    restUrl: destinationCosmosChain.apis.rpc[0].address,
  });

  const network = destinationNodeStatus.result.node_info.network;
  const latestBlockHeight =
    destinationNodeStatus.result.sync_info.latest_block_height;

  if (!network) {
    throw new Error(
      `Failed to fetch the network chain id of ${destinationCosmosChain.chain_id}`
    );
  }

  if (!latestBlockHeight || latestBlockHeight === "0") {
    throw new Error(
      `Failed to fetch the latest block of ${destinationCosmosChain.chain_id}`
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

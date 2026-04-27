import { Chain } from "@osmosis-labs/types";
import { Int } from "@osmosis-labs/unit";
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

  const rpcUrls = destinationCosmosChain.apis.rpc.map((rpc) => rpc.address);

  if (rpcUrls.length === 0) {
    throw new Error(
      `No RPC endpoints available for chain ${destinationCosmosChain.chain_id}`
    );
  }

  const destinationNodeStatus = await queryRPCStatus({ rpcUrls });

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
    ...(revisionNumber !== "0" && { revisionNumber }),
    revisionHeight: new Int(latestBlockHeight).add(new Int("150")).toString(),
  };
}

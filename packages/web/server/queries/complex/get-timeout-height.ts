import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { Int } from "@keplr-wallet/unit";
import { getChain } from "@osmosis-labs/utils";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { ChainList } from "~/config/generated/chain-list";
import { queryRPCStatus } from "~/server/queries/cosmos";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

const timeoutCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);
export async function getTimeoutHeight({
  chainId,
  destinationAddress,
}: {
  chainId?: string;
  destinationAddress?: string;
}) {
  return cachified({
    cache: timeoutCache,
    key: `timeout-height-${chainId}-${destinationAddress}`,
    ttl: 1000 * 4, // 4 seconds (just less block time)
    getFreshValue: async () => {
      const destinationCosmosChain = getChain({
        chainList: ChainList,
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
        revisionHeight: new Int(latestBlockHeight)
          .add(new Int("150"))
          .toString(),
      };
    },
  });
}

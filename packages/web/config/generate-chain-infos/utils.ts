import type { Chain } from "@chain-registry/types";
import { ChainInfoWithExplorer } from "@osmosis-labs/stores";
// eslint-disable-next-line import/no-extraneous-dependencies
import { chains } from "chain-registry";

// eslint-disable-next-line import/no-extraneous-dependencies
import { IS_TESTNET, OSMOSIS_CHAIN_ID_OVERWRITE } from "../env";
import { chainInfos } from "./source-chain-infos";

const osmosisChainIdWithoutOverwrite = IS_TESTNET ? "osmo-test-5" : "osmosis-1";

export function getChainInfos(): (ChainInfoWithExplorer &
  Chain & { chainRegistryChainName: string })[] {
  const hasOveriddenOsmosisChainId = OSMOSIS_CHAIN_ID_OVERWRITE !== undefined;
  return chainInfos
    .filter((localChain) => localChain.chainName !== "")
    .map((localChain) => {
      const registryChain = chains.find(({ chain_id }) => {
        // If the Osmosis chain id is overriden, use the overriden id.
        if (
          hasOveriddenOsmosisChainId &&
          localChain.chainId === OSMOSIS_CHAIN_ID_OVERWRITE
        ) {
          return chain_id === osmosisChainIdWithoutOverwrite;
        }

        return chain_id === localChain.chainId;
      })!;

      if (!registryChain) {
        console.warn(
          `Warning: chain ${localChain.chainName} not found in chain-registry`
        );
      }

      return {
        ...localChain,
        ...registryChain,
        chain_name: localChain.chainName,
        chain_id: localChain.chainId,
        // We need this to override the assets chain name in `generate-wallet-assets/utils.ts`
        chainRegistryChainName: registryChain?.chain_name,
        peers: undefined,
        explorers: undefined,
        codebase: undefined,
        staking: undefined,
        $schema: undefined,
        apis: {
          rpc: [
            {
              address: localChain.rpc,
            },
          ],
          rest: [
            {
              address: localChain.rest,
            },
          ],
        },
      };
    });
}

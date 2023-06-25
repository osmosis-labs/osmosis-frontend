import type { Chain } from "@chain-registry/types";
import { ChainInfoWithExplorer } from "@osmosis-labs/stores";
// eslint-disable-next-line import/no-extraneous-dependencies
import { chains } from "chain-registry";

// eslint-disable-next-line import/no-extraneous-dependencies
import { IS_TESTNET, OSMOSIS_CHAIN_ID_OVERWRITE } from "../env";
import { ChainInfos as chainInfos } from "./source-chain-infos";

const osmosisChainIdWithoutOverwrite = IS_TESTNET ? "osmo-test-4" : "osmosis-1";

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
        // We need this to override the assets chain name in `generate-wallet-assets/utils.ts`
        chainRegistryChainName: registryChain?.chain_name,
        chain_name: localChain.chainName,
        chain_id: localChain.chainId,
        pretty_name: registryChain?.pretty_name ?? localChain.chainName,
        slip44: registryChain?.slip44 ?? localChain.bip44.coinType,
        bech32_prefix:
          registryChain?.bech32_prefix ??
          localChain.bech32Config.bech32PrefixAccAddr,
        fees: registryChain?.fees ?? {
          fee_tokens: localChain.currencies.map((currency) => {
            const gasPriceStep = (currency as any).gasPriceStep as {
              low?: number;
              average?: number;
              high?: number;
            };
            return {
              denom: currency.coinMinimalDenom,
              fixed_min_gas_price: 0,
              low_gas_price: gasPriceStep?.low,
              average_gas_price: gasPriceStep?.average,
              high_gas_price: gasPriceStep?.high,
            };
          }),
        },
        apis: {
          rpc: [
            {
              address: localChain.rpc,
            },
            // Add the rpc endpoints from chain-registry to fallback if needed.
            ...((registryChain?.apis?.rpc ?? [])
              ?.filter(({ address }) => address !== localChain.rpc)
              ?.map(({ address }) => ({ address })) ?? []),
          ],
          rest: [
            {
              address: localChain.rest,
            },
            // Add the rest endpoints from chain-registry to fallback if needed.
            ...(registryChain?.apis?.rest ?? [])
              ?.filter(({ address }) => address !== localChain.rest)
              ?.map(({ address }) => ({
                address,
              })),
          ],
        },
        peers: undefined,
        explorers: undefined,
        codebase: undefined,
        staking: undefined,
        $schema: undefined,
      };
    });
}

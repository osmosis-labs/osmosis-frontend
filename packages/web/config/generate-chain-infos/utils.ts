import type { Chain } from "@chain-registry/types";
import { ChainInfoWithExplorer } from "@osmosis-labs/stores";
// eslint-disable-next-line import/no-extraneous-dependencies
import { chains } from "chain-registry";

// eslint-disable-next-line import/no-extraneous-dependencies
import { IS_TESTNET, OSMOSIS_CHAIN_ID_OVERWRITE } from "~/config/env";
import { ChainInfos as chainInfos } from "~/config/generate-chain-infos/source-chain-infos";

const osmosisChainIdWithoutOverwrite = IS_TESTNET ? "osmo-test-4" : "osmosis-1";

export function getChainInfos(): (ChainInfoWithExplorer &
  Chain & { chainRegistryChainName: string })[] {
  const hasOveriddenOsmosisChainId = OSMOSIS_CHAIN_ID_OVERWRITE !== undefined;
  const localChainIdToRegistryId = (localChainId: string) => {
    if (
      hasOveriddenOsmosisChainId &&
      localChainId === OSMOSIS_CHAIN_ID_OVERWRITE
    ) {
      return osmosisChainIdWithoutOverwrite;
    }
    return localChainId;
  };
  // for every local chainInfo config, return corresponding data from chain registry.
  // If chainName is blank ignore it.
  // If we are overriding the osmosis chain id, use the overriden id.
  // TODO: This is O(N^2), if benchmarks ever indicate a problem switch to an O(N log(N)) one by sorting.
  // This may not matter.
  return chainInfos
    .filter((localChain) => localChain.chainName !== "")
    .map((localChain) => {
      const registryChainId = localChainIdToRegistryId(localChain.chainId);
      const registryChain = chains.find(
        ({ chain_id }) => chain_id === registryChainId
      )!;

      if (!registryChain) {
        console.warn(
          `Warning: chain ${localChain.chainName} not found in chain-registry. Consider bumping chain-registry version.`
        );
      }

      return {
        ...localChain,
        ...registryChain,
        // We need this to identify the registry chain while generating the wallet assets.
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

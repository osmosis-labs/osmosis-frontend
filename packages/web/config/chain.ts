import { ChainGetter, ChainIdHelper } from "@osmosis-labs/keplr-stores";
import type { AppCurrency, ChainInfoWithExplorer } from "@osmosis-labs/types";

import { IS_TESTNET, OSMOSIS_CHAIN_ID_OVERWRITE } from "~/config/env";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { getKeplrCompatibleChain } from "~/config/keplr-chain";

/**
 * Static chain config, built once from the generated lists and shared by the account store
 * and web runtime.
 */
export const ChainInfos: ChainInfoWithExplorer[] = ChainList.map((chain) =>
  getKeplrCompatibleChain({ chain, assetLists: AssetLists })
);

/** Chain lookups match on the identifier, so `osmosis` resolves to `osmosis-1`. */
const chainInfoByIdentifier = new Map<string, ChainInfoWithExplorer>();
for (const chainInfo of ChainInfos) {
  const { identifier } = ChainIdHelper.parse(chainInfo.chainId);
  if (!chainInfoByIdentifier.has(identifier)) {
    chainInfoByIdentifier.set(identifier, chainInfo);
  }
}

/** Throws on an unknown chain, like `ChainStore.getChain`. */
export function getChainInfo(chainId: string): ChainInfoWithExplorer {
  const chainInfo = chainInfoByIdentifier.get(
    ChainIdHelper.parse(chainId).identifier
  );
  if (!chainInfo) throw new Error(`Unknown chain info: ${chainId}`);
  return chainInfo;
}

/** Matches `ChainStore.getChainFromCurrency`: the first chain whose stake or listed currency has this denom. */
export function getChainInfoFromCurrency(
  coinDenom: string
): ChainInfoWithExplorer | undefined {
  const justDenom = coinDenom.split(" ")[0]; // remove channel info
  return ChainInfos.find(
    (chain) =>
      chain.stakeCurrency.coinDenom === justDenom ||
      chain.currencies.some((c) => c.coinDenom === justDenom)
  );
}

/** Resolves to the same chain id `ChainStore.osmosis.chainId` returns, e.g. `osmosis-1`. */
export const OsmosisChainInfo: ChainInfoWithExplorer = getChainInfo(
  OSMOSIS_CHAIN_ID_OVERWRITE ?? (IS_TESTNET ? "osmo-test-5" : "osmosis")
);

const osmosisCurrencyByMinimalDenom = new Map<string, AppCurrency>(
  OsmosisChainInfo.currencies.map((currency) => [
    currency.coinMinimalDenom,
    currency,
  ])
);

/** Asset-list currencies only: unlike `ChainInfoInner.findCurrency`, nothing registered at runtime. */
export function findOsmosisCurrency(
  coinMinimalDenom: string
): AppCurrency | undefined {
  return osmosisCurrencyByMinimalDenom.get(coinMinimalDenom);
}

/**
 * Read-only `ChainGetter` over the static chain config, for the `packages/stores` configs that
 * take one. Currencies are never registered at runtime, so `addUnknownCurrencies` is a no-op.
 */
export const StaticChainGetter = {
  getChain(chainId) {
    const chainInfo = getChainInfo(chainId);
    const findCurrency = (coinMinimalDenom: string) =>
      chainInfo.currencies.find((c) => c.coinMinimalDenom === coinMinimalDenom);
    return {
      ...chainInfo,
      raw: chainInfo,
      addUnknownCurrencies: () => {},
      findCurrency,
      forceFindCurrency: (coinMinimalDenom) =>
        findCurrency(coinMinimalDenom) ?? {
          coinMinimalDenom,
          coinDenom: coinMinimalDenom,
          coinDecimals: 0,
          base: "",
        },
    };
  },
} satisfies ChainGetter;

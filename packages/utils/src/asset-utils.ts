import type { Asset, AssetList } from "@osmosis-labs/types";

export function getMinimalDenomFromAssetList({
  traces,
  symbol,
  base,
}: Pick<Asset, "traces" | "symbol" | "base">) {
  /** It's an Osmosis Asset */
  if (traces?.length === 0) {
    return base;
  }

  const lastTrace = traces[traces.length - 1];

  if (lastTrace?.type !== "ibc-cw20" && lastTrace?.type !== "ibc") {
    throw new Error(`Unknown trace type ${lastTrace?.type}. Asset ${symbol}`);
  }

  return lastTrace.counterparty.base_denom;
}

export function getDisplayDecimalsFromAsset({
  denom_units,
  display,
}: Pick<Asset, "denom_units" | "display">) {
  const displayDenomUnits = denom_units.find(
    (denomUnits) => denomUnits.denom.toLowerCase() === display.toLowerCase()
  );

  if (typeof displayDenomUnits === "undefined") return 0;

  return displayDenomUnits.exponent;
}

export function getAssetFromAssetList({
  minimalDenom,
  coingeckoId,
  assetLists,
  base,
}: {
  minimalDenom?: string;
  base?: string;
  coingeckoId?: string;
  assetLists: AssetList[];
}) {
  if (!minimalDenom && !coingeckoId && !base) return undefined;

  let asset: Asset | undefined;

  for (const assetList of assetLists) {
    const walletAsset = assetList.assets.find(
      (asset) =>
        hasMatchingMinimalDenom(asset, minimalDenom ?? "") ||
        (asset.coingecko_id ? asset.coingecko_id === coingeckoId : false) ||
        asset.base === base
    );

    if (walletAsset) {
      asset = walletAsset;
      break;
    }
  }

  if (!asset) return undefined;

  return {
    minimalDenom: minimalDenom,
    symbol: asset.symbol,
    coingeckoId: asset.coingecko_id,
    priceInfo: asset.price_info,
    decimals: asset.denom_units.find((a) => a.denom === asset?.display)
      ?.exponent,
    rawAsset: asset,
  };
}

export const hasMatchingMinimalDenom = (
  asset: Pick<Asset, "denom_units" | "traces" | "symbol" | "base">,
  denomToSearch: string
) => {
  return getMinimalDenomFromAssetList(asset) === denomToSearch;
};

export function getChannelInfoFromAsset(
  asset: Pick<Asset, "traces" | "symbol">
) {
  const lastTrace = asset.traces[asset.traces.length - 1];

  if (lastTrace?.type !== "ibc-cw20" && lastTrace?.type !== "ibc") {
    throw new Error(
      `Unknown trace type ${lastTrace?.type}. Asset ${asset.symbol}`
    );
  }

  const sourceChannelId = lastTrace.chain.channel_id;
  const destChannelId = lastTrace.counterparty.channel_id;

  return {
    sourceChannelId,
    destChannelId,
  };
}

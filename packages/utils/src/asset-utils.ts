import type { Asset, AssetDenomUnit, AssetList } from "@osmosis-labs/types";

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
  const displayDenomUnits = denom_units.find((denomUnits) =>
    matchesDenomOrAlias({
      denomToSearch: display,
      ...denomUnits,
    })
  );

  if (typeof displayDenomUnits === "undefined") return undefined;

  return displayDenomUnits.exponent;
}

export function getAssetFromAssetList({
  minimalDenom,
  coingeckoId,
  assetLists,
}: {
  minimalDenom?: string;
  coingeckoId?: string;
  assetLists: AssetList[];
}) {
  if (!minimalDenom && !coingeckoId) return undefined;

  let asset: Asset | undefined;

  for (const assetList of assetLists) {
    const walletAsset = assetList.assets.find(
      (asset) =>
        hasMatchingMinimalDenom(asset, minimalDenom ?? "") ||
        (asset.coingecko_id ? asset.coingecko_id === coingeckoId : false)
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
    priceCoinId: asset.price_coin_id,
    decimals: asset.denom_units.find((a) => a.denom === asset?.display)
      ?.exponent,
    rawAsset: asset,
  };
}

export const matchesDenomOrAlias = ({
  aliases,
  denom,
  denomToSearch,
}: Pick<AssetDenomUnit, "aliases" | "denom"> & { denomToSearch: string }) =>
  denom.toLowerCase() === denomToSearch.toLowerCase() ||
  aliases?.some((alias) => alias.toLowerCase() === denomToSearch.toLowerCase());

export const hasMatchingMinimalDenom = (
  { denom_units }: Pick<Asset, "denom_units">,
  denomToSearch: string
) => {
  return denom_units.some(({ aliases, denom }) =>
    matchesDenomOrAlias({ denomToSearch, aliases, denom })
  );
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

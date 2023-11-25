import type { Asset, AssetList } from "@osmosis-labs/types";

export function getSourceDenomFromAssetList({
  traces,
  symbol,
  base,
}: Pick<Asset, "traces" | "symbol" | "base">) {
  /** It's an Osmosis Asset, since there's no IBC traces from other chains. */
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

/** Find asset in asset list config given any of the available identifiers. */
export function getAssetFromAssetList({
  /** Denom as it exists on source chain. */
  sourceDenom,
  coinMinimalDenom,
  coinGeckoId,
  assetLists,
}: {
  sourceDenom?: string;
  coinMinimalDenom?: string;
  coinGeckoId?: string;
  assetLists: AssetList[];
}) {
  if (!sourceDenom && !coinGeckoId && !coinMinimalDenom) {
    return undefined;
  }

  const asset = assetLists
    .flatMap(({ assets }) => assets)
    .find(
      (asset) =>
        (sourceDenom && hasMatchingSourceDenom(asset, sourceDenom)) ||
        (asset.coingecko_id ? asset.coingecko_id === coinGeckoId : false) ||
        asset.base === coinMinimalDenom
    );

  if (!asset) return undefined;

  const decimals = getDisplayDecimalsFromAsset(asset);

  return {
    sourceDenom: getSourceDenomFromAssetList(asset),
    coinMinimalDenom: asset.base,
    symbol: asset.symbol,
    coinGeckoId: asset.coingecko_id,
    priceCoinId: asset.price_coin_id,
    decimals,
    rawAsset: asset,
    currency: {
      coinDenom: asset.symbol,
      coinMinimalDenom: asset.base,
      coinDecimals: decimals,
      coinImageUrl: asset.relative_image_url,
    },
  };
}

/** Finds by denom as it exists on source chain by last IBC hop trace. i.e. `pstake` or `uatom`. Not
 *  the IBC denom on Osmosis. */
export const hasMatchingSourceDenom = (
  asset: Pick<Asset, "denom_units" | "traces" | "symbol" | "base">,
  denomToSearch: string
) => {
  return getSourceDenomFromAssetList(asset) === denomToSearch;
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

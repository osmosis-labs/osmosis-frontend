import type {
  Asset,
  AssetList,
  IbcCW20Trace,
  IBCTrace,
} from "@osmosis-labs/types";

export function getLastIbcTrace(
  traces: Asset["traces"]
): IbcCW20Trace | IBCTrace | undefined {
  const ibcTraces = traces.filter(
    (trace): trace is IBCTrace | IbcCW20Trace =>
      trace.type === "ibc-cw20" || trace.type === "ibc"
  );
  return ibcTraces[ibcTraces.length - 1];
}

export function getSourceDenomFromAssetList({
  traces,
  base,
}: Pick<Asset, "traces" | "base">) {
  /** It's an Osmosis Asset, since there's no IBC traces from other chains. */
  if (traces?.length === 0) {
    return base;
  }

  const ibcTrace = getLastIbcTrace(traces);

  /** It's an Osmosis Asset, since there's no IBC traces from other chains. */
  if (!ibcTrace) {
    return base;
  }

  return ibcTrace.counterparty.base_denom;
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
    priceInfo: asset.price_info,
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
  const ibcTrace = getLastIbcTrace(asset.traces);

  if (!ibcTrace) {
    throw new Error(`Asset ${asset.symbol} does not have an IBC trace.`);
  }

  const sourceChannelId = ibcTrace.chain.channel_id;
  const destChannelId = ibcTrace.counterparty.channel_id;

  return {
    sourceChannelId,
    destChannelId,
  };
}

/** Convert an asset list asset into an asset with minimal content and that
 *  is compliant with the `Currency` type. */
export function makeMinimalAsset(assetListAsset: Asset) {
  const { symbol, base, relative_image_url, coingecko_id, name, keywords } =
    assetListAsset;
  const decimals = getDisplayDecimalsFromAsset(assetListAsset);

  return {
    coinDenom: symbol,
    coinName: name,
    coinMinimalDenom: base,
    coinDecimals: decimals,
    coinGeckoId: coingecko_id,
    coinImageUrl: relative_image_url,
    isUnstable: Boolean(keywords?.includes("osmosis-unstable")),
    isVerified: Boolean(keywords?.includes("osmosis-main")),
  };
}

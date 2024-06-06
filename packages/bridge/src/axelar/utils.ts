import { GetBridgeExternalUrlParams } from "../interface";

// https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=uusdc
export function getAxelarExternalUrl({
  fromChain,
  toChain,
  fromAsset,
  toAsset,
}: GetBridgeExternalUrlParams): string {
  const url = new URL("https://satellite.money/");
  url.searchParams.set("src_chain", String(fromChain.chainId));
  url.searchParams.set("src_asset", fromAsset.address);
  url.searchParams.set("dest_chain", String(toChain.chainId));
  url.searchParams.set("dest_asset", toAsset.address);

  return url.toString();
}

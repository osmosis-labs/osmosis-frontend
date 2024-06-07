import { GetBridgeExternalUrlParams } from "../interface";

export function getSquidExternalUrl({
  fromChain,
  toChain,
  fromAsset,
  toAsset,
}: GetBridgeExternalUrlParams): string {
  const url = new URL("https://app.squidrouter.com/");
  url.searchParams.set(
    "chains",
    [fromChain.chainId, toChain.chainId].join(",")
  );
  url.searchParams.set(
    "tokens",
    [fromAsset.address, toAsset.address].join(",")
  );

  return url.toString();
}

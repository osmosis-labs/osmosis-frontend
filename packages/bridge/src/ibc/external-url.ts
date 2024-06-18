import { GetBridgeExternalUrlParams } from "../interface";

export function getIBCExternalUrl({
  fromChain,
  toChain,
  fromAsset,
  toAsset,
  env,
}: GetBridgeExternalUrlParams): string | undefined {
  if (
    env === "testnet" ||
    fromChain.chainType === "evm" ||
    toChain.chainType === "evm"
  ) {
    return undefined;
  }

  const url = new URL("https://geo.tfm.com/");
  url.searchParams.set("chainFrom", fromChain.chainId);
  url.searchParams.set("token0", fromAsset.sourceDenom);
  url.searchParams.set("chainTo", toChain.chainId);
  url.searchParams.set("token1", toAsset.sourceDenom);

  return url.toString();
}

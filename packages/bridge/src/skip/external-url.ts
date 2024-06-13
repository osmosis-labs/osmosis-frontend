import { GetBridgeExternalUrlParams } from "../interface";

export function getSkipExternalUrl({
  fromChain,
  toChain,
  fromAsset,
  toAsset,
  env,
}: GetBridgeExternalUrlParams): string | undefined {
  if (env === "testnet") return undefined;

  const url = new URL("https://ibc.fun/");
  url.searchParams.set("src_chain", String(fromChain.chainId));
  url.searchParams.set("src_asset", fromAsset.address);
  url.searchParams.set("dest_chain", String(toChain.chainId));
  url.searchParams.set("dest_asset", toAsset.address);

  return url.toString();
}

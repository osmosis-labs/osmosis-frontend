import { isNil } from "@osmosis-labs/utils";

import { NativeEVMTokenConstantAddress } from "../ethereum";
import {
  BridgeProviderContext,
  GetBridgeExternalUrlParams,
} from "../interface";
import { getAxelarAssets, getAxelarChains } from "./queries";

export async function getAxelarExternalUrl({
  fromChain,
  toChain,
  toAsset,
  env,
  toAddress,
  fromAsset,
}: GetBridgeExternalUrlParams & {
  env: BridgeProviderContext["env"];
}): Promise<string> {
  const [axelarChains, axelarAssets] = await Promise.all([
    getAxelarChains({ env }),
    getAxelarAssets({ env }),
  ]);

  const fromAxelarChain = axelarChains.find(
    (chain) => String(chain.chain_id) === String(fromChain.chainId)
  );

  if (!fromAxelarChain) {
    throw new Error(`Chain not found: ${fromChain.chainId}`);
  }

  const toAxelarChain = axelarChains.find(
    (chain) => String(chain.chain_id) === String(toChain.chainId)
  );

  if (!toAxelarChain) {
    throw new Error(`Chain not found: ${toChain.chainId}`);
  }

  const fromAxelarAsset = axelarAssets.find((axelarAsset) => {
    return (
      !isNil(axelarAsset.addresses[toAxelarChain.chain_name]) &&
      (axelarAsset.addresses[toAxelarChain.chain_name].ibc_denom ===
        toAsset.address ||
        axelarAsset.addresses[toAxelarChain.chain_name].address ===
          toAsset.address)
    );
  });

  if (!fromAxelarAsset) {
    throw new Error(`Asset not found: ${toAsset.address}`);
  }

  const url = new URL("https://satellite.money/");
  url.searchParams.set("source", fromAxelarChain.chain_name);
  url.searchParams.set("destination", toAxelarChain.chain_name);
  url.searchParams.set(
    "asset_denom",
    // Check if the asset has multiple denoms (indicating wrapped tokens)
    !isNil(fromAxelarAsset.denoms) && fromAxelarAsset.denoms.length > 1
      ? // If the fromAsset address is the native EVM token constant address, use the second denom which is the unwrapped token
        fromAsset.address === NativeEVMTokenConstantAddress
        ? fromAxelarAsset.denoms[1]
        : fromAxelarAsset.denoms[0]
      : // If there are no multiple denoms, use the default denom
        fromAxelarAsset.denom
  );
  url.searchParams.set("destination_address", toAddress);

  return url.toString();
}

import type { Asset, Chain, IbcTransferMethod } from "@osmosis-labs/types";

/** Select wallet grouping, not token origin. Non-Cosmos origins don't have
 * Cosmos wallet configs; their tokens still need to appear on Osmosis.
 */
export function resolveAssetChain(
  asset: Asset,
  chains: Chain[],
  osmosisChainId: string
): Chain {
  const osmosis = chains.find((chain) => chain.chain_id === osmosisChainId);
  if (!osmosis) throw new Error("Failed to find chain osmosis");
  if (
    asset.chainName === osmosis.chain_name ||
    !asset.transferMethods?.length
  ) {
    return osmosis;
  }
  const ibc = [...asset.transferMethods]
    .reverse()
    .find(({ type }) => type === "ibc") as IbcTransferMethod | undefined;
  const counterparty = asset.counterparty?.[0];
  const chainName =
    ibc?.counterparty.chainName ??
    (counterparty?.chainType === "cosmos" ? counterparty.chainName : undefined);
  if (!chainName) return osmosis;
  const chain = chains.find((chain) => chain.chain_name === chainName);
  if (!chain?.chain_id) {
    // Some registry entries are display-only (no Cosmos wallet config).
    // Keep the token visible without inventing a wallet chain or dropping it.
    console.warn(
      `Missing wallet chain ${chainName} for ${asset.symbol}; grouping on Osmosis`
    );
    return osmosis;
  }
  return chain;
}

/**
 * Maximum number of source assets accepted in a single
 * `local.bridgeTransfer.getSupportedAssetsBalances` request.
 *
 * Shared between the server Zod schema and client-side batching so chains
 * with more bridgeable assets never fail validation while keeping per-request
 * RPC fan-out bounded on the API Worker.
 */
export const MAX_BRIDGE_BALANCE_BATCH_SIZE = 100;

/**
 * Splits a bridge balance query source into deterministic chunks of at most
 * `batchSize` assets while preserving the source chain type and user address.
 */
export function chunkBridgeBalanceSource<
  T extends { assets: readonly unknown[] },
>(source: T | undefined, batchSize = MAX_BRIDGE_BALANCE_BATCH_SIZE): T[] {
  if (!source || source.assets.length === 0) return [];
  if (batchSize <= 0) {
    throw new Error(`Invalid bridge balance batch size: ${batchSize}`);
  }
  if (source.assets.length <= batchSize) return [source];

  const chunks: T[] = [];
  for (let i = 0; i < source.assets.length; i += batchSize) {
    chunks.push({
      ...source,
      assets: source.assets.slice(i, i + batchSize),
    });
  }
  return chunks;
}

/**
 * Keeps assets with a positive balance, falling back to the first asset when
 * every asset has a zero balance so the deposit screen still has a selection.
 */
export function selectDisplayableBalances<
  T extends { amount: { toDec(): { isPositive(): boolean } } },
>(allBalances: T[]): T[] {
  if (allBalances.length === 0) return [];
  const positive = allBalances.filter((asset) =>
    asset.amount.toDec().isPositive()
  );
  return positive.length > 0 ? positive : [allBalances[0]];
}

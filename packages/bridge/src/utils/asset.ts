/** Useful for collecting a set of assets unique to it's chain ID and denom as represented natively on that chain. */
export class BridgeAssetMap<Asset> extends Map<string, Asset> {
  static makeKey(chainId: string, denom: string): string {
    return `${chainId.toLowerCase()}:${denom.toLowerCase()}`;
  }

  get assets() {
    return Array.from(this.values());
  }

  getAsset(chainId: string, denom: string): Asset | undefined {
    return this.get(BridgeAssetMap.makeKey(chainId, denom));
  }

  setAsset(chainId: string, denom: string, value: Asset): void {
    this.set(BridgeAssetMap.makeKey(chainId, denom), value);
  }
}

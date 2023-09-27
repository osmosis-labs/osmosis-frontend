export interface BridgeChain {
  networkName: string;
  chainId?: number | string;
  chainName?: string;
  chainType?: "evm" | "cosmos";
}

export interface BridgeAsset {
  denom: string;
}

export interface BridgeProvider {
  getQuote(): Promise<any>;
  executeRoute(): Promise<any>;
  getAssets(): Promise<BridgeAsset[]>;
  getChains(): Promise<BridgeChain[]>;
}

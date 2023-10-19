## Bridge Providers Documentation

Bridge providers are an abstraction layer in Osmosis that allows for the seamless integration of new blockchain bridges. The types for these providers are defined in the `packages/web/integrations/bridges/types.ts` file.

### Steps to add a Bridge Provider

1. **Create a new Bridge Provider Class**: This class should implement the BridgeProvider interface. This means it should have the following methods: `getQuote`, `getTransferStatus`, `getTransactionData`, and optionally `getDepositAddress`.

```tsx
class MyBridgeProvider implements BridgeProvider {
  providerName = "MyBridge";
  logoUrl = "url_to_logo";

  async getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    // Implement logic to get a quote for a cross-chain transfer
  }

  async getTransferStatus(
    params: GetTransferStatusParams
  ): Promise<BridgeTransferStatus | undefined> {
    // Implement logic to get the status of a transfer
  }

  getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<BridgeTransactionRequest> {
    // Implement logic to get transaction data
  }

  getDepositAddress?(
    params: GetDepositAddressParams
  ): Promise<BridgeDepositAddress> {
    // Implement logic to get a deposit address
  }
}
```

1. **Register the Bridge Provider**: Once you've created your bridge provider, you need to register it with Osmosis. In the BridgeManager class, add your bridge provider to the bridges object in the constructor.

```tsx
this.bridges = {
  [SquidBridgeProvider.providerName]: new SquidBridgeProvider(
    integratorId,
    context
  ),
  [AxelarBridgeProvider.providerName]: new AxelarBridgeProvider(context),
  [MyBridgeProvider.providerName]: new MyBridgeProvider(context),
};
```

3. **Test Your Implementation**: After you've implemented and registered your bridge provider, you should thoroughly test it to make sure it works correctly.

### Outstanding tasks

- [ ] Add support for QR-Based bridge providers like Nomic

### Interfaces

#### BridgeProvider

The BridgeProvider interface is the main interface for a bridge provider. It includes methods for requesting a quote for a cross-chain transfer, getting the status of a transfer, getting transaction data, and optionally getting a deposit address.

```tsx
export interface BridgeProvider {
  providerName: string;
  logoUrl: string;
  getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote>;
  getTransferStatus(
    params: GetTransferStatusParams
  ): Promise<BridgeTransferStatus | undefined>;
  getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<BridgeTransactionRequest>;
  getDepositAddress?(
    params: GetDepositAddressParams
  ): Promise<BridgeDepositAddress>;
}
```

#### BridgeProviderContext

The BridgeProviderContext interface provides context for a bridge provider, including the environment (mainnet or testnet) and a cache.

```tsx
export interface BridgeProviderContext {
  env: "mainnet" | "testnet";
  cache: LRUCache<string, CacheEntry>;
}
```

#### BridgeChain

The BridgeChain interface represents a blockchain that can be bridged. It includes the chain ID, human-readable name, network name, and chain type (either 'evm' for EVM-based chains or 'cosmos' for Cosmos-based chains).

```tsx
export interface BridgeChain {
  chainId: number | string;
  chainName?: string;
  networkName?: string;
  chainType: "evm" | "cosmos";
}
```

#### BridgeTransferStatus

The BridgeTransferStatus interface represents the status of a bridge transfer. It includes the transfer ID, status, and reason for the status.

```tsx
export interface BridgeTransferStatus {
  id: string;
  status: TxStatus;
  reason?: TxReason;
}
```

#### BridgeAsset

The BridgeAsset interface represents an asset that can be transferred across a bridge. It includes the denomination of the asset, the address of the asset, the number of decimal places for the asset, and the minimal denomination.

```tsx
export interface BridgeAsset {
  denom: string;
  address: string;
  decimals: number;
  minimalDenom: string;
}
```

#### BridgeTransactionRequest

The BridgeTransactionRequest type represents a request for a bridge transaction. It can be one of three types: EvmBridgeTransactionRequest, CosmosBridgeTransactionRequest, or QRCodeBridgeTransactionRequest.

```tsx
export type BridgeTransactionRequest =
  | EvmBridgeTransactionRequest
  | CosmosBridgeTransactionRequest
  | QRCodeBridgeTransactionRequest;
```

# @osmosis-labs/bridge

Provides a single API for for interacting with multiple bridge providers, with a focus on IBC asset info for a single chain. Relies on canonical chain and asset identifiers across ecosystems for identifying assets and chains. Some bridge providers include routing and swap aggregation capabilites. New providers can be added by implementing the `BridgeProvider` interface. The interface includes some optional components that can be used to support alternative bridge features, such as the `getDepositAddress` for briding via a send transaction to a generated deposit address.

Providers are complemented with objects that implement the `TransferStatusProvider` interface. These objects provide updates on the status of a transfer transaction recommended by a bridge provider. The provider can then push these updates to the caller's implementation of the `TransferStatusReceiver` interface, using the transaction's hash. Depending on the needs of the caller the `TransferStatusReceiver` object can be implemented to provide updates to the UI or other observer.

Instances of the above providers are intended to be created to maintain references to any underlying caches or connections. Also, a single `BridgeProviders` object is available for maintaining a single instance of all available bridge providers.

## Basic usage

General flow using a given provider:

1. Get a quote from the provider's `BridgeProvider.getQuote` implementation and present to user
2. User accepts quote and initiates the transfer by sending the quote data to the provider's `BridgeProvider.getTransactionData` implementation and signing & broadcasting the returned value in their wallet.
3. Optionally, the calling app can provide UI updates by receiving events from the provider's corresponding `TransferStatusProvider` implementation via the caller's own `TransferStatusReceiver` implementation.
4. User's funds arrive at the specified destination address.

Example pseudocode:

```ts
// setup chosen provider
const provider =
  new SkipBridgeProvider(context) || new BridgeProviders(context)["Skip"];

// get quote
// can also get multiple and only show user the best one with lowest fee / highest out amount
const quote = await provider.getQuote({
  fromAsset,
  toAsset,
  fromChain,
  toChain,
  fromAddress,
  toAddress,
  slippage,
});

// user accepts quote
const signDocument = await provider.getTransactionData(quote);

// user signs and broadcasts
const { txHash } = await wallet.signAndBroadcast(signDocument);

// subscribe to updates

const statusProvider = new SkipTransferStatusProvider("testnet");
// object capable of providing updates to UI or other observer
// can accept multiple providers since keys are recommended to be namespaced
const statusReceiver = new MyObservableTransferStatusReceiver([statusProvider]);

// subscribe to updates; could use websocket, polling, black magic, etc.
statusProvider.trackTxStatus(txHash, statusReceiver);

// log: MyObservableTransferStatusReceiver got "pending" for skip_txHash ABC123
// log: MyObservableTransferStatusReceiver got "pending" for skip_txHash ABC123
// log: MyObservableTransferStatusReceiver got "pending" for skip_txHash ABC123
// log: MyObservableTransferStatusReceiver got "completed" for skip_txHash ABC123
```

## Steps to add a Bridge Provider

1. **Create a new Bridge Provider Class**: This class should implement the BridgeProvider interface. This means it should have the following methods: `getQuote`, `getTransferStatus`, `getTransactionData`, and optionally `getDepositAddress`.

```tsx
class MyBridgeProvider implements BridgeProvider {
  providerName = "MyBridge";
  logoUrl = "url_to_logo";

  getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    // Implement logic to get a quote for a cross-chain transfer
  }

  getTransferStatus(
    params: GetTransferStatusParams
  ): Promise<BridgeTransferStatus | undefined> {
    // Implement logic to get the status of a transfer
  }

  getTransactionData(
    params: GetBridgeQuoteParams
  ): Promise<BridgeTransactionRequest> {
    // Implement logic to get transaction data
  }

  getSupportedAssets(
    params: GetBridgeSupportedAssetsParams
  ): Promise<(BridgeChain & BridgeAsset)[]> {
    // Implement logic to get supported assets
  }

  getDepositAddress?(
    params: GetDepositAddressParams
  ): Promise<BridgeDepositAddress> {
    // Implement logic to get a deposit address
  }
}
```

2. **Register the Bridge Provider**: Once you've created your bridge provider, you need to register it with Osmosis. In the BridgeManager class, add your bridge provider to the bridges object in the constructor.

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

## Interfaces

### BridgeProvider

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
  getSupportedAssets(
    params: GetBridgeSupportedAssetsParams
  ): Promise<(BridgeChain & BridgeAsset)[]>;
  getDepositAddress?(
    params: GetDepositAddressParams
  ): Promise<BridgeDepositAddress>;
}
```

### BridgeProviderContext

The BridgeProviderContext interface provides context for a bridge provider, including the environment (mainnet or testnet) and a cache.

### BridgeChain

The BridgeChain interface represents a blockchain that can be bridged. It includes the chain ID, human-readable name, network name, and chain type (either 'evm' for EVM-based chains or 'cosmos' for Cosmos-based chains).

```tsx
export interface BridgeChain {
  chainId: number | string;
  chainName?: string;
  networkName?: string;
  chainType: "evm" | "cosmos";
}
```

### BridgeTransferStatus

The BridgeTransferStatus interface represents the status of a bridge transfer. It includes the transfer ID, status, and reason for the status.

```tsx
export interface BridgeTransferStatus {
  id: string;
  status: TxStatus;
  reason?: TxReason;
}
```

### BridgeAsset

The BridgeAsset interface represents an asset that can be transferred across a bridge. It includes the denomination of the asset, the address of the asset on a given chain, the number of decimal places for the asset.

```tsx
export interface BridgeAsset {
  denom: string;
  address: string;
  decimals: number;
}
```

### BridgeCoin

The BridgeCoin type represents an asset with an amount, likely returned within a bridge quote.

```tsx
export type BridgeCoin = {
  denom: string;
  decimals: number;
  /** The address of the asset, represented as an IBC denom, origin denom, or EVM contract address. */
  address: string;
  /** Amount without decimals. */
  amount: string;
};
```

### BridgeTransactionRequest

The BridgeTransactionRequest type represents a request for a bridge transaction. It can be one of three types: EvmBridgeTransactionRequest, CosmosBridgeTransactionRequest, or QRCodeBridgeTransactionRequest.

```tsx
export type BridgeTransactionRequest =
  | EvmBridgeTransactionRequest
  | CosmosBridgeTransactionRequest
  | QRCodeBridgeTransactionRequest;
```

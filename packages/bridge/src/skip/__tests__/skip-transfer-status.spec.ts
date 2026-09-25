// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";

import { MockChains } from "../../__tests__/mock-chains";
import { server } from "../../__tests__/msw";
import {
  BridgeEnvironment,
  TransferStatusReceiver,
  TxSnapshot,
} from "../../interface";
import { SkipApiClient } from "../client";
import {
  SkipStatusProvider,
  SkipTransferStatusProvider,
} from "../transfer-status";

jest.mock("@osmosis-labs/utils", () => ({
  ...jest.requireActual("@osmosis-labs/utils"),
  poll: jest.fn(({ fn, validate }) => {
    const pollFn = async () => {
      const result = await fn();
      if (validate(result)) {
        return result;
      }
    };
    return pollFn();
  }),
}));

const SkipStatusProvider: SkipStatusProvider = {
  transactionStatus: ({ chainID, txHash, env }) => {
    const client = new SkipApiClient(env);
    return client.transactionStatus({ chainID, txHash });
  },
  trackTransaction: () => Promise.resolve(),
};

// silence console errors
jest.spyOn(console, "error").mockImplementation(() => {});

describe("SkipTransferStatusProvider", () => {
  let provider: SkipTransferStatusProvider;
  const mockReceiver: TransferStatusReceiver = {
    receiveNewTxStatus: jest.fn(),
  };

  const baseTxSnapshot: TxSnapshot = {
    direction: "deposit",
    createdAtUnix: Math.floor(Date.now() / 1000),
    type: "bridge-transfer",
    provider: "Skip",
    fromAddress: "fromAddressSample",
    toAddress: "toAddressSample",
    osmoBech32Address: "osmoBech32AddressSample",
    networkFee: {
      denom: "OSMO",
      address: "uosmo",
      decimals: 6,
      amount: "10",
    },
    providerFee: {
      denom: "OSMO",
      address: "uosmo",
      decimals: 6,
      amount: "5",
    },
    fromAsset: {
      denom: "OSMO",
      address: "uosmo",
      decimals: 6,
      amount: "1000",
    },
    toAsset: {
      denom: "ATOM",
      address: "uatom",
      decimals: 6,
      amount: "1000",
    },
    status: "pending",
    sendTxHash: "testTxHash",
    fromChain: {
      chainId: 1,
      prettyName: "Chain One",
      chainType: "evm",
    },
    toChain: {
      chainId: 2,
      prettyName: "Chain Two",
      chainType: "evm",
    },
    estimatedArrivalUnix: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(() => {
    provider = new SkipTransferStatusProvider(
      "mainnet" as BridgeEnvironment,
      MockChains,
      SkipStatusProvider
    );
    provider.statusReceiverDelegate = mockReceiver;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct URLs", () => {
    expect(provider.axelarScanBaseUrl).toBe("https://axelarscan.io");
  });

  it("should handle successful transfer status", async () => {
    server.use(
      http.get("https://api.skip.money/v2/tx/status", () => {
        return HttpResponse.json({ state: "STATE_COMPLETED_SUCCESS" });
      })
    );

    const snapshot = { ...baseTxSnapshot };

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "success",
      undefined
    );
  });

  it("should handle failed transfer status", async () => {
    server.use(
      http.get("https://api.skip.money/v2/tx/status", () => {
        return HttpResponse.json({ state: "STATE_COMPLETED_ERROR" });
      })
    );

    const snapshot = { ...baseTxSnapshot };

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "failed",
      undefined
    );
  });

  it("resolves an abandoned transfer as failed rather than polling forever", async () => {
    // e.g. a restored Solana entry whose source tx expired before landing
    // while the tab was closed: Skip abandons tracking, and nothing else
    // would ever resolve the entry.
    server.use(
      http.get("https://api.skip.money/v2/tx/status", () => {
        return HttpResponse.json({ state: "STATE_ABANDONED" });
      })
    );

    const snapshot = { ...baseTxSnapshot };

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
      snapshot.sendTxHash,
      "failed",
      undefined
    );
  });

  it("should handle undefined transfer status", async () => {
    server.use(
      http.get("https://api.skip.money/v2/tx/status", () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const snapshot = { ...baseTxSnapshot };

    await provider.trackTxStatus(snapshot);

    expect(mockReceiver.receiveNewTxStatus).not.toHaveBeenCalled();
  });

  it("should generate correct explorer URL", () => {
    const snapshot: TxSnapshot = {
      ...baseTxSnapshot,
      fromChain: {
        chainId: 2,
        prettyName: "Chain Two",
        chainType: "evm",
      },
    };
    const url = provider.makeExplorerUrl(snapshot);
    expect(url).toBe("https://axelarscan.io/gmp/testTxHash");
  });

  it("should generate correct explorer URL for testnet", () => {
    const testnetProvider = new SkipTransferStatusProvider(
      "testnet" as BridgeEnvironment,
      MockChains,
      SkipStatusProvider
    );
    const snapshot: TxSnapshot = {
      ...baseTxSnapshot,
      fromChain: {
        chainId: 2,
        prettyName: "Chain Two",
        chainType: "evm",
      },
    };
    const url = testnetProvider.makeExplorerUrl(snapshot);
    expect(url).toBe("https://testnet.axelarscan.io/gmp/testTxHash");
  });

  it("should generate correct explorer URL for a cosmos chain", () => {
    const cosmosProvider = new SkipTransferStatusProvider(
      "mainnet" as BridgeEnvironment,
      MockChains,
      SkipStatusProvider
    );
    const snapshot: TxSnapshot = {
      ...baseTxSnapshot,
      sendTxHash: "cosmosTxHash",
      toChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
      fromChain: {
        chainId: "cosmoshub-4",
        prettyName: "Cosmos Hub",
        chainType: "cosmos",
      },
    };
    const url = cosmosProvider.makeExplorerUrl(snapshot);
    expect(url).toBe("https://www.mintscan.io/cosmos/txs/cosmosTxHash");
  });

  it("links a Solana-origin transfer to Solscan, then to the intermediate chain once advanced", () => {
    // Solana isn't in the cosmos chain list, so without its own explorer the
    // row would render no link (and warn on every render).
    const solanaSnapshot: TxSnapshot = {
      ...baseTxSnapshot,
      sendTxHash: "5SolanaSig",
      fromChain: {
        chainId: "solana",
        prettyName: "Solana",
        chainType: "solana",
      },
      toChain: {
        chainId: "osmosis-1",
        prettyName: "Osmosis",
        chainType: "cosmos",
      },
    };
    expect(provider.makeExplorerUrl(solanaSnapshot)).toBe(
      "https://solscan.io/tx/5SolanaSig"
    );

    // a multi-tx transfer that advanced onto Noble links the Noble tx
    const advanced: TxSnapshot = {
      ...solanaSnapshot,
      sendTxHash: "NOBLETX",
      trackingChainId: "cosmoshub-4",
    };
    expect(provider.makeExplorerUrl(advanced)).not.toContain("solscan");
  });
});

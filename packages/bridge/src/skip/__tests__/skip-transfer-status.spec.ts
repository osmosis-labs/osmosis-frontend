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
  toTransferStatus,
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

  describe("Solana-signed transfers", () => {
    const solanaSnapshot: TxSnapshot = {
      ...baseTxSnapshot,
      sendTxHash: "solanaSignature",
      fromChain: {
        chainId: "solana",
        prettyName: "Solana",
        chainType: "solana",
      },
      solanaRecentBlockhash: "recentBlockhash",
    };

    const withCheck = (
      outcome: "confirmed" | "failed" | "dropped" | undefined
    ) => {
      const check = jest.fn(async () => outcome);
      const solanaProvider = new SkipTransferStatusProvider(
        "mainnet" as BridgeEnvironment,
        MockChains,
        SkipStatusProvider,
        check
      );
      solanaProvider.statusReceiverDelegate = mockReceiver;
      return { check, solanaProvider };
    };

    const skipState = (state: string) =>
      server.use(
        http.get("https://api.skip.money/v2/tx/status", () =>
          HttpResponse.json({ state })
        )
      );

    it("does not resolve an abandoned transfer as failed on Skip's word alone", async () => {
      // Skip abandons tracking on a timeout; the source tx may have landed
      // and the funds may still arrive.
      skipState("STATE_ABANDONED");
      const { solanaProvider } = withCheck("confirmed");

      await solanaProvider.trackTxStatus(solanaSnapshot);

      expect(mockReceiver.receiveNewTxStatus).not.toHaveBeenCalled();
    });

    it("resolves a restored transfer as failed once the chain proves it was dropped", async () => {
      // Reload-before-confirmation regression: a fresh provider has only the
      // persisted snapshot, including the blockhash recorded at broadcast.
      skipState("STATE_PENDING");
      const { check, solanaProvider } = withCheck("dropped");

      await solanaProvider.trackTxStatus(solanaSnapshot);

      expect(check).toHaveBeenCalledWith({
        signature: "solanaSignature",
        recentBlockhash: "recentBlockhash",
      });
      expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
        "solanaSignature",
        "failed",
        undefined
      );
    });

    it("resolves as failed when the tx failed onchain", async () => {
      skipState("STATE_ABANDONED");
      const { solanaProvider } = withCheck("failed");

      await solanaProvider.trackTxStatus(solanaSnapshot);

      expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
        "solanaSignature",
        "failed",
        undefined
      );
    });

    it("keeps polling when Skip errors and the chain proves nothing yet", async () => {
      // Skip can't see a Solana tx that hasn't landed; its error must not
      // end tracking, or a later dropped proof could never resolve it.
      server.use(
        http.get("https://api.skip.money/v2/tx/status", () =>
          HttpResponse.json({ message: "tx not found" }, { status: 404 })
        )
      );
      const { solanaProvider } = withCheck(undefined);

      await expect(
        solanaProvider.trackTxStatus(solanaSnapshot)
      ).resolves.toBeUndefined();
      expect(mockReceiver.receiveNewTxStatus).not.toHaveBeenCalled();
    });

    it("still reports Skip's own terminal success", async () => {
      skipState("STATE_COMPLETED_SUCCESS");
      const { solanaProvider } = withCheck("confirmed");

      await solanaProvider.trackTxStatus(solanaSnapshot);

      expect(mockReceiver.receiveNewTxStatus).toHaveBeenCalledWith(
        "solanaSignature",
        "success",
        undefined
      );
    });
  });

  describe("toTransferStatus", () => {
    it("maps completed states", () => {
      expect(toTransferStatus("STATE_COMPLETED_SUCCESS")).toBe("success");
      expect(toTransferStatus("STATE_COMPLETED_ERROR")).toBe("failed");
    });

    it("keeps abandoned and in-flight states pending", () => {
      // Skip also abandons slow transfers whose funds can still arrive.
      expect(toTransferStatus("STATE_ABANDONED")).toBe("pending");
      expect(toTransferStatus("STATE_PENDING")).toBe("pending");
      expect(toTransferStatus("STATE_SUBMITTED")).toBe("pending");
    });
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

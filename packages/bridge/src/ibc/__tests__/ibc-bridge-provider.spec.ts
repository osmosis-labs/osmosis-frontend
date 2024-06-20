import { Int } from "@keplr-wallet/unit";
import { estimateGasFee } from "@osmosis-labs/tx";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { MockChains } from "../../__tests__/mock-chains";
import { BridgeQuoteError } from "../../errors";
import {
  BridgeProviderContext,
  BridgeQuote,
  GetBridgeQuoteParams,
} from "../../interface";
import { IbcBridgeProvider } from "../index";

jest.mock("@osmosis-labs/tx", () => ({
  estimateGasFee: jest.fn(),
}));

const mockContext: BridgeProviderContext = {
  chainList: MockChains,
  assetLists: MockAssetLists,
  getTimeoutHeight: jest.fn().mockResolvedValue("1000-1000"),
  env: "mainnet",
  cache: new LRUCache<string, CacheEntry>({ max: 10 }),
};

// deposit of ATOM from Cosmos Hub to Osmosis
const mockAtomToOsmosis: GetBridgeQuoteParams = {
  fromChain: {
    chainId: "cosmoshub-4",
    chainType: "cosmos",
  },
  toChain: {
    chainId: "osmosis-1",
    chainType: "cosmos",
  },
  fromAsset: {
    address: "uatom",
    sourceDenom: "uatom",
    denom: "ATOM",
    decimals: 6,
  },
  toAsset: {
    address:
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    sourceDenom: "uatom",
    denom: "ATOM",
    decimals: 6,
  },
  fromAmount: "1000000", // 1 ATOM
  fromAddress: "osmo1...",
  toAddress: "cosmos1...",
};

const mockAtomFromOsmosis: GetBridgeQuoteParams = {
  fromChain: {
    chainId: "osmosis-1",
    chainType: "cosmos",
  },
  toChain: {
    chainId: "cosmoshub-4",
    chainType: "cosmos",
  },
  fromAsset: {
    address:
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    sourceDenom: "uatom",
    denom: "ATOM",
    decimals: 6,
  },
  toAsset: {
    address: "uatom",
    sourceDenom: "uatom",
    denom: "ATOM",
    decimals: 6,
  },
  fromAmount: "1000000", // 1 ATOM
  fromAddress: "osmo1...",
  toAddress: "cosmos1...",
};

describe("IbcBridgeProvider", () => {
  let provider: IbcBridgeProvider;

  beforeEach(() => {
    provider = new IbcBridgeProvider(mockContext);
    jest.clearAllMocks();
  });

  it("should throw an error if fromChain or toChain is not cosmos", async () => {
    const invalidParams: GetBridgeQuoteParams = {
      ...mockAtomToOsmosis,
      fromChain: { chainId: 1, chainType: "evm" },
    };
    await expect(provider.getQuote(invalidParams)).rejects.toThrow(
      BridgeQuoteError
    );
  });

  it("should throw an error if gas cost exceeds transfer amount", async () => {
    (estimateGasFee as jest.Mock).mockResolvedValue({
      amount: [
        {
          amount: new Int(mockAtomFromOsmosis.fromAmount)
            .add(new Int(100))
            .toString(),
          denom: "uatom",
          isNeededForTx: true,
        },
      ],
    });

    await expect(provider.getQuote(mockAtomToOsmosis)).rejects.toThrow(
      BridgeQuoteError
    );
  });

  it("should return a valid BridgeQuote", async () => {
    (estimateGasFee as jest.Mock).mockResolvedValue({
      amount: [{ amount: "5000", denom: "uatom", isNeededForTx: true }],
    });

    const quote: BridgeQuote = await provider.getQuote(mockAtomToOsmosis);

    expect(quote).toHaveProperty("input");
    expect(quote).toHaveProperty("expectedOutput");
    expect(quote).toHaveProperty("fromChain");
    expect(quote.fromChain.chainId).toBe(mockAtomToOsmosis.fromChain.chainId);
    expect(quote).toHaveProperty("toChain");
    expect(quote.toChain.chainId).toBe(mockAtomToOsmosis.toChain.chainId);
    expect(quote).toHaveProperty("transferFee");
    expect(quote.transferFee.amount).toBe("0");
    expect(quote).toHaveProperty("estimatedTime");
    expect(quote).toHaveProperty("estimatedGasFee");
    expect(quote).toHaveProperty("estimatedGasFee");
    expect(quote.estimatedGasFee!.amount).toBe("5000");
    expect(quote).toHaveProperty("transactionRequest");
  });

  it("should calculate the correct toAmount when gas fee is needed for tx", async () => {
    (estimateGasFee as jest.Mock).mockResolvedValue({
      amount: [{ amount: "5000", denom: "uatom", isNeededForTx: true }],
    });

    const quote: BridgeQuote = await provider.getQuote(mockAtomToOsmosis);

    expect(quote.expectedOutput.amount).toBe(
      new Int(mockAtomToOsmosis.fromAmount).sub(new Int("5000")).toString()
    );
  });

  it("should calculate the correct toAmount when gas fee is not needed for tx", async () => {
    (estimateGasFee as jest.Mock).mockResolvedValue({
      amount: [{ amount: "5000", denom: "uatom", isNeededForTx: false }],
    });

    const quote: BridgeQuote = await provider.getQuote(mockAtomToOsmosis);

    expect(quote.expectedOutput.amount).toBe(mockAtomToOsmosis.fromAmount);
  });

  describe("getIbcSource", () => {
    // extend class to access protected method
    class ExtendedIbcBridgeProvider extends IbcBridgeProvider {
      public getIbcSourcePublic(params: GetBridgeQuoteParams): {
        sourceChannel: string;
        sourcePort: string;
        sourceDenom: string;
      } {
        return this.getIbcSource(params);
      }
    }

    let provider: ExtendedIbcBridgeProvider;

    beforeEach(() => {
      provider = new ExtendedIbcBridgeProvider(mockContext);
    });

    it("should return the correct channel, port and denom for transfer from source", () => {
      const result = provider.getIbcSourcePublic(mockAtomFromOsmosis);

      expect(result.sourceChannel).toBe("channel-0");
      expect(result.sourcePort).toBe("transfer");
      expect(result.sourceDenom).toBe(
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
      );
    });

    it("should return the correct channel, port and denom for transfer from counterparty", () => {
      const result = provider.getIbcSourcePublic(mockAtomToOsmosis);

      expect(result.sourceChannel).toBe("channel-141");
      expect(result.sourcePort).toBe("transfer");
      expect(result.sourceDenom).toBe("uatom");
    });

    it("should throw if asset not found", () => {
      const invalidParams: GetBridgeQuoteParams = {
        ...mockAtomToOsmosis,
        toAsset: {
          ...mockAtomToOsmosis.toAsset,
          sourceDenom: "not-found",
        },
        fromAsset: {
          ...mockAtomToOsmosis.fromAsset,
          sourceDenom: "not-found",
        },
      };

      expect(() => provider.getIbcSourcePublic(invalidParams)).toThrow(
        BridgeQuoteError
      );
    });

    it("should throw if there's no transfer method", () => {
      const invalidParams: GetBridgeQuoteParams = {
        ...mockAtomToOsmosis,
        toAsset: {
          ...mockAtomToOsmosis.toAsset,
          sourceDenom: "uosmo",
        },
        fromAsset: {
          ...mockAtomToOsmosis.fromAsset,
          sourceDenom: "uosmo",
        },
      };

      expect(() => provider.getIbcSourcePublic(invalidParams)).toThrow(
        BridgeQuoteError
      );
    });
  });

  describe("getSupportedAssets", () => {
    it("should return the correct supported assets", async () => {
      const supportedAssets = await provider.getSupportedAssets({
        chain: {
          chainId: "osmosis-1",
          chainType: "cosmos",
        },
        asset: {
          denom: "ATOM",
          address:
            "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          decimals: 6,
          sourceDenom: "uatom",
        },
      });

      expect(supportedAssets).toEqual([
        {
          chainId: "cosmoshub-4",
          chainType: "cosmos",
          denom: "ATOM",
          address: "uatom",
          decimals: 6,
          sourceDenom: "uatom",
        },
      ]);
    });
  });
});

describe("IbcBridgeProvider.getExternalUrl", () => {
  let provider: IbcBridgeProvider;

  beforeEach(() => {
    provider = new IbcBridgeProvider(mockContext);
    jest.clearAllMocks();
  });

  it("should return undefined for EVM fromChain", async () => {
    const url = await provider.getExternalUrl({
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "cosmoshub-4", chainType: "cosmos" },
      fromAsset: {
        sourceDenom: "weth-wei",
        address: "weth-wei",
        decimals: 18,
        denom: "WETH",
      },
      toAsset: {
        sourceDenom: "uatom",
        address: "uatom",
        decimals: 6,
        denom: "ATOM",
      },
      toAddress: "cosmos1...",
    });

    expect(url).toBeUndefined();
  });

  it("should return undefined for EVM toChain", async () => {
    const params = {
      fromChain: { chainId: "osmosis-1", chainType: "cosmos" },
      toChain: { chainId: 1, chainType: "evm" },
      fromAsset: { sourceDenom: "uosmo" },
      toAsset: { sourceDenom: "weth-wei" },
    } as Parameters<typeof provider.getExternalUrl>[0];

    const url = await provider.getExternalUrl(params);

    expect(url).toBeUndefined();
  });

  it("should generate the correct URL for given parameters", async () => {
    const expectedUrl =
      "https://geo.tfm.com/?chainFrom=osmosis-1&token0=uosmo&chainTo=cosmoshub-4&token1=uatom";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: "osmosis-1", chainType: "cosmos" },
      toChain: { chainId: "cosmoshub-4", chainType: "cosmos" },
      fromAsset: {
        sourceDenom: "uosmo",
        address: "uosmo",
        decimals: 6,
        denom: "OSMO",
      },
      toAsset: {
        sourceDenom: "uatom",
        address: "uatom",
        decimals: 6,
        denom: "ATOM",
      },
      toAddress: "cosmos1...",
    });

    expect(result?.urlProviderName).toBe("TFM");
    expect(result?.url.toString()).toBe(expectedUrl);
  });
});

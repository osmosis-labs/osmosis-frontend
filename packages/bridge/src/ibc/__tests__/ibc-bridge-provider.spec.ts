import { estimateGasFee } from "@osmosis-labs/tx";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { MockChains } from "../../__tests__/mock-chains";
import { server } from "../../__tests__/msw";
import { BridgeQuoteError } from "../../errors";
import {
  BridgeProviderContext,
  BridgeQuote,
  GetBridgeQuoteParams,
} from "../../interface";
import { IbcBridgeProvider } from "../index";
import { MockGeneratedChains } from "./mock-chains"; // Ensure this import is correct

jest.mock("@osmosis-labs/tx", () => ({
  ...jest.requireActual("@osmosis-labs/tx"),
  estimateGasFee: jest.fn(),
}));

jest.mock("@osmosis-labs/server", () => ({
  ...jest.requireActual("@osmosis-labs/server"),
  queryRPCStatus: jest.fn().mockResolvedValue({
    jsonrpc: "2.0",
    id: 1,
    result: {
      validator_info: {
        address: "mock_address",
        pub_key: {
          type: "mock_type",
          value: "mock_value",
        },
        voting_power: "mock_voting_power",
      },
      node_info: {
        protocol_version: {
          p2p: "mock_p2p",
          block: "mock_block",
          app: "mock_app",
        },
        id: "mock_id",
        listen_addr: "mock_listen_addr",
        network: "mock_network",
        version: "mock_version",
        channels: "mock_channels",
        moniker: "mock_moniker",
        other: {
          tx_index: "on" as const,
          rpc_address: "mock_rpc_address",
        },
      },
      sync_info: {
        // reasonable time range
        latest_block_hash: "mock_latest_block_hash",
        latest_app_hash: "mock_latest_app_hash",
        earliest_block_hash: "mock_earliest_block_hash",
        earliest_app_hash: "mock_earliest_app_hash",
        latest_block_height: "100",
        earliest_block_height: "90",
        latest_block_time: new Date(Date.now() - 10000).toISOString(),
        earliest_block_time: new Date(Date.now() - 20000).toISOString(),
        catching_up: false,
      },
    },
  }),
  DEFAULT_LRU_OPTIONS: { max: 10 },
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
    denom: "ATOM",
    decimals: 6,
  },
  toAsset: {
    address:
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
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
    denom: "ATOM",
    decimals: 6,
  },
  toAsset: {
    address: "uatom",
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
    server.use(
      rest.get(
        "https://raw.githubusercontent.com/osmosis-labs/assetlists/main/osmosis-1/generated/frontend/chainlist.json",
        (_req, res, ctx) =>
          res(ctx.json({ zone: "osmosis", chains: MockGeneratedChains }))
      )
    );
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

  it("should return a valid BridgeQuote", async () => {
    (estimateGasFee as jest.Mock).mockResolvedValue({
      amount: [{ amount: "5000", denom: "uatom", isSubtractiveFee: true }],
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

  it("should calculate the correct toAmount when gas fee is not needed for tx", async () => {
    (estimateGasFee as jest.Mock).mockResolvedValue({
      amount: [{ amount: "5000", denom: "uatom", isSubtractiveFee: false }],
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
        address: string;
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
      expect(result.address).toBe(
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2"
      );
    });

    it("should return the correct channel, port and denom for transfer from counterparty", () => {
      const result = provider.getIbcSourcePublic(mockAtomToOsmosis);

      expect(result.sourceChannel).toBe("channel-141");
      expect(result.sourcePort).toBe("transfer");
      expect(result.address).toBe("uatom");
    });

    it("should throw if asset not found", () => {
      const invalidParams: GetBridgeQuoteParams = {
        ...mockAtomToOsmosis,
        toAsset: {
          ...mockAtomToOsmosis.toAsset,
          address: "not-found",
        },
        fromAsset: {
          ...mockAtomToOsmosis.fromAsset,
          address: "not-found",
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
          address: "uosmo",
        },
        fromAsset: {
          ...mockAtomToOsmosis.fromAsset,
          address: "uosmo",
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
        },
        direction: "deposit",
      });

      expect(supportedAssets).toEqual([
        {
          chainId: "cosmoshub-4",
          chainType: "cosmos",
          denom: "ATOM",
          address: "uatom",
          decimals: 6,
          transferTypes: ["quote"],
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
        address: "weth-wei",
        decimals: 18,
        denom: "WETH",
      },
      toAsset: {
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
      fromAsset: { address: "uosmo" },
      toAsset: { address: "weth-wei" },
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
        address: "uosmo",
        decimals: 6,
        denom: "OSMO",
      },
      toAsset: {
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

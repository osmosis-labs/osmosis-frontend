// eslint-disable-next-line import/no-extraneous-dependencies
import { AxelarAssetTransfer } from "@axelar-network/axelarjs-sdk";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { AxelarBridgeProvider } from "../axelar/index";
import { BridgeProviderContext } from "../interface";
import { MockAssetLists } from "./mock-asset-lists";
import { MockChains } from "./mock-chains";
import { server } from "./msw";

jest.mock("ethers", () => {
  const originalModule = jest.requireActual("ethers");
  return {
    ...originalModule,
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      estimateGas: jest.fn().mockResolvedValue("21000"),
      _perform: jest.fn().mockResolvedValue("20000000000"), // Mock gas price
    })),
  };
});

beforeEach(() => {
  server.use(
    rest.post("https://api.axelarscan.io/deposit-address", (_req, res, ctx) => {
      return res(ctx.json({ depositAddress: "0x123" }));
    })
  );
});

describe("AxelarBridgeProvider", () => {
  let provider: AxelarBridgeProvider;
  let ctx: BridgeProviderContext;

  beforeEach(() => {
    ctx = {
      env: "mainnet",
      cache: new LRUCache<string, CacheEntry>({
        max: 500,
      }),
      assetLists: MockAssetLists,
      chainList: MockChains,
      getTimeoutHeight: jest.fn().mockResolvedValue({
        revisionNumber: "1",
        revisionHeight: "1000",
      }),
    };
    provider = new AxelarBridgeProvider(ctx);
  });

  it("should initialize clients", async () => {
    await provider.initClients();
    expect(provider["_queryClient"]).not.toBeNull();
    expect(provider["_assetTransferClient"]).not.toBeNull();
  });

  it("should get a deposit address", async () => {
    const mockDepositClient: Partial<AxelarAssetTransfer> = {
      getDepositAddress: jest.fn().mockResolvedValue("0x123"),
    };

    jest
      .spyOn(provider, "getAssetTransferClient")
      .mockResolvedValue(mockDepositClient as unknown as AxelarAssetTransfer);

    const depositAddress = await provider.getDepositAddress({
      fromChain: { chainId: "1", chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: "43114", chainName: "Avalanche", chainType: "evm" },
      fromAsset: {
        denom: "ETH",
        address: "0x0",
        decimals: 18,
        sourceDenom: "eth",
      },
      toAddress: "0x456",
    });

    expect(depositAddress).toEqual({ depositAddress: "0x123" });
  });

  it("should throw an error for unsupported chains", async () => {
    await expect(
      provider.getDepositAddress({
        fromChain: {
          chainId: "unsupported",
          chainName: "Unsupported",
          chainType: "evm",
        },
        toChain: {
          chainId: "unsupported",
          chainName: "Unsupported",
          chainType: "evm",
        },
        fromAsset: {
          denom: "ETH",
          address: "0x0",
          decimals: 18,
          sourceDenom: "eth",
        },
        toAddress: "0x456",
      })
    ).rejects.toThrow("Unsupported chain");
  });

  it.only("should estimate gas cost for EVM transactions", async () => {
    const gasCost = await provider.estimateGasCost({
      fromChain: { chainId: "1", chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: "43114", chainName: "Avalanche", chainType: "evm" },
      fromAsset: {
        denom: "ETH",
        address: "0x0",
        decimals: 18,
        sourceDenom: "eth",
      },
      toAsset: {
        denom: "AVAX",
        address: "0x0",
        decimals: 18,
        sourceDenom: "avax",
      },
      fromAmount: "1",
      fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
      toAddress: "0x4567890abcdef1234567890abcdef1234567890ab",
    });

    console.log(gasCost);

    expect(gasCost).toBeDefined();
    expect(gasCost?.amount).toBeDefined();
    expect(gasCost?.denom).toBe("ETH");
  });

  it("should create an EVM transaction", async () => {
    const transaction = await provider.createEvmTransaction({
      fromChain: { chainId: "1", chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: "43114", chainName: "Avalanche", chainType: "evm" },
      fromAsset: {
        denom: "ETH",
        address: "0x0",
        decimals: 18,
        sourceDenom: "eth",
      },
      toAsset: {
        denom: "AVAX",
        address: "0x0",
        decimals: 18,
        sourceDenom: "avax",
      },
      fromAmount: "1",
      fromAddress: "0x123",
      toAddress: "0x456",
      simulated: false,
    });

    expect(transaction).toEqual({
      type: "evm",
      to: "0x123",
      value: "0x1",
    });
  });

  it("should create a Cosmos transaction", async () => {
    const transaction = await provider.createCosmosTransaction({
      fromChain: {
        chainId: "cosmoshub-4",
        chainName: "Cosmos Hub",
        chainType: "cosmos",
      },
      toChain: {
        chainId: "osmosis-1",
        chainName: "Osmosis",
        chainType: "cosmos",
      },
      fromAsset: {
        denom: "ATOM",
        address: "cosmos1...",
        decimals: 6,
        sourceDenom: "uatom",
      },
      toAsset: {
        denom: "OSMO",
        address: "osmo1...",
        decimals: 6,
        sourceDenom: "uosmo",
      },
      fromAmount: "1000000",
      fromAddress: "cosmos1...",
      toAddress: "osmo1...",
      simulated: false,
    });

    expect(transaction).toEqual({
      type: "cosmos",
      msgTypeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      msg: expect.any(Object),
    });
  });

  it("should get a quote", async () => {
    const quote = await provider.getQuote({
      fromChain: { chainId: "1", chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: "43114", chainName: "Avalanche", chainType: "evm" },
      fromAsset: {
        denom: "ETH",
        address: "0x0",
        decimals: 18,
        sourceDenom: "eth",
      },
      toAsset: {
        denom: "AVAX",
        address: "0x0",
        decimals: 18,
        sourceDenom: "avax",
      },
      fromAmount: "1",
      fromAddress: "0x123",
      toAddress: "0x456",
      slippage: 1,
    });

    expect(quote).toBeDefined();
    expect(quote.input.amount).toBe("1");
    expect(quote.expectedOutput.amount).toBeDefined();
  });

  it("should handle errors in getQuote", async () => {
    jest.spyOn(provider, "getQueryClient").mockImplementationOnce(() => {
      throw new Error("Query client error");
    });

    await expect(
      provider.getQuote({
        fromChain: { chainId: "1", chainName: "Ethereum", chainType: "evm" },
        toChain: { chainId: "43114", chainName: "Avalanche", chainType: "evm" },
        fromAsset: {
          denom: "ETH",
          address: "0x0",
          decimals: 18,
          sourceDenom: "eth",
        },
        toAsset: {
          denom: "AVAX",
          address: "0x0",
          decimals: 18,
          sourceDenom: "avax",
        },
        fromAmount: "1",
        fromAddress: "0x123",
        toAddress: "0x456",
        slippage: 1,
      })
    ).rejects.toThrow("Query client error");
  });
});

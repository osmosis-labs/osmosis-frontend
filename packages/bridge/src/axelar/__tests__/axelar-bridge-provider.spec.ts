// eslint-disable-next-line import/no-extraneous-dependencies
import {
  AxelarAssetTransfer,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { server } from "../../__tests__/msw";
import { NativeEVMTokenConstantAddress } from "../../ethereum";
import { BridgeProviderContext } from "../../interface";
import { AxelarBridgeProvider } from "../index";
import {
  MockAxelarAssets,
  MockAxelarChains,
} from "./mock-axelar-assets-and-chains";

jest.mock("viem", () => ({
  ...jest.requireActual("viem"),
  createPublicClient: jest.fn().mockImplementation(() => ({
    estimateGas: jest.fn().mockResolvedValue(BigInt("21000")),
    getGasPrice: jest.fn().mockResolvedValue(BigInt("0x4a817c800")),
  })),
  http: jest.fn(),
}));

beforeEach(() => {
  server.use(
    rest.post("https://api.axelarscan.io/deposit-address", (_req, res, ctx) => {
      return res(ctx.json({ depositAddress: "0x123" }));
    }),
    rest.get(
      "https://axelar-mainnet.s3.us-east-2.amazonaws.com/mainnet-asset-config.json",
      (_req, res, ctx) => {
        return res(ctx.json({}));
      }
    ),
    rest.get("https://api.axelarscan.io/api/getAssets", (_req, res, ctx) => {
      return res(ctx.json(MockAxelarAssets));
    }),
    rest.get("https://api.axelarscan.io/api/getChains", (_req, res, ctx) => {
      return res(ctx.json(MockAxelarChains));
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
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
      // not used
      chainList: [],
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
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
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
          chainId: 989898989898,
          chainName: "Unsupported",
          chainType: "evm",
          networkName: "unsupported",
        },
        toChain: {
          chainId: 989898989898,
          chainName: "Unsupported",
          chainType: "evm",
          networkName: "unsupported",
        },
        fromAsset: {
          denom: "ETH",
          address: "0x0",
          decimals: 18,
          sourceDenom: "eth",
        },
        toAddress: "0x456",
      })
    ).rejects.toThrow(
      "Unsupported chain: Chain ID 989898989898 is not supported."
    );
  });

  it("should estimate gas cost for EVM transactions", async () => {
    const gasCost = await provider.estimateGasCost({
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
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

    expect(gasCost).toBeDefined();
    expect(gasCost?.amount).toBeDefined();
    // Should be a string representation of a number
    expect(gasCost?.amount).toMatch(/^\d+(\.\d+)?$/);
    expect(gasCost?.denom).toBe("ETH");
    expect(gasCost?.sourceDenom).toBe("ETH");
    expect(gasCost?.decimals).toBe(18);
  });

  it("should create an EVM transaction", async () => {
    const mockDepositClient: Partial<AxelarAssetTransfer> = {
      getDepositAddress: jest
        .fn()
        .mockResolvedValue("0x1234567890abcdef1234567890abcdef12345678"),
    };

    jest
      .spyOn(provider, "getAssetTransferClient")
      .mockResolvedValue(mockDepositClient as unknown as AxelarAssetTransfer);

    const transaction = await provider.createEvmTransaction({
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
      fromAsset: {
        denom: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        sourceDenom: "eth",
      },
      toAsset: {
        denom: "AVAX",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        sourceDenom: "avax",
      },
      fromAmount: "1",
      fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
      toAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
      simulated: false,
    });

    expect(transaction).toEqual({
      data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef123456780000000000000000000000000000000000000000000000000000000000000001",
      type: "evm",
      to: "0x0000000000000000000000000000000000000000",
    });
  });

  it("should create an EVM transaction with native token", async () => {
    const mockDepositClient: Partial<AxelarAssetTransfer> = {
      getDepositAddress: jest
        .fn()
        .mockResolvedValue("0x1234567890abcdef1234567890abcdef12345678"),
    };

    jest
      .spyOn(provider, "getAssetTransferClient")
      .mockResolvedValue(mockDepositClient as unknown as AxelarAssetTransfer);

    const transaction = await provider.createEvmTransaction({
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
      fromAsset: {
        denom: "ETH",
        address: NativeEVMTokenConstantAddress,
        decimals: 18,
        sourceDenom: "eth",
      },
      toAsset: {
        denom: "AVAX",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        sourceDenom: "avax",
      },
      fromAmount: "1",
      fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
      toAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
      simulated: false,
    });

    expect(transaction).toEqual({
      value: "0x1", // same as from amount
      type: "evm",
      to: "0x1234567890abcdef1234567890abcdef12345678",
    });
  });

  it("should throw an error when creating an EVM transaction with a non-native token", async () => {
    const mockDepositClient: Partial<AxelarAssetTransfer> = {
      getDepositAddress: jest
        .fn()
        .mockResolvedValue("0x1234567890abcdef1234567890abcdef12345678"),
    };

    jest
      .spyOn(provider, "getAssetTransferClient")
      .mockResolvedValue(mockDepositClient as unknown as AxelarAssetTransfer);

    await expect(
      provider.createEvmTransaction({
        fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
        toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
        fromAsset: {
          denom: "ETH",
          address: NativeEVMTokenConstantAddress,
          decimals: 6,
          sourceDenom: "weth",
        },
        toAsset: {
          denom: "ETH",
          address: NativeEVMTokenConstantAddress,
          decimals: 6,
          sourceDenom: "eth",
        },
        fromAmount: "1",
        fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
        toAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
        simulated: false,
      })
    ).rejects.toThrow("eth is not a native token on Axelar");
  });

  it("should create a Cosmos transaction", async () => {
    const mockDepositClient: Partial<AxelarAssetTransfer> = {
      getDepositAddress: jest
        .fn()
        .mockResolvedValue("0x1234567890abcdef1234567890abcdef12345678"),
    };

    jest
      .spyOn(provider, "getAssetTransferClient")
      .mockResolvedValue(mockDepositClient as unknown as AxelarAssetTransfer);

    const transaction = await provider.createCosmosTransaction({
      fromChain: {
        chainId: "osmosis-1",
        chainName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      fromAsset: {
        denom: "USDC.axl",
        address: "cosmos1...",
        decimals: 6,
        sourceDenom: "uusdc",
      },
      toAsset: {
        denom: "USDC",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        decimals: 6,
        sourceDenom: "uusdc",
      },
      fromAmount: "1000000",
      fromAddress: "cosmos1...",
      toAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      simulated: false,
    });

    expect(transaction).toEqual({
      type: "cosmos",
      msgTypeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      msg: {
        receiver: "0x1234567890abcdef1234567890abcdef12345678",
        sender: "cosmos1...",
        sourceChannel: "channel-208",
        sourcePort: "transfer",
        timeoutHeight: {
          revisionHeight: "1000",
          revisionNumber: "1",
        },
        timeoutTimestamp: "0",
        token: {
          amount: "1000000",
          denom: "cosmos1...",
        },
      },
    });
  });

  it("should get a quote", async () => {
    const mockDepositClient: Partial<AxelarAssetTransfer> = {
      getDepositAddress: jest.fn().mockResolvedValue("0x123"),
    };
    const mockQueryClient: Partial<AxelarQueryAPI> = {
      getTransferFee: jest.fn().mockResolvedValue({
        fee: {
          amount: "0.01",
          denom: "ETH",
        },
      }),
      getTransferLimit: jest.fn().mockResolvedValue("1000000"),
    };

    jest
      .spyOn(provider, "getAssetTransferClient")
      .mockResolvedValue(mockDepositClient as AxelarAssetTransfer);
    jest
      .spyOn(provider, "getQueryClient")
      .mockResolvedValue(mockQueryClient as AxelarQueryAPI);

    const quote = await provider.getQuote({
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
      fromAsset: {
        denom: "ETH",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
        sourceDenom: "eth",
      },
      toAsset: {
        denom: "AVAX",
        address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        decimals: 18,
        sourceDenom: "avax",
      },
      fromAmount: "1",
      fromAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      toAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      slippage: 1,
    });

    expect(quote).toBeDefined();
    expect(quote).toEqual({
      estimatedTime: 900,
      input: { amount: "1", sourceDenom: "eth", decimals: 18, denom: "ETH" },
      expectedOutput: {
        amount: "0.990000000000000000",
        sourceDenom: "avax",
        decimals: 18,
        denom: "AVAX",
        priceImpact: "0",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
      transferFee: {
        amount: "0.01",
        denom: "ETH",
        sourceDenom: "eth",
        decimals: 18,
      },
      estimatedGasFee: {
        amount: "420000000000000",
        denom: "ETH",
        sourceDenom: "ETH",
        decimals: 18,
      },
    });
  });

  it("should throw an error if the amount surpasses the transfer limit", async () => {
    const mockDepositClient: Partial<AxelarAssetTransfer> = {
      getDepositAddress: jest.fn().mockResolvedValue("0x123"),
    };
    const mockQueryClient: Partial<AxelarQueryAPI> = {
      getTransferFee: jest.fn().mockResolvedValue({
        fee: {
          amount: "0.01",
          denom: "ETH",
        },
      }),
      getTransferLimit: jest.fn().mockResolvedValue("1"),
    };

    jest
      .spyOn(provider, "getAssetTransferClient")
      .mockResolvedValue(mockDepositClient as AxelarAssetTransfer);
    jest
      .spyOn(provider, "getQueryClient")
      .mockResolvedValue(mockQueryClient as AxelarQueryAPI);

    await expect(
      provider.getQuote({
        fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
        toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
        fromAsset: {
          denom: "ETH",
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          decimals: 18,
          sourceDenom: "eth",
        },
        toAsset: {
          denom: "AVAX",
          address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
          decimals: 18,
          sourceDenom: "avax",
        },
        fromAmount: "1.1",
        fromAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        toAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        slippage: 1,
      })
    ).rejects.toThrow(
      "Amount exceeds transfer limit of 0.000000000000000001 ETH"
    );
  });

  it("should handle errors in getQuote", async () => {
    jest.spyOn(provider, "getQueryClient").mockImplementationOnce(() => {
      throw new Error("Query client error");
    });

    await expect(
      provider.getQuote({
        fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
        toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
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

  it("should throw an error when withdrawing native asset without using 'autoUnwrapIntoNative'", async () => {
    const mockDepositClient: Partial<AxelarAssetTransfer> = {
      getDepositAddress: jest
        .fn()
        .mockResolvedValue("0x1234567890abcdef1234567890abcdef12345678"),
    };

    jest
      .spyOn(provider, "getAssetTransferClient")
      .mockResolvedValue(mockDepositClient as unknown as AxelarAssetTransfer);

    await expect(
      provider.createCosmosTransaction({
        fromChain: {
          chainId: "osmosis-1",
          chainName: "Osmosis",
          chainType: "cosmos",
        },
        toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
        fromAsset: {
          denom: "ETH",
          address: NativeEVMTokenConstantAddress,
          decimals: 6,
          sourceDenom: "eth",
        },
        toAsset: {
          denom: "ETH",
          address: NativeEVMTokenConstantAddress,
          decimals: 6,
          sourceDenom: "eth",
        },
        fromAmount: "1000000",
        fromAddress: "cosmos1...",
        toAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
        simulated: false,
      })
    ).rejects.toThrow(
      "When withdrawing native ETH from Axelar, use the 'autoUnwrapIntoNative' option and not the native minimal denom"
    );
  });
});

describe("AxelarBridgeProvider.getExternalUrl", () => {
  let provider: AxelarBridgeProvider;
  let ctx: BridgeProviderContext;

  beforeEach(() => {
    ctx = {
      env: "mainnet",
      cache: new LRUCache<string, CacheEntry>({
        max: 500,
      }),
      assetLists: MockAssetLists,
      // not used
      chainList: [],
      getTimeoutHeight: jest.fn().mockResolvedValue({
        revisionNumber: "1",
        revisionHeight: "1000",
      }),
    };
    provider = new AxelarBridgeProvider(ctx);
  });

  it("should return the correct URL for Weth <> axlEth", async () => {
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "ETH",
        sourceDenom: "weth-wei",
        decimals: 18,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "weth-wei",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Skip");
    expect(result?.url.toString()).toBe(
      "https://satellite.money/?source=Ethereum&destination=osmosis&asset_denom=weth-wei&destination_address=destination-address"
    );
  });

  it("should return the correct URL for Eth <> axlEth", async () => {
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "ETH",
        sourceDenom: "weth-wei",
        decimals: 18,
        address: NativeEVMTokenConstantAddress,
      },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "weth-wei",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Skip");
    expect(result?.url.toString()).toBe(
      "https://satellite.money/?source=Ethereum&destination=osmosis&asset_denom=eth&destination_address=destination-address"
    );
  });

  it("should return the correct URL for USDC <> axlUSDC", async () => {
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "USDC",
        sourceDenom: "uusdc",
        decimals: 6,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
      toAsset: {
        address:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        decimals: 6,
        denom: "USDC",
        sourceDenom: "uusdc",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Skip");
    expect(result?.url.toString()).toBe(
      "https://satellite.money/?source=Ethereum&destination=osmosis&asset_denom=uusdc&destination_address=destination-address"
    );
  });

  it("should return the correct URL for USDC <> axlUSDC (Avalanche)", async () => {
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 43114, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "USDC",
        sourceDenom: "uusdc",
        decimals: 6,
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      },
      toAsset: {
        address:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        decimals: 6,
        denom: "USDC",
        sourceDenom: "uusdc",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Skip");
    expect(result?.url.toString()).toBe(
      "https://satellite.money/?source=Avalanche&destination=osmosis&asset_denom=uusdc&destination_address=destination-address"
    );
  });

  it("should throw an error if fromChain is not found", async () => {
    await expect(
      provider.getExternalUrl({
        fromChain: { chainId: 9898989898988, chainType: "evm" },
        toChain: { chainId: "chain2", chainType: "cosmos" },
        fromAsset: {
          address: "address1",
          denom: "denom1",
          sourceDenom: "sourceDenom1",
          decimals: 18,
        },
        toAsset: {
          address: "address2",
          denom: "denom2",
          sourceDenom: "sourceDenom2",
          decimals: 18,
        },
        toAddress: "destination-address",
      })
    ).rejects.toThrow("Chain not found: 9898989898988");
  });

  it("should throw an error if toChain is not found", async () => {
    await expect(
      provider.getExternalUrl({
        fromChain: { chainId: 1, chainType: "evm" },
        toChain: { chainId: "nonexistent", chainType: "cosmos" },
        fromAsset: {
          address: "address1",
          denom: "denom1",
          sourceDenom: "sourceDenom1",
          decimals: 18,
        },
        toAsset: {
          address: "address2",
          denom: "denom2",
          sourceDenom: "sourceDenom2",
          decimals: 18,
        },
        toAddress: "destination-address",
      })
    ).rejects.toThrow("Chain not found: nonexistent");
  });

  it("should throw an error if toAsset is not found", async () => {
    await expect(
      provider.getExternalUrl({
        fromChain: { chainId: 1, chainType: "evm" },
        toChain: { chainId: "osmosis-1", chainType: "cosmos" },
        fromAsset: {
          address: "address1",
          denom: "denom1",
          sourceDenom: "sourceDenom1",
          decimals: 18,
        },
        toAsset: {
          address: "nonexistent",
          denom: "denom2",
          sourceDenom: "sourceDenom2",
          decimals: 18,
        },
        toAddress: "destination-address",
      })
    ).rejects.toThrow("Asset not found: nonexistent");
  });
});

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  AxelarAssetTransfer,
  AxelarQueryAPI,
} from "@axelar-network/axelarjs-sdk";
import { estimateGasFee } from "@osmosis-labs/tx";
import { NativeEVMTokenConstantAddress } from "@osmosis-labs/utils";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { server } from "../../__tests__/msw";
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

jest.mock("@osmosis-labs/tx", () => ({
  ...jest.requireActual("@osmosis-labs/tx"),
  estimateGasFee: jest.fn(),
}));

jest.mock("@cosmjs/proto-signing", () => ({
  ...jest.requireActual("@cosmjs/proto-signing"),
  Registry: jest.fn().mockReturnValue({
    encodeAsAny: jest.fn().mockReturnValue("any"),
  }),
}));

beforeEach(() => {
  server.use(
    rest.post("https://api.axelarscan.io/deposit-address", (_req, res, ctx) =>
      res(ctx.json({ depositAddress: "0x123" }))
    ),
    rest.get(
      "https://axelar-mainnet.s3.us-east-2.amazonaws.com/mainnet-asset-config.json",
      (_req, res, ctx) => res(ctx.json({}))
    ),
    rest.get("https://api.axelarscan.io/api/getChains", (_req, res, ctx) =>
      res(ctx.json(MockAxelarChains))
    ),
    rest.get("https://api.axelarscan.io/api/getAssets", (_req, res, ctx) =>
      res(ctx.json(MockAxelarAssets))
    )
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("AxelarBridgeProvider", () => {
  let provider: AxelarBridgeProvider;

  beforeEach(() => {
    provider = new AxelarBridgeProvider({
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
    });
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

    const depositAddress = await provider.getAxelarDepositAddress({
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: {
        chainId: "osmosis-1",
        chainName: "Osmosis",
        chainType: "cosmos",
      },
      fromAsset: {
        denom: "ETH",
        address: NativeEVMTokenConstantAddress,
        decimals: 18,
      },
      toAsset: {
        denom: "ETH.axl",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
      },
      toAddress: "0x456",
    });

    expect(depositAddress).toEqual({ depositAddress: "0x123" });
  });

  it("should throw an error for unsupported chains", async () => {
    await expect(
      provider.getAxelarDepositAddress({
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
        },
        toAsset: {
          denom: "ETH",
          address: "0x0",
          decimals: 18,
        },
        toAddress: "0x456",
      })
    ).rejects.toThrow("Chain not found: 989898989898");
  });

  it("should estimate gas cost for EVM transactions", async () => {
    const gasCost = await provider.estimateGasCost({
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
      fromAsset: {
        denom: "WETH",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
      },
      toAsset: {
        denom: "axlETH",
        address: "0x42A62eb3Fd2a05eD499117F128de8a3192B49EBB",
        decimals: 18,
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
    expect(gasCost?.address).toBe("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
    expect(gasCost?.decimals).toBe(18);
  });

  it("should estimate gas cost for Cosmos transactions", async () => {
    (estimateGasFee as jest.Mock).mockResolvedValue({
      gas: "1000",
      amount: [
        {
          denom: "uosmo",
          amount: "1000",
        },
      ],
    });

    const gasCost = await provider.estimateGasCost({
      fromChain: {
        chainId: "osmosis-1",
        chainName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: {
        chainId: 1,
        chainName: "Ethereum",
        chainType: "evm",
      },
      fromAsset: {
        denom: "USDC.axl",
        address:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        decimals: 6,
      },
      toAsset: {
        denom: "USDc",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        decimals: 6,
      },
      fromAmount: "1",
      fromAddress: "cosmos1ABC123",
      toAddress: "0x123ABC",
    });

    expect(gasCost).toBeDefined();
    expect(gasCost!.amount).toBeDefined();
    // Should be a string representation of a number
    expect(gasCost!.amount).toBe("1000");
    expect(gasCost!.denom).toBe("OSMO");
    expect(gasCost!.address).toBe("uosmo");
    expect(gasCost!.decimals).toBe(6);
  });

  it("should create an EVM transaction - ERC20 transfer", async () => {
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
        denom: "WETH",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
      },
      toAsset: {
        denom: "axlETH",
        address: "0x42A62eb3Fd2a05eD499117F128de8a3192B49EBB",
        decimals: 18,
      },
      fromAmount: "1",
      fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
      toAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
      simulated: false,
    });

    expect(transaction).toEqual({
      data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef123456780000000000000000000000000000000000000000000000000000000000000001",
      type: "evm",
      to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // ERC20 contract address of fromAsset (WETH)
    });
  });

  it("should create an EVM transaction - native send", async () => {
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
      },
      toAsset: {
        denom: "AVAX",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
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
        address:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        decimals: 6,
      },
      toAsset: {
        denom: "USDC",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        decimals: 6,
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
          denom:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
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
      },
      toAsset: {
        denom: "AVAX",
        address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        decimals: 18,
      },
      fromAmount: "1",
      fromAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      toAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      slippage: 1,
    });

    expect(quote).toBeDefined();
    expect(quote).toEqual({
      estimatedTime: 900,
      input: {
        amount: "1",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
        denom: "ETH",
      },
      expectedOutput: {
        amount: "0.990000000000000000",
        address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        decimals: 18,
        denom: "AVAX",
        priceImpact: "0",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
      transferFee: {
        amount: "0.01",
        denom: "ETH",
        chainId: 1,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
      },
      estimatedGasFee: {
        amount: "420000000000000",
        denom: "ETH",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
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
        },
        toAsset: {
          denom: "AVAX",
          address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
          decimals: 18,
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
          denom: "WETH",
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          decimals: 18,
        },
        toAsset: {
          denom: "axlETH",
          address: "0x42A62eb3Fd2a05eD499117F128de8a3192B49EBB",
          decimals: 18,
        },
        fromAmount: "1",
        fromAddress: "0x123",
        toAddress: "0x456",
        slippage: 1,
      })
    ).rejects.toThrow("Query client error");
  });

  describe("getSupportedAssets", () => {
    it("gets source axelar assets - Ethereum USDC", async () => {
      const sourceVariants = await provider.getSupportedAssets({
        chain: {
          chainId: "osmosis-1",
          chainType: "cosmos",
        },
        asset: {
          denom: "USDC.axl",
          address:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
          decimals: 6,
        },
        direction: "deposit",
      });

      expect(sourceVariants).toEqual([
        {
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          chainId: 1,
          chainName: "Ethereum",
          chainType: "evm",
          coinGeckoId: "usd-coin",
          decimals: 6,
          denom: "USDC",
        },
      ]);
    });

    it("gets unwrapped source assets (i.e. ETH from Osmosis WETH) - WETH & ETH", async () => {
      const sourceVariants = await provider.getSupportedAssets({
        chain: {
          chainId: "osmosis-1",
          chainType: "cosmos",
        },
        asset: {
          denom: "ETH",
          address:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
          decimals: 6,
        },
        direction: "deposit",
      });

      expect(sourceVariants).toEqual([
        {
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          chainId: 1,
          chainName: "Ethereum",
          chainType: "evm",
          coinGeckoId: "weth",
          decimals: 18,
          denom: "WETH",
        },
        {
          // this is the denom accepted by Axelar APIs
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          chainId: 1,
          chainName: "Ethereum",
          chainType: "evm",
          coinGeckoId: "weth",
          decimals: 18,
          denom: "ETH",
        },
      ]);
    });
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
        decimals: 18,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Satellite Money");
    expect(result?.url.toString()).toBe(
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=weth-wei&destination_address=destination-address"
    );
  });

  it("should return the correct URL for ETH <> axlEth", async () => {
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "ETH",
        decimals: 18,
        address: NativeEVMTokenConstantAddress,
      },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Satellite Money");
    expect(result?.url.toString()).toBe(
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=eth&destination_address=destination-address"
    );
  });

  it("should return the correct URL for USDC <> axlUSDC", async () => {
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "USDC",
        decimals: 6,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
      toAsset: {
        address:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        decimals: 6,
        denom: "USDC",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Satellite Money");
    expect(result?.url.toString()).toBe(
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=uusdc&destination_address=destination-address"
    );
  });

  it("should return the correct URL for USDC <> axlUSDC (Avalanche)", async () => {
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 43114, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "USDC",
        decimals: 6,
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      },
      toAsset: {
        address:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        decimals: 6,
        denom: "USDC",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Satellite Money");
    expect(result?.url.toString()).toBe(
      "https://satellite.money/?source=avalanche&destination=osmosis&asset_denom=avalanche-uusdc&destination_address=destination-address"
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
          decimals: 18,
        },
        toAsset: {
          address: "address2",
          denom: "denom2",
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
          decimals: 18,
        },
        toAsset: {
          address: "address2",
          denom: "denom2",
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
          address: "nonexistent",
          denom: "denom1",
          decimals: 18,
        },
        toAsset: {
          address: "address2",
          denom: "denom2",
          decimals: 18,
        },
        toAddress: "destination-address",
      })
    ).rejects.toThrow("Axelar source asset not found: nonexistent");
  });
});

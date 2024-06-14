import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";
import { createPublicClient, http } from "viem";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { server } from "../../__tests__/msw";
import { BridgeQuoteError } from "../../errors";
import { BridgeProviderContext } from "../../interface";
import { SquidBridgeProvider } from "../index";

jest.mock("viem", () => ({
  ...jest.requireActual("viem"),
  createPublicClient: jest.fn().mockImplementation(() => ({
    readContract: jest.fn().mockImplementation(({ functionName }) => {
      if (functionName === "allowance") {
        return Promise.resolve(BigInt("100"));
      }
      return Promise.reject(new Error("Unknown function"));
    }),
  })),
  encodeFunctionData: jest.fn().mockImplementation(() => "0xabcdef"),
  http: jest.fn().mockImplementation(() => ({})),
}));

beforeEach(() => {
  server.use(
    rest.get("https://api.0xsquid.com/v1/route", (_req, res, ctx) => {
      return res(
        ctx.json({
          route: {
            estimate: {
              fromAmount: "1",
              toAmount: "0.99",
              feeCosts: [
                { token: { symbol: "ETH", decimals: 18 }, amount: "0.01" },
              ],
              gasCosts: [
                { token: { symbol: "ETH", decimals: 18 }, amount: "0.00042" },
              ],
              estimatedRouteDuration: 900,
              aggregatePriceImpact: "0",
              fromAmountUSD: "1000",
              toAmountUSD: "990",
            },
            transactionRequest: {
              targetAddress: "0x0000000000000000000000000000000000000000",
              data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef123456780000000000000000000000000000000000000000000000000000000000000001",
              gasLimit: "21000",
              gasPrice: "1000000000",
              value: "0",
              routeType: "SEND",
            },
            params: {
              toToken: {
                address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
              },
            },
          },
        })
      );
    }),
    rest.get("https://api.0xsquid.com/v1/chains", (_req, res, ctx) => {
      return res(
        ctx.json({
          chains: [
            {
              chainId: "1",
              rpc: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
            },
            { chainId: "43114", rpc: "https://api.avax.network/ext/bc/C/rpc" },
          ],
        })
      );
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("SquidBridgeProvider", () => {
  let provider: SquidBridgeProvider;
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
    provider = new SquidBridgeProvider("integratorId", ctx);
  });

  it("should get a quote", async () => {
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
      fromAddress: "0x742d35Cc6634C0532925a3b",
      toAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      slippage: 1,
    });

    expect(quote).toBeDefined();
    expect(quote).toEqual({
      input: { amount: "1", sourceDenom: "eth", decimals: 18, denom: "ETH" },
      expectedOutput: {
        amount: "0.99",
        sourceDenom: "avax",
        decimals: 18,
        denom: "AVAX",
        priceImpact: "0.000000000000000000",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
      transferFee: {
        amount: "0.01",
        denom: "ETH",
        sourceDenom: "ETH",
        decimals: 18,
      },
      estimatedTime: 900,
      estimatedGasFee: {
        amount: "0.00042",
        denom: "ETH",
        sourceDenom: "ETH",
        decimals: 18,
      },
      transactionRequest: {
        type: "evm",
        to: "0x0000000000000000000000000000000000000000",
        data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef123456780000000000000000000000000000000000000000000000000000000000000001",
        gas: "0x5208",
        gasPrice: "0x3b9aca00",
        approvalTransactionRequest: undefined,
      },
    });
  });

  it("should throw an error for unsupported chains", async () => {
    await expect(
      provider.getQuote({
        fromChain: {
          chainId: "unsupported",
          chainName: "Unsupported",
          chainType: "cosmos",
        },
        toChain: {
          chainId: "unsupported",
          chainName: "Unsupported",
          chainType: "cosmos",
        },
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
    ).rejects.toThrow(BridgeQuoteError);
  });

  it("should create an EVM transaction", async () => {
    const transaction = await provider.createEvmTransaction({
      fromAsset: {
        denom: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        sourceDenom: "eth",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
      estimateFromAmount: "1",
      transactionRequest: {
        targetAddress: "0x0000000000000000000000000000000000000000",
        data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef123456780000000000000000000000000000000000000000000000000000000000000001",
        gasLimit: "21000",
        gasPrice: "1000000000",
        value: "0",
        routeType: "SEND",
        maxFeePerGas: "1000000000",
        maxPriorityFeePerGas: "1000000000",
      },
    });

    expect(transaction).toEqual({
      type: "evm",
      to: "0x0000000000000000000000000000000000000000",
      data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef123456780000000000000000000000000000000000000000000000000000000000000001",
      gas: "0x5208",
      approvalTransactionRequest: undefined,
      maxFeePerGas: "0x3b9aca00",
      maxPriorityFeePerGas: "0x3b9aca00",
    });
  });

  it("should get chains", async () => {
    const chains = await provider.getChains();
    expect(chains).toBeDefined();
    expect(chains).toEqual([
      {
        chainId: "1",
        rpc: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      },
      { chainId: "43114", rpc: "https://api.avax.network/ext/bc/C/rpc" },
    ]);
  });

  it("should handle errors in getQuote when route toAsset does not match toAsset", async () => {
    jest.spyOn(provider, "getChains").mockImplementationOnce(() => {
      throw new Error("Chains error");
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
    ).rejects.toThrow("toAsset mismatch");
  });

  it("should return approval transaction data if allowance is less than amount", async () => {
    const fromTokenContract = createPublicClient({
      transport: http(),
    });
    (fromTokenContract.readContract as jest.Mock).mockResolvedValueOnce(
      BigInt("50")
    );

    const approvalTx = await provider.getApprovalTx({
      fromTokenContract,
      tokenAddress: "0xTokenAddress",
      isFromAssetNative: false,
      fromAmount: "100",
      fromAddress: "0xFromAddress",
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      targetAddress: "0xTargetAddress",
    });

    expect(approvalTx).toEqual({
      to: "0xTokenAddress",
      data: "0xabcdef", // Mocked data from encodeFunctionData
    });
  });

  it("should return undefined if allowance is greater than or equal to amount", async () => {
    const fromTokenContract = createPublicClient({
      transport: http(),
    });
    (fromTokenContract.readContract as jest.Mock).mockResolvedValueOnce(
      BigInt("150")
    );

    const approvalTx = await provider.getApprovalTx({
      fromTokenContract,
      tokenAddress: "0xTokenAddress",
      isFromAssetNative: false,
      fromAmount: "100",
      fromAddress: "0xFromAddress",
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      targetAddress: "0xTargetAddress",
    });

    expect(approvalTx).toBeUndefined();
  });

  it("should return undefined if the asset is native", async () => {
    const fromTokenContract = createPublicClient({
      transport: http(),
    });
    const approvalTx = await provider.getApprovalTx({
      fromTokenContract,
      tokenAddress: "0xTokenAddress",
      isFromAssetNative: true,
      fromAmount: "100",
      fromAddress: "0xFromAddress",
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      targetAddress: "0xTargetAddress",
    });

    expect(approvalTx).toBeUndefined();
  });
});

describe("SquidBridgeProvider.getExternalUrl", () => {
  let provider: SquidBridgeProvider;
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
    provider = new SquidBridgeProvider("integratorId", ctx);
  });

  it("should generate the correct URL for given parameters", async () => {
    const params = {
      fromChain: { chainId: 8453, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "eth",
      },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "eth",
      },
      toAddress: "destination-address",
    } satisfies Parameters<typeof provider.getExternalUrl>[0];

    const expectedUrl =
      "https://app.squidrouter.com/?chains=8453%2Cosmosis-1&tokens=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE%2Cibc%2FEA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5";
    const result = await provider.getExternalUrl(params);

    expect(result?.urlProviderName).toBe("Squid");
    expect(result?.url.toString()).toBe(expectedUrl);
  });

  it("should encode asset addresses correctly", async () => {
    const params = {
      fromChain: { chainId: 8453, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "eth",
      },
      toAsset: {
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "eth",
      },
      toAddress: "destination-address",
    } satisfies Parameters<typeof provider.getExternalUrl>[0];

    const expectedUrl =
      "https://app.squidrouter.com/?chains=8453%2Cosmosis-1&tokens=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913%2Cibc%2F498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
    const result = await provider.getExternalUrl(params);

    expect(result?.urlProviderName).toBe("Squid");
    expect(result?.url.toString()).toBe(expectedUrl);
  });

  it("should handle numeric chain IDs correctly", async () => {
    const params = {
      fromChain: { chainId: 43114, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        decimals: 18,
        denom: "USDC",
        sourceDenom: "usdc",
      },
      toAsset: {
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        decimals: 18,
        denom: "USDC",
        sourceDenom: "usdc",
      },
      toAddress: "destination-address",
    } satisfies Parameters<typeof provider.getExternalUrl>[0];

    const expectedUrl =
      "https://app.squidrouter.com/?chains=43114%2Cosmosis-1&tokens=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E%2Cibc%2F498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
    const result = await provider.getExternalUrl(params);

    expect(result?.urlProviderName).toBe("Squid");
    expect(result?.url.toString()).toBe(expectedUrl);
  });
});

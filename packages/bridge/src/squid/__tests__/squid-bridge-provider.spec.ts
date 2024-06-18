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
import { MockChains, MockTokens } from "./mocks";

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
    rest.get("https://api.0xsquid.com/v1/tokens", (_req, res, ctx) => {
      return res(
        ctx.json({
          tokens: MockTokens,
        })
      );
    }),
    rest.get("https://api.0xsquid.com/v1/chains", (_req, res, ctx) => {
      return res(
        ctx.json({
          chains: MockChains,
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
        chainName: "Ethereum",
        chainType: "evm",
        rpc: "https://ethereum.publicnode.com",
        networkName: "Ethereum",
        chainId: 1,
        nativeCurrency: {
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/eth.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/eth.svg",
        blockExplorerUrls: ["https://etherscan.io/"],
        chainNativeContracts: {
          wrappedNativeToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
        axelarContracts: {
          gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
          forecallable: "",
        },
        estimatedRouteDuration: 960,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "Arbitrum",
        chainType: "evm",
        rpc: "https://arb1.arbitrum.io/rpc",
        networkName: "Arbitrum",
        chainId: 42161,
        nativeCurrency: {
          name: "Arbitrum",
          symbol: "ETH",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/arbitrum.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/arb.svg",
        blockExplorerUrls: ["https://arbiscan.io/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 1800,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "optimism",
        chainType: "evm",
        rpc: "https://mainnet.optimism.io",
        networkName: "Optimism",
        chainId: 10,
        nativeCurrency: {
          name: "Optimism",
          symbol: "ETH",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
        blockExplorerUrls: ["https://optimistic.etherscan.io/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x4200000000000000000000000000000000000006",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 1800,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "linea",
        chainType: "evm",
        rpc: "https://rpc.linea.build",
        networkName: "Linea",
        chainId: 59144,
        nativeCurrency: {
          name: "Linea",
          symbol: "ETH",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-satellite/main/public/assets/chains/linea.logo.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/axelarnetwork/axelar-satellite/main/public/assets/chains/linea.logo.svg",
        blockExplorerUrls: ["https://lineascan.build/"],
        chainNativeContracts: {
          wrappedNativeToken: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
        },
        estimatedRouteDuration: 1800,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "base",
        chainType: "evm",
        rpc: "https://developer-access-mainnet.base.org",
        networkName: "Base",
        chainId: 8453,
        nativeCurrency: {
          name: "Base",
          symbol: "ETH",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-satellite/main/public/assets/chains/base.logo.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/axelarnetwork/axelar-satellite/main/public/assets/chains/base.logo.svg",
        blockExplorerUrls: ["https://basescan.org/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x4200000000000000000000000000000000000006",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 1800,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "Avalanche",
        chainType: "evm",
        rpc: "https://api.avax.network/ext/bc/C/rpc",
        networkName: "Avalanche",
        chainId: 43114,
        nativeCurrency: {
          name: "Avalanche",
          symbol: "AVAX",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/avalanche.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/avalanche.svg",
        blockExplorerUrls: ["https://avascan.info/blockchain/c/"],
        chainNativeContracts: {
          wrappedNativeToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
          ensRegistry: "0xa7eebb2926d22d34588497769889cbc2be0a5d97",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        },
        axelarContracts: {
          gateway: "0x5029C0EFf6C34351a0CEc334542cDb22c7928f78",
          forecallable: "",
        },
        estimatedRouteDuration: 90,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "Polygon",
        chainType: "evm",
        rpc: "https://polygon-rpc.com",
        networkName: "Polygon",
        chainId: 137,
        nativeCurrency: {
          name: "Polygon",
          symbol: "MATIC",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/polygon.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/polygon.svg",
        blockExplorerUrls: ["https://polygonscan.com/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        },
        axelarContracts: {
          gateway: "0x6f015F16De9fC8791b234eF68D486d2bF203FBA8",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 360,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "binance",
        chainType: "evm",
        rpc: "https://bsc-dataseed.binance.org",
        networkName: "BNB Chain",
        chainId: 56,
        nativeCurrency: {
          name: "BNB",
          symbol: "BNB",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/bnb.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/bnb.svg",
        blockExplorerUrls: ["https://bscscan.com/"],
        chainNativeContracts: {
          wrappedNativeToken: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x55d398326f99059fF775485246999027B3197955",
        },
        axelarContracts: {
          gateway: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 150,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "Fantom",
        chainType: "evm",
        rpc: "https://rpc.ankr.com/fantom",
        networkName: "Fantom",
        chainId: 250,
        nativeCurrency: {
          name: "FTM",
          symbol: "FTM",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/fantom.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/fantom.svg",
        blockExplorerUrls: ["https://ftmscan.com/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
        },
        axelarContracts: {
          gateway: "0x304acf330bbE08d1e512eefaa92F6a57871fD895",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 70,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "Moonbeam",
        chainType: "evm",
        rpc: "https://rpc.api.moonbeam.network",
        networkName: "Moonbeam",
        chainId: 1284,
        nativeCurrency: {
          name: "Moonbeam",
          symbol: "GLMR",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/glmr.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/glmr.svg",
        blockExplorerUrls: ["https://moonscan.io/"],
        chainNativeContracts: {
          wrappedNativeToken: "0xAcc15dC74880C9944775448304B263D191c6077F",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x931715fee2d06333043d11f658c8ce934ac61d0c",
        },
        axelarContracts: {
          gateway: "0x4F4495243837681061C4743b74B3eEdf548D56A5",
          forecallable: "",
        },
        estimatedRouteDuration: 120,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "mantle",
        chainType: "evm",
        rpc: "https://rpc.mantle.xyz",
        networkName: "Mantle",
        chainId: 5000,
        nativeCurrency: {
          name: "Mantle",
          symbol: "MNT",
          decimals: 18,
          icon: "https://assets.coingecko.com/coins/images/30980/small/token-logo.png?1689320029",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/wmnt.svg",
        blockExplorerUrls: ["https://mantlescan.info/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 100,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "scroll",
        chainType: "evm",
        rpc: "https://rpc.scroll.io",
        networkName: "Scroll",
        chainId: 534352,
        nativeCurrency: {
          name: "Scroll",
          symbol: "ETH",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/scroll.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/scroll.svg",
        blockExplorerUrls: ["https://scrollscan.com/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x5300000000000000000000000000000000000004",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 100,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "celo",
        chainType: "evm",
        rpc: "https://forno.celo.org",
        networkName: "Celo",
        chainId: 42220,
        nativeCurrency: {
          name: "CELO",
          symbol: "CELO",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/chains/celo.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/chains/celo.svg",
        blockExplorerUrls: ["https://celoscan.io/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x471EcE3750Da237f93B8E339c536989b8978a438",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 90,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "kava",
        chainType: "evm",
        rpc: "https://evm2.kava.io",
        networkName: "Kava EVM",
        chainId: 2222,
        nativeCurrency: {
          name: "Kava",
          symbol: "KAVA",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/4846.png",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/4846.png",
        blockExplorerUrls: ["https://kavascan.com/"],
        chainNativeContracts: {
          wrappedNativeToken: "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "",
        },
        estimatedRouteDuration: 120,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "filecoin",
        chainType: "evm",
        rpc: "https://api.node.glif.io",
        networkName: "Filecoin",
        chainId: 314,
        nativeCurrency: {
          name: "Filecoin",
          symbol: "FIL",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/filecoin.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/filecoin.svg",
        blockExplorerUrls: ["https://filfox.info/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x60E1773636CF5E4A227d9AC24F20fEca034ee25A",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "TODO",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 3600,
        estimatedExpressRouteDuration: 120,
      },
      {
        chainName: "blast",
        chainType: "evm",
        rpc: "https://rpc.blast.io",
        networkName: "Blast",
        chainId: 81457,
        nativeCurrency: {
          name: "Blast",
          symbol: "ETH",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/eth.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/blast.svg",
        blockExplorerUrls: ["https://blastscan.io/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x4300000000000000000000000000000000000004",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x4300000000000000000000000000000000000003",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 1800,
        estimatedExpressRouteDuration: 120,
      },
      {
        chainName: "fraxtal",
        chainType: "evm",
        rpc: "https://rpc.frax.com",
        networkName: "Fraxtal",
        chainId: 252,
        nativeCurrency: {
          name: "Frax Ether",
          symbol: "frxETH",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/frxeth.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/fraxtal.svg",
        blockExplorerUrls: ["https://fraxscan.com/"],
        chainNativeContracts: {
          wrappedNativeToken: "0xfc00000000000000000000000000000000000006",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0xfc00000000000000000000000000000000000001",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
        },
        estimatedRouteDuration: 1800,
        estimatedExpressRouteDuration: 120,
      },
      {
        chainName: "immutable",
        chainType: "evm",
        rpc: "https://rpc.immutable.com",
        networkName: "Immutable zkEVM",
        chainId: 13371,
        nativeCurrency: {
          name: "IMX",
          symbol: "IMX",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/chains/saga.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/chains/immutable-blk.svg",
        blockExplorerUrls: ["https://explorer.immutable.com/"],
        chainNativeContracts: {
          wrappedNativeToken: "0x3A0C2Ba54D6CBd3121F01b96dFd20e99D1696C9D",
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0x6de8aCC0D406837030CE4dd28e7c08C5a96a30d2",
        },
        axelarContracts: {
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
          forecallable: "",
        },
        estimatedRouteDuration: 960,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "osmosis",
        chainType: "cosmos",
        rpc: "https://osmosis-rpc.stakely.io",
        rpcList: [
          "https://osmosis-rpc.lavenderfive.com",
          "https://osmosis-rpc.stakely.io",
          "https://rpc-osmosis.whispernode.com:443",
          "https://osmosis-rpc.stakely.io",
        ],
        rest: "https://osmosis-1--lcd--full.datahub.figment.io/apikey/6d8baa3d3e97e427db4bd7ffcfb21be4",
        networkName: "Osmosis",
        chainId: "osmosis-1",
        nativeCurrency: {
          name: "Osmosis",
          symbol: "OSMO",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/osmo.svg",
        },
        swapAmountForGas: "100000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/osmo.svg",
        blockExplorerUrls: ["https://www.mintscan.io/osmosis/"],
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "osmo",
          bech32PrefixAccPub: "osmopub",
          bech32PrefixValAddr: "osmovaloper",
          bech32PrefixValPub: "osmovaloperpub",
          bech32PrefixConsAddr: "osmovalcons",
          bech32PrefixConsPub: "osmovalconspub",
        },
        feeCurrencies: [
          {
            coinDenom: "OSMO",
            coinMinimalDenom: "uosmo",
            coinDecimals: 6,
            coingeckoId: "osmosis",
          },
        ],
        stakeCurrency: {
          coinDenom: "OSMO",
          coinMinimalDenom: "uosmo",
          coinDecimals: 6,
          coingeckoId: "osmosis",
        },
        currencies: [
          {
            coinDenom: "OSMO",
            coinMinimalDenom: "uosmo",
            coinDecimals: 6,
            coingeckoId: "osmosis",
          },
        ],
        features: ["ibc-transfer", "ibc-go", "ibc-pfm"],
        coinType: 118,
        axelarContracts: {
          gateway: "",
        },
        gasPriceStep: {
          low: 0.1,
          average: 0.2,
          high: 0.25,
        },
        chainToAxelarChannelId: "channel-208",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "cosmoshub",
        chainType: "cosmos",
        rpc: "https://cosmos-rpc.publicnode.com",
        rpcList: [
          "https://cosmos-rpc.quickapi.com:443",
          "https://cosmos-rpc.onivalidator.com",
          "https://rpc-cosmoshub.whispernode.com:443",
        ],
        rest: "https://api.cosmos.network",
        networkName: "Cosmos Hub",
        chainId: "cosmoshub-4",
        nativeCurrency: {
          name: "cosmoshub",
          symbol: "ATOM",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png",
        },
        swapAmountForGas: "100000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/atom.svg",
        blockExplorerUrls: ["https://www.mintscan.io/cosmos/"],
        currencies: [
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
            coingeckoId: "cosmos",
          },
        ],
        stakeCurrency: {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
          coingeckoId: "cosmos",
        },
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "cosmos",
          bech32PrefixAccPub: "cosmospub",
          bech32PrefixValAddr: "cosmosvaloper",
          bech32PrefixValPub: "cosmosvaloperpub",
          bech32PrefixConsAddr: "cosmosvalcons",
          bech32PrefixConsPub: "cosmosvalconspub",
        },
        feeCurrencies: [
          {
            coinDenom: "ATOM",
            coinMinimalDenom: "uatom",
            coinDecimals: 6,
            coingeckoId: "cosmos",
          },
        ],
        features: ["ibc-transfer", "ibc-go", "ibc-pfm"],
        coinType: 118,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-293",
      },
      {
        chainName: "dydx",
        chainType: "cosmos",
        rpc: "https://dydx-ops-rpc.kingnodes.com",
        rpcList: [
          "https://dydx-rpc.lavenderfive.com",
          "https://dydx-mainnet-rpc.autostake.com",
          "https://rpc-dydx.ecostake.com",
        ],
        rest: "https://dydx-api.lavenderfive.com:443",
        nativeCurrency: {
          name: "dydx",
          symbol: "DYDX",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/11156.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/11156.png",
        blockExplorerUrls: ["https://www.mintscan.io/dydx/"],
        chainId: "dydx-mainnet-1",
        networkName: "dYdX",
        stakeCurrency: {
          coinDenom: "adydx",
          coinMinimalDenom: "adydx",
          coinDecimals: 6,
          coingeckoId: "dydx",
        },
        bech32Config: {
          bech32PrefixAccAddr: "dydx",
          bech32PrefixAccPub: "dydxpub",
          bech32PrefixValAddr: "dydxvaloper",
          bech32PrefixValPub: "dydxvaloperpub",
          bech32PrefixConsAddr: "dydxvalcons",
          bech32PrefixConsPub: "dydxvalconspub",
        },
        bip44: {
          coinType: 118,
        },
        currencies: [
          {
            coinDenom: "adydx",
            coinMinimalDenom: "adydx",
            coinDecimals: 6,
            coingeckoId: "dydx",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "uusdc",
            coinMinimalDenom: "uusdc",
            coinDecimals: 6,
            coingeckoId: "usdc",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "kujira",
        chainType: "cosmos",
        rpc: "https://rpc.cosmos.directory/kujira",
        rpcList: [
          "https://rpc.cosmos.directory/kujira",
          "https://kujira-rpc.polkachu.com",
          "https://rpc-kujira.ecostake.com",
        ],
        rest: "https://lcd.kaiyo.kujira.setten.io",
        networkName: "Kujira",
        chainId: "kaiyo-1",
        nativeCurrency: {
          name: "Kuji",
          symbol: "KUJI",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/15185.png",
        },
        swapAmountForGas: "200000",
        chainIconURI: "https://axelarscan.io/logos/chains/kujira.svg",
        blockExplorerUrls: ["https://finder.kujira.network/kaiyo-1/"],
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "kujira",
          bech32PrefixAccPub: "kujirapub",
          bech32PrefixValAddr: "kujiravaloper",
          bech32PrefixValPub: "kujiravaloperpub",
          bech32PrefixConsAddr: "kujiravalcons",
          bech32PrefixConsPub: "kujiravalconspub",
        },
        currencies: [
          {
            coinDenom: "KUJI",
            coinMinimalDenom: "ukuji",
            coinDecimals: 6,
            coingeckoId: "kujira",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "KUJI",
            coinMinimalDenom: "ukuji",
            coinDecimals: 6,
            coingeckoId: "kujira",
          },
        ],
        stakeCurrency: {
          coinDenom: "KUJI",
          coinMinimalDenom: "ukuji",
          coinDecimals: 6,
          coingeckoId: "kujira",
        },
        coinType: 118,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.03,
        },
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-9",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "neutron",
        chainType: "cosmos",
        rpc: "https://rpc-kralum.neutron-1.neutron.org",
        rpcList: [
          "https://rpc-kralum.neutron-1.neutron.org",
          "https://rpc.novel.remedy.tm.p2p.org",
          "https://neutron-rpc.lavenderfive.com",
        ],
        rest: "https://rest-kralum.neutron-1.neutron.org",
        networkName: "Neutron",
        chainId: "neutron-1",
        nativeCurrency: {
          name: "ntrn",
          symbol: "NTRN",
          decimals: 6,
          icon: "https://axelarscan.io/logos/chains/neutron.svg",
        },
        swapAmountForGas: "1000000",
        chainIconURI: "https://axelarscan.io/logos/chains/neutron.svg",
        blockExplorerUrls: ["https://www.mintscan.io/neutron/"],
        stakeCurrency: {
          coinDenom: "NTRN",
          coinMinimalDenom: "untrn",
          coinDecimals: 6,
          coingeckoId: "neutron",
        },
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "neutron",
          bech32PrefixAccPub: "neutronpub",
          bech32PrefixValAddr: "neutronvaloper",
          bech32PrefixValPub: "neutronvaloperpub",
          bech32PrefixConsAddr: "neutronvalcons",
          bech32PrefixConsPub: "neutronvalconspub",
        },
        currencies: [
          {
            coinDenom: "NTRN",
            coinMinimalDenom: "untrn",
            coinDecimals: 6,
            coingeckoId: "neutron",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "NTRN",
            coinMinimalDenom: "untrn",
            coinDecimals: 6,
            coingeckoId: "neutron",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 5.665,
          average: 5.665,
          high: 7,
        },
        features: ["ibc-transfer", "ibc-go", "ibc-pfm"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "stargaze",
        chainType: "cosmos",
        rpc: "https://stargaze-rpc.polkachu.com",
        rpcList: [
          "https://rpc.stargaze.bronbro.io",
          "https://stargaze-rpc.polkachu.com",
          "https://rpc.stargaze-apis.com",
          "https://rpc-stargaze-ia.cosmosia.notional.ventures",
        ],
        rest: "https://rest.stargaze-apis.com",
        nativeCurrency: {
          name: "Stargaze",
          symbol: "STARS",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/stars.svg",
        blockExplorerUrls: [
          "https://www.mintscan.io/stargaze/",
          "https://ping.pub/stargaze/",
          "https://atomscan.com/stargaze/",
        ],
        chainId: "stargaze-1",
        networkName: "Stargaze",
        stakeCurrency: {
          coinDenom: "STARS",
          coinMinimalDenom: "ustars",
          coinDecimals: 6,
          coingeckoId: "stargaze",
        },
        walletUrl: "https://wallet.keplr.app/chains/stargaze",
        walletUrlForStaking: "https://wallet.keplr.app/chains/stargaze",
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "stars",
          bech32PrefixAccPub: "starspub",
          bech32PrefixValAddr: "starsvaloper",
          bech32PrefixValPub: "starsvaloperpub",
          bech32PrefixConsAddr: "starsvalcons",
          bech32PrefixConsPub: "starsvalconspub",
        },
        currencies: [
          {
            coinDenom: "STARS",
            coinMinimalDenom: "ustars",
            coinDecimals: 6,
            coingeckoId: "stargaze",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "STARS",
            coinMinimalDenom: "ustars",
            coinDecimals: 6,
            coingeckoId: "stargaze",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        features: ["ibc-transfer", "ibc-go"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-50",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "axelarnet",
        chainType: "cosmos",
        rpc: "https://rpc-axelar.imperator.co",
        rpcList: [
          "https://rpc-axelar.imperator.co:443",
          "https://axelar-rpc.quickapi.com:443",
          "https://rpc-axelar.cosmos-spaces.cloud",
        ],
        rest: "https://axelar-lcd.quickapi.com",
        chainId: "axelar-dojo-1",
        networkName: "Axelar",
        nativeCurrency: {
          name: "Axelar",
          symbol: "AXL",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/axl.svg",
        blockExplorerUrls: [
          "https://www.mintscan.io/axelar/",
          "https://axelar.explorers.guru/",
          "https://atomscan.com/axelar/",
        ],
        stakeCurrency: {
          coinDenom: "AXL",
          coinMinimalDenom: "uaxl",
          coinDecimals: 6,
          coingeckoId: "axelar",
        },
        bech32Config: {
          bech32PrefixAccAddr: "axelar",
          bech32PrefixAccPub: "axelarpub",
          bech32PrefixValAddr: "axelarvaloper",
          bech32PrefixValPub: "axelarvaloperpub",
          bech32PrefixConsAddr: "axelarvalcons",
          bech32PrefixConsPub: "axelarvalconspub",
        },
        bip44: {
          coinType: 118,
        },
        currencies: [
          {
            coinDenom: "AXL",
            coinMinimalDenom: "uaxl",
            coinDecimals: 6,
            coingeckoId: "axelar",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "AXL",
            coinMinimalDenom: "uaxl",
            coinDecimals: 6,
            coingeckoId: "axelar",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-0",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "noble",
        chainType: "cosmos",
        rpc: "https://rpc.mainnet.noble.strange.love",
        rpcList: [
          "https://rpc.mainnet.noble.strange.love",
          "https://noble-rpc.polkachu.com",
        ],
        rest: "https://noble-api.polkachu.com",
        networkName: "Noble",
        chainId: "noble-1",
        nativeCurrency: {
          name: "noble",
          symbol: "Noble",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/stake.png",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/providers/noble.svg",
        blockExplorerUrls: ["https://mintscan.io/noble/"],
        stakeCurrency: {
          coinDenom: "STAKE",
          coinMinimalDenom: "ustake",
          coinDecimals: 6,
          coingeckoId: "stake",
        },
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "noble",
          bech32PrefixAccPub: "noblepub",
          bech32PrefixValAddr: "noblevaloper",
          bech32PrefixValPub: "noblevaloperpub",
          bech32PrefixConsAddr: "noblevalcons",
          bech32PrefixConsPub: "noblevalconspub",
        },
        currencies: [
          {
            coinDenom: "USDC",
            coinMinimalDenom: "uusdc",
            coinDecimals: 6,
            coingeckoId: "usd-coin",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "USDC",
            coinMinimalDenom: "uusdc",
            coinDecimals: 6,
            coingeckoId: "usd-coin",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 0,
          average: 0,
          high: 0.025,
        },
        features: ["ibc-transfer", "ibc-go", "ibc-pfm"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "",
        estimatedExpressRouteDuration: 20,
        estimatedRouteDuration: 180,
      },
      {
        chainName: "umee",
        chainType: "cosmos",
        rpc: "https://umee-rpc.polkachu.com",
        rpcList: [
          "https://umee-rpc.polkachu.com",
          "https://rpc-umee-ia.cosmosia.notional.ventures/",
          "http://umee.rpc.m.stavr.tech:10457",
        ],
        rest: "https://umee-api.polkachu.com",
        nativeCurrency: {
          name: "Umee",
          symbol: "UMEE",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/umee.svg",
        },
        swapAmountForGas: "200000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/umee.svg",
        blockExplorerUrls: [
          "https://www.mintscan.io/umee/",
          "https://ping.pub/umee/",
          "https://umee.explorers.guru/",
          "https://atomscan.com/umee/",
        ],
        chainId: "umee-1",
        networkName: "Umee",
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "umee",
          bech32PrefixAccPub: "umeepub",
          bech32PrefixValAddr: "umeevaloper",
          bech32PrefixValPub: "umeevaloperpub",
          bech32PrefixConsAddr: "umeevalcons",
          bech32PrefixConsPub: "umeevalconspub",
        },
        currencies: [
          {
            coinDenom: "UMEE",
            coinMinimalDenom: "uumee",
            coinDecimals: 6,
            coingeckoId: "pool:uumee",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "UMEE",
            coinMinimalDenom: "uumee",
            coinDecimals: 6,
            coingeckoId: "pool:uumee",
          },
        ],
        stakeCurrency: {
          coinDenom: "UMEE",
          coinMinimalDenom: "uumee",
          coinDecimals: 6,
          coingeckoId: "pool:uumee",
        },
        coinType: 118,
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-33",
        features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "secret-snip",
        chainType: "cosmos",
        rpc: "https://secret-rpc-sl.norm.io",
        rpcList: ["https://secret-rpc-sl.norm.io", "https://1rpc.io/scrt-rpc"],
        rest: "https://secret-rest-sl.norm.io",
        networkName: "Secret",
        chainId: "secret-4",
        nativeCurrency: {
          name: "Secret",
          symbol: "SCRT",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/5604.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/scrt.svg",
        blockExplorerUrls: ["https://www.mintscan.io/secret/"],
        bip44: {
          coinType: 529,
        },
        bech32Config: {
          bech32PrefixAccAddr: "secret",
          bech32PrefixAccPub: "secretpub",
          bech32PrefixValAddr: "secretvaloper",
          bech32PrefixValPub: "secretvaloperpub",
          bech32PrefixConsAddr: "secretvalcons",
          bech32PrefixConsPub: "secretvalconspub",
        },
        feeCurrencies: [
          {
            coinDenom: "SCRT",
            coinMinimalDenom: "uscrt",
            coinDecimals: 6,
            coingeckoId: "secret",
          },
        ],
        stakeCurrency: {
          coinDenom: "SCRT",
          coinMinimalDenom: "uscrt",
          coinDecimals: 6,
          coingeckoId: "secret",
        },
        currencies: [
          {
            coinDenom: "SCRT",
            coinMinimalDenom: "uscrt",
            coinDecimals: 6,
            coingeckoId: "secret",
          },
        ],
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        coinType: 529,
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-20",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "persistence",
        chainType: "cosmos",
        rpc: "https://persistence-rpc.polkachu.com",
        rpcList: [
          "https://persistence-rpc.polkachu.com",
          "https://rpc.core.persistence.one",
          "https://rpc-persistent-ia.cosmosia.notional.ventures/",
        ],
        rest: "https://persistence-api.polkachu.com",
        nativeCurrency: {
          name: "Persistence",
          symbol: "XPRT",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/xprt.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/xprt.svg",
        blockExplorerUrls: [
          "https://www.mintscan.io/persistence/",
          "https://ping.pub/persistence/",
        ],
        chainId: "core-1",
        networkName: "Persistence",
        stakeCurrency: {
          coinDenom: "XPRT",
          coinMinimalDenom: "uxprt",
          coinDecimals: 6,
          coingeckoId: "persistence",
        },
        bech32Config: {
          bech32PrefixAccAddr: "persistence",
          bech32PrefixAccPub: "persistencepub",
          bech32PrefixValAddr: "persistencevaloper",
          bech32PrefixValPub: "persistencevaloperpub",
          bech32PrefixConsAddr: "persistencevalcons",
          bech32PrefixConsPub: "persistencevalconspub",
        },
        bip44: {
          coinType: 118,
        },
        currencies: [
          {
            coinDenom: "XPRT",
            coinMinimalDenom: "uxprt",
            coinDecimals: 6,
            coingeckoId: "persistence",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "XPRT",
            coinMinimalDenom: "uxprt",
            coinDecimals: 6,
            coingeckoId: "persistence",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-51",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "injective",
        chainType: "cosmos",
        rpc: "https://rpc-injective.keplr.app",
        rpcList: [
          "https://rpc-injective.keplr.app",
          "https://rpc-injective.goldenratiostaking.net",
          "https://injective-rpc.lavenderfive.com:443",
        ],
        rest: "https://lcd.injective.network",
        networkName: "Injective",
        chainId: "injective-1",
        nativeCurrency: {
          name: "Injective",
          symbol: "INJ",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/inj.svg",
        blockExplorerUrls: ["https://www.mintscan.io/injective/"],
        stakeCurrency: {
          coinDenom: "INJ",
          coinMinimalDenom: "inj",
          coinDecimals: 18,
          coingeckoId: "injective-protocol",
        },
        walletUrl: "https://hub.injective.network/",
        walletUrlForStaking: "https://hub.injective.network/",
        bip44: {
          coinType: 60,
        },
        bech32Config: {
          bech32PrefixAccAddr: "inj",
          bech32PrefixAccPub: "injpub",
          bech32PrefixValAddr: "injvaloper",
          bech32PrefixValPub: "injvaloperpub",
          bech32PrefixConsAddr: "injvalcons",
          bech32PrefixConsPub: "injvalconspub",
        },
        currencies: [
          {
            coinDenom: "INJ",
            coinMinimalDenom: "inj",
            coinDecimals: 18,
            coingeckoId: "injective-protocol",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "INJ",
            coinMinimalDenom: "inj",
            coinDecimals: 18,
            coingeckoId: "injective-protocol",
          },
        ],
        gasPriceStep: {
          low: 5000000000,
          average: 25000000000,
          high: 40000000000,
        },
        coinType: 60,
        features: ["ibc-transfer", "ibc-go"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-84",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "crescent",
        chainType: "cosmos",
        rpc: "https://crescent-rpc.polkachu.com",
        rpcList: [
          "https://mainnet.crescent.network:26657",
          "https://crescent-rpc.polkachu.com",
          "https://rpc-crescent.pupmos.network",
        ],
        rest: "https://mainnet.crescent.network:1317",
        networkName: "Crescent",
        chainId: "crescent-1",
        nativeCurrency: {
          name: "Crescent",
          symbol: "CRE",
          decimals: 6,
          icon: "https://static-resources.crescent.network/CRE.png",
        },
        swapAmountForGas: "200000",
        chainIconURI: "https://static-resources.crescent.network/CRE.png",
        blockExplorerUrls: ["https://www.mintscan.io/crescent/"],
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "cre",
          bech32PrefixAccPub: "crepub",
          bech32PrefixValAddr: "crevaloper",
          bech32PrefixValPub: "crevaloperpub",
          bech32PrefixConsAddr: "crevalcons",
          bech32PrefixConsPub: "crevalconspub",
        },
        currencies: [
          {
            coinDenom: "CRE",
            coinMinimalDenom: "ucre",
            coinDecimals: 6,
            coingeckoId: "crescent",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "CRE",
            coinMinimalDenom: "ucre",
            coinDecimals: 6,
            coingeckoId: "crescent",
          },
        ],
        stakeCurrency: {
          coinDenom: "CRE",
          coinMinimalDenom: "ucre",
          coinDecimals: 6,
          coingeckoId: "crescent",
        },
        coinType: 118,
        gasPriceStep: {
          low: 1,
          average: 1,
          high: 1,
        },
        features: ["stargate", "ibc-transfer", "no-legacy-stdTx"],
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-4",
      },
      {
        chainName: "terra-2",
        chainType: "cosmos",
        rpc: "https://terra-rpc.polkachu.com",
        rpcList: [
          "https://terra-rpc.polkachu.com",
          "https://terra-rpc.stakely.io:443/",
          "https://phoenix-rpc.terra.dev:443",
        ],
        rest: "https://phoenix-lcd.terra.dev",
        networkName: "Terra",
        chainId: "phoenix-1",
        nativeCurrency: {
          name: "Luna",
          symbol: "LUNA",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/1c761075a4ae672089c2b1cf25739c6368e97bb7/public/images/chains/terra-2.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/1c761075a4ae672089c2b1cf25739c6368e97bb7/public/images/chains/terra-2.svg",
        blockExplorerUrls: ["http://finder.terra.money/mainnet/"],
        stakeCurrency: {
          coinDenom: "LUNA",
          coinMinimalDenom: "uluna",
          coinDecimals: 6,
          coingeckoId: "terra-luna-2",
        },
        bip44: {
          coinType: 330,
        },
        bech32Config: {
          bech32PrefixAccAddr: "terra",
          bech32PrefixAccPub: "terrapub",
          bech32PrefixValAddr: "terravaloper",
          bech32PrefixValPub: "terravaloperpub",
          bech32PrefixConsAddr: "terravalcons",
          bech32PrefixConsPub: "terravalconspub",
        },
        currencies: [
          {
            coinDenom: "LUNA",
            coinMinimalDenom: "uluna",
            coinDecimals: 6,
            coingeckoId: "terra-luna-2",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "LUNA",
            coinMinimalDenom: "uluna",
            coinDecimals: 6,
            coingeckoId: "terra-luna-2",
          },
        ],
        coinType: 330,
        gasPriceStep: {
          low: 5.665,
          average: 5.665,
          high: 7,
        },
        features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-pfm"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-6",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "juno",
        chainType: "cosmos",
        rpc: "https://juno-rpc.polkachu.com",
        rpcList: [
          "https://rpc-juno.whispernode.com:443",
          "http://juno.rpc.m.stavr.tech:1067",
          "https://juno-rpc.polkachu.com",
        ],
        rest: "https://lcd-juno.itastakers.com",
        networkName: "Juno",
        chainId: "juno-1",
        nativeCurrency: {
          name: "Juno",
          symbol: "JUNO",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/juno.svg",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/juno.svg",
        blockExplorerUrls: ["https://www.mintscan.io/juno/"],
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "juno",
          bech32PrefixAccPub: "junopub",
          bech32PrefixValAddr: "junovaloper",
          bech32PrefixValPub: "junovaloperpub",
          bech32PrefixConsAddr: "junovalcons",
          bech32PrefixConsPub: "junovalconspub",
        },
        currencies: [
          {
            coinDenom: "JUNO",
            coinMinimalDenom: "ujuno",
            coinDecimals: 6,
            coingeckoId: "juno-network",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "JUNO",
            coinMinimalDenom: "ujuno",
            coinDecimals: 6,
            coingeckoId: "juno-network",
          },
        ],
        stakeCurrency: {
          coinDenom: "JUNO",
          coinMinimalDenom: "ujuno",
          coinDecimals: 6,
          coingeckoId: "juno-network",
        },
        gasPriceStep: {
          low: 5000000000,
          average: 25000000000,
          high: 40000000000,
        },
        coinType: 118,
        features: ["ibc-pfm", "cosmwasm"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-71",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "evmos",
        chainType: "cosmos",
        rpc: "https://evmos-rpc.polkachu.com",
        rpcList: [
          "https://evmos-rpc.polkachu.com",
          "https://evmos-rpc.publicnode.com",
          "https://rpc.evmos.nodestake.top",
        ],
        rest: "https://evmos-rest.publicnode.com",
        nativeCurrency: {
          name: "Evmos",
          symbol: "EVMOS",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
        networkName: "Evmos",
        chainId: "evmos_9001-2",
        blockExplorerUrls: [
          "https://www.mintscan.io/evmos/",
          "https://evmos.bigdipper.live/",
          "https://evm.evmos.org/",
          "https://ping.pub/evmos/",
          "https://evmos.explorers.guru/",
          "https://atomscan.com/evmos/",
          "https://evmos.tcnetwork.io/",
        ],
        stakeCurrency: {
          coinDenom: "EVMOS",
          coinMinimalDenom: "aevmos",
          coinDecimals: 18,
          coingeckoId: "evmos",
        },
        walletUrl: "https://wallet.keplr.app/chains/evmos",
        walletUrlForStaking: "https://wallet.keplr.app/chains/evmos",
        bip44: {
          coinType: 60,
        },
        bech32Config: {
          bech32PrefixAccAddr: "evmos",
          bech32PrefixAccPub: "evmospub",
          bech32PrefixValAddr: "evmosvaloper",
          bech32PrefixValPub: "evmosvaloperpub",
          bech32PrefixConsAddr: "evmosvalcons",
          bech32PrefixConsPub: "evmosvalconspub",
        },
        currencies: [
          {
            coinDenom: "EVMOS",
            coinMinimalDenom: "aevmos",
            coinDecimals: 18,
            coingeckoId: "evmos",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "EVMOS",
            coinMinimalDenom: "aevmos",
            coinDecimals: 18,
            coingeckoId: "evmos",
          },
        ],
        gasPriceStep: {
          low: 25000000000,
          average: 25000000000,
          high: 224000000000000000,
        },
        coinType: 60,
        features: ["ibc-transfer", "ibc-go", "eth-address-gen", "eth-key-sign"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-21",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "dymension",
        chainType: "cosmos",
        rpc: "https://dymension-rpc.polkachu.com",
        rpcList: [
          "https://dymension-rpc.polkachu.com",
          "https://rpc.dymension.nodestake.org",
          "https://dymension-rpc.lavenderfive.com:443",
          "https://dymension-rpc.kynraze.com",
        ],
        rest: "https://api.dymension.nodestake.org",
        nativeCurrency: {
          name: "dymension",
          symbol: "DYM",
          decimals: 18,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/dym.svg",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/dym.svg",
        blockExplorerUrls: ["https://explorer.nodestake.org/dymension/"],
        chainId: "dymension_1100-1",
        networkName: "Dymension",
        stakeCurrency: {
          coinDenom: "DYM",
          coinMinimalDenom: "adym",
          coinDecimals: 18,
          coingeckoId: "",
        },
        bech32Config: {
          bech32PrefixAccAddr: "dym",
          bech32PrefixAccPub: "dympub",
          bech32PrefixValAddr: "dymvaloper",
          bech32PrefixValPub: "dymvaloperpub",
          bech32PrefixConsAddr: "dymvalcons",
          bech32PrefixConsPub: "dymvalconspub",
        },
        bip44: {
          coinType: 60,
        },
        currencies: [
          {
            coinDenom: "DYM",
            coinMinimalDenom: "adym",
            coinDecimals: 18,
            coingeckoId: "",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "DYM",
            coinMinimalDenom: "adym",
            coinDecimals: 18,
            coingeckoId: "",
          },
        ],
        coinType: 60,
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer", "ibc-pfm"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-138",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "sei",
        chainType: "cosmos",
        rpc: "https://rpc.sei-apis.com",
        rpcList: [
          "https://rpc.sei-apis.com",
          "https://sei-rpc.lavenderfive.com:443",
          "https://sei-rpc.polkachu.com/",
          "https://rpc-sei.whispernode.com:443",
        ],
        rest: "https://rest.sei-apis.com",
        nativeCurrency: {
          name: "SEI",
          symbol: "SEI",
          decimals: 6,
          icon: "https://docs.axelar.dev/images/chains/sei.svg",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/sei.svg",
        networkName: "Sei",
        chainId: "pacific-1",
        blockExplorerUrls: ["https://www.mintscan.io/sei/"],
        stakeCurrency: {
          coinDenom: "SEI",
          coinMinimalDenom: "usei",
          coinDecimals: 6,
          coingeckoId: "sei-network",
        },
        walletUrl: "https://wallet.keplr.app/chains/sei",
        walletUrlForStaking: "https://wallet.keplr.app/chains/sei",
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "sei",
          bech32PrefixAccPub: "seipub",
          bech32PrefixValAddr: "seivaloper",
          bech32PrefixValPub: "seivaloperpub",
          bech32PrefixConsAddr: "seivalcons",
          bech32PrefixConsPub: "seivalconspub",
        },
        currencies: [
          {
            coinDenom: "SEI",
            coinMinimalDenom: "usei",
            coinDecimals: 6,
            coingeckoId: "sei-network",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "SEI",
            coinMinimalDenom: "usei",
            coinDecimals: 6,
            coingeckoId: "sei-network",
          },
        ],
        gasPriceStep: {
          low: 25000000000,
          average: 25000000000,
          high: 40000000000,
        },
        coinType: 118,
        features: ["ibc-transfer", "ibc-go"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "carbon",
        chainType: "cosmos",
        rpc: "https://carbon-rpc.lavenderfive.com",
        rpcList: [
          "https://tm-api.carbon.network",
          "https://rpc.carbon.blockhunters.org",
        ],
        rest: "https://api.carbon.network",
        nativeCurrency: {
          name: "swth",
          symbol: "SWTH",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/swth.svg",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/swth.svg",
        blockExplorerUrls: ["https://scan.carbon.network/"],
        chainId: "carbon-1",
        networkName: "Carbon",
        stakeCurrency: {
          coinDenom: "SWTH",
          coinMinimalDenom: "uswth",
          coinDecimals: 6,
          coingeckoId: "switcheo",
        },
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "swth",
          bech32PrefixAccPub: "swthpub",
          bech32PrefixValAddr: "swthvaloper",
          bech32PrefixValPub: "swthvaloperpub",
          bech32PrefixConsAddr: "swthvalcons",
          bech32PrefixConsPub: "swthvalconspub",
        },
        currencies: [
          {
            coinDenom: "SWTH",
            coinMinimalDenom: "uswth",
            coinDecimals: 6,
            coingeckoId: "switcheo",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "SWTH",
            coinMinimalDenom: "uswth",
            coinDecimals: 6,
            coingeckoId: "switcheo",
          },
        ],
        coinType: 118,
        features: ["ibc-transfer", "ibc-go"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-7",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "regen",
        chainType: "cosmos",
        rpc: "https://rpc-regen.ecostake.com",
        rpcList: [
          "https://rpc-regen.ecostake.com",
          "http://public-rpc.regen.vitwit.com:26657",
          "https://rpc-regen-ia.cosmosia.notional.ventures/",
        ],
        rest: "https://rest-regen.ecostake.com",
        nativeCurrency: {
          name: "Regen Network",
          symbol: "REGEN",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/regen.svg",
        blockExplorerUrls: [
          "https://www.mintscan.io/regen/",
          "https://ping.pub/regen/",
          "https://regen.bigdipper.live/",
          "https://atomscan.com/regen-network/",
        ],
        chainId: "regen-1",
        networkName: "Regen",
        stakeCurrency: {
          coinDenom: "REGEN",
          coinMinimalDenom: "uregen",
          coinDecimals: 6,
          coingeckoId: "regen",
        },
        walletUrl: "https://wallet.keplr.app/chains/regen",
        walletUrlForStaking: "https://wallet.keplr.app/chains/regen",
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "regen",
          bech32PrefixAccPub: "regenpub",
          bech32PrefixValAddr: "regenvaloper",
          bech32PrefixValPub: "regenvaloperpub",
          bech32PrefixConsAddr: "regenvalcons",
          bech32PrefixConsPub: "regenvalconspub",
        },
        currencies: [
          {
            coinDenom: "REGEN",
            coinMinimalDenom: "uregen",
            coinDecimals: 6,
            coingeckoId: "regen",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "REGEN",
            coinMinimalDenom: "uregen",
            coinDecimals: 6,
            coingeckoId: "regen",
          },
        ],
        gasPriceStep: {
          low: 0.015,
          average: 0.025,
          high: 0.04,
        },
        coinType: 118,
        features: ["ibc-go", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-48",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "agoric",
        chainType: "cosmos",
        rpc: "https://main.rpc.agoric.net",
        rpcList: [
          "https://rpc.agoric.nodestake.top",
          "https://agoric.rpc.kjnodes.com",
          "https://rpc-agoric-01.stakeflow.io",
        ],
        rest: "https://main.api.agoric.net",
        networkName: "Agoric",
        chainId: "agoric-3",
        nativeCurrency: {
          name: "Agoric",
          symbol: "BLD",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI: "https://axelarscan.io/logos/chains/agoric.svg",
        blockExplorerUrls: [
          "https://agoric.bigdipper.live/",
          "https://agoric.explorers.guru/",
          "https://atomscan.com/agoric/",
        ],
        bip44: {
          coinType: 564,
        },
        bech32Config: {
          bech32PrefixAccAddr: "agoric",
          bech32PrefixAccPub: "agoricpub",
          bech32PrefixValAddr: "agoricvaloper",
          bech32PrefixValPub: "agoricvaloperpub",
          bech32PrefixConsAddr: "agoricvalcons",
          bech32PrefixConsPub: "agoricvalconspub",
        },
        currencies: [
          {
            coinDenom: "BLD",
            coinMinimalDenom: "ubld",
            coinDecimals: 6,
            coingeckoId: "agoric",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "BLD",
            coinMinimalDenom: "ubld",
            coinDecimals: 6,
            coingeckoId: "agoric",
          },
        ],
        stakeCurrency: {
          coinDenom: "BLD",
          coinMinimalDenom: "ubld",
          coinDecimals: 6,
          coingeckoId: "agoric",
        },
        coinType: 564,
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-9",
        features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
        gasPriceStep: {
          low: 0.1,
          average: 0.2,
          high: 0.25,
        },
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "comdex",
        chainType: "cosmos",
        rpc: "https://rpc.comdex.one",
        rpcList: [
          "https://rpc.comdex.one",
          "https://comdex-rpc.polkachu.com",
          "https://rpc-comdex.cosmos-spaces.cloud",
        ],
        rest: "https://rest.comdex.one",
        chainId: "comdex-1",
        networkName: "Comdex",
        nativeCurrency: {
          name: "Comdex",
          symbol: "CMDX",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/cmdx.svg",
        blockExplorerUrls: [
          "https://www.mintscan.io/comdex/",
          "https://comdex.aneka.io/",
          "https://ping.pub/comdex/",
          "https://atomscan.com/comdex/",
        ],
        stakeCurrency: {
          coinDenom: "CMDX",
          coinMinimalDenom: "ucmdx",
          coinDecimals: 6,
          coingeckoId: "cmdx",
        },
        bech32Config: {
          bech32PrefixAccAddr: "comdex",
          bech32PrefixAccPub: "comdexpub",
          bech32PrefixValAddr: "comdexvaloper",
          bech32PrefixValPub: "comdexvaloperpub",
          bech32PrefixConsAddr: "comdexvalcons",
          bech32PrefixConsPub: "comdexvalconspub",
        },
        bip44: {
          coinType: 118,
        },
        currencies: [
          {
            coinDenom: "CMDX",
            coinMinimalDenom: "ucmdx",
            coinDecimals: 6,
            coingeckoId: "comdex",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "CMDX",
            coinMinimalDenom: "ucmdx",
            coinDecimals: 6,
            coingeckoId: "comdex",
          },
        ],
        gasPriceStep: {
          low: 0.01,
          average: 0.03,
          high: 0.05,
        },
        coinType: 118,
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-34",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "archway",
        chainType: "cosmos",
        rpc: "https://rpc.mainnet.archway.io",
        rpcList: [
          "https://rpc.mainnet.archway.io",
          "https://rpc-archway.cosmos-spaces.cloud",
          "https://archway-mainnet-archive.allthatnode.com:26657",
        ],
        rest: "https://api.mainnet.archway.io",
        nativeCurrency: {
          name: "Archway",
          symbol: "ARCH",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/27358.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/arch.svg",
        blockExplorerUrls: [
          "https://mintscan.io/archway/",
          "https://archway.explorers.guru/",
        ],
        chainId: "archway-1",
        networkName: "Archway",
        stakeCurrency: {
          coinDenom: "ARCH",
          coinMinimalDenom: "aarch",
          coinDecimals: 18,
          coingeckoId: "archway",
        },
        bech32Config: {
          bech32PrefixAccAddr: "archway",
          bech32PrefixAccPub: "archwaypub",
          bech32PrefixValAddr: "archwayvaloper",
          bech32PrefixValPub: "archwayvaloperpub",
          bech32PrefixConsAddr: "archwayvalcons",
          bech32PrefixConsPub: "archwayvalconspub",
        },
        bip44: {
          coinType: 118,
        },
        currencies: [
          {
            coinDenom: "ARCH",
            coinMinimalDenom: "aarch",
            coinDecimals: 18,
            coingeckoId: "archway",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "ARCH",
            coinMinimalDenom: "aarch",
            coinDecimals: 18,
            coingeckoId: "archway",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-13",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "migaloo",
        chainType: "cosmos",
        rpc: "https://migaloo-rpc.lavenderfive.com",
        rpcList: [
          "https://migaloo-rpc.lavenderfive.com",
          "https://rpc-migaloo.cosmos-spaces.cloud",
          "https://migaloo-rpc.kleomedes.network:443",
        ],
        rest: "https://migaloo-api.lavenderfive.com",
        nativeCurrency: {
          name: "Whale",
          symbol: "WHALE",
          decimals: 6,
          icon: "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/whale.svg",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/migaloo.svg",
        blockExplorerUrls: [
          "https://atomscan.com/migaloo/",
          "https://explorer.silknodes.io/migaloo/",
        ],
        chainId: "migaloo-1",
        networkName: "Migaloo",
        stakeCurrency: {
          coinDenom: "WHALE",
          coinMinimalDenom: "uwhale",
          coinDecimals: 6,
          coingeckoId: "white-whale",
        },
        bech32Config: {
          bech32PrefixAccAddr: "migaloo",
          bech32PrefixAccPub: "migaloopub",
          bech32PrefixValAddr: "migaloovaloper",
          bech32PrefixValPub: "migaloovaloperpub",
          bech32PrefixConsAddr: "migaloovalcons",
          bech32PrefixConsPub: "migaloovalconspub",
        },
        bip44: {
          coinType: 118,
        },
        currencies: [
          {
            coinDenom: "WHALE",
            coinMinimalDenom: "uwhale",
            coinDecimals: 6,
            coingeckoId: "white-whale",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "WHALE",
            coinMinimalDenom: "uwhale",
            coinDecimals: 6,
            coingeckoId: "white-whale",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "terra",
        chainType: "cosmos",
        rpc: "https://rpc-terra-ia.cosmosia.notional.ventures/",
        rpcList: [
          "https://rpc-terra-ia.cosmosia.notional.ventures/",
          "https://rpc.terrarebels.net",
          "https://terra-classic-rpc.publicnode.com",
        ],
        rest: "https://api-terra-ia.cosmosia.notional.ventures",
        nativeCurrency: {
          name: "Luna Classic",
          symbol: "LUNC",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/4172.png",
        },
        swapAmountForGas: "2000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/lunc.svg",
        blockExplorerUrls: [
          "https://finder.terra.money/classic/",
          "https://finder.terrarebels.net/classic/",
        ],
        chainId: "columbus-5",
        networkName: "Terra Classic",
        stakeCurrency: {
          coinDenom: "LUNA",
          coinMinimalDenom: "uluna",
          coinDecimals: 6,
          coingeckoId: "terra-luna",
        },
        bech32Config: {
          bech32PrefixAccAddr: "terra",
          bech32PrefixAccPub: "terrapub",
          bech32PrefixValAddr: "terravaloper",
          bech32PrefixValPub: "terravaloperpub",
          bech32PrefixConsAddr: "terravalcons",
          bech32PrefixConsPub: "terravalconspub",
        },
        bip44: {
          coinType: 330,
        },
        currencies: [
          {
            coinDenom: "LUNA",
            coinMinimalDenom: "uluna",
            coinDecimals: 6,
            coingeckoId: "terra-luna",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "LUNA",
            coinMinimalDenom: "uluna",
            coinDecimals: 6,
            coingeckoId: "terra-luna",
          },
        ],
        coinType: 330,
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-19",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "assetmantle",
        chainType: "cosmos",
        rpc: "https://rpc.assetmantle.one",
        rpcList: [
          "https://rpc.assetmantle.one",
          "https://rpc-assetmantle.blockpower.capital",
          "https://rpc-assetmantle.ecostake.com",
        ],
        rest: "https://rest.assetmantle.one",
        chainId: "mantle-1",
        networkName: "AssetMantle",
        nativeCurrency: {
          name: "AssetMantle",
          symbol: "MNTL",
          decimals: 6,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/19686.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/19686.png",
        blockExplorerUrls: [
          "https://www.mintscan.io/asset-mantle/",
          "https://explorer.postcapitalist.io/AssetMantle/",
          "https://explorer.assetmantle.one/",
          "https://assetmantle.explorers.guru/",
          "https://atomscan.com/assetmantle/",
        ],
        stakeCurrency: {
          coinDenom: "MNTL",
          coinMinimalDenom: "umntl",
          coinDecimals: 6,
          coingeckoId: "assetmantle",
        },
        bech32Config: {
          bech32PrefixAccAddr: "mantle",
          bech32PrefixAccPub: "mantlepub",
          bech32PrefixValAddr: "mantlevaloper",
          bech32PrefixValPub: "mantlevaloperpub",
          bech32PrefixConsAddr: "mantlevalcons",
          bech32PrefixConsPub: "mantlevalconspub",
        },
        bip44: {
          coinType: 118,
        },
        currencies: [
          {
            coinDenom: "MNTL",
            coinMinimalDenom: "umntl",
            coinDecimals: 6,
            coingeckoId: "assetmantle",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "MNTL",
            coinMinimalDenom: "umntl",
            coinDecimals: 6,
            coingeckoId: "assetmantle",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 0.05,
          average: 0.125,
          high: 0.2,
        },
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "channel-10",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
      {
        chainName: "nolus",
        chainType: "cosmos",
        rpc: "https://pirin-cl.nolus.network:26657",
        rpcList: [
          "https://pirin-cl.nolus.network:26657",
          "https://nolus-rpc.lavenderfive.com:443",
          "https://nolus-rpc.sphincs.plus",
        ],
        rest: "https://pirin-cl.nolus.network:1317",
        nativeCurrency: {
          name: "nolus",
          symbol: "NLS",
          decimals: 18,
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/18156.png",
        },
        swapAmountForGas: "1000000",
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/nls.svg",
        blockExplorerUrls: ["https://ping.pub/nolus/"],
        chainId: "pirin-1",
        networkName: "Nolus",
        stakeCurrency: {
          coinDenom: "unls",
          coinMinimalDenom: "unls",
          coinDecimals: 6,
          coingeckoId: "nolus",
        },
        bech32Config: {
          bech32PrefixAccAddr: "nolus",
          bech32PrefixAccPub: "noluspub",
          bech32PrefixValAddr: "nolusvaloper",
          bech32PrefixValPub: "nolusvaloperpub",
          bech32PrefixConsAddr: "nolusvalcons",
          bech32PrefixConsPub: "nolusvalconspub",
        },
        bip44: {
          coinType: 118,
        },
        currencies: [
          {
            coinDenom: "unls",
            coinMinimalDenom: "unls",
            coinDecimals: 6,
            coingeckoId: "nolus",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "unls",
            coinMinimalDenom: "unls",
            coinDecimals: 6,
            coingeckoId: "nolus",
          },
        ],
        coinType: 118,
        gasPriceStep: {
          low: 0.1,
          average: 0.25,
          high: 0.4,
        },
        features: ["stargate", "no-legacy-stdTx", "ibc-transfer"],
        axelarContracts: {
          gateway: "",
        },
        chainToAxelarChannelId: "",
        estimatedRouteDuration: 60,
        estimatedExpressRouteDuration: 20,
      },
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

  describe("getAvailableSourceAssetVariants", () => {
    it("gets multi-issued variants (Noble USDC) with counterparty array", async () => {
      const sourceVariants = await provider.getAvailableSourceAssetVariants(
        {
          chainId: "osmosis-1",
          chainType: "cosmos",
        },
        {
          denom: "USDC",
          address:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          decimals: 6,
          sourceDenom: "uusdc",
        }
      );

      expect(sourceVariants).toEqual([
        {
          chainId: "noble-1",
          chainType: "cosmos",
          address: "uusdc",
          denom: "USDC",
          decimals: 6,
          sourceDenom: "uusdc",
        },
        {
          chainId: 1,
          chainType: "evm",
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          denom: "USDC",
          decimals: 6,
          sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        },
      ]);
    });

    it("gets multi-issued variants (Axelar USDC)", async () => {
      const sourceVariants = await provider.getAvailableSourceAssetVariants(
        {
          chainId: "osmosis-1",
          chainType: "cosmos",
        },
        {
          denom: "USDC.axl",
          address:
            "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
          decimals: 6,
          sourceDenom: "uusdc",
        }
      );

      expect(sourceVariants).toEqual([
        {
          chainId: "axelar-dojo-1",
          chainType: "cosmos",
          chainName: "axelarnet",
          denom: "axlUSDC",
          address: "uusdc",
          decimals: 6,
          sourceDenom: "uusdc",
        },
        {
          chainId: 1,
          chainType: "evm",
          chainName: "Ethereum",
          denom: "USDC",
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          decimals: 6,
          sourceDenom: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
        {
          chainId: "agoric-3",
          chainType: "cosmos",
          chainName: "agoric",
          denom: "axlUSDC",
          address:
            "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
          decimals: 6,
          sourceDenom:
            "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
        },
        {
          chainId: 42161,
          chainType: "evm",
          chainName: "Arbitrum",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: "archway-1",
          chainType: "cosmos",
          chainName: "archway",
          denom: "axlUSDC",
          address:
            "ibc/B9E4FD154C92D3A23BEA029906C4C5FF2FE74CB7E3A058290B77197A263CF88B",
          decimals: 6,
          sourceDenom:
            "ibc/B9E4FD154C92D3A23BEA029906C4C5FF2FE74CB7E3A058290B77197A263CF88B",
        },
        {
          chainId: "mantle-1",
          chainType: "cosmos",
          chainName: "assetmantle",
          denom: "axlUSDC",
          address:
            "ibc/616E26A85AD20A3DDEAEBDDE7262E3BA9356C557BC15CACEA86768D7D51FA703",
          decimals: 6,
          sourceDenom:
            "ibc/616E26A85AD20A3DDEAEBDDE7262E3BA9356C557BC15CACEA86768D7D51FA703",
        },
        {
          chainId: 43114,
          chainType: "evm",
          chainName: "Avalanche",
          denom: "axlUSDC",
          address: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
          decimals: 6,
          sourceDenom: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
        },
        {
          chainId: 8453,
          chainType: "evm",
          chainName: "base",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: 56,
          chainType: "evm",
          chainName: "binance",
          denom: "axlUSDC",
          address: "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
          decimals: 6,
          sourceDenom: "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
        },
        {
          chainId: 81457,
          chainType: "evm",
          chainName: "blast",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: "carbon-1",
          chainType: "cosmos",
          chainName: "carbon",
          denom: "USDC",
          address:
            "ibc/7C0807A56073C4A27B0DE1C21BA3EB75DF75FD763F4AD37BC159917FC01145F0",
          decimals: 6,
          sourceDenom:
            "ibc/7C0807A56073C4A27B0DE1C21BA3EB75DF75FD763F4AD37BC159917FC01145F0",
        },
        {
          chainId: 42220,
          chainType: "evm",
          chainName: "celo",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: "comdex-1",
          chainType: "cosmos",
          chainName: "comdex",
          denom: "axlUSDC",
          address:
            "ibc/E1616E7C19EA474C565737709A628D6F8A23FF9D3E9A7A6871306CF5E0A5341E",
          decimals: 6,
          sourceDenom:
            "ibc/E1616E7C19EA474C565737709A628D6F8A23FF9D3E9A7A6871306CF5E0A5341E",
        },
        {
          chainId: "crescent-1",
          chainType: "cosmos",
          chainName: "crescent",
          denom: "axlUSDC",
          address:
            "ibc/BFF0D3805B50D93E2FA5C0B2DDF7E0B30A631076CD80BC12A48C0E95404B4A41",
          decimals: 6,
          sourceDenom:
            "ibc/BFF0D3805B50D93E2FA5C0B2DDF7E0B30A631076CD80BC12A48C0E95404B4A41",
        },
        {
          chainId: "dymension_1100-1",
          chainType: "cosmos",
          chainName: "dymension",
          denom: "axlUSDC",
          address:
            "ibc/BFAAB7870A9AAABF64A7366DAAA0B8E5065EAA1FCE762F45677DC24BE796EF65",
          decimals: 6,
          sourceDenom:
            "ibc/BFAAB7870A9AAABF64A7366DAAA0B8E5065EAA1FCE762F45677DC24BE796EF65",
        },
        {
          chainId: "evmos_9001-2",
          chainType: "cosmos",
          chainName: "evmos",
          denom: "axlUSDC",
          address: "uusdc",
          decimals: 6,
          sourceDenom: "uusdc",
        },
        {
          chainId: 250,
          chainType: "evm",
          chainName: "Fantom",
          denom: "axlUSDC",
          address: "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
          decimals: 6,
          sourceDenom: "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
        },
        {
          chainId: 314,
          chainType: "evm",
          chainName: "filecoin",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: 252,
          chainType: "evm",
          chainName: "fraxtal",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: 13371,
          chainType: "evm",
          chainName: "immutable",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: "injective-1",
          chainType: "cosmos",
          chainName: "injective",
          denom: "axlUSDC",
          address:
            "ibc/7E1AF94AD246BE522892751046F0C959B768642E5671CC3742264068D49553C0",
          decimals: 6,
          sourceDenom:
            "ibc/7E1AF94AD246BE522892751046F0C959B768642E5671CC3742264068D49553C0",
        },
        {
          chainId: "juno-1",
          chainType: "cosmos",
          chainName: "juno",
          denom: "axlUSDC",
          address:
            "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
          decimals: 6,
          sourceDenom:
            "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
        },
        {
          chainId: 2222,
          chainType: "evm",
          chainName: "kava",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: "kaiyo-1",
          chainType: "cosmos",
          chainName: "kujira",
          denom: "axlUSDC",
          address:
            "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
          decimals: 6,
          sourceDenom:
            "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
        },
        {
          chainId: 59144,
          chainType: "evm",
          chainName: "linea",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: 5000,
          chainType: "evm",
          chainName: "mantle",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: 1284,
          chainType: "evm",
          chainName: "Moonbeam",
          denom: "axlUSDC",
          address: "0xCa01a1D0993565291051daFF390892518ACfAD3A",
          decimals: 6,
          sourceDenom: "0xCa01a1D0993565291051daFF390892518ACfAD3A",
        },
        {
          chainId: "neutron-1",
          chainType: "cosmos",
          chainName: "neutron",
          denom: "axlUSDC",
          address:
            "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
          decimals: 6,
          sourceDenom:
            "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
        },
        {
          chainId: 10,
          chainType: "evm",
          chainName: "optimism",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: 137,
          chainType: "evm",
          chainName: "Polygon",
          denom: "axlUSDC",
          address: "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
          decimals: 6,
          sourceDenom: "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
        },
        {
          chainId: "regen-1",
          chainType: "cosmos",
          chainName: "regen",
          denom: "axlUSDC",
          address:
            "ibc/334740505537E9894A64E8561030695016481830D7B36E6A9B6D13C608B55653",
          decimals: 6,
          sourceDenom:
            "ibc/334740505537E9894A64E8561030695016481830D7B36E6A9B6D13C608B55653",
        },
        {
          chainId: 534352,
          chainType: "evm",
          chainName: "scroll",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          sourceDenom: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
        },
        {
          chainId: "secret-4",
          chainType: "cosmos",
          chainName: "secret-snip",
          denom: "axlUSDC",
          address: "secret1vkq022x4q8t8kx9de3r84u669l65xnwf2lg3e6",
          decimals: 6,
          sourceDenom: "secret1vkq022x4q8t8kx9de3r84u669l65xnwf2lg3e6",
        },
        {
          chainId: "stargaze-1",
          chainType: "cosmos",
          chainName: "stargaze",
          denom: "axlUSDC",
          address:
            "ibc/96274e25174ee93314d8b5636d2d2f70963e207c22f643ec41949a3cbeda4c72",
          decimals: 6,
          sourceDenom:
            "ibc/96274e25174ee93314d8b5636d2d2f70963e207c22f643ec41949a3cbeda4c72",
        },
        {
          chainId: "columbus-5",
          chainType: "cosmos",
          chainName: "terra",
          denom: "axlUSDC",
          address:
            "ibc/E1E3674A0E4E1EF9C69646F9AF8D9497173821826074622D831BAB73CCB99A2D",
          decimals: 6,
          sourceDenom:
            "ibc/E1E3674A0E4E1EF9C69646F9AF8D9497173821826074622D831BAB73CCB99A2D",
        },
        {
          chainId: "phoenix-1",
          chainType: "cosmos",
          chainName: "terra-2",
          denom: "axlUSDC",
          address:
            "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
          decimals: 6,
          sourceDenom:
            "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
        },
        {
          chainId: "umee-1",
          chainType: "cosmos",
          chainName: "umee",
          denom: "axlUSDC",
          address:
            "ibc/49788C29CD84E08D25CA7BE960BC1F61E88FEFC6333F58557D236D693398466A",
          decimals: 6,
          sourceDenom:
            "ibc/49788C29CD84E08D25CA7BE960BC1F61E88FEFC6333F58557D236D693398466A",
        },
      ]);
    });

    it("gets EVM gas token variants (ETH & WETH)", async () => {
      const sourceVariants = await provider.getAvailableSourceAssetVariants(
        {
          chainId: "osmosis-1",
          chainType: "cosmos",
        },
        {
          denom: "ETH.axl",
          address:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
          decimals: 6,
          sourceDenom: "weth-wei",
        }
      );

      expect(sourceVariants).toEqual([
        {
          chainId: "axelar-dojo-1",
          chainType: "cosmos",
          chainName: "axelarnet",
          denom: "axlWETH",
          address: "weth-wei",
          decimals: 18,
          sourceDenom: "weth-wei",
        },
        {
          chainId: 1,
          chainType: "evm",
          chainName: "Ethereum",
          denom: "WETH",
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          decimals: 18,
          sourceDenom: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        },
        {
          chainId: "agoric-3",
          chainType: "cosmos",
          chainName: "agoric",
          denom: "axlWETH",
          address:
            "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
          decimals: 18,
          sourceDenom:
            "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
        },
        {
          chainId: 42161,
          chainType: "evm",
          chainName: "Arbitrum",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          sourceDenom: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
        },
        {
          chainId: "archway-1",
          chainType: "cosmos",
          chainName: "archway",
          denom: "axlWETH",
          address:
            "ibc/13C5990F84FA5D472E1F8BB1BAAEA8774DA5F24128EC02B119107AD21FB52A61",
          decimals: 18,
          sourceDenom:
            "ibc/13C5990F84FA5D472E1F8BB1BAAEA8774DA5F24128EC02B119107AD21FB52A61",
        },
        {
          chainId: "mantle-1",
          chainType: "cosmos",
          chainName: "assetmantle",
          denom: "axlWETH",
          address:
            "ibc/3EFE89848528B4A5665D0102DB818C6B19E04E17455197E92BECC3C41A7F7D78",
          decimals: 18,
          sourceDenom:
            "ibc/3EFE89848528B4A5665D0102DB818C6B19E04E17455197E92BECC3C41A7F7D78",
        },
        {
          chainId: 81457,
          chainType: "evm",
          chainName: "blast",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          sourceDenom: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
        },
        {
          chainId: 42220,
          chainType: "evm",
          chainName: "celo",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          sourceDenom: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
        },
        {
          chainId: "comdex-1",
          chainType: "cosmos",
          chainName: "comdex",
          denom: "axlWETH",
          address:
            "ibc/81C3A46287D7664A8FD19843AC8D0CFD6C284EF1F750C661C48B3544277B1B29",
          decimals: 18,
          sourceDenom:
            "ibc/81C3A46287D7664A8FD19843AC8D0CFD6C284EF1F750C661C48B3544277B1B29",
        },
        {
          chainId: "crescent-1",
          chainType: "cosmos",
          chainName: "crescent",
          denom: "axlWETH",
          address:
            "ibc/F1806958CA98757B91C3FA1573ECECD24F6FA3804F074A6977658914A49E65A3",
          decimals: 18,
          sourceDenom:
            "ibc/F1806958CA98757B91C3FA1573ECECD24F6FA3804F074A6977658914A49E65A3",
        },
        {
          chainId: "dymension_1100-1",
          chainType: "cosmos",
          chainName: "dymension",
          denom: "axlETH",
          address:
            "ibc/E3AB0DFDE9E782262B770C32DF94AC2A92B93DC4825376D6F6C874D3C877864E",
          decimals: 18,
          sourceDenom:
            "ibc/E3AB0DFDE9E782262B770C32DF94AC2A92B93DC4825376D6F6C874D3C877864E",
        },
        {
          chainId: 1,
          chainType: "evm",
          chainName: "Ethereum",
          denom: "ETH",
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          decimals: 18,
          sourceDenom: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        },
        {
          chainId: "evmos_9001-2",
          chainType: "cosmos",
          chainName: "evmos",
          denom: "axlWETH",
          address: "weth-wei",
          decimals: 18,
          sourceDenom: "weth-wei",
        },
        {
          chainId: 250,
          chainType: "evm",
          chainName: "Fantom",
          denom: "axlETH",
          address: "0xfe7eDa5F2c56160d406869A8aA4B2F365d544C7B",
          decimals: 18,
          sourceDenom: "0xfe7eDa5F2c56160d406869A8aA4B2F365d544C7B",
        },
        {
          chainId: 314,
          chainType: "evm",
          chainName: "filecoin",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          sourceDenom: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
        },
        {
          chainId: 252,
          chainType: "evm",
          chainName: "fraxtal",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          sourceDenom: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
        },
        {
          chainId: "injective-1",
          chainType: "cosmos",
          chainName: "injective",
          denom: "axlWETH",
          address:
            "ibc/65A6973F7A4013335AE5FFE623FE019A78A1FEEE9B8982985099978837D764A7",
          decimals: 18,
          sourceDenom:
            "ibc/65A6973F7A4013335AE5FFE623FE019A78A1FEEE9B8982985099978837D764A7",
        },
        {
          chainId: "juno-1",
          chainType: "cosmos",
          chainName: "juno",
          denom: "axlWETH",
          address:
            "ibc/95A45A81521EAFDBEDAEEB6DA975C02E55B414C95AD3CE50709272366A90CA17",
          decimals: 18,
          sourceDenom:
            "ibc/95A45A81521EAFDBEDAEEB6DA975C02E55B414C95AD3CE50709272366A90CA17",
        },
        {
          chainId: 2222,
          chainType: "evm",
          chainName: "kava",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          sourceDenom: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
        },
        {
          chainId: "kaiyo-1",
          chainType: "cosmos",
          chainName: "kujira",
          denom: "axlWETH",
          address:
            "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
          decimals: 18,
          sourceDenom:
            "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
        },
        {
          chainId: 59144,
          chainType: "evm",
          chainName: "linea",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          sourceDenom: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
        },
        {
          chainId: 5000,
          chainType: "evm",
          chainName: "mantle",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          sourceDenom: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
        },
        {
          chainId: "neutron-1",
          chainType: "cosmos",
          chainName: "neutron",
          denom: "axlETH",
          address:
            "ibc/A585C2D15DCD3B010849B453A2CFCB5E213208A5AB665691792684C26274304D",
          decimals: 18,
          sourceDenom:
            "ibc/A585C2D15DCD3B010849B453A2CFCB5E213208A5AB665691792684C26274304D",
        },
        {
          chainId: "pirin-1",
          chainType: "cosmos",
          chainName: "nolus",
          denom: "ETH",
          address:
            "ibc/A7C4A3FB19E88ABE60416125F9189DA680800F4CDD14E3C10C874E022BEFF04C",
          decimals: 18,
          sourceDenom:
            "ibc/A7C4A3FB19E88ABE60416125F9189DA680800F4CDD14E3C10C874E022BEFF04C",
        },
        {
          chainId: "regen-1",
          chainType: "cosmos",
          chainName: "regen",
          denom: "axlWETH",
          address:
            "ibc/62B27C470C859CBCB57DC12FCBBD357DD44CAD673362B47503FAA77523ABA028",
          decimals: 18,
          sourceDenom:
            "ibc/62B27C470C859CBCB57DC12FCBBD357DD44CAD673362B47503FAA77523ABA028",
        },
        {
          chainId: 534352,
          chainType: "evm",
          chainName: "scroll",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          sourceDenom: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
        },
        {
          chainId: "secret-4",
          chainType: "cosmos",
          chainName: "secret-snip",
          denom: "axlETH",
          address: "secret139qfh3nmuzfgwsx2npnmnjl4hrvj3xq5rmq8a0",
          decimals: 18,
          sourceDenom: "secret139qfh3nmuzfgwsx2npnmnjl4hrvj3xq5rmq8a0",
        },
        {
          chainId: "columbus-5",
          chainType: "cosmos",
          chainName: "terra",
          denom: "axlWETH",
          address:
            "ibc/9B68CC79EFF12D25AF712EB805C5062B8F97B2CCE5F3FE55B107EE03095514A3",
          decimals: 18,
          sourceDenom:
            "ibc/9B68CC79EFF12D25AF712EB805C5062B8F97B2CCE5F3FE55B107EE03095514A3",
        },
        {
          chainId: "phoenix-1",
          chainType: "cosmos",
          chainName: "terra-2",
          denom: "axlWETH",
          address:
            "ibc/BC8A77AFBD872FDC32A348D3FB10CC09277C266CFE52081DE341C7EC6752E674",
          decimals: 18,
          sourceDenom:
            "ibc/BC8A77AFBD872FDC32A348D3FB10CC09277C266CFE52081DE341C7EC6752E674",
        },
        {
          chainId: "umee-1",
          chainType: "cosmos",
          chainName: "umee",
          denom: "axlWETH",
          address:
            "ibc/04CE51E6E02243E565AE676DD60336E48D455F8AAD0611FA0299A22FDAC448D6",
          decimals: 18,
          sourceDenom:
            "ibc/04CE51E6E02243E565AE676DD60336E48D455F8AAD0611FA0299A22FDAC448D6",
        },
      ]);
    });
  });
});

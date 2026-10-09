import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
// eslint-disable-next-line import/no-extraneous-dependencies
import { http as httpMock, HttpResponse } from "msw";
import { createPublicClient, http } from "viem";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { server } from "../../__tests__/msw";
import { BridgeQuoteError } from "../../errors";
import { BridgeProviderContext } from "../../interface";
import { SquidBridgeProvider } from "../index";
import {
  ETH_OsmosisToEthereum_Route,
  ETHtoAVAX_EthereumToAvalanche_Route,
  MockChains,
  MockTokens,
} from "./mocks";

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
    httpMock.post("https://v2.api.squidrouter.com/v2/route", () => {
      return HttpResponse.json({
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
            target: "0x0000000000000000000000000000000000000000",
            data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef123456780000000000000000000000000000000000000000000000000000000000000001",
            gasLimit: "21000",
            gasPrice: "1000000000",
            value: "0",
            type: "SEND",
          },
          params: {
            toToken: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
          },
        },
      });
    }),
    httpMock.get("https://v2.api.squidrouter.com/v2/tokens", () =>
      HttpResponse.json({
        tokens: MockTokens,
      })
    ),
    httpMock.get("https://v2.api.squidrouter.com/v2/chains", () =>
      HttpResponse.json({
        chains: MockChains,
      })
    )
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
    provider = new SquidBridgeProvider(
      process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID || "",
      ctx
    );
  });

  // Squid reports a loss as a positive percentage (a live 50k USDC → ARB quote
  // returned "0.8" with the USD output ~0.5% below the input); the interface
  // wants a fraction, negative for a loss.
  it("reports Squid's positive-loss percentage as a negative fraction", async () => {
    server.use(
      httpMock.post("https://v2.api.squidrouter.com/v2/route", () =>
        HttpResponse.json({
          ...ETHtoAVAX_EthereumToAvalanche_Route,
          route: {
            ...ETHtoAVAX_EthereumToAvalanche_Route.route,
            estimate: {
              ...ETHtoAVAX_EthereumToAvalanche_Route.route.estimate,
              aggregatePriceImpact: "0.8",
            },
          },
        })
      )
    );

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
      fromAmount: "1000000000000000",
      fromAddress: "0x7863Ec05b123885c7609B05c35Df777F3F180258",
      toAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      slippage: 1,
    });

    expect(quote.expectedOutput.priceImpact).toBe("-0.008000000000000000");
  });

  it("should get a quote - ETH from Ethereum to AVAX on Avalanche", async () => {
    server.use(
      httpMock.post("https://v2.api.squidrouter.com/v2/route", () =>
        HttpResponse.json(ETHtoAVAX_EthereumToAvalanche_Route)
      )
    );
    const quoteRequest = {
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
      fromAmount: "1000000000000000",
      fromAddress: "0x7863Ec05b123885c7609B05c35Df777F3F180258",
      toAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      slippage: 1,
    };
    console.log(
      "ETH from Ethereum to AVAX on Avalanche request:",
      JSON.stringify(quoteRequest)
    );
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
      fromAmount: "1000000000000000",
      fromAddress: "0x7863Ec05b123885c7609B05c35Df777F3F180258",
      toAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      slippage: 1,
    });

    expect(quote).toBeDefined();
    expect(quote).toEqual({
      input: {
        amount: "1000000000000000",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
        denom: "ETH",
      },
      expectedOutput: {
        amount: "54602787339179287",
        address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        decimals: 18,
        denom: "AVAX",
        priceImpact: "0.000000000000000000",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 43114, chainName: "Avalanche", chainType: "evm" },
      transferFee: {
        amount: "551234033843310",
        denom: "ETH",
        chainId: 1,
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        coinGeckoId: "ethereum",
        isAdditive: true,
      },
      estimatedTime: 960,
      estimatedGasFee: {
        amount: "6259874503623000",
        denom: "ETH",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        coinGeckoId: "ethereum",
      },
      transactionRequest: {
        type: "evm",
        to: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
        data: "0x846a1bc6000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000004c00000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000054000000000000000000000000000000000000000000000000000000000000005a00000000000000000000000007863ec05b123885c7609b05c35df777f3f18025800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b30000000000000000000000001b81d678ffb9c0263b24a97847620c99d213eb1400000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b81d678ffb9c0263b24a97847620c99d213eb14000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000104414bf389000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000000000000000064000000000000000000000000ce16f69375520ab01377ce7b88f5ba8c48f8d666000000000000000000000000000000000000000000000000000001903b771a8400000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000003561ab00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004555344430000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000094176616c616e6368650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a30786365313646363933373535323061623031333737636537423838663542413843343846384436363600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000164000000000000000000000000000000000000000000000000000000000000000400000000000000000000000006c515b41bfbee0aa754f306098ba005152c928b900000000000000000000000000000000000000000000000000000000000000090000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000082000000000000000000000000000000000000000000000000000000000000009a00000000000000000000000000000000000000000000000000000000000000be00000000000000000000000000000000000000000000000000000000000000d60000000000000000000000000000000000000000000000000000000000000122000000000000000000000000000000000000000000000000000000000000013a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000fab550568c688d5d8a52c7d794cb93edc26ec0ec0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000fab550568c688d5d8a52c7d794cb93edc26ec0ec000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000bff334f8d5912ac5c4f2c590a2396d1c5d9901230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000fab550568c688d5d8a52c7d794cb93edc26ec0ec00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bff334f8d5912ac5c4f2c590a2396d1c5d990123000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000003840651cb35000000000000000000000000fab550568c688d5d8a52c7d794cb93edc26ec0ec000000000000000000000000d7bb79aee866672419999a0496d99c54741d67b5000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e848000000000000000000000000000000000000000000000000000000000001e65f20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ea749fd6ba492dbc14c24fe8a3d08769229b896c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000060ae616a2155ee3d9a68541ba4544862310933d40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000060ae616a2155ee3d9a68541ba4544862310933d4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000104676528d100000000000000000000000000000000000000000000000000000000001e854e0000000000000000000000000000000000000000000000000100285a98347f5500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000006c515b41bfbee0aa754f306098ba005152c928b9000000000000000000000000000000000000000000000000000001903b771a880000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e000000000000000000000000b31f66aa3c1e785363f0875a1b74e27b85fd66c7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000fab550568c688d5d8a52c7d794cb93edc26ec0ec000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000bff334f8d5912ac5c4f2c590a2396d1c5d9901230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000fab550568c688d5d8a52c7d794cb93edc26ec0ec00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000bff334f8d5912ac5c4f2c590a2396d1c5d990123000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000003840651cb35000000000000000000000000fab550568c688d5d8a52c7d794cb93edc26ec0ec000000000000000000000000d7bb79aee866672419999a0496d99c54741d67b5000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016f8bd000000000000000000000000000000000000000000000000000000000016ca230000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ea749fd6ba492dbc14c24fe8a3d08769229b896c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000fab550568c688d5d8a52c7d794cb93edc26ec0ec00000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000001000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000044095ea7b300000000000000000000000060ae616a2155ee3d9a68541ba4544862310933d40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000060ae616a2155ee3d9a68541ba4544862310933d4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000010438ed1739000000000000000000000000000000000000000000000000000000000016f95800000000000000000000000000000000000000000000000000c00c5619aac06600000000000000000000000000000000000000000000000000000000000000a00000000000000000000000006c515b41bfbee0aa754f306098ba005152c928b9000000000000000000000000000000000000000000000000000001903b771a8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e000000000000000000000000b31f66aa3c1e785363f0875a1b74e27b85fd66c7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000b97ef9ef8734c71904d8002f8b6bc66dd9c48a6e0000000000000000000000000000000000000000000000000000000000000000",
        gas: "0xa8368",
        maxFeePerGas: "0x3e18b346e",
        maxPriorityFeePerGas: "0x59682f00",
        value: "0x1f5582cc67c6e",
        approvalTransactionRequest: {
          // from encodeFunctionData
          data: "0xabcdef",
          to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        },
      },
    });
  });

  it("should get a quote - ETH from Osmosis to Ethereum", async () => {
    server.use(
      httpMock.post("https://v2.api.squidrouter.com/v2/route", () =>
        HttpResponse.json(ETH_OsmosisToEthereum_Route)
      )
    );
    console.log(
      "ETH from Osmosis to Ethereum request:",
      JSON.stringify({
        fromChain: {
          chainId: "osmosis-1",
          chainName: "Osmosis",
          chainType: "cosmos",
        },
        toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
        fromAsset: {
          denom: "ETH",
          address:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
          decimals: 18,
        },
        toAsset: {
          denom: "WETH",
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          decimals: 18,
        },
        fromAmount: "1000000000000000000000",
        fromAddress: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
        toAddress: "0x6c515B41bFBEe0aA754F306098Ba005152c928b9",
        slippage: 1,
      })
    );
    const quote = await provider.getQuote({
      fromChain: {
        chainId: "osmosis-1",
        chainName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      fromAsset: {
        denom: "ETH",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
      },
      toAsset: {
        denom: "WETH",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
      },
      fromAmount: "1000000000000000000000",
      fromAddress: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
      toAddress: "0x6c515B41bFBEe0aA754F306098Ba005152c928b9",
      slippage: 1,
    });

    expect(quote).toBeDefined();
    expect(quote).toEqual({
      input: {
        amount: "1000000000000000000000",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
      },
      expectedOutput: {
        amount: "999995820694001025771",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
        denom: "WETH",
        priceImpact: "0.000000000000000000",
      },
      fromChain: {
        chainId: "osmosis-1",
        chainName: "Osmosis",
        chainType: "cosmos",
      },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      transferFee: {
        amount: "4179305998974229",
        denom: "axlETH",
        chainId: "osmosis-1",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        coinGeckoId: "weth",
        isAdditive: false,
      },
      estimatedTime: 60,
      estimatedGasFee: {
        amount: "20000",
        denom: "axlETH",
        coinGeckoId: "weth",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
      },
      transactionRequest: {
        type: "cosmos",
        msgs: [
          {
            typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
            value: {
              memo: '{"destination_chain":"ethereum","destination_address":"0xce16F69375520ab01377ce7B88f5BA8C48F8D666","payload":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,108,81,91,65,191,190,224,170,117,79,48,96,152,186,0,81,82,201,40,185,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,192,42,170,57,178,35,254,141,10,14,92,79,39,234,217,8,60,117,108,194,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,192,42,170,57,178,35,254,141,10,14,92,79,39,234,217,8,60,117,108,194,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,169,5,156,187,0,0,0,0,0,0,0,0,0,0,0,0,108,81,91,65,191,190,224,170,117,79,48,96,152,186,0,81,82,201,40,185,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,192,42,170,57,178,35,254,141,10,14,92,79,39,234,217,8,60,117,108,194,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],"type":2,"fee":{"amount":"4179305998974229","recipient":"axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89"}}',
              receiver:
                "axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5",
              sender: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
              sourceChannel: "channel-208",
              sourcePort: "transfer",
              timeoutHeight: {
                revisionHeight: "1000",
                revisionNumber: "1",
              },
              timeoutTimestamp: "1718987965889999872",
              token: {
                amount: "1000000000000000000000",
                denom:
                  "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
              },
            },
          },
        ],
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
        },
        toAsset: {
          denom: "AVAX",
          address: "0x0",
          decimals: 18,
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
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
      estimateFromAmount: "1",
      transactionRequest: {
        target: "0x0000000000000000000000000000000000000000",
        data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef123456780000000000000000000000000000000000000000000000000000000000000001",
        gasLimit: "21000",
        gasPrice: "1000000000",
        value: "0",
        maxFeePerGas: "1000000000",
        maxPriorityFeePerGas: "1000000000",
      },
    });

    expect(transaction).toEqual({
      type: "evm",
      to: "0x0000000000000000000000000000000000000000",
      data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef123456780000000000000000000000000000000000000000000000000000000000000001",
      gas: "0x5208",
      value: "0x0",
      approvalTransactionRequest: undefined,
      maxFeePerGas: "0x3b9aca00",
      maxPriorityFeePerGas: "0x3b9aca00",
    });
  });

  it("should create a Cosmos MsgExecuteContract transaction (v2 format)", async () => {
    const cosmwasmData = JSON.stringify({
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: {
        sender: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
        contract:
          "osmo1x0fn7u7qlhxn6cl47hfnsyq0ymga57fz3mn7yccsaywqxpahq2pqs3na3m",
        msg: { swap: { output_denom: "uosmo" } },
        funds: [{ denom: "uatom", amount: "1000000" }],
      },
    });

    const result = await provider.createCosmosTransaction(
      cosmwasmData,
      "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
      { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      { denom: "uatom", amount: "1000000" }
    );

    expect(result).toBeDefined();
    expect(result.type).toBe("cosmos");
    expect(result.msgs).toHaveLength(1);
    expect(result.msgs[0].typeUrl).toBe("/cosmwasm.wasm.v1.MsgExecuteContract");

    const msg = result.msgs[0];
    expect(msg.value.contract).toBe(
      "osmo1x0fn7u7qlhxn6cl47hfnsyq0ymga57fz3mn7yccsaywqxpahq2pqs3na3m"
    );
    expect(msg.value.sender).toBe(
      "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx"
    );
    expect(msg.value.funds).toEqual([{ denom: "uatom", amount: "1000000" }]);
  });

  it("should get chains", async () => {
    const chains = await provider.getChains();
    expect(chains).toEqual(MockChains);
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
        },
        toAsset: {
          denom: "AVAX",
          address: "0x0",
          decimals: 18,
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

  describe("getSupportedAssets", () => {
    it("gets multi-issued variants (Noble USDC) with counterparty array", async () => {
      const sourceVariants = await provider.getSupportedAssets({
        chain: {
          chainId: "osmosis-1",
          chainType: "cosmos",
        },
        asset: {
          denom: "USDC",
          address:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          decimals: 6,
        },
        direction: "deposit",
      });

      expect(sourceVariants).toEqual([
        {
          chainId: "noble-1",
          chainType: "cosmos",
          coinGeckoId: "usd-coin",
          address: "uusdc",
          denom: "USDC",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 1,
          chainType: "evm",
          coinGeckoId: "usd-coin",
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          denom: "USDC",
          decimals: 6,
          transferTypes: ["quote"],
        },
      ]);
    });

    it("gets multi-issued variants (Axelar USDC)", async () => {
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
          chainId: "axelar-dojo-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "axelarnet",
          denom: "axlUSDC",
          address: "uusdc",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 1,
          chainType: "evm",
          coinGeckoId: "usd-coin",
          chainName: "Ethereum",
          denom: "USDC",
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "agoric-3",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "agoric",
          denom: "axlUSDC",
          address:
            "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 42161,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "Arbitrum",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "archway-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "archway",
          denom: "axlUSDC",
          address:
            "ibc/B9E4FD154C92D3A23BEA029906C4C5FF2FE74CB7E3A058290B77197A263CF88B",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "mantle-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "assetmantle",
          denom: "axlUSDC",
          address:
            "ibc/616E26A85AD20A3DDEAEBDDE7262E3BA9356C557BC15CACEA86768D7D51FA703",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 43114,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "Avalanche",
          denom: "axlUSDC",
          address: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 8453,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "base",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 56,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "binance",
          denom: "axlUSDC",
          address: "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 81457,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "blast",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "carbon-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "carbon",
          denom: "USDC",
          address:
            "ibc/7C0807A56073C4A27B0DE1C21BA3EB75DF75FD763F4AD37BC159917FC01145F0",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 42220,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "celo",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "comdex-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "comdex",
          denom: "axlUSDC",
          address:
            "ibc/E1616E7C19EA474C565737709A628D6F8A23FF9D3E9A7A6871306CF5E0A5341E",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "crescent-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "crescent",
          denom: "axlUSDC",
          address:
            "ibc/BFF0D3805B50D93E2FA5C0B2DDF7E0B30A631076CD80BC12A48C0E95404B4A41",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "dymension_1100-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "dymension",
          denom: "axlUSDC",
          address:
            "ibc/BFAAB7870A9AAABF64A7366DAAA0B8E5065EAA1FCE762F45677DC24BE796EF65",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "evmos_9001-2",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "evmos",
          denom: "axlUSDC",
          address: "uusdc",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 250,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "Fantom",
          denom: "axlUSDC",
          address: "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 314,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "filecoin",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 252,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "fraxtal",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 13371,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "immutable",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "injective-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "injective",
          denom: "axlUSDC",
          address:
            "ibc/7E1AF94AD246BE522892751046F0C959B768642E5671CC3742264068D49553C0",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "juno-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "juno",
          denom: "axlUSDC",
          address:
            "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 2222,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "kava",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "kaiyo-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "kujira",
          denom: "axlUSDC",
          address:
            "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 59144,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "linea",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 5000,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "mantle",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 1284,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "Moonbeam",
          denom: "axlUSDC",
          address: "0xCa01a1D0993565291051daFF390892518ACfAD3A",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "neutron-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "neutron",
          denom: "axlUSDC",
          address:
            "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 10,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "optimism",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 137,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "Polygon",
          denom: "axlUSDC",
          address: "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "regen-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "regen",
          denom: "axlUSDC",
          address:
            "ibc/334740505537E9894A64E8561030695016481830D7B36E6A9B6D13C608B55653",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: 534352,
          chainType: "evm",
          coinGeckoId: "axlusdc",
          chainName: "scroll",
          denom: "axlUSDC",
          address: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "secret-4",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "secret-snip",
          denom: "axlUSDC",
          address: "secret1vkq022x4q8t8kx9de3r84u669l65xnwf2lg3e6",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "stargaze-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "stargaze",
          denom: "axlUSDC",
          address:
            "ibc/96274e25174ee93314d8b5636d2d2f70963e207c22f643ec41949a3cbeda4c72",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "columbus-5",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "terra",
          denom: "axlUSDC",
          address:
            "ibc/E1E3674A0E4E1EF9C69646F9AF8D9497173821826074622D831BAB73CCB99A2D",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "phoenix-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "terra-2",
          denom: "axlUSDC",
          address:
            "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          chainId: "umee-1",
          chainType: "cosmos",
          coinGeckoId: "axlusdc",
          chainName: "umee",
          denom: "axlUSDC",
          address:
            "ibc/49788C29CD84E08D25CA7BE960BC1F61E88FEFC6333F58557D236D693398466A",
          decimals: 6,
          transferTypes: ["quote"],
        },
      ]);
    });

    it("gets EVM gas token variants (ETH & WETH)", async () => {
      const sourceVariants = await provider.getSupportedAssets({
        chain: {
          chainId: "osmosis-1",
          chainType: "cosmos",
        },
        asset: {
          denom: "ETH.axl",
          address:
            "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
          decimals: 6,
        },
        direction: "deposit",
      });

      expect(sourceVariants).toEqual([
        {
          chainId: "axelar-dojo-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "axelarnet",
          denom: "axlWETH",
          address: "weth-wei",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 1,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "Ethereum",
          denom: "WETH",
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 1,
          chainType: "evm",
          coinGeckoId: "ethereum",
          chainName: "Ethereum",
          denom: "ETH",
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "agoric-3",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "agoric",
          denom: "axlWETH",
          address:
            "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 42161,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "Arbitrum",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "archway-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "archway",
          denom: "axlWETH",
          address:
            "ibc/13C5990F84FA5D472E1F8BB1BAAEA8774DA5F24128EC02B119107AD21FB52A61",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "mantle-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "assetmantle",
          denom: "axlWETH",
          address:
            "ibc/3EFE89848528B4A5665D0102DB818C6B19E04E17455197E92BECC3C41A7F7D78",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 81457,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "blast",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 42220,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "celo",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "comdex-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "comdex",
          denom: "axlWETH",
          address:
            "ibc/81C3A46287D7664A8FD19843AC8D0CFD6C284EF1F750C661C48B3544277B1B29",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "crescent-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "crescent",
          denom: "axlWETH",
          address:
            "ibc/F1806958CA98757B91C3FA1573ECECD24F6FA3804F074A6977658914A49E65A3",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "dymension_1100-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "dymension",
          denom: "axlETH",
          address:
            "ibc/E3AB0DFDE9E782262B770C32DF94AC2A92B93DC4825376D6F6C874D3C877864E",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "evmos_9001-2",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "evmos",
          denom: "axlWETH",
          address: "weth-wei",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 250,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "Fantom",
          denom: "axlETH",
          address: "0xfe7eDa5F2c56160d406869A8aA4B2F365d544C7B",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 314,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "filecoin",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 252,
          chainType: "evm",
          coinGeckoId: "axlweth",
          chainName: "fraxtal",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "injective-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "injective",
          denom: "axlWETH",
          address:
            "ibc/65A6973F7A4013335AE5FFE623FE019A78A1FEEE9B8982985099978837D764A7",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "juno-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "juno",
          denom: "axlWETH",
          address:
            "ibc/95A45A81521EAFDBEDAEEB6DA975C02E55B414C95AD3CE50709272366A90CA17",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 2222,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "kava",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "kaiyo-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "kujira",
          denom: "axlWETH",
          address:
            "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 59144,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "linea",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 5000,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "mantle",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "neutron-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "neutron",
          denom: "axlETH",
          address:
            "ibc/A585C2D15DCD3B010849B453A2CFCB5E213208A5AB665691792684C26274304D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "pirin-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "nolus",
          denom: "ETH",
          address:
            "ibc/A7C4A3FB19E88ABE60416125F9189DA680800F4CDD14E3C10C874E022BEFF04C",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "regen-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "regen",
          denom: "axlWETH",
          address:
            "ibc/62B27C470C859CBCB57DC12FCBBD357DD44CAD673362B47503FAA77523ABA028",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: 534352,
          chainType: "evm",
          coinGeckoId: "weth",
          chainName: "scroll",
          denom: "axlETH",
          address: "0xb829b68f57CC546dA7E5806A929e53bE32a4625D",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "secret-4",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "secret-snip",
          denom: "axlETH",
          address: "secret139qfh3nmuzfgwsx2npnmnjl4hrvj3xq5rmq8a0",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "columbus-5",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "terra",
          denom: "axlWETH",
          address:
            "ibc/9B68CC79EFF12D25AF712EB805C5062B8F97B2CCE5F3FE55B107EE03095514A3",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "phoenix-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "terra-2",
          denom: "axlWETH",
          address:
            "ibc/BC8A77AFBD872FDC32A348D3FB10CC09277C266CFE52081DE341C7EC6752E674",
          decimals: 18,
          transferTypes: ["quote"],
        },
        {
          chainId: "umee-1",
          chainType: "cosmos",
          coinGeckoId: "weth",
          chainName: "umee",
          denom: "axlWETH",
          address:
            "ibc/04CE51E6E02243E565AE676DD60336E48D455F8AAD0611FA0299A22FDAC448D6",
          decimals: 18,
          transferTypes: ["quote"],
        },
      ]);
    });
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
    provider = new SquidBridgeProvider(
      process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID || "",
      ctx
    );
  });

  it("should generate the correct URL for given parameters", async () => {
    const expectedUrl =
      "https://app.squidrouter.com/?chains=8453%2Cosmosis-1&tokens=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE%2Cibc%2FEA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 8453, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        denom: "ETH",
      },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Squid");
    expect(result?.url.toString()).toBe(expectedUrl);
  });

  it("should encode asset addresses correctly", async () => {
    const expectedUrl =
      "https://app.squidrouter.com/?chains=8453%2Cosmosis-1&tokens=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913%2Cibc%2F498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 8453, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 18,
        denom: "ETH",
      },
      toAsset: {
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        decimals: 18,
        denom: "ETH",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Squid");
    expect(result?.url.toString()).toBe(expectedUrl);
  });

  it("should handle numeric chain IDs correctly", async () => {
    const expectedUrl =
      "https://app.squidrouter.com/?chains=43114%2Cosmosis-1&tokens=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E%2Cibc%2F498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 43114, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        decimals: 18,
        denom: "USDC",
      },
      toAsset: {
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        decimals: 18,
        denom: "USDC",
      },
      toAddress: "destination-address",
    });

    expect(result?.urlProviderName).toBe("Squid");
    expect(result?.url.toString()).toBe(expectedUrl);
  });
});

describe("SquidBridgeProvider getSupportedAssets failure propagation", () => {
  it("rejects when the provider registry is unavailable", async () => {
    server.use(
      httpMock.get("https://v2.api.squidrouter.com/v2/tokens", () =>
        HttpResponse.json({ message: "registry unavailable" }, { status: 500 })
      )
    );

    const failingCtx: BridgeProviderContext = {
      env: "mainnet",
      cache: new LRUCache<string, CacheEntry>({ max: 10 }),
      assetLists: MockAssetLists,
      chainList: [],
      getTimeoutHeight: jest.fn().mockResolvedValue({
        revisionNumber: "1",
        revisionHeight: "1000",
      }),
    };
    const failingProvider = new SquidBridgeProvider("integratorId", failingCtx);

    // A registry failure must reject rather than resolve to an empty list:
    // an empty list means "asset unsupported", which the client settles on
    // without retrying, while a rejected query is retried and re-polled.
    // (getTokens rethrows the API error body, a plain object rather than an
    // Error, so assert the rejection outcome directly instead of toThrow.)
    const outcome = await failingProvider
      .getSupportedAssets({
        chain: {
          chainId: "osmosis-1",
          chainName: "osmosis",
          chainType: "cosmos",
        },
        asset: {
          denom: "USDC",
          address:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          decimals: 6,
        },
        direction: "deposit",
      })
      .then(
        () => "resolved",
        () => "rejected"
      );
    expect(outcome).toBe("rejected");
  });

  it("resolves empty when the token is not in the (healthy) registry", async () => {
    // registry responds fine (global fixture handlers); the token is simply
    // not listed — an ordinary unsupported asset, NOT an outage, so the
    // result must resolve to [] rather than reject (a rejection would make
    // the client retry forever and never render other transfer options)
    const healthyCtx: BridgeProviderContext = {
      env: "mainnet",
      cache: new LRUCache<string, CacheEntry>({ max: 10 }),
      assetLists: MockAssetLists,
      chainList: [],
      getTimeoutHeight: jest.fn().mockResolvedValue({
        revisionNumber: "1",
        revisionHeight: "1000",
      }),
    };
    const healthyProvider = new SquidBridgeProvider("integratorId", healthyCtx);

    await expect(
      healthyProvider.getSupportedAssets({
        chain: {
          chainId: "osmosis-1",
          chainName: "osmosis",
          chainType: "cosmos",
        },
        asset: {
          denom: "FAKE",
          address: "ibc/NOTINREGISTRY",
          decimals: 6,
        },
        direction: "deposit",
      })
    ).resolves.toEqual([]);
  });

  it("rejects (and does not cache) a degraded 200 registry response with an empty body", async () => {
    // a rate-limited or degraded upstream can answer 200 with an empty
    // token list; treating that as truth would read as "asset unsupported"
    // for the 30-minute cache lifetime, silently bypassing the client's
    // retry and re-poll machinery
    server.use(
      httpMock.get("https://v2.api.squidrouter.com/v2/tokens", () =>
        HttpResponse.json({ tokens: [] })
      )
    );

    const degradedCtx: BridgeProviderContext = {
      env: "mainnet",
      cache: new LRUCache<string, CacheEntry>({ max: 10 }),
      assetLists: MockAssetLists,
      chainList: [],
      getTimeoutHeight: jest.fn().mockResolvedValue({
        revisionNumber: "1",
        revisionHeight: "1000",
      }),
    };
    const degradedProvider = new SquidBridgeProvider(
      "integratorId",
      degradedCtx
    );

    await expect(
      degradedProvider.getSupportedAssets({
        chain: {
          chainId: "osmosis-1",
          chainName: "osmosis",
          chainType: "cosmos",
        },
        asset: {
          denom: "USDC",
          address:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          decimals: 6,
        },
        direction: "deposit",
      })
    ).rejects.toThrow();
  });
});

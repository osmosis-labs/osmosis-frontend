import { estimateGasFee } from "@osmosis-labs/tx";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { server } from "../../__tests__/msw";
import {
  BridgeChain,
  BridgeProviderContext,
  BridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeQuoteParams,
} from "../../interface";
import { SkipBridgeProvider } from "..";
import { SkipMsg } from "../types";
import {
  ETH_EthereumToOsmosis_Msgs,
  ETH_EthereumToOsmosis_Route,
  ETH_OsmosisToEthereum_Msgs,
  ETH_OsmosisToEthereum_Route,
  SkipAssets,
  SkipChains,
} from "./mocks";

jest.mock("viem", () => ({
  ...jest.requireActual("viem"),
  createPublicClient: jest.fn().mockImplementation(() => ({
    estimateGas: jest.fn().mockResolvedValue(BigInt("21000")),
    request: jest.fn().mockResolvedValue("0x4a817c800"),
    getGasPrice: jest.fn().mockResolvedValue(BigInt("20000000000")),
    readContract: jest.fn().mockResolvedValue(BigInt("100")),
  })),
  encodeFunctionData: jest.fn().mockReturnValue("0xabcdef"),
  encodePacked: jest.fn().mockReturnValue("0xabcdef"),
  keccak256: jest.fn().mockReturnValue("0xabcdef"),
}));

jest.mock("@osmosis-labs/tx");

jest.mock("@cosmjs/proto-signing", () => ({
  ...jest.requireActual("@cosmjs/proto-signing"),
  Registry: jest.fn().mockReturnValue({
    encodeAsAny: jest.fn().mockReturnValue("any"),
  }),
}));

beforeEach(() => {
  server.use(
    rest.get("https://api.skip.money/v2/fungible/assets", (_req, res, ctx) => {
      return res(ctx.json(SkipAssets));
    }),
    rest.get("https://api.skip.money/v2/info/chains", (_req, res, ctx) => {
      return res(ctx.json(SkipChains));
    })
  );
  jest.clearAllMocks();
});

describe("SkipBridgeProvider", () => {
  let provider: SkipBridgeProvider;
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
    provider = new SkipBridgeProvider(ctx);
  });

  it("should get a quote - ETH.axl from Osmosis to Ethereum", async () => {
    server.use(
      rest.post("https://api.skip.money/v2/fungible/route", (_req, res, ctx) =>
        res(ctx.json(ETH_OsmosisToEthereum_Route))
      ),
      rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) =>
        res(ctx.json(ETH_OsmosisToEthereum_Msgs))
      )
    );

    // Mock gas fee estimation of IBC transfer
    (estimateGasFee as jest.Mock).mockResolvedValue({
      gas: "420000",
      amount: [
        {
          denom: "uosmo",
          amount: "1232",
        },
      ],
    });

    const quote = await provider.getQuote({
      fromAmount: "10000000000000000000",
      fromAsset: {
        denom: "ETH",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
      },
      fromChain: {
        chainId: "osmosis-1",
        chainName: "osmosis",
        chainType: "cosmos",
      },
      toAsset: {
        denom: "WETH",
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        decimals: 18,
      },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      fromAddress: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
      toAddress: "0x7863Ec05b123885c7609B05c35Df777F3F180258",
      slippage: 0.01,
    });

    expect(quote).toBeDefined();
    expect(quote).toEqual({
      input: {
        amount: "10000000000000000000",
        denom: "ETH",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
      },
      expectedOutput: {
        amount: "9992274579512577377",
        denom: "WETH",
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        decimals: 18,
        priceImpact: "0",
      },
      fromChain: {
        chainId: "osmosis-1",
        chainName: "osmosis",
        chainType: "cosmos",
      },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      transferFee: {
        amount: "7725420487422623",
        denom: "WETH",
        chainId: 1,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
      },
      estimatedTime: 960,
      transactionRequest: {
        type: "cosmos",
        msgTypeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        msg: {
          sourcePort: "transfer",
          sourceChannel: "channel-208",
          token: {
            denom:
              "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
            amount: "10000000000000000000",
          },
          sender: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
          receiver:
            "axelar1dv4u5k73pzqrxlzujxg3qp8kvc3pje7jtdvu72npnt5zhq05ejcsn5qme5",
          timeoutHeight: {
            revisionNumber: "1",
            revisionHeight: "1000",
          },
          timeoutTimestamp: "0",
          memo: '{"destination_chain":"Ethereum","destination_address":"0xD397883c12b71ea39e0d9f6755030205f31A1c96","payload":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,99,236,5,177,35,136,92,118,9,176,92,53,223,119,127,63,24,2,88],"type":2,"fee":{"amount":"7725420487422623","recipient":"axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89"}}',
        },
      },
      estimatedGasFee: {
        amount: "1232",
        denom: "OSMO",
        decimals: 6,
        address: "uosmo",
      },
    });
  });

  it("should get a quote - ETH.axl from Ethereum to Osmosis", async () => {
    server.use(
      rest.post("https://api.skip.money/v2/fungible/route", (_req, res, ctx) =>
        res(ctx.json(ETH_EthereumToOsmosis_Route))
      ),
      rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) =>
        res(ctx.json(ETH_EthereumToOsmosis_Msgs))
      )
    );

    const quote = await provider.getQuote({
      fromAmount: "10000000000000000000",
      toAsset: {
        denom: "ETH",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
      },
      toChain: {
        chainId: "osmosis-1",
        chainName: "osmosis",
        chainType: "cosmos",
      },
      fromAsset: {
        denom: "WETH",
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        decimals: 18,
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toAddress: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
      fromAddress: "0x7863Ec05b123885c7609B05c35Df777F3F180258",
      slippage: 0.01,
    });

    expect(quote).toBeDefined();
    expect(quote).toEqual({
      input: {
        amount: "10000000000000000000",
        denom: "WETH",
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        decimals: 18,
      },
      expectedOutput: {
        amount: "10000000000000000000",
        denom: "ETH",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        priceImpact: "0",
      },
      toChain: {
        chainId: "osmosis-1",
        chainName: "osmosis",
        chainType: "cosmos",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      transferFee: {
        amount: "73924361079993",
        denom: "ETH",
        chainId: 1,
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
      },
      estimatedTime: 960,
      transactionRequest: {
        type: "evm",
        to: "0xD397883c12b71ea39e0d9f6755030205f31A1c96",
        data: "0xd421c10500000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000000000433bdb484cb900000000000000000000000000000000000000000000000000000000000000076f736d6f73697300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b6f736d6f313037767975657236777a6665376e727273756a7070613070767833356676706c7034743774780000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000007b7d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045745544800000000000000000000000000000000000000000000000000000000",
        value: "0x433bdb484cb9",
        approvalTransactionRequest: {
          to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          data: "0xabcdef",
        },
      },
      estimatedGasFee: {
        amount: "420000000000000",
        denom: "ETH",
        decimals: 18,
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      },
    });
  });

  it("should handle unsupported asset error", async () => {
    server.use(
      rest.get(
        "https://api.skip.money/v2/fungible/assets",
        (_req, res, ctx) => {
          return res(
            ctx.json({
              chain_to_assets_map: {
                "1": { assets: [] },
              },
            })
          );
        }
      )
    );

    const params: GetBridgeQuoteParams = {
      fromAmount: "1000",
      fromAsset: {
        denom: "asset1",
        address: "0x123",
        decimals: 18,
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toAsset: {
        denom: "asset2",
        address: "0x456",
        decimals: 18,
      },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      fromAddress: "0xabc",
      toAddress: "0xdef",
      slippage: 0.01,
    };

    await expect(provider.getQuote(params)).rejects.toThrow(
      "Unsupported asset asset1 on Ethereum"
    );
  });

  it("should create a transaction", async () => {
    const messages: SkipMsg[] = [
      {
        evm_tx: {
          to: "0x123",
          data: "abcdef",
          value: "1000",
          chain_id: "1",
          required_erc20_approvals: [],
        },
      },
    ];

    const txRequest = (await provider.createTransaction(
      "1",
      "0xabc",
      messages
    )) as EvmBridgeTransactionRequest;

    expect(txRequest).toBeDefined();
    expect(txRequest.type).toBe("evm");
    expect(txRequest.to).toBe("0x123");
    expect(txRequest.data).toBe("0xabcdef");
    expect(txRequest.value).toBe("0x3e8"); // 1000 in hex
  });

  it("should estimate gas cost - EVM transactions", async () => {
    const params: GetBridgeQuoteParams = {
      fromAmount: "1000",
      fromAsset: {
        denom: "asset1",
        address: "0x123",
        decimals: 18,
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toAsset: {
        denom: "asset2",
        address: "0x456",
        decimals: 18,
      },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      fromAddress: "0xabc",
      toAddress: "0xdef",
      slippage: 0.01,
    };

    const txData: BridgeTransactionRequest = {
      type: "evm",
      to: "0x123",
      data: "0xabcdef",
      value: "0x3e8",
    };

    const gasCost = await provider.estimateGasCost(params, txData);

    expect(gasCost).toBeDefined();
    expect(gasCost?.amount).toBeDefined();
    expect(gasCost?.denom).toBe("ETH");
  });

  it("should estimate gas cost - Cosmos transactions", async () => {
    const params: GetBridgeQuoteParams = {
      fromAmount: "1000",
      fromAsset: {
        denom: "asset1",
        address: "ibc/123",
        decimals: 6,
      },
      fromChain: {
        chainId: "osmosis-1",
        chainName: "Osmosis",
        chainType: "cosmos",
      },
      toAsset: {
        denom: "asset2",
        address: "0x456",
        decimals: 6,
      },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      fromAddress: "osmo1ABC123",
      toAddress: "0xdef",
      slippage: 0.01,
    };

    const txData: BridgeTransactionRequest = {
      type: "cosmos",
      msgTypeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      msg: {
        // mock data
        source_channel: "channel-123",
        source_port: "port-123",
        sender: "osmo1ABC123",
        receiver: "0xdef",
        denom: "asset1",
        amount: "1000",
      },
    };

    (estimateGasFee as jest.Mock).mockResolvedValue({
      gas: "1000",
      amount: [
        {
          denom: "uosmo",
          amount: "1000",
        },
      ],
    });

    const gasCost = await provider.estimateGasCost(params, txData);

    expect(gasCost).toBeDefined();
    expect(gasCost?.amount).toBe("1000");
    expect(gasCost?.denom).toBe("OSMO");
    expect(gasCost?.address).toBe("uosmo");
  });

  it("should fetch and return the correct skip asset", async () => {
    const skipAsset = await provider.getAsset(
      {
        chainId: 1,
        chainName: "Ethereum",
        chainType: "evm",
      },
      {
        denom: "USDC",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
      }
    );

    expect(skipAsset).toBeDefined();
    expect(skipAsset?.denom).toBe("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  });

  it("should fetch and cache skip assets", async () => {
    const chainID = "1";
    const assets = await provider.getAssets(chainID);

    expect(assets).toBeDefined();
    expect(assets[chainID].assets.length).toBeGreaterThan(0);
  });

  it("should fetch and cache chains", async () => {
    const chains = await provider.getChains();

    expect(chains).toBeDefined();
    expect(chains.length).toBeGreaterThan(0);
  });

  it("should generate correct address list for EVM chains", async () => {
    const chainIDs = ["1"];
    const fromAddress = "0xabc";
    const toAddress = "0xdef";
    const fromChain: BridgeChain = {
      chainId: 1,
      chainName: "Ethereum",
      chainType: "evm",
    };
    const toChain: BridgeChain = {
      chainId: 1,
      chainName: "Ethereum",
      chainType: "evm",
    };

    const addressList = await provider.getAddressList(
      chainIDs,
      fromAddress,
      toAddress,
      fromChain,
      toChain
    );

    expect(addressList).toEqual([fromAddress, toAddress]);
  });

  it("should return correct finality time for known chain IDs", () => {
    const finalityTime = provider.getFinalityTimeForChain("1");

    expect(finalityTime).toBe(960);
  });

  it("should return default finality time for unknown chain IDs", () => {
    const finalityTime = provider.getFinalityTimeForChain("999");

    expect(finalityTime).toBe(1);
  });

  it("should generate approval transaction request if needed", async () => {
    const chainID = "1";
    const tokenAddress = "0x123";
    const owner = "0xabc";
    const spender = "0xdef";
    const amount = "1000";

    const approvalTxRequest = await provider.getApprovalTransactionRequest(
      chainID,
      tokenAddress,
      owner,
      spender,
      amount
    );

    expect(approvalTxRequest).toBeDefined();
    expect(approvalTxRequest?.to).toBe(tokenAddress);
    expect(approvalTxRequest?.data).toBeDefined();
  });

  it("should not generate approval transaction request if allowance is sufficient", async () => {
    const chainID = "1";
    const tokenAddress = "0x123";
    const owner = "0xabc";
    const spender = "0xdef";
    const amount = "1";

    const approvalTxRequest = await provider.getApprovalTransactionRequest(
      chainID,
      tokenAddress,
      owner,
      spender,
      amount
    );

    expect(approvalTxRequest).toBeUndefined();
  });

  describe("getSupportedAssets", () => {
    it("gets shared origin assets", async () => {
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
      });

      expect(sourceVariants).toEqual([
        {
          address: "uusdc",
          chainId: "noble-1",
          chainType: "cosmos",
          decimals: 6,
          denom: "USDC",
        },
        {
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          chainId: 1,
          chainType: "evm",
          decimals: 6,
          denom: "USDC",
        },
        {
          address:
            "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9",
          chainId: "agoric-3",
          chainType: "cosmos",
          denom: "USDC",
          decimals: 6,
        },
        {
          address:
            "ibc/43897B9739BD63E3A08A88191999C632E052724AB96BD4C74AE31375C991F48D",
          chainId: "archway-1",
          chainType: "cosmos",
          denom: "USDC",
          decimals: 6,
        },
      ]);
    });

    it("includes skip supported cosmos counterparty assets from asset list", async () => {
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
      });

      // makes sure that the first variants are sourced from counterparty array
      expect(sourceVariants[0]).toEqual({
        address: "uusdc",
        chainId: "noble-1",
        chainType: "cosmos",
        decimals: 6,
        denom: "USDC",
      });
    });

    it("includes skip supported evm counterparty assets from asset list", async () => {
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
      });

      // makes sure that the first variants are sourced from counterparty array
      expect(sourceVariants[1]).toEqual({
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        chainId: 1,
        chainType: "evm",
        decimals: 6,
        denom: "USDC",
      });
    });
  });
});

describe("SkipBridgeProvider.getExternalUrl", () => {
  let provider: SkipBridgeProvider;
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
    provider = new SkipBridgeProvider(ctx);
  });

  it("should generate the correct URL for given parameters", async () => {
    const expectedUrl =
      "https://go.skip.build/?src_chain=cosmoshub-4&src_asset=uatom&dest_chain=agoric-3&dest_asset=ubld";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: "cosmoshub-4", chainType: "cosmos" },
      toChain: { chainId: "agoric-3", chainType: "cosmos" },
      fromAsset: {
        address: "uatom",
        denom: "uatom",
        decimals: 6,
      },
      toAsset: {
        address: "ubld",
        denom: "ubld",
        decimals: 6,
      },
      toAddress: "cosmos1...",
    });

    expect(result?.urlProviderName).toBe("Skip.Go");
    expect(result?.url.toString()).toBe(expectedUrl);
  });

  it("should encode asset addresses correctly", async () => {
    const expectedUrl =
      "https://go.skip.build/?src_chain=akashnet-2&src_asset=ibc%2F2e5d0ac026ac1afa65a23023ba4f24bb8ddf94f118edc0bad6f625bfc557cded&dest_chain=andromeda-1&dest_asset=ibc%2F976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: "akashnet-2", chainType: "cosmos" },
      toChain: { chainId: "andromeda-1", chainType: "cosmos" },
      fromAsset: {
        address:
          "ibc/2e5d0ac026ac1afa65a23023ba4f24bb8ddf94f118edc0bad6f625bfc557cded",
        denom: "AKT",
        decimals: 6,
      },
      toAsset: {
        address:
          "ibc/976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97",
        denom: "ANDR",
        decimals: 6,
      },
      toAddress: "cosmos1...",
    });

    expect(result?.urlProviderName).toBe("Skip.Go");
    expect(result?.url.toString()).toBe(expectedUrl);
  });

  it("should handle numeric chain IDs correctly", async () => {
    const expectedUrl =
      "https://go.skip.build/?src_chain=42161&src_asset=0xff970a61a04b1ca14834a43f5de4533ebddb5cc8&dest_chain=andromeda-1&dest_asset=ibc%2F976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 42161, chainType: "evm" },
      toChain: { chainId: "andromeda-1", chainType: "cosmos" },
      fromAsset: {
        address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        decimals: 18,
        denom: "USDC",
      },
      toAsset: {
        address:
          "ibc/976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97",
        decimals: 18,
        denom: "USDC",
      },
      toAddress: "cosmos1...",
    });

    expect(result?.urlProviderName).toBe("Skip.Go");
    expect(result?.url.toString()).toBe(expectedUrl);
  });
});

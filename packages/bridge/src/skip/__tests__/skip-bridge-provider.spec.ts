import { estimateGasFee } from "@osmosis-labs/tx";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { MockAssetLists } from "../../__tests__/mock-asset-lists";
import { server } from "../../__tests__/msw";
import {
  BridgeAsset,
  BridgeChain,
  BridgeProviderContext,
  BridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetBridgeQuoteParams,
} from "../../interface";
import { SkipBridgeProvider } from "..";
import { SkipMsg } from "../types";

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
    rest.get("https://api.skip.money/v1/fungible/assets", (_req, res, ctx) => {
      return res(
        ctx.json({
          chain_to_assets_map: {
            "1": {
              assets: [
                {
                  denom: "asset1",
                  chain_id: "1",
                  origin_denom: "asset1",
                  origin_chain_id: "1",
                  trace: "",
                  is_cw20: false,
                  symbol: "AS1",
                  name: "Asset 1",
                  logo_uri: "http://example.com/logo1.png",
                  decimals: 18,
                  token_contract: "0x123",
                  description: "Description of asset1",
                  coingecko_id: "asset1",
                  recommended_symbol: "AS1",
                },
                {
                  denom: "asset2",
                  chain_id: "1",
                  origin_denom: "asset2",
                  origin_chain_id: "1",
                  trace: "",
                  is_cw20: false,
                  symbol: "AS2",
                  name: "Asset 2",
                  logo_uri: "http://example.com/logo2.png",
                  decimals: 18,
                  token_contract: "0x456",
                  description: "Description of asset2",
                  coingecko_id: "asset2",
                  recommended_symbol: "AS2",
                },
                {
                  denom: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                  chain_id: "1",
                  origin_denom: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                  origin_chain_id: "1",
                  trace: "",
                  is_cw20: false,
                  is_evm: true,
                  is_svm: false,
                  symbol: "USDC",
                  name: "USD Coin",
                  logo_uri:
                    "https://raw.githubusercontent.com/axelarnetwork/axelar-configs/main/images/tokens/usdc.svg",
                  decimals: 6,
                  token_contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                  coingecko_id: "usd-coin",
                  recommended_symbol: "USDC",
                },
              ],
            },
            "osmosis-1": {
              assets: [
                {
                  denom:
                    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
                  chain_id: "osmosis-1",
                  origin_denom: "uusdc",
                  origin_chain_id: "noble-1",
                  trace: "transfer/channel-750",
                  is_cw20: false,
                  is_evm: false,
                  is_svm: false,
                  symbol: "USDC",
                  name: "USDC",
                  logo_uri:
                    "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
                  decimals: 6,
                  description:
                    "USDC is a fully collateralized US Dollar stablecoin developed by CENTRE, the open source project with Circle being the first of several forthcoming issuers.",
                  coingecko_id: "usd-coin",
                  recommended_symbol: "USDC",
                },
              ],
            },
            "agoric-3": {
              assets: [
                {
                  denom:
                    "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9",
                  chain_id: "agoric-3",
                  origin_denom: "uusdc",
                  origin_chain_id: "noble-1",
                  trace: "transfer/channel-62",
                  is_cw20: false,
                  is_evm: false,
                  is_svm: false,
                  symbol: "USDC",
                  name: "USDC",
                  logo_uri:
                    "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
                  decimals: 6,
                  coingecko_id: "usd-coin",
                  recommended_symbol: "USDC",
                },
              ],
            },
            "archway-1": {
              assets: [
                {
                  denom:
                    "ibc/43897B9739BD63E3A08A88191999C632E052724AB96BD4C74AE31375C991F48D",
                  chain_id: "archway-1",
                  origin_denom: "uusdc",
                  origin_chain_id: "noble-1",
                  trace: "transfer/channel-29",
                  is_cw20: false,
                  is_evm: false,
                  is_svm: false,
                  symbol: "USDC",
                  name: "USDC",
                  logo_uri:
                    "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
                  decimals: 6,
                  description: "Native Coin",
                  coingecko_id: "usd-coin",
                  recommended_symbol: "USDC",
                },
              ],
            },
            "noble-1": {
              assets: [
                {
                  denom: "uusdc",
                  chain_id: "noble-1",
                  origin_denom: "uusdc",
                  origin_chain_id: "noble-1",
                  trace: "",
                  is_cw20: false,
                  is_evm: false,
                  is_svm: false,
                  symbol: "USDC",
                  name: "USDC",
                  logo_uri:
                    "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
                  decimals: 6,
                  description: "USD Coin",
                  coingecko_id: "usd-coin",
                  recommended_symbol: "USDC",
                },
              ],
            },
          },
        })
      );
    }),
    rest.get("https://api.skip.money/v1/info/chains", (_req, res, ctx) => {
      return res(
        ctx.json({
          chains: [
            {
              chain_name: "Ethereum",
              chain_id: "1",
              pfm_enabled: true,
              cosmos_sdk_version: "0.42.0",
              supports_memo: true,
              logo_uri: "http://example.com/eth.png",
              bech32_prefix: "cosmos",
              chain_type: "evm",
            },
          ],
        })
      );
    }),
    rest.post("https://api.skip.money/v2/fungible/route", (_req, res, ctx) => {
      return res(
        ctx.json({
          source_asset_denom: "asset1",
          source_asset_chain_id: "1",
          dest_asset_denom: "asset2",
          dest_asset_chain_id: "1",
          amount_in: "1000",
          amount_out: "1000",
          operations: [],
          chain_ids: ["1"],
          does_swap: false,
          txs_required: 1,
        })
      );
    }),
    rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) => {
      return res(
        ctx.json({
          msgs: [
            {
              evm_tx: {
                chain_id: "1",
                to: "0x123",
                value: "1000",
                data: "abcdef",
                required_erc20_approvals: [],
              },
            },
          ],
        })
      );
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

  it("should get a quote", async () => {
    const params: GetBridgeQuoteParams = {
      fromAmount: "1000",
      fromAsset: {
        denom: "asset1",
        address: "0x123",
        decimals: 18,
        sourceDenom: "asset1",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toAsset: {
        denom: "asset2",
        address: "0x456",
        decimals: 18,
        sourceDenom: "asset2",
      },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      fromAddress: "0xabc",
      toAddress: "0xdef",
      slippage: 0.01,
    };

    const quote = await provider.getQuote(params);

    expect(quote).toBeDefined();
    expect(quote).toEqual({
      input: {
        amount: "1000",
        denom: "asset1",
        sourceDenom: "asset1",
        decimals: 18,
      },
      expectedOutput: {
        amount: "1000",
        denom: "asset2",
        sourceDenom: "asset2",
        decimals: 18,
        priceImpact: "0",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      transferFee: {
        amount: "0",
        denom: "asset1",
        sourceDenom: "asset1",
        decimals: 18,
      },
      estimatedTime: 960,
      transactionRequest: {
        type: "evm",
        to: "0x123",
        data: "0xabcdef",
        value: "0x3e8",
        approvalTransactionRequest: undefined,
      },
      estimatedGasFee: {
        amount: "420000000000000",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "ETH",
      },
    });
  });

  it("should handle unsupported asset error", async () => {
    server.use(
      rest.get(
        "https://api.skip.money/v1/fungible/assets",
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
        sourceDenom: "asset1",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toAsset: {
        denom: "asset2",
        address: "0x456",
        decimals: 18,
        sourceDenom: "asset2",
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
        sourceDenom: "asset1",
      },
      fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
      toAsset: {
        denom: "asset2",
        address: "0x456",
        decimals: 18,
        sourceDenom: "asset2",
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
        sourceDenom: "asset1",
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
        sourceDenom: "asset2",
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
    expect(gasCost?.sourceDenom).toBe("uosmo");
  });

  it("should fetch and return the correct skip asset", async () => {
    const chain: BridgeChain = {
      chainId: 1,
      chainName: "Ethereum",
      chainType: "evm",
    };
    const asset: BridgeAsset = {
      denom: "asset1",
      address: "0x123",
      decimals: 18,
      sourceDenom: "asset1",
    };

    const skipAsset = await provider.getAsset(chain, asset);

    expect(skipAsset).toBeDefined();
    expect(skipAsset?.denom).toBe("asset1");
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

    expect(addressList).toEqual([fromAddress]);
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
          sourceDenom: "uusdc",
        },
      });

      expect(sourceVariants).toEqual([
        {
          address: "uusdc",
          chainId: "noble-1",
          chainType: "cosmos",
          decimals: 6,
          denom: "USDC",
          sourceDenom: "uusdc",
        },
        {
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          chainId: 1,
          chainType: "evm",
          decimals: 6,
          denom: "USDC",
          sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        },
        {
          address:
            "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9",
          chainId: "agoric-3",
          chainType: "cosmos",
          denom: "USDC",
          sourceDenom: "uusdc",
          decimals: 6,
        },
        {
          address:
            "ibc/43897B9739BD63E3A08A88191999C632E052724AB96BD4C74AE31375C991F48D",
          chainId: "archway-1",
          chainType: "cosmos",
          denom: "USDC",
          sourceDenom: "uusdc",
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
          sourceDenom: "uusdc",
        },
      });

      // makes sure that the first variants are sourced from counterparty array
      expect(sourceVariants[0]).toEqual({
        address: "uusdc",
        chainId: "noble-1",
        chainType: "cosmos",
        decimals: 6,
        denom: "USDC",
        sourceDenom: "uusdc",
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
          sourceDenom: "uusdc",
        },
      });

      // makes sure that the first variants are sourced from counterparty array
      expect(sourceVariants[1]).toEqual({
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        chainId: 1,
        chainType: "evm",
        decimals: 6,
        denom: "USDC",
        sourceDenom: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
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
      "https://ibc.fun/?src_chain=cosmoshub-4&src_asset=uatom&dest_chain=agoric-3&dest_asset=ubld";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: "cosmoshub-4", chainType: "cosmos" },
      toChain: { chainId: "agoric-3", chainType: "cosmos" },
      fromAsset: {
        address: "uatom",
        denom: "uatom",
        decimals: 6,
        sourceDenom: "uatom",
      },
      toAsset: {
        address: "ubld",
        denom: "ubld",
        decimals: 6,
        sourceDenom: "ubld",
      },
      toAddress: "cosmos1...",
    });

    expect(result?.urlProviderName).toBe("IBC.fun");
    expect(result?.url.toString()).toBe(expectedUrl);
  });

  it("should encode asset addresses correctly", async () => {
    const expectedUrl =
      "https://ibc.fun/?src_chain=akashnet-2&src_asset=ibc%2F2e5d0ac026ac1afa65a23023ba4f24bb8ddf94f118edc0bad6f625bfc557cded&dest_chain=andromeda-1&dest_asset=ibc%2F976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: "akashnet-2", chainType: "cosmos" },
      toChain: { chainId: "andromeda-1", chainType: "cosmos" },
      fromAsset: {
        address:
          "ibc/2e5d0ac026ac1afa65a23023ba4f24bb8ddf94f118edc0bad6f625bfc557cded",
        denom: "AKT",
        decimals: 6,
        sourceDenom:
          "ibc/2e5d0ac026ac1afa65a23023ba4f24bb8ddf94f118edc0bad6f625bfc557cded",
      },
      toAsset: {
        address:
          "ibc/976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97",
        denom: "ANDR",
        decimals: 6,
        sourceDenom:
          "ibc/976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97",
      },
      toAddress: "cosmos1...",
    });

    expect(result?.urlProviderName).toBe("IBC.fun");
    expect(result?.url.toString()).toBe(expectedUrl);
  });

  it("should handle numeric chain IDs correctly", async () => {
    const expectedUrl =
      "https://ibc.fun/?src_chain=42161&src_asset=0xff970a61a04b1ca14834a43f5de4533ebddb5cc8&dest_chain=andromeda-1&dest_asset=ibc%2F976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97";
    const result = await provider.getExternalUrl({
      fromChain: { chainId: 42161, chainType: "evm" },
      toChain: { chainId: "andromeda-1", chainType: "cosmos" },
      fromAsset: {
        address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        decimals: 18,
        denom: "USDC",
        sourceDenom: "USDC",
      },
      toAsset: {
        address:
          "ibc/976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97",
        decimals: 18,
        denom: "USDC",
        sourceDenom: "USDC",
      },
      toAddress: "cosmos1...",
    });

    expect(result?.urlProviderName).toBe("IBC.fun");
    expect(result?.url.toString()).toBe(expectedUrl);
  });
});

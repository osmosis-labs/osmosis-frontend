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
});

afterEach(() => {
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

  it("should estimate gas cost", async () => {
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

  describe("getAvailableSourceAssetVariants", () => {});
});

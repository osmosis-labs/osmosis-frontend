import { estimateGasFee } from "@osmosis-labs/tx";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";
// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";
import { createPublicClient } from "viem";

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
  USDC_EthereumToOsmosisAlloy_MultiTxMsgs,
  USDC_EthereumToOsmosisAlloy_MultiTxRoute,
} from "./mocks";

jest.mock("viem", () => ({
  ...jest.requireActual("viem"),
  createPublicClient: jest.fn().mockImplementation(() => ({
    estimateGas: jest.fn().mockResolvedValue(BigInt("21000")),
    request: jest.fn().mockResolvedValue("0x4a817c800"),
    getGasPrice: jest.fn().mockResolvedValue(BigInt("20000000000")),
    estimateFeesPerGas: jest.fn().mockResolvedValue({
      maxFeePerGas: BigInt("40000000000"),
      maxPriorityFeePerGas: BigInt("1000000000"),
    }),
    readContract: jest.fn().mockResolvedValue(BigInt("100")),
  })),
  encodeFunctionData: jest.fn().mockReturnValue("0xabcdef"),
  encodePacked: jest.fn().mockReturnValue("0xabcdef"),
  keccak256: jest.fn().mockReturnValue("0xabcdef"),
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
    expect(quote).toMatchObject({
      input: {
        amount: "10000000000000000000",
        denom: "ETH",
        coinGeckoId: "axlweth",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
      },
      expectedOutput: {
        amount: "9992274579512577377",
        denom: "WETH",
        coinGeckoId: "weth",
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
        coinGeckoId: undefined,
        chainId: 1,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
        // Cosmos-source: no explicit fee_behavior and not EVM-source,
        // so the fee is treated as deducted from the transferred amount
        isAdditive: false,
      },
      estimatedTime: 30,
      transactionRequest: {
        type: "cosmos",
        msgs: [
          {
            typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
            value: {
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
              timeoutTimestamp: 1718978568036848600,
              memo: '{"destination_chain":"Ethereum","destination_address":"0xD397883c12b71ea39e0d9f6755030205f31A1c96","payload":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,99,236,5,177,35,136,92,118,9,176,92,53,223,119,127,63,24,2,88],"type":2,"fee":{"amount":"7725420487422623","recipient":"axelar1aythygn6z5thymj6tmzfwekzh05ewg3l7d6y89"}}',
            },
          },
        ],
        gasFee: {
          amount: "1232",
          denom: "uosmo",
          gas: "420000",
        },
      },
      estimatedGasFee: {
        amount: "1232",
        denom: "OSMO",
        coinGeckoId: "osmosis",
        decimals: 6,
        address: "uosmo",
        gas: "420000",
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
        coinGeckoId: "weth",
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        decimals: 18,
      },
      expectedOutput: {
        amount: "10000000000000000000",
        denom: "ETH",
        coinGeckoId: "axlweth",
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
        coinGeckoId: undefined,
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        // EVM-source with no explicit fee_behavior in the route's
        // estimated_fees: assumed additive per Skip's documented fee model
        isAdditive: true,
      },
      estimatedTime: 30,
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
        // 21000 gas * 40 gwei maxFeePerGas — the wallet's worst-case
        // (EIP-1559) price, not the legacy 20 gwei gasPrice
        amount: "840000000000000",
        denom: "ETH",
        decimals: 18,
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      },
    });
  });

  // the Axelar BRIDGE fee entry Skip returns for the
  // ETH_EthereumToOsmosis_Route mock (fee_behavior varies per test)
  const axelarBridgeFee = {
    fee_type: "BRIDGE",
    bridge_id: "AXELAR",
    // matches the axelar_transfer op's fee_amount in the route mock
    amount: "73924361079993",
    usd_amount: "0.26",
    origin_asset: {
      denom: "ethereum-native",
      chain_id: "1",
      origin_denom: "ethereum-native",
      origin_chain_id: "1",
      trace: "",
      is_cw20: false,
      is_evm: true,
      is_svm: false,
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      coingecko_id: "ethereum",
    },
    chain_id: "1",
    tx_index: 0,
  };

  const ethereumToOsmosisQuoteParams: GetBridgeQuoteParams = {
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
  };

  const useEthereumToOsmosisRouteWithFeeBehavior = (fee_behavior: string) =>
    server.use(
      rest.post("https://api.skip.money/v2/fungible/route", (_req, res, ctx) =>
        res(
          ctx.json({
            ...ETH_EthereumToOsmosis_Route,
            estimated_fees: [{ ...axelarBridgeFee, fee_behavior }],
          })
        )
      ),
      rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) =>
        res(ctx.json(ETH_EthereumToOsmosis_Msgs))
      )
    );

  it("flags the transfer fee as additive when Skip reports FEE_BEHAVIOR_ADDITIONAL", async () => {
    useEthereumToOsmosisRouteWithFeeBehavior("FEE_BEHAVIOR_ADDITIONAL");

    const quote = await provider.getQuote(ethereumToOsmosisQuoteParams);

    expect(quote.transferFee.isAdditive).toBe(true);
  });

  it("trusts an explicit FEE_BEHAVIOR_DEDUCTED over the EVM additive default", async () => {
    useEthereumToOsmosisRouteWithFeeBehavior("FEE_BEHAVIOR_DEDUCTED");

    const quote = await provider.getQuote(ethereumToOsmosisQuoteParams);

    expect(quote.transferFee.isAdditive).toBe(false);
  });

  it("falls back to additive on EVM sources when fee_behavior is FEE_BEHAVIOR_UNSPECIFIED", async () => {
    useEthereumToOsmosisRouteWithFeeBehavior("FEE_BEHAVIOR_UNSPECIFIED");

    const quote = await provider.getQuote(ethereumToOsmosisQuoteParams);

    expect(quote.transferFee.isAdditive).toBe(true);
  });

  it("ignores non-bridge fee_behavior entries when flagging the transfer fee", async () => {
    server.use(
      rest.post("https://api.skip.money/v2/fungible/route", (_req, res, ctx) =>
        res(
          ctx.json({
            ...ETH_OsmosisToEthereum_Route,
            estimated_fees: [
              {
                // an additive relay fee must not mark the (deducted)
                // Cosmos-source bridge fee as additive
                fee_type: "SMART_RELAY",
                bridge_id: "IBC",
                amount: "100",
                usd_amount: "0.01",
                origin_asset: {
                  denom: "uosmo",
                  chain_id: "osmosis-1",
                  origin_denom: "uosmo",
                  origin_chain_id: "osmosis-1",
                  trace: "",
                  is_cw20: false,
                  is_evm: false,
                  is_svm: false,
                  symbol: "OSMO",
                  name: "Osmosis",
                  decimals: 6,
                  coingecko_id: "osmosis",
                },
                chain_id: "osmosis-1",
                tx_index: 0,
                fee_behavior: "FEE_BEHAVIOR_ADDITIONAL",
              },
            ],
          })
        )
      ),
      rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) =>
        res(ctx.json(ETH_OsmosisToEthereum_Msgs))
      )
    );

    (estimateGasFee as jest.Mock).mockResolvedValue({
      gas: "420000",
      amount: [{ denom: "uosmo", amount: "1232" }],
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

    expect(quote.transferFee.isAdditive).toBe(false);
  });

  it("should handle unsupported asset error", async () => {
    // the global fixture serves a POPULATED chain-1 registry that simply
    // lacks the requested asset: that is what "unsupported" means. (An
    // empty chain asset list is the degraded-registry shape and is
    // rejected by the cache guard instead.)
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

    const gasCost = await provider.estimateGasFee(params, txData);

    expect(gasCost).toBeDefined();
    expect(gasCost?.amount).toBeDefined();
    expect(gasCost?.denom).toBe("ETH");

    // The sender's balance is overridden so estimation succeeds even when
    // the wallet can't currently fund value + fee (max-amount inputs).
    const client = (createPublicClient as jest.Mock).mock.results.at(-1)?.value;
    expect(client.estimateGas).toHaveBeenCalledWith(
      expect.objectContaining({
        stateOverride: [
          {
            address: "0xabc",
            balance: BigInt("0x3e8") + BigInt("1000000000000000000"),
          },
        ],
      })
    );
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
      msgs: [
        {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: {
            // mock data
            source_channel: "channel-123",
            source_port: "port-123",
            sender: "osmo1ABC123",
            receiver: "0xdef",
            denom: "asset1",
            amount: "1000",
          },
        },
      ],
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

    const gasCost = await provider.estimateGasFee(params, txData);

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

  it("should generate multi hop IBC addresses", async () => {
    const chainIDs = ["dydx-mainnet-1", "noble-1", "osmosis-1"];
    const fromAddress = "dydx1ckgqk0nfqaqs32rv4akjqkcl9754ylwrhj2r0j";
    const toAddress = "osmo1ckgqk0nfqaqs32rv4akjqkcl9754ylwrkshheh";
    const fromChain: BridgeChain = {
      chainId: "dydx-mainnet-1",
      chainName: "dydx",
      chainType: "cosmos",
    };
    const toChain: BridgeChain = {
      chainId: "osmosis-1",
      chainName: "osmosis",
      chainType: "cosmos",
    };

    const addressList = await provider.getAddressList(
      chainIDs,
      fromAddress,
      toAddress,
      fromChain,
      toChain
    );

    expect(addressList).toEqual([
      fromAddress,
      "noble1ckgqk0nfqaqs32rv4akjqkcl9754ylwrkg30ht",
      toAddress,
    ]);
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
        direction: "deposit",
      });

      expect(sourceVariants).toEqual([
        {
          address: "uusdc",
          chainId: "noble-1",
          chainType: "cosmos",
          coinGeckoId: "usd-coin",
          decimals: 6,
          denom: "USDC",
          transferTypes: ["quote"],
        },
        {
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          chainId: 1,
          chainType: "evm",
          coinGeckoId: "usd-coin",
          decimals: 6,
          denom: "USDC",
          transferTypes: ["quote"],
        },
        {
          address:
            "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9",
          chainId: "agoric-3",
          chainType: "cosmos",
          coinGeckoId: "usd-coin",
          denom: "USDC",
          decimals: 6,
          transferTypes: ["quote"],
        },
        {
          address:
            "ibc/43897B9739BD63E3A08A88191999C632E052724AB96BD4C74AE31375C991F48D",
          chainId: "archway-1",
          chainType: "cosmos",
          coinGeckoId: "usd-coin",
          denom: "USDC",
          decimals: 6,
          transferTypes: ["quote"],
        },
      ]);
    });

    it("does not mutate the shared asset list when computing variants", async () => {
      const request = {
        chain: {
          chainId: "osmosis-1",
          chainType: "cosmos" as const,
        },
        asset: {
          denom: "USDC",
          address:
            "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          decimals: 6,
        },
        direction: "deposit" as const,
      };

      const assetListAsset = ctx.assetLists
        .flatMap(({ assets }) => assets)
        .find((a) => a.coinMinimalDenom === request.asset.address)!;
      const counterpartyCountBefore = assetListAsset.counterparty.length;

      const first = await provider.getSupportedAssets(request);
      // Aliasing the shared counterparty array previously doubled it on
      // every call until the variant spread threw, permanently emptying
      // results for the process.
      for (let i = 0; i < 5; i++) {
        await provider.getSupportedAssets(request);
      }
      const last = await provider.getSupportedAssets(request);

      expect(assetListAsset.counterparty.length).toBe(counterpartyCountBefore);
      expect(last).toEqual(first);
    });

    it("should not return shared origin assets where the origin chain Packet Forward Middleware (PFM) is disabled", async () => {
      server.use(
        rest.get("https://api.skip.money/v2/info/chains", (_req, res, ctx) => {
          const modifiedSkipChains = SkipChains.chains.map((chain) => {
            if (chain.chain_id === "noble-1") {
              return { ...chain, pfm_enabled: false };
            }
            return chain;
          });
          return res(ctx.json({ ...SkipChains, chains: modifiedSkipChains }));
        })
      );

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
          address: "uusdc",
          chainId: "noble-1",
          chainType: "cosmos",
          coinGeckoId: "usd-coin",
          decimals: 6,
          denom: "USDC",
          transferTypes: ["quote"],
        },
        {
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          chainId: 1,
          chainType: "evm",
          coinGeckoId: "usd-coin",
          decimals: 6,
          denom: "USDC",
          transferTypes: ["quote"],
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
        direction: "deposit",
      });

      // makes sure that the first variants are sourced from counterparty array
      expect(sourceVariants[0]).toEqual({
        address: "uusdc",
        chainId: "noble-1",
        chainType: "cosmos",
        coinGeckoId: "usd-coin",
        decimals: 6,
        denom: "USDC",
        transferTypes: ["quote"],
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
        direction: "deposit",
      });

      // makes sure that the first variants are sourced from counterparty array
      expect(sourceVariants[1]).toEqual({
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        chainId: 1,
        chainType: "evm",
        coinGeckoId: "usd-coin",
        decimals: 6,
        denom: "USDC",
        transferTypes: ["quote"],
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

    expect(result?.urlProviderName).toBe("Skip:Go");
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

    expect(result?.urlProviderName).toBe("Skip:Go");
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

    expect(result?.urlProviderName).toBe("Skip:Go");
    expect(result?.url.toString()).toBe(expectedUrl);
  });
});

describe("SkipBridgeProvider multi-tx routes", () => {
  let provider: SkipBridgeProvider;
  let ctx: BridgeProviderContext;

  const multiTxQuoteParams: GetBridgeQuoteParams = {
    fromAmount: "1000000000",
    fromAsset: {
      denom: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    fromChain: { chainId: 1, chainName: "Ethereum", chainType: "evm" },
    toAsset: {
      denom: "USDC",
      address:
        "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC",
      decimals: 6,
    },
    toChain: {
      chainId: "osmosis-1",
      chainName: "osmosis",
      chainType: "cosmos",
    },
    fromAddress: "0x7863Ec05b123885c7609B05c35Df777F3F180258",
    toAddress: "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
    slippage: 0.01,
  };
  /** The fixture msgs' noble sender: bech32 conversion of `toAddress`. */
  const nobleAddress = "noble107vyuer6wzfe7nrrsujppa0pvx35fvplpddx96";
  /** The quote's stored route data, replayed when rebuilding a step. */
  const multiTxRouteData = {
    source_asset_denom:
      USDC_EthereumToOsmosisAlloy_MultiTxRoute.source_asset_denom,
    source_asset_chain_id:
      USDC_EthereumToOsmosisAlloy_MultiTxRoute.source_asset_chain_id,
    dest_asset_denom: USDC_EthereumToOsmosisAlloy_MultiTxRoute.dest_asset_denom,
    dest_asset_chain_id:
      USDC_EthereumToOsmosisAlloy_MultiTxRoute.dest_asset_chain_id,
    amount_in: USDC_EthereumToOsmosisAlloy_MultiTxRoute.amount_in,
    amount_out: USDC_EthereumToOsmosisAlloy_MultiTxRoute.amount_out,
    operations: USDC_EthereumToOsmosisAlloy_MultiTxRoute.operations,
    required_chain_addresses:
      USDC_EthereumToOsmosisAlloy_MultiTxRoute.required_chain_addresses,
  };

  /** Mirrors the live API: a single-tx-only request fails with the
   *  "no single-tx routes" error; only allow_multi_tx returns the route. */
  const useSingleTxRejectingRouteHandler = (
    routeBodies?: Record<string, unknown>[]
  ) => {
    server.use(
      rest.post(
        "https://api.skip.money/v2/fungible/route",
        async (req, res, ctx) => {
          const body = await req.json();
          routeBodies?.push(body);
          if (!body.allow_multi_tx) {
            return res(
              ctx.status(404),
              ctx.json({
                code: 5,
                message:
                  "no single-tx routes found, to enable multi-tx routes set allow_multi_tx to true",
              })
            );
          }
          return res(ctx.json(USDC_EthereumToOsmosisAlloy_MultiTxRoute));
        }
      )
    );
  };

  beforeEach(() => {
    ctx = {
      env: "mainnet",
      cache: new LRUCache<string, CacheEntry>({
        max: 500,
      }),
      assetLists: MockAssetLists,
      // minimal chain registry data for the intermediate-chain key
      // derivation gate: noble is standard coin type 118
      chainList: [
        { chain_id: "noble-1", slip44: 118 },
        { chain_id: "osmosis-1", slip44: 118 },
      ] as BridgeProviderContext["chainList"],
      getTimeoutHeight: jest.fn().mockResolvedValue({
        revisionNumber: "1",
        revisionHeight: "1000",
      }),
    };
    provider = new SkipBridgeProvider(ctx);

    useSingleTxRejectingRouteHandler();
    server.use(
      rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) =>
        res(ctx.json(USDC_EthereumToOsmosisAlloy_MultiTxMsgs))
      )
    );

    // Gas estimation for the intermediate (noble-1) cosmos step
    (estimateGasFee as jest.Mock).mockResolvedValue({
      gas: "200000",
      amount: [
        {
          denom: "uusdc",
          amount: "20000",
        },
      ],
    });
  });

  it("builds ordered transaction steps for a 2-tx route", async () => {
    const quote = await provider.getQuote({
      ...multiTxQuoteParams,
      allowMultiTx: true,
    });

    expect(quote.transactionSteps).toHaveLength(2);
    const [step1, step2] = quote.transactionSteps!;

    expect(step1).toMatchObject({
      type: "evm",
      chainId: 1,
      to: "0xBd3fa81B58Ba92a82136038B25aDec7066af3155",
      // fixture allowance (100) < amount, so an approval is required
      approvalTransactionRequest: {
        to: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
    });

    expect(step2).toMatchObject({
      type: "cosmos",
      chainId: "noble-1",
      gasFee: { gas: "200000", denom: "uusdc", amount: "20000" },
    });
    if (step2.type !== "cosmos") throw new Error("expected cosmos step");
    expect(step2.msgs).toHaveLength(1);
    expect(step2.msgs[0].typeUrl).toBe(
      "/ibc.applications.transfer.v1.MsgTransfer"
    );
    expect(step2.msgs[0].value.sender).toBe(nobleAddress);
    expect(step2.msgs[0].value.token).toEqual({
      denom: "uusdc",
      amount: "999980000",
    });

    // the first step doubles as the plain transactionRequest so single-tx
    // consumers (gas estimation, review screen) see step 1
    expect(quote.transactionRequest?.type).toBe("evm");
    expect(quote.expectedOutput.amount).toBe("999960000");

    // the quoted route is snapshotted for later step rebuilds
    expect(quote.multiTxRouteData).toEqual(multiTxRouteData);

    // the noble step's fee is exposed for fee totals, with display metadata
    // resolved from Skip's asset registry
    expect(quote.intermediateGasFees).toEqual([
      {
        amount: "20000",
        denom: "USDC",
        address: "uusdc",
        decimals: 6,
        coinGeckoId: "usd-coin",
      },
    ]);
  });

  it("keeps a comparable single-tx route when multi-tx is allowed", async () => {
    const routeBodies: Record<string, unknown>[] = [];
    server.use(
      rest.post(
        "https://api.skip.money/v2/fungible/route",
        async (req, res, ctx) => {
          routeBodies.push(await req.json());
          // the same single-tx route exists with and without multi-tx
          // permission for this pair
          return res(ctx.json(ETH_EthereumToOsmosis_Route));
        }
      ),
      rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) =>
        res(ctx.json(ETH_EthereumToOsmosis_Msgs))
      )
    );

    const quote = await provider.getQuote({
      ...multiTxQuoteParams,
      fromAsset: {
        denom: "WETH",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
      },
      toAsset: {
        denom: "ETH",
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
      },
      allowMultiTx: true,
    });

    // both variants quoted in parallel, single-tx kept
    expect(routeBodies).toHaveLength(2);
    expect(routeBodies.filter((b) => b.allow_multi_tx === true)).toHaveLength(
      1
    );
    expect(quote.transactionSteps).toBeUndefined();
    expect(quote.multiTxRouteData).toBeUndefined();
  });

  it("prefers a meaningfully better multi-tx route over a lossy single-tx route", async () => {
    // Mirrors the live Avalanche USDC case: a single-tx axelar+swap route
    // exists but pays far less than the multi-tx CCTP route.
    const lossySingleTxRoute = {
      ...USDC_EthereumToOsmosisAlloy_MultiTxRoute,
      txs_required: 1,
      amount_out: "790000000", // 21% below the multi-tx route's 999960000
    };
    server.use(
      rest.post(
        "https://api.skip.money/v2/fungible/route",
        async (req, res, ctx) => {
          const body = await req.json();
          return res(
            ctx.json(
              body.allow_multi_tx
                ? USDC_EthereumToOsmosisAlloy_MultiTxRoute
                : lossySingleTxRoute
            )
          );
        }
      ),
      rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) =>
        res(ctx.json(USDC_EthereumToOsmosisAlloy_MultiTxMsgs))
      )
    );

    const quote = await provider.getQuote({
      ...multiTxQuoteParams,
      allowMultiTx: true,
    });

    expect(quote.transactionSteps).toHaveLength(2);
    expect(quote.expectedOutput.amount).toBe(
      USDC_EthereumToOsmosisAlloy_MultiTxRoute.amount_out
    );
  });

  it("keeps the single-tx route when the multi-tx route is only marginally better", async () => {
    const marginalSingleTxRoute = {
      ...USDC_EthereumToOsmosisAlloy_MultiTxRoute,
      txs_required: 1,
      amount_out: "999000000", // ~0.1% below multi's 999960000: inside the 0.5% threshold
    };
    server.use(
      rest.post(
        "https://api.skip.money/v2/fungible/route",
        async (req, res, ctx) => {
          const body = await req.json();
          return res(
            ctx.json(
              body.allow_multi_tx
                ? USDC_EthereumToOsmosisAlloy_MultiTxRoute
                : marginalSingleTxRoute
            )
          );
        }
      ),
      // a real single-tx route returns a single message
      rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) =>
        res(
          ctx.json({
            msgs: USDC_EthereumToOsmosisAlloy_MultiTxMsgs.msgs.slice(0, 1),
          })
        )
      )
    );

    const quote = await provider.getQuote({
      ...multiTxQuoteParams,
      allowMultiTx: true,
    });

    expect(quote.transactionSteps).toBeUndefined();
    expect(quote.expectedOutput.amount).toBe("999000000");
  });

  it("falls back to multi-tx only when no single-tx route exists (and only when enabled)", async () => {
    const routeBodies: Record<string, unknown>[] = [];
    useSingleTxRejectingRouteHandler(routeBodies);

    // disabled: the no-single-tx error surfaces as NoQuotesError
    await expect(provider.getQuote(multiTxQuoteParams)).rejects.toThrow(
      "no single-tx routes found"
    );
    expect(routeBodies).toHaveLength(1);
    expect(routeBodies[0]).not.toHaveProperty("allow_multi_tx");

    // enabled: both variants quoted in parallel, only multi-tx succeeds
    const quote = await provider.getQuote({
      ...multiTxQuoteParams,
      allowMultiTx: true,
    });
    expect(routeBodies).toHaveLength(3);
    expect(
      routeBodies.slice(1).filter((b) => b.allow_multi_tx === true)
    ).toHaveLength(1);
    expect(quote.transactionSteps).toHaveLength(2);
  });

  it("rejects the quote when an intermediate fee asset cannot be resolved", async () => {
    // Financial precision must come from metadata: an unresolved fee asset
    // must fail the quote rather than being valued with guessed decimals
    // (20000 uusdc read with 0 decimals displays as 20,000 USDC).
    const strippedAssets = {
      ...SkipAssets,
      chain_to_assets_map: {
        ...SkipAssets.chain_to_assets_map,
        "noble-1": {
          assets: SkipAssets.chain_to_assets_map["noble-1"].assets.filter(
            (a) => a.denom !== "uusdc"
          ),
        },
      },
    };
    server.use(
      rest.get("https://api.skip.money/v2/fungible/assets", (_req, res, ctx) =>
        res(ctx.json(strippedAssets))
      )
    );

    await expect(
      provider.getQuote({ ...multiTxQuoteParams, allowMultiTx: true })
    ).rejects.toThrow("Cannot resolve metadata for intermediate fee asset");
  });

  it("refuses a multi-tx route via an intermediate chain with non-118 key derivation", async () => {
    // e.g. Injective: ethsecp256k1 / coin type 60 — a bech32-converted
    // address there is NOT the user's account, and the first tx would
    // route funds through it
    ctx.chainList = [
      { chain_id: "noble-1", slip44: 60 },
      { chain_id: "osmosis-1", slip44: 118 },
    ] as BridgeProviderContext["chainList"];
    provider = new SkipBridgeProvider(ctx);

    await expect(
      provider.getQuote({ ...multiTxQuoteParams, allowMultiTx: true })
    ).rejects.toThrow("key derivation differs");
  });

  it("rebuilds an intermediate step from the stored route with the wallet's address", async () => {
    let msgsBody: { address_list: string[] } | undefined;
    let routeRequested = false;
    server.use(
      rest.post(
        "https://api.skip.money/v2/fungible/route",
        (_req, res, ctx) => {
          routeRequested = true;
          return res(ctx.status(500));
        }
      ),
      rest.post(
        "https://api.skip.money/v2/fungible/msgs",
        async (req, res, ctx) => {
          msgsBody = await req.json();
          return res(ctx.json(USDC_EthereumToOsmosisAlloy_MultiTxMsgs));
        }
      )
    );

    const step = await provider.getTransactionStep({
      ...multiTxQuoteParams,
      route: multiTxRouteData,
      step: { chainId: "noble-1", senderAddress: nobleAddress },
    });

    // the stored route is replayed — never re-routed after funds moved
    expect(routeRequested).toBe(false);

    // address list follows the stored required_chain_addresses (with the
    // repeated osmosis-1 entry), and the wallet-provided address replaces
    // the bech32-derived one on the step chain
    expect(msgsBody?.address_list).toEqual([
      "0x7863Ec05b123885c7609B05c35Df777F3F180258",
      nobleAddress,
      "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
      "osmo107vyuer6wzfe7nrrsujppa0pvx35fvplp4t7tx",
    ]);

    expect(step.type).toBe("cosmos");
    expect(step.msgs[0].value.sender).toBe(nobleAddress);
    expect(step.gasFee).toEqual({
      gas: "200000",
      denom: "uusdc",
      amount: "20000",
    });
  });

  it("rejects a step rebuild without stored route data", async () => {
    await expect(
      provider.getTransactionStep({
        ...multiTxQuoteParams,
        route: undefined,
        step: { chainId: "noble-1", senderAddress: nobleAddress },
      })
    ).rejects.toThrow("Missing or invalid multi-tx route data");
  });

  it("rejects a rebuilt step whose sender is not the wallet's address", async () => {
    await expect(
      provider.getTransactionStep({
        ...multiTxQuoteParams,
        route: multiTxRouteData,
        step: {
          chainId: "noble-1",
          senderAddress: "noble1someotheraccountaddressxxxxxxxxxxxxxxxx",
        },
      })
    ).rejects.toThrow("does not match wallet address");
  });

  it("rejects when the route no longer includes a step on the chain", async () => {
    server.use(
      rest.post("https://api.skip.money/v2/fungible/msgs", (_req, res, ctx) =>
        res(
          ctx.json({
            msgs: [USDC_EthereumToOsmosisAlloy_MultiTxMsgs.msgs[0]],
          })
        )
      )
    );

    await expect(
      provider.getTransactionStep({
        ...multiTxQuoteParams,
        route: multiTxRouteData,
        step: { chainId: "noble-1", senderAddress: nobleAddress },
      })
    ).rejects.toThrow("no longer includes a transaction on noble-1");
  });
});

describe("SkipBridgeProvider getSupportedAssets failure propagation", () => {
  it("rejects when the provider registry is unavailable", async () => {
    server.use(
      rest.get("https://api.skip.money/v2/fungible/assets", (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ message: "registry unavailable" }))
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
    const failingProvider = new SkipBridgeProvider(failingCtx);

    // A registry failure must reject rather than resolve to an empty list:
    // an empty list means "asset unsupported", which the client settles on
    // without retrying, while a rejected query is retried and re-polled.
    await expect(
      failingProvider.getSupportedAssets({
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

  it("resolves empty when the asset is not in the (healthy) registry", async () => {
    // registry responds fine (global fixture handlers); the asset is simply
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
    const healthyProvider = new SkipBridgeProvider(healthyCtx);

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

  it("rejects a scoped empty-chain response and recovers on the next populated one via the same cache", async () => {
    // the degraded shape observed in production: a scoped request answered
    // with the chain present but zero assets — it must be rejected (NOT
    // cached for 30 minutes), so a later healthy response recovers
    let assetRequests = 0;
    server.use(
      rest.get(
        "https://api.skip.money/v2/fungible/assets",
        (_req, res, ctx) => {
          assetRequests++;
          if (assetRequests === 1) {
            return res(
              ctx.json({
                chain_to_assets_map: { "osmosis-1": { assets: [] } },
              })
            );
          }
          return res(ctx.json(SkipAssets));
        }
      )
    );

    const sharedCacheCtx: BridgeProviderContext = {
      env: "mainnet",
      cache: new LRUCache<string, CacheEntry>({ max: 10 }),
      assetLists: MockAssetLists,
      chainList: [],
      getTimeoutHeight: jest.fn().mockResolvedValue({
        revisionNumber: "1",
        revisionHeight: "1000",
      }),
    };
    const sharedCacheProvider = new SkipBridgeProvider(sharedCacheCtx);

    const request = {
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
    } as const;

    await expect(
      sharedCacheProvider.getSupportedAssets(request)
    ).rejects.toThrow();

    const recovered = await sharedCacheProvider.getSupportedAssets(request);
    expect(recovered.length).toBeGreaterThan(0);
  });

  it("rejects (and does not cache) a degraded 200 registry response with an empty body", async () => {
    // a rate-limited or degraded upstream can answer 200 with an empty map;
    // treating that as truth would read as "asset unsupported" for the
    // 30-minute cache lifetime, silently bypassing the client's retry and
    // re-poll machinery
    server.use(
      rest.get("https://api.skip.money/v2/fungible/assets", (_req, res, ctx) =>
        res(ctx.json({ chain_to_assets_map: {} }))
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
    const degradedProvider = new SkipBridgeProvider(degradedCtx);

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

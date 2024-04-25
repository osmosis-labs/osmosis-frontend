import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { ChainList } from "~/config/generated/chain-list";

import { BridgeProviderContext, GetBridgeQuoteParams } from "../../types";
import { AxelarBridgeProvider } from "../axelar-bridge-provider";

const osmosisChain = ChainList[0];
const cosmosChain = ChainList[1];

describe("AxelarBridgeProvider", () => {
  let provider: AxelarBridgeProvider;
  let mockContext: BridgeProviderContext;

  beforeEach(() => {
    mockContext = {
      cache: new LRUCache<string, CacheEntry>({ max: 500 }),
      env: "testnet",
    };
    provider = new AxelarBridgeProvider(mockContext);
  });

  describe("getQuote", () => {
    it.only("should return a valid quote when parameters are correct", async () => {
      const params: GetBridgeQuoteParams = {
        fromAmount: "100",
        fromAsset: {
          denom: "ATOM",
          decimals: 6,
          sourceDenom: "uatom",
          address: "cosmos1...",
        },
        fromChain: {
          chainId: osmosisChain.chain_id,
          chainName: osmosisChain.chain_id,
          chainType: "cosmos",
        },
        fromAddress: "cosmos1...",
        toAddress: "eth1...",
        toAsset: {
          denom: "ETH",
          decimals: 18,
          sourceDenom: "wei",
          address: "0x...",
        },
        toChain: {
          chainId: "1",
          chainName: "Ethereum",
          chainType: "evm",
        },
      };

      const quote = await provider.getQuote(params);
      expect(quote).toBeDefined();
      expect(quote.input.amount).toEqual("100");
      expect(quote.transferFee.amount).toEqual("10");
    });

    it("should throw an error if the chain is unsupported", async () => {
      const params: GetBridgeQuoteParams = {
        fromAmount: "100",
        fromAsset: {
          denom: "XYZ",
          decimals: 6,
          sourceDenom: "uxyz",
          address: "cosmos1...",
        },
        fromChain: {
          chainId: cosmosChain.chain_id,
          chainName: cosmosChain.chain_name,
          chainType: "cosmos",
        },
        fromAddress: "cosmos1...",
        toAddress: "eth1...",
        toAsset: {
          denom: "ETH",
          decimals: 18,
          sourceDenom: "wei",
          address: "0x...",
        },
        toChain: {
          chainId: "1",
          chainName: "Ethereum",
          chainType: "evm",
        },
      };

      await expect(provider.getQuote(params)).rejects.toThrow(
        "Unsupported chain"
      );
    });
  });

  // Additional tests for other methods like getAxelarChainId, getDepositAddress, etc.
});

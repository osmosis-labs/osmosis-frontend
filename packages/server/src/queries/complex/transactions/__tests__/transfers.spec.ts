import { AssetList, Chain } from "@osmosis-labs/types";

import { AssetLists as MockAssetLists } from "../../../__tests__/mock-asset-lists";
import { MockChains } from "../../../__tests__/mock-chains";
import { Transaction } from "../../../data-services";
import { mapTransfers } from "../transfers";
import { IndexedTransferTxs } from "./transfer-fixtures";

const SKIP_OUTPUT_DENOM =
  "ibc/794C7D7F3B857713878A3A1927251FA6AC1EEE520424C1F6FAFE9BA26D476138";

// the Skip fixture swaps into an asset the mock asset list doesn't have
const assetLists: AssetList[] = MockAssetLists.map((list) => {
  if (list.chain_name !== "osmosis") return list;
  const template = list.assets.find((a) => a.symbol === "LUNC")!;
  return {
    ...list,
    assets: [
      ...list.assets,
      { ...template, coinMinimalDenom: SKIP_OUTPUT_DENOM, symbol: "TESTOUT" },
    ],
  };
});

// the fixtures transfer to/from chains the mock chain list doesn't have
const cloneChain = (
  chain_name: string,
  chain_id: string,
  bech32Prefix: string,
  prettyName: string
): Chain => ({
  ...MockChains.find((c) => c.chain_name === "cosmoshub")!,
  chain_name,
  chain_id,
  bech32Prefix,
  prettyName,
});
const chainList: Chain[] = [
  ...MockChains,
  cloneChain("noble", "noble-1", "noble", "Noble"),
  cloneChain("terra", "columbus-5", "terra", "Terra Classic"),
];

function map(tx: Transaction, address = senderOf(tx)) {
  return mapTransfers({ transactions: [tx], address, assetLists, chainList });
}

function senderOf(tx: Transaction) {
  return tx.messages.find((m) => m.sender)!.sender!;
}

describe("mapTransfers", () => {
  it("maps a plain IBC send to the next hop chain", () => {
    const [transfer] = map(IndexedTransferTxs.send);

    expect(transfer).toMatchObject({
      type: "bridge-transfer",
      direction: "withdraw",
      provider: "IBC",
      statusProvider: "Skip",
      status: "pending",
      sendTxHash: IndexedTransferTxs.send.hash,
      fromChain: { chainType: "cosmos", chainId: "osmosis-1" },
      toChain: { chainType: "cosmos", chainId: "noble-1", prettyName: "Noble" },
      fromAddress: "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj",
      toAddress: "noble1ze3f954mtj30st8dw2qhylfvvtdv5q6x86q7dw",
      fromAsset: {
        denom: "USDC",
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        decimals: 6,
        amount: "224893756165",
      },
      networkFee: { address: "uosmo", amount: "45000" },
    });
    expect(transfer.createdAtUnix).toBe(
      Math.floor(
        new Date(IndexedTransferTxs.send.blockTimestamp).getTime() / 1000
      )
    );
  });

  it("maps an IBC arrival to a settled deposit", () => {
    const address = "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj";
    const [transfer] = map(IndexedTransferTxs.recv, address);

    expect(transfer).toMatchObject({
      direction: "deposit",
      provider: "IBC",
      status: "success",
      fromChain: { chainId: "noble-1" },
      toChain: { chainId: "osmosis-1" },
      fromAddress: "noble1ze3f954mtj30st8dw2qhylfvvtdv5q6x86q7dw",
      toAddress: address,
      osmoBech32Address: address,
      fromAsset: { denom: "USDC", amount: "224867279694" },
    });
    expect(transfer.statusProvider).toBeUndefined();
  });

  it("maps a Skip swap_and_action to the final forward hop", () => {
    const [transfer] = map(IndexedTransferTxs.skip);

    expect(transfer).toMatchObject({
      direction: "withdraw",
      provider: "Skip",
      statusProvider: "Skip",
      fromChain: { chainId: "osmosis-1" },
      // osmosis -> injective -> terra (packet forward memo)
      toChain: { chainId: "columbus-5" },
      toAddress: "terra1gygragtv7rhv86scnq4lkw0kw499939qer9ur5",
      fromAsset: { denom: "LUNC" },
      toAsset: { denom: "TESTOUT", address: SKIP_OUTPUT_DENOM },
    });
  });

  it("maps an Axelar GMP transfer to the EVM destination", () => {
    const [transfer] = map(IndexedTransferTxs.gmp);

    expect(transfer).toMatchObject({
      direction: "withdraw",
      provider: "Squid",
      statusProvider: "Skip",
      toChain: { chainType: "evm", chainId: 8453, prettyName: "Base" },
      toAddress: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
    });
  });

  it("maps Squid's multicall contract to the EVM destination", () => {
    const [transfer] = map(IndexedTransferTxs.squid);

    expect(transfer).toMatchObject({
      direction: "withdraw",
      provider: "Squid",
      toChain: { chainType: "evm", chainId: 56 },
      fromAsset: { address: "uosmo", amount: "7000000" },
      toAsset: {
        address:
          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
      },
    });
  });

  it("marks a failed withdrawal as failed", () => {
    const [transfer] = map({ ...IndexedTransferTxs.send, code: 5 });
    expect(transfer.status).toBe("failed");
  });

  it("drops transfers sent by another address", () => {
    expect(map(IndexedTransferTxs.send, "osmo1someoneelse")).toEqual([]);
  });

  it("drops unrelated contract calls", () => {
    const tx: Transaction = {
      ...IndexedTransferTxs.skip,
      messages: [
        {
          ...IndexedTransferTxs.skip.messages[0],
          msg: { claim_rewards: {} },
        },
      ],
    };
    expect(map(tx)).toEqual([]);
  });

  it("drops transfers of unknown assets", () => {
    const tx: Transaction = {
      ...IndexedTransferTxs.send,
      messages: [
        {
          ...IndexedTransferTxs.send.messages[0],
          token: { denom: "ibc/UNKNOWN", amount: "1" },
        },
      ],
    };
    expect(map(tx)).toEqual([]);
  });
});

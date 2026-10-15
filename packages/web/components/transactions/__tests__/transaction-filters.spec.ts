import { Dec } from "@osmosis-labs/unit";

import { HistoryTransaction } from "~/hooks/use-transaction-history";

import {
  filterTransactions,
  TRANSACTION_KINDS,
  TransactionKind,
} from "../transaction-filters";

/** A CoinPretty-like token: `denom` and the display amount via `toDec`. */
const token = (denom: string, amount: string) => ({
  denom,
  toDec: () => new Dec(amount),
});

const swap = (
  id: string,
  [tokenIn, amountIn]: [string, string],
  [tokenOut, amountOut]: [string, string]
) =>
  ({
    __type: "transaction",
    id,
    hash: id,
    metadata: [
      {
        value: [
          {
            txInfo: {
              tokenIn: { token: token(tokenIn, amountIn) },
              tokenOut: { token: token(tokenOut, amountOut) },
            },
          },
        ],
      },
    ],
  }) as unknown as HistoryTransaction;

const transfer = ({
  sendTxHash,
  direction,
  asset,
  amount,
  decimals = 6,
  chain,
  counterparty,
  provider = "IBC",
}: {
  sendTxHash: string;
  direction: "deposit" | "withdraw";
  asset: string;
  /** base units */
  amount: string;
  decimals?: number;
  chain: string;
  counterparty: string;
  provider?: string;
}) => {
  const osmosis = { prettyName: "Osmosis", chainName: "osmosis" };
  const other = { prettyName: chain, chainName: chain.toLowerCase() };
  const user = "osmo17mlfltjtmpnysh7lmkmzyp6urcuw74mu25h3dk";
  return {
    __type: "recentTransfer",
    sendTxHash,
    direction,
    provider,
    providerName: provider === "Skip" ? "Skip Bridge" : undefined,
    fromAsset: { denom: asset, decimals, amount },
    toAsset: { denom: asset, decimals },
    fromChain: direction === "deposit" ? other : osmosis,
    toChain: direction === "withdraw" ? other : osmosis,
    fromAddress: direction === "deposit" ? counterparty : user,
    toAddress: direction === "withdraw" ? counterparty : user,
  } as unknown as HistoryTransaction;
};

const transactions = [
  swap("swap-osmo-atom", ["OSMO", "100"], ["ATOM", "1.25"]),
  transfer({
    sendTxHash: "dep-usdc-noble",
    direction: "deposit",
    asset: "USDC",
    amount: "9960000",
    chain: "Noble",
    counterparty: "noble17mlfltjtmpnysh7lmkmzyp6urcuw74mu2v3fr2",
  }),
  transfer({
    sendTxHash: "wd-usdt-avalanche",
    direction: "withdraw",
    asset: "USDT",
    amount: "5505156",
    chain: "Avalanche",
    counterparty: "0xc8E4D1e39819d9C11B860356Ba5eF1100aB3A487",
    provider: "Skip",
  }),
  swap("swap-usdc-osmo", ["USDC", "15.5"], ["OSMO", "350.123"]),
];

const ids = (txs: HistoryTransaction[]) =>
  txs.map((tx) => (tx.__type === "transaction" ? tx.id : tx.sendTxHash));

const search = (
  query: string,
  kinds: readonly TransactionKind[] = TRANSACTION_KINDS
) => ids(filterTransactions(transactions, { kinds, query }));

describe("filterTransactions", () => {
  it("returns everything with all kinds and no query", () => {
    expect(
      filterTransactions(transactions, {
        kinds: TRANSACTION_KINDS,
        query: null,
      })
    ).toBe(transactions);
    expect(search("   ")).toHaveLength(transactions.length);
  });

  it("filters by kind", () => {
    expect(search("", ["swap"])).toEqual(["swap-osmo-atom", "swap-usdc-osmo"]);
    expect(search("", ["deposit", "withdraw"])).toEqual([
      "dep-usdc-noble",
      "wd-usdt-avalanche",
    ]);
  });

  it("searches assets across swaps and transfers, keeping date order", () => {
    expect(search("usdc")).toEqual(["dep-usdc-noble", "swap-usdc-osmo"]);
  });

  it("fuzzy matches chain names", () => {
    expect(search("avalance")).toEqual(["wd-usdt-avalanche"]);
  });

  it("matches the provider", () => {
    expect(search("skip")).toEqual(["wd-usdt-avalanche"]);
  });

  describe("amounts", () => {
    it("matches amounts as a substring", () => {
      // 5.505156 USDT and 15.5 USDC
      expect(search("5.5")).toEqual(["wd-usdt-avalanche", "swap-usdc-osmo"]);
      expect(search("9.96")).toEqual(["dep-usdc-noble"]);
      expect(search("350.12")).toEqual(["swap-usdc-osmo"]);
    });

    it("accepts a decimal comma, thousands separators and a $ sign", () => {
      // "5,50" is a decimal comma; "5,505" would read as 5505
      expect(search("5,50")).toEqual(["wd-usdt-avalanche", "swap-usdc-osmo"]);
      expect(search("$1.25")).toEqual(["swap-osmo-atom"]);
      // trailing zeros, which the shown amounts don't have
      expect(search("15.50")).toEqual(["swap-usdc-osmo"]);
      expect(search("1.250")).toEqual(["swap-osmo-atom"]);
      expect(
        ids(
          filterTransactions(
            [
              transfer({
                sendTxHash: "big",
                direction: "deposit",
                asset: "OSMO",
                amount: "1000000000",
                chain: "Noble",
                counterparty: "noble1x",
              }),
            ],
            { kinds: TRANSACTION_KINDS, query: "1,000" }
          )
        )
      ).toEqual(["big"]);
    });

    it("accepts European notation", () => {
      const big = transfer({
        sendTxHash: "big",
        direction: "deposit",
        asset: "OSMO",
        // 1000.5
        amount: "1000500000",
        chain: "Noble",
        counterparty: "noble1x",
      });
      for (const query of ["1.000,50", "$1.000,5", "1,000.50"]) {
        expect(
          ids(filterTransactions([big], { kinds: TRANSACTION_KINDS, query }))
        ).toEqual(["big"]);
      }
    });
  });

  describe("addresses", () => {
    it("matches a full address, case-insensitively", () => {
      expect(search("0xc8e4d1e39819d9c11b860356ba5ef1100ab3a487")).toEqual([
        "wd-usdt-avalanche",
      ]);
    });

    it("matches an address fragment", () => {
      expect(search("0xC8E4")).toEqual(["wd-usdt-avalanche"]);
      expect(search("v3fr2")).toEqual(["dep-usdc-noble"]);
    });

    it("matches the shortened form shown in the rows at both ends", () => {
      expect(search("0xc8E4D1e3...0aB3A487")).toEqual(["wd-usdt-avalanche"]);
      expect(search("0xc8E4D1e3…0aB3A487")).toEqual(["wd-usdt-avalanche"]);
      expect(search("0xc8E4D1e3...ffffffff")).toEqual([]);
    });

    it("ignores short words for address matching", () => {
      // "c8e" appears in the address but is too short to count
      expect(search("c8e")).toEqual([]);
    });
  });

  it("requires every word to match", () => {
    expect(search("5.5 usdt")).toEqual(["wd-usdt-avalanche"]);
    expect(search("5.5 usdc")).toEqual(["swap-usdc-osmo"]);
    expect(search("usdc noble")).toEqual(["dep-usdc-noble"]);
    expect(search("5.5 noble")).toEqual([]);
  });

  it("combines kind and search", () => {
    expect(search("usdc", ["swap"])).toEqual(["swap-usdc-osmo"]);
  });
});

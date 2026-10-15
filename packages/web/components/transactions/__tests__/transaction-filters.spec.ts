import { HistoryTransaction } from "~/hooks/use-transaction-history";

import { filterTransactions, TRANSACTION_KINDS } from "../transaction-filters";

const swap = (id: string, tokenIn: string, tokenOut: string) =>
  ({
    __type: "transaction",
    id,
    hash: id,
    metadata: [
      {
        value: [
          {
            txInfo: {
              tokenIn: { token: { denom: tokenIn } },
              tokenOut: { token: { denom: tokenOut } },
            },
          },
        ],
      },
    ],
  }) as unknown as HistoryTransaction;

const transfer = (
  sendTxHash: string,
  direction: "deposit" | "withdraw",
  asset: string,
  chain: string,
  provider = "IBC"
) =>
  ({
    __type: "recentTransfer",
    sendTxHash,
    direction,
    provider,
    providerName: provider === "Skip" ? "Skip Bridge" : undefined,
    fromAsset: { denom: asset },
    toAsset: { denom: asset },
    fromChain:
      direction === "deposit"
        ? { prettyName: chain, chainName: chain.toLowerCase() }
        : { prettyName: "Osmosis", chainName: "osmosis" },
    toChain:
      direction === "withdraw"
        ? { prettyName: chain, chainName: chain.toLowerCase() }
        : { prettyName: "Osmosis", chainName: "osmosis" },
  }) as unknown as HistoryTransaction;

const transactions = [
  swap("swap-osmo-atom", "OSMO", "ATOM"),
  transfer("dep-usdc-noble", "deposit", "USDC", "Noble"),
  transfer("wd-tia-celestia", "withdraw", "TIA", "Celestia", "Skip"),
  swap("swap-usdc-osmo", "USDC", "OSMO"),
];

const ids = (txs: HistoryTransaction[]) =>
  txs.map((tx) => (tx.__type === "transaction" ? tx.id : tx.sendTxHash));

describe("filterTransactions", () => {
  it("returns everything with all kinds and no query", () => {
    expect(
      filterTransactions(transactions, {
        kinds: TRANSACTION_KINDS,
        query: null,
      })
    ).toBe(transactions);
  });

  it("filters by kind", () => {
    expect(
      ids(filterTransactions(transactions, { kinds: ["swap"], query: null }))
    ).toEqual(["swap-osmo-atom", "swap-usdc-osmo"]);
    expect(
      ids(
        filterTransactions(transactions, {
          kinds: ["deposit", "withdraw"],
          query: "",
        })
      )
    ).toEqual(["dep-usdc-noble", "wd-tia-celestia"]);
  });

  it("searches assets across swaps and transfers, keeping date order", () => {
    expect(
      ids(
        filterTransactions(transactions, {
          kinds: TRANSACTION_KINDS,
          query: "usdc",
        })
      )
    ).toEqual(["dep-usdc-noble", "swap-usdc-osmo"]);
  });

  it("fuzzy matches chain names", () => {
    expect(
      ids(
        filterTransactions(transactions, {
          kinds: TRANSACTION_KINDS,
          query: "celestai",
        })
      )
    ).toEqual(["wd-tia-celestia"]);
  });

  it("matches the provider", () => {
    expect(
      ids(
        filterTransactions(transactions, {
          kinds: TRANSACTION_KINDS,
          query: "skip",
        })
      )
    ).toEqual(["wd-tia-celestia"]);
  });

  it("combines kind and search", () => {
    expect(
      ids(filterTransactions(transactions, { kinds: ["swap"], query: "usdc" }))
    ).toEqual(["swap-usdc-osmo"]);
  });
});

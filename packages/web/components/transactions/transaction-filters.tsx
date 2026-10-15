import Fuse from "fuse.js";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useCallback, useMemo } from "react";

import { CheckboxSelect } from "~/components/control";
import { SearchBox } from "~/components/input";
import { useTranslation } from "~/hooks";
import { DataFilter } from "~/hooks/data/data-filter";
import { HistoryTransaction } from "~/hooks/use-transaction-history";

export const TRANSACTION_KINDS = ["swap", "deposit", "withdraw"] as const;
export type TransactionKind = (typeof TRANSACTION_KINDS)[number];

export function getTransactionKind(tx: HistoryTransaction): TransactionKind {
  return tx.__type === "transaction" ? "swap" : tx.direction;
}

/** What a search query matches: asset symbols, chain names and provider. */
const SEARCH_KEYS: Fuse.FuseOptionKey<HistoryTransaction>[] = [
  {
    name: "assets",
    getFn: (tx) => {
      if (tx.__type === "transaction") {
        const info = tx.metadata?.[0]?.value?.[0]?.txInfo;
        return [
          info?.tokenIn?.token?.denom ?? "",
          info?.tokenOut?.token?.denom ?? "",
        ];
      }
      return [tx.fromAsset.denom, tx.toAsset.denom];
    },
  },
  {
    name: "chains",
    getFn: (tx) =>
      tx.__type === "transaction"
        ? []
        : [
            tx.fromChain.prettyName,
            tx.toChain.prettyName,
            tx.fromChain.chainName ?? "",
            tx.toChain.chainName ?? "",
          ],
  },
  {
    name: "provider",
    getFn: (tx) =>
      tx.__type === "transaction" ? [] : [tx.provider, tx.providerName ?? ""],
  },
];

/** Filter by transaction kind, then fuzzy search assets/chains/provider. */
export function filterTransactions(
  transactions: HistoryTransaction[],
  { kinds, query }: { kinds: readonly TransactionKind[]; query: string | null }
): HistoryTransaction[] {
  const byKind =
    kinds.length === TRANSACTION_KINDS.length
      ? transactions
      : transactions.filter((tx) => kinds.includes(getTransactionKind(tx)));

  const trimmed = query?.trim();
  if (!trimmed) return byKind;

  // fuse returns results by relevance; keep the date order of the history
  const matches = new Set(new DataFilter(byKind, SEARCH_KEYS).process(trimmed));
  return byKind.filter((tx) => matches.has(tx));
}

/** Filter state, kept in the URL like the pools table filters. */
export function useTransactionFilters() {
  return useQueryStates(
    {
      txSearch: parseAsString,
      txTypes: parseAsArrayOf(
        parseAsStringLiteral<TransactionKind>(TRANSACTION_KINDS)
      ).withDefault([...TRANSACTION_KINDS]),
    },
    { history: "replace" }
  );
}

export function useFilteredTransactions(transactions: HistoryTransaction[]) {
  const [filters] = useTransactionFilters();
  const filtered = useMemo(
    () =>
      filterTransactions(transactions, {
        kinds: filters.txTypes,
        query: filters.txSearch,
      }),
    [transactions, filters.txTypes, filters.txSearch]
  );
  const isFiltering =
    Boolean(filters.txSearch?.trim()) ||
    filters.txTypes.length !== TRANSACTION_KINDS.length;
  return { filtered, isFiltering, query: filters.txSearch };
}

export const TransactionFilters = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useTransactionFilters();

  const onSearchInput = useCallback(
    (query: string) =>
      setFilters((s) => ({
        ...s,
        txSearch: query.length === 0 ? null : query,
      })),
    [setFilters]
  );

  return (
    <div className="flex items-center gap-3 pt-6 md:flex-col md:items-stretch">
      <SearchBox
        size="small"
        placeholder={t("transactions.filter.search")}
        debounce={300}
        currentValue={filters.txSearch ?? undefined}
        onInput={onSearchInput}
        className="!w-full max-w-md md:max-w-none"
      />
      <CheckboxSelect
        label={t("transactions.filter.type")}
        selectedOptionIds={filters.txTypes}
        buttonClassName="!h-9 md:!w-full"
        atLeastOneSelected
        options={[
          { id: "swap", display: t("transactions.filter.swap") },
          { id: "deposit", display: t("transactions.filter.deposit") },
          { id: "withdraw", display: t("transactions.filter.withdraw") },
        ]}
        onSelect={(id) => {
          const kind = id as TransactionKind;
          setFilters((s) => ({
            ...s,
            txTypes: s.txTypes.includes(kind)
              ? s.txTypes.filter((k) => k !== kind)
              : [...s.txTypes, kind],
          }));
        }}
      />
    </div>
  );
};

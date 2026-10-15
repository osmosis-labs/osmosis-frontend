import Fuse from "fuse.js";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { ReactNode, useCallback, useMemo } from "react";

import { CheckboxSelect } from "~/components/control";
import { SearchBox } from "~/components/input";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";
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

/**
 * Filter state, kept in the URL like the pools table filters.
 *
 * TODO: filter via the API. Filtering is client-side, so it only covers the
 * transactions on the current page (`getTransactions` pages 100 index
 * records). Pass the types/query to `getTransactions` (message types and
 * denoms on the historical data service) so filters search all history.
 */
export function useTransactionFilters() {
  return useQueryStates(
    {
      txSearch: parseAsString,
      txTypes: parseAsArrayOf(
        parseAsStringLiteral<TransactionKind>(TRANSACTION_KINDS)
      ).withDefault([...TRANSACTION_KINDS]),
    },
    { history: "push" }
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

/**
 * Filter controls laid out like the pools table controls: the heading (here,
 * the History/Orders tabs) on the left with search and type select on the
 * right; on narrower screens the search box drops to its own full-width row.
 */
export const TransactionFilters = ({
  heading,
  showControls,
}: {
  heading: ReactNode;
  showControls: boolean;
}) => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  // width === 0 during SSR; default to the wide layout to avoid a flash of the compact layout on hydration.
  const isWide = width === 0 || width >= Breakpoint.xl;
  const [filters, setFilters] = useTransactionFilters();

  const onSearchInput = useCallback(
    (data: string) => {
      setFilters((state) => ({
        ...state,
        txSearch: data.length === 0 ? null : data,
      }));
    },
    [setFilters]
  );

  if (!showControls) {
    return <div className="flex w-full items-center gap-5">{heading}</div>;
  }

  const searchBox = (
    <SearchBox
      size="small"
      placeholder={t("transactions.filter.search")}
      debounce={500}
      currentValue={filters.txSearch ?? undefined}
      onInput={onSearchInput}
      className={isWide ? undefined : "!w-full"}
    />
  );

  const typeSelect = (
    <div className="flex flex-none items-center gap-3">
      <CheckboxSelect
        label={t("transactions.filter.type")}
        selectedOptionIds={filters.txTypes}
        buttonClassName="!h-9 md:!w-auto"
        atLeastOneSelected
        options={[
          { id: "swap", display: t("transactions.filter.swap") },
          { id: "deposit", display: t("transactions.filter.deposit") },
          { id: "withdraw", display: t("transactions.filter.withdraw") },
        ]}
        onSelect={(kind) => {
          if (filters.txTypes.includes(kind as TransactionKind)) {
            setFilters((state) => ({
              ...state,
              txTypes: state.txTypes.filter((type) => type !== kind),
            }));
          } else {
            setFilters((state) => ({
              ...state,
              txTypes: [...state.txTypes, kind as TransactionKind],
            }));
          }
        }}
      />
    </div>
  );

  if (isWide) {
    return (
      <div className="flex w-full items-center gap-5">
        {heading}
        {searchBox}
        {typeSelect}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center gap-5">
        {heading}
        {typeSelect}
      </div>
      {searchBox}
    </div>
  );
};

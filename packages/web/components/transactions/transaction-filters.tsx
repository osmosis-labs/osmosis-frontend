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

/** Shortest word matched against addresses, so short words don't hit by chance. */
const MIN_ADDRESS_TERM_LENGTH = 4;

/**
 * Filter by transaction kind, then search. Every word of the query must
 * match the transaction:
 * - numbers match amounts as a substring ("5.5" finds 5.505156 and 15.5)
 * - other words fuzzy match assets, chains and provider, or match a
 *   transfer's from/to address as a substring (case-insensitive; a
 *   shortened `0xc8E4...A487` must match at both ends)
 */
export function filterTransactions(
  transactions: HistoryTransaction[],
  { kinds, query }: { kinds: readonly TransactionKind[]; query: string | null }
): HistoryTransaction[] {
  const byKind =
    kinds.length === TRANSACTION_KINDS.length
      ? transactions
      : transactions.filter((tx) => kinds.includes(getTransactionKind(tx)));

  const terms = query?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (terms.length === 0) return byKind;

  const searcher = new DataFilter(byKind, SEARCH_KEYS);
  const termMatchers = terms.map(
    (term): ((tx: HistoryTransaction) => boolean) => {
      if (isNumberTerm(term)) {
        const n = normalizeNumberTerm(term);
        return (tx) => getAmounts(tx).some((amount) => amount.includes(n));
      }

      const fuzzyMatches = new Set(searcher.process(term));
      const fragments = term
        .toLowerCase()
        .split(/\.{2,}|…/)
        .filter(Boolean);
      const isAddressTerm =
        fragments.length > 0 &&
        fragments.every((f) => f.length >= MIN_ADDRESS_TERM_LENGTH);

      return (tx) =>
        fuzzyMatches.has(tx) ||
        (isAddressTerm &&
          getAddresses(tx).some((address) =>
            fragments.every((f) => address.includes(f))
          ));
    }
  );

  // keeps the date order of the history (fuse returns by relevance)
  return byKind.filter((tx) => termMatchers.every((matches) => matches(tx)));
}

/** Counterparty addresses of a transfer, lowercased. Swaps have none. */
function getAddresses(tx: HistoryTransaction): string[] {
  if (tx.__type === "transaction") return [];
  return [tx.fromAddress, tx.toAddress]
    .filter(Boolean)
    .map((address) => address.toLowerCase());
}

/** e.g. `5.5`, `.5`, `1,000`, `5,5`, `$5.5` */
function isNumberTerm(term: string) {
  return /^\$?(\d[\d,]*(\.\d*)?|\.\d+)$/.test(term);
}

/** To the plain decimal form amounts are matched in. */
function normalizeNumberTerm(term: string) {
  const n = term.replace(/^\$/, "");
  if (n.includes(".")) return n.replace(/,/g, "");
  // thousands separators (1,000 / 1,000,000), otherwise a decimal comma
  return /^\d{1,3}(,\d{3})+$/.test(n)
    ? n.replace(/,/g, "")
    : n.replace(",", ".");
}

/** The amounts shown for a transaction, as plain decimals (e.g. "5.505156"). */
function getAmounts(tx: HistoryTransaction): string[] {
  if (tx.__type === "transaction") {
    const info = tx.metadata?.[0]?.value?.[0]?.txInfo;
    return [info?.tokenIn?.token, info?.tokenOut?.token].flatMap((token) =>
      token && typeof token.toDec === "function"
        ? [trimDecimal(token.toDec().toString())]
        : []
    );
  }
  return [tx.fromAsset, tx.toAsset].flatMap((asset) =>
    asset.amount ? [baseUnitsToDecimal(asset.amount, asset.decimals)] : []
  );
}

function baseUnitsToDecimal(amount: string, decimals: number) {
  if (!/^\d+$/.test(amount)) return amount;
  if (decimals <= 0) return amount;
  const padded = amount.padStart(decimals + 1, "0");
  return trimDecimal(
    `${padded.slice(0, -decimals)}.${padded.slice(-decimals)}`
  );
}

function trimDecimal(value: string) {
  return value.includes(".") ? value.replace(/\.?0+$/, "") : value;
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

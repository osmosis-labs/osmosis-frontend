import { SortDirection } from "@osmosis-labs/utils";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  incentiveTypes,
  MarketIncentivePoolsSortKey,
  poolFilterTypes,
  PoolsTabelSortParams,
  PoolsTable,
  PoolsTableFilters,
} from "~/components/complex/pools-table";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

interface TokenPoolsProps {
  denom: string;
}

const defaultFilters: PoolsTableFilters = {
  searchQuery: "",
  poolTypesFilter: poolFilterTypes,
  poolIncentivesFilter: incentiveTypes,
};

export const TokenPools = (props: TokenPoolsProps) => {
  const { denom } = props;
  const { t } = useTranslation();
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [sortKey, setSortKey] =
    useState<MarketIncentivePoolsSortKey>("volume24hUsd");
  const [] = useState();

  const filters = useMemo(
    () => ({
      ...defaultFilters,
      // Exact match search
      searchQuery: `=${denom}`,
    }),
    [denom]
  );

  const sortParams: PoolsTabelSortParams = useMemo(
    () => ({
      allPoolsSort: sortKey,
      allPoolsSortDir: sortDirection,
    }),
    [sortDirection, sortKey]
  );

  return (
    <section>
      <header className="mb-6 flex items-center justify-between gap-2">
        <h5>{t("menu.pools")}</h5>

        <Button
          variant="link"
          size="xsm"
          className=" text-wosmongton-200"
          asChild
        >
          <Link href={`/pools?searchQuery=${encodeURIComponent(`=${denom}`)}`}>
            {t("assets.seeAll")}
          </Link>
        </Button>
      </header>

      <PoolsTable
        limit={4}
        filters={filters}
        disablePagination
        sortParams={sortParams}
        setSortDirection={setSortDirection}
        setSortKey={(key) => setSortKey(key ?? "volume24hUsd")}
        emptyResultsText={t("search.poolsEmpty", { denom })}
      />
    </section>
  );
};

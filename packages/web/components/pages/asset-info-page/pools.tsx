import { noop } from "@osmosis-labs/utils";
import Link from "next/link";
import { FunctionComponent, useMemo } from "react";

import {
  incentiveTypes,
  poolFilterTypes,
  PoolsTabelSortParams,
  PoolsTable,
  PoolsTableFilters,
} from "~/components/complex/pools-table";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

interface AssetPoolsProps {
  denom: string;
}

const defaultFilters: PoolsTableFilters = {
  searchQuery: null,
  poolTypesFilter: poolFilterTypes,
  poolIncentivesFilter: incentiveTypes,
};

const sortParams: PoolsTabelSortParams = {
  allPoolsSort: "market.volume24hUsd",
  allPoolsSortDir: "desc",
};

export const AssetPools: FunctionComponent<AssetPoolsProps> = (props) => {
  const { denom } = props;
  const { t } = useTranslation();

  const filters = useMemo(
    () => ({
      ...defaultFilters,
      denoms: [denom],
    }),
    [denom]
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
        limit={10}
        filters={filters}
        disablePagination
        sortParams={sortParams}
        setSortDirection={noop}
        setSortKey={noop}
        emptyResultsText={t("search.poolsEmpty", { denom })}
      />
    </section>
  );
};

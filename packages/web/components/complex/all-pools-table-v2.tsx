import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { FunctionComponent, useEffect, useMemo } from "react";

import { useTranslation } from "~/hooks";
import { api, RouterOutputs } from "~/utils/trpc";

import { Icon } from "../assets";
import { AprBreakdown } from "../cards/apr-breakdown";
import Spinner from "../spinner";
import { Tooltip } from "../tooltip";
import { AprDisclaimerTooltip } from "../tooltip/apr-disclaimer";

type Pool =
  RouterOutputs["edge"]["pools"]["getMarketIncentivePools"]["items"][number];

export const AllPoolsTable: FunctionComponent<{
  topOffset: number;
  quickAddLiquidity: (poolId: string) => void;
}> = ({ topOffset }) => {
  const { t } = useTranslation();

  const {
    data: poolsPagesData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.edge.pools.getMarketIncentivePools.useInfiniteQuery(
    {
      limit: 100,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    }
  );
  const poolsData = useMemo(
    () => poolsPagesData?.pages.flatMap((page) => page?.items) ?? [],
    [poolsPagesData]
  );

  // Define columns
  const columnHelper = createColumnHelper<Pool>();
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row, {
        id: "pool",
        header: t("pools.allPools.sort.poolName"),
      }),
      columnHelper.accessor((row) => row.volume24hUsd?.toString() ?? "0", {
        id: "volume",
        header: t("pools.allPools.sort.volume24h"),
      }),
      columnHelper.accessor(
        (row) => row.totalFiatValueLocked?.toString() ?? "0",
        {
          id: "liquidity",
          header: t("pools.allPools.sort.liquidity"),
        }
      ),
      columnHelper.accessor((row) => row.feesSpent7dUsd?.toString() ?? "0", {
        id: "fees",
        header: t("pools.allPools.sort.fees"),
      }),
      columnHelper.accessor((row) => row, {
        id: "apr",
        header: () => (
          <div className="flex items-center gap-1">
            <AprDisclaimerTooltip />
            <span>{t("pools.allPools.sort.APRIncentivized")}</span>
          </div>
        ),
        cell: AprBreakdownCell,
      }),
    ],
    [columnHelper, t]
  );

  const table = useReactTable({
    data: poolsData,
    columns,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 50,
    paddingStart: topOffset,
    overscan: 5,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  // pagination
  const lastRow = rows[rows.length - 1];
  const lastVirtualRow = virtualRows[virtualRows.length - 1];
  const canLoadMore = !isLoading && !isFetchingNextPage && hasNextPage;
  useEffect(() => {
    if (
      lastRow &&
      lastVirtualRow &&
      lastRow.index === lastVirtualRow.index &&
      canLoadMore
    )
      fetchNextPage();
  }, [lastRow, lastVirtualRow, canLoadMore, fetchNextPage]);

  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={classNames("subtitle1", {
                    "w-96 !text-left": header.index === 0,
                    "text-right": header.index > 0,
                  })}
                  key={header.id}
                  colSpan={header.colSpan}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: paddingTop - topOffset }} />
            </tr>
          )}
          {isLoading && (
            <tr>
              <td className="text-center" colSpan={columns.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <tr
                className="group rounded-3xl transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
                key={row.id}
              >
                {row.getVisibleCells().map((cell, cellIndex, cells) => (
                  <td
                    className={classNames(
                      "transition-colors duration-200 ease-in-out",
                      {
                        "rounded-l-3xl text-left": cellIndex === 0,
                        "text-right": cellIndex > 0,
                        "rounded-r-3xl": cellIndex === cells.length - 1,
                      }
                    )}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {isFetchingNextPage && (
            <tr>
              <td className="text-center" colSpan={columns.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom - topOffset }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

type PoolCellComponent<TProps = {}> = FunctionComponent<
  CellContext<Pool, Pool> & TProps
>;

const AprBreakdownCell: PoolCellComponent = ({
  row: {
    original: { aprBreakdown },
  },
}) =>
  (aprBreakdown && (
    <Tooltip
      rootClassNames="!rounded-[20px] drop-shadow-md"
      content={<AprBreakdown {...aprBreakdown} />}
    >
      <p
        className={classNames("ml-auto flex items-center gap-1.5", {
          "text-bullish-500": Boolean(
            aprBreakdown.boost || aprBreakdown.osmosis
          ),
        })}
      >
        {(aprBreakdown.boost || aprBreakdown.osmosis) && (
          <div className="rounded-full bg-[#003F4780]">
            <Icon id="boost" className="h-4 w-4 text-bullish-500" />
          </div>
        )}
        {aprBreakdown.total?.maxDecimals(0).toString() ?? ""}
      </p>
    </Tooltip>
  )) ??
  null;

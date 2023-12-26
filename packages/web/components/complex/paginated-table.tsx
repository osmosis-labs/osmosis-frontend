import { ObservableQueryPool } from "@osmosis-labs/stores";
import { flexRender, Row, Table } from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { FunctionComponent, ReactNode, useEffect } from "react";
import { CSSProperties } from "react";

import { Icon } from "~/components/assets";
import { AssetCard } from "~/components/cards";
import { useWindowSize } from "~/hooks";
import { ObservablePoolWithMetric } from "~/stores/derived-data";

interface PoolLinkProps {
  queryPool: ObservableQueryPool;
  style?: CSSProperties;
  children: ReactNode;
}

const poolLinkRoute = (queryPool: ObservableQueryPool) =>
  queryPool.type === "transmuter"
    ? `https://celatone.osmosis.zone/osmosis-1/pools/${queryPool.id}`
    : `/pool/${queryPool.id}`;

const PoolLink: FunctionComponent<PoolLinkProps> = ({
  children,
  queryPool,
  style,
}) => {
  const route = poolLinkRoute(queryPool);

  return (
    <Link
      href={route}
      passHref
      target={queryPool.type === "transmuter" ? "_blank" : undefined}
      style={style}
    >
      {children}
    </Link>
  );
};

const onPoolClick =
  (queryPool: ObservableQueryPool, router: NextRouter) =>
  (ev: React.MouseEvent<HTMLElement>) => {
    if (queryPool.type === "transmuter") {
      ev.stopPropagation();
      window.open(poolLinkRoute(queryPool), "_blank");
    } else {
      router.push(poolLinkRoute(queryPool));
    }
  };

type Props = {
  mobileSize?: number;
  paginate: () => void;
  size: number;
  table: Table<ObservablePoolWithMetric>;
  topOffset: number;
};

export const PaginatedTable = ({
  mobileSize,
  paginate,
  size,
  table,
  topOffset,
}: Props) => {
  const { isMobile } = useWindowSize();

  const { rows } = table.getRowModel();
  const router = useRouter();

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => (isMobile ? mobileSize || 0 : size),
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

  const lastRow = rows[rows.length - 1];
  const lastVirtualRow = virtualRows[virtualRows.length - 1];
  useEffect(() => {
    let isMounted = true; // helps us avoid react console warnings

    if (
      isMounted &&
      lastRow &&
      lastVirtualRow &&
      lastRow.index === lastVirtualRow.index
    ) {
      paginate();
    }

    return () => {
      isMounted = false; // cleanup
    };
  }, [lastRow, lastVirtualRow, paginate]);

  if (isMobile) {
    return (
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize() - topOffset}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index] as Row<ObservablePoolWithMetric>;
          return (
            <PoolLink
              key={row.original.queryPool.id}
              queryPool={row.original.queryPool}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start - topOffset}px)`,
              }}
            >
              <MobileTableRow row={row} />
            </PoolLink>
          );
        })}
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, i) => (
              <th key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : (
                  <div
                    className={classNames(
                      {
                        "flex cursor-pointer select-none items-center gap-2":
                          header.column.getCanSort(),
                      },
                      i === 0 ? "justify-start" : "justify-end"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: (
                        <Icon
                          id="sort-up"
                          className="h-[16px] w-[7px] text-osmoverse-300"
                        />
                      ),
                      desc: (
                        <Icon
                          id="sort-down"
                          className="h-[16px] w-[7px] text-osmoverse-300"
                        />
                      ),
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {paddingTop > 0 && (
          <tr>
            <td style={{ height: `${paddingTop - topOffset}px` }} />
          </tr>
        )}
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index] as Row<ObservablePoolWithMetric>;
          return (
            <tr
              key={row.id}
              className="transition-colors focus-within:bg-osmoverse-700 focus-within:outline-none hover:cursor-pointer hover:bg-osmoverse-800"
              onClick={onPoolClick(row.original.queryPool, router)}
            >
              {row.getVisibleCells().map((cell) => {
                return (
                  <td key={cell.id}>
                    <PoolLink queryPool={row.original.queryPool}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </PoolLink>
                  </td>
                );
              })}
            </tr>
          );
        })}
        {paddingBottom > 0 && (
          <tr>
            <td style={{ height: `${paddingBottom - topOffset}px` }} />
          </tr>
        )}
      </tbody>
    </table>
  );
};

const MobileTableRow = observer(
  ({ row }: { row: Row<ObservablePoolWithMetric> }) => {
    const poolAssets = row.original.queryPool.poolAssets.map((poolAsset) => ({
      coinImageUrl: poolAsset.amount.currency.coinImageUrl,
      coinDenom: poolAsset.amount.currency.coinDenom,
    }));

    return (
      <AssetCard
        coinDenom={poolAssets.map((asset) => asset.coinDenom).join("/")}
        metrics={[
          {
            label: "TVL",
            value: row.original.liquidity.toString(),
          },
          {
            label: "APR",
            value: row.original.apr.toString(),
          },
        ]}
        coinImageUrl={poolAssets}
      />
    );
  }
);

import { EarnStrategy } from "@osmosis-labs/server";
import { flexRender, useReactTable } from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useMemo } from "react";

import { Icon } from "~/components/assets";
import { useTranslation } from "~/hooks";
import { useStrategyTableConfig } from "~/hooks/use-strategy-table-config";
import { theme } from "~/tailwind.config";

interface StrategiesTableProps {
  showBalance: boolean;
  strategies?: EarnStrategy[];
  areStrategiesLoading?: boolean;
  isError?: boolean;
  refetch: () => void;
}

const StrategiesTable = ({
  showBalance,
  strategies,
  areStrategiesLoading,
  isError,
  refetch,
}: StrategiesTableProps) => {
  const { tableConfig } = useStrategyTableConfig(strategies ?? [], showBalance);
  const table = useReactTable(tableConfig);

  const { rows } = table.getRowModel();

  const topOffset = Number(theme.extend.height.navbar.replace("px", ""));

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 80,
    overscan: 10,
    paddingStart: topOffset,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const paddingTop = useMemo(
    () => (virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0),
    [virtualRows]
  );
  const paddingBottom = useMemo(
    () =>
      virtualRows.length > 0
        ? rowVirtualizer.getTotalSize() -
          (virtualRows?.[virtualRows.length - 1]?.end || 0)
        : 0,
    [rowVirtualizer, virtualRows]
  );

  if (areStrategiesLoading) {
    return <LoadingStrategies />;
  }

  if (isError) {
    return <StrategiesFetchingError refetch={refetch} />;
  }

  if (strategies && strategies.length === 0) return <NoResult />;

  if (strategies && virtualRows.length === 0 && strategies.length > 0)
    return <NoResult isFilterError />;

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
      }}
      className="no-scrollbar mb-11 overflow-x-auto overflow-y-hidden"
    >
      <table className="mb-12 w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={classNames("text-right first:bg-osmoverse-850", {
                    "sticky left-[88px] bg-osmoverse-850 !text-left md:static md:left-0":
                      header.index === 1,
                    "sticky left-0 z-30 bg-osmoverse-850 !pl-4 md:!text-left":
                      header.index === 0,
                    "!text-center": header.index === 7,
                  })}
                  key={header.id}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: classNames({
                          "cursor-pointer inline-flex items-center select-none gap-1":
                            header.column.getCanSort(),
                        }),
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <Icon id="sort-up" width={16} height={16} />,
                        desc: <Icon id="sort-down" width={16} height={16} />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-osmoverse-810">
          {paddingTop > 0 && paddingTop - topOffset > 0 && (
            <tr>
              <td style={{ height: paddingTop - topOffset }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <tr
                className={classNames(
                  "group transition-colors duration-200 ease-in-out first:bg-osmoverse-810 hover:bg-osmoverse-850"
                )}
                key={row.id}
              >
                {row.getVisibleCells().map((cell, rowIndex) => (
                  <td
                    className={classNames(
                      "!rounded-none bg-osmoverse-810 transition-colors duration-200 ease-in-out group-hover:bg-osmoverse-850",
                      {
                        "sticky left-0 z-30": rowIndex === 0,
                        "sticky left-[88px] z-30 md:static md:left-0":
                          rowIndex === 1,
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

export default observer(StrategiesTable);

const LoadingStrategies = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-16 mt-6 flex flex-col items-center justify-center gap-7">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-osmoverse-900">
        <Image
          src={"/images/loading-gradient.svg"}
          alt="Loading spinner"
          width={40}
          height={40}
          className="animate-spin"
        />
      </div>
      <h6 className="text-wosmongton-400">{t("earnPage.loadingStrategies")}</h6>
    </div>
  );
};

const StrategiesFetchingError = ({ refetch }: { refetch: () => void }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-16 mt-6 flex flex-col items-center justify-center gap-7">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-osmoverse-900">
        <Image
          src={"/images/cross-thin.svg"}
          alt="Error"
          width={28}
          height={28}
        />
      </div>
      <h6 className="inline-flex items-center gap-1 text-osmoverse-100">
        {t("earnPage.sorryErrorOccurred")}
        <span>
          <button
            type="button"
            className="text-wosmongton-100"
            onClick={refetch}
          >
            {t("earnPage.retry")}
          </button>
        </span>
      </h6>
    </div>
  );
};

const NoResult = ({ isFilterError }: { isFilterError?: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-16 mt-6 flex flex-col items-center justify-center gap-7">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-osmoverse-900">
        <Image
          src={"/images/magnifying-glass-error.svg"}
          alt="Error"
          width={38}
          height={38}
        />
      </div>
      <h6 className="text-osmoverse-100">
        {t("earnPage.sorryNoResults")}{" "}
        {isFilterError && t("earnPage.tryChangingFilters")}
      </h6>
    </div>
  );
};

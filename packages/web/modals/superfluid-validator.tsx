import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { BondStatus } from "@osmosis-labs/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { SearchBox } from "~/components/input";
import { Spinner } from "~/components/loaders";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { ValidatorInfoCell } from "~/components/table/cells/";
import { SortHeader } from "~/components/table/headers/sort";
import { InfoTooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { useFilteredData, useSortedData } from "~/hooks/data";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { api } from "~/utils/trpc";

type Validator = {
  address: string;
  validatorName?: string;
  validatorImgSrc?: string;
  validatorCommission: RatePretty;
  isDelegated: number;
};

const defaultSortKey = "isDelegated";

export const SuperfluidValidatorModal: FunctionComponent<
  {
    isSuperfluid?: boolean;
    showDelegated?: boolean;
    availableBondAmount?: CoinPretty;
    onSelectValidator: (address: string) => void;
    ctaLabel?: string;
  } & ModalBaseProps
> = observer((props) => {
  const {
    isSuperfluid = true,
    showDelegated = true,
    availableBondAmount,
    onSelectValidator,
    ctaLabel,
  } = props;
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const { isMobile } = useWindowSize();

  const tableScrollReference = useRef<HTMLDivElement>(null);

  const account = accountStore.getWallet(accountStore.osmosisChainId);

  const { data: validators, isLoading: isLoadingAllValidators } =
    api.edge.staking.getValidators.useQuery({
      status: BondStatus.Bonded,
    });

  const {
    data: userValidatorDelegations,
    isLoading: isLoadingUserValidators,
    isPreviousData,
  } = api.edge.staking.getUserDelegations.useQuery(
    {
      userOsmoAddress: account?.address ?? "",
    },
    {
      enabled: !!account?.address,
    }
  );

  const isLoadingValidators = isLoadingAllValidators || isLoadingUserValidators;

  const { data: osmoEquivalent, isLoading: isLoadingOsmoEquivalent } =
    api.edge.staking.getOsmoEquivalent.useQuery(
      availableBondAmount?.toCoin() ?? { denom: "", amount: "" },
      {
        enabled:
          !!availableBondAmount && availableBondAmount.toDec().isPositive(),
      }
    );

  // vals from 0..<1 used to initially & randomly sort validators in `isDelegated` key
  const randomSortVals = useMemo(
    () => validators?.map(() => Math.random()) ?? [],
    [validators]
  );

  // get minimum info for display, mark validators users are delegated to
  const activeDelegatedValidators: Validator[] = useMemo(
    () =>
      validators?.map(
        (
          { operator_address, description, commission, validatorImgSrc },
          index
        ) => {
          return {
            address: operator_address,
            validatorName: description.moniker,
            validatorImgSrc:
              validatorImgSrc === "" ? undefined : validatorImgSrc,
            validatorCommission: new RatePretty(
              commission.commission_rates.rate
            ),
            isDelegated: !showDelegated
              ? 1
              : userValidatorDelegations?.some(
                  ({ delegation }) =>
                    delegation.validator_address === operator_address
                )
              ? 1 // = new Dec(1)
              : randomSortVals[index], // = new Dec(0..<1)
          };
        }
      ) ?? [],
    [validators, userValidatorDelegations, showDelegated, randomSortVals]
  );

  const [sortKey, setKeypath, sortDirection, setSortDirection, _, sortedData] =
    useSortedData(activeDelegatedValidators, defaultSortKey, "desc");
  const [query, setQuery, searchedValidators] = useFilteredData(sortedData, [
    "validatorName",
    "validatorCommission",
    "isDelegated",
  ]);
  const [selectedValidatorAddress, setSelectedValidatorAddress] = useState<
    string | null
  >(null);

  const setSortKey = useCallback(
    (key?: string) => {
      if (key) {
        setKeypath(key);
      } else {
        setKeypath(defaultSortKey);
      }
    },
    [setKeypath]
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Validator>();
    return [
      columnHelper.accessor((row) => row, {
        id: "validatorInfo",
        cell: ({ row: { original: validator } }) => (
          <ValidatorInfoCell
            value={validator.validatorName}
            imgSrc={validator.validatorImgSrc}
          />
        ),
        header: () => (
          <SortHeader
            className="w-full !justify-start ml-0 subtitle1 text-osmoverse-300"
            label={t("superfluidValidator.columns.validator")}
            sortKey="validatorName"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
      }),
      columnHelper.accessor((row) => row, {
        id: "commission",
        header: () => (
          <SortHeader
            className="w-full !justify-end ml-0 subtitle1 text-osmoverse-300"
            label={t("superfluidValidator.columns.commission")}
            sortKey="validatorCommission"
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
          />
        ),
        cell: (cell) => cell.getValue().validatorCommission.toString(),
      }),
    ];
  }, [sortKey, sortDirection, setSortDirection, setSortKey, t]);

  const table = useReactTable({
    data: searchedValidators,
    columns: columns,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    enableFilters: false,
    getCoreRowModel: getCoreRowModel(),
  });

  // #region virtualization
  // Virtualization is used to render only the visible rows
  // and save on performance and memory.
  // As the user scrolls, invisible rows are removed from the DOM.
  const topOffset = Number(
    isMobile
      ? theme.extend.height["navbar-mobile"].replace("px", "")
      : theme.extend.height.navbar.replace("px", "")
  );
  const rowHeightEstimate = 70.5;
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => rowHeightEstimate,
    paddingStart: topOffset,
    getScrollElement: () => tableScrollReference.current,
    overscan: 5,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <ModalBase {...props}>
      <div className="mt-8 flex flex-col gap-4 md:gap-2">
        <div className="mb-1 flex place-content-between items-center gap-2.5 md:flex-col">
          {isSuperfluid && (
            <span className="subtitle1 mr-auto">
              {t("superfluidValidator.choose")}
            </span>
          )}
          <SearchBox
            className={isMobile ? "!w-full !rounded" : undefined}
            currentValue={query}
            onInput={setQuery}
            placeholder={t("superfluidValidator.search")}
            size={isMobile ? "medium" : "small"}
          />
        </div>
        <div
          ref={tableScrollReference}
          className="h-72 overflow-x-clip overflow-y-scroll"
        >
          {isLoadingValidators ? (
            <div className="mx-auto w-fit pt-4">
              <Spinner />
            </div>
          ) : (
            <table
              className={classNames(
                "w-full",
                isPreviousData &&
                  isLoadingValidators &&
                  "animate-[deepPulse_2s_ease-in-out_infinite] cursor-progress"
              )}
            >
              <thead className="sm:hidden">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="!bg-osmoverse-800 top-0 !h-11"
                  >
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} colSpan={header.colSpan}>
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
                {paddingTop > 0 && paddingTop - topOffset > 0 && (
                  <tr>
                    <td style={{ height: paddingTop - topOffset }} />
                  </tr>
                )}
                {isLoadingValidators && (
                  <tr>
                    <td className="!text-center" colSpan={2}>
                      <Spinner />
                    </td>
                  </tr>
                )}
                {virtualRows.map((virtualRow) => {
                  const {
                    id,
                    original: { address, isDelegated },
                  } = rows[virtualRow.index];
                  return (
                    <tr
                      className={`!h-fit ${
                        address === selectedValidatorAddress
                          ? "border border-osmoverse-500"
                          : isDelegated === 1
                          ? "bg-osmoverse-800"
                          : "bg-osmoverse-900"
                      } hover:cursor-pointer hover:bg-osmoverse-850`}
                      key={id}
                      onClick={() => setSelectedValidatorAddress(address)}
                    >
                      {rows[virtualRow.index].getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
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
          )}
        </div>
        {availableBondAmount && (
          <div className="caption flex flex-col gap-4 px-4 py-3 text-osmoverse-300 md:gap-2">
            <div className="flex place-content-between items-center">
              <span>{t("superfluidValidator.bondedAmount")}</span>
              <span>{availableBondAmount.trim(true).toString()}</span>
            </div>
            <div className="flex place-content-between items-center">
              <span>
                {isMobile
                  ? t("superfluidValidator.estimationMobile")
                  : t("superfluidValidator.estimation")}
              </span>
              <span className="flex items-center">
                <SkeletonLoader
                  className={classNames({ "w-6": isLoadingOsmoEquivalent })}
                  isLoaded={!isLoadingOsmoEquivalent}
                >
                  ~
                  {osmoEquivalent?.maxDecimals(3).trim(true).toString() ?? null}
                </SkeletonLoader>
                <InfoTooltip
                  className="ml-1"
                  content={t("superfluidValidator.estimationInfo")}
                />
              </span>
            </div>
          </div>
        )}
        <Button
          disabled={
            selectedValidatorAddress === null ||
            account?.txTypeInProgress !== "" ||
            isLoadingAllValidators ||
            isLoadingUserValidators
          }
          onClick={() => {
            if (selectedValidatorAddress !== null) {
              onSelectValidator(selectedValidatorAddress);
            }
          }}
        >
          {ctaLabel ?? t("superfluidValidator.buttonBond")}
        </Button>
      </div>
    </ModalBase>
  );
});

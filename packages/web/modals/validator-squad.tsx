import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import {
  CellContext,
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import debounce from "debounce";
import Fuse from "fuse.js";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-multi-lang";
import { useVirtual } from "react-virtual";

import { ExternalLinkIcon, Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { SearchBox } from "~/components/input";
import { IS_FRONTIER } from "~/config/index";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";

export const ValidatorSquadModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => <ValidatorSquadContent {...props} />
);

type Validator = {
  validatorName: string | undefined;
  myStake: string;
  votingPower: string;
  commissions: string;
  website: string | undefined;
  imageUrl: string;
};

interface ValidatorSquadContentProps {
  onRequestClose: () => void;
  isOpen: boolean;
}

function normalizeUrl(url: string): string {
  // Remove "https://", "http://", "www.", and trailing slashes
  url = url.replace(/^https?:\/\//, "");
  url = url.replace(/^www\./, "");
  url = url.replace(/\/$/, "");
  return url;
}

function truncateString(str: string): string {
  if (str.length <= 30) return str;

  const halfLength = Math.floor((30 - 3) / 2);
  const firstHalf = str.slice(0, halfLength);
  const secondHalf = str.slice(-halfLength);
  return `${firstHalf}...${secondHalf}`;
}

const ValidatorSquadContent: FunctionComponent<ValidatorSquadContentProps> =
  observer(({ onRequestClose, isOpen }) => {
    // chain
    const { chainStore, queriesStore, accountStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const queries = queriesStore.get(chainId);
    const account = accountStore.getWallet(chainId);

    const totalStakePool = queries.cosmos.queryPool.bondedTokens;

    const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Bonded
    );
    const activeValidators = queryValidators.validators;

    const userValidatorDelegations =
      queries.cosmos.queryDelegations.getQueryBech32Address(
        account?.address ?? ""
      ).delegations;

    const userValidatorDelegationsByValidatorAddress = useMemo(() => {
      const delegationsMap = new Map<string, Staking.Delegation>();

      userValidatorDelegations.forEach((delegation) => {
        delegationsMap.set(delegation.delegation.validator_address, delegation);
      });

      return delegationsMap;
    }, [userValidatorDelegations]);

    // table
    const [sorting, setSorting] = useState<SortingState>([
      { id: "myStake", desc: true },
    ]);
    const columnHelper = createColumnHelper<Validator>();

    // search
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useMemo(() => debounce(setSearchTerm, 200), []);
    const handleSearchInput = (value: string) => debouncedSearchTerm(value);

    // i18n
    const t = useTranslation();

    const rawData: Validator[] = useMemo(
      () =>
        activeValidators
          .filter((validator) => Boolean(validator.description.moniker))
          .map((validator) => ({
            validatorName: validator.description.moniker,
            myStake: new CoinPretty(
              totalStakePool.currency,
              new Dec(
                userValidatorDelegationsByValidatorAddress.has(
                  validator.operator_address
                )
                  ? userValidatorDelegationsByValidatorAddress.get(
                      validator.operator_address
                    )?.balance?.amount || 0
                  : 0
              )
            )
              .maxDecimals(2)
              .hideDenom(true)
              .toString(),
            votingPower: new RatePretty(
              new Dec(validator.tokens).quo(totalStakePool.toDec())
            )
              .moveDecimalPointLeft(6)
              .maxDecimals(2)
              .toString(),
            commissions: validator.commission.commission_rates.rate,
            website: validator.description.website,
            imageUrl: queryValidators.getValidatorThumbnail(
              validator.operator_address
            ),
          })),
      [
        activeValidators,
        totalStakePool,
        queryValidators,
        userValidatorDelegationsByValidatorAddress,
      ]
    );

    const fuse = useMemo(() => {
      return new Fuse(rawData, {
        keys: ["validatorName"],
      });
    }, [rawData]);

    const searchData: Validator[] = useMemo(() => {
      if (searchTerm.trim() === "") return rawData;

      const results = fuse.search(searchTerm);
      return results.map((result) => result.item);
    }, [searchTerm, rawData, fuse]);

    const columns = useMemo<ColumnDef<Validator>[]>(
      () => [
        {
          id: "validatorSquadTable",
          columns: [
            columnHelper.accessor((row) => row, {
              cell: observer((props: CellContext<any, any>) => {
                const displayUrl = normalizeUrl(
                  props.row.original.website || ""
                );
                const truncatedDisplayUrl = truncateString(displayUrl);

                return (
                  <div className="flex items-center gap-3">
                    {/*  input placeholder */}
                    <input type="radio" />
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <img
                        alt={props.row.original.validatorName}
                        src={props.row.original.imageUrl || ""}
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="subtitle1 md:subtitle2">
                        {props.row.original.validatorName}
                      </div>
                      {Boolean(props.row.original.website) && (
                        <span className="text-xs text-wosmongton-100">
                          <a
                            href={props.row.original.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            {truncatedDisplayUrl}
                            <ExternalLinkIcon
                              isAnimated
                              classes={{ container: "w-3 h-3" }}
                            />
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                );
              }),
              header: () => t("stake.validatorSquad.column.validator"),
              id: "validatorName",
            }),
            {
              accessorKey: "myStake",
              header: () => t("stake.validatorSquad.column.myStake"),
            },
            {
              accessorKey: "votingPower",
              header: () => t("stake.validatorSquad.column.votingPower"),
            },
            {
              accessorKey: "commissions",
              header: () => t("stake.validatorSquad.column.commission"),
              cell: (props) =>
                new RatePretty(props.row.original.commissions).toString(),
            },
          ],
        },
      ],
      [columnHelper, t]
    );

    const table = useReactTable({
      data: searchData,
      columns,
      state: {
        sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

    const { rows } = table.getRowModel();

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtual({
      parentRef: tableContainerRef,
      size: searchData.length,
      overscan: 10,
    });

    const { virtualItems: virtualRows, totalSize } = rowVirtualizer;

    const paddingTop =
      virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;

    const paddingBottom =
      virtualRows.length > 0
        ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
        : 0;

    return (
      <ModalBase
        title={t("stake.validatorSquad.title")}
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="flex !max-w-[1168px] flex-col"
      >
        <div className="mx-auto mb-9 flex max-w-[500px] flex-col items-center justify-center">
          <div className="mt-7 mb-3 font-medium">
            {t("stake.validatorSquad.description")}
          </div>
          <SearchBox
            placeholder={t("stake.validatorSquad.searchPlaceholder")}
            onInput={handleSearchInput}
            className="self-end"
            size="full"
          />
        </div>
        <div
          className="max-h-[528px] overflow-y-scroll"
          ref={tableContainerRef}
        >
          <table className="w-full">
            <thead className="sticky top-0 m-0">
              {table
                .getHeaderGroups()
                .slice(1)
                .map((headerGroup) => (
                  <tr key={headerGroup.id} className="!bg-osmoverse-700">
                    {headerGroup.headers.map((header) => {
                      return (
                        <th key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : (
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none flex items-center gap-2"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: (
                                  <Icon
                                    id="sort-up"
                                    className={classNames(
                                      "h-[16px] w-[7px]",
                                      IS_FRONTIER
                                        ? "text-white-full"
                                        : "text-osmoverse-300"
                                    )}
                                  />
                                ),
                                desc: (
                                  <Icon
                                    id="sort-down"
                                    className={classNames(
                                      "h-[16px] w-[7px]",
                                      IS_FRONTIER
                                        ? "text-white-full"
                                        : "text-osmoverse-300"
                                    )}
                                  />
                                ),
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
            </thead>
            <tbody>
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop}px` }} />
                </tr>
              )}
              {virtualRows.map(
                // @ts-ignore
                (virtualRow) => {
                  const row = rows[virtualRow.index] as Row<Validator>;
                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                }
              )}
              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mb-6 flex justify-center justify-self-end">
          <Button
            mode="special-1"
            onClick={() => console.log("set squad")}
            className="w-[383px]"
          >
            Set Squad
          </Button>
        </div>
      </ModalBase>
    );
  });

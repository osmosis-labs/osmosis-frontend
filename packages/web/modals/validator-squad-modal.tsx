import {
  ObservableQueryValidatorsInner,
  Staking,
} from "@osmosis-labs/keplr-stores";
import { Staking as StakingType } from "@osmosis-labs/keplr-stores";
import { CoinPretty, Currency, Dec, Int, RatePretty } from "@osmosis-labs/unit";
import { normalizeUrl, truncate } from "@osmosis-labs/utils";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  CellContext,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  Fragment,
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FallbackImg } from "~/components/assets";
import { ExternalLinkIcon, Icon } from "~/components/assets";
import { SearchBox } from "~/components/input";
import { StakeOrEdit } from "~/components/types";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useTranslation } from "~/hooks";
import { useInactiveDelegations } from "~/hooks/use-inactive-delegations";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import {
  getRedelegationPreferenceUpdate,
  getTopThirdValidators,
  InactiveDelegation,
  splitRedelegations,
} from "~/utils/inactive-delegations";

const CONSTANTS = {
  HIGH_APR: "0.2",
  /** Longer validator names are cut so one long name can't widen the column. */
  MAX_NAME_LENGTH: 29,
};

/** Cuts by code point so an emoji in a long name is never split. */
const truncateName = (name: string) => {
  const chars = Array.from(name);
  return chars.length > CONSTANTS.MAX_NAME_LENGTH
    ? chars.slice(0, CONSTANTS.MAX_NAME_LENGTH).join("").trimEnd() + "..."
    : name;
};

declare module "@tanstack/table-core" {
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

type FormattedValidator = {
  validatorName: string;
  myStake: Dec;
  formattedMyStake: string;
  votingPower: Dec;
  formattedVotingPower: string;
  commissions: Dec;
  formattedCommissions: string;
  formattedWebsite: string;
  website: string;
  operatorAddress: string;
  /** Set for a validator outside the active set; such rows can't be selected. */
  inactiveStatus?: InactiveDelegation["status"];
  /** Among the largest validators holding the first third of bonded stake. */
  isTopThird: boolean;
};

interface ValidatorSquadModalProps extends ModalBaseProps {
  usersValidatorsMap: Map<string, Staking.Delegation>;
  validators: Staking.Validator[];
  usersValidatorSetPreferenceMap: Map<string, string>;
  action: StakeOrEdit;
  coin: {
    currency: Currency;
    amount: string;
    denom: Currency;
  };
  queryValidators: ObservableQueryValidatorsInner;
  /** Move the stake on inactive validators to the selected ones, instead of
   *  setting the squad. */
  isRedelegating?: boolean;
}

export const ValidatorSquadModal: FunctionComponent<ValidatorSquadModalProps> =
  observer(
    ({
      onRequestClose,
      isOpen,
      action,
      coin,
      queryValidators,
      usersValidatorsMap,
      validators,
      usersValidatorSetPreferenceMap,
      isRedelegating = false,
    }) => {
      // chain
      const { chainStore, accountStore, queriesStore } = useStore();
      const osmosisChainId = chainStore.osmosis.chainId;
      const queries = queriesStore.get(osmosisChainId);

      const { chainId } = chainStore.osmosis;

      const account = accountStore.getWallet(chainId);

      // i18n
      const { t, language } = useTranslation();

      const { inactiveDelegations } = useInactiveDelegations();
      const delegatorValidators =
        queries.cosmos.queryDelegatorValidators.getQueryBech32Address(
          account?.address ?? ""
        ).validators;

      const [globalFilter, setGlobalFilter] = useState("");
      const [showTopThird, setShowTopThird] = useState(false);

      const totalStakePool = queries.cosmos.queryPool.bondedTokens;

      // table
      const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

      const tableContainerRef = useRef<HTMLDivElement>(null);

      const getMyStake = useCallback(
        (validator: StakingType.Validator) =>
          new Dec(
            usersValidatorsMap.has(validator.operator_address)
              ? usersValidatorsMap.get(validator.operator_address)?.balance
                  ?.amount || 0
              : 0
          ),
        [usersValidatorsMap]
      );

      const getVotingPower = useCallback(
        (validator: StakingType.Validator) =>
          totalStakePool.toDec().isZero() // should not divide by 0
            ? new Dec(0)
            : new Dec(validator.tokens).quo(totalStakePool.toDec()),
        [totalStakePool]
      );

      const getFormattedVotingPower = useCallback(
        (votingPower: Dec) =>
          new RatePretty(votingPower)
            .moveDecimalPointLeft(totalStakePool.currency.coinDecimals)
            .maxDecimals(2)
            .toString(),
        [totalStakePool.currency.coinDecimals]
      );

      const getFormattedMyStake = useCallback(
        (myStake: Dec) =>
          new CoinPretty(totalStakePool.currency, myStake)
            .maxDecimals(2)
            .hideDenom(true)
            .toString(),
        [totalStakePool.currency]
      );

      const getCommissions = useCallback(
        (validator: StakingType.Validator) =>
          new Dec(validator.commission.commission_rates.rate),
        []
      );

      const getFormattedCommissions = useCallback(
        (commissions: Dec) => new RatePretty(commissions)?.toString(),
        []
      );

      const getIsAPRTooHigh = useCallback(
        (commissions: Dec) => commissions.gt(new Dec(CONSTANTS.HIGH_APR)),
        []
      );

      const getFormattedWebsite = useCallback((website: string) => {
        const displayUrl = normalizeUrl(website);
        const truncatedDisplayUrl = truncate(displayUrl, 40);
        return truncatedDisplayUrl;
      }, []);

      const topThird = useMemo(
        () => getTopThirdValidators(validators),
        [validators]
      );

      const { data, stakedCount, topThirdCount } = useMemo(() => {
        const toRow = (
          validator: StakingType.Validator,
          inactiveStatus?: InactiveDelegation["status"]
        ): FormattedValidator => {
          // an inactive validator has no share of the bonded stake
          const votingPower = inactiveStatus
            ? new Dec(0)
            : getVotingPower(validator);
          const myStake = getMyStake(validator);

          const formattedVotingPower = inactiveStatus
            ? "-"
            : getFormattedVotingPower(votingPower);
          const formattedMyStake = getFormattedMyStake(myStake);

          const commissions = getCommissions(validator);
          const formattedCommissions = getFormattedCommissions(commissions);

          const website = validator?.description?.website || "";
          const formattedWebsite = getFormattedWebsite(website || "");

          const validatorName = validator?.description?.moniker || "";

          const operatorAddress = validator?.operator_address;

          return {
            validatorName,
            myStake,
            formattedMyStake,
            votingPower,
            formattedVotingPower,
            commissions,
            formattedCommissions,
            formattedWebsite,
            website,
            operatorAddress,
            inactiveStatus,
            isTopThird: topThird.has(operatorAddress),
          };
        };

        const bondedRows = validators
          .filter(({ description }) => Boolean(description.moniker))
          .filter((validator) => {
            const commissions = getCommissions(validator);
            const isAPRTooHigh = getIsAPRTooHigh(commissions);
            return !isAPRTooHigh; // don't include validators where commissions >20%
          })
          .map((validator) => toRow(validator));

        // the user's own inactive validators are listed (unselectable) whatever
        // their commission, so they can see the stake that needs moving
        const bondedAddresses = new Set(
          validators.map(({ operator_address }) => operator_address)
        );
        const inactiveRows = inactiveDelegations.flatMap(
          ({ operatorAddress, status }) => {
            if (bondedAddresses.has(operatorAddress)) return [];
            const validator = delegatorValidators.find(
              ({ operator_address }) => operator_address === operatorAddress
            );
            return validator ? [toRow(validator, status)] : [];
          }
        );

        // Fixed order: staked validators first by My Stake,
        // then the rest by voting power. The top third would lead that rest,
        // so it is folded away behind a bar until asked for (search shows it,
        // and any the user already prefers stay visible).
        const byDesc =
          (key: "myStake" | "votingPower") =>
          (a: FormattedValidator, b: FormattedValidator) =>
            a[key].gt(b[key]) ? -1 : a[key].lt(b[key]) ? 1 : 0;

        const staked = [
          ...inactiveRows,
          ...bondedRows.filter(({ myStake }) => myStake.isPositive()),
        ].sort(byDesc("myStake"));
        const unstaked = bondedRows
          .filter(({ myStake }) => !myStake.isPositive())
          .sort(byDesc("votingPower"));
        const topThirdRows = unstaked.filter(({ isTopThird }) => isTopThird);
        const visibleTopThird =
          showTopThird || globalFilter
            ? topThirdRows
            : topThirdRows.filter(({ operatorAddress }) =>
                usersValidatorSetPreferenceMap.has(operatorAddress)
              );

        return {
          data: [
            ...staked,
            ...visibleTopThird,
            ...unstaked.filter(({ isTopThird }) => !isTopThird),
          ],
          stakedCount: staked.length,
          topThirdCount: topThirdRows.length,
        };
      }, [
        validators,
        getVotingPower,
        getMyStake,
        getFormattedVotingPower,
        getFormattedMyStake,
        getCommissions,
        getFormattedCommissions,
        getIsAPRTooHigh,
        getFormattedWebsite,
        inactiveDelegations,
        delegatorValidators,
        topThird,
        usersValidatorSetPreferenceMap,
        showTopThird,
        globalFilter,
      ]);

      const columns = [
        {
          id: "validatorSquadTable",
          columns: [
            {
              id: "select",
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => (
                  <div className="flex h-full items-center justify-center">
                    <Checkbox
                      checked={props.row.getIsSelected()}
                      disabled={!props.row.getCanSelect()}
                      onClick={props.row.getToggleSelectedHandler()}
                    />
                  </div>
                )
              ),
            },
            {
              id: "validatorName",
              accessorKey: "validatorName",
              header: () => t("stake.validatorSquad.column.validator"),
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => {
                  const formattedWebsite = props.row.original.formattedWebsite;
                  const website = props.row.original.website;

                  const operatorAddress = props.row.original.operatorAddress;

                  // inactive validators aren't in the bonded list the
                  // thumbnails come from, so they get a placeholder
                  const imageUrl = props.row.original.inactiveStatus
                    ? "/icons/question-mark.svg"
                    : queryValidators.getValidatorThumbnail(operatorAddress);

                  return (
                    <div className="flex max-w-[28rem] items-center gap-3 md:max-w-none md:gap-2">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <FallbackImg
                          alt={props.row.original.validatorName}
                          // an empty src never fires onError, so it would show
                          // a broken image instead of the fallback
                          src={imageUrl || "/icons/superfluid-osmo.svg"}
                          fallbacksrc="/icons/superfluid-osmo.svg"
                          height={40}
                          width={40}
                        />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <div className="subtitle1 md:subtitle2 truncate text-left">
                          {truncateName(props.row.original.validatorName)}
                        </div>
                        {props.row.original.inactiveStatus && (
                          <span className="caption text-left text-rust-300">
                            {t(
                              props.row.original.inactiveStatus === "jailed"
                                ? "stake.inactiveValidators.statusJailed"
                                : "stake.inactiveValidators.statusInactive"
                            )}
                          </span>
                        )}
                        {Boolean(website) && (
                          <span className="text-left text-xs text-wosmongton-100">
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <span className="truncate">
                                {formattedWebsite}
                              </span>
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
                }
              ),
            },
            {
              id: "myStake",
              accessorKey: "myStake",
              header: () => t("stake.validatorSquad.column.myStake"),
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => {
                  const formattedMyStake = props.row.original.formattedMyStake;

                  return (
                    <div className="w-full text-right">
                      {props.row.original.myStake.isPositive()
                        ? formattedMyStake
                        : ""}
                    </div>
                  );
                }
              ),
            },
            {
              id: "votingPower",
              accessorKey: "votingPower",
              header: () => t("stake.validatorSquad.column.votingPower"),
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => {
                  const formattedVotingPower =
                    props.row.original.formattedVotingPower;

                  return (
                    <div className="w-full whitespace-nowrap text-right">
                      {formattedVotingPower}
                    </div>
                  );
                }
              ),
            },
            {
              id: "commissions",
              accessorKey: "commissions",
              header: () => t("stake.validatorSquad.column.commission"),
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => {
                  const formattedCommissions =
                    props.row.original.formattedCommissions;

                  return (
                    <div className="text-white text-right">
                      {formattedCommissions}
                    </div>
                  );
                }
              ),
            },
          ],
        },
      ];

      const table = useReactTable({
        data,
        columns,
        state: {
          rowSelection,
          globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        // key selection by validator so it survives rows being shown or hidden
        getRowId: (row) => row.operatorAddress,
        enableRowSelection: (row) => !row.original.inactiveStatus,
        // the order is fixed and built into data
        enableSorting: false,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
      });

      // matches the user's valsetpref (if any) to the table model, and sets default checkboxes accordingly via id
      useEffect(() => {
        if (isRedelegating) return;

        const defaultusersValidatorSetPreferenceMap = new Set(
          usersValidatorSetPreferenceMap.keys()
        );

        setRowSelection((currentRowSelection) => {
          const defaultRowSelection = { ...currentRowSelection };

          table.getRowModel().flatRows.forEach((row) => {
            if (
              row.getCanSelect() &&
              defaultusersValidatorSetPreferenceMap.has(
                row.original.operatorAddress
              )
            ) {
              defaultRowSelection[row.id] = true;
            }
          });

          return Object.keys(defaultRowSelection).some(
            (id) => defaultRowSelection[id] !== currentRowSelection[id]
          )
            ? defaultRowSelection
            : currentRowSelection;
        });
      }, [table, usersValidatorSetPreferenceMap, isRedelegating]);

      // when redelegating, start from the squad minus its inactive validators:
      // the stored preference if there is one, else the active validators the
      // user already delegates to
      const inactiveAddresses = useMemo(
        () =>
          new Set(
            inactiveDelegations.map(({ operatorAddress }) => operatorAddress)
          ),
        [inactiveDelegations]
      );
      useEffect(() => {
        if (!isOpen || !isRedelegating) return;

        const squad = usersValidatorSetPreferenceMap.size
          ? [...usersValidatorSetPreferenceMap.keys()]
          : [...usersValidatorsMap.keys()];
        const bondedAddresses = new Set(
          validators.map(({ operator_address }) => operator_address)
        );

        setRowSelection(
          Object.fromEntries(
            squad
              .filter(
                (address) =>
                  !inactiveAddresses.has(address) &&
                  bondedAddresses.has(address)
              )
              .map((address) => [address, true])
          )
        );
      }, [
        isOpen,
        isRedelegating,
        usersValidatorSetPreferenceMap,
        usersValidatorsMap,
        validators,
        inactiveAddresses,
      ]);

      const selectedOperatorAddresses = useMemo(
        () =>
          Object.keys(rowSelection).filter(
            (address) =>
              rowSelection[address] && !inactiveAddresses.has(address)
          ),
        [rowSelection, inactiveAddresses]
      );

      const setSquadButtonDisabled = selectedOperatorAddresses.length === 0;

      const handleSetSquadClick = useCallback(async () => {
        // TODO disable cases for button, disable if none selected, if weights and list is same

        const operatorAddresses = selectedOperatorAddresses;

        // throw or return
        if (!account) return;

        if (isRedelegating) {
          const redelegations = splitRedelegations(
            inactiveDelegations,
            operatorAddresses
          );
          if (!redelegations.length) return;

          await account.osmosis.sendRedelegateMsgs(
            redelegations,
            getRedelegationPreferenceUpdate(
              [...usersValidatorSetPreferenceMap.keys()],
              operatorAddresses
            ),
            "",
            onRequestClose
          );
          return;
        }

        // stake button
        if (action === "stake") {
          await account.osmosis.sendSetValidatorSetPreferenceAndDelegateToValidatorSetMsg(
            operatorAddresses,
            coin,
            "",
            onRequestClose
          );
        } else {
          // edit / view all
          await account.osmosis.sendSetValidatorSetPreferenceMsg(
            operatorAddresses,
            "",
            onRequestClose
          );
        }
      }, [
        selectedOperatorAddresses,
        account,
        isRedelegating,
        inactiveDelegations,
        usersValidatorSetPreferenceMap,
        onRequestClose,
        coin,
        action,
      ]);

      const totalInactiveStake = useMemo(
        () =>
          new CoinPretty(
            totalStakePool.currency,
            inactiveDelegations.reduce(
              (acc, { amount }) => acc.add(amount),
              new Int(0)
            )
          )
            .maxDecimals(2)
            .toString(),
        [inactiveDelegations, totalStakePool.currency]
      );

      const { rows } = table.getRowModel();

      const showTopThirdBar = topThirdCount > 0 && !globalFilter;
      // the bar and the top-third rows under it read as one box
      const isInTopThirdBox = (index: number) =>
        showTopThirdBar &&
        Boolean(rows[index]) &&
        index >= stakedCount &&
        rows[index].original.isTopThird;
      const topThirdBoxIsOpen = isInTopThirdBox(stakedCount);
      // the whole bar toggles the top-third rows
      const topThirdBar = (
        <tr
          key="top-third-bar"
          className="bg-osmoverse-800 transition-colors hover:cursor-pointer hover:bg-osmoverse-700"
          onClick={() => setShowTopThird(!showTopThird)}
        >
          <td
            colSpan={table.getAllColumns()[0].columns.length}
            className={classNames(
              "!p-0",
              topThirdBoxIsOpen && "!rounded-b-none"
            )}
          >
            <button
              type="button"
              aria-expanded={showTopThird}
              className="flex w-full items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Icon
                  id="pie-chart"
                  color={theme.colors.rust["200"]}
                  className="w-6 shrink-0"
                />
                <span className="body2 text-left text-osmoverse-200">
                  {showTopThird
                    ? t("stake.inactiveValidators.topThirdShown")
                    : t("stake.inactiveValidators.topThirdHidden")}
                </span>
              </div>
              <Icon
                id={showTopThird ? "chevron-up" : "chevron-down"}
                className="h-4 w-4 shrink-0 text-wosmongton-300"
              />
            </button>
          </td>
        </tr>
      );

      return (
        <ModalBase
          title={t("stake.validatorSquad.title")}
          isOpen={isOpen}
          onRequestClose={onRequestClose}
          className="flex !max-w-[1168px] flex-col"
        >
          <div className="mx-auto mb-[1.125rem] flex max-w-[1040px] flex-col items-center justify-center text-center md:max-w-[500px]">
            <div className="mb-3 mt-7 font-medium">
              {isRedelegating
                ? t("stake.inactiveValidators.redelegateDescription", {
                    amount: totalInactiveStake,
                  })
                : t("stake.validatorSquad.description")}
            </div>
            <SearchBox
              placeholder={t("stake.validatorSquad.searchPlaceholder")}
              className="self-end"
              size="full"
              onInput={(value) => setGlobalFilter(String(value))}
              currentValue={globalFilter ?? ""}
            />
          </div>
          <div
            className="overflow-y-scroll md:max-h-[18.75rem]" // 528px & md:300px
            ref={tableContainerRef}
          >
            <table className="w-full table-auto">
              <thead>
                {table
                  .getHeaderGroups()
                  .slice(1)
                  .map((headerGroup) => (
                    <tr className="top-0 bg-osmoverse-850" key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            // hyphenation needs a language, and <html> has none
                            lang={language}
                            className={classNames(
                              // smaller headers so every column fits on mobile;
                              // long ones wrap, hyphenating single words
                              "md:!px-1 md:text-xs md:[hyphens:auto]"
                            )}
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className={classNames(
                                  "flex items-center gap-2",
                                  // text alignment too, for headers that wrap
                                  header.column.id === "validatorName"
                                    ? "justify-start text-left"
                                    : "justify-end text-right"
                                )}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.getAllColumns()[0].columns.length}
                      className="h-32 text-center"
                    >
                      <h6>{t("stake.validatorSquad.noResults")}</h6>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => {
                    const cells = row?.getVisibleCells();
                    const rowElement = (
                      <tr
                        key={row?.id}
                        className={classNames(
                          row.getCanSelect()
                            ? `transition-colors focus-within:bg-osmoverse-700 focus-within:outline-none hover:cursor-pointer hover:bg-osmoverse-700`
                            : "bg-rust-800/20",
                          row.getIsSelected()
                            ? "bg-osmoverse-700"
                            : row.original.isTopThird && "bg-osmoverse-800",
                          // square inside the top-third box, rounded at its foot
                          isInTopThirdBox(index) &&
                            (isInTopThirdBox(index + 1)
                              ? "[&>td]:!rounded-none"
                              : "[&>td]:!rounded-t-none")
                        )}
                        onClick={row.getToggleSelectedHandler()}
                      >
                        {cells?.map((cell) => {
                          return (
                            <td
                              key={cell.id}
                              className={classNames(
                                "text-left",
                                // on mobile the name takes whatever width the
                                // other columns leave, truncating at its edge
                                cell.column.id === "validatorName" &&
                                  "md:w-full md:max-w-0"
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );

                    // the top-third bar sits between the staked validators and
                    // the rest
                    return index === stakedCount && showTopThirdBar ? (
                      <Fragment key={row.id}>
                        {topThirdBar}
                        {rowElement}
                      </Fragment>
                    ) : (
                      rowElement
                    );
                  })
                )}
                {showTopThirdBar && stakedCount >= rows.length && topThirdBar}
              </tbody>
            </table>
          </div>
          <div className="mb-6 mt-4 flex justify-center justify-self-end">
            <Button
              className="w-80"
              disabled={setSquadButtonDisabled}
              variant="success"
              onClick={handleSetSquadClick}
            >
              {isRedelegating
                ? t("stake.inactiveValidators.redelegate")
                : action === "stake"
                  ? t("stake.validatorSquad.button2")
                  : t("stake.validatorSquad.button")}
            </Button>
          </div>
        </ModalBase>
      );
    }
  );

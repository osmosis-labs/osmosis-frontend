import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { BondStatus } from "@osmosis-labs/types";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo, useState } from "react";

import { SearchBox } from "~/components/input";
import { Spinner } from "~/components/loaders";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { Table } from "~/components/table";
import { ValidatorInfoCell } from "~/components/table/cells/";
import { InfoTooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { useFilteredData, useSortedData } from "~/hooks/data";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

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

  const account = accountStore.getWallet(accountStore.osmosisChainId);

  const { data: validators, isLoading: isLoadingAllValidators } =
    api.edge.staking.getValidators.useQuery({
      status: BondStatus.Bonded,
    });

  const { data: userValidatorDelegations, isLoading: isLoadingUserValidators } =
    api.edge.staking.getUserDelegations.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
      },
      {
        enabled: !!account?.address,
      }
    );

  const isLoadingValidators = isLoadingAllValidators || isLoadingUserValidators;

  const { data: osmoEquivalent, isLoading: isLoadingOsmoEquivalent } =
    api.edge.staking.getOsmoEquivalent.useQuery(availableBondAmount!.toCoin(), {
      enabled: !!availableBondAmount,
    });

  // vals from 0..<1 used to initially & randomly sort validators in `isDelegated` key
  const randomSortVals = useMemo(
    () => validators?.map(() => Math.random()) ?? [],
    [validators]
  );

  // get minimum info for display, mark validators users are delegated to
  const activeDelegatedValidators: {
    address: string;
    validatorName?: string;
    validatorImgSrc?: string;
    validatorCommission: RatePretty;
    isDelegated: number;
  }[] = useMemo(
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

  const [
    sortKey,
    setSortKey,
    sortDirection,
    _,
    toggleSortDirection,
    sortedData,
  ] = useSortedData(activeDelegatedValidators, "isDelegated", "descending");
  const [query, setQuery, searchedValidators] = useFilteredData(sortedData, [
    "validatorName",
    "validatorCommission",
    "isDelegated",
  ]);
  const [selectedValidatorAddress, setSelectedValidatorAddress] = useState<
    string | null
  >(null);

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
        <div className="h-72 overflow-x-clip overflow-y-scroll">
          {isLoadingValidators ? (
            <div className="mx-auto w-fit pt-4">
              <Spinner />
            </div>
          ) : (
            <Table
              className="w-full"
              headerTrClassName="!bg-osmoverse-800 top-0 !h-11"
              columnDefs={[
                {
                  display: t("superfluidValidator.columns.validator"),
                  className: classNames(
                    "text-left",
                    isMobile ? "caption" : undefined
                  ),
                  sort:
                    sortKey === "validatorName"
                      ? {
                          onClickHeader: toggleSortDirection,
                          currentDirection: sortDirection,
                        }
                      : { onClickHeader: () => setSortKey("validatorName") },
                  displayCell: ValidatorInfoCell,
                },
                {
                  display: t("superfluidValidator.columns.commission"),
                  className: classNames(
                    "text-right !pr-3",
                    isMobile ? "caption" : undefined
                  ),
                  sort:
                    sortKey === "validatorCommission"
                      ? {
                          onClickHeader: toggleSortDirection,
                          currentDirection: sortDirection,
                        }
                      : {
                          onClickHeader: () =>
                            setSortKey("validatorCommission"),
                        },
                },
              ]}
              rowDefs={searchedValidators.map(({ address, isDelegated }) => ({
                makeClass: () =>
                  `!h-fit ${
                    address === selectedValidatorAddress
                      ? "border border-osmoverse-500"
                      : isDelegated === 1
                      ? "bg-osmoverse-800"
                      : "bg-osmoverse-900"
                  }`,
                makeHoverClass: () => "bg-osmoverse-900",
                onClick: () => setSelectedValidatorAddress(address),
              }))}
              data={searchedValidators.map(
                ({ validatorName, validatorImgSrc, validatorCommission }) => [
                  { value: validatorName, imgSrc: validatorImgSrc },
                  { value: validatorCommission.toString() },
                ]
              )}
            />
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
            account?.txTypeInProgress !== ""
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

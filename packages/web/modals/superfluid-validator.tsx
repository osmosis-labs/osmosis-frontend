import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { useWindowSize } from "~/hooks";

import { Button } from "../components/buttons";
import { SearchBox } from "../components/input";
import { Table } from "../components/table";
import { ValidatorInfoCell } from "../components/table/cells/";
import { InfoTooltip } from "../components/tooltip";
import { useFilteredData, useSortedData } from "../hooks/data";
import { useStore } from "../stores";
import { ModalBase, ModalBaseProps } from "./base";

export const SuperfluidValidatorModal: FunctionComponent<
  {
    availableBondAmount?: CoinPretty;
    onSelectValidator: (address: string) => void;
  } & ModalBaseProps
> = observer((props) => {
  const { availableBondAmount, onSelectValidator } = props;
  const t = useTranslation();
  const { chainStore, queriesStore, accountStore } = useStore();
  const { isMobile } = useWindowSize();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const queries = queriesStore.get(chainId);
  const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const activeValidators = queryValidators.validators;
  const userValidatorDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account?.address ?? ""
    ).delegations;
  const isSendingMsg = account?.txTypeInProgress !== "";

  // vals from 0..<1 used to initially & randomly sort validators in `isDelegated` key
  const randomSortVals = useMemo(
    () => activeValidators.map(() => Math.random()),
    [activeValidators]
  );

  // get minimum info for display, mark validators users are delegated to
  const activeDelegatedValidators: {
    address: string;
    validatorName?: string;
    validatorImgSrc?: string;
    validatorCommission: RatePretty;
    isDelegated: number;
  }[] = activeValidators.map(
    ({ operator_address, description, commission }, index) => {
      const validatorImg =
        queryValidators.getValidatorThumbnail(operator_address);
      return {
        address: operator_address,
        validatorName: description.moniker,
        validatorImgSrc: validatorImg === "" ? undefined : validatorImg,
        validatorCommission: new RatePretty(commission.commission_rates.rate),
        isDelegated: userValidatorDelegations.some(
          ({ delegation }) => delegation.validator_address === operator_address
        )
          ? 1 // = new Dec(1)
          : randomSortVals[index], // = new Dec(0..<1)
      };
    }
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
          <span className="subtitle1 mr-auto">
            {t("superfluidValidator.choose")}
          </span>
          <SearchBox
            className={isMobile ? "!w-full !rounded" : undefined}
            currentValue={query}
            onInput={setQuery}
            placeholder={t("superfluidValidator.search")}
            size={isMobile ? "medium" : "small"}
          />
        </div>
        <div className="h-72 overflow-x-clip overflow-y-scroll">
          <Table
            className="w-full"
            tHeadClassName="sticky top-0"
            headerTrClassName="!h-11"
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
                        onClickHeader: () => setSortKey("validatorCommission"),
                      },
              },
            ]}
            rowDefs={searchedValidators.map(({ address, isDelegated }) => ({
              makeClass: () =>
                `!h-fit ${
                  address === selectedValidatorAddress
                    ? "bg-osmoverse-800 border border-osmoverse-500"
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
                ~
                {queries.osmosis?.querySuperfluidOsmoEquivalent
                  .calculateOsmoEquivalent(availableBondAmount)
                  .maxDecimals(3)
                  .trim(true)
                  .toString() ?? "0"}
                <InfoTooltip
                  className="ml-1"
                  content={t("superfluidValidator.estimationInfo")}
                />
              </span>
            </div>
          </div>
        )}
        <Button
          disabled={selectedValidatorAddress === null || isSendingMsg}
          onClick={() => {
            if (selectedValidatorAddress !== null) {
              onSelectValidator(selectedValidatorAddress);
            }
          }}
        >
          {t("superfluidValidator.buttonBond")}
        </Button>
      </div>
    </ModalBase>
  );
});

import { FunctionComponent, useState, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { ModalBase, ModalBaseProps } from "./base";
import { useStore } from "../stores";
import { SearchBox } from "../components/input";
import { Button } from "../components/buttons";
import { Table } from "../components/table";
import { ValidatorInfoCell } from "../components/table/cells/";
import { InfoTooltip } from "../components/tooltip";
import { useFilteredData, useSortedData } from "../hooks/data";
import { useWindowSize } from "../hooks/window";

interface Props extends ModalBaseProps {
  availableBondAmount: CoinPretty;
  onSelectValidator: (address: string) => void;
  isSendingMsg?: boolean;
}

export const SuperfluidValidatorModal: FunctionComponent<Props> = observer(
  (props) => {
    const { availableBondAmount, onSelectValidator, isSendingMsg } = props;
    const { chainStore, queriesStore, accountStore } = useStore();
    const { isMobile } = useWindowSize();

    const { chainId } = chainStore.osmosis;
    const account = accountStore.getAccount(chainId);
    const queries = queriesStore.get(chainId);
    const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Bonded
    );

    const activeValidators = queryValidators.validators;
    const userValidatorDelegations =
      queries.cosmos.queryDelegations.getQueryBech32Address(
        account.bech32Address
      ).delegations;

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
            ({ delegation }) =>
              delegation.validator_address === operator_address
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
        <div className="flex flex-col gap-2.5 mt-8">
          <div className="flex md:flex-col gap-2.5 mb-1 items-center place-content-between">
            <span className="subtitle2 mr-auto">
              Choose your superfluid validator
            </span>
            <SearchBox
              className={isMobile ? "!rounded !w-full h-11" : undefined}
              currentValue={query}
              onInput={setQuery}
              placeholder="Search by name"
            />
          </div>
          <div className="overflow-y-scroll overflow-x-clip h-72">
            <Table
              className="w-full"
              tHeadClassName="sticky top-0"
              headerTrClassName="body2 text-wireframes-grey !h-11"
              columnDefs={[
                {
                  display: "Validator",
                  className: isMobile ? "caption" : undefined,
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
                  display: "Commission",
                  className: `text-right ${isMobile ? "caption" : undefined}`,
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
                      ? "bg-selected-validator border border-[#E13CBD]"
                      : isDelegated === 1
                      ? "bg-cardInner"
                      : "bg-surface"
                  }`,
                makeHoverClass: () => "bg-card",
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
          <div className="flex flex-col md:gap-2 gap-4 py-3 px-5 rounded-xl border border-white-faint bg-card">
            <div className="flex items-center place-content-between">
              <span className="md:caption subtitle1">Bonded Amount</span>
              <span className="md:caption body1 text-white-mid">
                {availableBondAmount.maxDecimals(2).trim(true).toString()}
              </span>
            </div>
            <div className="flex items-center place-content-between">
              <span className="md:caption subtitle1">
                {isMobile
                  ? "Est. Delegation"
                  : "Estimated Superfluid Delegation"}
              </span>
              <span className="md:caption flex items-center body1 text-white-mid">
                ~
                {queries.osmosis?.querySuperfluidOsmoEquivalent
                  .calculateOsmoEquivalent(availableBondAmount)
                  .maxDecimals(3)
                  .trim(true)
                  .toString() ?? "0"}
                <InfoTooltip
                  className="ml-1"
                  content="The value of this delegation fluctuates and is estimated based on the amount of OSMO in the pool."
                />
              </span>
            </div>
          </div>
          <Button
            className="h-14 md:w-full w-96 mt-3 mx-auto"
            size="lg"
            disabled={selectedValidatorAddress === null || isSendingMsg}
            onClick={() => {
              if (selectedValidatorAddress !== null) {
                onSelectValidator(selectedValidatorAddress);
              }
            }}
          >
            Bond {"&"} Stake
          </Button>
        </div>
      </ModalBase>
    );
  }
);

import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import { SortingState } from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { SearchBox } from "~/components/input";
import {
  FormattedValidator,
  ValidatorSquadTable,
} from "~/components/stake/validator-squad-table";
import { EventName } from "~/config";
import { useFilteredData } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { normalizeUrl, truncateString } from "~/utils/string";

interface ValidatorSquadModalProps extends ModalBaseProps {
  usersValidatorsMap: Map<string, Staking.Delegation>;
  validators: Staking.Validator[];
}

const CONSTANTS = {
  HIGH_APR: "0.3",
  HIGH_VOTING_POWER: "0.015",
};

export const ValidatorSquadModal2: FunctionComponent<ValidatorSquadModalProps> =
  observer(({ onRequestClose, isOpen, usersValidatorsMap, validators }) => {
    // chain
    const { chainStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const queries = queriesStore.get(chainId);

    const totalStakePool = queries.cosmos.queryPool.bondedTokens;

    const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Bonded
    );

    // i18n
    const t = useTranslation();

    const { logEvent } = useAmplitudeAnalytics();

    const defaultUserValidatorsSet = new Set(usersValidatorsMap.keys());

    const [selectedValidators, setSelectedValidators] = useState(
      defaultUserValidatorsSet
    );

    const getMyStake = useCallback(
      (validator: Staking.Validator) =>
        new Dec(
          usersValidatorsMap.has(validator.operator_address)
            ? usersValidatorsMap.get(validator.operator_address)?.balance
                ?.amount || 0
            : 0
        ),
      [usersValidatorsMap]
    );

    const getVotingPower = useCallback(
      (validator: Staking.Validator) =>
        Boolean(totalStakePool.toDec())
          ? new Dec(validator.tokens).quo(totalStakePool.toDec())
          : new Dec(0),
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
      (myStake) =>
        new CoinPretty(totalStakePool.currency, myStake)
          .maxDecimals(2)
          .hideDenom(true)
          .toString(),
      [totalStakePool.currency]
    );

    const getCommissions = useCallback(
      (validator: Staking.Validator) =>
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

    const getIsVotingPowerTooHigh = useCallback(
      (votingPower: Dec) =>
        new RatePretty(votingPower)
          .moveDecimalPointLeft(totalStakePool.currency.coinDecimals)
          .toDec()
          .gt(new Dec(CONSTANTS.HIGH_VOTING_POWER)),
      [totalStakePool.currency.coinDecimals]
    );

    const getFormattedWebsite = useCallback((website: string) => {
      const displayUrl = normalizeUrl(website);
      const truncatedDisplayUrl = truncateString(displayUrl, 30);
      return truncatedDisplayUrl;
    }, []);

    const getImageUrl = useCallback(
      (operator_address) =>
        queryValidators.getValidatorThumbnail(operator_address),
      [queryValidators]
    );

    const rawData: FormattedValidator[] = useMemo(
      () =>
        validators
          .filter(({ description }) => Boolean(description.moniker))
          .map((validator) => {
            const votingPower = getVotingPower(validator);
            const myStake = getMyStake(validator);

            const formattedVotingPower = getFormattedVotingPower(votingPower);
            const formattedMyStake = getFormattedMyStake(myStake);

            const commissions = getCommissions(validator);
            const formattedCommissions = getFormattedCommissions(commissions);

            const isAPRTooHigh = getIsAPRTooHigh(commissions);
            const isVotingPowerTooHigh = getIsVotingPowerTooHigh(votingPower);

            const website = validator?.description?.website || "";
            const formattedWebsite = getFormattedWebsite(website || "");

            const imageUrl = getImageUrl(validator.operator_address);

            const validatorName = validator?.description?.moniker || "";

            return {
              validatorName,
              formattedMyStake,
              formattedVotingPower,
              formattedCommissions,
              formattedWebsite,
              website,
              imageUrl,
              isAPRTooHigh,
              isVotingPowerTooHigh,
            };
          }),
      [
        validators,
        getVotingPower,
        getMyStake,
        getFormattedMyStake,
        getFormattedVotingPower,
        getCommissions,
        getIsAPRTooHigh,
        getFormattedCommissions,
        getIsVotingPowerTooHigh,
        getFormattedWebsite,
        getImageUrl,
      ]
    );

    const searchValidatorsMemoedKeys = useMemo(() => ["validatorName"], []);

    const [query, _setQuery, filteredValidators] = useFilteredData(
      rawData,
      searchValidatorsMemoedKeys
    );

    // table
    const [sorting, setSorting] = useState<SortingState>([
      { id: "myStake", desc: true },
    ]);

    const setQuery = useCallback(
      (search: string) => {
        setSorting([]);
        _setQuery(search);
      },
      [_setQuery, setSorting]
    );

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const handleClick = useCallback(() => {
      const validatorNames = validators
        .filter(({ operator_address }) =>
          selectedValidators.has(operator_address)
        )
        .map(({ description }) => description.moniker);
      const numberOfValidators = selectedValidators.size;

      // TODO add set squad and stake logic

      logEvent([
        EventName.Stake.selectSquadAndStakeClicked,
        { numberOfValidators, validatorNames },
      ]);
    }, [logEvent, selectedValidators, validators]);

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
            className="self-end"
            size="full"
            onInput={setQuery}
            currentValue={query}
          />
        </div>
        <div
          className="max-h-[528px] overflow-y-scroll"
          ref={tableContainerRef}
        >
          <ValidatorSquadTable
            sorting={sorting}
            setSorting={setSorting}
            filteredValidators={filteredValidators}
          />
        </div>
        <div className="mb-6 flex justify-center justify-self-end">
          <Button mode="special-1" onClick={handleClick} className="w-[383px]">
            {t("stake.validatorSquad.button")}
          </Button>
        </div>
      </ModalBase>
    );
  });

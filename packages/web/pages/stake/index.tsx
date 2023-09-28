import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Staking as StakingType } from "@osmosis-labs/keplr-stores";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { AlertBanner } from "~/components/alert-banner";
import { MainStakeCard } from "~/components/cards/main-stake-card";
import { StakeDashboard } from "~/components/cards/stake-dashboard";
import { StakeLearnMore } from "~/components/cards/stake-learn-more";
import { Spinner } from "~/components/spinner";
import { UnbondingInProgress } from "~/components/stake/unbonding-in-progress";
import { EventName } from "~/config";
import { AmountDefault } from "~/config/user-analytics-v2";
import { useAmountConfig, useFakeFeeConfig } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { useWalletSelect } from "~/hooks/wallet-select";
import { ValidatorNextStepModal } from "~/modals/validator-next-step";
import { ValidatorSquadModal } from "~/modals/validator-squad";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

const getAmountDefault = (fraction: number | undefined): AmountDefault => {
  if (fraction === 0.5) return "half";
  if (fraction === 1) return "max";
  return "input";
};

export const Staking: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState("Stake");
  const [showValidatorModal, setShowValidatorModal] = useState(false);
  const [showValidatorNextStepModal, setShowValidatorNextStepModal] =
    useState(false);

  const t = useTranslation();

  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Stake.pageViewed],
  });

  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const { onOpenWalletSelect, isLoading } = useWalletSelect();
  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";
  const queries = queriesStore.get(osmosisChainId);

  const osmo = chainStore.osmosis.stakeCurrency;
  const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;
  const osmosisQueries = queriesStore.get(osmosisChainId).osmosis;

  const userHasValPrefs =
    osmosisQueries?.queryUsersValidatorPreferences.get(
      address
    ).hasValidatorPreferences;

  const userValidatorPreferences = useMemo(() => {
    return (
      osmosisQueries?.queryUsersValidatorPreferences.get(address)
        .validatorPreferences || []
    );
  }, [osmosisQueries, address]);

  const isFetchingValPrefs =
    osmosisQueries?.queryUsersValidatorPreferences.get(address).isFetching;

  const isWalletConnected = account?.isWalletConnected;

  useEffect(() => {
    // reset states if wallet is disconnected
    if (!isWalletConnected) {
      setShowValidatorModal(false);
      setShowValidatorNextStepModal(false);
    }
  }, [isWalletConnected]);

  // using delegateToValidatorSet gas for fee config as the gas amount is the same as undelegate
  const feeConfig = useFakeFeeConfig(
    chainStore,
    osmosisChainId,
    account?.osmosis.msgOpts.delegateToValidatorSet.gas || 0
  );

  const amountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    osmosisChainId,
    address,
    feeConfig,
    osmo
  );

  const stakeAmount = useMemo(() => {
    if (amountConfig.amount) {
      return new CoinPretty(osmo, amountConfig.amount);
    }
  }, [amountConfig.amount, osmo]);

  const primitiveAmount = amountConfig.getAmountPrimitive();

  const coin = useMemo(() => {
    return { currency: osmo, amount: primitiveAmount.amount, denom: osmo };
  }, [osmo, primitiveAmount]);

  const delegationQuery = cosmosQueries.queryDelegations.getQueryBech32Address(
    account?.address ?? ""
  );

  const unbondingDelegationsQuery =
    cosmosQueries.queryUnbondingDelegations.getQueryBech32Address(
      account?.address ?? ""
    );

  const userValidatorDelegations = delegationQuery.delegations;

  const usersValidatorsMap = useMemo(() => {
    const delegationsMap = new Map<string, StakingType.Delegation>();

    userValidatorDelegations.forEach((delegation: StakingType.Delegation) => {
      delegationsMap.set(delegation.delegation.validator_address, delegation);
    });

    return delegationsMap;
  }, [userValidatorDelegations]);

  const usersValidatorSetPreferenceMap = useMemo(() => {
    const validatorSetPreferenceMap = new Map<string, string>();

    userValidatorPreferences.forEach(
      ({
        val_oper_address,
        weight,
      }: {
        val_oper_address: string;
        weight: string;
      }) => {
        validatorSetPreferenceMap.set(val_oper_address, weight);
      }
    );

    return validatorSetPreferenceMap;
  }, [userValidatorPreferences]);

  const validatorSquadModalAction: "stake" | "edit" = Boolean(
    Number(amountConfig.amount)
  )
    ? "stake"
    : "edit";

  const amountDefault = getAmountDefault(amountConfig.fraction);
  const amount = amountConfig.amount || "0";
  const amountUSD = priceStore
    .calculatePrice(
      new CoinPretty(osmo, amountConfig.getAmountPrimitive().amount)
    )
    ?.toString();

  const squadSize = usersValidatorsMap.size;

  const stakeCall = useCallback(() => {
    logEvent([
      EventName.Stake.stakingStarted,
      {
        amountDefault,
        amount,
        amountUSD,
      },
    ]);

    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis.sendDelegateToValidatorSetMsg(
        coin,
        "",
        (tx: DeliverTxResponse) => {
          if (tx.code === 0) {
            logEvent([
              EventName.Stake.stakingCompleted,
              { amountDefault, amount, amountUSD, squadSize },
            ]);
          }
        }
      );
    } else {
      console.error("Account address is undefined");
    }
  }, [
    account?.address,
    account?.osmosis,
    amount,
    amountDefault,
    amountUSD,
    coin,
    logEvent,
    squadSize,
  ]);

  const unstakeCall = useCallback(() => {
    logEvent([
      EventName.Stake.unstakingStarted,
      {
        amountDefault,
        amount,
        amountUSD,
      },
    ]);

    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis.sendUndelegateFromValidatorSetMsg(
        coin,
        "",
        (tx: DeliverTxResponse) => {
          if (tx.code === 0) {
            logEvent([
              EventName.Stake.unstakingCompleted,
              { amountDefault, amount, amountUSD, squadSize },
            ]);
          }
        }
      );
    } else {
      console.error("Account address is undefined");
    }
  }, [
    account?.address,
    account?.osmosis,
    amount,
    amountDefault,
    amountUSD,
    coin,
    logEvent,
    squadSize,
  ]);

  const isNewUser = !userHasValPrefs && usersValidatorsMap.size === 0;

  const onStakeButtonClick = useCallback(() => {
    if (!isWalletConnected) {
      onOpenWalletSelect(osmosisChainId);
      return;
    }

    const selectedKeepValidators = localStorage.getItem("keepValidators");
    if (activeTab === "Stake") {
      if (selectedKeepValidators && !isNewUser) {
        stakeCall();
      } else if (selectedKeepValidators === null) {
        //user has not saved keepValidators in local storage
        setShowValidatorNextStepModal(true);
      } else {
        setShowValidatorModal(true);
      }
    } else {
      unstakeCall();
    }
  }, [
    isWalletConnected,
    activeTab,
    onOpenWalletSelect,
    osmosisChainId,
    isNewUser,
    stakeCall,
    unstakeCall,
  ]);

  const queryValidators = cosmosQueries.queryValidators.getQueryStatus(
    StakingType.BondStatus.Bonded
  );
  const activeValidators = queryValidators.validators;

  const summedStakedAmount = userValidatorDelegations.reduce(
    (acc: Dec, delegation: StakingType.Delegation) =>
      new Dec(delegation.balance.amount).add(acc),
    new Dec(0)
  );
  const stakingAPR = cosmosQueries.queryInflation.inflation.toDec();

  const prettifiedStakedBalance = new CoinPretty(
    osmo,
    summedStakedAmount
  ).maxDecimals(2);

  const osmoBalance = formatPretty(
    queries.queryBalances
      .getQueryBech32Address(address)
      .getBalanceFromCurrency(osmo),
    { maxDecimals: 2 }
  );

  const alertTitle = `${t("stake.alertTitleBeginning")} ${stakingAPR
    .truncate()
    .toString()}% ${t("stake.alertTitleEnd")}`;

  const setAmount = useCallback(
    (amount: string) => {
      const isNegative = Number(amount) < 0;
      if (!isNegative) {
        amountConfig.setAmount(amount);
      }
    },
    [amountConfig]
  );

  const showStakeLearnMore = !isWalletConnected || isNewUser;

  const { unbondingBalances } = unbondingDelegationsQuery;
  const unbondingInProcess = unbondingBalances.length > 0;

  function groupByCompletionTime(
    array: Array<{
      validatorAddress: string;
      entries: { completionTime: string; balance: CoinPretty }[];
    }>
  ): { completionTime: string; balance: CoinPretty }[] {
    const flattenedEntries = array.reduce(
      (acc, curr) => acc.concat(curr.entries),
      [] as { completionTime: string; balance: CoinPretty }[]
    );

    const groupedObjects: Record<string, CoinPretty> = {};

    flattenedEntries.forEach((entry) => {
      const { completionTime, balance } = entry;

      if (!groupedObjects[completionTime]) {
        groupedObjects[completionTime] = balance;
      } else {
        groupedObjects[completionTime] =
          groupedObjects[completionTime].add(balance);
      }
    });

    return Object.entries(groupedObjects).map(([completionTime, balance]) => ({
      completionTime,
      balance,
    }));
  }

  const disableMainStakeCardButton =
    Boolean(isWalletConnected) && Number(amountConfig.amount) <= 0;

  return (
    <main className="m-auto flex max-w-container flex-col gap-5 bg-osmoverse-900 p-8 md:p-3">
      <div className="flex max-w-[73rem] gap-4 xl:max-w-[30rem] xl:flex-col xl:gap-y-4">
        <div className="flex w-96 shrink-0 flex-col gap-5 xl:mx-auto">
          <AlertBanner
            className="!rounded-[32px]"
            title={alertTitle}
            subtitle={t("stake.alertSubtitle")}
            image={
              <div
                className="pointer-events-none absolute left-0 h-full w-full bg-contain bg-no-repeat"
                style={{
                  backgroundImage: 'url("/images/staking-apr.svg")',
                }}
              />
            }
          />
          <MainStakeCard
            handleMaxButtonClick={() => amountConfig.toggleIsMax()}
            handleHalfButtonClick={() =>
              amountConfig.fraction
                ? amountConfig.setFraction(0)
                : amountConfig.setFraction(0.5)
            }
            isMax={amountConfig.isMax}
            isHalf={amountConfig.fraction === 0.5}
            inputAmount={amountConfig.amount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            balance={osmoBalance}
            stakedBalance={prettifiedStakedBalance}
            stakeAmount={stakeAmount}
            setShowValidatorNextStepModal={setShowValidatorNextStepModal}
            setInputAmount={setAmount}
            isWalletConnected={Boolean(isWalletConnected)}
            onStakeButtonClick={onStakeButtonClick}
            disabled={disableMainStakeCardButton}
          />
        </div>
        <div className="flex flex-shrink flex-col xl:mx-auto xl:min-h-[25rem]">
          {isLoading || isFetchingValPrefs ? (
            <div className="flex flex-auto items-center justify-center">
              <Spinner />
            </div>
          ) : showStakeLearnMore ? (
            <StakeLearnMore />
          ) : (
            <StakeDashboard
              setShowValidatorModal={() => setShowValidatorModal(true)}
              usersValidatorsMap={usersValidatorsMap}
              validators={activeValidators}
              balance={prettifiedStakedBalance}
            />
          )}
        </div>
      </div>
      {unbondingInProcess && (
        <UnbondingInProgress
          unbondings={groupByCompletionTime(unbondingBalances)}
        />
      )}
      <ValidatorSquadModal
        isOpen={showValidatorModal}
        onRequestClose={() => setShowValidatorModal(false)}
        usersValidatorsMap={usersValidatorsMap}
        usersValidatorSetPreferenceMap={usersValidatorSetPreferenceMap}
        validators={activeValidators}
        action={validatorSquadModalAction}
        coin={coin}
        queryValidators={queryValidators}
      />
      <ValidatorNextStepModal
        isNewUser={isNewUser}
        isOpen={showValidatorNextStepModal}
        onRequestClose={() => setShowValidatorNextStepModal(false)}
        setShowValidatorModal={() => setShowValidatorModal(true)}
        stakeCall={stakeCall}
      />
    </main>
  );
});

export default Staking;

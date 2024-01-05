import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Staking as StakingType } from "@osmosis-labs/keplr-stores";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { AlertBanner } from "~/components/alert-banner";
import { StakeDashboard } from "~/components/cards/stake-dashboard";
import { StakeLearnMore } from "~/components/cards/stake-learn-more";
import { StakeTool } from "~/components/cards/stake-tool";
import { Spinner } from "~/components/spinner";
import { UnbondingInProgress } from "~/components/stake/unbonding-in-progress";
import { StakeOrUnstake } from "~/components/types";
import { StakeOrEdit } from "~/components/types";
import { EventName } from "~/config";
import { AmountDefault } from "~/config/user-analytics-v2";
import { useAmountConfig, useFakeFeeConfig } from "~/hooks";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useStakedAmountConfig } from "~/hooks/ui-config/use-staked-amount-config";
import { useWalletSelect } from "~/hooks/wallet-select";
import { StakeLearnMoreModal } from "~/modals/stake-learn-more-modal";
import { ValidatorNextStepModal } from "~/modals/validator-next-step";
import { ValidatorSquadModal } from "~/modals/validator-squad-modal";
import { useStore } from "~/stores";

const getAmountDefault = (fraction: number | undefined): AmountDefault => {
  if (fraction === 0.5) return "half";
  if (fraction === 1) return "max";
  return "input";
};

export const Staking: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState<StakeOrUnstake>("Stake");
  const [showValidatorModal, setShowValidatorModal] = useState(false);
  const [showStakeLearnMoreModal, setShowStakeLearnMoreModal] = useState(false);
  const [showValidatorNextStepModal, setShowValidatorNextStepModal] =
    useState(false);

  const { t } = useTranslation();

  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Stake.pageViewed],
  });

  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const { onOpenWalletSelect, isLoading } = useWalletSelect();
  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";

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

  const isWalletConnected = Boolean(account?.isWalletConnected);

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

  // wallet balance
  const stakeTabAmountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    osmosisChainId,
    address,
    feeConfig,
    osmo
  );

  // staked amount balance
  const unstakeTabAmountConfig = useStakedAmountConfig(
    chainStore,
    queriesStore,
    osmosisChainId,
    address,
    feeConfig,
    osmo
  );

  const stakeAmount = useMemo(() => {
    if (stakeTabAmountConfig.amount) {
      return new CoinPretty(osmo, stakeTabAmountConfig.amount);
    }
  }, [stakeTabAmountConfig.amount, osmo]);

  const activeAmountConfig =
    activeTab === "Stake" ? stakeTabAmountConfig : unstakeTabAmountConfig;

  const primitiveAmount = activeAmountConfig.getAmountPrimitive();

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

  const validatorSquadModalAction: StakeOrEdit = Boolean(
    Number(stakeTabAmountConfig.amount)
  )
    ? "stake"
    : "edit";

  const amountDefault = getAmountDefault(stakeTabAmountConfig.fraction);
  const amount = stakeTabAmountConfig.amount || "0";
  const amountUSD = priceStore
    .calculatePrice(
      new CoinPretty(osmo, stakeTabAmountConfig.getAmountPrimitive().amount)
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
      account.osmosis
        .sendDelegateToValidatorSetMsg(coin, "", (tx: DeliverTxResponse) => {
          if (tx.code === 0) {
            logEvent([
              EventName.Stake.stakingCompleted,
              { amountDefault, amount, amountUSD, squadSize },
            ]);
          }
        })
        .catch(console.error);
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
      account.osmosis
        .sendUndelegateFromRebalancedValidatorSet(
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
        )
        .catch(console.error);
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

  const fetchAprData = async () => {
    const response = await axios.get(
      "https://public-osmosis-api.numia.xyz/apr?start_date=2023-12-29&end_date=2024-02-05",
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_NUMIA_API_KEY}`,
        },
      }
    );

    console.log("response: ", response);
    return response.data;
  };

  const getAverageApr = (data: { labels: string; apr: number }[] = []) => {
    if (data.length === 0) return 0;

    const sum = data.reduce((acc, item) => acc + item.apr, 0);
    const average = sum / data.length;
    return average;
  };

  const formatAverageApr = (apr: number) => {
    return new Dec(apr);
  };

  const { data } = useQuery(["2022-01-05"], fetchAprData);

  console.log("Inflation data: ", data);

  const averageApr = getAverageApr(data);

  const stakingAPR = formatAverageApr(averageApr);

  const queryValidators = cosmosQueries.queryValidators.getQueryStatus(
    StakingType.BondStatus.Bonded
  );
  const activeValidators = queryValidators.validators;

  const alertTitle = `${t("stake.alertTitleBeginning")} ${stakingAPR
    .truncate()
    .toString()}% ${t("stake.alertTitleEnd")}`;

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

  const hasInsufficientBalance = activeAmountConfig.balance
    ?.toDec()
    .lt(new Dec(activeAmountConfig.amount || "1"));

  // never disable when wallet is not connected
  const disableMainStakeCardButton = !isWalletConnected
    ? false
    : Number(activeAmountConfig.amount) <= 0 || hasInsufficientBalance;

  const setAmount = useCallback(
    (amount: string) => {
      const isNegative = Number(amount) < 0;
      if (!isNegative) {
        activeAmountConfig.setAmount(amount);
      }
    },
    [activeAmountConfig]
  );

  return (
    <main className="m-auto flex max-w-container flex-col gap-5 bg-osmoverse-900 p-8 md:p-3">
      <div className="flex gap-4 xl:flex-col xl:gap-y-4">
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
          <StakeTool
            hasInsufficientBalance={hasInsufficientBalance}
            handleMaxButtonClick={() => activeAmountConfig.toggleIsMax()}
            handleHalfButtonClick={() =>
              activeAmountConfig.fraction
                ? activeAmountConfig.setFraction(0)
                : activeAmountConfig.setFraction(0.5)
            }
            isMax={activeAmountConfig.isMax}
            isHalf={activeAmountConfig.fraction === 0.5}
            inputAmount={activeAmountConfig.amount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            availableAmount={activeAmountConfig.balance}
            stakeAmount={stakeAmount}
            setShowValidatorNextStepModal={setShowValidatorNextStepModal}
            setInputAmount={setAmount}
            isWalletConnected={isWalletConnected}
            onStakeButtonClick={onStakeButtonClick}
            disabled={disableMainStakeCardButton}
            stakingAPR={stakingAPR}
          />
        </div>
        <div className="flex w-96 flex-grow flex-col xl:mx-auto xl:min-h-[25rem]">
          {isLoading || isFetchingValPrefs ? (
            <div className="flex flex-auto items-center justify-center">
              <Spinner />
            </div>
          ) : showStakeLearnMore ? (
            <StakeLearnMore
              setShowValidatorModal={() => setShowValidatorModal(true)}
              isWalletConnected={isWalletConnected}
            />
          ) : (
            <StakeDashboard
              hasInsufficientBalance={hasInsufficientBalance}
              setShowValidatorModal={() => setShowValidatorModal(true)}
              setShowStakeLearnMoreModal={() =>
                setShowStakeLearnMoreModal(true)
              }
              usersValidatorsMap={usersValidatorsMap}
              validators={activeValidators}
              balance={unstakeTabAmountConfig.balance}
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
      <StakeLearnMoreModal
        isOpen={showStakeLearnMoreModal}
        onRequestClose={() => setShowStakeLearnMoreModal(false)}
        isWalletConnected={Boolean(isWalletConnected)}
        setShowValidatorModal={() => setShowValidatorModal(true)}
      />
    </main>
  );
});

export default Staking;

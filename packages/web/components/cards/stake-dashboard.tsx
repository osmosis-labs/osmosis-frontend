import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { Staking } from "@osmosis-labs/keplr-stores";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";

import { Icon } from "~/components/assets";
import { GenericMainCard } from "~/components/cards/generic-main-card";
import { RewardsCard } from "~/components/cards/rewards-card";
import { ValidatorSquadCard } from "~/components/cards/validator-squad-card";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics, useFakeFeeConfig } from "~/hooks";
import { useStore } from "~/stores";

export const StakeDashboard: React.FC<{
  setShowValidatorModal: (val: boolean) => void;
  setShowStakeLearnMoreModal: (val: boolean) => void;
  validators?: Staking.Validator[];
  usersValidatorsMap: Map<string, Staking.Delegation>;
  balance: CoinPretty;
}> = observer(
  ({
    setShowValidatorModal,
    validators,
    usersValidatorsMap,
    balance,
    setShowStakeLearnMoreModal,
  }) => {
    const { t } = useTranslation();
    const { priceStore, chainStore, queriesStore, accountStore } = useStore();
    const { logEvent } = useAmplitudeAnalytics();

    const osmosisChainId = chainStore.osmosis.chainId;
    const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;
    const account = accountStore.getWallet(osmosisChainId);
    const address = account?.address ?? "";
    const osmo = chainStore.osmosis.stakeCurrency;
    const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

    const { rewards } =
      cosmosQueries.queryRewards.getQueryBech32Address(address);

    const summedStakeRewards = rewards?.reduce((acc, reward) => {
      return reward.add(acc);
    }, new CoinPretty(osmo, 0));

    const fiatRewards =
      priceStore.calculatePrice(summedStakeRewards) || new PricePretty(fiat, 0);

    const fiatBalance = balance
      ? priceStore.calculatePrice(balance)
      : undefined;

    const osmoRewardsAmount = summedStakeRewards.toCoin().amount;

    const LearnMoreIconText = (
      <div className="flex cursor-pointer items-center justify-center text-bullish-500">
        <div className="mr-2 flex self-center">
          <Icon id="open-book" height="14px" width="14px" />
        </div>
        <span className="caption text-sm">{t("stake.learn")}</span>
      </div>
    );

    const collectRewards = useCallback(() => {
      logEvent([EventName.Stake.collectRewardsStarted]);

      if (account?.osmosis) {
        account.osmosis
          .sendWithdrawDelegationRewardsMsg("", (tx: DeliverTxResponse) => {
            if (tx.code === 0) {
              logEvent([EventName.Stake.collectRewardsCompleted]);
            }
          })
          .catch(console.error);
      }
    }, [account, logEvent]);

    const gasForecastedCollectRewards = 1501105; // estimate based on gas simulation to run collect successfully
    const gasForecastedCollectAndReinvestRewards = 3029136; // estimate based on gas simulation to run collect and reinvest successfully

    const { fee: collectRewardsFee } = useFakeFeeConfig(
      chainStore,
      chainStore.osmosis.chainId,
      gasForecastedCollectRewards
    );

    const { fee: collectAndReinvestRewardsFee } = useFakeFeeConfig(
      chainStore,
      chainStore.osmosis.chainId,
      gasForecastedCollectAndReinvestRewards
    );

    const collectRewardsDisabled = summedStakeRewards
      .toDec()
      .lte(collectRewardsFee ? collectRewardsFee.toDec() : new Dec(0));

    const collectAndReinvestRewardsDisabled = summedStakeRewards
      .toDec()
      .lte(
        collectAndReinvestRewardsFee
          ? collectAndReinvestRewardsFee.toDec()
          : new Dec(0)
      );

    const collectAndReinvestRewards = useCallback(() => {
      logEvent([EventName.Stake.collectAndReinvestStarted]);

      const collectAndReinvestCoin: { amount: string; denom: Currency } = {
        amount: osmoRewardsAmount,
        denom: osmo,
      };

      if (account?.osmosis) {
        account.osmosis
          .sendWithdrawDelegationRewardsAndSendDelegateToValidatorSetMsgs(
            collectAndReinvestCoin,
            "",
            (tx: DeliverTxResponse) => {
              if (tx.code === 0) {
                logEvent([EventName.Stake.collectAndReinvestCompleted]);
              }
            }
          )
          .catch(console.error);
      }
    }, [account, logEvent, osmo, osmoRewardsAmount]);

    return (
      <GenericMainCard
        title={t("stake.dashboard")}
        titleIcon={LearnMoreIconText}
        titleIconAction={() => setShowStakeLearnMoreModal(true)}
      >
        <div className="flex w-full flex-row place-content-around gap-4 py-10 sm:flex-col sm:py-4">
          <StakeBalances
            title={t("stake.stakeBalanceTitle")}
            dollarAmount={fiatBalance}
            osmoAmount={balance}
          />
          <StakeBalances
            title={t("stake.rewardsTitle")}
            dollarAmount={fiatRewards}
            osmoAmount={summedStakeRewards}
          />
        </div>
        <ValidatorSquadCard
          setShowValidatorModal={setShowValidatorModal}
          validators={validators}
          usersValidatorsMap={usersValidatorsMap}
        />
        <div className="flex h-full max-h-[9.375rem] w-full flex-grow flex-row space-x-2">
          <RewardsCard
            disabled={collectRewardsDisabled}
            title={t("stake.collectRewards")}
            tooltipContent={t("stake.collectRewardsTooltip")}
            disabledTooltipContent={t("stake.collectRewardsTooltipDisabled")}
            onClick={collectRewards}
            image={
              <div className="pointer-events-none absolute left-[-2.5rem] bottom-[-2.1875rem] h-full w-full bg-[url('/images/gift-box.svg')] bg-contain bg-no-repeat xl:left-1 xl:bottom-[-0.9rem] lg:invisible" />
            }
          />
          <RewardsCard
            disabled={collectAndReinvestRewardsDisabled}
            title={t("stake.investRewards")}
            tooltipContent={t("stake.collectAndReinvestTooltip")}
            disabledTooltipContent={t("stake.collectRewardsTooltipDisabled")}
            onClick={collectAndReinvestRewards}
            image={
              <div className="pointer-events-none absolute left-[-1.5625rem] bottom-[-2.1875rem] h-full w-full bg-[url('/images/piggy-bank.svg')] bg-contain bg-no-repeat xl:left-1 xl:bottom-[-0.9rem] lg:invisible" />
            }
          />
        </div>
      </GenericMainCard>
    );
  }
);

const StakeBalances: React.FC<{
  title: string;
  dollarAmount?: PricePretty;
  osmoAmount?: CoinPretty;
}> = ({ title, dollarAmount, osmoAmount }) => {
  const [flashDollar, setFlashDollar] = useState(false);
  const [flashOsmo, setFlashOsmo] = useState(false);

  useEffect(() => {
    if (dollarAmount) {
      setFlashDollar(true);
      setTimeout(() => setFlashDollar(false), 1000);
    }
  }, [dollarAmount]);

  useEffect(() => {
    if (osmoAmount) {
      setFlashOsmo(true);
      setTimeout(() => setFlashOsmo(false), 1000);
    }
  }, [osmoAmount]);

  const flashAnimationClass = "animate-flash";

  return (
    <div className="flex flex-col items-start justify-center gap-1 text-left">
      <span className="caption text-sm text-osmoverse-200 md:text-xs">
        {title}
      </span>
      <h3
        className={`whitespace-nowrap ${
          flashDollar ? flashAnimationClass : ""
        }`}
      >
        {dollarAmount?.toString() ?? ""}
      </h3>
      <span
        className={`caption text-sm text-osmoverse-200 md:text-xs ${
          flashOsmo ? flashAnimationClass : ""
        }`}
      >
        {osmoAmount?.toString() ?? ""}
      </span>
    </div>
  );
};

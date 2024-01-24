import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { Staking } from "@osmosis-labs/keplr-stores";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";

import { Icon } from "~/components/assets";
import { GenericMainCard } from "~/components/cards/generic-main-card";
import { RewardsCard } from "~/components/cards/rewards-card";
import { ValidatorSquadCard } from "~/components/cards/validator-squad-card";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { useStore } from "~/stores";

const COLLECT_REWARDS_MINIMUM_BALANCE_USD = 0.15;

export const StakeDashboard: React.FC<{
  hasInsufficientBalance: boolean;
  setShowValidatorModal: (val: boolean) => void;
  setShowStakeLearnMoreModal: (val: boolean) => void;
  validators?: Staking.Validator[];
  usersValidatorsMap: Map<string, Staking.Delegation>;
  balance: CoinPretty;
}> = observer(
  ({
    hasInsufficientBalance,
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
      <div className="flex cursor-pointer items-center justify-center text-wosmongton-300">
        <div className="mr-2 flex self-center">
          <Icon
            id="open-book"
            height="14px"
            width="14px"
            className="text-wosmongton-300"
          />
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

    const osmoPrice = priceStore
      .calculatePrice(
        new CoinPretty(
          osmo,
          DecUtils.getTenExponentNInPrecisionRange(
            chainStore.osmosis.stakeCurrency.coinDecimals
          )
        )
      )
      ?.toDec();

    const collectRewardsMinimumOsmo = osmoPrice?.isZero()
      ? new Dec(0)
      : new Dec(COLLECT_REWARDS_MINIMUM_BALANCE_USD).quo(osmoPrice as Dec);

    const rewardsCardDisabled = summedStakeRewards
      .toDec()
      .lte(collectRewardsMinimumOsmo);

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
        <div className="flex w-full flex-row gap-2 py-10 sm:flex-col sm:gap-6 sm:py-4">
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
          hasInsufficientBalance={hasInsufficientBalance}
          setShowValidatorModal={setShowValidatorModal}
          validators={validators}
          usersValidatorsMap={usersValidatorsMap}
        />
        <div className="flex flex-row items-center gap-2 xl:flex-col">
          <RewardsCard
            disabled={rewardsCardDisabled}
            title={t("stake.collectRewards")}
            disabledTooltipContent={t("stake.collectRewardsTooltipDisabled", {
              collectRewardsMinimumOsmo: Number(
                collectRewardsMinimumOsmo.toString()
              ).toFixed(2),
            })}
            onClick={collectRewards}
            globalLottieFileKey="collect"
            position="left"
          />
          <RewardsCard
            disabled={rewardsCardDisabled}
            title={t("stake.investRewards")}
            disabledTooltipContent={t("stake.collectRewardsTooltipDisabled", {
              collectRewardsMinimumOsmo: Number(
                collectRewardsMinimumOsmo.toString()
              ).toFixed(2),
            })}
            onClick={collectAndReinvestRewards}
            globalLottieFileKey="reinvest"
            position="right"
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
}> = observer(({ title, dollarAmount, osmoAmount }) => {
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

  return (
    <div className="flex w-full flex-col items-start justify-center gap-1 text-left xl:items-center">
      <span className="caption text-sm text-osmoverse-200 md:text-xs">
        {title}
      </span>
      <h3
        className={classNames(
          "whitespace-nowrap",
          flashDollar ? "animate-flash" : ""
        )}
      >
        {dollarAmount?.toString() ?? ""}
      </h3>
      <span
        className={classNames(
          "caption text-sm text-osmoverse-200 md:text-xs",
          flashOsmo ? "animate-flash" : ""
        )}
      >
        {osmoAmount?.trim(true)?.toString() ?? ""}
      </span>
    </div>
  );
});

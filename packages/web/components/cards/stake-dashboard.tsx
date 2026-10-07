import { Staking } from "@osmosis-labs/keplr-stores";
import {
  CoinPretty,
  Currency,
  Dec,
  DecUtils,
  PricePretty,
} from "@osmosis-labs/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";

import { Icon } from "~/components/assets";
import { GenericMainCard } from "~/components/cards/generic-main-card";
import { RewardsCard } from "~/components/cards/rewards-card";
import { ValidatorSquadCard } from "~/components/cards/validator-squad-card";
import { useDailyEpochCountdown, useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { formatCoinBalance } from "~/utils/formatter";
import { InactiveDelegation } from "~/utils/inactive-delegations";

const COLLECT_REWARDS_MINIMUM_BALANCE_USD = 0.15;

/** Above these USD values the headline numbers no longer fit side by side, so
 *  all three step down a size together. */
const COMPACT_STAKED_BALANCE_USD = 100_000;
const COMPACT_REWARDS_USD = 10_000;

export const StakeDashboard: React.FC<{
  hasInsufficientBalance: boolean;
  setShowValidatorModal: (val: boolean) => void;
  setShowStakeLearnMoreModal: (val: boolean) => void;
  validators?: Staking.Validator[];
  usersValidatorsMap: Map<string, Staking.Delegation>;
  balance: CoinPretty;
  inactiveDelegations?: InactiveDelegation[];
  onRedelegate?: () => void;
}> = observer(
  ({
    hasInsufficientBalance,
    setShowValidatorModal,
    validators,
    usersValidatorsMap,
    balance,
    setShowStakeLearnMoreModal,
    inactiveDelegations,
    onRedelegate,
  }) => {
    const { t } = useTranslation();
    const { priceStore, chainStore, queriesStore, accountStore } = useStore();

    const osmosisChainId = chainStore.osmosis.chainId;
    const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;
    const account = accountStore.getWallet(osmosisChainId);
    const address = account?.address ?? "";
    const osmo = chainStore.osmosis.stakeCurrency;
    const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

    const { rewards } =
      cosmosQueries.queryRewards.getQueryBech32Address(address);

    const summedStakeRewards = rewards?.reduce(
      (acc, reward) => {
        return reward.add(acc);
      },
      new CoinPretty(osmo, 0)
    );

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
      if (account?.osmosis) {
        account.osmosis
          .sendWithdrawDelegationRewardsMsg("")
          .catch(console.error);
      }
    }, [account]);

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
      const collectAndReinvestCoin: { amount: string; denom: Currency } = {
        amount: osmoRewardsAmount,
        denom: osmo,
      };

      if (account?.osmosis) {
        account.osmosis
          .sendWithdrawDelegationRewardsAndSendDelegateToValidatorSetMsgs(
            collectAndReinvestCoin,
            ""
          )
          .catch(console.error);
      }
    }, [account, osmo, osmoRewardsAmount]);

    const isCompact =
      Boolean(fiatBalance?.toDec().gte(new Dec(COMPACT_STAKED_BALANCE_USD))) ||
      fiatRewards.toDec().gte(new Dec(COMPACT_REWARDS_USD));

    return (
      <GenericMainCard
        title={t("stake.dashboard")}
        titleIcon={LearnMoreIconText}
        titleIconAction={() => setShowStakeLearnMoreModal(true)}
      >
        <div className="flex w-full flex-row gap-2 py-10 xl:flex-col xl:gap-6 xl:py-4">
          <StakeBalances
            compact={isCompact}
            title={t("stake.stakeBalanceTitle")}
            dollarAmount={fiatBalance}
            osmoAmount={balance}
          />
          <StakeBalances
            compact={isCompact}
            title={t("stake.rewardsTitle")}
            dollarAmount={fiatRewards}
            osmoAmount={summedStakeRewards}
          />
          {balance.toDec().isPositive() && (
            <NextRewardCountdown compact={isCompact} />
          )}
        </div>
        <ValidatorSquadCard
          hasInsufficientBalance={hasInsufficientBalance}
          setShowValidatorModal={setShowValidatorModal}
          validators={validators}
          usersValidatorsMap={usersValidatorsMap}
          inactiveDelegations={inactiveDelegations}
          onRedelegate={onRedelegate}
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

const NextRewardCountdown: React.FC<{ compact: boolean }> = ({ compact }) => {
  const { t } = useTranslation();
  const timeRemaining = useDailyEpochCountdown();

  if (!timeRemaining) return null;

  return (
    <div className="flex w-[13rem] shrink-0 flex-col items-start justify-start gap-1 text-left xl:w-full xl:items-center">
      <span className="caption text-sm text-osmoverse-200 md:text-xs">
        {t("pool.nextRewardIn")}
      </span>
      <h3
        className={classNames(
          "whitespace-nowrap bg-superfluid bg-clip-text tabular-nums text-transparent",
          compact
            ? "text-h4 xl:text-h5 lg:text-h6"
            : "text-h3 xl:text-h4 lg:text-h5"
        )}
      >
        {timeRemaining}
      </h3>
    </div>
  );
};

const StakeBalances: React.FC<{
  title: string;
  dollarAmount?: PricePretty;
  osmoAmount?: CoinPretty;
  compact: boolean;
}> = observer(({ title, dollarAmount, osmoAmount, compact }) => {
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
          compact
            ? "text-h4 xl:text-h5 lg:text-h6"
            : "text-h3 xl:text-h4 lg:text-h5",
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
        {osmoAmount ? formatCoinBalance(osmoAmount) : ""}
      </span>
    </div>
  );
});

import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { GenericMainCard } from "~/components/cards/generic-main-card";
import { RewardsCard } from "~/components/cards/rewards-card";
import { ValidatorSquadCard } from "~/components/cards/validator-squad-card";
import { useStore } from "~/stores";

export const StakeDashboard: React.FC<{
  setShowValidatorModal: (val: boolean) => void;
  validators?: Staking.Validator[];
  usersValidatorsMap?: Map<string, Staking.Delegation>;
  balance: CoinPretty;
}> = observer(
  ({ setShowValidatorModal, validators, usersValidatorsMap, balance }) => {
    const t = useTranslation();
    const { priceStore, chainStore, queriesStore, accountStore } = useStore();

    const osmosisChainId = chainStore.osmosis.chainId;
    const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;
    const account = accountStore.getWallet(osmosisChainId);
    const address = account?.address ?? "";
    const osmo = chainStore.osmosis.stakeCurrency;

    const { rewards } =
      cosmosQueries.queryRewards.getQueryBech32Address(address);

    const summedStakeRewards = rewards?.reduce((acc, reward) => {
      return reward.toDec().add(acc);
    }, new Dec(0));

    const coinPrettyStakeRewards = summedStakeRewards
      ? new CoinPretty(osmo, summedStakeRewards)
      : new CoinPretty(osmo, 0);

    const fiatRewards =
      priceStore.calculatePrice(coinPrettyStakeRewards) || "0";

    const fiatBalance = balance ? priceStore.calculatePrice(balance) : 0;

    const icon = (
      <div className="flex items-center justify-center text-bullish-500">
        <div className="mr-2 flex self-center">
          <Icon id="open-book" height="14px" width="14px" />
        </div>
        <span className="caption text-sm">{t("stake.learn")}</span>
      </div>
    );

    const collectRewards = useCallback(() => {
      if (account?.osmosis) {
        account.osmosis.sendWithdrawDelegationRewardsMsg();
      }
    }, [account]);

    const collectAndReinvestRewards = () => {
      console.log("clicked");
    };

    return (
      <GenericMainCard title={t("stake.dashboard")} titleIcon={icon} width="45">
        <div className="flex w-full flex-row justify-between py-10">
          <StakeBalances
            title={t("stake.stakeBalanceTitle")}
            dollarAmount={String(fiatBalance)}
            osmoAmount={balance.toString()}
          />
          <StakeBalances
            title={t("stake.rewardsTitle")}
            dollarAmount={String(fiatRewards)}
            osmoAmount={coinPrettyStakeRewards
              .moveDecimalPointRight(osmo.coinDecimals)
              .toString()}
          />
        </div>
        <ValidatorSquadCard
          setShowValidatorModal={setShowValidatorModal}
          validators={validators}
          usersValidatorsMap={usersValidatorsMap}
        />
        <div className="flex h-full w-full flex-grow flex-row space-x-2">
          <RewardsCard
            title={t("stake.collectRewards")}
            tooltipContent="... placeholder content 1 ..."
            onClick={collectRewards}
          />
          <RewardsCard
            title={t("stake.investRewards")}
            tooltipContent="... placeholder content 2 ..."
            onClick={collectAndReinvestRewards}
          />
        </div>
      </GenericMainCard>
    );
  }
);

const StakeBalances: React.FC<{
  title: string;
  dollarAmount: string;
  osmoAmount?: string;
}> = ({ title, dollarAmount, osmoAmount }) => {
  return (
    <div className="flex w-full flex-col justify-center pl-10">
      <span className="caption text-sm text-osmoverse-200 md:text-xs">
        {title}
      </span>
      <h3>{dollarAmount}</h3>
      <span className="caption text-sm text-osmoverse-200 md:text-xs">
        {osmoAmount}
      </span>
    </div>
  );
};

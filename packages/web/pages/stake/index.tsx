import { Staking as StakingType } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import * as LDClient from "launchdarkly-node-server-sdk";
import { observer } from "mobx-react-lite";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { AlertBanner } from "~/components/alert-banner";
import { MainStakeCard } from "~/components/cards/main-stake-card";
import { StakeDashboard } from "~/components/cards/stake-dashboard";
import { StakeLearnMore } from "~/components/cards/stake-learn-more";
import { EventName } from "~/config";
import { useAmountConfig, useFakeFeeConfig } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { ValidatorNextStepModal } from "~/modals/validator-next-step";
import { ValidatorSquadModal } from "~/modals/validator-squad";
import { useStore } from "~/stores";

export const Staking: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState("Stake");
  const [showValidatorModal, setShowValidatorModal] = useState(false);
  const [showValidatorNextStepModal, setShowValidatorNextStepModal] =
    useState(false);
  const t = useTranslation();

  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Stake.pageViewed],
  });

  const { chainStore, accountStore, queriesStore } = useStore();
  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";
  const queries = queriesStore.get(osmosisChainId);
  const osmo = chainStore.osmosis.stakeCurrency;
  const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;

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

  const stakeCall = useCallback(() => {
    logEvent([EventName.Stake.stakingStarted]);

    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis.sendDelegateToValidatorSetMsg(coin, "", () =>
        logEvent([EventName.Stake.stakingCompleted])
      );
    } else {
      console.error("Account address is undefined");
    }
  }, [account, coin, logEvent]);

  const unstakeCall = useCallback(() => {
    logEvent([EventName.Stake.unstakingStarted]);

    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis.sendUndelegateFromValidatorSetMsg(coin, "", () =>
        logEvent([EventName.Stake.unstakingCompleted])
      );
    } else {
      console.error("Account address is undefined");
    }
  }, [account, coin, logEvent]);

  const queryValidators = cosmosQueries.queryValidators.getQueryStatus(
    StakingType.BondStatus.Bonded
  );
  const activeValidators = queryValidators.validators;

  const delegationQuery = cosmosQueries.queryDelegations.getQueryBech32Address(
    account?.address ?? ""
  );

  const userValidatorDelegations = delegationQuery.delegations;

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

  const usersValidatorsMap = useMemo(() => {
    const delegationsMap = new Map<string, StakingType.Delegation>();

    userValidatorDelegations.forEach((delegation: StakingType.Delegation) => {
      delegationsMap.set(delegation.delegation.validator_address, delegation);
    });

    return delegationsMap;
  }, [userValidatorDelegations]);

  const osmoBalance = queries.queryBalances
    .getQueryBech32Address(address)
    .getBalanceFromCurrency(osmo)
    .trim(true)
    .hideDenom(true)
    .maxDecimals(8)
    .toString();

  const alertTitle = `${t("stake.alertTitleBeginning")} ${stakingAPR
    .truncate()
    .toString()}% ${t("stake.alertTitleEnd")}`;

  const isNewUser = usersValidatorsMap.size === 0;
  const setAmount = useCallback(
    (amount: string) => {
      amountConfig.setAmount(amount);
    },
    [amountConfig]
  );

  return (
    <main className="relative flex h-screen items-center justify-center">
      <div className="flex w-full justify-center space-x-5">
        <div>
          <AlertBanner
            title={alertTitle}
            subtitle={t("stake.alertSubtitle")}
            image="/images/moving-on-up.png"
          />
          <MainStakeCard
            handleMaxButtonClick={() => {
              amountConfig.setFraction(1);
            }}
            handleHalfButtonClick={() => {
              amountConfig.setFraction(0.5);
            }}
            inputAmount={amountConfig.amount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            balance={osmoBalance}
            stakeAmount={stakeAmount}
            setShowValidatorNextStepModal={setShowValidatorNextStepModal}
            setInputAmount={setAmount}
            stakeCall={stakeCall}
            unstakeCall={unstakeCall}
          />
        </div>
        {isNewUser ? (
          <StakeLearnMore />
        ) : (
          <StakeDashboard
            setShowValidatorModal={setShowValidatorModal}
            usersValidatorsMap={usersValidatorsMap}
            validators={activeValidators}
            balance={prettifiedStakedBalance}
          />
        )}
      </div>
      <ValidatorSquadModal
        isOpen={showValidatorModal}
        onRequestClose={() => setShowValidatorModal(false)}
        usersValidatorsMap={usersValidatorsMap}
        validators={activeValidators}
        logEventSelectSquadAndStakeClicked={() =>
          logEvent([EventName.Stake.selectSquadAndStakeClicked])
        }
      />
      <ValidatorNextStepModal
        isNewUser={isNewUser}
        isOpen={showValidatorNextStepModal}
        onRequestClose={() => setShowValidatorNextStepModal(false)}
        setShowValidatorModal={setShowValidatorModal}
        logEventBuildSquadClicked={() =>
          logEvent([EventName.Stake.buildSquadClicked])
        }
        logEventSquadOptionClicked={() =>
          logEvent([EventName.Stake.squadOptionClicked])
        }
      />
    </main>
  );
});

export default Staking;

// Delete all this once staking is released
export async function getServerSideProps() {
  const ldClient = LDClient.init(
    process.env.NEXT_PUBLIC_LAUNCH_DARKLY_SDK_KEY || ""
  );

  await new Promise((resolve) => ldClient.once("ready", resolve));

  const ldAnonymousContext = {
    key: "SHARED-CONTEXT-KEY",
    anonymous: true,
  };

  const showFeature = await ldClient.variation(
    "staking",
    ldAnonymousContext,
    false
  );

  ldClient.close();

  if (!showFeature) {
    return {
      redirect: {
        destination: "https://wallet.keplr.app/chains/osmosis",
        permanent: false,
      },
    };
  }

  return { props: {} };
}

import { Staking as StakingType } from "@keplr-wallet/stores";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { AlertBanner } from "~/components/alert-banner";
import { MainStakeCard } from "~/components/cards/main-stake-card";
import { StakeDashboard } from "~/components/cards/stake-dashboard";
import { StakeLearnMore } from "~/components/cards/stake-learn-more";
import { EventName } from "~/config";
import { useAmountConfig, useFakeFeeConfig } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { ValidatorNextStepModal } from "~/modals/validator-next-step";
import { ValidatorSquadModal } from "~/modals/validator-squad";
import { useStore } from "~/stores";

type AmountDefault = "half" | "max" | "input";

interface Properties {
  amountDefault: AmountDefault;
  amount: string;
  amountUSD: string | undefined;
}

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
  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";
  const queries = queriesStore.get(osmosisChainId);
  const osmo = chainStore.osmosis.stakeCurrency;
  const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;
  const [loading, setLoading] = useState(true);
  const flags = useFeatureFlags();

  // Delete all this once staking is released
  useEffect(() => {
    async function checkFeatureFlag() {
      // if (!flags.staking) {
      //   window.location.href = "https://wallet.keplr.app/chains/osmosis";
      // }
      setLoading(false);
    }

    checkFeatureFlag();
  }, [flags.staking]);

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

  const userValidatorDelegations = delegationQuery.delegations;

  const usersValidatorsMap = useMemo(() => {
    const delegationsMap = new Map<string, StakingType.Delegation>();

    userValidatorDelegations.forEach((delegation: StakingType.Delegation) => {
      delegationsMap.set(delegation.delegation.validator_address, delegation);
    });

    return delegationsMap;
  }, [userValidatorDelegations]);

  const [amountDefault, setAmountDefault] = useState<AmountDefault>("input");

  const getProperties = useCallback(() => {
    const amountUSD = priceStore
      .calculatePrice(
        new CoinPretty(
          osmo,
          new Dec(amountConfig.amount).mul(
            DecUtils.getTenExponentNInPrecisionRange(osmo.coinDecimals)
          )
        )
      )
      ?.toString();

    const amount = amountConfig.amount;

    const properties: Properties = {
      amountDefault,
      amount,
      amountUSD,
    };

    return properties;
  }, [amountConfig.amount, amountDefault, osmo, priceStore]);

  const stakeCall = useCallback(() => {
    const properties = getProperties();

    logEvent([EventName.Stake.stakingStarted, properties]);

    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis.sendDelegateToValidatorSetMsg(
        coin,
        "",
        (tx: any) =>
          Boolean(tx?.code) &&
          logEvent([
            EventName.Stake.stakingCompleted,
            { ...properties, squadSize: usersValidatorsMap.size },
          ])
      );
    } else {
      console.error("Account address is undefined");
    }
  }, [account, coin, logEvent, getProperties, usersValidatorsMap.size]);

  const unstakeCall = useCallback(() => {
    const properties = getProperties();

    logEvent([EventName.Stake.unstakingStarted, properties]);

    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis.sendUndelegateFromValidatorSetMsg(
        coin,
        "",
        (tx: any) =>
          Boolean(tx?.code) &&
          logEvent([
            EventName.Stake.unstakingCompleted,
            { ...properties, squadSize: usersValidatorsMap.size },
          ])
      );
    } else {
      console.error("Account address is undefined");
    }
  }, [account, coin, logEvent, getProperties, usersValidatorsMap.size]);

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
      setAmountDefault("input");
      amountConfig.setAmount(amount);
    },
    [amountConfig]
  );

  useEffect(() => {
    console.log("amountDefault: ", amountDefault);
  }, [amountDefault]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
              setAmountDefault("max");
              amountConfig.setFraction(1);
            }}
            handleHalfButtonClick={() => {
              setAmountDefault("half");
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
      />
      <ValidatorNextStepModal
        isNewUser={isNewUser}
        isOpen={showValidatorNextStepModal}
        onRequestClose={() => setShowValidatorNextStepModal(false)}
        setShowValidatorModal={setShowValidatorModal}
      />
    </main>
  );
});

export default Staking;

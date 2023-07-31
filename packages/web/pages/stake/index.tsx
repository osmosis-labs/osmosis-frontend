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
import { ValidatorNextStepModal } from "~/modals/validator-next-step";
import { ValidatorSquadModal } from "~/modals/validator-squad";
import { useStore } from "~/stores";
import { getAmountPrimitive } from "~/utils/get-amount-primitive";

export const Staking: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState("Stake");
  const [inputAmount, setInputAmount] = useState<string | undefined>(undefined);
  const [showValidatorModal, setShowValidatorModal] = useState(false);
  const [showValidatorNextStepModal, setShowValidatorNextStepModal] =
    useState(false);
  const t = useTranslation();

  const { chainStore, accountStore, queriesStore } = useStore();
  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";
  const queries = queriesStore.get(osmosisChainId);
  const osmo = chainStore.osmosis.stakeCurrency;
  const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;

  const stakeAmount = useMemo(() => {
    if (inputAmount) {
      return new CoinPretty(osmo, inputAmount);
    }
  }, [inputAmount, osmo]);

  const coin = useMemo(() => {
    const primitiveAmount = getAmountPrimitive(osmo, inputAmount);
    return { currency: osmo, amount: primitiveAmount.amount, denom: osmo };
  }, [osmo, inputAmount]);

  const stakeCall = useCallback(() => {
    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis.sendDelegateToValidatorSetMsg(coin);
    } else {
      console.error("Account address is undefined");
    }
  }, [account, coin]);

  const unstakeCall = useCallback(() => {
    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis.sendUndelegateFromValidatorSetMsg(coin);
    } else {
      console.error("Account address is undefined");
    }
  }, [account, coin]);

  const queryValidators = cosmosQueries.queryValidators.getQueryStatus(
    StakingType.BondStatus.Bonded
  );
  const activeValidators = queryValidators.validators;

  const userValidatorDelegations =
    cosmosQueries.queryDelegations.getQueryBech32Address(
      account?.address ?? ""
    ).delegations;

  const summedStakedAmount = userValidatorDelegations.reduce(
    (acc, delegation) => new Dec(delegation.balance.amount).add(acc),
    new Dec(0)
  );

  const stakingAPR = cosmosQueries.queryInflation.inflation.toDec();

  const prettifiedStakedBalance = new CoinPretty(
    osmo,
    summedStakedAmount
  ).maxDecimals(2);

  const usersValidatorsMap = useMemo(() => {
    const delegationsMap = new Map<string, StakingType.Delegation>();

    userValidatorDelegations.forEach((delegation) => {
      delegationsMap.set(delegation.delegation.validator_address, delegation);
    });

    return delegationsMap;
  }, [userValidatorDelegations]);

  let osmoBalance = useMemo(
    () =>
      queries.queryBalances
        .getQueryBech32Address(address)
        .getBalanceFromCurrency(osmo)
        .trim(true)
        .hideDenom(true)
        .maxDecimals(8)
        .toString(),
    [address, osmo, queries.queryBalances]
  );

  const alertTitle = `${t("stake.alertTitleBeginning")} ${stakingAPR
    .truncate()
    .toString()}% ${t("stake.alertTitleEnd")}`;

  const isNewUser = usersValidatorsMap.size === 0;

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
            inputAmount={inputAmount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            balance={osmoBalance}
            stakeAmount={stakeAmount}
            setShowValidatorNextStepModal={setShowValidatorNextStepModal}
            setInputAmount={setInputAmount}
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

import { Staking as StakingType } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import * as LDClient from "launchdarkly-node-server-sdk";
import { observer } from "mobx-react-lite";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { AlertBanner } from "~/components/alert-banner";
import { MainStakeCard } from "~/components/cards/main-stake-card";
import { StakeDashboard } from "~/components/cards/stake-dashboard";
import { ValidatorSquadModal } from "~/modals/validator-squad";
import { ValidatorNextStepModal } from "~/pages/stake/validator-next-steps-modal";
import { useStore } from "~/stores";

export const Staking: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState("Stake");
  const [inputAmount, setInputAmount] = useState<string | undefined>(undefined);
  const t = useTranslation();

  const { chainStore, accountStore, queriesStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const address = account?.address ?? "";
  const queries = queriesStore.get(chainId);
  const osmo = chainStore.osmosis.stakeCurrency;

  const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
    StakingType.BondStatus.Bonded
  );
  const activeValidators = queryValidators.validators;

  const userValidatorDelegations =
    queries.cosmos.queryDelegations.getQueryBech32Address(
      account?.address ?? ""
    ).delegations;

  const summedStakedAmount = userValidatorDelegations.reduce(
    (acc, delegation) => new Dec(delegation.balance.amount).add(acc),
    new Dec(0)
  );

  const osmosisChainId = chainStore.osmosis.chainId;

  const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;

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

  const stakeAmount = useMemo(() => {
    if (inputAmount) {
      return new CoinPretty(osmo, inputAmount).moveDecimalPointRight(
        osmo.coinDecimals
      );
    }
  }, [inputAmount, osmo]);

  const [showValidatorModal, setShowValidatorModal] = useState(false);
  const [showValidatorNextStepModal, setShowValidatorNextStepModal] =
    useState(false);

  const alertTitle = `${t("stake.alertTitleBeginning")} ${stakingAPR
    .truncate()
    .toString()}% ${t("stake.alertTitleEnd")}`;

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
          />
        </div>
        <StakeDashboard
          setShowValidatorModal={setShowValidatorModal}
          usersValidatorsMap={usersValidatorsMap}
          validators={activeValidators}
          balance={prettifiedStakedBalance}
        />
      </div>
      <ValidatorSquadModal
        isOpen={showValidatorModal}
        onRequestClose={() => setShowValidatorModal(false)}
        usersValidatorsMap={usersValidatorsMap}
        validators={activeValidators}
      />
      <ValidatorNextStepModal
        isOpen={showValidatorNextStepModal}
        onRequestClose={() => setShowValidatorNextStepModal(false)}
        usersValidatorsMap={usersValidatorsMap}
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

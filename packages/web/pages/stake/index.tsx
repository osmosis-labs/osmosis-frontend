import { Staking as StakingType } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import React, { useMemo, useState } from "react";

import { MainStakeCard } from "~/components/cards/main-stake-card";
import { StakeDashboard } from "~/components/cards/stake-dashboard";
import { ValidatorSquadModal } from "~/modals/validator-squad";
import { useStore } from "~/stores";

export const Staking: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Stake");
  const [inputAmount, setInputAmount] = useState<string | undefined>(undefined);

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

  const prettifiedStakedBalance = new CoinPretty(
    osmo,
    summedStakedAmount
  ).maxDecimals(2);

  const userValidatorDelegationsByValidatorAddress = useMemo(() => {
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

  return (
    <main className="relative flex h-screen items-center justify-center">
      <div className="flex w-full justify-center space-x-5">
        <MainStakeCard
          inputAmount={inputAmount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          balance={osmoBalance}
          stakeAmount={stakeAmount}
          setShowValidatorModal={setShowValidatorModal}
          setInputAmount={setInputAmount}
        />

        <StakeDashboard
          setShowValidatorModal={setShowValidatorModal}
          usersValidatorsMap={userValidatorDelegationsByValidatorAddress}
          validators={activeValidators}
          balance={prettifiedStakedBalance}
        />
      </div>
      <ValidatorSquadModal
        isOpen={showValidatorModal}
        onRequestClose={() => setShowValidatorModal(false)}
        userValidatorDelegationsByValidatorAddress={
          userValidatorDelegationsByValidatorAddress
        }
        validators={activeValidators}
      />
    </main>
  );
};

export default Staking;

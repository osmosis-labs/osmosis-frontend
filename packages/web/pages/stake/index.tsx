import { CoinPretty } from "@keplr-wallet/unit";
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

  let balance = useMemo(
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
          balance={balance}
          stakeAmount={stakeAmount}
          setShowValidatorModal={setShowValidatorModal}
          setInputAmount={setInputAmount}
        />

        <StakeDashboard setShowValidatorModal={setShowValidatorModal} />
      </div>
      <ValidatorSquadModal
        isOpen={showValidatorModal}
        onRequestClose={() => setShowValidatorModal(false)}
      />
    </main>
  );
};

export default Staking;

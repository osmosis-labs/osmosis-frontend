import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { EstimatedEarningCard } from "~/components/cards/estimated-earnings-card";
import { StakeInfoCard } from "~/components/cards/stake-info-card";
import { StakeTab } from "~/components/control/stake-tab";
import { ValidatorSquadModal } from "~/modals/validator-squad";
import { useStore } from "~/stores";

export const Staking: React.FC = () => {
  const t = useTranslation();
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
      const formattedAmount = new Dec(inputAmount).mul(
        DecUtils.getTenExponentNInPrecisionRange(osmo.coinDecimals)
      );
      return new CoinPretty(osmo, formattedAmount);
    }
  }, [inputAmount, osmo]);

  const [showValidatorModal, setShowValidatorModal] = useState(false);

  return (
    <main className="relative flex h-screen items-center justify-center">
      <div className="relative flex w-[27rem] flex-col gap-8 overflow-hidden rounded-[24px] bg-osmoverse-800 px-1 py-1 lg:mx-auto md:mt-mobile-header md:gap-6 md:px-3 md:pt-4 md:pb-4">
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-[24px] bg-osmoverse-800 px-6 pt-8 pb-8 md:px-3 md:pt-4 md:pb-4">
          <div className="relative flex w-full items-center justify-center">
            <h6 className="text-center">{t("stake.title")}</h6>
          </div>
          <div className="flex justify-around border-b-2 border-transparent">
            <StakeTab
              active={activeTab === "Stake"}
              onClick={() => setActiveTab("Stake")}
            >
              {t("stake.stake")}
            </StakeTab>
            <StakeTab
              active={activeTab === "Unstake"}
              onClick={() => setActiveTab("Unstake")}
            >
              {t("stake.unstake")}
            </StakeTab>
          </div>
          <StakeInfoCard
            balance={balance}
            setInputAmount={setInputAmount}
            inputAmount={inputAmount}
          />
          <EstimatedEarningCard stakeAmount={stakeAmount} />
          <Button mode="special-1" onClick={() => setShowValidatorModal(true)}>
            Stake
          </Button>
        </div>
      </div>
      <ValidatorSquadModal
        isOpen={showValidatorModal}
        onRequestClose={() => setShowValidatorModal(false)}
      />
    </main>
  );
};

export default Staking;

import { Staking as StakingType } from "@osmosis-labs/keplr-stores";
import { makeDelegateToValidatorSetMsg } from "@osmosis-labs/tx";
import { BondStatus } from "@osmosis-labs/types";
import { CoinPretty, Dec } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { AlertBanner } from "~/components/alert-banner";
import { StakeDashboard } from "~/components/cards/stake-dashboard";
import { StakeLearnMore } from "~/components/cards/stake-learn-more";
import { StakeTool } from "~/components/cards/stake-tool";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { Spinner } from "~/components/loaders/spinner";
import { StakeToInactiveValidatorsWarning } from "~/components/stake/inactive-delegations-warning";
import { UnbondingInProgress } from "~/components/stake/unbonding-in-progress";
import { StakeOrEdit, StakeOrUnstake } from "~/components/types";
import {
  useAmountConfig,
  useFakeFeeConfig,
  useGetApr,
  useTranslation,
} from "~/hooks";
import { useStakedAmountConfig } from "~/hooks/ui-config/use-staked-amount-config";
import { useInactiveDelegations } from "~/hooks/use-inactive-delegations";
import { useWalletSelect } from "~/hooks/use-wallet-select";
import { StakeLearnMoreModal } from "~/modals/stake-learn-more-modal";
import { ValidatorNextStepModal } from "~/modals/validator-next-step";
import { ValidatorSquadModal } from "~/modals/validator-squad-modal";
import { useStore } from "~/stores";

/** Stable fallback, so the preference map below keeps its identity. */
const NO_VALIDATOR_PREFERENCES: { val_oper_address: string; weight: string }[] =
  [];

export const Staking: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState<StakeOrUnstake>("Stake");
  const [showValidatorModal, setShowValidatorModal] = useState(false);
  const [isRedelegating, setIsRedelegating] = useState(false);
  const [showStakeLearnMoreModal, setShowStakeLearnMoreModal] = useState(false);
  const [showValidatorNextStepModal, setShowValidatorNextStepModal] =
    useState(false);

  const { t } = useTranslation();

  const { chainStore, accountStore, queriesStore } = useStore();
  const { onOpenWalletSelect, isLoading } = useWalletSelect();
  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);
  const address = account?.address ?? "";

  const osmo = chainStore.osmosis.stakeCurrency;
  const cosmosQueries = queriesStore.get(osmosisChainId).cosmos;
  const osmosisQueries = queriesStore.get(osmosisChainId).osmosis;

  const userHasValPrefs =
    osmosisQueries?.queryUsersValidatorPreferences.get(
      address
    ).hasValidatorPreferences;

  // read in render so the observer picks up the query once it resolves; a memo
  // keyed on the address alone kept the empty list from before it loaded
  const userValidatorPreferences =
    osmosisQueries?.queryUsersValidatorPreferences.get(address)
      .validatorPreferences ?? NO_VALIDATOR_PREFERENCES;

  const isFetchingValPrefs =
    osmosisQueries?.queryUsersValidatorPreferences.get(address).isFetching;

  const isWalletConnected = Boolean(account?.isWalletConnected);

  useEffect(() => {
    // reset states if wallet is disconnected
    if (!isWalletConnected) {
      setShowValidatorModal(false);
      setShowValidatorNextStepModal(false);
    }
  }, [isWalletConnected]);

  // using delegateToValidatorSet gas for fee config as the gas amount is the same as undelegate
  const feeConfig = useFakeFeeConfig(
    chainStore,
    osmosisChainId,
    makeDelegateToValidatorSetMsg.gas || 0
  );

  // wallet balance
  const stakeTabAmountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    osmosisChainId,
    address,
    feeConfig,
    osmo
  );

  // staked amount balance
  const unstakeTabAmountConfig = useStakedAmountConfig(
    chainStore,
    queriesStore,
    osmosisChainId,
    address,
    feeConfig,
    osmo
  );

  const stakeAmount = useMemo(() => {
    if (stakeTabAmountConfig.amount) {
      return new CoinPretty(osmo, stakeTabAmountConfig.amount);
    }
  }, [stakeTabAmountConfig.amount, osmo]);

  const activeAmountConfig =
    activeTab === "Stake" ? stakeTabAmountConfig : unstakeTabAmountConfig;

  const primitiveAmount = activeAmountConfig.getAmountPrimitive();

  const coin = useMemo(() => {
    return { currency: osmo, amount: primitiveAmount.amount, denom: osmo };
  }, [osmo, primitiveAmount]);

  const delegationQuery = cosmosQueries.queryDelegations.getQueryBech32Address(
    account?.address ?? ""
  );

  const unbondingDelegationsQuery =
    cosmosQueries.queryUnbondingDelegations.getQueryBech32Address(
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

  const usersValidatorSetPreferenceMap = useMemo(() => {
    const validatorSetPreferenceMap = new Map<string, string>();

    userValidatorPreferences.forEach(
      ({
        val_oper_address,
        weight,
      }: {
        val_oper_address: string;
        weight: string;
      }) => {
        validatorSetPreferenceMap.set(val_oper_address, weight);
      }
    );

    return validatorSetPreferenceMap;
  }, [userValidatorPreferences]);

  const validatorSquadModalAction: StakeOrEdit = Boolean(
    Number(stakeTabAmountConfig.amount)
  )
    ? "stake"
    : "edit";

  const stakeCall = useCallback(() => {
    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis
        .sendDelegateToValidatorSetMsg(coin, "")
        .catch(console.error);
    } else {
      console.error("Account address is undefined");
    }
  }, [account?.address, account?.osmosis, coin]);

  const unstakeCall = useCallback(() => {
    if (account?.address && account?.osmosis && coin?.amount) {
      account.osmosis
        .sendUndelegateFromRebalancedValidatorSet(coin, "")
        .catch(console.error);
    } else {
      console.error("Account address is undefined");
    }
  }, [account?.address, account?.osmosis, coin]);

  const isNewUser = !userHasValPrefs && usersValidatorsMap.size === 0;

  const onStakeButtonClick = useCallback(() => {
    if (!isWalletConnected) {
      onOpenWalletSelect({
        walletOptions: [{ walletType: "cosmos", chainId: osmosisChainId }],
      });
      return;
    }

    const selectedKeepValidators = localStorage.getItem("keepValidators");
    if (activeTab === "Stake") {
      if (selectedKeepValidators && !isNewUser) {
        stakeCall();
      } else if (selectedKeepValidators === null) {
        //user has not saved keepValidators in local storage
        setShowValidatorNextStepModal(true);
      } else {
        setShowValidatorModal(true);
      }
    } else {
      unstakeCall();
    }
  }, [
    isWalletConnected,
    activeTab,
    onOpenWalletSelect,
    osmosisChainId,
    isNewUser,
    stakeCall,
    unstakeCall,
  ]);

  const { stakingAPR, isLoadingApr } = useGetApr();

  const queryValidators = cosmosQueries.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const activeValidators = queryValidators.validators;

  const { inactiveDelegations } = useInactiveDelegations();

  const openRedelegate = useCallback(() => {
    setIsRedelegating(true);
    setShowValidatorModal(true);
  }, []);

  // New stake follows the stored preference, or the existing delegations when
  // there is none, so either can send fresh OSMO to a validator earning nothing.
  const stakeTargetsInactiveValidators = useMemo(() => {
    if (!isWalletConnected) return false;
    if (!userHasValPrefs) return inactiveDelegations.length > 0;
    if (!queryValidators.response) return false;

    const bondedAddresses = new Set(
      activeValidators.map(({ operator_address }) => operator_address)
    );
    return userValidatorPreferences.some(
      ({ val_oper_address }: { val_oper_address: string }) =>
        !bondedAddresses.has(val_oper_address)
    );
  }, [
    isWalletConnected,
    userHasValPrefs,
    inactiveDelegations,
    queryValidators.response,
    activeValidators,
    userValidatorPreferences,
  ]);

  // one decimal place, truncated so the banner never overstates the APR
  const alertTitle = `${t("stake.alertTitleBeginning")} ${stakingAPR.toString(
    1
  )}% ${t("stake.alertTitleEnd")}`;

  const showStakeLearnMore = !isWalletConnected || isNewUser;

  const { unbondingBalances } = unbondingDelegationsQuery;
  const unbondingInProcess = unbondingBalances.length > 0;

  function groupByCompletionTime(
    array: Array<{
      validatorAddress: string;
      entries: { completionTime: string; balance: CoinPretty }[];
    }>
  ): { completionTime: string; balance: CoinPretty }[] {
    const flattenedEntries = array.reduce(
      (acc, curr) => acc.concat(curr.entries),
      [] as { completionTime: string; balance: CoinPretty }[]
    );

    const groupedObjects: Record<string, CoinPretty> = {};

    flattenedEntries.forEach((entry) => {
      const { completionTime, balance } = entry;

      if (!groupedObjects[completionTime]) {
        groupedObjects[completionTime] = balance;
      } else {
        groupedObjects[completionTime] =
          groupedObjects[completionTime].add(balance);
      }
    });

    return Object.entries(groupedObjects).map(([completionTime, balance]) => ({
      completionTime,
      balance,
    }));
  }

  const hasInsufficientBalance = activeAmountConfig.balance
    ?.toDec()
    .lt(new Dec(activeAmountConfig.amount || "1"));

  // never disable when wallet is not connected
  const disableMainStakeCardButton = !isWalletConnected
    ? false
    : Number(activeAmountConfig.amount) <= 0 || hasInsufficientBalance;

  const setAmount = useCallback(
    (amount: string) => {
      const isNegative = Number(amount) < 0;
      if (!isNegative) {
        activeAmountConfig.setAmount(amount);
      }
    },
    [activeAmountConfig]
  );

  return (
    <main className="m-auto flex max-w-container flex-col gap-5 p-8 md:p-3">
      <div className="flex gap-4 xl:flex-col xl:gap-y-4">
        <div className="flex w-96 shrink-0 flex-col gap-5 xl:mx-auto">
          <SkeletonLoader isLoaded={!isLoadingApr} className="!rounded-3xl">
            <AlertBanner
              className="!rounded-3xl"
              title={alertTitle}
              subtitle={t("stake.alertSubtitle")}
              image={
                <div
                  className="pointer-events-none absolute left-0 h-full w-full bg-contain bg-no-repeat"
                  style={{
                    backgroundImage: 'url("/images/staking-apr.svg")',
                  }}
                />
              }
            />
          </SkeletonLoader>
          <StakeTool
            hasInsufficientBalance={hasInsufficientBalance}
            handleMaxButtonClick={() => activeAmountConfig.toggleIsMax()}
            handleHalfButtonClick={() =>
              activeAmountConfig.fraction
                ? activeAmountConfig.setFraction(0)
                : activeAmountConfig.setFraction(0.5)
            }
            isMax={activeAmountConfig.isMax}
            isHalf={activeAmountConfig.fraction === 0.5}
            inputAmount={activeAmountConfig.amount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            availableAmount={activeAmountConfig.balance}
            stakeAmount={stakeAmount}
            setShowValidatorNextStepModal={setShowValidatorNextStepModal}
            setInputAmount={setAmount}
            isWalletConnected={isWalletConnected}
            onStakeButtonClick={onStakeButtonClick}
            disabled={disableMainStakeCardButton}
            stakingAPR={stakingAPR}
            stakeWarning={
              stakeTargetsInactiveValidators && (
                <StakeToInactiveValidatorsWarning
                  onRedelegate={
                    inactiveDelegations.length
                      ? openRedelegate
                      : () => setShowValidatorModal(true)
                  }
                />
              )
            }
          />
        </div>
        <div className="flex w-96 flex-grow flex-col xl:mx-auto xl:min-h-[25rem]">
          {isLoading || isFetchingValPrefs ? (
            <div className="flex flex-auto items-center justify-center">
              <Spinner />
            </div>
          ) : showStakeLearnMore ? (
            <StakeLearnMore
              setShowValidatorModal={() => setShowValidatorModal(true)}
              isWalletConnected={isWalletConnected}
            />
          ) : (
            <StakeDashboard
              hasInsufficientBalance={hasInsufficientBalance}
              setShowValidatorModal={() => setShowValidatorModal(true)}
              setShowStakeLearnMoreModal={() =>
                setShowStakeLearnMoreModal(true)
              }
              usersValidatorsMap={usersValidatorsMap}
              validators={activeValidators}
              balance={unstakeTabAmountConfig.balance}
              inactiveDelegations={inactiveDelegations}
              onRedelegate={openRedelegate}
            />
          )}
        </div>
      </div>
      {unbondingInProcess && (
        <UnbondingInProgress
          unbondings={groupByCompletionTime(unbondingBalances)}
        />
      )}
      <ValidatorSquadModal
        isOpen={showValidatorModal}
        onRequestClose={() => {
          setShowValidatorModal(false);
          setIsRedelegating(false);
        }}
        usersValidatorsMap={usersValidatorsMap}
        usersValidatorSetPreferenceMap={usersValidatorSetPreferenceMap}
        validators={activeValidators}
        action={validatorSquadModalAction}
        coin={coin}
        queryValidators={queryValidators}
        isRedelegating={isRedelegating}
      />
      <ValidatorNextStepModal
        setShowStakeLearnMoreModal={() => setShowStakeLearnMoreModal(true)}
        isNewUser={isNewUser}
        isOpen={showValidatorNextStepModal}
        onRequestClose={() => setShowValidatorNextStepModal(false)}
        setShowValidatorModal={() => setShowValidatorModal(true)}
        stakeCall={stakeCall}
      />
      <StakeLearnMoreModal
        isOpen={showStakeLearnMoreModal}
        onRequestClose={() => setShowStakeLearnMoreModal(false)}
        isWalletConnected={Boolean(isWalletConnected)}
        setShowValidatorModal={() => setShowValidatorModal(true)}
      />
    </main>
  );
});

export default Staking;

import { Staking as StakingType } from "@osmosis-labs/keplr-stores";
import { DefaultGasPriceStep } from "@osmosis-labs/stores";
import { makeDelegateToValidatorSetMsg } from "@osmosis-labs/tx";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
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
import { useGetApr, useTranslation } from "~/hooks";
import { useAmountInput } from "~/hooks/input/use-amount-input";
import { useInactiveDelegations } from "~/hooks/use-inactive-delegations";
import { useWallet } from "~/hooks/use-wallet";
import { useWalletSelect } from "~/hooks/use-wallet-select";
import { StakeLearnMoreModal } from "~/modals/stake-learn-more-modal";
import { ValidatorNextStepModal } from "~/modals/validator-next-step";
import { ValidatorSquadModal } from "~/modals/validator-squad-modal";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/** Stable fallbacks, so the memos below keep their identity while loading. */
const NO_VALIDATOR_PREFERENCES: { val_oper_address: string; weight: string }[] =
  [];
const NO_DELEGATIONS: StakingType.Delegation[] = [];
const NO_VALIDATORS: StakingType.Validator[] = [];

export const Staking: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState<StakeOrUnstake>("Stake");
  const [showValidatorModal, setShowValidatorModal] = useState(false);
  // only the stake flow also delegates the entered amount; every other entry
  // point just edits the squad
  const [squadModalOpener, setSquadModalOpener] = useState<StakeOrEdit>("edit");
  const [isRedelegating, setIsRedelegating] = useState(false);
  const [showStakeLearnMoreModal, setShowStakeLearnMoreModal] = useState(false);
  const [showValidatorNextStepModal, setShowValidatorNextStepModal] =
    useState(false);

  const { t } = useTranslation();

  const { chainStore } = useStore();
  const { onOpenWalletSelect, isLoading } = useWalletSelect();
  const osmosisChainId = chainStore.osmosis.chainId;
  const {
    wallet: account,
    address: walletAddress,
    isWalletConnected,
  } = useWallet();
  const address = walletAddress ?? "";

  const osmo = chainStore.osmosis.stakeCurrency;

  const { data: validatorPreferences, isFetching: isFetchingValPrefs } =
    api.edge.staking.getUserValidatorPreferences.useQuery(
      { userOsmoAddress: address },
      { enabled: Boolean(address) }
    );
  const userValidatorPreferences =
    validatorPreferences ?? NO_VALIDATOR_PREFERENCES;
  const userHasValPrefs = userValidatorPreferences.length > 0;

  useEffect(() => {
    // reset states if wallet is disconnected
    if (!isWalletConnected) {
      setShowValidatorModal(false);
      setShowValidatorNextStepModal(false);
    }
  }, [isWalletConnected]);

  const { data: delegations, isFetched: isDelegationsFetched } =
    api.edge.staking.getUserDelegations.useQuery(
      { userOsmoAddress: address },
      { enabled: Boolean(address) }
    );
  const userValidatorDelegations = delegations ?? NO_DELEGATIONS;

  // Max stake leaves the fee at the high gas price; delegateToValidatorSet
  // costs the same gas as undelegating.
  const feeCurrency = chainStore.osmosis.feeCurrencies[0];
  const stakeFee = useMemo(
    () =>
      new CoinPretty(
        feeCurrency,
        new Dec(feeCurrency.gasPriceStep?.high ?? DefaultGasPriceStep.high).mul(
          new Dec(makeDelegateToValidatorSetMsg.gas || 0)
        )
      ),
    [feeCurrency]
  );

  // wallet balance
  const stakeTabAmountConfig = useAmountInput({
    currency: osmo,
    gasAmount: stakeFee,
    inputDebounceMs: 0,
  });

  // staked amount balance; the fee is paid from the wallet, so max is the
  // whole delegation
  const totalDelegated = useMemo(
    () =>
      userValidatorDelegations
        .reduce(
          (acc, { balance }) => acc.add(new Dec(balance.amount)),
          new Dec(0)
        )
        .truncate()
        .toString(),
    [userValidatorDelegations]
  );
  const unstakeTabAmountConfig = useAmountInput({
    currency: osmo,
    inputDebounceMs: 0,
    balanceOverride: {
      amount: totalDelegated,
      isFetched: isDelegationsFetched,
    },
  });

  const stakeAmount = stakeTabAmountConfig.amount;

  const activeAmountConfig =
    activeTab === "Stake" ? stakeTabAmountConfig : unstakeTabAmountConfig;

  const primitiveAmount = activeAmountConfig.amount?.toCoin().amount ?? "0";

  const coin = useMemo(() => {
    return { currency: osmo, amount: primitiveAmount, denom: osmo };
  }, [osmo, primitiveAmount]);

  const { data: unbondingDelegations } =
    api.edge.staking.getUserUnbondingDelegations.useQuery(
      { userOsmoAddress: address },
      { enabled: Boolean(address) }
    );

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

  const validatorSquadModalAction: StakeOrEdit =
    squadModalOpener === "stake" && Boolean(stakeTabAmountConfig.amount)
      ? "stake"
      : "edit";

  const openSquadModalToStake = useCallback(() => {
    setSquadModalOpener("stake");
    setShowValidatorModal(true);
  }, []);

  const openSquadModalToEdit = useCallback(() => {
    setSquadModalOpener("edit");
    setShowValidatorModal(true);
  }, []);

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
        openSquadModalToStake();
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
    openSquadModalToStake,
  ]);

  const { stakingAPR, isLoadingApr } = useGetApr();

  const { data: bondedValidators } = api.edge.staking.getValidators.useQuery({
    status: "Bonded",
  });
  const activeValidators = bondedValidators ?? NO_VALIDATORS;

  const { inactiveDelegations } = useInactiveDelegations();

  const openRedelegate = useCallback(() => {
    setIsRedelegating(true);
    openSquadModalToEdit();
  }, [openSquadModalToEdit]);

  // New stake follows the stored preference, or the existing delegations when
  // there is none, so either can send fresh OSMO to a validator earning nothing.
  const stakeTargetsInactiveValidators = useMemo(() => {
    if (!isWalletConnected) return false;
    if (!userHasValPrefs) return inactiveDelegations.length > 0;
    if (!bondedValidators) return false;

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
    bondedValidators,
    activeValidators,
    userValidatorPreferences,
  ]);

  // one decimal place, truncated so the banner never overstates the APR
  const alertTitle = `${t("stake.alertTitleBeginning")} ${stakingAPR.toString(
    1
  )}% ${t("stake.alertTitleEnd")}`;

  const showStakeLearnMore = !isWalletConnected || isNewUser;

  const unbondingBalances = useMemo(
    () =>
      (unbondingDelegations ?? []).map((unbonding) => ({
        validatorAddress: unbonding.validator_address,
        entries: unbonding.entries.map((entry) => ({
          completionTime: entry.completion_time,
          balance: new CoinPretty(osmo, new Int(entry.balance)),
        })),
      })),
    [unbondingDelegations, osmo]
  );
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

  // zero until the balance loads, like the MobX configs
  const activeBalance = activeAmountConfig.balance ?? new CoinPretty(osmo, 0);
  const stakedBalance =
    unstakeTabAmountConfig.balance ?? new CoinPretty(osmo, 0);

  // an empty input is compared against 1 OSMO
  const hasInsufficientBalance = activeBalance
    .toDec()
    .lt(
      activeAmountConfig.amount?.toDec() ??
        new Dec(activeAmountConfig.isEmpty ? 1 : 0)
    );

  // never disable when wallet is not connected
  const disableMainStakeCardButton = !isWalletConnected
    ? false
    : !activeAmountConfig.amount || hasInsufficientBalance;

  const setActiveAmount = activeAmountConfig.setAmount;
  const setAmount = useCallback(
    (amount: string) => {
      const isNegative = Number(amount) < 0;
      if (!isNegative) {
        setActiveAmount(amount);
      }
    },
    [setActiveAmount]
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
            handleMaxButtonClick={activeAmountConfig.toggleMax}
            handleHalfButtonClick={activeAmountConfig.toggleHalf}
            isMax={activeAmountConfig.fraction === 1}
            isHalf={activeAmountConfig.fraction === 0.5}
            inputAmount={activeAmountConfig.inputAmount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            availableAmount={activeBalance}
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
                  hasJailed={inactiveDelegations.some(
                    ({ status }) => status === "jailed"
                  )}
                  onRedelegate={
                    inactiveDelegations.length
                      ? openRedelegate
                      : openSquadModalToEdit
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
              setShowValidatorModal={openSquadModalToEdit}
              isWalletConnected={isWalletConnected}
            />
          ) : (
            <StakeDashboard
              hasInsufficientBalance={hasInsufficientBalance}
              setShowValidatorModal={openSquadModalToEdit}
              setShowStakeLearnMoreModal={() =>
                setShowStakeLearnMoreModal(true)
              }
              usersValidatorsMap={usersValidatorsMap}
              validators={activeValidators}
              balance={stakedBalance}
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
        isRedelegating={isRedelegating}
      />
      <ValidatorNextStepModal
        setShowStakeLearnMoreModal={() => setShowStakeLearnMoreModal(true)}
        isNewUser={isNewUser}
        isOpen={showValidatorNextStepModal}
        onRequestClose={() => setShowValidatorNextStepModal(false)}
        setShowValidatorModal={openSquadModalToStake}
        stakeCall={stakeCall}
      />
      <StakeLearnMoreModal
        isOpen={showStakeLearnMoreModal}
        onRequestClose={() => setShowStakeLearnMoreModal(false)}
        isWalletConnected={Boolean(isWalletConnected)}
        setShowValidatorModal={openSquadModalToEdit}
      />
    </main>
  );
});

export default Staking;

import Head from "next/head";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import {
  isError,
  ObservableQueryPoolDetails,
  ObservableQuerySuperfluidPool,
} from "@osmosis-labs/stores";
import moment from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { Button } from "../../components/buttons";
import {
  GoSuperfluidCard,
  PoolCatalystCard,
  PoolGaugeBonusCard,
  PoolGaugeCard,
  SuperfluidValidatorCard,
} from "../../components/cards";
import { MetricLoader } from "../../components/loaders";
import { Overview } from "../../components/overview";
import { BaseCell, ColumnDef, Table } from "../../components/table";
import { DepoolingTable } from "../../components/table/depooling-table";
import { truncateString } from "../../components/utils";
import {
  ExternalIncentiveGaugeAllowList,
  UnPoolWhitelistedPoolIds,
  PoolDetailEvents,
} from "../../config";
import {
  useAddLiquidityConfig,
  useAmountConfig,
  useRemoveLiquidityConfig,
  useWindowSize,
  useMatomoAnalytics,
} from "../../hooks";
import {
  LockTokensModal,
  ManageLiquidityModal,
  SuperfluidValidatorModal,
  TradeTokens,
} from "../../modals";
import { useStore } from "../../stores";

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const { isMobile } = useWindowSize();
  const { trackEvent } = useMatomoAnalytics();

  const { id: poolId } = router.query;
  const { chainId } = chainStore.osmosis;

  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainStore.osmosis.chainId);
  const pool = queryOsmosis.queryGammPools.getPool(poolId as string);
  let { bech32Address } = accountStore.getAccount(chainId);
  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

  // eject to pools page if pool does not exist
  const poolExists = queryOsmosis.queryGammPools.poolExists(poolId as string);
  useEffect(() => {
    if (poolExists === false) {
      router.push("/pools");
    }
  }, [poolExists]);

  // bech32Address = "osmo10f9tj5sh4km2x6edu0xzd3tc6n02rvja4kxnnn";

  // initialize pool data stores once root pool store is loaded
  const [poolDetailStore, setPoolDetailStore] =
    useState<ObservableQueryPoolDetails | null>(null);
  const externalGuages =
    pool && ExternalIncentiveGaugeAllowList[pool.id]
      ? poolDetailStore?.queryExternalGauges(
          ExternalIncentiveGaugeAllowList[pool.id],
          (denom) => chainStore.getChain(chainId).findCurrency(denom)
        )
      : undefined;
  const [superfluidPoolStore, setSuperfluidPoolStore] =
    useState<ObservableQuerySuperfluidPool | null>(null);
  useEffect(() => {
    if (poolExists && pool && !poolDetailStore)
      setPoolDetailStore(
        new ObservableQueryPoolDetails(
          bech32Address,
          fiat,
          pool,
          queryOsmosis,
          priceStore
        )
      );
    if (poolDetailStore && !superfluidPoolStore)
      setSuperfluidPoolStore(
        new ObservableQuerySuperfluidPool(
          bech32Address,
          fiat,
          poolDetailStore,
          queriesStore.get(chainId).cosmos.queryValidators,
          queriesStore.get(chainId).cosmos.queryInflation,
          queryOsmosis,
          priceStore
        )
      );
  }, [poolExists, pool, bech32Address, fiat, queryOsmosis, priceStore]);

  // Manage liquidity + bond LP tokens (modals) state
  const [showManageLiquidityDialog, do_setShowManageLiquidityDialog] =
    useState(false);
  const setShowManageLiquidityDialog = useCallback((isOpen: boolean) => {
    if (isOpen) {
      trackEvent(PoolDetailEvents.startManageLiquidity);
    }
    do_setShowManageLiquidityDialog(isOpen);
  }, []);
  const [showLockLPTokenModal, do_setShowLockLPTokenModal] = useState(false);
  const setShowLockLPTokenModal = useCallback(
    (show: boolean) => {
      if (show) trackEvent(PoolDetailEvents.startLockTokens);
      do_setShowLockLPTokenModal(show);
    },
    [do_setShowLockLPTokenModal]
  );

  const addLiquidityConfig = useAddLiquidityConfig(
    chainStore,
    chainId,
    pool?.id ?? "",
    bech32Address,
    queriesStore
  );
  const removeLiquidityConfig = useRemoveLiquidityConfig(
    chainStore,
    chainId,
    pool?.id ?? "",
    bech32Address,
    queriesStore
  );
  const lockLPTokensConfig = useAmountConfig(
    chainStore,
    queriesStore,
    chainId,
    bech32Address,
    undefined,
    pool ? queryOsmosis.queryGammPoolShare.getShareCurrency(pool.id) : undefined
  );

  const lockupGauges:
    | {
        id: string;
        apr: RatePretty;
        duration: plugin.Duration;
        superfluidApr?: RatePretty;
      }[]
    | undefined = superfluidPoolStore?.isSuperfluid
    ? superfluidPoolStore.superfluidGauges
    : poolDetailStore?.gauges;

  const [showSuperfluidValidatorModal, do_setShowSuperfluidValidatorsModal] =
    useState(false);
  const setShowSuperfluidValidatorsModal = useCallback(
    (show: boolean) => {
      trackEvent(PoolDetailEvents.goSuperfluid);
      do_setShowSuperfluidValidatorsModal(show);
    },
    [do_setShowSuperfluidValidatorsModal]
  );

  // swap modal
  const [showTradeTokenModal, setShowTradeTokenModal] = useState(false);

  // show sections
  const showDepoolButton =
    (pool &&
      UnPoolWhitelistedPoolIds[pool.id] !== undefined &&
      poolDetailStore?.userCanDepool) ||
    account.txTypeInProgress === "unPoolWhitelistedPool";
  const showLiquidityMiningSection =
    poolDetailStore?.isIncentivized ||
    (externalGuages && externalGuages.length > 0);

  const showPoolBondingTables =
    showLiquidityMiningSection ||
    (poolDetailStore?.userLockedAssets &&
      poolDetailStore.userLockedAssets?.some((lockedAsset) =>
        lockedAsset.amount.toDec().gt(new Dec(0))
      )) ||
    (poolDetailStore?.userUnlockingAssets &&
      poolDetailStore.userUnlockingAssets.length > 0);

  // user actions
  const addLiquidity = useCallback(async () => {
    try {
      if (
        addLiquidityConfig.isSingleAmountIn &&
        addLiquidityConfig.singleAmountInConfig
      ) {
        await account.osmosis.sendJoinSwapExternAmountInMsg(
          addLiquidityConfig.poolId,
          {
            currency: addLiquidityConfig.singleAmountInConfig.sendCurrency,
            amount: addLiquidityConfig.singleAmountInConfig.amount,
          },
          undefined,
          undefined,
          (tx) => {
            if (isError(tx))
              trackEvent(PoolDetailEvents.addSingleLiquidityFailure);
            else trackEvent(PoolDetailEvents.addSingleLiquiditySuccess);
            trackEvent(PoolDetailEvents.setSingleAssetLiquidity);

            setShowManageLiquidityDialog(false);
          }
        );
      } else if (addLiquidityConfig.shareOutAmount) {
        await account.osmosis.sendJoinPoolMsg(
          addLiquidityConfig.poolId,
          addLiquidityConfig.shareOutAmount.toDec().toString(),
          undefined,
          undefined,
          (tx) => {
            if (isError(tx)) trackEvent(PoolDetailEvents.addLiquidityFailure);
            else trackEvent(PoolDetailEvents.addLiquiditySuccess);

            setShowManageLiquidityDialog(false);
          }
        );
      }
    } catch (e) {
      console.error(e);
    }
  }, [
    account.osmosis,
    addLiquidityConfig.isSingleAmountIn,
    addLiquidityConfig.singleAmountInConfig,
    addLiquidityConfig.poolId,
    addLiquidityConfig.singleAmountInConfig?.sendCurrency,
    addLiquidityConfig.singleAmountInConfig?.amount,
    addLiquidityConfig.shareOutAmount,
  ]);
  const removeLiquidity = useCallback(async () => {
    try {
      await account.osmosis.sendExitPoolMsg(
        removeLiquidityConfig.poolId,
        removeLiquidityConfig.poolShareWithPercentage.toDec().toString(),
        undefined,
        undefined,
        (tx) => {
          if (isError(tx)) trackEvent(PoolDetailEvents.removeLiquidityFailure);
          else trackEvent(PoolDetailEvents.removeLiquiditySuccess);

          setShowManageLiquidityDialog(false);
        }
      );
    } catch (e) {
      console.error(e);
    }
  }, [
    account.osmosis,
    removeLiquidityConfig.poolId,
    removeLiquidityConfig.poolShareWithPercentage,
  ]);
  const lockToken = useCallback(
    async (gaugeId, electSuperfluid) => {
      if (electSuperfluid) {
        setShowLockLPTokenModal(false);
        setShowSuperfluidValidatorsModal(true);
        // `sendLockAndSuperfluidDelegateMsg` will be sent after superfluid modal
      } else {
        const gauge = lockupGauges?.find((gauge) => gauge.id === gaugeId);
        try {
          if (!gauge) {
            throw new Error("Error getting gauge");
          }
          if (
            !lockLPTokensConfig.sendCurrency.coinMinimalDenom.startsWith("gamm")
          ) {
            throw new Error("Tried to lock non-gamm token");
          }
          if (gauge) {
            await account.osmosis.sendLockTokensMsg(
              gauge.duration.asSeconds(),
              [
                {
                  currency: lockLPTokensConfig.sendCurrency,
                  amount: lockLPTokensConfig.amount,
                },
              ],
              undefined,
              (tx) => {
                if (isError(tx))
                  trackEvent(PoolDetailEvents.gammTokenLockFailure);
                else trackEvent(PoolDetailEvents.gammTokenLockSuccess);

                setShowLockLPTokenModal(false);
              }
            );
          } else {
            console.error("Gauge ID not found:", gaugeId);
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
    [
      lockupGauges,
      lockLPTokensConfig.sendCurrency,
      lockLPTokensConfig.amount,
      account.osmosis,
    ]
  );
  const selectSuperfluidValidator = useCallback(
    async (validatorAddress) => {
      if (superfluidPoolStore?.superfluid) {
        if (superfluidPoolStore.superfluid.upgradeableLpLockIds) {
          // is delegating existing locked shares
          try {
            await account.osmosis.sendSuperfluidDelegateMsg(
              superfluidPoolStore.superfluid.upgradeableLpLockIds.lockIds,
              validatorAddress,
              undefined,
              (tx) => {
                if (isError(tx))
                  trackEvent(PoolDetailEvents.superfluidStakeFailure);
                else trackEvent(PoolDetailEvents.superfluidStakeSuccess);
                setShowSuperfluidValidatorsModal(false);
              }
            );
          } catch (e) {
            console.error(e);
          }
        } else if (
          superfluidPoolStore.superfluid.superfluidLpShares &&
          lockLPTokensConfig
        ) {
          try {
            await account.osmosis.sendLockAndSuperfluidDelegateMsg(
              [
                {
                  currency: lockLPTokensConfig.sendCurrency,
                  amount: lockLPTokensConfig.amount,
                },
              ],
              validatorAddress,
              undefined,
              (tx) => {
                if (isError(tx))
                  trackEvent(PoolDetailEvents.superfluidStakeFailure);
                else trackEvent(PoolDetailEvents.superfluidStakeSuccess);

                setShowSuperfluidValidatorsModal(false);
              }
            );
            // TODO: clear/reset LP lock amount config ??
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
    [
      superfluidPoolStore?.superfluid,
      superfluidPoolStore?.superfluid?.upgradeableLpLockIds,
      superfluidPoolStore?.superfluid?.upgradeableLpLockIds?.lockIds,
      superfluidPoolStore?.superfluid?.superfluidLpShares,
      lockLPTokensConfig.sendCurrency,
      lockLPTokensConfig.amount,
    ]
  );

  return (
    <main>
      <Head>
        <title>Pool #{poolId}</title>
      </Head>
      {pool && addLiquidityConfig && removeLiquidityConfig && (
        <ManageLiquidityModal
          isOpen={showManageLiquidityDialog}
          title="Manage Liquidity"
          onRequestClose={() => setShowManageLiquidityDialog(false)}
          addLiquidityConfig={addLiquidityConfig}
          removeLiquidityConfig={removeLiquidityConfig}
          isSendingMsg={account.txTypeInProgress !== ""}
          getFiatValue={(coin) => priceStore.calculatePrice(coin)}
          onAddLiquidity={addLiquidity}
          onRemoveLiquidity={removeLiquidity}
        />
      )}
      {pool && (
        <TradeTokens
          className="md:!p-0"
          hideCloseButton={isMobile}
          isOpen={showTradeTokenModal}
          onRequestClose={() => setShowTradeTokenModal(false)}
          pools={[pool.pool]}
        />
      )}
      {lockLPTokensConfig && lockupGauges && (
        <LockTokensModal
          isOpen={showLockLPTokenModal}
          title="Liquidity Bonding"
          onRequestClose={() => setShowLockLPTokenModal(false)}
          isSendingMsg={account.txTypeInProgress !== ""}
          amountConfig={lockLPTokensConfig}
          isMobile={isMobile}
          availableToken={
            pool
              ? queryOsmosis.queryGammPoolShare.getAvailableGammShare(
                  bech32Address,
                  pool.id
                )
              : undefined
          }
          gauges={lockupGauges}
          hasSuperfluidValidator={
            superfluidPoolStore?.superfluid?.delegations &&
            superfluidPoolStore.superfluid.delegations.length > 0
          }
          onLockToken={lockToken}
        />
      )}
      {superfluidPoolStore?.superfluid && pool && lockLPTokensConfig && (
        <SuperfluidValidatorModal
          title={isMobile ? "Select Validator" : "Select Superfluid Validator"}
          availableBondAmount={
            superfluidPoolStore?.superfluid.upgradeableLpLockIds
              ? superfluidPoolStore.superfluid.upgradeableLpLockIds.amount // is delegating amount from existing lockup
              : new CoinPretty(
                  pool.shareCurrency, // is delegating amount from new/pending lockup
                  lockLPTokensConfig.amount !== ""
                    ? lockLPTokensConfig.amount
                    : new Dec(0)
                )
          }
          isOpen={showSuperfluidValidatorModal}
          onRequestClose={() => setShowSuperfluidValidatorsModal(false)}
          isSendingMsg={account.txTypeInProgress !== ""}
          onSelectValidator={selectSuperfluidValidator}
        />
      )}
      <Overview
        title={
          <MetricLoader className="h-7 w-64" isLoading={!pool}>
            <h5>
              {`Pool #${pool?.id} : ${pool?.poolAssets
                .map((asset) => asset.amount.currency.coinDenom.split(" ")[0])
                .map((denom) => truncateString(denom))
                .join(" / ")}`}
            </h5>
          </MetricLoader>
        }
        titleButtons={[
          {
            label: "Add / Remove Liquidity",
            onClick: () => setShowManageLiquidityDialog(true),
          },
          {
            label: "Swap Tokens",
            onClick: () => {
              trackEvent(PoolDetailEvents.startSwapTokens);
              setShowTradeTokenModal(true);
            },
          },
        ]}
        primaryOverviewLabels={[
          {
            label: "Pool Liquidity",
            value: (
              <MetricLoader
                className="h-7 w-56"
                isLoading={!pool || !poolDetailStore?.totalValueLocked}
              >
                {poolDetailStore?.totalValueLocked?.toString()}
              </MetricLoader>
            ),
          },
          {
            label: "My Liquidity",
            value: (
              <MetricLoader
                className="h-7 "
                isLoading={!poolDetailStore?.userLockedValue}
              >
                {poolDetailStore?.userLockedValue?.toString() ??
                  `0${fiat.symbol}`}
              </MetricLoader>
            ),
          },
        ]}
        secondaryOverviewLabels={[
          {
            label: "Bonded",
            value: (
              <MetricLoader
                className="h-4"
                isLoading={!poolDetailStore?.userBondedValue}
              >
                {poolDetailStore?.userBondedValue?.toString() ??
                  `0${fiat.symbol}`}
              </MetricLoader>
            ),
          },
          {
            label: "Swap Fee",
            value: (
              <MetricLoader className="h-4" isLoading={!pool}>
                {pool?.swapFee.toString() ?? "0%"}
              </MetricLoader>
            ),
          },
        ]}
        bgImageUrl="/images/osmosis-guy-in-lab.png"
      />
      <section className="bg-surface min-h-screen">
        <div className="max-w-container mx-auto md:p-5 p-10">
          {showLiquidityMiningSection && (
            <div className="flex lg:flex-col gap-6 place-content-between">
              <div className="max-w-md">
                <div className="flex lg:flex-col gap-3">
                  {isMobile ? (
                    <span className="subtitle1 text-lg">Liquidity Mining</span>
                  ) : (
                    <h5>Liquidity Mining</h5>
                  )}
                  {superfluidPoolStore?.superfluid && (
                    <div className="bg-superfluid w-fit rounded-full px-4 py-1 md:caption text-base">
                      Superfluid Staking Enabled
                    </div>
                  )}
                </div>
                <p className="text-white-mid md:caption py-2">
                  Bond liquidity to various minimum unbonding periods to earn
                  OSMO liquidity rewards and swap fees
                </p>
              </div>
              <div className="flex flex-col gap-2 text-right lg:text-left">
                <span className="caption text-white-mid">
                  Available LP tokens
                </span>
                <span className="font-h5 text-h5 md:subtitle1">
                  <MetricLoader
                    className="h-6"
                    isLoading={!poolDetailStore?.userAvailableValue}
                  >
                    {poolDetailStore?.userAvailableValue?.toString() || "$0"}
                  </MetricLoader>
                </span>
                <Button
                  className="h-8 lg:w-fit w-full md:caption"
                  onClick={() => setShowLockLPTokenModal(true)}
                >
                  Start Earning
                </Button>
              </div>
            </div>
          )}
          {externalGuages && externalGuages.length > 0 && (
            <div className="flex lg:flex-col md:gap-3 gap-9 place-content-between md:pt-8 pt-10">
              {externalGuages.map(
                (
                  { rewardAmount, duration: durationDays, remainingEpochs },
                  index
                ) => (
                  <PoolGaugeBonusCard
                    key={index}
                    bonusValue={
                      rewardAmount?.maxDecimals(0).trim(true).toString() ?? "0"
                    }
                    days={durationDays}
                    remainingEpochs={remainingEpochs.toString()}
                    isMobile={isMobile}
                  />
                )
              )}
            </div>
          )}
          {lockupGauges && pool && (
            <div className="flex lg:flex-col md:gap-3 gap-9 place-content-between md:pt-8 pt-10">
              {lockupGauges.map(({ duration, superfluidApr }, i) => (
                <PoolGaugeCard
                  key={duration.humanize()}
                  days={duration.humanize()}
                  apr={queryOsmosis.queryIncentivizedPools
                    .computeAPY(pool.id, duration, priceStore, fiat)
                    .maxDecimals(2)
                    .toString()}
                  superfluidApr={
                    superfluidApr
                      ? superfluidApr.maxDecimals(2).toString()
                      : undefined
                  }
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </div>
        {superfluidPoolStore?.superfluid &&
          superfluidPoolStore.superfluid.delegations &&
          superfluidPoolStore?.superfluid.delegations.length > 0 && (
            <div className="max-w-container mx-auto md:p-5 p-10 flex flex-col gap-4">
              {isMobile ? (
                <span className="subtitle2">My Superfluid Stake</span>
              ) : (
                <h5>Superfluid Staking</h5>
              )}
              {superfluidPoolStore.superfluid.upgradeableLpLockIds ? (
                <GoSuperfluidCard
                  goSuperfluid={() => setShowSuperfluidValidatorsModal(true)}
                  isMobile={isMobile}
                />
              ) : (
                superfluidPoolStore.superfluid.delegations.map(
                  (
                    {
                      validatorName,
                      validatorImgSrc,
                      validatorCommission,
                      amount,
                      apr,
                    },
                    index
                  ) => (
                    <SuperfluidValidatorCard
                      key={index}
                      validatorName={validatorName}
                      validatorImgSrc={validatorImgSrc}
                      validatorCommission={validatorCommission?.toString()}
                      delegation={amount.trim(true).toString()}
                      apr={apr.maxDecimals(2).trim(true).toString()}
                      isMobile={isMobile}
                    />
                  )
                )
              )}
            </div>
          )}
        {showPoolBondingTables && (
          <div className="max-w-container mx-auto md:p-5 p-10">
            <div className="flex items-center place-content-between">
              {isMobile ? (
                <span className="subtitle2">My Bondings</span>
              ) : (
                <h6>My Bondings</h6>
              )}
              {showDepoolButton && pool && (
                <Button
                  className="h-8 px-2"
                  onClick={async () => {
                    try {
                      await account.osmosis.sendUnPoolWhitelistedPoolMsg(
                        pool.id,
                        undefined,
                        (tx) => {
                          if (isError(tx))
                            trackEvent(PoolDetailEvents.unpoolFailure);
                          else trackEvent(PoolDetailEvents.unpoolSuccess);
                        }
                      );
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  loading={account.txTypeInProgress === "unPoolWhitelistedPool"}
                >
                  Depool LP Shares
                </Button>
              )}
            </div>
            <Table
              className="md:-mx-5 md:w-screen md:caption w-full my-5"
              headerTrClassName="md:h-11"
              columnDefs={(
                [
                  {
                    display: "Unbonding Duration",
                    className: "!pl-8",
                    displayCell: superfluidPoolStore?.isSuperfluid
                      ? ({ value, isSuperfluidDuration }) => (
                          <div className="flex items-center gap-3">
                            <span>{value ?? ""}</span>
                            {isSuperfluidDuration && (
                              <Image
                                alt="superfluid"
                                src="/icons/superfluid-osmo.svg"
                                height={20}
                                width={20}
                              />
                            )}
                          </div>
                        )
                      : undefined,
                  },
                  { display: "Current APR" },
                  { display: "Amount" },
                  {
                    display: "Action",
                    className:
                      "md:text-right text-center md:justify-right justify-center",
                    displayCell: ({
                      amount,
                      lockIds,
                      isSuperfluidDuration,
                    }) => (
                      <Button
                        className="md:ml-auto md:caption m-auto pr-0 !md:justify-right !justify-center"
                        type={isMobile ? undefined : "arrow"}
                        size="xs"
                        disabled={
                          account.txTypeInProgress !== "" ||
                          amount?.toDec().equals(new Dec(0))
                        }
                        onClick={async () => {
                          if (!lockIds) return;
                          try {
                            const blockGasLimitLockIds = lockIds.slice(0, 4);

                            // refresh locks
                            for (const lockId of blockGasLimitLockIds) {
                              await queryOsmosis.querySyntheticLockupsByLockId
                                .get(lockId)
                                .waitFreshResponse();
                            }

                            // make msg lock objects
                            const locks = blockGasLimitLockIds.map(
                              (lockId) => ({
                                lockId,
                                isSyntheticLock:
                                  queryOsmosis.querySyntheticLockupsByLockId.get(
                                    lockId
                                  ).isSyntheticLock === true,
                              })
                            );

                            if (
                              isSuperfluidDuration ||
                              locks.some((lock) => lock.isSyntheticLock)
                            ) {
                              await account.osmosis.sendBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
                                locks,
                                undefined,
                                (tx) => {
                                  if (isError(tx))
                                    trackEvent(
                                      PoolDetailEvents.gammTokenUnlockFailure
                                    );
                                  else
                                    trackEvent(
                                      PoolDetailEvents.gammTokenUnlockSuccess
                                    );
                                }
                              );
                            } else {
                              const blockGasLimitLockIds = lockIds.slice(0, 10);
                              await account.osmosis.sendBeginUnlockingMsg(
                                blockGasLimitLockIds,
                                undefined,
                                (tx) => {
                                  if (isError(tx))
                                    trackEvent(
                                      PoolDetailEvents.gammTokenUnlockFailure
                                    );
                                  else
                                    trackEvent(
                                      PoolDetailEvents.gammTokenUnlockSuccess
                                    );
                                }
                              );
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        {isMobile ? "Unbond" : "Unbond All"}
                      </Button>
                    ),
                  },
                ] as ColumnDef<
                  BaseCell & {
                    duration: Duration;
                    amount: CoinPretty;
                    apr?: RatePretty;
                    lockIds: string[];
                    isSuperfluidDuration: boolean;
                  }
                >[]
              ).filter(({ display }) =>
                isMobile ? display !== "Current APR" : true
              )}
              data={
                poolDetailStore?.userLockedAssets?.map((lockedAsset, index) => {
                  const isSuperfluidDuration =
                    index ===
                      (poolDetailStore.userLockedAssets?.length ?? 0) - 1 &&
                    superfluidPoolStore?.superfluid?.delegations &&
                    superfluidPoolStore.superfluid.delegations.length > 0;
                  return [
                    {
                      value: lockedAsset.duration.humanize(),
                      isSuperfluidDuration,
                    }, // Unbonding Duration
                    {
                      value:
                        lockedAsset.apr?.maxDecimals(2).trim(true).toString() ??
                        "0%",
                    }, // Current APR
                    {
                      value: lockedAsset.amount
                        .maxDecimals(6)
                        .trim(true)
                        .toString(),
                    }, // Amount
                    {
                      ...lockedAsset,
                      value: lockedAsset.duration.humanize(),
                      isSuperfluidDuration,
                    }, // Unbond All button
                  ].filter((_row, index) => (isMobile ? index !== 1 : true));
                }) ?? []
              }
            />
          </div>
        )}
        {pool && (
          <DepoolingTable
            className="w-full p-10 md:p-5 max-w-container py-5 mx-auto"
            tableClassName="md:w-screen md:-mx-5"
            poolId={pool.id}
          />
        )}
        {poolDetailStore?.userUnlockingAssets &&
          poolDetailStore.userUnlockingAssets.length > 0 && (
            <div className="max-w-container mx-auto md:p-5 p-10">
              {isMobile ? (
                <span className="subtitle2">Unbondings</span>
              ) : (
                <h6>Unbondings</h6>
              )}
              <Table
                className="md:-mx-5 md:w-screen md:caption w-full my-5"
                headerTrClassName="md:h-11"
                columnDefs={[
                  {
                    display: "Unbonding Duration",
                    className: "w-1/3 !pl-8",
                  },
                  { display: "Amount", className: "w-1/3" },
                  {
                    display: "Unbonding Complete",
                    className: "w-1/3",
                  },
                ]}
                data={
                  poolDetailStore?.userUnlockingAssets?.map(
                    ({ duration, amount, endTime }) => [
                      {
                        value: duration.humanize(),
                      },
                      {
                        value: amount.maxDecimals(6).trim(true).toString(),
                      },
                      {
                        value: moment(endTime).fromNow(),
                      },
                    ]
                  ) ?? []
                }
              />
            </div>
          )}
        {superfluidPoolStore?.superfluid?.undelegations &&
          superfluidPoolStore.superfluid.undelegations.length > 0 && (
            <div className="max-w-container mx-auto md:p-5 p-10">
              {isMobile ? (
                <span className="subtitle2">Superfluid Unbondings</span>
              ) : (
                <h6>Superfluid Unbondings</h6>
              )}
              <Table
                className="md:-mx-5 md:w-screen md:caption w-full my-5"
                headerTrClassName="md:h-11"
                columnDefs={[
                  {
                    display: "Validator",
                    className: "w-1/3 !pl-8",
                  },
                  { display: "Amount", className: "w-1/3" },
                  {
                    display: "Unbonding Complete",
                    className: "w-1/3",
                  },
                ]}
                data={
                  superfluidPoolStore.superfluid.undelegations.map(
                    ({ validatorName, inactive, amount, endTime }) => [
                      {
                        value: `${validatorName ?? ""}${
                          inactive
                            ? inactive === "jailed"
                              ? " (Jailed)"
                              : " (Inactive)"
                            : ""
                        }`,
                      },
                      {
                        value: amount.maxDecimals(6).trim(true).toString(),
                      },
                      {
                        value: moment(endTime).fromNow(),
                      },
                    ]
                  ) ?? []
                }
              />
            </div>
          )}
        <div className="max-w-container mx-auto md:p-5 p-10">
          {isMobile ? (
            <span className="subtitle2">Pool Catalyst</span>
          ) : (
            <h5>Pool Catalyst</h5>
          )}
          <div className="flex flex-wrap md:flex-col gap-5 my-5">
            {(poolDetailStore?.userPoolAssets ?? [undefined, undefined]).map(
              (userAsset, index) => {
                const totalAmount = pool?.poolAssets
                  .find(
                    (asset) =>
                      asset.amount.currency.coinDenom ===
                      userAsset?.asset.currency.coinDenom
                  )
                  ?.amount.trim(true);
                const myAmount = userAsset?.asset.maxDecimals(6).trim(true);

                const totalAmountAdjusted = totalAmount
                  ? truncateString(
                      totalAmount
                        .maxDecimals(
                          totalAmount.toDec().lte(new Dec(1))
                            ? totalAmount.currency.coinDecimals
                            : 6
                        )
                        .toString(),
                      30
                    )
                  : "0";
                const myAmountAdjusted = myAmount
                  ? truncateString(
                      myAmount
                        .maxDecimals(
                          myAmount.toDec().lte(new Dec(1))
                            ? myAmount.currency.coinDecimals
                            : 6
                        )
                        .toString(),
                      30
                    )
                  : "0";

                return (
                  <PoolCatalystCard
                    key={index}
                    colorKey={Number(pool?.id ?? "0") + index}
                    isLoading={!pool || !poolDetailStore?.userPoolAssets}
                    className="md:w-full w-1/2 max-w-md"
                    percentDec={userAsset?.ratio.toString()}
                    tokenDenom={userAsset?.asset.currency.coinDenom}
                    isMobile={isMobile}
                    metrics={[
                      {
                        label: "Total amount",
                        value: (
                          <MetricLoader
                            isLoading={!poolDetailStore?.userPoolAssets}
                          >
                            {totalAmountAdjusted}
                          </MetricLoader>
                        ),
                      },
                      {
                        label: "My amount",
                        value: (
                          <MetricLoader
                            isLoading={!poolDetailStore?.userPoolAssets}
                          >
                            {myAmountAdjusted}
                          </MetricLoader>
                        ),
                      },
                    ]}
                  />
                );
              }
            )}
          </div>
        </div>
      </section>
    </main>
  );
});

export default Pool;

import Head from "next/head";
import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryGuageById } from "@osmosis-labs/stores";
import moment from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";
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
} from "../../config";
import {
  useAddLiquidityConfig,
  useAmountConfig,
  useRemoveLiquidityConfig,
  useWindowSize,
} from "../../hooks";
import {
  LockTokensModal,
  ManageLiquidityModal,
  SuperfluidValidatorModal,
  TradeTokens,
} from "../../modals";
import { useStore } from "../../stores";
import { useTranslation } from "react-multi-lang";

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const t = useTranslation();
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();
  const { isMobile } = useWindowSize();

  const { id: poolId } = router.query;
  const { chainId } = chainStore.osmosis;

  const queryCosmos = queriesStore.get(chainId).cosmos;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainStore.osmosis.chainId);
  const pool = queryOsmosis.queryGammPools.getPool(poolId as string);
  const { bech32Address } = accountStore.getAccount(chainId);
  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

  // pool is loading if undefined
  let totalValueLocked: PricePretty | undefined;
  let userLockedValue: PricePretty | undefined;
  let userBondedValue: PricePretty | undefined;
  let userAvailableValue: PricePretty | undefined;
  let userPoolAssets: { ratio: RatePretty; asset: CoinPretty }[] | undefined;
  let userLockedAssets:
    | {
        duration: Duration;
        amount: CoinPretty;
        lockIds: string[];
        apr?: RatePretty;
      }[]
    | undefined;
  let userUnlockingAssets:
    | {
        duration: Duration;
        amount: CoinPretty;
        endTime: Date;
      }[]
    | undefined;
  let externalGuages:
    | {
        duration: string;
        rewardAmount?: CoinPretty;
        remainingEpochs: number;
      }[]
    | undefined;
  let guages: ObservableQueryGuageById[] | undefined;
  let superfluid:
    | "not-superfluid-pool" // code smell that we don't do loading right, consider other structure besides `undefined` for representing loading data
    | {
        // has superfluid-able shares locked, but has not chosen sfs validator
        upgradeableLPLockIds: {
          amount: CoinPretty;
          lockIds: string[];
        };
      }
    | {
        // has delegations or is undelegating
        delegations?: {
          validatorName?: string;
          validatorCommission?: RatePretty;
          validatorImgSrc: string;
          apr: RatePretty;
          amount: CoinPretty;
        }[];
        undelegations?: {
          validatorName?: string;
          amount: CoinPretty;
          endTime: Date;
        }[];
        superfluidLPShares: {
          amount: CoinPretty;
          lockIds: string[];
        };
      }
    | undefined;

  if (pool) {
    totalValueLocked = pool.computeTotalValueLocked(priceStore);
    userLockedValue = totalValueLocked?.mul(
      queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
        bech32Address,
        pool.id
      )
    );
    userBondedValue = totalValueLocked
      ? queryOsmosis.queryGammPoolShare.getLockedGammShareValue(
          bech32Address,
          pool.id,
          totalValueLocked,
          fiat
        )
      : undefined;
    userAvailableValue = !pool.totalShare.toDec().equals(new Dec(0))
      ? totalValueLocked.mul(
          queryOsmosis.queryGammPoolShare
            .getAvailableGammShare(bech32Address, pool.id)
            .quo(pool.totalShare)
        )
      : new PricePretty(fiat, new Dec(0));
    userPoolAssets = pool.poolAssets.map((asset) => ({
      ratio: new RatePretty(asset.weight.quo(pool.totalWeight)),
      asset: asset.amount
        .mul(
          queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
            bech32Address,
            pool.id
          )
        )
        .trim(true)
        .shrink(true),
    }));
    userLockedAssets = queryOsmosis.queryGammPoolShare
      .getShareLockedAssets(
        bech32Address,
        pool.id,
        queryOsmosis.queryLockableDurations.lockableDurations
      )
      .map((lockedAsset) =>
        // calculate APR% for this pool asset
        ({
          ...lockedAsset,
          apr: queryOsmosis.queryIncentivizedPools.isIncentivized(pool.id)
            ? new RatePretty(
                queryOsmosis.queryIncentivizedPools.computeAPY(
                  pool.id,
                  lockedAsset.duration,
                  priceStore,
                  fiat
                )
              )
            : undefined,
        })
      );
    const poolShareCurrency = queryOsmosis.queryGammPoolShare.getShareCurrency(
      pool.id
    );
    userUnlockingAssets = queryOsmosis.queryLockableDurations.lockableDurations
      .map(
        (duration) => {
          const unlockings = queryOsmosis.queryAccountLocked
            .get(bech32Address)
            .getUnlockingCoinWithDuration(poolShareCurrency, duration);

          return unlockings.map((unlocking) => ({
            ...unlocking,
            duration,
          }));
        },
        [] as {
          duration: Duration;
          amount: CoinPretty;
          endTime: Date;
        }[]
      )
      .flat();
    externalGuages = (ExternalIncentiveGaugeAllowList[pool.id] ?? [])
      .map(({ gaugeId, denom }) => {
        const observableGauge = queryOsmosis.queryGauge.get(gaugeId);
        const currency = chainStore
          .getChain(chainStore.osmosis.chainId)
          .findCurrency(denom);

        if (observableGauge.remainingEpoch < 1) {
          return;
        }

        return {
          duration: observableGauge.lockupDuration.humanize(),
          rewardAmount: currency
            ? observableGauge.getRemainingCoin(currency)
            : undefined,
          remainingEpochs: observableGauge.remainingEpoch,
        };
      })
      .filter(
        (
          gauge
        ): gauge is {
          duration: string;
          rewardAmount: CoinPretty | undefined;
          remainingEpochs: number;
        } => gauge !== undefined
      );

    const lockableDurations =
      queryOsmosis.queryLockableDurations.lockableDurations;
    guages = lockableDurations.map((duration) => {
      const guageId =
        queryOsmosis.queryIncentivizedPools.getIncentivizedGaugeId(
          pool.id,
          duration
        )!;
      return queryOsmosis.queryGauge.get(guageId);
    });

    const isSuperfluid = queryOsmosis.querySuperfluidPools.isSuperfluidPool(
      pool.id
    );
    const upgradeableLPLockIds:
      | {
          amount: CoinPretty;
          lockIds: string[];
        }
      | undefined =
      lockableDurations.length > 0
        ? queryOsmosis.queryAccountLocked
            .get(bech32Address)
            .getLockedCoinWithDuration(
              poolShareCurrency,
              lockableDurations[lockableDurations.length - 1]
            )
        : undefined;
    const notDelegatedLockedSfsLpShares =
      queryOsmosis.querySuperfluidDelegations
        .getQuerySuperfluidDelegations(bech32Address)
        .getDelegations(poolShareCurrency)?.length === 0 &&
      upgradeableLPLockIds &&
      upgradeableLPLockIds.lockIds.length > 0;
    superfluid = isSuperfluid
      ? notDelegatedLockedSfsLpShares
        ? { upgradeableLPLockIds }
        : {
            delegations: queryOsmosis.querySuperfluidDelegations
              .getQuerySuperfluidDelegations(bech32Address)
              .getDelegations(poolShareCurrency)
              ?.map(({ validator_address, amount }) => {
                const queryValidators =
                  queryCosmos.queryValidators.getQueryStatus(
                    Staking.BondStatus.Bonded
                  );
                const validatorInfo =
                  queryValidators.getValidator(validator_address);
                let superfluidApr = queryCosmos.queryInflation.inflation.mul(
                  queryOsmosis.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                    pool.id
                  )
                );

                const lockableDurations =
                  queryOsmosis.queryLockableDurations.lockableDurations;

                if (lockableDurations.length > 0) {
                  const poolApr =
                    queryOsmosis.queryIncentivizedPools.computeAPY(
                      pool.id,
                      lockableDurations[lockableDurations.length - 1],
                      priceStore,
                      fiat
                    );
                  superfluidApr = superfluidApr.add(
                    poolApr.moveDecimalPointRight(2).toDec()
                  );
                }

                const commissionRateRaw =
                  validatorInfo?.commission.commission_rates.rate;

                return {
                  validatorName: validatorInfo?.description.moniker,
                  validatorCommission: commissionRateRaw
                    ? new RatePretty(new Dec(commissionRateRaw))
                    : undefined,
                  validatorImgSrc:
                    queryValidators.getValidatorThumbnail(validator_address),
                  apr: new RatePretty(superfluidApr.moveDecimalPointLeft(2)),
                  amount:
                    queryOsmosis.querySuperfluidOsmoEquivalent.calculateOsmoEquivalent(
                      amount
                    ),
                };
              }),
            undelegations: queryOsmosis.querySuperfluidUndelegations
              .getQuerySuperfluidDelegations(bech32Address)
              .getUndelegations(poolShareCurrency)
              ?.map(({ validator_address, amount, end_time }) => ({
                validatorName: queriesStore
                  .get(chainId)
                  .cosmos.queryValidators.getQueryStatus(
                    Staking.BondStatus.Bonded
                  )
                  .getValidator(validator_address)?.description.moniker,
                amount,
                endTime: end_time,
              })),
            superfluidLPShares: queryOsmosis.queryAccountLocked
              .get(bech32Address)
              .getLockedCoinWithDuration(
                poolShareCurrency,
                lockableDurations[lockableDurations.length - 1]
              ),
          }
      : "not-superfluid-pool";
  }

  // eject to pools page if pool does not exist
  const poolExists = queryOsmosis.queryGammPools.poolExists(poolId as string);
  useEffect(() => {
    if (poolExists === false) {
      router.push("/pools");
    }
    // eslint-disable-next-line
  }, [poolExists]);

  // Manage liquidity + bond LP tokens (modals) state
  const [showManageLiquidityDialog, setShowManageLiquidityDialog] =
    useState(false);
  const [showLockLPTokenModal, setShowLockLPTokenModal] = useState(false);
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

  const lockupGauges =
    queryOsmosis.queryLockableDurations.lockableDurations.map(
      (duration, index, durations) => {
        const apr = pool
          ? queryOsmosis.queryIncentivizedPools.computeAPY(
              pool.id,
              duration,
              priceStore,
              fiat
            )
          : new RatePretty(0);

        return {
          id: index.toString(),
          apr,
          duration,
          superfluidApr:
            pool &&
            index === durations.length - 1 &&
            queryOsmosis.querySuperfluidPools.isSuperfluidPool(pool.id)
              ? new RatePretty(
                  queryCosmos.queryInflation.inflation
                    .mul(
                      queryOsmosis.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                        pool.id
                      )
                    )
                    .moveDecimalPointLeft(2)
                )
              : undefined,
        };
      }
    );

  const [showSuperfluidValidatorModal, setShowSuperfluidValidatorsModal] =
    useState(false);

  // swap modal
  const [showTradeTokenModal, setShowTradeTokenModal] = useState(false);

  // unpool
  const showDepoolButton = (() => {
    if (!pool) {
      return false;
    }

    if (!UnPoolWhitelistedPoolIds[pool.id]) {
      return false;
    }

    if (account.txTypeInProgress === "unPoolWhitelistedPool") {
      return true;
    }

    const lpShareLocked = queryOsmosis.queryLockedCoins
      .get(account.bech32Address)
      .lockedCoins.find(
        (coin) => coin.currency.coinMinimalDenom === `gamm/pool/${pool.id}`
      );

    if (lpShareLocked) {
      return true;
    }

    const lpShareUnlocking = queryOsmosis.queryUnlockingCoins
      .get(account.bech32Address)
      .unlockingCoins.find(
        (coin) => coin.currency.coinMinimalDenom === `gamm/pool/${pool.id}`
      );

    if (lpShareUnlocking) {
      return true;
    }

    return false;
  })();

  // sections
  const showLiquidityMiningSection =
    (pool && queryOsmosis.queryIncentivizedPools.isIncentivized(pool.id)) ||
    (externalGuages && externalGuages.length > 0);

  const showPoolBondingTables =
    showLiquidityMiningSection ||
    (userLockedAssets &&
      userLockedAssets?.some((lockedAsset) =>
        lockedAsset.amount.toDec().gt(new Dec(0))
      )) ||
    (userUnlockingAssets && userUnlockingAssets.length > 0);

  return (
    <main>
      <Head>
        <title>
          {t("pool.title", { id: poolId ? poolId.toString() : "-" })}
        </title>
      </Head>
      {pool && addLiquidityConfig && removeLiquidityConfig && (
        <ManageLiquidityModal
          isOpen={showManageLiquidityDialog}
          title={t("pool.manageLiquidity.title")}
          onRequestClose={() => setShowManageLiquidityDialog(false)}
          addLiquidityConfig={addLiquidityConfig}
          removeLiquidityConfig={removeLiquidityConfig}
          isSendingMsg={account.txTypeInProgress !== ""}
          getFiatValue={(coin) => priceStore.calculatePrice(coin)}
          onAddLiquidity={async () => {
            try {
              if (
                addLiquidityConfig.isSingleAmountIn &&
                addLiquidityConfig.singleAmountInConfig
              ) {
                await account.osmosis.sendJoinSwapExternAmountInMsg(
                  addLiquidityConfig.poolId,
                  {
                    currency:
                      addLiquidityConfig.singleAmountInConfig.sendCurrency,
                    amount: addLiquidityConfig.singleAmountInConfig.amount,
                  },
                  undefined,
                  undefined,
                  () => setShowManageLiquidityDialog(false)
                );
              } else if (addLiquidityConfig.shareOutAmount) {
                await account.osmosis.sendJoinPoolMsg(
                  addLiquidityConfig.poolId,
                  addLiquidityConfig.shareOutAmount.toDec().toString(),
                  undefined,
                  undefined,
                  () => setShowManageLiquidityDialog(false)
                );
              }
            } catch (e) {
              console.error(e);
            }
          }}
          onRemoveLiquidity={async () => {
            try {
              await account.osmosis.sendExitPoolMsg(
                removeLiquidityConfig.poolId,
                removeLiquidityConfig.poolShareWithPercentage
                  .toDec()
                  .toString(),
                undefined,
                undefined,
                () => setShowManageLiquidityDialog(false)
              );
            } catch (e) {
              console.error(e);
            }
          }}
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
          title={t("pool.lockToken.title")}
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
            superfluid &&
            typeof superfluid !== "string" &&
            "delegations" in superfluid &&
            superfluid.delegations &&
            superfluid.delegations.length > 0
          }
          onLockToken={async (gaugeId, electSuperfluid) => {
            if (electSuperfluid) {
              setShowLockLPTokenModal(false);
              setShowSuperfluidValidatorsModal(true);
              // `sendLockAndSuperfluidDelegateMsg` will be sent after superfluid modal
            } else {
              const gauge = lockupGauges.find((gauge) => gauge.id === gaugeId);
              try {
                if (
                  !lockLPTokensConfig.sendCurrency.coinMinimalDenom.startsWith(
                    "gamm"
                  )
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
                    () => setShowLockLPTokenModal(false)
                  );
                } else {
                  console.error("Gauge ID not found:", gaugeId);
                }
              } catch (e) {
                console.error(e);
              }
            }
          }}
        />
      )}
      {superfluid &&
        superfluid !== "not-superfluid-pool" &&
        pool &&
        lockLPTokensConfig && (
          <SuperfluidValidatorModal
            title={
              isMobile
                ? t("pool.superfluidValidator.titleMobile")
                : t("pool.superfluidValidator.title")
            }
            availableBondAmount={
              "upgradeableLPLockIds" in superfluid
                ? superfluid.upgradeableLPLockIds.amount // is delegating amount from existing lockup
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
            onSelectValidator={async (validatorAddress) => {
              if (superfluid && typeof superfluid !== "string") {
                if ("upgradeableLPLockIds" in superfluid) {
                  // is delegating existing locked shares
                  try {
                    await account.osmosis.sendSuperfluidDelegateMsg(
                      superfluid.upgradeableLPLockIds.lockIds,
                      validatorAddress,
                      undefined,
                      () => setShowSuperfluidValidatorsModal(false)
                    );
                  } catch (e) {
                    console.error(e);
                  }
                } else if (
                  "superfluidLPShares" in superfluid &&
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
                      () => setShowSuperfluidValidatorsModal(false)
                    );
                    // TODO: clear/reset LP lock amount config ??
                  } catch (e) {
                    console.error(e);
                  }
                }
              }
            }}
          />
        )}
      <Overview
        title={
          <MetricLoader className="h-7 w-64" isLoading={!pool}>
            <h5>
              {t("pool.overview.title", {
                id: pool?.id ?? "-",
                name:
                  pool?.poolAssets
                    .map(
                      (asset) => asset.amount.currency.coinDenom.split(" ")[0]
                    )
                    .map((denom) => truncateString(denom))
                    .join(" / ") ?? "-",
              })}
            </h5>
          </MetricLoader>
        }
        titleButtons={[
          {
            label: t("pool.overview.buttons.addRemoveLiquidity"),
            onClick: () => setShowManageLiquidityDialog(true),
          },
          {
            label: t("pool.overview.buttons.swap"),
            onClick: () => setShowTradeTokenModal(true),
          },
        ]}
        primaryOverviewLabels={[
          {
            label: t("pool.overview.liquidity"),
            value: (
              <MetricLoader
                className="h-7 w-56"
                isLoading={!pool || !totalValueLocked}
              >
                {totalValueLocked?.toString()}
              </MetricLoader>
            ),
          },
          {
            label: t("pool.overview.myLiquidity"),
            value: (
              <MetricLoader className="h-7 " isLoading={!userLockedValue}>
                {userLockedValue?.toString() ?? `0${fiat.symbol}`}
              </MetricLoader>
            ),
          },
        ]}
        secondaryOverviewLabels={[
          {
            label: t("pool.overview.bonded"),
            value: (
              <MetricLoader className="h-4" isLoading={!userBondedValue}>
                {userBondedValue?.toString() ?? `0${fiat.symbol}`}
              </MetricLoader>
            ),
          },
          {
            label: t("pool.overview.swapFee"),
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
              <div className="max-w-lg">
                <div className="flex lg:flex-col gap-2">
                  {isMobile ? (
                    <span className="subtitle1 text-lg">
                      {t("pool.liquidityMiningMobile")}
                    </span>
                  ) : (
                    <h5>{t("pool.liquidityMiningMobile")}</h5>
                  )}
                  {superfluid && superfluid !== "not-superfluid-pool" && (
                    <div className="bg-superfluid w-fit rounded-full px-4 py-1 md:caption text-base">
                      {t("pool.superfluidEnabled")}
                    </div>
                  )}
                </div>
                <p className="text-white-mid md:caption py-2">
                  {t("pool.liquidityMiningInfo")}
                </p>
              </div>
              <div className="flex flex-col gap-2 text-right lg:text-left">
                <span className="caption text-white-mid">
                  {t("pool.availableLPToken")}
                </span>
                <span className="font-h5 text-h5 md:subtitle1">
                  <MetricLoader className="h-6" isLoading={!userAvailableValue}>
                    {userAvailableValue?.toString() || "$0"}
                  </MetricLoader>
                </span>
                <Button
                  className="h-8 lg:w-fit w-full md:caption"
                  onClick={() => setShowLockLPTokenModal(true)}
                >
                  {t("pool.buttonStartEarning")}
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
          {pool &&
            guages &&
            queryOsmosis.queryIncentivizedPools.isIncentivized(pool.id) && (
              <div className="flex lg:flex-col md:gap-3 gap-9 place-content-between md:pt-8 pt-10">
                {guages.map((guage, i) => (
                  <PoolGaugeCard
                    key={i}
                    days={guage.lockupDuration.humanize()}
                    apr={queryOsmosis.queryIncentivizedPools
                      .computeAPY(
                        pool.id,
                        guage.lockupDuration,
                        priceStore,
                        fiat
                      )
                      .maxDecimals(2)
                      .toString()}
                    isLoading={
                      guage.isFetching ||
                      queryOsmosis.queryIncentivizedPools.isAprFetching
                    }
                    superfluidApr={
                      guages &&
                      i === guages.length - 1 &&
                      superfluid &&
                      superfluid !== "not-superfluid-pool"
                        ? new RatePretty(
                            queryCosmos.queryInflation.inflation
                              .mul(
                                queryOsmosis.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                                  pool.id
                                )
                              )
                              .moveDecimalPointLeft(2)
                          )
                            .maxDecimals(0)
                            .trim(true)
                            .toString()
                        : undefined
                    }
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}
        </div>
        {superfluid &&
          superfluid !== "not-superfluid-pool" &&
          ("upgradeableLPLockIds" in superfluid ||
            ("delegations" in superfluid &&
              superfluid.delegations &&
              superfluid.delegations.length > 0)) && (
            <div className="max-w-container mx-auto md:p-5 p-10 flex flex-col gap-4">
              {isMobile ? (
                <span className="subtitle2">
                  {t("pool.superfluidStakingMobile")}
                </span>
              ) : (
                <h5>{t("pool.superfluidStaking")}</h5>
              )}
              {"upgradeableLPLockIds" in superfluid ? (
                <GoSuperfluidCard
                  goSuperfluid={() => setShowSuperfluidValidatorsModal(true)}
                  isMobile={isMobile}
                />
              ) : (
                "delegations" in superfluid &&
                superfluid.delegations?.map(
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
                <span className="subtitle2">
                  {t("pool.myBondings.titleMobile")}
                </span>
              ) : (
                <h6>{t("pool.myBondings.title")}</h6>
              )}
              {showDepoolButton && (
                <Button
                  className="h-8 px-2"
                  onClick={async () => {
                    if (!pool) {
                      return;
                    }

                    try {
                      await account.osmosis.sendUnPoolWhitelistedPoolMsg(
                        pool.id
                      );
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                  loading={account.txTypeInProgress === "unPoolWhitelistedPool"}
                >
                  {t("pool.myBondings.depoolButton")}
                </Button>
              )}
            </div>
            <Table
              className="md:-mx-5 md:w-screen md:caption w-full my-5"
              headerTrClassName="md:h-11"
              columnDefs={(
                [
                  {
                    display: t("pool.myBondings.unbondingDuration"),
                    className: "!pl-8",
                    displayCell:
                      superfluid && superfluid !== "not-superfluid-pool"
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
                  { display: t("pool.myBondings.currentAPR") },
                  { display: t("pool.myBondings.amount") },
                  {
                    display: t("pool.myBondings.action"),
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
                                locks
                              );
                            } else {
                              const blockGasLimitLockIds = lockIds.slice(0, 10);
                              await account.osmosis.sendBeginUnlockingMsg(
                                blockGasLimitLockIds
                              );
                            }
                          } catch (e) {
                            console.log(e);
                          }
                        }}
                      >
                        {isMobile
                          ? t("pool.myBondings.actionUnbondMobile")
                          : t("pool.myBondings.actionUnbondMobile")}
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
                isMobile ? display !== t("pool.myBondings.currentAPR") : true
              )}
              data={
                userLockedAssets?.map((lockedAsset, index) => {
                  const isSuperfluidDuration =
                    index === (userLockedAssets?.length ?? 0) - 1 &&
                    superfluid &&
                    typeof superfluid !== "string" &&
                    "delegations" in superfluid &&
                    superfluid.delegations &&
                    superfluid.delegations.length > 0;
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
        {userUnlockingAssets && userUnlockingAssets.length > 0 && (
          <div className="max-w-container mx-auto md:p-5 p-10">
            {isMobile ? (
              <span className="subtitle2">{t("pool.unlock.titleMobile")}</span>
            ) : (
              <h6>{t("pool.unlock.title")}</h6>
            )}
            <Table
              className="md:-mx-5 md:w-screen md:caption w-full my-5"
              headerTrClassName="md:h-11"
              columnDefs={[
                {
                  display: t("pool.unlock.unbondingDuration"),
                  className: "w-1/3 !pl-8",
                },
                { display: t("pool.unlock.amount"), className: "w-1/3" },
                {
                  display: t("pool.unlock.unbondingComplete"),
                  className: "w-1/3",
                },
              ]}
              data={
                userUnlockingAssets?.map(({ duration, amount, endTime }) => [
                  {
                    value: duration.humanize(),
                  },
                  {
                    value: amount.maxDecimals(6).trim(true).toString(),
                  },
                  {
                    value: moment(endTime).fromNow(),
                  },
                ]) ?? []
              }
            />
          </div>
        )}
        {superfluid &&
          superfluid !== "not-superfluid-pool" &&
          !("upgradeableLPLockIds" in superfluid) &&
          superfluid.undelegations &&
          superfluid.undelegations.length > 0 && (
            <div className="max-w-container mx-auto md:p-5 p-10">
              {isMobile ? (
                <span className="subtitle2">
                  {t("pool.superfluidUnlock.titleMobile")}
                </span>
              ) : (
                <h6>{t("pool.superfluidUnlock.title")}</h6>
              )}
              <Table
                className="md:-mx-5 md:w-screen md:caption w-full my-5"
                headerTrClassName="md:h-11"
                columnDefs={[
                  {
                    display: t("pool.superfluidUnlock.validator"),
                    className: "w-1/3 !pl-8",
                  },
                  {
                    display: t("pool.superfluidUnlock.amount"),
                    className: "w-1/3",
                  },
                  {
                    display: t("pool.superfluidUnlock.unbondingComplete"),
                    className: "w-1/3",
                  },
                ]}
                data={
                  superfluid.undelegations?.map(
                    ({ validatorName, amount, endTime }) => [
                      {
                        value: validatorName ?? "",
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
            <span className="subtitle2">{t("pool.catalyst.titleMobile")}</span>
          ) : (
            <h5>{t("pool.catalyst.title")}</h5>
          )}
          <div className="flex flex-wrap md:flex-col gap-5 my-5">
            {(userPoolAssets ?? [undefined, undefined]).map(
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
                    isLoading={!pool || !userPoolAssets}
                    className="md:w-full w-1/2 max-w-md"
                    percentDec={userAsset?.ratio.toString()}
                    tokenDenom={userAsset?.asset.currency.coinDenom}
                    isMobile={isMobile}
                    metrics={[
                      {
                        label: t("pool.catalyst.amount"),
                        value: (
                          <MetricLoader isLoading={!userPoolAssets}>
                            {totalAmountAdjusted}
                          </MetricLoader>
                        ),
                      },
                      {
                        label: t("pool.catalyst.myAmount"),
                        value: (
                          <MetricLoader isLoading={!userPoolAssets}>
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

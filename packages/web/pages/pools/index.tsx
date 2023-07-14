import { CoinPretty, Dec, DecUtils, RatePretty } from "@keplr-wallet/unit";
import { ObservableSharePoolDetail } from "@osmosis-labs/stores";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { ShowMoreButton } from "~/components/buttons/show-more";
import { PoolCard } from "~/components/cards";
import { AllPoolsTable } from "~/components/complex";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import { useCfmmToClMigration } from "~/components/funnels/concentrated-liquidity";
import { SuperchargePool } from "~/components/funnels/concentrated-liquidity/supercharge-pool";
import { MetricLoader } from "~/components/loaders";
import { PoolsOverview } from "~/components/overview/pools";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useCreatePoolConfig,
  useDimension,
  useHideDustUserSetting,
  useLockTokenConfig,
  useSuperfluidPool,
  useWindowSize,
} from "~/hooks";
import { useIsConcentratedLiquidityEnabled } from "~/hooks/use-is-concentrated-liquidity-enabled";
import {
  AddLiquidityModal,
  CreatePoolModal,
  LockTokensModal,
  RemoveLiquidityModal,
  SuperfluidValidatorModal,
} from "~/modals";
import { ConcentratedLiquidityLearnMoreModal } from "~/modals/concentrated-liquidity-intro";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

const Pools: NextPage = observer(function () {
  const { chainStore, accountStore, queriesStore } = useStore();
  const t = useTranslation();
  const router = useRouter();
  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Pools.pageViewed],
  });

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getWallet(chainId);

  const [poolsOverviewRef, { height: poolsOverviewHeight }] =
    useDimension<HTMLDivElement>();

  const [myPoolsRef, { height: myPoolsHeight }] =
    useDimension<HTMLDivElement>();

  const [myPositionsRef, { height: myPositionsHeight }] =
    useDimension<HTMLDivElement>();

  const [superchargeLiquidityRef, { height: superchargeLiquidityHeight }] =
    useDimension<HTMLDivElement>();

  const { isConcentratedLiquidityEnabled } =
    useIsConcentratedLiquidityEnabled();

  // create pool dialog
  const [isCreatingPool, setIsCreatingPool] = useState(false);

  const createPoolConfig = useCreatePoolConfig(
    chainStore,
    chainId,
    account?.address ?? "",
    queriesStore
  );

  // pool quick action modals
  const [addLiquidityModalPoolId, setAddLiquidityModalPoolId] = useState<
    string | null
  >(null);
  const [removeLiquidityModalPoolId, setRemoveLiquidityModalPoolId] = useState<
    string | null
  >(null);
  const [lockLpTokenModalPoolId, setLockLpTokenModalPoolId] = useState<
    string | null
  >(null);
  const [superfluidDelegateModalProps, setSuperfluidDelegateModalProps] =
    useState<ComponentProps<typeof SuperfluidValidatorModal> | null>(null);

  // TODO: add amplitude events for quick actions on pool
  const quickActionProps = {
    quickAddLiquidity: useCallback(
      (poolId: string) => setAddLiquidityModalPoolId(poolId),
      []
    ),
    quickRemoveLiquidity: useCallback(
      (poolId: string) => setRemoveLiquidityModalPoolId(poolId),
      []
    ),
    quickLockTokens: useCallback(
      (poolId: string) => setLockLpTokenModalPoolId(poolId),
      []
    ),
  };

  // lock tokens (& possibly select sfs validator) quick action state
  const { delegateSharesToValidator } = useSuperfluidPool();
  const selectedPoolShareCurrency = lockLpTokenModalPoolId
    ? queryOsmosis.queryGammPoolShare.makeShareCurrency(lockLpTokenModalPoolId)
    : undefined;
  const { config: lockLpTokenConfig, lockToken } = useLockTokenConfig(
    selectedPoolShareCurrency
  );
  const onLockToken = useCallback(
    (duration: Duration, electSuperfluid?: boolean) => {
      if (electSuperfluid && selectedPoolShareCurrency) {
        // open superfluid modal
        setSuperfluidDelegateModalProps({
          isOpen: true,
          availableBondAmount: new CoinPretty(
            selectedPoolShareCurrency,
            lockLpTokenConfig.getAmountPrimitive().amount
          ),
          onSelectValidator: (address) => {
            if (!lockLpTokenModalPoolId) {
              console.error(
                "onSelectValidator: lockLpTokenModalPoolId is undefined"
              );
              setSuperfluidDelegateModalProps(null);
              lockLpTokenConfig.setAmount("");
              return;
            }

            delegateSharesToValidator(
              lockLpTokenModalPoolId,
              address,
              lockLpTokenConfig
            ).finally(() => {
              setSuperfluidDelegateModalProps(null);
              lockLpTokenConfig.setAmount("");
            });
          },
          onRequestClose: () => setSuperfluidDelegateModalProps(null),
        });
        setLockLpTokenModalPoolId(null);
      } else {
        lockToken(duration).finally(() => {
          setLockLpTokenModalPoolId(null);
          setSuperfluidDelegateModalProps(null);
          lockLpTokenConfig.setAmount("");
        });
      }
    },
    [
      selectedPoolShareCurrency,
      lockLpTokenConfig,
      lockLpTokenModalPoolId,
      delegateSharesToValidator,
      lockToken,
    ]
  );

  const onCreatePool = useCallback(async () => {
    try {
      if (createPoolConfig.poolType === "weighted") {
        await account?.osmosis.sendCreateBalancerPoolMsg(
          createPoolConfig.swapFee,
          createPoolConfig.assets.map((asset) => {
            if (!asset.percentage)
              throw new Error(
                "Pool config with poolType of weighted doesn't include asset percentage"
              );

            return {
              weight: new Dec(asset.percentage)
                .mul(DecUtils.getTenExponentNInPrecisionRange(4))
                .truncate()
                .toString(),
              token: {
                amount: asset.amountConfig.amount,
                currency: asset.amountConfig.sendCurrency,
              },
            };
          }),
          undefined,
          () => {
            setIsCreatingPool(false);
          }
        );
      } else if (createPoolConfig.poolType === "stable") {
        const scalingFactorController =
          createPoolConfig.scalingFactorControllerAddress
            ? createPoolConfig.scalingFactorControllerAddress
            : undefined;
        await account?.osmosis.sendCreateStableswapPoolMsg(
          createPoolConfig.swapFee,
          createPoolConfig.assets.map((asset) => {
            if (!asset.scalingFactor)
              throw new Error(
                "Pool config with poolType of stable doesn't include scaling factors"
              );

            return {
              scalingFactor: asset.scalingFactor,
              token: {
                amount: asset.amountConfig.amount,
                currency: asset.amountConfig.sendCurrency,
              },
            };
          }),
          scalingFactorController,
          undefined,
          () => {
            setIsCreatingPool(false);
          }
        );
      }
    } catch (e) {
      setIsCreatingPool(false);
      console.error(e);
    }
  }, [createPoolConfig, account]);

  // CL funnel
  const [showConcentratedLiqIntro, setShowConcentratedLiqIntro] =
    useState(false);
  const { migrate, userCanMigrate, linkedClPoolId } = useCfmmToClMigration();
  const migrateableClPool = linkedClPoolId
    ? queryOsmosis.queryPools.getPool(linkedClPoolId)
    : undefined;

  return (
    <main className="m-auto max-w-container bg-osmoverse-900 px-8 md:px-3">
      <NextSeo
        title={t("seo.pools.title")}
        description={t("seo.pools.description")}
      />
      <CreatePoolModal
        isOpen={isCreatingPool}
        onRequestClose={useCallback(() => setIsCreatingPool(false), [])}
        title={t("pools.createPool.title")}
        createPoolConfig={createPoolConfig}
        isSendingMsg={account?.txTypeInProgress !== ""}
        onCreatePool={onCreatePool}
      />
      {addLiquidityModalPoolId && (
        <AddLiquidityModal
          title={t("addLiquidity.titleInPool", {
            poolId: addLiquidityModalPoolId,
          })}
          poolId={addLiquidityModalPoolId}
          isOpen={true}
          onRequestClose={() => setAddLiquidityModalPoolId(null)}
        />
      )}
      {removeLiquidityModalPoolId && (
        <RemoveLiquidityModal
          title={t("removeLiquidity.titleInPool", {
            poolId: removeLiquidityModalPoolId,
          })}
          poolId={removeLiquidityModalPoolId}
          isOpen={true}
          onRequestClose={() => setRemoveLiquidityModalPoolId(null)}
        />
      )}
      {lockLpTokenModalPoolId && (
        <LockTokensModal
          title={t("lockToken.titleInPool", { poolId: lockLpTokenModalPoolId })}
          isOpen={true}
          poolId={lockLpTokenModalPoolId}
          amountConfig={lockLpTokenConfig}
          onLockToken={onLockToken}
          onRequestClose={() => setLockLpTokenModalPoolId(null)}
        />
      )}
      {superfluidDelegateModalProps && (
        <SuperfluidValidatorModal {...superfluidDelegateModalProps} />
      )}
      <section className="pt-8 pb-10 md:pt-4 md:pb-5" ref={poolsOverviewRef}>
        <PoolsOverview
          className="mx-auto"
          setIsCreatingPool={useCallback(() => setIsCreatingPool(true), [])}
        />
      </section>
      {isConcentratedLiquidityEnabled &&
        linkedClPoolId &&
        userCanMigrate &&
        migrateableClPool && (
          <section
            ref={superchargeLiquidityRef}
            className="pt-8 pb-10 md:pt-4 md:pb-5"
          >
            <SuperchargePool
              title={t("addConcentratedLiquidityPoolCta.title", {
                pair: migrateableClPool.poolAssets
                  .map(({ amount }) => amount.denom)
                  .join("/"),
              })}
              caption={t("addConcentratedLiquidityPoolCta.caption")}
              primaryCta={t("addConcentratedLiquidityPoolCta.primaryCta")}
              secondaryCta={t("addConcentratedLiquidityPoolCta.secondaryCta")}
              onCtaClick={() =>
                migrate()
                  .then(() => router.push("/pool/" + linkedClPoolId))
                  .catch(console.error)
              }
              onSecondaryClick={() => {
                setShowConcentratedLiqIntro(true);
              }}
            />
            {showConcentratedLiqIntro && (
              <ConcentratedLiquidityLearnMoreModal
                isOpen
                onRequestClose={() => setShowConcentratedLiqIntro(false)}
              />
            )}
          </section>
        )}
      {isConcentratedLiquidityEnabled &&
        queryOsmosis.queryAccountsPositions.get(account?.address ?? "")
          .positions.length > 0 && (
          <section ref={myPositionsRef}>
            <div className="flex w-full flex-col flex-nowrap gap-5 pb-[3.75rem]">
              <h5 className="pl-6">{t("clPositions.yourPositions")}</h5>
              <MyPositionsSection />
            </div>
          </section>
        )}
      <section ref={myPoolsRef}>
        <MyPoolsSection />
      </section>

      <section>
        <AllPoolsTable
          topOffset={
            myPositionsHeight +
            myPoolsHeight +
            poolsOverviewHeight +
            superchargeLiquidityHeight
          }
          {...quickActionProps}
        />
      </section>
    </main>
  );
});

const MyPoolsSection = observer(() => {
  const { accountStore, derivedDataStore, queriesStore, chainStore } =
    useStore();

  const t = useTranslation();

  const { isMobile } = useWindowSize();

  const { logEvent } = useAmplitudeAnalytics();

  // Mobile only - pools (superfluid) pools sorting/filtering
  const [showMoreMyPools, setShowMoreMyPools] = useState(false);

  const { isConcentratedLiquidityEnabled } =
    useIsConcentratedLiquidityEnabled();

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getWallet(chainId);

  // my pools
  const myPoolIds = queryOsmosis.queryGammPoolShare.getOwnPools(
    account?.address ?? ""
  );
  const poolCountShowMoreThreshold = isMobile ? 3 : 6;
  const myPools = useMemo(
    () =>
      (isMobile && !showMoreMyPools
        ? myPoolIds.slice(0, poolCountShowMoreThreshold)
        : myPoolIds
      )
        .map((myPoolId) => derivedDataStore.sharePoolDetails.get(myPoolId))
        .filter((pool): pool is ObservableSharePoolDetail => {
          if (pool === undefined) return false;

          // concentrated liquidity liquidity feature flag
          if (!isConcentratedLiquidityEnabled && !Boolean(pool.querySharePool))
            return false;

          return true;
        }),
    [
      isMobile,
      showMoreMyPools,
      myPoolIds,
      poolCountShowMoreThreshold,
      derivedDataStore.sharePoolDetails,
      isConcentratedLiquidityEnabled,
    ]
  );

  const dustFilteredPools = useHideDustUserSetting(
    myPools,
    useCallback(
      (pool) => {
        const _queryPool = pool.querySharePool;
        if (!_queryPool) return;
        return pool.totalValueLocked.mul(
          queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
            account?.address ?? "",
            _queryPool.id
          )
        );
      },
      [queryOsmosis, account]
    )
  );

  if (dustFilteredPools.length === 0) return null;

  return (
    <div className="mx-auto pb-[3.75rem]">
      <h5 className="md:px-3">{t("pools.myPools")}</h5>
      <div className="flex flex-col gap-4">
        <div className="grid-cards mt-5 grid md:gap-3">
          {dustFilteredPools.map((myPool) => {
            const _queryPool = myPool.querySharePool;

            if (!_queryPool) return null;

            const poolBonding = derivedDataStore.poolsBonding.get(
              _queryPool.id
            );
            const apr =
              poolBonding.highestBondDuration?.aggregateApr ??
              new RatePretty(0);

            const poolLiquidity = myPool.totalValueLocked;
            const myBonded = myPool.userBondedValue;
            const myLiquidity = myPool.userAvailableValue;

            let myPoolMetrics = [
              {
                label: t("pools.APR"),
                value: isMobile ? (
                  apr.maxDecimals(2).toString()
                ) : (
                  <MetricLoader
                    isLoading={
                      queryOsmosis.queryIncentivizedPools.isAprFetching
                    }
                  >
                    <h6>{apr.maxDecimals(2).toString()}</h6>
                  </MetricLoader>
                ),
              },
              {
                label: isMobile ? t("pools.available") : t("pools.myLiquidity"),
                value: (
                  <MetricLoader isLoading={poolLiquidity.toDec().isZero()}>
                    <h6>
                      {isMobile
                        ? formatPretty(myLiquidity)
                        : myLiquidity.maxDecimals(2).toString()}
                    </h6>
                  </MetricLoader>
                ),
              },
              {
                label: t("pools.bonded"),
                value: isMobile ? (
                  myBonded.toString()
                ) : (
                  <MetricLoader isLoading={poolLiquidity.toDec().isZero()}>
                    <h6>{formatPretty(myBonded)}</h6>
                  </MetricLoader>
                ),
              },
            ];

            // rearrange metrics for mobile pool card
            if (isMobile) {
              myPoolMetrics = [
                myPoolMetrics[2], // Bonded
                myPoolMetrics[1], // Available
                myPoolMetrics[0], // APR
              ];
            }

            return (
              <PoolCard
                key={_queryPool.id}
                poolId={_queryPool.id}
                poolAssets={_queryPool.poolAssets.map((poolAsset) => ({
                  coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                  coinDenom: poolAsset.amount.currency.coinDenom,
                }))}
                poolMetrics={myPoolMetrics}
                isSuperfluid={queryOsmosis.querySuperfluidPools.isSuperfluidPool(
                  _queryPool.id
                )}
                mobileShowFirstLabel
                onClick={() =>
                  logEvent([
                    EventName.Pools.myPoolsCardClicked,
                    {
                      poolId: _queryPool.id,
                      poolName: _queryPool.poolAssets
                        .map((poolAsset) => poolAsset.amount.currency.coinDenom)
                        .join(" / "),
                      poolWeight: _queryPool.weightedPoolInfo?.assets
                        .map((poolAsset) =>
                          poolAsset.weightFraction?.toString()
                        )
                        .join(" / "),
                      isSuperfluidPool:
                        queryOsmosis.querySuperfluidPools.isSuperfluidPool(
                          _queryPool.id
                        ),
                    },
                  ])
                }
              />
            );
          })}
        </div>
        {isMobile && myPoolIds.length > poolCountShowMoreThreshold && (
          <div className="mx-auto">
            <ShowMoreButton
              isOn={showMoreMyPools}
              onToggle={() => setShowMoreMyPools(!showMoreMyPools)}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default Pools;

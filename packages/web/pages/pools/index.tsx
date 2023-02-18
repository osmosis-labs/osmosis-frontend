import { CoinPretty, Dec, DecUtils, RatePretty } from "@keplr-wallet/unit";
import { ObservablePoolDetail } from "@osmosis-labs/stores";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { ComponentProps, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { ShowMoreButton } from "../../components/buttons/show-more";
import { PoolCard } from "../../components/cards";
import { AllPoolsTable } from "../../components/complex/all-pools-table";
import { MetricLoader } from "../../components/loaders";
import { PoolsOverview } from "../../components/overview/pools";
import { EventName } from "../../config";
import {
  useAmplitudeAnalytics,
  useCreatePoolConfig,
  useHideDustUserSetting,
  useLockTokenConfig,
  useSuperfluidPool,
  useWindowSize,
} from "../../hooks";
import {
  AddLiquidityModal,
  CreatePoolModal,
  LockTokensModal,
  RemoveLiquidityModal,
  SuperfluidValidatorModal,
} from "../../modals";
import { useStore } from "../../stores";
import { formatPretty } from "../../utils/formatter";

const Pools: NextPage = observer(function () {
  const { chainStore, accountStore, queriesStore, derivedDataStore } =
    useStore();
  const t = useTranslation();
  const { isMobile } = useWindowSize();
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Pools.pageViewed],
  });

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getAccount(chainId);

  // create pool dialog
  const [isCreatingPool, setIsCreatingPool] = useState(false);

  const createPoolConfig = useCreatePoolConfig(
    chainStore,
    chainId,
    account.bech32Address,
    queriesStore
  );

  // Mobile only - pools (superfluid) pools sorting/filtering
  const [showMoreMyPools, setShowMoreMyPools] = useState(false);

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
  const { superfluidDelegateToValidator } = useSuperfluidPool();
  const selectedPoolShareCurrency = lockLpTokenModalPoolId
    ? queryOsmosis.queryGammPoolShare.getShareCurrency(lockLpTokenModalPoolId)
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

            superfluidDelegateToValidator(
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
      lockLpTokenModalPoolId,
      lockLpTokenConfig,
      lockToken,
    ]
  );

  const onCreatePool = useCallback(async () => {
    try {
      if (createPoolConfig.poolType === "weighted") {
        await account.osmosis.sendCreateBalancerPoolMsg(
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
        await account.osmosis.sendCreateStableswapPoolMsg(
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

  // my pools
  const myPoolIds = queryOsmosis.queryGammPoolShare.getOwnPools(
    account.bech32Address
  );
  const poolCountShowMoreThreshold = isMobile ? 3 : 6;
  const myPools = useMemo(
    () =>
      (isMobile && !showMoreMyPools
        ? myPoolIds.slice(0, poolCountShowMoreThreshold)
        : myPoolIds
      )
        .map((myPoolId) => derivedDataStore.poolDetails.get(myPoolId))
        .filter((pool): pool is ObservablePoolDetail => !!pool),
    [
      isMobile,
      showMoreMyPools,
      myPoolIds,
      queryOsmosis.queryGammPools.isFetching,
    ]
  );
  const dustFilteredPools = useHideDustUserSetting(
    myPools,
    useCallback(
      (pool) => {
        const _queryPool = pool.pool;
        if (!_queryPool) return;
        return pool.totalValueLocked.mul(
          queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
            account.bech32Address,
            _queryPool.id
          )
        );
      },
      [queryOsmosis, account]
    )
  );

  return (
    <main className="m-auto max-w-container bg-osmoverse-900 px-8 md:px-3">
      <CreatePoolModal
        isOpen={isCreatingPool}
        onRequestClose={useCallback(() => setIsCreatingPool(false), [])}
        title={t("pools.createPool.title")}
        createPoolConfig={createPoolConfig}
        isSendingMsg={account.txTypeInProgress !== ""}
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
      <section className="pt-8 pb-10 md:pt-4 md:pb-5">
        <PoolsOverview
          className="mx-auto"
          setIsCreatingPool={useCallback(() => setIsCreatingPool(true), [])}
        />
      </section>
      <section>
        <div className="mx-auto pb-[3.75rem]">
          <h5 className="md:px-3">{t("pools.myPools")}</h5>
          <div className="flex flex-col gap-4">
            <div className="grid-cards mt-5 grid md:gap-3">
              {dustFilteredPools.map((myPool) => {
                const _queryPool = myPool.pool;

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
                    label: isMobile
                      ? t("pools.available")
                      : t("pools.myLiquidity"),
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
                            .map(
                              (poolAsset) => poolAsset.amount.currency.coinDenom
                            )
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
      </section>
      <section>
        <AllPoolsTable {...quickActionProps} />
      </section>
    </main>
  );
});

export default Pools;

import { CoinPretty, Dec, DecUtils, RatePretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import { ComponentProps, useCallback, useMemo, useRef, useState } from "react";

import { ShowMoreButton } from "~/components/buttons/show-more";
import { PoolCard } from "~/components/cards";
import { AllPoolsTable } from "~/components/complex/all-pools-table";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { PoolsOverview } from "~/components/overview/pools";
import { EventName } from "~/config";
import { useHideDustUserSetting, useTranslation } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useCreatePoolConfig,
  useDimension,
  useLockTokenConfig,
  useSuperfluidPool,
  useWindowSize,
} from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import {
  AddLiquidityModal,
  CreatePoolModal,
  LockTokensModal,
  RemoveLiquidityModal,
  SuperfluidValidatorModal,
} from "~/modals";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

const Pools: NextPage = observer(function () {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { t } = useTranslation();
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

  const featureFlags = useFeatureFlags();

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
      {featureFlags.concentratedLiquidity && account?.address && (
        <section ref={myPositionsRef}>
          <div className="flex w-full flex-col flex-nowrap gap-5 pb-[3.75rem]">
            <h5>{t("clPositions.yourPositions")}</h5>
            <MyPositionsSection />
          </div>
        </section>
      )}

      <section ref={myPoolsRef}>
        <MyPoolsSection />
      </section>

      <section>
        <AllPoolsTable
          topOffset={myPositionsHeight + myPoolsHeight + poolsOverviewHeight}
          {...quickActionProps}
        />
      </section>
    </main>
  );
});

export const MyPoolsSection = observer(() => {
  const { accountStore, chainStore } = useStore();
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  const { logEvent } = useAmplitudeAnalytics();
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  const [showMoreMyPools, setShowMoreMyPools] = useState(false);

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);

  const poolCountShowMoreThreshold = isMobile ? 3 : 6;
  const { data: allMyPoolDetails, isLoading: isLoadingMyPoolDetails } =
    api.edge.pools.getUserPools.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
      },
      {
        enabled: Boolean(account?.address),

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const myPoolDetails = useMemo(
    () =>
      showMoreMyPools
        ? allMyPoolDetails
        : allMyPoolDetails?.slice(0, poolCountShowMoreThreshold),
    [allMyPoolDetails, poolCountShowMoreThreshold, showMoreMyPools]
  );

  const dustFilteredPools = useHideDustUserSetting(
    myPoolDetails ?? [],
    useCallback((myPool) => myPool.userValue, [])
  );

  if (
    (!isLoadingMyPoolDetails && dustFilteredPools.length === 0) ||
    !account?.address
  ) {
    return null;
  }

  return (
    <div className="pb-[3.75rem]">
      <h5 ref={titleRef} className="md:px-3">
        {t("pools.myPools")}
      </h5>
      <div className="flex flex-col gap-4">
        <div className="grid-cards mt-5 grid md:gap-3">
          {isLoadingMyPoolDetails ? (
            <>
              {new Array(6).fill(undefined).map((_, i) => (
                <SkeletonLoader
                  key={i}
                  className="h-[226px] w-[341px] rounded-4xl"
                />
              ))}
            </>
          ) : (
            <>
              {dustFilteredPools.map(
                ({
                  id,
                  type,
                  apr = new RatePretty(new Dec(0)),
                  poolLiquidity,
                  userValue,
                  reserveCoins,
                  isSuperfluid,
                  weightedPoolInfo,
                }) => {
                  const poolLiqudity_ = formatPretty(poolLiquidity);

                  let myPoolMetrics = [
                    {
                      label: t("pools.APR"),
                      value: isMobile ? (
                        apr.maxDecimals(0).toString()
                      ) : (
                        <h6>{apr.maxDecimals(2).toString()}</h6>
                      ),
                    },
                    {
                      label: t("pools.TVL"),
                      value: isMobile ? (
                        poolLiqudity_
                      ) : (
                        <h6>{poolLiqudity_}</h6>
                      ),
                    },
                    {
                      label:
                        type === "concentrated"
                          ? t("pools.myLiquidity")
                          : t("pools.bonded"),
                      value: isMobile ? (
                        userValue.toString()
                      ) : (
                        <h6>{formatPretty(userValue)}</h6>
                      ),
                    },
                  ];

                  return (
                    <PoolCard
                      key={id}
                      poolId={id}
                      poolAssets={reserveCoins.map((coin) => ({
                        coinImageUrl: coin.currency.coinImageUrl,
                        coinDenom: coin.currency.coinDenom,
                      }))}
                      poolMetrics={myPoolMetrics}
                      isSuperfluid={isSuperfluid}
                      isSupercharged={type === "concentrated"}
                      mobileShowFirstLabel
                      onClick={() =>
                        logEvent([
                          EventName.Pools.myPoolsCardClicked,
                          {
                            poolId: id,
                            poolName: reserveCoins
                              .map((coin) => coin.currency.coinDenom)
                              .join(" / "),
                            poolWeight: weightedPoolInfo?.weights
                              .map(({ weight }) => weight.toString())
                              .join(" / "),
                            isSuperfluidPool: isSuperfluid,
                          },
                        ])
                      }
                    />
                  );
                }
              )}
            </>
          )}
        </div>
        {(allMyPoolDetails?.length ?? 0) > poolCountShowMoreThreshold && (
          <div className="mx-auto">
            <ShowMoreButton
              isOn={showMoreMyPools}
              onToggle={() => {
                setShowMoreMyPools(!showMoreMyPools);
                if (showMoreMyPools) {
                  titleRef.current?.scrollIntoView();
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default Pools;

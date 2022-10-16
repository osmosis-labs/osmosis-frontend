import Head from "next/head";
import Image from "next/image";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import classNames from "classnames";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Staking } from "@keplr-wallet/stores";
import {
  EventName,
  PromotedLBPPoolIds,
  ExternalIncentiveGaugeAllowList,
} from "../../config";
import {
  useAddLiquidityConfig,
  useRemoveLiquidityConfig,
  useLockTokenConfig,
  useSuperfluidPoolConfig,
  useWindowSize,
  useAmplitudeAnalytics,
  usePoolGauges,
  usePoolDetailConfig,
  useNavBar,
  useBondLiquidityConfig,
} from "../../hooks";
import {
  LockTokensModal,
  ManageLiquidityModal,
  SuperfluidValidatorModal,
  TradeTokens,
} from "../../modals";
import { useStore } from "../../stores";
import { Duration } from "dayjs/plugin/duration";
import { PoolAssetsIcon } from "../../components/assets";
import { BondCard } from "../../components/cards";
import { NewButton } from "../../components/buttons";

const E = EventName.PoolDetail;

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const {
    chainStore,
    queriesStore,
    accountStore,
    priceStore,
    queriesExternalStore,
  } = useStore();
  const { isMobile } = useWindowSize();

  const { id: poolId } = router.query as { id: string };
  const { chainId } = chainStore.osmosis;
  const lbpConfig = PromotedLBPPoolIds.find(
    ({ poolId: lbpPoolId }) => lbpPoolId === poolId
  );

  const queryCosmos = queriesStore.get(chainId).cosmos;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const { bech32Address, txTypeInProgress } = accountStore.getAccount(
    chainStore.osmosis.chainId
  );
  const queryGammPoolFeeMetrics =
    queriesExternalStore.get().queryGammPoolFeeMetrics;

  // eject to pools page if pool does not exist
  const poolExists = queryOsmosis.queryGammPools.poolExists(poolId as string);
  useEffect(() => {
    if (poolExists === false) {
      router.push("/pools");
    }
  }, [poolExists]);

  // initialize pool data stores once root pool store is loaded
  const { poolDetailConfig, pool } = usePoolDetailConfig(poolId);
  const { superfluidPoolConfig, superfluidDelegateToValidator } =
    useSuperfluidPoolConfig(poolDetailConfig);
  const bondLiquidityConfig = useBondLiquidityConfig(bech32Address, pool?.id);

  // user analytics
  const { poolName, poolWeight } = useMemo(
    () => ({
      poolName: pool?.poolAssets
        .map((poolAsset) => poolAsset.amount.denom)
        .join(" / "),
      poolWeight: pool?.poolAssets
        .map((poolAsset) => poolAsset.weightFraction.toString())
        .join(" / "),
    }),
    [pool?.poolAssets]
  );
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [
      E.pageViewed,
      {
        poolId,
        poolName,
        poolWeight,
        ...(superfluidPoolConfig && {
          isSuperfluidPool: superfluidPoolConfig.isSuperfluid,
        }),
      },
    ],
  });

  // Manage liquidity + bond LP tokens (modals) state
  const [showManageLiquidityDialog, setShowManageLiquidityDialog] =
    useState(false);
  const [showLockLPTokenModal, setShowLockLPTokenModal] = useState(false);
  const { config: addLiquidityConfig, addLiquidity } = useAddLiquidityConfig(
    chainStore,
    chainId,
    pool?.id ?? "",
    queriesStore
  );
  const { config: removeLiquidityConfig, removeLiquidity } =
    useRemoveLiquidityConfig(chainStore, chainId, pool?.id ?? "", queriesStore);
  const {
    config: lockLPTokensConfig,
    lockToken,
    unlockToken,
  } = useLockTokenConfig(
    pool ? queryOsmosis.queryGammPoolShare.getShareCurrency(pool.id) : undefined
  );
  const {
    allAggregatedGauges,
    allowedAggregatedGauges,
    internalGauges: _,
  } = usePoolGauges(poolId);
  const [showSuperfluidValidatorModal, setShowSuperfluidValidatorsModal] =
    useState(false);
  const [showPoolDetails, setShowPoolDetails] = useState(false);
  const bondableDurations = pool
    ? bondLiquidityConfig?.getBondableAllowedDurations(
        pool.id,
        (denom) => chainStore.getChain(chainId).forceFindCurrency(denom),
        ExternalIncentiveGaugeAllowList[pool.id]
      ) ?? []
    : [];

  // swap modal
  const [showTradeTokenModal, setShowTradeTokenModal] = useState(false);

  // handle user actions
  const baseEventInfo = {
    poolId,
    poolName,
    poolWeight,
    isSuperfluidPool: superfluidPoolConfig?.isSuperfluid ?? false,
  };
  const onAddLiquidity = () => {
    const poolInfo = {
      ...baseEventInfo,
      isSingleAsset: addLiquidityConfig.isSingleAmountIn,
      providingLiquidity:
        addLiquidityConfig.isSingleAmountIn &&
        addLiquidityConfig.singleAmountInConfig
          ? {
              [addLiquidityConfig.singleAmountInConfig?.sendCurrency.coinDenom]:
                Number(addLiquidityConfig.singleAmountInConfig.amount),
            }
          : addLiquidityConfig.poolAssetConfigs.reduce(
              (acc, cur) => ({
                ...acc,
                [cur.sendCurrency.coinDenom]: Number(cur.amount),
              }),
              {}
            ),
    };

    logEvent([E.addLiquidityStarted, poolInfo]);

    addLiquidity()
      .then(() => logEvent([E.addLiquidityCompleted, poolInfo]))
      .finally(() => setShowManageLiquidityDialog(false));
  };
  const onRemoveLiquidity = () => {
    const removeLiqInfo = {
      ...baseEventInfo,
      poolSharePercentage: removeLiquidityConfig.percentage,
    };

    logEvent([E.removeLiquidityStarted, removeLiqInfo]);

    removeLiquidity()
      .then(() => logEvent([E.removeLiquidityCompleted, removeLiqInfo]))
      .finally(() => setShowManageLiquidityDialog(false));
  };
  const onLockToken = (gaugeId: string, electSuperfluid?: boolean) => {
    const gauge = allAggregatedGauges?.find((gauge) => gauge.id === gaugeId);
    const lockInfo = {
      ...baseEventInfo,
      isSuperfluidEnabled: electSuperfluid,
      unbondingPeriod: gauge?.duration.asDays(),
    };

    logEvent([E.bondStarted, lockInfo]);

    if (electSuperfluid) {
      setShowSuperfluidValidatorsModal(true);
      setShowLockLPTokenModal(false);
      // `sendLockAndSuperfluidDelegateMsg` will be sent after superfluid modal
    } else if (gauge) {
      lockToken(gauge.duration)
        .then(() => logEvent([E.bondCompleted, lockInfo]))
        .finally(() => setShowLockLPTokenModal(false));
    } else {
      console.error("Gauge of id", gaugeId, "not found in allAggregatedGauges");
    }
  };
  const onUnlockToken = (lockIds: string[], duration: Duration) => {
    const unlockEvent = {
      ...baseEventInfo,
      unbondingPeriod: duration?.asDays(),
    };
    logEvent([E.unbondAllStarted, unlockEvent]);

    unlockToken(lockIds, duration).then(() => {
      logEvent([E.unbondAllCompleted, unlockEvent]);
    });
  };
  // TODO: re-add unpool functionality
  const handleSuperfluidDelegateToValidator = useCallback(
    (validatorAddress) => {
      if (!superfluidPoolConfig?.superfluid) return;

      const poolInfo = {
        poolId,
        poolName,
        poolWeight,
        isSuperfluidPool: superfluidPoolConfig?.isSuperfluid ?? false,
        unbondingPeriod: 14,
        validatorName: queryCosmos.queryValidators
          .getQueryStatus(Staking.BondStatus.Bonded)
          .getValidator(validatorAddress)?.description.moniker,
      };

      logEvent([E.superfluidStakeStarted, poolInfo]);

      superfluidDelegateToValidator(validatorAddress, lockLPTokensConfig)
        .then(() => logEvent([E.superfluidStakeCompleted, poolInfo]))
        .finally(() => setShowSuperfluidValidatorsModal(false));
    },
    [superfluidPoolConfig?.superfluid, lockLPTokensConfig]
  );

  const pageTitle = useMemo(
    () => (pool ? `Pool #${pool.id}` : undefined),
    [pool?.id]
  );
  useNavBar({
    title: pageTitle,
    ctas: [
      {
        label: "Swap Tokens",
        onClick: () => {
          logEvent([E.swapTokensClicked, baseEventInfo]);
          setShowTradeTokenModal(true);
        },
      },
    ],
  });

  const levelCta: 1 | 2 | undefined = useMemo(() => {
    if (
      poolDetailConfig?.userAvailableValue.toDec().gt(new Dec(0)) &&
      bondableDurations.length > 0
    )
      return 2;

    if (poolDetailConfig?.userAvailableValue.toDec().isZero()) return 1;
  }, [poolDetailConfig?.userAvailableValue, bondableDurations]);

  return (
    <main className="flex flex-col gap-10 bg-osmoverse-900 min-h-screen p-8">
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {pool &&
        addLiquidityConfig &&
        removeLiquidityConfig &&
        showManageLiquidityDialog && (
          <ManageLiquidityModal
            isOpen={showManageLiquidityDialog}
            title="Manage Liquidity"
            onRequestClose={() => setShowManageLiquidityDialog(false)}
            addLiquidityConfig={addLiquidityConfig}
            removeLiquidityConfig={removeLiquidityConfig}
            isSendingMsg={txTypeInProgress !== ""}
            getFiatValue={(coin) => priceStore.calculatePrice(coin)}
            onAddLiquidity={onAddLiquidity}
            onRemoveLiquidity={onRemoveLiquidity}
          />
        )}
      {pool && showTradeTokenModal && (
        <TradeTokens
          className="md:!p-0"
          hideCloseButton={isMobile}
          isOpen={showTradeTokenModal}
          onRequestClose={() => setShowTradeTokenModal(false)}
          pools={[pool.pool]}
        />
      )}
      {lockLPTokensConfig &&
        allowedAggregatedGauges &&
        showLockLPTokenModal && (
          <LockTokensModal
            poolId={poolId}
            isOpen={showLockLPTokenModal}
            title="Liquidity Bonding"
            onRequestClose={() => setShowLockLPTokenModal(false)}
            amountConfig={lockLPTokensConfig}
            onLockToken={onLockToken}
          />
        )}
      {superfluidPoolConfig?.superfluid &&
        pool &&
        lockLPTokensConfig &&
        showSuperfluidValidatorModal && (
          <SuperfluidValidatorModal
            title={
              isMobile ? "Select Validator" : "Select Superfluid Validator"
            }
            availableBondAmount={
              superfluidPoolConfig?.superfluid.upgradeableLpLockIds
                ? superfluidPoolConfig.superfluid.upgradeableLpLockIds.amount // is delegating amount from existing lockup
                : new CoinPretty(
                    pool.shareCurrency, // is delegating amount from new/pending lockup
                    lockLPTokensConfig.amount !== ""
                      ? lockLPTokensConfig.getAmountPrimitive().amount
                      : new Dec(0)
                  )
            }
            isOpen={showSuperfluidValidatorModal}
            onRequestClose={() => setShowSuperfluidValidatorsModal(false)}
            onSelectValidator={handleSuperfluidDelegateToValidator}
          />
        )}
      <div className="flex flex-col gap-4 bg-osmoverse-1000 rounded-4xl pb-5">
        <div
          className={classNames(
            "flex flex-col gap-10 px-10 pt-10 transition-height duration-300 ease-inOutBack overflow-hidden",
            showPoolDetails ? "h-[250px]" : "h-[120px]"
          )}
        >
          <div className="flex items-start place-content-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {pool && (
                  <PoolAssetsIcon
                    assets={pool.poolAssets.map((asset) => ({
                      coinDenom: asset.amount.denom,
                      coinImageUrl: asset.amount.currency.coinImageUrl,
                    }))}
                    size="sm"
                  />
                )}
                <h5>{poolName}</h5>
              </div>
              {superfluidPoolConfig?.isSuperfluid && (
                <span className="body2 text-osmoverse-300">
                  Superfluid staking enabled
                </span>
              )}
            </div>
            <div className="flex items-center gap-10">
              <div>
                <span className="text-osmoverse-400 subtitle1 gap-2">
                  24hr Trading volume
                </span>
                <h4 className="text-osmoverse-100">
                  {queryGammPoolFeeMetrics
                    .getPoolFeesMetrics(poolId, priceStore)
                    .volume7d.toString()}
                </h4>
              </div>
              <div>
                <span className="text-osmoverse-400 subtitle1 gap-2">
                  Pool liquidity
                </span>
                <h4 className="text-osmoverse-100">
                  {poolDetailConfig?.totalValueLocked.toString()}
                </h4>
              </div>
              <div>
                <span className="text-osmoverse-400 subtitle1 gap-2">
                  Swap fee
                </span>
                <h4 className="text-osmoverse-100">
                  {pool?.swapFee.toString()}
                </h4>
              </div>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-4">
              <span className="subtitle1 text-osmoverse-400">
                Pool catalysts
              </span>
              <div className="flex items-center gap-24">
                {pool?.poolAssets.map((asset) => (
                  <div key={asset.amount.denom}>
                    <span className="subtitle1">{asset.amount.denom}</span>
                    <h5 className="text-osmoverse-100">
                      {asset.amount.maxDecimals(0).hideDenom(true).toString()}
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex items-center mx-auto gap-1 cursor-pointer select-none"
          onClick={() => setShowPoolDetails(!showPoolDetails)}
        >
          <span className="subtitle2 text-wosmongton-200">
            {showPoolDetails ? "Collapse details" : "Show details"}
          </span>
          <div
            className={classNames("flex items-center transition-transform", {
              "rotate-180": showPoolDetails,
            })}
          >
            <Image
              src="/icons/chevron-down.svg"
              alt="pool details"
              height={14}
              width={14}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-7">
        <h5>Put your assets to work.</h5>
        <span className="subtitle1 text-osmoverse-300">
          Add your assets to this pool to unlock exciting APRs. The longer your
          unbonding period, the more you make. Learn more
        </span>
        <div
          className={classNames(
            "rounded-4xl p-1",
            levelCta === 1 ? "bg-gradient-positive" : "bg-osmoverse-800"
          )}
        >
          <div className="flex flex-col gap-10 bg-osmoverse-800 rounded-4x4pxlinset p-9">
            <div className="flex items-start place-content-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline flex-wrap gap-4">
                  <LevelBadge level={1} />
                  <div className="flex shrink-0 items-center gap-4">
                    <h5>Earn swap fees</h5>
                    <h5 className="text-bullish">{`${
                      pool
                        ? queryGammPoolFeeMetrics
                            .get7dPoolFeeApy(pool, priceStore)
                            .toString()
                        : ""
                    } APR`}</h5>
                  </div>
                </div>
                <span className="caption text-osmoverse-200">
                  Convert your tokens into shares and earn on every swap.
                </span>
              </div>
              <div className="flex shrink-0 gap-4">
                <NewButton className="h-16 px-20 py-4" mode="secondary">
                  Remove liquidity
                </NewButton>
                <NewButton
                  className={classNames("h-16 px-20 py-4", {
                    "bg-gradient-positive text-osmoverse-900": levelCta === 1,
                  })}
                >
                  Add Liquidity
                </NewButton>
                {/** Buttons */}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <h3>
                {`${queryOsmosis.queryGammPoolShare
                  .getAvailableGammShare(bech32Address, poolId)
                  .trim(true)
                  .hideDenom(true)
                  .maxDecimals(4)
                  .toString()} shares`}
              </h3>
            </div>
          </div>
        </div>
        <div
          className={classNames(
            "rounded-4xl p-1",
            levelCta === 2 ? "bg-gradient-positive" : "bg-osmoverse-800"
          )}
        >
          <div className="flex flex-col gap-10 bg-osmoverse-800 rounded-4x4pxlinset p-9">
            <div className="flex place-content-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline flex-wrap gap-4">
                  <LevelBadge level={2} />
                  <h5>Bond liquidity</h5>
                </div>
                <span className="caption text-osmoverse-200">
                  Lock up your shares for longer durations to earn higher APRs.
                  {superfluidPoolConfig?.isSuperfluid &&
                    " Go superfluid for maximum rewards."}
                </span>
              </div>
              <NewButton
                className={classNames("h-16 w-96 px-20 py-4 border-none", {
                  "bg-gradient-positive text-osmoverse-900": levelCta === 2,
                })}
                disabled={levelCta !== 2}
              >
                Bond shares
              </NewButton>
            </div>
            <div className="flex items-center gap-4">
              {bondableDurations.map((bondableDuration) => (
                <BondCard
                  key={bondableDuration.duration.asMilliseconds()}
                  {...bondableDuration}
                  onUnbond={() => console.log("log")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
});

const LevelBadge: FunctionComponent<{ level: number }> = ({ level }) => (
  <div className="bg-wosmongton-400 rounded-xl px-5 py-1">
    <h5>Level {level}</h5>
  </div>
);

export default Pool;

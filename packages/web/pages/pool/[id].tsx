import Head from "next/head";
import Image from "next/image";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  UnPoolWhitelistedPoolIds,
  EventName,
  PromotedLBPPoolIds,
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
import classNames from "classnames";

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
  const account = accountStore.getAccount(chainStore.osmosis.chainId);
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

  // swap modal
  const [showTradeTokenModal, setShowTradeTokenModal] = useState(false);

  // show sections
  const showDepoolButton =
    (pool &&
      UnPoolWhitelistedPoolIds[pool.id] !== undefined &&
      poolDetailConfig?.userCanDepool) ||
    account.txTypeInProgress === "unPoolWhitelistedPool";

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

  const pageTitle = pool ? `Pool #${pool.id}` : undefined;
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

  return (
    <main>
      <Head>
        <title>{pageTitle}</title>
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
          onAddLiquidity={onAddLiquidity}
          onRemoveLiquidity={onRemoveLiquidity}
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
      {lockLPTokensConfig && allowedAggregatedGauges && (
        <LockTokensModal
          poolId={poolId}
          isOpen={showLockLPTokenModal}
          title="Liquidity Bonding"
          onRequestClose={() => setShowLockLPTokenModal(false)}
          amountConfig={lockLPTokensConfig}
          onLockToken={onLockToken}
        />
      )}
      {superfluidPoolConfig?.superfluid && pool && lockLPTokensConfig && (
        <SuperfluidValidatorModal
          title={isMobile ? "Select Validator" : "Select Superfluid Validator"}
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

      <section className="bg-osmoverse-900 min-h-screen p-8">
        <div className="flex flex-col gap-4 bg-osmoverse-1000 rounded-[28px] pb-5">
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
              <div>
                <span className="text-osmoverse-400 subtitle1">
                  24hr Trading volume
                </span>
                <h4 className="text-osmoverse-100">
                  {queryGammPoolFeeMetrics
                    .getPoolFeesMetrics(poolId, priceStore)
                    .volume7d.toString()}
                </h4>
              </div>
              <div>
                <span className="text-osmoverse-400 subtitle1">
                  Pool liquidity
                </span>
                <h4 className="text-osmoverse-100">
                  {poolDetailConfig?.totalValueLocked.toString()}
                </h4>
              </div>
              <div>
                <span className="text-osmoverse-400 subtitle1">
                  Unbonding APR incentives
                </span>
                <div className="flex items-center gap-8 place-content-between">
                  {allowedAggregatedGauges.map((gauge) => (
                    <div
                      key={gauge.duration.asSeconds()}
                      className="flex flex-col"
                    >
                      <span className="text-h5 font-h5 text-bullish">
                        {gauge.apr?.maxDecimals(0).toString()}
                        {gauge.superfluidApr &&
                          `+${gauge.superfluidApr?.maxDecimals(0).toString()}`}
                      </span>
                      <span className="text-osmoverse-400 caption">
                        {gauge.duration.humanize()}
                      </span>
                    </div>
                  ))}
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
      </section>
    </main>
  );
});

export default Pool;

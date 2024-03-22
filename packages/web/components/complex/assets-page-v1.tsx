import { PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback, useEffect, useState } from "react";

import { PoolCard } from "~/components/cards/";
import { MetricLoader } from "~/components/loaders";
import { AssetsTableV1 } from "~/components/table/assets-table-v1";
import type { Metric } from "~/components/types";
import { ShowMoreButton } from "~/components/ui/button";
import { DesktopOnlyPrivateText } from "~/components/your-balance/privacy";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useHideDustUserSetting,
  useNavBar,
  useWindowSize,
} from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

const INIT_POOL_CARD_COUNT = 6;

export const AssetsPageV1: FunctionComponent = observer(() => {
  const { isMobile } = useWindowSize();
  const { assetsStore } = useStore();
  const {
    nativeBalances,
    ibcBalances,
    unverifiedIbcBalances,
    unverifiedNativeBalances,
  } = assetsStore;
  const { t } = useTranslation();

  const { startBridge, bridgeAsset } = useBridge();

  const { setUserProperty, logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Assets.pageViewed],
  });

  useEffect(() => {
    setUserProperty(
      "osmoBalance",
      Number(
        nativeBalances[0].balance.maxDecimals(6).hideDenom(true).toString()
      )
    );
  }, [nativeBalances, setUserProperty]);

  // set nav bar ctas
  useNavBar({
    ctas: [
      {
        label: t("assets.table.depositButton"),
        onClick: () => {
          startBridge("deposit");
          logEvent([EventName.Assets.depositClicked]);
        },
      },
      {
        label: t("assets.table.withdrawButton"),
        onClick: () => {
          startBridge("withdraw");
          logEvent([EventName.Assets.withdrawClicked]);
        },
      },
    ],
  });

  const onTableDeposit = useCallback(
    (_chainId: string, coinDenom: string, externalDepositUrl?: string) => {
      if (!externalDepositUrl) {
        bridgeAsset(coinDenom, "deposit");
      }
    },
    [bridgeAsset]
  );
  const onTableWithdraw = useCallback(
    (_chainId: string, coinDenom: string, externalWithdrawUrl?: string) => {
      if (!externalWithdrawUrl) {
        bridgeAsset(coinDenom, "withdraw");
      }
    },
    [bridgeAsset]
  );

  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <AssetsOverview />
      <AssetsTableV1
        nativeBalances={nativeBalances}
        unverifiedNativeBalances={unverifiedNativeBalances}
        ibcBalances={ibcBalances}
        unverifiedIbcBalances={unverifiedIbcBalances}
        onDeposit={onTableDeposit}
        onWithdraw={onTableWithdraw}
      />
      {!isMobile && <PoolAssets />}
    </main>
  );
});

const AssetsOverview: FunctionComponent = observer(() => {
  const { assetsStore, queriesStore, chainStore, priceStore } = useStore();
  const { width } = useWindowSize();
  const { t } = useTranslation();

  const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

  const queryAccountsPositions = osmosisQueries.queryAccountsPositions.get(
    assetsStore.address ?? ""
  );

  const totalAssetsValue = priceStore.calculateTotalPrice([
    ...assetsStore.availableBalance,
    ...assetsStore.lockedCoins,
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
    ...queryAccountsPositions.totalPositionsAssets,
  ]);
  const availableAssetsValue = priceStore.calculateTotalPrice(
    assetsStore.availableBalance
  );
  const bondedAssetsValue = priceStore.calculateTotalPrice(
    assetsStore.lockedCoins
  );
  const stakedAssetsValue = priceStore.calculateTotalPrice([
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
  ]);

  // set up user analytics
  const { setUserProperty } = useAmplitudeAnalytics();
  useEffect(() => {
    if (totalAssetsValue) {
      setUserProperty(
        "totalAssetsPrice",
        Number(totalAssetsValue.trim(true).toDec().toString(2))
      );
    }
    if (availableAssetsValue) {
      setUserProperty(
        "unbondedAssetsPrice",
        Number(availableAssetsValue.trim(true).toDec().toString(2))
      );
    }
    if (bondedAssetsValue) {
      setUserProperty(
        "bondedAssetsPrice",
        Number(bondedAssetsValue.trim(true).toDec().toString(2))
      );
    }
    if (stakedAssetsValue) {
      setUserProperty(
        "stakedOsmoPrice",
        Number(stakedAssetsValue.trim(true).toDec().toString(2))
      );
    }
  }, [
    availableAssetsValue,
    bondedAssetsValue,
    setUserProperty,
    stakedAssetsValue,
    totalAssetsValue,
  ]);

  const format = (price?: PricePretty): string => {
    if (!price) {
      return "0";
    }

    if (width < 1100) {
      return formatPretty(price);
    }
    return price.toString();
  };

  return (
    <div className="flex w-full place-content-between items-center gap-8 overflow-x-auto rounded-3xl bg-osmoverse-1000 px-8 py-9 2xl:gap-4 xl:gap-3 1.5lg:px-4 md:flex-col md:items-start md:gap-3 md:px-5 md:py-5">
      <Metric
        label={t("assets.totalAssets")}
        value={<DesktopOnlyPrivateText text={format(totalAssetsValue)} />}
      />
      <Metric
        label={t("assets.bondedAssets")}
        value={<DesktopOnlyPrivateText text={format(bondedAssetsValue)} />}
      />
      <Metric
        label={t("assets.unbondedAssets")}
        value={<DesktopOnlyPrivateText text={format(availableAssetsValue)} />}
      />
      <Metric
        label={t("assets.stakedAssets")}
        value={<DesktopOnlyPrivateText text={format(stakedAssetsValue)} />}
      />
    </div>
  );
});

const Metric: FunctionComponent<Metric> = ({ label, value }) => (
  <div className="flex shrink-0 flex-col gap-1 md:gap-2">
    <h6 className="md:text-subtitle1 md:font-subtitle1">{label}</h6>
    <h2 className="text-h3 font-h3 text-wosmongton-100 md:text-h4 md:font-h4">
      {value}
    </h2>
  </div>
);

const PoolAssets: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const { setUserProperty } = useAmplitudeAnalytics();
  const { t } = useTranslation();

  const { chainId } = chainStore.osmosis;
  const address = accountStore.getWallet(chainId)?.address ?? "";
  const queryOsmosis = queriesStore.get(chainId).osmosis!;

  const ownedPoolIds = queriesStore
    .get(chainId)
    .osmosis!.queryGammPoolShare.getOwnPools(address);
  const [showAllPools, setShowAllPools] = useState(false);

  useEffect(() => {
    setUserProperty("myPoolsCount", ownedPoolIds.length);
  }, [ownedPoolIds.length, setUserProperty]);

  const dustedPoolIds = useHideDustUserSetting(ownedPoolIds, (poolId) =>
    queryOsmosis.queryPools
      .getPool(poolId)
      ?.computeTotalValueLocked(priceStore)
      .mul(
        queryOsmosis.queryGammPoolShare.getAllGammShareRatio(address, poolId)
      )
  );

  if (dustedPoolIds.length === 0) {
    return null;
  }

  return (
    <section>
      <h5>{t("assets.myPools")}</h5>
      <PoolCards
        {...{ showAllPools, ownedPoolIds: dustedPoolIds, setShowAllPools }}
      />
    </section>
  );
});

const PoolCards: FunctionComponent<{
  showAllPools: boolean;
  ownedPoolIds: string[];
  setShowAllPools: (show: boolean) => void;
}> = observer(({ showAllPools, ownedPoolIds, setShowAllPools }) => {
  const { logEvent } = useAmplitudeAnalytics();
  return (
    <>
      <div className="grid-cards my-5 grid">
        <PoolCardsDisplayer
          poolIds={
            showAllPools
              ? ownedPoolIds
              : ownedPoolIds.slice(0, INIT_POOL_CARD_COUNT)
          }
        />
      </div>
      {ownedPoolIds.length > INIT_POOL_CARD_COUNT && (
        <ShowMoreButton
          className="m-auto"
          isOn={showAllPools}
          onToggle={() => {
            logEvent([
              EventName.Assets.assetsListMoreClicked,
              {
                isOn: !showAllPools,
              },
            ]);
            setShowAllPools(!showAllPools);
          }}
        />
      )}
    </>
  );
});

const PoolCardsDisplayer: FunctionComponent<{ poolIds: string[] }> = observer(
  ({ poolIds }) => {
    const { chainStore, queriesStore, derivedDataStore } = useStore();
    const { t } = useTranslation();

    const queryOsmosis = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

    const flags = useFeatureFlags();

    const pools = poolIds
      .map((poolId) => {
        const sharePoolDetail = derivedDataStore.sharePoolDetails.get(poolId);
        const poolBonding = derivedDataStore.poolsBonding.get(poolId);
        const pool = sharePoolDetail.querySharePool;

        const apr =
          poolBonding.highestBondDuration?.aggregateApr ?? new RatePretty(0);

        if (
          !pool ||
          (pool.type === "concentrated" && !flags.concentratedLiquidity)
        ) {
          return undefined;
        }

        return [
          pool,
          sharePoolDetail.userShareValue,
          [
            queryOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: t("assets.poolCards.APR"),
                  value: (
                    <MetricLoader
                      isLoading={
                        queryOsmosis.queryIncentivizedPools.isAprFetching
                      }
                    >
                      <h6>{apr.maxDecimals(2).toString()}</h6>
                    </MetricLoader>
                  ),
                }
              : {
                  label: t("assets.poolCards.FeeAPY"),
                  value:
                    poolBonding.highestBondDuration?.swapFeeApr
                      .maxDecimals(0)
                      .toString() ??
                    sharePoolDetail.swapFeeApr.maxDecimals(0).toString(),
                },
            {
              label: t("assets.poolCards.liquidity"),
              value: (
                <h6>
                  <DesktopOnlyPrivateText
                    text={sharePoolDetail.userAvailableValue
                      .maxDecimals(2)
                      .toString()}
                  />
                </h6>
              ),
            },
            queryOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: t("assets.poolCards.bonded"),
                  value: sharePoolDetail.userBondedValue.toString(),
                }
              : {
                  label: t("pools.externalIncentivized.TVL"),
                  value: formatPretty(sharePoolDetail.totalValueLocked),
                },
          ],
        ] as [ObservableQueryPool, PricePretty, Metric[]];
      })
      .filter(
        (p): p is [ObservableQueryPool, PricePretty, Metric[]] =>
          p !== undefined
      )
      .sort(([, aFiatValue], [, bFiatValue]) => {
        // desc by fiat value
        if (aFiatValue.toDec().gt(bFiatValue.toDec())) return -1;
        if (aFiatValue.toDec().lt(bFiatValue.toDec())) return 1;
        return 0;
      });
    const { logEvent } = useAmplitudeAnalytics();

    return (
      <>
        {pools.map(([pool, _, metrics]) => (
          <PoolCard
            key={pool.id}
            poolId={pool.id}
            poolAssets={pool.poolAssets.map((asset) => asset.amount.currency)}
            poolMetrics={metrics}
            isSuperfluid={queryOsmosis.querySuperfluidPools.isSuperfluidPool(
              pool.id
            )}
            onClick={() =>
              logEvent([
                EventName.Assets.myPoolsCardClicked,
                {
                  poolId: pool.id,
                  poolName: pool.poolAssets
                    .map((poolAsset) => poolAsset.amount.denom)
                    .join(" / "),
                  poolWeight: pool.weightedPoolInfo?.assets
                    .map((poolAsset) => poolAsset.weightFraction?.toString())
                    .join(" / "),
                  isSuperfluidPool:
                    queryOsmosis.querySuperfluidPools.isSuperfluidPool(pool.id),
                },
              ])
            }
          />
        ))}
      </>
    );
  }
);

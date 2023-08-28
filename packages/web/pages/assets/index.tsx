import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import {
  ComponentProps,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { ShowMoreButton } from "~/components/buttons/show-more";
import { PoolCard } from "~/components/cards/";
import { MetricLoader } from "~/components/loaders";
import { AssetsTable } from "~/components/table/assets-table";
import { DepoolingTable } from "~/components/table/depooling-table";
import { Metric } from "~/components/types";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useHideDustUserSetting,
  useNavBar,
  useTransferConfig,
  useWindowSize,
} from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import {
  BridgeTransferModal,
  FiatRampsModal,
  IbcTransferModal,
  PreTransferModal,
  SelectAssetSourceModal,
  TransferAssetSelectModal,
} from "~/modals";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

const INIT_POOL_CARD_COUNT = 6;

const Assets: NextPage = observer(() => {
  const { isMobile } = useWindowSize();
  const { assetsStore } = useStore();
  const { nativeBalances, ibcBalances, unverifiedIbcBalances } = assetsStore;
  const t = useTranslation();

  const { setUserProperty, logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Assets.pageViewed],
  });
  const transferConfig = useTransferConfig();

  // mobile only
  const [preTransferModalProps, setPreTransferModalProps] =
    useState<ComponentProps<typeof PreTransferModal> | null>(null);
  const launchPreTransferModal = useCallback(
    (coinDenom: string) => {
      const ibcBalance = ibcBalances.find(
        (ibcBalance) => ibcBalance.balance.denom === coinDenom
      );

      if (!ibcBalance) {
        console.error("launchPreTransferModal: ibcBalance not found");
        return;
      }

      setPreTransferModalProps({
        isOpen: true,
        selectedToken: ibcBalance.balance,
        tokens: ibcBalances.map(({ balance }) => balance),
        externalDepositUrl: ibcBalance.depositUrlOverride,
        externalWithdrawUrl: ibcBalance.withdrawUrlOverride,
        isUnstable: ibcBalance.isUnstable,
        onSelectToken: launchPreTransferModal,
        onWithdraw: () => {
          transferConfig?.transferAsset(
            "withdraw",
            ibcBalance.chainInfo.chainId,
            coinDenom
          );
          setPreTransferModalProps(null);
        },
        onDeposit: () => {
          transferConfig?.transferAsset(
            "deposit",
            ibcBalance.chainInfo.chainId,
            coinDenom
          );
          setPreTransferModalProps(null);
        },
        onRequestClose: () => setPreTransferModalProps(null),
      });
    },
    [ibcBalances, transferConfig]
  );

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
          transferConfig?.startTransfer("deposit");
          logEvent([EventName.Assets.depositClicked]);
        },
      },
      {
        label: t("assets.table.withdrawButton"),
        onClick: () => {
          transferConfig?.startTransfer("withdraw");
          logEvent([EventName.Assets.withdrawClicked]);
        },
      },
    ],
  });

  const onTableDeposit = useCallback(
    (chainId, coinDenom, externalDepositUrl) => {
      if (!externalDepositUrl) {
        isMobile
          ? launchPreTransferModal(coinDenom)
          : transferConfig?.transferAsset("deposit", chainId, coinDenom);
      }
    },
    [isMobile, launchPreTransferModal, transferConfig]
  );
  const onTableWithdraw = useCallback(
    (chainId, coinDenom, externalWithdrawUrl) => {
      if (!externalWithdrawUrl) {
        transferConfig?.transferAsset("withdraw", chainId, coinDenom);
      }
    },
    [transferConfig]
  );

  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <NextSeo
        title={t("seo.assets.title")}
        description={t("seo.assets.description")}
      />
      <AssetsOverview />
      {isMobile && preTransferModalProps && (
        <PreTransferModal {...preTransferModalProps} />
      )}
      {transferConfig?.assetSelectModal && (
        <TransferAssetSelectModal {...transferConfig.assetSelectModal} />
      )}
      {transferConfig?.selectAssetSourceModal && (
        <SelectAssetSourceModal {...transferConfig.selectAssetSourceModal} />
      )}
      {transferConfig?.ibcTransferModal && (
        <IbcTransferModal {...transferConfig.ibcTransferModal} />
      )}
      {transferConfig?.bridgeTransferModal && (
        <BridgeTransferModal {...transferConfig.bridgeTransferModal} />
      )}
      {transferConfig?.fiatRampsModal && (
        <FiatRampsModal
          transakModalProps={{
            onCreateOrder: (data) => {
              logEvent([
                EventName.Assets.buyOsmoStarted,
                {
                  tokenName: data.status.cryptoCurrency,
                  tokenAmount: Number(
                    data.status?.fiatAmountInUsd ?? data.status.cryptoAmount
                  ),
                },
              ]);
            },
            onSuccessfulOrder: (data) => {
              logEvent([
                EventName.Assets.buyOsmoCompleted,
                {
                  tokenName: data.status.cryptoCurrency,
                  tokenAmount: Number(
                    data.status?.fiatAmountInUsd ?? data.status.cryptoAmount
                  ),
                },
              ]);
            },
          }}
          {...transferConfig.fiatRampsModal}
        />
      )}
      {/* 
        Removed for now as we have to upgrade to WalletConnect v2
        TODO: Upgrade to Eth WalletConnect v2 
       */}
      {/* {transferConfig?.walletConnectEth.sessionConnectUri && (
        <WalletConnectQRModal
          isOpen={true}
          uri={transferConfig.walletConnectEth.sessionConnectUri || ""}
          onRequestClose={() => transferConfig.walletConnectEth.disable()}
        />
      )} */}
      <AssetsTable
        nativeBalances={nativeBalances}
        ibcBalances={ibcBalances}
        unverifiedIbcBalances={unverifiedIbcBalances}
        onDeposit={onTableDeposit}
        onWithdraw={onTableWithdraw}
      />
      {!isMobile && <PoolAssets />}
      <section className="bg-osmoverse-900">
        <DepoolingTable
          className="mx-auto max-w-container p-10 md:p-5"
          tableClassName="md:w-screen md:-mx-5"
        />
      </section>
    </main>
  );
});

const AssetsOverview: FunctionComponent = observer(() => {
  const { assetsStore, queriesStore, chainStore } = useStore();
  const { width } = useWindowSize();
  const t = useTranslation();

  const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

  const accountPositions = osmosisQueries.queryAccountsPositions.get(
    assetsStore.address ?? ""
  ).positions;

  const positionsAssets = Array.from(
    accountPositions
      .reduce((balances, position) => {
        const addToMap = (coin: CoinPretty) => {
          const existingCoinBalance = balances.get(
            coin.currency.coinMinimalDenom
          );
          if (existingCoinBalance) {
            balances.set(
              coin.currency.coinMinimalDenom,
              existingCoinBalance.add(coin)
            );
          } else {
            balances.set(coin.currency.coinMinimalDenom, coin);
          }
        };
        if (position.baseAsset) {
          addToMap(position.baseAsset);
        }
        if (position.quoteAsset) {
          addToMap(position.quoteAsset);
        }
        position.totalClaimableRewards.forEach(addToMap);
        return balances;
      }, new Map<string, CoinPretty>())
      .values()
  );

  const totalAssetsValue = assetsStore.calcValueOf([
    ...assetsStore.availableBalance,
    ...assetsStore.lockedCoins,
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
    ...positionsAssets,
  ]);
  const availableAssetsValue = assetsStore.calcValueOf(
    assetsStore.availableBalance
  );
  const bondedAssetsValue = assetsStore.calcValueOf(assetsStore.lockedCoins);
  const stakedAssetsValue = assetsStore.calcValueOf([
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
  ]);

  // set up user analytics
  const { setUserProperty } = useAmplitudeAnalytics();
  useEffect(() => {
    setUserProperty(
      "totalAssetsPrice",
      Number(totalAssetsValue.trim(true).toDec().toString(2))
    );
    setUserProperty(
      "unbondedAssetsPrice",
      Number(availableAssetsValue.trim(true).toDec().toString(2))
    );
    setUserProperty(
      "bondedAssetsPrice",
      Number(bondedAssetsValue.trim(true).toDec().toString(2))
    );
    setUserProperty(
      "stakedOsmoPrice",
      Number(stakedAssetsValue.trim(true).toDec().toString(2))
    );
  }, [
    availableAssetsValue,
    bondedAssetsValue,
    setUserProperty,
    stakedAssetsValue,
    totalAssetsValue,
  ]);

  const format = (price: PricePretty): string => {
    if (width < 1100) {
      return formatPretty(price);
    }
    return price.toString();
  };

  return (
    <div className="flex w-full place-content-between items-center gap-8 overflow-x-auto rounded-[32px] bg-osmoverse-1000 px-8 py-9 2xl:gap-4 xl:gap-3 1.5lg:px-4 md:flex-col md:items-start md:gap-3 md:px-5 md:py-5">
      <Metric
        label={t("assets.totalAssets")}
        value={format(totalAssetsValue)}
      />
      <Metric
        label={t("assets.bondedAssets")}
        value={format(bondedAssetsValue)}
      />
      <Metric
        label={t("assets.unbondedAssets")}
        value={format(availableAssetsValue)}
      />
      <Metric
        label={t("assets.stakedAssets")}
        value={format(stakedAssetsValue)}
      />
    </div>
  );
});

const Metric: FunctionComponent<Metric> = ({ label, value }) => (
  <div className="flex shrink-0 flex-col gap-1 md:gap-2">
    <h6 className="md:font-subtitle1 md:text-subtitle1">{label}</h6>
    <h2 className="font-h3 text-h3 text-wosmongton-100 md:font-h4 md:text-h4">
      {value}
    </h2>
  </div>
);

const PoolAssets: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const { setUserProperty } = useAmplitudeAnalytics();
  const t = useTranslation();

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
    const t = useTranslation();

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
              value: sharePoolDetail.userAvailableValue
                .maxDecimals(2)
                .toString(),
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

export default Assets;

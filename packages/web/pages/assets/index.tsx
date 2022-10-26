import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useState,
  useEffect,
  ComponentProps,
  useCallback,
} from "react";
import { PricePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { AssetsTable } from "../../components/table/assets-table";
import { DepoolingTable } from "../../components/table/depooling-table";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { PoolCard } from "../../components/cards/";
import { Metric } from "../../components/types";
import { MetricLoader } from "../../components/loaders";
import { priceFormatter } from "../../components/utils";
import { useTranslation } from "react-multi-lang";
import {
  IbcTransferModal,
  BridgeTransferModal,
  TransferAssetSelectModal,
  FiatRampsModal,
  SelectAssetSourceModal,
  PreTransferModal,
  WalletConnectQRModal,
} from "../../modals";
import {
  useWindowSize,
  useAmplitudeAnalytics,
  useNavBar,
  useShowDustUserSetting,
  useTransferConfig,
} from "../../hooks";
import { EventName } from "../../config";

const INIT_POOL_CARD_COUNT = 6;

const Assets: NextPage = observer(() => {
  const { isMobile } = useWindowSize();
  const {
    assetsStore,
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();
  const { nativeBalances, ibcBalances } = assetsStore;
  const account = accountStore.getAccount(chainId);

  const { setUserProperty, logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Assets.pageViewed],
  });
  const transferConfig = useTransferConfig(assetsStore, account);

  // mobile only
  const [preTransferModalProps, setPreTransferModalProps] =
    useState<ComponentProps<typeof PreTransferModal> | null>(null);
  const launchPreTransferModal = useCallback(
    (coinDenom: string) => {
      const ibcBalance = ibcBalances.find(
        (ibcBalance) => ibcBalance.balance.denom === coinDenom
      );

      if (!ibcBalance) return;

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
    [ibcBalances]
  );

  useEffect(() => {
    setUserProperty(
      "osmoBalance",
      Number(
        nativeBalances[0].balance.maxDecimals(6).hideDenom(true).toString()
      )
    );
  }, [nativeBalances[0].balance.maxDecimals(6).hideDenom(true).toString()]);

  // set nav bar ctas
  useNavBar({
    ctas: [
      {
        label: "Deposit",
        onClick: () => {
          transferConfig?.startTransfer("deposit");
          logEvent([EventName.Assets.depositClicked]);
        },
      },
      {
        label: "Withdraw",
        onClick: () => {
          transferConfig?.startTransfer("withdraw");
          logEvent([EventName.Assets.withdrawClicked]);
        },
      },
    ],
  });

  return (
    <main className="flex flex-col gap-20 bg-background p-8">
      <AssetsOverview />
      {isMobile && preTransferModalProps && (
        <PreTransferModal {...preTransferModalProps} />
      )}
      {transferConfig?.assetSelectModal && (
        <TransferAssetSelectModal {...transferConfig.assetSelectModal} />
      )}
      {transferConfig?.connectNonIbcWalletModal && (
        <SelectAssetSourceModal {...transferConfig.connectNonIbcWalletModal} />
      )}
      {transferConfig?.ibcTransferModal && (
        <IbcTransferModal {...transferConfig.ibcTransferModal} />
      )}
      {transferConfig?.bridgeTransferModal && (
        <BridgeTransferModal {...transferConfig.bridgeTransferModal} />
      )}
      {transferConfig?.fiatRampsModal && (
        <FiatRampsModal {...transferConfig.fiatRampsModal} />
      )}
      {transferConfig?.walletConnectEth.sessionConnectUri && (
        <WalletConnectQRModal
          isOpen={true}
          uri={transferConfig.walletConnectEth.sessionConnectUri || ""}
          onRequestClose={() => transferConfig.walletConnectEth.disable()}
        />
      )}
      <AssetsTable
        nativeBalances={nativeBalances}
        ibcBalances={ibcBalances}
        onDepositIntent={() => transferConfig?.startTransfer("deposit")}
        onWithdrawIntent={() => transferConfig?.startTransfer("withdraw")}
        onDeposit={(chainId, coinDenom, externalDepositUrl) => {
          if (!externalDepositUrl) {
            isMobile
              ? launchPreTransferModal(coinDenom)
              : transferConfig?.transferAsset("deposit", chainId, coinDenom);
          }
        }}
        onWithdraw={(chainId, coinDenom, externalWithdrawUrl) => {
          if (!externalWithdrawUrl) {
            transferConfig?.transferAsset("withdraw", chainId, coinDenom);
          }
        }}
        onBuyOsmo={() => transferConfig?.buyOsmo()}
      />
      {!isMobile && <PoolAssets />}
      <section className="bg-surface">
        <DepoolingTable
          className="p-10 md:p-5 max-w-container mx-auto"
          tableClassName="md:w-screen md:-mx-5"
        />
      </section>
    </main>
  );
});

const AssetsOverview: FunctionComponent = observer(() => {
  const { assetsStore } = useStore();
  const t = useTranslation();

  const totalAssetsValue = assetsStore.calcValueOf([
    ...assetsStore.availableBalance,
    ...assetsStore.lockedCoins,
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
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
    totalAssetsValue.toString(),
    availableAssetsValue.toString(),
    bondedAssetsValue.toString(),
    stakedAssetsValue.toString(),
  ]);

  const Metric: FunctionComponent<Metric> = ({ label, value }) => (
    <div className="flex flex-col gap-5">
      <h6>{label}</h6>
      <h2 className="text-wosmongton-100">{value}</h2>
    </div>
  );

  return (
    <div className="w-full flex items-center gap-[100px] bg-osmoverse-800 rounded-[32px] px-20 py-10">
      <Metric
        label={t("assets.totalAssets")}
        value={totalAssetsValue.toString()}
      />
      <Metric
        label={t("assets.bondedAssets")}
        value={bondedAssetsValue.toString()}
      />
      <Metric
        label={t("assets.unbondedAssets")}
        value={availableAssetsValue.toString()}
      />
    </div>
  );
});

const PoolAssets: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const { setUserProperty } = useAmplitudeAnalytics();
  const t = useTranslation();

  const { chainId } = chainStore.osmosis;
  const { bech32Address } = accountStore.getAccount(chainId);
  const queryOsmosis = queriesStore.get(chainId).osmosis!;

  const ownedPoolIds = queriesStore
    .get(chainId)
    .osmosis!.queryGammPoolShare.getOwnPools(bech32Address);
  const [showAllPools, setShowAllPools] = useState(false);

  useEffect(() => {
    setUserProperty("myPoolsCount", ownedPoolIds.length);
  }, [ownedPoolIds.length]);

  const dustedPoolIds = useShowDustUserSetting(ownedPoolIds, (poolId) =>
    queryOsmosis.queryGammPools
      .getPool(poolId)
      ?.computeTotalValueLocked(priceStore)
      .mul(
        queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
          bech32Address,
          poolId
        )
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
      <div className="my-5 grid grid-cards">
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
    const {
      chainStore,
      queriesStore,
      queriesExternalStore,
      priceStore,
      accountStore,
    } = useStore();
    const t = useTranslation();

    const queriesOsmosis = queriesStore.get(chainStore.osmosis.chainId)
      .osmosis!;
    const { bech32Address } = accountStore.getAccount(
      chainStore.osmosis.chainId
    );

    const pools = poolIds
      .map((poolId) => {
        const pool = queriesOsmosis.queryGammPools.getPool(poolId);

        if (!pool) {
          return undefined;
        }
        const tvl = pool.computeTotalValueLocked(priceStore);
        const shareRatio =
          queriesOsmosis.queryGammPoolShare.getAllGammShareRatio(
            bech32Address,
            pool.id
          );
        const actualShareRatio = shareRatio.moveDecimalPointLeft(2);

        const lockedShareRatio =
          queriesOsmosis.queryGammPoolShare.getLockedGammShareRatio(
            bech32Address,
            pool.id
          );
        const actualLockedShareRatio =
          lockedShareRatio.moveDecimalPointRight(2);

        return [
          pool,
          tvl.mul(actualShareRatio).moveDecimalPointRight(2),
          [
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: t("assets.poolCards.APR"),
                  value: (
                    <MetricLoader
                      isLoading={
                        queriesOsmosis.queryIncentivizedPools.isAprFetching
                      }
                    >
                      {queriesOsmosis.queryIncentivizedPools
                        .computeMostApr(poolId, priceStore)
                        .maxDecimals(2)
                        .toString()}
                    </MetricLoader>
                  ),
                }
              : {
                  label: t("assets.poolCards.FeeAPY"),
                  value: (() => {
                    return queriesExternalStore.queryGammPoolFeeMetrics.get7dPoolFeeApr(
                      pool,
                      priceStore
                    );
                  })()
                    .maxDecimals(2)
                    .toString(),
                },
            {
              label: t("assets.poolCards.liquidity"),
              value: priceFormatter(pool.computeTotalValueLocked(priceStore)),
            },
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: t("assets.poolCards.bonded"),
                  value: tvl.mul(actualLockedShareRatio).toString(),
                }
              : {
                  label: t("assets.poolCards.myLiquidity"),
                  value: tvl
                    .mul(actualShareRatio)
                    .moveDecimalPointRight(2)
                    .toString(),
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
            isSuperfluid={queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
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
                  poolWeight: pool.poolAssets
                    .map((poolAsset) => poolAsset.weightFraction.toString())
                    .join(" / "),
                  isSuperfluidPool:
                    queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
                      pool.id
                    ),
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

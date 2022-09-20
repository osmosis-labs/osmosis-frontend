import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { PricePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { makeLocalStorageKVStore } from "../../stores/kv-store";
import { useStore } from "../../stores";
import { ObservableTransferUIConfig } from "../../stores/assets";
import { Overview } from "../../components/overview";
import { AssetsTable } from "../../components/table/assets-table";
import { DepoolingTable } from "../../components/table/depooling-table";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { PoolCard } from "../../components/cards/";
import { Metric } from "../../components/types";
import { MetricLoader } from "../../components/loaders";
import {
  IbcTransferModal,
  BridgeTransferModal,
  TransferAssetSelectModal,
} from "../../modals";
import { ConnectNonIbcWallet } from "../../modals/connect-non-ibc-wallet";
import { useWindowSize } from "../../hooks";
import { WalletConnectQRModal } from "../../modals";

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

  const [transferConfig] = useState(
    () =>
      new ObservableTransferUIConfig(
        assetsStore,
        account,
        makeLocalStorageKVStore("transfer-ui-config")
      )
  );

  return (
    <main className="bg-background">
      <AssetsOverview
        onDepositIntent={() => transferConfig.startTransfer("deposit")}
        onWithdrawIntent={() => transferConfig.startTransfer("withdraw")}
      />
      {transferConfig.assetSelectModal && (
        <TransferAssetSelectModal {...transferConfig.assetSelectModal} />
      )}
      {transferConfig.connectNonIbcWalletModal && (
        <ConnectNonIbcWallet {...transferConfig.connectNonIbcWalletModal} />
      )}
      {transferConfig.ibcTransferModal && (
        <IbcTransferModal {...transferConfig.ibcTransferModal} />
      )}
      {transferConfig.bridgeTransferModal && (
        <BridgeTransferModal {...transferConfig.bridgeTransferModal} />
      )}
      {transferConfig.walletConnectEth.sessionConnectUri && (
        <WalletConnectQRModal
          isOpen={true}
          uri={transferConfig.walletConnectEth.sessionConnectUri || ""}
          onRequestClose={() => transferConfig.walletConnectEth.disable()}
        />
      )}
      <AssetsTable
        nativeBalances={nativeBalances}
        ibcBalances={ibcBalances}
        onDepositIntent={() => transferConfig.startTransfer("deposit")}
        onWithdrawIntent={() => transferConfig.startTransfer("withdraw")}
        onDeposit={(chainId, coinDenom) =>
          transferConfig.transferAsset("deposit", chainId, coinDenom)
        }
        onWithdraw={(chainId, coinDenom) =>
          transferConfig.transferAsset("withdraw", chainId, coinDenom)
        }
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

const AssetsOverview: FunctionComponent<{
  onWithdrawIntent: () => void;
  onDepositIntent: () => void;
}> = observer(({ onDepositIntent, onWithdrawIntent }) => {
  const { assetsStore } = useStore();
  const { isMobile } = useWindowSize();

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

  return (
    <Overview
      title={isMobile ? "My Osmosis Assets" : <h4>My Osmosis Assets</h4>}
      titleButtons={
        isMobile
          ? undefined
          : [
              {
                label: "Deposit",
                onClick: onDepositIntent,
              },
              {
                label: "Withdraw",
                type: "outline",
                className: "bg-primary-200/30",
                onClick: onWithdrawIntent,
              },
            ]
      }
      primaryOverviewLabels={[
        {
          label: "Total Assets",
          value: totalAssetsValue.toString(),
        },
        {
          label: "Unbonded Assets",
          value: availableAssetsValue.toString(),
        },
        {
          label: "Bonded Assets",
          value: bondedAssetsValue.toString(),
        },
        {
          label: "Staked OSMO",
          value: stakedAssetsValue.toString(),
        },
      ]}
    />
  );
});

const PoolAssets: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const { chainId } = chainStore.osmosis;
  const { bech32Address } = accountStore.getAccount(chainId);
  const ownedPoolIds = queriesStore
    .get(chainId)
    .osmosis!.queryGammPoolShare.getOwnPools(bech32Address);
  const [showAllPools, setShowAllPools] = useState(false);

  if (ownedPoolIds.length === 0) {
    return null;
  }

  return (
    <section className="bg-background">
      <div className="max-w-container mx-auto md:px-4 p-10">
        <h5>My Pools</h5>
        <PoolCards {...{ showAllPools, ownedPoolIds, setShowAllPools }} />
      </div>
    </section>
  );
});

const PoolCards: FunctionComponent<{
  showAllPools: boolean;
  ownedPoolIds: string[];
  setShowAllPools: (show: boolean) => void;
}> = observer(({ showAllPools, ownedPoolIds, setShowAllPools }) => (
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
        onToggle={() => setShowAllPools(!showAllPools)}
      />
    )}
  </>
));

const PoolCardsDisplayer: FunctionComponent<{ poolIds: string[] }> = observer(
  ({ poolIds }) => {
    const {
      chainStore,
      queriesStore,
      queriesExternalStore,
      priceStore,
      accountStore,
    } = useStore();

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
                  label: "APR",
                  value: (
                    <MetricLoader
                      isLoading={
                        queriesOsmosis.queryIncentivizedPools.isAprFetching
                      }
                    >
                      {queriesOsmosis.queryIncentivizedPools
                        .computeMostAPY(poolId, priceStore)
                        .maxDecimals(2)
                        .toString()}
                    </MetricLoader>
                  ),
                }
              : {
                  label: "Fee APY",
                  value: (() => {
                    const queriesExternal = queriesExternalStore.get();
                    const poolWithFeeMetrics =
                      queriesExternal.queryGammPoolFeeMetrics.makePoolWithFeeMetrics(
                        pool,
                        priceStore
                      );
                    return queriesExternal.queryGammPoolFeeMetrics.get7dPoolFeeApy(
                      poolWithFeeMetrics,
                      priceStore
                    );
                  })()
                    .maxDecimals(2)
                    .toString(),
                },
            {
              label: "Pool Liquidity",
              value: pool.computeTotalValueLocked(priceStore).toString(),
            },
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: "Bonded",
                  value: tvl.mul(actualLockedShareRatio).toString(),
                }
              : {
                  label: "My Liquidity",
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
          />
        ))}
      </>
    );
  }
);

export default Assets;

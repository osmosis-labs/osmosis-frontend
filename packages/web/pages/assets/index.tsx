import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useState,
  ComponentProps,
  useCallback,
} from "react";
import { IBCCurrency } from "@keplr-wallet/types";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { useStore } from "../../stores/";
import { Overview } from "../../components/overview";
import { AssetsTable } from "../../components/table/assets-table";
import { DepoolingTable } from "../../components/table/depooling-table";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { PoolCard } from "../../components/cards/";
import { Metric } from "../../components/types";
import { MetricLoader } from "../../components/loaders";
import { IbcTransferModal } from "../../modals/ibc-transfer";
import { useWindowSize } from "../../hooks";

const INIT_POOL_CARD_COUNT = 6;

const Assets: NextPage = observer(() => {
  const { isMobile } = useWindowSize();

  return (
    <main className="bg-background">
      <AssetsOverview />
      {!isMobile && <PoolAssets />}
      <ChainAssets />
      <section className="bg-surface py-2">
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

  return (
    <section className="bg-background">
      <div className="max-w-container mx-auto md:px-4 px-10 py-5">
        <h5>My Pools</h5>
        <PoolCards {...{ showAllPools, ownedPoolIds, setShowAllPools }} />
      </div>
    </section>
  );
});

const ChainAssets: FunctionComponent = observer(() => {
  const {
    assetsStore: { nativeBalances, ibcBalances },
  } = useStore();

  const [transferModal, setTransferModal] = useState<ComponentProps<
    typeof IbcTransferModal
  > | null>(null);

  const openTransferModal = useCallback(
    (mode: "deposit" | "withdraw", chainId: string, coinDenom: string) => {
      const balance = ibcBalances.find(
        (bal) =>
          bal.chainInfo.chainId === chainId &&
          bal.balance.currency.coinDenom === coinDenom
      );

      if (!balance) {
        setTransferModal(null);
        return;
      }

      const currency = balance.balance.currency;
      // IBC multihop currency
      const modifiedCurrency =
        mode === "deposit" && balance.depositingSrcMinDenom
          ? {
              coinDecimals: currency.coinDecimals,
              coinGeckoId: currency.coinGeckoId,
              coinImageUrl: currency.coinImageUrl,
              coinDenom: currency.coinDenom,
              coinMinimalDenom: "",
              paths: (currency as IBCCurrency).paths.slice(0, 1),
              originChainId: balance.chainInfo.chainId,
              originCurrency: {
                coinDecimals: currency.coinDecimals,
                coinImageUrl: currency.coinImageUrl,
                coinDenom: currency.coinDenom,
                coinMinimalDenom: balance.depositingSrcMinDenom,
              },
            }
          : currency;

      const {
        chainInfo: { chainId: counterpartyChainId },
        sourceChannelId,
        destChannelId,
      } = balance;

      setTransferModal({
        isOpen: true,
        onRequestClose: () => setTransferModal(null),
        currency: modifiedCurrency as IBCCurrency,
        counterpartyChainId: counterpartyChainId,
        sourceChannelId,
        destChannelId,
        isWithdraw: mode === "withdraw",
        ics20ContractAddress:
          "ics20ContractAddress" in balance
            ? balance.ics20ContractAddress
            : undefined,
      });
    },
    [ibcBalances, setTransferModal]
  );

  return (
    <>
      {transferModal && <IbcTransferModal {...transferModal} />}
      <AssetsTable
        nativeBalances={nativeBalances}
        ibcBalances={ibcBalances}
        onDeposit={(chainId, coinDenom) =>
          openTransferModal("deposit", chainId, coinDenom)
        }
        onWithdraw={(chainId, coinDenom) =>
          openTransferModal("withdraw", chainId, coinDenom)
        }
      />
    </>
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
        ] as [ObservableQueryPool, Metric[]];
      })
      .filter((p): p is [ObservableQueryPool, Metric[]] => p !== undefined);

    return (
      <>
        {pools.map(([pool, metrics]) => (
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

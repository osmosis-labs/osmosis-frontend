import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { ObservablePool } from "@osmosis-labs/stores";
import { useStore } from "../../stores/";
import { Overview } from "../../components/overview";
import { AssetsTable } from "../../components/table/assets-table";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { PoolCard } from "../../components/cards/";
import { PoolMetric } from "../../components/cards/types";

const INIT_POOL_CARD_COUNT = 6;

const Assets: NextPage = observer(() => (
  <main>
    <AssetsOverview />
    <PoolAssets />
    <ChainAssets />
  </main>
));

const AssetsOverview: FunctionComponent = observer(() => {
  const { assetsStore } = useStore();

  const totalAssetsPrice = assetsStore.calcValueOf([
    ...assetsStore.availableBalance,
    ...assetsStore.lockedCoins,
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
  ]);
  const availableAssetsPrice = assetsStore.calcValueOf(
    assetsStore.availableBalance
  );
  const bondedAssetsPrice = assetsStore.calcValueOf(assetsStore.lockedCoins);
  const stakedAssetsPrice = assetsStore.calcValueOf([
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
  ]);

  return (
    <Overview
      title={<h4>My Osmosis Assets</h4>}
      primaryOverviewLabels={[
        {
          label: "Total Assets",
          value: totalAssetsPrice.toString(),
        },
        {
          label: "Available Assets",
          value: availableAssetsPrice.toString(),
        },
        {
          label: "Bonded Assets",
          value: bondedAssetsPrice.toString(),
        },
        {
          label: "Staked OSMO",
          value: stakedAssetsPrice.toString(),
        },
      ]}
    />
  );
});

const PoolAssets: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesOsmosisStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const { bech32Address } = accountStore.getAccount(chainId);
  let ownedPoolIds = queriesOsmosisStore
    .get(chainId)
    .queryGammPoolShare.getOwnPools(bech32Address);
  const [showAllPools, setShowAllPools] = useState(() => false);

  return (
    <section className="bg-background">
      <div className="max-w-container mx-auto px-10 py-5">
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

  return (
    <AssetsTable
      nativeBalances={nativeBalances}
      ibcBalances={ibcBalances}
      onDeposit={() => console.log("deposit")}
      onWithdraw={() => console.log("withdraw")}
    />
  );
});

const PoolCards: FunctionComponent<{
  showAllPools: boolean;
  ownedPoolIds: string[];
  setShowAllPools: (show: boolean) => void;
}> = observer(({ showAllPools, ownedPoolIds, setShowAllPools }) => (
  <>
    <div className="grid gap-10 grid-cols-3 py-5">
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
    const { chainStore, queriesOsmosisStore, priceStore, accountStore } =
      useStore();
    const queriesOsmosis = queriesOsmosisStore.get(chainStore.osmosis.chainId);
    const { bech32Address } = accountStore.getAccount(
      chainStore.osmosis.chainId
    );

    const pools = poolIds
      .map((poolId) => {
        const pool = queriesOsmosis.queryGammPools.getPool(poolId);

        if (!pool) {
          return undefined;
        }
        const fiatCurrency = priceStore.getFiatCurrency("usd")!;
        const tvl = pool.computeTotalValueLocked(priceStore, fiatCurrency);
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
        const actualLockedShareRatio = lockedShareRatio.moveDecimalPointLeft(2);

        return [
          pool,
          [
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: "APR",
                  value: `${queriesOsmosis.queryIncentivizedPools
                    .computeMostAPY(poolId, priceStore, fiatCurrency)
                    .toString()}%`,
                  isLoading:
                    queriesOsmosis.queryIncentivizedPools.isAprFetching,
                }
              : {
                  label: "Fee APR",
                  value: "",
                },
            {
              label: "Pool Liquidity",
              value: pool
                .computeTotalValueLocked(priceStore, fiatCurrency)
                .toString(),
            },
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: "Bonded",
                  value: tvl.mul(actualLockedShareRatio).toString(),
                }
              : {
                  label: "My Liquidity",
                  value: tvl.mul(actualShareRatio).toString(),
                },
          ],
        ] as [ObservablePool, PoolMetric[]];
      })
      .filter((p): p is [ObservablePool, PoolMetric[]] => p !== undefined);

    return (
      <>
        {pools.map(([pool, metrics]) => (
          <PoolCard key={pool.id} pool={pool} poolMetrics={metrics} />
        ))}
      </>
    );
  }
);

export default Assets;

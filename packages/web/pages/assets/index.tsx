import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { nanoid } from "nanoid";
import { useStore } from "../../stores/";
import { Overview } from "../../components/overview";
import AssetsTable from "../../components/table/assets-table";
import { ShowMoreButton } from "../../components/buttons/show-more";

const INIT_POOL_CARD_COUNT = 6;

const Assets: NextPage = observer(() => {
  return (
    <main>
      <AssetsOverview />
      <PoolAssets />
      <ChainAssets />
    </main>
  );
});

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
  const { chainStore, accountStore, assetsStore, queriesOsmosisStore } =
    useStore();
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
        <PoolsList {...{ showAllPools, ownedPoolIds, setShowAllPools }} />
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

const PoolsList: FunctionComponent<{
  showAllPools: boolean;
  ownedPoolIds: string[];
  setShowAllPools: (show: boolean) => void;
}> = observer(({ showAllPools, ownedPoolIds, setShowAllPools }) => (
  <>
    <div className="flex flex-col">
      <PoolsListDisplayer
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

const PoolsListDisplayer: FunctionComponent<{ poolIds: string[] }> = observer(
  ({ poolIds }) => (
    <>
      {poolIds.map((poolId) => (
        <span key={nanoid()}>{poolId}</span>
      ))}
    </>
  )
);

export default Assets;

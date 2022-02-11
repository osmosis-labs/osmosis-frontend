import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores/";
import { Overview } from "../../components/overview";
import { AssetsTable } from "./assets-table";

const Assets: NextPage = observer(() => {
  const { assetsStore } = useStore();
  const { nativeBalances, ibcBalances } = assetsStore;

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
    <main>
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
      <section className="bg-background">
        <div className="max-w-container mx-auto px-10 py-5">
          <h5>My Pools</h5>
        </div>
      </section>
      <AssetsTable
        nativeBalances={nativeBalances}
        ibcBalances={ibcBalances}
        onDeposit={() => console.log("deposit")}
        onWithdraw={() => console.log("withdraw")}
      />
    </main>
  );
});

export default Assets;

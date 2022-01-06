import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { IncentivizedPoolCard } from "../components/cards";

const Home: NextPage = observer(function () {
  const { chainStore, accountStore, queriesOsmosisStore } = useStore();

  const chainInfo = chainStore.getChain("osmosis");
  const account = accountStore.getAccount(chainInfo.chainId);

  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);

  return (
    <main className="max-w-container mx-auto">
      <div className="grid grid-cols-3 gap-4 bg-surface px-[1rem] py-[3rem]">
        {queryOsmosis.queryIncentivizedPools.incentivizedPools
          .map((poolId) => queryOsmosis.queryGammPools.getPool(poolId))
          .map((pool) => {
            if (pool) {
              return <IncentivizedPoolCard pool={pool} key={pool.id} />;
            }
          })}
      </div>
    </main>
  );
});

export default Home;

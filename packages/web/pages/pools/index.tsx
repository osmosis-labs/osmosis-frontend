import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { AccountWithCosmos } from "@keplr-wallet/stores";
import { QueriesOsmosis, ObservablePool } from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { PoolCard } from "../../components/cards";
import { Overview } from "../../components/overview";
import { LeftTime } from "../../components/left-time";

interface PoolDisplayInfo {
  observablePool: ObservablePool;
  apr?: string;
  liquidity?: string;
  bonded?: string;
  fees?: string;
}

const Pools: NextPage = observer(function () {
  const store = useStore();

  let queryOsmosis: QueriesOsmosis | undefined;
  let myPools: PoolDisplayInfo[] | undefined;
  let top3Pools: PoolDisplayInfo[] | undefined;

  if (store) {
    const { chainStore, accountStore, queriesOsmosisStore, priceStore } = store;
    const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;
    const chainId = chainStore.osmosis.chainId;
    const account = accountStore.getAccount(chainId);

    const getPoolDisplayInfo = (pool: ObservablePool) => {
      const liquidity = pool.computeTotalValueLocked(priceStore, fiat);

      return {
        observablePool: pool,
        apr: queryOsmosis?.queryIncentivizedPools
          .computeMostAPY(pool.id, priceStore, fiat)
          .toString(),
        liquidity: liquidity.toString(),
        bonded: queryOsmosis?.queryGammPoolShare
          .getLockedGammShareValue(
            account?.bech32Address ?? "",
            pool.id,
            liquidity,
            fiat
          )
          .toString(),
        fees: pool.swapFee.toString(),
      };
    };

    queryOsmosis = queriesOsmosisStore.get(chainId);

    myPools = queryOsmosis?.queryGammPoolShare
      .getOwnPools(account.bech32Address)
      .map((pool) => queryOsmosis?.queryGammPools.getPool(pool))
      .filter((pool): pool is ObservablePool => pool !== undefined)
      .map(getPoolDisplayInfo);

    top3Pools = queryOsmosis?.queryGammPools
      .getPoolsDescendingOrderTVL(priceStore, fiat, 3, 1)
      .filter((pool): pool is ObservablePool => pool !== undefined)
      .map(getPoolDisplayInfo);
  }

  return (
    <main>
      <Overview
        title="Active Pools"
        titleButtons={[{ label: "Create New Pool", onClick: console.log }]}
        primaryOverviewLabels={[
          { label: "OSMO Price", value: "$10" },
          {
            label: "Reward distribution in",
            value: <LeftTime hour="08" minute="20" />,
          },
        ]}
        secondaryOverviewLabels={[
          { label: "Bonded", value: "$10" },
          {
            label: "Swap fee",
            value: "0.3%",
          },
        ]}
        bgImageUrl="/images/osmosis-pool-machine.png"
      />
      <section className="bg-surface">
        <div className="max-w-container mx-auto p-10">
          <h5>My Pools</h5>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {myPools?.map((pool) => (
              <PoolCard
                key={pool.observablePool.id}
                pool={pool.observablePool}
                poolMetrics={[
                  {
                    label: "APR",
                    value: `${pool.apr ?? "0"}%`,
                    isLoading:
                      !pool.apr ||
                      queryOsmosis?.queryIncentivizedPools.isAprFetching,
                  },
                  {
                    label: "Pool Liquidity",
                    value: pool.liquidity ?? "$0",
                    isLoading: !pool.liquidity,
                  },
                  {
                    label: "Bonded",
                    value: pool.bonded ?? "$0",
                    isLoading: !pool.bonded,
                  },
                ]}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-background">
        <div className="max-w-container mx-auto p-10">
          <h5>Top Pools</h5>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {top3Pools?.map((pool) => (
              <PoolCard
                key={pool.observablePool.id}
                pool={pool.observablePool}
                poolMetrics={[
                  {
                    label: "APR",
                    value: `${pool.apr ?? "0"}%`,
                    isLoading:
                      !pool.apr ||
                      queryOsmosis?.queryIncentivizedPools.isAprFetching,
                  },
                  {
                    label: "Pool Liquidity",
                    value: pool.liquidity ?? "$0",
                    isLoading: !pool.liquidity,
                  },
                  {
                    label: "Fees",
                    value: pool.fees ?? "0%",
                    isLoading: !pool.fees,
                  },
                ]}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-surface">
        <div className="max-w-container mx-auto p-10">
          <div className="flex items-center justify-between">
            <h5>All Pools</h5>
            <label
              htmlFor="show-all-pools"
              className="text-base flex items-center"
            >
              <input className="mr-2" id="show-all-pools" type="checkbox" />
              Show pools less then $1,000 TVL
            </label>
          </div>
          <table className="mt-4 w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Token Info</th>
                <th>TVL</th>
                <th>24h Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  50% ATOM, 50% OSMO
                  <span className="ml-2 rounded-lg bg-card py-1 px-1.5">
                    0.3%
                  </span>
                </td>
                <td>$466,803,653</td>
                <td>$28,646,361</td>
              </tr>
              <tr>
                <td>2</td>
                <td>
                  50% ATOM, 25% OSMO, 25% REGEN
                  <span className="ml-2 rounded-lg bg-card py-1 px-1.5">
                    0.3%
                  </span>
                </td>
                <td>$466,803,653</td>
                <td>$28,646,361</td>
              </tr>
              <tr>
                <td>3</td>
                <td>
                  50% ATOM, 50% OSMO
                  <span className="ml-2 rounded-lg bg-card py-1 px-1.5">
                    0.3%
                  </span>
                </td>
                <td>$466,803,653</td>
                <td>$28,646,361</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
});

export default Pools;

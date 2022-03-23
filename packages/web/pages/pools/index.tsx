import { CoinPretty, DecUtils } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { PoolCard } from "../../components/cards";
import { AllPoolsTableSet } from "../../components/complex/all-pools-table-set";
import { ExternalIncentivizedPoolsTableSet } from "../../components/complex/external-incentivized-pools-table-set";
import { LeftTime } from "../../components/left-time";
import { MetricLoader } from "../../components/loaders";
import { Overview } from "../../components/overview";
import { useStore } from "../../stores";

const REWARD_EPOCH_IDENTIFIER = "day";

const Pools: NextPage = observer(function () {
  const {
    chainStore,
    accountStore,
    priceStore,
    queriesOsmosisStore,
    queriesExternalStore,
  } = useStore();

  const chainInfo = chainStore.osmosis;
  const queriesOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
  const queriesExternal = queriesExternalStore.get();

  const account = accountStore.getAccount(chainInfo.chainId);

  const queryEpoch = queriesOsmosis.queryEpochs.getEpoch(
    REWARD_EPOCH_IDENTIFIER
  );
  const now = new Date();
  const epochRemainingTime = dayjs.duration(
    dayjs(queryEpoch.endTime).diff(dayjs(now), "second"),
    "second"
  );
  const epochRemainingTimeString =
    epochRemainingTime.asSeconds() <= 0
      ? dayjs.duration(0, "seconds").format("HH-mm")
      : epochRemainingTime.format("HH-mm");
  const [epochRemainingHour, epochRemainingMinute] =
    epochRemainingTimeString.split("-");

  const myPoolIds = queriesOsmosis.queryGammPoolShare.getOwnPools(
    account.bech32Address
  );

  // TODO: use real data after superfluid store is added
  const superfluidPoolIds = ["1", "560", "561"];

  const osmoPrice = priceStore.calculatePrice(
    new CoinPretty(
      chainStore.osmosis.stakeCurrency,
      DecUtils.getTenExponentNInPrecisionRange(
        chainStore.osmosis.stakeCurrency.coinDecimals
      )
    )
  );

  return (
    <main>
      <Overview
        title="Active Pools"
        titleButtons={[{ label: "Create New Pool", onClick: console.log }]}
        primaryOverviewLabels={[
          {
            label: "OSMO Price",
            value: (
              <MetricLoader
                className="h-[2.5rem] !mt-0"
                isLoading={!osmoPrice || osmoPrice.toDec().isZero()}
              >
                <div className="h-[2.5rem]">{osmoPrice?.toString()}</div>
              </MetricLoader>
            ),
          },
          {
            label: "Reward distribution in",
            value: (
              <LeftTime
                hour={epochRemainingHour}
                minute={epochRemainingMinute}
              />
            ),
          },
        ]}
      />
      <section className="bg-background">
        <div className="max-w-container mx-auto p-10 pb-[3.75rem]">
          <h5>My Pools</h5>
          <div className="mt-5 grid grid-cols-3 gap-10">
            {myPoolIds.map((myPoolId) => {
              const myPool = queriesOsmosis.queryGammPools.getPool(myPoolId);
              if (myPool) {
                const apr =
                  queriesOsmosis.queryIncentivizedPools.computeMostAPY(
                    myPool.id,
                    priceStore
                  );
                const poolLiquidity =
                  myPool.computeTotalValueLocked(priceStore);
                const myBonded =
                  queriesOsmosis.queryGammPoolShare.getLockedGammShareValue(
                    account.bech32Address,
                    myPoolId,
                    poolLiquidity,
                    priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!
                  );

                return (
                  <PoolCard
                    key={myPoolId}
                    poolId={myPoolId}
                    poolAssets={myPool.poolAssets.map((poolAsset) => ({
                      coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                      coinDenom: poolAsset.amount.currency.coinDenom,
                    }))}
                    poolMetrics={[
                      {
                        label: "APR",
                        value: apr.maxDecimals(2).toString(),
                        isLoading:
                          queriesOsmosis.queryIncentivizedPools.isAprFetching,
                      },
                      {
                        label: "Pool Liquidity",
                        value: poolLiquidity.toString(),
                        isLoading: poolLiquidity.toDec().isZero(),
                      },
                      {
                        label: "Bonded",
                        value: myBonded.toString(),
                        isLoading: poolLiquidity.toDec().isZero(),
                      },
                    ]}
                  />
                );
              }
            })}
          </div>
        </div>
      </section>
      <section className="bg-surface">
        <div className="max-w-container mx-auto p-10">
          <h5>Superfluid Pools</h5>
          <div className="mt-4 grid grid-cols-3 gap-10">
            {superfluidPoolIds.map((poolId) => {
              const superfluidPool =
                queriesOsmosis.queryGammPools.getPool(poolId);
              if (superfluidPool) {
                const poolFeesMetrics =
                  queriesExternal.queryGammPoolFeeMetrics.getPoolFeesMetrics(
                    superfluidPool.id,
                    priceStore
                  );
                const apr =
                  queriesOsmosis.queryIncentivizedPools.computeMostAPY(
                    superfluidPool.id,
                    priceStore
                  );
                const poolLiquidity =
                  superfluidPool.computeTotalValueLocked(priceStore);

                return (
                  <PoolCard
                    key={superfluidPool.id}
                    poolId={superfluidPool.id}
                    poolAssets={superfluidPool.poolAssets.map((poolAsset) => ({
                      coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                      coinDenom: poolAsset.amount.currency.coinDenom,
                    }))}
                    poolMetrics={[
                      {
                        label: "APR",
                        value: apr.maxDecimals(2).toString(),
                        isLoading:
                          queriesOsmosis.queryIncentivizedPools.isAprFetching,
                      },
                      {
                        label: "Pool Liquidity",
                        value: poolLiquidity.toString(),
                        isLoading: poolLiquidity.toDec().isZero(),
                      },
                      {
                        label: "Fees (7D)",
                        value: poolFeesMetrics.feesSpent7d.toString(),
                        isLoading: poolFeesMetrics.feesSpent7d.toDec().isZero(),
                      },
                    ]}
                    isSuperfluid={true}
                  />
                );
              }
            })}
          </div>
        </div>
      </section>
      <section className="bg-surface shadow-separator">
        <div className="max-w-container mx-auto p-10 py-[3.75rem]">
          <AllPoolsTableSet />
        </div>
      </section>
      <section className="bg-surface shadow-separator">
        <div className="max-w-container mx-auto p-10 py-[3.75rem]">
          <ExternalIncentivizedPoolsTableSet />
        </div>
      </section>
    </main>
  );
});

export default Pools;

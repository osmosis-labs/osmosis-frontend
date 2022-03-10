import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Duration } from "dayjs/plugin/duration";
import { Dec, PricePretty, CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryGuageById } from "@osmosis-labs/stores";
import { PoolDetailExtraGaugeAllowList } from "../../config";
import { useStore } from "../../stores";
import { Overview } from "../../components/overview";
import { Button } from "../../components/buttons";
import { Table, BaseCell } from "../../components/table";
import {
  PoolCatalystCard,
  PoolGaugeBonusCard,
  PoolGaugeCard,
} from "../../components/cards";
import { MetricLoader } from "../../components/loaders";
import { autorun } from "mobx";

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const { chainStore, queriesOsmosisStore, accountStore, priceStore } =
    useStore();

  const { id: poolId } = router.query;
  const { chainId } = chainStore.osmosis;

  const queries = queriesOsmosisStore.get(chainId);
  const account = accountStore.getAccount(chainStore.osmosis.chainId);
  const pool = queries.queryGammPools.getPool(poolId as string);
  const { bech32Address } = accountStore.getAccount(chainId);
  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

  // pool is loading if undefined
  let totalValueLocked: PricePretty | undefined;
  let userLockedValue: PricePretty | undefined;
  let userBondedValue: PricePretty | undefined;
  let userAvailableValue: PricePretty | undefined;
  let userPoolAssets: { ratio: RatePretty; asset: CoinPretty }[] | undefined;
  let userLockedAssets:
    | {
        duration: Duration;
        amount: CoinPretty;
        lockIds: string[];
        apr?: RatePretty;
      }[]
    | undefined;
  let externalGuages:
    | {
        duration: string;
        rewardAmount?: CoinPretty;
        remainingEpochs: number;
      }[]
    | undefined;
  let guages: ObservableQueryGuageById[] | undefined;

  if (pool) {
    totalValueLocked = pool.computeTotalValueLocked(priceStore, fiat);
    userLockedValue = totalValueLocked?.mul(
      queries.queryGammPoolShare.getAllGammShareRatio(bech32Address, pool.id)
    );
    userBondedValue = totalValueLocked
      ? queries.queryGammPoolShare.getLockedGammShareValue(
          bech32Address,
          pool.id,
          totalValueLocked,
          fiat
        )
      : undefined;
    userAvailableValue = !pool.totalShare.toDec().equals(new Dec(0))
      ? totalValueLocked.mul(
          queries.queryGammPoolShare
            .getAvailableGammShare(bech32Address, pool.id)
            .quo(pool.totalShare)
        )
      : new PricePretty(fiat, new Dec(0));
    userPoolAssets = pool.poolAssets.map((asset) => ({
      ratio: new RatePretty(asset.weight.quo(pool.totalWeight)),
      asset: asset.amount
        .mul(
          queries.queryGammPoolShare.getAllGammShareRatio(
            bech32Address,
            pool.id
          )
        )
        .trim(true)
        .shrink(true),
    }));
    userLockedAssets = queries.queryGammPoolShare
      .getShareLockedAssets(
        bech32Address,
        pool.id,
        queries.queryLockableDurations.lockableDurations
      )
      .map((lockedAsset) =>
        // calculate APR% for this pool asset
        ({
          ...lockedAsset,
          apr: queries.queryIncentivizedPools.isIncentivized(pool.id)
            ? new RatePretty(
                queries.queryIncentivizedPools.computeAPY(
                  pool.id,
                  lockedAsset.duration,
                  priceStore,
                  fiat
                )
              )
            : undefined,
        })
      );
    externalGuages = (PoolDetailExtraGaugeAllowList[pool.id] ?? []).map(
      ({ gaugeId, denom }) => {
        const observableGauge = queries.queryGauge.get(gaugeId);
        const currency = chainStore
          .getChain(chainStore.osmosis.chainId)
          .findCurrency(denom);

        return {
          duration: observableGauge.lockupDuration.humanize(),
          rewardAmount: currency
            ? new CoinPretty(
                currency,
                observableGauge.getCoin(currency)
              ).moveDecimalPointRight(currency.coinDecimals) //
            : undefined,
          remainingEpochs: observableGauge.remainingEpoch,
        };
      }
    );
    guages = queries.queryLockableDurations.lockableDurations.map(
      (duration) => {
        const guageId = queries.queryIncentivizedPools.getIncentivizedGaugeId(
          pool.id,
          duration
        )!;
        return queries.queryGauge.get(guageId);
      }
    );
  }

  // eject to pools page if pool does not exist
  useEffect(() => {
    return autorun(() => {
      if (queries.queryGammPools.poolExists(poolId as string) === false) {
        router.push("/pools");
      }
    });
  });

  return (
    <main>
      <Overview
        title={
          <MetricLoader
            className="h-7 w-80"
            isLoading={
              !pool ||
              pool?.poolAssets.some((asset) =>
                asset.amount.currency.coinDenom.startsWith("ibc")
              )
            }
          >
            {`Pool #${pool?.id} : ${pool?.poolAssets
              .map((asset) => asset.amount.currency.coinDenom)
              .join(" / ")}`}
          </MetricLoader>
        }
        titleButtons={[
          { label: "Add / Remove Liquidity", onClick: console.log },
          { label: "Swap Tokens", onClick: console.log },
        ]}
        primaryOverviewLabels={[
          {
            label: "Pool Liquidity",
            value: (
              <MetricLoader
                className="h-7 w-56"
                isLoading={!pool || !totalValueLocked}
              >
                {totalValueLocked?.toString() || "0"}
              </MetricLoader>
            ),
          },
          {
            label: "My Liquidity",
            value: (
              <MetricLoader className="h-7 " isLoading={!userLockedValue}>
                {userLockedValue?.toString() || "0"}
              </MetricLoader>
            ),
          },
        ]}
        secondaryOverviewLabels={[
          {
            label: "Bonded",
            value: (
              <MetricLoader className="h-4" isLoading={!userBondedValue}>
                {userBondedValue?.toString() || "0"}
              </MetricLoader>
            ),
          },
          {
            label: "Swap Fee",
            value: (
              <MetricLoader className="h-4" isLoading={!pool}>
                {pool?.swapFee.toString() || "0"}
              </MetricLoader>
            ),
          },
        ]}
        bgImageUrl="/images/osmosis-guy-in-lab.png"
      />
      <section className="bg-surface">
        <div className="max-w-container mx-auto p-10">
          <div className="flex place-content-between">
            <div className="max-w-md">
              <h5>Liquidity Mining</h5>
              <p className="text-white-mid py-2">
                Bond liquidity to various minimum unbonding periods to earn OSMO
                liquidity rewards and swap fees
              </p>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <span>Available LP tokens</span>
              <h5>
                <MetricLoader className="h-6" isLoading={!userAvailableValue}>
                  {userAvailableValue?.toString() || "$0"}
                </MetricLoader>
              </h5>
              <Button className="h-8" onClick={() => console.log("sdf")}>
                Start Earning
              </Button>
            </div>
          </div>
          {pool &&
            guages &&
            queries.queryIncentivizedPools.isIncentivized(pool.id) && (
              <>
                <div className="flex gap-9 place-content-between pt-10">
                  {externalGuages?.map(
                    (
                      { rewardAmount, duration: durationDays, remainingEpochs },
                      index
                    ) => (
                      <PoolGaugeBonusCard
                        key={index}
                        bonusValue={
                          rewardAmount?.maxDecimals(0).trim(true).toString() ??
                          "0"
                        }
                        days={durationDays}
                        remainingEpochs={remainingEpochs.toString()}
                      />
                    )
                  )}
                </div>
                <div className="flex gap-9 place-content-between pt-10">
                  {guages.map((guage, i) => (
                    <PoolGaugeCard
                      key={i}
                      days={guage.lockupDuration.humanize()}
                      apr={queries.queryIncentivizedPools
                        .computeAPY(
                          pool.id,
                          guage.lockupDuration,
                          priceStore,
                          fiat
                        )
                        .maxDecimals(2)
                        .toString()}
                      isLoading={
                        guage.isFetching ||
                        queries.queryIncentivizedPools.isAprFetching
                      }
                    />
                  ))}
                </div>
              </>
            )}
        </div>
        <div className="max-w-container mx-auto p-10">
          <h6>My Bondings</h6>
          <Table<
            BaseCell & {
              duration: Duration;
              amount: CoinPretty;
              apr?: RatePretty;
              lockIds: string[];
            }
          >
            className="w-full my-5"
            columnDefs={[
              { display: "Unbonding Duration" },
              { display: "Current APR" },
              { display: "Amount" },
              {
                display: "Action",
                displayCell: ({ value, amount, lockIds }) => (
                  <Button
                    type="arrow"
                    size="xs"
                    disabled={
                      !account.isReadyToSendMsgs ||
                      amount?.toDec().equals(new Dec(0))
                    }
                    onClick={() => {
                      console.log(value, lockIds);
                    }}
                  >
                    Unbond All
                  </Button>
                ),
              },
            ]}
            data={
              userLockedAssets?.map((lockedAsset) => [
                { value: lockedAsset.duration.humanize() }, // Unbonding Duration
                {
                  value:
                    lockedAsset.apr?.maxDecimals(2).trim(true).toString() ??
                    "0%",
                }, // Current APR
                {
                  value: lockedAsset.amount
                    .maxDecimals(6)
                    .trim(true)
                    .toString(),
                }, // Amount
                { ...lockedAsset, value: lockedAsset.duration.humanize() }, // Unbond All button
              ]) ?? [[{ value: "" }], [{ value: "" }], [{ value: "" }]]
            }
          />
        </div>
        <div className="max-w-container mx-auto p-10">
          <h5>Pool Catalyst</h5>
          <div className="flex gap-5 my-5">
            {(userPoolAssets ?? [undefined, undefined]).map(
              (userAsset, index) => (
                <PoolCatalystCard
                  key={index}
                  colorKey={Number(pool?.id ?? "0") + index}
                  isLoading={!pool || !userPoolAssets}
                  className="w-1/2 max-w-md"
                  percentDec={userAsset?.ratio.toString()}
                  tokenMinimalDenom={userAsset?.asset.currency.coinDenom}
                  metrics={[
                    {
                      label: "Total amount",
                      value: (
                        <MetricLoader isLoading={!userPoolAssets}>
                          {pool?.poolAssets
                            .find(
                              (asset) =>
                                asset.amount.currency.coinDenom ===
                                userAsset?.asset.currency.coinDenom
                            )
                            ?.amount.maxDecimals(0)
                            .toString() ?? "0"}
                        </MetricLoader>
                      ),
                    },
                    {
                      label: "My amount",
                      value: (
                        <MetricLoader isLoading={!userPoolAssets}>
                          {userAsset?.asset.maxDecimals(0).toString()}
                        </MetricLoader>
                      ),
                    },
                  ]}
                />
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
});

export default Pool;

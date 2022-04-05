import { CoinPretty, Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import {
  ObservableQueryGuageById,
  ObservableAddLiquidityConfig,
  ObservableRemoveLiquidityConfig,
} from "@osmosis-labs/stores";
import { Duration } from "dayjs/plugin/duration";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState, useMemo } from "react";
import { Button } from "../../components/buttons";
import {
  PoolCatalystCard,
  PoolGaugeBonusCard,
  PoolGaugeCard,
} from "../../components/cards";
import { MetricLoader } from "../../components/loaders";
import { Overview } from "../../components/overview";
import { BaseCell, Table } from "../../components/table";
import { ExternalIncentiveGaugeAllowList, EmbedChainInfos } from "../../config";
import { ManageLiquidityModal } from "../../modals/manage-liquidity";
import { useStore } from "../../stores";

const Pool: FunctionComponent = observer(() => {
  const router = useRouter();
  const { chainStore, queriesStore, accountStore, priceStore } = useStore();

  const { id: poolId } = router.query;
  const { chainId } = chainStore.osmosis;

  const queryOsmosis = queriesStore.get(chainId).osmosis;
  const account = accountStore.getAccount(chainStore.osmosis.chainId);
  const pool = queryOsmosis.queryGammPools.getPool(poolId as string);
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
  let superfluid:
    | "not-superfluid-pool"
    | {
        validatorName: string;
        validatorCommission: RatePretty;
        validatorImgSrc: string;
        delegation: CoinPretty;
        apr: RatePretty;
      }
    | undefined;

  if (pool) {
    totalValueLocked = pool.computeTotalValueLocked(priceStore);
    userLockedValue = totalValueLocked?.mul(
      queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
        bech32Address,
        pool.id
      )
    );
    userBondedValue = totalValueLocked
      ? queryOsmosis.queryGammPoolShare.getLockedGammShareValue(
          bech32Address,
          pool.id,
          totalValueLocked,
          fiat
        )
      : undefined;
    userAvailableValue = !pool.totalShare.toDec().equals(new Dec(0))
      ? totalValueLocked.mul(
          queryOsmosis.queryGammPoolShare
            .getAvailableGammShare(bech32Address, pool.id)
            .quo(pool.totalShare)
        )
      : new PricePretty(fiat, new Dec(0));
    userPoolAssets = pool.poolAssets.map((asset) => ({
      ratio: new RatePretty(asset.weight.quo(pool.totalWeight)),
      asset: asset.amount
        .mul(
          queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
            bech32Address,
            pool.id
          )
        )
        .trim(true)
        .shrink(true),
    }));
    userLockedAssets = queryOsmosis.queryGammPoolShare
      .getShareLockedAssets(
        bech32Address,
        pool.id,
        queryOsmosis.queryLockableDurations.lockableDurations
      )
      .map((lockedAsset) =>
        // calculate APR% for this pool asset
        ({
          ...lockedAsset,
          apr: queryOsmosis.queryIncentivizedPools.isIncentivized(pool.id)
            ? new RatePretty(
                queryOsmosis.queryIncentivizedPools.computeAPY(
                  pool.id,
                  lockedAsset.duration,
                  priceStore,
                  fiat
                )
              )
            : undefined,
        })
      );
    externalGuages = (ExternalIncentiveGaugeAllowList[pool.id] ?? []).map(
      ({ gaugeId, denom }) => {
        const observableGauge = queryOsmosis.queryGauge.get(gaugeId);
        const currency = chainStore
          .getChain(chainStore.osmosis.chainId)
          .findCurrency(denom);

        return {
          duration: observableGauge.lockupDuration.humanize(),
          rewardAmount: currency
            ? new CoinPretty(
                currency,
                observableGauge.getCoin(currency)
              ).moveDecimalPointRight(currency.coinDecimals)
            : undefined,
          remainingEpochs: observableGauge.remainingEpoch,
        };
      }
    );
    guages = queryOsmosis.queryLockableDurations.lockableDurations.map(
      (duration) => {
        const guageId =
          queryOsmosis.queryIncentivizedPools.getIncentivizedGaugeId(
            pool.id,
            duration
          )!;
        return queryOsmosis.queryGauge.get(guageId);
      }
    );

    // TODO: use real data after superfluid store is added
    superfluid = {
      validatorName: "Imperator.co",
      validatorImgSrc:
        "https://s3.amazonaws.com/keybase_processed_uploads/1855362ac6629cbc7158012eb363e405_360_360.jpg",
      validatorCommission: new RatePretty(new Dec(0.5)),
      delegation: new CoinPretty(
        chainStore.osmosis.stakeCurrency,
        new Dec(11000000)
      ),
      apr: new RatePretty(new Dec(0.79)),
    };
  }

  // eject to pools page if pool does not exist
  useEffect(() => {
    return autorun(() => {
      if (queryOsmosis.queryGammPools.poolExists(poolId as string) === false) {
        router.push("/pools");
      }
    });
  });

  // Manage liquidity state
  const [showManageLiquidityDialog, setShowManageLiquidityDialog] =
    useState(false);
  const [addLiquidityConfig, removeLiquidityConfig] = useMemo(() => {
    if (pool) {
      return [
        new ObservableAddLiquidityConfig(
          chainStore,
          chainStore.osmosis.chainId,
          pool.id,
          bech32Address,
          queriesStore,
          queryOsmosis.queryGammPoolShare,
          queryOsmosis.queryGammPools,
          queriesStore.get(chainStore.osmosis.chainId).queryBalances
        ),
        new ObservableRemoveLiquidityConfig(
          chainStore,
          chainStore.osmosis.chainId,
          pool.id,
          bech32Address,
          queriesStore,
          queryOsmosis.queryGammPoolShare,
          "50"
        ),
      ];
    }
    return [undefined, undefined];
  }, [pool, chainStore, bech32Address, queriesStore, queryOsmosis]);

  return (
    <main>
      {addLiquidityConfig && removeLiquidityConfig && (
        <ManageLiquidityModal
          isOpen={showManageLiquidityDialog}
          title="Manage Liquidity"
          onRequestClose={() => setShowManageLiquidityDialog(false)}
          addLiquidityConfig={addLiquidityConfig}
          removeLiquidityConfig={removeLiquidityConfig}
          getChainNetworkName={(coinDenom) =>
            EmbedChainInfos.find((chain) =>
              chain.currencies.find(
                (currency) => currency.coinDenom === coinDenom
              )
            )?.chainName
          }
          getFiatValue={(coin) => priceStore.calculatePrice(coin)}
          onAddLiquidity={() => {
            // TODO: send msgs w/ account store
            console.log("liquidity added");
          }}
          onRemoveLiquidity={() => console.log("liquidity removed")}
        />
      )}
      <Overview
        title={
          <MetricLoader
            className="h-7 w-64"
            isLoading={
              !pool ||
              pool?.poolAssets.some((asset) =>
                asset.amount.currency.coinDenom.startsWith("ibc")
              )
            }
          >
            <h5>{`Pool #${pool?.id} : ${pool?.poolAssets
              .map((asset) => asset.amount.currency.coinDenom)
              .join(" / ")}`}</h5>
          </MetricLoader>
        }
        titleButtons={[
          {
            label: "Add / Remove Liquidity",
            onClick: () => setShowManageLiquidityDialog(true),
          },
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
              <div className="flex gap-3">
                <h5>Liquidity Mining</h5>
                {superfluid && superfluid !== "not-superfluid-pool" && (
                  <div className="bg-superfluid rounded-full px-4 py-1 text-xs md:text-base">
                    Superfluid Staking Enabled
                  </div>
                )}
              </div>
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
            queryOsmosis.queryIncentivizedPools.isIncentivized(pool.id) && (
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
                      apr={queryOsmosis.queryIncentivizedPools
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
                        queryOsmosis.queryIncentivizedPools.isAprFetching
                      }
                      isSuperfluid={
                        superfluid &&
                        superfluid !== "not-superfluid-pool" &&
                        guages &&
                        i === guages.length - 1
                      }
                    />
                  ))}
                </div>
              </>
            )}
        </div>
        {superfluid && superfluid !== "not-superfluid-pool" && (
          <div className="max-w-container mx-auto p-10 flex flex-col gap-4">
            <h5>Superfluid Staking</h5>
            <div className="w-full p-0.5 rounded-xl bg-superfluid">
              <div className="flex flex-col w-full gap-1 bg-card rounded-xl py-5 px-7">
                <div className="flex place-content-between text-subtitle1">
                  <span>My Superfluid Validator</span>
                  <span>My Superfluid Delegation</span>
                </div>
                <hr className="my-3 text-white-faint" />
                <div className="flex place-content-between">
                  <div className="flex gap-3">
                    <div className="rounded-full border border-enabledGold w-14 h-14 p-1 flex shrink-0">
                      <img
                        className="rounded-full"
                        alt="validator image"
                        src={superfluid.validatorImgSrc}
                      />
                    </div>
                    <div className="flex flex-col place-content-evenly">
                      <span className="text-lg text-white-high">
                        {superfluid.validatorName}
                      </span>
                      <span className="text-sm text-iconDefault">
                        Commission - {superfluid.validatorCommission.toString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h6 className="text-white-high">
                      ~
                      {superfluid.delegation
                        .maxDecimals(2)
                        .trim(true)
                        .toString()}
                    </h6>
                    <span className="float-right text-sm text-iconDefault">
                      ~{superfluid.apr.toString()} APR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-container mx-auto p-10">
          <h6>My Bondings</h6>
          <Table<
            BaseCell & {
              duration: Duration;
              amount: CoinPretty;
              apr?: RatePretty;
              lockIds: string[];
              isSuperfluidDuration: boolean;
            }
          >
            className="w-full my-5"
            columnDefs={[
              {
                display: "Unbonding Duration",
                displayCell:
                  superfluid && superfluid !== "not-superfluid-pool"
                    ? ({ value, isSuperfluidDuration }) => (
                        <div className="flex gap-3">
                          <span>{value ?? ""}</span>
                          {isSuperfluidDuration && (
                            <Image
                              alt="superfluid"
                              src="/icons/superfluid-osmo.svg"
                              height={20}
                              width={20}
                            />
                          )}
                        </div>
                      )
                    : undefined,
              },
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
              userLockedAssets?.map((lockedAsset, index) => [
                {
                  value: lockedAsset.duration.humanize(),
                  isSuperfluidDuration:
                    index === (userLockedAssets?.length ?? 0) - 1,
                }, // Unbonding Duration
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

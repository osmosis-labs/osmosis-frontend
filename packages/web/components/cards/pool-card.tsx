import { ObservablePool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { useStore } from "../../stores";
import { PoolAssetsIcon } from "../assets";
import { MetricLoader } from "../loaders";

export const PoolCard: FunctionComponent<{
  pool: ObservablePool;
  isMyPool: boolean;
}> = observer(({ pool, isMyPool }) => {
  const { chainStore, queriesOsmosisStore, priceStore, accountStore } =
    useStore();
  const router = useRouter();
  const chainInfo = chainStore.osmosis;
  const accountInfo = accountStore.getAccount(chainStore.osmosis.chainId);
  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);

  const apr = queryOsmosis.queryIncentivizedPools.computeMostAPY(
    pool.id,
    priceStore,
    priceStore.getFiatCurrency("usd")!
  );

  const poolLiquidity = pool.computeTotalValueLocked(
    priceStore,
    priceStore.getFiatCurrency("usd")!
  );

  const bondedShareRatio =
    queryOsmosis.queryGammPoolShare.getLockedGammShareRatio(
      accountInfo.bech32Address,
      pool.id
    );
  const bonded = poolLiquidity
    .mul(bondedShareRatio.moveDecimalPointLeft(2))
    .toString();

  return (
    <div
      className="px-[1.875rem] pt-8 pb-6 bg-card rounded-2xl cursor-pointer hover:ring-1 hover:ring-enabledGold"
      onClick={() => router.push(`/pools/${pool.id}`)}
    >
      <div className="flex items-center">
        <PoolAssetsIcon assets={pool.poolAssets} size="md" />
        <div className="ml-6 flex flex-col">
          <h5>
            {pool.poolAssets.length >= 3
              ? `${pool.poolAssets.length} Token Pool`
              : pool.poolAssets
                  .map((asset) => asset.amount.currency.coinDenom)
                  .join(" / ")}
          </h5>
          <div className="subtitle2 text-white-mid">{`Pool #${pool.id}`}</div>
        </div>
      </div>
      <div className="mt-5 mb-3 w-full bg-secondary-200 h-[1px]" />
      <div className="flex flex-wrap gap-x-8">
        <div className="flex flex-col">
          <div className="subtitle2 text-white-disabled">APR</div>
          <MetricLoader
            isLoading={queryOsmosis.queryIncentivizedPools.isAprFetching}
          >
            <div className="mt-0.5 subtitle1 text-white-high">{`${apr.toString()}%`}</div>
          </MetricLoader>
        </div>
        <div className="flex flex-col">
          <div className="subtitle2 text-white-disabled">Pool Liquidity</div>
          <MetricLoader
            isLoading={poolLiquidity.toDec().isZero()}
            className="w-[6.5rem]"
          >
            <div className="mt-0.5 subtitle1 text-white-high">
              {poolLiquidity.toString()}
            </div>
          </MetricLoader>
        </div>
        <div className="flex flex-col">
          <div className="subtitle2 text-white-disabled">
            {isMyPool ? "Bonded" : "Fees"}
          </div>
          {isMyPool ? (
            <MetricLoader isLoading={poolLiquidity.toDec().isZero()}>
              <div className="mt-0.5 subtitle1 text-white-high">
                {bonded.toString()}
              </div>
            </MetricLoader>
          ) : (
            <div className="mt-0.5 subtitle1 text-white-high">
              {pool.swapFee.toString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

import { ObservableQueryPool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import { useDeterministicIntegerFromString } from "../../hooks";
import { useStore } from "../../stores";
import { PoolCardBase, PoolCardIconBackgroundColors } from "./base";
import { StatLabelValue } from "./stat-label-value";

export const IncentivizedPoolCard: FunctionComponent<{
  pool: ObservableQueryPool;
}> = observer(({ pool }) => {
  const { chainStore, queriesStore, priceStore } = useStore();

  const chainInfo = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainInfo.chainId).osmosis!;

  const router = useRouter();

  const deterministicInteger = useDeterministicIntegerFromString(pool.id);

  const poolTVL = pool.computeTotalValueLocked(priceStore);

  const apr = queryOsmosis.queryIncentivizedPools.computeMostAPY(
    pool.id,
    priceStore
  );

  return (
    <PoolCardBase
      title={`Pool #${pool.id}`}
      subtitle={pool.poolAssets
        .map((asset) => asset.amount.currency.coinDenom)
        .join("/")}
      icon={<Image alt="OSMO" src="/icons/OSMO.svg" width={40} height={40} />}
      iconBackgroundColor={
        PoolCardIconBackgroundColors[
          deterministicInteger % PoolCardIconBackgroundColors.length
        ]
      }
      onClick={() => {
        router.push(`/pool/${pool.id}`);
      }}
    >
      <div className="flex flex-row">
        <StatLabelValue label="APR" value={apr.toString() + "%"} />
        <div className="w-[1px] mx-[1.25rem] bg-enabledGold" />
        <StatLabelValue label="Liquidity" value={poolTVL.toString()} />
      </div>
    </PoolCardBase>
  );
});

import React, { FunctionComponent, useMemo } from "react";
import { ObservablePool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PoolCardBase, PoolCardIconBackgroundColors } from "./base";
import Image from "next/image";
import { useDeterministicIntegerFromString } from "../../hooks";
import { StatLabelValue } from "./stat-label-value";
import { useRouter } from "next/router";

export const IncentivizedPoolCard: FunctionComponent<{
  pool: ObservablePool;
}> = observer(({ pool }) => {
  const { chainStore, queriesOsmosisStore, priceStore } = useStore();

  const chainInfo = chainStore.getChain("osmosis");
  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);

  const router = useRouter();

  const deterministicInteger = useDeterministicIntegerFromString(pool.id);

  const poolTVL = pool.computeTotalValueLocked(
    priceStore,
    priceStore.getFiatCurrency("usd")!
  );

  const apr = queryOsmosis.queryIncentivizedPools.computeMostAPY(
    pool.id,
    priceStore,
    priceStore.getFiatCurrency("usd")!
  );

  return (
    <PoolCardBase
      title={`Pool #${pool.id}`}
      subtitle={pool.poolAssets
        .map((asset) => asset.amount.currency.coinDenom)
        .join("/")}
      icon={<Image src="/icons/OSMO.svg" width={40} height={40} />}
      iconBackgroundColor={
        PoolCardIconBackgroundColors[
          deterministicInteger % PoolCardIconBackgroundColors.length
        ]
      }
      onClick={() => {
        router.push(`/pools/${pool.id}`);
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

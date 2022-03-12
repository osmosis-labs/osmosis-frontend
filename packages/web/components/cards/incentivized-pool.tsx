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
  const store = useStore();
  const router = useRouter();
  const deterministicInteger = useDeterministicIntegerFromString(pool.id);

  let poolTVL: string | undefined;
  let apr: string | undefined;

  if (store) {
    const { chainStore, queriesOsmosisStore, priceStore } = store;
    const chainInfo = chainStore.osmosis;
    const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
    const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

    poolTVL = pool.computeTotalValueLocked(priceStore, fiat).toString();

    apr = queryOsmosis.queryIncentivizedPools
      .computeMostAPY(pool.id, priceStore, fiat)
      .toString();
  }

  return (
    <PoolCardBase
      title={`Pool #${pool.id}`}
      subtitle={pool.poolAssets
        .map((asset) => asset.amount.currency.coinDenom)
        .join("/")}
      icon={<Image alt="" src="/icons/OSMO.svg" width={40} height={40} />}
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
        <StatLabelValue label="APR" value={apr ?? "0" + "%"} />
        <div className="w-[1px] mx-[1.25rem] bg-enabledGold" />
        <StatLabelValue label="Liquidity" value={poolTVL ?? "$0"} />
      </div>
    </PoolCardBase>
  );
});

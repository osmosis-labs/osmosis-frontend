import { FunctionComponent } from "react";
import { ObservablePool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PoolCardBase, PoolCardIconBackgroundColors } from "./base";
import Image from "next/image";
import { useDeterministicIntegerFromString } from "../../hooks";
import { StatLabelValue } from "./stat-label-value";
import { useRouter } from "next/router";

export const MyPools: FunctionComponent<{
  pool: ObservablePool;
}> = observer(({ pool }) => {
  const { chainStore, queriesOsmosisStore, priceStore, accountStore } =
    useStore();

  const chainInfo = chainStore.getChain("osmosis");
  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
  const account = accountStore.getAccount(chainInfo.chainId);

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

  const shareRatio = queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
    account.bech32Address,
    pool.id
  );
  const lockedShareRatio =
    queryOsmosis.queryGammPoolShare.getLockedGammShareRatio(
      account.bech32Address,
      pool.id
    );
  const myLiquidity = poolTVL.mul(shareRatio);
  const myLockedAmount = poolTVL.mul(lockedShareRatio);

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
      <div className="flex flex-col">
        <div className="flex gap-5">
          <StatLabelValue label="Pool Liquidity" value={poolTVL.toString()} />
          <StatLabelValue label="APR" value={apr.toString() + "%"} />
        </div>
        <div className="border-b border-enabledGold mt-4 mb-4 max-w-[15.5rem]" />
        <div className="flex gap-5">
          <StatLabelValue label="My Liquidity" value={myLiquidity.toString()} />
          <StatLabelValue
            label="My Bonded Amount"
            value={myLockedAmount.toString()}
          />
        </div>
      </div>
    </PoolCardBase>
  );
});

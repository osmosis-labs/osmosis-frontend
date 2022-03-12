import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { PricePretty } from "@keplr-wallet/unit";
import { ObservablePool } from "@osmosis-labs/stores";
import { useStore } from "../../stores";
import { PoolCardBase, PoolCardIconBackgroundColors } from "./base";
import { useDeterministicIntegerFromString } from "../../hooks";
import { StatLabelValue } from "./stat-label-value";

export const MyPoolCard: FunctionComponent<{
  pool: ObservablePool;
}> = observer(({ pool }) => {
  const router = useRouter();
  const store = useStore();
  const deterministicInteger = useDeterministicIntegerFromString(pool.id);

  let poolTVL: PricePretty | undefined;
  let apr: string | undefined;
  let myLiquidity: PricePretty | undefined;
  let myLockedAmount: PricePretty | undefined;

  if (store) {
    const { chainStore, queriesOsmosisStore, priceStore, accountStore } = store;

    const chainInfo = chainStore.getChain(chainStore.osmosis.chainId);
    const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
    const account = accountStore.getAccount(chainInfo.chainId);
    const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

    const shareRatio = queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
      account.bech32Address,
      pool.id
    );
    const lockedShareRatio =
      queryOsmosis.queryGammPoolShare.getLockedGammShareRatio(
        account.bech32Address,
        pool.id
      );

    poolTVL = pool.computeTotalValueLocked(priceStore, fiat);

    apr = queryOsmosis.queryIncentivizedPools
      .computeMostAPY(pool.id, priceStore, fiat)
      .toString();

    myLiquidity = poolTVL.mul(shareRatio);
    myLockedAmount = poolTVL.mul(lockedShareRatio);
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
      <div className="flex flex-col">
        <div className="flex gap-5">
          <StatLabelValue
            label="Pool Liquidity"
            value={poolTVL?.toString() ?? "$0"}
          />
          <StatLabelValue label="APR" value={apr ?? "0" + "%"} />
        </div>
        <div className="border-b border-enabledGold mt-4 mb-4 max-w-[15.5rem]" />
        <div className="flex gap-5">
          <StatLabelValue
            label="My Liquidity"
            value={myLiquidity?.toString() ?? "$0"}
          />
          <StatLabelValue
            label="My Bonded Amount"
            value={myLockedAmount?.toString() ?? "$0"}
          />
        </div>
      </div>
    </PoolCardBase>
  );
});

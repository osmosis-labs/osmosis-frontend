import { ObservablePool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { useStore } from "../../stores";
import { useDeterministicIntegerFromString } from "../../hooks";
import classNames from "classnames";

const poolCardIconBackgroundColorsToTailwindBgImage = {
  socialLive: "bg-gradients-socialLive",
  greenBeach: "bg-gradients-greenBeach",
  kashmir: "bg-gradients-kashmir",
  frost: "bg-gradients-frost",
  cherry: "bg-gradients-cherry",
  sunset: "bg-gradients-sunset",
  orangeCoral: "bg-gradients-orangeCoral",
  pinky: "bg-gradients-pinky",
} as const;

const PoolCardIconBackgroundColors: (keyof typeof poolCardIconBackgroundColorsToTailwindBgImage)[] =
  [
    "socialLive",
    "greenBeach",
    "kashmir",
    "frost",
    "cherry",
    "sunset",
    "orangeCoral",
    "pinky",
  ];

export const PoolCard: FunctionComponent<{
  pool: ObservablePool;
}> = observer(({ pool }) => {
  const { chainStore, queriesOsmosisStore, priceStore, accountStore } =
    useStore();

  const chainInfo = chainStore.osmosis;
  const accountInfo = accountStore.getAccount(chainStore.osmosis.chainId);
  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);

  const router = useRouter();

  const lockedShareRatio =
    queryOsmosis.queryGammPoolShare.getLockedGammShareRatio(
      accountInfo.bech32Address,
      pool.id
    );

  const actualLockedShareRatio = lockedShareRatio.moveDecimalPointLeft(2);

  const poolTVL = pool.computeTotalValueLocked(
    priceStore,
    priceStore.getFiatCurrency("usd")!
  );

  const apr = queryOsmosis.queryIncentivizedPools.computeMostAPY(
    pool.id,
    priceStore,
    priceStore.getFiatCurrency("usd")!
  );

  const deterministicInteger = useDeterministicIntegerFromString(pool.id);

  return (
    <div
      className="px-[1.875rem] pt-8 pb-6 bg-card rounded-2xl cursor-pointer hover:ring-1 hover:ring-enabledGold"
      onClick={() => router.push(`/pools/${pool.id}`)}
    >
      <div className="relative flex items-center">
        <div
          className={
            "absolute z-10 w-[4.125rem] h-[4.125rem] rounded-full border-[1px] bg-card border-enabledGold flex items-center justify-center"
          }
        >
          {pool.poolAssets[0].amount.currency.coinImageUrl ? (
            <Image
              src={pool.poolAssets[0].amount.currency.coinImageUrl}
              alt={pool.poolAssets[0].amount.currency.coinDenom}
              width={54}
              height={54}
            />
          ) : (
            <div
              className={classNames(
                "w-[54px] h-[54px] bg-blue rounded-full flex items-center justify-center",
                poolCardIconBackgroundColorsToTailwindBgImage[
                  PoolCardIconBackgroundColors[
                    deterministicInteger % PoolCardIconBackgroundColors.length
                  ]
                ]
              )}
            >
              <Image
                src="/icons/OSMO.svg"
                alt="no token icon"
                width={40}
                height={40}
              />
            </div>
          )}
        </div>
        <div
          className={
            "ml-10 mr-6 w-[4.125rem] h-[4.125rem] rounded-full border-[1px] border-enabledGold shrink-0 flex items-center justify-center"
          }
        >
          {pool.poolAssets[1].amount.currency.coinImageUrl && (
            <Image
              src={pool.poolAssets[1].amount.currency.coinImageUrl}
              alt={pool.poolAssets[1].amount.currency.coinDenom}
              width={52}
              height={52}
            />
          )}
        </div>
        <div className="flex flex-col">
          <h5>
            {pool.poolAssets
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
          {queryOsmosis.queryIncentivizedPools.isAprFetching ? (
            <div className="relative overflow-hidden rounded-sm w-[3.75rem] h-4 bg-white-faint mt-[0.4375rem]">
              <div className="absolute left-0 -translate-x-[calc(-150%)] h-full w-1/2 bg-loading-bar animate-loading" />
            </div>
          ) : (
            <div className="mt-0.5 subtitle1 text-white-high">{`${apr.toString()}%`}</div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="subtitle2 text-white-disabled">Pool Liquidity</div>
          {poolTVL.toDec().isZero() ? (
            <div className="relative overflow-hidden rounded-sm w-[6.5rem] h-4 bg-white-faint mt-[0.4375rem]">
              <div className="absolute left-0 -translate-x-[calc(-150%)] h-full w-1/2 bg-loading-bar animate-loading" />
            </div>
          ) : (
            <div className="mt-0.5 subtitle1 text-white-high">
              {poolTVL.toString()}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="subtitle2 text-white-disabled">Bonded</div>
          {poolTVL.toDec().isZero() ? (
            <div className="relative overflow-hidden rounded-sm w-[3.75rem] h-4 bg-white-faint mt-[0.4375rem]">
              <div className="absolute left-0 -translate-x-[calc(-150%)] h-full w-1/2 bg-loading-bar animate-loading" />
            </div>
          ) : (
            <div className="mt-0.5 subtitle1 text-white-high">
              {poolTVL.mul(actualLockedShareRatio).toString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

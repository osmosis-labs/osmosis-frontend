import { AppCurrency } from "@keplr-wallet/types";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { getOsmoRoutedMultihopTotalSwapFee } from "@osmosis-labs/math";
import {
  RoutablePool,
  RouteWithInAmount,
  SplitTokenInQuote,
} from "@osmosis-labs/pools";
import { ChainStore } from "@osmosis-labs/stores";
import { useSingleton } from "@tippyjs/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { useStore } from "../../stores";
import { DenomImage } from "../assets";
import { Tooltip } from "../tooltip";
import { CustomClasses } from "../types";

function getCurrenciesFromPool(chainStore: ChainStore, pool: RoutablePool) {
  const chainInfo = chainStore.getChain(chainStore.osmosis.chainId);

  return [
    chainInfo.forceFindCurrency(pool.poolAssetDenoms[0]),
    chainInfo.forceFindCurrency(pool.poolAssetDenoms[1]),
  ];
}

function getPoolsWithDenomAndFee(
  chainStore: ChainStore,
  isMultihopDiscount: boolean,
  maxSwapFee: Dec,
  swapFeeSum: Dec,
  pool: RoutablePool
) {
  return {
    id: pool.id,
    currencies: getCurrenciesFromPool(chainStore, pool),
    fee: isMultihopDiscount
      ? Number(
          maxSwapFee
            .mul(pool.swapFee.quo(swapFeeSum))
            .mul(new Dec(100))
            .toString(3)
        ) + "%"
      : Number(pool.swapFee.mul(new Dec(100)).toString(3)) + "%",
  };
}

function reorderPathDenoms(
  startCurrency: AppCurrency,
  poolWithDenomAndFee: ReturnType<typeof getPoolsWithDenomAndFee>[]
) {
  let previousDenom = startCurrency.coinDenom;

  return poolWithDenomAndFee.map((pool) => {
    const previousDenomIndex = pool.currencies.findIndex(
      (denom) => denom.coinDenom.toLowerCase() === previousDenom.toLowerCase()
    );

    const nextDenoms =
      previousDenomIndex === -1
        ? pool.currencies
        : [
            pool.currencies[previousDenomIndex],
            pool.currencies[1 - previousDenomIndex],
          ];

    previousDenom = nextDenoms[1].coinDenom;

    return {
      ...pool,
      denoms: nextDenoms,
    };
  });
}

export const SplitTrade: FunctionComponent<{
  sendCurrency: AppCurrency;
  outCurrency: AppCurrency;
  split: SplitTokenInQuote["split"];
}> = ({ sendCurrency, outCurrency, split }) => {
  const t = useTranslation();

  const [showRouter, setShowRouter] = useState(false);
  const tokenInTotal = useMemo(() => {
    return split.reduce(
      (sum, { initialAmount }) => sum.add(new Dec(initialAmount)),
      new Dec(0)
    );
  }, [split]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h6 className="text-xs font-normal">{t("swap.autoRouter")}</h6>
        <button
          onClick={() => setShowRouter(!showRouter)}
          className="text-xs text-wosmongton-300"
        >
          {showRouter
            ? t("swap.autoRouterToggle.hide")
            : t("swap.autoRouterToggle.show")}
        </button>
      </div>

      {showRouter && (
        <div className="flex flex-col gap-2">
          {split.map((route) => (
            <TradeRoute
              key={route.pools.map(({ id }) => id).join()} // pool IDs are unique
              sendCurrency={sendCurrency}
              outCurrency={outCurrency}
              percentage={
                split.length > 1
                  ? new Dec(route.initialAmount)
                      .quoTruncate(tokenInTotal)
                      .toString()
                  : undefined
              }
              route={route}
              isMultihopOsmoFeeDiscount={route.multiHopOsmoDiscount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TradeRoute: FunctionComponent<{
  sendCurrency: AppCurrency;
  outCurrency: AppCurrency;
  percentage?: string;
  route: RouteWithInAmount;
  isMultihopOsmoFeeDiscount: boolean;
}> = observer(
  ({
    sendCurrency,
    outCurrency,
    percentage,
    route,
    isMultihopOsmoFeeDiscount,
  }) => {
    const { chainStore } = useStore();
    const { maxSwapFee, swapFeeSum } = getOsmoRoutedMultihopTotalSwapFee(
      route.pools
    );

    const poolsWithDenomAndFee = route?.pools.map((pool) =>
      getPoolsWithDenomAndFee(
        chainStore,
        isMultihopOsmoFeeDiscount,
        maxSwapFee,
        swapFeeSum,
        pool
      )
    );

    const poolsWithReorderedDenoms = reorderPathDenoms(
      sendCurrency,
      poolsWithDenomAndFee
    );

    return (
      <div className="flex items-center justify-between space-x-2 rounded-full bg-osmoverse-1000 px-1 py-1.5">
        <div className="flex gap-0.5 px-1">
          {percentage && (
            <span className="subtitle1 text-osmoverse-200">
              {new RatePretty(percentage).maxDecimals(0).toString()}
            </span>
          )}
          <div className="h-[24px] shrink-0">
            <DenomImage denom={sendCurrency} size={24} />
          </div>
        </div>

        <div
          className={classNames("flex w-full items-center justify-center", {
            "pl-3.5": Boolean(percentage),
          })}
        >
          <div className="relative flex w-full items-center gap-0.5">
            <Dots className="animate-[pulse_3s_ease-in-out_0.1s_infinite]" />
            <Dots className="animate-[pulse_3s_ease-in-out_0.4s_infinite]" />
            <Dots className="animate-[pulse_3s_ease-in-out_0.7s_infinite]" />
            <Dots className="animate-[pulse_3s_ease-in-out_1s_infinite]" />
          </div>

          {poolsWithReorderedDenoms && (
            <Routes pools={poolsWithReorderedDenoms} />
          )}
        </div>

        <div className="h-[24px] shrink-0">
          <DenomImage denom={outCurrency} size={24} />
        </div>
      </div>
    );
  }
);

const Dots: FunctionComponent<CustomClasses> = ({ className }) => (
  <hr
    className={classNames(
      "h-[1px] w-1/4 border-t-2 border-dashed border-t-wosmongton-400",
      className
    )}
  />
);

const Routes: FunctionComponent<{
  pools: ReturnType<typeof reorderPathDenoms>;
}> = ({ pools }) => {
  const t = useTranslation();

  /** Share same tippy instance to handle animation */
  const [source, target] = useSingleton();

  return (
    <>
      <Tooltip
        singleton={source}
        moveTransition="transform 0.4s cubic-bezier(0.7, -0.4, 0.4, 1.4)"
        content=""
      />
      <div className="absolute mx-4 flex w-full justify-evenly">
        {pools?.map(({ id, denoms, fee }, index) => (
          <Tooltip
            key={index}
            singleton={target}
            content={
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div className="flex">
                    <div className="h-[20px] w-[20px]">
                      <DenomImage denom={denoms[0]} size={20} />
                    </div>
                    <div className="-ml-3 h-[20px] w-[20px]">
                      <DenomImage denom={denoms[1]} size={20} />
                    </div>
                  </div>

                  <p className="space-x-1.5 text-base font-semibold">
                    <span>{denoms[0].coinDenom}</span>
                    <span className="text-osmoverse-400">/</span>
                    <span>{denoms[1].coinDenom}</span>
                  </p>
                </div>

                <div className="flex justify-center space-x-1 text-center text-xs font-medium">
                  <p className="w-full whitespace-nowrap rounded-md bg-osmoverse-800 py-0.5 px-1.5">
                    {t("swap.pool", { id })}
                  </p>
                  <p className="w-full whitespace-nowrap rounded-md bg-osmoverse-800 py-0.5 px-1.5">
                    {t("swap.routerTooltipFee")} {fee}
                  </p>
                </div>
              </div>
            }
          >
            <div className="flex items-center space-x-2 rounded-full bg-osmoverse-800 p-1 hover:bg-osmoverse-700">
              <div className="flex">
                <div className="h-[20px] w-[20px]">
                  <DenomImage denom={denoms[0]} size={20} />
                </div>
                <div className="-ml-3 h-[20px] w-[20px]">
                  <DenomImage denom={denoms[1]} size={20} />
                </div>
              </div>

              <p className="text-caption">{fee}</p>
            </div>
          </Tooltip>
        ))}
      </div>
    </>
  );
};

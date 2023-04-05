import { AppCurrency } from "@keplr-wallet/types";
import { Dec } from "@keplr-wallet/unit";
import { getOsmoRoutedMultihopTotalSwapFee } from "@osmosis-labs/math";
import { RoutablePool, RoutePathWithAmount } from "@osmosis-labs/pools";
import { useSingleton } from "@tippyjs/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { useStore } from "../../stores";
import { ChainStore } from "../../stores/chain";
import { DenomImage } from "../assets";
import { Tooltip } from "../tooltip";

function getDenomsFromPool(chainStore: ChainStore, pool: RoutablePool) {
  const chainInfo = chainStore.getChain(chainStore.osmosis.chainId);
  const firstDenom = chainInfo.forceFindCurrency(pool.poolAssets[0].denom);
  const secondDenom = chainInfo.forceFindCurrency(pool.poolAssets[1].denom);

  return [firstDenom, secondDenom];
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
    denoms: getDenomsFromPool(chainStore, pool),
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
    const previousDenomIndex = pool.denoms.findIndex(
      (denom) => denom.coinDenom.toLowerCase() === previousDenom.toLowerCase()
    );

    const nextDenoms =
      previousDenomIndex === -1
        ? pool.denoms
        : [
            pool.denoms[previousDenomIndex],
            pool.denoms[1 - previousDenomIndex],
          ];

    previousDenom = nextDenoms[1].coinDenom;

    return {
      ...pool,
      denoms: nextDenoms,
    };
  });
}

const TradeRoute: FunctionComponent<{
  sendCurrency: AppCurrency;
  outCurrency: AppCurrency;
  route: RoutePathWithAmount;
  isMultihopOsmoFeeDiscount: boolean;
}> = observer(
  ({ sendCurrency, outCurrency, route, isMultihopOsmoFeeDiscount }) => {
    const { chainStore } = useStore();

    const [showRouter, setShowRouter] = useState(false);

    const t = useTranslation();

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
          <div className="flex items-center justify-between space-x-2 rounded-full bg-osmoverse-1000 px-1 py-1.5">
            <div className="h-[24px] shrink-0">
              <DenomImage denom={sendCurrency} size={24} />
            </div>

            <div className="relative flex w-full items-center justify-center">
              <div className="relative flex w-full items-center gap-0.5">
                <Dots className="animate-[pulse_3s_ease-in-out_0s_infinite]" />
                <Dots className="animate-[pulse_3s_ease-in-out_0.5s_infinite]" />
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
        )}
      </div>
    );
  }
);

interface DotsProps {
  className?: string;
}

const Dots: FunctionComponent<DotsProps> = ({ className }) => (
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

export default TradeRoute;

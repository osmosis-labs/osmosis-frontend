import { AppCurrency } from "@keplr-wallet/types";
import { Dec } from "@keplr-wallet/unit";
import { Pool, RoutePathWithAmount } from "@osmosis-labs/pools";
import { useSingleton } from "@tippyjs/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-multi-lang";
import { useStore } from "../../stores";
import { ChainStore } from "../../stores/chain";
import { DenomImage } from "../assets";
import { Tooltip } from "../tooltip";

function getDenomsFromPool(chainStore: ChainStore, pool: Pool) {
  const chainInfo = chainStore.getChain(chainStore.osmosis.chainId);
  const firstDenom = chainInfo.forceFindCurrency(pool.poolAssets[0].denom);
  const secondDenom = chainInfo.forceFindCurrency(pool.poolAssets[1].denom);

  return [firstDenom, secondDenom];
}

function getPoolsWithDenomAndFee(chainStore: ChainStore, pool: Pool) {
  return {
    id: pool.id,
    denoms: getDenomsFromPool(chainStore, pool),
    fee: pool.swapFee.mul(new Dec(100)).toString(1) + "%",
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
  path: RoutePathWithAmount;
}> = observer(({ sendCurrency, outCurrency, path }) => {
  const { chainStore } = useStore();

  const [showRouter, setShowRouter] = useState(false);

  const t = useTranslation();
  /** Share same tippy instance to handle animation */
  const [source, target] = useSingleton();

  const poolsWithDenomAndFee = path?.pools.map((pool) =>
    getPoolsWithDenomAndFee(chainStore, pool)
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
          className="text-wosmongton-300 text-xs"
        >
          {showRouter
            ? t("swap.autoRouterToggle.hide")
            : t("swap.autoRouterToggle.show")}
        </button>
      </div>

      {showRouter && (
        <div className="flex items-center justify-between space-x-2 bg-osmoverse-1000 rounded-full px-1 py-1.5">
          <div className="shrink-0 h-[24px]">
            <DenomImage denom={sendCurrency} size={24} />
          </div>

          <div className="relative w-full flex items-center justify-center">
            <div className="relative w-full flex items-center space-x-1">
              <Dots className="animate-[pulse_3s_ease-in-out_0s_infinite]" />
              <Dots className="animate-[pulse_3s_ease-in-out_0.5s_infinite]" />
              <Dots className="animate-[pulse_3s_ease-in-out_0.7s_infinite]" />
              <Dots className="animate-[pulse_3s_ease-in-out_1s_infinite]" />
            </div>

            <Tooltip
              singleton={source}
              moveTransition="transform 0.4s cubic-bezier(0.7, -0.4, 0.4, 1.4)"
              content=""
            />

            <div className="absolute flex mx-4 w-full justify-evenly">
              {poolsWithReorderedDenoms?.map(({ id, denoms, fee }, index) => (
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
                          <div className="h-[20px] w-[20px] -ml-3">
                            <DenomImage denom={denoms[1]} size={20} />
                          </div>
                        </div>

                        <p className="font-semibold text-base space-x-1.5">
                          <span>{denoms[0].coinDenom}</span>
                          <span className="text-osmoverse-400">/</span>
                          <span>{denoms[1].coinDenom}</span>
                        </p>
                      </div>

                      <div className="flex space-x-1 justify-center text-xs font-medium text-center">
                        <p className="bg-osmoverse-800 py-0.5 px-1.5 rounded-md w-full whitespace-nowrap">
                          {t("swap.pool", { id })}
                        </p>
                        <p className="bg-osmoverse-800 py-0.5 px-1.5 rounded-md w-full whitespace-nowrap">
                          {t("swap.routerTooltipFee")} {fee}
                        </p>
                      </div>
                    </div>
                  }
                >
                  <div className="p-1 rounded-full bg-osmoverse-800 hover:bg-osmoverse-700 flex items-center space-x-2">
                    <div className="flex">
                      <div className="h-[20px] w-[20px]">
                        <DenomImage denom={denoms[0]} size={20} />
                      </div>
                      <div className="h-[20px] w-[20px] -ml-3">
                        <DenomImage denom={denoms[1]} size={20} />
                      </div>
                    </div>

                    <p className="text-caption">{fee}</p>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>

          <div className="shrink-0 h-[24px]">
            <DenomImage denom={outCurrency} size={24} />
          </div>
        </div>
      )}
    </div>
  );
});

interface DotsProps {
  className?: string;
}

const Dots: FunctionComponent<DotsProps> = ({ className }) => (
  <hr
    className={classNames(
      "w-1/4 border-t-2 border-dashed border-t-wosmongton-400 h-[1px]",
      className
    )}
  />
);

export default TradeRoute;

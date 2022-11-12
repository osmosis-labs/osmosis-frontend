import { AppCurrency } from "@keplr-wallet/types";
import { Dec } from "@keplr-wallet/unit";
import { Pool } from "@osmosis-labs/pools";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useStore } from "../../stores";
import { ChainStore } from "../../stores/chain";
import { DenomImage } from "../denom";
import { Tooltip } from "../tooltip";
import { TradeRouteProps } from "./types";

function getDenomsFromPool(chainStore: ChainStore, pool: Pool) {
  const chainInfo = chainStore.getChain(chainStore.osmosis.chainId);
  const firstDenom = chainInfo.forceFindCurrency(pool.poolAssets[0].denom);
  const secondDenom = chainInfo.forceFindCurrency(pool.poolAssets[1].denom);

  return [firstDenom, secondDenom];
}

function getPoolsWithDenomAndFee(chainStore: ChainStore, pool: Pool) {
  return {
    denoms: getDenomsFromPool(chainStore, pool),
    fee: "%" + pool.swapFee.mul(new Dec(100)).toString(1),
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

const TradeRoute: FunctionComponent<TradeRouteProps> = observer(
  ({ sendCurrency, outCurrency, path }) => {
    const { chainStore } = useStore();

    const poolsWithDenomAndFee = path?.pools.map((pool) =>
      getPoolsWithDenomAndFee(chainStore, pool)
    );
    const poolsWithReorderedDenoms = reorderPathDenoms(
      sendCurrency,
      poolsWithDenomAndFee
    );

    return (
      <div className="space-y-3">
        <h6 className="body2">Auto Router</h6>

        <div className="flex items-center justify-between space-x-2">
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

            <div className="absolute flex mx-4 space-x-6">
              {poolsWithReorderedDenoms?.map(({ denoms, fee }, index) => (
                <Tooltip
                  key={index}
                  content={`${denoms[0].coinDenom}/${denoms[1].coinDenom} ${fee} pool`}
                >
                  <div className="p-1 rounded-md bg-osmoverse-700 flex items-center space-x-1">
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
      "w-1/4 border-t-4 border-dotted border-t-osmoverse-300 h-[1px]",
      className
    )}
  />
);

export default TradeRoute;

import { AppCurrency, Currency } from "@keplr-wallet/types";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { SplitTokenInQuote } from "@osmosis-labs/pools";
import { useSingleton } from "@tippyjs/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { UseDisclosureReturn } from "~/hooks";
import { useStore } from "~/stores";

import { Tooltip } from "../tooltip";
import { CustomClasses } from "../types";

type Route = SplitTokenInQuote["split"][0];

export const SplitRoute: FunctionComponent<
  { split: SplitTokenInQuote["split"] } & Pick<
    UseDisclosureReturn,
    "isOpen" | "onToggle"
  >
> = ({ split, isOpen: showRouter, onToggle }) => {
  const t = useTranslation();

  const tokenInTotal = split.reduce(
    (sum, { initialAmount }) => sum.add(new Dec(initialAmount)),
    new Dec(0)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="caption">{t("swap.autoRouter")}</span>
        <button
          onClick={() => onToggle()}
          className="caption text-wosmongton-300"
        >
          {showRouter
            ? t("swap.autoRouterToggle.hide")
            : t("swap.autoRouterToggle.show")}
        </button>
      </div>

      {showRouter && (
        <div className="flex flex-col gap-2">
          {split.map((route) => {
            // round to whole square numbers
            const percentage =
              split.length > 1
                ? new RatePretty(
                    new Dec(route.initialAmount)
                      .quo(tokenInTotal)
                      .mul(new Dec(100))
                      .round()
                  ).moveDecimalPointLeft(2)
                : undefined;

            return (
              <Route
                key={route.pools.map(({ id }) => id).join()} // pool IDs are unique
                percentage={percentage}
                route={route}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const Route: FunctionComponent<{
  percentage?: RatePretty;
  route: Route;
}> = observer(({ percentage, route }) => {
  const { chainStore } = useStore();
  const osmosisChain = chainStore.getChain(chainStore.osmosis.chainId);

  const sendCurrency = osmosisChain.findCurrency(route.tokenInDenom);
  const outCurrency = osmosisChain.findCurrency(
    route.tokenOutDenoms[route.tokenOutDenoms.length - 1]
  );

  if (!sendCurrency || !outCurrency) return null;

  return (
    <div className="flex items-center justify-between space-x-2 rounded-full bg-osmoverse-1000 p-1">
      <div className="flex shrink-0 items-center text-center">
        {percentage && (
          <span className="subtitle1 px-2 text-osmoverse-200">
            {percentage.maxDecimals(2).toString()}
          </span>
        )}
        <div className="h-7">
          <DenomImage currency={sendCurrency} size={28} />
        </div>
      </div>

      <div
        className={classNames(
          "relative flex w-full items-center justify-center",
          {
            // "pl-3.5": Boolean(percentage),
          }
        )}
      >
        <div className="relative flex w-full items-center gap-0.5">
          <Dots className="animate-[pulse_3s_ease-in-out_0.1s_infinite]" />
          <Dots className="animate-[pulse_3s_ease-in-out_0.4s_infinite]" />
          <Dots className="animate-[pulse_3s_ease-in-out_0.7s_infinite]" />
          <Dots className="animate-[pulse_3s_ease-in-out_1s_infinite]" />
        </div>

        <Pools {...route} />
      </div>

      <div className="h-7 shrink-0">
        <DenomImage currency={outCurrency} size={28} />
      </div>
    </div>
  );
});

const Dots: FunctionComponent<CustomClasses> = ({ className }) => (
  <hr
    className={classNames(
      "h-[1px] w-1/4 border-t-2 border-dashed border-t-wosmongton-400",
      className
    )}
  />
);

const Pools: FunctionComponent<Route> = observer(
  ({ pools, tokenInDenom, tokenOutDenoms, effectiveSwapFees }) => {
    const { chainStore } = useStore();
    const t = useTranslation();
    /** Share same tippy instance to handle animation */
    const [source, target] = useSingleton();

    const osmosisChain = chainStore.getChain(chainStore.osmosis.chainId);

    return (
      <>
        <Tooltip
          singleton={source}
          moveTransition="transform 0.4s cubic-bezier(0.7, -0.4, 0.4, 1.4)"
          content=""
        />
        <div className="absolute mx-4 flex w-full justify-evenly">
          {pools.map(({ id }, index) => {
            const fee = new RatePretty(effectiveSwapFees[index]);
            const inCurrency =
              index === 0
                ? osmosisChain.findCurrency(tokenInDenom)
                : osmosisChain.findCurrency(tokenOutDenoms[index - 1]);
            const outCurrency = osmosisChain.findCurrency(
              tokenOutDenoms[index]
            );
            if (!inCurrency || !outCurrency) return null;

            const currencies = [inCurrency, outCurrency];

            return (
              <Tooltip
                key={id}
                singleton={target}
                content={
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <div className="flex">
                        <div className="h-[20px] w-[20px]">
                          <DenomImage currency={currencies[0]} size={20} />
                        </div>
                        <div className="-ml-3 h-[20px] w-[20px]">
                          <DenomImage currency={currencies[1]} size={20} />
                        </div>
                      </div>

                      <p className="space-x-1.5 text-base font-semibold">
                        <span>{currencies[0].coinDenom}</span>
                        <span className="text-osmoverse-400">/</span>
                        <span>{currencies[1].coinDenom}</span>
                      </p>
                    </div>

                    <div className="flex justify-center space-x-1 text-center text-xs font-medium">
                      <p className="w-full whitespace-nowrap rounded-md bg-osmoverse-800 py-0.5 px-1.5">
                        {t("swap.pool", { id })}
                      </p>
                      <p className="w-full whitespace-nowrap rounded-md bg-osmoverse-800 py-0.5 px-1.5">
                        {t("swap.routerTooltipFee")}{" "}
                        {fee.maxDecimals(2).toString()}
                      </p>
                    </div>
                  </div>
                }
              >
                <div className="flex items-center space-x-2 rounded-full bg-osmoverse-800 p-1 hover:bg-osmoverse-700">
                  <div className="flex">
                    <div className="h-[20px] w-[20px]">
                      <DenomImage currency={currencies[0]} size={20} />
                    </div>
                    <div className="-ml-3 h-[20px] w-[20px]">
                      <DenomImage currency={currencies[1]} size={20} />
                    </div>
                  </div>

                  {pools.length < 4 && (
                    <p className="text-caption">
                      {fee.maxDecimals(1).toString()}
                    </p>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </>
    );
  }
);

const DenomImage: FunctionComponent<{
  currency: AppCurrency | Currency;
  /** Size in px */
  size?: number;
}> = ({ currency, size = 20 }) =>
  currency.coinImageUrl ? (
    <Image
      src={currency.coinImageUrl}
      alt="token icon"
      width={size}
      height={size}
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-osmoverse-700"
    >
      {currency.coinDenom[0].toUpperCase()}
    </div>
  );

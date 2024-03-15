import { AppCurrency, Currency } from "@keplr-wallet/types";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { useSingleton } from "@tippyjs/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useMemo } from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { CustomClasses } from "~/components/types";
import { useTranslation } from "~/hooks";
import { UseDisclosureReturn, useWindowSize } from "~/hooks";
import { usePreviousWhen } from "~/hooks/use-previous-when";
import { useStore } from "~/stores";
import type { RouterOutputs } from "~/utils/trpc";

type Split =
  RouterOutputs["local"]["quoteRouter"]["routeTokenOutGivenIn"]["split"];
type Route = Split[number];
type RouteWithPercentage = Route & { percentage?: RatePretty };

export const SplitRoute: FunctionComponent<
  { split: Split } & Pick<UseDisclosureReturn, "isOpen" | "onToggle"> & {
      isLoading?: boolean;
    }
> = ({ split, isOpen, onToggle, isLoading = false }) => {
  const { t } = useTranslation();

  // hold on to a ref of the last split to use while we're loading the next one
  // this prevents whiplash in the UI
  const latestSplitRef = usePreviousWhen(split, (s) => s.length > 0);

  split = isLoading ? latestSplitRef ?? split : split;

  const tokenInTotal = useMemo(
    () =>
      split.reduce(
        (sum, { initialAmount }) => sum.add(new Dec(initialAmount)),
        new Dec(0)
      ),
    [split]
  );

  const splitWithPercentages: RouteWithPercentage[] = useMemo(() => {
    if (split.length === 1) return split;

    return split.map((route) => {
      const percentage = new RatePretty(
        new Dec(route.initialAmount).quo(tokenInTotal).mul(new Dec(100))
      ).moveDecimalPointLeft(2);

      return {
        ...route,
        percentage,
      };
    });
  }, [split, tokenInTotal]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="caption">{t("swap.autoRouter")}</span>
        <button
          onClick={onToggle}
          disabled={isLoading}
          className="caption text-wosmongton-300"
        >
          {isOpen
            ? t("swap.autoRouterToggle.hide")
            : t("swap.autoRouterToggle.show")}
        </button>
      </div>

      {isOpen && !isLoading && (
        <div className="flex flex-col gap-2">
          {splitWithPercentages.map((route) => (
            <RouteLane
              key={route.pools.map(({ id }) => id).join()} // pool IDs are unique
              route={route}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RouteLane: FunctionComponent<{
  route: RouteWithPercentage;
}> = observer(({ route }) => {
  const { chainStore } = useStore();
  const osmosisChain = chainStore.getChain(chainStore.osmosis.chainId);

  const sendCurrency = osmosisChain.findCurrency(route.tokenInDenom);
  const lastOutCurrency = osmosisChain.findCurrency(
    route.tokenOutDenoms[route.tokenOutDenoms.length - 1]
  );

  if (!sendCurrency || !lastOutCurrency) return null;

  return (
    <div className="flex items-center justify-between space-x-2 rounded-full bg-osmoverse-1000 p-1">
      <div className="flex shrink-0 items-center text-center">
        {route.percentage && (
          <span className="subtitle1 px-2 text-osmoverse-200">
            {route.percentage.inequalitySymbol(false).maxDecimals(0).toString()}
          </span>
        )}
        <div className="h-7">
          <DenomImage currency={sendCurrency} size={28} />
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center">
        <div className="relative flex w-full items-center gap-1">
          <Dots className="animate-[pulse_3s_ease-in-out_0.1s_infinite]" />
          <Dots className="animate-[pulse_3s_ease-in-out_0.4s_infinite]" />
          <Dots className="animate-[pulse_3s_ease-in-out_0.7s_infinite]" />
          <Dots className="animate-[pulse_3s_ease-in-out_1s_infinite]" />
        </div>

        <Pools {...route} />
      </div>

      <div className="h-7 shrink-0">
        <DenomImage currency={lastOutCurrency} size={28} />
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

const Pools: FunctionComponent<Route> = observer(({ pools }) => {
  const { isMobile } = useWindowSize();
  const router = useRouter();

  const { t } = useTranslation();
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
        {pools.map(
          (
            {
              id,
              type,
              inCurrency,
              outCurrency,
              spreadFactor,
              dynamicSpreadFactor,
            },
            index
          ) => {
            if (!inCurrency || !outCurrency) return null;

            return (
              <Tooltip
                key={`${id}${index}`}
                singleton={target}
                content={
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <div className="flex">
                        <div className="h-[20px] w-[20px]">
                          <DenomImage currency={inCurrency} size={20} />
                        </div>
                        <div className="-ml-3 h-[20px] w-[20px]">
                          <DenomImage currency={outCurrency} size={20} />
                        </div>
                      </div>

                      <p className="space-x-1.5 text-base font-semibold">
                        <span>{inCurrency.coinDenom}</span>
                        <span className="text-osmoverse-400">/</span>
                        <span>{outCurrency.coinDenom}</span>
                      </p>
                    </div>

                    <div className="flex justify-center space-x-1 text-center text-xs font-medium">
                      <p className="w-full whitespace-nowrap rounded-md bg-osmoverse-800 py-0.5 px-1.5">
                        {t("swap.pool", { id })}
                      </p>

                      {spreadFactor && (
                        <p className="w-full whitespace-nowrap rounded-md bg-osmoverse-800 py-0.5 px-1.5">
                          {type === "concentrated"
                            ? t("swap.routerTooltipSpreadFactor")
                            : t("swap.routerTooltipFee")}{" "}
                          {dynamicSpreadFactor
                            ? t("swap.dynamicSpreadFactor")
                            : spreadFactor.maxDecimals(2).toString()}
                        </p>
                      )}
                    </div>
                    {(type === "concentrated" ||
                      type === "stable" ||
                      type === "cosmwasm-transmuter" ||
                      type === "cosmwasm-astroport-pcl" ||
                      type === "cosmwasm") && (
                      <div className="flex items-center justify-center gap-1 space-x-1 text-center text-xs font-medium text-ion-400">
                        {type === "concentrated" && (
                          <Icon id="lightning-small" height={16} width={16} />
                        )}
                        {(type === "stable" ||
                          type === "cosmwasm-transmuter") && (
                          <Image
                            alt="stable-pool"
                            src="/icons/stableswap-pool.svg"
                            width={16}
                            height={16}
                          />
                        )}
                        {type === "cosmwasm" && (
                          <Icon id="setting" height={16} width={16} />
                        )}
                        {t(
                          type === "concentrated"
                            ? "clPositions.supercharged"
                            : type === "cosmwasm-transmuter"
                            ? "pool.transmuter"
                            : type === "cosmwasm-astroport-pcl"
                            ? "Astroport PCL"
                            : type === "cosmwasm"
                            ? "pool.custom"
                            : "pool.stableswapEnabled"
                        )}
                      </div>
                    )}
                  </div>
                }
              >
                <button
                  className="flex items-center space-x-2 rounded-full bg-osmoverse-800 p-1 hover:bg-osmoverse-700"
                  onClick={() => {
                    if (!isMobile) router.push("/pool/" + id);
                  }}
                >
                  <div className="flex">
                    <div className="h-[20px] w-[20px]">
                      <DenomImage currency={inCurrency} />
                    </div>
                    <div className="-ml-3 h-[20px] w-[20px]">
                      <DenomImage currency={outCurrency} />
                    </div>
                  </div>

                  {pools.length < 4 &&
                    !isMobile &&
                    spreadFactor &&
                    !dynamicSpreadFactor && (
                      <p className="text-caption">
                        {spreadFactor.maxDecimals(1).toString()}
                      </p>
                    )}
                </button>
              </Tooltip>
            );
          }
        )}
      </div>
    </>
  );
});

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

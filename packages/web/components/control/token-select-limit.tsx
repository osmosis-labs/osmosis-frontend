import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useMemo, useState } from "react";

import { TokenSelectDrawerLimit } from "~/components/drawers/token-select-drawer-limit";
import { Disableable } from "~/components/types";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useWindowSize } from "~/hooks";
import { OrderDirection } from "~/hooks/limit-orders";
import { useCoinPrice } from "~/hooks/queries/assets/use-coin-price";
import type { SwapAsset } from "~/hooks/use-swap";
import { formatPretty } from "~/utils/formatter";

export interface TokenSelectLimitProps {
  dropdownOpen?: boolean;
  setDropdownOpen?: (value: boolean) => void;
  selectableAssets: SwapAsset[];
  baseAsset: SwapAsset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  quoteAsset: SwapAsset &
    Partial<{
      amount: CoinPretty;
      usdValue: PricePretty;
    }>;
  baseBalance: CoinPretty;
  quoteBalance: CoinPretty;
  onTokenSelect: (tokenDenom: string) => void;
  canSelectTokens?: boolean;
  orderDirection: OrderDirection;
}

export const TokenSelectLimit: FunctionComponent<
  TokenSelectLimitProps & Disableable
> = observer(
  ({
    dropdownOpen,
    setDropdownOpen,
    selectableAssets,
    onTokenSelect,
    canSelectTokens = true,
    baseAsset,
    quoteAsset,
    baseBalance,
    quoteBalance,
    disabled,
    orderDirection,
  }) => {
    const { isMobile } = useWindowSize();
    const router = useRouter();
    const { logEvent } = useAmplitudeAnalytics();

    // parent overrideable state
    const [isSelectOpenLocal, setIsSelectOpenLocal] = useState(false);
    const isSelectOpen =
      dropdownOpen === undefined ? isSelectOpenLocal : dropdownOpen;
    const setIsSelectOpen =
      setDropdownOpen === undefined ? setIsSelectOpenLocal : setDropdownOpen;

    const preSortedTokens = selectableAssets;

    const tokenSelectionAvailable =
      canSelectTokens && preSortedTokens.length >= 1;

    const onSelect = (tokenDenom: string) => {
      logEvent([
        EventName.Swap.dropdownAssetSelected,
        {
          tokenName: tokenDenom,
          isOnHome: router.pathname === "/",
          page: "Swap Page",
        },
      ]);
      onTokenSelect(tokenDenom);
    };

    const { price: baseCoinPrice, isLoading: isLoadingBasePrice } =
      useCoinPrice(baseBalance);
    const { price: quoteCoinPrice, isLoading: isLoadingQuotePrice } =
      useCoinPrice(quoteBalance);

    const baseFiatBalance = useMemo(
      () =>
        !isLoadingBasePrice && baseCoinPrice
          ? new PricePretty(DEFAULT_VS_CURRENCY, baseCoinPrice.mul(baseBalance))
          : new PricePretty(DEFAULT_VS_CURRENCY, 0),
      [baseCoinPrice, baseBalance, isLoadingBasePrice]
    );

    const quoteFiatBalance = useMemo(
      () =>
        !isLoadingQuotePrice && quoteCoinPrice
          ? new PricePretty(
              DEFAULT_VS_CURRENCY,
              quoteCoinPrice.mul(quoteBalance)
            )
          : new PricePretty(DEFAULT_VS_CURRENCY, 0),
      [quoteCoinPrice, quoteBalance, isLoadingQuotePrice]
    );

    const showBaseBalance = useMemo(
      () =>
        orderDirection === OrderDirection.Ask &&
        !baseFiatBalance.toDec().isZero(),
      [orderDirection, baseFiatBalance]
    );
    const showQuoteBalance = useMemo(
      () =>
        orderDirection === OrderDirection.Bid &&
        !quoteFiatBalance.toDec().isZero(),
      [orderDirection, quoteFiatBalance]
    );

    return (
      <div>
        <div className="align-center relative z-10 flex flex-row place-content-between items-center rounded-xl bg-osmoverse-850 py-5 px-3 md:justify-start">
          {baseAsset && (
            <div
              className={classNames(
                "flex items-center gap-2 text-left transition-opacity",
                tokenSelectionAvailable ? "cursor-pointer" : "cursor-default",
                {
                  "opacity-40": disabled,
                }
              )}
            >
              {baseAsset.coinImageUrl && (
                <div className="mr-1 h-[50px] w-[50px] shrink-0 rounded-full md:h-7 md:w-7">
                  <Image
                    src={baseAsset.coinImageUrl}
                    alt="token icon"
                    width={isMobile ? 30 : 50}
                    height={isMobile ? 30 : 50}
                    priority
                  />
                </div>
              )}
              <div className="flex flex-col">
                <div className="mr-2 flex items-center">
                  {isMobile || baseAsset.coinName.length > 6 ? (
                    <span className="text-h6">{baseAsset.coinName}</span>
                  ) : (
                    <h6>{baseAsset.coinName}</h6>
                  )}
                  <span className="md:caption ml-2 w-32 truncate text-h6 text-osmoverse-400">
                    {baseAsset.coinDenom}
                  </span>
                </div>
                {showBaseBalance && (
                  <div className="flex text-body1 text-osmoverse-300">
                    {formatPretty(baseFiatBalance)} available
                  </div>
                )}
              </div>
            </div>
          )}
          {tokenSelectionAvailable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (tokenSelectionAvailable) {
                  setIsSelectOpen(!isSelectOpen);
                }
              }}
              className="h-8 rounded-2xl bg-osmoverse-800 py-1 px-3 text-body2 text-wosmongton-200"
            >
              Change
            </button>
          )}
        </div>
        <div className="align-center relative z-0 -mt-5 flex place-content-between items-center rounded-xl bg-osmoverse-1000 py-5 px-3 pt-10 md:justify-start">
          {quoteAsset && (
            <div
              className={classNames(
                "flex items-center gap-2 text-left transition-opacity",
                tokenSelectionAvailable ? "cursor-pointer" : "cursor-default",
                {
                  "opacity-40": disabled,
                }
              )}
            >
              <span className="subtitle1 text-osmoverse-300">
                {orderDirection === OrderDirection.Bid ? "Pay with" : "Receive"}
              </span>
              {quoteAsset.coinImageUrl && (
                <div className="h-6 w-6 shrink-0 rounded-full md:h-7 md:w-7">
                  <Image
                    src={quoteAsset.coinImageUrl}
                    alt="token icon"
                    width={24}
                    height={24}
                    priority
                  />
                </div>
              )}
              <div className="flex">
                <span className="md:caption subtitle1 w-32 truncate">
                  {quoteAsset.coinDenom}
                </span>
              </div>
            </div>
          )}
          {showQuoteBalance && (
            <div className="flex text-body1 text-osmoverse-300">
              {formatPretty(quoteFiatBalance)} available
            </div>
          )}
        </div>
        <div className="pt-16">
          <TokenSelectDrawerLimit
            isOpen={isSelectOpen}
            onClose={() => setIsSelectOpen(false)}
            onSelect={onSelect}
            showSearchBox={true}
            showRecommendedTokens={false}
            selectableAssets={preSortedTokens}
          />
        </div>
      </div>
    );
  }
);